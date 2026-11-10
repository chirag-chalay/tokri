# Staging pull verification — 10 November 2026

Latest local setup: [database restore verification](LOCAL-DATABASE-RESTORE.md) resolves the local schema/migration gap described in this historical report.

Fetched `origin/staging` and fast-forwarded `feature/admin-logs-monitoring` from `23e5a87` to `ae5d9c9481d1725f02324a248947ef8636030d0c` (19 incoming commits). No new branch commit, push, deployment or existing-service restart command was performed.

All 84 local modified/untracked files were backed up before integration. All 51 local files not changed upstream were verified byte-for-byte afterward. Overlapping source changes were merged, retaining monitoring instrumentation, permission checks, masking, viewer presentation, tests and the outbox schema while keeping staging's newer checkout/coupon/GST/image/partner-order behavior. The two earlier personal Banner/Footer adjustments were already included upstream. The pre-existing generated AdminJS settings changes also exist in staging's generated bundle and source.

Safety snapshot retained in `stash@{0}` at creation (stash object `acf73ff88c5319f491380b56a4e2ea281e46bb4d`); the complete original files, patches, merge candidates and test evidence are under ignored `server/backups.local/staging-pull-aznuljck/`. The local work is already reapplied; do not blindly pop the safety stash onto it.

## Verification

- Vite frontend production build passed, written to an ignored temporary output directory rather than the active `dist`.
- Prisma schema validation passed; Prisma Client 6.19.3 regenerated from the combined schema. Regeneration does not apply a database migration.
- Modified backend JavaScript syntax and `git diff --check` passed; no unresolved Git conflicts remain.
- Monitoring unit/presentation/permission/storage tests: 22 passed, zero failed. Two opt-in database suites skipped in the ordinary unit invocation; monitoring E2E was run separately below.
- Inclusive-GST unit tests: 5 passed.
- Incoming manual-coupon MySQL/checkout suite: 10 scenarios passed (11 TAP entries including parent). Its initial invocation without its required test database correctly refused to run; it passed after an isolated database was supplied.
- Combined monitoring + real AdminJS/browser + simulated Razorpay E2E: 11 scenarios passed (12 TAP entries including parent), including COD, signed/invalid/duplicate webhooks, refunds, deletion audit persistence, permissions, filters/pagination and logging-failure recovery.
- Database tests used a newly initialized disposable MySQL instance on loopback port 13318, with separate coupon and monitoring schemas, synthetic fixtures and simulated gateway responses. The instance was stopped after tests.
- Existing local API health returned HTTP 200. No local application database migrations, resets or order changes were performed for this pull. Real Razorpay sandbox testing remains UNVERIFIED.

## Remaining local database setup

Staging's newer source requires schema changes that are not yet in the existing local database: the `AutomaticDiscount` table, `Order.automaticDiscount`, `OrderItem.discount`, and `Coupon.showAtCheckout` / `knowMoreHtml`. A read-only Prisma schema comparison also found pre-existing type/default drift; the private evidence includes a review-only diff. Do not execute that generated diff or `db push` blindly against existing data.

Review these incoming migrations and apply only the changes appropriate to the target database in a separate approved step:

- `prisma/migrations/20261102000000_automatic_discounts/migration.sql`
- `prisma/migrations/20261103000000_manual_checkout_coupons/migration.sql`
- `prisma/migrations/20261105000000_coupon_know_more_html/migration.sql`

Until the matching database schema is prepared, the existing local checkout/coupon/order flows may fail despite the source merge and disposable-database tests passing. Monitoring's two previously approved local tables and recovered COD files were retained.
