import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Timer, CheckCircle, ClipboardList } from 'lucide-react';
import StatCard from '../StatCard';

const DIFFICULTY_COLORS = { Easy: '#4ade80', Medium: '#EAB308', Hard: '#f87171' };

function topPatterns(entries, n = 3) {
  const counts = {};
  for (const e of entries) { if (e.pattern) counts[e.pattern] = (counts[e.pattern] || 0) + 1; }
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, n);
}

export default function DSAStats({ entries }) {
  if (!entries || entries.length === 0) {
    return (
      <div className="rounded-xl p-6" style={{ background: '#161616', border: '1px solid #222' }}>
        <h2 className="text-sm font-semibold text-white mb-2">Stats</h2>
        <p className="text-zinc-500 text-sm">No data yet. Start adding problems!</p>
      </div>
    );
  }

  const solved = entries.filter(e => e.solved);
  const diffCounts = { Easy: 0, Medium: 0, Hard: 0 };
  for (const e of entries) { if (diffCounts[e.difficulty] !== undefined) diffCounts[e.difficulty]++; }
  const pieData = Object.entries(diffCounts).map(([name, value]) => ({ name, value }));
  const timed = entries.filter(e => e.timeTaken > 0);
  const avgTime = timed.length ? Math.round(timed.reduce((sum, e) => sum + e.timeTaken, 0) / timed.length) : 0;
  const patterns = topPatterns(entries);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Problems Solved"    value={solved.length}              accent="text-yellow-400" icon={CheckCircle} />
        <StatCard title="Avg Time / Problem" value={avgTime ? `${avgTime}m` : '—'} accent="text-yellow-400" icon={Timer} />
        <StatCard title="Total Logged"       value={entries.length}             accent="text-yellow-400" icon={ClipboardList} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="rounded-xl p-5" style={{ background: '#161616', border: '1px solid #222' }}>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-4">Difficulty Distribution</h3>
          <PieChart width={260} height={200}>
            <Pie data={pieData} cx={120} cy={90} outerRadius={75} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
              {pieData.map(entry => <Cell key={entry.name} fill={DIFFICULTY_COLORS[entry.name]} />)}
            </Pie>
            <Tooltip contentStyle={{ background: '#161616', border: '1px solid #2a2a2a', color: '#fff', borderRadius: '8px' }} />
            <Legend wrapperStyle={{ color: '#888', fontSize: '12px' }} />
          </PieChart>
        </div>
        <div className="rounded-xl p-5" style={{ background: '#161616', border: '1px solid #222' }}>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-4">Top Patterns</h3>
          {patterns.length === 0 ? (
            <p className="text-zinc-600 text-sm">No patterns logged yet.</p>
          ) : (
            <div className="space-y-3">
              {patterns.map(([pattern, count], i) => (
                <div key={pattern} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-600 text-xs w-4">#{i + 1}</span>
                    <span className="text-white text-sm">{pattern}</span>
                  </div>
                  <span className="text-sm font-semibold" style={{ color: '#EAB308' }}>{count}x</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
