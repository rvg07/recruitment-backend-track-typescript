import {Router, RequestHandler} from 'express';
import * as controller from '../controllers/user.controller';
import { validate } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';
import {createUserSchema,updateUserSchema,getUserSchema,userQuerySchema} from '../models/user.schema';

const router = Router();
router.use(authenticate);

router.get('/', validate(userQuerySchema), controller.findAll as unknown as RequestHandler);
router.get('/:id', validate(getUserSchema), controller.findOne as unknown as RequestHandler);
router.post('/', validate(createUserSchema), controller.create as unknown as RequestHandler);
router.patch('/:id', validate(updateUserSchema), controller.update as unknown as RequestHandler);
router.delete('/:id', validate(getUserSchema), controller.softDelete as unknown as RequestHandler);
router.delete('/:id/permanent', validate(getUserSchema), controller.hardDelete as unknown as RequestHandler);
router.post('/:id/restore', validate(getUserSchema), controller.restore as unknown as RequestHandler);


export default router;