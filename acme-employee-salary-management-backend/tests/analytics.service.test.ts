import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnalyticsService } from '@/services/analytics.service';
import { AnalyticsRepository } from '@/repositories/analytics.repository';

// Mock the repository so getAnalytics tests run without a database
vi.mock('@/repositories/analytics.repository');

// ─── Fixtures ────────────────────────────────────────────────

/** Builds a minimal employee salary row as returned by AnalyticsRepository */
const makeRow = (
  salary: number,
  currencyCode: string,
  rateToUsd: number,
  department: string,
  country: string
) => ({
  baseSalary: salary,
  status: 'ACTIVE',
  department: { name: department },
  country: { name: country },
  currency: {
    code: currencyCode,
    exchangeRate: { rateToUsd },
  },
});

// ─── convertToUsd ─────────────────────────────────────────────

describe('AnalyticsService.convertToUsd', () => {
  let service: AnalyticsService;

  beforeEach(() => {
    service = new AnalyticsService();
  });

  it('converts INR to USD correctly (rate 0.012)', () => {
    expect(service.convertToUsd(1_500_000, 'INR', 0.012)).toBeCloseTo(18_000, 2);
  });

  it('returns the same amount when currency is USD (rate 1.0)', () => {
    expect(service.convertToUsd(75_000, 'USD', 1.0)).toBeCloseTo(75_000, 2);
  });

  it('returns 0 when amount is 0', () => {
    expect(service.convertToUsd(0, 'INR', 0.012)).toBe(0);
  });

  it('handles GBP to USD (rate 1.27)', () => {
    expect(service.convertToUsd(50_000, 'GBP', 1.27)).toBeCloseTo(63_500, 2);
  });
});

// ─── calculateMedian ──────────────────────────────────────────

describe('AnalyticsService.calculateMedian', () => {
  let service: AnalyticsService;

  beforeEach(() => {
    service = new AnalyticsService();
  });

  it('returns 0 for an empty array', () => {
    expect(service.calculateMedian([])).toBe(0);
  });

  it('returns the single value for a one-element array', () => {
    expect(service.calculateMedian([42_000])).toBe(42_000);
  });

  it('returns the middle value for an odd-length sorted array', () => {
    expect(service.calculateMedian([30_000, 50_000, 70_000])).toBe(50_000);
  });

  it('returns the average of two middle values for an even-length array', () => {
    expect(service.calculateMedian([30_000, 50_000, 60_000, 80_000])).toBe(55_000);
  });

  it('handles an unsorted input array', () => {
    expect(service.calculateMedian([80_000, 30_000, 50_000])).toBe(50_000);
  });

  it('handles duplicate values correctly', () => {
    expect(service.calculateMedian([50_000, 50_000, 50_000])).toBe(50_000);
  });
});

// ─── getSalaryBand ────────────────────────────────────────────

describe('AnalyticsService.getSalaryBand', () => {
  let service: AnalyticsService;

  beforeEach(() => {
    service = new AnalyticsService();
  });

  it('returns "<25K" for salary below 25,000 USD', () => {
    expect(service.getSalaryBand(10_000)).toBe('<25K');
  });

  it('returns "25K-50K" for salary in range [25000, 50000)', () => {
    expect(service.getSalaryBand(25_000)).toBe('25K-50K');
    expect(service.getSalaryBand(49_999)).toBe('25K-50K');
  });

  it('returns "50K-75K" for salary in range [50000, 75000)', () => {
    expect(service.getSalaryBand(50_000)).toBe('50K-75K');
    expect(service.getSalaryBand(74_999)).toBe('50K-75K');
  });

  it('returns "75K-100K" for salary in range [75000, 100000)', () => {
    expect(service.getSalaryBand(75_000)).toBe('75K-100K');
    expect(service.getSalaryBand(99_999)).toBe('75K-100K');
  });

  it('returns "100K-150K" for salary in range [100000, 150000)', () => {
    expect(service.getSalaryBand(100_000)).toBe('100K-150K');
    expect(service.getSalaryBand(149_999)).toBe('100K-150K');
  });

  it('returns ">150K" for salary >= 150,000 USD', () => {
    expect(service.getSalaryBand(150_000)).toBe('>150K');
    expect(service.getSalaryBand(300_000)).toBe('>150K');
  });
});

// ─── getAnalytics response shape (mocked repository) ─────────

describe('AnalyticsService.getAnalytics response shape', () => {
  let service: AnalyticsService;
  let mockRepo: AnalyticsRepository;

  beforeEach(() => {
    mockRepo = new AnalyticsRepository() as vi.Mocked<AnalyticsRepository>;
    // 4 employees across 2 countries and 2 departments
    vi.mocked(mockRepo.getEmployeeSalaryData).mockResolvedValue([
      makeRow(75_000, 'USD', 1.0, 'Engineering', 'USA'),
      makeRow(60_000, 'USD', 1.0, 'Engineering', 'USA'),
      makeRow(1_500_000, 'INR', 0.012, 'HR', 'India'),
      makeRow(1_200_000, 'INR', 0.012, 'HR', 'India'),
    ] as never);
    service = new AnalyticsService(mockRepo);
  });

  it('returns required top-level keys', async () => {
    const result = await service.getAnalytics({});
    expect(result).toHaveProperty('summary');
    expect(result).toHaveProperty('byCountry');
    expect(result).toHaveProperty('byDepartment');
    expect(result).toHaveProperty('salaryBands');
  });

  it('summary contains all required fields', async () => {
    const { summary } = await service.getAnalytics({});
    expect(summary).toHaveProperty('totalPayroll');
    expect(summary).toHaveProperty('averageSalary');
    expect(summary).toHaveProperty('medianSalary');
    expect(summary).toHaveProperty('employeeCount');
    expect(summary).toHaveProperty('currency');
    expect(summary.currency).toBe('USD');
  });

  it('summary employeeCount matches mocked data', async () => {
    const { summary } = await service.getAnalytics({});
    expect(summary.employeeCount).toBe(4);
  });

  it('byCountry is an array with one entry per country', async () => {
    const { byCountry } = await service.getAnalytics({});
    expect(Array.isArray(byCountry)).toBe(true);
    expect(byCountry).toHaveLength(2);
  });

  it('byDepartment is an array with one entry per department', async () => {
    const { byDepartment } = await service.getAnalytics({});
    expect(Array.isArray(byDepartment)).toBe(true);
    expect(byDepartment).toHaveLength(2);
  });

  it('salaryBands percentages sum to ~100', async () => {
    const { salaryBands } = await service.getAnalytics({});
    expect(Array.isArray(salaryBands)).toBe(true);
    const total = salaryBands.reduce((sum, b) => sum + b.percentage, 0);
    expect(total).toBeCloseTo(100, 1);
  });

  it('each byCountry entry reports in USD', async () => {
    const { byCountry } = await service.getAnalytics({});
    for (const entry of byCountry) {
      expect(entry.currency).toBe('USD');
    }
  });

  it('each byDepartment entry reports in USD', async () => {
    const { byDepartment } = await service.getAnalytics({});
    for (const entry of byDepartment) {
      expect(entry.currency).toBe('USD');
    }
  });

  it('totalPayroll equals sum of all USD-converted salaries', async () => {
    const { summary } = await service.getAnalytics({});
    // 75000 + 60000 + (1500000*0.012) + (1200000*0.012) = 75000+60000+18000+14400 = 167400
    expect(summary.totalPayroll).toBeCloseTo(167_400, 1);
  });
});
