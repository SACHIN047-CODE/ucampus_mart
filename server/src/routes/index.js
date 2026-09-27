import { Router } from 'express';
import authRoutes from './auth.routes.js';
import listingRoutes from './listing.routes.js';
import categoryRoutes from './category.routes.js';
import wishlistRoutes from './wishlist.routes.js';
import conversationRoutes from './conversation.routes.js';
import notificationRoutes from './notification.routes.js';
import reportRoutes from './report.routes.js';
import adminRoutes from './admin.routes.js';
import uploadRoutes from './upload.routes.js';
import healthRoutes from './health.routes.js';

const apiRouter = Router();

// Versioned routes under /api/v1
apiRouter.use('/auth', authRoutes);
apiRouter.use('/listings', listingRoutes);
apiRouter.use('/categories', categoryRoutes);
apiRouter.use('/me/wishlist', wishlistRoutes);
apiRouter.use('/conversations', conversationRoutes);
apiRouter.use('/me/notifications', notificationRoutes);
apiRouter.use('/reports', reportRoutes);
apiRouter.use('/admin', adminRoutes);
apiRouter.use('/uploads', uploadRoutes);
apiRouter.use('/health', healthRoutes);

export default apiRouter;
