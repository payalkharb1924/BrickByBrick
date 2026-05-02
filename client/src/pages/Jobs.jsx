import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import useJobStore from '../store/jobStore';
import JobForm from '../components/jobs/JobForm';
import JobTable from '../components/jobs/JobTable';
import FollowUpSection from '../components/jobs/FollowUpSection';
import JobStats from '../components/jobs/JobStats';
import { useState } from 'react';

const TABS = ['Add Application', 'Applications', 'Follow Ups', 'Stats'];

function repeatedWithoutReferral(applications) {
  const companyCounts = {};
  for (const app of applications) {
    if (!app.referral) {
      companyCounts[app.company] = (companyCounts[app.company] || 0) + 1;
    }
  }
  return Object.entries(companyCounts)
    .filter(([, count]) => count > 1)
    .map(([company]) => company);
}

export default function Jobs() {
  const [activeTab, setActiveTab] = useState('Add Application');
  const { applications, followUps, error, fetchApplications, fetchFollowUps } = useJobStore();

  useEffect(() => {
    fetchApplications({ sortBy: 'date', order: 'desc' });
    fetchFollowUps();
  }, []);

  const handleFormSuccess = () => {
    fetchApplications({ sortBy: 'date', order: 'desc' });
    fetchFollowUps();
  };

  const repeatedCompanies = repeatedWithoutReferral(applications);

  return (
    <div className="space-y-6 p-5">
      <h1 className="text-xl font-bold text-white">Job Applications</h1>

      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-300 rounded-xl p-4 flex items-center justify-between gap-3">
          <span className="text-sm">{error}</span>
          <button onClick={() => { fetchApplications({ sortBy: 'date', order: 'desc' }); fetchFollowUps(); }}
            className="text-xs bg-red-700 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg transition-colors shrink-0">Retry</button>
        </div>
      )}

      {repeatedCompanies.length > 0 && (
        <div className="rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--accent)' }}>
          <AlertTriangle size={15} className="shrink-0" />
          You've applied to <strong className="mx-1">{repeatedCompanies.join(', ')}</strong> multiple times without a referral.
        </div>
      )}

      <div className="flex gap-1 border-b" style={{ borderColor: 'var(--border-sub)' }}>
        {TABS.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${activeTab === tab ? 'border-b-2 text-white' : 'border-transparent text-zinc-500 hover:text-white'}`}
            style={activeTab === tab ? { borderColor: 'var(--accent)', color: 'var(--accent)' } : {}}>
            {tab}
            {tab === 'Follow Ups' && followUps.length > 0 && (
              <span className="ml-1.5 text-white text-xs rounded-full px-1.5 py-0.5" style={{ background: 'var(--accent)' }}>{followUps.length}</span>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'Add Application' && <JobForm onSuccess={handleFormSuccess} />}
      {activeTab === 'Applications' && <JobTable />}
      {activeTab === 'Follow Ups' && <FollowUpSection followUps={followUps} />}
      {activeTab === 'Stats' && <JobStats applications={applications} />}
    </div>
  );
}
