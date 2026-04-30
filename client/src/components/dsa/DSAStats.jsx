import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from 'recharts';
import { Timer, CheckCircle, ClipboardList, TrendingUp } from 'lucide-react';

const DIFF = {
  Easy:   { color: '#4ade80', bg: '#0f2a0f' },
  Medium: { color: '#EAB308', bg: '#1a1500' },
  Hard:   { color: '#f87171', bg: '#1a0808' },
};

function MiniStatCard({ label, value, sub }) {
  return (
    <div className="rounded-xl p-4 flex flex-col gap-1" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <div className="text-2xl font-bold text-yellow-400">{value}</div>
      <div className="text-xs font-medium text-white">{label}</div>
      {sub && <div className="text-xs text-zinc-600">{sub}</div>}
    </div>
  );
}

function DiffBar({ label, value, total, color, bg }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: color }} />
          <span className="text-zinc-300 font-medium">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-zinc-500">{value} problems</span>
          <span className="font-semibold w-8 text-right" style={{ color }}>{pct}%</span>
        </div>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function TopPatterns({ entries }) {
  const counts = {};
  for (const e of entries) if (e.pattern) counts[e.pattern] = (counts[e.pattern] || 0) + 1;
  const patterns = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const max = patterns[0]?.[1] || 1;

  if (patterns.length === 0) return <p className="text-zinc-600 text-sm">No patterns logged yet.</p>;

  return (
    <div className="space-y-3">
      {patterns.map(([pattern, count], i) => (
        <div key={pattern} className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-zinc-600 w-4">#{i + 1}</span>
              <span className="text-zinc-200 font-medium">{pattern}</span>
            </div>
            <span className="font-semibold text-yellow-400">{count}x</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
            <div className="h-full rounded-full" style={{ width: `${(count / max) * 100}%`, background: '#EAB308' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function TopTopics({ entries }) {
  const counts = {};
  for (const e of entries) if (e.topic) counts[e.topic] = (counts[e.topic] || 0) + 1;
  const topics = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const max = topics[0]?.[1] || 1;

  if (topics.length === 0) return <p className="text-zinc-600 text-sm">No topics logged yet.</p>;

  return (
    <div className="space-y-3">
      {topics.map(([topic, count]) => (
        <div key={topic} className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-200 font-medium truncate">{topic}</span>
            <span className="text-zinc-500 ml-2 shrink-0">{count} problems</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
            <div className="h-full rounded-full" style={{ width: `${(count / max) * 100}%`, background: '#60a5fa' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DSAStats({ entries }) {
  if (!entries || entries.length === 0) {
    return (
      <div className="rounded-xl p-8 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <ClipboardList size={32} className="text-zinc-700 mx-auto mb-3" />
        <p className="text-zinc-500 text-sm">No data yet. Start adding problems!</p>
      </div>
    );
  }

  const solved = entries.filter(e => e.solved);
  const solveRate = entries.length > 0 ? Math.round((solved.length / entries.length) * 100) : 0;
  const diffCounts = { Easy: 0, Medium: 0, Hard: 0 };
  for (const e of entries) if (diffCounts[e.difficulty] !== undefined) diffCounts[e.difficulty]++;
  const timed = entries.filter(e => e.timeTaken > 0);
  const avgTime = timed.length ? Math.round(timed.reduce((s, e) => s + e.timeTaken, 0) / timed.length) : 0;

  // Radial chart data
  const radialData = [
    { name: 'Hard',   value: entries.length > 0 ? Math.round((diffCounts.Hard / entries.length) * 100) : 0,   fill: '#f87171' },
    { name: 'Medium', value: entries.length > 0 ? Math.round((diffCounts.Medium / entries.length) * 100) : 0, fill: '#EAB308' },
    { name: 'Easy',   value: entries.length > 0 ? Math.round((diffCounts.Easy / entries.length) * 100) : 0,   fill: '#4ade80' },
  ];

  return (
    <div className="space-y-4">
      {/* Top stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MiniStatCard label="Problems Solved" value={solved.length} sub={`of ${entries.length} logged`} />
        <MiniStatCard label="Solve Rate" value={`${solveRate}%`} sub="overall" />
        <MiniStatCard label="Avg Time" value={avgTime ? `${avgTime}m` : '—'} sub="per problem" />
        <MiniStatCard label="Total Logged" value={entries.length} sub="all time" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Difficulty breakdown */}
        <div className="rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-5">Difficulty Breakdown</h3>
          <div className="flex items-center gap-6">
            {/* Radial chart */}
            <div className="shrink-0" style={{ width: 120, height: 120 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius="40%" outerRadius="100%" data={radialData} startAngle={90} endAngle={-270}>
                  <RadialBar dataKey="value" cornerRadius={4} background={{ fill: 'var(--bg-elevated)' }} />
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-input)', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(v, n) => [`${v}%`, n]}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            {/* Bars */}
            <div className="flex-1 space-y-3">
              {Object.entries(diffCounts).map(([d, v]) => (
                <DiffBar key={d} label={d} value={v} total={entries.length} color={DIFF[d].color} bg={DIFF[d].bg} />
              ))}
            </div>
          </div>
        </div>

        {/* Top patterns */}
        <div className="rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={13} className="text-yellow-400" />
            <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Top Patterns</h3>
          </div>
          <TopPatterns entries={entries} />
        </div>

        {/* Top topics */}
        <div className="rounded-xl p-5 lg:col-span-2" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2 mb-5">
            <ClipboardList size={13} className="text-blue-400" />
            <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Most Practiced Topics</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
            {(() => {
              const counts = {};
              for (const e of entries) if (e.topic) counts[e.topic] = (counts[e.topic] || 0) + 1;
              const topics = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8);
              const max = topics[0]?.[1] || 1;
              return topics.map(([topic, count]) => (
                <div key={topic} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-200 font-medium truncate">{topic}</span>
                    <span className="text-zinc-500 ml-2 shrink-0">{count}</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                    <div className="h-full rounded-full" style={{ width: `${(count / max) * 100}%`, background: '#60a5fa' }} />
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
