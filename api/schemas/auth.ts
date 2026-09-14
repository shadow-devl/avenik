import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  role: z.enum([
    'ENTREPRENEUR',
    'INVESTOR',
    'MENTOR',
    'ADVISOR',
    'INCUBATOR',
    'ACCELERATOR',
    'GOVERNMENT',
    'CORPORATE',
    'STUDENT',
    'UNIVERSITY',
    'SERVICE_PROVIDER',
  ]),
});

export type LoginRequest = z.infer<typeof LoginSchema>;
export type RegisterRequest = z.infer<typeof RegisterSchema>;
