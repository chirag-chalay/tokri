# Send Tokri scroll events to GA4 through GTM

The website pushes `tokri_scroll` with `percent_scrolled: 90` once per route after analytics consent, when the visitor scrolls 90% of the document or the shop product panel. Meta has a separate consented `Scroll` event. No additional Meta tag is needed in GTM.

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

`Marketing only` and `Reject` do not send the GA4 event. Short pages with no scrollable distance do not fire this application event. Product details and category-panel scrolling are covered; sensitive order URLs remain excluded by the existing tracking URL policy. No full container import is required, and this avoids overwriting existing workspace changes. The GA4 tag will not take effect until the GTM workspace is published.
