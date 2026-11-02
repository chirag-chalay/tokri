#!/usr/bin/env bash
set -euo pipefail
umask 077
export TOKRIII_STAGING_LOCKED=1
if [[ "${1:-}" == '--github-oidc' && $# == 1 ]]; then
  exec flock --nonblock --no-fork /srv/tokri-staging/state/deploy.lock \
    node /opt/tokri-staging/authenticate.mjs
fi
# sudo's NOSETENV rule prevents the runner from forging SUDO_USER.
if [[ "${SUDO_USER:-}" == 'tokri-runner' ]]; then
  echo 'Runner access requires a signed GitHub workflow request.' >&2
  exit 1
fi
# Authenticated hosting-terminal operations; no permanent GitHub deployment key.
exec flock --nonblock --no-fork /srv/tokri-staging/state/deploy.lock \
  node /opt/tokri-staging/deploy.mjs "$@"
