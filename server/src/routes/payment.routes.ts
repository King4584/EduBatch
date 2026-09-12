import { Router } from 'express';
import {
  createOrder,
  verifyPayment,
  getPaymentHistory,
  getPaymentById,
  getPaymentReceipt,
  handleWebhook,
} from '../controllers/payment.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createOrderSchema, verifyPaymentSchema } from '../validators/payment.schema.js';

const router = Router();

router.post('/webhook', handleWebhook);
router.post('/create-order', authenticate, validate(createOrderSchema), createOrder);
router.post('/verify', authenticate, validate(verifyPaymentSchema), verifyPayment);
router.get('/history', authenticate, getPaymentHistory);
router.get('/:id', authenticate, getPaymentById);
router.get('/:id/receipt', authenticate, getPaymentReceipt);

export default router;
