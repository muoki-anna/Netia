import { useEffect, useState } from 'react';
import { getProducts } from '@/api/EcommerceApi';

/** @import { ProductListResponse } from '@/api/EcommerceApi' */

/**
 * Fetches subscription products via {@link getProducts} (`type: 'subscription'`).
 * Each item in `plans` is a {@link ProductListResponse}. Use a variant `id` as `variant_id` in {@link initializeCheckout}.
 *
 * Usage (Plans / pricing page — do not hardcode tiers):
 *   import { useEcommerceSubscriptionsPlans } from '@/hooks/useEcommerceSubscriptionsPlans';
 *   import SubscribeButton from '@/components/SubscribeButton.jsx';
 *
 *   const { plans, loading, error } = useEcommerceSubscriptionsPlans();
 *   if (loading) return <PlansSkeleton />;
 *   if (error) return <p>Failed to load subscription plans.</p>;
 *   if (!plans.length) return <p>No subscription plans available yet.</p>;
 *
 *   plans.map((plan) => {
 *     const variant = plan.variants?.[0];
 *     return variant ? <SubscribeButton key={plan.id} plan={plan} variant={variant} /> : null;
 *   });
 *
 * @returns {{
 *   plans: ProductListResponse[],
 *   loading: boolean,
 *   error: Error | null,
 * }}
 */
export function useEcommerceSubscriptionsPlans() {
	const [plans, setPlans] = useState(/** @type {ProductListResponse[]} */ ([]));
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		let cancelled = false;
		getProducts({ type: 'subscription' })
			.then((res) => {
				if (cancelled) return;
				setPlans(res?.products ?? []);
			})
			.catch((err) => {
				if (cancelled) return;
				setError(err);
			})
			.finally(() => {
				if (cancelled) return;
				setLoading(false);
			});
		return () => {
			cancelled = true;
		};
	}, []);

	return { plans, loading, error };
}
