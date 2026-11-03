# Checkout coupon flicker correction

Baseline: `4b75c0dac7bc545f2125970a679d580150f36957`, branch `feature/tokriii-manual-checkout-coupons`. Implemented directly with the user's authorization after the supplied patch was unavailable.

## Changes

- `src/context/CartContext.jsx`: retain the last successful quote for display while checking readiness independently against the input key **and cart revision**. Payment remains blocked during coupon preview, quote updates and quote failures (including failed refreshes with unchanged inputs).
- Consolidate automatic revalidation, focus refresh and payment verification into one request path. Identical in-flight requests share a promise. Reject stale success and error responses, including cart A → B → A changes. Explicitly revalidate when reapplying the same selected code.
- Accept backend coupon-removal totals under the cleared selection key/revision without making a redundant quote request or applying a replacement coupon.
- `src/components/CouponBox.jsx`: keep keyed coupon cards, action buttons and the input mounted. Show a small Updating label on the affected action; prevent other actions until verification. Guarded `aria-disabled` states retain action-button focus. The payment button stays natively disabled. A failed quote preserves old totals and offers a Retry action.
- `src/components/DiscountDetails.jsx` and `src/pages/CheckoutPage.jsx`: retain displayed amounts during updates and reserve space for selection, savings, discount and error messages. No new animation, navigation, scroll reset or frontend discount/GST calculation is introduced.

Backend services, coupon eligibility, GST allocation, migrations, campaigns, payments, uploaded files and production configuration are unchanged by this commit.

## Actual browser measurements

Chromium sampled live layout on animation frames around each action. Each width ran Apply 5%, switch 10%, switch 15%, Remove, Apply 15%, switch 5%, Remove. Quote responses were delayed 650ms and previews 200ms. The input's document position, summary height, scroll offset, card DOM identity, input identity, action focus, request count and payment readiness were checked.

The original Next production build reproduced the baseline collapse. A detached `4b75c0d` checkout served through Vite reproduced the same dimensions using the same fixture and measurement procedure. The corrected measurements use the Next production build. Measurements begin after Playwright positions and focuses the target button, excluding automation's own scroll into view.

| Metric | Before, 1440px | After, 1440px | Before, 360px | After, 360px |
|---|---:|---:|---:|---:|
| Minimum mounted cards during an action | 0 | 3 | 0 | 3 |
| Maximum summary height change | 428.78px | 0px | 428.78px | 0px |
| Maximum input document-position change | 308.78px | 0px | 356.78px | 0px |
| Scroll-position change | 0px | 0px | 0px | 0px |

Across all 14 corrected cycles: original card and input nodes remained mounted, action focus was retained, payment was disabled while pending and each action generated exactly one quote request. No new document load or navigation occurred. Manual Enter submission retained input focus throughout validation.

Raw measurements: [before](flicker/before.json), [after](flicker/after.json).

## Additional checks

The new local-only `scripts/verify-coupon-layout.mjs` browser regression also verifies:

- Old totals remain displayed while waiting; only the server response changes discount and GST values.
- Quote and preview failures preserve geometry and cards; failed quotes block payment until Retry succeeds.
- A failed refresh with the same input key still blocks payment.
- Three simultaneous refreshes share one request; duplicate Apply events share one preview and one quote.
- Reapplying the already-selected code fetches one fresh quote.
- An older below-minimum response cannot remove a coupon after a newer cart revision has been verified.
- A genuinely invalid selected coupon is removed after a cart reduction; increasing the cart does not reapply it or select another offer.
- Desktop/mobile browser execution has no page exceptions or horizontal reflow caused by coupon updates.

`verify-manual-coupons-browser.mjs` now accepts a local test URL/screenshot destination and observes `aria-busy`/`aria-disabled` readiness. Its product-removal selector is scoped to the product row, so it cannot accidentally click a coupon's Remove button. It passed against real Express + isolated MySQL at localhost:5242, separate from the user's populated localhost:5241 preview.

## Validation results

- Next.js production build: PASS.
- Vite production build: PASS.
- Lint: PASS, zero errors and six existing hook warnings.
- New layout/slow-response/failure/race browser suite: PASS at 1440px and 360px.
- Existing manual-coupon browser regression: PASS against isolated MySQL, including real removal, quantity changes, admin edits, invalidation and stale-response checks.
- Existing commerce regression: all nine scenarios PASS, including changed totals, failure recovery and duplicate checkout protection.

Reproduce the self-contained layout suite against a local running storefront:

```sh
TEST_SITE=http://localhost:5241 node scripts/verify-coupon-layout.mjs
```

The layout suite intercepts API calls with controlled fixtures and blocks external requests. The real manual-coupon suite uses its existing strict local database guard; its test server must use that same isolated schema:

```sh
TOKRIII_TEST_SITE=http://localhost:5242 \
TOKRIII_TEST_SCREENSHOTS=/tmp/tokri-coupon-regression \
DATABASE_URL=mysql://root@127.0.0.1:13318/tokri_manual_coupons_test \
node scripts/verify-manual-coupons-browser.mjs
```

No deployment or production write was performed. The existing populated local preview remains available at localhost:5241.
