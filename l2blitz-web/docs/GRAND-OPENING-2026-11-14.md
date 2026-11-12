# L2Blitz — Grand Opening pre-launch checklist (14 Nov 2026, 18:19 Asia/Bangkok)

State as of 12 Nov 2026: **PRE-LAUNCH — no game start/restart authorized by this website change.**
This checklist uses inspected LOCAL game source/config; **VPS deployment parity is not yet verified.**

## Verified against local game files
| Source | Confirmed local value |
|---|---|
| `server/game/config/Rates.ini` | EXP/SP x1000; RaidDropAmountMultiplier x2 |
| `server/game/data/scripts/handlers/bypass/communityboard/StarterPack.java` | +6 gear, 1,000 each HP/MP/CP, **10,000,000 Adena**, one claim per **character** |
| `server/game/config/Olympiad.ini` | Starts 18:00; competition 6h; minimum 9 matches for points |
| `server/game/config/Custom/DailyEpicBoss.ini` | One random Queen Ant/Baium/Zaken each day at 20:00; announcements 19:30/19:50; cleanup 21:30 |
| `server/game/config/Custom/PremiumSystem.ini` | Weight x10, inventory slots x2; no additional EXP/SP/drop multiplier |
| `server/game/config/Custom/BlitzCoinTopUp.ini` | PaymentEnabled=false; PublicPaymentApproved=false; public top-ups NOT approved |
| `server/game/config/Custom/BlitzRotatingFarm.ini` | Explicitly test-only — do **not** advertise as production-ready |

The public website used to advertise Starter Pack 50M Adena, while the inspected current local game source grants 10M. The website copy was corrected to local source. Compare the deployed VPS JAR/config before treating this as a final economic decision.

## Publication and safety gates
- [ ] Compare VPS installed game files/JAR and local source revision; reconcile and record game release commit, hashes, backup paths.
- [ ] Backup MySQL and game configurations; verify restores to a non-production target; avoid public MySQL port 3306 access.
- [ ] Keep GameServer/LoginServer stopped as instructed until separately approved. A TCP-open port alone does **not** certify gameplay health.
- [ ] Investigate website `/api/server/status` returning online while operator reports the game stopped; confirm host, ports, process IDs and cache/proxy target.
- [ ] Verify starter kit reward, Premium, TvT reward tiers, Daily Epic schedule, Olympiad, farm teleports, PvP flags and AutoFarm from the actual deployed build.
- [ ] Validate full-client Google Drive mirrors, launcher/self-update, patch manifests, downloads and SHA-256 of the release archive. Current archive label remains **Close Beta**, checksum not published.
- [ ] Test clean client installation and patching end-to-end on a separate machine, including login, character selection, inventory and Alt+B.
- [ ] Audit publicly reachable API paths, top-up server-side gates, payment order endpoints and admin panel authorization; do NOT enable payment from front-end configuration alone.
- [ ] Back up logs and database; verify monitoring, restart rollback plan, incident contact, and restore procedure.
- [ ] Until explicit go-live approval, keep BOTH frontend build flag `VITE_PUBLIC_LAUNCH_CONFIRMED` and Cloudflare Pages Worker binding `PUBLIC_LAUNCH_CONFIRMED` unset/false. Frontend displays "Closed for launch preparation" and Worker returns operator prelaunch status even when TCP ports respond.
- [ ] Keep BOTH `VITE_PUBLIC_TOPUP_ENABLED` (frontend build) and `PUBLIC_TOPUP_ENABLED` (Worker binding) unset/false even if game launch is confirmed. Do not expose payment endpoints until bank/QR verification and backend approval are complete.
- [ ] After confirming the live GameServer/LoginServer and first-player smoke test, set both launch flags to `true`, rebuild and redeploy Pages, check `/api/server/status` against VPS gameplay, and independently opt into public rankings via `VITE_PUBLIC_CHARACTER_DATA_ENABLED=true` and Worker `PUBLIC_CHARACTER_DATA_ENABLED=true` only if safe.
- [ ] Re-test home, server info, downloads, events, boss page, Olympiad, mobile language switch, and `/topup` direct URL after production deployment.

**Deployment rule:** the date/time countdown never starts a server or automatically confirms it online. Website env flags are presentation gates, not substitutes for disabling game or payment access at the server.
