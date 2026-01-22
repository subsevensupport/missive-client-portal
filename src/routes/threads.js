import { Router } from 'express';
import { threadController } from '../controllers/threadController.js';
import { requireAuth } from '../middleware/requireAuth.js';

export const threadRouter = Router();

threadRouter.get('/', requireAuth, threadController.showDashboard);
threadRouter.get('/threads/:id/content', requireAuth, threadController.getThreadContent);
