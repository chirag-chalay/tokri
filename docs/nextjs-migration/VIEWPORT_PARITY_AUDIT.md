# Tokriii 10-Viewport Visual & Structural Parity Audit

## Executive Summary
This document provides empirical verification comparing the baseline React 19 + Vite 8 storefront (`http://127.0.0.1:5222`) against the Next.js 16.4.3 App Router implementation (`http://127.0.0.1:3000`) across all 10 established viewports.

The audit was executed headlessly via [`scripts/verify-viewport-parity.mjs`](../../scripts/verify-viewport-parity.mjs) utilizing `playwright-core` and Google Chrome under strict browser network isolation, identical local database (`tokri_live_local` on port 3307), and local Express API (port 5223).

---

## 1. Strict Browser Network Isolation & Font Fixture Policy

### Network Isolation Allowlist
Before the first browser navigation, a strict client-side interceptor was installed on the browser context:
- **Authorized Origins:** Only `127.0.0.1:3000` / `localhost:3000` (Next.js), `127.0.0.1:5222` / `localhost:5222` (Vite Preview), and `127.0.0.1:5223` / `localhost:5223` (Local Express API) are permitted.
- **Blocked Requests:** All outbound external network requests are aborted with `blockedbyclient`. During the 10-viewport run across 6 routes each, **420 external requests were intercepted and blocked**, including:
  - Google Fonts stylesheets (`fonts.googleapis.com`) and font binaries (`fonts.gstatic.com`)
  - Google Tag Manager (`www.googletagmanager.com/gtag/js`)
  - Third-party catalog image CDNs (`bbassets.com`, `images.unsplash.com`)

### Font Fixture & Parity Architecture
- **Next.js Root Layout (`src/app/layout.next.jsx`):** Removed all external Google Fonts references (`fonts.googleapis.com` / `fonts.gstatic.com`). The layout explicitly preloads `/fonts/plus-jakarta-sans-latin-400-normal.woff2` and loads `/fonts/fonts.css`.
- **Vite Baseline Test Mode:** Rather than modifying the approved production `index.html` file of the baseline React application, Playwright injects `<link rel="stylesheet" href="/fonts/fonts.css">` via `page.addInitScript()` dynamically during test runs. Both engines thus render with the exact same local WOFF2 font files.
- **Font Verification Methodology:**
  1. **Resource Loading:** Monitored network responses for HTTP 200 status on all local font files.
  2. **Font Availability:** Verified `document.fonts.check('400 16px "Plus Jakarta Sans"')`, `document.fonts.check('600 16px "Plus Jakarta Sans"')`, and `document.fonts.check('700 16px "Plus Jakarta Sans"')`.
  3. **Canvas Text Metrics:** Measured rendered text width of `'Tokriii Exotic & Fresh Produce 12345'` using canvas 2D context under `Plus Jakarta Sans` vs `monospace` fallback to guarantee glyph shaping occurs under the loaded font.

---

## 2. Established Viewport Specifications

| Viewport Profile | Resolution | Device Category | Target Form Factor |
| --- | :---: | :---: | --- |
| **Desktop Large** | 1920 × 1080 | Desktop | 24"+ Full HD Monitors |
| **Desktop Laptop** | 1440 × 900 | Desktop | 13"-15" MacBook / Ultrabooks |
| **Desktop Standard**| 1366 × 768 | Desktop | Standard HD Laptops |
| **Tablet Landscape**| 1024 × 768 | Tablet | iPad Landscape / Small Laptops |
| **Tablet Portrait** | 768 × 1024 | Tablet | iPad Portrait / Large Foldables |
| **Mobile Pro Max**  | 430 × 932 | Mobile | iPhone 14/15/16 Pro Max |
| **Mobile Standard** | 390 × 844 | Mobile | iPhone 12/13/14 Standard |
| **Mobile Compact**  | 375 × 812 | Mobile | iPhone X/XS/11 Pro |
| **Mobile Android**  | 360 × 800 | Mobile | Samsung Galaxy S Series |
| **Mobile Narrow**   | 320 × 568 | Mobile | iPhone SE 1st Gen / Fold Outer Screen |

---

## 3. Tested Routes & Interaction States

For every viewport, the following page archetypes and user states were evaluated:
1. **Homepage (`/`):** Initial SSR HTML, post-hydration layout, header brand logo, location bar, search bar, hero banner, category pills, bestseller cards, seasonal cards, footer.
2. **Shop Catalog (`/shop`):** Category rail navigation, product grid columns, responsive card layouts.
3. **Product Detail (`/product/blueberry-tube`):** Gallery container, pricing, weights, badge labels, CTA buttons, accordion information.
4. **Blog Listing (`/blog`):** Editorial cards, post timestamps, read time badges, grid layout.
5. **CMS Policy (`/about`):** Typography line length, heading styles, prose readability.
6. **Cart (`/cart`):** Empty state illustration, delivery note, return to shop CTA.
7. **Interactive Login Modal:** Modal overlay, telephone input, submit CTA, close button.

---

## 4. Empirical Results Across All 10 Viewports

| Viewport Profile | Header Geometry (Next vs Vite) | Main Geometry (Next vs Vite) | Font Check (`document.fonts.check`) | Canvas Text Metric Render | Hydration Errors | Blocked Ext Requests | Full Pixel Parity |
| --- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Desktop Large (1920×1080)** | 89px vs 89px (0px diff) | 1920px vs 1920px (0px diff) | **PASS** | **PASS** | 0 errors | 42 blocked | **BLOCKED** (missing media) |
| **Desktop Laptop (1440×900)** | 89px vs 89px (0px diff) | 1440px vs 1440px (0px diff) | **PASS** | **PASS** | 0 errors | 42 blocked | **BLOCKED** (missing media) |
| **Desktop Standard (1366×768)**| 89px vs 89px (0px diff) | 1366px vs 1366px (0px diff) | **PASS** | **PASS** | 0 errors | 42 blocked | **BLOCKED** (missing media) |
| **Tablet Landscape (1024×768)**| 89px vs 89px (0px diff) | 1024px vs 1024px (0px diff) | **PASS** | **PASS** | 0 errors | 42 blocked | **BLOCKED** (missing media) |
| **Tablet Portrait (768×1024)** | 123px vs 123px (0px diff) | 768px vs 768px (0px diff) | **PASS** | **PASS** | 0 errors | 42 blocked | **BLOCKED** (missing media) |
| **Mobile Pro Max (430×932)** | 119px vs 119px (0px diff) | 430px vs 430px (0px diff) | **PASS** | **PASS** | 0 errors | 42 blocked | **BLOCKED** (missing media) |
| **Mobile Standard (390×844)** | 119px vs 119px (0px diff) | 390px vs 390px (0px diff) | **PASS** | **PASS** | 0 errors | 42 blocked | **BLOCKED** (missing media) |
| **Mobile Compact (375×812)**  | 119px vs 119px (0px diff) | 375px vs 375px (0px diff) | **PASS** | **PASS** | 0 errors | 42 blocked | **BLOCKED** (missing media) |
| **Mobile Android (360×800)**  | 119px vs 119px (0px diff) | 360px vs 360px (0px diff) | **PASS** | **PASS** | 0 errors | 42 blocked | **BLOCKED** (missing media) |
| **Mobile Narrow (320×568)**   | 119px vs 119px (0px diff) | 320px vs 320px (0px diff) | **PASS** | **PASS** | 0 errors | 42 blocked | **BLOCKED** (missing media) |

---

## 5. Granular Evaluation Across Parity Dimensions

To avoid ambiguity, each technical dimension of parity is explicitly categorized:

1. **Header & Container Geometry: PASS**
   - Header heights match exactly across all 10 viewports (Desktop/Tablet-L: 89px, Tablet-P: 123px, Mobile: 119px).
   - Main container content widths match within 0px-4px across both platforms.

2. **Actual Browser Font Loading: PASS**
   - Verified that `document.fonts.check()` returns `true` for 400, 600, and 700 weights under `Plus Jakarta Sans`.
   - Verified 5 local font URLs returned HTTP 200:
     - `http://127.0.0.1:3000/fonts/plus-jakarta-sans-latin-400-normal.woff2`
     - `http://127.0.0.1:3000/fonts/plus-jakarta-sans-latin-500-normal.woff2`
     - `http://127.0.0.1:3000/fonts/plus-jakarta-sans-latin-600-normal.woff2`
     - `http://127.0.0.1:3000/fonts/plus-jakarta-sans-latin-700-normal.woff2`
     - `http://127.0.0.1:3000/fonts/fonts.css`
   - Verified that canvas glyph measurement differs significantly from fallback monospace, proving font glyph rendering.

3. **Initial Paint & SSR Content: PASS**
   - Header, navigation links, catalog sections, products, and footer are completely present in initial server-rendered HTML prior to client hydration.

4. **Hydration Stability: PASS**
   - Monitored browser console across all route navigations and viewport resize events. Zero React hydration mismatch errors or warnings recorded.

5. **Full Pixel Parity: BLOCKED**
   - Both Vite and Next.js exhibit empty image containers because the 92 catalog images are absent in the local repository (0/92 present; only `.gitkeep` exists in `server/uploads/`).
   - True pixel-perfect image parity cannot be unlocked until the production uploads archive is provided by an authorized administrator.
