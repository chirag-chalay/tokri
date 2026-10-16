# Tokriii — project handoff

Read this file first. It is the source of truth for another developer (or their AI agent) to run, change, and ship Tokriii without a verbal walkthrough.

Tokriii is a fruit store: website + REST API + AdminJS CMS + Expo Android app. Customers order with OTP login, saved addresses, pincode-based delivery (Morning / Express), coupons, Razorpay or COD.

Do not invent architecture. Match existing patterns. Do not commit secrets. Do not rewrite the Vite root `README.md` (it is leftover boilerplate).

---

## 1. What lives where

Monorepo root: `/var/www/html/tokri` (this path is also how the app is often checked out on the Linux server).

| Path | What it is |
|------|------------|
| `/src` | Website storefront (React 19 + Vite 8 + Tailwind 4 + React Router 7) |
| `/server` | Node API, AdminJS, Prisma, uploads, optional storefront `dist/` host |
| `/tokri-mobile-go` | Expo SDK 57 React Native app (Play Store package `com.tokriii.app`) |
| `server/prisma/schema.prisma` | MySQL schema |
| `server/scripts/` | One-shot DB column apply scripts (production uses these more than `prisma migrate`) |
| `.env.development` / `.env.staging` / `.env.production` | Vite API base URLs (safe to read; no passwords) |
| `server/.env` | **Secrets. Never commit.** Copy from `server/.env.example` |
| `tokri-mobile-go/.env` | **Local Expo API URL. Never commit.** |
| `HANDOFF.md` | This file |

Root `package.json` is the website. Server and mobile each have their own `package.json`.

---

## 2. Live vs staging vs local

| | Website | API | Admin |
|---|---------|-----|-------|
| **Live** | https://www.tokriii.com | https://tokriii.com/api/v1 | https://www.tokriii.com/tokri-backoffice |
| **Staging** | often same host as API | https://server.tokriii.com/api/v1 | `{API origin}/tokri-backoffice` |
| **Local** | http://localhost:5222 | http://127.0.0.1:5223/api/v1 | http://127.0.0.1:5223/tokri-backoffice |

Notes that bite people:

- Production **Vite** build uses `.env.production` → `VITE_API_BASE_URL=https://tokriii.com/api/v1`.
- Staging **Vite** build uses `.env.staging` → `https://server.tokriii.com/api/v1`.
- Local Vite uses `.env.development` → `/api/v1` and proxies `/api`, `/uploads`, `/tokri-backoffice` to `http://127.0.0.1:5223`.
- Mobile **production EAS** profile hits `https://tokriii.com/api/v1`.
- Mobile **staging / development EAS** profiles hit `https://server.tokriii.com/api/v1`.
- Product images: live files are expected at `https://tokriii.com/uploads/...`. The mobile client rewrites `server.tokriii.com/uploads` to `tokriii.com/uploads` because staging Node often 404/502s uploads.
- Express serves `../dist` (website build) when `dist/index.html` exists. Live `www` may instead be Nginx → `dist/` and proxy `/api` + `/tokri-backoffice` + `/uploads` to Node.
- Node `PORT` in `server/.env.example` is `5222` on the API host; local API is usually `5223`. Vite is always `5222` locally (`vite.config.js`, `strictPort: true`).

Health check: `GET /api/v1/health`.

---

## 3. Local development

Need Node 20+, MySQL, npm.

```bash
# 1) API
cd /var/www/html/tokri/server
cp .env.example .env          # then set DATABASE_URL, PORT=5223, NODE_ENV=development
npm install
npx prisma generate
npm run db:setup              # db push + generate + seed (first time only)
npm run dev                   # http://127.0.0.1:5223

# 2) Website (new terminal)
cd /var/www/html/tokri
npm install
npm run dev                   # http://localhost:5222  (proxies API)

# 3) Mobile (optional, new terminal)
cd /var/www/html/tokri/tokri-mobile-go
cp .env.example .env          # EXPO_PUBLIC_API_BASE_URL=https://server.tokriii.com/api/v1 or local
npm install
npm start                     # Expo Go / tunnel
```

Default admin (override in `server/.env`): `ADMIN_EMAIL` / `ADMIN_PASSWORD`. Change these on any public server.

Website cart is localStorage (`tokri_cart_v1`). Logged-in website still talks to API for addresses, coupons, checkout. Mobile cart is AsyncStorage plus server cart when logged in.

---

## 4. Environment variables

### Website (root)

| File | Used when | Key |
|------|-----------|-----|
| `.env.development` | `npm run dev` | `VITE_API_BASE_URL=/api/v1`, `VITE_API_PROXY_TARGET=http://127.0.0.1:5223` |
| `.env.staging` | `vite build --mode staging` | `VITE_API_BASE_URL=https://server.tokriii.com/api/v1` |
| `.env.production` | `npm run build` (default mode) | `VITE_API_BASE_URL=https://tokriii.com/api/v1` |

### API (`server/.env`)

See `server/.env.example`. Required for a working shop:

- `DATABASE_URL` — MySQL, URL-encode `@` in passwords as `%40`
- `PORT`, `NODE_ENV`
- `APP_URL`, `CLIENT_URL`, `API_URL`, `PUBLIC_ASSET_URL`
- `ADMIN_PATH=/tokri-backoffice`
- `TRUST_PROXY=true` behind Nginx
- `SESSION_SECRET`, `JWT_SECRET`
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` (admin Settings can also store keys)
- MSG91 vars (admin Settings → Notifications can override)

Never paste real keys into git, chat, or this file.

### Mobile (`tokri-mobile-go/.env`)

`EXPO_PUBLIC_API_BASE_URL` only. EAS profiles inject this at build time (`tokri-mobile-go/eas.json`). `app.config.js` / `src/config.js` fall back to live API if env is empty.

---

## 5. Database

MySQL database name is typically `tokri`. **There is no `prisma/migrations` folder.** Schema lives in `server/prisma/schema.prisma`.

On a **fresh** machine:

```bash
cd server
npx prisma generate
npx prisma db push
node prisma/seed.js
```

On **staging/live** (already has data): **do not** blindly `db push` if you do not know the drift. Prefer the matching apply script, then `npx prisma generate`, then restart Node.

| Script (`server/package.json`) | Purpose |
|--------------------------------|---------|
| `npm run db:apply-delivery-options` | Morning/express Setting columns, pincode flags, `Order.deliveryOption` |
| `npm run db:apply-delivery` | Older delivery/pincode work |
| `npm run db:apply-customers` | Customer tables |
| `npm run db:apply-commerce` | Commerce settings |
| `npm run db:apply-product-categories` | Product ↔ category M2M |
| `npm run db:apply-msg91` | MSG91 columns |
| `npm run db:apply-home` | Home banner fields |
| `npm run db:apply-category-display-limit` | Category product cap |
| `npm run db:apply-partner-kyc` | Delivery partner KYC |

After **this** delivery-options work, every environment that will run the new checkout **must** have run:

```bash
cd /var/www/html/tokri/server
node scripts/apply-delivery-options.js
npx prisma generate
```

Then restart the Node process. If the script was not run, API/admin will error on missing columns.

Core models: `User`, `Customer`, `Category`, `Product`, `ProductCategory`, `Media`, `Coupon`, `Order`, `OrderItem`, `Setting` (singleton `id = 1`), `ServiceablePincode` (`morningEnabled`, `expressEnabled`), `Cart` / `CartItem`, `OtpRequest`, `DeliveryPartner`, `Page`, `Review`.

---

## 6. API surface (prefix `/api/v1`)

Mounted in `server/src/server.js`. JSON body parser is **after** AdminJS.

| Area | Router | Notes |
|------|--------|-------|
| Health, catalog, settings, geo | `server/src/routes/api.js` | Public products/categories/pages |
| Bootstrap | `GET /app/bootstrap` | Mobile + website cart charges, home data, nested `charges.delivery` |
| Auth | `/auth` | OTP login |
| Account | `/account` | Profile, addresses, orders |
| Checkout | `/checkout` | `GET /config`, create-order, coupon preview, COD, Razorpay, UPI |
| Media | `/media` | Uploads → `server/uploads/` |
| Partner | `/partner` | Delivery partner app/API |
| Razorpay webhook | `POST /api/v1/webhooks/razorpay` | Raw body, **before** json parser |

Auth: customer JWT (`Authorization: Bearer`). Website also sends `X-User-Phone` in CORS allowlist.

Delivery math is **server-side** in `server/src/config/charges.js` (`getChargeRates`, `deliveryChargeFor`, `publicDeliveryConfig`). Clients mirror it for UI:

- Website: `src/lib/delivery.js`, `src/context/CartContext.jsx`
- App: `tokri-mobile-go/src/lib/delivery.js`, `tokri-mobile-go/src/context/CartContext.js`

Admin **Settings → Charges** edits titles, shipping fee, free-above (0 = no free delivery), handling. Per-pincode Morning / Express toggles are on **Serviceable PIN** edit. Checkout radios: Morning selected when enabled for the PIN; disabled option shows “coming soon”.

Fallback hardcoded morning fee is still **₹25** in client defaults. If bootstrap fails or the app binary is old, the app shows 25 even when admin says 49. OTA updates are **off** (`updates.enabled: false` in `app.config.js`), so Play Store users only get JS changes after a **new APK**.

---

## 7. Website (`/src`)

Entry: `src/main.jsx` → `src/App.jsx`.

Routes: `/`, `/shop`, `/product/:productId`, `/cart`, `/checkout`, `/account`, `/login`, `/profile`, CMS pages (`/about`, `/privacy-policy`, …). Old `/category/:id` redirects to `/shop?category=`.

Layout:

- Desktop cart/checkout use `max-w-7xl` (same content width as home sections).
- Mobile cart is a separate view in `CartPage.jsx` (`lg:hidden`). Do not restyle app zigzag into the website, and do not strip app zigzag when changing web.
- Sticky cart bar is hidden on `/cart` and `/checkout`.
- Theme: dark greens in `src/index.css` `@theme`.

Providers: `AuthContext` → `AddressContext` → `CartContext`.

Checkout default payment is **Pay online** when Razorpay is enabled.

---

## 8. Admin (AdminJS)

Code: `server/src/admin/`. Custom React components are bundled; after editing them, restart Node (and rebuild admin bundle if the project’s admin build step is used).

Important resources: Products, Categories, Media, Orders, Coupons, Pages, Reviews, Settings (Charges tab), Serviceable pincodes (no “state” column on the list; toggles on edit), Customers, Users / permissions, Delivery partners.

Staff vs admin vs super_admin: see `server/README.md`. Do not log people out by navigating Settings incorrectly; session cookie is path-scoped to `ADMIN_PATH`.

### Catalog CSV / Excel (products + categories)

On **Products** and **Categories** list pages: **Export CSV**, **Export Excel**, **Import**. Import accepts `.csv` and `.xlsx` (not old `.xls`).

Daily price update:

1. Admin → Products → Export Excel (or CSV)
2. Edit `priceValue` (selling price). Optional: `oldPriceValue` (MRP / strike price)
3. **Do not change `slug`** — import matches existing products by slug
4. Import the same file. Result should say `updated`, not `added`

Code: `server/src/services/catalogImportExport.js`, routes `server/src/admin/catalogRoutes.js`.

---

## 9. Mobile app (`/tokri-mobile-go`)

Expo config is **`app.config.js`**, not `app.json`.

| Field | Current (this Play upload) | Where |
|-------|----------------------------|--------|
| `version` | `1.0.4` | `app.config.js` → `expo.version` (user-facing) |
| `android.versionCode` | `7` | `app.config.js` → `android.versionCode` (Play **must** increase every upload) |
| `ios.buildNumber` | `7` | `app.config.js` → `ios.buildNumber` |
| `appVersionSource` | `local` | `eas.json` → `cli.appVersionSource` |

Play review currently has `1.0.3` / versionCode `6`. This repo is bumped to `1.0.4` / `7` for the next build. Do not upload a new Android file over the one already in review. The friend who publishes on Google Play builds with EAS using **local** versions from git (not EAS remote auto-increment). Do **not** set `appVersionSource` back to `remote`. Do **not** turn `production.autoIncrement` back on unless they ask.

Package: `com.tokriii.app`. Staging variant: `com.tokriii.app.staging` when `APP_VARIANT=staging`.

EAS profiles (`eas.json`):

```bash
cd tokri-mobile-go
npx eas-cli login
npx eas-cli build -p android --profile staging      # internal APK → staging API
npx eas-cli build -p android --profile production   # Play / live API https://tokriii.com/api/v1
```

After each Play upload, bump **before the next push**:

1. `version` 1.0.4 → 1.0.5 (or whatever the publisher wants)
2. `versionCode` 7 → 8 and `ios.buildNumber` to the same number
3. Keep `appVersionSource: "local"`

Expo Go is fine for UI. Payments / UPI / some native plugins need a dev or production client.

Tabs: Home, Reorder, Shop, Cart, Account. Cart has delivery option radios + bill details (zigzag savings strip is **app-only**; do not remove it unless asked).

---

## 10. Push code to git, then server, then live

Typical order: **commit → push git → pull on staging server → apply DB if needed → install/build/restart → smoke test → repeat on live**.

There is no Docker / PM2 file in the repo. On the server, Node is a long-running process (often systemd/PM2/Nginx). Find it with `ss -tlnp | grep 5222` or `pm2 ls` / `systemctl`. Restart **that** process after code + `prisma generate`.

### A. Git

```bash
cd /var/www/html/tokri
git status
# do not add: server/.env, tokri-mobile-go/.env, server/uploads/*, *.sql, node_modules, dist
git add -A
git commit -m "Your message"
git push
```

Only commit when the owner asks, unless they already asked you to ship.

### B. Staging (`server.tokriii.com`)

On the staging machine (often this repo path):

```bash
cd /var/www/html/tokri
git pull

# website
npm install
npm run build -- --mode staging    # writes dist/ from .env.staging

# api
cd server
npm install
npx prisma generate
# if this release includes delivery-option columns and staging DB is old:
node scripts/apply-delivery-options.js
# restart Node (example; use the real process manager)
# pm2 restart tokri-server
```

Smoke:

- https://server.tokriii.com/api/v1/health
- Admin Charges tab shows Morning / Express
- Staging website cart/checkout show admin fees, not ₹25
- Place a test order if credentials exist

### C. Live (`tokriii.com` / `www.tokriii.com`)

Same steps, but website build is production:

```bash
cd /var/www/html/tokri
git pull
npm install
npm run build                 # uses .env.production → https://tokriii.com/api/v1

cd server
npm install
npx prisma generate
node scripts/apply-delivery-options.js   # once per environment, skip if already applied
# restart live Node
```

If live website is a **separate** www host: copy/sync `dist/` there and reload Nginx. If live API is a **separate** host: pull `server/` there, generate Prisma, restart Node, keep `PUBLIC_ASSET_URL` / `APP_URL` / `CLIENT_URL` pointing at the live hosts. Uploads directory `server/uploads` must persist (it is gitignored).

Live smoke:

- https://tokriii.com/api/v1/health
- https://www.tokriii.com/ cart + checkout width matches home (`max-w-7xl`)
- Delivery fee matches Admin Charges (Morning 49 / free above 499 in current admin screenshot era — **read live admin**, do not hardcode)
- Admin still logs in at `/tokri-backoffice`

### D. Play Store APK (separate from website deploy)

Website/API live ≠ app update. Because Expo Updates are disabled, Google Play needs a new AAB/APK from the friend:

```bash
cd tokri-mobile-go
# confirm version 1.0.4 and versionCode 7 (or the next bump)
npx eas-cli build -p android --profile production
```

They upload the artifact in Play Console. Until that ships, phones can still show old ₹25 delivery.

---

## 11. Important product rules (do not “clean up”)

- **freeAbove = 0** means free delivery is **off**, not “always free”.
- Delivery option is stored on `Order.deliveryOption` (`morning` | `express`).
- Website cart/drawer were historically out of scope for some UI nudges; cart bill is `src/components/BillDetails.jsx`.
- Do not change **mobile** zigzag / savings decoration when asked to change **web**, and vice versa.
- Do not dump `.env` secrets, Razorpay keys, or JWT secrets in tickets or commits.
- Do not run destructive git (`push --force`, `reset --hard`) unless the owner explicitly asks.
- Prisma: prefer `scripts/apply-*.js` on existing production DBs.

---

## 12. How an AI agent should work in this repo

1. Read this file and the files you will touch. Do not trust root `README.md`.
2. Website UI changes: verify in the browser on the affected routes (`/`, `/cart`, `/checkout`, `/shop`) at both desktop and mobile breakpoints when layout/state is involved.
3. Delivery/charges: change `server/src/config/charges.js` + admin Settings + both client `lib/delivery.js` copies if logic changes. Keep them aligned.
4. Schema change: update `schema.prisma`, add or extend an apply script, run it on each environment, `prisma generate`, restart API.
5. Mobile Play release: bump `version` + `versionCode`, keep `appVersionSource: "local"`, tell the Play uploader.
6. After server deploy: hit `/api/v1/health` and one checkout path.

---

## 13. File map (high traffic)

```
src/pages/CartPage.jsx              Website cart (mobile + desktop)
src/pages/CheckoutPage.jsx          Website checkout
src/components/BillDetails.jsx      Website bill + savings (no zigzag)
src/context/CartContext.jsx         Website cart + delivery rates from bootstrap
src/lib/delivery.js                 Website delivery math
server/src/config/charges.js        Source of truth for fees
server/src/admin/components/settings-edit.jsx   Charges UI
server/src/admin/components/pincode-edit.jsx    Per-PIN morning/express
server/src/routes/app.js            GET /app/bootstrap
server/src/services/checkout.js     Orders, Razorpay, COD
server/scripts/apply-delivery-options.js
tokri-mobile-go/app.config.js       version + versionCode
tokri-mobile-go/eas.json            appVersionSource + EAS profiles
tokri-mobile-go/src/screens/CartScreen.js
tokri-mobile-go/src/context/CartContext.js
tokri-mobile-go/src/lib/delivery.js
```

If something in this file disagrees with running code, **code wins** — update this file in the same PR.
