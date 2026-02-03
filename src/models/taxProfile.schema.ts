import { z } from 'zod';

const paramsSchema = z.object({
  id: z.coerce.number().int().positive({ message: "ID must be a positive integer" }),
});

const taxProfileBodySchema = z.object({  
  companyName: z.string().min(1, { message: "Company Name is required" }).max(255),
  vatNumber: z.string().min(1, { message: "VAT Number is required" }).max(50),
  taxCode: z.string().max(50).optional(),
  address: z.string().min(1, { message: "Address is required" }).max(500),
  city: z.string().min(1, { message: "City is required" }).max(100),
  postalCode: z.string().min(1, { message: "Postal Code is required" }).max(20),
  country: z.string().length(2, { message: "Country must be a ISO 3166 country code" }),
  phone: z.string().max(30).optional(),
  email: z.email().optional().or(z.literal('')),
});

export const taxProfileQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).optional().default(1),
    limit: z.coerce.number().min(1).max(100).optional().default(10),
    companyName: z.string().optional(),
    vatNumber: z.string().optional(),
  }),
});

export const getTaxProfileSchema = z.object({
  params: paramsSchema,
});

export const createTaxProfileSchema = z.object({
  body: taxProfileBodySchema,
});

export const updateTaxProfileSchema = z.object({
  params: paramsSchema,
  body: taxProfileBodySchema.partial(),
});

export type TaxProfileParams = z.infer<typeof paramsSchema>;
export type TaxProfileQueryDto = z.infer<typeof taxProfileQuerySchema>['query'];
export type CreateTaxProfileDto = z.infer<typeof taxProfileBodySchema>;
export type UpdateTaxProfileDto = z.infer<typeof updateTaxProfileSchema>['body'];