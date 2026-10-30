# Tokriii Next.js — Staging Preflight & Infrastructure Checklist

This document provides a comprehensive, read-only infrastructure checklist for an authorized server administrator before any staging deployment is attempted.

> [!WARNING]
> No deployment is authorized at this stage. Do not execute process starts or Nginx reloads on staging until this checklist is formally reviewed and signed off.

---

## 1. Staging Database & Production Isolation

| Verification Item | Target Staging State | How to Verify | Verified? |
| --- | --- | --- | :---: |
| Database Instance | Dedicated staging MySQL database (e.g. `tokri_staging`) | Inspect staging `.env`: verify `DATABASE_URL` points to an isolated DB name, NOT `tokri_production` or `tokri_live` | [ ] Pending |
| Database User Privileges | Staging user has zero permissions on production databases | Check MySQL grants: `SHOW GRANTS FOR 'tokri_staging_user'@'...';` | [ ] Pending |
| Data Sanitization | No production customer PII or real payment data in staging | Restored staging snapshot must have sanitized customer emails/phones | [ ] Pending |

---

## 2. Process Arrangement & PM2 Architecture

| Verification Item | Target Staging State | How to Verify | Verified? |
| --- | --- | --- | :---: |
| Process Supervisor | PM2 or Systemd managing Node.js processes | `pm2 list` on staging host | [ ] Pending |
| Next.js Process Name | e.g. `tokri-storefront-nextjs` | Defined in PM2 ecosystem file | [ ] Pending |
| Memory Limits | `--max-memory-restart 512M` | Ensure memory limit is configured to prevent memory leaks | [ ] Pending |
| Autostart on Reboot | `pm2 save` executed after service registration | Inspect `systemctl status pm2-root` or equivalent | [ ] Pending |

---

## 3. TCP Port Allocation & Internal Routing

| Verification Item | Target Staging State | How to Verify | Verified? |
| --- | --- | --- | :---: |
| Next.js Port | Available internal port (e.g. `3001` or `3000`) | `ss -tlpn \| grep -E '3000\|3001'` (confirm port is unoccupied) | [ ] Pending |
| Express API Port | Existing staging backend port (e.g. `5223` or `5000`) | Verify Express is healthy: `curl -I http://127.0.0.1:<backend-port>/api/v1/store` | [ ] Pending |
| Binding Host | Strictly `127.0.0.1` (localhost only; not exposed directly to the internet) | `next start --hostname 127.0.0.1 --port <port>` | [ ] Pending |

---

## 4. Nginx Reverse Proxy Configuration

Staging Nginx configuration (`/etc/nginx/sites-available/server.tokriii.com` or `staging.tokriii.com`) must cleanly separate storefront traffic, backend API endpoints, and static uploads:

```nginx
# 1. Next.js Storefront (Catch-all)
location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}

# 2. Static Uploads (Direct file serving with caching)
location /uploads/ {
    alias /path/to/staging/uploads/;
    expires 7d;
    add_header Cache-Control "public, max-age=604800, immutable";
    try_files $uri =404;
}

# 3. Direct API Passthrough (Optional if Next.js internal rewrites are used)
location /api/ {
    proxy_pass http://127.0.0.1:5223;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

---

## 5. Environment Variables Configuration

The following environment variables must be configured in the staging environment (via PM2 ecosystem file or `.env.production`):

| Variable Name | Staging Value | Purpose |
| --- | --- | --- |
| `NODE_ENV` | `production` | Enables optimized production build mode |
| `TOKRIII_SERVER_API_ORIGIN` | `http://127.0.0.1:<staging-api-port>` | Origin used by Server Components for SSR fetches |
| `TOKRIII_API_PROXY_TARGET` | `http://127.0.0.1:<staging-api-port>` | Target for client-side API rewrites (`/api/*`, `/uploads/*`) |
| `TOKRIII_INDEXING_ENABLED` | `false` (or omit) | **MANDATORY:** Guarantees `noindex, nofollow` on staging |
| `TOKRIII_GA_MEASUREMENT_ID` | `""` (empty string) | Disables production analytics on staging |

---

## 6. Static Media & Web Font Deployment

| Verification Item | Target Staging State | How to Verify | Verified? |
| --- | --- | --- | :---: |
| Allowlisted Public Uploads | 92 files from [`public-media-allowlist.txt`](./public-media-allowlist.txt) placed in staging `/uploads/` | `find /path/to/staging/uploads -type f \| wc -l` (>= 92 files) | [ ] Pending |
| Quarantined Records Excluded | Reviews and superseded media records are NOT transferred | Verify no `uploads/reviews/` or customer media in staging | [ ] Pending |
| Web Fonts | `Plus Jakarta Sans` WOFF2 files placed in `public/fonts/` | `curl -I http://<staging-host>/fonts/plus-jakarta-sans-latin-400-normal.woff2` returns 200 | [ ] Pending |

---

## 7. Search Engine Protection (Noindex Directives)

To prevent staging from appearing in Google search results or diluting production SEO equity:

| Directive | Expected Response on Staging | How to Verify |
| --- | --- | --- |
| HTTP Header | `X-Robots-Tag: noindex, nofollow` | `curl -I https://server.tokriii.com/` |
| HTML Meta Tag | `<meta name="robots" content="noindex, nofollow" />` | `curl -s https://server.tokriii.com/ \| grep 'name="robots"'` |
| Robots File | `User-agent: *\nDisallow: /` | `curl -s https://server.tokriii.com/robots.txt` |

---

## 8. Third-Party Gateway Isolation

| Gateway | Staging Isolation Requirement | How to Verify | Verified? |
| --- | --- | --- | :---: |
| **Razorpay** | Test mode key only (`rzp_test_...`); never use `rzp_live_...` | Inspect staging database `Setting.razorpayKeyId` | [ ] Pending |
| **MSG91 (SMS / OTP)** | Sandbox mode or test phone whitelist only; no real customer OTPs | Inspect staging database `Setting.msg91Enabled` | [ ] Pending |
| **WhatsApp Notifications** | Disabled or mapped to designated testing numbers only | Inspect staging database `Setting.msg91WhatsappEnabled` | [ ] Pending |

---

## 9. Staging Health Check Script

Before presenting staging to stakeholders, run the following verification checks:

```bash
# 1. Check Storefront Home SSR
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3000/
# Expected: 200

# 2. Check Product Detail SSR
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3000/product/blueberry-tube
# Expected: 200

# 3. Check Robots Directive
curl -s http://127.0.0.1:3000/robots.txt
# Expected: Disallow: /

# 4. Check Sitemap Generation
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3000/sitemap.xml
# Expected: 200

# 5. Check Upload Media Accessibility
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3000/uploads/categories/fresh-fruits-1788212012820.webp
# Expected: 200
```

---

## 10. Step-by-Step Staging Rollback Procedure

In the event of an unexpected regression, server error, or stakeholder request to revert staging:

1. **Switch Nginx Upstream:**
   Edit the Nginx staging site configuration to point `location /` back to the existing Vite build directory:
   ```nginx
   location / {
       root /path/to/tokri-staging/dist;
       try_files $uri $uri/ /index.html;
   }
   ```
2. **Reload Nginx:**
   ```bash
   sudo nginx -t && sudo nginx -s reload
   ```
3. **Stop Next.js Process:**
   ```bash
   pm2 stop tokri-storefront-nextjs
   ```
4. **Verification:**
   Confirm `curl -I https://server.tokriii.com/` returns the original Vite client application.
