import { z } from 'zod';

export const createNoticeSchema = z.object({
  batch: z.string().nullable().optional(),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  body: z.string().min(5, 'Notice content must be at least 5 characters'),
  category: z.enum(['Holiday', 'Academic', 'Finance', 'Batch', 'Event']).default('Academic'),
  pinned: z.boolean().default(false),
});

export const updateNoticeSchema = createNoticeSchema.partial();
