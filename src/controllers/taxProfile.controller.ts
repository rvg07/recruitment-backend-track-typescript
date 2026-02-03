import { Request, Response, NextFunction } from 'express';
import { taxProfileService } from '../services/taxProfile.service';
import {CreateTaxProfileDto,UpdateTaxProfileDto,TaxProfileParams,TaxProfileQueryDto} from '../models/taxProfile.schema';

export const findAll = async (req: Request<{}, {}, {}, TaxProfileQueryDto>,res: Response,next: NextFunction) => {
  try {
    const userId = req.user?.id; 
    const result = await taxProfileService.findAll(req.query, userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const findOne = async (req: Request<TaxProfileParams>, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const profile = await taxProfileService.findOne(id);
    if (!profile) {
      res.status(404).json({ status: 'error', message: 'Tax Profile not found' });
      return;
    }
    if (req.user?.id && profile.userId !== req.user.id) {
       res.status(403).json({ status: 'error', message: 'Forbidden' });
       return;
    }
    res.json(profile);
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request<{}, {}, CreateTaxProfileDto>,res: Response,next: NextFunction) => {
  try {
    if (!req.user?.id) {
       res.status(401).json({ status: 'error', message: 'User not authenticated' });
       return;
    }
    const newProfile = await taxProfileService.create(req.user.id, req.body);
    res.status(201).json(newProfile);
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request<TaxProfileParams, {}, UpdateTaxProfileDto>,res: Response,next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const existingTaxProfile = await taxProfileService.findOne(id);
    if (!existingTaxProfile) {
       res.status(404).json({ status: 'error', message: 'Tax Profile not found' });
       return;
    }
    if (req.user?.id && existingTaxProfile.userId !== req.user.id) {
       res.status(403).json({ status: 'error', message: 'Forbidden' });
       return;
    }
    const updated = await taxProfileService.update(id, req.body);
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const softDelete = async (req: Request<TaxProfileParams>, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params.id);
        const userId = req.user?.id;
        const existingTaxProfile = await taxProfileService.findOne(id);
        if (!existingTaxProfile) { 
            res.status(404).json({ status: 'error', message: 'Not found' }); 
            return; 
        }
        if (userId && existingTaxProfile.userId !== userId){ 
            res.status(403).json({ status: 'error', message: 'Forbidden' });
            return; 
        }
        await taxProfileService.softDelete(id);
        res.status(204).send();
    } catch (error){ 
        next(error); 
    }
};

export const hardDelete = async (req: Request<TaxProfileParams>, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params.id);
        const userId = req.user?.id;
        const existingTaxProfile = await taxProfileService.findOne(id);
        if (!existingTaxProfile) {
            res.status(404).json({ status: 'error', message: 'Not found'});
            return;
        }
        if (userId && existingTaxProfile.userId !== userId){
            res.status(403).json({ status: 'error', message: 'Forbidden' });
            return;
        }
        await taxProfileService.hardDelete(id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

export const restore = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params.id);
        const userId = req.user?.id;
        const existingTaxProfile = await taxProfileService.findOne(id);
        if (!existingTaxProfile) {
            res.status(404).json({ status: 'error', message: 'Not found' });
            return;
        }
        if (userId && existingTaxProfile.userId !== userId) {
            res.status(403).json({ status: 'error', message: 'Forbidden' });
            return;
        }
        const restored = await taxProfileService.restore(id);
        res.json(restored);
    } catch (error) {
        next(error);
    }
};