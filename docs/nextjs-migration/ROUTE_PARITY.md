# Route parity

Status values: MIGRATED + VERIFIED, MIGRATED + NEEDS QA, LEGACY BRIDGE, BLOCKED, FAILED. Bridge routes are not counted as migrated.

| Route pattern | Status | Notes |
| --- | --- | --- |
| `/category/:categoryId` | MIGRATED + NEEDS QA | App Router redirect to `/shop?category=...`; broader interaction QA outstanding. |
| `/product/:productId` | MIGRATED + NEEDS QA | Public product and related content are in initial HTML. Local guest cart and product expansion checked; real image, full cart/auth and additional product QA remain. |
| `/blog/:slug` | MIGRATED + NEEDS QA | Article body, headings and related content are in initial HTML. TOC, mocked copy and related links checked; real image and additional article QA remain. |
| `/` | MIGRATED + NEEDS QA | Public categories, bestsellers, seasonal products, reviews and configured collections appear in initial HTML; full real-asset and functional QA remains. |
| `/shop` | MIGRATED + NEEDS QA | Category and first product page render in initial HTML; category switches, URL, title and guest navigation checked locally. Full asset and commerce QA remain. |
| `/blog` | MIGRATED + NEEDS QA | Published listing content is in initial HTML; pagination and full visual QA remain. |
| `/p/:slug`, `/about`, `/careers`, `/privacy-policy`, `/terms-and-conditions`, `/help-faqs`, `/returns-policy`, `/support-center` | MIGRATED + NEEDS QA | Public CMS title/body are server-rendered; missing slugs return 404. Full asset and visual QA remain. |
| `/cart`, `/checkout`, `/order/:orderNo`, `/account`, `/login`, `/profile` | LEGACY BRIDGE | Noindex applied; full safe functional regression remains outstanding. |

Fourteen of 20 route patterns have dedicated App Router routes; six remain on the client-only bridge. The migrated detail pages use native Next navigation; legacy bridge routes still use React Router. Unknown patterns and missing product, blog and CMS records return HTTP 404.
