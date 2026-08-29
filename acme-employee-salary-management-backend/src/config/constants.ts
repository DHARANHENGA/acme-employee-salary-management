/**
 * Global application constants.
 */

export const DEFAULT_REPORTING_CURRENCY = 'USD';

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

export const EMPLOYEE_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;

export const EMPLOYEE_ID_CONFIG = {
  PREFIX: 'EMP-',
  PAD_LENGTH: 5,
} as const;

export const SALARY_BANDS = [
  '<25K',
  '25K-50K',
  '50K-75K',
  '75K-100K',
  '100K-150K',
  '>150K',
] as const;

export type SalaryBandLabel = (typeof SALARY_BANDS)[number];

export const SALARY_BAND_THRESHOLDS = {
  BAND_1: 25_000,
  BAND_2: 50_000,
  BAND_3: 75_000,
  BAND_4: 100_000,
  BAND_5: 150_000,
} as const;
