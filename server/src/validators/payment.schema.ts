import { z } from 'zod';

export const createOrderSchema = z
  .object({
    batchId: z.string().optional(),
    enrollmentId: z.string().optional(),
  })
  .refine((data) => !!data.batchId || !!data.enrollmentId, {
    message: 'Either batchId or enrollmentId is required',
  });

export const verifyPaymentSchema = z.object({
  razorpayOrderId: z.string().min(1, 'Razorpay order ID is required'),
  razorpayPaymentId: z.string().min(1, 'Razorpay payment ID is required'),
  razorpaySignature: z.string().min(1, 'Razorpay signature is required'),
  batchId: z.string().optional(),
  enrollmentId: z.string().optional(),
  method: z.string().optional().default('Razorpay Checkout'),
});
