import React, { useState, useEffect } from 'react';
import { Plus, Pin, Calendar, User, Bell } from 'lucide-react';
import Modal from '../../components/Modal';
import { showToast } from '../../components/Toast';
import { noticesApi, NoticeItem } from '../../api/notices.api';
import { batchesApi } from '../../api/batches.api';
import { useAuth } from '../../hooks/useAuth';

const categoryColors: Record<string, string> = {
  Holiday: 'bg-orange-50 text-orange-700 border-orange-200',
  Academic: 'bg-blue-50 text-blue-700 border-blue-200',
  Finance: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Batch: 'bg-violet-50 text-violet-700 border-violet-200',
  Event: 'bg-pink-50 text-pink-700 border-pink-200',
};

export const NoticesPage: React.FC = () => {
  const { user } = useAuth();
  const canCreate = user?.role === 'admin' || user?.role === 'teacher';

  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [form, setForm] = useState({
    title: '',
    body: '',
    category: 'Academic',
    pinned: false,
    batchId: '',
  });

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const [noticesRes, batchesRes] = await Promise.all([
        noticesApi.getAll(),
        canCreate ? batchesApi.getAll() : Promise.resolve({ data: [] }),
      ]);
      if (noticesRes?.data) setNotices(noticesRes.data);
      if (batchesRes?.data) setBatches(batchesRes.data);
    } catch (err) {
      console.error('Failed to load notices', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleCreateNotice = async () => {
    if (!form.title || !form.body) {
      showToast('Title and notice content are required', 'error');
      return;
    }

    try {
      await noticesApi.create({
        title: form.title,
        body: form.body,
        category: form.category,
        pinned: form.pinned,
        batch: form.batchId || null,
      });

      showToast('Notice published successfully!', 'success');
      setModalOpen(false);
      setForm({
        title: '',
        body: '',
        category: 'Academic',
        pinned: false,
        batchId: '',
      });
      fetchNotices();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Publish failed', 'error');
    }
  };

  const pinned = notices.filter((n) => n.pinned);
  const unpinned = notices.filter((n) => !n.pinned);

  const NoticeCard = ({ n }: { n: NoticeItem }) => (
    <div
      className={`bg-white rounded-2xl border p-5 hover:shadow-xs transition-all ${
        n.pinned ? 'border-indigo-200 bg-indigo-50/15' : 'border-slate-200'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          {n.pinned && (
            <Pin size={14} className="text-indigo-600 mt-0.5 shrink-0 fill-indigo-600/20" />
          )}
          <h3 className="font-display font-600 text-slate-800 text-sm leading-snug">
            {n.title}
          </h3>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {n.batch && (
            <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600">
              {n.batch}
            </span>
          )}
          <span
            className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
              categoryColors[n.category] || 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            {n.category}
          </span>
        </div>
      </div>
      <p className="text-xs text-slate-600 leading-relaxed mb-3.5 whitespace-pre-line">
        {n.content}
      </p>
      <div className="flex items-center gap-4 text-[11px] text-slate-400 border-t border-slate-100 pt-2.5">
        <span className="flex items-center gap-1">
          <User size={12} /> {n.author}
        </span>
        <span className="flex items-center gap-1">
          <Calendar size={12} /> {n.date}
        </span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-700 text-slate-800 text-base">
            Announcements & Notice Board
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {notices.length} active announcements for students and faculty
          </p>
        </div>

        {canCreate && (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors shrink-0"
          >
            <Plus size={14} />
            <span>Publish Notice</span>
          </button>
        )}
      </div>

      {/* Pinned Notices */}
      {pinned.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Pin size={13} className="text-indigo-600" />
            <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
              Pinned Announcements
            </h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-3.5">
            {pinned.map((n) => (
              <NoticeCard key={n.id} n={n} />
            ))}
          </div>
        </div>
      )}

      {/* Unpinned Notices */}
      {unpinned.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            All Institute Notices
          </h3>
          <div className="grid sm:grid-cols-2 gap-3.5">
            {unpinned.map((n) => (
              <NoticeCard key={n.id} n={n} />
            ))}
          </div>
        </div>
      )}

      {notices.length === 0 && !loading && (
        <div className="py-20 text-center bg-white rounded-2xl border border-slate-200">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <Bell size={22} />
          </div>
          <p className="text-slate-700 font-semibold text-sm">No notices published yet</p>
          <p className="text-xs text-slate-400 mt-1">Check back later for institute updates.</p>
        </div>
      )}

      {/* Create Notice Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Publish Announcement" size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Notice Title *
            </label>
            <input
              placeholder="e.g. Schedule Revision for Midterm Mocks"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Notice Content *
            </label>
            <textarea
              rows={4}
              placeholder="Type announcement details..."
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white"
              >
                {['Academic', 'Holiday', 'Finance', 'Batch', 'Event'].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Audience
              </label>
              <select
                value={form.batchId}
                onChange={(e) => setForm({ ...form, batchId: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white"
              >
                <option value="">All Batches (Global Announcement)</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {user?.role === 'admin' && (
            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={form.pinned}
                onChange={(e) => setForm({ ...form, pinned: e.target.checked })}
                className="w-4 h-4 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-xs font-semibold text-slate-700">
                Pin to top of notice board
              </span>
            </label>
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
            onClick={handleCreateNotice}
            className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors"
          >
            Publish Notice
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default NoticesPage;
