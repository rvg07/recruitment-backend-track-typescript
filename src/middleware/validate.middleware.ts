import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {logger} from '../utils/logger';

export const validate = (schema: z.ZodSchema) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsedData = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      const {body, query, params} = parsedData as {
        body?: any;
        query?: any;
        params?: any;
      };

      if (body) req.body = body;
      if (query) req.query = query;
      if (params) req.params = params;
      next();
    } catch (error){
      if (error instanceof z.ZodError) {
        const validationErrors = error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));
        logger.warn(`Validation error on ${req.path}`, { 
          errors: validationErrors 
        });
        res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: validationErrors
        });
        return;
      }
      next(error);
    }
  };