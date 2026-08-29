import { Router, Request, Response } from 'express';
import prisma from '@/database/client';

const router = Router();

/**
 * GET /health & GET /api/health
 * Verifies Node server uptime and PostgreSQL database connection.
 */
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      status: 'success',
      code: 'HEALTH_OK',
      message: 'Service is operational',
      data: {
        uptime: parseFloat(process.uptime().toFixed(2)),
        timestamp: new Date().toISOString(),
        database: 'connected',
      },
    });
  } catch {
    res.status(503).json({
      status: 'error',
      code: 'SERVICE_UNAVAILABLE',
      message: 'Database connection failed',
      data: {
        uptime: parseFloat(process.uptime().toFixed(2)),
        timestamp: new Date().toISOString(),
        database: 'disconnected',
      },
    });
  }
});

export default router;
