import { Request, Response, NextFunction } from 'express';
import { AnalyticsQuerySchema } from '@/middleware/validation';
import { AnalyticsService } from '@/services/analytics.service';

/**
 * Analytics controller — handles analytics HTTP request/response lifecycle.
 */
export class AnalyticsController {
  constructor(private readonly service: AnalyticsService = new AnalyticsService()) {}

  /**
   * GET /api/analytics
   */
  getAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = AnalyticsQuerySchema.parse(req.query);
      const data = await this.service.getAnalytics(filters);

      res.status(200).json({
        status: 'success',
        code: 'ANALYTICS_RETRIEVED',
        message: 'Salary analytics retrieved successfully',
        data,
      });
    } catch (err) {
      next(err);
    }
  };
}
