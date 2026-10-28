import path from 'node:path';
import { spawn } from 'node:child_process';
import express from '../backend/node_modules/express/index.js';
import { createApp } from '../backend/dist/app.js';

const PORT = 4173;
const app = createApp();
const distPath = path.resolve(process.cwd(), 'frontend/dist');

app.use(express.static(distPath));
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const server = app.listen(PORT, () => {
  console.log(`[Preview Server] Serving production frontend + API on http://127.0.0.1:${PORT}`);
  const child = spawn(
    'node',
    [
      '.agents/skills/design-taste-frontend/scripts/inspect.mjs',
      `http://127.0.0.1:${PORT}`,
      '--widths',
      '1440,1280,768,390',
      '--allow',
      'palette-claude,no-footage',
    ],
    { stdio: 'inherit' }
  );

  child.on('exit', (code) => {
    server.close();
    process.exit(code ?? 0);
  });
});
