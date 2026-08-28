import logger from './logger.js';

const isProd = (process.env.MPESA_ENV || 'sandbox').toLowerCase() === 'production';
const BASE_URL = isProd
	? 'https://api.safaricom.co.ke'
	: 'https://sandbox.safaricom.co.ke';

function requireEnv(name) {
	const value = process.env[name];
	if (!value) {
		throw new Error(`${name} is not set in apps/api/.env`);
	}
	return value;
}

function timestampNow() {
	const d = new Date();
	const pad = (n) => String(n).padStart(2, '0');
	return (
		d.getFullYear().toString() +
		pad(d.getMonth() + 1) +
		pad(d.getDate()) +
		pad(d.getHours()) +
		pad(d.getMinutes()) +
		pad(d.getSeconds())
	);
}

export async function getMpesaAccessToken() {
	const consumerKey = requireEnv('MPESA_CONSUMER_KEY');
	const consumerSecret = requireEnv('MPESA_CONSUMER_SECRET');
	const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

	const response = await fetch(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
		method: 'GET',
		headers: { Authorization: `Basic ${credentials}` },
	});

	if (!response.ok) {
		throw new Error(`mpesa oauth failed: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();
	if (!data.access_token) {
		throw new Error('mpesa oauth response missing access_token');
	}

	return data.access_token;
}

export function normalizeKenyanPhone(rawPhone) {
	const digits = String(rawPhone || '').replace(/\D/g, '');
	if (digits.startsWith('254') && digits.length === 12) return digits;
	if (digits.startsWith('0') && digits.length === 10) return `254${digits.slice(1)}`;
	if (digits.startsWith('7') && digits.length === 9) return `254${digits}`;
	if (digits.startsWith('1') && digits.length === 9) return `254${digits}`;
	return null;
}

export async function initiateStkPush({ phone, amount, accountReference, transactionDesc }) {
	const till = requireEnv('MPESA_TILL_NUMBER');
	const passkey = requireEnv('MPESA_PASSKEY');
	const callbackUrl = requireEnv('MPESA_CALLBACK_URL');

	const accessToken = await getMpesaAccessToken();
	const timestamp = timestampNow();
	const password = Buffer.from(`${till}${passkey}${timestamp}`).toString('base64');

	const payload = {
		BusinessShortCode: till,
		Password: password,
		Timestamp: timestamp,
		TransactionType: 'CustomerBuyGoodsOnline',
		Amount: Math.max(1, Math.round(amount)),
		PartyA: phone,
		PartyB: till,
		PhoneNumber: phone,
		CallBackURL: callbackUrl,
		AccountReference: accountReference.slice(0, 12),
		TransactionDesc: transactionDesc.slice(0, 13),
	};

	const response = await fetch(`${BASE_URL}/mpesa/stkpush/v1/processrequest`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${accessToken}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(payload),
	});

	const data = await response.json();

	if (!response.ok) {
		logger.error('mpesa stk push failed', data);
		throw new Error(`mpesa stk push failed: ${response.status} ${response.statusText}`);
	}

	if (String(data.ResponseCode) !== '0') {
		throw new Error(`mpesa stk push rejected: ${data.ResponseDescription || data.errorMessage || 'unknown error'}`);
	}

	return data;
}

export async function queryStkStatus(checkoutRequestId) {
	const till = requireEnv('MPESA_TILL_NUMBER');
	const passkey = requireEnv('MPESA_PASSKEY');

	const accessToken = await getMpesaAccessToken();
	const timestamp = timestampNow();
	const password = Buffer.from(`${till}${passkey}${timestamp}`).toString('base64');

	const response = await fetch(`${BASE_URL}/mpesa/stkpushquery/v1/query`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${accessToken}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			BusinessShortCode: till,
			Password: password,
			Timestamp: timestamp,
			CheckoutRequestID: checkoutRequestId,
		}),
	});

	const data = await response.json();

	if (!response.ok) {
		throw new Error(`mpesa stk query failed: ${response.status} ${response.statusText}`);
	}

	return data;
}
