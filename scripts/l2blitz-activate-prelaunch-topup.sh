#!/usr/bin/env bash
set -Eeuo pipefail
# Owner-approved release, before launch time; Cloudflare payment gateway stays closed.
stage=/opt/l2blitz/staging/grand-opening-20261114-1819
backup=/opt/l2blitz/backups/grand-opening-20261114-1819
app=/opt/l2blitz-topup/server.mjs
envfile=/etc/l2blitz/topup.env
caddy=/etc/caddy/Caddyfile
secretfile=/etc/l2blitz/edge-secret
install -d -m 0700 "$backup"
if [[ -e "$backup/topup-prelaunch-activated" ]]; then echo "Already applied"; exit 0; fi
[[ -f "$stage/topup-hardened.mjs" ]] || exit 10
node --check "$stage/topup-hardened.mjs"
cp -p "$app" "$backup/server.mjs.before-grand-opening"
cp -p "$envfile" "$backup/topup.env.before-grand-opening"
cp -p "$caddy" "$backup/Caddyfile.before-grand-opening"
if [[ -e "$secretfile" ]]; then cp -p "$secretfile" "$backup/edge-secret.before-grand-opening"; fi
rollback(){
  cp -p "$backup/server.mjs.before-grand-opening" "$app"
  cp -p "$backup/topup.env.before-grand-opening" "$envfile"
  cp -p "$backup/Caddyfile.before-grand-opening" "$caddy"
  if [[ -f "$backup/edge-secret.before-grand-opening" ]]; then cp -p "$backup/edge-secret.before-grand-opening" "$secretfile"; else rm -f "$secretfile"; fi
  systemctl restart l2blitz-topup || true
  systemctl reload caddy || true
  echo "FAIL: rolled back top-up" >&2
}
trap rollback ERR
secret="$(openssl rand -hex 32)"
umask 077
printf '%s' "$secret" > "$secretfile"
if grep -q '^EDGE_SECRET=' "$envfile"; then
  sed -i "s/^EDGE_SECRET=.*/EDGE_SECRET=$secret/" "$envfile"
else
  printf '\nEDGE_SECRET=%s\n' "$secret" >> "$envfile"
fi
# The web page has no Turnstile widget yet. Keep in-game ticket / OTP verification,
# per-account throttles, protected session, and slip verification; do not use fake captcha keys.
if grep -q '^TURNSTILE_REQUIRED=' "$envfile"; then
  sed -i 's/^TURNSTILE_REQUIRED=.*/TURNSTILE_REQUIRED=0/' "$envfile"
else
  printf 'TURNSTILE_REQUIRED=0\n' >> "$envfile"
fi
python3 - "$caddy" "$secret" <<'PY'
from pathlib import Path
import re, sys
p = Path(sys.argv[1])
data = p.read_text()
pattern = r'(@no_secret\s+not\s+header\s+X-Edge-Secret\s+)[^\s]+'
updated, n = re.subn(pattern, lambda m: m.group(1) + sys.argv[2], data)
if n != 1: raise RuntimeError(f'Expected 1 edge policy, got {n}')
p.write_text(updated)
PY
install -o root -g l2blitz -m 0640 "$stage/topup-hardened.mjs" "$app"
node --check "$app"
caddy validate --config "$caddy"
systemctl restart l2blitz-topup
systemctl reload caddy
sleep 3
systemctl is-active --quiet l2blitz-topup
systemctl is-active --quiet caddy
curl --fail --silent --show-error http://127.0.0.1:3101/api/local/health | grep -q '"ok":true'
code=$(curl -s -o /dev/null -w '%{http_code}' -H 'Content-Type: application/json' --data '{"character":"GM"}' http://127.0.0.1:3101/api/local/redeem)
[[ "$code" == 401 ]]
code=$(curl -s -o /dev/null -w '%{http_code}' -H 'Content-Type: application/json' --data '{"amount":100}' http://127.0.0.1:3101/api/local/orders)
[[ "$code" == 401 ]]
code=$(curl -sk -o /dev/null -w '%{http_code}' https://154-215-14-70.sslip.io/api/local/health)
[[ "$code" == 403 ]]
trap - ERR
touch "$backup/topup-prelaunch-activated"
echo "PASS: prelaunch top-up hardened, secret rotated; public gateway still closed"
