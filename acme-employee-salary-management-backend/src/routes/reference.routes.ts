import { Router } from 'express';
import { ReferenceController } from '@/controllers/reference.controller';

const router = Router();
const controller = new ReferenceController();

// GET /api/departments
router.get('/departments', controller.getDepartments);

// GET /api/countries
router.get('/countries', controller.getCountries);

// GET /api/currencies
router.get('/currencies', controller.getCurrencies);

export default router;
