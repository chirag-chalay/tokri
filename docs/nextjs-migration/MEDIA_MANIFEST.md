# Tokriii Storefront Media & Asset Manifest

This document provides the complete inventory of media and font assets required by the Tokriii storefront, derived directly from the restored database `tokri_live_local`.

---

## 1. Asset Status Summary
- **Categories:** 8 referenced / 0 present locally (8 missing)
- **Blog Posts:** 8 referenced / 0 present locally (8 missing)
- **Products:** 74 referenced / 0 present locally (74 missing)
- **Web Fonts:** 1 family (`Plus Jakarta Sans`) referenced via Google Fonts CDN / 0 local font files present
- **Current Parity Status:** `Real image parity: BLOCKED`, `Real font parity: BLOCKED`, `Responsive visual parity: BLOCKED`

---

## 2. Administrator Instructions for Authorized Media Snapshot
To enable full local and staging pixel-perfect parity verification without exposing private server files or risking the live production environment:

1. **Read-Only Archive Creation:** An authorized server administrator should create a tarball of the public uploads directory on the live server:
   ```bash
   tar -czf tokriii-public-uploads.tar.gz -C /path/to/server uploads/categories uploads/products uploads/blog uploads/general
   ```
2. **Extraction Destination:** Extract the archive into the local repository at:
   ```bash
   tar -xzf tokriii-public-uploads.tar.gz -C /home/gaurav/Documents/tokriii-nextjs/server/
   ```
3. **Font Files:** Download the approved WOFF2 font files for `Plus Jakarta Sans` (weights 400, 500, 600, 700, 800) into `public/fonts/` or allow CDN access during visual verification.

---

## 3. Categories Media Manifest (8 Items)

| Category Label | Slug | Relative Database Path | Format | Status | Local Destination |
| --- | --- | --- | --- | --- | --- |
| Daily Fruits | `daily-fruits` | `/uploads/categories/daily-fruits-category-thumb-1792614626065.webp` | WebP | Missing locally | `server/uploads/categories/` |
| Dry Fruits | `dry-fruits` | `/uploads/categories/dry-fruits-1788211820689.webp` | WebP | Missing locally | `server/uploads/categories/` |
| Exotic Fruits | `exotic` | `/uploads/categories/exotic-fruits-1788211852957.webp` | WebP | Missing locally | `server/uploads/categories/` |
| Fresh Fruits | `fresh-fruits` | `/uploads/categories/fresh-fruits-1788212012820.webp` | WebP | Missing locally | `server/uploads/categories/` |
| Imported Fruits | `imported` | `/uploads/categories/imported-fruits-1788211890907.webp` | WebP | Missing locally | `server/uploads/categories/` |
| Melons | `melons` | `/uploads/categories/melons-1788211912689.webp` | WebP | Missing locally | `server/uploads/categories/` |
| Premium | `premium` | `/uploads/categories/premium-1788211930000.webp` | WebP | Missing locally | `server/uploads/categories/` |
| Tropical Fruits | `tropical` | `/uploads/categories/tropical-fruits-1788211978440.webp` | WebP | Missing locally | `server/uploads/categories/` |

---

## 4. Blog Posts Cover Manifest (8 Items)

| Blog Article Title | Slug | Relative Database Path | Format | Status | Local Destination |
| --- | --- | --- | --- | --- | --- |
| 10 Exotic Fruits in India You Must Try | `exotic-fruits-in-india-guide` | `/uploads/blog/exotic-fruit-market-still-life-1792317161600.png` | PNG | Missing locally | `server/uploads/blog/` |
| 7 Easy Fruit Chaat Recipes | `fruit-chaat-recipe-indian-fruit-salad` | `/uploads/blog/colorful-mint-garnished-fruit-chaat-1792486567599.png` | PNG | Missing locally | `server/uploads/blog/` |
| How to Pick Ripe Fruits: 13 Smart Buying Tips | `how-to-pick-ripe-fruits-buying-guide` | `/uploads/blog/fresh-fruit-market-selection-1792661588964.png` | PNG | Missing locally | `server/uploads/blog/` |
| Fridge or Counter? How to Store 15 Fruits at Home | `how-to-store-fruits-at-home-india` | `/uploads/blog/fresh-fruit-kitchen-abundance-1792316699220.png` | PNG | Missing locally | `server/uploads/blog/` |
| Why Does Pineapple Tingle? 8 Surprising Mysteries | `pineapple-tongue-tingle-fruit-mysteries` | `/uploads/blog/fruit-mystery-magnifier-still-life-1792866732128.png` | PNG | Missing locally | `server/uploads/blog/` |
| Guava vs Orange vs Kiwi: 7 Vitamin C-Rich Fruits | `vitamin-c-rich-fruits-india` | `/uploads/blog/sunlit-tropical-fruit-tabletop-arrangeme-1792771127726.png` | PNG | Missing locally | `server/uploads/blog/` |
| Whole Fruit vs Fruit Juice: 9 Facts | `whole-fruit-vs-fruit-juice` | `/uploads/blog/sunlit-fruit-bowl-and-juices-1792662942540.png` | PNG | Missing locally | `server/uploads/blog/` |
| 10 Winter Fruits in India: What's in Season? | `winter-fruits-in-india-seasonal-guide` | `/uploads/blog/abundant-rustic-fruit-basket-still-life-1792487205512.png` | PNG | Missing locally | `server/uploads/blog/` |

---

## 5. Sample Products Media Manifest (Selected High-Traffic Products)

| Product Name | Slug | Relative Database Path | Format | Status |
| --- | --- | --- | --- | --- |
| Blueberry Tube | `blueberry-tube` | `/uploads/products/fresh-blueberry-tube-packaging-1791398715419.webp` | WebP | Missing locally |
| Pear Beauty Red | `pear-beauty-red` | `/uploads/products/red-and-yellow-pear-still-life-1791399120358.webp` | WebP | Missing locally |
| Star Fruit | `star-fruit` | `/uploads/products/fresh-star-fruit-still-life-1791400034559.webp` | WebP | Missing locally |
| Avocado - Imported | `avocado-single` | `/uploads/products/avocado-single-1788297952489.webp` | WebP | Missing locally |
| Dragon Fruit - Red | `dragon-fruit` | `/uploads/products/dragon-fruit-red-1788298332184.webp` | WebP | Missing locally |
| Kiwi - Imported Pack of 5 | `kiwi-pack-5` | `/uploads/products/kiwi-pack-5-1788298568703.webp` | WebP | Missing locally |
| Ajwa Dates - Premium Madinah | `ajwa-dates` | `/uploads/products/ajwa-date-premium-madinah-1788214255164.webp` | WebP | Missing locally |
| Apple Royal Gala | `apple-royal-gala` | `/uploads/products/fresh-gala-apples-on-white-1791399726494.webp` | WebP | Missing locally |
| *(Total 74 Products)* | ... | ... | ... | Missing locally |
