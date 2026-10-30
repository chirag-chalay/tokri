# Route parity

All 20 identified patterns have dedicated App Router routes. None uses the legacy React Router bridge. Status is MIGRATED + NEEDS QA throughout: screenshots with external assets blocked cannot establish approved visual parity.

| Route | App Router | SSR / client strategy | Visual QA | Functional QA | SEO QA |
| --- | --- | --- | --- | --- | --- |
| `/` | MIGRATED + NEEDS QA | Public catalog SSR, interactive client islands | BLOCKED: real assets; homepage differences remain | Guest cart and navigation sampled | Initial HTML checked |
| `/shop`, `/category/:categoryId` | MIGRATED + NEEDS QA | Catalog SSR; category redirect and filters | BLOCKED: real assets | Category switching and history sampled | Category metadata/canonical checked |
| `/product/:productId` | MIGRATED + NEEDS QA | Public data SSR; client cart | BLOCKED: real assets | Expansion, guest cart and navigation sampled | SSR, JSON-LD, 404 checked |
| `/blog`, `/blog/:slug` | MIGRATED + NEEDS QA | Listing and article SSR; interactive TOC | BLOCKED: real assets | TOC and related navigation sampled | SSR, JSON-LD, 404 checked |
| `/p/:slug`, `/about`, `/careers`, `/privacy-policy`, `/terms-and-conditions`, `/help-faqs`, `/returns-policy`, `/support-center` | MIGRATED + NEEDS QA | Published CMS SSR | BLOCKED: real assets; only selected pages captured | Navigation sampled | Body, canonical and 404 checked; arbitrary CMS sitemap enumeration blocked |
| `/cart` | MIGRATED + NEEDS QA | Client, private noindex | BLOCKED: real assets | Guest flow sampled; authenticated flow incomplete | Noindex checked |
| `/checkout`, `/order/:orderNo` | MIGRATED + NEEDS QA | Client, private noindex | BLOCKED: real assets | Synthetic COD quote/order confirmation checked; coupon, payment and full totals QA incomplete | Noindex checked |
| `/account`, `/login`, `/profile` | MIGRATED + NEEDS QA | Client, private noindex | BLOCKED: real assets | Synthetic OTP login and logout checked; broader session and account QA incomplete | Noindex checked |
