import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, CalendarCheck, Clock, Filter } from 'lucide-react';
import Modal from '../../components/Modal';
import { showToast } from '../../components/Toast';
import { attendanceApi } from '../../api/attendance.api';
import { batchesApi } from '../../api/batches.api';
import { profileApi } from '../../api/profile.api';
import { useAuth } from '../../hooks/useAuth';

export const AttendancePage: React.FC = () => {
  const { user } = useAuth();
  const isStudent = user?.role === 'student';

  const [batches, setBatches] = useState<any[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [studentRecords, setStudentRecords] = useState<any[]>([]);
  const [summary, setSummary] = useState<{ totalSessions: number; avgPresence: number; under75Count: number } | null>(null);
  const [loading, setLoading] = useState(true);

  // Student specific summary
  const [myAttendance, setMyAttendance] = useState<any>(null);

  // Mark Attendance Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [markDate, setMarkDate] = useState(new Date().toISOString().split('T')[0]);
  const [batchStudents, setBatchStudents] = useState<any[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, 'Present' | 'Absent' | 'Late'>>({});

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      if (isStudent) {
        const myRes = await attendanceApi.getMyAttendance();
        if (myRes?.data) setMyAttendance(myRes.data);
      } else {
        const batchesRes = await batchesApi.getAll({
          onlyAssigned: user?.role === 'teacher',
        });
        if (batchesRes?.data && batchesRes.data.length > 0) {
          setBatches(batchesRes.data);
          const firstBatchId = batchesRes.data[0].id;
          setSelectedBatchId(firstBatchId);
          await fetchBatchAttendance(firstBatchId);
        }
      }
    } catch (err) {
      console.error('Failed to load attendance', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBatchAttendance = async (batchId: string) => {
    try {
      const res = await attendanceApi.getBatchAttendance(batchId);
      if (res?.data?.studentRecords) {
        setStudentRecords(res.data.studentRecords);
      }
      if (res?.data?.summary) {
        setSummary(res.data.summary);
      }
    } catch (err) {
      console.error('Failed to fetch batch attendance records', err);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleBatchChange = async (batchId: string) => {
    setSelectedBatchId(batchId);
    await fetchBatchAttendance(batchId);
  };

  const handleOpenMarkModal = async () => {
    if (!selectedBatchId) return;
    try {
      const batchDetail = await batchesApi.getById(selectedBatchId);
      const studentsList = (batchDetail?.data?.enrollments || []).map((e: any) => ({
        id: e.student?._id || e.student?.id,
        name: e.student?.name || 'Student',
      }));

      setBatchStudents(studentsList);
      const initialMap: Record<string, 'Present' | 'Absent' | 'Late'> = {};
      studentsList.forEach((s: any) => {
        initialMap[s.id] = 'Present';
      });
      setAttendanceMap(initialMap);
      setModalOpen(true);
    } catch {
      showToast('Could not retrieve student list for batch', 'error');
    }
  };

  const setAllStatus = (status: 'Present' | 'Absent' | 'Late') => {
    const updated: Record<string, 'Present' | 'Absent' | 'Late'> = {};
    batchStudents.forEach((s) => {
      updated[s.id] = status;
    });
    setAttendanceMap(updated);
  };

  const handleSaveAttendance = async () => {
    try {
      const records = Object.entries(attendanceMap).map(([student, status]) => ({
        student,
        status,
      }));

      await attendanceApi.mark({
        batchId: selectedBatchId,
        date: markDate,
        records,
      });

      showToast("Attendance logged for today's session!", 'success');
      setModalOpen(false);
      fetchBatchAttendance(selectedBatchId);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to save attendance', 'error');
    }
  };

  // If Student, render student personal attendance portal
  if (isStudent) {
    const rate = myAttendance?.attendancePercentage ?? 0;
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <h2 className="font-display font-700 text-slate-800 text-lg">
            My Attendance Record
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time biometric & faculty-verified session logs
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="bg-emerald-50 rounded-xl p-4 text-center border border-emerald-100">
              <p className="text-2xl font-display font-700 text-emerald-700">
                {myAttendance?.presentCount ?? 0}
              </p>
              <p className="text-xs text-slate-500 mt-1 uppercase font-semibold">Sessions Present</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-4 text-center border border-amber-100">
              <p className="text-2xl font-display font-700 text-amber-700">
                {myAttendance?.lateCount ?? 0}
              </p>
              <p className="text-xs text-slate-500 mt-1 uppercase font-semibold">Sessions Late</p>
            </div>
            <div className="bg-rose-50 rounded-xl p-4 text-center border border-rose-100">
              <p className="text-2xl font-display font-700 text-rose-600">
                {myAttendance?.absentCount ?? 0}
              </p>
              <p className="text-xs text-slate-500 mt-1 uppercase font-semibold">Sessions Absent</p>
            </div>
            <div className="bg-indigo-50 rounded-xl p-4 text-center border border-indigo-100">
              <p className="text-2xl font-display font-700 text-indigo-600">
                {rate}%
              </p>
              <p className="text-xs text-slate-500 mt-1 uppercase font-semibold">Overall Rate</p>
            </div>
          </div>
        </div>

        {/* History Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="font-display font-600 text-slate-800 text-sm">
              Session History
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-semibold uppercase text-[10px]">
                  <th className="px-5 py-3 text-left">Date</th>
                  <th className="px-5 py-3 text-left">Batch Course</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(myAttendance?.history || []).map((h: any) => (
                  <tr key={h.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-3 font-semibold text-slate-800">{h.date}</td>
                    <td className="px-5 py-3 text-slate-600">{h.batchName}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                          h.status === 'Present'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : h.status === 'Late'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {h.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-400">{h.remarks || 'Regular Session'}</td>
                  </tr>
                ))}
                {(myAttendance?.history || []).length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-slate-400">
                      No session logs recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Teacher / Admin View
  return (
    <div className="space-y-4">
      {/* Top Header & Batch Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter size={16} className="text-slate-400 shrink-0" />
          <select
            value={selectedBatchId}
            onChange={(e) => handleBatchChange(e.target.value)}
            className="w-full sm:w-64 px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          >
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleOpenMarkModal}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors shrink-0"
        >
          <CalendarCheck size={14} />
          <span>Mark Attendance</span>
        </button>
      </div>

      {/* Summary Counters */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: 'Average Presence',
            value: summary ? `${summary.avgPresence}%` : studentRecords.length > 0 ? `${(studentRecords.reduce((acc, s) => acc + s.percentage, 0) / studentRecords.length).toFixed(1)}%` : '100%',
            color: 'text-emerald-700',
            bg: 'bg-emerald-50/70 border-emerald-100',
          },
          {
            label: 'Total Sessions',
            value: summary ? `${summary.totalSessions} Recorded` : `${studentRecords[0]?.total || 0} Recorded`,
            color: 'text-indigo-700',
            bg: 'bg-indigo-50/70 border-indigo-100',
          },
          {
            label: 'Under 75% Attendance',
            value: summary ? `${summary.under75Count} Students` : `${studentRecords.filter((s) => s.percentage < 75).length} Students`,
            color: 'text-amber-700',
            bg: 'bg-amber-50/70 border-amber-100',
          },
        ].map((c) => (
          <div
            key={c.label}
            className={`rounded-2xl border p-4 text-center ${c.bg} shadow-2xs`}
          >
            <p className={`text-xl font-display font-700 ${c.color}`}>{c.value}</p>
            <p className="text-[11px] text-slate-500 mt-0.5 uppercase font-semibold tracking-wider">
              {c.label}
            </p>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-display font-600 text-slate-800 text-sm">
            Cumulative Student Attendance Roster
          </h3>
        </div>

        {/* Desktop View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-semibold uppercase text-[10px]">
                <th className="px-5 py-3.5 text-left">Student</th>
                <th className="px-5 py-3.5 text-left">Present</th>
                <th className="px-5 py-3.5 text-left">Late</th>
                <th className="px-5 py-3.5 text-left">Absent</th>
                <th className="px-5 py-3.5 text-left">Total Sessions</th>
                <th className="px-5 py-3.5 text-left">Presence Percentage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {studentRecords.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-slate-800">{r.student}</td>
                  <td className="px-5 py-3.5 font-mono text-emerald-600 font-bold">{r.present}</td>
                  <td className="px-5 py-3.5 font-mono text-amber-600 font-bold">{r.late || 0}</td>
                  <td className="px-5 py-3.5 font-mono text-rose-500 font-bold">{r.absent}</td>
                  <td className="px-5 py-3.5 font-mono text-slate-400">{r.total}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden w-28">
                        <div
                          className={`h-full rounded-full transition-all ${
                            r.percentage >= 85
                              ? 'bg-emerald-500'
                              : r.percentage >= 75
                              ? 'bg-amber-400'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${r.percentage}%` }}
                        />
                      </div>
                      <span
                        className={`text-xs font-bold font-mono ${
                          r.percentage >= 85
                            ? 'text-emerald-700'
                            : r.percentage >= 75
                            ? 'text-amber-700'
                            : 'text-rose-600'
                        }`}
                      >
                        {r.percentage}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="sm:hidden divide-y divide-slate-100">
          {studentRecords.map((r, i) => (
            <div key={i} className="p-4">
              <div className="flex items-center justify-between mb-1">
                <p className="font-bold text-slate-800 text-sm">{r.student}</p>
                <span className="font-bold font-mono text-xs text-indigo-600">
                  {r.percentage}%
                </span>
              </div>
              <div className="flex gap-4 text-xs text-slate-500 mt-1">
                <span>Present: {r.present}</span>
                <span>Absent: {r.absent}</span>
                <span>Total: {r.total}</span>
              </div>
              <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    r.percentage >= 85 ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${r.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {studentRecords.length === 0 && !loading && (
          <div className="py-16 text-center text-slate-400 text-xs">
            No attendance records found for this batch. Click "Mark Attendance" to log a session.
          </div>
        )}
      </div>

      {/* Mark Attendance Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Mark Session Attendance" size="lg">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-100">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase">
                Session Date
              </label>
              <input
                type="date"
                value={markDate}
                onChange={(e) => setMarkDate(e.target.value)}
                className="mt-1 px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-xl"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setAllStatus('Present')}
                className="text-xs text-emerald-600 hover:underline font-semibold"
              >
                Mark All Present
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={() => setAllStatus('Late')}
                className="text-xs text-amber-600 hover:underline font-semibold"
              >
                Mark All Late
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={() => setAllStatus('Absent')}
                className="text-xs text-rose-600 hover:underline font-semibold"
              >
                Mark All Absent
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {batchStudents.map((s) => {
              const currentStatus = attendanceMap[s.id] || 'Present';
              return (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center text-xs font-bold">
                      {s.name[0]}
                    </div>
                    <span className="text-xs font-bold text-slate-800">{s.name}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {(['Present', 'Late', 'Absent'] as const).map((st) => {
                      const isActive = currentStatus === st;
                      const activeStyle =
                        st === 'Present'
                          ? 'bg-emerald-600 text-white font-bold shadow-xs'
                          : st === 'Late'
                          ? 'bg-amber-500 text-white font-bold shadow-xs'
                          : 'bg-rose-600 text-white font-bold shadow-xs';
                      const inactiveStyle =
                        st === 'Present'
                          ? 'bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
                          : st === 'Late'
                          ? 'bg-white text-amber-700 hover:bg-amber-50 border border-amber-200'
                          : 'bg-white text-rose-700 hover:bg-rose-50 border border-rose-200';

                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setAttendanceMap((prev) => ({ ...prev, [s.id]: st }))}
                          className={`px-2.5 py-1 rounded-lg text-[11px] transition-all font-medium ${
                            isActive ? activeStyle : inactiveStyle
                          }`}
                        >
                          {st}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-2.5 mt-5 justify-end pt-3 border-t border-slate-100">
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAttendance}
              className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors"
            >
              Save Attendance
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AttendancePage;
