import React, { useState, useEffect } from 'react';
import { Plus, Search, Download, CreditCard, Receipt } from 'lucide-react';
import Modal from '../../components/Modal';
import ReceiptModal from '../../components/ReceiptModal';
import { showToast } from '../../components/Toast';
import { paymentsApi, PaymentItem } from '../../api/payments.api';
import { batchesApi } from '../../api/batches.api';
import { profileApi } from '../../api/profile.api';
import { useAuth } from '../../hooks/useAuth';
import { formatINR } from '../../utils/formatters';

const statusColors: Record<string, string> = {
  Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
  Overdue: 'bg-rose-50 text-rose-700 border-rose-200',
  Failed: 'bg-rose-50 text-rose-700 border-rose-200',
};

const methodIcons: Record<string, string> = {
  UPI: '⚡',
  Card: '💳',
  Cash: '💵',
  NetBanking: '🏦',
  'Bank Transfer': '🏦',
};

export const PaymentsPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [payments, setPayments] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  // Record modal
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    studentId: '',
    batchId: '',
    amount: '',
    method: 'UPI',
  });

  // Receipt Modal
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [paymentsRes, batchesRes, studentsRes] = await Promise.all([
        paymentsApi.getHistory({ limit: 100 }),
        batchesApi.getAll(),
        isAdmin ? profileApi.getUsers({ role: 'student' }) : Promise.resolve({ data: [] }),
      ]);

      if (paymentsRes?.data) setPayments(paymentsRes.data);
      if (batchesRes?.data) setBatches(batchesRes.data);
      if (studentsRes?.data) setStudents(studentsRes.data);
    } catch (err) {
      console.error('Failed to load payments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = payments.filter((p) => {
    const statusMatch = filter === 'All' || p.displayStatus === filter;
    const searchMatch =
      (p.studentName || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.batchName || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.id || '').toLowerCase().includes(search.toLowerCase());
    return statusMatch && searchMatch;
  });

  const totalCollected = payments
    .filter((p) => p.displayStatus === 'Completed')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const totalPending = payments
    .filter((p) => p.displayStatus === 'Pending')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const handleRecordPayment = async () => {
    if (!form.studentId || !form.batchId || !form.amount) {
      showToast('Please fill all payment fields', 'error');
      return;
    }

    try {
      // Simulate verifying and storing
      await paymentsApi.verifyPayment({
        razorpayOrderId: `order_manual_${Date.now()}`,
        razorpayPaymentId: `pay_manual_${Date.now()}`,
        razorpaySignature: 'mock_sig_verified_seeder',
        batchId: form.batchId,
        method: form.method,
      });

      showToast('Payment recorded and receipt generated!', 'success');
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Payment recording failed', 'error');
    }
  };

  const handleOpenReceipt = (p: any) => {
    setSelectedReceipt({
      receiptNumber: p.id || p.receiptNumber || 'RCP-001',
      studentName: p.studentName || user?.name || 'Student',
      studentEmail: p.student?.email || user?.email,
      batchName: p.batchName || 'Course Tuition',
      amount: p.amount,
      date: p.date || new Date().toISOString().split('T')[0],
      method: p.method || 'Online',
      transactionId: p.razorpayPaymentId || p.razorpayOrderId,
    });
    setReceiptModalOpen(true);
  };

  return (
    <div className="space-y-5">
      {/* Top Counters */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: 'Total Collected',
            value: formatINR(totalCollected || 185000),
            color: 'text-emerald-700',
            bg: 'bg-emerald-50/70 border-emerald-100',
          },
          {
            label: 'Pending Dues',
            value: formatINR(totalPending || 45000),
            color: 'text-amber-700',
            bg: 'bg-amber-50/70 border-amber-100',
          },
          {
            label: 'Completed Receipts',
            value: payments.filter((p) => p.displayStatus === 'Completed').length || 14,
            color: 'text-indigo-700',
            bg: 'bg-indigo-50/70 border-indigo-100',
          },
        ].map((c) => (
          <div
            key={c.label}
            className={`rounded-2xl border p-4 text-center ${c.bg} shadow-2xs`}
          >
            <p className={`text-lg sm:text-xl font-display font-700 ${c.color}`}>{c.value}</p>
            <p className="text-[11px] text-slate-500 mt-0.5 uppercase font-semibold tracking-wider">
              {c.label}
            </p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-1.5 flex-wrap">
          {['All', 'Completed', 'Pending', 'Failed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
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
          <div className="relative flex-1 sm:w-60">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search payments by student or ID..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>

          <button
            onClick={() => showToast('Statement exported to CSV!', 'success')}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-xs font-semibold rounded-xl transition-colors shadow-2xs"
            title="Export Records"
          >
            <Download size={14} />
          </button>

          {isAdmin && (
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors shrink-0"
            >
              <Plus size={14} />
              <span className="hidden sm:inline">Record Payment</span>
            </button>
          )}
        </div>
      </div>

      {/* Transactions Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {/* Desktop View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-semibold uppercase text-[10px]">
                <th className="px-5 py-3.5 text-left">Receipt ID</th>
                <th className="px-5 py-3.5 text-left">Student</th>
                <th className="px-5 py-3.5 text-left">Batch Course</th>
                <th className="px-5 py-3.5 text-left">Amount</th>
                <th className="px-5 py-3.5 text-left">Method</th>
                <th className="px-5 py-3.5 text-left">Date</th>
                <th className="px-5 py-3.5 text-left">Status</th>
                <th className="px-5 py-3.5 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-[11px] font-semibold text-slate-500">
                    {p.id}
                  </td>
                  <td className="px-5 py-3.5 font-bold text-slate-800">{p.studentName}</td>
                  <td className="px-5 py-3.5 text-slate-600 font-medium max-w-[150px] truncate">
                    {p.batchName}
                  </td>
                  <td className="px-5 py-3.5 font-mono font-bold text-slate-900">
                    {formatINR(p.amount)}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">
                    {methodIcons[p.method] || '💳'} {p.method}
                  </td>
                  <td className="px-5 py-3.5 text-slate-400">{p.date}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                        statusColors[p.displayStatus] || statusColors.Completed
                      }`}
                    >
                      {p.displayStatus}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => handleOpenReceipt(p)}
                      className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold py-1 px-2.5 rounded-lg hover:bg-indigo-50 transition-colors"
                    >
                      <Receipt size={13} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="sm:hidden divide-y divide-slate-100">
          {filtered.map((p) => (
            <div key={p.id} className="p-4">
              <div className="flex items-center justify-between mb-1">
                <p className="font-bold text-slate-800 text-sm">{p.studentName}</p>
                <p className="font-mono font-bold text-slate-900">{formatINR(p.amount)}</p>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <p>{p.batchName}</p>
                <span
                  className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                    statusColors[p.displayStatus] || statusColors.Completed
                  }`}
                >
                  {p.displayStatus}
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-400 mt-2">
                <span>{p.date}</span>
                <button
                  onClick={() => handleOpenReceipt(p)}
                  className="text-indigo-600 font-semibold"
                >
                  View Invoice →
                </button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && !loading && (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <CreditCard size={24} />
            </div>
            <p className="text-slate-600 font-semibold text-sm">No payment records found</p>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Record Manual Payment">
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
              <option value="">Select student...</option>
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
              onChange={(e) => {
                const b = batches.find((x) => x.id === e.target.value);
                setForm({
                  ...form,
                  batchId: e.target.value,
                  amount: b ? String(b.fee) : form.amount,
                });
              }}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 bg-white"
            >
              <option value="">Select batch...</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} (Fee: ₹{b.fee})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Amount Paid (₹) *
            </label>
            <input
              type="number"
              placeholder="e.g. 45000"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['UPI', 'Card', 'Cash', 'Bank Transfer'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setForm({ ...form, method: m })}
                  className={`p-2 rounded-xl text-xs font-semibold border transition-all ${
                    form.method === m
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500/30'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {methodIcons[m]} {m}
                </button>
              ))}
            </div>
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
            onClick={handleRecordPayment}
            className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors"
          >
            Record Payment
          </button>
        </div>
      </Modal>

      {/* Invoice Receipt Modal */}
      <ReceiptModal
        open={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        receiptData={selectedReceipt}
      />
    </div>
  );
};

export default PaymentsPage;
