import { Request, Response, NextFunction } from 'express';
import { ReferenceRepository } from '@/repositories/reference.repository';

/**
 * Reference data controller — departments, countries, currencies.
 */
export class ReferenceController {
  constructor(private readonly repo: ReferenceRepository = new ReferenceRepository()) {}

  /**
   * GET /api/departments
   */
  getDepartments = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.repo.getDepartments();
      res.status(200).json({
        status: 'success',
        code: 'DEPARTMENTS_RETRIEVED',
        message: 'Departments retrieved successfully',
        data,
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET /api/countries
   */
  getCountries = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.repo.getCountries();
      res.status(200).json({
        status: 'success',
        code: 'COUNTRIES_RETRIEVED',
        message: 'Countries retrieved successfully',
        data,
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET /api/currencies
   */
  getCurrencies = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.repo.getCurrencies();
      res.status(200).json({
        status: 'success',
        code: 'CURRENCIES_RETRIEVED',
        message: 'Currencies retrieved successfully',
        data,
      });
    } catch (err) {
      next(err);
    }
  };
}
