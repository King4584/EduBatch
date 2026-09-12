import apiClient from './client';

export interface AttendanceRecordItem {
  student: string;
  status: 'Present' | 'Absent' | 'Late';
  remarks?: string;
}

export const attendanceApi = {
  mark: async (data: { batchId: string; date: string; records: AttendanceRecordItem[] }) => {
    const res = await apiClient.post('/attendance', data);
    return res.data;
  },

  getBatchAttendance: async (batchId: string, params?: { date?: string; startDate?: string; endDate?: string }) => {
    const res = await apiClient.get(`/attendance/batch/${batchId}`, { params });
    return res.data;
  },

  getMyAttendance: async () => {
    const res = await apiClient.get('/attendance/my');
    return res.data;
  },
};
