import { Router, Request, Response } from 'express';
import { rateLimiter } from '../middleware/rateLimiter.js';
import { success } from '../utils/response.js';

const router = Router();

// Strict rate limiting on auth endpoints
router.use(rateLimiter({ windowMs: 15 * 60 * 1000, max: 20, message: 'Too many auth attempts' }));

/** POST /api/auth/register */
router.post('/register', (_req: Request, res: Response) => {
  // Phase 1.1 implementation placeholder
  success(res, { message: 'Registration endpoint ready. Full implementation in Phase 1.1.' }, 'Register endpoint', 200);
});

/** POST /api/auth/login */
router.post('/login', (_req: Request, res: Response) => {
  success(res, { message: 'Login endpoint ready. Full implementation in Phase 1.1.' }, 'Login endpoint', 200);
});

/** POST /api/auth/logout */
router.post('/logout', (_req: Request, res: Response) => {
  success(res, { message: 'Logged out successfully' }, 'Logout', 200);
});

/** POST /api/auth/refresh */
router.post('/refresh', (_req: Request, res: Response) => {
  success(res, { message: 'Token refresh endpoint ready. Full implementation in Phase 1.1.' }, 'Refresh endpoint', 200);
});

/** GET /api/auth/me */
router.get('/me', (_req: Request, res: Response) => {
  success(res, { message: 'Profile endpoint ready. Full implementation in Phase 1.1.' }, 'Me endpoint', 200);
});

export default router;
