import pb from '@/lib/pocketbaseClient';
import apiServerClient from '@/lib/apiServerClient';

const authHeader = () => ({ Authorization: `Bearer ${pb.authStore.token}` });

/**
 * GET `/ecommerce/subscriptions` — list the signed-in user's subscriptions.
 *
 * Usage (load into AuthContext, then pass `subscriptions` to tier helpers / Manage button):
 *   import { getUserSubscriptions } from '@/api/InternalEcommerceSubscriptionsApi';
 *   const { subscriptions } = await getUserSubscriptions();
 *
 * @returns {Promise<{ subscriptions: Array<{
 *   id: string,
 *   product_id: string,
 *   product_title: string,
 *   variant_title: string,
 *   billing_interval: string,
 *   status: string,
 *   current_period_start: string,
 *   current_period_end: string,
 * }> }>}
 */
export async function getUserSubscriptions() {
	const res = await apiServerClient.fetch('/ecommerce/subscriptions', {
		headers: authHeader(),
	});
	if (!res.ok) {
		throw new Error(`Failed to fetch subscriptions: ${res.status}`);
	}
	return res.json();
}

/**
 * POST `/ecommerce/subscriptions/manage` — billing portal URL for an existing subscription.
 *
 * Usage (Manage subscription button — redirect with `window.location`):
 *   import { getManageSubscriptionUrl } from '@/api/InternalEcommerceSubscriptionsApi';
 *   const active = activeSubscription(subscriptions);
 *   const { url } = await getManageSubscriptionUrl({
 *     subscriptionId: active.id,
 *     returnUrl: window.location.href,
 *   });
 *   window.location = url;
 *
 * @param {{ subscriptionId: string, returnUrl: string }} params
 * @returns {Promise<{ url: string }>}
 */
export async function getManageSubscriptionUrl({ subscriptionId, returnUrl }) {
	const response = await apiServerClient.fetch('/ecommerce/subscriptions/manage', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', ...authHeader() },
		body: JSON.stringify({ subscriptionId, returnUrl }),
	});
	if (!response.ok) {
		let body = null;
		try { body = await response.json(); } catch { /* body was not JSON */ }
		const error = new Error(body?.message ?? `Failed to fetch manage URL: ${response.status}`);
		error.status = response.status;
		error.code = body?.code;
		throw error;
	}
	const body = await response.json();
	if (body?.code) {
		const error = new Error(body.message);
		error.code = body.code;
		throw error;
	}
	return body;
}
