import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Monitor, Send, RefreshCw, Flame, CheckCircle, Briefcase, AlertOctagon, AlertTriangle, Mail, Moon, CircleCheck } from 'lucide-react';
import api from '../api/client';
import StatCard from '../components/StatCard';

function Skeleton() {
  return (
    <div className="animate-pulse space-y-8">
      {[0,1,2].map(s => (
        <div key={s}>
          <div className="h-4 w-32 rounded mb-4" style={{ background: '#1a1a1a' }} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[0,1,2].map(c => <div key={c} className="rounded-xl h-28" style={{ background: '#161616', border: '1px solid #222' }} />)}
          </div>
        </div>
      ))}
    </div>
  );
}

function Alert({ color, Icon, children }) {
  const colors = {
    red:    { bg: '#1a0808', border: '#3f1515', text: '#f87171' },
    yellow: { bg: '#1a1500', border: '#3f3000', text: '#EAB308' },
    orange: { bg: '#1a0f00', border: '#3f2000', text: '#fb923c' },
    green:  { bg: '#081a0a', border: '#153f18', text: '#4ade80' },
  };
  const c = colors[color];
  return (
    <div className="rounded-xl px-4 py-3 flex items-center gap-3 text-sm" style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}>
      <Icon size={15} className="shrink-0" />
      {children}
    </div>
  );
}

export default function Dashboard() {
  const [today, setToday] = useState(null);
  const [progress, setProgress] = useState(null);
  const [alerts, setAlerts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([api.get('/dashboard/today'), api.get('/dashboard/progress'), api.get('/dashboard/alerts')])
      .then(([t, p, a]) => {
        setToday(t.data.data || t.data);
        setProgress(p.data.data || p.data);
        setAlerts(a.data.data || a.data);
      })
      .catch(() => setError('Failed to load dashboard data.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Skeleton />;
  if (error) return <Alert color="red" Icon={AlertOctagon}>{error}</Alert>;

  const { pendingRevisions = 0, followUpsDue = 0, noActivityWarning = false } = alerts || {};

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-4">Today</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="Problems Solved Today" value={today?.problemsSolvedToday ?? 0} accent="text-yellow-400" icon={Monitor} />
          <StatCard title="Applications Sent Today" value={today?.applicationsSentToday ?? 0} accent="text-yellow-400" icon={Send} />
          <Link to="/dsa" className="block">
            <StatCard title="Revisions Due Today" value={today?.revisionsDueToday ?? 0} accent="text-yellow-400" icon={RefreshCw} />
          </Link>
        </div>
      </section>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-4">Progress</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="Weekly Streak" value={progress?.weeklyStreak ?? 0} label="weeks" accent="text-yellow-400" icon={Flame} />
          <StatCard title="Total Problems Solved" value={progress?.totalProblemsSolved ?? 0} accent="text-yellow-400" icon={CheckCircle} />
          <StatCard title="Total Applications" value={progress?.totalApplications ?? 0} accent="text-yellow-400" icon={Briefcase} />
        </div>
      </section>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-4">Alerts</h2>
        <div className="space-y-2">
          {pendingRevisions > 5 && <Alert color="red" Icon={AlertOctagon}>You are skipping revision! {pendingRevisions} overdue</Alert>}
          {pendingRevisions > 0 && pendingRevisions <= 5 && <Alert color="yellow" Icon={AlertTriangle}>{pendingRevisions} revision(s) pending — don't fall behind!</Alert>}
          {followUpsDue > 0 && <Alert color="orange" Icon={Mail}>{followUpsDue} follow-up(s) due today</Alert>}
          {noActivityWarning && <Alert color="red" Icon={Moon}>No activity in 3 days — get back on track!</Alert>}
          {pendingRevisions === 0 && followUpsDue === 0 && !noActivityWarning && (
            <Alert color="green" Icon={CircleCheck}>All clear — keep grinding!</Alert>
          )}
        </div>
      </section>
    </div>
  );
}
