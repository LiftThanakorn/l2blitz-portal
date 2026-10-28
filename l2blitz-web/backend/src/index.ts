import { createApp } from './app.js';

const PORT = Number(process.env.PORT || 4000);
const app = createApp();

app.listen(PORT, () => {
  console.log(`[L2BLITZ PVP API] High Five CT 2.6 Portal Backend listening on http://localhost:${PORT}`);
});
