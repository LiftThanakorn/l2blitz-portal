# L2BLITZ Grand Opening activation — 2026-11-14
Operator approved opening game accounts, public website, and public top-up **at 18:19 Asia/Bangkok**.
Production installation is staged separately from public website activation.

## Verified prelaunch on VPS
- LoginServer, GameServer, MySQL, API, Caddy, and TopUp service active at 16:52 ICT.
- Production account auto-creation still **false** prior to activation.
- Hardened TopUp backend installed with backup under `/opt/l2blitz/backups/grand-opening-20261114-1819/`.
- Rotated Caddy ↔ TopUp edge secret; unauthorized direct HTTPS requests return 403.
- TopUp backend health passes; unauthenticated order requests and character-name login return 401.
- Frontend 6 tests pass, time-gate worker 2 tests pass, TypeScript build passes.
- Slip2Go and Telegram configured, but **no real-money transaction performed in this test**.
- Cloudflare public Worker was deployed at 16:52 ICT with the fixed 18:19 server-side time gate; `PUBLIC_LAUNCH_CONFIRMED=true` is installed.
- **Resolved at 17:11–17:15 ICT:** Operator saved the VPS-issued secret in Cloudflare Production. Verified bindings `EDGE_SECRET`, `PUBLIC_LAUNCH_CONFIRMED`, and `PUBLIC_TOPUP_ENABLED`. A temporary read-only Worker diagnostic verified authenticated Cloudflare → VPS payment health HTTP 200 / `ok:true`, and was removed in the final production deployment (diagnostic URL returns HTTP 404).
- **Final release** `https://c97fc263.l2blitz.pages.dev` built with `VITE_PUBLIC_TOPUP_ENABLED=true`. Both Cloudflare Worker and frontend guard payment until **18:19 ICT**. Verified public `/api/server/status` remains `operator_prelaunch` and public `/api/local/health` returns HTTP 503 before the scheduled opening. End-to-end real-money credit delivery still requires separate authorized smoke test.
- Turnstile widget not shipped; backend requires authenticated game ticket or in-game OTP and order rate limits. Captcha should be added in a later hardening release.

## Timed account activation
- `l2blitz-grand-opening-login.timer` triggers 2026-11-14 18:19:00 ICT.
- Service enables `AutoCreateAccounts = True` and restarts **LoginServer only**.
- Config is backed up before switch; failed restart rolls back automatically.
- GameServer remains running; portal flags are time-gated separately.

## Operational caveats
- Opening LoginServer auto-registration is not equivalent to a website registration form.
- Public top-up gateway must remain blocked on failed payment/backend checks.
- After go-live, check `/api/server/status`, `/api/local/health`, `/api/local/me`, login with new account, and a first-player in-game smoke test.
- Report `CREDITED` verification only when tested against a real (authorized) order; never assume from API health.
