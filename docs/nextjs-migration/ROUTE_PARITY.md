# Route parity

Status values: MIGRATED + VERIFIED, MIGRATED + NEEDS QA, LEGACY BRIDGE, BLOCKED, FAILED. A bridge route is not counted as migrated.

| Route pattern | Status | Notes |
| --- | --- | --- |
| `/category/:categoryId` | MIGRATED + NEEDS QA | App Router redirect to `/shop?category=...`; redirect checked locally, broader visual and interaction QA outstanding. |
| `/`, `/shop` | LEGACY BRIDGE | Public page content is not server-rendered. |
| `/product/:productId`, `/blog/:slug` | LEGACY BRIDGE | Dynamic metadata and missing-record 404 are handled on the server; visible content still uses React Router and is not in initial HTML. |
| `/blog` | LEGACY BRIDGE | Listing is client-rendered. |
| `/p/:slug`, `/about`, `/careers`, `/privacy-policy`, `/terms-and-conditions`, `/help-faqs`, `/returns-policy`, `/support-center` | LEGACY BRIDGE | Content is client-rendered. |
| `/cart`, `/checkout`, `/order/:orderNo`, `/account`, `/login`, `/profile` | LEGACY BRIDGE | Noindex metadata is applied; safe functional regression remains blocked by the read-only API. |

Unknown URL patterns and missing product/blog records return HTTP 404. Missing CMS records still need server-side status handling. The category redirect is one route pattern; 19 remain in the bridge.
