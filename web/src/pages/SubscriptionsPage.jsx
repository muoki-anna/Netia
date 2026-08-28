import React from 'react';
import { Link } from 'react-router-dom';
import { Gift } from 'lucide-react';
import SubscriptionAccountSection from '@/components/SubscriptionAccountSection.jsx';

/**
 * Shipped subscription home page.
 *
 * Mounts the shipped <SubscriptionAccountSection /> which handles three views:
 * (1) active-subscription view (plan title + status pill + Manage portal button),
 * (2) no-subscription view (copy + "View plans" CTA), and
 * (3) post-checkout polling state when the URL carries `?just_subscribed=1`
 *     — the section detects the flag and polls until the new sub activates.
 *
 * The page itself is intentionally narrow-scope — it does not carry profile /
 * avatar / password-change UX; those belong on a separate /profile or /account
 * page if the site needs them.
 *
 * Mount on App.jsx as a PROTECTED route at /subscriptions (auth-gated via
 * ProtectedRoute — anonymous visitors should not reach this page):
 *   import SubscriptionsPage from '@/pages/SubscriptionsPage.jsx';
 *   <Route path="/subscriptions" element={<ProtectedRoute><SubscriptionsPage /></ProtectedRoute>} />
 *
 * The path /subscriptions is CONTRACTUAL with the shipped SubscribeButton —
 * its successUrl/cancelUrl both build `window.location.origin + MANAGE_PATH +
 * '?just_subscribed=1'`. Renaming the route leaves just-paid users on a 404.
 *
 * Authenticated nav (header / user menu / mobile menu) MUST include a link
 * to /subscriptions so the user can reach the manage portal at any time.
 *
 * Agents may restyle hero copy / layout / surrounding sections freely.
 * PRESERVE the <SubscriptionAccountSection /> mount — recreating its
 * UX inline duplicates the auth gate, subscription lookup, and manage
 * portal logic that already live in the shipped component.
 */
export default function SubscriptionsPage() {
	return (
		<div className="mx-auto max-w-3xl px-6 py-16">
			<header className="mb-8">
				<h1 className="font-display text-3xl text-foreground sm:text-4xl">Your subscription</h1>
				<p className="mt-2 text-muted-foreground">
					View your Kitchen Garden Farmer membership and manage billing.
				</p>
			</header>
			<SubscriptionAccountSection />
			<Link
				to="/rewards"
				className="mt-6 inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
			>
				<Gift className="h-4 w-4" />
				View your loyalty points
			</Link>
		</div>
	);
}
