import { z } from 'zod';

const paramsSchema = z.object({
  id: z.coerce.number().int().positive({ message: "ID must be a positive integer" }),
});

const UserStatusEnum = z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']);

const userBodySchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email({ message: "Invalid email format" })),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  status: UserStatusEnum.optional().default('ACTIVE'),
});

export const userQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).optional().default(1),
    limit: z.coerce.number().min(1).max(100).optional().default(10),
    email: z.string().optional(),
    status: UserStatusEnum.optional(),
  }),
});

export const getUserSchema = z.object({
  params: paramsSchema,
});

export const createUserSchema = z.object({
  body: userBodySchema,
});

export const updateUserSchema = z.object({
  params: paramsSchema,
  body: userBodySchema.partial(),
});

export type UserParams = z.infer<typeof paramsSchema>;
export type UserQueryDto = z.infer<typeof userQuerySchema>['query'];
export type CreateUserDto = z.infer<typeof userBodySchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>['body'];