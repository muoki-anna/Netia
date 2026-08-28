// Helpers for third-party integrations that need a USER-SUPPLIED secret
// (Stripe, PayPal, Twilio, TMDB, ...). A missing user key is NOT a server
// error: do NOT throw it. errorMiddleware would turn a throw into a 500 the
// user cannot fix, and the site would retry it on every page load. Report
// "not configured yet" instead, so the UI can show a setup state and the user
// can add the key.

export const INTEGRATION_NOT_CONFIGURED = 'INTEGRATION_NOT_CONFIGURED';

// True only when at least one key is listed and every listed env var holds a
// non-empty, non-whitespace value. Fails closed: an unset, blank, or
// whitespace-only key (or no keys at all) reads as "not configured".
export function isIntegrationConfigured(...envKeys) {
    return envKeys.length > 0 && envKeys.every((key) => String(process.env[key] ?? '').trim() !== '');
}

// Canonical response for a missing user-supplied secret. 503 = the feature is
// unavailable until the key is provided. The INTEGRATION_NOT_CONFIGURED marker
// tells the platform this is an expected setup state, not a bug to auto-fix.
export function respondNotConfigured(res, { integration, envKeys }) {
    const keys = Array.isArray(envKeys) ? envKeys : [envKeys];

    return res.status(503).json({
        error: INTEGRATION_NOT_CONFIGURED,
        integration,
        envKeys: keys,
        message: `${integration} is not set up yet. Add the required key(s) to enable this feature.`,
    });
}

export default { INTEGRATION_NOT_CONFIGURED, isIntegrationConfigured, respondNotConfigured };
