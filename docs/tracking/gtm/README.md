# Import the Tokriii GTM container

Use **tokriii-gtm-container.json** for **GTM → Admin → Import Container**. It contains all six tags, four custom-event triggers, six data-layer variables, the built-in Event variable, and the consent template. Do not import the `.tpl` separately when using the complete JSON: it is already embedded. The `.tpl` is provided for inspection or separate template import only.

## Import steps

1. Open the **Web container** matching `TRACKING_GTM_CONTAINER_ID` in the private backend environment.
2. Export the current container first if it already contains anything you need to keep.
3. Open **Admin → Import Container**, choose `tokriii-gtm-container.json`, and select a new workspace such as **Tokri tracking**.
4. Choose **Merge → Overwrite conflicting tags, triggers and variables**. This updates matching Tokri names while preserving unrelated items. Review the import preview; it should include the six Tokri tags and the consent template. Google may show a permission review for the custom template.
5. Confirm the import. Pause any older Google tag or GA4 event tags that would send the same website events. Do not keep both the old direct setup and these tags active for the same events.
6. Open **Tokri - Google tag**. Its ID is intentionally `{{DLV - GA4 Measurement ID}}`: the deployed website supplies that value from the backend runtime configuration. Do not replace it with the GTM container ID.
7. Use **Preview** after the tracking code and database migration are deployed and the desired flags are enabled. Allow analytics in the website banner. Check a page view, add-to-cart action and one fixture purchase. Confirm one firing per action and the correct GA4 destination.
8. Publish the workspace after reviewing the preview. In GA4, check Enhanced Measurement history-based page views so they do not duplicate the application's manual page views. See [GTM_SETUP.md](../GTM_SETUP.md) for the full settings.

Google's [container import instructions](https://support.google.com/tagmanager/answer/6106997?hl=en-GB) explain the Merge/Overwrite options. This file uses one embedded sandboxed custom template; Google's [custom template API reference](https://developers.google.com/tag-platform/tag-manager/templates/api) describes the consent APIs it calls.

## Included tags

| Tag | Trigger | Purpose |
| --- | --- | --- |
| Tokri - Consent default | Consent Initialization - All Pages | Set the four consent states from the website's saved choices; absent/invalid values are denied |
| Tokri - Consent update | `tokri_consent_update` | Apply a changed choice through GTM consent APIs |
| Tokri - Google tag | Initialization - All Pages | Configure the runtime GA4 destination; automatic page view disabled |
| Tokri - Page view | `page_view` | Manual page tracking |
| Tokri - Ecommerce | Seven allowlisted ecommerce event names | Products, cart, checkout, payment method and purchase |
| Tokri - Search | `search` | Sanitized explicit submitted search |

All Google measurement tags require analytics consent. The consent tags have no consent requirement so withdrawal can always be applied. Template permissions only allow reading `tracking_consent` and writing the four configured consent types. No Custom HTML, arbitrary network access, cookie access or access tokens are included.

Meta Pixel and CAPI are supplied by the website/backend implementation and are intentionally absent from this GTM file to prevent duplicate events. No container file needs to be uploaded to GA4 or Meta.

## Validation and deployment status

The JSON was checked locally for tag/trigger/variable references, embedded template consistency, consent default/update behavior, event allowlisting and exclusion of the actual private CAPI credentials. Scripts also passed lint. Actual GTM import acceptance was unverified during artifact generation. During subsequent activation the published container was observed with the Tokri configuration; see [DEPLOYMENT.md](../DEPLOYMENT.md). Account-interface reporting remains a separate check.

Importing a container does not deploy the website/backend or apply the required database migration. If Preview shows no events while tracking flags are disabled or the code is not deployed, that is expected. Follow [SETUP_GUIDE.md](../SETUP_GUIDE.md) for release order; do not restart the new backend before applying its schema migration.

Rebuild and verify the artifacts if the event contract changes:

```bash
node scripts/build-gtm-container.mjs
node scripts/verify-gtm-container.mjs
```

The builder reads only the public GTM container ID from `server/.env`; the measurement ID remains dynamic. When no private environment file is present, the export metadata uses a placeholder public container ID. Source account/container IDs are portable placeholders for GTM to remap during import.
