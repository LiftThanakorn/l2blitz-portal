import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { createRateLimiter } from './utils/rateLimiter.js';
import { apiRouter } from './routes/apiRoutes.js';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');

  app.use(
    cors({
      origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(',').map((o) => o.trim()),
      methods: ['GET', 'HEAD', 'OPTIONS'], // Strictly Read-Only API
    })
  );

  app.use(express.json({ limit: '16kb' }));

  // Enforce strictly read-only HTTP verbs on /api
  app.use('/api', (req, res, next) => {
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      res.status(405).json({
        error: 'Method Not Allowed',
        message: 'L2Blitz API is strictly read-only. Game database mutations are prohibited.',
      });
      return;
    }
    next();
  });

  // Rate limiting: 90 requests per 60 seconds per IP
  app.use(
    '/api',
    createRateLimiter({
      windowMs: 60_000,
      maxRequests: 90,
    })
  );

  app.use('/api', apiRouter);

  // 404 handler for unknown API routes
  app.use('/api/*', (_req, res) => {
    res.status(404).json({
      error: 'Not Found',
      message: 'The requested API endpoint does not exist.',
    });
  });

  // Global error handler
  app.use(
    (
      err: Error,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction
    ) => {
      console.error('[L2Blitz API Error]:', err.message);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'เกิดข้อผิดพลาดในการเชื่อมต่อข้อมูล กรุณาลองใหม่อีกครั้ง',
        timestamp: new Date().toISOString(),
      });
    }
  );

  return app;
}
