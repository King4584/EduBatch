import apiClient from './client';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
  phone?: string;
  city?: string;
  institute?: string;
  bio?: string;
  avatar?: string;
}

export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const res = await apiClient.post('/auth/login', credentials);
    return res.data;
  },
  
  register: async (data: {
    name: string;
    email: string;
    password: string;
    role?: string;
    phone?: string;
    city?: string;
    institute?: string;
  }) => {
    const res = await apiClient.post('/auth/register', data);
    return res.data;
  },

  logout: async () => {
    const res = await apiClient.post('/auth/logout');
    return res.data;
  },

  getMe: async () => {
    const res = await apiClient.get('auth/me');
    return res.data;
  },

  forgotPassword: async (email: string) => {
    const res = await apiClient.post('/auth/forgot-password', { email });
    return res.data;
  },

  resetPassword: async (data: { token: string; password: string }) => {
    const res = await apiClient.post('/auth/reset-password', data);
    return res.data;
  },
};

