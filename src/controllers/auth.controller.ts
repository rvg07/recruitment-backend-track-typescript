import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { RegisterDto, LoginDto } from '../models/auth.schema';

export const login = async (req: Request<{}, {}, LoginDto>,res: Response,next: NextFunction) => {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (error) {
    if (error instanceof Error) {
       res.status(401).json({ message: error.message });
    } else {
       next(error);
    }
  }
};

export const register = async (req: Request<{}, {}, RegisterDto>,res: Response,next: NextFunction) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    if (error instanceof Error) {
       res.status(409).json({ message: error.message });
    } else {
       next(error);
    }
  }
};