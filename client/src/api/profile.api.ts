import apiClient from './client';

export const profileApi = {
  getProfile: async () => {
    const res = await apiClient.get('/profile');
    return res.data;
  },

  updateProfile: async (data: {
    name?: string;
    phone?: string;
    city?: string;
    institute?: string;
    bio?: string;
    avatar?: string;
  }) => {
    const res = await apiClient.put('/profile', data);
    return res.data;
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    const res = await apiClient.put('/profile/password', data);
    return res.data;
  },

  getUsers: async (params?: { role?: string; search?: string }) => {
    const res = await apiClient.get('/profile/users', { params });
    return res.data;
  },
};
