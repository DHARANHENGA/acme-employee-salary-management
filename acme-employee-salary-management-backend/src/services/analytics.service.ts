import { AnalyticsData, AnalyticsFilters, SalaryBand } from '../types/analytics.types';
import { AnalyticsRepository } from '../repositories/analytics.repository';
import {
  DEFAULT_REPORTING_CURRENCY,
  SALARY_BANDS,
  SALARY_BAND_THRESHOLDS,
} from '../config/constants';

/**
 * Analytics service — salary analytics and currency conversion logic.
 */
export class AnalyticsService {
  constructor(private readonly repo: AnalyticsRepository = new AnalyticsRepository()) {}

  /**
   * Calculates full salary analytics for the (optionally filtered) employee set.
   * All monetary values are normalised to USD using the seeded exchange rates.
   */
  async getAnalytics(filters: AnalyticsFilters): Promise<AnalyticsData> {
    if (
      typeof this.repo.getSummary === 'function' &&
      typeof this.repo.getByCountry === 'function' &&
      typeof this.repo.getByDepartment === 'function' &&
      typeof this.repo.getSalaryBands === 'function'
    ) {
      const [summary, byCountry, byDepartment, salaryBands] = await Promise.all([
        this.repo.getSummary(filters),
        this.repo.getByCountry(filters),
        this.repo.getByDepartment(filters),
        this.repo.getSalaryBands(filters),
      ]);

      if (summary && byCountry && byDepartment && salaryBands) {
        return { summary, byCountry, byDepartment, salaryBands };
      }
    }

    const employees = await this.repo.getEmployeeSalaryData(filters);

    const salariesUsd = employees.map((e: { baseSalary: unknown; currency: { code: string; exchangeRate?: { rateToUsd: unknown } | null } }) => {
      const rate = e.currency.exchangeRate?.rateToUsd
        ? Number(e.currency.exchangeRate.rateToUsd)
        : 1;
      return this.convertToUsd(Number(e.baseSalary), e.currency.code, rate);
    });

    const totalPayroll = salariesUsd.reduce((sum: number, s: number) => sum + s, 0);
    const employeeCount = salariesUsd.length;
    const averageSalary = employeeCount > 0 ? totalPayroll / employeeCount : 0;
    const medianSalary = this.calculateMedian(salariesUsd);

    // ── By country ───────────────────────────────────────────
    const countryMap = new Map<string, number[]>();
    for (let i = 0; i < employees.length; i++) {
      const country = employees[i]!.country.name;
      const usd = salariesUsd[i]!;
      if (!countryMap.has(country)) countryMap.set(country, []);
      countryMap.get(country)!.push(usd);
    }

    const byCountry = Array.from(countryMap.entries()).map(([country, amounts]) => ({
      country,
      employeeCount: amounts.length,
      averageSalary: amounts.reduce((s, v) => s + v, 0) / amounts.length,
      medianSalary: this.calculateMedian(amounts),
      totalPayroll: amounts.reduce((s, v) => s + v, 0),
      currency: 'USD',
    }));

    // ── By department ─────────────────────────────────────────
    const deptMap = new Map<string, number[]>();
    for (let i = 0; i < employees.length; i++) {
      const dept = employees[i]!.department.name;
      const usd = salariesUsd[i]!;
      if (!deptMap.has(dept)) deptMap.set(dept, []);
      deptMap.get(dept)!.push(usd);
    }

    const byDepartment = Array.from(deptMap.entries()).map(([department, amounts]) => ({
      department,
      employeeCount: amounts.length,
      averageSalary: amounts.reduce((s, v) => s + v, 0) / amounts.length,
      medianSalary: this.calculateMedian(amounts),
      totalPayroll: amounts.reduce((s, v) => s + v, 0),
      currency: 'USD',
    }));

    // ── Salary bands ──────────────────────────────────────────
    const bandCounts = new Map<string, number>();
    for (const usd of salariesUsd) {
      const band = this.getSalaryBand(usd);
      bandCounts.set(band, (bandCounts.get(band) ?? 0) + 1);
    }

    const salaryBands: SalaryBand[] = SALARY_BANDS.map((band) => {
      const count = bandCounts.get(band) ?? 0;
      return {
        band,
        employeeCount: count,
        percentage: employeeCount > 0
          ? parseFloat(((count / employeeCount) * 100).toFixed(2))
          : 0,
      };
    });

    return {
      summary: {
        totalPayroll: parseFloat(totalPayroll.toFixed(2)),
        averageSalary: parseFloat(averageSalary.toFixed(2)),
        medianSalary: parseFloat(medianSalary.toFixed(2)),
        employeeCount,
        currency: DEFAULT_REPORTING_CURRENCY,
      },
      byCountry,
      byDepartment,
      salaryBands,
    };
  }

  /**
   * Converts an amount from a native currency to USD using the given rate.
   */
  convertToUsd(amount: number, _currencyCode: string, rateToUsd: number): number {
    return amount * rateToUsd;
  }

  /**
   * Calculates the median of an array of numbers.
   * Returns 0 for an empty array.
   */
  calculateMedian(values: number[]): number {
    if (values.length === 0) return 0;

    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 1) {
      return sorted[mid]!;
    }

    return (sorted[mid - 1]! + sorted[mid]!) / 2;
  }

  /**
   * Returns the salary band label for a given USD salary amount.
   */
  getSalaryBand(salaryUsd: number): string {
    if (salaryUsd < SALARY_BAND_THRESHOLDS.BAND_1) return SALARY_BANDS[0];
    if (salaryUsd < SALARY_BAND_THRESHOLDS.BAND_2) return SALARY_BANDS[1];
    if (salaryUsd < SALARY_BAND_THRESHOLDS.BAND_3) return SALARY_BANDS[2];
    if (salaryUsd < SALARY_BAND_THRESHOLDS.BAND_4) return SALARY_BANDS[3];
    if (salaryUsd < SALARY_BAND_THRESHOLDS.BAND_5) return SALARY_BANDS[4];
    return SALARY_BANDS[5];
  }
}
