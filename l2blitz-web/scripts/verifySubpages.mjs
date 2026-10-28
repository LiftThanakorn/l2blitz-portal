import path from 'node:path';
import { mkdirSync } from 'node:fs';
import express from '../backend/node_modules/express/index.js';
import { createApp } from '../backend/dist/app.js';
import { Browser } from '../.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';

const PORT = 4174;
const app = createApp();
const distPath = path.resolve(process.cwd(), 'frontend/dist');
const outDir = path.resolve(process.cwd(), '.taste-skill/inspect/subpages');
mkdirSync(outDir, { recursive: true });

app.use(express.static(distPath));
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const routes = [
  { path: '/info', name: 'info' },
  { path: '/rankings', name: 'rankings' },
  { path: '/olympiad', name: 'olympiad' },
  { path: '/raidboss', name: 'raidboss' },
  { path: '/farmzones', name: 'farmzones' },
  { path: '/events', name: 'events' },
  { path: '/downloads', name: 'downloads' },
];

const server = app.listen(PORT, async () => {
  const browser = await Browser.launch();
  try {
    for (const r of routes) {
      const page = await browser.newPage({ width: 1440, height: 900, dsf: 1 });
      await page.goto(`http://127.0.0.1:${PORT}${r.path}`, { timeoutMs: 20000, settleMs: 900 });
      const check = await page.eval(`(() => {
        const docW = document.documentElement.scrollWidth;
        const winW = window.innerWidth;
        const h1 = document.querySelector('h1')?.innerText?.trim() || '';
        const textLen = document.body.innerText.trim().length;
        return { overflowX: docW > winW + 2, docW, winW, h1, textLen };
      })()`);
      const shotPath = path.join(outDir, `${r.name}-1440.jpg`);
      await page.screenshot({ path: shotPath, quality: 82 });
      console.log(
        `[Subpage Check] ${r.path.padEnd(12)} | H1: "${check.h1.replace(/\n/g, ' ')}" | overflowX: ${check.overflowX} (${check.docW}/${check.winW}) | consoleErrors: ${page.consoleErrors.length}`
      );
      if (page.consoleErrors.length > 0) {
        console.error(`  Console errors on ${r.path}:`, page.consoleErrors);
        process.exitCode = 1;
      }
      if (check.overflowX || !check.h1 || check.textLen < 100) {
        console.error(`  Layout/Content error on ${r.path}:`, check);
        process.exitCode = 1;
      }
      await page.close();
    }
  } finally {
    await browser.close();
    server.close();
  }
});
