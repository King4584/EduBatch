import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import ToastContainer from '../components/Toast';
import { useAuth } from '../hooks/useAuth';

export const DashboardLayout: React.FC = () => {
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const sidebarWidth = sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64';

  const role = user?.role || 'student';

  const mobileNavItems = [
    { to: '/dashboard', label: 'Home', emoji: '🏠' },
    { to: '/batches', label: 'Batches', emoji: '📚' },
    ...(role === 'admin'
      ? [
          { to: '/students', label: 'Students', emoji: '👥' },
          { to: '/payments', label: 'Payments', emoji: '💳' },
          { to: '/attendance', label: 'Attendance', emoji: '🗓️' },
        ]
      : role === 'teacher'
      ? [
          { to: '/attendance', label: 'Attendance', emoji: '🗓️' },
          { to: '/notices', label: 'Notices', emoji: '📋' },
        ]
      : [
          { to: '/attendance', label: 'Attendance', emoji: '🗓️' },
          { to: '/payments', label: 'Fees', emoji: '💳' },
          { to: '/notices', label: 'Notices', emoji: '📋' },
        ]),
  ];

  return (
    <div className="h-full bg-slate-50 flex overflow-hidden">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((c) => !c)}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Viewport */}
      <div className={`flex-1 flex flex-col min-w-0 sidebar-transition ${sidebarWidth}`}>
        <Navbar onMobileMenuOpen={() => setMobileMenuOpen(true)} />

        <main className="flex-1 overflow-y-auto pb-20 lg:pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Quick Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white border-t border-slate-200 flex shadow-lg">
        {mobileNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `
              relative flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors
              ${isActive ? 'text-indigo-600 font-semibold' : 'text-slate-400 hover:text-slate-600'}
            `}
          >
            {({ isActive }) => (
              <>
                <span className="text-base leading-none">{item.emoji}</span>
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 w-8 h-0.5 bg-indigo-600 rounded-full" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <ToastContainer />
    </div>
  );
};

export default DashboardLayout;
