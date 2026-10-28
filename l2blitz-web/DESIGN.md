# L2BLITZ PVP — Design System & Art Direction (`DESIGN.md`)

## 1. Brand & Project Identity

- **Project Name:** L2BLITZ PVP
- **Game Chronicle:** Lineage II — High Five (Chronicle 2.6 / CT 2.6)
- **Server Archetype:** Instant PvP & Competitive Grand Olympiad Portal
- **Target Region:** Thailand (`th-TH` primary, `en-US` secondary)
- **Aesthetic Direction:** Minimal Editorial Gaming (`editorial-report` — *The Printed Annual*, via Taste Skill v2)

L2BLITZ PVP rejects the visual clichés of private MMORPG templates (neon purple gradients, glassmorphism, floating embers, repetitive 3-card grids, and fabricated player counters). Instead, it presents the mechanics, rankings, Olympiad records, and boss spawns of Lineage II High Five like an authoritative, finely typeset print annual and architectural compendium.

---

## 2. Taste Skill Direction & Core Idea

- **Dealt Direction:** `editorial-report` (*The Printed Annual*, seed `1177854526`)
- **The Idea Sentence:**
  > On this page, **the verifiable combat ledger and S84 High Five chronicle records of L2BLITZ** become **an authoritative two-colour editorial annual organized around a strict 42% vertical axis and interactive combat inspector**.
- **The One Live Thing:**
  An interactive **High Five Class & Loadout Inspector / Olympiad Matchup Explorer** directly on the homepage and Olympiad portal — allowing visitors to filter all 35 third-class awakenings (IDs 88–136, with Soul Hound 132/133 unified per L2J Mobius CT 2.6 logic), inspect recommended S84 sets (Elegia, Vorpal, Moirai) and Epic Jewelry synergies, and switch live language/cycle states with zero latency.

---

## 3. Color Palette & Surface Tokens

Primary theme: **Warm Editorial Light** (`tasteskill.dev` inspired balance).

```css
:root {
  --background: #F7F5F0;      /* Warm Ivory Paper — 75–85% of viewport surface */
  --surface: #FFFFFF;         /* Crisp White Sheet — tables, active panels, specimen cards */
  --surface-muted: #F0EDE7;   /* Stone Putty — secondary cells, mosaic counter-tiles */
  --foreground: #1A1917;      /* Deep Charcoal Ink — primary typography & dark chapter fields */
  --text-secondary: #77736C;  /* Warm Slate — metadata, timestamps, secondary labels (passes AA contrast) */
  --border: #E8E3DB;          /* Subtle Travertine Rule — used strictly inside data tables & forms */
  --accent: #E97540;          /* Restrained Terracotta Orange — primary action & key focal signal (<5% screen share) */
  --accent-hover: #CE6333;    /* Deepened Burnt Sienna — hover/active press state */
  --success: #32846B;         /* Verdigris Green — Online status & Alive raid state */
  --error: #B95348;           /* Carmine Ochre — Offline status & Dead/Respawning raid state */
}
```

### Color Discipline Rules
1. **No Gradients or Glows:** All surfaces are flat steps in tone (`--background` → `--surface-muted` → `--surface` or inverted `--foreground`). The only permitted gradient is a neutral dark scrim (`rgba(26, 25, 23, 0.45)`) directly behind light text over photography/illustrations.
2. **No Shadows at Rest:** Panels and tiles separate by background tone steps or gutterless mosaic edges.
3. **Honest Status Colors:** `--success` (`#32846B`) and `--error` (`#B95348`) are reserved exclusively for real-time server/boss telemetry; unverified or unreachable states use `--text-secondary` (`#77736C`) with an explicit `UNKNOWN / UNVERIFIED` indicator.

---

## 4. Typography Scale & Hierarchy

Two families, loaded cleanly with `font-display: swap`:
- **English & Numerals:** `'Geist'`, `'Inter'`, system sans-serif
- **Thai Primary Copy:** `'IBM Plex Sans Thai'`, sans-serif

### Five-Step Type System
No intermediate arbitrary sizes. Every text element maps to one of five fluid tokens:

| Token | CSS Value | Usage | Line Height / Tracking |
| :--- | :--- | :--- | :--- |
| `--step-display` | `clamp(2.75rem, 1.2rem + 5.5vw, 5.75rem)` | Hero H1 masthead & monumental section closers (≤2 lines at all widths) | `0.96` / `-0.035em` (EN), `-0.01em` (TH) |
| `--step-head` | `clamp(1.75rem, 1.2rem + 2.2vw, 3.25rem)` | Section H2 headings anchored to the 42% editorial axis (≤2 lines) | `1.08` / `-0.025em` |
| `--step-lead` | `clamp(1.1875rem, 1.05rem + 0.55vw, 1.5rem)` | Standfirst decks, mosaic statements, key findings | `1.4` / `-0.01em` |
| `--step-body` | `clamp(1rem, 0.96rem + 0.2vw, 1.125rem)` | Running prose (16–18px), table cells, descriptions (45–68ch measure) | `1.6` / `0` |
| `--step-small` | `clamp(0.8125rem, 0.8rem + 0.1vw, 0.875rem)` | Table column headers, timestamps, legal/source notes (never <13px) | `1.45` / `0.01em` |

All numeric columns (`PvP`, `PK`, `Clan Reputation`, `Level`, `Respawn Timers`) enforce `font-variant-numeric: tabular-nums` and right alignment where appropriate.

---

## 5. Layout & Spatial Architecture

- **Maximum Container / Editorial Frame:** Symmetrical outer margins (`clamp(1rem, 2.5vw, 2.5rem)`) with a 12-column editorial grid (`max-width: 1280px` for dense data tables and reading views; full-bleed mosaic bands where specified by the direction sheet).
- **The 42% Editorial Axis:** On desktop (`≥1024px`), primary section headings and body columns align to column 6 (~42% horizontal axis), while columns 1–5 hold contextual side notes, server telemetry summaries, or asymmetric visual counterweights so no half of the viewport is ever left accidentally empty.
- **Anti-Repetition Mandate:** Never stack two identical section layouts back-to-back. Alternate between:
  1. *Two-by-Two Editorial Board* (Hero)
  2. *Gutterless Mosaic with Figure Tiles* (Server Telemetry & Rates Overview)
  3. *50/50 Split Statement & Dark Rows* (PvP Combat Mechanics & Olympiad Rules)
  4. *Band of Unequal Panels* (`flex: 5 2 3 2` — Raid Bosses & World Zones)
  5. *Pushed-Right Data Ledger with Visual Counterweight* (Live Rankings & TvT Schedule)
  6. *Diagonal Staircase Sequence* (How to Connect & Instant PvP Progression)

---

## 6. Original Illustration Art Direction

All 6 mandatory visual assets are original Gemini-generated illustrations tailored to Lineage II High Five (CT 2.6), converted to optimized `.webp` and `.png` formats:

1. **`hero-pvp.webp` (16:9):** Playable races of High Five (Human Phoenix Knight in Elegia Heavy, Elf Mystic Muse in Vesper Noble, Dark Elf Ghost Hunter in Vorpal Light, Orc Titan, Dwarf Maestro, Kamael Soul Hound with single wing) in Aden courtyard.
2. **`olympiad-duel.webp` (4:3):** Grand Olympiad 1v1 arena standoff between a Human Duelist and Kamael Soul Hound.
3. **`raid-bosses.webp` (4:3):** Queen Ant and Baium atop the Tower of Insolence with Antharas relief.
4. **`farm-zone.webp` (16:9):** Dragon Valley & Lair of Antharas limestone canyons with Drake and Malruk silhouettes.
5. **`server-features.webp` (4:3):** Editorial knolling catalog of S84 Elegia/Vorpal equipment, Vesper weapons, and Epic Jewelry (Ring of Baium, Ring of Queen Ant, Earring of Antharas).
6. **`events-tvt.webp` (16:9):** Symmetrical Team vs Team colosseum confrontation (Red vs Blue formations in High Five armor).

---

## 7. Data Honesty & L2J Mobius High Five Rules

1. **Zero Fabricated Live Telemetry:** When the MySQL GameServer is unreachable or unconfigured in production, the API and UI explicitly return `status: "unknown"` and display `ไม่ทราบสถานะ (รอกำหนดค่าเซิร์ฟเวอร์)` / `Unknown (Pending GameServer Connection)`. Development fixtures are strictly isolated behind `USE_DEV_FIXTURES=true` (local preview only) and labeled with a transparent data-source indicator.
2. **Grand Olympiad Privacy & Soul Hound Grouping:**
   - Public API (`GET /api/olympiad/rankings`) and Frontend **never expose Olympiad points, win counts, or match counts**. Those fields (`olympiad_points`, `competitions_done`, `competitions_won`) are used strictly inside the backend SQL/service layer to filter (`competitions_done >= 15`, `competitions_won >= 1` per official High Five rules) and sort participants.
   - Public response displays only: `rank`, `charName`, `clanName`, `classId`, and `className`.
   - **Soul Hound Unification:** Male Soul Hound (`classId: 132`) and Female Soul Hound (`classId: 133`) are unified into a single competitive Olympiad ranking bracket (`132/133 — Soul Hound`), matching actual L2J Mobius CT 2.6 `Olympiad.java` / hero eligibility logic.
