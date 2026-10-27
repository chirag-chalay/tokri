# Tokriii Live → Git Sync Report

**Generated:** 2026-10-27  
**Website:** https://tokriii.com/  
**Repository Path:** `/home/tokriii/htdocs/tokriii.com/tokri`  

---

## 1. LIVE STATE BEFORE SYNC

- **Branch:** `main`
- **Commit:** `8886427d67b82feb160f78e97bc47fa0fd873151` (`Merge branch 'staging'`)
- **Remote:** `git@github.com:JayTyagi01/tokri.git` (tracked as `origin`)
- **Remote HEAD (`origin/main`):** `28027dc2cdc701b2514df0953ffe37c56b4d0ac9` (1 mobile-only commit ahead)
- **Working Tree:** 36 modified tracked files, 14 untracked paths (uncommitted live work spanning dynamic delivery quoting, minimum express order value, UI/UX accessibility bug fixes, and dual-origin product image fallback)

---

## 2. LIVE SOURCE FILE CHANGES

| File | Status | Included in Git | Reason |
| :--- | :--- | :--- | :--- |
| `server/prisma/schema.prisma` | Modified | YES | Added `expressMinimumOrderValue` and `firstThreeMorningEnabled` to `Setting` model |
| `server/src/admin/components/settings-edit.jsx` | Modified | YES | Added UI inputs in AdminJS settings tab for express minimum order value and promo flag |
| `server/src/admin/settings-handlers.js` | Modified | YES | Added express setting keys to allowed, numeric, and boolean schema handlers |
| `server/src/admin/settings.js` | Modified | YES | Registered express settings properties in AdminJS resource definition |
| `server/src/config/charges.js` | Modified | YES | Parsed and exposed new delivery settings in backend rates calculation and public config |
| `server/src/routes/checkout.js` | Modified | YES | Added `/api/v1/checkout/quote` endpoint for dynamic real-time delivery quote calculations |
| `server/src/services/checkout.js` | Modified | YES | Enforced express delivery minimum order threshold and integrated delivery quote engine |
| `server/src/services/freeDelivery.js` | Modified | YES | Scoped account-level first 3 orders free delivery strictly to Morning Delivery |
| `server/src/services/deliveryQuote.js` | Untracked (New) | YES | Core delivery quote calculation engine for fees, savings, and minimum threshold checks |
| `server/scripts/apply-delivery-quote-settings.js` | Untracked (New) | YES | Database migration helper script adding missing `Setting` columns in MySQL |
| `src/assets/product-placeholder.svg` | Untracked (New) | YES | Reusable SVG fallback image for products with missing or broken image URLs |
| `src/assets/tokri-mark.png` | Untracked (New) | YES | Branding mark icon asset used in header and blog views |
| `src/components/BestSellers.jsx` | Modified | YES | Updated product image fallback integration and responsive card styling |
| `src/components/BillDetails.jsx` | Modified | YES | Displays dynamic delivery fee, savings highlights, and express minimum order notices |
| `src/components/CartControl.jsx` | Modified | YES | Accessible buttons, touch targets, loading states, and cart increment/decrement UX |
| `src/components/CartDrawer.jsx` | Modified | YES | Free delivery progress bar, focus trap integration, and empty state layout |
| `src/components/CouponBox.jsx` | Modified | YES | Real-time coupon error clearing on typing and coupon validation UX |
| `src/components/DeliveryAddressBar.jsx` | Modified | YES | Delivery option selection pill styling and address layout |
| `src/components/Header.jsx` | Modified | YES | Responsive header overhaul, category navigation bar, and accessibility improvements |
| `src/components/HomeCategoryFeed.jsx` | Modified | YES | Category feed card grid, touch responsiveness, and image fallback handling |
| `src/components/ImportedFruits.jsx` | Modified | YES | Product feed card layout and image handling |
| `src/components/LoginPopup.jsx` | Modified | YES | Focus trap integration and `inputMode="numeric"` keyboard hints for phone inputs |
| `src/components/ProductImage.jsx` | Untracked (New) | YES | Reusable component for graceful multi-stage product image loading and fallback |
| `src/components/SearchBox.jsx` | Modified | YES | Search dropdown styling, keyboard handling, and image display |
| `src/components/SeasonalFruits.jsx` | Modified | YES | Grid layout and responsive product card presentation |
| `src/components/ShopOurRange.jsx` | Modified | YES | Category card presentation and image handling |
| `src/components/account/AddressFormModal.jsx` | Modified | YES | Numeric keyboard hints and address validation UX |
| `src/context/CartContext.jsx` | Modified | YES | Server-backed `/checkout/quote` integration, dynamic delivery savings, and promo logic |
| `src/hooks/useFocusTrap.js` | Untracked (New) | YES | Accessibility hook for modal focus trapping (WCAG compliant) |
| `src/index.css` | Modified | YES | Focus ring utilities, modal animations, custom scrollbars, and touch target rules |
| `src/lib/api.js` | Modified | YES | Hardened `installUploadFallback()` dual-origin asset resolution (`server.tokriii.com` -> `tokriii.com` -> SVG) |
| `src/lib/delivery.js` | Modified | YES | Deprecated legacy client-side rate computations in favor of backend quote API |
| `src/lib/imageFallback.js` | Untracked (New) | YES | Multi-origin image fallback helper utility |
| `src/pages/BlogDetailPage.css` | Untracked (New) | YES | Dedicated responsive blog reading stylesheet |
| `src/pages/BlogDetailPage.jsx` | Modified | YES | Redesigned blog post reader with enhanced typography, share buttons, and related posts |
| `src/pages/CartPage.jsx` | Modified | YES | Synchronized with dynamic delivery quote structure and bill details |
| `src/pages/CheckoutPage.jsx` | Modified | YES | Express minimum order value enforcement, dynamic quote calculations, and payment flow |
| `src/pages/ProductDetail.jsx` | Modified | YES | Responsive product details, gallery fallbacks, and add-to-cart UX |
| `src/pages/ShopAllPage.jsx` | Modified | YES | Sticky category filter pills and responsive product grid |
| `tokri-mobile-go/src/context/CartContext.js` | Modified | YES | Synced mobile app context with backend `/checkout/quote` API |
| `tokri-mobile-go/src/lib/delivery.js` | Modified | YES | Cleaned up mobile delivery calculation matching web frontend |
| `tokri-mobile-go/src/screens/CartScreen.js` | Modified | YES | Updated mobile cart screen for dynamic delivery savings and minimum order notices |
| `docs/TOKRIII_FRONTEND_UI_UX_BUG_REPORT.md` | Untracked (New) | YES | Documentation catalog of frontend UI/UX audit |
| `docs/TOKRIII_FRONTEND_UI_UX_FIX_REPORT.md` | Untracked (New) | YES | Documentation implementation report for UI/UX bug fixes |
| `docs/TOKRIII_PRODUCT_IMAGE_RESTORE_REPORT.md` | Untracked (New) | YES | Documentation report on multi-origin image fallback architecture |
| `docs/LIVE_SYNC_AUDIT.md` | Untracked (New) | YES | Comprehensive audit report generated during Phase 3 |

---

## 3. LIVE-ONLY COMMITS

| Commit | Pushed | Branch | Notes |
| :--- | :--- | :--- | :--- |
| `7684b0d` | YES | `live-sync-2026-10-27` | "Sync verified production delivery rules, UI/UX fixes, and image fallback" |

*Note on remote commit:* `origin/main` has 1 commit (`28027dc` "changes in splash screen and auto update") authored on Oct 21 touching only mobile app config/splash. It does not conflict with our synced web and backend files.

---

## 4. DATABASE-ONLY CHANGES

The following live database changes CANNOT be synchronized through Git and exist solely in the MySQL database:

1. **Table Schema Updates:**
   - Table: `Setting`
   - Added column: `expressMinimumOrderValue` (`DECIMAL(10,2) NOT NULL DEFAULT 1251.00`)
   - Added column: `firstThreeMorningEnabled` (`TINYINT(1) NOT NULL DEFAULT 1`)
2. **Settings Row Values (`Setting` id=1):**
   - Same Day Delivery minimum order value configured to `₹1251.00`.
   - First 3 morning delivery orders free configured to `true`.
3. **Operational Catalog & Business Data:**
   - Live products, descriptions, active prices, inventory, categories, coupons, and orders.
4. **How Staging / Local Should Synchronize Schema:**
   - Run the migration helper script:
     ```bash
     node server/scripts/apply-delivery-quote-settings.js
     ```
   - Alternatively:
     ```bash
     cd server && npx prisma db push
     ```
   - Do NOT dump or restore live customer or order data to staging or local development.

---

## 5. UPLOAD / MEDIA CHANGES

- **Physical Upload Locations:**
  - `server/uploads/blog/`
  - `server/uploads/categories/`
  - `server/uploads/general/`
  - `server/uploads/products/`
- **Git Tracking Status:**
  - Explicitly ignored in `.gitignore` (line 21: `server/uploads/**`).
- **Live Serving Architecture:**
  - Product images are hosted under `https://tokriii.com/uploads/products/`.
  - Backend API records store URLs prefixed with `https://server.tokriii.com/uploads/products/`.
  - Frontend fallback listener in `src/lib/api.js` transparently fetches from `tokriii.com/uploads/products/` if `server.tokriii.com` returns 404, with a final fallback to `product-placeholder.svg`.
- **Sync Notice:**
  - UPLOADS ARE NOT VERSION-CONTROLLED. `git pull` will NOT copy these files. Staging and local environments can rely on the automatic fallback to production URLs or rsync `/uploads/` out-of-band if local offline media testing is required.

---

## 6. IGNORED / GENERATED FILES

The following files were identified on live and intentionally NOT committed to Git:

1. `.env.production` — Environment configuration file (contains `VITE_API_PROXY_TARGET=http://127.0.0.1:5173`; credentials/env files are protected and never committed).
2. `server/.adminjs/bundle.js` — AdminJS dynamically generated client bundle.
3. `dist/` — Vite production build directory (gitignored).
4. `node_modules/` & `server/node_modules/` — Node runtime packages (gitignored).
5. `docs/image-restore/` — Screenshot verification assets (PNGs).
6. `docs/ui-audit/` — Screenshot audit assets (PNGs).
7. `docs/ui-fixes/` — Before/after comparison screenshots and rollback patches.
8. `docs/live-sync-backup/` — Pre-sync difference backup files created in Phase 4.

---

## 7. REMOTE SYNC RESULT

- **Synchronization Branch Created & Pushed:** `live-sync-2026-10-27`
- **Remote Repository:** `git@github.com:JayTyagi01/tokri.git` (redirects to `git@github.com:chirag-chalay/tokri.git`)
- **Synced Commit Hash:** `7684b0d46d0a7a005086d06179ce0fa25e4c02fc`
- **Push Status:** SUCCESS (Pushed without `--force` or `--force-with-lease`)
- **Pull Request URL:** https://github.com/chirag-chalay/tokri/pull/new/live-sync-2026-10-27

---

## 8. STAGING SYNC COMMANDS

To pull all live source-code changes into the staging environment:

```bash
# 1. Fetch the latest branches from origin
git fetch origin

# 2. Switch to your staging branch
git checkout staging

# 3. Merge the verified live synchronization branch
git merge origin/live-sync-2026-10-27

# 4. Apply database schema changes (adds expressMinimumOrderValue and firstThreeMorningEnabled)
node server/scripts/apply-delivery-quote-settings.js

# 5. Push staging to remote
git push origin staging
```

---

## 9. LOCAL DEVELOPMENT SYNC COMMANDS

For developers working locally or on another machine:

```bash
# 1. Fetch latest changes
git fetch origin

# 2. Switch to your feature or working branch (e.g. main or staging)
git checkout main

# 3. Merge the live sync branch
git merge origin/live-sync-2026-10-27

# 4. Update Prisma client and database columns locally
node server/scripts/apply-delivery-quote-settings.js
cd server && npx prisma generate && cd ..

# 5. Build/run development server normally
npm run build
```

---

## 10. LIVE VERIFICATION

All checks performed directly against the production website after commit and push:

| Check | Result | HTTP Status / Observation |
| :--- | :--- | :--- |
| **Homepage** | PASS | HTTP 200 OK — Header, banners, category cards rendering cleanly |
| **Shop** | PASS | HTTP 200 OK — Sticky filter pills, responsive product grid intact |
| **Product pages** | PASS | HTTP 200 OK (`/product/date-crown`) — Product details, pricing, gallery loading |
| **Images** | PASS | HTTP 200 OK — WebP product imagery loaded with fallback safety intact |
| **Cart** | PASS | HTTP 200 OK (`/cart`) — Dynamic delivery fee quote and bill summary verified |
| **Checkout** | PASS | HTTP 200 OK (`/checkout`) — API quote calculation and minimum threshold logic verified |
| **Login** | PASS | HTTP 200 OK (`/login`) — Numeric keyboard input and focus trap verified |
| **Blog** | PASS | HTTP 200 OK (`/blog`) — Blog reader and responsive layout verified |
| **Mobile** | PASS | PASS — Tested with iPhone mobile User-Agent; HTTP 200 OK |
| **Desktop** | PASS | PASS — Tested with Desktop User-Agent; HTTP 200 OK |
| **PM2 Runtime** | PASS | Both `tokri-server` (PID 0) and `tokri-frontend` (PID 1) online with 0 restarts |
