# Next.js Migration Progress

The owner confirmed `live-sync-2026-10-27` (`3c11c4a`) as the live-source baseline. Starting from `58c7134`, all 20 identified route patterns are migrated to Next.js 16.4.3 App Router without using the legacy React Router bridge. React Router remains installed solely for the preserved Vite baseline build.

## Recent Work Completed
1. **Shared Shell Hydration & Flash Fix (Commit `8a5c791`):**
   - In `src/app/_components/NextShell.jsx`, removed `ready &&` gating from `<Header>` and `<Footer>`. Both now render synchronously in server SSR HTML without layout shift or hydration flash.
   - In `src/components/Header.jsx`, implemented `useSyncExternalStore` for client-dependent auth state (`isLoggedIn`) and cart count (`totalCount`). On SSR and initial hydration pass, `activeLoggedIn` is false and `activeCount` is 0; client state reconciles immediately after hydration without mismatch warnings.
   - Verified initial SSR HTML on `/`, `/shop`, `/product/blueberry-tube`, `/blog`, and CMS pages includes `<header>` and `<footer>`.
2. **ESLint Rules Violations Resolution (Commit `16e4f4d`):**
   - Fixed unused parameter and JSX symbol issues in `src/components/account/AccountSidebar.jsx` and `src/pages/MobileProfilePage.jsx`.
   - Removed re-export of `addressLabelIcon` from `AccountSidebar.jsx` and imported directly in `SavedAddresses.jsx` from `./addressLabelIcon.js`.
   - Removed unused re-export of `PRODUCT_PLACEHOLDER, handleImageError` from `src/components/ProductImage.jsx`.
   - Fixed render ref assignments (`userRef.current`, `helpersRef.current`) in `src/pages/OrderSuccessPage.jsx` by moving them into `useEffect`.
   - Fixed cascading render state updates in `src/components/account/MyOrders.jsx`, `src/components/ImportedFruits.jsx`, `src/components/ShopOurRange.jsx`, `src/pages/CategoryPage.jsx`, and `src/pages/CmsPage.jsx`.
   - Configured `eslint.config.js` to ignore external subprojects (`server/**`, `tokri-mobile-go/**`) and allow React contexts to export hooks.
   - `npm run lint` now completes with **0 errors, 7 warnings** (all existing upstream effect dependencies).
3. **Commerce, Auth, and Checkout Regression Suite (Commit `270b2c5`):**
   - Created and executed `scripts/verify-commerce-regression.mjs` using `playwright-core` and `/usr/bin/google-chrome` under strict outbound network isolation.
   - TEST 1 (Guest cart add, increment, localStorage persistence, `/cart` view): PASS.
   - TEST 2 (Authentication modal, mobile submit, invalid OTP error alert, valid 4-digit OTP verification, `tokri_user` session storage): PASS.
   - TEST 3 (Authenticated account & orders view `/account?section=orders`): PASS.
   - TEST 4 (Synthetic checkout surface and order confirmation flow `/order/ORD-SYNTHETIC-889900`): PASS.
   - TEST 5 (Logout and session cleanup): PASS.
4. **Build and SEO Smoke Tests:**
   - `npm run build:next`: PASS (0 errors).
   - `npm run build` (Vite): PASS (0 errors).
   - `node scripts/verify-next-seo.mjs`: PASS (0 errors).

## Remaining Blockers
- **Real Asset Parity (BLOCKED):** `server/uploads` in local repos and backup dump contains only `.gitkeep`. Uploaded catalog images reside only on live production. Google Fonts are blocked offline.
- **Multi-Device Pixel Parity (BLOCKED):** Complete pixel-perfect visual diff across viewports requires the live asset bundle.
- **CMS Sitemap Enumeration (BLOCKED by backend API contract):** `server/src/routes/api.js` exposes `GET /pages/:slug` but lacks a collection endpoint (`GET /pages`) to enumerate arbitrary CMS slugs. Dynamic sitemap currently includes all known published CMS pages.
