# L2BLITZ Web Top-Up — Local integration on the deployed v2 website

## Canonical branches and source
- Official site: https://l2blitz.pages.dev/
- GitHub repository: https://github.com/LiftThanakorn/l2blitz-portal
- Production deployment branch specified by owner: `l2blitz-server-integration-v2`.
- Default `main` was aligned to the deployed v2 commit `702fbe85` on 2026-10-31. The prior main head was preserved at `backup/main-before-v2-20261031`.
- LOCAL feature branch: `feature/blitzcoin-web-topup-v2-local`; **do not push, deploy, or merge it** until owner approves.
- Previous local prototype based on the unrelated legacy portal is preserved as `feature/blitzcoin-web-topup-safe`.

## Site architecture / theme
The actual Cloudflare Pages site is built from `l2blitz-web/frontend`, not the old root `src/` folder.
- React page: `l2blitz-web/frontend/src/pages/TopUpPage.tsx`.
- Reuses `App.tsx` router, `components/Layout.tsx`, and `context/LanguageContext.tsx`.
- Use the current official **light editorial** visual tokens (ivory `#F7F5F0`, ink `#1A1917`, orange `#E97540`, `IBM Plex Sans Thai` / `Geist`). Never substitute the old dark navy/small-sky UI.
- Local browser URL: **http://127.0.0.1:5173/topup**.
- Local API on 127.0.0.1:3101; Vite dev proxy forwards `/api/local` there while existing `/api` continues to target port 4000.
- `/topup` navbar and route are intentionally **development-only**, absent from production builds.
- No separate top-up website: port 3101 redirects browser root to the official site's local dev route.
- Fixed amount QR assets are generated from locally audited source and served only by Local API. Generated `local-topup/public/qr/` and bank slip images are ignored by Git.

## Local run
1. Start Local GameServer/LoginServer and test client. Local NPC `900108` points to this port.
2. In repo root start `npm --prefix l2blitz-web/frontend run dev -- --host 127.0.0.1 --port 5173 --strictPort`.
3. In a second terminal in repo root start `powershell -NoProfile -ExecutionPolicy Bypass -File .\local-topup\Start-LocalTopUp.ps1 -EnablePilot`.
4. Visit `http://127.0.0.1:5173/topup`.
5. Obtain 8-digit game pairing code from NPC 900108 (expires in 5 minutes). Operator CLI fallback: `node local-topup/operator.mjs pair <online-character-id>`.
6. Select package and create order; **the operator must independently verify the payee in the banking app before any real transfer**. Upload slip, confirm GM notification and verify real bank transfer, then operator approval.
7. Never approve based on a screenshot alone; use independent transaction proof and a unique bank reference.

## Verification and critical safety
- `npm --prefix l2blitz-web/frontend run typecheck`
- `npm --prefix l2blitz-web/frontend run build` (this changes tracked generated dist files; restore only build-generated artifacts before committing)
- `node local-topup/integration-test.mjs` (isolated temporary DB; does not touch existing orders)
- Local emergency stop flag remains mandatory; no changes to production or VPS payment flag.
- Slip2Go real credentials/response schema and Telegram photo delivery are not yet verified end-to-end in production. Without a provider API key this pilot marks slips `MANUAL_PENDING`, never auto-credit.
- Online/offline item 4037 delivery from approved local orders remains to be live tested by owner.
- Local API and NPC integration are not hardened for public exposure: keep loopback-only and local feature branch unpushed.
