import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { AlertTriangle, Repeat2 } from 'lucide-react';
import useMistakeStore from '../../store/mistakeStore';

const MISTAKE_TYPES = [
  'Wrong Approach', 'Off-by-one Error', 'Edge Case Missed',
  'Time Complexity', 'Space Complexity', 'Syntax Error', 'Logic Error', 'Other',
];

export default function MistakeList() {
  const { mistakes, loading, error, fetchMistakes, deleteMistake } = useMistakeStore();
  const [filter, setFilter] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchMistakes(filter ? { mistakeType: filter } : {});
  }, [filter]);

  // Count occurrences per mistakeType to detect repeated mistakes
  const typeCounts = mistakes.reduce((acc, m) => {
    acc[m.mistakeType] = (acc[m.mistakeType] || 0) + 1;
    return acc;
  }, {});

  const repeatedTypes = Object.entries(typeCounts)
    .filter(([, count]) => count >= 3)
    .map(([type]) => type);

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-3">
        <div>
          <label className="block text-xs text-zinc-500 mb-1">Filter by Type</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}
            className="rounded-lg px-3 py-2 text-white text-sm outline-none"
            style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
            <option value="">All Types</option>
            {MISTAKE_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <span className="text-zinc-600 text-sm pb-2">{mistakes.length} mistake{mistakes.length !== 1 ? 's' : ''}</span>
      </div>

      {repeatedTypes.length > 0 && (
        <div className="rounded-xl px-4 py-3 text-sm space-y-1" style={{ background: '#1a0f00', border: '1px solid #3f2000', color: '#fb923c' }}>
          <p className="font-semibold flex items-center gap-2"><AlertTriangle size={14} /> Repeated mistake pattern detected</p>
          <p>You keep making the same mistakes: <span className="font-medium">{repeatedTypes.join(', ')}</span>. Focus on these areas to improve.</p>
        </div>
      )}

      {error && (
        <div className="rounded-xl p-4 flex items-center justify-between gap-3 text-sm" style={{ background: '#1a0808', border: '1px solid #3f1515', color: '#f87171' }}>
          <span>{error}</span>
          <button onClick={() => fetchMistakes(filter ? { mistakeType: filter } : {})}
            className="text-xs px-3 py-1.5 rounded-lg shrink-0 text-black font-medium" style={{ background: '#EAB308' }}>Retry</button>
        </div>
      )}

      {loading ? (
        <div className="space-y-2 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl p-4" style={{ background: '#161616', border: '1px solid #222' }}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <div className="h-4 rounded w-32" style={{ background: '#1e1e1e' }} />
                    <div className="h-4 rounded w-24" style={{ background: '#1e1e1e' }} />
                  </div>
                  <div className="h-3 rounded w-3/4" style={{ background: '#1e1e1e' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : mistakes.length === 0 ? (
        <div className="text-zinc-600 text-sm py-10 text-center">No mistakes logged yet.</div>
      ) : (
        <div className="space-y-2">
          {mistakes.map((m) => {
            const isRepeated = typeCounts[m.mistakeType] >= 3;
            return (
              <div key={m._id} className="rounded-xl p-4 transition-all duration-200"
                style={{ background: '#161616', border: `1px solid ${isRepeated ? '#3f2000' : '#222'}` }}
                onMouseEnter={e => e.currentTarget.style.borderColor = isRepeated ? '#5a3000' : '#2a2a2a'}
                onMouseLeave={e => e.currentTarget.style.borderColor = isRepeated ? '#3f2000' : '#222'}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white font-medium text-sm">{m.problemName}</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
                        style={isRepeated ? { background: '#1a0f00', color: '#fb923c', border: '1px solid #3f2000' } : { background: '#1e1e1e', color: '#888' }}>
                        {isRepeated && <Repeat2 size={10} />}{m.mistakeType}
                      </span>
                      <span className="text-zinc-600 text-xs">{dayjs(m.createdAt).format('MMM D, YYYY')}</span>
                    </div>
                    {m.lesson && <p className="text-zinc-400 text-sm mt-1.5">{m.lesson}</p>}
                  </div>
                  <button onClick={() => setDeleteId(m._id)} className="text-xs transition-colors shrink-0" style={{ color: '#f87171' }}>Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="rounded-xl p-6 w-80 space-y-4 modal-enter" style={{ background: '#161616', border: '1px solid #2a2a2a' }}>
            <p className="text-white text-sm">Delete this mistake log?</p>
            <div className="flex gap-3">
              <button onClick={async () => { await deleteMistake(deleteId); setDeleteId(null); }}
                className="flex-1 text-white text-sm py-2 rounded-lg" style={{ background: '#3f1515', border: '1px solid #5a1f1f' }}>Delete</button>
              <button onClick={() => setDeleteId(null)}
                className="flex-1 text-zinc-300 text-sm py-2 rounded-lg" style={{ background: '#1e1e1e', border: '1px solid #2a2a2a' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
