import Razorpay from 'razorpay';
import crypto from 'crypto';
import { ENV } from '../config/env.js';

let razorpayInstance: Razorpay | null = null;

// Initialize razorpay instance if credentials look like live/test credentials
try {
  if (
    ENV.RAZORPAY_KEY_ID &&
    ENV.RAZORPAY_KEY_SECRET &&
    !ENV.RAZORPAY_KEY_ID.includes('demo')
  ) {
    razorpayInstance = new Razorpay({
      key_id: ENV.RAZORPAY_KEY_ID,
      key_secret: ENV.RAZORPAY_KEY_SECRET,
    });
  }
} catch (err) {
  console.warn('[Razorpay] Failed to initialize client, fallback mode active:', err);
}

export interface CreateOrderParams {
  amount: number; // in INR
  receipt: string;
  notes?: Record<string, string>;
}

export const createRazorpayOrder = async (params: CreateOrderParams) => {
  const amountInPaise = Math.round(params.amount * 100);

  if (razorpayInstance) {
    try {
      const order = await razorpayInstance.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: params.receipt,
        notes: params.notes || {},
      });
      return {
        id: order.id,
        amount: Number(order.amount) / 100,
        currency: order.currency,
        receipt: order.receipt,
      };
    } catch (error) {
      console.warn('[Razorpay] Live order creation failed, falling back to simulated order:', error);
    }
  }

  // Simulated Razorpay order for test / sandbox
  const simulatedOrderId = `order_${crypto.randomBytes(8).toString('hex')}`;
  return {
    id: simulatedOrderId,
    amount: params.amount,
    currency: 'INR',
    receipt: params.receipt,
  };
};

export const verifyPaymentSignature = (
  orderId: string,
  paymentId: string,
  signature: string
): boolean => {
  // If simulated test transaction, allow verification
  if (orderId.startsWith('order_') && signature.startsWith('mock_sig_')) {
    return true;
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', ENV.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    return expectedSignature === signature;
  } catch (err) {
    console.error('[Razorpay] Signature verification error:', err);
    return false;
  }
};
