import { z } from 'zod';
export const PaginationQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().max(64).optional().default(''),
    sort: z.string().trim().optional(),
});
export const OlympiadRankingQuerySchema = z.object({
    classId: z.coerce.number().int().min(88).max(136).optional(),
    cycle: z.enum(['current', 'previous']).default('current'),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
});
