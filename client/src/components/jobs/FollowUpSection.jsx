import dayjs from 'dayjs';
import { PartyPopper } from 'lucide-react';

const STATUS_BADGE = {
  Applied:              { background: '#0a1020', color: '#60a5fa', border: '1px solid #1e3a6e' },
  'Referral Asked':     { background: '#150a20', color: '#c084fc', border: '1px solid #3b1a6e' },
  'Interview Scheduled':{ background: '#0a1a0a', color: '#4ade80', border: '1px solid #1a4a1a' },
  Rejected:             { background: '#1a0808', color: '#f87171', border: '1px solid #3f1515' },
  'No Response':        { background: '#1a1a1a', color: '#888',    border: '1px solid #2a2a2a' },
};

export default function FollowUpSection({ followUps }) {
  if (!followUps || followUps.length === 0) {
    return (
      <div className="rounded-xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <h2 className="text-sm font-semibold text-white mb-3">Follow Up Today</h2>
        <p className="text-zinc-500 text-sm flex items-center gap-1.5"><PartyPopper size={14} style={{ color: 'var(--accent)' }} /> No follow-ups due today.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <h2 className="text-sm font-semibold text-white mb-4">Follow Up Today <span style={{ color: 'var(--accent)' }}>({followUps.length})</span></h2>
      <div className="space-y-2">
        {followUps.map((app) => {
          const followUpDate = app.followUpDate ? dayjs(app.followUpDate) : null;
          const today = dayjs().startOf('day');
          const isOverdue = followUpDate && followUpDate.isBefore(today);
          const daysOverdue = isOverdue ? today.diff(followUpDate, 'day') : 0;
          const rowStyle = isOverdue
            ? { background: '#1a0808', border: '1px solid #3f1515' }
            : { background: '#1a1500', border: '1px solid #3f3000' };
          return (
            <div key={app._id} className="flex items-center justify-between rounded-lg px-4 py-3 transition-all duration-150" style={rowStyle}>
              <div className="space-y-0.5">
                <p className="text-white text-sm font-medium">{app.company}</p>
                <p className="text-zinc-500 text-xs">{app.role}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded text-xs font-medium" style={STATUS_BADGE[app.status] || { background: '#1e1e1e', color: '#888' }}>{app.status}</span>
                <span className="text-xs font-medium" style={{ color: isOverdue ? '#f87171' : 'var(--accent)' }}>
                  {isOverdue ? `${daysOverdue}d overdue` : 'Due today'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
