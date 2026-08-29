import prisma from '../database/client';
import { EmployeeFilters, CreateEmployeeInput, UpdateEmployeeInput } from '../types/employee.types';
import { NotFoundError, AlreadyInactiveError } from '@/errors/app-error';

/**
 * Employee repository — all database operations for employees.
 */
export class EmployeeRepository {
  /**
   * Returns a paginated, filtered list of employees with related names resolved.
   */
  async findMany(filters: EmployeeFilters) {
    const {
      page = 1,
      limit = 10,
      search,
      departmentId,
      countryId,
      status,
    } = filters;

    const where = {
      ...(search && {
        name: { contains: search, mode: 'insensitive' as const },
      }),
      ...(departmentId && { departmentId }),
      ...(countryId && { countryId }),
      ...(status && { status }),
    };

    try {
      const [rows, total] = await Promise.all([
        prisma.employee.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          include: {
            department: { select: { name: true } },
            country: { select: { name: true } },
            currency: { select: { code: true } },
          },
          orderBy: { employeeId: 'asc' },
        }),
        prisma.employee.count({ where }),
      ]);

      return { rows, total };
    } catch (err) {
      console.error('[EmployeeRepository.findMany]', err);
      throw err;
    }
  }

  /**
   * Looks up the next sequence number for generating an employee ID.
   */
  async getNextSequence(): Promise<number> {
    try {
      const count = await prisma.employee.count();
      return count + 1;
    } catch (err) {
      console.error('[EmployeeRepository.getNextSequence]', err);
      throw err;
    }
  }

  /**
   * Creates a new employee record.
   */
  async create(employeeId: string, input: CreateEmployeeInput, currencyId: number) {
    try {
      return await prisma.employee.create({
        data: {
          employeeId,
          name: input.name,
          departmentId: input.departmentId,
          jobTitle: input.jobTitle,
          countryId: input.countryId,
          currencyId,
          dateJoined: new Date(input.dateJoined),
          baseSalary: input.salary,
          status: 'ACTIVE',
        },
        include: {
          department: { select: { name: true } },
          country: { select: { name: true } },
          currency: { select: { code: true } },
        },
      });
    } catch (err) {
      console.error('[EmployeeRepository.create]', err);
      throw err;
    }
  }

  /**
   * Finds an employee by their business ID (EMP-XXXXX).
   * Throws NotFoundError if the employee does not exist.
   */
  async findByEmployeeId(employeeId: string) {
    try {
      const employee = await prisma.employee.findUnique({
        where: { employeeId },
        include: {
          department: { select: { name: true } },
          country: { select: { name: true } },
          currency: { select: { code: true } },
        },
      });

      if (!employee) {
        throw new NotFoundError(`Employee ${employeeId} not found`);
      }

      return employee;
    } catch (err) {
      if (err instanceof NotFoundError) throw err;
      console.error('[EmployeeRepository.findByEmployeeId]', err);
      throw err;
    }
  }

  /**
   * Updates an existing employee record.
   * Throws NotFoundError if the employee does not exist.
   */
  async update(employeeId: string, input: UpdateEmployeeInput, currencyId: number) {
    // Verify employee exists first
    await this.findByEmployeeId(employeeId);

    try {
      return await prisma.employee.update({
        where: { employeeId },
        data: {
          name: input.name,
          departmentId: input.departmentId,
          jobTitle: input.jobTitle,
          countryId: input.countryId,
          currencyId,
          dateJoined: new Date(input.dateJoined),
          baseSalary: input.salary,
        },
      });
    } catch (err) {
      console.error('[EmployeeRepository.update]', err);
      throw err;
    }
  }

  /**
   * Soft-deactivates an employee.
   * Throws NotFoundError if not found, AlreadyInactiveError if already inactive.
   */
  async deactivate(employeeId: string) {
    const employee = await this.findByEmployeeId(employeeId);

    if (employee.status === 'INACTIVE') {
      throw new AlreadyInactiveError();
    }

    try {
      return await prisma.employee.update({
        where: { employeeId },
        data: { status: 'INACTIVE' },
      });
    } catch (err) {
      console.error('[EmployeeRepository.deactivate]', err);
      throw err;
    }
  }

  /**
   * Resolves the currency ID from a countryId.
   * Throws NotFoundError if the country does not exist.
   */
  async getCurrencyIdByCountry(countryId: number): Promise<number> {
    try {
      const country = await prisma.country.findUnique({
        where: { id: countryId },
        select: { currencyId: true },
      });

      if (!country) {
        throw new NotFoundError(`Country ${countryId} not found`);
      }

      return country.currencyId;
    } catch (err) {
      if (err instanceof NotFoundError) throw err;
      console.error('[EmployeeRepository.getCurrencyIdByCountry]', err);
      throw err;
    }
  }
}
