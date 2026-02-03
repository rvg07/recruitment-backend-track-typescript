import { Router, RequestHandler } from 'express';
import * as controller from '../controllers/taxProfile.controller';
import { validate } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';
import {createTaxProfileSchema,updateTaxProfileSchema,getTaxProfileSchema,taxProfileQuerySchema} from '../models/taxProfile.schema';

const router = Router();
router.use(authenticate);

router.get('/',validate(taxProfileQuerySchema),controller.findAll as unknown as RequestHandler);
router.get('/:id',validate(getTaxProfileSchema),controller.findOne as unknown as RequestHandler);
router.post('/', validate(createTaxProfileSchema),controller.create as unknown as RequestHandler);
router.patch('/:id',validate(updateTaxProfileSchema),controller.update as unknown as RequestHandler);
router.delete('/:id', validate(getTaxProfileSchema), controller.softDelete as unknown as RequestHandler);
router.delete('/:id/permanent', validate(getTaxProfileSchema), controller.hardDelete as unknown as RequestHandler);
router.post('/:id/restore', validate(getTaxProfileSchema), controller.restore as unknown as RequestHandler);

export default router;