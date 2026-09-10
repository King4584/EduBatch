import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, ChevronUp, ChevronDown, BookOpen, Clock, Users } from 'lucide-react';
import Modal from '../../components/Modal';
import { showToast } from '../../components/Toast';
import { batchesApi, BatchItem } from '../../api/batches.api';
import { profileApi } from '../../api/profile.api';
import { useAuth } from '../../hooks/useAuth';
import { formatINR } from '../../utils/formatters';

type SortKey = 'name' | 'students' | 'status' | 'fee';

const statusColors: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  upcoming: 'bg-blue-50 text-blue-700 border-blue-200',
  archived: 'bg-slate-100 text-slate-500 border-slate-200',
};

export const BatchesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: '',
    subject: '',
    teacher: '',
    capacity: '30',
    fee: '25000',
    startDate: '2025-01-15',
    endDate: '2025-06-30',
    startTime: '10:00 AM',
    endTime: '12:00 PM',
    scheduleDays: 'Mon, Wed, Fri',
    description: '',
  });

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const res = await batchesApi.getAll({
        onlyAssigned: user?.role === 'teacher',
      });
      if (res?.data) {
        setBatches(res.data);
      }
    } catch (err) {
      console.error('Failed to load batches', err);
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
          if (res.data.length > 0 && !form.teacher) {
            setForm((prev) => ({ ...prev, teacher: res.data[0].id }));
          }
        }
      } catch (err) {
        console.error('Failed to load teachers', err);
      }
    }
  };

  useEffect(() => {
    fetchBatches();
    fetchTeachers();
  }, []);

  const perPage = 6;

  const filtered = batches
    .filter((b) => {
      const matchesFilter =
        filter === 'All' ||
        b.status.toLowerCase() === filter.toLowerCase() ||
        (filter === 'Completed' && b.status === 'archived');
      const matchesSearch =
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.subject.toLowerCase().includes(search.toLowerCase()) ||
        (b.teacherName || '').toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      const av = a[sortKey] || '';
      const bv = b[sortKey] || '';
      return sortAsc
        ? String(av).localeCompare(String(bv), undefined, { numeric: true })
        : String(bv).localeCompare(String(av), undefined, { numeric: true });
    });

  const total = filtered.length;
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const sort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k ? (
      sortAsc ? (
        <ChevronUp size={12} />
      ) : (
        <ChevronDown size={12} />
      )
    ) : (
      <ChevronDown size={12} className="opacity-30" />
    );

  const handleCreate = async () => {
    if (!form.name || !form.subject || !form.teacher) {
      showToast('Please fill all required batch details', 'error');
      return;
    }

    try {
      const payload = {
        name: form.name,
        subject: form.subject,
        teacher: form.teacher,
        capacity: Number(form.capacity),
        fee: Number(form.fee),
        startDate: form.startDate,
        endDate: form.endDate,
        startTime: form.startTime,
        endTime: form.endTime,
        scheduleDays: form.scheduleDays.split(',').map((s) => s.trim()),
        description: form.description,
      };

      await batchesApi.create(payload);
      showToast('Batch created successfully!', 'success');
      setModalOpen(false);
      fetchBatches();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to create batch', 'error');
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-1.5 flex-wrap">
          {['All', 'Active', 'Upcoming', 'Archived'].map((f) => (
            <button
              key={f}
              onClick={() => {
                setFilter(f);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                filter === f
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name, subject, faculty..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
            />
          </div>

          {isAdmin && (
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors shrink-0"
            >
              <Plus size={14} />
              <span className="hidden sm:inline">New Batch</span>
            </button>
          )}
        </div>
      </div>

      {/* Batches Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {/* Desktop View */}
        <div className="overflow-x-auto hidden sm:block">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">
                {[
                  { label: 'Batch Course', key: 'name' },
                  { label: 'Subject', key: null },
                  { label: 'Faculty / Teacher', key: null },
                  { label: 'Enrolled / Cap', key: 'students' },
                  { label: 'Fee', key: 'fee' },
                  { label: 'Status', key: 'status' },
                  { label: 'Schedule & Period', key: null },
                ].map((col) => (
                  <th
                    key={col.label}
                    onClick={() => col.key && sort(col.key as SortKey)}
                    className={`px-5 py-3.5 text-left font-semibold text-slate-500 uppercase tracking-wider ${
                      col.key ? 'cursor-pointer hover:text-slate-800 select-none' : ''
                    }`}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      {col.key && <SortIcon k={col.key as SortKey} />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.map((b) => {
                const enrolled = b.students || 0;
                const percent = Math.min(100, Math.round((enrolled / b.capacity) * 100));
                return (
                  <tr
                    key={b.id || (b as any)._id}
                    onClick={() => navigate(`/batches/${b.id || (b as any)._id}`)}
                    className="hover:bg-indigo-50/30 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-800 text-sm hover:text-indigo-600 transition-colors">
                        {b.name}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {b.id || (b as any)._id}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 font-medium">{b.subject}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px]">
                          {(b.teacherName || 'T')[0]}
                        </div>
                        <span className="text-slate-700 font-medium">
                          {b.teacherName || 'Faculty'}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                        <span>{enrolled}</span>
                        <span className="text-slate-400 font-normal">/ {b.capacity}</span>
                      </div>
                      <div className="mt-1 h-1.5 bg-slate-100 rounded-full overflow-hidden w-24">
                        <div
                          className={`h-full rounded-full transition-all ${
                            percent >= 90 ? 'bg-rose-500' : 'bg-indigo-600'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-800">
                      {formatINR(b.fee)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase border ${
                          statusColors[b.status] || 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 text-[11px]">
                      {b.startDate?.split('T')[0]} → {b.endDate?.split('T')[0]}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="sm:hidden divide-y divide-slate-100">
          {paginated.map((b) => (
            <div
              key={b.id || (b as any)._id}
              onClick={() => navigate(`/batches/${b.id || (b as any)._id}`)}
              className="p-4 active:bg-slate-50 cursor-pointer"
            >
              <div className="flex items-start justify-between mb-1.5">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{b.name}</h4>
                  <p className="text-xs text-slate-500">{b.subject}</p>
                </div>
                <span
                  className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                    statusColors[b.status] || 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {b.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mt-2">
                <div>
                  <span className="text-slate-400">Faculty:</span> {b.teacherName}
                </div>
                <div>
                  <span className="text-slate-400">Enrolled:</span> {b.students || 0}/{b.capacity}
                </div>
                <div>
                  <span className="text-slate-400">Fee:</span> {formatINR(b.fee)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && !loading && (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <BookOpen size={24} />
            </div>
            <p className="text-slate-600 font-semibold text-sm">No batches found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search terms</p>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            Showing {Math.min((page - 1) * perPage + 1, total)}–{Math.min(page * perPage, total)} of{' '}
            {total} batches
          </p>
          <div className="flex gap-1">
            {Array.from({ length: Math.ceil(total / perPage) || 1 }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
                  page === p
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Create Batch Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create New Batch" size="lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Batch Name *</label>
            <input
              placeholder="e.g. JEE Advanced 2025 Comprehensive"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Subject(s) *</label>
            <input
              placeholder="e.g. Physics + Math"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Assign Teacher *</label>
            <select
              value={form.teacher}
              onChange={(e) => setForm({ ...form, teacher: e.target.value })}
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
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: e.target.value })}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tuition Fee (₹) *</label>
            <input
              type="number"
              value={form.fee}
              onChange={(e) => setForm({ ...form, fee: e.target.value })}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Class Timings</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                placeholder="10:00 AM"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              />
              <input
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                placeholder="12:00 PM"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Schedule Days</label>
            <input
              value={form.scheduleDays}
              onChange={(e) => setForm({ ...form, scheduleDays: e.target.value })}
              placeholder="Mon, Wed, Fri"
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl"
            />
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
            onClick={handleCreate}
            className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors"
          >
            Create Batch
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default BatchesPage;
