import {z} from 'zod';
import {registry} from '../config/swagger';
import {createUserSchema,updateUserSchema,userQuerySchema} from '../models/user.schema';

const USER_TAG = 'Users';

const UserResponseSchema = z.object({
  id: z.number(),
  email: z.email(),
  firstName: z.string(),
  lastName: z.string(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  deletedAt: z.iso.datetime().nullable()
});

registry.registerPath({
  method: 'get',
  path: '/users',
  tags: [USER_TAG],
  summary: 'Get list of users',
  description: 'Retrieve a paginated list of users',
  request: {
    query: userQuerySchema.shape.query,
  },
  responses: {
    200: {
      description: 'List of users',
      content: {
        'application/json': {
          schema: z.object({
            data: z.array(UserResponseSchema),
            meta: z.object({
              total: z.number(),
              page: z.number(),
              limit: z.number(),
              totalPages: z.number(),
            }),
          }),
        },
      },
    },
    400: { description: 'Validation error' },
    401: { description: 'Unauthorized' },
  },
});

registry.registerPath({
  method: 'post',
  path: '/users',
  tags: [USER_TAG],
  summary: 'Create a new user',
  request: {
    body: {
      content: {
        'application/json': {
          schema: createUserSchema.shape.body,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'User created successfully',
      content: {
        'application/json': {
          schema: UserResponseSchema,
        },
      },
    },
    400: { description: 'Validation error' },
    401: { description: 'Unauthorized' },
  },
});

registry.registerPath({
  method: 'get',
  path: '/users/{id}',
  tags: [USER_TAG],
  summary: 'Get user by Id',
  request: {
    params: z.object({
      id: z.string().transform(Number).or(z.number()),
    }),
  },
  responses: {
    200: {
      description: 'User details',
      content: {
        'application/json': {
          schema: UserResponseSchema,
        },
      },
    },
    404: { description: 'User not found' },
    401: { description: 'Unauthorized' },
  },
});

registry.registerPath({
  method: 'patch',
  path: '/users/{id}',
  tags: [USER_TAG],
  summary: 'Update a user',
  description: 'Partial update user details',
  request: {
    params: z.object({
      id: z.string().transform(Number).or(z.number()),
    }),
    body: {
      content: {
        'application/json': {
          schema: updateUserSchema.shape.body,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'User updated successfully',
      content: {
        'application/json': {
          schema: UserResponseSchema,
        },
      },
    },
    404: { description: 'User not found' },
    401: { description: 'Unauthorized' },
  },
});

registry.registerPath({
    method: 'delete',
    path: '/users/{id}',
    tags: [USER_TAG],
    summary: 'Soft delete a user',
    request: {
        params: z.object({
            id: z.string().transform(Number).or(z.number()),
        }),
    },
    responses: {
        204: { description: 'Soft deleted user successfully' },
        404: { description: 'User not found' },
    },
});

registry.registerPath({
    method: 'delete',
    path: '/users/{id}/permanent',
    tags: [USER_TAG],
    summary: 'Permanently delete a user',
    description: 'Deletes user and all related data via cascade',
    request: {
        params: z.object({
            id: z.string().transform(Number).or(z.number()),
        }),
    },
    responses: {
        204: { description: 'User permanently deleted' },
        404: { description: 'User not found' },
    },
});

registry.registerPath({
    method: 'post',
    path: '/users/{id}/restore',
    tags: [USER_TAG],
    summary: 'Restore a deleted user',
    description: 'Restore a deleted user fro a previously soft delete',
    request: {
      params: z.object({
        id: z.string().transform(Number).or(z.number()),
      }),
    },
    responses: {
      200: {
        description: 'User restored successfully',
        content: {
          'application/json': { schema: UserResponseSchema },
        },
      },
      404: { description: 'User not found' },
    },
  });