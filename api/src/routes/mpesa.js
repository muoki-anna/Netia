import { Router } from 'express';
import logger from '../utils/logger.js';
import pocketbaseClient from '../utils/pocketbaseClient.js';
import { initiateStkPush, normalizeKenyanPhone, queryStkStatus } from '../utils/mpesa.js';

const router = Router();

// POST /mpesa/stkpush — start an M-Pesa till STK push for a cart/subscription checkout.
router.post('/stkpush', async (req, res) => {
	const { phone, amount, orderType, items, email, name, userId, storeOrderId } = req.body ?? {};

	if (!phone || !amount || !orderType) {
		return res.status(422).json({ error: 'phone, amount and orderType are required' });
	}

	if (!['product', 'subscription'].includes(orderType)) {
		return res.status(422).json({ error: 'orderType must be "product" or "subscription"' });
	}

	const normalizedPhone = normalizeKenyanPhone(phone);
	if (!normalizedPhone) {
		return res.status(422).json({ error: 'Enter a valid Safaricom phone number, e.g. 0712345678' });
	}

	const missingConfig = ['MPESA_CONSUMER_KEY', 'MPESA_CONSUMER_SECRET', 'MPESA_TILL_NUMBER', 'MPESA_PASSKEY', 'MPESA_CALLBACK_URL']
		.filter((key) => !process.env[key]);
	if (missingConfig.length > 0) {
		logger.error(`M-Pesa STK push cannot start — missing env vars: ${missingConfig.join(', ')}`);
		return res.status(503).json({
			error: 'M-Pesa payments are not configured yet. Add your Safaricom Daraja Till credentials (Consumer Key/Secret, Till Number, Passkey, Callback URL) in apps/api/.env, then try again.',
		});
	}

	const accountReference = orderType === 'subscription' ? 'NetiaXSub' : 'NetiaXOrder';
	const transactionDesc = orderType === 'subscription' ? 'NetiaX Subscription' : 'NetiaX Order';

	const stkResponse = await initiateStkPush({
		phone: normalizedPhone,
		amount,
		accountReference,
		transactionDesc,
	});

	const order = await pocketbaseClient.collection('mpesa_orders').create({
		store_order: storeOrderId || null,
		checkout_request_id: stkResponse.CheckoutRequestID,
		merchant_request_id: stkResponse.MerchantRequestID,
		phone: normalizedPhone,
		amount,
		currency: 'KES',
		status: 'pending',
		order_type: orderType,
		items_snapshot: Array.isArray(items) ? items : [],
		customer_email: email || '',
		customer_name: name || '',
		user: userId || null,
	});

	logger.info(`M-Pesa STK push initiated: ${order.checkout_request_id}`);

	res.json({
		checkoutRequestId: stkResponse.CheckoutRequestID,
		merchantRequestId: stkResponse.MerchantRequestID,
		customerMessage: stkResponse.CustomerMessage,
	});
});

// GET /mpesa/status/:checkoutRequestId — the frontend polls this after triggering the STK push prompt.
// If the order is still pending, actively query Daraja as a fallback — this
// keeps the flow working even when the public callback URL can't reach us
// (e.g. local development behind NAT).
router.get('/status/:checkoutRequestId', async (req, res) => {
	const { checkoutRequestId } = req.params;

	const results = await pocketbaseClient.collection('mpesa_orders').getFullList({
		filter: pocketbaseClient.filter('checkout_request_id = {:id}', { id: checkoutRequestId }),
	});

	const order = results[0];
	if (!order) {
		return res.status(404).json({ error: 'Order not found' });
	}

	let status = order.status;
	let mpesaReceipt = order.mpesa_receipt || null;
	let resultDesc = order.result_desc || null;

	if (status === 'pending') {
		try {
			const query = await queryStkStatus(checkoutRequestId);
			const resultCode = String(query.ResultCode ?? query.resultCode ?? '');

			if (resultCode === '0') {
				status = 'paid';
				mpesaReceipt = query.MpesaReceiptNumber || mpesaReceipt;
				resultDesc = query.ResultDesc || resultDesc;
			} else if (resultCode === '1032') {
				status = 'cancelled';
				resultDesc = query.ResultDesc || resultDesc;
			} else if (resultCode === '1037' || resultCode === '1') {
				status = 'failed';
				resultDesc = query.ResultDesc || resultDesc;
			}
			// Daraja returns 500.001.1001 when the request is still in flight —
			// leave the status as pending in that case.

			if (status !== 'pending') {
				await pocketbaseClient.collection('mpesa_orders').update(order.id, {
					status,
					...(mpesaReceipt ? { mpesa_receipt: mpesaReceipt } : {}),
					result_desc: resultDesc,
				});
				if (order.store_order) {
					try {
						await pocketbaseClient.collection('store_orders').update(order.store_order, {
							status,
							...(mpesaReceipt ? { mpesa_receipt: mpesaReceipt } : {}),
						});
					} catch (err) {
						logger.error(`Failed to sync store_order ${order.store_order}:`, err?.message ?? err);
					}
				}
			}
		} catch (err) {
			// Query failures (bad credentials, Daraja downtime) must not break
			// polling — the callback may still land and update the order later.
			logger.warn(`mpesa status query fallback failed: ${err?.message ?? err}`);
		}
	}

	res.json({
		status,
		amount: order.amount,
		mpesaReceipt,
		resultDesc,
	});
});

// POST /mpesa/callback — Safaricom Daraja posts the STK push result here.
router.post('/callback', async (req, res) => {
	const stkCallback = req.body?.Body?.stkCallback;

	if (!stkCallback) {
		logger.warn('mpesa callback received with unexpected shape', req.body);
		return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
	}

	const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = stkCallback;

	const results = await pocketbaseClient.collection('mpesa_orders').getFullList({
		filter: pocketbaseClient.filter('checkout_request_id = {:id}', { id: CheckoutRequestID }),
	});
	const order = results[0];

	if (!order) {
		logger.warn(`mpesa callback for unknown order: ${CheckoutRequestID}`);
		return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
	}

	// Propagate the payment outcome to the linked store order (if any).
	const syncStoreOrder = async (status, receipt) => {
		if (!order.store_order) return;
		try {
			await pocketbaseClient.collection('store_orders').update(order.store_order, {
				status,
				...(receipt ? { mpesa_receipt: receipt, checkout_request_id: CheckoutRequestID } : {}),
			});
		} catch (err) {
			logger.error(`Failed to sync store_order ${order.store_order}:`, err?.message ?? err);
		}
	};

	if (Number(ResultCode) === 0) {
		const items = CallbackMetadata?.Item || [];
		const findValue = (name) => items.find((i) => i.Name === name)?.Value;
		const receipt = findValue('MpesaReceiptNumber') || '';

		await pocketbaseClient.collection('mpesa_orders').update(order.id, {
			status: 'paid',
			mpesa_receipt: receipt,
			result_desc: ResultDesc,
		});
		await syncStoreOrder('paid', receipt);
	} else {
		await pocketbaseClient.collection('mpesa_orders').update(order.id, {
			status: Number(ResultCode) === 1032 ? 'cancelled' : 'failed',
			result_desc: ResultDesc,
		});
		await syncStoreOrder(Number(ResultCode) === 1032 ? 'cancelled' : 'failed', null);
	}

	// Safaricom expects a 200 with this exact shape regardless of outcome.
	res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
});

export default router;
