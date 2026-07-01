/**
 * Monitoring Service
 *
 * Architecture for future monitoring integration.
 * Currently all methods are stubs.
 *
 * Future integrations:
 * - Sentry for error tracking
 * - PostHog for product analytics
 * - Google Analytics for traffic
 * - UptimeRobot for uptime monitoring
 */

export interface ErrorReporter {
  captureException(error: Error, context?: Record<string, unknown>): void;
  captureMessage(message: string, level?: "info" | "warning" | "error"): void;
}

export interface AnalyticsTracker {
  trackEvent(name: string, properties?: Record<string, unknown>): void;
  trackPageView(path: string): void;
  identifyUser(userId: string, traits?: Record<string, unknown>): void;
}

class SentryReporter implements ErrorReporter {
  captureException(_error: Error, _context?: Record<string, unknown>): void {
    // TODO: Integrate Sentry
    // Sentry.captureException(error, { extra: context });
  }
  captureMessage(_message: string, _level?: "info" | "warning" | "error"): void {
    // TODO: Integrate Sentry
  }
}

class PostHogTracker implements AnalyticsTracker {
  trackEvent(_name: string, _properties?: Record<string, unknown>): void {
    // TODO: Integrate PostHog
  }
  trackPageView(_path: string): void {
    // TODO: Integrate PostHog
  }
  identifyUser(_userId: string, _traits?: Record<string, unknown>): void {
    // TODO: Integrate PostHog
  }
}

export const errorReporter: ErrorReporter = new SentryReporter();
export const analytics: AnalyticsTracker = new PostHogTracker();