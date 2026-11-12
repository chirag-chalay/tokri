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
