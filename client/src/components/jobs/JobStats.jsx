import { Send, Users, MessageSquare, CalendarCheck, TrendingUp, XCircle } from 'lucide-react';

const STATUS_CONFIG = {
  Applied:               { color: '#EAB308', bg: '#1a1500' },
  'Referral Asked':      { color: '#c084fc', bg: '#150a20' },
  'Interview Scheduled': { color: '#4ade80', bg: '#0a1a0a' },
  Rejected:              { color: '#f87171', bg: '#1a0808' },
  'No Response':         { color: '#555',    bg: '#1a1a1a' },
};

function MiniStatCard({ label, value, sub, icon: Icon, accent = '#EAB308' }) {
  return (
    <div className="rounded-xl p-4 flex flex-col gap-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg-elevated)' }}>
        <Icon size={15} style={{ color: accent }} />
      </div>
      <div>
        <div className="text-2xl font-bold" style={{ color: accent }}>{value}</div>
        <div className="text-xs font-medium text-white mt-0.5">{label}</div>
        {sub && <div className="text-xs text-zinc-600 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

function StatusBar({ name, value, total }) {
  const cfg = STATUS_CONFIG[name] || { color: '#555', bg: '#1a1a1a' };
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: cfg.color }} />
          <span className="text-zinc-300 font-medium">{name}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-zinc-500">{value} apps</span>
          <span className="font-semibold w-8 text-right" style={{ color: cfg.color }}>{pct}%</span>
        </div>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: cfg.color }} />
      </div>
    </div>
  );
}

function SourceBreakdown({ applications }) {
  const counts = {};
  for (const a of applications) counts[a.source] = (counts[a.source] || 0) + 1;
  const sources = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const max = sources[0]?.[1] || 1;
  if (sources.length === 0) return null;
  return (
    <div className="space-y-3">
      {sources.map(([src, cnt]) => (
        <div key={src} className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-300 font-medium">{src || 'Unknown'}</span>
            <span className="text-zinc-500">{cnt}</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
            <div className="h-full rounded-full" style={{ width: `${(cnt / max) * 100}%`, background: '#60a5fa' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function JobStats({ applications }) {
  if (!applications || applications.length === 0) {
    return (
      <div className="rounded-xl p-8 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <Send size={32} className="text-zinc-700 mx-auto mb-3" />
        <p className="text-zinc-500 text-sm">No applications yet. Start applying!</p>
      </div>
    );
  }

  const total = applications.length;
  const referralCount = applications.filter(a => a.referral).length;
  const interviews = applications.filter(a => a.status === 'Interview Scheduled').length;
  const rejected = applications.filter(a => a.status === 'Rejected').length;
  const responded = applications.filter(a => ['Interview Scheduled', 'Rejected'].includes(a.status)).length;
  const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0;
  const referralRate = total > 0 ? Math.round((referralCount / total) * 100) : 0;

  const statusCounts = {};
  for (const app of applications) statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;

  return (
    <div className="space-y-4">
      {/* Top stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MiniStatCard label="Total Applied"  value={total}              sub="all time"           icon={Send}          accent="#EAB308" />
        <MiniStatCard label="With Referral"  value={referralCount}      sub={`${referralRate}% of total`} icon={Users} accent="#c084fc" />
        <MiniStatCard label="Response Rate"  value={`${responseRate}%`} sub={`${responded} responded`}   icon={MessageSquare} accent="#4ade80" />
        <MiniStatCard label="Interviews"     value={interviews}         sub={`${rejected} rejected`}      icon={CalendarCheck} accent="#60a5fa" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Status breakdown */}
        <div className="rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={13} className="text-yellow-400" />
            <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Application Status</h3>
          </div>
          <div className="space-y-4">
            {Object.entries(statusCounts).sort((a, b) => b[1] - a[1]).map(([name, value]) => (
              <StatusBar key={name} name={name} value={value} total={total} />
            ))}
          </div>
        </div>

        {/* Source breakdown */}
        <div className="rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2 mb-5">
            <Send size={13} className="text-blue-400" />
            <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Application Sources</h3>
          </div>
          <SourceBreakdown applications={applications} />
        </div>

        {/* Funnel summary */}
        <div className="rounded-xl p-5 lg:col-span-2" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2 mb-5">
            <XCircle size={13} className="text-zinc-500" />
            <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Conversion Funnel</h3>
          </div>
          <div className="flex items-end gap-2">
            {[
              { label: 'Applied',    value: total,          color: '#EAB308' },
              { label: 'Responded',  value: responded,      color: '#60a5fa' },
              { label: 'Interviews', value: interviews,     color: '#4ade80' },
              { label: 'Referrals',  value: referralCount,  color: '#c084fc' },
            ].map(({ label, value, color }) => {
              const pct = total > 0 ? Math.round((value / total) * 100) : 0;
              const barH = Math.max(8, pct);
              return (
                <div key={label} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-xs font-bold" style={{ color }}>{value}</span>
                  <div className="w-full rounded-t-lg transition-all duration-500" style={{ height: `${barH * 1.2}px`, background: color, opacity: 0.85 }} />
                  <span className="text-xs text-zinc-500 text-center leading-tight">{label}</span>
                  <span className="text-xs text-zinc-600">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
