/**
 * Resolves in the browser's next idle period, or after `timeout` ms at the
 * latest. Safari has no requestIdleCallback; a short timeout stands in.
 */
export function idle(timeout = 1000) {
  return new Promise<void>((resolve) => {
    if ("requestIdleCallback" in window) requestIdleCallback(() => resolve(), { timeout });
    else setTimeout(resolve, 50);
  });
}
