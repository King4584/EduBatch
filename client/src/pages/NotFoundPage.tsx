import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-3xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200 mb-6">
        <GraduationCap size={32} />
      </div>
      <h1 className="font-display font-800 text-6xl text-slate-900 tracking-tight">
        404
      </h1>
      <h2 className="font-display font-600 text-xl text-slate-800 mt-2">
        Page Not Found
      </h2>
      <p className="text-xs text-slate-500 mt-1 max-w-sm">
        The requested batch, dashboard view, or institute resource does not exist or has been relocated.
      </p>
      <Link
        to="/dashboard"
        className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md transition-colors"
      >
        <ArrowLeft size={14} />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
};

export default NotFoundPage;
