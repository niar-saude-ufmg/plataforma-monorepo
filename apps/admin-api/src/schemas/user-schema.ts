import { z } from 'zod';

export const createUserSchema = z.object({
  full_name: z.string().min(1, { message: 'Full name is required' }),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
  role: z.enum(['researcher', 'admin']).default('researcher')
});

export const userResponseSchema = z.object({
  id: z.number(),
  full_name: z.string(),
  email: z.string().email(),
  role: z.string(),
  is_active: z.boolean(),
  created_at: z.date(),
});


export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;
