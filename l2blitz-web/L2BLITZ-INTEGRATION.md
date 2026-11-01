# L2Blitz Portal v2 — GameServer integration

## Source of truth
- Portal based on GitHub branch `v2-real-game-assets`; integration branch: `l2blitz-server-integration-v2`.
- GameServer (local): `jolly-tesla/Lineage2-H5-Solo` (custom L2J Mobius High Five).
- Game SQL installer schemas in `server/db_installer/sql/game` are the authoritative column reference.
- Game database name in `server/game/config/Database.ini`: `l2jmobiush5`.
- EXP/SP rates x1000 from `Rates.ini`; Chimera farm zone drops 1.5M–3.5M Adena.
- Active farm zones: FARMZONE 1 Chimera Field and FARMZONE 2 Battered Lands.
- Custom Daily Epic boss: one random Queen Ant, Baium or Zaken at 20:00 Asia/Bangkok; Zaken is a custom level-85 NPC (94081) at Parnassus.
- TvT every two hours, registration five minutes, 2v2–4v4+ rewards from 25M/12.5M up to 100M/50M Adena, subject to participation/payout rules.

## Safe local/live database setup
The website never writes character/account data. Use a dedicated database user (not the root or GameServer login):
```sql
CREATE USER 'l2blitz_portal_ro'@'127.0.0.1' IDENTIFIED BY 'REPLACE_WITH_LONG_RANDOM_PASSWORD';
GRANT SELECT ON `l2jmobiush5`.* TO 'l2blitz_portal_ro'@'127.0.0.1';
```
Copy `backend/.env.example` to `backend/.env`, set `DB_ENABLE=true`, `DB_NAME=l2jmobiush5`, `DB_USER=l2blitz_portal_ro`, a secret `DB_PASSWORD`. Demo player fixtures are never served by the API, regardless of the preview flag. Keep `.env` out of Git.
For local API and game on the same computer set `STATUS_CHECK_ENABLE=true`, `STATUS_CHECK_HOST=127.0.0.1`, login/game ports 2106/7777. Open ports report TCP reachability, **not** full game health.
If hosted separately on a VPS, use a private network/tunnel to the GameServer database; never publicly expose MySQL port 3306.

## Olympiad class leaderboard (Top 3)
- Route: `/olympiad` shows all 34 hero-eligible High Five Olympiad class brackets on one scrollable page, grouped by race, with three ranking slots per class. Empty brackets remain visible; no fabricated players.
- API: `GET /api/olympiad/top-by-class?cycle=current|previous`. One read-only SQL query loads all eligible competitors per cycle; the 30-second cache avoids querying the game 34 times.
- Canonical hero eligibility is taken from the GameServer `Olympiad.java` `HERO_IDS`: 88–118, 131, Soul Hound 132/133 unified, and 134. Judicator/Inspector (135/136) are not eligible hero brackets, but remain in the general class catalog for PvP/class information.
- Olympiad minimum for standings: 9 matches and at least one win. Hero eligibility also requires 3 different opponents in the active weekly window, as checked by the GameServer. The portal standings are informational, not a Hero award certification. Soul Hound 132/133 is one bracket; Judicator has no hero bracket.
- API outputs only rank, character name, clan, and class metadata. Points, win counts, and match counts remain server-private. `dataAvailable=false` means the read-only game query could not be completed.
- Verified locally on 2026-10-28 against live MySQL; all 34 class brackets returned and both cycle routes respond. The database had no qualifying ranked character at verification time; empty leaderboards are expected, not placeholder fixtures.

## Honest limitations
- Boss data remains `unknown` until a dedicated adapter to the custom DailyEpicBoss state is implemented; generic `grandboss_data` may misrepresent custom spawns.
- TvT match-history results need explicit safe audit-log ingestion, not inferred from player stats.
- The launcher/full-client download links remain disabled until official files and SHA-256 hashes exist.
- Unverified enchant percentages/caps, speculative equipment builds, premium drop bonuses, mock file sizes/versions and unsupported enforcement policies have been removed from the public basic-information pages.
- Starter Pack data is verified in `server/game/data/scripts/handlers/bypass/communityboard/StarterPack.java`: +6 items, 50M Adena, 1,000 HP/MP/CP consumables, one claim per character.
- `PremiumSystem.ini` currently sets premium EXP/SP/drop multipliers to x1; the portal does not advertise farming bonuses.
- Sample player/clan/hero test fixtures remain as unit-test data but cannot be selected by public APIs, even if `USE_DEV_FIXTURES=true`.
- Local integration was verified on 2026-10-28: a dedicated SELECT-only account connects to the game database; endpoints report real server data. No database credential is committed.
- MySQL currently listens on external interfaces and existing Windows Firewall rules permit inbound access. The attempted Firewall block failed without administrator privileges. Before exposing the host publicly, an administrator must block inbound TCP 3306 from external networks (while preserving localhost access).
- The portal API binds 127.0.0.1 by default; place it behind a reverse proxy when deploying publicly.
