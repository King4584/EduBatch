import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  iconBg?: string;
  trend?: {
    value: string;
    positive?: boolean;
  };
  loading?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  iconBg = 'bg-indigo-50',
  trend,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="skeleton h-4 w-24" />
          <div className="skeleton w-9 h-9 rounded-lg" />
        </div>
        <div className="skeleton h-8 w-20 mb-2" />
        <div className="skeleton h-3 w-32" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 transition-all shadow-xs">
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-medium text-slate-500">{title}</span>
        <div className={`p-2 rounded-lg ${iconBg} shrink-0`}>
          {icon}
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-display font-700 text-slate-800 text-2xl tracking-tight">
          {value}
        </span>
        {trend && (
          <span
            className={`inline-flex items-center text-xs font-semibold px-1.5 py-0.5 rounded-full ${
              trend.positive
                ? 'text-emerald-700 bg-emerald-50'
                : 'text-rose-600 bg-rose-50'
            }`}
          >
            {trend.positive ? (
              <ArrowUpRight size={12} className="mr-0.5" />
            ) : (
              <ArrowDownRight size={12} className="mr-0.5" />
            )}
            {trend.value}
          </span>
        )}
      </div>
      {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
    </div>
  );
};

export default StatCard;
