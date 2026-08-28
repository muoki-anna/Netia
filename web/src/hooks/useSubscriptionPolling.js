import { useSubscriptionAuth } from '@/contexts/SubscriptionAuthContext.jsx';

/**
 * Thin facade over {@link useSubscriptionAuth} for backwards compatibility.
 *
 * Polling now lives inside {@link SubscriptionAuthProvider} — it watches the
 * `subscriptionPending` sessionStorage flag set by SubscribeButton and refreshes
 * subscriptions every 2s up to ~30s until an active/trialing subscription
 * appears. Components don't own the polling loop; they just read `polling` and
 * `pollingExhausted` from the context.
 *
 * This hook is kept so existing callers continue to work. The `options` argument
 * (intervalMs, maxAttempts, enabled) is ignored — polling cadence is now
 * controlled centrally by the provider.
 *
 * @returns {{ polling: boolean, attempts: number, exhausted: boolean }}
 */
export function useSubscriptionPolling() {
	const { polling, pollingExhausted } = useSubscriptionAuth();
	return { polling, attempts: 0, exhausted: pollingExhausted };
}
