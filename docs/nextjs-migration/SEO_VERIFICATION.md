# SEO Verification

## SSR and Metadata Coverage
- **Homepage (`/`):** Initial server-rendered HTML contains public categories, featured collections, products, `<header>`, and `<footer>` without hydration mismatch or layout shift.
- **Catalog & Categories (`/shop`, `/category/:categoryId`):** Dynamic metadata, query-specific canonical URLs, category filtering, and category SSR content.
- **Product Details (`/product/:productId`):** Full H1, description, image, price, weight, JSON-LD Schema (`Product` / `Offer`), and 404 response for nonexistent products.
- **Blog Listing & Detail (`/blog`, `/blog/:slug`):** Initial HTML renders article content, headings with anchors, author, publication date, JSON-LD Schema (`BlogPosting`), and 404 response for missing articles.
- **CMS Pages (`/p/:slug`, `/about`, etc.):** Render published CMS bodies, canonical URLs, and return 404 for missing CMS slugs.
- **Private Routes (`/cart`, `/checkout`, `/account`, `/login`, `/profile`, `/order/:orderNo`):** Render on client with strict `noindex, nofollow` meta tags.
- **Robots Directive (`/robots.txt`):** Disallows crawling on local and preview environments; enables indexing only when `TOKRIII_INDEXING_ENABLED=true` on production hostname.
- **Dynamic Sitemap (`/sitemap.xml`):** Queries MySQL for public products, categories, blogs, and named CMS pages; returns HTTP 503 on database unavailability.

## Validation Status
- `node scripts/verify-next-seo.mjs`: **PASS** (100% assertions verified on live-local database).
- **Limitation / Blocker:** Arbitrary `/p/[slug]` dynamic CMS page enumeration in sitemap is currently blocked because `server/src/routes/api.js` provides `GET /pages/:slug` but lacks a `GET /pages` collection endpoint.
