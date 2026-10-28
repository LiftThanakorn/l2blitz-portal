# L2BLITZ PVP — Lineage II High Five (CT 2.6) Portal

An independent, minimal editorial game-information platform built from scratch for **L2BLITZ PVP** (Lineage II Chronicle 2.6: High Five, Thailand).

Designed and verified using the **Taste Skill (`design-taste-frontend`)** workflow (`editorial-report` — *The Printed Annual* direction) with warm ivory paper (`#F7F5F0`), charcoal ink (`#1A1917`), stone putty (`#F0EDE7`), and restrained terracotta (`#E97540`) tokens.

---

## 1. Architecture & Tech Stack

### Frontend (`/frontend`)
- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS 4 + CSS Custom Properties (`DESIGN.md` tokens)
- **Routing:** React Router v7 (`/`, `/info`, `/rankings`, `/olympiad`, `/raidboss`, `/farmzones`, `/events`, `/downloads`)
- **Bilingual Support:** Thai (`th`, default) and English (`en`) via `LanguageContext`
- **Target Hosting:** Cloudflare Pages (`dist/` static output with SPA `_redirects`)

### Backend (`/backend`)
- **Runtime:** Node.js LTS + Express.js + TypeScript
- **Database Layer:** `mysql2/promise` with strict read-only `SELECT` enforcement and in-memory TTL caching (15–60s)
- **Validation:** `zod` schema validation on all query parameters
- **Target Hosting:** Budget Ubuntu VPS (~500 THB/month) behind Nginx reverse proxy + `systemd` (`deploy/`)

---

## 2. API Endpoints & L2J Mobius High Five Contracts

All 12 mandatory endpoints are implemented in `backend/src/app.ts` and `backend/src/services/l2Service.ts`:

```text
GET /api/health
GET /api/server/status
GET /api/server/stats
GET /api/server/rates
GET /api/rankings/pvp
GET /api/rankings/pk
GET /api/rankings/clans
GET /api/olympiad/rankings
GET /api/olympiad/heroes
GET /api/castles
GET /api/raidbosses
GET /api/events/tvt
```

### Key Game-Logic Guarantees
1. **Grand Olympiad Point Privacy:** `GET /api/olympiad/rankings` uses `olympiad_points`, `competitions_done` (≥15 minimum), and `competitions_won` (≥1 minimum) strictly internally to rank nobles, then strips those fields before returning the public response (`rank`, `charName`, `clanName`, `classId`, `classNameEn`, `classNameTh`).
2. **Soul Hound Class Unification:** Male Soul Hound (`132`) and Female Soul Hound (`133`) are unified into a single Olympiad ranking and Hero bracket (`132/133`), matching `L2J_Mobius_CT_2.6_HighFive` logic.
3. **Zero Fake Live Telemetry:** When `DB_ENABLE` is `false` or the GameServer MySQL instance is unreachable in production (`USE_DEV_FIXTURES=false`), `/api/server/status`, `/api/server/stats`, and `/api/raidbosses` return `unknown` / `unavailable` rather than invented numbers.

---

## 3. Local Development & Verification

```bash
# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Run TypeScript checks & unit/API tests
npm run typecheck
npm test

# Build production bundles
npm run build

# Start Backend API (port 4000) and Frontend Dev/Preview
cd backend && npm run dev
cd frontend && npm run dev
```

---

## 4. Remaining Live GameServer Integration Checklist

When the customized L2Blitz High Five GameServer becomes available:
1. **Create a Read-Only Database User** in MariaDB/MySQL:
   ```sql
   CREATE USER 'l2blitz_ro'@'127.0.0.1' IDENTIFIED BY 'your_secure_password';
   GRANT SELECT ON l2jgs.* TO 'l2blitz_ro'@'127.0.0.1';
   FLUSH PRIVILEGES;
   ```
2. **Configure `/opt/l2blitz-web/backend/.env`** from `backend/.env.example`:
   - Set `DB_ENABLE=true` and `USE_DEV_FIXTURES=false`.
3. **Verify Custom Server Multipliers** in `backend/src/data/fixtures.ts` (`HIGH_FIVE_SERVER_RATES`):
   - Replace `"Pending Verification"` placeholders with verified EXP/SP/Adena multipliers, Max Enchant ceilings, and TvT reward item IDs from the live GameServer `config/` and `data/stats/` XML files.
4. **Configure Official Client Mirrors** in `frontend/src/pages/DownloadsPage.tsx`:
   - Wire the Launcher and Full Client buttons to the verified CDN / Cloudflare R2 URLs and publish the SHA-256 checksums.
