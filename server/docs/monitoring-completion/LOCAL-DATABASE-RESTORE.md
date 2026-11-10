# Latest local database restore — 10 November 2026

Restored the user-supplied Desktop archive `chirag-backup-20261110T080354Z.zip` into the local MySQL `tokri` database. The dump originally selected `chirag`; its CREATE DATABASE/USE routing was removed before import and the MySQL connection was explicitly restricted to the verified local target. No production connection was used.

A separate restore database was attempted first, but the local application account cannot create other databases. The existing local database was therefore restored only after taking a complete `mysqldump` backup and pausing the local backend. Private rollback material and results are in ignored `server/backups.local/db-restore-43TMqf/`, including `local-before.sql`, the previous `.env`, original imported SQL, and before/after local configuration snapshots. These files can contain customer data/credentials; they have private permissions and must not be committed or shared publicly.

## Result

- Imported 101 products, 17 orders and 68 customers. Existing imported business table row counts were unchanged by post-import preparation and verification.
- The backup contains the staging checkout schema except `Coupon.knowMoreHtml`; that optional field was added. Previously installed monitoring tables/outbox records and existing daily log files were retained.
- Regenerated Prisma Client 6.19.3 from the correct current schema and restarted only the local backend.
- Local-only configuration overrides: Razorpay disabled and imported gateway keys removed from active settings; SMS/WhatsApp/email delivery disabled; COD enabled. Imported push registrations would be marked local-disabled (there were none). Local admin credentials were preserved without printing or replacing them with a new password.
- Health and product endpoints return HTTP 200.
- Morning and Express checkout price quotes both return HTTP 200 with numeric totals and coupon data.
- Real browser verification: checkout no longer stays on Calculating; the misleading minimum-order warning is gone; no JavaScript errors. The check used a guest cart and did not place an order or alter imported customer/address/cart/order records.
- Existing local admin login, monitoring viewer and recovered COD log records remain available. Final outbox backlog: zero.

This resolves the local database setup gap described in the earlier staging-pull report. No Git push, deployment, production database change or real Razorpay payment was performed. Real Razorpay sandbox testing remains UNVERIFIED. Existing browser sessions may require signing in again after the database replacement.
