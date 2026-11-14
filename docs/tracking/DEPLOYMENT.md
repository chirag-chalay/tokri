# Production tracking activation

Tracking was activated on 12 November 2026 from `marketingdimpal`, source revision `8c00511`. No commit or push was made to `main`.

## Applied changes

- Private backups of the backend environment and production database were created outside the web directory before mutation.
- The reviewed `20261112000000_tracking` SQL was applied, required columns were verified, and the migration was marked applied in the existing Prisma migration history.
- The configured Google, Pixel and CAPI providers were enabled in the private backend environment. The temporary Meta CAPI test-event override was cleared for normal production reporting. Credentials remain private and uncommitted.
- The backend process `tokri-server` and frontend process `tokri-frontend` were restarted. PM2 configuration was saved.
- The frontend runs from `.next.marketingdimpal-8c00511`; the preceding `.next` build remains available for rollback. Prior static chunks were retained in the new release to support already-open pages.

## Deployment-specific build settings

This installation runs the backend on port **5173**, not the source default 5223. Next.js rewrites are baked into the build, so the build must receive the proxy target as well as the startup process.

```bash
TOKRIII_API_PROXY_TARGET=http://127.0.0.1:5173 \
TOKRIII_SERVER_API_ORIGIN=http://127.0.0.1:5173 \
TOKRIII_INDEXING_ENABLED=true \
TOKRIII_NEXT_DIST_DIR=.next.marketingdimpal-8c00511 \
npm run build:next
```

The first activation check identified a build produced with the default proxy target. The frontend was restored to the previous build while the corrected release was built, then switched to the corrected release. The final public checks below used that corrected build.

For future releases use a new build directory and supply these same deployment-specific origin settings. Do not rebuild a directory while the live process is serving it.

## Focused live checks

- `https://tokriii.com/api/v1/tracking/config`: HTTP 200, Google and Meta enabled.
- `https://www.tokriii.com/api/v1/tracking/config`: HTTP 200, Google and Meta enabled.
- The published GTM container returned HTTP 200 and included the Tokri consent and purchase configuration.
- A consented homepage visit loaded GTM and produced one application PageView. Google Analytics returned HTTP 204; its measurement ID matched the backend configuration.
- The Meta browser SDK loaded successfully and processed its command queue. A direct browser Pixel collection request was not observed in the headless verification, so that specific browser-to-Meta receipt is not claimed here.
- The visit's CAPI PageView was accepted by Meta and marked delivered in the outbox.
- No browser JavaScript errors were recorded. No checkout, payment, customer login or synthetic purchase was performed on production.

These checks establish live loading and transport acceptance. They do not constitute an inspection of GA4 reports, Meta Events Manager, business account permissions or reported purchase deduplication in those account interfaces.

## Operating notes

Existing browsers may need a hard refresh to use the new release. On the website, select **Analytics only** or **Allow all** before testing Google detection: this implementation waits for analytics consent before loading GTM. Tag Assistant's `gtm_debug` parameter is supported and excluded from event URLs.

Changing IDs requires editing the private backend environment, restarting `tokri-server`, and refreshing the website. Changes to GTM tags require publishing the container. A changed Next rewrite target requires rebuilding the frontend as shown above.

For emergency rollback, disable the tracking switches in the private environment and restart the backend. The prior frontend build can be selected with `TOKRIII_NEXT_DIST_DIR=.next` when restarting `tokri-frontend`; save the intended PM2 state afterward. Keep the additive database schema and delivery audit trail in place. A full source rollback must also account for the generated Prisma client and the existing deployment procedure.

## Search tracking correction

On 12 November 2026, revision `e777075` was deployed from `marketingdimpal` to `.next.marketingdimpal-search-20261112`. The preceding frontend build remains available and its static chunks were retained.

The search box loads results automatically after its debounce, so recording only Enter presses missed normal desktop/mobile use. Tracking now runs when the latest query's successful first result page is displayed. Pagination and repeated Enter presses do not create duplicates; clearing/changing a query invalidates stale responses. Short numeric and multilingual product terms are supported, while email/URL syntax and phone-like input are excluded.

Focused verification: the local browser harness passed automatic search, Enter deduplication and sensitive-input filtering checks. The production build passed. One live search for `apple` produced exactly one `search` data-layer event and a Google Analytics HTTP 204 response; pressing Enter produced no second event. PM2 was saved after activation. This frontend-only correction required no new schema change, backend restart or GTM container import.

## Monitoring merge deployment

On 12 November 2026, revision `3662975` from `marketingdimpal` was deployed after merging staging and the admin-logs branch. Both PM2 services were restarted and their configuration was saved:

- Backend: `tokri-server`; Prisma client regenerated with the merged schema.
- Frontend: `tokri-frontend`, serving `.next.marketingdimpal-logs-3662975`, built with the installation's backend origin/proxy target `http://127.0.0.1:5173`.
- Monitoring SQL: `server/prisma/sql/monitoring-outbox.sql` applied explicitly; both operational tables, the budget row, and transactional storage requirements were verified. No reset or unrestricted schema push was used.
- Private log storage and bounded outbox settings were configured outside the web directory; debug defaults OFF and may be enabled temporarily through the authorized admin controls.
- Production AdminJS initialization regenerated the component bundle with the new readable event details and debug controls. The prior generated bundle, environment, database and PM2 state were backed up privately before deployment.
- The preceding frontend release and its static chunks remain available for rollback. Existing Google/Meta tracking enablement was retained.

Focused live checks returned HTTP 200 for the homepage, API health, one-product catalog request, admin login, tracking configuration and monitoring status. Both services reported online. The generated admin bundle contained the monitoring controls/readable-details components; the authenticated admin page itself was not exercised. No orders, payments or customer logins were created for this deployment check.

## Coupon schema repair

After activation, the Coupon admin list and cart quote lookup exposed Prisma error P2022: production was missing the optional `Coupon.knowMoreHtml` field already expected by the generated client. This prerequisite was missed by the earlier table-specific deployment checks.

The Coupon table was backed up privately, then the existing additive `20261105000000_coupon_know_more_html` migration was applied and recorded in Prisma migration history. SQL dump comparison verified all four pre-existing coupon records retained their values. The full Prisma Coupon list/count queries succeeded, and a read-only live cart quote for an active product returned HTTP 200 with numeric totals. No coupon records, orders or payments were created by verification; no service restart was required for the additive column repair.

A metadata-only deployment preflight is now available:

```bash
npm --prefix server run build
npm --prefix server run db:check-columns
```

Run it after generating the intended release's client and applying reviewed migrations, before restarting the backend. It reports missing mapped model/table columns and exits nonzero without changing the database. It is a presence check, not a replacement for reviewing types, indexes and migration behavior.

## Meta Event Setup Tool investigation

On 12 November 2026, the owner confirmed that “No events found on this Page” appeared in the Event Setup Tool overlay. The application's events are instrumented in code; the overlay's button/URL rule list is not the delivery audit for those calls. No duplicate overlay rules or second Pixel installation were added.

Focused production evidence for Pixel `2135182350433128`:

- Before marketing consent, the fresh homepage had no `fbq` loader or marketing consent cookie.
- After selecting **Marketing only**, a browser with a normal Chrome user agent sent `PageView` to `www.facebook.com/tr/`; the response was HTTP 200. The SDK reported one event on the configured Pixel.
- The corresponding CAPI intake returned HTTP 202. The same event ID (`6dd9ad2a-fa21-42fd-8218-341c62937153`) was marked delivered on its first attempt at `2026-11-12T18:41:54.983Z`. The sender only marks delivery after Meta returns `events_received: 1` without a provider error.
- The queue had zero pending deliveries. Earlier delivered events included PageView, ViewContent, AddToCart and InitiateCheckout.
- The initial automation run loaded the SDK/config but did not produce a browser collection request. The SDK includes bot detection; the subsequent normal-browser-profile check established actual browser transport receipt. The application's tracking code was unchanged.

This verifies browser transport and server acceptance using a shared event ID. Events Manager reporting and account-side deduplication were not inspected. The temporary CAPI test-event code remains empty, so normal server deliveries should not be assumed to appear in the Test Events panel.

To check browser events, open the correct Pixel/dataset's **Test events** view, visit the website, and choose **Allow all** or **Marketing only**. **Analytics only** does not enable Pixel/CAPI. The Event Setup Tool overlay does not need matching manual rules for the already instrumented commerce events; adding such rules could introduce duplicates.

At the time of that investigation, scroll depth was not an application event in the implementation's event map.

## Meta scroll tracking

The scroll change records a custom Meta `Scroll` event once per route when a visitor scrolls 90% of the document or the shop's designated product panel, after marketing consent. Both mobile and desktop shop panels are covered. Pixel and CAPI use the same event name and ID for deduplication. A fresh route resets the threshold. The website also supplies a separate `tokri_scroll` event when analytics is allowed; the GTM tag must be configured and published as described in [GTM_SCROLL_SETUP.md](GTM_SCROLL_SETUP.md).

## Mobile tracking backend deployment — 14 November 2026

Backend revision `fa7f4a0` on `marketingdimpal` was activated on 14 November 2026. A private database dump, backend source/environment archive and PM2-state snapshot were saved outside the web directory before applying changes. The reviewed additive `20261114000000_tracking_purchase_lookup` SQL was applied explicitly and marked in Prisma migration history; no reset or broad schema push was used. The full generated-client column preflight passed afterward.

`tokri-server` was reloaded and PM2 state saved. The frontend continued serving its existing release; this deployment did not rebuild the storefront or publish a native app. Both PM2 services reported online after the backend reload.

Focused verification: 29 tracking tests passed before deployment. Public health, catalog, checkout quote with numeric totals, admin login, homepage and existing website tracking configuration returned HTTP 200. `/api/v1/checkout/app-tracking-config` returned `{ "enabled": true, "metaEnabled": true }`. The mobile purchase GET and dispatch POST returned HTTP 401 without customer authentication. No customer login, order, payment or synthetic purchase event was created for these checks.

The mobile SDK implementation still requires the publisher to configure the private Firebase files and Meta build variables in EAS, produce signed Android/iOS builds and verify Google DebugView/Meta Test Events on devices. Generated native configuration and JavaScript exports do not prove iOS Firebase/Meta linking, SDK credential acceptance, event receipt, install attribution or catalog matching. Backend deployment does not update installed apps. iOS Meta collection currently requires marketing consent plus ATT authorization; ATT-denied aggregate measurement is not implemented.

The native SDK send boundary remains uncertain after a crash: backend claims prevent automatic duplicate dispatch but can leave an event unsent. The admin reconciliation response exposes dispatch state to help investigate this case. Dependency advisories also remain for release review.
