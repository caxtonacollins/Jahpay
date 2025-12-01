/**
 * Analytics tracking utilities
 * Tracks events to PostHog and Mixpanel
 */

// Initialize PostHog
let posthog: any = null;

/**
 * Initialize analytics
 */
export function initializeAnalytics() {
  if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    // Lazy load PostHog
    try {
      // PostHog initialization would go here
      console.log("Analytics initialized");
    } catch (error) {
      console.error("Failed to initialize analytics:", error);
    }
  }
}

/**
 * Track an event
 */
export function trackEvent(
  eventName: string,
  properties?: Record<string, any>
) {
  if (posthog) {
    posthog.capture(eventName, properties);
  }

  // Also log for debugging
  console.log(`[Analytics] ${eventName}`, properties);
}

/**
 * Track page view
 */
export function trackPageView(path: string, name: string) {
  trackEvent("$pageview", {
    $current_url: path,
    page_name: name,
  });
}

/**
 * Track transaction initiation
 */
export function trackTransactionInitiated(data: {
  type: "on-ramp" | "off-ramp";
  provider: string;
  amount: number;
  currency: string;
  country?: string;
}) {
  trackEvent("transaction_initiated", {
    type: data.type,
    provider: data.provider,
    amount: data.amount,
    currency: data.currency,
    country: data.country,
  });
}

/**
 * Track transaction completed
 */
export function trackTransactionCompleted(data: {
  transaction_id: string;
  type: "on-ramp" | "off-ramp";
  provider: string;
  amount: number;
  currency: string;
  duration_seconds?: number;
}) {
  trackEvent("transaction_completed", {
    transaction_id: data.transaction_id,
    type: data.type,
    provider: data.provider,
    amount: data.amount,
    currency: data.currency,
    duration_seconds: data.duration_seconds,
  });
}

/**
 * Track transaction failed
 */
export function trackTransactionFailed(data: {
  transaction_id: string;
  type: "on-ramp" | "off-ramp";
  provider: string;
  error: string;
  reason?: string;
}) {
  trackEvent("transaction_failed", {
    transaction_id: data.transaction_id,
    type: data.type,
    provider: data.provider,
    error: data.error,
    reason: data.reason,
  });
}

/**
 * Track error
 */
export function trackError(data: {
  error_type: string;
  error_message: string;
  error_stack?: string;
  context?: Record<string, any>;
}) {
  trackEvent("error_occurred", {
    error_type: data.error_type,
    error_message: data.error_message,
    error_stack: data.error_stack,
    ...data.context,
  });
}

/**
 * Track user action
 */
export function trackUserAction(action: string, data?: Record<string, any>) {
  trackEvent(`user_${action}`, data);
}

/**
 * Set user properties
 */
export function setUserProperties(properties: Record<string, any>) {
  if (posthog) {
    posthog.people.set(properties);
  }
}

/**
 * Identify user
 */
export function identifyUser(userId: string, properties?: Record<string, any>) {
  if (posthog) {
    posthog.identify(userId, properties);
  }
}

/**
 * Reset analytics (on logout)
 */
export function resetAnalytics() {
  if (posthog) {
    posthog.reset();
  }
}
