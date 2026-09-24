import { Router } from 'express';
import { registerSchema, loginSchema } from '../validators/auth';
import { competitionIdParam, listQuerySchema } from '../validators/competition';
import { validate } from '../middleware/validate';
import { attachUserIfPresent, requireAuth } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimit';
import * as auth from '../controllers/authController';
import * as competitions from '../controllers/competitionController';
import * as submissions from '../controllers/submissionController';
import * as referrals from '../controllers/referralController';
import * as payments from '../controllers/paymentController';
import { submissionUpload } from '../controllers/submissionController';

const router = Router();

// ── Auth ─────────────────────────────────────────────
router.post('/auth/register', authLimiter, validate(registerSchema), auth.register);
router.post('/auth/login', authLimiter, validate(loginSchema), auth.login);
router.get('/auth/me', requireAuth, auth.me);

// ── Competitions ─────────────────────────────────────
router.get(
  '/competitions',
  attachUserIfPresent,
  validate(listQuerySchema, 'query'),
  competitions.listCompetitions,
);
router.get('/competitions/:idOrSlug', attachUserIfPresent, validate(competitionIdParam, 'params'), competitions.getCompetition);
router.post('/competitions/:idOrSlug/register', requireAuth, validate(competitionIdParam, 'params'), competitions.registerToCompetition);
router.delete('/competitions/:idOrSlug/registration', requireAuth, validate(competitionIdParam, 'params'), competitions.cancelMyRegistration);

// ── Submissions (multipart) ──────────────────────────
router.post(
  '/competitions/:idOrSlug/submission',
  requireAuth,
  validate(competitionIdParam, 'params'),
  submissionUpload,
  submissions.uploadSubmission,
);
router.get('/competitions/:idOrSlug/submission', requireAuth, validate(competitionIdParam, 'params'), submissions.getMySubmission);

// ── Referrals ────────────────────────────────────────
router.get('/referrals/me', requireAuth, referrals.myReferrals);

// ── Payments ─────────────────────────────────────────
router.post('/payments/order', requireAuth, payments.createOrder);

export default router;
