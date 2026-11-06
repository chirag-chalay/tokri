# Chirag laptop handoff — customer app (`chirag-app`)

Use this on the other laptop. You do not need extra explanation for GitHub merge safety or project layout.

---

## What you are working on

| Item | Detail |
|------|--------|
| Branch | `chirag-app` (from `main`) |
| App folder | `tokri-mobile-go/` (customer Expo app) |
| Partner app | `tokri-partner-go/` — **not** part of this WIP; leave alone |
| API the app uses | `/api/v1` (do not break installed store apps) |
| Staging website | `server.tokriii.com` |
| Live website | `tokriii.com` |

**Already on this branch (incomplete / polish WIP):** splash & icons, website-style coupons, cart line totals × qty, address name/phone prefill + field errors, collapsing home header, oval search.

Finish the app work on `chirag-app`, then create a build. Merge only when you are happy.

---

## On the other laptop — get latest code

Project is already cloned; it just has old code. From the repo root:

```bash
cd /path/to/tokri   # your laptop clone path

git fetch origin
git checkout chirag-app
git pull origin chirag-app
```

If `chirag-app` does not exist locally yet:

```bash
git fetch origin
git checkout -b chirag-app origin/chirag-app
```

Then install app deps (only if `package-lock` / node_modules feel stale):

```bash
cd tokri-mobile-go
npm install
npm start
```

**Remote:** GitHub may show `JayTyagi01/tokri` or `chirag-chalay/tokri` — same repo after move. Use whatever `git remote -v` already shows if push/pull works.

---

## Daily save while working (do this often)

Stay on `chirag-app`. Do **not** merge to `staging` or `main` until the app work is done.

```bash
git status
git add tokri-mobile-go   # or specific files you changed
git commit -m "Describe why you changed something"
git push origin chirag-app
```

If the laptop has unrelated local edits you do not want, stash or discard them before switching branches.

---

## Branch safety (read once)

1. **`chirag-app`** = your WIP. Safe to push unfinished work here.
2. **`staging`** = shared test server branch. Merge only when app work is ready to test with staging.
3. **`main`** = live. Merge only after staging looks good. Live tracks `main`.
4. **Order when finished:** `chirag-app` → `staging` → (test) → `main`.  
   Never merge unfinished app work straight into `main`.
5. **Do not force-push** `main` or `staging`.
6. **Do not commit** `.env`, secrets, or server-only files.
7. **App compatibility:** phone app uses `/api/v1`. Adding fields is OK. Do not remove/rename/change types of fields the live store app already uses. Prefer additive API changes. Keep at most `v1` + `v2` if a real break is required.
8. **Compare installs** by Android `versionCode` and iOS build number, not version name text like `1.0.3`.
9. Partner experiments in `tokri-partner-go/` stay local unless you explicitly decide to ship them.

### Merge when work is complete (not before)

```bash
# 1) Update your branch
git checkout chirag-app
git pull origin chirag-app

# 2) Merge into staging
git fetch origin
git checkout staging
git pull origin staging
git merge chirag-app
# fix conflicts if any, then:
git push origin staging
# deploy/test on staging as you normally do

# 3) After staging is good → main
git checkout main
git pull origin main
git merge staging   # or merge chirag-app if that is the agreed path
git push origin main
```

If unsure about live deploy after `main`, stop and use the usual staging/live host process (Next rebuild needs `TOKRIII_API_PROXY_TARGET` baked at build time). App APK builds do not replace that.

---

## Run / build the customer app

Folder: `tokri-mobile-go/`

```bash
cd tokri-mobile-go
npm install
npm start                 # Expo Go / tunnel
# or
npm run start:lan
```

### EAS Android build (from the laptop, not the live VPS)

Profiles in `eas.json`:

| Profile | API | Notes |
|---------|-----|--------|
| `staging` | `https://server.tokriii.com/api/v1` | Internal APK — good for testing |
| `preview` | `https://tokriii.com/api/v1` | Internal, live API |
| `production` | `https://tokriii.com/api/v1` | Store / production |

Typical test APK:

```bash
npm install -g eas-cli
eas login
cd tokri-mobile-go
eas build -p android --profile staging
```

Live API internal build:

```bash
eas build -p android --profile preview
```

Bump Android `versionCode` / iOS build number before a store submit (not only the version name).

---

## What not to pull onto this branch by accident

- Do not `git pull origin staging` into `chirag-app` unless you intend to bring website/server staging commits into your app branch.
- An older local **stash** on the first machine (`local mobile partner WIP`) is an unfinished Expo 58 + partner EAS experiment. **Not required** for this UX work. Ignore unless you deliberately want that upgrade.

---

## Quick checklist before you leave the first machine

- [x] Branch `chirag-app` exists on GitHub  
- [x] Current WIP committed and pushed  
- [ ] On new laptop: `git fetch` + checkout `chirag-app` + `git pull`  
- [ ] Finish app → push `chirag-app` → merge to `staging` → test → then `main`  
- [ ] Build APK with EAS when ready (`staging` profile for staging API)

---

## One-line reminder

**Work and push on `chirag-app` → merge to `staging` when done → merge to `main` only after staging is OK.**
