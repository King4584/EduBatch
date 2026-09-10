import apiClient from './client';

export interface NoticeItem {
  id: string;
  _id?: string;
  title: string;
  content: string;
  category: 'Holiday' | 'Academic' | 'Finance' | 'Batch' | 'Event';
  pinned: boolean;
  date: string;
  author: string;
  batch?: string | null;
  batchId?: string | null;
}

export const noticesApi = {
  getAll: async () => {
    const res = await apiClient.get('/notices');
    return res.data;
  },

  create: async (data: {
    title: string;
    body: string;
    category?: string;
    pinned?: boolean;
    batch?: string | null;
  }) => {
    const res = await apiClient.post('/notices', data);
    return res.data;
  },

  update: async (id: string, data: Partial<NoticeItem>) => {
    const res = await apiClient.put(`/notices/${id}`, data);
    return res.data;
  },

  delete: async (id: string) => {
    const res = await apiClient.delete(`/notices/${id}`);
    return res.data;
  },
};
