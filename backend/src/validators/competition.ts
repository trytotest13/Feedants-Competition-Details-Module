import { z } from 'zod';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');
const slug = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug');

/** Accepts either a Mongo ObjectId or a competition slug. */
export const competitionIdParam = z.object({
  idOrSlug: z.union([objectId, slug]),
});

export const listQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
  })
  .strict();

/** Submission upload — body fields are whitelisted; files validated by multer + controller. */
export const submissionSchema = z
  .object({
    title: z.string().trim().max(120).optional().default(''),
  })
  .strict();
