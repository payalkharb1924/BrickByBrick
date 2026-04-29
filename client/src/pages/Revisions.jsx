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
          <RefreshCw size={18} className="text-yellow-400" />
          <h1 className="text-xl font-bold text-white">Revision Due</h1>
        </div>
        <button onClick={fetchRevisions} className="text-xs text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg transition-colors" style={{ background: '#1e1e1e', border: '1px solid #2a2a2a' }}>
          Refresh
        </button>
      </div>

      <div className="rounded-xl p-4" style={{ background: '#161616', border: '1px solid #222' }}>
        <p className="text-xs text-zinc-500 mb-1">How it works</p>
        <p className="text-xs text-zinc-400">When you add a DSA problem, revision dates are auto-scheduled at <span className="text-yellow-400">+2 days</span> and <span className="text-yellow-400">+7 days</span>. Problems appear here when they're due.</p>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-2">
          {[0,1,2].map(i => <div key={i} className="h-14 rounded-xl" style={{ background: '#161616' }} />)}
        </div>
      ) : (
        <RevisionSection revisions={revisions} />
      )}
    </div>
  );
}
