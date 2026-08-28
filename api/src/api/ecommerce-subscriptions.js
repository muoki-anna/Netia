import process from 'node:process';

/**
 * @typedef {'daily' | 'weekly' | 'monthly' | 'yearly'} EcommerceBillingInterval
 */

/**
 * @typedef {'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete' | 'incomplete_expired' | 'paused'} EcommerceSubscriptionStatus
 */

/**
 * Subscription data from the e-commerce API.
 *
 * @typedef {object} EcommerceSubscription
 * @property {string} id - Subscription ID.
 * @property {string} product_id - Subscription plan product ID (value that should be used to validate if the user has the correct tier subscription).
 * @property {string} product_title - Subscription plan title.
 * @property {string} variant_title - Subscription variant (plan period) title.
 * @property {EcommerceBillingInterval} billing_interval - Subscription billing interval.
 * @property {EcommerceSubscriptionStatus} status - Subscription status.
 * @property {string} current_period_start - Subscription current period start date.
 * @property {string} current_period_end - Subscription current period end date.
 * @property {string} created_at - Subscription creation date.
 * @property {string} updated_at - Subscription last update date.
 */

/**
 * User data from the e-commerce API.
 *
 * @typedef {object} EcommerceUser
 * @property {string} id - User ID.
 * @property {string} email - User email.
 * @property {string} created_at - User creation date.
 * @property {string} updated_at - User last update date.
 * @property {EcommerceSubscription[]} subscriptions - User subscriptions.
 */

/**
 * @typedef {object} ManageUserSubscriptionsResponse
 * @property {string} url - The manage subscriptions URL.
 */

/**
 * @param {unknown} value
 * @param {string} fieldLabel Human-readable name for error messages (e.g. `User ID`, `Return URL`).
 * @returns {string}
 */
function requireNonEmptyTrimmedString(value, fieldLabel) {
	if (typeof value !== 'string' || value.trim() === '') {
		throw new Error(`${fieldLabel} is required`);
	}

	return value.trim();
}

/**
 * @param {Response} response
 */
async function throwIfEcommerceResponseNotOk(response) {
	if (response.ok) {
		return;
	}

	const errorBody = await response.text().catch(() => 'Unknown error');

	throw new Error(`E-commerce API request failed with status ${response.status}: ${errorBody}`);
}

/**
 * @param {Response} response
 * @returns {Promise<unknown>}
 */
async function readEcommerceJsonBody(response) {
	return response.json().catch(() => {
		throw new Error(`Failed to parse response body as JSON: ${response.statusText}`);
	});
}

/**
 * Returns the user from the e-commerce API, or `null` if the user has not yet
 * been registered as a customer (i.e. has never started a checkout).
 *
 * @param {{ userId: string }} params
 * @param {string} params.userId User ID from PocketBase `users` table.
 * @returns {Promise<EcommerceUser | null>}
 */
async function getEcommerceUser({ userId }) {
	const normalizedUserId = requireNonEmptyTrimmedString(userId, 'User ID');

	const urlSearchParams = new URLSearchParams();

	urlSearchParams.set('external_id', normalizedUserId);

	const url = `${process.env.ECOMMERCE_API_URL}/store/${process.env.ECOMMERCE_STORE_ID}/customers?${urlSearchParams.toString()}`;

	const response = await fetch(url, {
		method: 'GET',
		headers: {
			'Accept': 'application/json',
			'Authorization': `Bearer ${process.env.ECOMMERCE_API_KEY}`,
			...(process.env.PROXY_ENTRANCE_ID && { 'X-Proxy-Entrance-Id': process.env.PROXY_ENTRANCE_ID }),
		},
	});

	if (response.status === 404) {
		return null;
	}

	await throwIfEcommerceResponseNotOk(response);

	/** @type {EcommerceUser} */
	const data = await readEcommerceJsonBody(response);

	return data;
}

/**
 * Returns the subscriptions for a given user from the e-commerce API.
 *
 * @param {{ userId: string }} params
 * @param {string} params.userId User ID from PocketBase `users` table.
 * @returns {Promise<EcommerceSubscription[]>}
 */
export async function getUserSubscriptions({ userId }) {
	const ecommerceUser = await getEcommerceUser({ userId });

	return ecommerceUser?.subscriptions ?? [];
}

/**
 * Create and return the manage subscription URL for a given user's subscription.
 *
 * @param {{ userId: string, returnUrl: string, subscriptionId: string }} params
 * @param {string} params.userId User ID from PocketBase `users` table.
 * @param {string} params.returnUrl The URL to redirect the user to after the subscription management is complete.
 * @param {string} params.subscriptionId The ID of the subscription to manage.
 * @returns {Promise<string>} The manage subscriptions URL.
 */
export async function createManageUserSubscriptionUrl({ userId, returnUrl, subscriptionId }) {
	const normalizedUserId = requireNonEmptyTrimmedString(userId, 'User ID');
	const normalizedReturnUrl = requireNonEmptyTrimmedString(returnUrl, 'Return URL');
	const normalizedSubscriptionId = requireNonEmptyTrimmedString(subscriptionId, 'Subscription ID');

	const url = `${process.env.ECOMMERCE_API_URL}/store/${process.env.ECOMMERCE_STORE_ID}/billing/portal-session`;

	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${process.env.ECOMMERCE_API_KEY}`,
			...(process.env.PROXY_ENTRANCE_ID && { 'X-Proxy-Entrance-Id': process.env.PROXY_ENTRANCE_ID }),
		},
		body: JSON.stringify({
			external_user_id: normalizedUserId,
			return_url: normalizedReturnUrl,
			subscription_id: normalizedSubscriptionId,
		}),
	});

	await throwIfEcommerceResponseNotOk(response);

	/** @type {ManageUserSubscriptionsResponse} */
	const data = await readEcommerceJsonBody(response);

	return data.url;
}
