import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createOrder } from '@/api/StoreApi';
import MpesaPaymentDialog from '@/components/MpesaPaymentDialog';
import { useSubscriptionAuth } from '@/contexts/SubscriptionAuthContext.jsx';
import { LOGIN_PATH, MANAGE_PATH } from '@/config/subscriptionRoutes.js';

/**
 * Shipped checkout CTA: {@link initializeCheckout} with `variant_id`, `customer`, and `window.location` redirect.
 *
 * Usage (inside a plan card from {@link useEcommerceSubscriptionsPlans}):
 *   import SubscribeButton from '@/components/SubscribeButton.jsx';
 *   <SubscribeButton plan={plan} variant={plan.variants[0]} />
 *
 * Agents may restyle; keep `initializeCheckout` payload (`items[].variant_id`, `customer.external_id`, `customer.email`).
 *
 * @param {{ plan: import('@/api/EcommerceApi').ProductListResponse, variant: object, className?: string, label?: string }} props
 */
export default function SubscribeButton({ plan, variant, className, label }) {
	const [loading, setLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState(null);
	const [paymentOpen, setPaymentOpen] = useState(false);
	const [pendingOrder, setPendingOrder] = useState(null);
	const { currentUser, isAuthenticated, refreshSubscriptions } = useSubscriptionAuth();
	const navigate = useNavigate();

	const handleClick = async () => {
		if (!isAuthenticated) {
			navigate(LOGIN_PATH);
			return;
		}
		setErrorMessage(null);
		setLoading(true);
		try {
			// Subscription plans are billed through our own M-Pesa flow now:
			// create a pending order for the plan, then collect payment on-site.
			const order = await createOrder({
				items: [{ variant_id: variant.id, quantity: 1 }],
				customer: { external_id: currentUser.id, email: currentUser.email, name: currentUser.name },
			});
			setPendingOrder(order);
			setPaymentOpen(true);
		} catch (err) {
			console.error('Checkout failed', err);
			setErrorMessage("Couldn't start checkout. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const handlePaymentSuccess = () => {
		setPaymentOpen(false);
		setPendingOrder(null);
		navigate(MANAGE_PATH + '?just_subscribed=1');
	};

	return (
		<div>
			<button
				type="button"
				onClick={handleClick}
				disabled={loading}
				className={className ?? 'w-full rounded-md bg-primary text-primary-foreground px-4 py-2 font-medium hover:bg-primary/90 disabled:opacity-60'}
			>
				{loading ? 'Starting…' : (label ?? `Subscribe to ${plan?.title ?? 'plan'}`)}
			</button>
			{errorMessage && (
				<p className="text-sm text-destructive mt-2" role="alert">{errorMessage}</p>
			)}
			<MpesaPaymentDialog
				open={paymentOpen}
				onOpenChange={setPaymentOpen}
				amount={Math.round(((variant?.sale_price_in_cents ?? variant?.price_in_cents) || 0) / 100)}
				orderType="subscription"
				items={[{ title: plan?.title, variant: variant?.title, quantity: 1 }]}
				email={currentUser?.email || ''}
				name={currentUser?.name || ''}
				userId={currentUser?.id || null}
				storeOrderId={pendingOrder?.id || null}
				onSuccess={handlePaymentSuccess}
			/>
		</div>
	);
}
