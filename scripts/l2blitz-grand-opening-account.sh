#!/usr/bin/env bash
set -Eeuo pipefail
# VPS account-creation activation: owner approved 2026-11-14 18:19 Asia/Bangkok.
exec 9>/run/l2blitz-grand-opening-20261114.lock
flock -n 9 || exit 0
announce(){ printf '%s\n' "$*"; logger -t l2blitz-grand-opening -- "$*"; }
due=$(date -u -d '2026-11-14 11:19:00' +%s)
if (( $(date -u +%s) < due )); then announce "BLOCKED: scheduled launch time not reached"; exit 2; fi
cfg=/opt/l2blitz/runtime/login/config/Server.ini
backup=/opt/l2blitz/backups/grand-opening-20261114-1819
install -d -m 0700 "$backup"
if ! systemctl is-active --quiet l2blitz-game || ! systemctl is-active --quiet mysql; then
  announce "BLOCKED: game or MySQL unhealthy; login untouched"; exit 3
fi
if ! grep -Eq '^AutoCreateAccounts[[:space:]]*=[[:space:]]*(False|True)' "$cfg"; then
  announce "BLOCKED: unexpected account config format"; exit 4
fi
if grep -Eq '^AutoCreateAccounts[[:space:]]*=[[:space:]]*True' "$cfg"; then
  announce "Account creation already enabled; skip redundant LoginServer restart"
  exit 0
fi
cp -p "$cfg" "$backup/Server.ini.before-grand-opening"
sed -i -E 's/^AutoCreateAccounts[[:space:]]*=.*/AutoCreateAccounts = True/' "$cfg"
if ! grep -Eq '^AutoCreateAccounts[[:space:]]*=[[:space:]]*True' "$cfg"; then
  cp -p "$backup/Server.ini.before-grand-opening" "$cfg"
  announce "FAILED: login config did not update; rolled back"; exit 5
fi
if ! systemctl restart l2blitz-login; then
  cp -p "$backup/Server.ini.before-grand-opening" "$cfg"
  systemctl restart l2blitz-login || true
  announce "FAILED: LoginServer restart failed; rolled back"; exit 6
fi
sleep 10
if ! systemctl is-active --quiet l2blitz-login || ! ss -lnt | grep -Eq ':2106[[:space:]]'; then
  cp -p "$backup/Server.ini.before-grand-opening" "$cfg"
  systemctl restart l2blitz-login || true
  announce "FAILED: LoginServer not healthy after enable; rolled back"; exit 7
fi
announce "PASS: Account auto-creation activated after 18:19; LoginServer healthy"
