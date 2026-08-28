import { getUserSubscriptions } from '../api/ecommerce-subscriptions.js';

/**
 * Throws if the user lacks an active or trialing subscription for `productId`
 * (`Forbidden: <productId> subscription required` — map to 403 in error middleware).
 *
 * Usage (gate a route after resolving userId from auth):
 *   import { requireTier } from '../utils/ecommerce-subscriptions.js';
 *   const userId = getUserIdFromRequest(req);
 *   await requireTier(userId, 'prod_premium_id');
 *   return res.json({ premium: true });
 *
 * @param {string} userId
 * @param {string} productId - Store product id (`EcommerceSubscription.product_id`), not plan title.
 * @returns {Promise<void>}
 */
export async function requireTier(userId, productId) {
	if (!userId) {
		throw new Error('User ID is required');
	}

	const allowed = await hasTier(userId, productId);

	if (!allowed) {
		throw new Error(`Forbidden: ${productId} subscription required`);
	}
}

/**
 * Returns whether the user has an active or trialing subscription for `productId`.
 *
 * Usage (branch without throwing):
 *   import { hasTier } from '../utils/ecommerce-subscriptions.js';
 *   if (await hasTier(userId, 'prod_premium_id')) {
 *     return res.json({ unlocked: true });
 *   }
 *   return res.status(403).json({ error: 'Subscription required' });
 *
 * @param {string} userId
 * @param {string} productId - Store product id (`EcommerceSubscription.product_id`).
 * @returns {Promise<boolean>}
 */
export async function hasTier(userId, productId) {
	if (!userId) {
		return false;
	}

	const subscriptions = await getUserSubscriptions({ userId });

	return subscriptions.some(
		(s) => s.product_id === productId && ['active', 'trialing'].includes(s.status),
	);
}

/**
 * Title-based counterpart to {@link requireTier}. Throws if the user lacks an
 * active or trialing subscription for the product whose `product_title` matches
 * `title` exactly (`Forbidden: <title> subscription required`).
 *
 * USE THIS when gating an Express route at code-generation time — the real
 * `product_id` (e.g. `prod_01KSJ...`) is created at runtime and NOT visible to
 * the coding agent, so `requireTier(userId, 'prod_creator')` always 403s
 * because no such product_id exists. Compare by `product_title` instead — the
 * title is the same one the agent passed to `create_subscription_product` and
 * the same string the frontend's `useUserTier().hasTier(title)` matches against.
 *
 * Tier titles MUST match EXACTLY — `'Creator'` is `'Creator'`, NOT
 * `'Creator Plan'` or `'Creator Tier'`. Embellishing breaks the check silently.
 *
 * Usage (gate a route by tier title):
 *   import { requireTierByTitle } from '../utils/ecommerce-subscriptions.js';
 *   const userId = req.user?.id;
 *   await requireTierByTitle(userId, 'Creator');
 *   return res.json({ analytics: ... });
 *
 * @param {string} userId
 * @param {string} title - Subscription product title (matches `product_title`).
 * @returns {Promise<void>}
 */
export async function requireTierByTitle(userId, title) {
	if (!userId) {
		throw new Error('User ID is required');
	}

	const allowed = await hasTierByTitle(userId, title);

	if (!allowed) {
		throw new Error(`Forbidden: ${title} subscription required`);
	}
}

/**
 * Returns whether the user has an active or trialing subscription whose
 * `product_title` exactly matches `title`.
 *
 * Same title-matching contract as {@link requireTierByTitle}.
 *
 * @param {string} userId
 * @param {string} title - Subscription product title.
 * @returns {Promise<boolean>}
 */
export async function hasTierByTitle(userId, title) {
	if (!userId) {
		return false;
	}

	const subscriptions = await getUserSubscriptions({ userId });

	return subscriptions.some(
		(s) => s.product_title === title && ['active', 'trialing'].includes(s.status),
	);
}
