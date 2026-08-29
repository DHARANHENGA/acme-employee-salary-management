import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─── Reference data ───────────────────────────────────────────

const CURRENCIES = [
  { code: 'INR', name: 'Indian Rupee',           symbol: '₹',  rateToUsd: 0.012 },
  { code: 'USD', name: 'United States Dollar',   symbol: '$',  rateToUsd: 1.000 },
  { code: 'GBP', name: 'British Pound Sterling', symbol: '£',  rateToUsd: 1.270 },
  { code: 'EUR', name: 'Euro',                   symbol: '€',  rateToUsd: 1.080 },
  { code: 'BRL', name: 'Brazilian Real',         symbol: 'R$', rateToUsd: 0.180 },
  { code: 'SGD', name: 'Singapore Dollar',       symbol: 'S$', rateToUsd: 0.740 },
];

const COUNTRIES = [
  { code: 'IN', name: 'India',     currencyCode: 'INR' },
  { code: 'US', name: 'USA',       currencyCode: 'USD' },
  { code: 'GB', name: 'UK',        currencyCode: 'GBP' },
  { code: 'DE', name: 'Germany',   currencyCode: 'EUR' },
  { code: 'BR', name: 'Brazil',    currencyCode: 'BRL' },
  { code: 'SG', name: 'Singapore', currencyCode: 'SGD' },
];

const DEPARTMENTS = ['Engineering', 'HR', 'Finance', 'Sales', 'Marketing', 'Operations'];

const JOB_TITLES: Record<string, string[]> = {
  Engineering: ['Software Engineer', 'Senior Software Engineer', 'Engineering Manager'],
  HR: ['HR Coordinator', 'HR Manager', 'HR Business Partner'],
  Finance: ['Financial Analyst', 'Senior Financial Analyst', 'Finance Manager'],
  Sales: ['Sales Representative', 'Account Executive', 'Sales Manager'],
  Marketing: ['Marketing Coordinator', 'Marketing Specialist', 'Marketing Manager'],
  Operations: ['Operations Analyst', 'Operations Specialist', 'Operations Manager'],
};

const SALARY_RANGES: Record<string, { min: number; max: number }> = {
  IN: { min: 400_000,  max: 3_000_000 },
  US: { min: 40_000,   max: 180_000   },
  GB: { min: 30_000,   max: 150_000   },
  DE: { min: 35_000,   max: 160_000   },
  BR: { min: 30_000,   max: 200_000   },
  SG: { min: 40_000,   max: 200_000   },
};

const FIRST_NAMES = [
  'Arun','Priya','James','Sarah','Carlos','Maria','Liam','Emma',
  'Raj','Anita','David','Sophie','Lucas','Isabella','Wei','Mei',
  'Ahmed','Fatima','Oliver','Amelia','Noah','Mia','Ethan','Ava',
];

const LAST_NAMES = [
  'Kumar','Sharma','Smith','Johnson','Garcia','Martinez','Brown','Davis',
  'Patel','Singh','Wilson','Taylor','Gonzalez','Rodriguez','Miller','Anderson',
  'Muller','Schmidt','Silva','Santos','Li','Wang','Hassan','Ali',
];

// ─── Helpers ──────────────────────────────────────────────────

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatEmployeeId(seq: number): string {
  return `EMP-${String(seq).padStart(5, '0')}`;
}

// ─── Main seed ────────────────────────────────────────────────

async function main() {
  console.log('Seeding reference data…');

  // Currencies + exchange rates
  for (const c of CURRENCIES) {
    const currency = await prisma.currency.upsert({
      where: { code: c.code },
      update: {},
      create: { code: c.code, name: c.name, symbol: c.symbol },
    });

    await prisma.exchangeRate.upsert({
      where: { currencyId: currency.id },
      update: {},
      create: { currencyId: currency.id, rateToUsd: c.rateToUsd },
    });
  }

  // Countries
  for (const co of COUNTRIES) {
    const currency = await prisma.currency.findUniqueOrThrow({
      where: { code: co.currencyCode },
    });

    await prisma.country.upsert({
      where: { code: co.code },
      update: {},
      create: { code: co.code, name: co.name, currencyId: currency.id },
    });
  }

  // Departments
  for (const name of DEPARTMENTS) {
    await prisma.department.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // Check if employees already exist
  const existing = await prisma.employee.count();
  if (existing > 0) {
    console.log(`Employees already seeded (${existing} records). Skipping.`);
    return;
  }

  console.log('Seeding 10,000 employees…');

  const countryCodes = ['IN', 'US', 'GB', 'DE', 'BR', 'SG'];

  for (let i = 1; i <= 10_000; i++) {
    const countryCode = countryCodes[(i - 1) % 6]!;
    const deptName = DEPARTMENTS[(i - 1) % 6]!;
    const titleIdx = (i - 1) % 3;

    const firstName = FIRST_NAMES[(i - 1) % FIRST_NAMES.length]!;
    const lastName  = LAST_NAMES[Math.floor((i - 1) / FIRST_NAMES.length) % LAST_NAMES.length]!;
    const name = `${firstName} ${lastName}`;

    const country = await prisma.country.findUniqueOrThrow({ where: { code: countryCode } });
    const dept    = await prisma.department.findUniqueOrThrow({ where: { name: deptName } });

    const range = SALARY_RANGES[countryCode]!;
    const salary = randomBetween(range.min, range.max);
    const status = i % 10 === 0 ? 'INACTIVE' : 'ACTIVE';

    // Spread join dates across 2010–2024
    const startMs = new Date('2010-01-01').getTime();
    const endMs   = new Date('2024-12-31').getTime();
    const dateJoined = new Date(startMs + ((i / 10_000) * (endMs - startMs)));

    await prisma.employee.create({
      data: {
        employeeId:   formatEmployeeId(i),
        name,
        departmentId: dept.id,
        jobTitle:     JOB_TITLES[deptName]![titleIdx]!,
        countryId:    country.id,
        currencyId:   country.currencyId,
        dateJoined,
        baseSalary:   salary,
        status,
      },
    });

    if (i % 1000 === 0) console.log(`  ${i} / 10,000 inserted`);
  }

  console.log('Seeding complete.');
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
