import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Users,
  CalendarCheck,
  Bell,
  ArrowRight,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import StatCard from '../../components/StatCard';
import { analyticsApi } from '../../api/analytics.api';
import { useAuth } from '../../hooks/useAuth';

export const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await analyticsApi.getTeacherStats();
        if (res?.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load teacher stats', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const batches = data?.batches || [];
  const recentAttendance = data?.recentAttendance || [];
  const recentNotices = data?.recentNotices || [];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-2xl p-6 text-white shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="font-display font-700 text-xl tracking-tight">
              Welcome back, {user?.name || 'Faculty Member'}! 👨‍🏫
            </h2>
            <p className="text-xs text-indigo-100 mt-1 max-w-lg">
              Manage your assigned batch curriculums, take daily student attendance, and communicate vital academic announcements.
            </p>
          </div>
          <Link
            to="/attendance"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 font-semibold text-xs transition-colors shadow-xs shrink-0"
          >
            <CalendarCheck size={16} />
            <span>Mark Today's Attendance</span>
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Batches"
          value={data?.assignedBatchesCount || batches.length}
          subtitle="Courses under instruction"
          icon={<BookOpen size={20} className="text-indigo-600" />}
          iconBg="bg-indigo-50"
          loading={loading}
        />
        <StatCard
          title="Total Students"
          value={data?.totalStudents ?? 0}
          subtitle="Enrolled under your batches"
          icon={<Users size={20} className="text-blue-600" />}
          iconBg="bg-blue-50"
          loading={loading}
        />
        <StatCard
          title="Today's Classes"
          value={data?.todayClassesCount !== undefined ? `${data.todayClassesCount} Sessions` : '0 Sessions'}
          subtitle="Scheduled for today"
          icon={<Clock size={20} className="text-emerald-600" />}
          iconBg="bg-emerald-50"
          loading={loading}
        />
        <StatCard
          title="Attendance Health"
          value={data?.attendanceHealth || '100%'}
          subtitle="Recent batch presence rate"
          icon={<CalendarCheck size={20} className="text-violet-600" />}
          iconBg="bg-violet-50"
          loading={loading}
        />
      </div>

      {/* Batches List & Recent Attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assigned Batches List */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-600 text-slate-800 text-sm">
                Your Assigned Batches
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Active curriculum rosters</p>
            </div>
            <Link
              to="/batches"
              className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1"
            >
              <span>View all batches</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="space-y-3">
            {batches.map((b: any) => (
              <div
                key={b.id}
                className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-slate-800 text-sm">{b.name}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase">
                      {b.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{b.subject}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                    <Clock size={11} /> {b.schedule}
                  </p>
                </div>
                <Link
                  to={`/batches/${b.id}`}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-indigo-600 text-xs font-semibold transition-colors"
                >
                  Manage Roster
                </Link>
              </div>
            ))}
            {batches.length === 0 && !loading && (
              <p className="text-center py-8 text-xs text-slate-400">
                No active batches assigned. Contact your administrator.
              </p>
            )}
          </div>
        </div>

        {/* Recent Attendance Sessions */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-600 text-slate-800 text-sm">
              Recent Attendance Sessions
            </h3>
            <Link to="/attendance" className="text-xs text-indigo-600 font-semibold">
              Register →
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentAttendance.map((a: any) => (
              <div
                key={a.id}
                className="p-3 rounded-xl border border-slate-100 bg-slate-50/40 hover:bg-slate-50 transition-colors"
              >
                <div className="flex justify-between items-center mb-1">
                  <p className="text-xs font-semibold text-slate-800">{a.batch}</p>
                  <span className="text-[10px] text-slate-400">{a.date}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Marked: {a.totalMarked} students</span>
                  <span className="font-bold text-emerald-600">
                    {a.presentCount} Present
                  </span>
                </div>
              </div>
            ))}
            {recentAttendance.length === 0 && !loading && (
              <p className="text-center py-8 text-xs text-slate-400">
                No recent attendance sessions logged.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Notices */}
      {recentNotices.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-indigo-600" />
              <h3 className="font-display font-600 text-slate-800 text-sm">
                Latest Institute Circulars
              </h3>
            </div>
            <Link to="/notices" className="text-xs text-indigo-600 font-semibold">
              Post New Notice →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentNotices.map((n: any) => (
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
                <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{n.title}</h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{n.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
