# Route parity

One route pattern has been moved to an App Router handler: `/category/:categoryId` returns a redirect to `/shop?category=...`. All other 19 route patterns below remain in the temporary React Router bridge and are not considered converted.

- `/`
- `/product/:productId`
- `/shop`
- `/blog`, `/blog/:slug`
- `/cart`, `/checkout`, `/order/:orderNo`
- `/account`, `/login`, `/profile`
- `/p/:slug`
- `/about`, `/careers`, `/privacy-policy`, `/terms-and-conditions`, `/help-faqs`, `/returns-policy`, `/support-center`

Unknown URL patterns return HTTP 404. Missing dynamic records currently enter the legacy bridge and do not reliably return HTTP 404.
