# Next.js migration progress

The owner confirmed `live-sync-2026-10-27` as the latest live source. The migration starts from commit `3c11c4a` and includes the analytics filename fix. GitHub staging also includes the same fix and later mobile-only changes; those mobile changes were not imported.

Next.js 16 is installed alongside the existing Vite app. The App Router root layout reuses the existing global CSS and font. A temporary client-only bridge renders the current React Router application; it is not the completed migration and produces no indexable product or blog HTML. The `/category/:categoryId` redirect is an App Router route. Unknown route patterns return 404, but missing product, blog and CMS records still need proper server-side status handling.

Local commands: `npm run dev` (Vite, 5222), `npm run build:next`, and `npm run start:next` (Next.js, 3000). The Next proxy targets the local API by default; `TOKRIII_API_PROXY_TARGET` can select another API. This is a development foundation and is not deployment-ready. Analytics is disabled unless `TOKRIII_GA_MEASUREMENT_ID` is explicitly set at build time.

For these checks, the API used the restored local database through a read-only account and a local outbound network guard. No order, payment or OTP operation was tested. Product imagery used existing backend data and upload fallback.

Homepage captures are in `before/`, `after/`, and `diff/` at 1440×900, 768×1024 and 390×844. These are viewport-only comparisons, not full-page or complete route parity checks. The 390×844 capture matched exactly; the 1440×900 and 768×1024 captures differed by 53 and 68 pixels respectively. The cause of these small differences has not been investigated. Other requested resolutions and flows remain untested.

Next: migrate providers and the shared shell from React Router to App Router, then move indexable routes to server-rendered data with dynamic metadata, valid 404s, structured data, sitemap and robots. Verify all interactions and requested visual states before a staging PR is marked ready.

## Public data and crawl controls

A server-only, unauthenticated, no-store public API layer now backs request-time product/blog metadata and the sitemap. Existing product/blog pages are still rendered by the React Router bridge; this is not an SSR migration. Missing product and blog records now return 404. `/robots.txt` disallows all crawling unless indexing is explicitly enabled and the request uses a production hostname. Root metadata also defaults to noindex; private bridge routes remain noindex even when public indexing is enabled.

Local validation: `npm run build:next`, targeted ESLint, and `node scripts/verify-next-seo.mjs` passed against the read-only local API. Sitemap XML contained 64 active product URLs, 8 category query URLs, and 8 published blog URLs in the restored local data. A simulated unavailable API returned 503 for the sitemap. An explicit production-host/opt-in simulation on localhost checked private-route noindex. These are not full SEO, visual or functional regression results.

## Product detail SSR batch

`/product/[productId]` now fetches public catalog data on the server and renders its actual product view and related products in the initial HTML. Its route-specific shell reuses the existing providers and chrome with a temporary React Router-to-Next navigation adapter. The header/footer and cart controls mount after hydration to avoid leaking stored customer state into server output; the legacy Routes tree is not mounted on this route. Product detail expansion and guest cart add/increment/persistence were checked locally. Authenticated cart, checkout and real payment/OTP behavior remain untested.

Three locally available products (blueberry-tube, pear-beauty-red and star-fruit) produced server HTML containing their name, price, weight and image. Product JSON-LD uses the public API values. HTML descriptions are sanitized before server insertion. A desktop full-page screenshot with external image/font requests deliberately blocked matched the React baseline pixel-for-pixel; this does not verify production images or the remaining required viewports. Initial SSR image fallback needed an explicit recovery for failures that happened before hydration.

## Product and blog detail SSR

Dedicated App Router pages now render the product detail and blog article bodies in initial HTML, with no legacy Routes tree on those pages. The shared shell uses the existing providers and a temporary React Router-to-Next navigation adapter; header, footer and cart controls are mounted after hydration. The legacy bridge reloads into the new routes when navigating to them. This shell is incremental and still needs broader history, authentication and cart QA.

Real local data checks: blueberry-tube, pear-beauty-red and star-fruit had their product H1, price, weight, image source and available description in the HTML. A real published blog article had its article H1, body, headings and image source in HTML. Missing product and blog slugs returned 404. Product and BlogPosting JSON-LD were added without invented ratings or availability. Rich text is sanitized before server rendering; TOC IDs are generated server-side.

Full-page before/after captures were compared at 1920, 1440, 1366, 1024, 768, 430, 390, 375, 360 and 320px widths for the blueberry product and pineapple article. The recorded screenshots are pixel-identical in the test environment. Expanded product details were compared at 1440 and 390px, and expanded mobile article TOC at 390px; those captures also matched. External network requests, including production images and Google Fonts, were intentionally blocked for these tests. Therefore actual image and font parity is not established; other products, articles, interaction states and the previously noted homepage pixel differences still require QA.

Local guest cart add, increment and persistence, product detail expansion, article TOC, a mocked clipboard copy, related-article navigation, and navigation from the legacy home/blog listing into the dedicated routes were exercised. Authenticated cart, checkout, OTP, payment and actual production image requests were not tested. An initial browser check loaded public production-hosted image URLs before external requests were blocked; subsequent comparisons blocked external requests. No server configuration or data was changed.

## Shared navigation batch

The migrated-route shell now uses native Next navigation through a shared navigation interface. Legacy React pages retain their React Router provider until they are migrated. Product and blog detail routes share a route-group layout, so their provider tree persists when navigating between those pages; transitions into the legacy bridge still remount it and require more QA. Header and footer remain client-mounted after hydration to avoid exposing stored customer state; eliminating that flash safely remains open.

Local checks: Next and Vite builds, targeted lint, SEO smoke test, product-to-product navigation, browser back, guest cart persistence, and one-header/one-footer checks passed. Desktop and mobile product screenshots were pixel-identical with external assets blocked. Real media/font parity and authenticated flows remain blocked. Vite now excludes `.next` from its watcher; a Next build produced no Vite reload log.

## Homepage batch

The `/` route now has a dedicated App Router page. The initial HTML includes categories, bestsellers, featured products, reviews, and configured category collections from the public API. Existing components and CSS remain in use; interaction runs in Client Components. Only the public homepage fields are passed to the browser. The legacy Vite app remains available for comparison.

The local SSR smoke test and Next/Vite builds passed; a browser test checked guest add-to-cart, product navigation, back navigation, one header/footer and no observed hydration errors. All configured collections appeared in initial HTML. Visual testing is incomplete: the local media directories do not contain the catalog images and external requests were blocked before navigation. Controlled full-page comparisons at 1440, 768 and 390 showed differences in image-fallback rendering, plus small desktop differences. The required real-image/font comparison and remaining viewports have not passed. The earlier homepage screenshot differences remain unresolved.

## Shop batch

`/shop` now has a dedicated App Router page. Public category data and the first product page are included in initial HTML, while the existing client shop component continues to handle the category rail, scrolling and pagination. Known category query URLs generate backend-derived titles and canonicals; unknown query values retain the existing first-category fallback. The Next shell uses the same route-specific footer and cart-bar visibility as the legacy shop.

Local checks covered desktop and mobile category switches, product ordering against the local API, category URL/title/canonical updates, guest cart persistence, product navigation and browser back. Targeted lint, Next and Vite builds, and SSR/SEO smoke checks passed. Controlled screenshots at 1440, 768 and 390px were pixel-identical with external assets blocked; real-image/font parity and the remaining viewports are unverified. The local server never used production credentials or external messaging/payment calls.

For the Next homepage, a successful but empty public API list no longer substitutes the legacy hardcoded fallback products or reviews in server output; API failure does not produce a fabricated indexable catalog. The original Vite defaults remain available for the legacy app.

## Blog listing and CMS batch

`/blog`, `/p/[slug]` and the seven named CMS URLs now have dedicated App Router pages. The listing and published CMS title/body are present in initial HTML, with API-derived titles and canonical URLs. Missing CMS slugs return HTTP 404. CMS rich text is sanitized before server rendering. The sitemap now includes the named CMS routes only when their corresponding public API records exist; the existing API does not expose a public list of arbitrary `/p/` slugs.

Local API/HTML checks covered all seven named CMS pages, the `/p/about` alias, an invalid CMS slug, and the blog listing. Blog-list-to-article, back navigation and CMS-to-home were exercised. About and blog-list full-page screenshots matched at 1440 and 390px with external requests blocked. Actual images/fonts, other CMS pages' visual states, and remaining viewports still need QA.
