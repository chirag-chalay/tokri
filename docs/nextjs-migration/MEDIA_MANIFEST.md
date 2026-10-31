# Tokriii Storefront Media & Asset Manifest

This document provides the complete, exhaustive mapping of all public media and font assets required by the Tokriii storefront, derived directly from the active schema and restored database `tokri_live_local`.

---

## 1. Asset Status Summary

- **Homepage / Settings Media:** 2 referenced / 0 present locally (2 missing)
- **Category Media:** 8 referenced / 0 present locally (8 missing)
- **Blog Post Covers:** 8 referenced / 0 present locally (8 missing)
- **Product Catalog Images:** 74 unique referenced / 0 present locally (74 missing; 4 products have null image: almond-badam-500g, cashew-kaju-500g, pistachio-pista-250g, raisin-kishmish-500g)
- **Total Public Storefront Media:** 92 unique file references / 0 present locally (92 missing)
- **Unreferenced / Potentially Private Media:** 14 files in `Media` table (quarantined and excluded from public snapshot)
- **Web Fonts:** 1 family (`Plus Jakarta Sans`: 400, 500, 600, 700, 400i) requested via Google Fonts CDN / 0 local WOFF2 font files present
- **Current Release Parity Status:** `Real image parity: BLOCKED`, `Real font parity: BLOCKED`, `Responsive visual parity: BLOCKED`

---

## 2. Administrator Instructions for Authorized Media Snapshot

To enable full local and staging pixel-perfect parity verification without exposing private server files or risking the live production environment, a sanitized file allowlist has been generated at [`public-media-allowlist.txt`](./public-media-allowlist.txt) listing exclusively the 92 public storefront assets (excluding all 14 quarantined or unreferenced media records).

### Option A: Tarball Export via Allowlist (Recommended)
On the live production host, an authorized administrator should navigate to the server root (where the `uploads/` directory resides) and execute:
```bash
# Verify the allowlist file is copied to the server, then archive strictly the allowlisted files:
tar -czf tokriii-public-media-snapshot.tar.gz -T public-media-allowlist.txt
```

### Option B: Rsync Transfer via Allowlist
Alternatively, an administrator can pull only the allowlisted files directly into the local worktree:
```bash
rsync -av --files-from=docs/nextjs-migration/public-media-allowlist.txt \
  user@remote-host:/path/to/server/ \
  /home/gaurav/Documents/tokriii-nextjs/server/
```

### Extraction Destination
If using the tarball export (Option A), extract it into the local worktree:
```bash
tar -xzf tokriii-public-media-snapshot.tar.gz -C /home/gaurav/Documents/tokriii-nextjs/server/
```

> [!IMPORTANT]
> - Do NOT transfer the entire `uploads/` directory indiscriminately.
> - Ensure all 14 quarantined records listed in Section 8 remain excluded.
> - Git is configured to ignore all files under `server/uploads/**` (except `.gitkeep`); never force-add uploaded images into Git.

---

## 3. Homepage & General Storefront Media (2 Items)

| Field Name | Relative Database Path | Format | Status | Source Record |
| --- | --- | --- | --- | --- |
| Home Hero Banner | `/uploads/general/hero-image-1789854996436-1789856580595.webp` | WEBP | Missing locally | Setting (id: 1) |
| Home Highlight Banner | `/uploads/general/middle-image-1789856293576.png` | PNG | Missing locally | Setting (id: 1) |

---

## 4. Category Media Manifest (8 Items)

| Category Label | Slug | Relative Database Path | Format | Status | Source Record |
| --- | --- | --- | --- | --- | --- |
| Daily Fruits | `daily-fruits` | `/uploads/categories/daily-fruits-category-thumb-1792614626065.webp` | WEBP | Missing locally | Category |
| Dry Fruits | `dry-fruits` | `/uploads/categories/dry-fruits-1788211820689.webp` | WEBP | Missing locally | Category |
| Exotic Fruits | `exotic` | `/uploads/categories/exotic-fruits-1788211852957.webp` | WEBP | Missing locally | Category |
| Fresh Fruits | `fresh-fruits` | `/uploads/categories/fresh-fruits-1788212012820.webp` | WEBP | Missing locally | Category |
| Imported Fruits | `imported` | `/uploads/categories/imported-fruits-1788211890907.webp` | WEBP | Missing locally | Category |
| Melons | `melons` | `/uploads/categories/melons-1788211912689.webp` | WEBP | Missing locally | Category |
| Premium | `premium` | `/uploads/categories/premium-1788211930000.webp` | WEBP | Missing locally | Category |
| Tropical Fruits | `tropical` | `/uploads/categories/tropical-fruits-1788211978440.webp` | WEBP | Missing locally | Category |

---

## 5. Blog Post Cover Images (8 Items)

| Article Title | Slug | Relative Database Path | Format | Status | Source Record |
| --- | --- | --- | --- | --- | --- |
| 10 Exotic Fruits in India You Must Try: Taste, How to Eat & More | `exotic-fruits-in-india-guide` | `/uploads/blog/exotic-fruit-market-still-life-1792317161600.png` | PNG | Missing locally | BlogPost |
| 10 Winter Fruits in India: What's Actually in Season (Nov–Mar)? | `winter-fruits-in-india-seasonal-guide` | `/uploads/blog/abundant-rustic-fruit-basket-still-life-1792487205512.png` | PNG | Missing locally | BlogPost |
| 7 Easy Fruit Chaat Recipes: Indian-Style Fruit Salads Without Added Sugar | `fruit-chaat-recipe-indian-fruit-salad` | `/uploads/blog/colorful-mint-garnished-fruit-chaat-1792486567599.png` | PNG | Missing locally | BlogPost |
| Fridge or Counter? How to Store 15 Fruits at Home in India | `how-to-store-fruits-at-home-india` | `/uploads/blog/fresh-fruit-kitchen-abundance-1792316699220.png` | PNG | Missing locally | BlogPost |
| Guava vs Orange vs Kiwi: 7 Vitamin C-Rich Fruits in India | `vitamin-c-rich-fruits-india` | `/uploads/blog/sunlit-tropical-fruit-tabletop-arrangeme-1792771127726.png` | PNG | Missing locally | BlogPost |
| How to Pick Ripe Fruits: 13 Smart Buying Tips That Actually Work | `how-to-pick-ripe-fruits-buying-guide` | `/uploads/blog/fresh-fruit-market-selection-1792661588964.png` | PNG | Missing locally | BlogPost |
| Whole Fruit vs Fruit Juice: 9 Facts About Sugar, Fibre & Nutrition | `whole-fruit-vs-fruit-juice` | `/uploads/blog/sunlit-fruit-bowl-and-juices-1792662942540.png` | PNG | Missing locally | BlogPost |
| Why Does Pineapple Tingle? 8 Surprising Fruit Mysteries Explained | `pineapple-tongue-tingle-fruit-mysteries` | `/uploads/blog/fruit-mystery-magnifier-still-life-1792866732128.png` | PNG | Missing locally | BlogPost |

---

## 6. Complete Product Catalog Image Manifest (74 Unique Items)

| # | Product Name | Slug | Relative Database Path | Format | Status | Source Record |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Ajwa Dates - Premium Madinah | `ajwa-dates` | `/uploads/products/ajwa-date-premium-madinah-1788214255164.webp` | WEBP | Missing locally | Product |
| 2 | Apple Gala - Imported Pack of 6 | `apple-gala-imported` | `/uploads/products/apple-gala-1788297779176.webp` | WEBP | Missing locally | Product |
| 3 | Apple Kinnaur - Pack of 6 | `apple-kinnaur` | `/uploads/products/apple-kinnaur-1788297850054.webp` | WEBP | Missing locally | Product |
| 4 | Apple Red - Imported Pack of 6 | `apple-red-imported` | `/uploads/products/apple-rd-1788297879746.webp` | WEBP | Missing locally | Product |
| 5 | Apple Royal Gala | `apple-royal-gala` | `/uploads/products/fresh-gala-apples-on-white-1791399726494.webp` | WEBP | Missing locally | Product |
| 6 | Avocado - Imported | `avocado-single` | `/uploads/products/avocado-single-1788297952489.webp` | WEBP | Missing locally | Product |
| 7 | Avocado - Imported Pack of 6 | `avocado-pack-6` | `/uploads/products/avocado-pack-6-1788298067487.webp` | WEBP | Missing locally | Product |
| 8 | Baby Apple - Imported Pack of 6 | `baby-apple-imported` | `/uploads/products/baby-apple-imported-1788298090889.webp` | WEBP | Missing locally | Product |
| 9 | Baby Banana - Fresh | `banana-baby` | `/uploads/products/banana-baby-1788298139266.webp` | WEBP | Missing locally | Product |
| 10 | Banana - Fresh | `banana-fresh` | `/uploads/products/banana-1788378713492.webp` | WEBP | Missing locally | Product |
| 11 | Black Grapes | `black-grapes` | `/uploads/products/glossy-black-grape-cluster-1791401551423.webp` | WEBP | Missing locally | Product |
| 12 | Blueberry - Imported | `blueberry-imported` | `/uploads/products/blueberry-imported-1788298200270.webp` | WEBP | Missing locally | Product |
| 13 | Blueberry Tube | `blueberry-tube` | `/uploads/products/fresh-blueberry-tube-packaging-1791398715419.webp` | WEBP | Missing locally | Product |
| 14 | Brown Coconut - Fresh | `brown-coconut` | `/uploads/products/brown-coconut-1788298217016.webp` | WEBP | Missing locally | Product |
| 15 | Chandler Walnuts - California | `chandler-walnuts` | `/uploads/products/chandler-walnuts-1788298252081.webp` | WEBP | Missing locally | Product |
| 16 | Chiku (Sapota) | `chiku-sapota` | `/uploads/products/fresh-sapodillas-with-cut-fruit-1791402865864.webp` | WEBP | Missing locally | Product |
| 17 | Crimson Grapes | `crimson-grapes` | `/uploads/products/fresh-red-grape-cluster-1791401100387.webp` | WEBP | Missing locally | Product |
| 18 | Custard Apple (Sitaphal) - Pack of 6 | `custard-apple` | `/uploads/products/custard-apple-sitaphal-1788298308069.webp` | WEBP | Missing locally | Product |
| 19 | Date crown | `date-crown` | `/uploads/products/date-crown-product-1792617617190.webp` | WEBP | Missing locally | Product |
| 20 | Dragon Fruit - Red | `dragon-fruit` | `/uploads/products/dragon-fruit-red-1788298332184.webp` | WEBP | Missing locally | Product |
| 21 | Dragon Fruit White | `dragon-fruit-white` | `/uploads/products/vibrant-dragon-fruit-still-life-1791403530922.webp` | WEBP | Missing locally | Product |
| 22 | Dried Figs (Anjeer) - Premium | `dried-figs-anjeer` | `/uploads/products/dried-figs-anjeer-1788298364634.webp` | WEBP | Missing locally | Product |
| 23 | Green Apple - Imported Pack of 6 | `green-apple-imported` | `/uploads/products/green-apple-imported-1788298390221.webp` | WEBP | Missing locally | Product |
| 24 | Green Kernel Pistachios - Premium | `green-pistachios` | `/uploads/products/green-kernel-pistachios-1788298434400.webp` | WEBP | Missing locally | Product |
| 25 | Imported Mango | `imported-mango` | `/uploads/products/glossy-mango-with-green-leaf-1791400903547.webp` | WEBP | Missing locally | Product |
| 26 | Indian Gala Apple - Pack of 6 | `indian-gala-apple` | `/uploads/products/indian-gala-apple-1788298487157.webp` | WEBP | Missing locally | Product |
| 27 | Kiwi - Imported Pack of 3 | `kiwi-pack-3` | `/uploads/products/kiwi-pack-3-1788298502374.webp` | WEBP | Missing locally | Product |
| 28 | Kiwi - Imported Pack of 5 | `kiwi-pack-5` | `/uploads/products/kiwi-pack-5-1788298568703.webp` | WEBP | Missing locally | Product |
| 29 | Longan | `longan` | `/uploads/products/fresh-longan-cluster-with-opened-fruit-1791400359302.webp` | WEBP | Missing locally | Product |
| 30 | Malta Orange - Imported Pack of 6 | `malta-orange-imported` | `/uploads/products/malta-orange-imported-1788378746477.webp` | WEBP | Missing locally | Product |
| 31 | Mamra Almonds - Premium | `mamra-almonds` | `/uploads/products/mamra-almonds-1788378765249.webp` | WEBP | Missing locally | Product |
| 32 | Mango Chausa - Pack of 6 | `mango-chausa` | `/uploads/products/mango-chausa-1788378784720.webp` | WEBP | Missing locally | Product |
| 33 | Mango Neelam | `mango-neelam` | `/uploads/products/ripe-mango-trio-on-white-background-1791403315122.webp` | WEBP | Missing locally | Product |
| 34 | Mangosteen | `mangosteen` | `/uploads/products/mangosteen-cluster-with-open-fruit-1791400767156.webp` | WEBP | Missing locally | Product |
| 35 | Medjool Dates - Premium | `medjool-dates` | `/uploads/products/medjool-dates-1788378803618.webp` | WEBP | Missing locally | Product |
| 36 | Mini Orange - Imported | `mini-orange-imported` | `/uploads/products/mini-orange-imported-1788378820056.webp` | WEBP | Missing locally | Product |
| 37 | Mix Fruit Pack - 5 Varieties | `mix-fruit-pack` | `/uploads/products/mix_fruit_pack_5_varieties_800x800-1788466997946.webp` | WEBP | Missing locally | Product |
| 38 | Muskmelon - Fresh | `muskmelon-fresh` | `/uploads/products/muskmelon-fresh-1788378834044.webp` | WEBP | Missing locally | Product |
| 39 | Packham Pear - Imported Pack of 6 | `packham-pear-imported` | `/uploads/products/packham-pear-imported-1788378847210.webp` | WEBP | Missing locally | Product |
| 40 | Papaya - Fresh Large | `papaya-fresh-large` | `/uploads/products/papaya-fresh-large-1788378861137.webp` | WEBP | Missing locally | Product |
| 41 | Papaya - Fresh Small | `papaya-fresh-small` | `/uploads/products/papaya-fresh-small-1788378873711.webp` | WEBP | Missing locally | Product |
| 42 | Pear Babugosha - Fresh Pack of 6 | `pear-babugosha` | `/uploads/products/pear-babugosha-1788378890194.webp` | WEBP | Missing locally | Product |
| 43 | Pear Beauty - Imported Pack of 6 | `pear-beauty-imported` | `/uploads/products/pear-beauty-imported-1788378904075.webp` | WEBP | Missing locally | Product |
| 44 | Pear Beauty Green | `pear-beauty-green` | `/uploads/products/fresh-green-pear-arrangement-1791399466103.webp` | WEBP | Missing locally | Product |
| 45 | Pear Beauty Red | `pear-beauty-red` | `/uploads/products/red-and-yellow-pear-still-life-1791399120358.webp` | WEBP | Missing locally | Product |
| 46 | Pear Nakh - Indian | `pear-nakh` | `/uploads/products/pear_nakh_indian_800x800-1788378986049.webp` | WEBP | Missing locally | Product |
| 47 | Pear Sandom | `pear-sandom` | `/uploads/products/fresh-pear-cluster-with-cut-half-1791403056550.webp` | WEBP | Missing locally | Product |
| 48 | Pine Nuts (Chilgoza) - Premium | `pine-nuts-chilgoza` | `/uploads/products/pine_nuts_chilgoza_premium_800x800-1788379012297.webp` | WEBP | Missing locally | Product |
| 49 | Pineapple - Fresh | `pineapple-fresh` | `/uploads/products/pineapple_fresh_800x800-1788379033274.webp` | WEBP | Missing locally | Product |
| 50 | Pink Lady Apple - Imported Pack of 6 | `pinklady-apple` | `/uploads/products/pink_lady_apple_imported_pack_of_6_800x8-1788379051738.webp` | WEBP | Missing locally | Product |
| 51 | Plum - Imported | `plum-imported` | `/uploads/products/plum_imported_800x800-1788379075238.webp` | WEBP | Missing locally | Product |
| 52 | Pomegranate - Fresh Pack of 6 | `pomegranate-fresh` | `/uploads/products/pomegranate-fresh-1788381261218.webp` | WEBP | Missing locally | Product |
| 53 | Premium Avocado - Jumbo | `premium-avocado` | `/uploads/products/premium-avocado-1788381247734.webp` | WEBP | Missing locally | Product |
| 54 | Premium Queen Apple Tube | `premium-queen-apple-tube` | `/uploads/products/chatgpt-image-oct-8--2026--12_06_10-pm-1-1791441500343.png` | PNG | Missing locally | Product |
| 55 | Ram Bootan | `ram-bootan` | `/uploads/products/vibrant-rambutan-fruit-cluster-1791400534082.webp` | WEBP | Missing locally | Product |
| 56 | Red Globe Grapes - Imported | `red-globe-grapes` | `/uploads/products/red-globe-grapes-1788381233484.webp` | WEBP | Missing locally | Product |
| 57 | Red Pear - Indian | `red-pear-indian` | `/uploads/products/red_pear_800x800-1788381767402.webp` | WEBP | Missing locally | Product |
| 58 | Rocket Apple Tube | `rocket-apple-tube` | `/uploads/products/chatgpt-image-oct-8--2026--12_06_12-pm-2-1791441445616.png` | PNG | Missing locally | Product |
| 59 | Shimla Apple - Pack of 6 | `shimla-apple` | `/uploads/products/shimla-apple-1788384849320.webp` | WEBP | Missing locally | Product |
| 60 | Shine Muscat Grapes - Imported | `shine-muscat-grapes` | `/uploads/products/shine-muscat-grapes-1788384889211.webp` | WEBP | Missing locally | Product |
| 61 | Star Fruit | `star-fruit` | `/uploads/products/fresh-star-fruit-still-life-1791400034559.webp` | WEBP | Missing locally | Product |
| 62 | Sun Melon - Fresh | `sunmelon-fresh` | `/uploads/products/sunmelon-fresh-1788384901351.webp` | WEBP | Missing locally | Product |
| 63 | Sweet Lime (Mosambi) | `sweetlime-mosambi` | `/uploads/products/sweetlime-mosambi-1788384916182.webp` | WEBP | Missing locally | Product |
| 64 | Sweet Tamarind - Imported | `sweet-tamarind-imported` | `/uploads/products/sweet-tamarind-imported-1788384927953.webp` | WEBP | Missing locally | Product |
| 65 | Tender Coconut - Uncut | `tender-coconut` | `/uploads/products/tender-coconut-1788384940398.webp` | WEBP | Missing locally | Product |
| 66 | Thai Guava - Fresh | `thai-guava` | `/uploads/products/thai-guava-1788384952017.webp` | WEBP | Missing locally | Product |
| 67 | Thai Pink Guava - Fresh | `thai-pink-guava` | `/uploads/products/thai-pink-guava-1788384964990.webp` | WEBP | Missing locally | Product |
| 68 | Tunisian Dates | `tunisian-dates` | `/uploads/products/tunisian-dates-product-1792616686488.webp` | WEBP | Missing locally | Product |
| 69 | Washington Apple - Pack of 6 | `washington-apple` | `/uploads/products/washington-apple-1788384979113.webp` | WEBP | Missing locally | Product |
| 70 | Watermelon - Fresh | `watermelon-fresh` | `/uploads/products/watermelon-fresh-1788384994140.webp` | WEBP | Missing locally | Product |
| 71 | Wood Apple (Bael) - Fresh | `wood-apple-bael` | `/uploads/products/wood-apple-bael-1788385009300.webp` | WEBP | Missing locally | Product |
| 72 | Yelakki Banana - Premium | `yelakki-banana` | `/uploads/products/yelakki_banana_premium_800x800-1788467843507.webp` | WEBP | Missing locally | Product |
| 73 | Zespri Gold Kiwi - Pack of 4 | `zespri-kiwi-gold` | `/uploads/products/zespri-kiwi-gold-1788385055234.webp` | WEBP | Missing locally | Product |
| 74 | Zespri Green Kiwi - Pack of 4 | `zespri-kiwi-green` | `/uploads/products/zespri-kiwi-green-1788385065541.webp` | WEBP | Missing locally | Product |

---

## 7. Web Font Specifications

| Font Family | Style | Weights | Source | Current Local Status |
| --- | --- | --- | --- | --- |
| Plus Jakarta Sans | Normal (Roman) | 400, 500, 600, 700 | Google Fonts CDN (`family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400`) | Missing locally (blocked by network guard) |
| Plus Jakarta Sans | Italic | 400 | Google Fonts CDN | Missing locally (blocked by network guard) |

---

## 8. Quarantined & Unreferenced Media Library Records (14 Items)

The following records exist in the `Media` database table but are NOT referenced by any active product, category, blog, or store setting. These files may represent administrative uploads, customer review uploads, or superseded assets. They are **excluded** from the public storefront snapshot:

| Filename | Folder | MIME Type | Relative Path | Public Reference Status |
| --- | --- | --- | --- | --- |
| `monojit-dutta-y3m_ung2ikc-unsplash-1782565574308.jpg` | reviews | image/jpeg | `/uploads/reviews/monojit-dutta-y3m_ung2ikc-unsplash-1782565574308.jpg` | Quarantined / Unreferenced |
| `jayabhatiya-1782565702475.jpg` | reviews | image/jpeg | `/uploads/reviews/jayabhatiya-1782565702475.jpg` | Quarantined / Unreferenced |
| `shovan-1782565901359.jpg` | reviews | image/jpeg | `/uploads/reviews/shovan-1782565901359.jpg` | Quarantined / Unreferenced |
| `fresh-fruits-1788205370691.png` | categories | image/png | `/uploads/categories/fresh-fruits-1788205370691.png` | Quarantined / Unreferenced |
| `fresh-fruits-1788205476759.png` | products | image/png | `/uploads/products/fresh-fruits-1788205476759.png` | Quarantined / Unreferenced |
| `fresh-fruits-1-1788209344566.webp` | categories | image/webp | `/uploads/categories/fresh-fruits-1-1788209344566.webp` | Quarantined / Unreferenced |
| `fresh-fruits-1-1788209358778.webp` | categories | image/webp | `/uploads/categories/fresh-fruits-1-1788209358778.webp` | Quarantined / Unreferenced |
| `seasonal-fruits-1788211951795.webp` | categories | image/webp | `/uploads/categories/seasonal-fruits-1788211951795.webp` | Quarantined / Unreferenced |
| `pine_nuts_chilgoza_premium_800x800-1788378952049.webp` | products | image/webp | `/uploads/products/pine_nuts_chilgoza_premium_800x800-1788378952049.webp` | Quarantined / Unreferenced |
| `yellaki-banana-1788385044568.webp` | products | image/webp | `/uploads/products/yellaki-banana-1788385044568.webp` | Quarantined / Unreferenced |
| `vertical-pack-of-five-red-apples-1791402052854.webp` | products | image/webp | `/uploads/products/vertical-pack-of-five-red-apples-1791402052854.webp` | Quarantined / Unreferenced |
| `packaged-apples-in-a-kraft-tray-1791402603039.webp` | products | image/webp | `/uploads/products/packaged-apples-in-a-kraft-tray-1791402603039.webp` | Quarantined / Unreferenced |
| `daily-fruits-category-thumb-1792614502125.webp` | categories | image/webp | `/uploads/categories/daily-fruits-category-thumb-1792614502125.webp` | Quarantined / Unreferenced |
| `daily-fruits-category-thumb-1792614551555.webp` | categories | image/webp | `/uploads/categories/daily-fruits-category-thumb-1792614551555.webp` | Quarantined / Unreferenced |
