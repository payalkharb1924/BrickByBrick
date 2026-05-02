import { useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import useDsaStore from '../store/dsaStore';
import RevisionSection from '../components/dsa/RevisionSection';

export default function Revisions() {
  const { revisions, loading, fetchRevisions } = useDsaStore();

  useEffect(() => { fetchRevisions(); }, []);

  return (
    <div className="p-5 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RefreshCw size={18} style={{ color: 'var(--accent)' }} />
          <h1 className="text-xl font-bold text-white">Revision Due</h1>
        </div>
        <button onClick={fetchRevisions} className="text-xs text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg transition-colors" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-input)' }}>
          Refresh
        </button>
      </div>

      <div className="rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <p className="text-xs text-zinc-500 mb-1">How it works</p>
        <p className="text-xs text-zinc-400">When you add a DSA problem, revision dates are auto-scheduled at <span style={{ color: 'var(--accent)' }}>+2 days</span> and <span style={{ color: 'var(--accent)' }}>+7 days</span>. Problems appear here when they're due.</p>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-2">
          {[0,1,2].map(i => <div key={i} className="h-14 rounded-xl" style={{ background: 'var(--bg-card)' }} />)}
        </div>
      ) : (
        <RevisionSection revisions={revisions} />
      )}
    </div>
  );
}
