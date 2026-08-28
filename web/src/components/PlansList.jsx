import React, { useState } from 'react';
import { useSubscriptionAuth } from '@/contexts/SubscriptionAuthContext.jsx';
import { useEcommerceSubscriptionsPlans } from '@/hooks/useEcommerceSubscriptionsPlans';
import SubscribeButton from './SubscribeButton.jsx';
import ManageSubscriptionButton from './ManageSubscriptionButton.jsx';

/**
 * Shipped pricing grid: loads plans via {@link useEcommerceSubscriptionsPlans} and renders one
 * card per plan with a {@link SubscribeButton}. For authenticated users with an active/trialing
 * subscription, the card whose `plan.id` matches the user's subscription shows a "Current plan"
 * badge and a {@link ManageSubscriptionButton} instead of Subscribe — so subscribed visitors on
 * /plans see their tier highlighted and have a direct path to the manage portal.
 *
 * Post-checkout polling (after the user returns from Ecommerce API, typically to /plans) is handled by
 * {@link SubscriptionAuthProvider} — when the `subscriptionPending` sessionStorage flag is set
 * by SubscribeButton, the provider refreshes subscriptions every 2s until the new one lands.
 * PlansList just re-renders when `subscriptions` updates and the Subscribe → Manage swap fires.
 *
 * Usage (pricing / plans page — prefer this over hand-rolling the hook):
 *   import PlansList from '@/components/PlansList.jsx';
 *   <PlansList /> // optional className for the grid wrapper
 *
 * Agents may restyle layout and copy; keep `useEcommerceSubscriptionsPlans`,
 * the `SubscribeButton plan/variant` wiring, and the Subscribe→Manage swap on the active-tier card.
 *
 * @param {{ className?: string }} props
 */
export default function PlansList({ className }) {
	const { plans, loading, error } = useEcommerceSubscriptionsPlans();
	const { subscriptions, polling } = useSubscriptionAuth();

	if (loading) {
		return (
			<div className={className ?? 'grid gap-6 md:grid-cols-3'}>
				{[0, 1, 2].map((i) => (
					<div key={i} className="rounded-lg border bg-card p-6 h-64 animate-pulse" />
				))}
			</div>
		);
	}

	if (error) {
		return <p className="text-destructive">Failed to load subscription plans.</p>;
	}

	if (!plans.length) {
		return <p className="text-muted-foreground">No subscription plans available yet.</p>;
	}

	return (
		<>
			{polling && (
				<div className="mb-6 flex items-center gap-3 rounded-lg border bg-card p-4">
					<div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
					<p className="text-sm text-muted-foreground">Updating your subscription…</p>
				</div>
			)}
			<div className={className ?? 'grid gap-6 md:grid-cols-3'}>
				{plans.map((plan) => (
					<PlanCard
						key={plan.id}
						plan={plan}
						subscriptions={subscriptions}
					/>
				))}
			</div>
		</>
	);
}

function PlanCard({ plan, subscriptions }) {
	const variants = plan.variants ?? [];
	const [selectedVariant, setSelectedVariant] = useState(variants[0]);
	const isCurrentPlan = subscriptions.some(
		(subscription) => subscription && subscription.product_id === plan.id && (subscription.status === 'active' || subscription.status === 'trialing'),
	);
	const hasAnyActiveSub = subscriptions.some(
		(subscription) => subscription && (subscription.status === 'active' || subscription.status === 'trialing'),
	);
	const isLocked = hasAnyActiveSub && !isCurrentPlan;

	return (
		<div className={`rounded-lg border bg-card p-6 flex flex-col ${isLocked ? 'opacity-60' : ''}`}>
			<div className="flex items-start justify-between gap-2 mb-2">
				<h3 className="text-xl font-semibold">{plan.title}</h3>
				{isCurrentPlan && (
					<span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2 py-1 text-xs font-semibold uppercase tracking-wide">
						Current plan
					</span>
				)}
			</div>
			{plan.description && (
				<p className="text-muted-foreground mb-4">{plan.description}</p>
			)}
			{variants.length > 1 && (
				<div className="mb-4 inline-flex rounded-lg border bg-background p-1 gap-1 self-start">
					{variants.map((variant) => (
						<button
							key={variant.id}
							type="button"
							onClick={() => setSelectedVariant(variant)}
							className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
								selectedVariant?.id === variant.id
									? 'bg-primary text-primary-foreground'
									: 'text-muted-foreground hover:bg-muted'
							}`}
						>
							{variant.title}
						</button>
					))}
				</div>
			)}
			{selectedVariant && (
				<p className="text-3xl font-bold mb-6">
					{selectedVariant.sale_price_in_cents != null && (
						<span className="mr-2 text-xl font-normal text-muted-foreground line-through">
							{selectedVariant.price_formatted}
						</span>
					)}
					{selectedVariant.sale_price_in_cents != null
						? selectedVariant.sale_price_formatted
						: selectedVariant.price_formatted}
					<span className="text-sm font-normal text-muted-foreground"> / {selectedVariant.title}</span>
				</p>
			)}
			<div className="mt-auto">
				{selectedVariant && (
					isCurrentPlan ? (
						<ManageSubscriptionButton />
					) : isLocked ? (
						<div className="space-y-2">
							<p className="text-sm text-muted-foreground">Switch from your current plan in the customer portal.</p>
							<ManageSubscriptionButton />
						</div>
					) : (
						<SubscribeButton plan={plan} variant={selectedVariant} />
					)
				)}
			</div>
		</div>
	);
}
