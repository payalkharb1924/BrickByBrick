import { useState } from 'react';
import MistakeForm from '../components/mistakes/MistakeForm';
import MistakeList from '../components/mistakes/MistakeList';
import useMistakeStore from '../store/mistakeStore';

const TABS = ['Log Mistake', 'All Mistakes'];

export default function Mistakes() {
  const [activeTab, setActiveTab] = useState('Log Mistake');
  const { fetchMistakes } = useMistakeStore();

  const handleFormSuccess = () => {
    fetchMistakes();
    setActiveTab('All Mistakes');
  };

  return (
    <div className="space-y-6 text-white">
      <h1 className="text-xl font-bold text-white">Mistake Log</h1>

      <div className="flex gap-1 border-b" style={{ borderColor: '#1f1f1f' }}>
        {TABS.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${activeTab === tab ? 'border-yellow-400 text-yellow-400' : 'border-transparent text-zinc-500 hover:text-white'}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Log Mistake' && <MistakeForm onSuccess={handleFormSuccess} />}
      {activeTab === 'All Mistakes' && <MistakeList />}
    </div>
  );
}
