import apiClient from './client';

export interface PaymentItem {
  id: string;
  _id?: string;
  receiptNumber: string;
  student: string | { name: string; email: string };
  studentName?: string;
  batch: string | { name: string; fee: number };
  batchName?: string;
  amount: number;
  currency: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  method: string;
  status: 'created' | 'paid' | 'failed';
  displayStatus?: string;
  paidAt?: string;
  date?: string;
}

export const paymentsApi = {
  createOrder: async (data: { batchId: string; enrollmentId?: string }) => {
    const res = await apiClient.post('/payments/create-order', data);
    return res.data;
  },

  verifyPayment: async (data: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    batchId: string;
    method?: string;
  }) => {
    const res = await apiClient.post('/payments/verify', data);
    return res.data;
  },

  getHistory: async (params?: { status?: string; page?: number; limit?: number }) => {
    const res = await apiClient.get('/payments/history', { params });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get(`/payments/${id}`);
    return res.data;
  },

  getReceipt: async (id: string) => {
    const res = await apiClient.get(`/payments/${id}/receipt`);
    return res.data;
  },
};
