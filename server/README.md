# Tokriii API Server

Express + Prisma + MySQL + AdminJS backend for the Tokriii storefront and future mobile app.

## Quick start

```bash
# From project root
cd server
cp .env.example .env   # edit DATABASE_URL if needed
npm install
npm run db:setup       # create tables + seed data
npm run dev            # API on http://localhost:5223 (see .env)
```

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
# Website frontend diagnostics

The website loads `public/frontend-errors.js` before hydration in Next.js and
before the Vite entrypoint. It captures uncaught JavaScript errors, unhandled
promise rejections, `console.error` (including React errors), failed resources,
fetch failures/HTTP errors and XHR failures/HTTP errors. Admin and partner pages
are excluded. Backend application errors are not added to this log.

`POST /api/v1/frontend-errors` accepts batches only from exact origins in
`CORS_ORIGINS` (or the configured client/app URL defaults). Errors are written to
`server/logs/website-frontend-errors.jsonl`, or `FRONTEND_ERROR_LOG_DIR`, with private
file permissions. Three rotated archives retain at most about 20 MiB in total.
This directory must remain outside any public web root mapping.

The collector strips URL queries/fragments, credentials, sensitive route IDs,
common email/phone patterns and unrecognized fields. The browser does not send
cookies, storage contents, arbitrary console objects or request/response bodies.
Messages still require care: free-form text redaction cannot identify every kind
of personal data. Browser deduplication, bounded queues, a 60-event/minute budget,
server request limits and a 32 KiB body limit prevent error storms from growing
without bounds. Failed deliveries are dropped without retries. Browser crashes,
offline errors, blocked scripts and cross-origin stack details may not be captured.

Inspect locally with `tail -f server/logs/website-frontend-errors.jsonl` from the
repository root. Logs are not served through an unauthenticated viewer.

Meta Pixel defaults to disabled to isolate the recursive remote EST PageView
rule `1653918566377185` on pixel `891089060757681`. Keep it disabled until the Meta
account owner removes that rule and verifies the refreshed remote configuration.
Then opt in using `TOKRIII_META_PIXEL_ENABLED=true` for Next.js or
`VITE_META_PIXEL_ENABLED=true` for Vite, rebuild and restart the relevant website
process. Consent is still required after enabling. The Next no-script beacon uses
the same switch; keep the build and runtime setting consistent. Deploying these
source changes requires rebuilding the website and restarting the API collector.
Existing shopper cookies/caches do not need to be cleared.

Validation:

```sh
node scripts/verify-meta-pixel.mjs
node --test scripts/verify-meta-pixel-recovery.mjs server/tests/frontend-errors.test.js
VERIFY_BUILD_DIR=/tmp/tokri-frontend-verify-... node scripts/verify-frontend-recovery.mjs
```

The browser check uses an isolated Next production build on ports 5341/5342,
production-origin browser routing and public staging GET data. It does not write
customer/order data or modify the live Meta configuration. Set `CHROME_PATH` and
the browser library path if required on the test machine.
