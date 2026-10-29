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
