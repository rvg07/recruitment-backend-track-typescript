import { z } from 'zod';

const paramsSchema = z.object({
  id: z.coerce.number().int().positive({ message: "ID must be a positive integer" }),
});

const invoiceBodySchema = z.object({
  taxProfileId: z.number().int().positive({ message: "taxProfileId must be a positive integer" }),
  invoiceNumber: z.string().min(1).max(50),
  issueDate: z.coerce.date({ message: "Invalid date format" }),  
  dueDate: z.coerce.date({ message: "Invalid date format" }), 
  amount: z.coerce.number().positive({ message: "Amount must be a positive integer" }),
  currency: z.string().length(3).default("EUR"),
  status: z.enum(['DRAFT', 'PENDING', 'PAID', 'CANCELLED', 'OVERDUE']).optional().default('DRAFT'),
  description: z.string().optional(),
  notes: z.string().optional(),
});

export const invoiceQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).optional().default(1),
    limit: z.coerce.number().min(1).max(100).optional().default(10),
    status: z.enum(['DRAFT', 'PENDING', 'PAID', 'CANCELLED', 'OVERDUE']).optional(),
    date: z.coerce.date().optional(),
  }),
});

export const getInvoiceSchema = z.object({
  params: paramsSchema,
});

export const createInvoiceSchema = z.object({
  body: invoiceBodySchema,
});

export const updateInvoiceSchema = z.object({
  params: paramsSchema,
  body: invoiceBodySchema.partial(),
});

export type InvoiceParams = z.infer<typeof paramsSchema>;
export type CreateInvoiceDto = z.infer<typeof invoiceBodySchema>;
export type UpdateInvoiceDto = z.infer<typeof updateInvoiceSchema>['body'];
export type InvoiceQueryDto = z.infer<typeof invoiceQuerySchema>['query'];