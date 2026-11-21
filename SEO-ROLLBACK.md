# Tokriii.com — Production Rollback Plan

**Website:** [https://tokriii.com](https://tokriii.com)  
**Dedicated Branch:** `feature/production-seo-optimization`  
**Base Commit / Target:** Clean branch cut from working repository  
**Database Schema Impact:** **0% (Zero database schema changes or migrations executed)**  

---

## 1. Safety & Architecture Overview

All SEO optimizations were implemented strictly within Next.js App Router server components, metadata generators, utility scripts, and layout components on a dedicated Git branch: `feature/production-seo-optimization`.

### Core Safety Guarantees:
- **No Database Migrations:** No database tables, columns, or triggers were altered. Rolling back code immediately returns all functionality to its exact prior state with zero data divergence.
- **Commerce Isolation:** Cart context, checkout endpoints, delivery eligibility calculations, authentication tokens, and payment processing were untouched.
- **Git Stash Preservation:** Any pre-existing in-flight modifications prior to this optimization work are preserved in Git stash:
  ```bash
  stash@{0}: On feature/admin-logs-monitoring: WIP address search before SEO optimization
  ```

---

## 2. Immediate Full Rollback Procedure (Emergency 1-Command)

If any unexpected behavior occurs in staging or production, execute the following steps to immediately revert to the previous release:

### Step 1: Switch to the Previous Branch / Commit
```bash
# In repository root (/home/gaurav/Documents/tokri)
git checkout main
# or git checkout <previous_production_commit_hash>
```

### Step 2: Clear Build Artifacts & Rebuild Next.js
```bash
rm -rf .next
npm run build:next
```

### Step 3: Restart Application Services
If running with Node/systemd/PM2:
```bash
# Example with PM2
pm2 reload tokri-web --update-env

# Or direct service restart
npm run start:next
```

### Step 4: Verify Restoration
```bash
curl -I http://127.0.0.1:3000/
curl -I http://127.0.0.1:3000/shop
curl -I http://127.0.0.1:3000/cart
```

---

## 3. Granular / Component-Specific Rollback Procedures

If only a specific subset of SEO changes needs to be adjusted or reverted while keeping the rest active, follow these targeted procedures:

### A. Reverting Category Permanent Redirects (HTTP 308)
If `/category/:categoryId` needs to revert back to temporary HTTP 307 redirects:
1. Open `src/app/category/[categoryId]/page.next.jsx`.
2. Replace `permanentRedirect` with `redirect`:
   ```javascript
   import { redirect } from 'next/navigation'

   export default async function CategoryRedirectPage({ params }) {
     const { categoryId } = await params
     redirect(`/shop?category=${encodeURIComponent(categoryId)}`)
   }
   ```
3. Rebuild and restart Next.js.

### B. Reverting Structured Data (JSON-LD) Only
If a search engine reports schema formatting issues or if JSON-LD needs to be temporarily deactivated:
1. Homepage schemas: Remove `<script type="application/ld+json">` tags in `src/app/(store)/page.next.jsx`.
2. Product schema: Remove `<script type="application/ld+json">` tag in `src/app/(store)/product/[productId]/page.next.jsx`.
3. Category schema: Remove `<script type="application/ld+json">` tags in `src/app/(store)/shop/page.next.jsx`.
4. FAQ schema: Remove `<script type="application/ld+json">` tag in `src/app/_components/CmsRoute.jsx`.
5. Rebuild Next.js (`npm run build:next`).

### C. Reverting XML Sitemap Changes
If the sitemap generator needs to be reverted to the prior simplified output:
1. Revert `src/app/sitemap.xml/route.next.js`:
   ```bash
   git checkout origin/main -- src/app/sitemap.xml/route.next.js
   ```
2. Rebuild Next.js (`npm run build:next`).

### D. Restoring Stashed Address Search Work (If Switching Back to Feature Branch)
When switching back to `feature/admin-logs-monitoring`:
```bash
git checkout feature/admin-logs-monitoring
git stash pop stash@{0}
```

---

## 4. Post-Rollback Verification Checklist

After executing a full or partial rollback, verify that the application operates cleanly:

- [ ] Homepage loads with HTTP 200: `curl -I https://tokriii.com/`
- [ ] Catalog shop page loads: `curl -I https://tokriii.com/shop`
- [ ] Category filtering works without errors: `https://tokriii.com/shop?category=exotic`
- [ ] Product detail page loads with accurate price and weight.
- [ ] Add-to-cart functionality works as expected.
- [ ] Checkout page loads and address selection functions properly.
- [ ] Express API server health check returns 200: `curl http://127.0.0.1:5223/api/v1/health`
- [ ] Google Search Console: If sitemap URLs changed during rollback, resubmit `https://tokriii.com/sitemap.xml` to avoid indexing delays.
