# Protected automatic staging deployment

Status: **prepared, not installed or enabled on the VPS**. Do not interpret a Git push, a skipped job, or a local test as a deployment. Success requires the public staging SHA marker, healthy staging PM2 processes, and browser verification to pass.

This change adds deployment infrastructure only. Application baseline: `6533795be32449b06c857122b0bfd4d4191f391f`. The first CI configuration commit will have a newer SHA containing that baseline; all deployment candidates must be its descendants and match the latest `origin/staging`. No application features are reimplemented. Nothing targets `main` or `tokriii.com`.

## Inspection findings

- Existing Vercel GitHub deployments target `*.vercel.app` URLs. No evidence currently connects them to the VPS serving `server.tokriii.com`; they are left untouched.
- Repository environments visible with the current login are `Preview` and `Production`; the protected staging environments below do not yet exist.
- Inspecting repository runners returned HTTP 403; inspecting webhooks requires missing administrator/hook permissions. An installed runner or hosting Git hook cannot be assumed.
- Existing SSH key attempts for the previously supplied accounts were rejected. No authorized hosting terminal is connected. Server paths, actual ports, process ownership and database isolation remain unverified.

If the hosting panel already has a GitHub deployment integration, inspect it first through its authenticated UI: repository must be `chirag-chalay/tokri`, branch `staging`, deployment directory staging-only, production excluded. Reuse it only if it can enforce the same backup, approval, migration, release verification and rollback requirements. Do not enable two deployment mechanisms concurrently.

## Security boundary

This repository is public. GitHub warns that environments do **not** isolate self-hosted runners from untrusted workflow code. Use a dedicated staging machine/account with **no production filesystem, PM2, database or SSH access**. Do not install this runner as root, the production account, or on a machine where it can read production credentials. Prefer an isolated staging VPS and an organization runner group restricted to this workflow. If the hosting arrangement cannot meet this isolation, stop and provision an isolated staging target or use a private deployment-controller integration before enabling the runner.

On the GitHub repository, require approval for **all outside collaborators' workflows**, protect `staging` against direct unreviewed pushes/force pushes, require review of `.github/workflows/**` and `ops/staging/**`, and never approve a fork workflow that targets the staging runner. This workflow has **only a staging push trigger**, no PR or `pull_request_target` trigger, and an upstream-repository guard. A runner label is scheduling, not an authentication boundary. An organization runner group, when available, should allow only `chirag-chalay/tokri/.github/workflows/staging-deploy.yml@refs/heads/staging`.

The runner runs as **tokri-runner**, separately from the **tokri-staging** deployment account. It cannot read staging environments, database credentials, PM2 state, browser cookies or smoke-admin credentials. Its only sudo grant invokes the root-owned broker with a GitHub-signed OIDC token over stdin. The broker verifies signature against fixed GitHub JWKS, issuer, audience, immutable repository/owner IDs, workflow path/SHA, branch, push event, environment, expiry and one-use token ID. It independently checks the signed check-run ID against GitHub to bind the request to the exact active preflight/deploy/migration job, and rechecks before DDL or cutover; a preflight token cannot authorize deployment. Outbound HTTPS to GitHub API/OIDC endpoints is required; API failure or rate limiting blocks deployment safely. Caller-supplied environment variables cannot authorize deployment. This supports the current public, personal-account repository without relying on organization-only runner groups.

The root-owned controller and root-owned configuration reject production paths/process names, wrong Git events/SHAs, missing environment approvals, production DB identity, global/cross-schema grants, partial migrations, unsafe payment/messaging settings and unknown process directories. The unprivileged staging account can modify only staging resources. The controller is installed separately from release code; future controller updates require a reviewed one-time installation, not an automatic overwrite from a push.

## One-time setup in the hosting panel's authenticated terminal

This needs an authorized hosting administrator **once**, plus a GitHub repository administrator to register a runner and configure protections. No SSH password or private key is stored in GitHub. Commands below are for Linux x64 with Node 22, PM2, MySQL 8 clients, `git`, `tar`, `gzip`, `flock`, `rsync`, and Chrome/Chromium. Install these through the hosting provider's supported method before continuing. Keep the current staging service running during inspection and backup. Do not execute placeholder values.

### 1. Read-only inventory and independent database evidence

In the authenticated terminal, collect these into a private directory:

```sh
umask 077
AUDIT_DIR=$(mktemp -d /root/tokri-staging-preflight.XXXXXXXX)
hostname -f > "$AUDIT_DIR/hostname.txt"
ss -ltnp > "$AUDIT_DIR/ports.txt"
nginx -T > "$AUDIT_DIR/nginx.txt" 2>&1
systemctl list-units 'pm2*' > "$AUDIT_DIR/process-managers.txt"
```

Identify the actual staging checkout, staging process owner/PM2_HOME, API/Next ports, vhost and upload paths. As the **existing staging process owner**, capture `git status --short`, `git rev-parse HEAD`, `git remote -v` and `pm2 jlist` into that private audit directory. PM2 JSON contains environment secrets: never paste it into GitHub or chat. Record environment file paths without printing values. Inspect any provider Git hook or authenticated deployment integration now.

Using each environment's already-authorized database console, run **read-only**:

```sql
SELECT DATABASE(), @@server_uuid, CURRENT_USER();
SHOW GRANTS;
```

Obtain production's server UUID/database name from an independently verified provider inventory or production administrator; do not give production credentials to the staging account. Staging may share a MySQL server only if its schema is different and its account has privileges **only** on the staging schema. No global privileges other than USAGE and no roles/cross-schema grants are accepted. If staging currently uses production's database/account, **stop**; an administrator must provision an isolated staging database/account and an approved sanitized staging dataset first.

Verify the existing staging `Setting` has online payment disabled or only `rzp_test_` credentials and both MSG91 and WhatsApp messaging disabled. Do not copy production payment/OTP credentials. Any required safety-setting changes are separately authorized database writes: take an administrator backup first. Do not reseed.

Before changing any services, take provider snapshots plus a private database dump and archive of the actual working checkout (including uncommitted files), `.next`, dependencies, environment files, uploads, Nginx vhost and process configuration. Test the archive integrity. Keep these original paths intact. Test database restoration on an isolated disposable MySQL instance with event scheduling/network access disabled; never test restoration against either live schema.

### 2. Prepare a staging-only release layout

Replace the variables below with **verified staging-only** paths from step 1. The dedicated user must have no production permissions or sudo rights. If that user already exists, inspect it before reusing it.

```sh
# Hosting administrator: create an unprivileged staging-only account if needed.
useradd --create-home --shell /bin/bash tokri-staging
useradd --create-home --home-dir /var/lib/tokri-runner --shell /bin/bash tokri-runner
install -d -o tokri-staging -g tokri-staging -m 700 \
  /srv/tokri-staging/{releases,shared,state,backups,repository.git}
install -d -o tokri-staging -g tokri-staging -m 700 \
  /srv/tokri-staging/shared/{uploads,pm2}

EXISTING_STAGE_CHECKOUT=/REPLACE_WITH_VERIFIED_STAGING_CHECKOUT
EXISTING_STAGE_ENV=/REPLACE_WITH_VERIFIED_STAGING_ENV_FILE
EXISTING_STAGE_UPLOADS=/REPLACE_WITH_VERIFIED_STAGING_UPLOAD_DIRECTORY
BASELINE_SHA=$(git -C "$EXISTING_STAGE_CHECKOUT" rev-parse HEAD)

install -d -o tokri-staging -g tokri-staging -m 700 "/srv/tokri-staging/releases/$BASELINE_SHA"
# Copy rather than move: preserve the original working release and local changes.
rsync -a --exclude='.git' --exclude='server/.env' --exclude='server/uploads' \
  "$EXISTING_STAGE_CHECKOUT/" "/srv/tokri-staging/releases/$BASELINE_SHA/"
install -o tokri-staging -g tokri-staging -m 600 "$EXISTING_STAGE_ENV" /srv/tokri-staging/shared/server.env
rsync -a "$EXISTING_STAGE_UPLOADS/" /srv/tokri-staging/shared/uploads/
chown -R tokri-staging:tokri-staging "/srv/tokri-staging/releases/$BASELINE_SHA" /srv/tokri-staging/shared/uploads
ln -s /srv/tokri-staging/shared/server.env "/srv/tokri-staging/releases/$BASELINE_SHA/server/.env"
ln -s /srv/tokri-staging/shared/uploads "/srv/tokri-staging/releases/$BASELINE_SHA/server/uploads"
ln -s "/srv/tokri-staging/releases/$BASELINE_SHA" /srv/tokri-staging/current
sudo -u tokri-staging git init --bare /srv/tokri-staging/repository.git
sudo -u tokri-staging git --git-dir=/srv/tokri-staging/repository.git remote add origin https://github.com/chirag-chalay/tokri.git
```

The current release needs a working Next `.next` build and installed Node dependencies. If the server topology is different, adapt the one-time baseline adoption with its administrator; do not invent ports or overwrite its working release.

### 3. Install the reviewed controller and configuration

Clone the CI configuration branch to a **separate** administrator-owned directory, review it, and install the following files. After merging the reviewed CI configuration into staging, the controller's baseline check still enforces application commit `6533795...`.

```sh
REVIEWED_CI_CHECKOUT=/REPLACE_WITH_REVIEWED_CI_CHECKOUT
install -d -o root -g root -m 755 /opt/tokri-staging
for name in deploy.mjs policy.mjs verify-public.mjs oidc.mjs authenticate.mjs request-deploy.mjs run.sh; do
  install -o root -g root -m 755 "$REVIEWED_CI_CHECKOUT/ops/staging/$name" "/opt/tokri-staging/$name"
done
install -o root -g root -m 644 \
  "$REVIEWED_CI_CHECKOUT/server/prisma/migrations/20261102000000_automatic_discounts/migration.sql" \
  /opt/tokri-staging/discount-migration.sql
install -o root -g tokri-staging -m 640 \
  "$REVIEWED_CI_CHECKOUT/ops/staging/config.example.json" /etc/tokri-staging.json
```

Edit `/etc/tokri-staging.json` through the authenticated terminal. Fill actual staging ports, the verified staging/prod UUID+schema evidence, existing generated Prisma Client path, Chrome executable path, and the staging-only process names. Keep the exact staging root and dedicated PM2_HOME. The controller rejects unchanged DB placeholders. `probeClientModule` must reference the preserved original staging client's absolute module path, not production credentials; it supplies the MySQL driver before any new application code runs.

Grant the runner **only** the signed-request entry point. Install this through `visudo -f /etc/sudoers.d/tokri-staging-runner`, owned by root with mode 440; then validate with `visudo -cf /etc/sudoers.d/tokri-staging-runner`:

```sudoers
tokri-runner ALL=(tokri-staging) NOPASSWD: NOSETENV: /opt/tokri-staging/run.sh --github-oidc
```

Do not grant the runner shell, Node, PM2, file-copy, environment-setting or unrestricted sudo commands as the deployment user. Keep `/srv/tokri-staging` and its shared directories private to `tokri-staging`. Unapproved jobs cannot substitute a fake `GITHUB_REF`; authorization requires the signed exact staging workflow/environment/commit token. No SSH key or reusable deployment token is needed.

The two controller-managed services are `tokri-staging-api` and `tokri-staging-next` (or distinct names starting `tokri-staging-`). They run only in `/srv/tokri-staging/shared/pm2`. Back up and stop **only the old staging PM2 services**, using the actual names/owner found in step 1, immediately before the baseline cutover. Never use `pm2 restart all`, `pm2 delete all` or production's PM2_HOME.

```sh
# After the approved staging-only cutover, run as the dedicated account:
sudo -iu tokri-staging /opt/tokri-staging/run.sh bootstrap
```

Bootstrap rechecks isolation/safety, backs up the baseline, writes a public release marker in the **copied baseline only**, starts the two staging services, and verifies their public marker/health. Preserve production's existing routes and processes. If it fails, restore the prior staging vhost/process configuration from the initial backup before enabling CI/CD.

Review the actual `server.tokriii.com` Nginx vhost so `/` and the public release marker reach the staging Express/Next pair, `/api/` and backoffice reach the staging API, and `/uploads/` reaches the **staging shared uploads**. Its existing TLS/caching/security settings should be retained. Include `X-Robots-Tag: noindex, nofollow` on staging. If a vhost edit is necessary, back up that vhost, run `nginx -t`, then reload Nginx after confirming production's vhost is unchanged. The controller never edits/reloads Nginx.

### 4. Register the dedicated GitHub runner

A repository owner uses **Settings → Actions → Runners → New self-hosted runner → Linux x64**. Follow GitHub's current generated download and checksum-verification commands in `/var/lib/tokri-runner` as `tokri-runner`. Do not paste the short-lived registration token into the repo, logs or this document. Use the generated token once:

```sh
# Run as tokri-runner in /var/lib/tokri-runner, after verified download.
read -rsp 'One-time runner registration token: ' RUNNER_REGISTRATION_TOKEN; echo
./config.sh --url https://github.com/chirag-chalay/tokri \
  --token "$RUNNER_REGISTRATION_TOKEN" --name tokriii-staging \
  --labels tokriii-staging --unattended --work _work
unset RUNNER_REGISTRATION_TOKEN
# Hosting administrator installs its service, then return to the dedicated account.
# From the runner directory, as administrator:
./svc.sh install tokri-runner
./svc.sh start
```

Keep GitHub's runner auto-updates enabled. Confirm its label is online before enabling deployments. Set up the dedicated staging PM2 daemon to start on reboot using the **dedicated user and PM2_HOME**, without altering production's daemon. The hosting administrator can install the exact PM2 startup service command for that user once; `pm2 save` is restricted to the dedicated staging daemon.

### 5. Configure repository protection once

A **repository administrator** configures:

1. Protect `staging`, require reviewed changes and review of workflow/controller edits, disallow force pushes. Restrict write access to trusted release maintainers. Set Actions approval for all outside collaborators.
2. Create environments **`staging`** and **`staging-discount-migration`**. Both require a trusted reviewer, prevent self-review, disallow administrator bypass, and allow only the exact `staging` branch (selected branches, no tags/wildcards). A second trusted person is needed to approve the initiating owner's deployment. The policy job independently reads reviewers/branch restrictions. GitHub's REST response omits its UI-only bypass checkbox, so the owner must verify that checkbox and attest it with `STAGING_ADMIN_BYPASS_DISABLED=true`.
3. Create a **staging-only** smoke-test administrator through the existing staging backoffice with permission to view Settings; use a unique strong password. Do not use production credentials or the public development default. Through the authenticated terminal, create `/srv/tokri-staging/shared/smoke-admin.env`, owned by `tokri-staging` with mode **600**, containing `STAGING_SMOKE_ADMIN_EMAIL` and `STAGING_SMOKE_ADMIN_PASSWORD`. Edit values privately; never put them in GitHub, a command argument, Actions logs or this document. The runner account cannot read this file. GitHub uses short-lived OIDC, not SSH credentials or a reusable deployment secret.
4. Leave `STAGING_ALLOW_DISCOUNT_MIGRATION=false`. Only when the exact SQL/checksum and independent isolation/backups have been reviewed, set it `true` for the first pending migration. Its separate protected environment still requires approval. Once complete, return it to `false`. New or partial migrations never run from routine deploys.
5. Set repository variable `STAGING_CICD_ENABLED=true` **last**, after the isolation, baseline, credentials, runner, environment rules and rollback plan are verified.

The workflow is intentionally not `workflow_dispatch`-only: GitHub requires manual-dispatch workflows to be present on the default branch, while `main` is out of scope. A reviewed push/merge to staging triggers it; subsequent deployment and migration work pauses for environment approval. A failed/blocked run can be rerun from Actions with the same SHA, without inventing an application change. Do not move the default branch or change `main` to make a Run Workflow button appear.

## What a deployment does

1. Hosted job runs guard tests and verifies environment protections. Disabled setup prints an explicit **no deployment attempted** status.
2. After environment approval, the unprivileged runner requests a fresh GitHub OIDC token and passes it to the broker over stdin. The broker rejects forged, expired, replayed, wrong-repository, wrong-workflow, wrong-branch, wrong-SHA or wrong-environment requests. Approved staging preflight validates the immutable configuration, dedicated process paths, current staging SHA, required baseline, disk space, staging DB identity/grants and payment/messaging safety. It reads schema state.
3. Missing discount schema blocks the run unless the administrator explicitly enabled the one-time request. The separate migration approval job validates a fixed SQL checksum, creates/verifies backups, rechecks isolation, runs only this additive SQL, confirms defaults OFF and records a receipt. Existing complete schema skips SQL; partial state stops for manual repair. No reset, db push, seed or generic migrate deploy is invoked.
4. Deploy backs up the **current** database, release/dependencies/build, environment, uploads and PM2 state. Dump/archive integrity is checked. An OS `flock` prevents concurrent/manual overlap.
5. A separate release is extracted by exact SHA, dependencies installed, Prisma generated, schema drift checked read-only, Next built with staging API origins, and AdminJS regenerated. Shared environment/uploads remain outside releases.
6. Only after successful build, latest-branch recheck and fresh isolation check does it atomically switch `current` and restart only the two staging services.
7. It verifies public release identity, health, PM2 paths, noindex/nofollow, logo bytes, transparent favicon, real banners, cart/checkout quote consistency, Play Store link, schedule-aware Diwali decorations/gap/mobile layout and AdminJS discount visibility. No orders, payments or OTPs are created. External analytics/payment/messaging requests fail verification. New discount configuration is checked OFF and never enabled by automation.
8. Failure after switch restores the old pointer/services and verifies the previous public SHA. Failed rollback is reported as an incident. Successful verification writes a receipt and screenshots under `/srv/tokri-staging/state/verification/<SHA>/`. Their paths are retained on staging; no secret environment or PM2 dump is uploaded to public Actions artifacts.

Public proof: `https://server.tokriii.com/__tokri_staging_release.json` must match the approved run SHA. The controller emits `PUBLIC STAGING VERIFIED` only after this and the browser checks succeed. This marker identifies the actual deployed descendant commit, not merely the baseline code in GitHub.

## Rollback and incident handling

Backups: `/srv/tokri-staging/backups/<timestamp>-<SHA>/` (private). Immutable release directories and shared uploads are retained. Receipts include the previous release and backup location. Failed builds are preserved under `state/failed-releases/`; a retry rebuilds safely without a new application commit.

Authenticated hosting-terminal rollback:

```sh
sudo -iu tokri-staging /opt/tokri-staging/run.sh rollback
```

It takes a fresh backup, uses the last deployment/in-progress receipt and restarts/verifies only staging. No automatic database restore or downgrade occurs; the migration is additive and compatible with the older application. Any database restoration needs a separate isolation check, backup and administrator-approved restoration procedure. If the workflow is forcibly terminated during cutover, inspect `state/in-progress.json` and public health, then use this terminal rollback command; the OS lock releases automatically after the terminated process exits. Never kill an unknown production process to clear a lock.

Before unattended use, perform the first approved deployment, verify its public screenshot/report, run a staging-only rollback drill to the preserved baseline, verify its public SHA/health, then rerun the same approved latest workflow to restore the new release. This proves the **actual server** rollback path. The local test suite proves controller rollback control flow but does not replace this one-time server drill. Monitor disk usage and retain at least the current and previous working release plus verified backups; this controller does not delete release history or uploads automatically.

## Evidence and limitations

Local validation: **17/17 deployment guard, signed OIDC/replay and filesystem rollback tests passed**, `actionlint` workflow validation passed, all deployment JavaScript passed `node --check`, and the launcher passed `bash -n`. Database identity/grant tests, partial-schema handling, configuration restrictions, exact PM2 scope, migration checksum and filesystem rollback tests run without a database write. Workflow syntax is linted separately. Actual runner registration, protections, backup restoration/drill and public staging verification remain **pending** until an authorized hosting/repository administrator completes the one-time setup. No server deployment or production modification is claimed.

References: [GitHub OIDC claims](https://docs.github.com/en/actions/reference/security/oidc), [GitHub environments](https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments), [self-hosted runner security](https://docs.github.com/en/actions/reference/security/secure-use), [workflow events/default-branch restrictions](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows), [runner workflow restrictions](https://docs.github.com/en/actions/how-tos/manage-runners/self-hosted-runners/manage-access).
