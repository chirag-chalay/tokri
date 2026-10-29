# Route parity

Status values: MIGRATED + VERIFIED, MIGRATED + NEEDS QA, LEGACY BRIDGE, BLOCKED, FAILED. A bridge route is not counted as migrated.

| Route pattern | Status | Notes |
| --- | --- | --- |
| `/category/:categoryId` | MIGRATED + NEEDS QA | App Router redirect to `/shop?category=...`; redirect checked locally, broader visual and interaction QA outstanding. |
| `/`, `/shop` | LEGACY BRIDGE | Public page content is not server-rendered. |
| `/product/:productId` | MIGRATED + NEEDS QA | Real product and related content are server-rendered; visual and commerce regression checks remain incomplete. The shared chrome temporarily uses a React Router adapter. |
| `/blog/:slug` | LEGACY BRIDGE | Metadata and missing-record 404 are server handled; article body is client-rendered. |
| `/blog` | LEGACY BRIDGE | Listing is client-rendered. |
| `/p/:slug`, `/about`, `/careers`, `/privacy-policy`, `/terms-and-conditions`, `/help-faqs`, `/returns-policy`, `/support-center` | LEGACY BRIDGE | Content is client-rendered. |
| `/cart`, `/checkout`, `/order/:orderNo`, `/account`, `/login`, `/profile` | LEGACY BRIDGE | Noindex metadata is applied; safe functional regression remains blocked by the read-only API. |

Unknown URL patterns and missing product/blog records return HTTP 404. Missing CMS records still need server-side status handling. The category redirect and product route are two route patterns; 18 remain in the bridge.
