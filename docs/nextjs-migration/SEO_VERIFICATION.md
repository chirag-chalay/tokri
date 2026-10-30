# SEO verification

This application is not yet SEO-ready overall. Product and article details now render their visible content in the initial HTML; the homepage also renders public catalog content in initial HTML; shop category and first-page product content also render in initial HTML; blog listing and CMS pages remain in the client-only bridge. Shop query categories now have dynamic metadata and query-specific canonicals; CMS missing-record 404 handling remains incomplete. Product breadcrumbs use its existing navigation data.

Local checks:

- `node scripts/verify-next-seo.mjs` inspects the actual initial HTML, not hydration data. It verifies real product/article H1s, product price, weight and image, article paragraphs, heading IDs and image when present, canonical URLs, metadata, JSON-LD and missing-record 404s. It checks the three requested product slugs when they exist in the local data.
- Product JSON-LD contains API-derived name, description, image and offer price/currency where present. It does not invent ratings or availability. BlogPosting uses the API title, excerpt, image, publication date and author where supplied.
- `/sitemap.xml` reads public products, categories and published blogs dynamically; API failure returns HTTP 503. The sitemap query-category URLs match the corresponding shop canonicals; broader crawler QA remains outstanding.
- `/robots.txt` disallows crawling on localhost and preview hosts. Public crawling requires `TOKRIII_INDEXING_ENABLED=true` and a production hostname. Root metadata defaults to noindex outside that combination. Cart, checkout, login, profile, account and order paths remain noindex.

These tests do not establish full-site SEO correctness or production image access. Do not deploy this intermediate state.
