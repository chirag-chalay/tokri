# Tokriii.com — Complete SEO Implementation Documentation

**Website:** [https://tokriii.com](https://tokriii.com)  
**Dedicated Branch:** `feature/production-seo-optimization`  
**Execution Date:** November 20, 2026  
**Next.js Architecture:** Next.js 16.4.3 App Router with Server-Side Rendering (SSR) & Streaming Hydration  
**Backend API:** Express.js 4 / Node.js 22 (`http://127.0.0.1:5223/api/v1`) with MySQL  

---

## 1. Executive Summary & Non-Negotiable Rules Adherence

A complete, production-safe, enterprise-grade SEO overhaul has been implemented across Tokriii.com without disrupting existing website design, customer workflows, checkout integrity, or business operations.

### Non-Negotiable Constraints Maintained:
1. **Design & UX Preservation:** Zero layout shifts, styling breaks, or visual discrepancies. All semantic improvements (`h1` hierarchy, image `alt` attributes) either mirror existing typographic elements or use accessible screen-reader utility classes (`sr-only`) where visual headings were omitted in design.
2. **Customer Workflows Untouched:** Cart state (`CartContext`), checkout flow (`CheckoutPage`), coupon validations (`CouponBox`), delivery quote computations, user authentication (`AuthContext`), and payment gateways remain 100% untouched.
3. **No Fabricated Data:** Zero manufactured reviews, fake star ratings, or exaggerated claims. `Product` schema excludes fake reviews to strictly comply with Google Merchant Guidelines; `FAQPage` schema is dynamically parsed from genuine active Q&As in the MySQL database.
4. **Service Area Grounding:** Delivery claims reflect verified physical operations: Headquartered at *C 617 Azadpur Fruit Market, New Delhi 110033*, serving 32 active PIN codes across Delhi NCR and Gurugram with morning delivery before 7:00 AM (for orders placed by 11:00 PM).
5. **No Hardcoded Dynamic Data:** Product titles, descriptions, categories, pricing, currencies, and availability derive dynamically from backend endpoints with automatic fallback logic.
6. **Isolated Development:** All work executed on dedicated branch `feature/production-seo-optimization` with full rollback mechanisms.

---

## 2. File Modification & Creation Inventory

| File Path | Action | Role & Optimization Summary |
|---|---|---|
| `src/lib/server/seo-defaults.js` | **Created** | Central repository for baseline metadata (10 core pages, 9 catalog categories), Delhi NCR local business schema, geo coordinates, organization schema, URL normalizers, and dynamic schema generators. |
| `src/app/(store)/page.next.jsx` | **Modified** | Added Homepage dynamic metadata, `WebSite` SearchAction schema, `Organization` schema, and `Store` (LocalBusiness) schema. |
| `src/app/(store)/shop/page.next.jsx` | **Modified** | Dynamic SSR metadata for Shop All and all 9 categories; added `CollectionPage`, `BreadcrumbList`, and `ItemList` JSON-LD schemas. |
| `src/app/(store)/product/[productId]/page.next.jsx` | **Modified** | Enriched `Product` JSON-LD with `brand`, `availability` (`InStock`/`OutOfStock`), `itemCondition`, `offers.seller`, `priceValidUntil`, and absolute canonical images. |
| `src/app/(store)/blog/page.next.jsx` | **Modified** | Dynamic metadata, `CollectionPage`, and `BreadcrumbList` JSON-LD schemas. |
| `src/app/(store)/blog/[slug]/page.next.jsx` | **Modified** | Full `BlogPosting` schema with author, publisher organization, publication dates, and breadcrumb hierarchy. |
| `src/app/_components/CmsRoute.jsx` | **Modified** | Dynamic metadata, breadcrumb hierarchy, and automated `FAQPage` schema parser for `/help-faqs` extracting 21 genuine Q&A pairs from database. |
| `src/app/category/[categoryId]/page.next.jsx` | **Modified** | Upgraded legacy category URL redirect from temporary HTTP 307 to permanent HTTP 308 (`permanentRedirect`) pointing to `/shop?category=:slug`. |
| `src/app/sitemap.xml/route.next.js` | **Modified** | Dynamic XML sitemap generator adding accurate `<lastmod>`, `<changefreq>`, `<priority>`, and full coverage of 11 CMS pages, 9 categories, active products, and blogs. Excludes private routes (`/cart`, `/checkout`, `/account`). |
| `src/lib/server/cms-slugs.js` | **Modified** | Added all 11 published CMS slugs (`about`, `careers`, `privacy-policy`, `terms-and-conditions`, `help-faqs`, `returns-policy`, `support-center`, `shipping-and-delivery-policy`, `cancellation-policy`, `cookie-policy`, `freshness-guarantee`). |
| `src/app/(store)/shipping-and-delivery-policy/page.next.jsx` | **Created** | First-class App Router route for published CMS policy page. |
| `src/app/(store)/cancellation-policy/page.next.jsx` | **Created** | First-class App Router route for published CMS policy page. |
| `src/app/(store)/cookie-policy/page.next.jsx` | **Created** | First-class App Router route for published CMS policy page. |
| `src/app/(store)/freshness-guarantee/page.next.jsx` | **Created** | First-class App Router route for published CMS policy page. |
| `src/lib/server/content.js` | **Modified** | Normalized image asset URLs to canonical origin `https://tokriii.com`; upgraded `detailMetadata` with Twitter Card and rich Open Graph tags. |
| `src/app/layout.next.jsx` | **Modified** | Corrected root HTML tag to `<html lang="en-IN">`; added geo-targeting meta tags (`geo.region` `IN-DL`, `geo.placename` `New Delhi, Gurugram`, `geo.position`, `ICBM`). |
| `src/pages/Home.jsx` | **Modified** | Injected semantic primary `<h1>` (`sr-only` class) to establish clear document heading hierarchy without disrupting visual design. |
| `src/pages/ShopAllPage.jsx` | **Modified** | Converted category title container to semantic `<h1>` displaying active category label or "Shop all". |
| `src/components/Banner.jsx` | **Modified** | Replaced empty `alt=""` attributes with contextual promotional alt text. |
| `src/components/FruitHighlight.jsx` | **Modified** | Replaced empty `alt=""` attributes with dynamic fruit title and grade-A quality descriptors. |
| `src/components/BlogCard.jsx` | **Modified** | Replaced empty `alt=""` attributes with article title descriptors. |
| `src/components/Header.jsx` | **Modified** | Added explicit `alt="Tokriii Fresh Fruits Logo"` to brand mark image. |
| `scripts/verify-seo-comprehensive.mjs` | **Created** | 11-suite automated SEO test runner verifying root layout, metadata, schemas, redirects, canonicals, sitemap, robots, and 404 responses. |
| `scripts/audit-seo-baseline.mjs` | **Created** | Multi-route automated crawler evaluating status codes, meta tags, heading hierarchies, images, and JSON-LD schemas. |

---

## 3. Phase-by-Phase Technical Details

### Phase 1 — Comprehensive Baseline Audit
- Built `scripts/audit-seo-baseline.mjs` and audited 65 representative URLs across production (`https://tokriii.com`) and staging environment.
- Uncovered 163 baseline deficiencies (45 High, 102 Medium, 16 Low severity), documented thoroughly in `SEO-AUDIT-BEFORE.md`.
- Primary deficiencies identified:
  - Missing meta descriptions and Open Graph tags across categories and core pages.
  - Zero structured data (JSON-LD) on Homepage, Shop, Category, and CMS routes.
  - Temporary HTTP 307 redirects for legacy `/category/:slug` routes instead of permanent HTTP 308.
  - Missing `<lastmod>` timestamps in XML sitemap.
  - 4 published CMS pages returning 404s in Next.js App Router due to missing route directories.
  - Missing `<h1>` headings on Homepage and Category views.

### Phase 2 & 8 — Metadata Sheet & Delhi NCR Local SEO
- Constructed `src/lib/server/seo-defaults.js` embedding verified metadata and localized targeting for all 19 key storefront surfaces.
- Targeted commercial terms around verified delivery promises: *"Morning Delivery before 7 AM across Delhi NCR & Gurugram"*.
- Injected geo-tags into root `layout.next.jsx`:
  ```html
  <meta name="geo.region" content="IN-DL" />
  <meta name="geo.placename" content="New Delhi, Gurugram" />
  <meta name="geo.position" content="28.7159;77.1764" />
  <meta name="ICBM" content="28.7159, 77.1764" />
  ```
- Produced `SEO-METADATA-MATRIX.md` with side-by-side verification of original vs. implemented metadata for all 19 pages.

### Phase 3 — Dynamic Product & Category SEO
- **Category URLs:** Cleaned `/shop?category=:slug` metadata to generate category-specific titles, descriptions, canonical URLs, and Open Graph cards.
- **Legacy Redirects:** Upgraded `/category/[categoryId]/page.next.jsx` to use Next.js `permanentRedirect('/shop?category=' + categoryId)`, issuing an HTTP 308 permanent redirect.
- **Dynamic Product Metadata:** Configured fallback generator in `src/lib/server/content.js` and `src/lib/server/seo-defaults.js`:
  - Dynamically builds title: `{Product Name} ({Weight}) · Tokriii`
  - Sanitizes HTML descriptions into clean plain-text meta descriptions.
  - Automatically resolves asset URLs to absolute canonical URLs (`https://tokriii.com/uploads/...`).
  - Generates Open Graph and Twitter Card tags with `summary_large_image`.

### Phase 4 — Structured Data (JSON-LD) Implementations
Implemented rich, valid JSON-LD schemas across all route templates:
1. **WebSite & SearchAction Schema** (Homepage):
   - Informs Google of site search capability with target `https://tokriii.com/shop?query={search_term_string}`.
2. **Organization & LocalBusiness Schema** (Homepage):
   - Legal name: Tokriii
   - Address: C 617 Azadpur Fruit Market, New Delhi 110033
   - Support phone: `+91-9580280280`
   - Price range: `₹₹`
3. **Product & Offer Schema** (`/product/:slug`):
   - Includes `@type: Product`, `name`, `description`, `image`, `sku`, `brand: { @type: Brand, name: Tokriii }`.
   - Offers include `priceCurrency: INR`, `price`, `availability: https://schema.org/InStock` (or `OutOfStock`), `itemCondition: NewCondition`, `priceValidUntil`, `seller: { @type: Organization, name: Tokriii }`.
4. **CollectionPage & ItemList Schema** (`/shop` and `/shop?category=:slug`):
   - Informs search engines of catalog collection listings and current product list.
5. **BreadcrumbList Schema** (Storewide):
   - Establishes crawlable hierarchy: `Home > Shop > Category > Product`.
6. **BlogPosting Schema** (`/blog/:slug`):
   - Includes headline, author, publication date, publisher organization, and logo.
7. **FAQPage Schema** (`/help-faqs`):
   - Automated parser reads the 21 active Q&A items from the database CMS content, sanitizes HTML tags, and constructs a valid `FAQPage` schema with 21 `Question` and `Answer` pairs.

### Phase 5 — XML Sitemap, Robots.txt & CMS Routing
- **Dynamic Sitemap:** Enhanced `src/app/sitemap.xml/route.next.js`:
  - Generates ISO `<lastmod>` timestamps formatted as `YYYY-MM-DD`.
  - Includes `<changefreq>` and `<priority>` weights.
  - Dynamically fetches all published CMS pages, categories, active products, and published blog articles.
  - Excludes private routes (`/cart`, `/checkout`, `/account`, `/login`).
- **CMS Route Parity:** Created dedicated App Router page templates for:
  - `/shipping-and-delivery-policy`
  - `/cancellation-policy`
  - `/cookie-policy`
  - `/freshness-guarantee`
  These routes now return HTTP 200 server-rendered HTML with full metadata and breadcrumbs instead of 404 errors.

### Phase 6 & 7 — Performance, Core Web Vitals & Content Accessibility
- Root language tag updated to `<html lang="en-IN">` for regional accuracy.
- Added semantic `<h1>` to Homepage using `sr-only` class to preserve exact visual layout while providing immediate document context to search crawlers.
- Updated `ShopAllPage.jsx` to render a semantic `<h1>` with the active category name or "Shop all".
- Enhanced image accessibility by replacing empty `alt=""` attributes in `Banner.jsx`, `FruitHighlight.jsx`, `BlogCard.jsx`, and `Header.jsx` with descriptive, keyword-rich alt text.

---

## 4. Verification & Testing Summary

Two automated testing suites were run against the live Next.js production server:
1. `scripts/verify-seo-comprehensive.mjs`: **11 of 11 Test Suites Passed 100%**.
2. `scripts/verify-next-seo.mjs`: **All assertions Passed 100%**.
3. ESLint verification (`npx eslint src`): **0 Errors across all files**.
4. Next.js production build (`npm run build:next`): **Compiled all 27 App Router routes with 0 errors**.
