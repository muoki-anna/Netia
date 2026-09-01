import { Router } from 'express';
import { pocketbaseClient } from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = Router();

// POST /orders — create a pending order from a checkout payload.
// The server holds the PocketBase superuser credentials, so the browser
// never needs write access to `store_orders`.
router.post('/', async (req, res) => {
	const { items_snapshot, total_in_cents, currency, customer_email, customer_name, user } = req.body ?? {};

	if (!Array.isArray(items_snapshot) || items_snapshot.length === 0) {
		return res.status(422).json({ error: 'items_snapshot is required' });
	}
	if (!Number.isFinite(Number(total_in_cents)) || Number(total_in_cents) <= 0) {
		return res.status(422).json({ error: 'total_in_cents must be a positive number' });
	}

	try {
		const order = await pocketbaseClient.collection('store_orders').create({
			items_snapshot,
			total_in_cents: Number(total_in_cents),
			currency: currency || 'KES',
			status: 'pending',
			customer_email: customer_email || '',
			customer_name: customer_name || '',
			user: user || null,
		});

		res.status(201).json(order);
	} catch (err) {
		logger.error('Failed to create store order:', err?.message ?? err);
		res.status(500).json({ error: 'Failed to create order' });
	}
});

// GET /orders/:id — order status (used by the confirmation page).
router.get('/:id', async (req, res) => {
	try {
		const order = await pocketbaseClient.collection('store_orders').getOne(req.params.id);
		res.json(order);
	} catch {
		res.status(404).json({ error: 'Order not found' });
	}
});

export default router;
