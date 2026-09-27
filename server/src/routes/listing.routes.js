import { Router } from 'express';
import {
  getListings,
  getListingById,
  createListing,
  updateListing,
  markListingAsSold,
  archiveListing,
  deleteListing,
  getMyListings,
  getSellerListings,
  createListingSchema,
  updateListingSchema,
} from '../controllers/listing.controller.js';
import { requireAuth, requireVerified, optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// Public discovery routes
router.get('/', getListings);
router.get('/seller/:sellerId', getSellerListings);
router.get('/my/all', requireAuth, getMyListings);
router.get('/:id', optionalAuth, getListingById);

// Protected authenticated routes
router.post('/', requireAuth, requireVerified, validate(createListingSchema), createListing);
router.patch('/:id', requireAuth, validate(updateListingSchema), updateListing);
router.post('/:id/sold', requireAuth, markListingAsSold);
router.post('/:id/archive', requireAuth, archiveListing);
router.delete('/:id', requireAuth, deleteListing);

export default router;
