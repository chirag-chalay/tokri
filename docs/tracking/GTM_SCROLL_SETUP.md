# Send Tokri scroll events to GA4 through GTM

The website pushes `tokri_scroll` with `percent_scrolled: 90` once per route after analytics consent, when the visitor scrolls 90% of the document or the shop product panel. Meta has a separate consented `Scroll` event. No additional Meta tag is needed in GTM.

## Import the scroll addition

`gtm/tokriii-ga4-scroll-addition.json` is a partial container export with one GA4 Event tag and one Custom Event trigger. It refers to the existing Tokri variables `DLV - GA4 Measurement ID`, `DLV - Page Location`, `DLV - Page Path`, and `DLV - Event ID`, already supplied by the earlier Tokri container setup. Check that those variables exist in the target workspace. The existing Tokri Google tag must also be present.

1. In `GTM-K9KP2RN9`, export the current workspace or published container as a backup.
2. Open **Admin → Import Container**, select the addition JSON and the intended workspace. Choose **Merge**, not container overwrite.
3. For conflicts choose **Overwrite conflicting tags, triggers and variables** only if the conflicts are the two `Tokri - GA4 Scroll` objects. Review **View Detailed Changes**: expect one tag and one trigger to be added or updated, with no unrelated changes or deletions. Stop if the preview differs.
4. Complete steps 3 and 4 below: disable GA4's Enhanced measurement Scrolls setting to prevent duplication, then Preview and publish. Importing alone does not publish.

If Google reports missing variables or rejects the partial import, leave the workspace unchanged and use the manual setup below. Import acceptance has not been checked in the GTM account.

## Manual setup

Make these changes in container `GTM-K9KP2RN9`:

1. Create a **Custom Event** trigger named `Tokri - Scroll`. Set Event name to `tokri_scroll` and choose **All Custom Events**.
2. Create a **Google Analytics: GA4 Event** tag named `Tokri - Scroll`:
   - Measurement ID: `{{DLV - GA4 Measurement ID}}`, the existing runtime variable.
   - Event Name: `scroll`.
   - Event parameters: `percent_scrolled` = `90`, `page_location` = `{{DLV - Page Location}}`, and `page_path` = `{{DLV - Page Path}}`.
   - In Advanced Settings → Consent Settings, require `analytics_storage`, matching the existing Tokri GA4 tags.
   - Trigger: `Tokri - Scroll` from step 1.
3. In GA4, open Admin → Data streams → Tokriii Website → Enhanced measurement, open its settings, and disable **Scrolls** only. This avoids sending Google's automatic document scroll alongside the GTM event. Keep other Enhanced measurement options as desired.
4. Use GTM Preview, visit the site, choose **Analytics only** or **Allow all**, and scroll a page to 90%. Check that `tokri_scroll` appears and fires `Tokri - Scroll` once. Confirm the `scroll` event in GA4 DebugView, then publish the GTM workspace.

`Marketing only` and `Reject` do not send the GA4 event. Short pages with no scrollable distance do not fire this application event. Product details and category-panel scrolling are covered; sensitive order URLs remain excluded by the existing tracking URL policy. The GA4 tag will not take effect until the GTM workspace is published.
