# Website/API monitoring review — 11 November 2026

Branch: `feature/admin-logs-monitoring`, based on existing implementation at
`80376dc`. Verification was performed locally; Git delivery is recorded in the
repository history. No deployment or live database modification was performed.

## Implementation

- Website visits and backend API requests have separate `website-YYYY-MM-DD.log`
  and `api-YYYY-MM-DD.log` files. Existing `access` files remain readable in the
  history archive. Error, audit, debug, payment and account categories remain.
- A common browser collector is mounted in both React Router and the Next.js root
  layout. It records committed page paths, including Next transitions and history
  traversal. Prefetches, RSC requests, duplicate router effects and query-only
  filter changes do not create extra visits. Initial HTTP status is recorded only
  when the browser provides it; client transitions never invent a response code.
- API middleware records method, sanitized endpoint, response status, duration and
  approved error classification. Sign-in results enrich that request's entry
  instead of producing duplicate access records. Request identifiers correlate
  frontend API failures with backend requests without storing request bodies.
- Optional debug remains OFF by default and after process restart. Existing
  Super Admin controls, CSRF checks, expiry, audit persistence and server deadline
  remain authoritative. One bounded SSE stream per visible tab carries state;
  compression/transformation is disabled to prevent Next proxy buffering. Disable,
  expiry, hidden tabs or a lost state stream remove optional listeners and discard
  queued diagnostics. The backend rejects stale-generation batches too.
- Debug covers page readiness, frontend runtime/resource failures, failed Next
  page transports, API outcomes, backend failures/timings, cart actions, customer
  session changes, coupons and delivery selection. Browser data is explicitly
  treated as an observation, not authoritative payment or audit evidence.
- Category navigation, compact readable rows, inline summaries and changes,
  human status filters, daily Previous/Next navigation, search, IST timestamps,
  50/100-row pagination and optional labeled expansions replace technical clutter.
  There is no raw JSON display. The server-driven debug control remains at the
  top right, below the profile area; mobile uses compact stacked cards.
- Monitoring reads and ingestion no longer create access/debug self-events.
  Historical non-audit self-events are omitted from results without rewriting or
  deleting files. Audit history and debug-control audits remain available.

## Boundaries and security

Browser batches contain an allowlisted vocabulary and scalar facts only. Queries,
fragments, arbitrary messages/stacks, form fields, cookies, authorization values,
OTPs, passwords and payment payloads are never collected. Customer identities and
IPs are not attached to browser observations. Public catalog names and paths are
resolved through bounded read-only lookups; names supplied by browsers are not
trusted. Unknown/private paths are redacted and unavailable identities stay
unknown. Existing server-side masking and current-role checks remain in place.

Ingestion is origin-checked, limited to 16 KB / 25 events, rate-limited, deduplicated
and bounded to four concurrent batches. Browser queues hold at most 100 entries,
send at most 25 per batch, and never retry. Streams have global/per-IP caps and
capped reconnect backoff. Monitoring traffic is excluded from diagnostics to avoid
loops. Optional collection is independent of checkout promises and critical audit
delivery. Daily files use the existing private worker, rotation, retention and
disk quota; the durable critical outbox and mutation transaction observer are
unchanged. Protected-file checks are in [protected-files.txt](website-api-evidence/protected-files.txt).

Main source changes: `shared/monitoring.js`; `src/lib/websiteMonitoring.js` and
the React/Next mounting components; logging-only calls in Auth/Cart contexts;
`server/src/monitoring/{website,index,sanitize,worker,database}.js`; AdminJS
monitoring presentation/component/handler; API/auth routing and response-header
exposure. Checkout, payment, webhook, outbox and Prisma schema files are unchanged.

## Verification

All database integration tests use disposable loopback MySQL instances on
nonstandard ports, synthetic customers and simulated gateways. Test bootstraps
exclude live environment credentials. Temporary test services are separate from
existing project services. Baseline screenshots/tests came from a detached checkout
of the unchanged starting commit. Browser artifacts were written outside the
repository to prevent development watcher reloads.

| Check | Evidence |
| --- | --- |
| Backend/unit and presentation tests | [unit.tap](website-api-evidence/unit.tap): 37 passed; three opt-in DB/browser suites skipped here and passed separately below |
| AdminJS + API/payment regression | [backend.tap](website-api-evidence/backend.tap): 11 scenarios; all categories, COD, simulated payment success/failure/refunds/webhooks/duplicates, role revocation, CSRF, filters and 50/100 pagination |
| Durable recovery | [outbox.tap](website-api-evidence/outbox.tap): 10 scenarios; forced process termination, recover-once delivery, rollback, deletion/payment recovery, storage/budget failures |
| Coupon/checkout regression | [coupons.tap](website-api-evidence/coupons.tap): 10 scenarios |
| Inclusive GST regression | [gst.tap](website-api-evidence/gst.tap): 5 tests |
| Website browser E2E | [website.tap](website-api-evidence/website.tap): 8 scenarios against optimized Vite/Next builds; React Router and Next navigation, prefetch exclusion, Back/Forward, live debug ON/OFF, stale-batch rejection, frontend expiry, real cart/coupon/delivery interactions, API/frontend failures, privacy and daily/status/responsive UI |
| Build and lint | [Vite build](website-api-evidence/vite-build.txt), [Next build](website-api-evidence/next-build.txt), [lint](website-api-evidence/lint.txt); no lint errors, four existing hook-dependency warnings |

Rotation tests cross IST midnight separately for website/API/debug/payment/audit.
Retention and disk-cap tests include both new categories; symlink/path protection,
masking and unavailable-storage tests pass. Backend regression confirms COD and
online payment operations continue when file storage is unavailable. A filter
regression also checks that error records without explicit status match the same
Failed category shown in the UI.

## UI evidence

Follow-up presentation change: the routine recovery/storage-health card was
removed at the owner's request. Actual file-access failures still show an alert.
Debug mutations now have a separate busy state: background log reads no longer
disable category navigation or an authorized Super Admin's debug toggle. A browser
check with a deliberately delayed log response confirmed category switching stays
clickable. Existing Super Admin permissions are unchanged. The synthetic screenshots
below document the preceding full redesign, before this small follow-up removal.

Synthetic data only:

| View | Before | After |
| --- | --- | --- |
| Desktop | [Before](website-api-evidence/before-desktop.png) | [After](website-api-evidence/after-desktop.png) |
| Mobile controls | [Before](website-api-evidence/before-mobile.png) | [After](website-api-evidence/after-mobile.png) |
| Mobile readable rows | — | [After](website-api-evidence/after-mobile-rows.png) |

## Remaining verification limits

- **Real Razorpay sandbox: UNVERIFIED.** No test-mode credentials were available;
  gateway behavior was simulated. Live credentials were not used.
- Hosted staging, reverse-proxy settings and multi-process behavior have not been
  verified remotely. No public runtime update is claimed. The current debug state
  is process-local, as before; a multi-worker deployment needs coordinated state or
  an explicitly reviewed single-process routing arrangement before release.
- Website telemetry is best effort: JavaScript blocked before initialization,
  offline clients, blockers and rate/storage limits can prevent observations.
  It is not a replacement for proxy-level access/security logs or critical outbox
  events. Missing error causes/statuses are explicitly left unknown.
- Existing AdminJS emits an unrelated `Order.deliveryPartnerId` resource warning;
  builds report existing bundle-size/browser-data notices. No dependencies or
  unrelated resource/business settings were changed to silence them.

The feature is suitable for a controlled staging review after approval. Before a
production release, verify hosted SSE updates/expiry, routing/worker topology,
storage permissions/quotas and Razorpay sandbox behavior. Do not deploy from this
report alone.
