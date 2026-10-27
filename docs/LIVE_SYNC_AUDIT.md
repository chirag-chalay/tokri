# Tokriii Live Sync Audit

**Date:** 2026-10-27  
**Live Host:** Tokriii Live Production Server (`tokriii.com`)  
**Repository Root:** `/home/tokriii/htdocs/tokriii.com/tokri`  
**Current Live Branch:** `main`  
**Current Live Head Commit:** `8886427d67b82feb160f78e97bc47fa0fd873151`  
**Remote Tracking Reference:** `origin/main` (`28027dc2cdc701b2514df0953ffe37c56b4d0ac9`)  
**Sync Safety Strategy:** Dedicated sync branch `live-sync-2026-10-27` pushed to remote without touching production runtime.

---

## 1. Executive Summary

A comprehensive inspection of the Tokriii live production environment was conducted to identify all differences between the live working directory, local repository history, and the remote GitHub repository (`git@github.com:JayTyagi01/tokri.git`).

- **Total Modified Tracked Files in Working Tree:** 36
- **Total Untracked Files/Directories:** 14 top-level entries (8 source/assets/scripts, 3 docs markdown reports, 3 image/screenshot/backup artifact directories)
- **Local Unpushed Commits on `main`:** 0 (Live HEAD `8886427` is a direct ancestor of remote `origin/main` `28027dc`)
- **Remote `origin/main` Ahead:** 1 commit (`28027dc` modifying mobile app splash and update gate)
- **Remote `origin/staging` Status:** Up to date with live ancestor `e14b4c1`

---

## 2. Category Breakdown & Classification

### A. SOURCE CODE (Belongs in Git)

The following files represent legitimate, tested, active application code developed on live for dynamic delivery quotes, minimum order thresholds, responsive UI/UX bug fixes, accessibility enhancements, and product image fallback reliability.

#### Backend & Server Source
1. `server/prisma/schema.prisma` — Added `expressMinimumOrderValue` (Decimal, default 1251.00) and `firstThreeMorningEnabled` (Boolean, default true) to `Setting` model.
2. `server/src/admin/components/settings-edit.jsx` — Added UI inputs in AdminJS settings tab for Same Day minimum order value and First 3 orders free toggle.
3. `server/src/admin/settings-handlers.js` — Registered fields in allowed, number, and boolean field sets.
4. `server/src/admin/settings.js` — Registered schema properties in AdminJS settings resource.
5. `server/src/config/charges.js` — Integrated delivery setting fields into rate calculations and public config endpoints.
6. `server/src/routes/checkout.js` — Added `/api/v1/checkout/quote` endpoint for dynamic checkout calculations.
7. `server/src/services/checkout.js` — Enforced minimum order requirement for express/same-day delivery and applied delivery decisions.
8. `server/src/services/freeDelivery.js` — Scoped first-3-orders free delivery strictly to morning delivery when enabled.
9. `server/src/services/deliveryQuote.js` *(untracked)* — Core delivery decision engine calculating options, fees, savings, and minimum threshold warnings.
10. `server/scripts/apply-delivery-quote-settings.js` *(untracked)* — Schema column verification/migration script for MySQL production database.

#### Web Frontend Source & Assets
11. `src/assets/product-placeholder.svg` *(untracked)* — Reusable fallback placeholder image for products with missing/broken images.
12. `src/assets/tokri-mark.png` *(untracked)* — Tokri mark branding asset.
13. `src/components/BestSellers.jsx` — Image fallback integration and responsive card styling.
14. `src/components/BillDetails.jsx` — Dynamic delivery fee display, savings highlights, and minimum order notices.
15. `src/components/CartControl.jsx` — Accessible touch targets, loading states, and cart increment/decrement refinements.
16. `src/components/CartDrawer.jsx` — Free delivery progress bar, focus trap integration, and empty state layout.
17. `src/components/CouponBox.jsx` — Real-time error clearing on input and coupon validation UX.
18. `src/components/DeliveryAddressBar.jsx` — Delivery option selection pill styling and address layout.
19. `src/components/Header.jsx` — Responsive header overhaul, category bar, accessibility, and sticky layout.
20. `src/components/HomeCategoryFeed.jsx` — Category feed card grid, image fallback handling.
21. `src/components/ImportedFruits.jsx` — Layout and image handling.
22. `src/components/LoginPopup.jsx` — Focus trap integration and `inputMode="numeric"` for phone inputs.
23. `src/components/ProductImage.jsx` *(untracked)* — Reusable component for graceful multi-stage product image loading.
24. `src/components/SearchBox.jsx` — Search dropdown styling and image loading.
25. `src/components/SeasonalFruits.jsx` — Grid layout and responsive cards.
26. `src/components/ShopOurRange.jsx` — Range category cards and layout.
27. `src/components/account/AddressFormModal.jsx` — Numeric keyboard hints and address validation UX.
28. `src/context/CartContext.jsx` — Server-backed `/checkout/quote` state management, delivery savings, dynamic free delivery rules.
29. `src/hooks/useFocusTrap.js` *(untracked)* — Accessibility hook for modal focus management.
30. `src/index.css` — Accessibility focus utilities, modal animations, custom scrollbars, touch targets.
31. `src/lib/api.js` — Hardened `installUploadFallback()` dual-origin asset resolution (`server.tokriii.com` -> `tokriii.com` -> SVG placeholder).
32. `src/lib/delivery.js` — Removed legacy static rate computations in favor of backend quote engine.
33. `src/lib/imageFallback.js` *(untracked)* — Dual-origin image fallback helper utility.
34. `src/pages/BlogDetailPage.css` *(untracked)* — Dedicated responsive blog reading stylesheet.
35. `src/pages/BlogDetailPage.jsx` — Redesigned blog reading view with typography, share buttons, and related posts.
36. `src/pages/CartPage.jsx` — Synchronized with new delivery quote structure and bill details.
37. `src/pages/CheckoutPage.jsx` — Express minimum order value enforcement, dynamic quote calculations, and payment flow integration.
38. `src/pages/ProductDetail.jsx` — Responsive product details, gallery fallbacks, and cart actions.
39. `src/pages/ShopAllPage.jsx` — Sticky category filter pills and responsive product grid.

#### Mobile App Source
40. `tokri-mobile-go/src/context/CartContext.js` — Synced with backend `/checkout/quote` structure.
41. `tokri-mobile-go/src/lib/delivery.js` — Client delivery calculation cleanup matching web.
42. `tokri-mobile-go/src/screens/CartScreen.js` — Mobile cart screen updated for delivery savings and dynamic quotes.

#### Documentation Reports
43. `docs/TOKRIII_FRONTEND_UI_UX_BUG_REPORT.md` — Bug catalog of UI/UX audit.
44. `docs/TOKRIII_FRONTEND_UI_UX_FIX_REPORT.md` — Implementation report for UI/UX bug fixes.
45. `docs/TOKRIII_PRODUCT_IMAGE_RESTORE_REPORT.md` — Multi-origin image fallback architecture report.
46. `docs/LIVE_SYNC_AUDIT.md` — This live sync audit report.
47. `docs/LIVE_TO_GIT_SYNC_REPORT.md` — Final synchronization report.

---

### B. DATABASE-ONLY CHANGES (Cannot be synced with `git pull`)

The following state changes exist strictly inside MySQL database tables and cannot be transferred via Git commits:

1. **Schema Column Additions:**
   - Table `Setting`, Column `expressMinimumOrderValue` (`DECIMAL(10,2) NOT NULL DEFAULT 1251.00`)
   - Table `Setting`, Column `firstThreeMorningEnabled` (`TINYINT(1) NOT NULL DEFAULT 1`)
2. **Settings Row Values (`Setting` id=1):**
   - Minimum order threshold for Same Day Delivery set to `₹1251.00`.
   - First 3 morning delivery free promotion enabled.
3. **Operational Business Data:**
   - Products, stock counts, customer accounts, orders, pincode assignments, categories, and banners created or modified via AdminJS or live store transactions.
4. **Synchronization Requirement:**
   - Staging/local environments require running `node server/scripts/apply-delivery-quote-settings.js` or `npx prisma db push` to apply the two `Setting` columns, followed by updating their local admin settings. Staging/local databases must NOT be overwritten with production data.

---

### C. UPLOADED FILES (Not in Git / Outside Repo)

1. **Physical Paths:**
   - `server/uploads/blog/`
   - `server/uploads/categories/`
   - `server/uploads/general/`
   - `server/uploads/products/`
2. **Git Status:** Ignored (`.gitignore` line 21: `server/uploads/**`).
3. **Public URL Mapping:**
   - Products uploaded to live reside at `https://tokriii.com/uploads/products/`.
   - Backend links in DB reference `https://server.tokriii.com/uploads/products/`.
   - Frontend fallback in `src/lib/api.js` transparently redirects requests to `tokriii.com/uploads/products/`.
4. **Git Sync Status:**
   - `git pull` will NOT copy uploads. Media files must remain out of Git. Staging/local developers can use the public URL fallback or rsync upload directories separately if required.

---

### D. GENERATED / BUILD / TEST ARTIFACTS (Excluded from Git)

The following files are generated build outputs, test screenshots, or temporary backups and must NOT be committed to Git:

1. `server/.adminjs/bundle.js` — Generated AdminJS compiled bundle file.
2. `dist/` — Vite preview production build folder (gitignored).
3. `node_modules/` & `server/node_modules/` — Installed dependencies (gitignored).
4. `docs/image-restore/` — Screenshots captured during product image verification (PNG binary files).
5. `docs/ui-audit/` — Screenshot audit logs across viewports (PNG binary files).
6. `docs/ui-fixes/` — Screenshot comparisons and diff patches (PNG/txt/patch files).
7. `docs/live-sync-backup/` — Phase 4 pre-sync backup files created on live.

---

### E. ENVIRONMENT / SECRET FILES (Excluded from Git)

1. `.env` & `server/.env` — Ignored by `.gitignore`.
2. `.env.production` — Contains environment configuration (`VITE_API_BASE_URL`, `VITE_GA_MEASUREMENT_ID`) and working directory change (`VITE_API_PROXY_TARGET=http://127.0.0.1:5173`).
3. **Action:** Per strict safety guidelines, `.env.production` is excluded from staging and will NOT be committed. It remains intact on the live file system.

---

## 3. Remote Tracking & Branch Strategy

- **Live HEAD:** `8886427d67b82feb160f78e97bc47fa0fd873151`
- **Remote `origin/main`:** `28027dc2cdc701b2514df0953ffe37c56b4d0ac9` (ahead by 1 commit)
- **Deployment Safety:** No automated CI/CD webhooks or push-to-deploy git hooks exist. PM2 runs Node processes independently.
- **Safe Branching Mechanism:** To eliminate any possibility of non-fast-forward push conflicts or unexpected live branch switching, we stage only approved source files, create the synchronization commit, and publish to the dedicated branch:
  ```text
  live-sync-2026-10-27
  ```
  Staging and local development can then pull this branch cleanly with `git fetch` and `git merge`.
