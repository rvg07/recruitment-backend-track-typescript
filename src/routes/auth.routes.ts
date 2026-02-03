import { Router,RequestHandler } from 'express';
import { register, login } from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';
import { registerSchema, loginSchema } from '../models/auth.schema';

const router = Router();

router.post('/register',validate(registerSchema),register as RequestHandler);
router.post('/login',validate(loginSchema),login as RequestHandler);

export default router;