# Tracking Setup Guide: Meta Pixel, GTM, GA4 and CAPI

Status: code is prepared and tested locally. Production activation requires the database migration, website/backend deployment and GTM container configuration below. Live Google/Meta receipt has not been verified.

Implementation design: [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md).

## 1. What will be configurable

The proposed source of truth is `server/.env`. The backend will expose only public IDs and switches to the website. CAPI credentials remain private. The first integration needs a normal code release and migration; later tracking ID edits need a backend restart and browser reload, without rebuilding the website.

The current website/build variables and Expo application variables continue to have their existing behavior until migrated. These tracking settings do not remotely update installed native apps.

## 2. Collect the account details

| Item | Where to find or create it | Example shape |
| --- | --- | --- |
| Meta Pixel/dataset ID | Meta Events Manager, selected web data source settings | Numeric ID |
| CAPI access token | Selected data source's Conversions API manual/direct integration setup, subject to account permissions | Private token; keep in backend environment |
| CAPI test code | Selected data source's Test Events interface | Temporary test value |
| GTM container ID | Google Tag Manager, selected Web container | `GTM-...` |
| GA4 measurement ID | Google Analytics, Admin, intended Web data stream | `G-...` |

Account interface labels may change. Confirm the correct business, website/data source, property and stream; an account ID is not interchangeable with a measurement/container ID. Keep the production and test destinations distinct. Never put the access token in any `VITE_`, `NEXT_PUBLIC_`, or `EXPO_PUBLIC_` variable.

## 3. Backend environment template

Add the following to the private `server/.env` used by the actual backend process. Keep provider flags off until destinations and tests are ready.

```dotenv
TRACKING_ENABLED=false
TRACKING_ALLOWED_HOSTS=tokriii.com,www.tokriii.com
TRACKING_GTM_ENABLED=false
TRACKING_GTM_CONTAINER_ID=GTM_REPLACE_WITH_VALID_ID
TRACKING_GA4_MEASUREMENT_ID=G_REPLACE_WITH_VALID_ID
TRACKING_META_PIXEL_ENABLED=false
TRACKING_META_PIXEL_ID=REPLACE_WITH_NUMERIC_ID
TRACKING_CURRENCY=INR
TRACKING_CONFIG_VERSION=1
META_CAPI_ENABLED=false
META_CAPI_ACCESS_TOKEN=REPLACE_PRIVATELY
META_CAPI_API_VERSION=REPLACE_WITH_SUPPORTED_VERSION
META_CAPI_TEST_EVENT_CODE=
```

The placeholder IDs intentionally do not pass validation. Replace them with real IDs, including their correct hyphenated prefixes. Do not append duplicate definitions: edit the existing key. If a process manager or hosting environment also defines a key, update that source too; dotenv normally preserves an already supplied process variable.

`server/.env` is ignored by Git. The root `.env.production` is tracked in this repository, so private tokens must not be stored there. Commit placeholder documentation only.

## 4. GTM web-container setup

Default ownership: GTM sends GA4; the application sends Meta Pixel; Express sends CAPI.

1. Create or select the website's Web container and work in an unpublished workspace.
2. Create a Data Layer Variable, version 2, named `DLV - GA4 Measurement ID`, reading `tracking.ga4_measurement_id`. The application must push this configuration before loading GTM. Use this variable as the Google tag's ID so runtime ID changes do not require editing a hardcoded GTM constant.
3. Create data-layer variables for `page_location`, `page_path`, `page_title`, `event_id`, and the `ecommerce` object/needed fields. Add variables only for the documented allowlisted event schema.
4. Install/configure the chosen consent template on Consent Initialization using GTM's consent APIs. Initialize denied defaults before measurement. Apply analytics and marketing choices independently; consent updates must be processed before dependent tags fire.
5. Create one Google tag using the runtime ID variable. Disable its automatic initial page view because the application owns manual `page_view` events. Require analytics consent.
6. Create custom-event triggers/tags for the exact application names: `page_view`, `view_item`, `search`, `add_to_cart`, `remove_from_cart`, `view_cart`, `begin_checkout`, `add_payment_info`, and `purchase`. Pass ecommerce data using the data layer. Map page fields for page views and `search_term` for search. Restrict triggers to these names rather than an unrestricted catch-all.
7. Do not add a GTM History Change page-view tag alongside application route events. Review GA4 Enhanced Measurement history-based page tracking and turn it off when it would duplicate manual route events. Review automatic search collection too.
8. Do not install a Meta Pixel tag for the same events in this container. Do not retain a second direct GA implementation when GTM owns GA4.
9. Use Preview/Tag Assistant to verify actual variable resolution, consent, initialization ordering and single delivery. Publish only the reviewed workspace after testing.

See Google's [data layer guide](https://developers.google.com/tag-platform/tag-manager/datalayer) and [ecommerce guide](https://developers.google.com/analytics/devguides/collection/ga4/ecommerce) for the event model; use the [consent guide](https://developers.google.com/tag-platform/security/guides/consent) for template/API behavior.

## 5. GA4 account checks

- Select the web stream matching the intended production website and confirm the measurement ID.
- Confirm the stream receives the planned manual page and ecommerce events through GTM.
- Check `purchase` processing and key-event configuration as appropriate for the property's reporting needs.
- Verify product IDs, quantities, INR currency, discounts, item revenue, tax, shipping and transaction IDs against a known fixture order. The transaction ID will be a stable opaque backend tracking ID, not a raw order URL.
- Review automatic page/search measurement and internal/developer filters so test traffic does not distort production reports.
- Use DebugView for test sessions. Standard reporting can lag; an empty immediate report alone does not establish delivery failure.

## 6. Meta Pixel and CAPI checks

1. Confirm the Pixel ID and the CAPI destination refer to the same intended data source.
2. Put the token in the backend environment only. Choose and pin a currently supported Graph API version when implementing/testing.
3. Review Events Manager automatic events and automatic matching. Explicit application events must not be duplicated by account-side automatic rules.
4. Use a dedicated test destination or isolated browser interception. Set a CAPI Test Events code only for a test run against the intended test configuration; it does not automatically make browser Pixel traffic harmless production traffic.
5. Verify matching Meta event names and event IDs across browser/server pairs, plus amount, currency and item IDs. A confirmed purchase must survive webhook retries without a new purchase ID.
6. Check Test Events, diagnostics and deduplication evidence. A successful HTTP response alone does not prove correct matching or reporting.
7. Remove the temporary test code and verify the intended destination before production activation.

Meta references: [Using the API](https://developers.facebook.com/docs/marketing-api/conversions-api/using-the-api/) and [deduplication](https://developers.facebook.com/docs/marketing-api/conversions-api/deduplicate-pixel-and-server-events/). Both URLs were rate-limited during planning; verify their current requirements during implementation.

## 7. Event verification checklist

| Action | Expected outcome |
| --- | --- |
| Fresh visit, no choice | Consent interface; no vendor loading or forwarded events |
| Reject all and reload | Choice persists; no subsequent tracking |
| Allow analytics only | GA events permitted; Meta Pixel/CAPI blocked |
| Allow marketing only | Pixel/CAPI permitted; GA blocked |
| Allow both, browse routes | One page event per intended navigation per destination |
| View a product, add quantity 2, remove quantity 1 | Correct item identity and quantity deltas; no events from cart hydration |
| Open checkout and choose a payment method | Correct checkout/payment-info events |
| Complete online payment | One backend-confirmed purchase; matching Pixel/CAPI identity |
| Confirm COD then collect cash/QR later | One purchase total, using the planned COD confirmation definition |
| Fail/cancel online payment | No purchase |
| Reload success page; resend webhook; run recovery | No additional purchase |
| Withdraw consent | Subsequent adapter sends stop; unsent server events honor known withdrawal |
| Restart backend with pending CAPI delivery | Pending event retries with original ID/time/destination |
| Change IDs and restart backend, reload browser | New IDs load without website rebuild; old destination events are handled explicitly |
| Open staging/local host | No production tracking |

## 8. Applying a future environment change

1. Edit the private environment used by the correct backend process.
2. Increment `TRACKING_CONFIG_VERSION` when IDs/destinations change.
3. Restart that backend using its actual process manager. Do not start a second backend process or assume its port from old README examples.
4. Inspect `/api/v1/tracking/config` and confirm only intended public values are present.
5. Refresh the website and inspect vendor requests/IDs with consent granted for the test.
6. Verify delivery in the relevant tools. Existing tabs require reload; environment edits cannot rewrite already loaded vendor scripts.

Changing GTM tag logic still requires a container publish. Changing frontend event code still requires a website release. Changing Expo app bundles still requires an app release. CAPI token rotation stays backend-only and requires restarting the backend.

## 9. Troubleshooting

| Symptom | Check |
| --- | --- |
| GA receives nothing | Tracking flags, analytics choice, runtime ID, published GTM version, variable ordering, blockers |
| Duplicate page views | Direct GA plus GTM, automatic Google-tag page view, Enhanced Measurement history tracking, duplicate route hooks |
| Duplicate Meta purchases | Duplicate GTM Pixel, automatic events, mismatched browser/server IDs or event names, missing outbox uniqueness |
| CAPI authentication failure | Private token permissions, selected dataset, token validity, supported pinned API version |
| ID edit has no effect | Wrong environment file/process, process-manager override, missing restart, stale tab, config cache |
| Payment succeeds but tracking fails | Inspect redacted outbox state/retry reason; preserve successful order processing |
| Native app unchanged | Server `.env` does not update installed React Native code; native measurement is separate scope |

## 10. Readiness record

Record the following before relying on reporting: released code revision, database migration, backend configuration version (no secrets), published GTM version, test destinations, consent test results, a fixture transaction ID, Pixel/CAPI deduplication evidence, GA4 DebugView evidence, and rollback owner.


## 11. Release order for this implementation

1. Back up the production database through the established deployment process.
2. Apply `server/prisma/migrations/20261112000000_tracking/migration.sql` through the existing migration workflow. It adds `Order.trackingContext` and the `TrackingDelivery` outbox table; it does not change order totals. Do not run an unrestricted schema push against production.
3. Generate the backend Prisma client with `npm --prefix server run build`. Deploy the backend and website code together. The migration must precede either starting the new backend or generating/using its new Prisma client in a running process: Prisma may select the new optional column even while tracking is disabled.
4. Build the website with the existing deployment process. `TOKRIII_NEXT_DIST_DIR` can select an isolated Next build directory for verification; its default stays `.next`.
5. Configure GTM using the consent template notes below and the runtime measurement-ID variable. Publish the reviewed container.
6. Enable the required switches in the backend environment, restart the backend, and refresh the website. Use dedicated test data/destinations first. Remove any CAPI test-event code before normal production reporting.
7. Verify receipt in GTM Preview, GA4 DebugView and Meta Test Events. Confirm dataset and measurement-ID ownership; format validation does not prove account access.

### GTM consent template wiring

The application pushes initial `tracking_consent` data before loading GTM and sends `tokri_consent_update` when choices change. A consent template must read the state using GTM APIs, rather than relying only on queued `gtag` consent commands.

Create a custom consent tag template with a dropdown field named `mode` (`default` or `update`). Its sandboxed code is:

```javascript
const copyFromDataLayer = require('copyFromDataLayer');
const setDefaultConsentState = require('setDefaultConsentState');
const updateConsentState = require('updateConsentState');
const raw = copyFromDataLayer('tracking_consent', 2) || {};
const state = {};
['analytics_storage', 'ad_storage', 'ad_user_data', 'ad_personalization'].forEach(function(key) {
  state[key] = raw[key] === 'granted' ? 'granted' : 'denied';
});
if (data.mode === 'update') updateConsentState(state);
else setDefaultConsentState(state);
data.gtmOnSuccess();
```

Grant the template only the necessary data-layer read and consent-state permissions. Create a default-mode tag triggered on Consent Initialization, and an update-mode tag triggered by the exact Custom Event `tokri_consent_update`. Consent tags must themselves run without a consent requirement. All GA event tags require analytics consent.

On the Google tag set configuration parameter `page_location` to the `page_location` data-layer variable and `send_page_view` to false. The event tag must also use the explicit sanitized `page_location` and `page_path`. This is especially important for purchase recovery on the order-success page. Disable automatic history page views and review Enhanced Measurement URL/search collection for this manual-event setup.

### Delivery behavior and operational limits

- CAPI Purchase uses the confirmed grand total; GA merchandise value excludes shipping/tax and uses per-unit discounted item values. Raw order URLs and customer contact data are excluded from browser payloads.
- Purchase recovery on the order-success route sends a sanitized GA event; browser Pixel is suppressed on that sensitive route. CAPI still delivers the confirmed purchase when the browser closes or is redirected from payment.
- The outbox retries up to eight attempts, retains stable event identity, and holds rows for a different Pixel rather than sending them to a new dataset. Inspect rows with `sentAt IS NULL AND attempts >= 8` as failed deliveries. Retention/purge is an operational responsibility; no automatic deletion of audit records is installed.
- Nonpurchase intake uses a same-origin cookie/token pair and bounded, per-process rate state. Deploy behind an API rate limiter if running multiple backend instances; this is telemetry abuse protection, not proof that browser actions are truthful. Purchase revenue can only originate from authenticated database orders.
- Withdrawal removes known unsent session events and unsent purchases for the signed-in customer. It cannot undo events already accepted by a provider or recall a network request already in flight.
- No native mobile analytics SDK was installed. Web tracking changes do not change installed apps.
