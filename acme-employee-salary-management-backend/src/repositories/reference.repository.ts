import prisma from '../database/client';

/**
 * Reference data repository — departments, countries, currencies.
 */
export class ReferenceRepository {
  async getDepartments() {
    try {
      return await prisma.department.findMany({
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      });
    } catch (err) {
      console.error('[ReferenceRepository.getDepartments]', err);
      throw err;
    }
  }

  async getCountries() {
    try {
      return await prisma.country.findMany({
        select: {
          id: true,
          name: true,
          code: true,
          currency: {
            select: { id: true, code: true, name: true, symbol: true },
          },
        },
        orderBy: { name: 'asc' },
      });
    } catch (err) {
      console.error('[ReferenceRepository.getCountries]', err);
      throw err;
    }
  }

  async getCurrencies() {
    try {
      return await prisma.currency.findMany({
        select: { id: true, code: true, name: true, symbol: true },
        orderBy: { code: 'asc' },
      });
    } catch (err) {
      console.error('[ReferenceRepository.getCurrencies]', err);
      throw err;
    }
  }
}
