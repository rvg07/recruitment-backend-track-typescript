import { z } from 'zod';
import {registry } from '../config/swagger';
import {createInvoiceSchema,updateInvoiceSchema,invoiceQuerySchema } from '../models/invoice.schema';

const INVOICE_TAG = 'Invoices';
const InvoiceResponseSchema = z.object({
  id: z.number().int().positive(),
  taxProfileId: z.number().int().positive(),
  invoiceNumber: z.string(),
  issueDate: z.coerce.date(),
  dueDate: z.coerce.date(),
  amount: z.number(),
  currency: z.string(),
  status: z.enum(['DRAFT', 'PENDING', 'PAID', 'CANCELLED', 'OVERDUE']),
  description: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  deletedAt: z.iso.datetime().nullable()
});

registry.registerPath({
  method: 'get',
  path: '/invoices',
  tags: [INVOICE_TAG],
  summary: 'Get list of invoices',
  description: 'Retrieve a paginated list of invoices with filters',
  request: {
    query: invoiceQuerySchema.shape.query,
  },
  responses: {
    200: {
      description: 'List of invoices',
      content: {
        'application/json': {
          schema: z.object({
            data: z.array(InvoiceResponseSchema),
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
  },
});

registry.registerPath({
  method: 'post',
  path: '/invoices',
  tags: [INVOICE_TAG],
  summary: 'Create a new invoice',
  description: 'Creates a new invoice linked to a tax profile',
  request: {
    body: {
      content: {
        'application/json': {
          schema: createInvoiceSchema.shape.body,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Invoice created successfully',
      content: {
        'application/json': {
          schema: InvoiceResponseSchema,
        },
      },
    },
    400: { description: 'Validation error' },
  },
});

registry.registerPath({
  method: 'get',
  path: '/invoices/{id}',
  tags: [INVOICE_TAG],
  summary: 'Get invoice by ID',
  request: {
    params: z.object({
      id: z.string().transform(Number).or(z.number()),
    }),
  },
  responses: {
    200: {
      description: 'Invoice details',
      content: {
        'application/json': {
          schema: InvoiceResponseSchema,
        },
      },
    },
    404: { description: 'Invoice not found' },
    400: { description: 'Invalid Id' },
  },
});

registry.registerPath({
  method: 'patch',
  path: '/invoices/{id}',
  tags: [INVOICE_TAG],
  summary: 'Update an invoice',
  description: 'Update partially an existing invoice',
  request: {
    params: z.object({
      id: z.string().transform(Number).or(z.number()),
    }),
    body: {
      content: {
        'application/json': {
          schema: updateInvoiceSchema.shape.body,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Invoice updated successfully',
      content: {
        'application/json': {
          schema: InvoiceResponseSchema,
        },
      },
    },
    404: { description: 'Invoice not found' },
  },
});

registry.registerPath({
  method: 'delete',
  path: '/invoices/{id}',
  tags: [INVOICE_TAG],
  summary: 'Soft delete an invoice',
  request: {
    params: z.object({ id: z.string().transform(Number).or(z.number()) }),
  },
  responses: {
    204: { description: 'Invoice moved to trash' },
    404: { description: 'Invoice not found' },
  },
});

registry.registerPath({
  method: 'delete',
  path: '/invoices/{id}/permanent',
  tags: [INVOICE_TAG],
  summary: 'Permanently delete an invoice',
  description: 'Hard deletetion allowed for draft or cancelled status',
  request: {
    params: z.object({ id: z.string().transform(Number).or(z.number()) }),
  },
  responses: {
    204: { description: 'Invoice permanently deleted' },
    403: { 
      description: 'Forbidden. You cannot delete issued invoices with status pending, paid, overdue',
    },
    404: { description: 'Invoice not found' },
  },
});

registry.registerPath({
  method: 'post',
  path: '/invoices/{id}/restore',
  tags: [INVOICE_TAG],
  summary: 'Restore an invoice',
  request: {
    params: z.object({ id: z.string().transform(Number).or(z.number()) }),
  },
  responses: {
    200: {
      description: 'Invoice restored',
      content: { 'application/json': { schema: InvoiceResponseSchema } },
    },
    404: { description: 'Invoice not found' },
  },
});