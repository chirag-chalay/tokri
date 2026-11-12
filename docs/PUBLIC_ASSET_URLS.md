# Public upload URLs

## Cause and configuration

Production had `API_URL=https://server.tokriii.com` and no `PUBLIC_ASSET_URL`. The backend used the API origin when formatting relative upload paths and existing first-party absolute upload URLs. This propagated the server hostname into catalog pages, banners, metadata, and other consumers.

The private production `server/.env` now explicitly sets:

```dotenv
PUBLIC_ASSET_URL=https://tokriii.com
```

`API_URL` remains independently configured for API traffic. After changing the asset origin, restart `tokri-server` and refresh the website. A frontend rebuild is unnecessary for subsequent backend asset-origin changes.

When the override is empty, production storefront `CLIENT_URL` hosts (`tokriii.com` and `www.tokriii.com`) default to `https://tokriii.com`; other environments retain their API origin. Staging can explicitly set `PUBLIC_ASSET_URL=https://server.tokriii.com`. An explicit CDN origin is also supported.

## Shared handling

- `shared/assets.js` centralizes origin selection and upload URL/HTML normalization. It rewrites `/uploads/` paths on known Tokri hosts, preserving path, query, and fragment. Unrelated external URLs remain intact.
- `server/src/utils/formatters.js` applies it to product/category images, blog covers, product descriptions, blog bodies, and CMS bodies. Existing settings, order, and app formatters also use this public asset helper.
- `server/src/routes/api.js` normalizes review images, and `server/src/services/coupons.js` normalizes images embedded in coupon information.
- `src/lib/api.js`, `src/components/CatalogImage.jsx`, and `src/context/CartContext.jsx` cover browser URLs and previously saved cart image URLs on the production storefront.

Stored image paths and content records remain unchanged. HTML rewriting complements the existing renderer sanitization; it does not replace it.

## Deployment and focused verification

Deployed on 12 November 2026 from `marketingdimpal`. Both PM2 services were restarted, and PM2 state was saved. The frontend release is `.next.marketingdimpal-assets-20261112`, built with API/proxy origin `http://127.0.0.1:5173`. Previous static chunks were retained. The preceding frontend release is `.next.marketingdimpal-logs-3662975`; the prior environment and PM2 configuration were backed up outside the web root.

- Three focused tests passed: origin selection, first-party URL rewriting/external URL preservation, and rich-text image sources. Run with `node --test tests/assets.test.mjs`.
- Next production build and backend syntax checks passed. Changed frontend/shared code passed lint with three pre-existing CartContext hook dependency warnings.
- Prisma column preflight passed.
- Live product, category, public settings, review, and blog API samples returned HTTP 200 with no server/www upload origins.
- Homepage, shop, and one product page returned HTTP 200 with canonical upload URLs in their HTML.
- One live desktop browser visit found 68 upload images, 55 already loaded, no incorrect hosts or broken images, and no JavaScript page errors.
- The reported `premium-family-fruit-feast-basket-prod-1793645738213.webp` returned HTTP 200 with content type `image/webp` at the canonical production URL.

For rollback, restore the reviewed prior source/environment and select the preceding frontend release through `TOKRIII_NEXT_DIST_DIR`, restart both PM2 services, and save PM2 state. No database migration is involved.
