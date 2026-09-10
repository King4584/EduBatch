import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  Menu,
  ChevronDown,
  LogOut,
  UserCircle,
  Settings,
  Sparkles,
  Shield,
  User,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { showToast } from './Toast';

const viewTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/batches': 'Batch Management',
  '/students': 'Student Directory',
  '/enrollments': 'Enrollment Operations',
  '/payments': 'Fee & Payment Processing',
  '/attendance': 'Daily Attendance Register',
  '/notices': 'Institute Notices & Announcements',
  '/profile': 'My Account Profile',
  '/settings': 'Platform Settings',
};

interface NavbarProps {
  onMobileMenuOpen: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMobileMenuOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, demoLogin } = useAuth();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [roleSwitchOpen, setRoleSwitchOpen] = useState(false);

  const currentTitle =
    viewTitles[location.pathname] ||
    (location.pathname.startsWith('/batches/') ? 'Batch Details' : 'EduBatch');

  const handleLogout = async () => {
    await logout();
    showToast('Signed out successfully', 'info');
    navigate('/login');
  };

  const handleRoleSwitch = async (role: 'admin' | 'teacher' | 'student') => {
    try {
      await demoLogin(role);
      setDropdownOpen(false);
      setRoleSwitchOpen(false);
      showToast(`Switched view to ${role.toUpperCase()}`, 'success');
      navigate('/dashboard');
    } catch {
      showToast('Role switch failed', 'error');
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 sm:px-6 gap-3 sm:gap-4 sticky top-0 z-30 shadow-xs">
      {/* Mobile Drawer Button */}
      <button
        onClick={onMobileMenuOpen}
        className="lg:hidden text-slate-500 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors"
        aria-label="Open navigation menu"
      >
        <Menu size={20} />
      </button>

      {/* Page Title */}
      <div className="hidden sm:block">
        <h1 className="font-display font-600 text-slate-800 text-base">
          {currentTitle}
        </h1>
      </div>

      {/* Global Search */}
      <div className="flex-1 max-w-md ml-auto sm:ml-4">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search students, batches, fee records..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
          />
        </div>
      </div>

      {/* Demo Switcher Quick Pill (Visible for easy reviewing) */}
      <div className="relative hidden md:block">
        <button
          onClick={() => setRoleSwitchOpen(!roleSwitchOpen)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors text-xs font-medium"
        >
          <Sparkles size={13} className="text-indigo-600" />
          <span>Switch Role</span>
          <ChevronDown size={12} />
        </button>

        {roleSwitchOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setRoleSwitchOpen(false)}
            />
            <div className="absolute right-0 top-11 w-44 bg-white rounded-xl shadow-xl border border-slate-200 z-20 py-1 overflow-hidden">
              <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Instant Role Switch
              </div>
              <button
                onClick={() => handleRoleSwitch('admin')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left transition-colors ${
                  user?.role === 'admin'
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Shield size={14} className="text-indigo-600" />
                <span>Admin (Rajesh)</span>
              </button>
              <button
                onClick={() => handleRoleSwitch('teacher')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left transition-colors ${
                  user?.role === 'teacher'
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <GraduationCap size={14} className="text-blue-600" />
                <span>Teacher (Dr. Priya)</span>
              </button>
              <button
                onClick={() => handleRoleSwitch('student')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left transition-colors ${
                  user?.role === 'student'
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <User size={14} className="text-emerald-600" />
                <span>Student (Aarav)</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => {
            setNotifOpen(!notifOpen);
            setDropdownOpen(false);
          }}
          className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          aria-label="Notifications"
        >
          <Bell size={19} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
        </button>

        {notifOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setNotifOpen(false)}
            />
            <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 z-20 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
                <span className="font-semibold text-sm text-slate-800">
                  Notifications
                </span>
                <span className="text-[11px] bg-rose-50 text-rose-600 font-semibold px-2 py-0.5 rounded-full border border-rose-100">
                  3 new
                </span>
              </div>
              <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
                {[
                  {
                    title: 'New batch enrollment confirmed: Aarav Mehta',
                    time: '10 min ago',
                    dot: 'bg-emerald-500',
                  },
                  {
                    title: 'Fee payment receipt generated: ₹45,000',
                    time: '1 hr ago',
                    dot: 'bg-indigo-500',
                  },
                  {
                    title: 'Diwali break holiday notice published',
                    time: 'Today, 09:30 AM',
                    dot: 'bg-orange-500',
                  },
                ].map((n, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <div
                      className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.dot}`}
                    />
                    <div>
                      <p className="text-xs font-medium text-slate-800 leading-snug">
                        {n.title}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5 text-center bg-slate-50/50 border-t border-slate-100">
                <button
                  onClick={() => {
                    navigate('/notices');
                    setNotifOpen(false);
                  }}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  View all announcements →
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* User Dropdown */}
      <div className="relative">
        <button
          onClick={() => {
            setDropdownOpen(!dropdownOpen);
            setNotifOpen(false);
          }}
          className="flex items-center gap-2.5 hover:bg-slate-50 rounded-xl p-1.5 transition-colors"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white text-xs font-bold shadow-xs">
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-slate-800 leading-tight">
              {user?.name || 'User'}
            </p>
            <p className="text-[10px] text-slate-400 capitalize">
              {user?.role || 'Guest'}
            </p>
          </div>
          <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
        </button>

        {dropdownOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setDropdownOpen(false)}
            />
            <div className="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 z-20 overflow-hidden py-1.5">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-800 truncate">
                  {user?.name}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {user?.email}
                </p>
                <span className="mt-1 inline-block text-[10px] uppercase font-bold tracking-wide px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100">
                  {user?.role}
                </span>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    navigate('/profile');
                    setDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <UserCircle size={16} className="text-slate-400" />
                  My Profile
                </button>
                <button
                  onClick={() => {
                    navigate('/settings');
                    setDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Settings size={16} className="text-slate-400" />
                  Settings
                </button>
              </div>

              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors font-medium"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
