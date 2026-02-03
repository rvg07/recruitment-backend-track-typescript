import { z } from 'zod';
import { registry } from '../config/swagger';
import { loginSchema, registerSchema } from '../models/auth.schema';

const AUTH_TAG = 'Auth';

const AuthResponseSchema = z.object({
  token: z.string().openapi({ 
    description: 'JWT token',
  }),
  user: z.object({
    id: z.number(),
    email: z.email(),
    firstName: z.string(),
    lastName: z.string(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']),
  }),
});

registry.registerPath({
  method: 'post',
  path: '/auth/login',
  tags: [AUTH_TAG],
  summary: 'User login',
  description: 'Authenticate user and return a JWT token',
  request: {
    body: {
      content: {
        'application/json': {
          schema: loginSchema.shape.body,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Login successful',
      content: {
        'application/json': {
          schema: AuthResponseSchema,
        },
      },
    },
    400: { description: 'Validation error' },
    401: { description: 'Invalid credentials' },
    403: { description: 'Account suspended or deleted' },
  },
});


registry.registerPath({
  method: 'post',
  path: '/auth/register',
  tags: [AUTH_TAG],
  summary: 'User registration',
  description: 'Register a new user account',
  request: {
    body: {
      content: {
        'application/json': {
          schema: registerSchema.shape.body,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'User registered successfully',
      content: {
        'application/json': {
          schema: AuthResponseSchema,
        },
      },
    },
    400: { description: 'Validation error' },
    409: { description: 'Conflict' },
  },
});