import app from './app';
import { logger } from './utils/logger';


const PORT = process.env.BACKEND_HOST_PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Server on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
  logger.info(`Documentation at http://localhost:${PORT}/api-docs`);
});