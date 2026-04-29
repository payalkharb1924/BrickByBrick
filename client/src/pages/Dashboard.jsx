import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  TrendingUp, ArrowRight, Flame, ChevronRight, Code2, Briefcase, RefreshCw,
  CheckCircle2, Mail, ClipboardList, Target, Sparkles, Users
} from 'lucide-react';
import api from '../api/client';
import useAuthStore from '../store/authStore';

dayjs.extend(relativeTime);

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function Sparkline({ color = '#EAB308' }) {
  const pts = [10, 6, 8, 4, 7, 3, 5, 2, 4, 1].map((y, x) => `${x * 11},${y * 3}`).join(' ');
  return (
    <svg width="90" height="32" viewBox="0 0 99 30" fill="none">
      <polyline points={pts} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Ring({ value, max, sublabel, color = '#EAB308', size = 90 }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  const dash = pct * circ;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={r} fill="none" stroke="#2a2a2a" strokeWidth="7" />
        <circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="7"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 40 40)" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-white leading-none">{value}</span>
        {sublabel && <span className="text-xs text-zinc-500 leading-none mt-0.5">{sublabel}</span>}
      </div>
    </div>
  );
}

function StatBigCard({ title, value, delta, deltaLabel, icon: Icon, linkTo, linkLabel }) {
  return (
    <div className="rounded-xl p-4 flex flex-col gap-3" style={{ background: '#161616', border: '1px solid #222' }}>
      <div className="flex items-start justify-between">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#1e1e1e' }}>
          {Icon && <Icon size={17} className="text-yellow-400" />}
        </div>
        <Sparkline />
      </div>
      <div>
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="text-xs text-zinc-500 mt-0.5">{title}</div>
      </div>
      <div className="flex items-center justify-between">
        {delta !== undefined && (
          <span className="text-xs font-medium text-green-400 flex items-center gap-1">
            <TrendingUp size={11} /> {delta >= 0 ? '+' : ''}{delta} {deltaLabel}
          </span>
        )}
        {linkTo && (
          <Link to={linkTo} className="text-xs text-yellow-400 flex items-center gap-0.5 hover:text-yellow-300 ml-auto">
            {linkLabel} <ArrowRight size={11} />
          </Link>
        )}
      </div>
    </div>
  );
}

function TodayOverview({ overview }) {
  if (!overview) return null;
  const { dsa, applications, revisions } = overview;
  return (
    <div className="rounded-xl p-4" style={{ background: '#161616', border: '1px solid #222' }}>
      <h3 className="text-sm font-semibold text-white mb-4">Today's Overview</h3>
      <div className="grid grid-cols-3 gap-4">
        {/* DSA Progress */}
        <div className="flex flex-col gap-3">
          <div className="text-xs font-medium text-zinc-400">DSA Progress</div>
          <div className="flex justify-center">
            <Ring value={dsa.solved} max={dsa.target} sublabel="Daily Target" color="#EAB308" />
          </div>
          <div className="space-y-1.5">
            {[['Easy', dsa.breakdown.Easy, '#4ade80'], ['Medium', dsa.breakdown.Medium, '#EAB308'], ['Hard', dsa.breakdown.Hard, '#f87171']].map(([d, v, c]) => (
              <div key={d} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: c }} />
                  <span className="text-zinc-400">{d}</span>
                </div>
                <span className="text-zinc-300">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Applications */}
        <div className="flex flex-col gap-3">
          <div className="text-xs font-medium text-zinc-400">Applications</div>
          <div className="flex justify-center">
            <Ring value={applications.applied} max={5} sublabel="Daily Target" color="#60a5fa" />
          </div>
          <div className="space-y-1.5">
            {[['Applied', applications.applied, '#60a5fa'], ['Referrals', applications.referrals, '#c084fc'], ['Follow-ups', applications.followUps, '#fb923c']].map(([l, v, c]) => (
              <div key={l} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: c }} />
                  <span className="text-zinc-400">{l}</span>
                </div>
                <span className="text-zinc-300">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Revisions Due */}
        <div className="flex flex-col gap-3">
          <div className="text-xs font-medium text-zinc-400">Revisions Due</div>
          <div className="flex justify-center">
            <Ring value={revisions.dueToday + revisions.overdue} max={Math.max(revisions.dueToday + revisions.overdue, 10)} sublabel="Total" color="#f87171" />
          </div>
          <div className="space-y-1.5">
            {[['Due Today', revisions.dueToday, '#EAB308'], ['Overdue', revisions.overdue, '#f87171']].map(([l, v, c]) => (
              <div key={l} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: c }} />
                  <span className="text-zinc-400">{l}</span>
                </div>
                <span className="text-zinc-300">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const ACTIVITY_ICONS = {
  dsa:      { Icon: Code2,        color: '#EAB308' },
  job:      { Icon: Briefcase,    color: '#60a5fa' },
  revision: { Icon: RefreshCw,    color: '#4ade80' },
  referral: { Icon: Users,        color: '#c084fc' },
};

function RecentActivity({ activities }) {
  if (!activities || activities.length === 0) {
    return (
      <div className="rounded-xl p-4" style={{ background: '#161616', border: '1px solid #222' }}>
        <h3 className="text-sm font-semibold text-white mb-3">Recent Activity</h3>
        <p className="text-zinc-600 text-xs">No activity yet. Start solving problems or applying to jobs!</p>
      </div>
    );
  }
  return (
    <div className="rounded-xl p-4" style={{ background: '#161616', border: '1px solid #222' }}>
      <h3 className="text-sm font-semibold text-white mb-3">Recent Activity</h3>
      <div className="space-y-3">
        {activities.map((item, i) => {
          const { Icon, color } = ACTIVITY_ICONS[item.type] || { Icon: CheckCircle2, color: '#888' };
          return (
            <div key={i} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#1e1e1e' }}>
                <Icon size={13} style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-zinc-300 leading-snug">{item.text}</p>
                <p className="text-xs text-zinc-600 mt-0.5">{dayjs(item.time).fromNow()}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const UPCOMING_ICONS = {
  revision: { Icon: RefreshCw,    color: '#EAB308' },
  followup: { Icon: Mail,         color: '#fb923c' },
  review:   { Icon: ClipboardList, color: '#60a5fa' },
};

function UpcomingPanel({ items }) {
  const formatWhen = (date) => {
    const d = dayjs(date);
    const today = dayjs().startOf('day');
    const diff = d.startOf('day').diff(today, 'day');
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    return d.format('D MMM');
  };

  return (
    <div className="rounded-xl p-4" style={{ background: '#161616', border: '1px solid #222' }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">Upcoming</h3>
        <Link to="/revisions" className="text-xs text-yellow-400 hover:text-yellow-300 flex items-center gap-0.5">
          View all <ChevronRight size={11} />
        </Link>
      </div>
      {!items || items.length === 0 ? (
        <p className="text-zinc-600 text-xs">Nothing upcoming. You're all caught up!</p>
      ) : (
        <div className="space-y-2.5">
          {items.map((item, i) => {
            const { Icon, color } = UPCOMING_ICONS[item.type] || { Icon: CheckCircle2, color: '#888' };
            const when = formatWhen(item.date);
            return (
              <div key={i} className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ background: '#1e1e1e' }}>
                  <Icon size={11} style={{ color }} />
                </div>
                <span className="flex-1 text-xs text-zinc-300 truncate">{item.text}</span>
                <span className="text-xs shrink-0" style={{ color: when === 'Today' ? '#EAB308' : '#666' }}>{when}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FocusPanel({ focus }) {
  return (
    <div className="rounded-xl p-4" style={{ background: '#161616', border: '1px solid #222' }}>
      <h3 className="text-sm font-semibold text-white mb-3">Focus for This Week</h3>
      <div className="space-y-3">
        <div>
          <div className="text-xs text-zinc-500 mb-1">Weak Topic</div>
          <div className="text-sm font-semibold text-yellow-400">
            {focus?.weakTopic || <span className="text-zinc-600 font-normal">No data yet</span>}
          </div>
        </div>
        <div>
          <div className="text-xs text-zinc-500 mb-1">Improvement</div>
          <div className="text-xs text-zinc-300">
            {focus?.improvement || <span className="text-zinc-600">Complete a weekly review to set your focus</span>}
          </div>
        </div>
        <div className="flex justify-end">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#1e1e1e' }}>
            <Target size={16} className="text-yellow-400" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [today, setToday] = useState(null);
  const [progress, setProgress] = useState(null);
  const [overview, setOverview] = useState(null);
  const [activities, setActivities] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [focus, setFocus] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((s) => s.user);

  const displayName = user?.email
    ? user.email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    : 'there';

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/today'),
      api.get('/dashboard/progress'),
      api.get('/dashboard/today-overview'),
      api.get('/dashboard/activity'),
      api.get('/dashboard/upcoming'),
      api.get('/dashboard/focus'),
    ]).then(([t, p, ov, act, up, foc]) => {
      setToday(t.data.data || t.data);
      setProgress(p.data.data || p.data);
      setOverview(ov.data.data);
      setActivities(act.data.data || []);
      setUpcoming(up.data.data || []);
      setFocus(foc.data.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex h-full">
      <div className="flex-1 min-w-0 p-5 space-y-4 overflow-y-auto">
        {/* Greeting */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              {getGreeting()}, {displayName}! <Sparkles size={18} className="text-yellow-400" />
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">Keep building, one brick at a time.</p>
          </div>
          <div className="hidden md:flex items-center gap-3 px-4 py-2.5 rounded-xl shrink-0" style={{ background: '#1a1500', border: '1px solid #3f3000' }}>
            <TrendingUp size={15} className="text-yellow-400 shrink-0" />
            <span className="text-xs text-yellow-400 font-medium italic">"Discipline today, offers tomorrow."</span>
            <TrendingUp size={15} className="text-yellow-400 shrink-0" />
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatBigCard
            title="DSA Problems Solved"
            value={loading ? '—' : (progress?.totalProblemsSolved ?? 0)}
            delta={today?.problemsSolvedToday ?? 0}
            deltaLabel="today"
            icon={Code2}
          />
          <StatBigCard
            title="Applications Sent"
            value={loading ? '—' : (progress?.totalApplications ?? 0)}
            delta={today?.applicationsSentToday ?? 0}
            deltaLabel="today"
            icon={Briefcase}
          />
          <StatBigCard
            title="Revisions Due Today"
            value={loading ? '—' : (today?.revisionsDueToday ?? 0)}
            icon={Flame}
            linkTo="/revisions"
            linkLabel="View now"
          />
        </div>

        <TodayOverview overview={overview} />
        <RecentActivity activities={activities} />
      </div>

      {/* Right panel */}
      <div className="hidden xl:flex flex-col w-64 shrink-0 p-4 gap-4 overflow-y-auto" style={{ borderLeft: '1px solid #1e1e1e' }}>
        <UpcomingPanel items={upcoming} />
        <FocusPanel focus={focus} />
      </div>
    </div>
  );
}
