/**
 * Returns true if the user has an active or trialing subscription for the given product.
 * Returns false if the user doesn't have a subscription or has a non-active/trialing status.
 * 
 * @param {Array<{ product_id: string, status: string }>} subscriptions
 * @param {string} productId
 * @returns {boolean}
 */
export function hasTier(subscriptions, productId) {
	if (!Array.isArray(subscriptions) || !productId) {
		return false;
	}

	return subscriptions.some(
		(s) => s?.product_id === productId && ['active', 'trialing'].includes(s.status),
	);
}

/**
 * Returns the active or trialing subscription for the user, or null if none.
 *
 * @param {Array<{ product_id: string, status: string }>} subscriptions
 * @returns {{ product_id: string, status: string } | null}
 */
export function activeSubscription(subscriptions) {
	if (!Array.isArray(subscriptions)) {
		return null;
	}

	return subscriptions.find((s) => ['active', 'trialing'].includes(s.status)) ?? null;
}
