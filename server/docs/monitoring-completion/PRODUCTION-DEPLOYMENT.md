# Tokriii monitoring: staging and production deployment

Prepared 10 November 2026. These are operator instructions, not a deployment that has been performed.

## Release status

Local monitoring setup is complete. Two additive monitoring tables are installed in the local development database. Six original COD records from the backend emergency output were recovered for orders TKR95633009366 and TKR95844440268. Their original event IDs and timestamps were preserved; repeat replay produced no duplicates. Existing order data and the counts of all 27 pre-existing tables were unchanged.

The monitoring tests support a controlled staging rollout. The feature branch has now been fast-forwarded to `origin/staging` at `ae5d9c9`, with the local monitoring changes reapplied and conflicts resolved. This brings in the matching newer checkout/coupon/tax backend and frontend source. The previous frontend-only source mismatch is resolved. The local development database was subsequently restored from the latest user-supplied backup and the missing optional coupon field was added; local checkout now calculates successfully. See [local restore verification](LOCAL-DATABASE-RESTORE.md). Review the actual production schema and each applicable migration separately before any production database change. Do not deploy the uncommitted working tree directly: prepare a reviewed release, retain newer live changes and verify the combined release on staging first. See [staging pull verification](STAGING-PULL.md).

Real Razorpay sandbox testing is **UNVERIFIED**. All payment E2E tests used simulated gateway responses and disposable MySQL databases. Run real Razorpay test-mode verification on staging when test credentials become available. Never use live payments as a test substitute.

## 1. Prepare an approved release

- Review the complete diff and integrate the monitoring changes into the latest approved live branch (`main` in this repository's handoff). Preserve newer remote changes. Do not force-push or copy an outdated backend over the current live backend.
- Include the new monitoring modules, AdminJS components/handler/presentation translator, schema additions, instrumentation, tests, and `server/prisma/sql/monitoring-outbox.sql`. The SQL directory's local `.gitignore` exception permits this migration; verify it is included in the release.
- Keep `.env`, credentials, uploads, log files, local recovery artifacts and database dumps out of Git. Existing uploads and private logs must survive release switches.
- Verify both lockfiles, install with `npm ci`, and keep the repository's pinned Prisma 6 toolchain. Do not upgrade Prisma as part of this deployment.
- Use a clean release checkout at the approved commit. Git pull/push alone does not deploy the running website.

## 2. Back up and provision persistent storage

Before production database work, take and verify a restorable database backup using the existing backup procedure. Preserve private log files and any pending outbox rows during rollout/rollback.

Identify the actual Node service account and process manager from the server configuration. The repository does not establish a real production PM2/systemd service name. Do not assume the example name in older handoff notes is correct.

Create persistent private directories outside `dist`, `public`, uploads and Nginx document roots. Example only; replace `tokri` with the actual service user/group:

```bash
sudo install -d -m 0700 -o tokri -g tokri /var/lib/tokri/logs /var/lib/tokri/adminjs
```

Configure the backend's production environment (keep the existing database, session, JWT, Razorpay and messaging secrets):

```dotenv
NODE_ENV=production
LOG_DIRECTORY=/var/lib/tokri/logs
LOG_RETENTION_DAYS=30
LOG_MAX_MB=256
LOG_QUEUE_LIMIT=2000
LOG_OUTBOX_ENABLED=true
LOG_OUTBOX_DESTINATION=tokri-production
LOG_OUTBOX_MAX_MB=64
LOG_OUTBOX_RETENTION_DAYS=7
LOG_OUTBOX_POLL_MS=2000
ADMIN_JS_TMP_DIR=/var/lib/tokri/adminjs
```

Use a different stable destination and private directory on staging. Keep each destination stable across restarts and tied to its persistent log volume. Run one backend writer process per log directory; do not point several PM2 cluster workers at the same files. Instances sharing the database budget must use the same `LOG_OUTBOX_MAX_MB` value. Keep supervisor stderr retained and rotated separately: these limits cover managed log files and the outbox's accounted payload bytes, not all host disk usage or MySQL physical overhead. Debug starts OFF; enable it temporarily from the authorized admin controls only.

## 3. Install dependencies, apply the additive SQL, generate Prisma

These commands are for an **approved staging deployment first**, then the same approved release on production. Confirm the current directory and the environment's intended database before executing them. The documented server checkout is `/var/www/html/tokri`; substitute the actual release path if different.

```bash
cd /var/www/html/tokri
npm ci
cd server
npm ci
npx prisma db execute --schema prisma/schema.prisma --file prisma/sql/monitoring-outbox.sql
npx prisma generate --schema prisma/schema.prisma
```

The CLI syntax above was checked against this repository's installed Prisma 6.19.3 CLI. `db execute` executes the reviewed SQL directly, without registering a Prisma migration-history entry. Do not substitute `db push`, `migrate dev`, a database reset or `db:setup` against production.

The SQL creates only `MonitoringOutbox`, `MonitoringOutboxBudget`, their indexes and the initial budget row. It does not alter order/customer/product tables. It is idempotent when the expected tables already exist; it does not repair an incorrectly shaped existing table. Compare the resulting table definitions with the checked-in SQL before proceeding. All managed business tables and the two new tables must be InnoDB for the expected transactional guarantees.

Use a migration account authorized to create these tables. The running application needs SELECT/INSERT/UPDATE/DELETE on both monitoring tables, plus its existing business permissions; it does not need CREATE/ALTER/DROP at runtime. Initialization checks the current schema through `information_schema.tables`.

Reference: [Prisma db execute documentation](https://docs.prisma.io/docs/cli/db/execute). Current upstream documentation includes newer CLI versions; the installed project's version and its `--help` output govern the flags above.

## 4. Build and activate only after approval

For the existing Vite production frontend:

```bash
cd /var/www/html/tokri
npm run build
```

Confirm the production API base URL for the actual site before building. The Vite build uses the production environment; do not ship local `/api` proxy/test overrides. If the site's active frontend has been migrated to Next.js, follow its existing verified release pipeline instead of replacing it with `dist`; confirm the runtime first.

AdminJS bundles the registered custom components during production initialization. The service account must be able to write `ADMIN_JS_TMP_DIR`. Do not set `ADMIN_JS_SKIP_BUNDLE=true` unless the exact approved release's AdminJS bundle was built separately and verified. Confirm that the new monitoring page renders after activation.

After release review and explicit deployment/restart approval, switch the service to the approved release and use its **actual existing process manager** for a controlled restart. Keep `NODE_ENV=production`, the environment secrets and persistent storage mounted. There is intentionally no guessed `pm2 restart` or `systemctl restart` command here. If the frontend and API live on different hosts, deploy the matching frontend artifacts through the existing frontend release process.

## 5. Verify staging, then production

- `/api/v1/health` returns success; storefront, product listing, account sign-in, cart, coupons, address management, orders and AdminJS remain functional.
- Monitoring reports automatic recovery available, a draining backlog, no new enqueue failures or retries, and no disk/storage warnings. Historical process counters can remain after recovery; compare before/after counts for new activity.
- A real admin sign-in and an approved reversible staging admin action produce access/audit records with the right actor and changes. The viewer uses current names when available; it does not invent historical identities.
- On staging, place a COD order: its creation appears under Payment logs as payment Pending; successful checkout is not described as cash already collected. Check by order number, with the right IST date and cleared unrelated filters.
- On staging, verify simulated and eventually real Razorpay test-mode success/failure/refund/webhook/duplicate scenarios. Real sandbox verification remains pending until test-mode credentials are supplied.
- Date, category, status, user, order and IP filters, search, 50/100-row pagination, newest-first ordering and Technical Details work. No names, credentials, OTPs, tokens or contact/address details leak through technical metadata. Authorized current names are presentation-only additions.
- Unauthenticated/deactivated/staff accounts cannot access the viewer, debug controls or outbox resources. Log files are not accessible through public HTTP paths; directories are 0700 and files 0600.
- Exercise storage failure, recovery, quota pressure and forced-exit recovery in a disposable environment, not by breaking production storage or its database. Critical committed outbox rows survive and are delivered once; logging failures do not break checkout.
- Daily files appear when that category receives its first event. Debug files should not be expected while Debug is OFF.

If a pre-migration event exists only in retained emergency stderr output, recover the **actual original record** through the outbox, preserving its event ID, timestamp and masked metadata, and verify replay deduplication. Do not invent historical events from current order state. Events missing from both the outbox and retained emergency output cannot be reconstructed faithfully.

## 6. Rollback

Keep the prior approved code/frontend release available. If rollout fails, use the existing approved rollback process. Leave the additive monitoring tables, pending rows and persistent log directory intact; do not drop/truncate them to roll back code. Pending rows can resume delivery when the compatible monitoring release is restored. Investigate storage/schema/permission errors before trying another rollout.

## Local evidence from this completion

Detailed artifacts are private and ignored by Git under `server/backups.local/monitoring-completion-UIWvLZ/`: before/after table counts and COD snapshots, exact original events, recovery replay result, viewer screenshot/API result, unit tests, disposable MySQL E2E/recovery tests and backend regressions. No production migration, push, deployment or existing-service restart was performed as part of this completion.
