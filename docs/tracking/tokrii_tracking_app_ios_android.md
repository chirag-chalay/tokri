# Tokriii App Tracking Plan: Android and iOS

Revised 13 November 2026. **Scope: implementation plan, not an implemented or released app integration.** Owners: **D** developer; **M** marketing; **P** business owner/app publisher. This document supersedes the previous plan at this path.

## 1. Verified baseline and scope

- Customer app: `tokri-mobile-go`; Expo SDK 58, React Native 0.88.1, React Navigation stacks/tabs. No committed native Android/iOS directories. Use native development builds, not Expo Go, to verify the proposed SDKs.
- No Firebase Analytics or Meta SDK is currently declared. Website GTM, Pixel and website CAPI do not instrument the native app. Existing backend purchase enqueue explicitly accepts `source: web` only.
- Native checkout is in `CartScreen.js`; Razorpay card/netbanking/wallet checkout uses a WebView. UPI uses an external intent and backend reconciliation. Observe payment milestones at native/backend boundaries, not by injecting tracking into payment HTML.
- Production Android/iOS identifier: `com.tokriii.app`; staging: `com.tokriii.app.staging`. Source version: `1.0.6`, Android code `9`, iOS build `8`. Actual store versions remain unknown. OTA is disabled.
- Last captured Expo Doctor result: 17/20 checks passed, missing direct `expo-font`, duplicate versions 57.0.4/58.0.11, and five Expo patch mismatches. This is a dated observation, not a current clean-bill-of-health claim. Full output: [mobile handoff](MOBILE_APP_ANALYTICS_HANDOFF.md).
- `tokri-mobile-go/AGENTS.md` references SDK 54 while the project uses SDK 58. Read the required versioned documentation, then reconcile that local instruction with the actual SDK before implementing app changes.
- Refund/cancellation event implementation is deferred at the owner's request. Audit full campaign URLs when preparing landing pages; this app plan does not silently change the website URL policy.

## 2. Corrected gaps and decisions

| Gap in the previous plan | Required resolution |
| --- | --- |
| One value chosen for both providers | Preserve existing website definitions: GA4 discounted merchandise excluding tax/shipping; Meta grand total. See section 6. |
| Floating Firebase `^27` installs treated as safe | Verify exact app/analytics versions together, native toolchains and release notes, then pin the validated pair in the lockfile. |
| Firebase v27 iOS fix considered sufficient compatibility proof | Upstream confirms the scene-plugin fix, but v27 also requires Android BoM/Kotlin changes and Apple SPM integration. Both native builds remain gates. |
| Staging app ID alone assumed to isolate analytics | Validate profile, actual API host, Firebase project/registered app, Meta app and runtime collection switches independently. |
| Meta production IDs used to test staging | Register the actual test variants in an isolated Meta test app where supported; do not silently route staging orders/events into production. |
| Runtime consent only | Native defaults must disable collection/auto-events/advertiser IDs before JavaScript starts. Test cold starts and reinstalls. |
| ATT before all consent/analytics | Separate app analytics consent, app marketing consent and Apple's platform permission. See section 5. |
| Purchase based only on response/screen | Persist authoritative order confirmation, original event time and immutable tracking snapshots; support interrupted/recovered payments. |
| Local list advertised as exactly-once delivery | Define provider ownership and durable dispatch state; explicitly account for multi-device, reinstall and crash windows. |
| Slug fallback invented from order-line ID | Snapshot original product/catalog identifiers; an order-line ID is not a Meta catalog retailer ID. |
| Login mapped to CompleteRegistration | Registration only for a genuinely new account; normal login is separate. |
| SDK logging equated with provider receipt | Track SDK queueing separately from dashboard receipt and attribution. |
| Blanket account-access/publishing waits | Only actual dependencies and failed gates block their dependent stages; proceed with independent authorized work. |

## 3. Stage 0 — ownership, access and open inputs

**Owner P, with M; D checks technical access.** Keep accounts under the business; use named users with task-appropriate roles, not shared passwords. Inspect existing projects before creating duplicates. Production Firebase should link to the existing GA4 property where appropriate; do not re-link an already-linked property without checking its current Firebase integration.

Record these inputs in a private handoff. Do not invent answers:

- [ ] Existing Firebase project/GA4 property and registered apps; ownership and editor/developer access.
- [ ] Meta business portfolio/app ownership, App ID, Client Token, production/test app support, and app-event destination. A website Pixel/dataset is not proof of native app registration. Never embed an App Secret, CAPI token, Google service-account key or signing credential in the app.
- [ ] Apple Developer/App Store Connect and Google Play publisher access; confirm iOS App Store ID `6822043083` belongs to this app.
- [ ] Android and physical iPhone test devices, staging customer accounts, approved test-order process and Razorpay staging/test credentials. Keep test-mode payment keys out of production.
- [ ] Platform release targets and current live store versions; the owner has chosen their app publisher to build/upload.
- [ ] Actual catalog/feed retailer IDs and five representative product slug comparisons. If mismatched, define one catalog mapping shared by web and app; do not change live website IDs as an undocumented side effect. Catalog ads remain blocked until matching is proven; unrelated app analytics can proceed.
- [ ] Approve independent analytics/marketing opt-in wording and withdrawal controls. Unknown choices default to denied for this implementation. A policy notice alone is not the collection permission assumed by this plan.
- [ ] Decide purchase dispatch ownership and the crash/retry tradeoff in section 7 before implementing purchase sending. App-side SDK-only delivery cannot guarantee reporting for users who never reopen the app.

**Evidence:** IDs/roles verified by their owners, device list and test environment, five catalog comparison rows, consent copy, and purchase-delivery decision. Account/device/catalog gates remain OPEN until actual evidence exists.

## 4. Stage 1 — dependency and native compatibility gate

**Owner D; publisher provides native build access.** Work on `marketingdimpal` or an isolated worktree based on it; push only `marketingdimpal` unless the owner changes that instruction. Preserve unrelated local work. Plan changes do not authorize unrelated dependency upgrades or new account creation.

- [ ] Capture baseline commit, lockfile, Expo Doctor output and reproducible build settings.
- [ ] Resolve `expo-font` with `npx expo install expo-font`; review `npx expo install --check` and only then apply SDK-compatible fixes. Inspect the lockfile diff; do not remove duplicates by editing `node_modules` or suppress Doctor failures to obtain a pass.
- [ ] Re-run Expo Doctor and `npm ls expo-font`; preserve exact outputs. Document any failure with an owner and resolution rather than labelling it passed.
- [ ] Choose and pin a compatible React Native Firebase app/analytics pair and Meta wrapper release. Do not paste a floating `npm i ...@^27` command into production blindly.
- [ ] React Native Firebase v27.0.0 release notes contain the Expo SDK 58 scene-based AppDelegate fix. Its migration guide also specifies Firebase Android BoM 35, Android minSdk 24 and Kotlin Gradle plugin >=2.4.0, plus Apple Firebase 13 via Swift Package Manager/dynamic frameworks. Verify the generated Expo SDK 58 toolchain against these requirements. If incompatible, evaluate a documented upstream-supported combination or isolated override, with logs and a device build; do not invent an older version pin or upgrade Kotlin broadly without review. [RNFB release](https://github.com/invertase/react-native-firebase/releases/tag/v27.0.0), [v27 migration](https://rnfirebase.io/migrating-to-v27).
- [ ] Inspect the exact Meta wrapper config-plugin code/options and generated native output. Its generic React Native compatibility table does not prove compatibility with this app's RN 0.88/New Architecture/scene lifecycle. [Wrapper documentation](https://github.com/thebergamo/react-native-fbsdk-next).
- [ ] Use SDK-compatible Expo tooling for `expo-dev-client` and, if needed, `expo-tracking-transparency`. Native config must use the documented options for the pinned packages.
- [ ] Select and record actual EAS Android/iOS images/toolchains. SDK 58 scene support and an Xcode 27 build SDK do not mean the app supports only iOS 27 devices; verify deployment targets and supported OS versions separately. [Expo build images](https://docs.expo.dev/build-reference/infrastructure/).
- [ ] Generate native projects in an isolated checkout; inspect Firebase initialization, SPM/framework linkage, Android manifests, merged permissions, privacy manifests, URL schemes, and ATT text. Do not run destructive clean-prebuild over live working changes.
- [ ] Build and launch both native development clients. Test cold launch, background/resume, deep links, OTP login, location, UPI app return and Razorpay WebView completion. A JavaScript export alone is insufficient evidence.

**GATE:** Android and iOS native build/startup compatibility is demonstrated separately. A platform failure blocks that platform's release; fallback choices require an explicit product decision, not an undocumented Android-only launch.

## 5. Stage 2 — environment configuration and collection controls

**M/P register accounts and app variants; D configures and verifies.**

| Build profile | Current app identity / API | Intended tracking destination |
| --- | --- | --- |
| development / staging | `.staging` identity / staging API | Separate staging Firebase project/GA4 property; isolated Meta test destination or Meta disabled |
| preview | Currently production identity / production API | Treat as production unless a new isolated QA profile explicitly changes all destinations |
| production | Production identity / production API | Production Firebase apps linked to the intended GA4 property; production Meta app |

- [ ] Use distinct registered Android/iOS apps for each identity in the chosen Firebase projects. Validate `google-services.json` package and `GoogleService-Info.plist` bundle/project IDs. Ensure EAS receives the correct files for the selected profile; track file paths and public IDs, not private credential contents.
- [ ] Separate API host, app variant and analytics destinations explicitly; do not infer environment from build name alone. Fail closed when a test app has production analytics credentials or an unexpected API host. Check staging Razorpay account/mode too.
- [ ] Configure Meta for both actual app variants as supported: package, generated activity name, debug/release signing key hashes (including the store signing certificate where required), bundle ID, URL scheme and store association. Verify the activity name from generated native files instead of assuming it. Follow the provider's current attribution/SKAN setup; do not hardcode a universal iOS Purchase-priority screen or event order from an older interface.
- [ ] If a production-ID internal build is required, register that identity in a **test** Firebase project and use the staging backend and isolated Meta test configuration. Confirm this combination is supported; otherwise keep Meta off. Never use production analytics as an implicit workaround.
- [ ] Native Firebase analytics collection and applicable ad-consent defaults are denied before JS initializes. Disable automatic native screen reporting when React Navigation owns screen views. Meta auto-init, auto app events, automatic purchase logging and advertiser-ID collection must be off until the chosen permissions allow them. Inspect generated native defaults, not just runtime calls.
- [ ] Persist independent analytics and marketing choices with a policy version. Analytics consent controls Firebase; marketing consent controls Meta. ATT controls access to Apple tracking identifiers and tracking activity; it does not replace the app's consent choice and does not by itself authorize analytics.
- [ ] On iOS, request ATT only in the selected marketing flow, in a valid app state, with a clear usage description. Handle authorized, denied, restricted and not-determined; never enable advertiser tracking when not authorized. Conservative baseline: Meta delivery stays off until both marketing consent and applicable platform permission allow it; any limited-measurement alternative requires documented provider/policy review.
- [ ] Android has no iOS ATT dialog, but still needs the app's consent controls and applicable advertising-ID/platform restrictions. Do not equate “no ATT” with unconditional marketing collection.
- [ ] Provide settings withdrawal and re-consent, remove unsent app-owned events/identifiers for the revoked purpose, update SDK collection flags and clear analytics user identity on logout. Do not replay actions that happened while denied. Do not claim an SDK can recall events already accepted or guaranteed to be in flight.
- [ ] In the initial SDK smoke test, intentionally grant staging consent before checking DebugView/Test Events. An app with collection denied should produce no test events; this is not a failed integration.

**GATE:** Physical Android/iPhone evidence of zero provider collection before consent, correct analytics-only/marketing-only behavior, iOS permission outcomes, correct project/app IDs, and no production pollution from test builds. Firebase documents native collection defaults and persisted runtime settings in [collection controls](https://firebase.google.com/docs/analytics/configure-data-collection).

## 6. Stage 3 — authoritative purchase contract

**Owner D backend, M verifies reporting definitions.** Keep all existing order/payment response fields and business rules compatible. Add a small, versioned tracking DTO; do not repurpose customer-facing order DTOs or require tracking success to complete checkout.

### Amount and identity rules

- Firebase/GA4 `value`: discounted merchandise value excluding tax and shipping, matching the website `merchandiseValue`. Net item `price` excludes item discount and any included item tax; use explicit per-unit discounts and quantity. Send order tax and net shipping separately. Document handling/small-cart fees separately so the sum can be reconciled to the grand total; do not silently relabel fees as merchandise.
- Meta purchase amount: confirmed `grandTotal`, matching website Meta. `currency`: authoritative order currency (`INR` in current checkout). Do not derive revenue from current cart state, WebView contents or client-submitted totals.
- `transactionId` and `eventId`: stable opaque backend identities, consistent with the existing website purchase identity where the order is the same. Avoid raw order numbers in general event parameters. Destination-specific ownership, not a different ID per screen/device, prevents duplicate purchase sending.
- Snapshot item product/catalog identifiers, category, name, unit net price, unit discount, quantity and tax at order creation/confirmation. Current order APIs lack category and explicit currency, and joining mutable/deleted Product records later cannot preserve historical facts. For old orders without a slug, use a known original stable product ID only with a documented mapping. Do not invent `line-<orderLineId>` as a matching catalog retailer ID. Keep revenue reportable while marking catalog matching unavailable when mapping is missing.

### Eligibility and persistence

- COD becomes eligible after successful `/checkout/confirm-cod`, not create-order. Cash/QR collection later does not make a second Purchase. Current app COD does not have a web `trackingContext`; therefore persist an independent COD confirmation timestamp/state for app orders so recovery after restart works.
- Online becomes eligible only after backend verification/reconciliation reaches the accepted paid/captured state. Cover `/checkout/verify-payment`, `/checkout/sync-payment`, `/checkout/confirm-intent`, `/checkout/status/:orderNo`, and webhook/payment recovery. Cancellation, authorization without accepted capture, failure and timeout are not Purchase.
- Persist original confirmation time independently of general `updatedAt`; freeze one tracking snapshot. Repeated responses/webhooks do not change event time, destination, IDs or amounts.
- Record source/platform (`web`, Android app, iOS app), app version, environment and purpose-specific consent snapshot/version/time through validated authenticated app requests. A claimed app source is telemetry, not payment proof. Do not translate native purchases into `action_source: website` or forward them through existing web Pixel/CAPI endpoints.
- An order's recorded origin chooses its purchase sender. Viewing a website-created order in the app, or an app-created order on the website, must not create an additional purchase. A reorder is a new order and gets a new identity after its own confirmation. Preserve this rule across provider-specific delivery ledgers.
- Provide an authenticated recoverable confirmed-purchase endpoint or a backward-compatible addition to existing order status/detail endpoints. Require verified bearer identity and order ownership; do not use the legacy phone-header fallback as tracking authorization. Return a tracking DTO only when eligible. Confirm-cod/verify/sync responses and recovery should reference the same snapshot.
- Add any needed schema using reviewed additive migrations, private backups, generated-client/column preflight, and rollback notes. No database reset or broad schema push against production.

Proposed DTO (contract to implement; **not present today**):

```text
trackingPurchase: {
  schemaVersion: 1,
  transactionId, eventId, confirmedAt, currency,
  merchandiseValue, grandTotal, tax, shipping, handling, smallCartFee, discount,
  items: [{ productId, catalogId?, categoryId?, categoryName?, name,
            unitNetPrice, unitDiscount, quantity }]
}
```

Only allowlisted product/category names are permitted. No customer name/address/phone, OTP, token, payment signature, Razorpay prefill, card number or CVV in event payloads. Product `name` is distinct from customer name. Preserve payment/order amounts and existing checkout behavior.

## 7. Stage 4 — app adapter, recovery and deduplication

**Owner D; M approves event/value semantics.**

- One adapter owns all SDK calls, validates payloads, serializes destinations, contains SDK errors, and respects consent/environment/platform switches. It must not delay or fail checkout. Add separate emergency switches for Firebase and Meta; verify local default-off behavior when config cannot load. Native SDK installation/configuration changes require a new app build even if runtime switches are remote.
- Hook React Navigation ready/state changes. Track only changed active leaf routes with safe static screen names, not order numbers, phone numbers, search queries or arbitrary navigation parameters. Avoid both native automatic screen tracking and a second JS screen hook.
- Track successful cart deltas, not hydration/background cart sync. Search only after accepted results and sanitization; never send phone/email/OTP input. List impressions/selects need defined visibility/deduplication boundaries; do not log every render or FlatList virtualization pass.
- The native app is the SDK purchase sender for v1 unless Stage 0 explicitly chooses another supported architecture. Do not also add app Purchase to server-side Meta CAPI or Firebase Measurement Protocol in this phase. Website events remain separate. Provider-specific app/server deduplication must be demonstrated before any dual sending.
- Recover confirmations from backend order state after payment app return, WebView completion, restart and delayed webhook updates. Recover only purchases created under valid app consent/source in the relevant version/environment; never automatically backfill historical orders.
- Use an atomic, bounded, persistent per-destination purchase ledger/queue keyed by environment + destination/app ID + customer identity + transaction ID. Serialize concurrent callbacks and queue one canonical payload. AsyncStorage read/check/send/write without a lock is insufficient. Do not clear the purchase ledger on normal logout; avoid exposing one customer's payload to another user. Set retention/expiry with M, preserve IDs across retries and clear denied unsent matching data on revocation.
- Define states such as `pending`, `dispatching`, `sdkQueued`, `failed` and record only redacted operational diagnostics. Persist before dispatch. A successful SDK call means queued, not provider receipt. Handle crashes before/after queueing separately; automatically retry only when it is safe for that provider.
- **Unresolved distributed-delivery boundary:** device-local state does not survive reinstall or coordinate another device, and a crash between SDK acceptance and local persistence can lose or duplicate a report. Use backend per-order/per-destination delivery coordination for multi-device recovery if that is required; a backend claim/lease alone still cannot atomically commit an SDK network send. Specify uncertain-send behavior, provider dedup support and the accepted loss/duplicate tradeoff at Stage 0, and prove it in Stage 6. Do not claim exactly-once Meta app delivery based on an arbitrary `event_id` parameter; confirm the pinned SDK and destination actually use it for deduplication. Firebase `transaction_id` must remain stable, but it is not a substitute for app concurrency controls.
- If cross-device/reinstall suppression or server recovery without reopening the app cannot be supported by the chosen SDK-only design, explicitly record that limit or change the architecture before release. Backend orders remain the business source of truth.
- Clear analytics user ID on logout; set a stable non-PII customer ID only after applicable consent/login. Never send raw phone as Firebase user ID or bridge web cookies (`fbp`/`fbc`) into native app tracking as a substitute for app attribution identifiers.

## 8. Event contract

Use Firebase SDK modular APIs documented for the pinned version; use Meta wrapper constants/dedicated APIs (e.g. `logPurchase`) and the current native event parameter schema. Firebase `items` arrays cannot be copied blindly into Meta parameters. Disable automatic SDK commerce purchase tracking to avoid a second sender for these Razorpay physical-goods orders.

| Action | Firebase event | Meta app event / behavior |
| --- | --- | --- |
| Active screen changes | `screen_view` | None by default |
| Product list genuinely shown | `view_item_list` | None by default |
| Product tapped in list | `select_item` | None by default |
| Product detail successfully loaded | `view_item` | ViewedContent constant; verify SDK standard mapping |
| Sanitized successful search | `search` | Searched constant |
| Successful addition/positive delta | `add_to_cart` | AddedToCart constant |
| Successful removal/negative delta | `remove_from_cart` | None by default |
| Cart displayed | `view_cart` | None by default |
| Checkout displayed with usable cart | `begin_checkout` | InitiatedCheckout constant |
| Shipping selection committed | `add_shipping_info`, if a distinct committed step exists | None by default |
| Payment method committed | `add_payment_info` | AddedPaymentInfo constant |
| New customer account actually created | `sign_up` | CompletedRegistration constant |
| Existing customer authenticated | `login` | No CompletedRegistration event |
| Eligible backend-confirmed order | `purchase` with transaction ID, currency, merchandise value, items | Dedicated purchase API with grand total/currency and validated catalog parameters |

The OTP API must expose a trustworthy new-vs-existing account result before the registration event is implemented; do not infer new registration from a screen opening. Document category/content IDs and omit unavailable fields rather than inventing them. App install/activation/session events may be SDK-managed after consent; distinguish them from manual events and document any deferred first-open behavior. Native scroll tracking is deferred until the owner requests it; website scroll does not instrument native lists. Refund tracking remains deferred.

### Implementation file map

| Area | Existing files / proposed additions |
| --- | --- |
| Dependencies, build identity and native defaults | `tokri-mobile-go/package.json`, lockfile, `app.config.js`, `eas.json`; proposed `firebase.json` and environment-specific config-file references |
| Shared native adapter and consent/queue state | Proposed `tokri-mobile-go/src/lib/analytics.js`, `trackingConsent.js`, `purchaseTracking.js`; persist bounded state outside screens |
| Navigation and identity | `tokri-mobile-go/src/navigation/RootNavigator.js`, `src/context/AuthContext.js` |
| Browse, search and cart boundaries | `tokri-mobile-go/src/screens/HomeScreen.js`, `ShopScreen.js`, `ProductScreen.js`, `SearchScreen.js`, `src/context/CartContext.js` |
| Payment confirmation and recovery | `tokri-mobile-go/src/screens/CartScreen.js`, `UpiPaymentScreen.js`, `OrdersScreen.js`, `OrderDetailScreen.js`; no tracking inside payment WebViews |
| Authoritative DTO, source/consent and recovery authorization | `server/src/services/checkout.js`, `customerOrders.js`, `trackingPurchase.js`, `server/src/routes/checkout.js`, `tracking.js`, and reviewed Prisma schema/migration additions |

The proposed native modules and schema fields are deliverables to implement after their prerequisites pass; they are not existing files or deployed features.

## 9. Stage 5 — privacy, attribution and observability

**M owns disclosures and account settings; D implements controls; P verifies store declarations.**

- Update the actual privacy policy, store Data Safety/App Privacy answers, consent wording and applicable SDK privacy manifests to match the data collected. Do not describe hashed data as anonymous. Confirm current platform ATT/advertising-ID requirements for the pinned SDKs and jurisdictions with the responsible owner.
- Verify Apple platform attribution/SKAN and Android install-referrer/deep-link flows using current SDK/provider documentation and the actual signing/build identity. Do not introduce an MMP as a mandatory dependency without a documented need and approved cost/scope.
- GA4/Firebase property access, Meta app/dataset access and catalog permissions are distinct. Link Google Ads to the correct property/app streams if app campaigns or cross-channel reporting are in scope. Configure one primary purchase conversion strategy per platform and review duplicate imported/native actions. Do not optimize a sales campaign for scroll/login events by default.
- Separate website and native app platform/source in reports, use a common non-PII customer identifier only with appropriate consent, and compare equivalent amount definitions and time zones. GA4 merchandise value and Meta grand total intentionally differ. Confirmed COD purchases do not equal delivered/collected revenue; no refund/cancellation adjustments are promised in v1.
- Add bounded redacted diagnostics for SDK init, destination/config version, queue state, delivery errors and permission changes. Never log full order/customer payloads, tokens, phone numbers or payment inputs. Establish queue-failure alerting, retention and a kill-switch owner.

## 10. Stage 6 — focused verification matrix and release gates

Use isolated staging accounts and Razorpay test mode; do not create real production orders for a routine tracking test. Real-device native evidence is mandatory for release; local export/mock tests do not replace it.

| Check | Android evidence | iOS evidence | Pass condition |
| --- | --- | --- | --- |
| Native SDK compatibility | Build/install/cold launch + log | Build/install/cold launch + log | Correct versions/toolchain; no startup/linkage errors |
| Environment isolation | Project/app/API/Meta IDs | Project/app/API/Meta IDs | Test build cannot send to production destinations |
| Consent on first launch/resume | No providers before choice | No providers before choice; ATT states | Independent categories; correct native defaults |
| Screen/product/list/search/cart | DebugView + Meta Test Events | DebugView + Meta Test Events | Correct IDs/parameters, no render/sync duplicates, no sensitive data |
| COD, online UPI, online card | One staging order per path | One staging order per path | Eligible only after authoritative confirmation; correct destination amounts |
| Failed/cancelled/pending payment | No purchase | No purchase | No success based solely on UI/intent return |
| Interrupted payment, delayed webhook, restart | Recovery trace | Recovery trace | Original IDs/time/snapshot; declared retry policy |
| Concurrent callbacks, repeat screen, account switch | Ledger/SDK trace | Ledger/SDK trace | No duplicate application dispatch in supported cases |
| Reinstall / second device / uncertain crash | Recorded result/limit | Recorded result/limit | Chosen architecture and accepted delivery limit demonstrated |
| Withdrawal/logout/offline/SDK failure | Queue/control trace | Queue/control trace | Shopping works; no denied replay; identity/queue handling correct |
| Catalog matching | Five feed/sample item comparisons | Same mapping | Actual retailer IDs match, or catalog ads remain off |

M records provider receipt and attribution separately from D's SDK queueing logs. The gate does not pass just because a JavaScript method returned or an app screen appeared. Compare backend eligible consented app orders with corresponding platform reports using consistent dates/time zone; an overcount is an investigation signal, not automatic proof of one particular cause. Sample sizes, delayed reporting, scope and amount definitions must be recorded.

## 11. Stage 7 — publish and rollback

- [ ] D records source commit, exact package/native versions, Doctor output, build profile/images, DTO schema/migration version and test evidence. P/M complete account/disclosure/catalog gates independently for each platform.
- [ ] P confirms live versions in both stores. Increment Android versionCode and iOS buildNumber above the store values using the existing **local** version source; do not assume the configured numbers are unused. Keep OTA disabled unless explicitly approved as separate work.
- [ ] D/P build production with the validated credentials and config; P submits and controls phased rollout. No deployment to PM2 can update installed native apps.
- [ ] Verify existing website tracking and payment APIs remain compatible. Monitor bounded app diagnostics and first genuine consented purchases after release; do not manufacture production sales to satisfy a checklist.
- [ ] Pause the affected provider via its app tracking switch if collection/duplicates/initialization fail; preserve checkout. Native startup defects may need a store rollback/new binary. Record rollback owner and retain the previous signed build/config/commit.
- [ ] Old installed versions remain without these native tracking features until updated. Explicitly label reporting coverage by app version; never claim all historical app orders are tracked.

## 12. Verification record for this revision

**Plan/code verification completed:** existing package/config/navigation/payment routes, current web purchase source guard and value mapping, current customer-order item/currency/category limitations, current OTP app login state, EAS environment profiles and OTA setting were compared with this plan. The last captured Doctor report and app handoff were inspected. Primary sources below were reviewed for version claims and collection controls.

**Not executed or verified by this plan revision:** new SDK installation, native prebuild/iOS archive, physical-device tests, Firebase/Meta account ownership/configuration, live store versions, catalog IDs, test credentials, future DTO/schema implementation, provider purchase deduplication or store release. These are explicit gates above, not claimed fixes. No runtime code, package lockfile, database, GTM workspace or deployed app was changed by revising this plan.

Primary references (reviewed 13 November 2026):

- [React Native Firebase v27 release notes](https://github.com/invertase/react-native-firebase/releases/tag/v27.0.0) and [migration requirements](https://rnfirebase.io/migrating-to-v27).
- [Meta React Native wrapper documentation/config plugin](https://github.com/thebergamo/react-native-fbsdk-next).
- [Firebase collection controls](https://firebase.google.com/docs/analytics/configure-data-collection).
- [GA4 app data streams and Firebase setup](https://support.google.com/analytics/answer/14183469?hl=en).
- [Expo build infrastructure/images](https://docs.expo.dev/build-reference/infrastructure/).
- [Existing project handoff](MOBILE_APP_ANALYTICS_HANDOFF.md) and [website deployment record](DEPLOYMENT.md).
