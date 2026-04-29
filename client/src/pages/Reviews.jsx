import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { CalendarDays, AlertTriangle } from 'lucide-react';
import useReviewStore from '../store/reviewStore';
import ReviewForm from '../components/reviews/ReviewForm';
import ReviewList from '../components/reviews/ReviewList';

const TABS = ['New Review', 'Past Reviews'];

function isSunday() {
  return dayjs().day() === 0;
}

function hasReviewThisWeek(reviews) {
  const weekStart = dayjs().startOf('week');
  return reviews.some((r) => dayjs(r.weekStartDate).isSame(weekStart, 'day') || dayjs(r.weekStartDate).isAfter(weekStart));
}

export default function Reviews() {
  const [activeTab, setActiveTab] = useState('New Review');
  const { reviews, loading, error, fetchReviews } = useReviewStore();

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleFormSuccess = () => fetchReviews();

  const sunday = isSunday();
  const skipped = reviews.length > 0 && !hasReviewThisWeek(reviews);

  return (
    <div className="space-y-6 p-5">
      <h1 className="text-xl font-bold text-white">Weekly Reviews</h1>

      {sunday && !hasReviewThisWeek(reviews) && (
        <div className="rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2" style={{ background: '#0f1a2a', border: '1px solid #1e3a6e', color: '#60a5fa' }}>
          <CalendarDays size={15} className="shrink-0" />
          It's Sunday — time for your weekly review. Reflect, plan, and level up.
        </div>
      )}

      {skipped && (
        <div className="rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2" style={{ background: '#1a0808', border: '1px solid #3f1515', color: '#f87171' }}>
          <AlertTriangle size={15} className="shrink-0" />
          No review = no improvement. You skipped last week's review. Don't let the habit slip.
        </div>
      )}

      <div className="flex gap-1 border-b" style={{ borderColor: '#1f1f1f' }}>
        {TABS.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${activeTab === tab ? 'border-yellow-400 text-yellow-400' : 'border-transparent text-zinc-500 hover:text-white'}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'New Review' && <ReviewForm onSuccess={handleFormSuccess} />}
      {activeTab === 'Past Reviews' && <ReviewList reviews={reviews} loading={loading} error={error} onRetry={fetchReviews} />}
    </div>
  );
}
