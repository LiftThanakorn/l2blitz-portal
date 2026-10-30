# L2Blitz Website API — Ubuntu VPS

Deployed 2026-10-30 onto NZ Network P-3 (Ubuntu 24.04).
The web backend uses Node.js 24 LTS and Express, reads live MySQL in read-only mode.
Static React frontend stays on Cloudflare Pages (GitHub branch l2blitz-server-integration-v2).

## Public API connectivity
- HTTPS origin: `https://154-215-14-70.sslip.io/api/health`
- Cloudflare Pages same-origin API: `https://l2blitz-portal.pages.dev/api/health`
- Proxy: repo root `functions/api/[[path]].js` (GET/HEAD allowlist, no redirects)
- No paid custom domain; sslip.io free DNS wildcard points at VPS IP.
- Caddy auto-renews trusted Let's Encrypt certificate; 80/443 reachable publicly.
- Node API listens ONLY on 127.0.0.1:4000; MySQL only 127.0.0.1:3306.
- UFW ports open: 22, 80, 443, 2106, 7777. MySQL/9014 remain closed externally.

## VPS layout
- `/opt/node24` Node binary verified against official SHASUMS256.txt
- `/opt/l2blitz-api` compiled backend + production node_modules (owned root:l2blitz)
- `/etc/l2blitz/api.env` (root:l2blitz 0640; contains randomly generated DB password)
- `/etc/systemd/system/l2blitz-api.service`
- `/etc/caddy/Caddyfile`
- `journalctl -u l2blitz-api -f` for API logs; `systemctl status l2blitz-api` for health.

## Data separation
- Public API database user `l2blitz_portal_ro` only has SELECT privileges for:
  characters, clan_data, olympiad_nobles, heroes, castle.
- API may report players online and leaderboard data as DB is updated by GameServer.
- GameServer is not started as part of this web API integration.
- EXP/Drop/Enchant rates, TvT, Daily Epic boss state are NOT automatically synced.
- The Home page refreshes status and player counts every 45 seconds while open.
- Rankings refresh on navigation/filters or browser reload, with backend 15-60s TTL caching.

## Acceptance checks
- `curl -fsS http://127.0.0.1:4000/api/health` on VPS
- `curl -fsS https://154-215-14-70.sslip.io/api/server/status` external
- `curl -fsS https://l2blitz-portal.pages.dev/api/server/stats` from Pages
- Confirm invalid endpoint 404, non-GET 405, and no MySQL credentials in responses.
- Confirm 3306/9014 remain not publicly accessible.

## Notes
- SSLIP DNS is a free third-party wildcard dependency; if VPS IP changes, change
  Caddy host and Pages Function origin, and let Caddy issue a new certificate.
- No paid Cloudflare services or domain have been purchased.
- Keep `api.env` and SQL credentials out of GitHub. Do not expose /opt secrets.
- Deploy backend updates with a tested tar archive and controlled service restart.
