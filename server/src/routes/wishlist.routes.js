import { Router } from 'express';
import {
  getMyWishlist,
  addToWishlist,
  removeFromWishlist,
} from '../controllers/wishlist.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/', getMyWishlist);
router.post('/:listingId', addToWishlist);
router.put('/:listingId', addToWishlist);
router.delete('/:listingId', removeFromWishlist);

export default router;
