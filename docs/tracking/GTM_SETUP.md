# GTM configuration for the tracking release

An empty GTM container needs configuration before the website can deliver GA4 events. A complete import file is available at [gtm/tokriii-gtm-container.json](gtm/tokriii-gtm-container.json); follow the [import steps](gtm/README.md) instead of creating the following objects manually. No file upload is required: configure the following tags, variables and triggers in the GTM Web container whose ID is in `server/.env`. A CAPI token is not a GTM variable.

## 1. Variables

Enable the built-in **Event** variable. Create the following Data Layer Variables, version 2:

| Variable name | Data layer variable name |
| --- | --- |
| DLV - GA4 Measurement ID | `tracking.ga4_measurement_id` |
| DLV - Page Location | `page_location` |
| DLV - Page Path | `page_path` |
| DLV - Event ID | `event_id` |
| DLV - Search Term | `search_term` |
| DLV - Payment Type | `payment_type` |

The application pushes the public measurement ID before loading GTM. Use the variable rather than a hardcoded ID so later backend environment changes are reflected after restart/page reload.

## 2. Consent tags

Follow **GTM consent template wiring** in [SETUP_GUIDE.md](SETUP_GUIDE.md). It contains the sandboxed template code, fields, trigger names and permissions. This is the one custom template to create in GTM; the Google tags themselves use built-in tag types.

Create two instances of that consent template:

| Tag | Mode | Trigger |
| --- | --- | --- |
| Tokri consent default | `default` | Consent Initialization - All Pages |
| Tokri consent update | `update` | Custom Event, exact name `tokri_consent_update` |

Consent tags themselves must not require consent. Default state comes from the application's `tracking_consent` values; absent values are denied. Do not install an additional consent banner through GTM alongside the website's banner.

## 3. Google tag

Create **Google tag** named **Tokri - Google tag**:

- Tag ID: `{{DLV - GA4 Measurement ID}}`.
- Configuration parameter `send_page_view`: `false`.
- Configuration parameter `page_location`: `{{DLV - Page Location}}`.
- Trigger: **Initialization - All Pages**.
- Consent: require `analytics_storage`.

The website loads GTM only after analytics acceptance. The consent template must initialize before this Google tag. Do not also install a direct Google tag on the website for these events.

## 4. Page-view event tag

Create **Google Analytics: GA4 Event** named **Tokri - Page view**:

- Measurement ID: `{{DLV - GA4 Measurement ID}}`.
- Event name: `page_view`.
- Event parameters: `page_location` = `{{DLV - Page Location}}`, `page_path` = `{{DLV - Page Path}}`, `event_id` = `{{DLV - Event ID}}`.
- Trigger: Custom Event, exact name `page_view`.
- Consent: require `analytics_storage`.

Do not add a History Change trigger. Review the GA4 Web stream's Enhanced Measurement settings and disable history-based page views to avoid duplicates. Automatic initial page views are disabled on the Google tag by `send_page_view=false`.

## 5. Ecommerce event tag

Create **Google Analytics: GA4 Event** named **Tokri - Ecommerce**:

- Measurement ID: `{{DLV - GA4 Measurement ID}}`.
- Event name: `{{Event}}`.
- Enable **Send Ecommerce data**, source **Data Layer**.
- Additional event parameters: `event_id` = `{{DLV - Event ID}}`, `page_location` = `{{DLV - Page Location}}`, `page_path` = `{{DLV - Page Path}}`, `payment_type` = `{{DLV - Payment Type}}`.
- Trigger: Custom Event, enable regular-expression matching, expression `^(view_item|add_to_cart|remove_from_cart|view_cart|begin_checkout|add_payment_info|purchase)$`.
- Consent: require `analytics_storage`.

If your tag editor does not offer Send Ecommerce data, create data-layer variables for `ecommerce.items`, `ecommerce.value`, `ecommerce.currency`, `ecommerce.transaction_id`, `ecommerce.tax`, and `ecommerce.shipping`, and map them to the corresponding GA4 parameter names without the `ecommerce.` prefix.

## 6. Search event tag

Create **Google Analytics: GA4 Event** named **Tokri - Search**:

- Measurement ID: `{{DLV - GA4 Measurement ID}}`.
- Event name: `search`.
- Parameters: `search_term` = `{{DLV - Search Term}}`, `page_location` = `{{DLV - Page Location}}`, `page_path` = `{{DLV - Page Path}}`.
- Trigger: Custom Event, exact name `search`.
- Consent: require `analytics_storage`.

Search is emitted when the first page of results for a distinct debounced query is displayed, including zero-result searches. Enter and pagination do not create duplicate events. Product terms may include letters, short numbers, spaces, apostrophes and hyphens; contact-like input is excluded.

## 7. Preview and publish

Once the production code/migration is deployed and the backend flags are configured for testing, use GTM Preview and inspect a consented product view, cart action and one fixture purchase. Confirm that one tag fires for each event and that the runtime measurement-ID variable resolves correctly. Then publish the reviewed workspace.

No Meta Pixel tag belongs in this GTM container for this release: the website sends Pixel events and the backend sends CAPI events. No template needs to be uploaded to GA4 or Meta. They need their normal destination/account settings and final receipt checks.
