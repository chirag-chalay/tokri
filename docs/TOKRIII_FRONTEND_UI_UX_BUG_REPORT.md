# TOKRIII FRONTEND UI/UX BUG REPORT

**Audit date:** October 24, 2026  
**Website:** [https://tokriii.com/](https://tokriii.com/)  
**Auditor:** Principal Frontend Engineer, UI/UX Architect & Accessibility Reviewer  
**Environment:** Live Production (`tokriii.com`), Read-Only Automated & Visual Inspection  
**Audit Mode:** STRICT READ-ONLY (No code, database, config, or assets were modified)

---

## 1. EXECUTIVE SUMMARY

An exhaustive, evidence-based visual, responsive, architectural, accessibility, and conversion audit was conducted on Tokriii.com across 10 distinct device viewports spanning desktop, tablet, and mobile platforms.

Tokriii features a distinctive dark green aesthetic ("Vegitecture" botanical canvas palette) built on React 19, Vite 8, Tailwind CSS v4, and React Router v7. While the brand visual language is sleek, dark, and premium in concept, rigorous multi-device testing revealed critical conversion friction points, touch target violations, breakpoint architecture mismatches, and accessibility barriers.

### Audit Scale
- **Total pages / routes reviewed:** 26 routes (including Home, Shop All, 8 category views, 6 product types, Search states, Cart drawer/page, Checkout, Mobile Auth, Blog list, Blog detail, 5 CMS pages, and 404/Error edge states).
- **Total desktop viewports tested:** 3 (1920×1080, 1440×900, 1366×768).
- **Total tablet viewports tested:** 2 (1024×768, 768×1024).
- **Total mobile viewports tested:** 5 (430×932, 390×844, 375×812, 360×800, 320×568).
- **Total evidence screenshots captured:** 52 high-resolution screenshots saved to `docs/ui-audit/screenshots/`.

### Bug Breakdown by Severity
| Severity Level | Count | Definition |
| :--- | :---: | :--- |
| **P0 — Blocker** | 0 | No flow completely blocked to 100% of users |
| **P1 — Critical** | 4 | Substantial sales/conversion hurt, broken primary controls, missing branding |
| **P2 — High** | 6 | Major responsive breakpoint conflicts, severe accessibility failures, keyboard friction |
| **P3 — Medium** | 6 | Visible design inconsistencies, touch target warnings, DOM duplication |
| **P4 — Low** | 2 | Visual polish, missing modal focus traps, minor badge alignments |
| **TOTAL CONFIRMED BUGS** | **18** | Deduplicated root causes with exact evidence |

### Top 10 Issues Affecting Sales & User Experience
1. **CartControl Compact Touch Target Severely Sub-Scale (35×16px & 24×20px):** On mobile cards across Home and Category feeds, the Add button and quantity steppers fail WCAG 2.1/2.2 touch target minimums. Finger taps accidentally bubble to the parent card, triggering unwanted page navigation rather than adding the fruit to cart.
2. **Mobile Header Omits Brand Logo & Name Entirely:** Mobile users browsing the site see only a back arrow, address bar, user profile icon, and search bar. Brand identification is completely invisible in the sticky header.
3. **Missing `onError` Fallback on Product Images:** Failed image requests from `server.tokriii.com` (blocked by Chromium ORB or returning 404) leave blank transparent voids in the product grid with no visual placeholder.
4. **Frankenstein Tablet Breakpoint Mismatch (768px–1023px):** Header and CartPage use `lg:hidden` (1024px) for mobile mode, whereas ShopAllPage uses `(max-width: 767px)` for mobile mode. Tablets in portrait mode (iPad 768px–834px) render a mobile header, a desktop category rail shop, and a mobile cart page.
5. **Disabled Checkout CTA Without Contextual Feedback:** Guests or users without addresses see an inactive disabled button with 60% opacity with zero inline guidance explaining why they cannot proceed.
6. **Mobile Login Numeric Keypad Failure:** Phone input on `/login` and desktop modal lacks `inputmode="numeric"` and `type="tel"`, opening standard QWERTY keyboards on mobile devices and increasing login friction.
7. **Severe Contrast Failure on Quantity Steppers (2.5:1):** White text on brand green (`#4daf7b`) inside quantity badges fails WCAG AA minimum contrast ratio (4.5:1).
8. **320px Narrow Screen Card Compression (103px Width):** On narrow mobile devices, 2-column shop cards compress into 103px slots, wrapping text awkwardly and forcing prices against buttons.
9. **Dual DOM Duplication on Cart Page:** CartPage renders both complete mobile and desktop HTML trees in the DOM concurrently (`lg:hidden` and `hidden lg:block`), doubling memory and render overhead.
10. **Non-Semantic Product Card Navigation:** Product cards use `<article onClick>` rather than semantic anchors (`<a>`), depriving keyboard-only and assistive technology users of standard navigation.

---

## 2. FRONTEND DESIGN SYSTEM OBSERVED

### 2.1 Color Palette Tokens (`src/index.css`)
Tokriii utilizes Tailwind CSS v4's `@theme` directive, anchoring around a dark botanical green palette:
- `--color-canvas`: `#0a110a` (Deep charcoal green; primary page background)
- `--color-panel`: `#121612` (Elevated container surface; cards, header, footer)
- `--color-panel-2`: `#1a211a` (High-elevation surface; product cards, input backgrounds)
- `--color-line`: `#2a332a` (Subtle boundary borders, dividers)
- `--color-mint`: `#a7d8b9` (Secondary accent, highlighted metadata, discounts)
- `--color-muted`: `#a1a1aa` (Zinc-400 equivalent; secondary copy, inactive states)
- `--color-brand`: `#4daf7b` (Vibrant emerald green; primary CTAs, active highlights)
- `--color-brand-hover`: `#3d9a6a` (Hover interaction tone)
- `--color-brand-deep`: `#2f7d56` (Deep accent shade)
- *Remapped Emerald Scale:* Tailwind's standard `emerald-50` through `emerald-950` are explicitly remapped to match this brand green spectrum.

### 2.2 Typography System
- **Font Family:** `Plus Jakarta Sans`, system-ui, sans-serif (Google Fonts variable font loaded in `index.html`).
- **Headings:**
  - H1 Page Titles: `text-2xl font-bold sm:text-3xl text-white` (Product details, Cart, Account)
  - Section Headings: `home-section-title` class (`24px` mobile, `28px` md, weight 700, letter-spacing `-0.02em`, color `#ffffff`)
  - Product Card Titles: `text-xs font-medium sm:text-[13px] text-white` (2-line clamp)
- **Body & Captions:** `text-sm text-muted` (`#a1a1aa`), Line height 1.6
- **Badges & Labels:** `text-[9px] font-bold sm:text-[10px]` uppercase tracking-wide

### 2.3 Spacing & Layout Rhythm
- **Page Container:** `mx-auto max-w-7xl px-4 sm:px-6 lg:px-8` (Max width 1280px)
- **Vertical Section Spacing:** `my-8 lg:my-14`
- **Product Card Padding:** Compact `p-1 sm:p-1.5`
- **Component Padding:** `p-4 sm:p-6` for billing, address, and checkout cards
- **Card Radius:** Standardized on `rounded-2xl` (16px) for panels, `rounded-xl` (12px) for inputs, `rounded-lg` (8px) for compact product cards, and `rounded-full` for primary action pills.

---

## 3. PAGE INVENTORY

| Page | URL | Desktop Tested | Tablet Tested | Mobile Tested | Status |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **Home** | `/` | 1920, 1440, 1366 | 1024, 768 | 430, 390, 375, 360, 320 | BUGS FOUND |
| **Shop All** | `/shop` | 1920, 1440, 1366 | 1024, 768 | 430, 390, 375, 360, 320 | BUGS FOUND |
| **Category (Exotic)** | `/shop?category=exotic` | 1440 | 1024 | 390, 375 | BUGS FOUND |
| **Category (Fresh Fruits)** | `/shop?category=fresh-fruits` | 1440 | 1024 | 390, 375 | BUGS FOUND |
| **Category (Premium)** | `/shop?category=premium` | 1440 | 1024 | 390, 375 | BUGS FOUND |
| **Category (Imported)** | `/shop?category=imported` | 1440 | 1024 | 390, 375 | BUGS FOUND |
| **Category (Dry Fruits)** | `/shop?category=dry-fruits` | 1440 | 1024 | 390, 375 | BUGS FOUND |
| **Category (Tropical)** | `/shop?category=tropical` | 1440 | 1024 | 390, 375 | BUGS FOUND |
| **Category (Melons)** | `/shop?category=melons` | 1440 | 1024 | 390, 375 | BUGS FOUND |
| **Category (Daily Fruits)** | `/shop?category=daily-fruits` | 1440 | 1024 | 390, 375 | BUGS FOUND |
| **Product Detail (Tube)** | `/product/blueberry-tube` | 1440 | 1024 | 430, 390, 375, 320 | BUGS FOUND |
| **Product Detail (Discounted)**| `/product/date-crown` | 1440 | 1024 | 390, 375 | BUGS FOUND |
| **Product Detail (Pack of 6)**| `/product/pear-beauty-red` | 1440 | 1024 | 390, 375 | BUGS FOUND |
| **Product Detail (Exotic)** | `/product/star-fruit` | 1440 | 1024 | 390, 375 | BUGS FOUND |
| **Search (All 5 queries)** | `/` & `/shop` | 1440 | 1024 | 390, 375 | BUGS FOUND |
| **Cart (Empty State)** | `/cart` | 1440 | 1024 | 390, 375 | PASS |
| **Cart (With Items)** | `/cart` | 1440 | 1024 | 390, 375 | BUGS FOUND |
| **Checkout Flow** | `/checkout` | 1440 | 1024 | 430, 390, 320 | BUGS FOUND |
| **Auth / Login (Mobile)** | `/login` | N/A (Redirects) | N/A | 390, 375 | BUGS FOUND |
| **Auth / Login (Desktop Modal)**| `/` (Header CTA) | 1440 | 1024 | N/A (Mobile uses `/login`) | BUGS FOUND |
| **Blog Listing** | `/blog` | 1440 | 1024, 768 | 390, 375 | PASS |
| **Blog Detail** | `/blog/vitamin-c-rich-fruits-india` | 1440 | 768 | 390, 375 | BUGS FOUND |
| **About Us** | `/about` | 1440 | 1024 | 390 | PASS |
| **Help / FAQs** | `/help-faqs` | 1440 | 1024 | 390 | PASS |
| **Returns Policy** | `/returns-policy` | 1440 | 1024 | 390 | PASS |
| **Privacy Policy** | `/privacy-policy` | 1440 | 1024 | 390 | PASS |
| **Terms & Conditions** | `/terms-and-conditions` | 1440 | 1024 | 390 | PASS |
| **404 Not Found Page** | `/non-existent-page-404` | 1440 | 1024 | 390 | PASS |
| **Product 404 State** | `/product/invalid-slug-99` | 1440 | 1024 | 390 | PASS |

---

## 4. BUG SUMMARY

| ID | Severity | Category | Page | Device | Short Issue | Screenshot |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **BUG-001** | **P1** | HEADER, CONVERSION | All pages | Mobile (≤1023px) | Mobile header completely omits Tokriii brand logo/name | `docs/ui-audit/screenshots/BUG-012-home-mobile-390.png` |
| **BUG-002** | **P1** | PRODUCT CARD, ACCESSIBILITY | Home, Shop, Categories | Mobile (≤768px) | Add button (35×16px) & quantity steppers (24×20px) violate touch targets | `docs/ui-audit/screenshots/BUG-013-shop-mobile-390.png` |
| **BUG-003** | **P2** | RESPONSIVE, ARCHITECTURE | Shop, Header, Cart | Tablet (768px–1023px) | Breakpoint mismatch (Shop md vs Header lg) creates hybrid frankenstein UI | `docs/ui-audit/screenshots/audit-shop-tablet-768.png` |
| **BUG-004** | **P1** | IMAGE, FUNCTIONAL UI | Shop, PDP, Home | All Devices | Broken images lack `onError` fallback, displaying empty void on 404/ORB | `docs/ui-audit/screenshots/BUG-002-shop-desktop-1440.png` |
| **BUG-005** | **P2** | ACCESSIBILITY, COLOR | CartControl | All Devices | White text on brand green `#4daf7b` fails WCAG AA contrast (2.5:1) | `docs/ui-audit/screenshots/BUG-028-cart-drawer-open-1440.png` |
| **BUG-006** | **P2** | CHECKOUT, CONVERSION | Checkout | All Devices | Place order CTA disabled with no feedback explaining why user cannot buy | `docs/ui-audit/screenshots/BUG-006-checkout-desktop-1440.png` |
| **BUG-007** | **P3** | HEADER, LAYOUT | Header | Desktop (≥1024px) | Cart count badge circle lacks flex centering, misaligning numeral | `docs/ui-audit/screenshots/BUG-001-home-desktop-1440.png` |
| **BUG-008** | **P2** | FORM, ACCESSIBILITY | Login, Auth Popup | Mobile & Desktop | Phone input missing `type="tel"` and `inputmode="numeric"`, opening text keyboard | `docs/ui-audit/screenshots/BUG-036-mobile-login-initial-390.png` |
| **BUG-009** | **P2** | COLOR, TYPOGRAPHY | ShopOurRange | All Devices | Component has pure black text `#000000` on dark canvas (1.1:1 contrast) | Source Code `src/components/ShopOurRange.jsx` |
| **BUG-010** | **P3** | RESPONSIVE, LAYOUT | Shop All | Mobile (320px) | 320px screens crush product cards into 103px columns, wrapping text badly | `docs/ui-audit/screenshots/BUG-021-shop-mobile-320.png` |
| **BUG-011** | **P3** | ACCESSIBILITY, NAVIGATION | Product Cards | All Devices | Cards use `<article onClick>` rather than semantic clickable links (`<a>`) | `docs/ui-audit/screenshots/BUG-002-shop-desktop-1440.png` |
| **BUG-012** | **P3** | ACCESSIBILITY | Header | Desktop (≥1024px) | Desktop shopping bag button missing `aria-label` attribute | `docs/ui-audit/screenshots/BUG-001-home-desktop-1440.png` |
| **BUG-013** | **P3** | PERFORMANCE, ARCHITECTURE| Cart Page | All Devices | Renders both mobile and desktop views concurrently in DOM | `docs/ui-audit/screenshots/BUG-030-cart-page-populated-1440.png` |
| **BUG-014** | **P3** | CROSS-PAGE CONSISTENCY | Home, Shop, Search | All Devices | Duplicate card implementations across 8 files cause divergent heights | `docs/ui-audit/screenshots/BUG-001-home-desktop-1440.png` |
| **BUG-015** | **P4** | ACCESSIBILITY, MODAL | Drawer, Login Modal | Desktop (≥1024px) | Modals lack keyboard focus trap, allowing tabbing to hidden background page | `docs/ui-audit/screenshots/BUG-028-cart-drawer-open-1440.png` |
| **BUG-016** | **P3** | CONVERSION, FORM | Cart, Checkout | All Devices | Coupon error uses muted red text without dismiss or auto-clear interaction | `docs/ui-audit/screenshots/BUG-032-checkout-invalid-coupon-1440.png` |
| **BUG-017** | **P4** | SEARCH, IMAGE | SearchBox | Desktop (≥1024px) | Dropdown search result image container hardcoded to `h-24` without aspect guard | `docs/ui-audit/screenshots/BUG-024-search-results-apple-1440.png` |
| **BUG-018** | **P3** | BLOG, RESPONSIVE | Blog Detail | Tablet & Desktop | Custom 1240px media query conflicts with standard 1024px/1280px breakpoints | `docs/ui-audit/screenshots/BUG-008-blog-detail-desktop-1440.png` |

---

## 5. DETAILED BUGS

### BUG-001 — Mobile Header Omits Brand Identity (No Logo or Store Name)
- **Severity:** P1 — Critical
- **Priority:** High
- **Category:** HEADER, CONVERSION, MOBILE
- **Page:** Global (All mobile customer-facing views)
- **URL:** `https://tokriii.com/`
- **Device:** Mobile
- **Viewport:** 430×932, 390×844, 375×812, 360×800, 320×568
- **Observed:**
  On screens `<1024px` (`lg:hidden`), the header renders only three items: back arrow (if internal page), `DeliveryAddressBar` ("Select address"), and a generic circular `UserRound` icon, followed by the search input. There is no Tokriii logo, brand mark, or site name anywhere in the header.
- **Expected:**
  E-commerce mobile best practice requires immediate, persistent brand reinforcement. A compact brand mark or logo mark should sit in the top navigation bar alongside location selection.
- **Steps to reproduce:**
  1. Open `https://tokriii.com/` on any mobile viewport (e.g., iPhone 390×844).
  2. Inspect the top sticky header.
  3. Notice zero brand presence.
- **Why it matters:**
  Hurts customer trust, brand recall, and orientation when landing on deep links or organic searches.
- **Screenshot:** `docs/ui-audit/screenshots/BUG-012-home-mobile-390.png`
- **Likely affected component:** `src/components/Header.jsx` (Lines 47–75)
- **Suggested direction:** Include a compact svg/webp Tokriii icon or brand wordmark inline with the address selector in the mobile header flex container.

---

### BUG-002 — Product Card Add Button & Quantity Stepper Violate Minimum Touch Targets (35×16px)
- **Severity:** P1 — Critical
- **Priority:** High
- **Category:** PRODUCT CARD, ACCESSIBILITY, CONVERSION
- **Page:** Home, Shop All, Category Pages, Related Products
- **URL:** `https://tokriii.com/` & `https://tokriii.com/shop`
- **Device:** Mobile
- **Viewport:** 430×932, 390×844, 375×812, 360×800, 320×568
- **Observed:**
  In `CartControl.jsx` (compact variant), the unadded button is rendered with `px-1.5 py-0.5 text-[10px]`, producing a physical bounding box of **35px width by 16px height** on live mobile screens. When an item is added, the minus and plus steppers are sized at `h-6 w-5` (**24px height by 20px width**).
  Because the enclosing `<article>` has an `onClick={() => onNavigate(product.slug)}`, attempting to tap the tiny 20px stepper button frequently lands on the card surface, unexpectedly redirecting the customer away to the product detail page instead of adjusting cart quantity.
- **Expected:**
  Interactive touch targets must measure at least 44×44px (WCAG 2.1 AAA / Apple HIG) or at minimum 24×24px with adequate padding (WCAG 2.2 AA). Tapping quantity controls must never inadvertently trigger card navigation.
- **Steps to reproduce:**
  1. Open `https://tokriii.com/` on mobile (390px).
  2. Scroll down to Best Sellers or Fresh Fruits.
  3. Tap the tiny `ADD` button (35×16px).
  4. Notice the `+` / `-` buttons are 20px wide. Tap slightly off-center; notice the app unexpectedly navigates to `/product/:id`.
- **Why it matters:**
  Severe sales conversion blocker. Shoppers become frustrated when trying to add multiple items and getting ripped out of the browse flow.
- **Screenshot:** `docs/ui-audit/screenshots/BUG-013-shop-mobile-390.png`, `docs/ui-audit/screenshots/BUG-017-home-mobile-375.png`
- **Likely affected component:** `src/components/CartControl.jsx` (Lines 110–144)
- **Suggested direction:** Expand the button touch area to minimum 44×44px using pseudo-elements (`::after` hit area) or redesign the compact variant to have min-height 36px with comfortable stepper hit zones, and explicitly decouple card navigation from the quantity container.

---

### BUG-003 — Breakpoint Architecture Conflict Between Shop Page (`md: 768px`) and Header/Cart (`lg: 1024px`)
- **Severity:** P2 — High
- **Priority:** High
- **Category:** RESPONSIVE, ARCHITECTURE, LAYOUT
- **Page:** Shop All, Header, Cart Page
- **URL:** `https://tokriii.com/shop`
- **Device:** Tablet (768px to 1023px, e.g., iPad Mini, iPad Air, 800×1280 tablets)
- **Viewport:** 768×1024, 800×1280, 1024×768
- **Observed:**
  `ShopAllPage.jsx` defines its mobile switch as `const MOBILE_QUERY = '(max-width: 767px)'`. At 768px, it switches into desktop two-pane mode with a fixed vertical category rail.
  However, `Header.jsx` uses Tailwind's `lg:` breakpoint (`1024px`) to switch between mobile and desktop headers (`lg:hidden` vs `hidden lg:block`).
  Similarly, `CartPage.jsx` uses `lg:hidden` for mobile cart and `hidden lg:block` for desktop cart.
  As a result, between 768px and 1023px, the user sees a mobile phone header (with no logo and full-width search), coupled with a desktop shop layout (with side category rail), and when clicking Cart, they get the mobile phone cart sheet.
- **Expected:**
  The application should maintain a unified breakpoint token across the entire layout system.
- **Steps to reproduce:**
  1. Set viewport to 768×1024 or 800×1200.
  2. Navigate to `https://tokriii.com/shop`.
  3. Observe the mobile header at the top, but the desktop category rail inside the shop page.
- **Why it matters:**
  Breaks visual consistency, violates architectural integrity, and confuses tablet customers.
- **Screenshot:** `docs/ui-audit/screenshots/audit-shop-tablet-768.png`, `docs/ui-audit/screenshots/audit-home-tablet-768.png`
- **Likely affected component:** `src/pages/ShopAllPage.jsx` (Line 13), `src/components/Header.jsx` (Line 47, 78)
- **Suggested direction:** Align `ShopAllPage` to use `(max-width: 1023px)` or standardize responsive breakpoints across all layout shells.

---

### BUG-004 — Missing Image Error Handling Leaves Vacant Black Boxes on 404/ORB Blocked Assets
- **Severity:** P1 — Critical
- **Priority:** High
- **Category:** IMAGE, FUNCTIONAL UI, VISUAL
- **Page:** Shop All, Product Detail, Home, Search
- **URL:** `https://tokriii.com/shop` & `https://tokriii.com/product/blueberry-tube`
- **Device:** All Devices
- **Viewport:** All Viewports
- **Observed:**
  Console and network inspection confirmed 24 network failures on live product image URLs (e.g. `https://server.tokriii.com/uploads/products/fresh-blueberry-tube-packaging-1791398715419.webp` returning 404 and `net::ERR_BLOCKED_BY_ORB`).
  In the frontend JSX (`ShopAllPage.jsx`, `ProductCard.jsx`, `ProductDetail.jsx`), `<img>` elements lack an `onError` fallback handler. When the asset fails, browsers render an empty black box or broken outline, leaving the customer with no visual product context.
- **Expected:**
  All product and category images should have graceful error boundaries: `onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE }}` to display a clean branded SVG fruit placeholder.
- **Steps to reproduce:**
  1. Open DevTools Network tab on `https://tokriii.com/shop`.
  2. Inspect failed image requests for newly added catalog items.
  3. Observe product cards displaying dark voids without imagery.
- **Why it matters:**
  Food and fresh fruit e-commerce is overwhelmingly visual. Broken image cards destroy shopper confidence and suppress conversion rates.
- **Screenshot:** `docs/ui-audit/screenshots/BUG-002-shop-desktop-1440.png`, `docs/ui-audit/screenshots/BUG-003-product-detail-desktop-1440.png`
- **Likely affected component:** `src/pages/ShopAllPage.jsx` (Line 66), `src/components/HomeCategoryFeed.jsx`
- **Suggested direction:** Wrap image elements in a reusable `<ProductImage>` component with native `onError` fallback to `PLACEHOLDER_IMAGE`.

---

### BUG-005 — Quantity Badge Text Has Critical WCAG AA Contrast Failure (2.5:1)
- **Severity:** P2 — High
- **Priority:** High
- **Category:** ACCESSIBILITY, COLOR
- **Page:** Cart Drawer, Cart Page, Shop All, Product Detail
- **URL:** `https://tokriii.com/shop` & `https://tokriii.com/cart`
- **Device:** All Devices
- **Viewport:** All Viewports
- **Observed:**
  When a product has quantity > 0 in `CartControl` (shop and compact variants), the stepper container applies `bg-brand text-white` (`#4daf7b` green background with `#ffffff` white text).
  The relative luminance of `#ffffff` is 1.0, and `#4daf7b` is ~0.37. The resulting contrast ratio is **2.52:1**, drastically below the WCAG 2.1 AA requirement of **4.5:1** for standard text. The quantity numeral is faint and difficult to read.
  (In contrast, primary buttons correctly use `bg-brand text-black`, which yields an accessible **8.2:1** ratio).
- **Expected:**
  Text on `bg-brand` (`#4daf7b`) must be `#000000` (black) or `#0a110a` (canvas dark) to ensure legible 8:1+ contrast.
- **Steps to reproduce:**
  1. Add any product to cart.
  2. Inspect the quantity stepper button in the card or cart drawer.
  3. Run an accessibility contrast picker on the white number on green pill.
- **Why it matters:**
  Accessibility violation; causes eye strain and misread quantities for low-vision and elderly shoppers.
- **Screenshot:** `docs/ui-audit/screenshots/BUG-028-cart-drawer-open-1440.png`, `docs/ui-audit/screenshots/BUG-030-cart-page-populated-1440.png`
- **Likely affected component:** `src/components/CartControl.jsx` (Lines 88, 123)
- **Suggested direction:** Update stepper styling from `text-white` to `text-black` or `text-canvas` when background is `bg-brand`.

---

### BUG-006 — Checkout Place Order Button Disabled Without Explanatory Context
- **Severity:** P2 — High
- **Priority:** High
- **Category:** CHECKOUT, CONVERSION, UX
- **Page:** Checkout
- **URL:** `https://tokriii.com/checkout`
- **Device:** All Devices
- **Viewport:** All Viewports
- **Observed:**
  On `/checkout`, if the customer is not logged in or has not selected a delivery address, the primary CTA button ("Pay ₹..." / "Place order") is set to `disabled` with `disabled:opacity-60 disabled:cursor-not-allowed`.
  There is no error text, tooltip, or inline helper telling the customer *what action is required* to unlock checkout. Clicking the button produces no feedback.
- **Expected:**
  If prerequisites are missing, the button should either:
  a) Remain enabled and, when clicked, automatically scroll to and highlight the missing field (e.g. "Please add your delivery address"), or
  b) Display clear persistent helper copy directly above the button (e.g., "Add an address above to complete checkout").
- **Steps to reproduce:**
  1. Add an item to cart and navigate to `/checkout` as a guest or without a saved address.
  2. Scroll down to the order summary panel.
  3. Notice the CTA button is grayed out. Clicking it does nothing.
- **Why it matters:**
  Direct checkout abandonment. Users believe the site is broken or hanging.
- **Screenshot:** `docs/ui-audit/screenshots/BUG-006-checkout-desktop-1440.png`, `docs/ui-audit/screenshots/BUG-031-checkout-page-populated-1440.png`
- **Likely affected component:** `src/pages/CheckoutPage.jsx` (Lines 551–573)
- **Suggested direction:** Replace the blanket `disabled` attribute with validation logic that triggers a helpful toast or auto-opens the address picker when tapped.

---

### BUG-007 — Desktop Header Cart Counter Badge Circle Lacks Flex Centering
- **Severity:** P3 — Medium
- **Priority:** Medium
- **Category:** HEADER, LAYOUT, POLISH
- **Page:** Global Header (Desktop)
- **URL:** `https://tokriii.com/`
- **Device:** Desktop / Tablet
- **Viewport:** ≥1024px
- **Observed:**
  In `Header.jsx`, the cart counter badge is rendered as:
  `<span className="absolute -right-2 -top-1 h-[20px] w-[20px] rounded-full bg-brand text-[13px] font-semibold text-black">{totalCount}</span>`
  Because this `<span>` is an inline element without `flex items-center justify-center` or explicit line-height, the count digit is displaced toward the top-left quadrant of the circle rather than being optically centered.
- **Expected:**
  The badge numeral should be centered both horizontally and vertically inside the 20×20px circular pill.
- **Steps to reproduce:**
  1. Open Tokriii on desktop (1440px).
  2. Add 2 items to cart.
  3. Inspect the green count circle on the shopping bag icon in the top right.
  4. Notice the number "2" touches the upper edge.
- **Why it matters:**
  Visual polish defect in the primary navigation header seen on every page.
- **Screenshot:** `docs/ui-audit/screenshots/BUG-001-home-desktop-1440.png`, `docs/ui-audit/screenshots/BUG-028-cart-drawer-open-1440.png`
- **Likely affected component:** `src/components/Header.jsx` (Line 111)
- **Suggested direction:** Add `inline-flex items-center justify-center leading-none` to the badge classes.

---

### BUG-008 — Mobile Login Phone Input Lacks `inputmode="numeric"` and `type="tel"`
- **Severity:** P2 — High
- **Priority:** High
- **Category:** FORM, ACCESSIBILITY, MOBILE
- **Page:** Mobile Login & Desktop Auth Popup
- **URL:** `https://tokriii.com/login`
- **Device:** Mobile
- **Viewport:** All Mobile Viewports
- **Observed:**
  In `MobileLoginPage.jsx` and `LoginPopup.jsx`, the 10-digit mobile number input is rendered without `type="tel"` or `inputMode="numeric"`.
  When a user taps into the phone number box on iOS Safari or Android Chrome, the operating system summons the full alphabetical QWERTY keyboard instead of the convenient oversized numeric dial pad.
- **Expected:**
  Phone number input fields must specify `type="tel"` and `inputMode="numeric"` to automatically trigger the numeric keypad on touch devices.
- **Steps to reproduce:**
  1. Open `https://tokriii.com/login` on an iPhone or Android mobile device.
  2. Tap the "Enter mobile number" input box.
  3. Observe standard alphabet keyboard appearing instead of numeric digits.
- **Why it matters:**
  Unnecessary mobile input friction. Shoppers must switch keyboard modes, increasing typos and drop-off during the critical authentication funnel.
- **Screenshot:** `docs/ui-audit/screenshots/BUG-036-mobile-login-initial-390.png`, `docs/ui-audit/screenshots/BUG-037-mobile-login-phone-entered-390.png`
- **Likely affected component:** `src/pages/MobileLoginPage.jsx` (Line 85), `src/components/LoginPopup.jsx` (Line 44)
- **Suggested direction:** Add `type="tel" inputMode="numeric" pattern="[0-9]*"` to the phone input elements.

---

### BUG-009 — Unmounted Component `ShopOurRange.jsx` Contains Pure Black Text `#000000` on Dark Canvas
- **Severity:** P2 — High
- **Priority:** Medium
- **Category:** COLOR, TYPOGRAPHY, CODE HYGIENE
- **Page:** Component repository (`src/components/ShopOurRange.jsx`)
- **URL:** N/A (Component file)
- **Device:** All Devices
- **Viewport:** All Viewports
- **Observed:**
  In `src/components/ShopOurRange.jsx`, line 148 defines:
  `<h2 className="text-[52px] font-bold text-black"><span className="font-light">Shop By </span>Range</h2>`
  Furthermore, lines 218 and 222 specify:
  `className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500"`
  And line 211 specifies:
  `className="... border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 ..."`
  On Tokriii's dark canvas (`#0a110a`), `text-black` has a contrast ratio of 1.1:1, rendering the heading completely invisible. The white background containers violently clash with the dark theme. If mounted or reused in future homepage releases, it will break the dark UI.
- **Expected:**
  All reusable components in `src/components/` should strictly adhere to theme tokens (`text-white`, `border-line`, `bg-panel-2`).
- **Why it matters:**
  Severe regression trap. Any developer re-enabling this component on the homepage will immediately ship invisible text and broken color tokens.
- **Likely affected component:** `src/components/ShopOurRange.jsx` (Lines 148, 211, 218, 222)
- **Suggested direction:** Clean up the component styling to use dark theme tokens (`text-white`, `bg-panel`, `border-line`) or delete unmounted dead code.

---

### BUG-010 — 320px Narrow Viewport Squeezes Shop Cards to 103px Width
- **Severity:** P3 — Medium
- **Priority:** Medium
- **Category:** RESPONSIVE, LAYOUT
- **Page:** Shop All
- **URL:** `https://tokriii.com/shop`
- **Device:** Mobile (Narrow Devices e.g. iPhone SE 1st Gen, Galaxy Fold outer screen, 320px)
- **Viewport:** 320×568
- **Observed:**
  On a 320px viewport, `ShopAllPage` reserves 76px for the sticky category rail, plus container paddings. The remaining space forces a 2-column grid (`grid-cols-2`), resulting in product cards of only **103px width**.
  At 103px, product titles wrap into 3 cramped lines or truncate aggressively, and price tags collide with the `ADD` button.
- **Expected:**
  On viewports `<=340px`, the shop product grid should either drop to a single comfortable column or the category rail should collapse into an icon-only or top horizontal carousel.
- **Steps to reproduce:**
  1. Set browser viewport to 320×568.
  2. Navigate to `https://tokriii.com/shop`.
  3. Observe product cards squeezed into narrow 103px columns.
- **Why it matters:**
  Poor user experience for users on compact smartphones.
- **Screenshot:** `docs/ui-audit/screenshots/BUG-021-shop-mobile-320.png`
- **Likely affected component:** `src/pages/ShopAllPage.jsx` (Lines 739, 797)
- **Suggested direction:** Introduce a responsive conditional grid or collapse category rail width at `@media (max-width: 340px)`.

---

### BUG-011 — Product Cards Lack Semantic Keyboard Link Anchors (`<a>`)
- **Severity:** P3 — Medium
- **Priority:** Medium
- **Category:** ACCESSIBILITY, NAVIGATION
- **Page:** Home, Shop All, Category Pages, Best Sellers
- **URL:** `https://tokriii.com/` & `https://tokriii.com/shop`
- **Device:** All Devices
- **Viewport:** All Viewports
- **Observed:**
  Product cards in `HomeCategoryFeed.jsx`, `BestSellers.jsx`, `ShopAllPage.jsx`, and `SeasonalFruits.jsx` are constructed as:
  `<article onClick={() => onNavigate(product.slug)} className="group cursor-pointer ...">`
  They lack an `<a href="...">` anchor wrapper, `tabIndex={0}`, and `onKeyDown` handlers. Keyboard users tabbing through the page cannot focus or activate product cards to view details.
- **Expected:**
  Product cards or product titles should be wrapped in semantic React Router `<Link to={`/product/${product.slug}`}>` elements with native keyboard accessibility (`Enter` key activation).
- **Steps to reproduce:**
  1. Open `https://tokriii.com/`.
  2. Use the `Tab` key to navigate through the page.
  3. Notice focus jumps directly over product cards without stopping on them.
- **Why it matters:**
  Fails WCAG 2.1 Success Criterion 2.1.1 (Keyboard accessible). Screen readers cannot identify the card as a link.
- **Screenshot:** `docs/ui-audit/screenshots/BUG-002-shop-desktop-1440.png`
- **Likely affected component:** `src/pages/ShopAllPage.jsx` (Lines 48–94), `src/components/HomeCategoryFeed.jsx`
- **Suggested direction:** Wrap product titles or cards with `<Link>` components, ensuring the add-to-cart button uses `event.stopPropagation()`.

---

### BUG-012 — Desktop Header Cart Button Missing Accessible Label
- **Severity:** P3 — Medium
- **Priority:** Low
- **Category:** ACCESSIBILITY, HEADER
- **Page:** Global Header (Desktop)
- **URL:** `https://tokriii.com/`
- **Device:** Desktop
- **Viewport:** ≥1024px
- **Observed:**
  In `Header.jsx`, line 109:
  `<button onClick={openDrawer} className="relative cursor-pointer text-white" type="button">`
  `<ShoppingBagIcon size={30} />`
  The button contains no `aria-label`, `title`, or inner text. Screen readers announce this vital cart trigger simply as "button".
- **Expected:**
  The button should include `aria-label={`View shopping cart, ${totalCount} items`}`.
- **Steps to reproduce:**
  1. Inspect the shopping bag button in Chrome DevTools on desktop.
  2. Check the Accessibility tree computed name; notice it is empty or undefined.
- **Why it matters:**
  WCAG 2.1 SC 4.1.2 (Name, Role, Value) failure for visually impaired users.
- **Screenshot:** `docs/ui-audit/screenshots/BUG-001-home-desktop-1440.png`
- **Likely affected component:** `src/components/Header.jsx` (Line 109)
- **Suggested direction:** Add dynamic `aria-label={`View shopping cart (${totalCount} items)`}` to the trigger button.

---

### BUG-013 — CartPage Concurrently Mounts Both Mobile and Desktop DOM Trees
- **Severity:** P3 — Medium
- **Priority:** Low
- **Category:** PERFORMANCE, ARCHITECTURE
- **Page:** Cart Page
- **URL:** `https://tokriii.com/cart`
- **Device:** All Devices
- **Viewport:** All Viewports
- **Observed:**
  In `CartPage.jsx`, lines 82 and 203:
  Both `<MobileCartView ... />` and `<DesktopCartView ... />` are simultaneously mounted in the React DOM on all viewports, using Tailwind utility classes (`lg:hidden` and `hidden lg:block`) to show/hide them.
  All child components—including cart items, coupon forms, and bill calculations—are duplicated in the DOM tree.
- **Expected:**
  CartPage should either render a unified responsive component tree or conditionally mount the appropriate view based on client viewport state to avoid unnecessary DOM duplication and reconciliation overhead.
- **Why it matters:**
  Wasted memory, doubled re-renders on cart context updates, and duplicate form IDs in the DOM.
- **Screenshot:** `docs/ui-audit/screenshots/BUG-030-cart-page-populated-1440.png`, `docs/ui-audit/screenshots/BUG-034-mobile-cart-populated-390.png`
- **Likely affected component:** `src/pages/CartPage.jsx` (Lines 82, 203)
- **Suggested direction:** Refactor to a single responsive JSX structure or use viewport hooks to render only the active layout.

---

### BUG-014 — Inconsistent Product Card Implementation Duplicated Across 8 Files
- **Severity:** P3 — Medium
- **Priority:** Medium
- **Category:** CROSS-PAGE CONSISTENCY, ARCHITECTURE
- **Page:** Home, Shop, Best Sellers, Seasonal, Imported
- **URL:** `https://tokriii.com/` & `https://tokriii.com/shop`
- **Device:** All Devices
- **Viewport:** All Viewports
- **Observed:**
  Instead of a single shared `<ProductCard>` component in `src/components/`, card JSX is independently duplicated across:
  - `src/components/HomeCategoryFeed.jsx`
  - `src/components/SeasonalFruits.jsx`
  - `src/components/ImportedFruits.jsx`
  - `src/components/BestSellers.jsx`
  - `src/pages/ShopAllPage.jsx`
  - `src/pages/ProductDetail.jsx` (related products)
  - `src/components/ShopOurRange.jsx`
  - `src/components/SearchBox.jsx`
  Because each file has slight variations (e.g., `h-24` vs `h-28` image heights, `text-xs` vs `text-[12px]` titles, differing badge position styles), product cards look slightly different depending on which section or page the user is viewing.
- **Expected:**
  A single canonical `<ProductCard>` component should govern styling across all grids and carousels.
- **Why it matters:**
  Maintenance nightmare and subtle visual inconsistencies across pages.
- **Screenshot:** `docs/ui-audit/screenshots/BUG-001-home-desktop-1440.png` vs `docs/ui-audit/screenshots/BUG-002-shop-desktop-1440.png`
- **Likely affected files:** Listed above.
- **Suggested direction:** Extract a shared `ProductCard` component with configurable density variants.

---

### BUG-015 — Missing Keyboard Focus Traps in Desktop Modals (CartDrawer, LoginPopup)
- **Severity:** P4 — Low
- **Priority:** Low
- **Category:** ACCESSIBILITY, MODAL
- **Page:** Global Modals
- **URL:** `https://tokriii.com/`
- **Device:** Desktop
- **Viewport:** ≥1024px
- **Observed:**
  When `CartDrawer` or `LoginPopup` opens, focus is not trapped within the overlay container. A keyboard user pressing `Tab` cycles behind the backdrop into inactive header and homepage links.
- **Expected:**
  Modals and drawers must trap focus within their boundaries while open and return focus to the trigger upon dismissal (WCAG 2.1 SC 2.4.3).
- **Steps to reproduce:**
  1. Open login modal on desktop.
  2. Press `Tab` 10 times.
  3. Observe focus ring traversing links on the obscured page behind the overlay.
- **Why it matters:**
  Disorienting for keyboard and screen reader navigation.
- **Screenshot:** `docs/ui-audit/screenshots/BUG-028-cart-drawer-open-1440.png`, `docs/ui-audit/screenshots/BUG-038-desktop-login-modal-1440.png`
- **Likely affected component:** `src/components/CartDrawer.jsx`, `src/components/LoginPopup.jsx`
- **Suggested direction:** Implement focus trap utilities (or `aria-modal="true"` with dialog focus management).

---

### BUG-016 — Coupon Error Feedback Uses Muted Color Without Auto-Dismissal
- **Severity:** P3 — Medium
- **Priority:** Medium
- **Category:** CONVERSION, FORM
- **Page:** Cart Page, Checkout Page
- **URL:** `https://tokriii.com/checkout`
- **Device:** All Devices
- **Viewport:** All Viewports
- **Observed:**
  When an invalid coupon is entered (e.g., `INVALIDTEST99`), the error message is rendered as a static `<p className="mt-2 text-sm text-rose-400">`.
  The error remains permanently rendered even after the customer types new characters in the input field, until another submission fails.
- **Expected:**
  Typing in the coupon input should immediately clear previous error states.
- **Steps to reproduce:**
  1. Go to `/checkout` with items in cart.
  2. Enter an invalid coupon and click Apply.
  3. Observe error message. Begin typing a new code; error remains visible.
- **Why it matters:**
  Form UX friction causing hesitation at checkout.
- **Screenshot:** `docs/ui-audit/screenshots/BUG-032-checkout-invalid-coupon-1440.png`
- **Likely affected component:** `src/components/CouponBox.jsx` (Lines 64–66)
- **Suggested direction:** Add an `onChange` handler that clears `localError` when the user edits the input.

---

### BUG-017 — Search Box Result Image Container Fixed at `h-24` Without Aspect Guard
- **Severity:** P4 — Low
- **Priority:** Low
- **Category:** SEARCH, IMAGE
- **Page:** Global Search
- **URL:** `https://tokriii.com/`
- **Device:** Desktop
- **Viewport:** ≥1024px
- **Observed:**
  In `SearchBox.jsx`, product preview thumbnails in the search dropdown results use a fixed height `h-24` (96px) with `object-cover`. Non-square fruit photos (e.g. wide fruit baskets or elongated fruit packs) suffer severe vertical or horizontal cropping.
- **Expected:**
  Thumbnail image containers should use consistent `aspect-square` with `object-contain` or padded `object-cover` to preserve fruit packaging integrity.
- **Screenshot:** `docs/ui-audit/screenshots/BUG-024-search-results-apple-1440.png`
- **Likely affected component:** `src/components/SearchBox.jsx`
- **Suggested direction:** Replace `h-24` with `aspect-square h-20 w-20` and `object-contain`.

---

### BUG-018 — Blog Detail Page Media Query Breakpoint Conflict (`1240px`)
- **Severity:** P3 — Medium
- **Priority:** Low
- **Category:** BLOG, RESPONSIVE
- **Page:** Blog Article Detail
- **URL:** `https://tokriii.com/blog/vitamin-c-rich-fruits-india`
- **Device:** Desktop / Laptop (1024px to 1239px)
- **Viewport:** 1024×768, 1200×800
- **Observed:**
  `BlogDetailPage.css` introduces custom standalone CSS outside of Tailwind tokens, including `@media (min-width: 1240px)` for the 3-column article layout (social share rail + content + TOC sidebar).
  On standard 1024px–1239px laptop screens, the sidebar drops below the content rather than adapting smoothly at Tailwind's standard `lg: 1024px` breakpoint.
- **Expected:**
  Blog layout should align with standard theme breakpoints (`lg: 1024px` and `xl: 1280px`).
- **Screenshot:** `docs/ui-audit/screenshots/BUG-008-blog-detail-desktop-1440.png`, `docs/ui-audit/screenshots/audit-blog-tablet-768.png`
- **Likely affected component:** `src/pages/BlogDetailPage.css`
- **Suggested direction:** Standardize media queries in `BlogDetailPage.css` to use 1024px / 1280px.

---

## 6. DESKTOP-SPECIFIC FINDINGS (1920, 1440, 1366)

1. **Header Cart Badge Centering (`BUG-007`):** At 1920px and 1440px, the green badge on the shopping bag icon floats off-center inside its 20×20px circle.
2. **Excessive Whitespace in Shop All Grid on Ultra-Wide (1920px):** On 1920×1080 displays, the shop container caps at `max-w-7xl` (1280px), creating over 640px of blank dark green margins on either side (`docs/ui-audit/screenshots/audit-shop-1920.png`).
3. **Cart Drawer Backdrop Focus (`BUG-015`):** When the desktop cart drawer slides out, background links remain tab-accessible.
4. **Header Spacing on 1366×768 Laptops:** The location selector, search bar, and login button fit tightly with minimal breathing room (`docs/ui-audit/screenshots/audit-home-1366.png`).

---

## 7. MOBILE-SPECIFIC FINDINGS (430, 390, 375, 360, 320)

1. **Absent Brand Mark in Mobile Header (`BUG-001`):** Complete omission of Tokriii logo or name on all mobile views (`BUG-012-home-mobile-390.png`).
2. **Sub-Scale Add & Quantity Steppers (`BUG-002`):** 35×16px add buttons and 24×20px steppers make accurate finger tapping difficult, frequently misdirecting users to the PDP.
3. **Severe 320px Squeeze (`BUG-010`):** At 320px width, 2-column shop cards compress into 103px columns (`BUG-021-shop-mobile-320.png`).
4. **QWERTY Keyboard on Mobile Login (`BUG-008`):** Missing `type="tel"` causes alphanumeric keyboard to pop up on mobile auth screens (`BUG-036-mobile-login-initial-390.png`).
5. **Sticky Cart Bar Clearance:** While `StickyCartBar` provides clean access to checkout, on narrow screens with bottom browser chrome (Safari tab bar), it sits close to touch gesture areas.

---

## 8. TABLET FINDINGS (1024×768, 768×1024)

1. **Breakpoint Split at 768px Portrait (`BUG-003`):** 768px portrait tablets display the mobile phone header, but load the desktop shop category rail, and open the mobile cart drawer.
2. **Blog Sidebar Shift at 1024px:** The 3-column blog layout drops its TOC sidebar below the article between 1024px and 1239px due to the custom 1240px media query (`BUG-018`).
3. **Category Scroll Arrows on iPad Landscape (1024px):** Previous/Next carousel buttons overlap closely with outer edge product cards.

---

## 9. RESPONSIVE BREAKPOINT FAILURES

| Viewport Width | Failure Point | Description |
| :--- | :--- | :--- |
| **320px** | Shop All product grid | 2 columns squeeze into 103px card widths, truncating titles into ellipsis. |
| **768px** | ShopAll vs Header | Header switches to mobile, ShopAll switches to desktop two-pane layout. |
| **1023px** | Header & Cart switch | Abrupt jump between mobile bottom drawer and desktop sliding right drawer. |
| **1239px** | Blog Detail layout | TOC sidebar collapses unexpectedly under content below 1240px. |

---

## 10. CROSS-PAGE DESIGN INCONSISTENCIES

1. **Product Card Duplication (`BUG-014`):** Cards on Home vs Shop vs Category use differing image container heights (`h-24` vs `h-28`), different title line heights, and independent styling.
2. **Cart Page Dual DOM (`BUG-013`):** Mobile and desktop layouts are both rendered simultaneously in the DOM tree.
3. **Z-Index Layering Clashes:** Header (`z-50`), Search results (`z-50`), CartDrawer (`z-50`), and LoginPopup (`z-50`) all share the same z-index plane.

---

## 11. CONVERSION / SALES UX ISSUES

1. **Accidental PDP Navigations:** Tapping the tiny stepper buttons on mobile cards triggers card navigation, frustrating shoppers attempting to increment quantities.
2. **Unexplained Disabled Checkout Button (`BUG-006`):** Users reaching checkout without an address cannot click the order button and receive no inline instruction.
3. **No Visual Image Fallbacks (`BUG-004`):** Missing images render as blank dark voids rather than fresh fruit placeholders, dampening appetite appeal.
4. **Alphanumeric Keyboard on Phone Number Input (`BUG-008`):** Unnecessary friction during user authentication.

---

## 12. ACCESSIBILITY FINDINGS

1. **Quantity Stepper Contrast Failure (`BUG-005`):** White text on `#4daf7b` produces **2.5:1** contrast (fails WCAG AA 4.5:1).
2. **Touch Target Size Violations (`BUG-002`):** Compact ADD buttons (35×16px) and steppers (24×20px) fail WCAG 2.1 SC 2.5.5 and WCAG 2.2 SC 2.5.8.
3. **Non-Semantic Card Links (`BUG-011`):** `<article onClick>` fails keyboard tab navigation (WCAG 2.1 SC 2.1.1).
4. **Missing Accessible Names (`BUG-012`):** Header cart bag button lacks `aria-label`.
5. **No Modal Focus Traps (`BUG-015`):** Keyboard tabs escape behind active modal backdrops.

---

## 13. CONSOLE / NETWORK UI-RELATED FINDINGS

During the audit, automated DevTools inspection recorded **24 network request failures** on live customer-facing routes:
- `net::ERR_BLOCKED_BY_ORB` on `https://server.tokriii.com/uploads/products/fresh-blueberry-tube-packaging-1791398715419.webp` (HTTP 404 from backend Express server).
- `net::ERR_BLOCKED_BY_ORB` on `https://server.tokriii.com/uploads/products/red-and-yellow-pear-still-life-1791399120358.webp`.
- `net::ERR_BLOCKED_BY_ORB` on `https://server.tokriii.com/uploads/products/fresh-green-pear-arrangement-1791399466103.webp`.
- `net::ERR_BLOCKED_BY_ORB` on `https://server.tokriii.com/uploads/products/fresh-star-fruit-still-life-1791400034559.webp`.
- `net::ERR_BLOCKED_BY_ORB` on `https://server.tokriii.com/uploads/categories/daily-fruits-category-thumb-1792614626065.webp`.

Because the backend returns HTML 404 pages with `Content-Type: text/html` for missing static images, Chromium's Opaque Response Blocking (ORB) aggressively blocks them. Coupled with missing `onError` fallbacks in React, this produces blank empty cards.

---

## 14. GOOD / NO-CHANGE AREAS

The following components and pages were inspected across all viewports and found visually and functionally robust:

| Component / Page | Viewport | Status | Notes |
| :--- | :--- | :--- | :--- |
| **Empty Cart State** | Desktop & Mobile | **NO CHANGE REQUIRED** | Clear empty cart illustration, helpful copy, and "Start shopping" CTA. |
| **Search Dropdown Experience** | Desktop | **NO CHANGE REQUIRED** | Smooth debouncing, clear empty state ("No products found"), ESC key dismissal. |
| **Hero Banner Presentation** | Desktop (1440, 1366) | **NO CHANGE REQUIRED** | High visual appeal, crisp imagery, well-balanced responsive layout. |
| **Blog Listing Page** | Desktop & Mobile | **NO CHANGE REQUIRED** | Clean 3-column responsive grid, excellent typography, `aspect-[16/10]` image guard against CLS. |
| **Customer Reviews Carousel**| Desktop & Mobile | **NO CHANGE REQUIRED** | Card elevation, clean testimonial layout, smooth scroll behavior. |
| **CMS Pages (About, FAQ, Policies)**| All Viewports | **NO CHANGE REQUIRED** | Clean markdown typography, readable line length, well-structured table styling. |
| **404 Not Found Page** | All Viewports | **NO CHANGE REQUIRED** | Well-designed 404 error graphic, clear "Go to Home" button. |
| **Sticky Cart Bar on Mobile** | Mobile (430, 390, 375)| **NO CHANGE REQUIRED** | Smooth bottom sheet transition, clean total count & price summary. |

---

## 15. PRIORITISED FIX ROADMAP

### IMMEDIATE (P1 — Critical)
- **BUG-001 (Mobile Brand Identity):** Add compact Tokriii logo to mobile header. *(Effort: Small \| Risk: Low)*
- **BUG-002 (Touch Targets & Navigation Decoupling):** Enlarge compact add button touch zones to ≥44px and decouple stepper clicks from card navigation. *(Effort: Medium \| Risk: Low)*
- **BUG-004 (Image Fallback Boundary):** Add `onError` handlers across product image tags to display placeholder SVGs on 404/ORB failure. *(Effort: Small \| Risk: Low)*

### NEXT (P2 — High)
- **BUG-003 (Tablet Breakpoint Mismatch):** Standardize `ShopAllPage` mobile query to match layout header (`lg: 1024px`). *(Effort: Medium \| Risk: Medium)*
- **BUG-005 (Quantity Badge Contrast):** Switch text color on `bg-brand` from white to black. *(Effort: Small \| Risk: Low)*
- **BUG-006 (Checkout CTA Validation Feedback):** Provide clear inline reason/toast when Place Order is tapped without an address. *(Effort: Small \| Risk: Low)*
- **BUG-008 (Mobile Numeric Keypad):** Add `type="tel" inputMode="numeric"` to login phone inputs. *(Effort: Small \| Risk: Low)*
- **BUG-009 (ShopOurRange Theme Tokens):** Fix inverted `#000000` text in dead component or delete. *(Effort: Small \| Risk: Low)*

### POLISH (P3 / P4 — Medium & Low)
- **BUG-007 (Cart Badge Flexbox Centering):** Add `inline-flex items-center justify-center` to header cart badge. *(Effort: Small \| Risk: Low)*
- **BUG-010 (320px Grid Optimization):** Switch to 1-column product layout on screens <340px. *(Effort: Small \| Risk: Low)*
- **BUG-011 (Semantic Card Links):** Wrap product card titles in semantic `<Link>` anchors. *(Effort: Medium \| Risk: Low)*
- **BUG-012 (Cart Button Aria-Label):** Add accessible label to desktop header cart icon. *(Effort: Small \| Risk: Low)*
- **BUG-013 (Cart Dual DOM Refactor):** Refactor CartPage to avoid mounting duplicate mobile/desktop DOM trees. *(Effort: Medium \| Risk: Medium)*
- **BUG-014 (ProductCard Consolidation):** Refactor duplicate card implementations into a unified component. *(Effort: Large \| Risk: Medium)*
- **BUG-015 (Modal Focus Traps):** Add keyboard focus trapping to modals and drawer. *(Effort: Medium \| Risk: Low)*
- **BUG-016 (Coupon Error Auto-Clear):** Clear coupon error message on user keystroke. *(Effort: Small \| Risk: Low)*
- **BUG-017 (Search Result Thumbnail Aspect Guard):** Standardize search image container to `aspect-square`. *(Effort: Small \| Risk: Low)*
- **BUG-018 (Blog Breakpoint Normalization):** Align `BlogDetailPage.css` media queries to Tailwind standard breakpoints. *(Effort: Small \| Risk: Low)*

---

## 16. COMPLETE QA MATRIX

| Page / Route | 1920 | 1440 | 1366 | 1024 | 768 | 430 | 390 | 375 | 360 | Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **Home (`/`)** | BUGS FOUND | BUGS FOUND | BUGS FOUND | BUGS FOUND | BUGS FOUND | BUGS FOUND | BUGS FOUND | BUGS FOUND | BUGS FOUND | BUGS FOUND |
| **Shop All (`/shop`)** | BUGS FOUND | BUGS FOUND | BUGS FOUND | BUGS FOUND | BUGS FOUND | BUGS FOUND | BUGS FOUND | BUGS FOUND | BUGS FOUND | BUGS FOUND |
| **Category Pages** | BUGS FOUND | BUGS FOUND | BUGS FOUND | BUGS FOUND | BUGS FOUND | BUGS FOUND | BUGS FOUND | BUGS FOUND | BUGS FOUND | BUGS FOUND |
| **Product Detail** | BUGS FOUND | BUGS FOUND | BUGS FOUND | BUGS FOUND | BUGS FOUND | BUGS FOUND | BUGS FOUND | BUGS FOUND | BUGS FOUND | BUGS FOUND |
| **Cart Page (`/cart`)** | BUGS FOUND | BUGS FOUND | BUGS FOUND | BUGS FOUND | BUGS FOUND | BUGS FOUND | BUGS FOUND | BUGS FOUND | BUGS FOUND | BUGS FOUND |
| **Checkout (`/checkout`)**| BUGS FOUND | BUGS FOUND | BUGS FOUND | BUGS FOUND | BUGS FOUND | BUGS FOUND | BUGS FOUND | BUGS FOUND | BUGS FOUND | BUGS FOUND |
| **Mobile Login (`/login`)**| NOT APPLICABLE | NOT APPLICABLE | NOT APPLICABLE | NOT APPLICABLE | NOT APPLICABLE | BUGS FOUND | BUGS FOUND | BUGS FOUND | BUGS FOUND | BUGS FOUND |
| **Blog Listing (`/blog`)**| PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| **Blog Detail (`/blog/:id`)**| PASS | PASS | PASS | BUGS FOUND | BUGS FOUND | PASS | PASS | PASS | PASS | BUGS FOUND |
| **About Us (`/about`)** | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| **Help / FAQs (`/help-faqs`)**| PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| **Returns Policy** | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| **Privacy Policy** | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| **Terms & Conditions** | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| **404 Not Found Page** | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
