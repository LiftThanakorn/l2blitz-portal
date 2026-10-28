import { Router } from 'express';
import { z } from 'zod';
import {
  getHealthStatus,
  getServerStatus,
  getServerStats,
  getServerRates,
  getPlayerRankings,
  getClanRankings,
  getOlympiadHeroes,
  getOlympiadRankings,
  getCastles,
  getRaidBosses,
  getTvtEventInfo,
} from '../services/portalService.js';

export const apiRouter = Router();

const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(100).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(15),
  classId: z
    .string()
    .optional()
    .transform((v) => (v && v.trim() !== '' ? Number(v) : null))
    .refine((v) => v === null || (!Number.isNaN(v) && v >= 0 && v <= 136), {
      message: 'Invalid High Five classId (must be 0–136)',
    }),
  q: z
    .string()
    .max(35)
    .optional()
    .transform((v) => (v && v.trim() !== '' ? v.trim() : null)),
});

apiRouter.get('/health', async (_req, res, next) => {
  try {
    const data = await getHealthStatus();
    res.json(data);
  } catch (err) {
    next(err);
  }
});

apiRouter.get('/server/status', async (_req, res, next) => {
  try {
    const data = await getServerStatus();
    res.json(data);
  } catch (err) {
    next(err);
  }
});

apiRouter.get('/server/stats', async (_req, res, next) => {
  try {
    const data = await getServerStats();
    res.json(data);
  } catch (err) {
    next(err);
  }
});

apiRouter.get('/server/rates', async (_req, res, next) => {
  try {
    const data = await getServerRates();
    res.json(data);
  } catch (err) {
    next(err);
  }
});

apiRouter.get('/rankings/pvp', async (req, res, next) => {
  try {
    const parsed = PaginationQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({
        error: 'Validation Error',
        details: parsed.error.flatten(),
      });
      return;
    }

    const data = await getPlayerRankings({
      type: 'pvp',
      page: parsed.data.page,
      limit: parsed.data.limit,
      classFilter: parsed.data.classId,
      searchQuery: parsed.data.q,
    });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

apiRouter.get('/rankings/pk', async (req, res, next) => {
  try {
    const parsed = PaginationQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({
        error: 'Validation Error',
        details: parsed.error.flatten(),
      });
      return;
    }

    const data = await getPlayerRankings({
      type: 'pk',
      page: parsed.data.page,
      limit: parsed.data.limit,
      classFilter: parsed.data.classId,
      searchQuery: parsed.data.q,
    });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

apiRouter.get('/rankings/clans', async (req, res, next) => {
  try {
    const parsed = PaginationQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({
        error: 'Validation Error',
        details: parsed.error.flatten(),
      });
      return;
    }

    const data = await getClanRankings({
      page: parsed.data.page,
      limit: parsed.data.limit,
    });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

apiRouter.get('/olympiad/heroes', async (_req, res, next) => {
  try {
    const data = await getOlympiadHeroes();
    res.json(data);
  } catch (err) {
    next(err);
  }
});

apiRouter.get('/olympiad/rankings', async (req, res, next) => {
  try {
    const classIdQuery = req.query.classId;
    let selectedClassId: number | null = null;
    if (classIdQuery && typeof classIdQuery === 'string' && classIdQuery.trim() !== '') {
      const num = Number(classIdQuery.trim());
      if (!Number.isNaN(num) && num >= 0 && num <= 136) {
        selectedClassId = num;
      }
    }

    const cycleType = req.query.cycle === 'previous' ? 'previous' : 'current';
    const page = Math.max(1, Math.min(100, Number(req.query.page) || 1));
    const limit = Math.max(1, Math.min(50, Number(req.query.limit) || 3));

    const data = await getOlympiadRankings({
      cycleType,
      selectedClassId,
      page,
      limit,
    });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

apiRouter.get('/castles', async (_req, res, next) => {
  try {
    const data = await getCastles();
    res.json(data);
  } catch (err) {
    next(err);
  }
});

apiRouter.get('/raidbosses', async (_req, res, next) => {
  try {
    const data = await getRaidBosses();
    res.json(data);
  } catch (err) {
    next(err);
  }
});

apiRouter.get('/events/tvt', async (_req, res, next) => {
  try {
    const data = await getTvtEventInfo();
    res.json(data);
  } catch (err) {
    next(err);
  }
});
