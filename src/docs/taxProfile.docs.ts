import { z } from 'zod';
import { registry } from '../config/swagger';
import {createTaxProfileSchema,updateTaxProfileSchema,taxProfileQuerySchema} from '../models/taxProfile.schema';

const TAX_PROFILE_TAG = 'Tax Profiles';

const TaxProfileResponseSchema = z.object({
  id: z.number(),
  userId: z.number(),
  companyName: z.string(),
  vatNumber: z.string(),
  taxCode: z.string().nullable().optional(),
  address: z.string(),
  city: z.string(),
  postalCode: z.string(),
  country: z.string().length(2),
  phone: z.string().nullable().optional(),
  email: z.email().nullable().optional(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  deletedAt: z.iso.datetime().nullable()
});

registry.registerPath({
  method: 'get',
  path: '/tax-profiles',
  tags: [TAX_PROFILE_TAG],
  summary: 'Get list of tax profiles',
  description: 'Retrieve a paginated list of tax profiles',
  request: {
    query: taxProfileQuerySchema.shape.query,
  },
  responses: {
    200: {
      description: 'List of tax profiles',
      content: {
        'application/json': {
          schema: z.object({
            data: z.array(TaxProfileResponseSchema),
            meta: z.object({
              total: z.number(),
              page: z.number(),
              limit: z.number(),
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
  path: '/tax-profiles',
  tags: [TAX_PROFILE_TAG],
  summary: 'Create a new tax profile',
  request: {
    body: {
      content: {
        'application/json': {
          schema: createTaxProfileSchema.shape.body,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Tax profile created successfully',
      content: {
        'application/json': {
          schema: TaxProfileResponseSchema,
        },
      },
    },
    400: { description: 'Validation error' },
    401: { description: 'Unauthorized' },
  },
});

registry.registerPath({
  method: 'get',
  path: '/tax-profiles/{id}',
  tags: [TAX_PROFILE_TAG],
  summary: 'Get tax profile by Id',
  request: {
    params: z.object({
      id: z.string().transform(Number).or(z.number()),
    }),
  },
  responses: {
    200: {
      description: 'Tax profile details',
      content: {
        'application/json': {
          schema: TaxProfileResponseSchema,
        },
      },
    },
    404: { description: 'Tax profile not found' },
    403: { description: 'Forbidden' },
  },
});

registry.registerPath({
  method: 'patch',
  path: '/tax-profiles/{id}',
  tags: [TAX_PROFILE_TAG],
  summary: 'Update a tax profile',
  description: 'Partial update tax profile details',
  request: {
    params: z.object({
      id: z.string().transform(Number).or(z.number()),
    }),
    body: {
      content: {
        'application/json': {
          schema: updateTaxProfileSchema.shape.body,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Tax profile updated successfully',
      content: {
        'application/json': {
          schema: TaxProfileResponseSchema,
        },
      },
    },
    404: { description: 'Tax profile not found' },
    403: { description: 'Forbidden' },
  },
});

registry.registerPath({
    method: 'delete',
    path: '/tax-profiles/{id}',
    tags: [TAX_PROFILE_TAG],
    summary: 'Soft delete a tax profile',
    request: {
        params: z.object({ id: z.string().transform(Number).or(z.number()) }),
    },
    responses: {
        204: { description: 'Soft deleted tax profile successfully' },
        404: { description: 'Not found' },
    },
});

registry.registerPath({
    method: 'delete',
    path: '/tax-profiles/{id}/permanent',
    tags: [TAX_PROFILE_TAG],
    summary: 'Permanently delete a tax profile',
    description: 'Deletes user tax profile and all related data via cascade',
    request: {
        params: z.object({ id: z.string().transform(Number).or(z.number()) }),
    },
    responses: {
        204: { description: 'Permanently deleted' },
        404: { description: 'Not found' },
    },
});

registry.registerPath({
    method: 'post',
    path: '/tax-profiles/{id}/restore',
    tags: [TAX_PROFILE_TAG],
    summary: 'Restore a tax profile',
    request: {
        params: z.object({ id: z.string().transform(Number).or(z.number()) }),
    },
    responses: {
        200: {
            description: 'Restored successfully',
            content: { 'application/json': { schema: TaxProfileResponseSchema } },
        },
        404: { description: 'Not found' },
    },
});