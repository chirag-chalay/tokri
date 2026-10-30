# Tokriii Next.js Migration — Final QA Report

## Executive Summary
This document provides the final engineering and QA assessment for the Tokriii storefront migration from React 19 + Vite 8 to Next.js 16.4.3 (App Router).

The migration achieves full route independence from the React Router bridge, synchronous SSR of public catalog, product, blog, and CMS pages, zero layout flash or hydration mismatch on the shared chrome, zero ESLint errors, and full passage of automated commerce, authentication, and checkout regressions under strict network isolation.

---

## 1. Environment & Baseline
- **Verified Live-Source Baseline:** `/home/gaurav/Documents/tokriii-live-baseline` (Git commit `3c11c4a`, confirmed by owner).
- **Untouched Local React Repo:** `/home/gaurav/Documents/tokri` (preserved without overwriting local changes).
- **Migration Worktree:** `/home/gaurav/Documents/tokriii-nextjs`
- **Active Feature Branch:** `feature/tokriii-react-to-nextjs`
- **Starting Commit:** `58c7134797d686d74655d3f5773a91f632b35ad4` (`58c7134`)
- **Isolated Local Database:** `tokri_live_local` on `127.0.0.1:3307` (restored from compressed dump `chirag-live-20261029T085327Z.sql.gz`).
- **Read-Only Local Express API:** Port `5223` wrapped with network isolation hook preventing outbound network connections.
- **Next.js Production Host:** `http://127.0.0.1:3000`

---

## 2. Commit Log (Current Batch)
1. `8a5c791`: `fix: render stable shell chrome during SSR and isolate client state`
   - Removed `ready &&` from wrapping Header and Footer in `src/app/_components/NextShell.jsx`.
   - Implemented `useSyncExternalStore` for client auth state and cart counter in `src/components/Header.jsx` to render initial SSR HTML synchronously and reconcile client state cleanly.
2. `16e4f4d`: `fix: resolve ESLint rules violations in account, order, profile and catalog components`
   - Fixed unused variables, unhandled JSX symbol imports, and re-export violations in account and image components.
   - Fixed render ref mutations in `OrderSuccessPage.jsx`.
   - Fixed cascading state updates in catalog and account effects.
   - Configured `eslint.config.js` to ignore external subprojects and support context hook exports.
3. `270b2c5`: `test: add isolated headless commerce, auth and checkout regression suite`
   - Implemented `scripts/verify-commerce-regression.mjs` with Playwright covering guest cart, OTP authentication, account orders, synthetic checkout, and session cleanup under complete outbound network isolation.

---

## 3. QA Results Matrix

| QA Test Suite | Command | Result | Details |
| --- | --- | --- | --- |
| **Next.js Production Build** | `npm run build:next` | **PASS** | 20 App Router routes compiled; 0 errors |
| **Vite Production Build** | `npm run build` | **PASS** | Original baseline build preserved; 0 errors |
| **ESLint Static Analysis** | `npm run lint` | **PASS** | 0 errors, 7 pre-existing upstream warnings |
| **SEO & SSR Verification** | `node scripts/verify-next-seo.mjs` | **PASS** | SSR initial HTML, dynamic metadata, canonicals, JSON-LD, robots, dynamic sitemap |
| **Hydration & Shell Stability** | Chrome Headless Audit | **PASS** | 0 React hydration mismatch warnings; synchronous header/footer rendering |
| **Commerce & Auth Regressions** | `node scripts/verify-commerce-regression.mjs` | **PASS** | 5 test suites passed: cart add/persist, OTP modal & session, orders, synthetic COD checkout, logout |
| **Real Asset Parity** | Local asset inspection | **BLOCKED** | Uploaded catalog images and Google Fonts are unavailable locally |
| **Multi-Device Pixel Parity** | Viewport screenshot comparison | **BLOCKED** | Blocked due to missing remote upload files |

---

## 4. Resolution of Prior Issues

### Issue 1: Shared Shell Hydration Flash
- **Root Cause:** `<Header>` and `<Footer>` in `NextShell.jsx` were conditioned on `ready &&`. This caused initial SSR HTML to lack header and footer elements, popping into the DOM after client hydration.
- **Solution:** Removed `ready &&` condition from `<Header>` and `<Footer>`. In `Header.jsx`, replaced raw `localStorage` reads with `useSyncExternalStore`, rendering static guest state on SSR and updating cleanly on client.
- **Verification:** Initial curl of `/` confirms `<header>` and `<footer>` are in SSR HTML. Headless Chrome confirms 0 hydration mismatch errors.

### Issue 2: Homepage Viewport Diffs
- **Investigation:** Diffs in 1440px and 768px viewports were determined to be subpixel antialiasing/rasterization variance (<70 px out of >1.2M px). A previous 89,945 px diff was traced to unblocked external image requests in the initial Vite baseline test fetching live production thumbnails, whereas Next.js correctly aborted external requests and displayed fallbacks.
- **Status:** Layout structures and Tailwind class hierarchies match 100%.

### Issue 3: Missing Catalog Upload Assets
- **Investigation:** Verified `server/uploads` in all local git repositories and `/home/gaurav/.local/share/tokriii-migration-backups/tokri-20261028-224733.tar.gz`. Only stub directories containing `.gitkeep` exist locally.
- **Status:** **BLOCKED**. Real catalog image parity cannot be tested offline without production media files.

### Issue 4: Remote Web Fonts Offline
- **Investigation:** Storefront uses Google Font `Plus Jakarta Sans`. In network-isolated test runs, outbound requests to `fonts.googleapis.com` are intentionally blocked.
- **Status:** **BLOCKED**. Real font rasterization parity requires local font assets.

### Issue 5: Private Routes SSR Hydration & Isolation
- **Resolution:** Private routes (`/cart`, `/checkout`, `/account`, `/login`, `/profile`, `/order/:orderNo`) use client components with strict `noindex, nofollow` headers and mock-safe API wrappers. Customer data is never serialized into server SSR HTML.

### Issue 6: Commerce, Auth, and Checkout Regressions
- **Resolution:** Full automated suite `scripts/verify-commerce-regression.mjs` executed and passed all 5 test scenarios.

### Issue 7: Arbitrary CMS Dynamic Enumeration in Sitemap
- **Investigation:** `server/src/routes/api.js` provides `GET /pages/:slug` for individual page retrieval, but does not provide an endpoint (`GET /pages`) to enumerate all published CMS pages.
- **Status:** Currently, `src/app/sitemap.js` dynamically queries products, categories, blogs, and known named CMS routes (`about`, `careers`, `privacy-policy`, `terms-and-conditions`, `help-faqs`, `returns-policy`, `support-center`).
- **Proposed Backend Change:** Add `GET /api/v1/pages` endpoint in `server/src/routes/api.js` returning published slugs `{ pages: [{ slug, updatedAt }] }` so the sitemap can automatically discover arbitrary admin-created CMS pages.

### Issue 8: ESLint Rules Violations
- **Resolution:** All 227 reported lint errors resolved down to 0 errors and 7 warnings.

---

## 5. Pre-Staging Deployment Checklist
1. [ ] Synchronize production `/uploads/` directory from live server to staging server before launching Next.js frontend.
2. [ ] Self-host `Plus Jakarta Sans` font files locally or allow font CDN access on staging.
3. [ ] Implement `GET /api/v1/pages` backend endpoint to support arbitrary dynamic CMS sitemap enumeration.
4. [ ] Verify staging environment variables (`NEXT_PUBLIC_API_URL`, `DATABASE_URL`, `TOKRIII_INDEXING_ENABLED=false`).
5. [ ] Execute end-to-end smoke tests on staging against non-production test payment gateways (Razorpay Test Mode).
