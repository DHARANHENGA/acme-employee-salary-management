import { Request, Response, NextFunction } from 'express';
import {
  CreateEmployeeSchema,
  UpdateEmployeeSchema,
  EmployeeQuerySchema,
} from '@/middleware/validation';
import { EmployeeService } from '@/services/employee.service';

/**
 * Employee controller — handles HTTP request/response lifecycle.
 * Delegates business logic entirely to EmployeeService.
 */
export class EmployeeController {
  constructor(private readonly service: EmployeeService = new EmployeeService()) {}

  /**
   * GET /api/employees
   */
  listEmployees = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = EmployeeQuerySchema.parse(req.query);
      const result = await this.service.listEmployees(filters);

      res.status(200).json({
        status: 'success',
        code: 'EMPLOYEES_RETRIEVED',
        message: 'Employees retrieved successfully',
        data: result.data,
        pagination: result.pagination,
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * POST /api/employees
   */
  createEmployee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input = CreateEmployeeSchema.parse(req.body);
      const employee = await this.service.createEmployee(input);

      res.status(201).json({
        status: 'success',
        code: 'EMPLOYEE_CREATED',
        message: 'Employee created successfully',
        data: employee,
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * PUT /api/employees/:employeeId
   */
  updateEmployee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { employeeId } = req.params as { employeeId: string };
      const input = UpdateEmployeeSchema.parse(req.body);
      await this.service.updateEmployee(employeeId, input);

      res.status(200).json({
        status: 'success',
        code: 'EMPLOYEE_UPDATED',
        message: 'Employee updated successfully',
        data: null,
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * PATCH /api/employees/:employeeId/deactivate
   */
  deactivateEmployee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { employeeId } = req.params as { employeeId: string };
      await this.service.deactivateEmployee(employeeId);

      res.status(200).json({
        status: 'success',
        code: 'EMPLOYEE_DEACTIVATED',
        message: 'Employee deactivated successfully',
        data: null,
      });
    } catch (err) {
      next(err);
    }
  };
}
