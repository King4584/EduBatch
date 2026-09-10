import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Users,
  BookOpen,
  GraduationCap,
  IndianRupee,
  Clock,
  TrendingUp,
  CalendarCheck,
  Layers,
  ArrowRight,
  Pin,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StatCard from '../../components/StatCard';
import { analyticsApi } from '../../api/analytics.api';
import { formatINRCompact, formatINR } from '../../utils/formatters';

export const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await analyticsApi.getAdminStats();
        if (res?.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load admin stats', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const stats = data?.stats || {
    totalStudents: 0,
    totalTeachers: 0,
    totalBatches: 0,
    activeBatches: 0,
    totalRevenue: 0,
    pendingFees: 0,
    todayAttendanceRate: 0,
    monthlyGrowth: '+0%',
  };

  const statCards = [
    {
      title: 'Total Students',
      value: stats.totalStudents,
      subtitle: 'Across all active batches in DB',
      icon: <Users size={20} className="text-indigo-600" />,
      iconBg: 'bg-indigo-50',
      trend: { value: `${stats.totalStudents} enrolled`, positive: true },
    },
    {
      title: 'Total Batches',
      value: stats.totalBatches,
      subtitle: `${stats.activeBatches} active right now`,
      icon: <BookOpen size={20} className="text-violet-600" />,
      iconBg: 'bg-violet-50',
      trend: { value: `${stats.activeBatches} active`, positive: true },
    },
    {
      title: 'Total Teachers',
      value: stats.totalTeachers,
      subtitle: 'Faculty in database',
      icon: <GraduationCap size={20} className="text-blue-600" />,
      iconBg: 'bg-blue-50',
    },
    {
      title: 'Total Revenue',
      value: formatINRCompact(stats.totalRevenue),
      subtitle: 'Verified collections in DB',
      icon: <IndianRupee size={20} className="text-emerald-600" />,
      iconBg: 'bg-emerald-50',
      trend: { value: stats.monthlyGrowth || '+0%', positive: !stats.monthlyGrowth?.startsWith('-') },
    },
    {
      title: 'Pending Fees',
      value: formatINRCompact(stats.pendingFees),
      subtitle: 'Unpaid enrollments',
      icon: <Clock size={20} className="text-rose-500" />,
      iconBg: 'bg-rose-50',
      trend: stats.pendingFees > 0 ? { value: 'Action needed', positive: false } : { value: 'All settled', positive: true },
    },
    {
      title: 'Active Batches',
      value: stats.activeBatches,
      subtitle: 'Running courses in DB',
      icon: <Layers size={20} className="text-orange-500" />,
      iconBg: 'bg-orange-50',
    },
    {
      title: "Today's Attendance",
      value: `${stats.todayAttendanceRate}%`,
      subtitle: 'Average presence rate in DB',
      icon: <CalendarCheck size={20} className="text-teal-600" />,
      iconBg: 'bg-teal-50',
      trend: { value: `${stats.todayAttendanceRate}%`, positive: stats.todayAttendanceRate >= 75 },
    },
    {
      title: 'Monthly Growth',
      value: stats.monthlyGrowth,
      subtitle: 'MoM revenue calculation',
      icon: <TrendingUp size={20} className="text-pink-600" />,
      iconBg: 'bg-pink-50',
      trend: { value: stats.monthlyGrowth, positive: !stats.monthlyGrowth?.startsWith('-') },
    },
  ];

  const revenueChartData = data?.charts?.revenue || [];
  const attendanceChartData = data?.charts?.attendance || [];
  const enrollmentChartData = data?.charts?.enrollment || [];

  const recentPayments = data?.recentPayments || [];
  const pinnedNotices = data?.pinnedNotices || [];

  return (
    <div className="space-y-6">
      {/* Stat Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <StatCard key={i} {...s} loading={loading} />
        ))}
      </div>

      {/* Primary Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display font-600 text-slate-800 text-sm">
                Revenue Trend (INR)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Actual Collections vs Target (2024)</p>
            </div>
            <span className="text-xs bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full font-semibold border border-indigo-100">
              Monthly
            </span>
          </div>
          {loading ? (
            <div className="skeleton h-52 w-full" />
          ) : (
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={revenueChartData}
                  margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `₹${v / 1000}K`}
                  />
                  <Tooltip
                    formatter={(v) => [formatINR(Number(v))]}
                    contentStyle={{
                      borderRadius: 10,
                      border: '1px solid #e2e8f0',
                      fontSize: 12,
                    }}
                  />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    name="Actual Revenue"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    name="Target"
                    stroke="#cbd5e1"
                    strokeWidth={2}
                    strokeDasharray="4 3"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Weekly Attendance Trend */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="mb-5">
            <h3 className="font-display font-600 text-slate-800 text-sm">
              Attendance This Week
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Present vs Absent (%)</p>
          </div>
          {loading ? (
            <div className="skeleton h-52 w-full" />
          ) : (
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={attendanceChartData}
                  margin={{ top: 5, right: 10, left: -25, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 10,
                      border: '1px solid #e2e8f0',
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="present"
                    name="Present"
                    stroke="#10b981"
                    fill="#ecfdf5"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="absent"
                    name="Absent"
                    stroke="#f43f5e"
                    fill="#fff1f2"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Secondary Row: Enrollment Trend + Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Enrollment Bar Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="mb-5">
            <h3 className="font-display font-600 text-slate-800 text-sm">
              Enrollment Trend
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Monthly additions vs dropouts</p>
          </div>
          {loading ? (
            <div className="skeleton h-52 w-full" />
          ) : (
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={enrollmentChartData}
                  margin={{ top: 5, right: 10, left: -25, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 10,
                      border: '1px solid #e2e8f0',
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="enrolled" name="Enrolled" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="dropped" name="Dropped" fill="#fca5a5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Recent Payments Feed */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-600 text-slate-800 text-sm">
                Recent Payment Transactions
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Real-time fee receipts</p>
            </div>
            <Link
              to="/payments"
              className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="skeleton h-10 w-full" />
              ))}
            </div>
          ) : recentPayments.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              No recent payments recorded yet.
            </div>
          ) : (
            <div className="space-y-1">
              {recentPayments.map((p: any) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-2xs">
                    {p.student ? p.student[0] : 'S'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">
                      {p.student}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">{p.batch}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-900 font-mono">
                      {formatINR(p.amount)}
                    </p>
                    <span
                      className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        p.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          : 'bg-amber-50 text-amber-600 border border-amber-100'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pinned Notices Highlight */}
      {!loading && pinnedNotices.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-50/80 to-violet-50/80 rounded-2xl border border-indigo-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs bg-indigo-600 text-white px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                <Pin size={11} /> Pinned Notices
              </span>
              <span className="text-xs text-indigo-900/60 font-medium">
                High-priority institute communications
              </span>
            </div>
            <Link
              to="/notices"
              className="text-xs text-indigo-700 hover:text-indigo-800 font-semibold"
            >
              All notices →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {pinnedNotices.map((n: any) => (
              <div
                key={n.id}
                className="bg-white/90 backdrop-blur-xs rounded-xl px-4 py-3.5 border border-indigo-100 shadow-2xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-bold text-slate-800">{n.title}</p>
                  <span className="text-[10px] text-slate-400 shrink-0 font-medium">{n.date}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {n.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
