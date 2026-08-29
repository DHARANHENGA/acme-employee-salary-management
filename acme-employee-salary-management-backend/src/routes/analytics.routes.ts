import { Router } from 'express';
import { AnalyticsController } from '@/controllers/analytics.controller';

const router = Router();
const controller = new AnalyticsController();

// GET /api/analytics
router.get('/', controller.getAnalytics);

export default router;
