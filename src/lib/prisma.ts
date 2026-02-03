import {PrismaClient} from '@prisma/client';
import {PrismaMariaDb} from '@prisma/adapter-mariadb';

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

const createPrismaClient = () => {
  const adapter = new PrismaMariaDb({
    host: process.env.DB_HOST || 'db',
    port: parseInt(process.env.MYSQL_HOST_PORT || '3306'),
    user: process.env.MYSQL_USER || 'dev_invoice_user',
    password: process.env.MYSQL_PASSWORD || 'dev_invoice_password!',
    database: process.env.MYSQL_DATABASE || 'invoice_db',
    connectionLimit: 10
  });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'info', 'warn', 'error'] 
      : ['error'],
  });
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}