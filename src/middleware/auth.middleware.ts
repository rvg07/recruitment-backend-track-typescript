import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import {logger} from '../utils/logger';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
      };
    }
  }
}

interface JwtPayload {
  id: number;
  email: string;
  iat?: number;
  exp?: number;
}

const JWT_SECRET = process.env.JWT_SECRET || 'jwt_secret';

export const authenticate = async (req: Request,res: Response,next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Unauthorized. Missing or invalid auth header. ', {
        ip: req.ip,
        path: req.originalUrl
      });
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const token = authHeader.split(' ')[1]; //we remove here the "Bearer"
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }, 
      select: { id: true, email: true }
    });

    if (!user) {
      logger.warn(`Unauthorized. User not found`, {
        userId: decoded?.id,
        ip: req.ip,
        path: req.originalUrl
      });
      res.status(401).json({ message: 'Unauthorized. User not found' });
      return;
    }
    req.user = user;
    next();
  } catch (error) {
    logger.warn('Unauthorized. Invalid token', {
      ip: req.ip,
      path: req.originalUrl
    });
    res.status(401).json({ message: 'Unauthorized. Invalid token' });
    return;
  }
};