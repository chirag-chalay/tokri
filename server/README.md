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
