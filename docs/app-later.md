# Remove later

Things the current app still needs. Do not drop them until the note's condition is true, then tell the user and remove the line.

- Settings home fields (`homeBannerImage`, `homeMobileBannerImage`, `homeHighlightImage`, `homeFeaturedCategorySlugs`) and `/app/bootstrap` home payload (categories / bestsellers used by the legacy mobile HomeScreen). Still required while Android versionCode 12 / iOS build 11 (and any build that never calls `GET /api/v1/home`) remain in use, and while the website/app legacy home fallback is still shipping. Safe to remove only after a home-builder-capable app build is at 100% in both stores and old builds have stopped placing orders, and the website no longer falls back to Settings-driven home.
- Home builder `mobile_banner` and `promo_slider` sections only render in app builds that include those RN components. Older `/home`-capable builds ignore unknown section types. Safe to rely on them in production layouts only after a build with those renderers is at 100% in both stores (or accept that older builds simply skip those sections).
