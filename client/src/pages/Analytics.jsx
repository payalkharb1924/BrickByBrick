import { useEffect } from 'react';
import { BarChart2, TrendingUp, Code2, Briefcase, Timer, CheckCircle, ClipboardList, Send, Users, MessageSquare, CalendarCheck } from 'lucide-react';
import useDsaStore from '../store/dsaStore';
import useJobStore from '../store/jobStore';

// ── shared primitives ─────────────────────────────────────────────────────────

function StatCard({ label, value, sub, accent = 'var(--accent)', icon: Icon }) {
  return (
    <div className="rounded-xl p-4 flex flex-col gap-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg-elevated)' }}>
        <Icon size={15} style={{ color: accent === 'var(--accent)' ? 'var(--accent)' : accent }} />
      </div>
      <div>
        <div className="text-2xl font-bold" style={{ color: accent === 'var(--accent)' ? 'var(--accent)' : accent }}>{value}</div>
        <div className="text-xs font-medium text-white mt-0.5">{label}</div>
        {sub && <div className="text-xs text-zinc-600 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

function HBar({ label, value, max, color, right }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
          <span className="text-zinc-300 font-medium">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          {right && <span className="text-zinc-500">{right}</span>}
          <span className="font-semibold w-8 text-right" style={{ color }}>{pct}%</span>
        </div>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, iconColor = 'var(--accent)', children }) {
  return (
    <div className="rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <div className="flex items-center gap-2 mb-5">
        <Icon size={13} style={{ color: iconColor === 'var(--accent)' ? 'var(--accent)' : iconColor }} />
        <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">{title}</h3>
      </div>
      {children}
    </div>
  );
}

// ── DSA section ───────────────────────────────────────────────────────────────

const DIFF_COLORS = { Easy: '#4ade80', Medium: 'var(--accent)', Hard: '#f87171' };

function DSASection({ entries }) {
  if (!entries.length) {
    return (
      <Section title="DSA Overview" icon={Code2}>
        <p className="text-zinc-600 text-sm">No DSA data yet. Start adding problems!</p>
      </Section>
    );
  }

  const solved = entries.filter(e => e.solved).length;
  const solveRate = Math.round((solved / entries.length) * 100);
  const diffCounts = { Easy: 0, Medium: 0, Hard: 0 };
  for (const e of entries) if (diffCounts[e.difficulty] !== undefined) diffCounts[e.difficulty]++;
  const timed = entries.filter(e => e.timeTaken > 0);
  const avgTime = timed.length ? Math.round(timed.reduce((s, e) => s + e.timeTaken, 0) / timed.length) : 0;

  // Top topics
  const topicMap = {};
  for (const e of entries) topicMap[e.topic] = (topicMap[e.topic] || 0) + 1;
  const topics = Object.entries(topicMap).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxTopic = topics[0]?.[1] || 1;

  // Top patterns
  const patternMap = {};
  for (const e of entries) if (e.pattern) patternMap[e.pattern] = (patternMap[e.pattern] || 0) + 1;
  const patterns = Object.entries(patternMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxPattern = patterns[0]?.[1] || 1;

  return (
    <>
      {/* DSA stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Problems Solved"  value={solved}                    sub={`of ${entries.length} logged`} icon={CheckCircle}  accent="var(--accent)" />
        <StatCard label="Solve Rate"       value={`${solveRate}%`}           sub="overall"                       icon={TrendingUp}   accent="#4ade80" />
        <StatCard label="Avg Time"         value={avgTime ? `${avgTime}m` : '—'} sub="per problem"              icon={Timer}        accent="#60a5fa" />
        <StatCard label="Total Logged"     value={entries.length}            sub="all time"                      icon={ClipboardList} accent="#c084fc" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Difficulty */}
        <Section title="Difficulty Breakdown" icon={Code2} iconColor="var(--accent)">
          <div className="space-y-4">
            {Object.entries(diffCounts).map(([d, v]) => (
              <HBar key={d} label={d} value={v} max={entries.length} color={DIFF_COLORS[d]} right={`${v} problems`} />
            ))}
          </div>
        </Section>

        {/* Top patterns */}
        <Section title="Top Patterns" icon={TrendingUp} iconColor="var(--accent)">
          {patterns.length === 0 ? (
            <p className="text-zinc-600 text-sm">No patterns logged yet.</p>
          ) : (
            <div className="space-y-3">
              {patterns.map(([p, c], i) => (
                <div key={p} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-600 w-4">#{i + 1}</span>
                      <span className="text-zinc-200 font-medium">{p}</span>
                    </div>
                    <span className="font-semibold" style={{ color: 'var(--accent)' }}>{c}x</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                    <div className="h-full rounded-full" style={{ width: `${(c / maxPattern) * 100}%`, background: 'var(--accent)' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Top topics — full width */}
        <Section title="Most Practiced Topics" icon={ClipboardList} iconColor="#60a5fa">
          {topics.length === 0 ? (
            <p className="text-zinc-600 text-sm">No topics yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
              {topics.map(([t, c]) => (
                <div key={t} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-200 font-medium truncate">{t}</span>
                    <span className="text-zinc-500 ml-2 shrink-0">{c}</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                    <div className="h-full rounded-full" style={{ width: `${(c / maxTopic) * 100}%`, background: '#60a5fa' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Solve rate by difficulty */}
        <Section title="Solve Rate by Difficulty" icon={TrendingUp} iconColor="#4ade80">
          <div className="space-y-4">
            {Object.entries(DIFF_COLORS).map(([d, color]) => {
              const total = entries.filter(e => e.difficulty === d).length;
              const s = entries.filter(e => e.difficulty === d && e.solved).length;
              const rate = total > 0 ? Math.round((s / total) * 100) : 0;
              return (
                <div key={d} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                      <span className="text-zinc-300 font-medium">{d}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-500">{s}/{total}</span>
                      <span className="font-semibold w-8 text-right" style={{ color }}>{rate}%</span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                    <div className="h-full rounded-full" style={{ width: `${rate}%`, background: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      </div>
    </>
  );
}

// ── Jobs section ──────────────────────────────────────────────────────────────

const STATUS_COLORS = {
  Applied:               'var(--accent)',
  'Referral Asked':      '#c084fc',
  'Interview Scheduled': '#4ade80',
  Rejected:              '#f87171',
  'No Response':         '#555',
};

function JobsSection({ applications }) {
  if (!applications.length) {
    return (
      <Section title="Job Overview" icon={Briefcase}>
        <p className="text-zinc-600 text-sm">No applications yet. Start applying!</p>
      </Section>
    );
  }

  const total = applications.length;
  const referrals = applications.filter(a => a.referral).length;
  const interviews = applications.filter(a => a.status === 'Interview Scheduled').length;
  const responded = applications.filter(a => ['Interview Scheduled', 'Rejected'].includes(a.status)).length;
  const responseRate = Math.round((responded / total) * 100);
  const referralRate = Math.round((referrals / total) * 100);

  const statusCounts = {};
  for (const a of applications) statusCounts[a.status] = (statusCounts[a.status] || 0) + 1;

  const sourceMap = {};
  for (const a of applications) sourceMap[a.source || 'Unknown'] = (sourceMap[a.source || 'Unknown'] || 0) + 1;
  const sources = Object.entries(sourceMap).sort((a, b) => b[1] - a[1]);
  const maxSource = sources[0]?.[1] || 1;

  return (
    <>
      {/* Job stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Applied"  value={total}              sub="all time"                    icon={Send}          accent="var(--accent)" />
        <StatCard label="With Referral"  value={referrals}          sub={`${referralRate}% of total`} icon={Users}         accent="#c084fc" />
        <StatCard label="Response Rate"  value={`${responseRate}%`} sub={`${responded} responded`}   icon={MessageSquare} accent="#4ade80" />
        <StatCard label="Interviews"     value={interviews}         sub="scheduled"                   icon={CalendarCheck} accent="#60a5fa" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Status breakdown */}
        <Section title="Application Status" icon={Briefcase} iconColor="var(--accent)">
          <div className="space-y-4">
            {Object.entries(statusCounts).sort((a, b) => b[1] - a[1]).map(([name, value]) => (
              <HBar key={name} label={name} value={value} max={total} color={STATUS_COLORS[name] || '#555'} right={`${value} apps`} />
            ))}
          </div>
        </Section>

        {/* Source breakdown */}
        <Section title="Application Sources" icon={Send} iconColor="#60a5fa">
          <div className="space-y-3">
            {sources.map(([src, cnt]) => (
              <div key={src} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300 font-medium">{src}</span>
                  <span className="text-zinc-500">{cnt}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                  <div className="h-full rounded-full" style={{ width: `${(cnt / maxSource) * 100}%`, background: '#60a5fa' }} />
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Conversion funnel */}
        <Section title="Conversion Funnel" icon={TrendingUp} iconColor="#4ade80">
          <div className="flex items-end gap-3 h-32">
            {[
              { label: 'Applied',    value: total,      color: 'var(--accent)' },
              { label: 'Responded',  value: responded,  color: '#60a5fa' },
              { label: 'Interviews', value: interviews, color: '#4ade80' },
              { label: 'Referrals',  value: referrals,  color: '#c084fc' },
            ].map(({ label, value, color }) => {
              const pct = total > 0 ? Math.round((value / total) * 100) : 0;
              return (
                <div key={label} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-xs font-bold" style={{ color }}>{value}</span>
                  <div className="w-full rounded-t-lg" style={{ height: `${Math.max(6, pct * 0.9)}px`, background: color, opacity: 0.85 }} />
                  <span className="text-xs text-zinc-500 text-center leading-tight">{label}</span>
                  <span className="text-xs text-zinc-600">{pct}%</span>
                </div>
              );
            })}
          </div>
        </Section>

        {/* Referral vs non-referral */}
        <Section title="Referral Impact" icon={Users} iconColor="#c084fc">
          <div className="space-y-4">
            <HBar label="With Referral"    value={referrals}        max={total} color="#c084fc" right={`${referrals} apps`} />
            <HBar label="Without Referral" value={total - referrals} max={total} color="#555"   right={`${total - referrals} apps`} />
          </div>
          <div className="mt-4 pt-4 grid grid-cols-2 gap-3" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="text-center">
              <div className="text-lg font-bold" style={{ color: '#c084fc' }}>{referralRate}%</div>
              <div className="text-xs text-zinc-500">Referral Rate</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold" style={{ color: '#4ade80' }}>{responseRate}%</div>
              <div className="text-xs text-zinc-500">Response Rate</div>
            </div>
          </div>
        </Section>
      </div>
    </>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function Analytics() {
  const { entries, fetchEntries } = useDsaStore();
  const { applications, fetchApplications } = useJobStore();

  useEffect(() => {
    fetchEntries({ sortBy: 'date', order: 'desc', limit: 500 });
    fetchApplications({ sortBy: 'date', order: 'desc', limit: 500 });
  }, []);

  return (
    <div className="p-5 space-y-6">
      <div className="flex items-center gap-2">
        <BarChart2 size={18} style={{ color: 'var(--accent)' }} />
        <h1 className="text-xl font-bold text-white">Analytics</h1>
      </div>

      {/* DSA section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Code2 size={14} style={{ color: 'var(--accent)' }} />
          <h2 className="text-sm font-semibold text-white">DSA Performance</h2>
        </div>
        <DSASection entries={entries} />
      </div>

      <div className="h-px" style={{ background: 'var(--bg-elevated)' }} />

      {/* Jobs section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Briefcase size={14} style={{ color: 'var(--accent)' }} />
          <h2 className="text-sm font-semibold text-white">Job Applications</h2>
        </div>
        <JobsSection applications={applications} />
      </div>
    </div>
  );
}
