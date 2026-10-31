// api/src/routes/payments.js
import { Router } from 'express';
import logger from '../utils/logger.js';
import pocketbaseClient from '../utils/pocketbaseClient.js';

const router = Router();

// -------------------------------------------------
// Cash payment – simple "pay on delivery"
// -------------------------------------------------
router.post('/cash', async (req, res) => {
  const { orderId } = req.body ?? {};
  if (!orderId) {
    return res.status(400).json({ error: 'orderId required' });
  }

  try {
    const order = await pocketbaseClient
      .collection('store_orders')
      .update(orderId, { paymentMethod: 'cash' });
    res.json({ success: true, order });
  } catch (err) {
    logger.error('Cash payment update failed:', err);
    res.status(500).json({ error: 'Failed to set cash payment' });
  }
});

export default router;

