import { PrismaClient } from '@prisma/client';

// Singleton pattern — reuse the same client across the app.
// In test environments each test suite manages its own connection lifecycle.
const prisma = new PrismaClient({
  log: process.env['NODE_ENV'] === 'development' ? ['warn', 'error'] : ['error'],
});

export default prisma;
