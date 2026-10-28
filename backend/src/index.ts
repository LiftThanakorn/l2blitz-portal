import { createApp } from './app.js';
import { env } from './config/env.js';

const app = createApp();

app.listen(env.PORT, '0.0.0.0', () => {
  console.log(
    `[L2BLITZ API] Listening on http://127.0.0.1:${env.PORT} | NODE_ENV=${env.NODE_ENV} | DEMO_MODE=${env.DEMO_MODE} | DB_ENABLED=${env.DB_ENABLED}`
  );
});
