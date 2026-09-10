import apiClient from './client';

export interface BatchItem {
  id: string;
  _id?: string;
  name: string;
  subject: string;
  description?: string;
  startDate: string;
  endDate: string;
  scheduleDays: string[];
  startTime: string;
  endTime: string;
  capacity: number;
  fee: number;
  status: 'upcoming' | 'active' | 'archived';
  students?: number;
  teacher?: string | {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  teacherName?: string;
}

export const batchesApi = {
  getAll: async (params?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    onlyAssigned?: boolean;
  }) => {
    const res = await apiClient.get('/batches', { params });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get(`/batches/${id}`);
    return res.data;
  },

  create: async (data: Partial<BatchItem>) => {
    const res = await apiClient.post('/batches', data);
    return res.data;
  },

  update: async (id: string, data: Partial<BatchItem>) => {
    const res = await apiClient.put(`/batches/${id}`, data);
    return res.data;
  },

  delete: async (id: string) => {
    const res = await apiClient.delete(`/batches/${id}`);
    return res.data;
  },

  updateStatus: async (id: string, status: string) => {
    const res = await apiClient.patch(`/batches/${id}/status`, { status });
    return res.data;
  },

  getTeacherBatches: async () => {
    const res = await apiClient.get('/batches/teacher/my-batches');
    return res.data;
  },
};
