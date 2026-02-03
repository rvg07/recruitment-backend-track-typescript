import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import {generateOpenAPI} from './config/swagger';
import authRoutes from './routes/auth.routes';
import invoiceRoutes from './routes/invoice.routes';
import userRoutes from './routes/user.routes';
import taxProfileRoutes from './routes/taxProfile.routes';
import './docs/index';
import {logger} from './utils/logger';

const app = express();
app.use(express.json());
app.use(cors());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(generateOpenAPI()));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/tax-profiles', taxProfileRoutes);

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    documentation: '/api-docs'
  });
});
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    status: 'error',
    message: `Not found ${req.method} ${req.originalUrl}`
  });
  logger.error(`Not found ${req.method} ${req.originalUrl}`);
});

export default app;