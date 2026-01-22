import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { authLimiter } from '../middleware/rateLimiter.js';

export const authRouter = Router();

authRouter.get('/login', authController.showLogin);
authRouter.post('/auth/request-link', authLimiter, authController.requestMagicLink);
authRouter.get('/auth/verify', authController.verifyToken);
authRouter.post('/logout', authController.logout);
