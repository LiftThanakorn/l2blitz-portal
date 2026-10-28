# L2Blitz Portal v2 — GameServer integration

## Source of truth
- Portal based on GitHub branch `v2-real-game-assets`; integration branch: `l2blitz-server-integration-v2`.
- GameServer (local): `jolly-tesla/Lineage2-H5-Solo` (custom L2J Mobius High Five).
- Game SQL installer schemas in `server/db_installer/sql/game` are the authoritative column reference.
- Game database name in `server/game/config/Database.ini`: `l2jmobiush5`.
- EXP/SP rates x1000 from `Rates.ini`; Chimera farm zone drops 1.5M–3.5M Adena.
- Active farm zones: FARMZONE 1 Chimera Field and FARMZONE 2 Battered Lands.
- Custom daily boss: Queen Ant OR Baium at 20:00 Asia/Bangkok.
- TvT every two hours, registration five minutes, winning base 120M / losing base 50M Adena, subject to participation/payout rules.

## Safe local/live database setup
The website never writes character/account data. Use a dedicated database user (not the root or GameServer login):
```sql
CREATE USER 'l2blitz_portal_ro'@'127.0.0.1' IDENTIFIED BY 'REPLACE_WITH_LONG_RANDOM_PASSWORD';
GRANT SELECT ON \`l2jmobiush5\`.* TO 'l2blitz_portal_ro'@'127.0.0.1';
```
Copy `backend/.env.example` to `backend/.env`, set `DB_ENABLE=true`, `DB_NAME=l2jmobiush5`, `DB_USER=l2blitz_portal_ro`, a secret `DB_PASSWORD` and `USE_DEV_FIXTURES=false`. Keep `.env` out of Git.
For local API and game on the same computer set `STATUS_CHECK_ENABLE=true`, `STATUS_CHECK_HOST=127.0.0.1`, login/game ports 2106/7777. Open ports report TCP reachability, **not** full game health.
If hosted separately on a VPS, use a private network/tunnel to the GameServer database; never publicly expose MySQL port 3306.

## Honest limitations
- Boss data remains `unknown` until a dedicated adapter to the custom DailyEpicBoss state is implemented; generic `grandboss_data` may misrepresent custom spawns.
- TvT match-history results need explicit safe audit-log ingestion, not inferred from player stats.
- The launcher/full-client download links remain disabled until official files and SHA-256 hashes exist.
- Enchant rates not confirmed from local GameServer config remain labeled pending.
- On 2026-10-28 an attempt to use GameServer's existing DB credential for creating the limited user was denied by MySQL; no portal database account was created.