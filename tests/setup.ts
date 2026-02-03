import { PrismaClient } from '@prisma/client';
import { beforeAll, afterAll, beforeEach } from 'vitest';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import 'dotenv/config';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const createPrismaClient = () => {
  const adapter = new PrismaMariaDb({
    host: process.env.DB_HOST || 'db_test',
    port: 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root_password',
    database: process.env.MYSQL_DATABASE || 'invoice_db_test',
    connectionLimit: 10,
  });
  return new PrismaClient({adapter });
};

const prisma = globalForPrisma.prisma ?? createPrismaClient();
if (process.env.NODE_ENV !== 'production'){
  globalForPrisma.prisma = prisma;
}

async function clearDataDBMySQL() {
  try {
    await prisma.$transaction([
      prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0;'),
      prisma.invoice.deleteMany(),
      prisma.taxProfile.deleteMany(),
      prisma.user.deleteMany(),
      prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1;'),
    ]);
  } catch (error) {
    console.error("Error clearing database: ", error);
  }
}

beforeAll(async () => {
  await prisma.$connect();
});

beforeEach(async () => {
  await clearDataDBMySQL();
});

afterAll(async () => {
  await prisma.$disconnect();
  globalForPrisma.prisma = undefined;
});

export { prisma };