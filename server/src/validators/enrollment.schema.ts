import { z } from 'zod';

export const createEnrollmentSchema = z.object({
  student: z.string().min(1, 'Student ID is required'),
  batch: z.string().min(1, 'Batch ID is required'),
  paymentStatus: z.enum(['pending', 'paid', 'waived']).default('pending'),
});
