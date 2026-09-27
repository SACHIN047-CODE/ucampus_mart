import { Router } from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  createCategorySchema,
  updateCategorySchema,
} from '../controllers/category.controller.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.get('/', getCategories);
router.post('/', requireAuth, requireAdmin, validate(createCategorySchema), createCategory);
router.patch('/:id', requireAuth, requireAdmin, validate(updateCategorySchema), updateCategory);
router.delete('/:id', requireAuth, requireAdmin, deleteCategory);

export default router;
