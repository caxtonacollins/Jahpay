import * as Sentry from "@sentry/nextjs";
import { Replay } from "@sentry/replay";

/**
 * Initialize Sentry for error tracking and monitoring
 */
export function initializeSentry() {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NEXT_PUBLIC_APP_ENV || "production",
      tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
      debug: process.env.NODE_ENV !== "production",
      integrations: [
        new Replay({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    });
  }
}

/**
 * Capture an exception with Sentry
 */
export function captureException(
  error: Error | string,
  context?: Record<string, any>
) {
  if (typeof error === "string") {
    Sentry.captureException(new Error(error), { extra: context });
  } else {
    Sentry.captureException(error, { extra: context });
  }
}

/**
 * Capture a message with Sentry
 */
export function captureMessage(
  message: string,
  level: "fatal" | "error" | "warning" | "info" | "debug" = "info",
  context?: Record<string, any>
) {
  Sentry.captureMessage(message, level);
  if (context) {
    Sentry.setContext("additionalInfo", context);
  }
}

/**
 * Set user context for Sentry
 */
export function setSentryUser(userId: string, email?: string) {
  Sentry.setUser({
    id: userId,
    email: email,
  });
}

/**
 * Track a transaction
 */
// export async function trackTransaction(
//   op: string,
//   description: string,
//   callback: () => Promise<void>
// ) {
//   return Sentry.startSpan(
//     {
//       op,
//       name: description,
//     },
//     async (span) => {
//       try {
//         await callback();
//         span?.setStatus("ok");
//       } catch (error) {
//         span?.setStatus("internal_error");
//         captureException(error as Error);
//         throw error;
//       }
//     }
//   );
// }

/**
 * Add breadcrumb for tracking user actions
 */
export function addBreadcrumb(
  message: string,
  data?: Record<string, any>,
  level: "fatal" | "error" | "warning" | "info" | "debug" = "info"
) {
  Sentry.addBreadcrumb({
    message,
    level,
    data,
    timestamp: Date.now() / 1000,
  });
}
