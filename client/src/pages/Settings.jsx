import { useState } from 'react';
import { Settings as SettingsIcon, User, Bell, Palette, Shield, Sun, Moon, Check } from 'lucide-react';
import useAuthStore from '../store/authStore';

export default function Settings() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [theme, setTheme] = useState(localStorage.getItem('bbb_theme') || 'dark');
  const [dailyTarget, setDailyTarget] = useState(localStorage.getItem('bbb_daily_target') || '4');
  const [notifs, setNotifs] = useState({ revisions: true, followups: true, weekly: true });
  const [saved, setSaved] = useState(false);

  const saveSettings = () => {
    localStorage.setItem('bbb_theme', theme);
    localStorage.setItem('bbb_daily_target', dailyTarget);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const inputCls = 'rounded-lg px-3 py-2 text-sm text-white outline-none w-full';
  const inputStyle = { background: '#1a1a1a', border: '1px solid #2a2a2a' };

  const Section = ({ icon: Icon, title, children }) => (
    <div className="rounded-xl p-5 space-y-4" style={{ background: '#161616', border: '1px solid #222' }}>
      <div className="flex items-center gap-2 pb-2" style={{ borderBottom: '1px solid #222' }}>
        <Icon size={15} className="text-yellow-400" />
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      {children}
    </div>
  );

  return (
    <div className="p-5 space-y-5 max-w-2xl">
      <div className="flex items-center gap-2">
        <SettingsIcon size={18} className="text-yellow-400" />
        <h1 className="text-xl font-bold text-white">Settings</h1>
      </div>

      {/* Profile */}
      <Section icon={User} title="Profile">
        <div>
          <label className="block text-xs text-zinc-500 mb-1">Email</label>
          <input value={user?.email || ''} readOnly className={inputCls} style={{ ...inputStyle, opacity: 0.6 }} />
        </div>
        <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-black" style={{ background: '#EAB308' }}>
            {user?.email?.slice(0, 2).toUpperCase() || 'BB'}
          </div>
          <div>
            <div className="text-sm font-medium text-white">{user?.email?.split('@')[0] || 'User'}</div>
            <div className="text-xs text-zinc-500">BrickByBrick Member</div>
          </div>
        </div>
      </Section>

      {/* Preferences */}
      <Section icon={Palette} title="Preferences">
        <div>
          <label className="block text-xs text-zinc-500 mb-2">Theme</label>
          <div className="flex gap-2">
            {[['dark', 'Dark', Moon], ['light', 'Light', Sun]].map(([val, label, Icon]) => (
              <button key={val} onClick={() => setTheme(val)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={theme === val ? { background: '#EAB308', color: '#000' } : { background: '#1e1e1e', color: '#888', border: '1px solid #2a2a2a' }}>
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs text-zinc-500 mb-1">Daily DSA Target (problems/day)</label>
          <input type="number" min="1" max="20" value={dailyTarget} onChange={e => setDailyTarget(e.target.value)}
            className={`${inputCls} w-24`} style={inputStyle} />
        </div>
      </Section>

      {/* Notifications */}
      <Section icon={Bell} title="Notifications">
        {[
          ['revisions', 'Revision reminders'],
          ['followups', 'Job follow-up alerts'],
          ['weekly', 'Weekly review reminder (Sunday)'],
        ].map(([key, label]) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-sm text-zinc-300">{label}</span>
            <button
              onClick={() => setNotifs(n => ({ ...n, [key]: !n[key] }))}
              className="relative w-10 h-5 rounded-full transition-colors"
              style={{ background: notifs[key] ? '#EAB308' : '#2a2a2a' }}>
              <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                style={{ left: notifs[key] ? '22px' : '2px' }} />
            </button>
          </div>
        ))}
      </Section>

      {/* Danger zone */}
      <Section icon={Shield} title="Account">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-white">Sign out</div>
            <div className="text-xs text-zinc-500">Sign out of your BrickByBrick account</div>
          </div>
          <button onClick={logout} className="px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-colors" style={{ background: '#3f1515', border: '1px solid #5a1f1f' }}>
            Sign out
          </button>
        </div>
      </Section>

      <button onClick={saveSettings}
        className="px-6 py-2.5 rounded-lg text-sm font-semibold text-black transition-all"
        style={{ background: '#EAB308' }}>
        {saved ? <span className="flex items-center gap-1.5"><Check size={14} /> Saved!</span> : 'Save Settings'}
      </button>
    </div>
  );
}
