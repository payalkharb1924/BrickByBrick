import dayjs from 'dayjs';
import { PartyPopper } from 'lucide-react';

const DIFFICULTY_BADGE = {
  Easy:   { background: '#0f2a0f', color: '#4ade80', border: '1px solid #1a4a1a' },
  Medium: { background: '#1a1500', color: '#EAB308', border: '1px solid #3f3000' },
  Hard:   { background: '#1a0808', color: '#f87171', border: '1px solid #3f1515' },
};

function overdueLabel(revisionDates) {
  const today = dayjs().startOf('day');
  const overdueDates = (revisionDates || []).map((d) => dayjs(d)).filter((d) => d.isBefore(today) || d.isSame(today, 'day'));
  if (!overdueDates.length) return null;
  const earliest = overdueDates.reduce((a, b) => (a.isBefore(b) ? a : b));
  const diff = today.diff(earliest, 'day');
  if (diff === 0) return { label: 'Due today', isToday: true };
  return { label: `${diff} day${diff > 1 ? 's' : ''} overdue`, isToday: false };
}

export default function RevisionSection({ revisions }) {
  if (!revisions || revisions.length === 0) {
    return (
      <div className="rounded-xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <h2 className="text-sm font-semibold text-white mb-3">Revisions Due</h2>
        <p className="text-zinc-500 text-sm flex items-center gap-1.5"><PartyPopper size={14} style={{ color: 'var(--accent)' }} /> No revisions due. Keep it up!</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <h2 className="text-sm font-semibold text-white mb-4">Revisions Due <span style={{ color: 'var(--accent)' }}>({revisions.length})</span></h2>
      <div className="space-y-2">
        {revisions.map((entry) => {
          const info = overdueLabel(entry.revisionDates);
          const isToday = info?.isToday;
          const rowStyle = isToday
            ? { background: '#1a1500', border: '1px solid #3f3000' }
            : { background: '#1a0808', border: '1px solid #3f1515' };
          return (
            <div key={entry._id} className="flex items-center justify-between rounded-lg px-4 py-3 transition-all duration-150" style={rowStyle}>
              <div className="space-y-0.5">
                <p className="text-white text-sm font-medium">{entry.problemName}</p>
                <p className="text-zinc-500 text-xs">{entry.topic}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded text-xs font-medium" style={DIFFICULTY_BADGE[entry.difficulty] || { background: '#1e1e1e', color: '#888' }}>{entry.difficulty}</span>
                {info && <span className="text-xs font-medium" style={{ color: isToday ? '#EAB308' : '#f87171' }}>{info.label}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
