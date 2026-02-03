import 'dotenv/config'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import {PrismaClient} from '@prisma/client';
import {logger } from '../utils/logger';

const configAdapter = {
    host: process.env.DB_HOST || 'db',
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE || 'invoice_db',
    connectionLimit: 10
}

const adapter = new PrismaMariaDb(configAdapter);
export const prisma = new PrismaClient(
{
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : []
})

prisma.$connect().then(() => {
        console.log('Prima client is connected to DB');
        logger.info('Prima client is connected to DB. Environment db: ', { env: process.env.NODE_ENV});
    })
    .catch((error) => {
        logger.error('Prisma client connection failed. ', { error: error.message});
        console.error('Prisma client connection failed: ', error.message);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });