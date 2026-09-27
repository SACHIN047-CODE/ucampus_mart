import { Router } from 'express';
import { uploadImages, presignUpload } from '../controllers/upload.controller.js';
import { upload } from '../middleware/upload.js';
import { requireAuth, requireVerified } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth, requireVerified);

// Accepts up to 6 image files under field 'images' or single 'image'
router.post('/', upload.array('images', 6), uploadImages);
router.post('/single', upload.single('image'), uploadImages);
router.post('/presign', presignUpload);

export default router;
