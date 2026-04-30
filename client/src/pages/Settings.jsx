import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, User, Bell, Palette, Shield, Sun, Moon, Check, BellOff } from 'lucide-react';
import useAuthStore from '../store/authStore';
import api from '../api/client';
import { checkAndNotify } from '../utils/notifications';

const inputStyle = { background: '#1a1a1a', border: '1px solid #2a2a2a' };

function Card({ icon: Icon, title, children }) {
  return (
    <div className="rounded-xl p-5 space-y-4" style={{ background: '#161616', border: '1px solid #222' }}>
      <div className="flex items-center gap-2 pb-3" style={{ borderBottom: '1px solid #222' }}>
        <Icon size={14} className="text-yellow-400" />
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button onClick={() => onChange(!checked)}
      className="relative w-10 h-5 rounded-full transition-colors shrink-0"
      style={{ background: checked ? '#EAB308' : '#2a2a2a' }}>
      <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
        style={{ left: checked ? '22px' : '2px' }} />
    </button>
  );
}

// Fire actual browser notifications based on alerts data
function fireNotifications(alerts, notifs) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return 0;
  let fired = 0;

  // Always fire at least a test notification
  if (!alerts || (alerts.pendingRevisions === 0 && alerts.followUpsDue === 0 && !alerts.noActivityWarning)) {
    new Notification('BrickByBrick', {
      body: 'All clear! No pending alerts right now.',
      icon: '/vite.svg',
    });
    return 1;
  }

  if (notifs.revisions && alerts?.pendingRevisions > 0) {
    new Notification('BrickByBrick — Revisions Due', {
      body: `You have ${alerts.pendingRevisions} revision(s) pending. Don't skip!`,
      icon: '/vite.svg',
    });
    fired++;
  }
  if (notifs.followups && alerts?.followUpsDue > 0) {
    new Notification('BrickByBrick — Follow-ups Due', {
      body: `${alerts.followUpsDue} job follow-up(s) are due today.`,
      icon: '/vite.svg',
    });
    fired++;
  }
  if (notifs.weekly && new Date().getDay() === 0) {
    new Notification('BrickByBrick — Weekly Review', {
      body: "It's Sunday! Time to complete your weekly review.",
      icon: '/vite.svg',
    });
    fired++;
  }
  return fired;
}

export default function Settings() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const [theme, setTheme] = useState(localStorage.getItem('bbb_theme') || 'dark');
  const [dailyTarget, setDailyTarget] = useState(localStorage.getItem('bbb_daily_target') || '4');
  const [notifs, setNotifs] = useState(() => {
    try { return JSON.parse(localStorage.getItem('bbb_notifs')) || { revisions: true, followups: true, weekly: true }; }
    catch { return { revisions: true, followups: true, weekly: true }; }
  });
  const [notifPerm, setNotifPerm] = useState(typeof Notification !== 'undefined' ? Notification.permission : 'default');
  const [saved, setSaved] = useState(false);
  const [alerts, setAlerts] = useState(null);
  const [notifMsg, setNotifMsg] = useState(null);

  useEffect(() => {
    api.get('/dashboard/alerts').then(({ data }) => setAlerts(data.data)).catch(() => {});
  }, []);

  const saveSettings = () => {
    localStorage.setItem('bbb_theme', theme);
    localStorage.setItem('bbb_daily_target', dailyTarget);
    localStorage.setItem('bbb_notifs', JSON.stringify(notifs));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleEnableNotifications = async () => {
    if (!('Notification' in window)) {
      setNotifMsg({ type: 'error', text: 'Your browser does not support notifications.' });
      return;
    }
    const perm = await Notification.requestPermission();
    setNotifPerm(perm);
    if (perm === 'granted') {
      new Notification('BrickByBrick', {
        body: "Notifications enabled! You'll be reminded about revisions, follow-ups, and weekly reviews.",
        icon: '/vite.svg',
      });
      setNotifMsg({ type: 'success', text: 'Notifications enabled! A test notification was sent.' });
    } else if (perm === 'denied') {
      setNotifMsg({ type: 'error', text: 'Notifications blocked. Please allow them in your browser settings (click the lock icon in the address bar).' });
    } else {
      setNotifMsg({ type: 'warn', text: 'Permission dismissed. Click Enable again to try.' });
    }
    setTimeout(() => setNotifMsg(null), 5000);
  };

  const handleTestNotifications = () => {
    if (!('Notification' in window)) {
      setNotifMsg({ type: 'error', text: 'Your browser does not support notifications.' });
      return;
    }
    if (Notification.permission !== 'granted') {
      handleEnableNotifications();
      return;
    }
    const fired = fireNotifications(alerts, notifs);
    setNotifMsg({ type: 'success', text: fired > 0 ? `${fired} notification(s) sent!` : 'No active alerts to notify about.' });
    setTimeout(() => setNotifMsg(null), 3000);
  };

  const handleFireNow = async () => {
    if (Notification.permission !== 'granted') { handleEnableNotifications(); return; }
    await checkAndNotify();
    setNotifMsg({ type: 'success', text: 'Checked alerts and fired any due notifications.' });
    setTimeout(() => setNotifMsg(null), 3000);
  };

  const toggleNotif = (key) => {
    const updated = { ...notifs, [key]: !notifs[key] };
    setNotifs(updated);
    localStorage.setItem('bbb_notifs', JSON.stringify(updated));
  };

  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : 'BB';
  const displayName = user?.email ? user.email.split('@')[0] : 'User';

  return (
    <div className="p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SettingsIcon size={18} className="text-yellow-400" />
          <h1 className="text-xl font-bold text-white">Settings</h1>
        </div>
        <button onClick={saveSettings}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-black transition-all"
          style={{ background: '#EAB308' }}>
          {saved ? <><Check size={14} /> Saved!</> : 'Save Settings'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:items-stretch">

        {/* LEFT */}
        <div className="flex flex-col gap-4">

          {/* Profile */}
          <Card icon={User} title="Profile">
            <div className="flex items-center gap-4 p-3 rounded-xl" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold text-black shrink-0"
                style={{ background: '#EAB308' }}>
                {initials}
              </div>
              <div>
                <div className="text-sm font-semibold text-white">{displayName}</div>
                <div className="text-xs text-zinc-500 mt-0.5">{user?.email}</div>
                <div className="text-xs text-yellow-400 mt-0.5">BrickByBrick Member</div>
              </div>
            </div>
          </Card>

          {/* Preferences — flex-1 so it stretches to fill remaining height */}
          <div className="flex-1 rounded-xl p-5 space-y-4" style={{ background: '#161616', border: '1px solid #222' }}>
            <div className="flex items-center gap-2 pb-3" style={{ borderBottom: '1px solid #222' }}>
              <Palette size={14} className="text-yellow-400" />
              <h3 className="text-sm font-semibold text-white">Preferences</h3>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-2">Theme</label>
              <div className="flex gap-2">
                {[['dark', 'Dark', Moon], ['light', 'Light', Sun]].map(([val, label, Icon]) => (
                  <button key={val} onClick={() => setTheme(val)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                    style={theme === val
                      ? { background: '#EAB308', color: '#000' }
                      : { background: '#1e1e1e', color: '#888', border: '1px solid #2a2a2a' }}>
                    <Icon size={14} /> {label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-zinc-600 mt-2">Save to apply theme preference</p>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Daily DSA Target</label>
              <div className="flex items-center gap-3">
                <input type="number" min="1" max="20" value={dailyTarget}
                  onChange={e => setDailyTarget(e.target.value)}
                  className="rounded-lg px-3 py-2 text-sm text-white outline-none w-20 text-center"
                  style={inputStyle} />
                <span className="text-xs text-zinc-500">problems / day</span>
              </div>
              <p className="text-xs text-zinc-600 mt-1">
                Controls the daily progress ring on your dashboard. Currently set to <span className="text-yellow-400">{dailyTarget}</span>.
              </p>
            </div>
          </div>

        </div>

        {/* RIGHT */}
        <div className="flex flex-col gap-4">

          {/* Notifications */}
          <Card icon={Bell} title="Notifications">
            {/* Feedback message */}
            {notifMsg && (
              <div className="rounded-lg px-3 py-2.5 text-xs font-medium" style={{
                background: notifMsg.type === 'success' ? '#081a0a' : notifMsg.type === 'error' ? '#1a0808' : '#1a1500',
                border: `1px solid ${notifMsg.type === 'success' ? '#153f18' : notifMsg.type === 'error' ? '#3f1515' : '#3f3000'}`,
                color: notifMsg.type === 'success' ? '#4ade80' : notifMsg.type === 'error' ? '#f87171' : '#EAB308',
              }}>
                {notifMsg.text}
              </div>
            )}

            {/* Permission status */}
            <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: '#1a1a1a' }}>
              <div>
                <div className="text-sm text-white flex items-center gap-2">
                  {notifPerm === 'granted' ? <Bell size={13} className="text-yellow-400" /> : <BellOff size={13} className="text-zinc-500" />}
                  Browser Notifications
                </div>
                <div className="text-xs text-zinc-500 mt-0.5">
                  {notifPerm === 'granted' ? 'Enabled — you\'ll receive alerts' : notifPerm === 'denied' ? 'Blocked in browser settings' : 'Not yet enabled'}
                </div>
              </div>
              {notifPerm !== 'granted' ? (
                <button onClick={handleEnableNotifications}
                  className="text-xs px-3 py-1.5 rounded-lg font-medium text-black"
                  style={{ background: '#EAB308' }}>
                  Enable
                </button>
              ) : (
                <button onClick={handleTestNotifications}
                  className="text-xs px-3 py-1.5 rounded-lg font-medium text-zinc-300"
                  style={{ background: '#1e1e1e', border: '1px solid #2a2a2a' }}>
                  Test
                </button>
              )}
            </div>

            <div className="space-y-4">
              {[
                ['revisions', 'Revision reminders', 'Alert when DSA revisions are due'],
                ['followups', 'Job follow-up alerts', 'Alert for pending job follow-ups'],
                ['weekly',   'Weekly review reminder', 'Sunday reminder to complete your review'],
              ].map(([key, label, desc]) => (
                <div key={key} className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm text-white">{label}</div>
                    <div className="text-xs text-zinc-500 mt-0.5">{desc}</div>
                  </div>
                  <Toggle checked={notifs[key]} onChange={() => toggleNotif(key)} />
                </div>
              ))}
            </div>

            {notifPerm === 'granted' && (
              <button onClick={handleFireNow}
                className="w-full text-xs py-2 rounded-lg text-zinc-300 transition-colors"
                style={{ background: '#1e1e1e', border: '1px solid #2a2a2a' }}>
                Fire notifications now (based on current alerts)
              </button>
            )}
          </Card>

          {/* Account */}
          <Card icon={Shield} title="Account">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: '#1a1a1a' }}>
                <div>
                  <div className="text-sm text-white">Account Status</div>
                  <div className="text-xs text-zinc-500 mt-0.5">Active member</div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: '#0f2a0f', color: '#4ade80' }}>Active</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: '#1a1a1a' }}>
                <div>
                  <div className="text-sm text-white">Sign out</div>
                  <div className="text-xs text-zinc-500 mt-0.5">Sign out of your BrickByBrick account</div>
                </div>
                <button onClick={logout}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-white"
                  style={{ background: '#3f1515', border: '1px solid #5a1f1f' }}>
                  Sign out
                </button>
              </div>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}
