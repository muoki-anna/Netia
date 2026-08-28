import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscriptionAuth } from '@/contexts/SubscriptionAuthContext.jsx';
import { getManageSubscriptionUrl } from '@/api/InternalEcommerceSubscriptionsApi';
import { activeSubscription } from '@/lib/ecommerceSubscriptionsUtils';
import { PLANS_PATH } from '@/config/subscriptionRoutes.js';

/**
 * Shipped account control: manage portal when subscribed, otherwise link to plans.
 * Requires `subscriptions` on AuthContext (from {@link getUserSubscriptions}).
 *
 * Usage (account / billing area):
 *   import ManageSubscriptionButton from '@/components/ManageSubscriptionButton.jsx';
 *   <ManageSubscriptionButton /> // optional className, plansPath (default `/plans`)
 *
 * Agents may restyle; keep {@link getManageSubscriptionUrl} args and `window.location = url` redirect.
 *
 * @param {{ className?: string, plansPath?: string }} props
 */
export default function ManageSubscriptionButton({ className, plansPath = PLANS_PATH }) {
	const [loading, setLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState(null);
	const { subscriptions, isAuthenticated } = useSubscriptionAuth();
	const navigate = useNavigate();

	if (!isAuthenticated) return null;

	const active = activeSubscription(subscriptions);

	if (!active) {
		return (
			<button
				type="button"
				onClick={() => navigate(plansPath)}
				className={className ?? 'rounded-md border px-4 py-2 font-medium hover:bg-muted'}
			>
				View plans
			</button>
		);
	}

	const handleClick = async () => {
		setErrorMessage(null);
		setLoading(true);
		try {
			const { url } = await getManageSubscriptionUrl({
				subscriptionId: active.id,
				returnUrl: window.location.href,
			});
			window.location = url;
		} catch (error) {
			if (!error.code) {
				console.error('Failed to open manage portal', error);
			}
			setErrorMessage(error.message);
			setLoading(false);
		}
	};

	return (
		<div>
			<button
				type="button"
				onClick={handleClick}
				disabled={loading}
				className={className ?? 'rounded-md border px-4 py-2 font-medium hover:bg-muted disabled:opacity-60'}
			>
				{loading ? 'Redirecting…' : 'Manage subscription'}
			</button>
			{errorMessage && (
				<p className="text-sm text-destructive mt-2" role="alert">{errorMessage}</p>
			)}
		</div>
	);
}
