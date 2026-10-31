import { createApp } from './app.js';

const PORT = Number(process.env.PORT || 4000);
const HOST = process.env.HOST || '127.0.0.1';
const app = createApp();

app.listen(PORT, HOST, () => {
  console.log(`[L2BLITZ PVP API] High Five CT 2.6 Portal Backend listening on http://${HOST}:${PORT}`);
});