# Monitoring UI refinement — 10 November 2026

Implemented locally on the staging-based `feature/admin-logs-monitoring` branch. No commit, push or deployment was performed. Hosted staging verification is pending deployment approval; all tests below were local, including a separate disposable MySQL instance.

## Changes

- Debug status and the enable/disable control are positioned at the top-right below the AdminJS profile area. On mobile this card appears first beneath the profile bar. Status is Enabled/Disabled and is derived from the existing backend expiry; the UI never toggles debug optimistically.
- Only explicit `super_admin` accounts can change debug logging. The handler reloads the active role for every request and rejects ordinary admin/staff/deactivated/spoofed requests. Existing viewer permissions for admin/super_admin and the existing same-origin checks, expiry, debug writer and audit persistence remain intact. The ordinary local admin account was not promoted or changed.
- Removed the JSON/Technical Details renderer entirely. Rows and expandable View details panels contain only centrally translated labels, scalar values and explanations. No raw event names, internal identity references, raw codes, arbitrary metadata objects or JSON are rendered. Original masked server files/storage remain unchanged.
- Product edits show Previous and Updated values, including explicitly cleared fields. Known amounts use rupees; refund webhook paise are converted only for the known refund event context. Missing payment amounts and causes are identified as unrecorded. Current order-linked customer names are retrieved with an explicit name-only relation selection; historical names and financial outcomes are never inferred from current records.
- Known database/payment failure codes are explained using an approved dictionary. Unknown/malformed events and inherited-property names have safe fallbacks. Arbitrary reason text is not exposed as a failure explanation.
- Existing six categories, IST dates, filters/search, newest-first sorting, 50/100-row server pages, read-only behavior and daily file selection are preserved. The interface uses compact desktop rows and mobile cards without horizontal overflow.

## Files changed for this refinement

- `src/admin/components/monitoring.jsx`: layout, backend-driven debug controls, readable details, responsive styles.
- `src/admin/monitoring-presentation.js`: central descriptions/detail mapping and minimal current-name lookups.
- `src/admin/monitoring.js`: explicit Super Admin debug guard and freshly evaluated capability response.
- `test/monitoring-presentation.test.js`, `test/monitoring.test.js`, `test/monitoring-integration.test.js`: presentation safety, permissions, expiry, filtering and desktop/mobile assertions. Role changes occur only in guarded disposable fixtures.
- `README.md` and this report: behavior/verification documentation.

## Verification

- `npm test`: **27 passed, zero failed**; two opt-in database suites skipped in the ordinary invocation. The monitoring E2E suite was run separately below.
- Disposable MySQL + real AdminJS/browser + simulated Razorpay E2E: **11 scenarios passed** (12 TAP entries including parent), zero failures/skips. Includes explicit Super Admin enable/disable, deadline expiry, audit logging, ordinary-admin forged-header rejection, staff/revoked access, filters, search, 50/100 pagination, storage failure and retained checkout behavior.
- Dedicated browser presentation checks: **11 event examples across all six categories**, product old/new values, recorded payment/refund amounts and reasons, safe unknown fallback, all panels expanded with no raw JSON/codes/IDs/secrets visible, and zero JavaScript errors.
- Desktop profile/control alignment asserted. Desktop views checked at 1440/1600 pixels; mobile at 390 pixels. Mobile document width equaled the viewport, including expanded readable details.
- Verified normal local admin can view backend debug status and cannot see mutation controls. No local account roles or business records were altered for this test.
- Hash verification confirmed **10 protected files unchanged**: logging entry point, database observer, worker, outbox, sanitizer, checkout/payment services/routes/webhooks and Prisma schema. `git diff --check` passed.

Private originals, hashes, TAP output, browser results and screenshots are under ignored `server/backups.local/monitoring-ui-riee906c/`. Database E2E ran on a newly initialized loopback MySQL instance at port 33379 with a separate review schema, synthetic data and simulated payments. That test instance was stopped after verification. Real Razorpay sandbox testing remains UNVERIFIED; no production testing was performed.
