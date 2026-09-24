import { Types } from 'mongoose';
import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { Competition } from '../models/Competition';
import { Registration } from '../models/Registration';
import { PreviousWinner } from '../models/PreviousWinner';
import { Testimonial } from '../models/Testimonial';
import { buildView } from '../services/competitionState';
import { findCompetition } from '../services/competitionService';
import { cancelRegistration, registerForCompetition } from '../services/registrationService';

/** GET /api/v1/competitions — paginated list with computed state per item.
 *  Optional `q` (text search over title/category/tags) and `category` filters. */
export const listCompetitions = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, q, category } = req.query as unknown as {
    page: number;
    limit: number;
    q?: string;
    category?: string;
  };

  const filter: Record<string, unknown> = { status: { $ne: 'draft' } };
  if (q) {
    // Escape user input so it is treated literally, never as regex syntax
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const rx = new RegExp(escaped, 'i');
    filter.$or = [{ title: rx }, { category: rx }, { tags: rx }];
  }
  if (category) {
    filter.category = new RegExp(`^${category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
  }

  const [items, total] = await Promise.all([
    Competition.find(filter)
      .sort({ 'schedule.registrationCloseAt': 1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Competition.countDocuments(filter),
  ]);
  res.json({
    success: true,
    data: {
      items: items.map((comp) => ({
        ...comp.toJSON(),
        view: buildView(comp, null),
      })),
      page,
      limit,
      total,
    },
  });
});

/**
 * GET /api/v1/competitions/:idOrSlug
 * Aggregated detail: competition + server-computed view + winners + testimonials.
 * One request renders the entire screen — atomic snapshot, consistent state.
 */
export const getCompetition = asyncHandler(async (req: Request, res: Response) => {
  const comp = await findCompetition(req.params.idOrSlug ?? '');

  const [registration, winners, testimonials] = await Promise.all([
    req.user
      ? Registration.findOne({ competitionId: comp._id, userId: req.user.id, active: true })
      : Promise.resolve(null),
    PreviousWinner.find({ competitionId: comp._id }).sort({ position: 1 }),
    Testimonial.find().limit(10).sort({ createdAt: -1 }),
  ]);

  res.json({
    success: true,
    data: {
      competition: comp,
      view: buildView(comp, registration),
      winners,
      testimonials,
    },
  });
});

/** POST /api/v1/competitions/:idOrSlug/register — atomic spot booking. */
export const registerToCompetition = asyncHandler(async (req: Request, res: Response) => {
  const comp = await findCompetition(req.params.idOrSlug ?? '');
  const registration = await registerForCompetition(new Types.ObjectId(req.user!.id), comp);
  const fresh = await Competition.findById(comp._id);
  res.status(201).json({
    success: true,
    data: {
      registration,
      view: buildView(fresh ?? comp, registration),
    },
  });
});

/** DELETE /api/v1/competitions/:idOrSlug/registration — cancel + release spot. */
export const cancelMyRegistration = asyncHandler(async (req: Request, res: Response) => {
  const comp = await findCompetition(req.params.idOrSlug ?? '');
  await cancelRegistration(new Types.ObjectId(req.user!.id), comp);
  const fresh = await Competition.findById(comp._id);
  res.json({
    success: true,
    data: {
      registration: null,
      view: buildView(fresh ?? comp, null),
    },
  });
});
