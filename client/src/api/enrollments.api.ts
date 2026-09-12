import apiClient from './client';

export interface EnrollmentItem {
  id: string;
  _id?: string;
  student: {
    _id: string;
    id?: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  batch: {
    _id: string;
    id?: string;
    name: string;
    subject: string;
    fee: number;
    capacity: number;
    startDate?: string;
    endDate?: string;
  };
  paymentStatus: 'pending' | 'paid' | 'waived';
  enrolledAt: string;
  isActive: boolean;
}

export const enrollmentsApi = {
  getAll: async (params?: { batchId?: string; studentId?: string; paymentStatus?: string; page?: number; limit?: number }) => {
    const res = await apiClient.get('/enrollments', { params });
    return res.data;
  },

  getMy: async () => {
    const res = await apiClient.get('/enrollments/my');
    return res.data;
  },

  create: async (data: { student: string; batch: string; paymentStatus?: string }) => {
    const res = await apiClient.post('/enrollments', data);
    return res.data;
  },

  cancel: async (id: string) => {
    const res = await apiClient.delete(`/enrollments/${id}`);
    return res.data;
  },
};
