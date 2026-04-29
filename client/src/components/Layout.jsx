import { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  LayoutDashboard, Code2, Briefcase, ClipboardList, AlertTriangle,
  LogOut, Menu, Bell, Calendar, Search, ChevronDown,
  BarChart2, Target, BookOpen, Settings, RefreshCw, Flame,
  User, ChevronLeft, ChevronRight as ChevronRightIcon, X
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import api from '../api/client';

const navItems = [
  { to: '/',          label: 'Dashboard',        Icon: LayoutDashboard },
  { to: '/dsa',       label: 'DSA Tracker',      Icon: Code2 },
  { to: '/jobs',      label: 'Job Applications', Icon: Briefcase },
  { to: '/revisions', label: 'Revision Due',     Icon: RefreshCw },
  { to: '/mistakes',  label: 'Mistake Log',      Icon: AlertTriangle },
  { to: '/reviews',   label: 'Weekly Review',    Icon: ClipboardList },
  { to: '/analytics', label: 'Analytics',        Icon: BarChart2 },
  { to: '/goals',     label: 'Goals',            Icon: Target },
  { to: '/resources', label: 'Resources',        Icon: BookOpen },
  { to: '/settings',  label: 'Settings',         Icon: Settings },
];

function B3Logo({ size = 32 }) {
  return (
    <div
      className="flex items-center justify-center rounded-lg font-black text-black select-none shrink-0"
      style={{ width: size, height: size, background: '#EAB308', fontSize: size * 0.45, letterSpacing: '-1px' }}
    >
      B<sup style={{ fontSize: size * 0.28, verticalAlign: 'super' }}>3</sup>
    </div>
  );
}

// ── Mini Calendar ─────────────────────────────────────────────────────────────
function MiniCalendar({ onClose, upcoming }) {
  const [current, setCurrent] = useState(dayjs());
  const today = dayjs();
  const startOfMonth = current.startOf('month');
  const daysInMonth = current.daysInMonth();
  const startDay = startOfMonth.day();

  // Build a map of day → event types for this month
  const eventMap = {};
  if (upcoming) {
    for (const item of upcoming) {
      const d = dayjs(item.date);
      if (d.month() === current.month() && d.year() === current.year()) {
        const day = d.date();
        if (!eventMap[day]) eventMap[day] = [];
        eventMap[day].push(item.type);
      }
    }
  }

  const cells = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const dotColor = { revision: '#EAB308', followup: '#fb923c', review: '#60a5fa' };

  return (
    <div className="absolute right-0 top-full mt-2 z-50 rounded-xl p-4 shadow-2xl"
      style={{ background: '#161616', border: '1px solid #2a2a2a', width: '280px' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setCurrent(c => c.subtract(1, 'month'))} className="p-1 rounded text-zinc-400 hover:text-white">
          <ChevronLeft size={14} />
        </button>
        <span className="text-xs font-semibold text-white">{current.format('MMMM YYYY')}</span>
        <button onClick={() => setCurrent(c => c.add(1, 'month'))} className="p-1 rounded text-zinc-400 hover:text-white">
          <ChevronRightIcon size={14} />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-1">
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
          <div key={d} className="text-center text-xs text-zinc-600 py-1">{d}</div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const isToday = d === today.date() && current.month() === today.month() && current.year() === today.year();
          const events = eventMap[d] || [];
          return (
            <div key={i} className="flex flex-col items-center gap-0.5 py-0.5">
              <div className="flex items-center justify-center h-7 w-7 rounded-full text-xs cursor-default"
                style={isToday ? { background: '#EAB308', color: '#000', fontWeight: 700 } : { color: events.length ? '#fff' : '#666' }}>
                {d}
              </div>
              {events.length > 0 && (
                <div className="flex gap-0.5">
                  {[...new Set(events)].slice(0, 3).map((type, ti) => (
                    <span key={ti} className="w-1 h-1 rounded-full" style={{ background: dotColor[type] || '#888' }} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 pt-3 space-y-1.5" style={{ borderTop: '1px solid #222' }}>
        <div className="text-xs text-zinc-500 mb-2">Today: <span className="text-yellow-400 font-medium">{today.format('D MMM YYYY')}</span></div>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400" /> Revision</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: '#fb923c' }} /> Follow-up</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: '#60a5fa' }} /> Review</span>
        </div>
      </div>
    </div>
  );
}

// ── Notifications Panel ───────────────────────────────────────────────────────
function NotificationsPanel({ alerts, onClose }) {
  const items = [];
  if (alerts?.pendingRevisions > 0)
    items.push({ type: 'warn', text: `${alerts.pendingRevisions} revision(s) due — don't skip!` });
  if (alerts?.followUpsDue > 0)
    items.push({ type: 'info', text: `${alerts.followUpsDue} job follow-up(s) due today` });
  if (alerts?.noActivityWarning)
    items.push({ type: 'warn', text: 'No activity in 3 days — get back on track!' });
  if (items.length === 0)
    items.push({ type: 'ok', text: 'All clear! No pending alerts.' });

  return (
    <div className="absolute right-0 top-full mt-2 z-50 rounded-xl w-72 shadow-2xl overflow-hidden"
      style={{ background: '#161616', border: '1px solid #2a2a2a' }}>
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #222' }}>
        <span className="text-xs font-semibold text-white">Notifications</span>
        <button onClick={onClose} className="text-zinc-500 hover:text-white"><X size={13} /></button>
      </div>
      <div className="divide-y" style={{ borderColor: '#222' }}>
        {items.map((item, i) => (
          <div key={i} className="px-4 py-3 flex items-start gap-3">
            <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
              style={{ background: item.type === 'ok' ? '#4ade80' : item.type === 'warn' ? '#EAB308' : '#60a5fa' }} />
            <span className="text-xs text-zinc-300">{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── User Dropdown ─────────────────────────────────────────────────────────────
function UserDropdown({ displayName, initials, onLogout, onClose }) {
  return (
    <div className="absolute right-0 top-full mt-2 z-50 rounded-xl w-52 shadow-2xl overflow-hidden"
      style={{ background: '#161616', border: '1px solid #2a2a2a' }}>
      {/* Profile header */}
      <div className="px-4 py-3 flex items-center gap-3" style={{ borderBottom: '1px solid #222' }}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-black shrink-0"
          style={{ background: '#EAB308' }}>{initials}</div>
        <div className="min-w-0">
          <div className="text-xs font-semibold text-white truncate">{displayName}</div>
          <div className="text-xs text-zinc-500">BrickByBrick</div>
        </div>
      </div>
      {/* Menu items */}
      <div className="py-1">
        <Link to="/settings" onClick={onClose}
          className="flex items-center gap-2.5 px-4 py-2 text-xs text-zinc-300 hover:text-white hover:bg-white/5 transition-colors">
          <User size={13} /> Profile & Settings
        </Link>
        <button onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs transition-colors"
          style={{ color: '#f87171' }}
          onMouseEnter={e => e.currentTarget.style.background = '#1a0808'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <LogOut size={13} /> Sign out
        </button>
      </div>
    </div>
  );
}

// ── Main Layout ───────────────────────────────────────────────────────────────
export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [streak, setStreak] = useState(null);
  const [alerts, setAlerts] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [showCal, setShowCal] = useState(false);
  const [showUser, setShowUser] = useState(false);

  const notifRef = useRef(null);
  const calRef = useRef(null);
  const userRef = useRef(null);

  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : 'BB';
  const displayName = user?.email
    ? user.email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    : 'User';

  useEffect(() => {
    // Fetch daily streak (consecutive days with at least 1 solved DSA entry)
    api.get('/dashboard/streak').then(({ data }) => setStreak(data.data?.dailyStreak ?? 0)).catch(() => {});
    api.get('/dashboard/alerts').then(({ data }) => setAlerts(data.data)).catch(() => {});
    api.get('/dashboard/upcoming').then(({ data }) => setUpcoming(data.data || [])).catch(() => {});
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
      if (calRef.current && !calRef.current.contains(e.target)) setShowCal(false);
      if (userRef.current && !userRef.current.contains(e.target)) setShowUser(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const notifCount = alerts
    ? (alerts.pendingRevisions > 0 ? 1 : 0) + (alerts.followUpsDue > 0 ? 1 : 0) + (alerts.noActivityWarning ? 1 : 0)
    : 0;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0d0d0d' }}>
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/70 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-52 flex flex-col shrink-0
        transform transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `} style={{ background: '#111', borderRight: '1px solid #1e1e1e' }}>

        <div className="px-4 py-4 flex items-center gap-2.5" style={{ borderBottom: '1px solid #1e1e1e' }}>
          <B3Logo size={30} />
          <div className="text-sm font-bold text-white leading-tight">BrickByBrick</div>
        </div>

        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, label, Icon }) => (
            <NavLink key={to} to={to} end={to === '/'} onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                  isActive ? 'bg-yellow-400 text-black' : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`
              }>
              <Icon size={14} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Daily streak badge */}
        <div className="px-3 py-3" style={{ borderTop: '1px solid #1e1e1e' }}>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#1a1a1a' }}>
            <Flame size={16} className="text-yellow-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-yellow-400">Streak</div>
              <div className="text-xs text-zinc-500">
                {streak !== null ? `${streak} Day${streak !== 1 ? 's' : ''}` : '—'}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top Navbar */}
        <header className="flex items-center gap-3 px-4 py-2.5 shrink-0" style={{ background: '#111', borderBottom: '1px solid #1e1e1e' }}>
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5">
            <Menu size={18} />
          </button>

          {/* Search */}
          <div className="flex-1 max-w-sm relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input value={searchVal} onChange={e => setSearchVal(e.target.value)}
              placeholder="Search anything..."
              className="w-full pl-8 pr-10 py-1.5 rounded-lg text-xs text-white placeholder-zinc-500 outline-none"
              style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }} />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-600 text-xs">⌘K</span>
          </div>

          <div className="flex-1" />

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button onClick={() => { setShowNotif(v => !v); setShowCal(false); setShowUser(false); }}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 relative transition-colors">
              <Bell size={16} />
              {notifCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-black text-xs font-bold flex items-center justify-center"
                  style={{ background: '#EAB308', fontSize: '9px' }}>{notifCount}</span>
              )}
            </button>
            {showNotif && <NotificationsPanel alerts={alerts} onClose={() => setShowNotif(false)} />}
          </div>

          {/* Calendar */}
          <div className="relative" ref={calRef}>
            <button onClick={() => { setShowCal(v => !v); setShowNotif(false); setShowUser(false); }}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
              <Calendar size={16} />
            </button>
            {showCal && <MiniCalendar onClose={() => setShowCal(false)} upcoming={upcoming} />}
          </div>

          {/* User dropdown */}
          <div className="relative" ref={userRef}>
            <button onClick={() => { setShowUser(v => !v); setShowNotif(false); setShowCal(false); }}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/5 transition-colors">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-black shrink-0"
                style={{ background: '#EAB308' }}>{initials}</div>
              <span className="text-xs text-white font-medium hidden sm:block">{displayName}</span>
              <ChevronDown size={12} className="text-zinc-500 hidden sm:block" />
            </button>
            {showUser && (
              <UserDropdown
                displayName={displayName}
                initials={initials}
                onLogout={handleLogout}
                onClose={() => setShowUser(false)}
              />
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto" style={{ background: '#0d0d0d' }}>
          <div className="page-enter">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
