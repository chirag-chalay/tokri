# Tracking implementation and verification

The implementation is prepared on `marketingdimpal`. It has not been deployed, the production schema has not been changed, and the private environment switches have not been enabled. The supplied credentials were not sent to external services during verification.

## Delivered behavior

- Runtime backend configuration supplies public Pixel, GTM and GA4 IDs to both website entry points. CAPI credentials remain backend-only.
- The consent panel saves independent analytics and marketing choices and supports withdrawal. Existing marketing acceptance does not grant analytics permission.
- GTM sends GA4 events; the application's adapter sends Meta Pixel events. The old direct GA loader and hardcoded Pixel/noscript destination are removed.
- Instrumented actions: page views, product details (Next and legacy routes), cart additions/quantity deltas/removals, cart view, checkout entry, payment method submission, sanitized explicit search and confirmed purchases.
- A private order tracking snapshot and deterministic purchase identity connect checkout to the persistent MySQL outbox. COD confirmation creates a purchase; a later payment collection cannot create a second one.
- Online verification, webhook and payment recovery converge on the existing paid-order transition. Recovery scans reconcile missing enqueue attempts after a process interruption.
- CAPI delivery uses leases, bounded retries and stable IDs. Concurrency uses a database duplicate-safe insert. Provider failure does not fail checkout.
- Nonpurchase browser intake uses an HttpOnly cookie/token pair, event allowlists, validation and rate state. It rejects browser-supplied Purchase events.
- Purchase summaries require a verified bearer session and database ownership. Sensitive order routes suppress browser Pixel; GA can recover a purchase using an explicit sanitized page location, and CAPI covers confirmed orders without an open browser.
- Known unsent session/purchase events are removed when consent is withdrawn. Already accepted/in-flight provider requests cannot be recalled.

## Focused verification

| Check | Evidence |
| --- | --- |
| Tracking configuration, payloads, adapter isolation, consent and CAPI transport | 16 focused Node tests passed |
| Persistent purchase lifecycle and API security | Isolated MySQL test passed: concurrent insertion yields one row; unconfirmed COD yields none; signed purchase summary works; unauthenticated request fails; intake rejects forged Purchase/nonce; session withdrawal deletes its pending event; worker marks delivery once; later paid COD collection creates no second row |
| Existing commerce regression | 11 assertions/subtests passed in the existing manual coupon/checkout suite, including quoted/final totals, COD/Razorpay, invoice totals and concurrent coupon reservation |
| Browser UI | Headless Chromium with all Google/Meta traffic intercepted: no tags before consent, exactly one acceptance PageView, purchase suppression on repeat, cookie settings withdrawal, persisted choice, analytics-only isolation |
| Migration | Baseline schema initialized in an isolated database; reviewed tracking SQL applied there; Prisma schema comparison run against that fixture |
| Website builds | Vite production build and isolated Next.js production build passed; live `.next` was not used as the verification output directory |
| Lint | Changed frontend files passed with zero errors; four existing dependency warnings remain in CartContext/CheckoutPage. New backend files checked separately because the repository lint config excludes server files |

The tests used a new temporary MySQL instance on `127.0.0.1:13318`, schema `tokri_manual_coupons_test`, not the production database. Payment provider and Meta delivery were mocked. Browser tests used a local harness mapped to a production-shaped hostname, with all external requests intercepted. They do not prove receipt in the actual Google/Meta accounts.

## Commands

```bash
npm run test:tracking
npm run test:tracking:browser
# CHROME_BIN selects the Chromium executable when needed.
# Some hosts also require their existing browser-library LD_LIBRARY_PATH.

# Destructive fixture tests: only the explicitly guarded isolated database.
DATABASE_URL=mysql://root@127.0.0.1:13318/tokri_manual_coupons_test node --test server/tests/tracking-database.test.js
DATABASE_URL=mysql://root@127.0.0.1:13318/tokri_manual_coupons_test npm --prefix server run test:coupons

TOKRIII_NEXT_DIST_DIR=.next.tracking-verification npm run build:next
npm run build
```

The legacy `verify-meta-pixel` script entrypoints now run the runtime-configured tracking suites. Old hardcoded-ID/direct-GA expectations no longer describe this implementation.

## Activation prerequisites

1. Configure the GTM workspace using [GTM_SETUP.md](GTM_SETUP.md), including the consent template, Google tag, event tags, data-layer variables and exact triggers. An empty GTM container cannot deliver GA4 events.
2. Apply the new schema migration through the deployment workflow **before starting the new backend**. Even with flags off, the generated Prisma client expects the new Order column.
3. Deploy the backend and website, enable the desired environment switches, restart the backend and reload the website.
4. Use dedicated test data/destinations to confirm actual GTM tag firing, GA4 DebugView receipt, Meta Test Events and Pixel/CAPI deduplication. Remove the temporary CAPI test code before normal reporting.

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for the release order, consent template code and operational limitations. Account-side container publishing and production activation are not implied by local code verification.
