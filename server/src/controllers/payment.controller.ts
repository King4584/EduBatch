import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { Payment } from '../models/Payment.js';
import { Batch } from '../models/Batch.js';
import { Enrollment } from '../models/Enrollment.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/apiError.js';
import { sendResponse } from '../utils/apiResponse.js';
import { createRazorpayOrder, verifyPaymentSignature } from '../services/razorpay.service.js';
import { sendPaymentReceiptEmail } from '../services/email.service.js';
import { generateReceiptHtml } from '../services/pdf.service.js';
import { ENV } from '../config/env.js';

export const createOrder = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    let { batchId, enrollmentId } = req.body;
    const studentId = req.user!.id;

    if (!batchId && enrollmentId) {
      const enrollment = await Enrollment.findById(enrollmentId);
      if (!enrollment) {
        throw ApiError.notFound('Enrollment record not found');
      }
      batchId = enrollment.batch.toString();
    }

    const batch = await Batch.findById(batchId);
    if (!batch) {
      throw ApiError.notFound('Batch not found');
    }

    const receiptNumber = `RCP-${Date.now().toString().slice(-6)}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

    // Create Razorpay order
    const rzpOrder = await createRazorpayOrder({
      amount: batch.fee,
      receipt: receiptNumber,
      notes: {
        batchId: batch._id.toString(),
        studentId,
        studentEmail: req.user!.email,
      },
    });

    // Create initial payment record
    const payment = await Payment.create({
      student: studentId,
      batch: batchId,
      enrollment: enrollmentId,
      amount: batch.fee,
      currency: 'INR',
      razorpayOrderId: rzpOrder.id,
      receiptNumber,
      status: 'created',
    });

    sendResponse(res, 201, 'Razorpay order created', {
      orderId: rzpOrder.id,
      amount: batch.fee,
      currency: 'INR',
      keyId: ENV.RAZORPAY_KEY_ID,
      receiptNumber,
      paymentId: payment._id,
      batch: {
        name: batch.name,
        subject: batch.subject,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    let { razorpayOrderId, razorpayPaymentId, razorpaySignature, batchId, enrollmentId, method = 'Razorpay Checkout' } = req.body;
    const studentId = req.user!.id;

    // Verify cryptographic signature
    const isValid = verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!isValid) {
      await Payment.findOneAndUpdate(
        { razorpayOrderId },
        { status: 'failed', razorpayPaymentId }
      );
      throw ApiError.badRequest('Invalid payment signature verification failed');
    }

    let targetBatchId = batchId;
    let enrollment = enrollmentId ? await Enrollment.findById(enrollmentId) : null;
    if (enrollment && !targetBatchId) {
      targetBatchId = enrollment.batch.toString();
    }

    if (!targetBatchId) {
      const existingPay = await Payment.findOne({ razorpayOrderId });
      if (existingPay?.batch) {
        targetBatchId = existingPay.batch.toString();
      }
    }

    // Find batch and student
    const [batch, student] = await Promise.all([
      Batch.findById(targetBatchId),
      User.findById(studentId),
    ]);

    if (!batch || !student) {
      throw ApiError.notFound('Batch or student not found');
    }

    let payment = await Payment.findOne({ razorpayOrderId });
    if (!payment) {
      const receiptNumber = `RCP-${Date.now().toString().slice(-6)}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
      payment = new Payment({
        student: studentId,
        batch: targetBatchId,
        amount: batch.fee,
        currency: 'INR',
        razorpayOrderId,
        receiptNumber,
      });
    }

    payment.razorpayPaymentId = razorpayPaymentId;
    payment.razorpaySignature = razorpaySignature;
    payment.status = 'paid';
    payment.paidAt = new Date();
    payment.method = method;

    // Link or update enrollment
    if (!enrollment) {
      enrollment = await Enrollment.findOne({ student: studentId, batch: targetBatchId, isActive: true });
    }
    if (!enrollment) {
      enrollment = await Enrollment.create({
        student: studentId,
        batch: targetBatchId,
        paymentStatus: 'paid',
        payment: payment._id as any,
        isActive: true,
      });
    } else {
      enrollment.paymentStatus = 'paid';
      enrollment.payment = payment._id as any;
      await enrollment.save();
    }

    payment.enrollment = enrollment._id as any;
    await payment.save();

    // Send receipt email
    const receiptDate = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    sendPaymentReceiptEmail(student.email, student.name, {
      receiptNumber: payment.receiptNumber,
      batchName: batch.name,
      amount: payment.amount,
      paymentId: razorpayPaymentId,
      date: receiptDate,
      method: payment.method || 'Razorpay',
    }).catch((err) => console.warn('[Payment] Receipt email background error:', err));

    sendResponse(res, 200, 'Payment verified and marked successful', {
      payment: {
        id: payment._id,
        receiptNumber: payment.receiptNumber,
        amount: payment.amount,
        status: payment.status,
        paidAt: payment.paidAt,
        method: payment.method,
      },
      enrollmentId: enrollment._id,
    });
  } catch (error) {
    next(error);
  }
};

export const getPaymentHistory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;

    const query: any = {};
    if (req.user?.role === 'student') {
      query.student = req.user.id;
    }

    if (status && status !== 'All') {
      query.status = status.toString().toLowerCase();
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Math.min(100, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [payments, total] = await Promise.all([
      Payment.find(query)
        .populate('student', 'name email phone avatar')
        .populate('batch', 'name subject fee')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Payment.countDocuments(query),
    ]);

    const formatted = payments.map((p) => ({
      ...p,
      id: p.receiptNumber || p._id,
      studentName: (p.student as any)?.name || 'Unknown',
      batchName: (p.batch as any)?.name || 'General',
      date: p.paidAt
        ? new Date(p.paidAt).toISOString().split('T')[0]
        : new Date(p.createdAt).toISOString().split('T')[0],
      displayStatus: p.status === 'paid' ? 'Completed' : p.status === 'created' ? 'Pending' : 'Failed',
    }));

    sendResponse(res, 200, 'Payment history retrieved', formatted, {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    next(error);
  }
};

export const getPaymentById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const payment = await Payment.findById(id)
      .populate('student', 'name email phone avatar')
      .populate('batch', 'name subject fee')
      .lean();

    if (!payment) {
      throw ApiError.notFound('Payment record not found');
    }

    if (
      req.user?.role === 'student' &&
      (payment.student as any)?._id?.toString() !== req.user.id
    ) {
      throw ApiError.forbidden('Unauthorized access to payment record');
    }

    sendResponse(res, 200, 'Payment record retrieved', payment);
  } catch (error) {
    next(error);
  }
};

export const getPaymentReceipt = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const payment = await Payment.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { receiptNumber: id }],
    })
      .populate('student', 'name email')
      .populate('batch', 'name subject fee')
      .lean();

    if (!payment) {
      throw ApiError.notFound('Receipt not found');
    }

    const receiptData = {
      receiptNumber: payment.receiptNumber,
      studentName: (payment.student as any)?.name || 'Student',
      studentEmail: (payment.student as any)?.email || '',
      batchName: (payment.batch as any)?.name || 'Batch Course',
      subject: (payment.batch as any)?.subject || 'General',
      amount: payment.amount,
      date: payment.paidAt
        ? new Date(payment.paidAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })
        : new Date(payment.createdAt).toLocaleDateString('en-IN'),
      transactionId: payment.razorpayPaymentId || payment.razorpayOrderId,
      method: payment.method || 'Online',
      status: payment.status,
    };

    if (req.query.format === 'html') {
      res.setHeader('Content-Type', 'text/html');
      return res.send(generateReceiptHtml(receiptData)) as any;
    }

    sendResponse(res, 200, 'Receipt data retrieved', receiptData);
  } catch (error) {
    next(error);
  }
};

export const handleWebhook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    if (!signature) {
      throw ApiError.badRequest('Missing x-razorpay-signature header');
    }

    const secret = ENV.RAZORPAY_WEBHOOK_SECRET;
    const body = (req as any).rawBody ? (req as any).rawBody.toString('utf8') : JSON.stringify(req.body);
    const expectedSignature = crypto.createHmac('sha256', secret).update(body).digest('hex');

    if (expectedSignature !== signature) {
      throw ApiError.badRequest('Invalid webhook signature');
    }

    const event = req.body?.event;
    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = req.body?.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;
      const paymentId = paymentEntity?.id;

      if (orderId) {
        const payment = await Payment.findOne({ razorpayOrderId: orderId });
        if (payment && payment.status !== 'paid') {
          payment.status = 'paid';
          payment.razorpayPaymentId = paymentId;
          payment.paidAt = new Date();
          await payment.save();

          if (payment.enrollment) {
            await Enrollment.findByIdAndUpdate(payment.enrollment, {
              paymentStatus: 'paid',
              payment: payment._id,
            });
          } else if (payment.batch && payment.student) {
            await Enrollment.findOneAndUpdate(
              { student: payment.student, batch: payment.batch, isActive: true },
              { paymentStatus: 'paid', payment: payment._id }
            );
          }
        }
      }
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    next(error);
  }
};

