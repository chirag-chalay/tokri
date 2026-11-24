#!/usr/bin/env bash
# Free local Vite (5222) and API (5223) ports. Run as root or with sudo once.
set -euo pipefail

echo "Stopping processes on 5222 / 5223 and related npm/vite/server watchers..."

for port in 5222 5223; do
  if command -v fuser >/dev/null 2>&1; then
    fuser -k "${port}/tcp" 2>/dev/null || true
  fi
done

# Stopped (Ctrl+Z) and live root/chirag watchers
pkill -9 -f 'node_modules/.bin/vite' 2>/dev/null || true
pkill -9 -f 'node --watch src/server.js' 2>/dev/null || true
pkill -9 -f '/bin/node src/server.js' 2>/dev/null || true
pkill -9 -f '/usr/local/bin/node src/server.js' 2>/dev/null || true
# Known stuck PIDs from recent sessions (ignore if gone)
kill -9 5217 5228 5229 5499 5510 5511 14440 14451 14452 14458 2>/dev/null || true

sleep 1
echo "--- remaining listeners ---"
ss -ltnp | grep -E ':(5222|5223)\b' || echo "ports 5222 and 5223 are free"
echo "--- remaining related procs ---"
ps -eo pid,user,stat,cmd | grep -E 'vite|server\.js|npm run dev' | grep -v grep || echo "none"
echo
echo "Next (as chirag, NOT root):"
echo "  cd /var/www/html/tokri && npm run dev"
echo "  cd /var/www/html/tokri/server && npm run dev"
