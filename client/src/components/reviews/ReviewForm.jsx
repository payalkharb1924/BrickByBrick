import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { Zap } from 'lucide-react';
import useReviewStore from '../../store/reviewStore';

const getMostRecentSunday = () => {
  const today = dayjs();
  return today.subtract(today.day(), 'day').format('YYYY-MM-DD');
};

const defaultForm = () => ({
  weekStartDate: getMostRecentSunday(),
  totalProblemsSolved: '', mediumCount: '', hardCount: '',
  applicationsSent: '', referralsSent: '', responsesReceived: '',
  whatWentWell: '', whatWasHard: '', keyLesson: '',
  weakTopics: '', nextWeekFocus: '', insights: '',
});

const inputStyle = { background: '#1a1a1a', border: '1px solid #2a2a2a' };
const focusIn  = e => e.target.style.borderColor = '#EAB308';
const focusOut = e => e.target.style.borderColor = '#2a2a2a';

export default function ReviewForm({ onSuccess }) {
  const { createReview, fetchAutofill, autofill, loading } = useReviewStore();
  const [form, setForm] = useState(defaultForm());
  const [feedback, setFeedback] = useState(null);
  const [autofilling, setAutofilling] = useState(false);

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleAutofill = async () => {
    setAutofilling(true);
    await fetchAutofill();
    setAutofilling(false);
  };

  useEffect(() => {
    if (autofill) {
      setForm(f => ({
        ...f,
        totalProblemsSolved: autofill.totalProblemsSolved ?? f.totalProblemsSolved,
        mediumCount: autofill.mediumCount ?? f.mediumCount,
        hardCount: autofill.hardCount ?? f.hardCount,
        applicationsSent: autofill.applicationsSent ?? f.applicationsSent,
        referralsSent: autofill.referralsSent ?? f.referralsSent,
        responsesReceived: autofill.responsesReceived ?? f.responsesReceived,
      }));
    }
  }, [autofill]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createReview({
        ...form,
        weakTopics: form.weakTopics ? form.weakTopics.split(',').map(t => t.trim()).filter(Boolean) : [],
        insights: [form.whatWentWell, form.whatWasHard, form.keyLesson].filter(Boolean).join('\n\n'),
      });
      setForm(defaultForm());
      setFeedback({ type: 'success', msg: 'Review saved!' });
      setTimeout(() => setFeedback(null), 3000);
      onSuccess?.();
    } catch {
      setFeedback({ type: 'error', msg: 'Failed to save review.' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl p-6 space-y-6" style={{ background: '#161616', border: '1px solid #222' }}>
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-white">Weekly Review</h2>
        <button type="button" onClick={handleAutofill} disabled={autofilling}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 text-black"
          style={{ background: '#EAB308' }}>
          <Zap size={12} />
          {autofilling ? 'Loading...' : 'Auto-fill Stats'}
        </button>
      </div>

      {feedback && (
        <div className="rounded-lg px-4 py-3 text-sm font-medium"
          style={feedback.type === 'success'
            ? { background: '#081a0a', border: '1px solid #153f18', color: '#4ade80' }
            : { background: '#1a0808', border: '1px solid #3f1515', color: '#f87171' }}>
          {feedback.msg}
        </div>
      )}

      <div>
        <label className="block text-xs text-zinc-500 mb-1">Week Starting</label>
        <input type="date" value={form.weekStartDate} onChange={e => set('weekStartDate', e.target.value)}
          className="rounded-lg px-3 py-2 text-white text-sm outline-none"
          style={inputStyle} />
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-3">This Week's Numbers</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            ['totalProblemsSolved', 'Problems Solved'],
            ['mediumCount',         'Medium Problems'],
            ['hardCount',           'Hard Problems'],
            ['applicationsSent',    'Applications Sent'],
            ['referralsSent',       'Referrals Asked'],
            ['responsesReceived',   'Responses Received'],
          ].map(([field, label]) => (
            <div key={field}>
              <label className="block text-xs text-zinc-500 mb-1">{label}</label>
              <input type="number" min="0" value={form[field]} onChange={e => set(field, e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-white text-sm outline-none transition-all"
                style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-3">Reflection</h3>
        <div className="space-y-3">
          {[
            ['whatWentWell', '1. What went well this week?',              'e.g. Solved 3 hard problems, got an interview...'],
            ['whatWasHard',  '2. What was challenging or frustrating?',   'e.g. Struggled with graph problems, no responses...'],
            ['keyLesson',    '3. Key lesson you are taking away?',        'e.g. Need to practice BFS/DFS more...'],
          ].map(([field, label, placeholder]) => (
            <div key={field}>
              <label className="block text-xs text-zinc-500 mb-1">{label}</label>
              <textarea value={form[field]} onChange={e => set(field, e.target.value)}
                placeholder={placeholder} rows={2}
                className="w-full rounded-lg px-3 py-2 text-white text-sm outline-none resize-none transition-all"
                style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-3">Action Plan</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Weak Topics (comma-separated)</label>
            <input type="text" value={form.weakTopics} onChange={e => set('weakTopics', e.target.value)}
              placeholder="e.g. Graphs, Dynamic Programming, Trees"
              className="w-full rounded-lg px-3 py-2 text-white text-sm outline-none transition-all"
              style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Next Week Focus / Improvement Action</label>
            <textarea value={form.nextWeekFocus} onChange={e => set('nextWeekFocus', e.target.value)}
              placeholder="e.g. Do 5 graph problems, apply to 10 companies with referral..." rows={2}
              className="w-full rounded-lg px-3 py-2 text-white text-sm outline-none resize-none transition-all"
              style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
          </div>
        </div>
      </div>

      <button type="submit" disabled={loading}
        className="w-full font-semibold py-2.5 rounded-lg text-sm transition-all disabled:opacity-50 text-black"
        style={{ background: '#EAB308' }}>
        {loading ? 'Saving...' : 'Save Review'}
      </button>
    </form>
  );
}
