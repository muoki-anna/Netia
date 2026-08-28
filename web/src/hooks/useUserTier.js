import { useSubscriptionAuth } from '@/contexts/SubscriptionAuthContext.jsx';

/**
 * Shipped tier-check primitive for action/page gates AND content-field gates.
 *
 * Returns the set of tier names the current user has access to — every active
 * or trialing subscription's `product_title`, plus the literal `'Free'`
 * (so anonymous and Free users transparently match `'Free'` in any tier list).
 *
 * Use this anywhere you need to gate behavior on subscription tier:
 *   - Page / action gates (Creator-only routes, paid-only buttons)
 *   - Content-field gates (record carries a `tier_required` or `<column>_tier_required` array)
 *
 * Do NOT bake tier-derived state into `AuthContext.jsx`. AuthContext owns auth
 * only (currentUser, isAuthenticated). If AuthContext imports
 * `useSubscriptionAuth`, it inverts the provider order and breaks the
 * peer-context architecture.
 *
 * Tier names MUST match the EXACT title used when the subscription product
 * was created (e.g. `'Creator'`, not `'Creator Plan'` or `'Creator Tier'`).
 * Embellishing the title breaks the comparison silently — every `hasTier` /
 * `hasAnyTier` call returns false.
 *
 * Usage in a route guard:
 *   import { useUserTier } from '@/hooks/useUserTier';
 *   const { hasTier } = useUserTier();
 *   if (!hasTier('Creator')) return <Navigate to={PLANS_PATH} replace />;
 *
 * Usage in a content gate (record carries an array of allowed tier names):
 *   const { hasAnyTier } = useUserTier();
 *   const canReadBody = hasAnyTier(article.body_tier_required);   // per-column (mixed gates)
 *   const canRead     = hasAnyTier(article.tier_required);        // record-level (uniform gate)
 *
 * @returns {{
 *   userTierNames: string[],
 *   hasTier: (title: string) => boolean,
 *   hasAnyTier: (titles: string[] | null | undefined) => boolean,
 * }}
 */
export function useUserTier() {
	const { subscriptions } = useSubscriptionAuth();
	const userTierNames = subscriptions
		.filter((s) => s && (s.status === 'active' || s.status === 'trialing'))
		.map((s) => s.product_title)
		.concat(['Free']);

	return {
		userTierNames,
		hasTier: (title) => userTierNames.includes(title),
		hasAnyTier: (titles) =>
			Array.isArray(titles) && titles.some((title) => userTierNames.includes(title)),
	};
}
