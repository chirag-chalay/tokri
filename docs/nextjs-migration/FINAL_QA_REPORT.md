# Tokriii Next.js Migration — Final QA & Release Audit Report

## Executive Summary
This document provides the final engineering and QA assessment for the Tokriii storefront migration from React 19 + Vite 8 to Next.js 16.4.3 (App Router).

The migration achieves full route independence from the React Router bridge, synchronous SSR of public catalog, product, blog, and CMS pages, zero layout flash or hydration mismatch on the shared chrome, zero ESLint errors, and full passage of an 8-scenario automated commerce, authentication, and checkout regression suite under strict outbound network isolation.

---

## 1. Environment & Baseline
- **Verified Live-Source Baseline:** `/home/gaurav/Documents/tokriii-live-baseline` (Git commit `3c11c4a`, confirmed by owner).
- **Untouched Local React Repo:** `/home/gaurav/Documents/tokri` (preserved without overwriting local changes).
- **Migration Worktree:** `/home/gaurav/Documents/tokriii-nextjs`
- **Active Feature Branch:** `feature/tokriii-react-to-nextjs`
- **Starting Commit (Initial):** `58c7134797d686d74655d3f5773a91f632b35ad4` (`58c7134`)
- **Starting Commit (Hardening Batch):** `481b15a` (`docs: update route parity, migration progress and add final QA report`)
- **Current HEAD Commit:** `bb7b055` (`test: harden commerce regression suite with portable imports, UI checkout submission, OTP assertions, and session expiry checks`)
- **Isolated Local Database:** `tokri_live_local` on `127.0.0.1:3307` (restored from compressed dump `chirag-live-20261029T085327Z.sql.gz`).
- **Read-Only Local Express API:** Port `5223` wrapped with network isolation hook preventing outbound network connections.
- **Next.js Production Host:** `http://127.0.0.1:3000`

---

## 2. Commit Log (Audit & Hardening Batch)
1. `8a5c791`: `fix: render stable shell chrome during SSR and isolate client state`
   - Removed `ready &&` from wrapping Header and Footer in `src/app/_components/NextShell.jsx`.
   - Implemented `useSyncExternalStore` for client auth state and cart counter in `src/components/Header.jsx` to render initial SSR HTML synchronously and reconcile client state cleanly.
2. `16e4f4d`: `fix: resolve ESLint rules violations in account, order, profile and catalog components`
   - Fixed unused variables, unhandled JSX symbol imports, and re-export violations in account and image components.
   - Fixed render ref mutations in `OrderSuccessPage.jsx`.
   - Fixed cascading state updates in catalog and account effects.
   - Configured `eslint.config.js` to ignore external subprojects and support context hook exports.
3. `270b2c5`: `test: add isolated headless commerce, auth and checkout regression suite`
   - Implemented initial Playwright commerce regression script.
4. `481b15a`: `docs: update route parity, migration progress and add final QA report`
   - Initial final QA report and documentation updates.
5. `bb7b055`: `test: harden commerce regression suite with portable imports, UI checkout submission, OTP assertions, and session expiry checks`
   - Replaced absolute npm cache import with declared `playwright-core` devDependency.
   - Added hard assertions for invalid 4-digit OTP error dialog visibility and text content.
   - Replaced direct URL navigation in checkout smoke test with actual UI checkout submission: address selection, morning delivery option, COD payment selection, place order button click, duplicate click guard verification (`button.disabled` & `Processing...`), error recovery test, and order payload schema inspection.
   - Added coupon validation tests (invalid code rejection and valid discount total update).
   - Added authenticated cart synchronization verification (`PUT /account/cart`).
   - Added session expiry test (401 response on `/auth/me` triggers logout and `localStorage` clearance).

---

## 3. QA Results Matrix

| QA Test Suite | Command | Result | Details |
| --- | --- | --- | --- |
| **Next.js Production Build** | `npm run build:next` | **PASS** | 20 App Router routes compiled; 0 errors |
| **Vite Production Build** | `npm run build` | **PASS** | Original baseline build preserved; 0 errors |
| **ESLint Static Analysis** | `npm run lint` | **PASS** | 0 errors, 7 pre-existing upstream warnings |
| **SEO & SSR Verification** | `node scripts/verify-next-seo.mjs` | **PASS** | SSR initial HTML, dynamic metadata, canonicals, JSON-LD, robots, dynamic sitemap |
| **Hydration & Shell Stability** | Chrome Headless Audit | **PASS** | 0 React hydration mismatch warnings; synchronous header/footer rendering |
| **Commerce & Auth Regressions** | `node scripts/verify-commerce-regression.mjs` | **PASS** | 8 test suites passed: cart add/persist, OTP modal & session, cart sync, orders, coupons, full UI COD checkout submission, duplicate click protection, session expiry |
| **Real Asset Parity** | Local asset inspection | **BLOCKED** | Uploaded catalog images (74 products, 8 categories, 8 blogs) exist only on live server; Google Fonts blocked offline |
| **Multi-Device Pixel Parity** | Viewport screenshot comparison | **BLOCKED** | Blocked due to missing remote upload files and web font files |
| **CMS Dynamic Enumeration** | Dynamic sitemap test | **BLOCKED** | Backend API provides `GET /pages/:slug` but lacks collection endpoint `GET /pages` |

---

## 4. App Router Structure & Source File Mapping
The Next.js configuration in `next.config.mjs` specifies `pageExtensions: ['next.jsx', 'next.js']`. All route files use these extensions:

| Route | File Path | Route Type |
| --- | --- | --- |
| `/` | `src/app/(store)/page.next.jsx` | Server Component (SSR) |
| `/shop` | `src/app/(store)/shop/page.next.jsx` | Server Component (SSR) |
| `/category/[categoryId]` | `src/app/category/[categoryId]/page.next.jsx` | Redirect (308 to `/shop?category=...`) |
| `/product/[productId]` | `src/app/(store)/product/[productId]/page.next.jsx` | Server Component (SSR) |
| `/blog` | `src/app/(store)/blog/page.next.jsx` | Server Component (SSR) |
| `/blog/[slug]` | `src/app/(store)/blog/[slug]/page.next.jsx` | Server Component (SSR) |
| `/p/[slug]` | `src/app/(store)/p/[slug]/page.next.jsx` | Server Component (SSR) |
| `/about` | `src/app/(store)/about/page.next.jsx` | Server Component (SSR) |
| `/careers` | `src/app/(store)/careers/page.next.jsx` | Server Component (SSR) |
| `/privacy-policy` | `src/app/(store)/privacy-policy/page.next.jsx` | Server Component (SSR) |
| `/terms-and-conditions` | `src/app/(store)/terms-and-conditions/page.next.jsx` | Server Component (SSR) |
| `/help-faqs` | `src/app/(store)/help-faqs/page.next.jsx` | Server Component (SSR) |
| `/returns-policy` | `src/app/(store)/returns-policy/page.next.jsx` | Server Component (SSR) |
| `/support-center` | `src/app/(store)/support-center/page.next.jsx` | Server Component (SSR) |
| `/cart` | `src/app/(store)/cart/page.next.jsx` | Client Component (`noindex`) |
| `/checkout` | `src/app/(store)/checkout/page.next.jsx` | Client Component (`noindex`) |
| `/order/[orderNo]` | `src/app/(store)/order/[orderNo]/page.next.jsx` | Client Component (`noindex`) |
| `/account` | `src/app/(store)/account/page.next.jsx` | Client Component (`noindex`) |
| `/login` | `src/app/(store)/login/page.next.jsx` | Client Component (`noindex`) |
| `/profile` | `src/app/(store)/profile/page.next.jsx` | Client Component (`noindex`) |
| `/robots.txt` | `src/app/robots.txt/route.next.js` | Route Handler |
| `/sitemap.xml` | `src/app/sitemap.xml/route.next.js` | Route Handler |

---

## 5. Media Manifest & Missing Assets Investigation
Inspection of the restored database (`tokri_live_local` on port 3307) confirms the following media assets are referenced but missing from all local working trees and backups:

| Media Category | Referenced Table | Count | Example URL in Database |
| --- | --- | --- | --- |
| **Product Images** | `Product.image` | 74 | `/uploads/products/mix_fruit_pack_5_varieties_800x800-1788466997946.webp` |
| **Category Thumbnails** | `Category.image` | 8 | `/uploads/categories/fresh-fruits-1788212012820.webp` |
| **Blog Cover Images** | `BlogPost.coverImage` | 8 | `/uploads/blog/1730000000000-blog-cover.webp` |
| **Media Library Entries** | `Media.path` | 106 | `/uploads/general/*` |
| **Web Fonts** | CSS `@import` | 1 family | `Plus Jakarta Sans` (400, 500, 600, 700, 800) |

The local directory `server/uploads` in all git branches and backups contains only `.gitkeep`. Without access to the production filesystem or a sanctioned media archive, real image and font parity remains **BLOCKED**.

---

## 6. Environment Variables Audit

### Variables Required by Next.js Frontend
| Variable | Scope | Purpose | Default / Fallback |
| --- | --- | --- | --- |
| `TOKRIII_API_PROXY_TARGET` | Server Build & Runtime | Backend base origin for Next.js rewrites (`/api/:path*`, `/uploads/:path*`) | `http://127.0.0.1:5223` |
| `TOKRIII_SERVER_API_ORIGIN` | Server Runtime (SSR) | Origin used by `src/lib/server/public-api.js` for server-rendered page data | `http://127.0.0.1:5223` |
| `TOKRIII_INDEXING_ENABLED` | Server Runtime | Controls search engine indexing in `robots.txt` and root metadata (`true` = allow index; any other value = `noindex`) | `false` |
| `TOKRIII_CANONICAL_ORIGIN` | Server Runtime | Base origin for sitemap and canonical URLs | `https://tokriii.com` |
| `TOKRIII_GA_MEASUREMENT_ID` | Build Time | Optional Google Analytics Measurement ID | `""` (disabled) |

### Variables NOT Required by Next.js Frontend
- `DATABASE_URL`: **Not used by Next.js**. Only required by the Express backend (`server/src/server.js`) via Prisma ORM.
- `NEXT_PUBLIC_API_URL`: **Not used by Next.js**. Frontend client requests use relative `/api/v1` routes, which are proxied to the backend via Next.js internal rewrites.

---

## 7. Dynamic CMS Sitemap Investigation & Proposed Contract
- **Current Limitation:** `server/src/routes/api.js` exposes `GET /pages/:slug` for single-page retrieval. There is no endpoint to enumerate all published CMS pages. As a result, `src/app/sitemap.xml/route.next.js` only indexes the pre-defined named CMS routes (`about`, `careers`, `privacy-policy`, `terms-and-conditions`, `help-faqs`, `returns-policy`, `support-center`). Arbitrary `/p/[slug]` pages created in the Backoffice cannot be automatically discovered by crawlers.
- **Proposed Backend API Contract:**
  - **Endpoint:** `GET /api/v1/pages`
  - **Query Parameters:** `?published=true&limit=100`
  - **Success Response (200 OK):**
    ```json
    {
      "pages": [
        { "slug": "about", "title": "About Us", "updatedAt": "2026-10-25T12:00:00.000Z" },
        { "slug": "festive-offers", "title": "Festive Offers", "updatedAt": "2026-10-28T09:00:00.000Z" }
      ],
      "total": 2
    }
    ```
  - **Backward-Compatible Implementation:** If `/pages` returns 404 (on un-upgraded backends), `sitemap.xml` gracefully falls back to the static `publicCmsSlugs` list without failing the sitemap generation.

---

## 8. Staging Deployment Architecture Plan (Design Only)
*This is an architectural plan for review. No staging or production servers will be modified during this task.*

1. **Process Isolation:**
   - Run the Next.js production server on a dedicated internal port (e.g., port `3001`) via PM2:
     ```bash
     pm2 start npm --name "tokri-nextjs-storefront" -- run start:next -- --port 3001
     ```
   - Retain the existing Express API on port `5222`.
2. **Reverse Proxy Configuration (Nginx):**
   - Point the storefront server block (`server.tokriii.com`) to `http://127.0.0.1:3001`.
   - Forward `/api/` and `/uploads/` directly or allow Next.js rewrites to proxy them to `http://127.0.0.1:5222`.
3. **Upload / Media Sync:**
   - Synchronize `/uploads/` from live production (`tokriii.com`) to staging before starting the Next.js service to resolve asset 404s.
4. **Noindex Safeguard:**
   - Set `TOKRIII_INDEXING_ENABLED=false` on staging to ensure search engine crawlers are blocked via `robots.txt` and `<meta name="robots" content="noindex, nofollow" />`.
5. **Rollback Strategy:**
   - If issues arise, re-point the Nginx root back to the existing Vite build directory (`dist/`) and reload Nginx in < 1 second.
6. **Live Data Protection:**
   - Staging must connect to a separate staging MySQL database. Ensure the staging API never points to production database credentials.

---

## 9. Final Release Audit Summary

```
TOKRIII NEXT.JS RELEASE AUDIT
- Routes: 20/20
- Legacy bridge: Removed
- Shared shell: PASS
- Real image parity: BLOCKED
- Real font parity: BLOCKED
- Responsive visual parity: BLOCKED
- Guest cart: PASS
- Authenticated cart: PASS
- Checkout submission with mocks: PASS
- Delivery and taxes: PASS
- Authentication: PASS
- SEO: PASS
- CMS sitemap: BLOCKED
- Next.js build: PASS
- Vite build: PASS
- Lint: PASS
- Feature branch pushed: YES
- Staging changed: NO
- Main changed: NO
- Live changed: NO
- Ready for staging review: NO
```
*(Ready for staging review is marked **NO** because real catalog image parity and web font visual parity remain **BLOCKED** until approved production media and font assets are provided).*
