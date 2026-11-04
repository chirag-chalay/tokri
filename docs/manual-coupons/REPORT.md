# Customer-selected checkout coupons

This replaces the active Automatic Discounts feature. Baseline verified from remote staging: `6533795be32449b06c857122b0bfd4d4191f391f`; no newer staging commits were present. Branch: `feature/tokriii-manual-checkout-coupons`.

The storefront Coupons & offers UI (mini cart, cart, checkout) lists `showAtCheckout` offers, including locked rows. Shoppers tap Apply to select one offer (nothing auto-applies). Optional admin Know more HTML appears only when set. There is no manual “Have a coupon?” code input on the website. Shipping coupons also occupy the single coupon slot; first-three-orders free morning delivery remains separate.

## Backend and admin

Existing `Coupon`, coupon handlers, restrictions, previews, and shared Decimal/GST pricing are reused. No replacement promotion system is introduced.

Admin: **Coupons → Create new / Edit**. Existing percentage, minimum cart, activation, validity, global cap, per-customer single-use, and product/category targeting controls remain. New **Show publicly in checkout Available Coupons** checkbox defaults false. Only existing `manageCoupons` authorized administrators can save.

The old calculation service, Settings resource, editor component, registration, locale entry and feature-specific tests were removed. Active cart/mobile summaries no longer render automatic promotions. Shared pricing, money, item allocation and invoice code remain.

Retained for safety:

- `AutomaticDiscount`: retired configuration/audit only; no application pricing reads or admin resource. Migration switches it OFF.
- `Order.automaticDiscount`: historical snapshot; new orders leave it null. Old invoices, admin order details, customer history and mobile order details still render stored snapshots.
- `OrderItem.discount`: still required for coupon allocation and historical GST/invoices.

No historical order totals, redemptions or allocations are rewritten. No cleanup DROP migration is proposed.

## API and selection state

`POST /api/v1/checkout/quote` remains compatible and gains:

- `items`: authoritative product selling prices and quantities.
- `availableCoupons`: only records with `showAtCheckout=true`, including locked offers. Each has `id`, `code`, `label`, `percentage`, `minimumSubtotal`, `eligible`, `amountToUnlock`, `estimatedSavings`, `applied`, `reason`.
- `couponStatus`: null, `{status:'applied',code}`, or `{status:'removed',code,reason,message}`.

No private codes are included in the offers list. The selected code supplied by the customer is revalidated on every quote. Invalid selections return current totals without the coupon, rather than a quote error. The existing preview endpoint stays strict so an attempted invalid replacement does not discard a valid selection. Final order creation independently rejects invalid selections.

Numeric client `discount` and client prices remain ignored. Eligibility uses backend product subtotal before discounts, fees and tax. GST uses discounted eligible item bases and exact currency rounding. Delivery minimums use the original product subtotal.

Only an explicitly selected code is persisted in browser session storage. It is validated again on refresh. Invalidated/removed selections are erased; increasing the cart cannot restore them. Cart/address/delivery/session changes invalidate pending response keys; request sequence guards prevent old Apply/quote responses replacing current state. Checkout is blocked while applying or recalculating. Focus, checkout return and periodic refresh revalidate live admin changes.

Coupon row locking, fresh eligibility validation, order creation, usage increment and redemption now commit in one transaction. Concurrent global/single-use requests cannot both win the final slot; failed reservation transactions leave no order. Payment retries and duplicate callbacks for the same order never redeem again. Existing policy is retained: a created online order reserves a use while its payment can still be retried/captured; a failed payment attempt does not release it or consume another use. No new cancellation/refund or payment state transition policy is introduced.

## Migration and activation

Review separately: [`20261103000000_manual_checkout_coupons/migration.sql`](../../server/prisma/migrations/20261103000000_manual_checkout_coupons/migration.sql).

SHA256: `adbbb78417bdb61e2e977b60a352046b0132ed388251b61c8ca6eb576ee652e6`.

It adds `Coupon.showAtCheckout DEFAULT false`, disables the retired configuration, and inserts dedicated TOKRII5 / TOKRII10 / TOKRII15 records with the requested values. They start **INACTIVE** and publicly displayable. Existing codes/IDs are not overwritten; review any collisions manually. Defaults supply unlimited usage and no expiry, editable in admin.

Before a staging write, verify the actual MySQL instance/schema and grants against independently identified production, take and verify a backup of DB/environment/uploads/release, inspect migration history and the existing automatic-discount schema, and approve this SQL separately. Apply once through the established reviewed migration process, regenerate Prisma Client, build Next/Vite as appropriate, regenerate AdminJS's bundle and restart only staging services. Never run migration/seed commands on every push. If the previous additive migration is absent, review the actual schema first rather than assuming it is installed. MySQL DDL is not transactional; inspect partial state before retrying.

For activation, open each dedicated record under Coupons, review percentage, minimum, targeting, schedule and usage rules, enable **Coupon is active**, keep **Show publicly...** checked, then save. Optional **Know more (HTML)** feeds the Coupons & offers panel. Enabling a coupon makes it available to Apply; nothing is selected until the shopper taps Apply.

Deployment rollback keeps the additive columns and historical data; do not drop them or restore old order totals. The retired automatic configuration must remain OFF even if rolling application code back.

## Verification

All writes used a newly initialized isolated MySQL on `127.0.0.1:13318`, schema `tokri_manual_coupons_test`, UUID `5af08c24-d755-11f1-b5c0-346f24d2719b`. Test entrypoints reject other hosts/ports/schema names before DB imports. A database dump was restored to separate `tokri_manual_migration_test`, reconstructed to the old Coupon schema, and the reviewed SQL was applied. Existing private flags defaulted false; three new coupons were inactive; retired configuration was OFF; historical order total/snapshot output matched byte-for-byte before/after. Backup: `/tmp/tokri-manual-before-migration.sql` (local test data only).

| Product subtotal | Eligible public percentage coupons | Discount without selection |
|---|---|---|
| ₹699.99 | None | ₹0 |
| ₹700 | 5% | ₹0 |
| ₹1,099.99 | 5% | ₹0 |
| ₹1,100 | 5%, 10% | ₹0 |
| ₹1,499.99 | 5%, 10% | ₹0 |
| ₹1,500 | 5%, 10%, 15% | ₹0 |
| ₹2,000 | 5%, 10%, 15% | ₹0 |

At ₹1,500, explicit 5% / 10% / 15% selections produce ₹75 / ₹150 / ₹225, respectively. No upgrade or stacking occurs.

| Check | Result |
|---|---|
| Coupon integration suite | 11/11 passing, including threshold matrix |
| 15% on ₹1,600 → ₹1,200 | ₹240 removed; zero discount; exact below-₹1,500 message |
| ₹1,200 → ₹1,600 after invalidation | All eligible again; zero discount until Apply |
| 10% on ₹1,300 → ₹1,200 | Remains selected; ₹130 → ₹120 |
| Real cart item removal and quantity decrease/increase | Passing in Next browser against real Express/MySQL |
| Delayed Apply response after quantity decrease | Ignored; cannot resurrect coupon or stale totals |
| Refresh | Valid explicit selection restored; removed selection stays removed |
| Admin disable/expiry/future dates/caps/private code/login restrictions | Passing backend checks |
| Admin live percentage/minimum/public visibility saves | Passing real AdminJS browser checks without rebuild |
| Taxable fruit/dry-fruit/mixed/product/category restrictions | Passing allocation/GST checks |
| Shipping coupon, first-three morning benefit, express minimum | Passing, separate delivery policy preserved |
| Quote / saved order / COD / Razorpay paise / invoice | Equal; changed-total guard passes |
| Failed payment retry and duplicate callback | Same reservation count; no repeated redemption |
| Concurrent global + single-use limit | Exactly one order/redemption; rejected request rolls back |
| Historical invoices after coupon edits | Stored totals/snapshots unchanged |
| Backend contract regressions | 24/24 passing |
| Existing commerce browser scenarios | 9/9 passing (Vite mock harness) |
| Meta Pixel isolation/consent | 15/15 passing |
| Next production and Vite builds | Passing |
| Lint | 0 errors; 6 existing hook warnings |
| Android + iOS mobile compatibility | Hermes exports pass; shared API has zero automatic discounts; old snapshot rendering retained |
| Responsive UI | Real Next browser desktop and 360px mobile; no horizontal overflow or browser exceptions |

Payment transport testing uses mock Axios and fetch responses. No real payment/order/OTP transaction was created. Native device/store release testing and public staging deployment were not performed.

Reproduce after initializing the isolated test schema (never production):

```sh
DATABASE_URL=mysql://root@127.0.0.1:13318/tokri_manual_coupons_test npm run test:coupons --prefix server
DATABASE_URL=mysql://root@127.0.0.1:13318/tokri_manual_coupons_test node scripts/verify-backend-contracts.mjs
```

The integration suite installs only local test fixtures, including a local admin. The browser test expects Express at localhost:5241 proxying a Next production build at 127.0.0.1:3041, using that same isolated schema. Build with `TOKRIII_API_PROXY_TARGET=http://127.0.0.1:5241`; start the API with matching CLIENT_URL / APP_URL / API_URL and TOKRIII_NEXT_ORIGIN. Then:

```sh
DATABASE_URL=mysql://root@127.0.0.1:13318/tokri_manual_coupons_test node scripts/verify-manual-coupons-browser.mjs
```

## Screenshots and invoice

- [Unselected checkout, all three Apply buttons](screenshots/checkout-unselected-desktop.png)
- [Explicit 15% selection with other offers visible](screenshots/checkout-selected-desktop.png)
- [Invalidation and removal message](screenshots/checkout-invalidated.png)
- [Locked offers on 360px mobile](screenshots/checkout-locked-mobile.png)
- [Existing AdminJS coupon editor with public-display control](screenshots/admin-coupon-edit.png)
- [Saved test invoice](test-invoice.pdf)

## Release status

Prepared for a PR into staging only. No staging/production server, production database, main branch, campaigns or hosting configuration has been modified. Screenshots show the isolated local release, not a claimed live deployment. The review/migration and staging deploy remain separate actions.

## Files modified / removed

- `scripts/verify-automatic-discounts-browser.mjs`
- `scripts/verify-backend-contracts.mjs`
- `scripts/verify-commerce-regression.mjs`
- `scripts/verify-manual-coupons-browser.mjs`
- `server/package.json`
- `server/prisma/migrations/20261103000000_manual_checkout_coupons/migration.sql`
- `server/prisma/schema.prisma`
- `server/src/admin/automatic-discounts.js`
- `server/src/admin/componentLoader.js`
- `server/src/admin/components/automatic-discounts.jsx`
- `server/src/admin/components/coupon-edit.jsx`
- `server/src/admin/coupon-handlers.js`
- `server/src/admin/index.js`
- `server/src/admin/locale.js`
- `server/src/services/automaticDiscounts.js`
- `server/src/services/checkout.js`
- `server/src/services/coupons.js`
- `server/src/services/deliveryQuote.js`
- `server/src/services/pricing.js`
- `server/tests/automatic-discounts.test.js`
- `server/tests/manual-coupons.test.js`
- `src/components/CouponBox.jsx`
- `src/components/DiscountDetails.jsx`
- `src/context/CartContext.jsx`
- `src/pages/CheckoutPage.jsx`
- `tokri-mobile-go/src/context/CartContext.js`
- `tokri-mobile-go/src/screens/CartScreen.js`

This report, screenshots and the test invoice are added under `docs/manual-coupons/`. Generated AdminJS runtime artifacts are not committed.
