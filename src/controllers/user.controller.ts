import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import { CreateUserDto, UpdateUserDto, UserParams, UserQueryDto } from '../models/user.schema';

export const findAll = async (req: Request<{}, {}, {}, UserQueryDto>, res: Response, next: NextFunction) => {
    try {
        const result = await userService.findAll(req.query);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const findOne = async (req: Request<UserParams>, res: Response, next: NextFunction) => {
    try {
        const user = await userService.findOne(Number(req.params.id));
        if (!user) {
            res.status(404).json({ status: 'error', message: 'User not found' });
            return;
        }
        res.json(user);
    } catch (error) {
        next(error);
    }
};

export const create = async (req: Request<{}, {}, CreateUserDto>, res: Response, next: NextFunction) => {
    try {
        const newUser = await userService.create(req.body);
        res.status(201).json(newUser);
    } catch (error) {
        next(error);
    }
};

export const update = async (req: Request<UserParams, {}, UpdateUserDto>, res: Response, next: NextFunction) => {
    try {
        const updatedUser = await userService.update(Number(req.params.id), req.body);
        res.json(updatedUser);
    } catch (error) {
        next(error);
    }
};

export const softDelete = async (req: Request<UserParams>, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params.id);
        await userService.softDelete(id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

export const hardDelete = async (req: Request<UserParams>, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params.id);
        await userService.hardDelete(id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

export const restore = async (req: Request<UserParams>, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params.id);
        const restoredUser = await userService.restore(id);
        res.json(restoredUser);
    } catch (error) {
        next(error);
    }
};