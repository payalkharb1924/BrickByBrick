import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Code2, Briefcase, ClipboardList, AlertTriangle, LogOut, Menu, Zap } from 'lucide-react';
import useAuthStore from '../store/authStore';

const navItems = [
  { to: '/',         label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/dsa',      label: 'DSA',       Icon: Code2 },
  { to: '/jobs',     label: 'Jobs',      Icon: Briefcase },
  { to: '/reviews',  label: 'Reviews',   Icon: ClipboardList },
  { to: '/mistakes', label: 'Mistakes',  Icon: AlertTriangle },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0a0a0a' }}>
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/70 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-56 flex flex-col
        transform transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `} style={{ background: '#111111', borderRight: '1px solid #1f1f1f' }}>

        {/* Logo */}
        <div className="px-5 py-5 flex items-center gap-2.5" style={{ borderBottom: '1px solid #1f1f1f' }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#EAB308' }}>
            <Zap size={14} color="#000" strokeWidth={2.5} />
          </div>
          <span className="text-base font-bold tracking-tight" style={{ color: '#EAB308' }}>GrindTracker</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'text-black'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`
              }
              style={({ isActive }) => isActive ? { background: '#EAB308', color: '#000' } : {}}
            >
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4" style={{ borderTop: '1px solid #1f1f1f' }}>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-500 hover:text-white hover:bg-white/5 transition-all duration-150"
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <header className="flex items-center justify-between px-4 py-3 lg:hidden" style={{ background: '#111111', borderBottom: '1px solid #1f1f1f' }}>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: '#EAB308' }}>
              <Zap size={12} color="#000" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-bold" style={{ color: '#EAB308' }}>GrindTracker</span>
          </div>
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
            <Menu size={18} />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="page-enter max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
