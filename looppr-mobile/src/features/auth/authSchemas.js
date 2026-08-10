import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Matches looppr-backend's registerValidation exactly (phone regex, password
// letter+number rule) — the real customer-auth endpoint rejects anything
// looser than this.
export const registerSchema = loginSchema.extend({
  name: z.string().trim().min(2, 'Enter your full name'),
  phone: z.string().trim().regex(/^\+?[0-9\s()-]{7,20}$/, 'Enter a valid phone number'),
  password: z
    .string()
    .regex(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/, 'Password must be at least 8 characters and include a letter and a number'),
});

export const otpSchema = z.object({
  code: z.string().trim().regex(/^\d{6}$/, 'Enter the 6-digit code'),
});

export const forgotPasswordEmailSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email'),
});

export const resetPasswordSchema = z.object({
  code: z.string().trim().regex(/^\d{6}$/, 'Enter the 6-digit code'),
  newPassword: z
    .string()
    .regex(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/, 'Password must be at least 8 characters and include a letter and a number'),
});
