import { Router } from 'express';
import { EmployeeController } from '@/controllers/employee.controller';

const router = Router();
const controller = new EmployeeController();

// GET  /api/employees
router.get('/', controller.listEmployees);

// POST /api/employees
router.post('/', controller.createEmployee);

// PUT  /api/employees/:employeeId
router.put('/:employeeId', controller.updateEmployee);

// PATCH /api/employees/:employeeId/deactivate
router.patch('/:employeeId/deactivate', controller.deactivateEmployee);

export default router;
