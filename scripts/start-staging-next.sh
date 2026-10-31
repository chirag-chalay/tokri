#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
export NODE_ENV=production
export TOKRIII_SERVER_API_ORIGIN="${TOKRIII_SERVER_API_ORIGIN:-http://127.0.0.1:3020}"
export TOKRIII_API_PROXY_TARGET="${TOKRIII_API_PROXY_TARGET:-http://127.0.0.1:3020}"
export TOKRIII_INDEXING_ENABLED="${TOKRIII_INDEXING_ENABLED:-false}"
exec ./node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3000
