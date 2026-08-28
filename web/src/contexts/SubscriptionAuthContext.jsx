import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import pb from '@/lib/pocketbaseClient';
import { getUserSubscriptions } from '@/api/InternalEcommerceSubscriptionsApi';

/**
 * Shipped subscription state container. Mirrors the current user's auth state
 * (via PocketBase by default) AND the user's subscription list (via the shipped
 * `getUserSubscriptions` API), so the shipped subscription components do not
 * depend on the agent-created `AuthContext.jsx`. The race condition where
 * shipped files import a useAuth that doesn't exist yet during early-stage
 * lint passes is eliminated.
 *
 * Default implementation: PocketBase. Subscribes to `pb.authStore.onChange` for
 * auth-state transitions and fetches subscriptions via the shipped wrapper.
 *
 * NON-POCKETBASE AUTH: agents using Supabase, custom OAuth, OTP, etc. may EDIT
 * this file to swap the auth-source — replace `pb.authStore.onChange` with the
 * equivalent listener (e.g. `supabase.auth.onAuthStateChange`) and `pb.authStore.model`
 * with the equivalent user record. PRESERVE the exposed contract:
 *
 *   useSubscriptionAuth() returns:
 *     - currentUser: object | null         (the auth user, ANY shape)
 *     - isAuthenticated: boolean           (Boolean(currentUser))
 *     - subscriptions: array               (unwrapped from getUserSubscriptions; default [])
 *     - refreshSubscriptions: () => Promise<Array>   (manual refresh trigger; resolves to the new subscriptions array)
 *     - polling: boolean                   (true while post-checkout polling is in progress)
 *     - pollingExhausted: boolean          (true if polling gave up after the configured window)
 *
 * The post-checkout polling (driven by the `subscriptionPending` sessionStorage
 * flag set by SubscribeButton) lives INSIDE this provider — every consumer that
 * reads `subscriptions` from this context auto-updates when the new sub lands.
 *
 * Usage in App.jsx (wrap INSIDE the agent's <AuthProvider> if both contexts
 * are used, so this provider can optionally pick up agent-built auth state):
 *
 *   import { SubscriptionAuthProvider } from '@/contexts/SubscriptionAuthContext.jsx';
 *   <AuthProvider>
 *     <SubscriptionAuthProvider>
 *       <Routes>...</Routes>
 *     </SubscriptionAuthProvider>
 *   </AuthProvider>
 */
const SubscriptionAuthContext = createContext(null);

export function SubscriptionAuthProvider({ children }) {
	const [currentUser, setCurrentUser] = useState(() =>
		pb.authStore.isValid ? pb.authStore.model : null,
	);
	const [subscriptions, setSubscriptions] = useState([]);

	// Ref keeps the latest fetch function callable without re-triggering the
	// auth-listener useEffect on every render.
	const fetchSubscriptionsRef = useRef(null);
	fetchSubscriptionsRef.current = async () => {
		if (!pb.authStore.isValid) {
			setSubscriptions([]);
			return [];
		}
		try {
			const res = await getUserSubscriptions();
			const list = res?.subscriptions ?? [];
			setSubscriptions(list);
			return list;
		} catch (err) {
			console.error('Failed to fetch subscriptions:', err);
			setSubscriptions([]);
			return [];
		}
	};

	useEffect(() => {
		if (pb.authStore.isValid) {
			fetchSubscriptionsRef.current();
		}
		const unsubscribe = pb.authStore.onChange(() => {
			setCurrentUser(pb.authStore.isValid ? pb.authStore.model : null);
			if (pb.authStore.isValid) {
				fetchSubscriptionsRef.current();
			} else {
				setSubscriptions([]);
			}
		});
		return () => unsubscribe();
	}, []);

	// Post-checkout polling. SubscribeButton writes the `subscriptionPending`
	// flag to sessionStorage just before redirecting to Ecommerce API checkout. On
	// return (regardless of where Ecommerce API lands the user), this provider polls
	// every 2s for up to ~30s until an active/trialing subscription appears,
	// then clears the flag. Any consumer reading `subscriptions` auto-updates.
	const hasActiveSubscription = subscriptions.some(
		(s) => s && (s.status === 'active' || s.status === 'trialing'),
	);
	const [postCheckoutPending, setPostCheckoutPending] = useState(
		() =>
			typeof window !== 'undefined' &&
			sessionStorage.getItem('subscriptionPending') !== null,
	);
	const [pollingExhausted, setPollingExhausted] = useState(false);

	useEffect(() => {
		if (!postCheckoutPending) return undefined;
		if (hasActiveSubscription) {
			sessionStorage.removeItem('subscriptionPending');
			setPostCheckoutPending(false);
			return undefined;
		}
		let attempts = 0;
		const maxAttempts = 15;
		fetchSubscriptionsRef.current();
		const handle = setInterval(() => {
			attempts += 1;
			if (attempts >= maxAttempts) {
				clearInterval(handle);
				sessionStorage.removeItem('subscriptionPending');
				setPostCheckoutPending(false);
				setPollingExhausted(true);
				return;
			}
			fetchSubscriptionsRef.current();
		}, 2000);
		return () => clearInterval(handle);
	}, [postCheckoutPending, hasActiveSubscription]);

	const polling = postCheckoutPending && !hasActiveSubscription;
	const refreshSubscriptions = () => fetchSubscriptionsRef.current();
	const isAuthenticated = Boolean(currentUser);

	const value = {
		currentUser,
		isAuthenticated,
		subscriptions,
		refreshSubscriptions,
		polling,
		pollingExhausted,
	};

	return (
		<SubscriptionAuthContext.Provider value={value}>
			{children}
		</SubscriptionAuthContext.Provider>
	);
}

export function useSubscriptionAuth() {
	const context = useContext(SubscriptionAuthContext);
	if (!context) {
		throw new Error(
			'useSubscriptionAuth must be used within <SubscriptionAuthProvider>',
		);
	}
	return context;
}
