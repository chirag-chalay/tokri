# Tokriii App Tracking Plan: Android and iOS

Revised 13 November 2026. **Scope: implementation plan, not an implemented or released app integration.** Owners: **D** developer; **M** marketing; **P** business owner/app publisher. This document supersedes the previous plan at this path.

## Working order and handoffs

This table is the execution order. D's dependency preparation can run alongside M's account preparation, but **native SDK builds wait for the Stage 2 staging config files**. Each recipient records received / passed / failed / missing, with an evidence link. Only the affected dependency or platform stops at a failed gate; independent work continues.

| Stage | Owner and task | Handoff | Recipient confirmation |
| --- | --- | --- | --- |
| 0 | P + M: business accounts, devices, consent/legal review, iOS measurement choice | Access register, devices/test account, consent decision, ATT-denied measurement choice | D confirms access and lists missing inputs |
| 1 | D: dependency cleanup and compatibility investigation | Doctor/lockfile/toolchain findings and proposed pins | M/P acknowledge build prerequisites; no native compatibility claim yet |
| 2A | M/P: staging Firebase apps and Meta test registration; disclosures drafted | Four environment/platform config-file assignments, app IDs, test destination details | D verifies identity/project/API alignment before building |
| 2B | D: native defaults, first iOS link test, Android/iOS startup and consent tests | Builds, logs, selected fallback if needed, install-measurement findings | M verifies staging destinations; P explicitly accepts any platform fallback |
| 3 | D backend: confirmed DTO, source, snapshots and ID lookup | Staging contract examples and confirmation evidence | M confirms GA4/Meta amount definitions and can look up an opaque ID |
| 4 | D app: event adapter, purchase queue and recovery | Test builds and event/permission matrix | M verifies expected events; unresolved delivery limits go to P |
| 5 | M/P: finalize privacy/store forms and ads configuration | Approved disclosures, AD_ID declaration evidence, catalog/attribution settings | D confirms generated binary agrees with the declared collection |
| 6 | D + M: focused real-device QA | Android and iOS results separately | M records passed/failed per platform; P accepts stated limits |
| 7 | P: signed store builds and rollout; M: post-release reports | Published versions/build IDs and monitoring evidence | D confirms technical health; M confirms reporting scope |

M owns one consolidated register of accounts, catalog mapping, measurement decisions, disclosures, platform declarations and reporting evidence. D supplies technical facts rather than asking M to infer SDK behavior. Submission remains with the app publisher selected by the owner.

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
- [ ] Approve independent analytics/marketing opt-in wording and withdrawal controls. Unknown choices default to denied as this plan's engineering baseline. P/M obtain appropriate legal review of notice, consent, lawful basis and regional requirements; this document does not decide whether a policy notice is legally sufficient in every case.
- [ ] P/M select the iOS ATT-denied measurement approach **before committing to app-first Meta campaign expectations**: authorized-only measurement, or the supported aggregate/AEM approach described in Stage 2. Obtain appropriate legal/platform-policy review; the technical default-off model is an engineering choice, not a legal finding that a notice is always insufficient.
- [ ] Decide purchase dispatch ownership and the crash/retry tradeoff in section 7 before implementing purchase sending. App-side SDK-only delivery cannot guarantee reporting for users who never reopen the app.

**Evidence:** IDs/roles verified by their owners, device list and test environment, five catalog comparison rows, consent copy, and purchase-delivery decision. Account/device/catalog gates remain OPEN until actual evidence exists.

## 4. Stage 1 — dependency preparation

**Owner D; publisher provides native build access.** This stage prepares dependencies; the native build gate runs in Stage 2 **after** staging app registrations/config files are available. Work on `marketingdimpal` or an isolated worktree based on it; push only `marketingdimpal` unless the owner changes that instruction. Preserve unrelated local work. Plan changes do not authorize unrelated dependency upgrades or new account creation.

- [ ] Capture baseline commit, lockfile, Expo Doctor output and reproducible build settings.
- [ ] Resolve `expo-font` with `npx expo install expo-font`; review `npx expo install --check` and only then apply SDK-compatible fixes. Inspect the lockfile diff; do not remove duplicates by editing `node_modules` or suppress Doctor failures to obtain a pass.
- [ ] Re-run Expo Doctor and `npm ls expo-font`; preserve exact outputs. Document any failure with an owner and resolution rather than labelling it passed.
- [ ] Choose and pin a compatible React Native Firebase app/analytics pair and Meta wrapper release. Do not paste a floating `npm i ...@^27` command into production blindly.
- [ ] React Native Firebase v27.0.0 release notes contain the Expo SDK 58 scene-based AppDelegate fix. Its migration guide also specifies Firebase Android BoM 35, Android minSdk 24 and Kotlin Gradle plugin >=2.4.0, plus Apple Firebase 13 via Swift Package Manager/dynamic frameworks. Verify the generated Expo SDK 58 toolchain against these requirements. If incompatible, evaluate a documented upstream-supported combination or isolated override, with logs and a device build; do not invent an older version pin or upgrade Kotlin broadly without review. [RNFB release](https://github.com/invertase/react-native-firebase/releases/tag/v27.0.0), [v27 migration](https://rnfirebase.io/migrating-to-v27).
- [ ] Inspect the exact Meta wrapper config-plugin code/options and generated native output. Its generic React Native compatibility table does not prove compatibility with this app's RN 0.88/New Architecture/scene lifecycle. [Wrapper documentation](https://github.com/thebergamo/react-native-fbsdk-next).
- [ ] Use SDK-compatible Expo tooling for `expo-dev-client` and, if needed, `expo-tracking-transparency`. Native config must use the documented options for the pinned packages.
- [ ] Select and record actual EAS Android/iOS images/toolchains. SDK 58 scene support and an Xcode 27 build SDK do not mean the app supports only iOS 27 devices; verify deployment targets and supported OS versions separately. [Expo build images](https://docs.expo.dev/build-reference/infrastructure/).
**Handoff to M/P:** dependency/Doctor report and proposed exact versions. **Confirm:** M/P supply the missing Stage 2 configs/access; they do not certify native compatibility from this report.

### Stage 1 implementation record — 13 November 2026

- Starting revision: `e9eb552` on `marketingdimpal`. Added direct `expo-font` and updated the five Expo packages to the SDK 58 compatible patch versions recorded in the mobile lockfile. Existing app identifiers, API settings, native configuration and shopping code were not changed.
- After installation, `npx expo-doctor` passed 20/20 checks, `npm ls expo-font` showed one deduplicated 58.0.12 version, and `npx expo install --check` reported compatible dependencies. Android JavaScript export passed; this does not establish native build or device compatibility. Expo's installer exited nonzero because it could not automatically modify the dynamic `app.config.js`: its suggested font and status-bar plugins have no effect without options in the installed plugin implementations, so they were not added without a corresponding configuration need.
- `npm audit --omit=dev` reported 7 advisories (3 moderate, 3 high, 1 critical), including transitive tooling and navigation dependencies. These have not been remediated or assessed as exploitable in the shipped app; review separately before release. Do not run a force upgrade without compatibility review.
- Firebase/Meta packages, provider configuration and tracking events are not yet installed or implemented. Staging Firebase registrations/files, an isolated Meta test destination, verification of the staging API and the documented native compatibility gates remain open. The app publisher retains responsibility for signed store builds.

### Owner decision and implementation update — 13 November 2026

The owner has chosen to test directly against the live app destinations instead of creating Firebase or Meta staging apps. Firebase project `tokriii-ec2de` has Android and iOS registrations for `com.tokriii.app`. The owner describes `server.tokriii.com` as a separate staging environment. This decision supersedes the staging-destination requirement for the selected live tests; the existing staging profiles must not silently receive production credentials. Confirm the actual test build identity and API destination, obtain production app configuration files, and coordinate with marketing to identify test events and their reporting impact. Do not generate production orders or alter live provider settings without the appropriate test procedure. Consent controls, native compatibility, correct purchase confirmation, publisher release and device verification remain required.

`tokri-mobile-go/src/lib/trackingCommerce.js` now prepares validated, allowlisted browse/cart payloads using product slugs. It does not send events, register an SDK, or implement purchases; catalog slug matching still needs verification. Focused Node tests cover normal payloads and invalid data. Firebase/Meta event integration remains incomplete.

## 5. Stage 2 — environment configuration and collection controls

**M/P register accounts and app variants; D configures and verifies.**

| Build profile | Current app identity / API | Intended tracking destination |
| --- | --- | --- |
| development / staging | `.staging` identity / staging API | Separate staging Firebase project/GA4 property; isolated Meta test destination or Meta disabled |
| preview | Currently production identity / production API | Treat as production unless a new isolated QA profile explicitly changes all destinations |
| production | Production identity / production API | Production Firebase apps linked to the intended GA4 property; production Meta app |

- [ ] Use distinct registered Android/iOS apps for each identity in the chosen Firebase projects. Validate `google-services.json` package and `GoogleService-Info.plist` bundle/project IDs. Ensure EAS receives the correct files for the selected profile; track file paths and public IDs, not private credential contents.
- [ ] M/P provide staging registrations/files first (or in parallel with Stage 1 cleanup), and production files before the production build. D explicitly confirms receipt and package/bundle/project matches before any SDK native smoke build.
- [ ] Separate API host, app variant and analytics destinations explicitly; do not infer environment from build name alone. Fail closed when a test app has production analytics credentials or an unexpected API host. Check staging Razorpay account/mode too.
- [ ] Configure Meta for both actual app variants as supported: package, generated activity name, debug/release signing key hashes (including the store signing certificate where required), bundle ID, URL scheme and store association. Verify the activity name from generated native files instead of assuming it. Follow the provider's current attribution/SKAN setup; do not hardcode a universal iOS Purchase-priority screen or event order from an older interface.
- [ ] If a production-ID internal build is required, register that identity in a **test** Firebase project and use the staging backend and isolated Meta test configuration. Confirm this combination is supported; otherwise keep Meta off. Never use production analytics as an implicit workaround.
- [ ] Native Firebase analytics collection and applicable ad-consent defaults are denied before JS initializes. Disable automatic native screen reporting when React Navigation owns screen views. Meta auto-init, auto app events, automatic purchase logging and advertiser-ID collection must be off until the chosen permissions allow them. Inspect generated native defaults, not just runtime calls.
- [ ] Persist independent analytics and marketing choices with a policy version. Analytics consent controls Firebase; marketing consent controls Meta. ATT controls access to Apple tracking identifiers and tracking activity; it does not replace the app's consent choice and does not by itself authorize analytics.
- [ ] On iOS, request ATT only in the selected marketing flow, in a valid app state, with a clear usage description. Handle authorized, denied, restricted and not-determined; never enable advertiser tracking when not authorized. Implement the explicit owner-selected model below; an ATT denial must not be silently converted into permission for identified tracking.
- [ ] Android has no iOS ATT dialog, but still needs the app's consent controls and applicable advertising-ID/platform restrictions. Do not equate “no ATT” with unconditional marketing collection.
- [ ] Provide settings withdrawal and re-consent, remove unsent app-owned events/identifiers for the revoked purpose, update SDK collection flags and clear analytics user identity on logout. Do not replay actions that happened while denied. Do not claim an SDK can recall events already accepted or guaranteed to be in flight.
- [ ] In the initial SDK smoke test, intentionally grant staging consent before checking DebugView/Test Events. An app with collection denied should produce no test events; this is not a failed integration.

### First iOS native test: Firebase SPM plus Meta wrapper linking

Run this test before funnel event implementation, once staging configs exist. [Meta wrapper issue #678](https://github.com/thebergamo/react-native-fbsdk-next/issues/678) reports undefined RCT symbols in the wrapper pod using dynamic frameworks on RN 0.86.2 / wrapper 13.4.3 / RNFB 26.2.0. As checked on 13 November 2026 it is **closed after a stale cycle**, with a later comment saying the issue remains; no verified RN 0.88 fix is established by that issue. It is a relevant compatibility risk, **not a reproduced Tokriii failure**. Its old disable-SPM/static-Firebase workaround is incompatible with RNFB v27's SPM-only requirement.

1. D records exact RNFB/Meta/native versions and reproduces an arm64 simulator build plus a signed device build with Firebase SPM/dynamic linkage. Retain the full linker error and failing pod if it fails. If it passes, record the actual combination; do not apply speculative fixes.
2. If it fails, first evaluate `expo-build-properties` → `ios.forceStaticLinking` for the **actual wrapper CocoaPod name** from its pinned podspec, while keeping RNFB's required SPM/dynamic setup. Expo documents the selective-linking option, but its effectiveness for this pod is **unverified**. Inspect generated Podfile behavior and re-test both builds. [Expo option](https://docs.expo.dev/versions/latest/sdk/build-properties/#pluginconfigtypeios).
3. Next option: a narrowly reviewed, version-pinned pod-linking patch using `patch-package` or a reproducible config plugin. Keep the patch in Git, make clean installs/EAS apply it, test release/device linking, and assign an owner/removal condition. Editing generated files or `node_modules` manually is not a release fix.
4. Fallback product decision: release iOS with Firebase only and explicitly disable/remove the Meta native dependency for that iOS build if required to link. Verify Android still builds. P/M must accept the loss of Meta iOS app measurement before release/campaign launch. Server-side **app** events are a later, separately designed integration with app-specific attribution/consent/ownership; existing website CAPI is not a drop-in fallback and will not automatically restore installs or AEM coverage.

No workaround is marked passed until real build/device evidence exists.

### Meta activation and install measurement after consent

The wrapper defaults `autoLogAppEventsEnabled` and `advertiserIDCollectionEnabled` to false and documents both for its Expo auto-install path. Keeping them permanently off would leave that path unconfigured. After applicable marketing consent/platform permission, D must implement and test initialization plus the pinned SDK's supported controls (`Settings.initializeSDK`, `Settings.setAutoLogAppEventsEnabled`, and supported advertiser-ID/ATT controls). Native defaults remain off before choice. Confirm that runtime activation provides the intended deferred install/activation behavior; if the pinned SDK requires different build-time settings, resolve that against the zero-pre-consent requirement rather than enabling collection blindly. [Wrapper configuration and installs](https://github.com/thebergamo/react-native-fbsdk-next#enabling-auto-app-installs-in-expo).

Once auto events are enabled, inventory exactly what they send, including activation and any automatic commerce events. Retain one sender for each Razorpay physical-goods purchase; use documented per-event controls where available and verify duplicates rather than assuming a universal separate auto-purchase switch. Test fresh install, denied choice, later acceptance, relaunch and withdrawal on each platform. M confirms install attribution separately from SDK activation; logged events do not guarantee an attributed install, and consent/ATT restrictions can limit coverage.

### iOS measurement when ATT is declined: owner decision gate

- **Option A — authorized-only Meta:** Firebase remains independently controlled by analytics consent; identified Meta tracking and advertiser identifiers stay off unless the relevant permissions allow them. P/M accept reduced Meta iOS coverage, including effects on app-first campaigns.
- **Option B — evaluated aggregated measurement:** investigate the pinned wrapper's `AEMReporterIOS`, matching event names/amounts, and cold/warm deep-link forwarding through the scene/app delegate. Its documented purchase integration calls `logAEMEvent` alongside the selected app-event path. D must verify current native/provider support, applicable consent, account setup and absence of prohibited identifiers or duplicate standard purchases before adopting that path. AEM is not permission to bypass ATT, is not a guaranteed replacement for all install measurement, and is not enabled merely by adding one JavaScript call. [Wrapper AEM integration](https://github.com/thebergamo/react-native-fbsdk-next#aggregated-event-measurement-aem-for-ios).

Record P/M's chosen option, review owner, measurable limitations and QA evidence before enabling iOS Meta campaigns. If unsupported, use Option A or the Firebase-only fallback explicitly; do not promise opted-out coverage.

### Android Advertising ID and Play Console declaration

For an app targeting Android 13/API 33+ that accesses Advertising ID, Google's documentation requires `com.google.android.gms.permission.AD_ID`; an SDK can add it through manifest merging. D inspects the **final AAB merged manifest**, target SDK, dependencies and actual collection behavior. M/P complete **Play Console → App content → Advertising ID** consistently with the shipped artifact and purpose, together with Data Safety. A permission in a dependency is relevant even if absent in the source manifest. Respect deleted/zeroed IDs and user/platform restrictions; do not substitute a persistent customer/device ID to defeat those restrictions. [Google Advertising ID requirements](https://support.google.com/googleplay/android-developer/answer/6048248?hl=en).

If the selected build does not use Advertising ID, review removing/blocking the permission and disabling SDK collection with matching declarations; do not add it solely to clear a warning. P must inspect the actual Console declaration/release validation, including active artifact warnings. **That account-side check has not been performed here.**

- [ ] D generates native projects in an isolated checkout and inspects initialization, linkage, merged manifests, privacy manifests, URL schemes and ATT text; then builds/launches Android and iOS clients. Do not run destructive clean-prebuild over working changes.
- [ ] Test cold launch, background/resume, deep links, OTP login, location, UPI return and Razorpay WebView completion. A JavaScript export is not native build evidence.

**Handoff D → M/P:** build/install links, iOS linker result or proposed fallback, destination IDs, consent/install/AEM test results and merged-manifest AD_ID evidence. **Confirm M/P:** staging receipt checked per platform; fallback and opted-out measurement decisions recorded. D proceeds with independent backend work while an account check is pending, but does not declare that platform ready.

**GATE:** Physical Android/iPhone evidence of zero provider collection before consent, correct analytics-only/marketing-only behavior, iOS permission outcomes, correct project/app IDs, and no production pollution from test builds. Firebase documents native collection defaults and persisted runtime settings in [collection controls](https://firebase.google.com/docs/analytics/configure-data-collection).

## 6. Stage 3 — authoritative purchase contract

**Owner D backend, M verifies reporting definitions.** Keep all existing order/payment response fields and business rules compatible. Add a small, versioned tracking DTO; do not repurpose customer-facing order DTOs or require tracking success to complete checkout.

### Amount and identity rules

- Firebase/GA4 `value`: discounted merchandise value excluding tax and shipping, matching the website `merchandiseValue`. Net item `price` excludes item discount and any included item tax; use explicit per-unit discounts and quantity. Send order tax and net shipping separately. Document handling/small-cart fees separately so the sum can be reconciled to the grand total; do not silently relabel fees as merchandise.
- Meta purchase amount: confirmed `grandTotal`, matching website Meta. `currency`: authoritative order currency (`INR` in current checkout). Do not derive revenue from current cart state, WebView contents or client-submitted totals.
- `transactionId` and `eventId`: stable opaque backend identities, consistent with the existing website purchase identity where the order is the same. Avoid raw order numbers in general event parameters. Destination-specific ownership, not a different ID per screen/device, prevents duplicate purchase sending.
- Provide an authorized admin/reporting lookup from opaque transaction/event ID to internal order ID/order number, source/platform, confirmation time and both amount definitions. Restrict access by role, log lookup access appropriately, and keep this mapping out of public analytics payloads. Reuse the existing deterministic website `purchaseIdentity(order.id)` where appropriate; do not require marketing to reverse a hash. M must demonstrate one GA4 transaction → backend order match during handoff.
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

**Handoff D → M:** staging COD/UPI/card DTOs, original-confirmation evidence, amount reconciliation and an authorized opaque-ID lookup example. **Confirm M:** each amount matches its website/provider definition, the order can be identified internally, and quantities/catalog mapping are understood. P accepts any remaining reporting limit before release.

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

**Handoff D → M/P:** Android/iOS builds, event map, queue/recovery state examples and explicit uncertain-send/reinstall limits. **Confirm M:** staging receipt/amounts verified; **Confirm P:** chosen dispatch guarantees and unsupported cases accepted before the purchase release gate.

## 8. Event contract

Use Firebase SDK modular APIs documented for the pinned version; use Meta wrapper constants/dedicated APIs (e.g. `logPurchase`) and the current native event parameter schema. Firebase `items` arrays cannot be copied blindly into Meta parameters. Inventory auto-logged commerce events after enabling install/activation collection, and prove there is one sender for these Razorpay physical-goods purchases; do not assume a separate auto-purchase switch exists in every pinned SDK.

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
- Tell marketing explicitly that GA4 and Meta revenue totals are **not expected to match directly**: their value definitions differ, and consent/attribution/coverage can differ too. They can coincide for some orders; “never match” is too absolute. The reporting lookup must show both amounts and the tax/shipping/fee bridge so discrepancies can be explained rather than “fixed” by changing amounts without approval.
- Add bounded redacted diagnostics for SDK init, destination/config version, queue state, delivery errors and permission changes. Never log full order/customer payloads, tokens, phone numbers or payment inputs. Establish queue-failure alerting, retention and a kill-switch owner.

**Handoff M/P → D:** the consolidated approved disclosure/consent copy, iOS measurement decision, AD_ID declaration/release-validation evidence and attribution/catalog settings. **Confirm D:** generated builds and event payloads match those declarations; unresolved differences stop the affected release.

## 10. Stage 6 — focused verification matrix and release gates

Use isolated staging accounts and Razorpay test mode; do not create real production orders for a routine tracking test. Real-device native evidence is mandatory for release; local export/mock tests do not replace it.

| Check | Android evidence | iOS evidence | Pass condition |
| --- | --- | --- | --- |
| Native SDK compatibility | Build/install/cold launch + log | Build/install/cold launch + log | Correct versions/toolchain; no startup/linkage errors |
| Firebase SPM + Meta pod | Normal native build | First arm64 simulator/device linkage gate | Stock build passes, or selected workaround/fallback has actual evidence |
| Environment isolation | Project/app/API/Meta IDs | Project/app/API/Meta IDs | Test build cannot send to production destinations |
| Consent on first launch/resume | No providers before choice | No providers before choice; ATT states | Independent categories; correct native defaults |
| Install/activation after choice | Fresh install, later opt-in and relaunch | Same, with authorized/denied/restricted ATT | Chosen auto-event controls work; attributed installs checked separately |
| ATT-denied aggregate choice | Not applicable | Selected AEM/no-Meta model, cold/warm deep links | Owner decision honored; no prohibited identifiers, no duplicate purchase path |
| Advertising ID declaration | Final AAB permission and Play validation | Not applicable | AD_ID declaration, actual SDK access and merged manifest agree |
| Screen/product/list/search/cart | DebugView + Meta Test Events | DebugView + Meta Test Events | Correct IDs/parameters, no render/sync duplicates, no sensitive data |
| COD, online UPI, online card | One staging order per path | One staging order per path | Eligible only after authoritative confirmation; correct destination amounts |
| Failed/cancelled/pending payment | No purchase | No purchase | No success based solely on UI/intent return |
| Interrupted payment, delayed webhook, restart | Recovery trace | Recovery trace | Original IDs/time/snapshot; declared retry policy |
| Concurrent callbacks, repeat screen, account switch | Ledger/SDK trace | Ledger/SDK trace | No duplicate application dispatch in supported cases |
| Reinstall / second device / uncertain crash | Recorded result/limit | Recorded result/limit | Chosen architecture and accepted delivery limit demonstrated |
| Withdrawal/logout/offline/SDK failure | Queue/control trace | Queue/control trace | Shopping works; no denied replay; identity/queue handling correct |
| Catalog matching | Five feed/sample item comparisons | Same mapping | Actual retailer IDs match, or catalog ads remain off |
| Revenue reconciliation | GA4 transaction → internal order lookup | Same lookup | Both provider values and tax/shipping/fee differences explained |

M records provider receipt and attribution separately from D's SDK queueing logs. The gate does not pass just because a JavaScript method returned or an app screen appeared. Compare backend eligible consented app orders with corresponding platform reports using consistent dates/time zone; an overcount is an investigation signal, not automatic proof of one particular cause. Sample sizes, delayed reporting, scope and amount definitions must be recorded.

**Handoff D/M → P:** signed-off evidence matrix, separately marked Android/iOS pass/fail, and unresolved limitations. **Confirm P:** authorizes the specified platform release or records the blocked gate; an Android pass does not approve iOS automatically.

## 11. Stage 7 — publish and rollback

- [ ] D records source commit, exact package/native versions, Doctor output, build profile/images, DTO schema/migration version and test evidence. P/M complete account/disclosure/catalog gates independently for each platform.
- [ ] P confirms live versions in both stores. Increment Android versionCode and iOS buildNumber above the store values using the existing **local** version source; do not assume the configured numbers are unused. Keep OTA disabled unless explicitly approved as separate work.
- [ ] D/P build production with the validated credentials and config; P submits and controls phased rollout. No deployment to PM2 can update installed native apps.
- [ ] Verify existing website tracking and payment APIs remain compatible. Monitor bounded app diagnostics and first genuine consented purchases after release; do not manufacture production sales to satisfy a checklist.
- [ ] Pause the affected provider via its app tracking switch if collection/duplicates/initialization fail; preserve checkout. Native startup defects may need a store rollback/new binary. Record rollback owner and retain the previous signed build/config/commit.
- [ ] Old installed versions remain without these native tracking features until updated. Explicitly label reporting coverage by app version; never claim all historical app orders are tracked.

**Handoff P → M/D:** actual published store versions, build IDs and rollout percentage. **Confirm D:** technical health; **Confirm M:** initial genuine consented app reporting and expected coverage/amount differences. If provider receipt is missing, record and investigate it instead of calling the campaign setup complete.

## 12. Verification record for this revision

**Plan/code verification completed:** existing package/config/navigation/payment routes, current web purchase source guard and value mapping, current customer-order item/currency/category limitations, current OTP app login state, EAS environment profiles and OTA setting were compared with this plan. The last captured Doctor report and app handoff were inspected. Primary sources below were reviewed for version claims and collection controls.

**Not executed or verified by this plan revision:** new SDK installation, native prebuild/iOS archive, physical-device tests, Firebase/Meta account ownership/configuration, live store versions, catalog IDs, test credentials, future DTO/schema implementation, provider purchase deduplication or store release. These are explicit gates above, not claimed fixes. No runtime code, package lockfile, database, GTM workspace or deployed app was changed by revising this plan.

### Repository evidence for facts an external reviewer could not inspect

Rechecked against source revision `0a0b212` (the previous plan commit); these references describe present behavior, not promised app implementation. The repository owner can share the cited files with the reviewer without sharing private environment files or customer records.

| Claim | Code evidence | Meaning / limit |
| --- | --- | --- |
| Existing CAPI accepts web orders only | [`trackingPurchase.js`](../../server/src/services/trackingPurchase.js): `value.source !== 'web'` in capture; `context.source !== 'web'` in enqueue | App orders do not enter the existing web Purchase worker automatically |
| Full order DTO lacks category and explicit currency | [`customerOrders.js`](../../server/src/services/customerOrders.js), `formatCustomerOrder` | Items have line `id`, product `slug`, name, price, quantity and discount/tax fields; category and currency are absent from that formatter |
| Create-order is not a confirmed item-level tracking DTO | [`checkout.js`](../../server/src/services/checkout.js), `createCheckoutOrder` return | Includes `totals`, a small `order` object and payment details; conditional existing **web** `trackingPurchase` is distinct from the proposed native snapshot/recovery contract |
| GA4 and Meta amounts differ today | [`trackingPurchase.js`](../../server/src/services/trackingPurchase.js), `purchaseSummary`; [`trackingEvents.js`](../../src/lib/trackingEvents.js), `buildCommerceEvent` | Website summary supplies `grandTotal` as Meta value and `merchandiseValue` for GA4's purchase value |
| Preview profile reaches production | [`eas.json`](../../tokri-mobile-go/eas.json): preview uses `https://tokriii.com/api/v1` and no staging variant; [`app.config.js`](../../tokri-mobile-go/app.config.js) | Staging identity depends on `APP_VARIANT=staging`; preview defaults to production identity |
| Proposed DTO and native modules are design only | Section 6 DTO and section 8 file map | No claim that these future fields, endpoints, modules or SDKs already exist; implementation must supply contract tests and staging examples |

For review evidence, use synthetic order payloads and role-authorized ID lookups; never distribute real customer addresses, payment signatures or access tokens. The external issue and documentation review strengthens the plan, but does not demonstrate RN 0.88 native linking, actual Play Console answers, or current AEM eligibility in Tokriii's Meta account.

Primary references (reviewed 13 November 2026):

- [React Native Firebase v27 release notes](https://github.com/invertase/react-native-firebase/releases/tag/v27.0.0) and [migration requirements](https://rnfirebase.io/migrating-to-v27).
- [Meta React Native wrapper documentation/config plugin](https://github.com/thebergamo/react-native-fbsdk-next).
- [Firebase collection controls](https://firebase.google.com/docs/analytics/configure-data-collection).
- [GA4 app data streams and Firebase setup](https://support.google.com/analytics/answer/14183469?hl=en).
- [Expo build infrastructure/images](https://docs.expo.dev/build-reference/infrastructure/).
- [Existing project handoff](MOBILE_APP_ANALYTICS_HANDOFF.md) and [website deployment record](DEPLOYMENT.md).
- [Meta wrapper dynamic-linking issue #678](https://github.com/thebergamo/react-native-fbsdk-next/issues/678) (reported RN 0.86; closed/stale status is not evidence of a fix).
- [Expo selective static linking](https://docs.expo.dev/versions/latest/sdk/build-properties/), [Google Advertising ID requirements](https://support.google.com/googleplay/android-developer/answer/6048248?hl=en), and [Google Analytics collection/identifier guidance](https://support.google.com/analytics/answer/11593727).
