# Automatic discounts — implementation and release notes

Implemented on `feature/backend-automatic-discounts`, based on verified `origin/staging` commit `9ee80d8` (Meta Pixel), which includes the recent logo and Next.js changes. Work is isolated in a separate git worktree. No remote database, production files, or deployment has been changed.

## Administration and activation

Coupons and General Settings were inspected. Existing coupons support manual cart/shipping offers, targets, dates and redemption limits, but no automatic tiers. A small dedicated **Settings → Automatic Discounts** AdminJS resource reuses existing sessions, styling and `manageSettings` authorization.

Administrators can enable/disable the promotion, add/edit/delete tiers, toggle individual tiers, preview a sample amount and save all changes. Duplicate minimums/IDs, invalid amounts/percentages and more than two decimal places are rejected. Optimistic concurrency rejects stale saves. Preview runs on the server against unsaved inputs; enabling the checkbox for preview does not activate the promotion until **Save changes** is clicked.

Initial database configuration is **OFF**, with active tiers ₹700 → 5%, ₹1,100 → 10%, ₹1,500 → 15%. Application pricing contains no fallback thresholds. Migration and fresh-install seed data initialize these values; reseeding never overwrites an existing promotion.

After an approved staging release and verification, an authorized administrator must open **Settings → Automatic Discounts**, review/adjust the tiers, preview sample subtotals, check **Enable automatic discounts**, and click **Save changes**. Production migration/deployment requires separate approval. Keep the promotion off until the mobile client update is released and consumer integration checks are complete.

## Database and migration

- `AutomaticDiscount`: singleton configuration (`enabled`, validated JSON `tiers`, `updatedAt`).
- `Order.automaticDiscount`: nullable immutable snapshot containing tier ID, minimum, percentage, eligible subtotal and automatic saving.
- `OrderItem.discount`: persisted merchandise discount allocation, default zero for existing rows.
- Existing order totals/tax amounts are never recalculated. Deleted/edited tiers do not affect saved orders or invoices.
- Migration: `server/prisma/migrations/20261102000000_automatic_discounts/migration.sql`.

The repository previously had no Prisma migration history. **Do not run `prisma migrate deploy` blindly against an existing database**: this is a nonempty, previously `db push`/script-managed schema. For the approved release, back up and inspect the target schema, apply the reviewed additive SQL once with the existing schema-change procedure (or establish a complete baseline first), regenerate Prisma Client and restart the API. Do not rerun the SQL after partial/successful execution without checking which statements were applied; MySQL DDL is not transactionally rolled back.

Approved-target command, executed from `server/` with the explicitly selected target connection:

```sh
npx prisma db execute --schema prisma/schema.prisma --file prisma/migrations/20261102000000_automatic_discounts/migration.sql
npm run db:generate
```

Never run the broad `db:seed` against existing production to install this feature; it also seeds unrelated settings/catalog data. The feature SQL initializes only its own configuration. Fresh installations using the existing setup command receive disabled defaults through the seed.

Migration verification used a separate local MySQL 8.0.46 instance at `127.0.0.1:13317`, database `tokri_discounts_test`: built the pre-change staging schema, inserted a historical order, applied the migration, verified `prisma migrate diff --exit-code` reported **No difference detected**, and confirmed the historical amount and null promotion snapshot were unchanged. No shared staging or production database was used.

## Pricing, taxes and coupons

`calculateCheckoutPricing` is shared by delivery quotes, coupon previews, mobile account cart totals and order creation. It reads current database rules and uses server product selling prices. The highest active eligible minimum wins, with no tier stacking. Eligibility and delivery minimums use product subtotal before promotional discounts and exclude GST, shipping and handling.

A merchandise coupon and automatic discount are compared by merchandise saving; the larger single discount wins (automatic wins ties), with a customer-facing explanation. Only the selected coupon is redeemed. Shipping coupons can coexist with an automatic merchandise discount, remain capped at actual shipping fees, and retain existing free-delivery behavior and rejection when shipping is already free. Existing coupon eligibility/usage checks remain in place. An existing undefined `taxOptions` reference in coupon calculation was fixed.

Prisma Decimal arithmetic uses half-up currency rounding. Merchandise discounts are allocated to eligible lines in whole paise using proportional allocation and largest remainders. GST uses each discounted line base and its existing product GST rate; non-taxable fruit remains exempt. CGST uses half-up division of line GST and SGST takes the remainder; IGST uses the whole line GST. Line taxes/discounts and promotion details are stored on order creation. Invoice rows and summaries use those snapshots, including separate shipping-coupon savings. Existing invoice table/footer overflow was corrected while adding the discounted line values.

Razorpay orders, UPI amount conversion and COD use the same saved total. Live payment capture was not performed; the real Razorpay SDK order-creation amount path was verified with its HTTP transport stubbed.

## API and clients

Existing endpoints and total fields remain; new fields are additive:

- `POST /checkout/quote`: optional `couponCode`, `addressId`, `address` for a detected current address. Legacy numeric `discount` is ignored. Product prices and quantities are resolved/validated by the server; missing products are rejected rather than silently omitted. Empty quote carts return zero totals.
- `POST /checkout/preview-coupon`: uses the same promotion comparison and tax allocation. `coupon.discount` is the selected coupon saving (zero when automatic wins); `totals.discount` is the combined permitted saving.
- Totals include `automaticDiscount`, `couponDiscount`, `merchandiseDiscount`, `shippingDiscount`, `discountMessage` and allocated `lineItems`, alongside existing fields.
- `POST /checkout/create-order`: accepts optional `expectedGrandTotal`, returns the authoritative `totals`; a changed expected amount returns HTTP 409 `QUOTE_CHANGED` before creating a Razorpay order or database order. Omitting this field remains supported for existing consumers.
- Order history adds the saved automatic-discount snapshot and tax/line-discount fields.
- Admin read/save/preview stays inside the authenticated AdminJS record-action API.

Website cart, cart drawer and checkout display the server percentage/savings and GST with paise precision. Quotes recalculate on quantities, removals, delivery choice, address and coupon code; an open cart refreshes on focus/every 30 seconds and immediately before checkout. No storefront redesign or threshold constants were introduced. Mobile source now sends coupon codes and address context, displays server discounts/GST, refreshes open-cart rules, and sends the amount agreement guard.

**Legacy consumer rollout:** older clients that send only a numeric coupon amount cannot convey coupon identity authoritatively. Their requests are accepted but that untrusted amount is ignored. Release the included mobile changes and update other quote consumers to send `couponCode` before activating the promotion. Already-installed mobile binaries are not changed by this backend PR. Native device/payment QA and app-store release are still required; Android and iOS JavaScript bundle builds do not replace device QA.

## Verification

Final checks passed:

- Feature integration/API suite: **12/12 tests** (11 scenario groups plus the parent test).
- Existing backend contracts: **24/24 checks**.
- Existing commerce browser regression: **9/9 scenarios**, zero browser exceptions.
- Real AdminJS + Next/API/database browser flow: **PASS**, including saved percentage changes and disable without rebuilding.
- Tax/GST regression, first-three-delivery regression (10 scenarios), historical tax/free-delivery verification and product filters: **PASS**. Old delivery tests were corrected to reflect existing Morning-only benefits and the fact that all qualifying orders count toward quota.
- Meta Pixel consent/isolation regression: **15/15**; logo and pixel source/assets have no feature diff.
- Vite and Next.js production builds: **PASS**.
- Android and iOS Hermes JavaScript exports: **PASS**. No native binary distribution or real payment capture was performed.
- Prisma schema validation and post-migration schema comparison: **PASS**.
- ESLint: **0 errors**, six pre-existing hook dependency warnings.
- PDF text inspection: **PASS**; saved percentage, line bases, split GST and final total reconcile; sample invoice is one A4 page.


| Product subtotal | Expected automatic saving | Result |
| --- | --- | --- |
| ₹699 | ₹0 | PASS |
| ₹700 | ₹35 | PASS |
| ₹1,099 | ₹54.95 | PASS |
| ₹1,100 | ₹110 | PASS |
| ₹1,499 | ₹149.90 | PASS |
| ₹1,500 | ₹225 | PASS |
| ₹2,000 | ₹300 | PASS |

The isolated integration/API suite also covers decimal boundaries, empty carts, quantity changes/removals, disabled/edited tiers, duplicate/invalid tiers, unauthorized/stale admin saves, delivery minimums, first-three benefits, merchandise and shipping coupons, usage limits, dry-fruit and mixed carts, intra/inter-state GST, account-cart totals, quote versus saved COD/Razorpay order amounts, price tampering, historical snapshots and invoice generation.

Browser verification uses real AdminJS authentication and real Next.js/API/database requests. It checks preview without persistence, saves, dynamic percentage updates and disabling in an already-open checkout. The existing commerce browser regression uses isolated fixtures and the actual line-tax calculator; its numeric-discount fixture and old undiscounted-GST expectations were updated to the authoritative coupon-code contract.

Reproduce the integration suite only with the isolated schema/fixtures initialized and promotion disabled:

```sh
DATABASE_URL=mysql://root@127.0.0.1:13317/tokri_discounts_test npm run test:automatic-discounts --prefix server
```

For browser reproduction, seed the **isolated database only** to provision its test admin/catalog, run the API on port 5237 from `server/`, run Next on 3037 with `TOKRIII_API_PROXY_TARGET=http://127.0.0.1:5237`, then run:

```sh
DATABASE_URL=mysql://root@127.0.0.1:13317/tokri_discounts_test node scripts/verify-automatic-discounts-browser.mjs
```

Both feature test scripts reject remote/non-test database URLs and leave the promotion disabled.

Screenshots (local isolated test data): [admin disabled](admin-disabled.png), [admin preview](admin-preview.png), [cart](cart-discount.png), [checkout](checkout-discount.png), [mobile viewport](checkout-mobile.png), [mixed GST checkout](checkout-mixed-gst.png). [Sample invoice](test-invoice.pdf).
