import { Router } from 'express';
import { success } from '../utils/response.js';

const router = Router();

router.get('/', (_req, res) => {
  success(res, {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '0.1.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: Math.floor(process.uptime()),
  }, 'Avenik API is running');
});

export default router;
