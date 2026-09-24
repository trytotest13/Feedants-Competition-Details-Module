import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { Request, Response } from 'express';
import multer from 'multer';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { config } from '../config/env';
import { Submission, SubmissionMedia } from '../models/Submission';
import { Registration } from '../models/Registration';
import { CompetitionDocument } from '../models/Competition';
import { computeLifecycle } from '../services/competitionState';
import { findCompetition } from '../services/competitionService';

const IMAGE_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const VIDEO_MIMES = new Set(['video/mp4', 'video/quicktime']);
const MAX_FILES = 3;
const ALLOWED = new Set([...IMAGE_MIMES, ...VIDEO_MIMES]);

// Restrictive upload filter: allowed mime types only, UUID filenames, size-capped
export const submissionUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, config.uploadDirAbsolute),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase().slice(0, 10);
      cb(null, `${randomUUID()}${ext}`);
    },
  }),
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED.has(file.mimetype)) {
      cb(new ApiError(422, 'UNSUPPORTED_MEDIA', `File type ${file.mimetype} is not allowed`));
      return;
    }
    cb(null, true);
  },
  limits: { fileSize: config.MAX_UPLOAD_MB * 1024 * 1024, files: MAX_FILES },
}).array('media', MAX_FILES);

function mediaKind(mime: string): 'image' | 'video' {
  return IMAGE_MIMES.has(mime) ? 'image' : 'video';
}

/**
 * POST /api/v1/competitions/:idOrSlug/submission
 * Guards: confirmed (paid) registration + inside submission window.
 * Re-uploading while the window is open replaces the previous media.
 */
export const uploadSubmission = asyncHandler(async (req: Request, res: Response) => {
  const comp = await findCompetition(req.params.idOrSlug ?? '');
  const userId = req.user!.id;

  const registration = await Registration.findOne({
    competitionId: comp._id,
    userId,
    active: true,
  });
  if (!registration) {
    throw ApiError.forbidden('Register for this competition before uploading a submission');
  }
  if (registration.status !== 'confirmed') {
    throw ApiError.paymentRequired('Complete your entry-fee payment first');
  }
  if (computeLifecycle(comp) !== 'submission_open') {
    const s = comp.schedule;
    const message =
      new Date() < s.submissionStartAt
        ? `Submissions open on ${s.submissionStartAt.toISOString()}`
        : 'The submission window has closed';
    throw ApiError.unprocessable('SUBMISSION_WINDOW_CLOSED', message);
  }

  const files = (req.files as Express.Multer.File[]) ?? [];
  if (files.length === 0) {
    throw ApiError.badRequest('Attach at least one media file (field "media")');
  }

  const media: SubmissionMedia[] = files.map((f) => ({
    url: `${config.PUBLIC_BASE_URL}/uploads/${f.filename}`,
    mime: f.mimetype,
    size: f.size,
    kind: mediaKind(f.mimetype),
  }));

  const title = typeof req.body.title === 'string' ? req.body.title.slice(0, 120) : '';

  const submission = await Submission.findOneAndUpdate(
    { competitionId: comp._id, userId },
    { $set: { registrationId: registration._id, title, media, status: 'submitted' } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  res.status(201).json({ success: true, data: { submission } });
});

/** GET /api/v1/competitions/:idOrSlug/submission — my current submission, if any. */
export const getMySubmission = asyncHandler(async (req: Request, res: Response) => {
  const comp = await findCompetition(req.params.idOrSlug ?? '');
  const submission = await Submission.findOne({
    competitionId: comp._id,
    userId: req.user!.id,
  });
  res.json({ success: true, data: { submission } });
});
