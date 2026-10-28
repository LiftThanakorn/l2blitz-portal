import express from 'express';
import cors from 'cors';
import {
  getActiveDataSourceMode,
  isDatabaseConfigured,
  isDevFixtureEnabled,
} from './db/mysqlAdapter.js';
import {
  getCastles,
  getClanRankings,
  getOlympiadHeroes,
  getOlympiadRankings,
  getOlympiadTopByClass,
  getPkRankings,
  getPvpRankings,
  getRaidBosses,
  getServerRates,
  getServerStats,
  getServerStatus,
  getTvtEventInfo,
  getVerificationNotice,
} from './services/l2Service.js';
import {
  ApiEnvelope,
  OlympiadRankingQuerySchema,
  OlympiadCycleQuerySchema,
  PaginationQuerySchema,
} from './types/api.js';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(cors());
  app.use(express.json());

  function wrapEnvelope<T>(data: T): ApiEnvelope<T> {
    return {
      ok: true,
      source: getActiveDataSourceMode(),
      updatedAt: new Date().toISOString(),
      verificationNotice: getVerificationNotice(),
      data,
    };
  }

  app.get('/api/health', (_req, res) => {
    res.json(
      wrapEnvelope({
        service: 'l2blitz-pvp-api',
        chronicle: 'Lineage II High Five (CT 2.6)',
        databaseConfigured: isDatabaseConfigured(),
        devFixturesActive: isDevFixtureEnabled(),
        readOnlyEnforced: true,
      })
    );
  });

  app.get('/api/server/status', async (_req, res) => {
    const status = await getServerStatus();
    res.json(wrapEnvelope(status));
  });

  app.get('/api/server/stats', async (_req, res) => {
    const stats = await getServerStats();
    res.json(wrapEnvelope(stats));
  });

  app.get('/api/server/rates', async (_req, res) => {
    const rates = await getServerRates();
    res.json(wrapEnvelope(rates));
  });

  app.get('/api/rankings/pvp', async (req, res) => {
    const parsed = PaginationQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ ok: false, error: 'Invalid query parameters' });
      return;
    }
    const result = await getPvpRankings(parsed.data);
    res.json(wrapEnvelope(result));
  });

  app.get('/api/rankings/pk', async (req, res) => {
    const parsed = PaginationQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ ok: false, error: 'Invalid query parameters' });
      return;
    }
    const result = await getPkRankings(parsed.data);
    res.json(wrapEnvelope(result));
  });

  app.get('/api/rankings/clans', async (req, res) => {
    const parsed = PaginationQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ ok: false, error: 'Invalid query parameters' });
      return;
    }
    const result = await getClanRankings(parsed.data);
    res.json(wrapEnvelope(result));
  });

  app.get('/api/olympiad/rankings', async (req, res) => {
    const parsed = OlympiadRankingQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ ok: false, error: 'Invalid Olympiad query parameters' });
      return;
    }
    const result = await getOlympiadRankings(parsed.data);
    res.json(wrapEnvelope(result));
  });

  app.get('/api/olympiad/top-by-class', async (req, res) => {
    const parsed = OlympiadCycleQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ ok: false, error: 'Invalid Olympiad cycle' });
      return;
    }
    const result = await getOlympiadTopByClass(parsed.data.cycle);
    res.json(wrapEnvelope(result));
  });

  app.get('/api/olympiad/heroes', async (_req, res) => {
    const result = await getOlympiadHeroes();
    res.json(wrapEnvelope(result));
  });

  app.get('/api/castles', async (_req, res) => {
    const castles = await getCastles();
    res.json(wrapEnvelope(castles));
  });

  app.get('/api/raidbosses', async (_req, res) => {
    const bosses = await getRaidBosses();
    res.json(wrapEnvelope(bosses));
  });

  app.get('/api/events/tvt', async (_req, res) => {
    const tvt = await getTvtEventInfo();
    res.json(wrapEnvelope(tvt));
  });

  return app;
}