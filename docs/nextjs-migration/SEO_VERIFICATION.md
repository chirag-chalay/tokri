# SEO Verification

## 1. SSR and Metadata Coverage
- **Homepage (`/`):** Initial server-rendered HTML contains public categories, featured collections, products, `<header>`, and `<footer>` without hydration mismatch or layout shift.
- **Catalog & Categories (`/shop`, `/category/:categoryId`):** Dynamic metadata, query-specific canonical URLs, category filtering, and category SSR content.
- **Product Details (`/product/:productId`):** Full H1, description, image, price, weight, JSON-LD Schema (`Product` / `Offer`), and 404 response for nonexistent products.
- **Blog Listing & Detail (`/blog`, `/blog/:slug`):** Initial HTML renders article content, headings with anchors, author, publication date, JSON-LD Schema (`BlogPosting`), and 404 response for missing articles.
- **CMS Pages (`/p/:slug`, `/about`, etc.):** Render published CMS bodies, canonical URLs, and return 404 for missing CMS slugs.
- **Private Routes (`/cart`, `/checkout`, `/account`, `/login`, `/profile`, `/order/:orderNo`):** Render on client with strict `noindex, nofollow` meta tags.
- **Robots Directive (`/robots.txt`):** Disallows crawling on local and preview environments; enables indexing only when `TOKRIII_INDEXING_ENABLED=true` on production hostname.
- **Dynamic Sitemap (`/sitemap.xml`):** Queries MySQL for public products, categories, blogs, and named CMS pages; returns HTTP 503 on database unavailability.

---

## 2. Validation Status
- `node scripts/verify-next-seo.mjs`: **PASS** (100% assertions verified against local Next.js server on port 3000 and read-only Express API on port 5223).
- **Current Limitation:** Dynamic enumeration of arbitrary `/p/[slug]` CMS pages in `sitemap.xml` is currently constrained to known/named slugs. The backend Express router provides `GET /api/v1/pages/:slug` for single-page retrieval, but no published-page collection endpoint exists to enumerate arbitrary user-created CMS pages.

---

## 3. Minimal Backward-Compatible CMS Endpoint Proposal

To allow `sitemap.xml` to dynamically enumerate all published CMS pages without modifying existing route behaviors or introducing breaking changes, the following endpoint is proposed for future backend adoption:

### Proposed Endpoint Specification
- **Method & Route:** `GET /api/v1/pages`
- **Controller Logic:**
  ```javascript
  router.get('/pages', async (req, res, next) => {
    try {
      const pages = await prisma.page.findMany({
        where: { isPublished: true },
        select: {
          slug: true,
          title: true,
          updatedAt: true,
        },
        orderBy: { slug: 'asc' },
      })
      res.json({ ok: true, pages })
    } catch (error) {
      next(error)
    }
  })
  ```
- **Security & Integrity:**
  - Only published pages (`isPublished: true`) are returned.
  - Large text fields (`body`) are excluded to keep payload lightweight (< 5KB).
  - Draft or internal administrative pages remain strictly inaccessible.
- **Proposed Test Plan:**
  1. `GET /api/v1/pages` returns HTTP 200 with `{ ok: true, pages: [...] }`.
  2. Un-published / draft pages are verified absent from the array.
  3. Existing route `GET /api/v1/pages/:slug` continues to function with identical payloads and HTTP status codes.
- **Implementation Status:** **PROPOSED ONLY — NOT DEPLOYED.** As instructed, backend APIs are not modified without explicit authorization. Complete dynamic CMS enumeration will be claimed only after this endpoint is approved and deployed.
