# Tokriii API Server

Express + Prisma + MySQL + AdminJS backend for the Tokriii storefront and future mobile app.

## Quick start

```bash
# From project root
cd server
cp .env.example .env   # set DATABASE_URL to your local MySQL user/password
npm install
npm run db:setup       # create tables + seed data
npm run dev            # API on http://localhost:5223 (see .env)
```

The setup seed does not add example products or categories. The storefront catalog
stays empty until you add real catalog entries in the admin dashboard.

The backend loads `server/.env` regardless of the directory used to start it.
MySQL must be running locally and the example `DATABASE_URL` must be replaced
with a valid local connection string before starting the API.

From project root, run the storefront dev server separately:

```bash
npm run dev            # Frontend on http://localhost:5222
```

## Production URLs (tokriii.com)

| Service | URL |
|---------|-----|
| Storefront | https://www.tokriii.com/ |
| Admin | https://www.tokriii.com/tokri-backoffice/ |
| API | https://server.tokriii.com/api/v1 |

### Production env (`server/.env` on API server)

```env
PORT=5222
NODE_ENV=production
APP_URL=https://www.tokriii.com
CLIENT_URL=https://www.tokriii.com
API_URL=https://server.tokriii.com
TRUST_PROXY=true
```

### Production backend build

From `server/`, generate the Prisma client before starting the API:

```bash
npm run build
npm start
```

The backend runs JavaScript directly, so it does not need transpilation. The build generates the Prisma client without changing the database schema.

### Production frontend build (on www server or CI)

```bash
npm --prefix .. run build   # from server/; builds the Vite storefront in ../dist/
```

Serve `dist/` from Nginx on `www.tokriii.com` and proxy `/tokri-backoffice` to the API server.

## Local dev URLs

| URL | Description |
|-----|-------------|
| http://localhost:5222 | Vite storefront |
| http://localhost:5223/tokri-backoffice | Admin CMS (AdminJS) |
| http://localhost:5223/api/v1/health | API health check |
| http://localhost:5223/api/v1/categories | Category list |
| http://localhost:5223/api/v1/products | Product list |
| http://localhost:5223/api/v1/products?flag=bestSeller | Best sellers |
| http://localhost:5223/api/v1/settings/public | Store + theme settings |

## Default admin login

Set in `server/.env`:

- `ADMIN_EMAIL` (default: `admin@tokriii.com`)
- `ADMIN_PASSWORD` (default: `admin123`)

### Admin roles & permissions

| Role | Access |
|------|--------|
| **admin** / **super_admin** | Full access to everything |
| **staff** | Only modules enabled in **Admin Permissions** |

**Super admin** can:

1. Go to **Users → User** — create staff accounts (email + password + role `staff`)
2. Go to **Users → Admin Permission** — toggle permissions per staff user:

| Permission | Controls |
|------------|----------|
| catalogView / catalogEdit | Products & categories |
| mediaManage | Image library |
| ordersView / ordersEdit | Orders |
| marketingView / marketingEdit | Coupons |
| contentView / contentEdit | Pages & reviews |
| settingsView / settingsEdit | Store settings & theme |
| usersManage | Manage other admin users |

New staff users automatically get a permission record with view-only catalog + orders access.

## Image uploads

Upload images via API:

```bash
curl -X POST http://localhost:5223/api/v1/media/upload \
  -F "file=@/path/to/image.jpg" \
  -F "folder=products"
```

Files are stored in `server/uploads/` and served at `/uploads/...`.

List media: `GET /api/v1/media`  
Delete media: `DELETE /api/v1/media/:id` (blocked if linked to a product)

## Database

MySQL database name: `tokri`

```bash
npm run db:push    # sync schema
npm run db:seed    # re-seed from frontend data files
```

## Project structure

```
server/
  prisma/schema.prisma   # MySQL models
  prisma/seed.js         # imports src/data/*.js
  src/
    admin/               # AdminJS panel
    routes/api.js        # public REST API v1
    routes/media.js      # image manager
    server.js
  uploads/               # local image storage
```

## Frontend (unchanged in Phase 1)

The Vite shop in `/src` still uses static data. Phase 2 will connect it to this API.

Run both:

```bash
# terminal 1 — API
cd server && npm run dev

# terminal 2 — shop
npm run dev
```

## Admin Logs & Monitoring

Open **Logs & Monitoring** in AdminJS. Every request reloads the operator's active
status and role; only active `admin` / `super_admin` users may view logs or change
debug logging. Customers, staff and inactive/revoked accounts cannot use controls.
New access records are separated into `website` (anonymous website visits) and
`api` (backend requests). The other daily categories are `error`, `audit`, `debug`,
`payment` and `account`; existing `access` files remain readable in Earlier access
history. Dates and the viewer use IST; stored event timestamps are
UTC ISO strings. The read-only viewer supports date/type/status/user ID/order/IP
and text filters with server-side 50/100-row pages and daily file selection.
The responsive viewer displays English summaries, approved labeled details and
Previous/Updated values directly in each row, with no collapsed details to open.
Confirmed failure reasons appear immediately below the description; missing causes
are explicitly unknown. Search matches the same readable descriptions and facts.
It never renders raw event JSON, transport paths/methods, technical event names
or internal identity references. Original masked files remain on the server.
Current names are resolved in bounded, read-only page lookups; missing amounts,
names and causes are never inferred from current payment/order state.

Debug defaults OFF and supports manual 5/15/30/60-minute activation. Its original
deadline survives restart and is never extended by restoration; expired settings
stay OFF. Controls require the AdminJS session, same-origin browser
metadata and a custom header. The control sits below the profile area and derives
its Enabled/Disabled status from the server deadline. Enable/disable events are persisted before the
control response. Payloads, credentials, SQL and raw error stacks are excluded.
Each control change journals an unconfirmed request before applying the setting,
then records its outcome. Enabling is refused if the critical intent cannot be
stored; an interrupted operation never receives an invented success outcome.

The small control file is `${LOG_DIRECTORY}.settings/.debug-settings.json`
(`server/logs.settings/.debug-settings.json` by default). Its directory must be
owned by the server user with mode 0700; the atomic, synced file uses 0600.
Filesystem notifications synchronize server processes sharing this directory;
the existing status stream updates other admin sessions. Invalid, unsafe or
expired state fails closed. Separate hosts need shared storage for these controls.
Ordinary API requests do not perform settings-file reads or writes. Log retention
does not remove the control file. No database migration is required.

Existing API records now retain allowlisted totals/counts, server-confirmed coupon
selection and safe failure classifications. No request/response body is serialized.
Explicit checkout payment failures are interpreted as failed even when HTTP is 200;
safe outcome/reason headers let optional browser diagnostics reflect that outcome
without reading sensitive response bodies. Unknown reasons are never inferred from
status codes or arbitrary provider messages. Historical log files are unchanged.
Backoffice action metadata also identifies the attempted resource/action without
storing form values. AdminJS error notices and validation responses remain Failed
even if their HTTP response is 200; a failed response never implies saved changes.

Both React Router and the Next.js root layout report committed page visits.
Queries, fragments, private order references and unknown paths are redacted;
public product/article/page/category paths are shown only after catalog checks.
Prefetches, API requests and query-only filter changes are not page visits.
Browser observations are anonymous, explicitly identified as browser-reported,
and cannot create payment or audit records. Unknown HTTP status stays unknown.

One bounded SSE connection per visible tab distributes the backend debug deadline
and generation. Streams disable compression/buffering; disable, expiry, disconnect
or hidden tabs stop optional collection. There is no frontend-only toggle or
polling loop. Debug captures navigation readiness, runtime/resource failures,
sanitized API failures/timings, cart, sign-in sessions, coupon and delivery actions.
No request/response bodies, arbitrary error messages or form values are collected.
Client batches are bounded, best effort and never retried; public ingestion has
origin checks, payload/event limits, generation checks, deduplication and rate caps.
Monitoring reads and telemetry requests do not log themselves. Historical non-audit
self-events are omitted from results without altering their files; audit history
is retained. Critical audit/payment outbox delivery is independent of debug state.

### Critical event durability

`MonitoringOutbox` stores sanitized payment/admin audit events. A bounded budget
row accounts for every retained record. Critical ORM mutations and their outbox
inserts commit in the same InnoDB transaction; rollback removes both. The Prisma
wrapper supports the model/raw queries and callback/array transactions used by
this backend, without relying on Prisma's private transaction internals. Admin
snapshots use locked reads for ordinary scalar unique keys, so concurrent price
changes retain the actual previous value. Composite-key snapshots remain best
effort. Deletion stores the deleted values in `old` and `new: null`.

Provider attempts/results and verified webhook outcomes explicitly await database
persistence. Auxiliary request-completion summaries enqueue asynchronously;
business/payment transitions have their own atomic outbox records. Account,
access, debug and error files retain the bounded asynchronous logging path.
There is no database payload containing passwords, OTPs, cookies, tokens,
signatures, provider secrets or customer contact/address data. A strict allowlist
and embedded-string redaction are applied both before persistence and on file read.

The relay polls in the background and claims rows with expiring leases. It writes
through the private file worker, syncs the file and directory, then acknowledges
in MySQL. Stable event IDs prevent repeat inserts. File replay checks exact event
IDs; bounded negative indexes avoid repeated full scans, and possible index
collisions are always verified against the actual file. Partial append tails are
repaired before retry. A crash after file sync but before acknowledgment therefore
replays once. Expired leases are recovered automatically (up to 60 seconds after
a worker crash, plus the polling interval). No file I/O is awaited by checkout.

A recovery target date is persisted before delivery, preserving the same daily
file across retries and midnight. Events older than file retention are recovered
into a current daily file, retaining their original timestamp and a `recoveredAt`
marker. Viewer date selection identifies the daily file's date.

Pending rows are never age-pruned. Acknowledged rows expire after the configured
retention, or are reclaimed first when the budget is full. File rotation/retention
and the outbox budget are separate. If outbox schema, producer capacity, byte capacity or database writes
are unavailable, checkout remains fail-open: the business mutation can succeed,
the new event is explicitly reported through sanitized emergency output, and the
panel shows enqueue failures/unavailability. Such events are **not claimed as
durable**. Existing persisted pending events remain recoverable. This finite
outbox is not an unlimited audit archive, and database availability/capacity must
be monitored. File delivery failures leave the database event pending for retry.

### Storage, permissions and rollout

Files use private mode 0600 under a 0700 directory. Generated/allowlisted filenames,
symlink rejection and public-web-root rejection protect storage. React escapes
viewer output and responses use `Cache-Control: no-store`. The outbox tables are
not registered as AdminJS resources; direct resource routes explicitly return 404.
The viewer reports backlog/retries, bytes, enqueue failures, corrupt rows, drops
and pruning. Directory access errors are explicit; debug controls remain available
to active Super Admins.

| Variable | Default | Purpose |
| --- | --- | --- |
| `LOG_DIRECTORY` | `server/logs` | Private **persistent** storage outside web roots |
| `LOG_RETENTION_DAYS` | 30 | IST daily-file retention, including today (1–365) |
| `LOG_MAX_MB` | 256 | Managed logical log-file bytes (1–10240 MB) |
| `LOG_QUEUE_LIMIT` | 2000 | Bounded ordinary file queue (10–10000) |
| `LOG_OUTBOX_ENABLED` | true | Critical durability; false is for isolated unit tests |
| `LOG_OUTBOX_DESTINATION` | tokri-server | Stable logical server/log-volume alias |
| `LOG_OUTBOX_MAX_MB` | 64 | Shared database budget: JSON bytes plus per-row allowance (1–1024 MB) |
| `LOG_OUTBOX_RETENTION_DAYS` | 7 | Retain acknowledged rows (1–90 days); pending rows survive |
| `LOG_OUTBOX_POLL_MS` | 2000 | Relay polling interval (100–60000 ms) |

Use one writer per log directory and a unique, stable destination alias per
logical persistent volume. Keep the alias unchanged across process replacement.
Instances sharing an outbox budget must use the same maximum. Limits cover managed
logical data, not filesystem block allocation or database index/tablespace overhead.
File pressure removes oldest whole files, including today's files when necessary,
and emits a pruning alert. Host filesystem administrators can still alter files.

**Approved staging rollout prerequisites:** apply the additive, idempotent
`prisma/sql/monitoring-outbox.sql` using the existing migration procedure; regenerate
Prisma Client from `prisma/schema.prisma` (`npm run db:generate`); grant the app
SELECT/INSERT/UPDATE/DELETE on the two operational tables; configure writable
persistent private storage and a stable alias. Business/outbox tables must be
InnoDB. Runtime initialization checks managed table engines and rejects unsafe
outbox durability without aborting checkout. Confirm the panel shows an available,
healthy outbox with no enqueue failures and a draining backlog before sign-off.
No startup DDL or schema synchronization occurs. No live migration has been applied.

Normal SIGTERM/SIGINT drains HTTP and producers, completes the current relay delivery,
and disconnects Prisma; remaining database rows stay pending for the next relay. Fatal
errors produce safe records and exit with status 1. Pending database rows survive
forced termination; the relay resumes after restart. Logging/DB capacity failures
are explicit rather than silently dropping critical events.

### Verification

`npm test` runs the unit/transport/storage checks; integration entries skip unless
explicitly opted in. Run the two integration suites separately with disposable
loopback MySQL databases on a nonstandard port, never the developer/live `.env`:

- `npm run test:integration`: real Chromium/AdminJS sessions, OTP registration,
  checkout, products/bulk deletion, prices, coupons, orders, settings, account creation,
  permissions and simulated gateway/webhook behavior.
- `npm run test:outbox`: use a dedicated database name containing `recovery`; its
  operational outbox is reset as a test fixture. Exercises actual SIGKILL windows,
  duplicate relays, partial-file recovery, transaction rollback, concurrent budgets,
  old pending events, missing tables and nontransactional storage engines.

Provide `MONITORING_TEST_DATABASE_URL` and a separate temporary
`MONITORING_TEST_ARTIFACTS` per suite. Import `test/helpers/isolation.js` before
application modules; it avoids live `.env` loading. `test/helpers/seed.js` creates
synthetic regression/browser fixtures. Optional `MONITORING_TEST_CHROME` overrides
`/usr/bin/google-chrome`. `MONITORING_TEST_PRISMA_CLIENT` supports an isolated client
path when needed; the latest tests use the regenerated workspace client directly.

The four existing backend regression scripts also run through that bootstrap.
The live-capable UPI script is not run. **Real Razorpay sandbox testing remains
UNVERIFIED**; provider SDK/fetch responses are simulated and external requests blocked.
Refund webhooks are observed without adding refund-execution behavior. COD QR/cash
and online state changes are conditional, producing one transition under replay.

See [latest outbox/staging report](docs/monitoring-outbox/results.txt) and its test
outputs. The [earlier monitoring review](docs/monitoring-review/results.txt) is
historical; its durable-outbox and Prisma-generation gaps are addressed by this work.

Local schema setup, COD log recovery and current verification results: [completion report](docs/monitoring-completion/RESULTS.md). For the approved staging/production rollout procedure, see [deployment runbook](docs/monitoring-completion/PRODUCTION-DEPLOYMENT.md).
