# Tokriii Meta Pixel — review-ready integration

- **Dataset ID:** `891089060757681`
- **Allowed hosts:** `tokriii.com`, `www.tokriii.com`
- **Script:** `https://connect.facebook.net/en_US/fbevents.js`
- **Events implemented:** `PageView` only. No purchase/cart/checkout conversion events have been added.

## Where it runs

`src/lib/telemetry.js` calls `installMetaPixel()` when the existing analytics component mounts, and `trackMetaPageView(path)` whenever the existing Next.js (`NextShell`) or Vite (`App` / `ScrollToTop`) router reports navigation. This preserves Google Analytics without introducing another navigation effect. A `lastPageViewKey` guard prevents repeated PageViews on the same route during hydration and React Strict Mode.

`src/app/layout.next.jsx` renders the provided `<noscript>` image **only** when the production host has a previously recorded `tokriii_marketing_consent=granted` cookie. The image has `referrerPolicy="origin"` to avoid disclosing URL paths/query values to Meta via Referer when JavaScript is off.

## Marketing consent

No existing cookie-consent management component was found in the checked repository. The owner approved the proposed minimal panel before UI implementation. `src/components/MarketingConsent.jsx` now renders a white bottom panel with Allow marketing, Reject, and Privacy policy controls. A persistent Cookie settings button lets customers reopen the panel and withdraw consent. Both the Next.js root layout and the Vite application mount this shared component. The panel only appears on the two production hosts; it stays above mobile cart controls and beneath existing modal overlays.

The Pixel is opt-in by default and makes no Meta script requests without explicit marketing consent. The panel remembers either choice for 180 days. Cookie write failures keep the panel visible with an error instead of implying that a choice was saved. Opening settings does not itself change consent.

Review captures from the local production build: [mobile panel](meta-pixel/consent-mobile.png), [desktop panel](meta-pixel/consent-desktop.png).

The panel calls this API directly. If replacing it with another consent manager, connect its explicit **marketing** choice to the same mechanism:

```javascript
import { setMarketingConsent } from './lib/metaPixel'

// Called on explicit marketing consent acceptance or rejection:
setMarketingConsent(true)  // grants permission and tracks current safe PageView
setMarketingConsent(false) // revokes permission and stops further PageViews
```

Alternatively, from a UI consent handler (after the analytics entrypoint mounted):

```javascript
document.dispatchEvent(new CustomEvent('tokriii:marketing-consent-change', {
  detail: { granted: true },
}))
```

The code persists the choice (`granted` or `denied`) in a first-party `tokriii_marketing_consent` cookie (`SameSite=Lax; Secure; Path=/`, 180 days). Revocation stores `denied`, sends `fbq('consent','revoke')` if already initialized, and prevents subsequent PageViews. Re-acceptance re-grants SDK consent before tracking again. The consent interface must preserve the user's existing choices and support withdrawal.

**Do not** manually set this cookie for all visitors, and do not activate the Pixel automatically. Avoid duplicate Meta tags in Google Tag Manager, another plugin, or server templates.

## Privacy safeguards

The application emits only `PageView`, using `fbq('trackSingle', '891089060757681', 'PageView')`. The integration never passes email, phone, OTP, customer names, cart/order data, or payment data as event parameters. It suppresses PageView for `/order/:orderNo` and for URLs containing unreviewed query keys or potentially sensitive parameter values. It also avoids SDK initialization on those entry URLs. Safe campaign and public catalog parameters such as `/shop?category=exotic` are allowed. Meta's own automatic events, automatic matching, cookie rules, and destination URL collection must additionally be reviewed in Meta Events Manager before enabling production tracking; route filtering does not control behavior inside the loaded third-party SDK.

The Next.js server-side noscript image is consent-gated. Vite fallback is still supported through JavaScript tracking; no unconditional static noscript image is added to the old Vite HTML.

## Verification before deploying

1. Run `node scripts/verify-meta-pixel.mjs` to validate consent gating, host restriction, deduplication, route tracking, revocation, and no duplicate SDK initialization in an isolated mock browser. This does not contact Meta.
   Run `node scripts/verify-meta-pixel-browser.mjs` after `npm run build:next` for production-build browser verification. It starts isolated local Next.js and fixture API servers, forwards simulated production/staging hostnames only to localhost, and replaces the Meta SDK with a test double. `CHROME_BIN` may override `/usr/bin/google-chrome`. No live service is contacted.
2. Run `npm run lint`, `npm run build:next`, `npm run build` and existing regression/SEO tests in a full checkout of the repository.
3. Confirm Meta Pixel ID is not installed elsewhere (especially Google Tag Manager or third-party plugins).
4. Verify that no `fbevents.js` or `facebook.com/tr` network request occurs before marketing consent or on staging/local. The browser suite covers this with isolated traffic interception and actual panel-button clicks.
5. Once explicitly approved for production, use **Meta Events Manager → Test Events** and **Meta Pixel Helper**. Open the homepage and navigate between `/shop`, `/shop?category=exotic`, and a product page. Verify one PageView per permitted navigation and no duplicate Pixel IDs. Reject marketing consent and confirm no further events.

## Deployment

Keep all code on a separate feature branch for review. Do not merge to `main`, `staging`, or deploy without approval. Actual Meta Events Manager delivery remains **UNVERIFIED** until an authorized deployment is performed. After deployment, confirm receipt and deduplication using Test Events / Pixel Helper before relying on the reporting.

## Review status

Based on latest `origin/main` at `3053bee555fbc3c0abed9768c326bd19866afcfe`, using a separate worktree to preserve uncommitted storefront and mobile edits in the original checkout. The supplied ZIP patch applied cleanly with `git apply --check`; no newer source was overwritten.

The prepared patch was corrected to re-grant SDK consent after withdrawal, remember rejection, and defer SDK initialization on sensitive entry URLs. Existing Google Analytics initialization and event payloads remain unchanged.

Validation: isolated Meta/GA checks pass (15/15); Next.js production build and Vite production build pass; lint reports zero errors and seven warnings in unchanged files. Browser tests pass for initial hydration, actual Next Link navigation, query changes, repeated-route deduplication, consent withdrawal and re-acceptance through the UI, rejection persistence across reloads, changing rejection to acceptance, six production/staging/local hosts, noscript consent/host gating, and panel placement at 320px, 390px, and 1440px. The browser suite uses simulated SDK behavior and does not prove receipt in Meta Events Manager. Commerce and SEO suites requiring a populated local API were not run; no local API was running. Business logic, checkout, authentication, and existing GA event code were not changed.

**Ready for deployment approval:** the approved consent interface is implemented and all requested local checks pass. No merge or deployment has been performed. Live Meta delivery and account-side automatic event/matching settings remain post-deployment verification items.
