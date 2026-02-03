import { Router, RequestHandler } from 'express';
import * as controller from '../controllers/invoice.controller';
import { validate } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';
import {createInvoiceSchema,updateInvoiceSchema, 
  invoiceQuerySchema, 
  getInvoiceSchema 
} from '../models/invoice.schema';

const router = Router();
router.use(authenticate);

router.get('/',validate(invoiceQuerySchema),controller.findAll as unknown as RequestHandler);
router.get('/:id', validate(getInvoiceSchema),controller.findOne as unknown as RequestHandler);
router.post('/',validate(createInvoiceSchema), controller.create as unknown as RequestHandler);
router.patch('/:id',validate(updateInvoiceSchema),controller.update as unknown as RequestHandler);
router.delete('/:id', validate(getInvoiceSchema), controller.softDelete as unknown as RequestHandler);
router.delete('/:id/permanent', validate(getInvoiceSchema), controller.hardDelete as unknown as RequestHandler);
router.post('/:id/restore', validate(getInvoiceSchema), controller.restore as unknown as RequestHandler);

export default router;