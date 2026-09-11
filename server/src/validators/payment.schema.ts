import { z } from 'zod';

export const createOrderSchema = z.object({
  batchId: z.string().min(1, 'Batch ID is required'),
  enrollmentId: z.string().optional(),
});

export const verifyPaymentSchema = z.object({
  razorpayOrderId: z.string().min(1, 'Razorpay order ID is required'),
  razorpayPaymentId: z.string().min(1, 'Razorpay payment ID is required'),
  razorpaySignature: z.string().min(1, 'Razorpay signature is required'),
  batchId: z.string().min(1, 'Batch ID is required'),
  method: z.string().optional().default('Razorpay Checkout'),
});
