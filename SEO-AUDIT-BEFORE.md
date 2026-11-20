# Tokriii.com — Comprehensive Technical & On-Page SEO Audit (Baseline Report)

**Target Site:** https://tokriii.com  
**Audit Date:** November 20, 2026  
**Environment Audited:** Production (https://tokriii.com) and Local Staging Baseline (Next.js 16.4.3 App Router on Node v22 / Express v1.0.0 / MySQL tokri)  
**Auditor:** Senior Technical SEO Engineer & Next.js Architect  
**Document Status:** Baseline Findings (Pre-Implementation)

---

## 1. Executive Summary

A comprehensive multi-phase technical, on-page, structured data, local SEO, and crawlability audit was executed across all discoverable routes of Tokriii.com, including:
- Homepage (`/`)
- Catalog & Category routes (`/shop`, `/category/:categoryId`, `/shop?category=:slug`)
- Product Detail pages (`/product/:productId`)
- Blog Listing & Detail pages (`/blog`, `/blog/:slug`)
- CMS Informational & Policy pages (`/about`, `/careers`, `/privacy-policy`, `/terms-and-conditions`, `/help-faqs`, `/returns-policy`, `/support-center`, `/p/:slug`)
- Private customer & transactional workflows (`/cart`, `/checkout`, `/account`, `/login`, `/profile`, `/order/:orderNo`)
- Crawl controls (`/robots.txt`, `/sitemap.xml`)
- Error handling (synthetic 404 routes for missing general, product, blog, and CMS entities)

### Baseline Audit Overview

| Metric | Measured Value |
|---|---|
| Total Public Routes Sampled | 65 routes |
| Active Catalog Products in DB | 87 active products (101 total) |
| Active Product Categories | 9 categories |
| Published Blog Articles | 8 articles |
| Published CMS Pages | 11 pages |
| Total SEO Issues Discovered | **163 issues** across 65 tested routes |
| Critical Severity Issues (P0) | 0 blocking crawlability failures |
| High Severity Issues (P1) | **45 issues** |
| Medium Severity Issues (P2) | **102 issues** |
| Low Severity Issues (P3) | **16 issues** |

---

## 2. Architecture & Crawlability Baseline

1. **Rendering Engine:** Storefront has migrated to Next.js 16.4.3 App Router with Server-Side Rendering (SSR). Initial server-rendered HTML is returned for all public routes.
2. **Backend API:** Node.js Express server (`/api/v1`) backed by MySQL database (`tokri`).
3. **HTTP Status & Redirects:**
   - Homepage, Shop, Blogs, and Products return HTTP 200 with server-rendered content.
   - Non-existent routes return true HTTP 404 (e.g. `/non-existent-page-test-404`, `/product/missing-product-test-404`, `/blog/missing-blog-test-404`).
   - `/category/:categoryId` returns HTTP 307 redirect to `/shop?category=:categoryId`.
   - Four CMS policy pages (`shipping-and-delivery-policy`, `cancellation-policy`, `cookie-policy`, `freshness-guarantee`) return 404 on direct paths (`/:slug`) and are only accessible via `/p/:slug`.
4. **Crawl Directives (`/robots.txt`):**
   - Correctly specifies `User-agent: *`, `Allow: /`, and disallows private customer routes (`/account`, `/profile`, `/login`, `/cart`, `/checkout`, `/order/`).
   - Correctly links to `Sitemap: https://tokriii.com/sitemap.xml`.
5. **XML Sitemap (`/sitemap.xml`):**
   - Dynamically generated from database products, categories, blogs, and named CMS pages.
   - **Defect:** Missing `<lastmod>` timestamps on all `<url>` elements.
   - **Defect:** Excludes 4 published CMS policy pages present in the database.

---

## 3. Findings by Severity & Impact

### Priority 1: High Severity (P1)

#### ISSUE-P1-01: Missing Meta Descriptions on Key Core Routes
- **Affected URLs:**
  - Homepage: `https://tokriii.com/`
  - Shop All: `https://tokriii.com/shop`
  - Blog Listing: `https://tokriii.com/blog`
  - Category: `https://tokriii.com/shop?category=dry-fruits` (database description is NULL)
  - Category: `https://tokriii.com/shop?category=fruit-hampers-combo-boxes` (database description is NULL)
- **Impact:** Search engines generate uncontrollable, auto-extracted snippet text from navigational elements, diluting CTR and SERP visibility.
- **Root Cause:** Next.js static metadata definition on `page.next.jsx` lacks a `description` field, and category query handler only reads `selected.description` which is NULL for newer categories.

#### ISSUE-P1-02: Missing `<h1>` Heading Hierarchy on Core Landing and Category Pages
- **Affected URLs:**
  - Homepage: `https://tokriii.com/` (0 H1 elements; page only contains `<h2>` section headings)
  - Shop All: `https://tokriii.com/shop` (0 H1 elements)
  - Category pages: `https://tokriii.com/shop?category=*` (0 H1 elements; category label is rendered inside filter buttons/spans rather than semantic heading)
- **Impact:** Violates WCAG accessibility standards and Google Search document outline guidelines. Googlebot cannot determine the primary subject of the page without a semantic top-level `<h1>`.

#### ISSUE-P1-03: Missing Schema.org Structured Data on Homepage and Category Pages
- **Affected URLs:**
  - Homepage: `https://tokriii.com/` (Missing `Organization`, `WebSite`, `OnlineStore`, `LocalBusiness` JSON-LD)
  - Category pages: `https://tokriii.com/shop?category=*` (Missing `CollectionPage`, `ItemList`, and `BreadcrumbList` JSON-LD)
- **Impact:** Search engines cannot qualify Tokriii for Rich Results, Brand Knowledge Panels, Sitelinks Search Box, or Category Carousel snippets.

#### ISSUE-P1-04: Incomplete Product Schema & Missing Availability Enum
- **Affected URLs:**
  - All 87 active product pages (`/product/:productId`)
- **Impact:** Products have partial JSON-LD Schema (`Product` and `Offer`), but lack:
  - `availability` (`https://schema.org/InStock` or `https://schema.org/OutOfStock`)
  - `itemCondition` (`https://schema.org/NewCondition`)
  - `brand` (`Tokriii` or sourced brand e.g. `Zespri`)
  - `seller` / `priceValidUntil`
  - Relative images are omitted from schema if they don't start with `http`
- **Result:** Google Rich Results Test reports missing recommended attributes for ecommerce merchant listings.

#### ISSUE-P1-05: Missing FAQPage Structured Data
- **Affected URLs:**
  - Help & FAQs: `https://tokriii.com/help-faqs`
- **Impact:** The page contains verified delivery, ordering, and payment FAQs in text, but has zero `FAQPage` JSON-LD schema, missing out on rich expandable FAQ SERP snippets.

---

### Priority 2: Medium Severity (P2)

#### ISSUE-P2-01: HTML Lang Attribute Set to Generic "en" Instead of "en-IN"
- **Affected URLs:** All routes globally (`src/app/layout.next.jsx`)
- **Impact:** `html lang="en"` fails to indicate Indian English localization (`en-IN`), affecting regional search targeting for Delhi NCR.

#### ISSUE-P2-02: Incomplete Open Graph and Twitter Card Metadata
- **Affected URLs:**
  - Homepage (`/`)
  - Shop All (`/shop`)
  - Blog Listing (`/blog`)
  - All Category URLs (`/shop?category=*`)
  - CMS Pages (`/about`, `/careers`, `/privacy-policy`, etc.)
- **Impact:** Missing `og:description`, `og:image`, `twitter:card`, `twitter:title`, `twitter:description`, and `twitter:image`. Links shared on WhatsApp, Facebook, iMessage, and X/Twitter render without rich preview banners or summary descriptions.

#### ISSUE-P2-03: Missing Image `alt` Attributes
- **Affected URLs:**
  - Homepage (1 image missing alt: hero banner background)
  - Shop All (10 images missing descriptive alt text)
  - Category pages (product grid thumbnails using empty `alt=""`)
  - Blog Listing (9 blog cover thumbnails missing descriptive alt text)
- **Impact:** Impairs visual accessibility and prevents images from indexing in Google Image Search.

#### ISSUE-P2-04: Non-Standard Category Query URLs in Canonical Strategy
- **Affected URLs:**
  - Category access exists as `/category/:categoryId` (which 307 redirects to `/shop?category=:slug`).
  - Search engines encounter query-string category URLs (`/shop?category=exotic`).
  - While functional, search best practices favor clean, descriptive path hierarchies (e.g. `/category/:slug` or `/shop/:slug`) with 301 redirects and canonicals.

#### ISSUE-P2-05: Sitemap Missing `<lastmod>` Attributes
- **Affected URLs:** `https://tokriii.com/sitemap.xml`
- **Impact:** Search crawlers must re-crawl every URL blindly instead of prioritizing recently updated products, blogs, and pages.

#### ISSUE-P2-06: Four Published CMS Pages Inaccessible from Clean URLs
- **Affected URLs:**
  - `shipping-and-delivery-policy` (in DB as published, but `/shipping-and-delivery-policy` returns 404)
  - `cancellation-policy` (in DB as published, but returns 404)
  - `cookie-policy` (in DB as published, but returns 404)
  - `freshness-guarantee` (in DB as published, but returns 404)
- **Impact:** Orphaned content only reachable via obscure `/p/:slug` aliases, omitted from navigation and XML sitemap.

---

### Priority 3: Low Severity (P3)

#### ISSUE-P3-01: Missing Twitter Image Previews on CMS Pages
- **Affected URLs:** `/about`, `/help-faqs`, `/privacy-policy`, `/terms-and-conditions`, `/returns-policy`, `/careers`, `/support-center`
- **Impact:** Social sharing defaults to no thumbnail image instead of the official Tokriii brand share card.

#### ISSUE-P3-02: Thin Meta Content on Vacant CMS Pages
- **Affected URLs:** `/careers`
- **Impact:** `careers` body is empty in the database, resulting in an empty meta description.

---

## 4. Route-by-Route Baseline Findings (19 Target Pages)

| # | Route | Current Title | Current Description | Current H1 | Canonical URL | Schema Present |
|---|---|---|---|---|---|---|
| 1 | `/` (Home) | `Tokriii — Premium & Exotic Fruits` | *MISSING* | *MISSING* | `https://tokriii.com/` | None |
| 2 | `/shop` (Shop All) | `Shop · Tokriii` | *MISSING* | *MISSING* | `https://tokriii.com/shop` | None |
| 3 | `/blog` (Blog List) | `Blog · Tokriii` | *MISSING* | "The Tokriii Journal" | `https://tokriii.com/blog` | None |
| 4 | `/about` (About Us) | `About Tokriii · Tokriii` | "About Tokriii Tokriii brings handpicked..." | "About Tokriii" | `https://tokriii.com/about` | None |
| 5 | `/careers` | `Careers · Tokriii` | *MISSING* | "Careers" | `https://tokriii.com/careers` | None |
| 6 | `/privacy-policy` | `Privacy Policy · Tokriii` | "Privacy Policy This Privacy Policy describes..." | "Privacy Policy" | `https://tokriii.com/privacy-policy` | None |
| 7 | `/terms-and-conditions` | `Terms & Conditions · Tokriii` | "Terms & Conditions Welcome to Tokriii..." | "Terms & Conditions" | `https://tokriii.com/terms-and-conditions` | None |
| 8 | `/help-faqs` | `Frequently Asked Questions (FAQ) · Tokriii` | "Frequently Asked Questions (FAQ) Ordering &..." | "Frequently Asked Questions (FAQ)" | `https://tokriii.com/help-faqs` | None |
| 9 | `/returns-policy` | `Returns & Refund Policy · Tokriii` | "Returns & Refund Policy At Tokriii, we take..." | "Returns & Refund Policy" | `https://tokriii.com/returns-policy` | None |
| 10 | `/support-center` | `Support Center · Tokriii` | "Support Center We are here to help..." | "Support Center" | `https://tokriii.com/support-center` | None |
| 11 | `/shop?category=fresh-fruits` | `Fresh Fruits · Tokriii` | "Handpicked farm-fresh fruits..." | *MISSING* | `https://tokriii.com/shop?category=fresh-fruits` | None |
| 12 | `/shop?category=premium` | `Premium · Tokriii` | "Finest grade selected fruits..." | *MISSING* | `https://tokriii.com/shop?category=premium` | None |
| 13 | `/shop?category=imported` | `Imported Fruits · Tokriii` | "World-class imported fruits..." | *MISSING* | `https://tokriii.com/shop?category=imported` | None |
| 14 | `/shop?category=exotic` | `Exotic Fruits · Tokriii` | "Rare and exotic fruits..." | *MISSING* | `https://tokriii.com/shop?category=exotic` | None |
| 15 | `/shop?category=tropical` | `Tropical fruits · Tokriii` | "Luscious tropical fruits..." | *MISSING* | `https://tokriii.com/shop?category=tropical` | None |
| 16 | `/shop?category=melons` | `Melons · Tokriii` | "Sweet and juicy melons..." | *MISSING* | `https://tokriii.com/shop?category=melons` | None |
| 17 | `/shop?category=dry-fruits` | `Dry Fruits · Tokriii` | *MISSING* | *MISSING* | `https://tokriii.com/shop?category=dry-fruits` | None |
| 18 | `/shop?category=daily-fruits` | `Daily Fruits · Tokriii` | "Everyday fresh fruits for your family..." | *MISSING* | `https://tokriii.com/shop?category=daily-fruits` | None |
| 19 | `/shop?category=fruit-hampers-combo-boxes` | `Fruit Hampers & Combo Boxes · Tokriii` | *MISSING* | *MISSING* | `https://tokriii.com/shop?category=fruit-hampers-combo-boxes` | None |

---

## 5. Local SEO & Delhi NCR Geotargeting Baseline

1. **Current Operating Facts:**
   - Physical Origin: `C 617 Azadpur Fruit Market, New Delhi 110033`
   - Customer Service: `support@tokriii.com`, Phone: `+91 9580280280`, `+91 9958697427`
   - Verified Service Coverage: 32 active pincodes across Gurugram and selected Delhi NCR areas.
   - Delivery Offerings:
     - Morning Delivery before 7:00 AM (Orders before 11:00 PM)
     - Same-Day / 90-Minute Delivery (where enabled, with ₹1,251 MOV)
2. **Current Local SEO Gaps:**
   - Zero local business schema markup (`LocalBusiness` or `Store` at Azadpur Fruit Market).
   - Core page titles do not mention service location (Delhi NCR / Gurugram).
   - No geo-coordinates (`geo.position`, `geo.placename`, `geo.region`) in page heads.
   - Commercial keywords do not explicitly connect premium fruit offerings with Delhi NCR doorstep delivery.

---

## 6. Action Plan for Phase 2–10

1. **Phase 2 (Metadata Matrix Implementation):**
   - Apply highly optimized, keyword-rich titles, descriptions, canonicals, OG, and Twitter metadata to all 19 core pages.
2. **Phase 3 (Dynamic Product & Category SEO):**
   - Expand `detailMetadata` for products to dynamically generate rich descriptions from weight, category, pack size, and freshness attributes if DB description is short.
   - Support category SEO-friendly clean routes `/category/:slug` while maintaining 100% backward compatibility with `/shop?category=:slug`.
   - Provide fallback category descriptions so no category page is ever missing a meta description.
3. **Phase 4 (Structured Data):**
   - Add `Organization`, `WebSite`, `OnlineStore`, and `LocalBusiness` JSON-LD to Homepage.
   - Add `CollectionPage`, `ItemList`, and `BreadcrumbList` JSON-LD to all Category pages.
   - Add `FAQPage` JSON-LD to `/help-faqs`.
   - Enhance `Product` JSON-LD with `availability`, `itemCondition`, `brand`, and absolute images.
4. **Phase 5 (Sitemap & Robots):**
   - Add `<lastmod>` timestamps to all dynamic sitemap URLs.
   - Include all 11 published CMS pages in sitemap and ensure clean direct routes.
5. **Phase 6 & 7 (Core Web Vitals & Content/Headings):**
   - Add semantic `<h1>` tags to Homepage, Shop, and Category pages.
   - Set `html lang="en-IN"`.
   - Add descriptive alt tags to product cards and banners.
6. **Phase 8 & 9 (Delhi NCR Local SEO & Analytics):**
   - Ground local delivery terminology and schema in genuine Azadpur Market and 32 serviceable pincodes.
   - Verify Meta Pixel and Google Search Console tags.
7. **Phase 10 (Validation & Rollback):**
   - Run type checks, linting, Next.js build, and automated verification suites.
   - Produce all required documentation.
