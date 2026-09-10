import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Shield, GraduationCap, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { showToast } from '../../components/Toast';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, demoLogin } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@edubatch.com',
      password: 'Password@123',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true);
      await login(data.email, data.password);
      showToast('Welcome back to EduBatch!', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Invalid email or password', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (role: 'admin' | 'teacher' | 'student') => {
    const creds = {
      admin: { email: 'admin@edubatch.com', pass: 'Password@123' },
      teacher: { email: 'teacher@edubatch.com', pass: 'Password@123' },
      student: { email: 'student@edubatch.com', pass: 'Password@123' },
    }[role];
    setValue('email', creds.email);
    setValue('password', creds.pass);
    showToast(`Loaded ${role.toUpperCase()} credentials`, 'info');
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display font-700 text-xl text-slate-800 tracking-tight">
          Sign In to your Account
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Access your batches, attendance, and institution tools.
        </p>
      </div>

      {/* Demo Credentials Quick Fill Pills */}
      <div className="mb-5 bg-indigo-50/70 border border-indigo-100 rounded-xl p-3">
        <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block mb-1.5">
          One-Click Demo Accounts:
        </span>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() => handleQuickFill('admin')}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-white border border-indigo-200 hover:border-indigo-400 text-slate-700 text-xs font-semibold shadow-2xs transition-all"
          >
            <Shield size={13} className="text-indigo-600 shrink-0" />
            <span>Admin</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill('teacher')}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-white border border-indigo-200 hover:border-indigo-400 text-slate-700 text-xs font-semibold shadow-2xs transition-all"
          >
            <GraduationCap size={13} className="text-blue-600 shrink-0" />
            <span>Teacher</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill('student')}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-white border border-indigo-200 hover:border-indigo-400 text-slate-700 text-xs font-semibold shadow-2xs transition-all"
          >
            <User size={13} className="text-emerald-600 shrink-0" />
            <span>Student</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Email Address
          </label>
          <div className="relative">
            <Mail
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="email"
              placeholder="e.g. admin@edubatch.com"
              {...register('email')}
              className={`w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all ${
                errors.email ? 'border-rose-300' : 'border-slate-200 focus:border-indigo-400'
              }`}
            />
          </div>
          {errors.email && (
            <p className="text-[11px] text-rose-500 mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-slate-700">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-[11px] text-indigo-600 hover:underline font-medium"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="password"
              placeholder="••••••••"
              {...register('password')}
              className={`w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all ${
                errors.password ? 'border-rose-300' : 'border-slate-200 focus:border-indigo-400'
              }`}
            />
          </div>
          {errors.password && (
            <p className="text-[11px] text-rose-500 mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-200 transition-all disabled:opacity-50"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight size={15} />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-slate-100 text-center">
        <p className="text-xs text-slate-500">
          New to EduBatch?{' '}
          <Link to="/register" className="text-indigo-600 font-semibold hover:underline">
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
