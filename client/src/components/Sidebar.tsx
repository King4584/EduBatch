import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  UserPlus,
  CreditCard,
  CalendarCheck,
  Bell,
  UserCircle,
  Settings,
  ChevronLeft,
  GraduationCap,
  X,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
}) => {
  const { user } = useAuth();
  const role = user?.role || 'student';

  const getNavItems = () => {
    switch (role) {
      case 'admin':
        return [
          { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/batches', label: 'Batches', icon: BookOpen },
          { to: '/students', label: 'Students', icon: Users },
          { to: '/enrollments', label: 'Enrollments', icon: UserPlus },
          { to: '/payments', label: 'Payments', icon: CreditCard },
          { to: '/attendance', label: 'Attendance', icon: CalendarCheck },
          { to: '/notices', label: 'Notices', icon: Bell },
        ];
      case 'teacher':
        return [
          { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/batches', label: 'My Batches', icon: BookOpen },
          { to: '/attendance', label: 'Attendance', icon: CalendarCheck },
          { to: '/notices', label: 'Notices', icon: Bell },
        ];
      case 'student':
      default:
        return [
          { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/batches', label: 'My Batches', icon: BookOpen },
          { to: '/attendance', label: 'Attendance', icon: CalendarCheck },
          { to: '/payments', label: 'Fee Payments', icon: CreditCard },
          { to: '/notices', label: 'Notices', icon: Bell },
        ];
    }
  };

  const navItems = getNavItems();

  const bottomItems = [
    { to: '/profile', label: 'Profile', icon: UserCircle },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full z-50 flex flex-col
          bg-[#0f172a] sidebar-transition
          ${collapsed ? 'w-16' : 'w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-white/10 shrink-0">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-500 shadow-sm shrink-0">
            <GraduationCap size={20} className="text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <span className="font-display font-700 text-white text-lg tracking-tight block">
                EduBatch
              </span>
              <span className="text-[10px] uppercase font-semibold text-indigo-400 tracking-wider flex items-center gap-1">
                <ShieldCheck size={10} /> {role} Mode
              </span>
            </div>
          )}
          <button
            onClick={onMobileClose}
            className="ml-auto text-slate-400 hover:text-white lg:hidden p-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <div className="space-y-1 px-2.5">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={onMobileClose}
                className={({ isActive }) => `
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                  ${
                    isActive
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-xs'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }
                  ${collapsed ? 'justify-center px-0' : ''}
                `}
                title={collapsed ? label : undefined}
              >
                <Icon size={18} className="shrink-0" />
                {!collapsed && <span>{label}</span>}
              </NavLink>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 px-2.5 space-y-1">
            {bottomItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={onMobileClose}
                className={({ isActive }) => `
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                  ${
                    isActive
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }
                  ${collapsed ? 'justify-center px-0' : ''}
                `}
                title={collapsed ? label : undefined}
              >
                <Icon size={18} className="shrink-0" />
                {!collapsed && <span>{label}</span>}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Desktop Collapse Toggle */}
        <div className="hidden lg:flex p-3 border-t border-white/10">
          <button
            onClick={onToggle}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all text-xs font-medium"
          >
            <ChevronLeft
              size={16}
              className={`shrink-0 transition-transform duration-200 ${
                collapsed ? 'rotate-180' : ''
              }`}
            />
            {!collapsed && <span>Collapse Sidebar</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
