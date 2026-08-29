import { z } from 'zod';
import { PAGINATION, EMPLOYEE_STATUS } from '@/config/constants';

export const CreateEmployeeSchema = z.object({
  name: z.string().trim().min(1, 'Name cannot be empty or whitespace only').max(150),
  departmentId: z.number().int().positive(),
  jobTitle: z.string().trim().min(1, 'Job title cannot be empty or whitespace only').max(100),
  countryId: z.number().int().positive(),
  dateJoined: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  salary: z.number().min(0),
});

export const UpdateEmployeeSchema = z.object({
  name: z.string().trim().min(1, 'Name cannot be empty or whitespace only').max(150),
  departmentId: z.number().int().positive(),
  jobTitle: z.string().trim().min(1, 'Job title cannot be empty or whitespace only').max(100),
  countryId: z.number().int().positive(),
  dateJoined: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  salary: z.number().min(0),
});

export const EmployeeQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(PAGINATION.DEFAULT_PAGE),
  limit: z.coerce.number().int().min(1).max(PAGINATION.MAX_LIMIT).default(PAGINATION.DEFAULT_LIMIT),
  search: z
    .string()
    .trim()
    .min(1, 'Search term cannot be empty or whitespace only')
    .optional(),
  departmentId: z.coerce.number().int().positive().optional(),
  countryId: z.coerce.number().int().positive().optional(),
  status: z.enum([EMPLOYEE_STATUS.ACTIVE, EMPLOYEE_STATUS.INACTIVE]).optional(),
});

export const AnalyticsQuerySchema = z.object({
  countryId: z.coerce.number().int().positive().optional(),
  departmentId: z.coerce.number().int().positive().optional(),
  status: z.enum([EMPLOYEE_STATUS.ACTIVE, EMPLOYEE_STATUS.INACTIVE]).optional(),
});
