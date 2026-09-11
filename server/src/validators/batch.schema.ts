import { z } from 'zod';

export const createBatchSchema = z.object({
  name: z.string().min(2, 'Batch name must be at least 2 characters'),
  subject: z.string().min(2, 'Subject is required'),
  description: z.string().optional(),
  startDate: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid start date'),
  endDate: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid end date'),
  scheduleDays: z.array(z.string()).min(1, 'At least one day required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  capacity: z.coerce.number().int().min(1, 'Capacity must be at least 1'),
  fee: z.coerce.number().min(0, 'Fee cannot be negative'),
  teacher: z.string().min(1, 'Teacher ID is required'),
  status: z.enum(['upcoming', 'active', 'archived']).default('active'),
});

export const updateBatchSchema = createBatchSchema.partial();

export const updateBatchStatusSchema = z.object({
  status: z.enum(['upcoming', 'active', 'archived']),
});
