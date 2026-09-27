import { Router } from 'express';
import {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
  createConversationSchema,
  sendMessageSchema,
} from '../controllers/conversation.controller.js';
import { requireAuth, requireVerified } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(requireAuth);

router.get('/', getConversations);
router.post('/', requireVerified, validate(createConversationSchema), getOrCreateConversation);
router.get('/:id/messages', getMessages);
router.post('/:id/messages', validate(sendMessageSchema), sendMessage);

export default router;
