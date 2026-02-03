import { PrismaClient } from '@prisma/client';
import { beforeAll, afterAll, beforeEach } from 'vitest';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import 'dotenv/config';

const adapter = new PrismaMariaDb({
  host: process.env.DB_HOST || 'db_test',
  port: 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root_password',
  database: process.env.MYSQL_DATABASE || 'invoice_db_test',
  connectionLimit: 10,
});
const prisma = new PrismaClient({ adapter });
async function clearDatabase() {
  try {
    await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0;');
    await prisma.user.deleteMany();
    await prisma.taxProfile.deleteMany();
    await prisma.invoice.deleteMany();
    await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1;');
  } catch (error) {
    console.error("Error: ", error);
  }
}

beforeAll(async () => {
  await prisma.$connect();
});

beforeEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await prisma.$disconnect();
});

export { prisma };