import { Router } from 'express';
import {
  getMetrics,
  getReports,
  resolveReport,
  getUsers,
  updateUserStatus,
  getAllListings,
  moderateListing,
  getAudits,
  resolveReportSchema,
  updateUserStatusSchema,
  moderateListingSchema,
} from '../controllers/admin.controller.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// Enforce authentication & administrator role on ALL admin routes
router.use(requireAuth, requireAdmin);

router.get('/metrics', getMetrics);
router.get('/reports', getReports);
router.patch('/reports/:id', validate(resolveReportSchema), resolveReport);
router.get('/users', getUsers);
router.patch('/users/:id/status', validate(updateUserStatusSchema), updateUserStatus);
router.get('/listings', getAllListings);
router.patch('/listings/:id/moderate', validate(moderateListingSchema), moderateListing);
router.get('/audits', getAudits);

export default router;
