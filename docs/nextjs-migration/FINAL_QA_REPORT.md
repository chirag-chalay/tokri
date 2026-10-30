# Tokriii Next.js Migration — Final QA & Release Audit Report

## Executive Summary
This document provides the final engineering and QA assessment for the Tokriii storefront migration from React 19 + Vite 8 to Next.js 16.4.3 (App Router).

The migration achieves full route independence from the React Router bridge, synchronous SSR of public catalog, product, blog, and CMS pages, zero layout flash or hydration mismatch on the shared chrome, zero ESLint errors, and full passage of a 9-scenario automated commerce, tax, delivery, and checkout regression suite under strict outbound network isolation.

---

## 1. Environment & Baseline
- **Verified Live-Source Baseline:** `/home/gaurav/Documents/tokriii-live-baseline` (Git commit `3c11c4a`, confirmed by owner).
- **Untouched Local React Repo:** `/home/gaurav/Documents/tokri` (preserved without overwriting local changes).
- **Migration Worktree:** `/home/gaurav/Documents/tokriii-nextjs`
- **Active Feature Branch:** `feature/tokriii-react-to-nextjs`
- **Starting Commit for Current Gate:** `50576f9`
- **Isolated Local Database:** `tokri_live_local` on `127.0.0.1:3307` (restored from compressed dump `chirag-live-20261029T085327Z.sql.gz`).
- **Read-Only Local Express API:** Port `5223` wrapped with network isolation hook preventing outbound network connections.
- **Next.js Production Host:** `http://127.0.0.1:3000`

---

## 2. Commit Log (Audit & Hardening History)
1. `8a5c791`: `fix: render stable shell chrome during SSR and isolate client state`
   - Removed `ready &&` from wrapping Header and Footer in `src/app/_components/NextShell.jsx`.
   - Implemented `useSyncExternalStore` for client auth state and cart counter in `src/components/Header.jsx` to render initial SSR HTML synchronously and reconcile client state cleanly.
2. `16e4f4d`: `fix: resolve ESLint rules violations in account, order, profile and catalog components`
   - Fixed unused variables, unhandled JSX symbol imports, and re-export violations in account and image components.
   - Fixed render ref mutations in `OrderSuccessPage.jsx`.
   - Fixed cascading state updates in catalog and account effects.
   - Configured `eslint.config.js` to ignore external subprojects and support context hook exports.
3. `270b2c5`: `test: add isolated headless commerce, auth and checkout regression suite`
   - Initial Playwright regression script.
4. `481b15a`: `docs: update route parity, migration progress and add final QA report`
   - Initial documentation update.
5. `bb7b055`: `test: harden commerce regression suite with portable imports, UI checkout submission, OTP assertions, and session expiry checks`
   - Added `playwright-core` devDependency and portable import.
   - Added OTP validation and session persistence assertions.
   - Added duplicate click protection and failure recovery.
6. `50576f9`: `docs: update final QA report with accurate App Router filenames, environment variable audit, media manifest, and staging architecture plan`
   - Corrected App Router `.next.jsx` filenames and documented media manifest.

---

## 3. Clear Separation of Release Concepts

To ensure complete technical transparency, the following verification milestones are explicitly distinguished:

| Release Concept | Status | Detailed Assessment |
| --- | --- | --- |
| **Next.js Production Build** | **PASS** | `npm run build:next` compiles all 20 App Router routes without error. |
| **Vite Production Build** | **PASS** | `npm run build` compiles Vite baseline without regression. |
| **ESLint Static Analysis** | **PASS** | `npm run lint` reports 0 errors (7 pre-existing upstream hook warnings). |
| **SEO Smoke Tests** | **PASS** | `node scripts/verify-next-seo.mjs` verifies SSR initial HTML, dynamic metadata, canonical URLs, JSON-LD, robots, and dynamic sitemap. |
| **Mocked Commerce Tests** | **PASS** | `node scripts/verify-commerce-regression.mjs` verifies 9 scenarios: cart add, OTP auth, cart sync payload, orders, tax calculations, coupon recalculation, promotional free delivery, minimum order values, pincode switching, duplicate order protection, error recovery, and session expiry. |
| **Real Backend Integration** | **PARTIAL (LOCAL ONLY)** | Verified exclusively against local read-only Express API (port 5223) and MySQL dump on port 3307. Real staging/production backend integration remains **UNTESTED**. |
| **Full Design & Asset Parity** | **BLOCKED** | Catalog images (74 products, 8 categories, 8 blogs) and web font files (`Plus Jakarta Sans`) are missing locally; visual verification across viewports is **BLOCKED**. |
| **Ready for Staging Review** | **NO** | Blocked until production uploads and font assets are provisioned on staging and staging server architecture questions are confirmed by an administrator. |
| **Ready for Deployment** | **NO** | Strictly unauthorized. Never deploy directly without staging review and explicit owner authorization. |

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

## 5. Media Manifest & Missing Assets
See [`MEDIA_MANIFEST.md`](./MEDIA_MANIFEST.md) for the complete 90+ item manifest.

Summary of missing assets:
- **Product Images:** 74 images referenced in `Product.image` (e.g. `/uploads/products/*.webp`).
- **Category Thumbnails:** 8 thumbnails referenced in `Category.image` (e.g. `/uploads/categories/*.webp`).
- **Blog Cover Images:** 8 covers referenced in `BlogPost.coverImage` (e.g. `/uploads/blog/*.png`).
- **Media Library:** 106 records in `Media.path`.
- **Web Fonts:** `Plus Jakarta Sans` weights 400 through 800.

`server/uploads` in all git branches and backups contains only `.gitkeep`. Without an approved public media snapshot provided by an administrator, full pixel parity remains **BLOCKED**.

---

## 6. Environment Variables Audit (Verified Against Source Code)

### Variables Verified in Source Code
| Variable | Code Location | Scope | Actual Purpose & Source Behavior | Default / Fallback |
| --- | --- | --- | --- | --- |
| `TOKRIII_API_PROXY_TARGET` | `next.config.mjs` (L1) | Server Build & Runtime | Backend proxy target for Next.js internal rewrites (`/api/:path*`, `/uploads/:path*`). | `http://127.0.0.1:5223` |
| `TOKRIII_SERVER_API_ORIGIN` | `src/lib/server/public-api.js` (L4) | Server Runtime (SSR) | Origin used by server components for public unauthenticated SSR data fetching. | `http://127.0.0.1:5223` |
| `TOKRIII_INDEXING_ENABLED` | `src/lib/server/indexing.js` (L9) | Server Runtime | Controls search engine indexing. Indexing is allowed ONLY when set to `'true'` AND the request host is `tokriii.com` or `www.tokriii.com`. All other cases default to `noindex`. | `false` |
| `TOKRIII_GA_MEASUREMENT_ID` | `next.config.mjs` (L17) | Build Time | Optional Google Analytics Measurement ID injected via webpack DefinePlugin. | `""` (disabled) |

### Variables NOT Defined or Required by Next.js Frontend
- `TOKRIII_CANONICAL_ORIGIN`: **Does not exist in source code.** The canonical origin in `src/lib/server/indexing.js` (L3) is hardcoded as `export const canonicalOrigin = 'https://tokriii.com'`.
- `DATABASE_URL`: **Not used by Next.js.** Only used by the backend Express server (`server/src/server.js`) via Prisma ORM.
- `NEXT_PUBLIC_API_URL`: **Not used by Next.js.** Storefront client code uses relative `/api/v1` routes proxied by Next.js rewrites.

---

## 7. Dynamic CMS Sitemap Investigation & Proposed Contract
- **Current Limitation:** `server/src/routes/api.js` exposes `GET /pages/:slug` for single-page retrieval. There is no collection endpoint to enumerate all published CMS pages. As a result, `src/app/sitemap.xml/route.next.js` only indexes the pre-defined named CMS routes (`about`, `careers`, `privacy-policy`, `terms-and-conditions`, `help-faqs`, `returns-policy`, `support-center`). Arbitrary `/p/[slug]` pages dynamically created in the Backoffice cannot be discovered by crawlers without a collection endpoint.
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

## 8. Staging Deployment Requirements & Server Questions
*This is an architectural requirements document. No staging or live server commands will be executed.*

Before planning any staging deployment, the following server-level questions **must be confirmed by an authorized administrator**:

1. **Database Isolation:** Does the staging backend connect to an isolated staging database, or does it share the production database instance? (If shared, any staging write could corrupt production data).
2. **Current Service Architecture:** How is the current staging storefront served on `server.tokriii.com`? (e.g. Nginx proxy to PM2, Docker container, or static file root?).
3. **Port Allocation:** What internal TCP port is sanctioned for the Next.js process on staging without colliding with existing services?
4. **Environment Variables:** What is the approved method for configuring server-side environment variables on staging?
5. **Media Asset Synchronization:** What is the sanctioned, read-only path to synchronize public `/uploads/` to staging without generating heavy disk I/O on production?
6. **Rollback Plan:** What is the exact step-by-step rollback procedure if the Next.js process encounters unexpected issues on staging?

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
*(Ready for staging review is marked **NO** because real catalog image parity and web font visual parity remain **BLOCKED** until approved production media and font assets are provided, and administrator confirmation of staging environment architecture is obtained).*
