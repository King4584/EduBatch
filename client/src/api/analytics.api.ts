import apiClient from './client';

export const analyticsApi = {
  getAdminStats: async () => {
    const res = await apiClient.get('/analytics/admin');
    return res.data;
  },

  getTeacherStats: async () => {
    const res = await apiClient.get('/analytics/teacher');
    return res.data;
  },

  getStudentStats: async () => {
    const res = await apiClient.get('/analytics/student');
    return res.data;
  },
};
