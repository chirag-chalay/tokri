// Operational counters only: no customer IDs, search terms, orders or payloads.
const allowed = new Set(['configUnavailable', 'sdkQueued', 'sdkRejected', 'dispatchUncertain', 'cleanupPending'])
const counters = {}
export function recordTrackingOutcome(name) {
  if (allowed.has(name)) counters[name] = Math.min((counters[name] || 0) + 1, 1000000)
}
export function getTrackingDiagnostics() { return { ...counters } }
