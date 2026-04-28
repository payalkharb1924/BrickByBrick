import dayjs from 'dayjs';
import { Target } from 'lucide-react';

export default function ReviewList({ reviews, loading, error, onRetry }) {
  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl p-5 space-y-3" style={{ background: '#161616', border: '1px solid #222' }}>
            <div className="h-4 rounded w-40" style={{ background: '#1e1e1e' }} />
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {Array.from({ length: 6 }).map((__, j) => <div key={j} className="rounded-lg h-14" style={{ background: '#1e1e1e' }} />)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl p-4 flex items-center justify-between gap-3 text-sm" style={{ background: '#1a0808', border: '1px solid #3f1515', color: '#f87171' }}>
        <span>{error}</span>
        {onRetry && <button onClick={onRetry} className="text-xs px-3 py-1.5 rounded-lg shrink-0 text-black font-medium" style={{ background: '#EAB308' }}>Retry</button>}
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="rounded-xl p-6" style={{ background: '#161616', border: '1px solid #222' }}>
        <p className="text-zinc-500 text-sm">No reviews yet. Complete your first weekly review!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reviews.map((r) => (
        <div key={r._id} className="rounded-xl p-5 space-y-3 transition-all duration-200" style={{ background: '#161616', border: '1px solid #222' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#2a2a2a'}
          onMouseLeave={e => e.currentTarget.style.borderColor = '#222'}>
          <h3 className="text-white font-semibold text-sm">
            Week of <span style={{ color: '#EAB308' }}>{dayjs(r.weekStartDate).format('MMM D, YYYY')}</span>
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
            {[['Problems', r.totalProblemsSolved],['Medium', r.mediumCount],['Hard', r.hardCount],['Applied', r.applicationsSent],['Referrals', r.referralsSent],['Responses', r.responsesReceived]].map(([label, val]) => (
              <div key={label} className="rounded-lg p-2" style={{ background: '#1e1e1e' }}>
                <div className="text-white font-bold text-lg">{val ?? 0}</div>
                <div className="text-zinc-500 text-xs">{label}</div>
              </div>
            ))}
          </div>
          {r.weakTopics?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-zinc-500">Weak topics:</span>
              {r.weakTopics.map((t) => (
                <span key={t} className="text-xs px-2 py-0.5 rounded" style={{ background: '#1a0808', color: '#f87171', border: '1px solid #3f1515' }}>{t}</span>
              ))}
            </div>
          )}
          {r.nextWeekFocus && (
            <p className="text-zinc-400 text-xs flex items-center gap-1.5"><Target size={12} style={{ color: '#EAB308' }} className="shrink-0" /> {r.nextWeekFocus}</p>
          )}
          {r.insights && <p className="text-zinc-600 text-xs whitespace-pre-line">{r.insights}</p>}
        </div>
      ))}
    </div>
  );
}
