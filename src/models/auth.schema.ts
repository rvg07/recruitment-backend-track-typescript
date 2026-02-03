import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    email: z.email({ message: "Invalid email format" }),
    password: z.string().min(1, { message: "Password is required" }),
  }),
});

export const registerSchema = z.object({
  body: z.object({
    email: z.email({ message: "Invalid email format" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
    firstName: z.string().min(1, { message: "First name is required" }),
    lastName: z.string().min(1, { message: "Last name is required" }),
  }),
});

export type LoginDto = z.infer<typeof loginSchema>['body'];
export type RegisterDto = z.infer<typeof registerSchema>['body'];