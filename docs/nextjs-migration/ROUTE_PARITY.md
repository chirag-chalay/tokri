# Route parity

Status values: MIGRATED + VERIFIED, MIGRATED + NEEDS QA, LEGACY BRIDGE, BLOCKED, FAILED. Bridge routes are not counted as migrated.

| Route pattern | Status | Notes |
| --- | --- | --- |
| `/category/:categoryId` | MIGRATED + NEEDS QA | App Router redirect to `/shop?category=...`; broader interaction QA outstanding. |
| `/product/:productId` | MIGRATED + NEEDS QA | Public product and related content are in initial HTML. Local guest cart and product expansion checked; real image, full cart/auth and additional product QA remain. |
| `/blog/:slug` | MIGRATED + NEEDS QA | Article body, headings and related content are in initial HTML. TOC, mocked copy and related links checked; real image and additional article QA remain. |
| `/` | MIGRATED + NEEDS QA | Public categories, bestsellers, seasonal products, reviews and configured collections appear in initial HTML; full real-asset and functional QA remains. |
| `/shop` | LEGACY BRIDGE | Public page content is not server-rendered. |
| `/blog` | LEGACY BRIDGE | Listing is client-rendered. |
| `/p/:slug`, `/about`, `/careers`, `/privacy-policy`, `/terms-and-conditions`, `/help-faqs`, `/returns-policy`, `/support-center` | LEGACY BRIDGE | Content is client-rendered. |
| `/cart`, `/checkout`, `/order/:orderNo`, `/account`, `/login`, `/profile` | LEGACY BRIDGE | Noindex applied; full safe functional regression remains outstanding. |

Four of 20 route patterns have dedicated App Router routes; 16 remain on the client-only bridge. The migrated detail pages use native Next navigation; legacy bridge routes still use React Router. Unknown patterns and missing product/blog records return HTTP 404; missing CMS records need server-side status handling.
