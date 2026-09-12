import React, { useState, useEffect } from 'react';
import { Plus, Users, UserCheck, UserMinus, ShieldCheck } from 'lucide-react';
import Modal from '../../components/Modal';
import { showToast } from '../../components/Toast';
import { batchesApi, BatchItem } from '../../api/batches.api';
import { profileApi } from '../../api/profile.api';
import { enrollmentsApi } from '../../api/enrollments.api';
import { formatDate } from '../../utils/formatters';

export const EnrollmentsPage: React.FC = () => {
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [enrollmentList, setEnrollmentList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ studentId: '', batchId: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [batchesRes, studentsRes, enrollmentsRes] = await Promise.all([
        batchesApi.getAll(),
        profileApi.getUsers({ role: 'student' }),
        enrollmentsApi.getAll({ limit: 50 }),
      ]);
      if (batchesRes?.data) setBatches(batchesRes.data);
      if (studentsRes?.data) setStudents(studentsRes.data);
      if (enrollmentsRes?.data) setEnrollmentList(enrollmentsRes.data);
    } catch (err) {
      console.error('Failed to load enrollments', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (id: string, name: string) => {
    if (!window.confirm(`Deactivate enrollment for student ${name}?`)) return;
    try {
      await enrollmentsApi.cancel(id);
      showToast(`Enrollment deactivated for ${name}`, 'success');
      fetchData();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Deactivation failed', 'error');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async () => {
    if (!form.studentId || !form.batchId) {
      showToast('Please select both a student and a batch', 'error');
      return;
    }

    try {
      await enrollmentsApi.create({
        student: form.studentId,
        batch: form.batchId,
      });
      showToast('Student enrolled into batch successfully!', 'success');
      setModalOpen(false);
      setForm({ studentId: '', batchId: '' });
      fetchData();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Enrollment failed', 'error');
    }
  };

  const totalEnrollments = batches.reduce((acc, b) => acc + (b.students || 0), 0);

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="font-display font-700 text-slate-800 text-base">
            Enrollment Capacity Overview
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {totalEnrollments} active enrollments distributed across {batches.length} batches
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors shrink-0"
        >
          <Plus size={14} />
          <span>New Enrollment</span>
        </button>
      </div>

      {/* Grid of Batch Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {batches.map((b) => {
          const enrolled = b.students || 0;
          const ratio = enrolled / b.capacity;
          const isNearFull = ratio >= 0.9;

          return (
            <div
              key={b.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0 pr-2">
                    <h4 className="font-display font-600 text-slate-800 text-sm truncate">
                      {b.name}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">{b.subject}</p>
                  </div>
                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase border shrink-0 ${
                      b.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}
                  >
                    {b.status}
                  </span>
                </div>

                <div className="flex items-center justify-between mb-1.5 text-xs">
                  <span className="text-slate-500 font-medium">Capacity Meter</span>
                  <span className="font-bold text-slate-800">
                    {enrolled} / {b.capacity}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isNearFull ? 'bg-rose-500' : 'bg-indigo-600'
                    }`}
                    style={{ width: `${Math.min(100, ratio * 100)}%` }}
                  />
                </div>

                {/* Avatar Stack */}
                <div className="flex -space-x-2 mb-4 overflow-hidden py-1">
                  {[...Array(Math.min(6, enrolled || 3))].map((_, i) => (
                    <div
                      key={i}
                      className="w-7 h-7 rounded-full border-2 border-white bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-[10px] font-bold shadow-xs"
                    >
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                  {enrolled > 6 && (
                    <div className="w-7 h-7 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-slate-600 text-[10px] font-bold">
                      +{enrolled - 6}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>Faculty: {b.teacherName || 'Faculty'}</span>
                <span className="font-semibold text-slate-600">{b.scheduleDays?.join(', ')}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Enrollments Roster */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-display font-600 text-slate-800 text-sm">
              Active Enrollments Registry
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live records across all institutes ({enrollmentList.length} enrolled students)
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-semibold uppercase text-[10px]">
                <th className="px-5 py-3.5 text-left">Student</th>
                <th className="px-5 py-3.5 text-left">Batch Course</th>
                <th className="px-5 py-3.5 text-left">Enrollment Date</th>
                <th className="px-5 py-3.5 text-left">Fee Status</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {enrollmentList.map((e: any) => (
                <tr key={e._id || e.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-bold text-[10px]">
                        {e.student?.name ? e.student.name[0] : 'S'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{e.student?.name || 'Student'}</p>
                        <p className="text-[11px] text-slate-400">{e.student?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-slate-700">{e.batch?.name || 'Course'}</p>
                    <p className="text-[11px] text-slate-400">{e.batch?.subject}</p>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500">
                    {formatDate(e.enrolledAt || e.createdAt)}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                        e.paymentStatus === 'paid'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {e.paymentStatus}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => handleDeactivate(e._id || e.id, e.student?.name || 'Student')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold border border-transparent hover:border-rose-100 transition-colors"
                      title="Deactivate / Remove enrollment"
                    >
                      <UserMinus size={13} />
                      <span>Remove</span>
                    </button>
                  </td>
                </tr>
              ))}
              {enrollmentList.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                    No active enrollments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Enrollment Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Enroll Student in Batch">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Student *
            </label>
            <select
              value={form.studentId}
              onChange={(e) => setForm({ ...form, studentId: e.target.value })}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 bg-white"
            >
              <option value="">Choose student...</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Batch Course *
            </label>
            <select
              value={form.batchId}
              onChange={(e) => setForm({ ...form, batchId: e.target.value })}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 bg-white"
            >
              <option value="">Choose batch...</option>
              {batches
                .filter((b) => b.status !== 'archived')
                .map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.students || 0}/{b.capacity} seats filled)
                  </option>
                ))}
            </select>
          </div>

          {form.studentId && form.batchId && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-xs text-indigo-700 leading-relaxed">
              <span className="font-bold">Summary:</span> Selected student will be enrolled into the batch. System automatically validates available seat capacity before committing.
            </div>
          )}
        </div>

        <div className="flex gap-2.5 mt-6 justify-end pt-3 border-t border-slate-100">
          <button
            onClick={() => setModalOpen(false)}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors"
          >
            Enroll Now
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default EnrollmentsPage;
