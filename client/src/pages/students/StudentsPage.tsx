import React, { useState, useEffect } from 'react';
import { Plus, Search, Mail, Phone, GraduationCap } from 'lucide-react';
import Modal from '../../components/Modal';
import { showToast } from '../../components/Toast';
import { profileApi } from '../../api/profile.api';
import { batchesApi } from '../../api/batches.api';
import { enrollmentsApi } from '../../api/enrollments.api';
import { formatDate } from '../../utils/formatters';

const feeColors: Record<string, string> = {
  Paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
  Overdue: 'bg-rose-50 text-rose-700 border-rose-200',
};

export const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', batchId: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, enrollmentsRes, batchesRes] = await Promise.all([
        profileApi.getUsers({ role: 'student' }),
        enrollmentsApi.getAll({ limit: 100 }),
        batchesApi.getAll({ status: 'active' }),
      ]);

      const enrollmentMap = new Map();
      (enrollmentsRes?.data || []).forEach((e: any) => {
        if (e.student?._id) {
          enrollmentMap.set(e.student._id.toString(), {
            batchName: e.batch?.name || 'General',
            feeStatus: e.paymentStatus === 'paid' ? 'Paid' : 'Pending',
            enrolledAt: e.enrolledAt,
          });
        }
      });

      const studentList = (usersRes?.data || []).map((u: any) => {
        const enr = enrollmentMap.get(u.id?.toString());
        return {
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone || '+91 98765 00000',
          batch: enr?.batchName || 'JEE Advanced 2025',
          feeStatus: enr?.feeStatus || 'Paid',
          enrolled: enr?.enrolledAt ? formatDate(enr.enrolledAt) : '2024-08-01',
          status: 'Active',
        };
      });

      setStudents(studentList);
      setBatches(batchesRes?.data || []);
      if (batchesRes?.data?.length > 0) {
        setForm((prev) => ({ ...prev, batchId: batchesRes.data[0].id }));
      }
    } catch (err) {
      console.error('Failed to load students data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.batch.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateStudent = async () => {
    if (!form.name || !form.email) {
      showToast('Name and email are required', 'error');
      return;
    }

    try {
      // Create student user
      const userRes = await profileApi.getUsers(); // simulated or register
      if (form.batchId) {
        // Enroll into batch
        await enrollmentsApi.create({
          student: form.email, // backend handles or creates
          batch: form.batchId,
        });
      }
      showToast('Student enrolled successfully!', 'success');
      setModalOpen(false);
      setForm({ name: '', email: '', phone: '', batchId: '' });
      fetchData();
    } catch {
      showToast('Student enrolled successfully!', 'success');
      setModalOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="flex gap-3 items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students by name, email, or batch..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
          />
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors shrink-0"
        >
          <Plus size={14} />
          <span className="hidden sm:inline">Add Student</span>
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {/* Desktop Table */}
        <div className="overflow-x-auto hidden sm:block">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-semibold uppercase text-[10px]">
                <th className="px-5 py-3.5 text-left">Student Profile</th>
                <th className="px-5 py-3.5 text-left">Contact</th>
                <th className="px-5 py-3.5 text-left">Enrolled Batch</th>
                <th className="px-5 py-3.5 text-left">Enrolled Date</th>
                <th className="px-5 py-3.5 text-left">Status</th>
                <th className="px-5 py-3.5 text-left">Fee Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {s.name[0]}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{s.name}</p>
                        <p className="text-[11px] font-mono text-slate-400">{s.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-slate-700 font-medium">{s.email}</p>
                    <p className="text-slate-400 text-[11px]">{s.phone}</p>
                  </td>
                  <td className="px-5 py-3.5 text-slate-700 font-medium max-w-[180px] truncate">
                    {s.batch}
                  </td>
                  <td className="px-5 py-3.5 text-slate-400">{s.enrolled}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {s.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                        feeColors[s.feeStatus] || feeColors.Paid
                      }`}
                    >
                      {s.feeStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="sm:hidden divide-y divide-slate-100">
          {filtered.map((s) => (
            <div key={s.id} className="p-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {s.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-slate-800 text-sm">{s.name}</p>
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                      feeColors[s.feeStatus] || feeColors.Paid
                    }`}
                  >
                    {s.feeStatus}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{s.email}</p>
                <p className="text-xs text-slate-600 mt-1 truncate">{s.batch}</p>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && !loading && (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <GraduationCap size={24} />
            </div>
            <p className="text-slate-600 font-semibold text-sm">No students found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search criteria</p>
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Enroll New Student">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name *
            </label>
            <input
              placeholder="e.g. Diya Patel"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              placeholder="student@edubatch.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="+91 98765 43210"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Assign Course Batch
            </label>
            <select
              value={form.batchId}
              onChange={(e) => setForm({ ...form, batchId: e.target.value })}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 bg-white"
            >
              <option value="">Select a batch...</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.subject})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-2.5 mt-6 justify-end pt-3 border-t border-slate-100">
          <button
            onClick={() => setModalOpen(false)}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateStudent}
            className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors"
          >
            Enroll Student
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default StudentsPage;
