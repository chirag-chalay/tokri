# Route Parity Matrix

All 20 identified patterns have dedicated App Router routes. None uses the legacy React Router bridge.

| Route | App Router | SSR / client strategy | Visual QA | Functional QA | SEO QA |
| --- | --- | --- | --- | --- | --- |
| `/` | MIGRATED | Public catalog SSR, interactive client islands | BLOCKED: real assets | Guest cart, add-to-cart, modal auth passed | Initial SSR HTML checked, header/footer stable |
| `/shop`, `/category/:categoryId` | MIGRATED | Catalog SSR; category redirect and filters | BLOCKED: real assets | Category switching and history sampled | Dynamic metadata, canonicals checked |
| `/product/:productId` | MIGRATED | Public data SSR; client cart | BLOCKED: real assets | Add to cart, counter, localStorage verified | SSR, JSON-LD, 404 checked |
| `/blog`, `/blog/:slug` | MIGRATED | Listing and article SSR; interactive TOC | BLOCKED: real assets | TOC and related navigation sampled | SSR, JSON-LD, 404 checked |
| `/p/:slug`, `/about`, `/careers`, `/privacy-policy`, `/terms-and-conditions`, `/help-faqs`, `/returns-policy`, `/support-center` | MIGRATED | Published CMS SSR | BLOCKED: real assets | Navigation and fallback sampled | Body, canonical, 404 checked; arbitrary CMS sitemap enumeration blocked |
| `/cart` | MIGRATED | Client, private noindex | BLOCKED: real assets | Guest cart display and localStorage sync passed | Noindex checked |
| `/checkout`, `/order/:orderNo` | MIGRATED | Client, private noindex | BLOCKED: real assets | Synthetic COD checkout and order confirmation passed | Noindex checked |
| `/account`, `/login`, `/profile` | MIGRATED | Client, private noindex | BLOCKED: real assets | Synthetic OTP login, profile/orders view, logout passed | Noindex checked |
