# Readable event details and Admin debug controls

Verified locally on `feature/admin-logs-monitoring`, based on `a3e0933`.
Verification ran locally; Git delivery is recorded separately in repository
history. No deployment, live-service restart or live database change was performed.
This report supersedes the earlier Super Admin-only and restart-reset behavior.

## Result

Every row displays its description, outcome, safe supporting facts, recorded
changes and failure reason directly. There is no View Details button, collapsed
event panel, raw JSON, request method or API endpoint in the table. Confirmed
failure reasons appear immediately below the description. Unknown causes say:
“The action failed, but the system did not record a specific reason.”

Descriptions are selected from actual event/feature/result information. Facts
come from stored fields, including approved nested historical totals. No example
amounts or inferred historical prices, identities or payment states are used.
Existing bounded name lookups remain read-only. Dates, categories, status, user,
order, IP, IST display and 50/100-row pagination remain available. Search now
matches the same English descriptions and approved facts used in the table.
Desktop rows use compact labeled facts; tablet/mobile layouts use wrapped cards.

## Data mapping and instrumentation

The old API access records held status/timing but omitted cart totals and many
failure causes. The renderer also placed most available information in a closed
details panel. Both problems are addressed:

- A small response observer enriches the existing API access entry with approved
  totals, product count, confirmed coupon selection, delivery and payment outcome
  fields. It does not create duplicate events, serialize bodies or query the DB.
- Application failures are translated through exact known messages/codes into
  approved reason classifications. Arbitrary error/provider messages, SQL,
  addresses, OTPs, tokens and payment payloads are excluded. Unknown codes remain
  unknown. Safe classifications also accompany existing error/debug records.
- Explicit checkout payment failures returned with HTTP 200 are now Failed in
  API logs. The original HTTP status remains in the protected record. Safe outcome
  and reason headers let optional browser diagnostics reflect these failures
  without reading response bodies.
- Backoffice write requests retain approved model/action/reference metadata,
  without recording form values. Failed edit responses identify the attempted
  action and confirmed cause. AdminJS error notices/validation responses are
  Failed even with HTTP 200; they never imply that changes were saved. Opening an
  edit form is not mistaken for submitting an edit.
- The formatter supplies descriptions and expanded facts, and the existing file
  reader uses that formatter for meaningful searches without per-row DB queries.
- Website/API access remain separate. Monitoring reads and telemetry still do not
  generate self-events. Existing history is neither rewritten nor deleted.

## Debug permission and persistence

Active `admin` and `super_admin` accounts can enable and disable debug logging.
Every control request rechecks the current database role and active flag. Staff,
inactive/revoked users, customers and unauthenticated requests are denied; client
permission flags cannot grant access. Existing session/CSRF checks remain.

The backend is authoritative. A private file at
`${LOG_DIRECTORY}.settings/.debug-settings.json` stores only the absolute expiry
deadline and generation. Missing/invalid/unsafe state defaults OFF. Atomic synced
replacement uses a directory owned by the server user with mode 0700 and a 0600
file. Restart restores the same deadline, never a fresh activation period;
expired deadlines stay OFF. Symlinks, oversized state, unsafe ownership/modes and
invalid deadlines fail closed. Failed saves are not reported as successful and
produce a critical audit entry with a safe reason.
Control requests journal their intent before changing the file, then record the
outcome. An interruption can leave a truthful unconfirmed attempt; it does not
silently apply an unaudited enable. Enabling is refused when its intent cannot be
stored. Disabling can still use existing emergency audit reporting if needed.

Filesystem notifications update processes sharing the same control directory;
the existing SSE status stream updates other admin sessions. The UI uses server
deadlines, has no independent debug toggle, and guards against stale log-read
responses overwriting a newer control update. Debug mutations have their own busy
state, so log reads do not block category navigation or an authorized toggle.

Ordinary API/checkout requests do not read or write this settings file. Optional
browser/backend collection stops on disable/expiry; essential access/error/account
records and durable audit/payment delivery remain independent. Existing retention,
rotation, masking and disk limits are preserved. The tiny control file is separate
from retained log files and cannot be pruned as historical log data. No schema
migration is required.

## Verification evidence

Only disposable loopback MySQL databases on ports 33379/13318 and synthetic
fixtures were used. Test bootstraps exclude live credentials; payment responses
were simulated. Production Vite/Next builds were served locally for browser E2E.

| Check | Result and evidence |
| --- | --- |
| Unit/backend/presentation/settings | [unit.tap](readable-details-evidence/unit.tap): 41 passed; 3 opt-in integration suites skipped here and passed separately |
| AdminJS + real API regression | [backend.tap](readable-details-evidence/backend.tap): 12 scenarios passed; real cart totals/failures visible inline, English search, rejected product edits with confirmed cause, HTTP 200 payment failure, regular/Super Admin controls, two independent sessions, unauthorized/inactive/CSRF denial, 50/100 pagination and responsive layouts |
| Website E2E | [website.tap](readable-details-evidence/website.tap): 8 scenarios passed against optimized Vite/Next builds; route/prefetch separation, ON/OFF/expiry, cart/coupon/delivery, safe OTP/product/coupon failures, business failures with HTTP 200 and privacy checks |
| Durable outbox | [outbox.tap](readable-details-evidence/outbox.tap): 10 scenarios passed; forced termination, recover-once deletion/payment events, rollback, quota and fail-open handling |
| Coupon/checkout and GST | [coupons.tap](readable-details-evidence/coupons.tap): 10 scenarios passed; [gst.tap](readable-details-evidence/gst.tap): 5 tests passed |
| Build | [Vite](readable-details-evidence/vite-build.txt) and [Next](readable-details-evidence/next-build.txt) production builds passed |
| Protected functionality | [protected-files.txt](readable-details-evidence/protected-files.txt): schema, payment/checkout/cart/coupon/pricing logic, gateway/webhooks, outbox and Prisma mutation observer unchanged |

Settings tests additionally cover a separate process restoring the same deadline,
shared-directory synchronization, expired/corrupt/private state, symlink safety,
duration limits, and a failed durable save producing an audit failure rather than
a successful toggle. The audit guard refuses an enable before configuration is
changed when intent storage fails. A response-handling unit check also verifies
AdminJS HTTP 200 validation failures without storing error payloads. Normal
checkout/payment operations still passed while log
file storage was unavailable. Original rotation, retention, disk-cap and masking
regressions remain green. Browser collector lint has no errors.

## Before/after screenshots

The before screenshots use the unchanged starting implementation in a detached
checkout; a test-only hook submits the same real synthetic cart quote. After
screenshots show real successful and failed quotes from the disposable database.
No production customer data or hardcoded production log rows were used.

| View | Before | After |
| --- | --- | --- |
| Desktop | [Before](readable-details-evidence/before-desktop.png) | [Expanded facts and cause](readable-details-evidence/after-desktop.png) |
| Mobile | [Before](readable-details-evidence/before-mobile.png) | [Failure reason](readable-details-evidence/after-mobile-failure.png), [successful totals](readable-details-evidence/after-mobile-totals.png) |
| Tablet | — | [Responsive rows](readable-details-evidence/after-tablet.png) |

## Changed files and remaining limits

- `src/admin/components/monitoring.jsx`: expanded rows, prominent cause, compact
  responsive layout and live server status subscription.
- `src/admin/monitoring-presentation.js`, `src/monitoring/worker.js`: central
  interpretation, safe facts, unknown-cause fallback and English search.
- `src/admin/monitoring.js`, `src/monitoring/debug-settings.js`,
  `src/monitoring/index.js`: Admin authorization, durable controls, live state and
  approved enrichment of existing access events.
- `src/monitoring/event-facts.js`, `database.js`, `sanitize.js`, `website.js`,
  `src/admin/index.js`, `src/server.js`, `shared/monitoring.js`, and browser
  `src/lib/websiteMonitoring.js`: safe classifications and outcome propagation.
- Tests and server documentation/evidence were updated accordingly.

Historical entries cannot acquire facts that were never recorded. Unsupported
failure text remains protected on the server and receives the explicit unknown
cause fallback rather than a guessed explanation. Browser telemetry remains
best effort and does not establish authoritative payment or audit facts.

**Real Razorpay sandbox remains UNVERIFIED** because no test credentials were
available. Hosted staging/reverse-proxy behavior is not remotely verified.
Processes/hosts must share the same private control directory and server-user
permissions to share debug settings; independent storage requires additional
deployment coordination. Existing AdminJS resource and build-size/browser-data
warnings remain unrelated to this change. No deployment is included.
