# SEO verification

This application is not yet SEO-ready overall. Product and article details now render their visible content in the initial HTML; the homepage also renders public catalog content in initial HTML; shop category and first-page product content, blog listing and CMS body content also render in initial HTML. Shop query categories have dynamic metadata and query-specific canonicals; missing CMS records return 404. Product breadcrumbs use its existing navigation data. CMS metadata uses only published API content.

Local checks:

- `node scripts/verify-next-seo.mjs` inspects the actual initial HTML, not hydration data. It verifies real product/article H1s, product price, weight and image, article paragraphs, heading IDs and image when present, canonical URLs, metadata, JSON-LD and missing-record 404s. It checks the three requested product slugs when they exist in the local data.
- Product JSON-LD contains API-derived name, description, image and offer price/currency where present. It does not invent ratings or availability. BlogPosting uses the API title, excerpt, image, publication date and author where supplied.
- `/sitemap.xml` reads public products, categories and published blogs dynamically; API failure returns HTTP 503. The sitemap query-category URLs match the corresponding shop canonicals; broader crawler QA remains outstanding.
- `/robots.txt` disallows crawling on localhost and preview hosts. Public crawling requires `TOKRIII_INDEXING_ENABLED=true` and a production hostname. Root metadata defaults to noindex outside that combination. Cart, checkout, login, profile, account and order paths remain noindex.

These tests do not establish full-site SEO correctness or production image access. Do not deploy this intermediate state.

- The sitemap includes published named CMS routes. Arbitrary `/p/` pages cannot be enumerated by the current public API.

## Current route coverage

All identified route patterns now use dedicated App Router routes; the Next React Router bridge has been removed. The production-build smoke test checks private route HTTP responses and noindex, plus an unknown-route 404. Browser smoke checks observed no page errors on the sampled private routes. Full production SEO validation remains incomplete, and arbitrary CMS page sitemap enumeration remains blocked by the existing API contract.
