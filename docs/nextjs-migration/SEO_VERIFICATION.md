# SEO verification

The migration is not SEO-ready. The React Router bridge remains client-only; blog page bodies, homepage and shop content are absent from initial HTML. Product content is present in initial HTML. Dynamic category metadata, structured data, CMS metadata and CMS missing-record 404 handling remain incomplete.

Completed local checks:

- Product and article dynamic titles, canonical URLs and Open Graph titles use data from the public API; nonexistent slugs return HTTP 404. The product route is server-rendered; the article route remains a bridge route.
- `/sitemap.xml` reads public products, categories and published blogs dynamically. Local XML parsing checked 64 product, 8 category and 8 blog links, with no private URLs. An API outage returned HTTP 503 instead of a misleading partial sitemap.
- `/robots.txt` disallows all crawlers on localhost and preview hosts. Enabling public crawling requires `TOKRIII_INDEXING_ENABLED=true` and a production hostname. Root metadata defaults to noindex outside that combination. Cart, checkout, login, profile, account and order paths explicitly remain noindex.
- `node scripts/verify-next-seo.mjs` exercises metadata, missing-record statuses, preview noindex and sitemap/robots against the safe local API. It checks a product H1, price, image and Product JSON-LD, but does not yet check article-body SSR or complete SEO correctness.

All category canonical behavior, SEO body output, Article/Breadcrumb JSON-LD and production indexing behavior require further implementation and verification. Do not deploy this intermediate state.
