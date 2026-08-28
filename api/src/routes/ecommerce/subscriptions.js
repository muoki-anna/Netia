import { Router } from 'express';
import { createManageUserSubscriptionUrl, getUserSubscriptions } from '../../api/ecommerce-subscriptions.js';

const router = Router();

/**
 * Shape of `req.user` after your JWT middleware verifies the token and attaches the decoded payload
 * (e.g. `passport-jwt`, `express-jwt`, or `jwt.verify` then `req.user = payload`).
 *
 * @typedef {object} JwtUserPayload
 * @property {string} [sub] Standard JWT **subject** — commonly your application user id.
 * @property {string} [id] Some stacks put the user id here instead of (or in addition to) `sub`.
 */

/**
 * Returns the authenticated user id from the JWT payload on `req.user`.
 * Assumes an auth middleware has already run and rejected unauthenticated requests.
 *
 * @param {import('express').Request & { user?: JwtUserPayload }} req
 * @returns {string | null} `null` if no usable id claim is present.
 */
function getUserIdFromRequest(req) {
	const user = req.user;

	if (!user || typeof user !== 'object') {
		return null;
	}

	const fromSub = typeof user.sub === 'string' ? user.sub.trim() : '';
	
	if (fromSub) {
		return fromSub;
	}

	const fromId = typeof user.id === 'string' ? user.id.trim() : '';

	return fromId || null;
}

/**
 * Lists subscriptions for the resolved user (see {@link getUserIdFromRequest}).
 */
router.get('/', async (req, res) => {
	const userId = getUserIdFromRequest(req);

	if (!userId) {
		throw new Error('User ID is required');
	}

	const subscriptions = await getUserSubscriptions({ userId });

	return res.json({ subscriptions });
});

/**
 * Create and return the manage subscriptions URL for the resolved user (see {@link getUserIdFromRequest}).
 */
router.post('/manage', async (req, res) => {
	const { returnUrl, subscriptionId } = req.body;
	const userId = getUserIdFromRequest(req);

	if (!userId) {
		throw new Error('User ID is required');
	}

	if (typeof returnUrl !== 'string' || returnUrl.trim() === '' || typeof subscriptionId !== 'string' || subscriptionId.trim() === '') {
		throw new Error('Return URL and Subscription ID are required');
	}

	try {
		const url = await createManageUserSubscriptionUrl({ userId, returnUrl: returnUrl.trim(), subscriptionId });
		return res.json({ url });
	} catch (error) {
		if (error.message?.includes('No Stripe payment provider configured')) {
			return res.json({
				code: 'STRIPE_NOT_CONFIGURED',
				message: "Test subscriptions can't be managed. Purchase with a real payment method to enable full access",
			});
		}
		throw error;
	}
});

export default router;
