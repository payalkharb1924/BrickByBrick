import { useEffect, useState } from 'react';
import { AlertOctagon } from 'lucide-react';
import useDsaStore from '../store/dsaStore';
import DSAForm from '../components/dsa/DSAForm';
import DSATable from '../components/dsa/DSATable';
import RevisionSection from '../components/dsa/RevisionSection';
import DSAStats from '../components/dsa/DSAStats';

const TABS = ['Add Problem', 'Problems', 'Revisions', 'Stats'];

export default function DSA() {
  const [activeTab, setActiveTab] = useState('Add Problem');
  const { entries, revisions, error, fetchEntries, fetchRevisions } = useDsaStore();

  useEffect(() => {
    fetchEntries({ sortBy: 'date', order: 'desc' });
    fetchRevisions();
  }, []);

  const handleFormSuccess = () => {
    fetchEntries({ sortBy: 'date', order: 'desc' });
    fetchRevisions();
  };

  return (
    <div className="space-y-6 p-5">
      <h1 className="text-xl font-bold text-white">DSA Tracker</h1>

      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-300 rounded-xl p-4 flex items-center justify-between gap-3">
          <span className="text-sm">{error}</span>
          <button onClick={() => { fetchEntries({ sortBy: 'date', order: 'desc' }); fetchRevisions(); }}
            className="text-xs bg-red-700 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg transition-colors shrink-0">Retry</button>
        </div>
      )}

      {revisions.length > 5 && (
        <div className="rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2" style={{ background: '#1a0808', border: '1px solid #3f1515', color: '#f87171' }}>
          <AlertOctagon size={15} className="shrink-0" />
          You are skipping revision! {revisions.length} problems overdue. Don't let them pile up.
        </div>
      )}

      <div className="flex gap-1 border-b" style={{ borderColor: 'var(--border-sub)' }}>
        {TABS.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${activeTab === tab ? 'border-transparent -mb-px' : 'border-transparent text-zinc-500 hover:text-white'}`}
            style={activeTab === tab ? { borderBottomColor: 'var(--accent)', color: 'var(--accent)' } : {}}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Add Problem' && <DSAForm onSuccess={handleFormSuccess} />}
      {activeTab === 'Problems' && <DSATable />}
      {activeTab === 'Revisions' && <RevisionSection revisions={revisions} />}
      {activeTab === 'Stats' && <DSAStats entries={entries} />}
    </div>
  );
}
