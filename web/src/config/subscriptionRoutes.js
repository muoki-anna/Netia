/**
 * Subscription-flow routing constants — single source of truth.
 *
 * Every shipped subscription component imports its path strings from this file
 * (SubscribeButton, SubscriptionAccountSection, ManageSubscriptionButton), and
 * the App.jsx route registrations MUST reuse these same constants.
 *
 * DO NOT EDIT THE VALUES. The three paths below are the contract between the
 * shipped components, the shipped Express sub-router, and the planner/coding-agent
 * prompts. Changing them silently breaks the post-checkout flow and route
 * registrations. If a site needs an /account or /profile page for profile
 * content (avatar, email, password), register that page as its own SEPARATE
 * route and let it coexist with /subscriptions — do NOT remap MANAGE_PATH to
 * the profile route. Subscription management lives at /subscriptions; profile
 * lives at its own route.
 */

/**
 * Where <SubscriptionsPage /> mounts (which itself mounts <SubscriptionAccountSection />),
 * and where SubscribeButton points `successUrl` / `cancelUrl` for post-checkout return.
 * LOCKED — do not change.
 */
export const MANAGE_PATH = '/subscriptions';

/**
 * Pricing page (shipped PlansPage at this route). Also the "View plans" fallback
 * from ManageSubscriptionButton when the user has no active subscription.
 * LOCKED — do not change.
 */
export const PLANS_PATH = '/plans';

/**
 * Login route. SubscribeButton redirects here when an unauthenticated user
 * clicks Subscribe. LOCKED — do not change.
 */
export const LOGIN_PATH = '/login';
