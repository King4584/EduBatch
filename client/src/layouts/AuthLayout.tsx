import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { GraduationCap, ShieldCheck, CheckCircle2 } from 'lucide-react';
import ToastContainer from '../components/Toast';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient gradient glow */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-200/40 rounded-full blur-3xl pointer-events-none" />

      {/* Header / Logo */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <Link to="/" className="inline-flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
            <GraduationCap size={24} />
          </div>
          <span className="font-display font-700 text-2xl text-slate-900 tracking-tight">
            EduBatch
          </span>
        </Link>
        <p className="mt-2 text-xs text-slate-500 max-w-xs mx-auto">
          Education Batch Management & Student Lifecycle SaaS Platform
        </p>
      </div>

      {/* Main Form Container */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-8 shadow-xl shadow-slate-200/60 rounded-2xl border border-slate-200">
          <Outlet />
        </div>

        {/* Feature bullets */}
        <div className="mt-6 flex items-center justify-center gap-6 text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-indigo-600" /> RBAC Security
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-600" /> Razorpay Integrated
          </span>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default AuthLayout;
