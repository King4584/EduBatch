import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  GraduationCap,
  IndianRupee,
  CalendarCheck,
  UserPlus,
  Mail,
  Phone,
  Edit3,
  Archive,
  UserMinus,
} from 'lucide-react';
import Modal from '../../components/Modal';
import { batchesApi } from '../../api/batches.api';
import { profileApi } from '../../api/profile.api';
import { enrollmentsApi } from '../../api/enrollments.api';
import { formatINR, formatDate } from '../../utils/formatters';
import { showToast } from '../../components/Toast';
import { useAuth } from '../../hooks/useAuth';

export const BatchDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [batch, setBatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState<any[]>([]);

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    subject: '',
    teacher: '',
    capacity: 30,
    fee: 25000,
    status: 'active',
    startDate: '',
    endDate: '',
    startTime: '10:00 AM',
    endTime: '12:00 PM',
    scheduleDays: 'Mon, Wed, Fri',
    description: '',
  });

  const fetchBatch = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await batchesApi.getById(id);
      if (res?.data) {
        setBatch(res.data);
        setEditForm({
          name: res.data.name || '',
          subject: res.data.subject || '',
          teacher: res.data.teacher?._id || res.data.teacher || '',
          capacity: res.data.capacity || 30,
          fee: res.data.fee || 0,
          status: res.data.status || 'active',
          startDate: res.data.startDate ? new Date(res.data.startDate).toISOString().split('T')[0] : '',
          endDate: res.data.endDate ? new Date(res.data.endDate).toISOString().split('T')[0] : '',
          startTime: res.data.startTime || '10:00 AM',
          endTime: res.data.endTime || '12:00 PM',
          scheduleDays: res.data.scheduleDays ? res.data.scheduleDays.join(', ') : 'Mon, Wed, Fri',
          description: res.data.description || '',
        });
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to load batch', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    if (isAdmin) {
      try {
        const res = await profileApi.getUsers({ role: 'teacher' });
        if (res?.data) {
          setTeachers(res.data);
        }
      } catch (err) {
        console.error('Failed to load teachers', err);
      }
    }
  };

  useEffect(() => {
    fetchBatch();
    fetchTeachers();
  }, [id]);

  const handleUpdateBatch = async () => {
    if (!id) return;
    if (!editForm.name || !editForm.subject) {
      showToast('Batch name and subject are required', 'error');
      return;
    }

    try {
      const scheduleDaysArray = editForm.scheduleDays
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await batchesApi.update(id, {
        name: editForm.name,
        subject: editForm.subject,
        teacher: editForm.teacher || undefined,
        capacity: Number(editForm.capacity),
        fee: Number(editForm.fee),
        status: editForm.status as any,
        startDate: editForm.startDate,
        endDate: editForm.endDate,
        startTime: editForm.startTime,
        endTime: editForm.endTime,
        scheduleDays: scheduleDaysArray,
        description: editForm.description,
      });

      showToast('Batch updated successfully!', 'success');
      setEditModalOpen(false);
      fetchBatch();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update batch', 'error');
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!id) return;
    try {
      await batchesApi.updateStatus(id, newStatus);
      showToast(`Batch status changed to ${newStatus}`, 'success');
      fetchBatch();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Status update failed', 'error');
    }
  };

  const handleArchiveBatch = async () => {
    if (!id) return;
    if (!window.confirm('Are you sure you want to archive this batch?')) return;
    try {
      await batchesApi.delete(id);
      showToast('Batch archived successfully', 'success');
      fetchBatch();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Archive failed', 'error');
    }
  };

  const handleDeactivateEnrollment = async (enrollmentId: string, studentName: string) => {
    if (!window.confirm(`Deactivate enrollment for student ${studentName}?`)) return;
    try {
      await enrollmentsApi.cancel(enrollmentId);
      showToast(`Enrollment deactivated for ${studentName}`, 'success');
      fetchBatch();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to deactivate enrollment', 'error');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 w-48" />
        <div className="skeleton h-44 w-full" />
        <div className="skeleton h-64 w-full" />
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
        <p className="text-slate-600 font-semibold">Batch not found</p>
        <button
          onClick={() => navigate('/batches')}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl"
        >
          Return to Batches
        </button>
      </div>
    );
  }

  const enrollments = batch.enrollments || [];
  const capacityPercent = Math.min(100, Math.round((enrollments.length / batch.capacity) * 100));

  return (
    <div className="space-y-6">
      {/* Back button & Admin Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <button
          onClick={() => navigate('/batches')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={14} /> Back to All Batches
        </button>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <select
              value={batch.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 shadow-2xs focus:outline-none"
            >
              <option value="active">Active</option>
              <option value="upcoming">Upcoming</option>
              <option value="archived">Archived</option>
            </select>

            <button
              onClick={() => setEditModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
            >
              <Edit3 size={13} />
              <span>Edit Batch</span>
            </button>

            {batch.status !== 'archived' && (
              <button
                onClick={handleArchiveBatch}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold shadow-2xs transition-colors"
              >
                <Archive size={13} />
                <span>Archive</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Batch Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="font-display font-700 text-xl text-slate-900">
                {batch.name}
              </h2>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                  batch.status === 'active'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : batch.status === 'upcoming'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                {batch.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Subject: <span className="font-semibold text-slate-700">{batch.subject}</span> · Ref ID:{' '}
              <span className="font-mono text-slate-400">{batch.id}</span>
            </p>
            {batch.description && (
              <p className="text-xs text-slate-600 mt-2 max-w-2xl">{batch.description}</p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/attendance"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold transition-colors"
            >
              <CalendarCheck size={14} />
              <span>Mark Attendance</span>
            </Link>
            <Link
              to="/enrollments"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <UserPlus size={14} />
              <span>Enroll Student</span>
            </Link>
          </div>
        </div>

        {/* Capacity Bar */}
        <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 uppercase font-semibold text-[10px]">Enrollment</span>
            <p className="font-bold text-slate-800 mt-0.5">
              {enrollments.length} / {batch.capacity} Students
            </p>
            <div className="mt-1 h-1.5 bg-slate-100 rounded-full overflow-hidden w-28">
              <div
                className={`h-full rounded-full ${capacityPercent >= 90 ? 'bg-rose-500' : 'bg-indigo-600'}`}
                style={{ width: `${capacityPercent}%` }}
              />
            </div>
          </div>

          <div>
            <span className="text-slate-400 uppercase font-semibold text-[10px]">Tuition Fee</span>
            <p className="font-mono font-bold text-slate-800 mt-0.5">
              {formatINR(batch.fee)}
            </p>
          </div>

          <div>
            <span className="text-slate-400 uppercase font-semibold text-[10px]">Schedule</span>
            <p className="font-semibold text-slate-800 mt-0.5">
              {batch.scheduleDays?.join(', ') || 'Mon, Wed, Fri'}
            </p>
            <p className="text-[11px] text-slate-400">
              {batch.startTime} - {batch.endTime}
            </p>
          </div>

          <div>
            <span className="text-slate-400 uppercase font-semibold text-[10px]">Term Period</span>
            <p className="font-semibold text-slate-800 mt-0.5">
              {formatDate(batch.startDate)}
            </p>
            <p className="text-[11px] text-slate-400">to {formatDate(batch.endDate)}</p>
          </div>
        </div>
      </div>

      {/* Grid: Assigned Faculty & Enrolled Roster */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Faculty Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs h-fit">
          <h3 className="font-display font-600 text-slate-800 text-sm mb-4">
            Assigned Faculty
          </h3>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-base shadow-xs">
              {(batch.teacher?.name || 'F')[0]}
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">
                {batch.teacher?.name || 'Instructor'}
              </h4>
              <p className="text-xs text-slate-400">Lead Faculty Member</p>
            </div>
          </div>
          <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2">
              <Mail size={13} className="text-slate-400" />
              <span>{batch.teacher?.email || 'faculty@edubatch.com'}</span>
            </div>
            {batch.teacher?.phone && (
              <div className="flex items-center gap-2">
                <Phone size={13} className="text-slate-400" />
                <span>{batch.teacher.phone}</span>
              </div>
            )}
          </div>
          {batch.teacher?.bio && (
            <p className="text-xs text-slate-500 mt-3 leading-relaxed">{batch.teacher.bio}</p>
          )}
        </div>

        {/* Student Roster */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="font-display font-600 text-slate-800 text-sm">
                Enrolled Students ({enrollments.length})
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Active students in this course</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-semibold uppercase text-[10px]">
                  <th className="px-4 py-3 text-left">Student</th>
                  <th className="px-4 py-3 text-left">Contact</th>
                  <th className="px-4 py-3 text-left">Enrolled Date</th>
                  <th className="px-4 py-3 text-left">Fee Status</th>
                  {isAdmin && <th className="px-4 py-3 text-right">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {enrollments.map((e: any) => (
                  <tr key={e.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white text-[11px] font-bold">
                          {e.student?.name ? e.student.name[0] : 'S'}
                        </div>
                        <span className="font-semibold text-slate-800">{e.student?.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      <p>{e.student?.email}</p>
                      <p className="text-[10px] text-slate-400">{e.student?.phone || 'No phone'}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{formatDate(e.enrolledAt)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${
                          e.paymentStatus === 'paid'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {e.paymentStatus}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDeactivateEnrollment(e.id, e.student?.name || 'Student')}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Deactivate / Remove enrollment"
                        >
                          <UserMinus size={14} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
                {enrollments.length === 0 && (
                  <tr>
                    <td colSpan={isAdmin ? 5 : 4} className="px-4 py-12 text-center text-slate-400">
                      No students enrolled in this batch yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Batch Modal */}
      {isAdmin && (
        <Modal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          title="Edit Batch Details"
          size="lg"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Batch Name *</label>
              <input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subject *</label>
              <input
                value={editForm.subject}
                onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Assign Faculty *</label>
              <select
                value={editForm.teacher}
                onChange={(e) => setEditForm({ ...editForm, teacher: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 bg-white"
              >
                <option value="">Select Faculty...</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Student Capacity *</label>
              <input
                type="number"
                value={editForm.capacity}
                onChange={(e) => setEditForm({ ...editForm, capacity: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tuition Fee (₹) *</label>
              <input
                type="number"
                value={editForm.fee}
                onChange={(e) => setEditForm({ ...editForm, fee: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 bg-white"
              >
                <option value="active">Active</option>
                <option value="upcoming">Upcoming</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Schedule Days</label>
              <input
                value={editForm.scheduleDays}
                onChange={(e) => setEditForm({ ...editForm, scheduleDays: e.target.value })}
                placeholder="Mon, Wed, Fri"
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                value={editForm.startDate}
                onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
              <input
                type="date"
                value={editForm.endDate}
                onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
              <textarea
                rows={2}
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none"
              />
            </div>
          </div>

          <div className="flex gap-2.5 mt-6 justify-end pt-3 border-t border-slate-100">
            <button
              onClick={() => setEditModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateBatch}
              className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors"
            >
              Save Changes
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default BatchDetailsPage;
