import { Router } from 'express';
import { createReport, createReportSchema } from '../controllers/report.controller.js';
import { requireAuth, requireVerified } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/', requireAuth, requireVerified, authLimiter, validate(createReportSchema), createReport);

export default router;
