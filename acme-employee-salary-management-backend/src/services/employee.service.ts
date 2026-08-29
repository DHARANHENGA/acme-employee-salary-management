import {
  CreateEmployeeInput,
  UpdateEmployeeInput,
  EmployeeFilters,
  Employee,
  EmployeeListResult,
} from '../types/employee.types';
import { EmployeeRepository } from '../repositories/employee.repository';
import { EMPLOYEE_ID_CONFIG, PAGINATION } from '../config/constants';

/**
 * Employee service — business logic layer.
 * Depends on EmployeeRepository for data access.
 */
export class EmployeeService {
  constructor(private readonly repo: EmployeeRepository = new EmployeeRepository()) {}

  /**
   * Returns a paginated, filtered list of employees.
   */
  async listEmployees(filters: EmployeeFilters): Promise<EmployeeListResult> {
    const page = filters.page ?? PAGINATION.DEFAULT_PAGE;
    const limit = filters.limit ?? PAGINATION.DEFAULT_LIMIT;

    const { rows, total } = await this.repo.findMany(filters);

    const data: Employee[] = rows.map((row: {
      employeeId: string;
      name: string;
      department: { name: string };
      jobTitle: string;
      country: { name: string };
      dateJoined: Date;
      baseSalary: unknown;
      currency: { code: string };
      status: string;
    }) => ({
      employeeId: row.employeeId,
      name: row.name,
      department: row.department.name,
      jobTitle: row.jobTitle,
      country: row.country.name,
      dateJoined: row.dateJoined.toISOString().split('T')[0]!,
      salary: Number(row.baseSalary),
      currency: row.currency.code,
      status: row.status as Employee['status'],
    }));

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Creates a new employee, deriving the currency from the selected country.
   */
  async createEmployee(input: CreateEmployeeInput): Promise<Employee> {
    const currencyId = await this.repo.getCurrencyIdByCountry(input.countryId);
    const sequence = await this.repo.getNextSequence();
    const employeeId = this.generateEmployeeId(sequence);

    const row = await this.repo.create(employeeId, input, currencyId);

    return {
      employeeId: row.employeeId,
      name: row.name,
      department: row.department.name,
      jobTitle: row.jobTitle,
      country: row.country.name,
      dateJoined: row.dateJoined.toISOString().split('T')[0]!,
      salary: Number(row.baseSalary),
      currency: row.currency.code,
      status: row.status as Employee['status'],
    };
  }

  /**
   * Updates an existing employee's details and salary.
   * Currency is re-derived from the (possibly updated) country.
   * Throws NotFoundError if the employee does not exist.
   */
  async updateEmployee(employeeId: string, input: UpdateEmployeeInput): Promise<void> {
    const currencyId = await this.repo.getCurrencyIdByCountry(input.countryId);
    await this.repo.update(employeeId, input, currencyId);
  }

  /**
   * Soft-deactivates an employee.
   * Throws NotFoundError or AlreadyInactiveError as appropriate.
   */
  async deactivateEmployee(employeeId: string): Promise<void> {
    await this.repo.deactivate(employeeId);
  }

  /**
   * Generates a zero-padded employee ID in EMP-XXXXX format.
   * e.g. sequence 1 → "EMP-00001", sequence 10000 → "EMP-10000"
   */
  generateEmployeeId(sequence: number): string {
    return `${EMPLOYEE_ID_CONFIG.PREFIX}${String(sequence).padStart(EMPLOYEE_ID_CONFIG.PAD_LENGTH, '0')}`;
  }
}
