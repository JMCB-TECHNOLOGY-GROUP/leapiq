import * as Sentry from '@sentry/nextjs';

export function logError(context: string, error: unknown, extra?: Record<string, unknown>) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[${context}]`, message);
  Sentry.captureException(error, { tags: { context }, extra });
}

export function logWarn(context: string, message: string, extra?: Record<string, unknown>) {
  console.warn(`[${context}]`, message);
  Sentry.addBreadcrumb({ category: context, message, level: 'warning', data: extra });
}

export function logInfo(context: string, message: string, extra?: Record<string, unknown>) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${context}]`, message);
  }
  Sentry.addBreadcrumb({ category: context, message, level: 'info', data: extra });
}
