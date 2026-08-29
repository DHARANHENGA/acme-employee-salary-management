import { Prisma } from '@prisma/client';
import prisma from '../database/client';
import {
  AnalyticsFilters,
  AnalyticsSummary,
  CountrySalaryAnalytics,
  DepartmentSalaryAnalytics,
  SalaryBand,
} from '../types/analytics.types';

/**
 * Analytics repository — aggregation queries for salary analytics.
 * Executes database-level aggregations in PostgreSQL for optimal performance.
 */
export class AnalyticsRepository {
  /**
   * Builds dynamic SQL WHERE clause conditions based on provided filters.
   */
  private buildWhereClause(filters: AnalyticsFilters) {
    const { countryId, departmentId, status } = filters;
    const conditions: Prisma.Sql[] = [Prisma.sql`1=1`];
    if (countryId) conditions.push(Prisma.sql`e.country_id = ${countryId}`);
    if (departmentId) conditions.push(Prisma.sql`e.department_id = ${departmentId}`);
    if (status) conditions.push(Prisma.sql`e.status = ${status}`);
    return Prisma.join(conditions, ' AND ');
  }

  /**
   * Computes summary metrics (total payroll, average, median, count) in SQL.
   */
  async getSummary(filters: AnalyticsFilters): Promise<AnalyticsSummary> {
    const whereClause = this.buildWhereClause(filters);
    const result = await prisma.$queryRaw<
      Array<{
        employeeCount: number | bigint;
        totalPayroll: number | null;
        averageSalary: number | null;
        medianSalary: number | null;
      }>
    >`
      SELECT
        COUNT(*)::int AS "employeeCount",
        COALESCE(SUM(e.base_salary * COALESCE(er.rate_to_usd, 1.0)), 0)::float AS "totalPayroll",
        COALESCE(AVG(e.base_salary * COALESCE(er.rate_to_usd, 1.0)), 0)::float AS "averageSalary",
        COALESCE(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY e.base_salary * COALESCE(er.rate_to_usd, 1.0)), 0)::float AS "medianSalary"
      FROM employees e
      LEFT JOIN exchange_rates er ON e.currency_id = er.currency_id
      WHERE ${whereClause}
    `;

    const row = result[0] || { employeeCount: 0, totalPayroll: 0, averageSalary: 0, medianSalary: 0 };
    return {
      employeeCount: Number(row.employeeCount),
      totalPayroll: parseFloat(Number(row.totalPayroll || 0).toFixed(2)),
      averageSalary: parseFloat(Number(row.averageSalary || 0).toFixed(2)),
      medianSalary: parseFloat(Number(row.medianSalary || 0).toFixed(2)),
      currency: 'USD',
    };
  }

  /**
   * Computes country breakdown metrics in SQL.
   */
  async getByCountry(filters: AnalyticsFilters): Promise<CountrySalaryAnalytics[]> {
    const whereClause = this.buildWhereClause(filters);
    const rows = await prisma.$queryRaw<
      Array<{
        country: string;
        employeeCount: number | bigint;
        averageSalary: number | null;
        medianSalary: number | null;
        totalPayroll: number | null;
        currency: string;
      }>
    >`
      SELECT
        c.name AS "country",
        COUNT(e.id)::int AS "employeeCount",
        COALESCE(AVG(e.base_salary * COALESCE(er.rate_to_usd, 1.0)), 0)::float AS "averageSalary",
        COALESCE(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY e.base_salary * COALESCE(er.rate_to_usd, 1.0)), 0)::float AS "medianSalary",
        COALESCE(SUM(e.base_salary * COALESCE(er.rate_to_usd, 1.0)), 0)::float AS "totalPayroll",
        'USD' AS "currency"
      FROM employees e
      JOIN countries c ON e.country_id = c.id
      LEFT JOIN exchange_rates er ON e.currency_id = er.currency_id
      WHERE ${whereClause}
      GROUP BY c.id, c.name
      ORDER BY c.name
    `;

    return rows.map((r) => ({
      country: r.country,
      employeeCount: Number(r.employeeCount),
      averageSalary: parseFloat(Number(r.averageSalary || 0).toFixed(2)),
      medianSalary: parseFloat(Number(r.medianSalary || 0).toFixed(2)),
      totalPayroll: parseFloat(Number(r.totalPayroll || 0).toFixed(2)),
      currency: 'USD',
    }));
  }

  /**
   * Computes department breakdown metrics in SQL.
   */
  async getByDepartment(filters: AnalyticsFilters): Promise<DepartmentSalaryAnalytics[]> {
    const whereClause = this.buildWhereClause(filters);
    const rows = await prisma.$queryRaw<
      Array<{
        department: string;
        employeeCount: number | bigint;
        averageSalary: number | null;
        medianSalary: number | null;
        totalPayroll: number | null;
        currency: string;
      }>
    >`
      SELECT
        d.name AS "department",
        COUNT(e.id)::int AS "employeeCount",
        COALESCE(AVG(e.base_salary * COALESCE(er.rate_to_usd, 1.0)), 0)::float AS "averageSalary",
        COALESCE(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY e.base_salary * COALESCE(er.rate_to_usd, 1.0)), 0)::float AS "medianSalary",
        COALESCE(SUM(e.base_salary * COALESCE(er.rate_to_usd, 1.0)), 0)::float AS "totalPayroll",
        'USD' AS "currency"
      FROM employees e
      JOIN departments d ON e.department_id = d.id
      LEFT JOIN exchange_rates er ON e.currency_id = er.currency_id
      WHERE ${whereClause}
      GROUP BY d.id, d.name
      ORDER BY d.name
    `;

    return rows.map((r) => ({
      department: r.department,
      employeeCount: Number(r.employeeCount),
      averageSalary: parseFloat(Number(r.averageSalary || 0).toFixed(2)),
      medianSalary: parseFloat(Number(r.medianSalary || 0).toFixed(2)),
      totalPayroll: parseFloat(Number(r.totalPayroll || 0).toFixed(2)),
      currency: 'USD',
    }));
  }

  /**
   * Computes salary band distribution in SQL.
   */
  async getSalaryBands(filters: AnalyticsFilters): Promise<SalaryBand[]> {
    const whereClause = this.buildWhereClause(filters);
    const rows = await prisma.$queryRaw<
      Array<{
        band: string;
        employeeCount: number | bigint;
      }>
    >`
      WITH band_counts AS (
        SELECT
          CASE
            WHEN (e.base_salary * COALESCE(er.rate_to_usd, 1.0)) < 25000 THEN '<25K'
            WHEN (e.base_salary * COALESCE(er.rate_to_usd, 1.0)) < 50000 THEN '25K-50K'
            WHEN (e.base_salary * COALESCE(er.rate_to_usd, 1.0)) < 75000 THEN '50K-75K'
            WHEN (e.base_salary * COALESCE(er.rate_to_usd, 1.0)) < 100000 THEN '75K-100K'
            WHEN (e.base_salary * COALESCE(er.rate_to_usd, 1.0)) < 150000 THEN '100K-150K'
            ELSE '>150K'
          END AS band,
          COUNT(e.id) AS count
        FROM employees e
        LEFT JOIN exchange_rates er ON e.currency_id = er.currency_id
        WHERE ${whereClause}
        GROUP BY 1
      )
      SELECT band, count::int AS "employeeCount" FROM band_counts;
    `;

    const countsMap = new Map<string, number>();
    let totalCount = 0;
    for (const r of rows) {
      const count = Number(r.employeeCount);
      countsMap.set(r.band, count);
      totalCount += count;
    }

    const bandOrder = ['<25K', '25K-50K', '50K-75K', '75K-100K', '100K-150K', '>150K'];
    return bandOrder.map((band) => {
      const count = countsMap.get(band) ?? 0;
      return {
        band,
        employeeCount: count,
        percentage: totalCount > 0 ? parseFloat(((count / totalCount) * 100).toFixed(2)) : 0,
      };
    });
  }

  /**
   * Returns all employees with salary and exchange rate for fallback analytics calculations.
   */
  async getEmployeeSalaryData(filters: AnalyticsFilters) {
    const { countryId, departmentId, status } = filters;

    try {
      return await prisma.employee.findMany({
        where: {
          ...(countryId && { countryId }),
          ...(departmentId && { departmentId }),
          ...(status && { status }),
        },
        select: {
          baseSalary: true,
          status: true,
          department: { select: { name: true } },
          country: { select: { name: true } },
          currency: {
            select: {
              code: true,
              exchangeRate: { select: { rateToUsd: true } },
            },
          },
        },
      });
    } catch (err) {
      console.error('[AnalyticsRepository.getEmployeeSalaryData]', err);
      throw err;
    }
  }
}
