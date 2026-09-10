import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  CalendarCheck,
  CreditCard,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import StatCard from '../../components/StatCard';
import RazorpayPaymentModal from '../../components/RazorpayPaymentModal';
import ReceiptModal from '../../components/ReceiptModal';
import { analyticsApi } from '../../api/analytics.api';
import { useAuth } from '../../hooks/useAuth';
import { formatINR } from '../../utils/formatters';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  // Payment modal state
  const [selectedBatchForPay, setSelectedBatchForPay] = useState<any>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  // Receipt modal state
  const [receiptData, setReceiptData] = useState<any>(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await analyticsApi.getStudentStats();
      if (res?.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load student stats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleOpenPay = (batch: any) => {
    setSelectedBatchForPay(batch);
    setPaymentModalOpen(true);
  };

  const handlePaymentSuccess = (result: any) => {
    fetchStats();
    if (result?.payment) {
      setReceiptData({
        receiptNumber: result.payment.receiptNumber,
        studentName: user?.name || 'Student',
        studentEmail: user?.email,
        batchName: selectedBatchForPay?.name || 'Course',
        subject: selectedBatchForPay?.subject,
        amount: result.payment.amount,
        date: new Date().toLocaleDateString('en-IN'),
        method: result.payment.method,
      });
      setReceiptModalOpen(true);
    }
  };

  const enrolledBatches = data?.enrolledBatches || [];
  const recentPayments = data?.recentPayments || [];
  const notices = data?.notices || [];

  return (
    <div className="space-y-6">
      {/* Student Greeting Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 rounded-2xl p-6 text-white shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white">
                Student Portal
              </span>
            </div>
            <h2 className="font-display font-700 text-xl tracking-tight">
              Hello, {user?.name || 'Student'}! 👋
            </h2>
            <p className="text-xs text-indigo-100 mt-1 max-w-lg">
              Track your batch schedules, check your attendance percentage, and complete fee payments securely.
            </p>
          </div>
          <Link
            to="/attendance"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 font-semibold text-xs transition-colors shadow-xs shrink-0"
          >
            <CalendarCheck size={16} />
            <span>View Attendance Record</span>
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="My Batches"
          value={data?.myBatchesCount || enrolledBatches.length}
          subtitle="Enrolled active courses"
          icon={<BookOpen size={20} className="text-indigo-600" />}
          iconBg="bg-indigo-50"
          loading={loading}
        />
        <StatCard
          title="Attendance Rate"
          value={`${data?.attendancePercentage ?? 0}%`}
          subtitle={`${data?.presentSessions ?? 0} of ${data?.totalSessions ?? 0} sessions attended`}
          icon={<CalendarCheck size={20} className="text-emerald-600" />}
          iconBg="bg-emerald-50"
          trend={{
            value: (data?.attendancePercentage ?? 0) >= 75 ? 'Good standing' : 'Low attendance',
            positive: (data?.attendancePercentage ?? 0) >= 75,
          }}
          loading={loading}
        />
        <StatCard
          title="Fee Status"
          value={data?.pendingFeesCount > 0 ? `${data.pendingFeesCount} Pending` : 'All Paid'}
          subtitle={data?.pendingFeesCount > 0 ? 'Action required' : 'No dues'}
          icon={<CreditCard size={20} className="text-violet-600" />}
          iconBg="bg-violet-50"
          trend={{
            value: data?.pendingFeesCount > 0 ? 'Due soon' : 'Up to date',
            positive: data?.pendingFeesCount === 0,
          }}
          loading={loading}
        />
        <StatCard
          title="Next Class"
          value={data?.nextClassText || 'No scheduled classes'}
          subtitle={enrolledBatches[0]?.subject ? `${enrolledBatches[0].name} (${enrolledBatches[0].subject})` : 'Enrolled curriculum'}
          icon={<Clock size={20} className="text-blue-600" />}
          iconBg="bg-blue-50"
          loading={loading}
        />
      </div>

      {/* Enrolled Courses / Fee Payment Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-600 text-slate-800 text-sm">
                Enrolled Batches & Tuition Fees
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Pay fees securely via Razorpay</p>
            </div>
            <Link to="/batches" className="text-xs text-indigo-600 font-semibold">
              Browse Batches →
            </Link>
          </div>

          <div className="space-y-3">
            {enrolledBatches.map((b: any) => (
              <div
                key={b.id || b.name}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 gap-3 transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-slate-800 text-sm">{b.name}</h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                        b.paymentStatus === 'paid'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {b.paymentStatus === 'paid' ? 'Paid ✓' : 'Payment Pending'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{b.subject} · Mentor: {b.teacher}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                    <Clock size={11} /> {b.schedule}
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end shrink-0">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">
                      Course Fee
                    </span>
                    <p className="text-sm font-bold font-mono text-slate-800">
                      {formatINR(b.fee)}
                    </p>
                  </div>

                  {b.paymentStatus === 'paid' ? (
                    <button
                      onClick={() => {
                        setReceiptData({
                          receiptNumber: `RCP-PAID-${b.id?.slice(-4) || '9921'}`,
                          studentName: user?.name || 'Student',
                          studentEmail: user?.email,
                          batchName: b.name,
                          subject: b.subject,
                          amount: b.fee,
                          date: new Date().toLocaleDateString('en-IN'),
                          method: 'Razorpay / Online',
                        });
                        setReceiptModalOpen(true);
                      }}
                      className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
                    >
                      View Receipt
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenPay(b)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all"
                    >
                      <CreditCard size={14} />
                      <span>Pay Now</span>
                    </button>
                  )}
                </div>
              </div>
            ))}

            {enrolledBatches.length === 0 && !loading && (
              <p className="text-center py-8 text-xs text-slate-400">
                You are not enrolled in any batch yet.
              </p>
            )}
          </div>
        </div>

        {/* Payment History Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-600 text-slate-800 text-sm">
              Recent Transactions
            </h3>
            <Link to="/payments" className="text-xs text-indigo-600 font-semibold">
              All History →
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentPayments.map((p: any) => (
              <div
                key={p.id}
                className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <div className="flex justify-between items-center mb-1">
                  <p className="text-xs font-semibold text-slate-800">{p.batchName}</p>
                  <p className="font-mono text-xs font-bold text-slate-900">
                    {formatINR(p.amount)}
                  </p>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400">
                  <span>{p.date}</span>
                  <span className="font-semibold text-emerald-600">{p.status}</span>
                </div>
              </div>
            ))}
            {recentPayments.length === 0 && !loading && (
              <p className="text-center py-8 text-xs text-slate-400">
                No past transactions found.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Notices Feed */}
      {notices.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-600 text-slate-800 text-sm">
              Batch Announcements & Circulars
            </h3>
            <Link to="/notices" className="text-xs text-indigo-600 font-semibold">
              All Notices →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {notices.map((n: any) => (
              <div
                key={n.id}
                className="p-4 rounded-xl border border-slate-100 bg-slate-50/50"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                    {n.category}
                  </span>
                  <span className="text-[10px] text-slate-400">{n.date}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-800">{n.title}</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{n.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Razorpay Payment Modal */}
      {selectedBatchForPay && (
        <RazorpayPaymentModal
          open={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          batch={selectedBatchForPay}
          enrollmentId={selectedBatchForPay.enrollmentId}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* Receipt Modal */}
      <ReceiptModal
        open={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        receiptData={receiptData}
      />
    </div>
  );
};

export default StudentDashboard;
