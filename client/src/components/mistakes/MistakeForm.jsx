import { useState } from 'react';
import useMistakeStore from '../../store/mistakeStore';

const MISTAKE_TYPES = [
  'Wrong Approach', 'Off-by-one Error', 'Edge Case Missed',
  'Time Complexity', 'Space Complexity', 'Syntax Error', 'Logic Error', 'Other',
];

const defaultForm = (prefill) => ({
  problemName: prefill?.problemName || '',
  mistakeType: '',
  lesson: '',
  dsaEntry: prefill?.dsaEntryId || '',
});

const inputStyle = { background: '#1a1a1a', border: '1px solid #2a2a2a' };
const focusIn  = e => e.target.style.borderColor = '#EAB308';
const focusOut = e => e.target.style.borderColor = '#2a2a2a';

export default function MistakeForm({ prefill, onSuccess }) {
  const [form, setForm] = useState(defaultForm(prefill));
  const [errors, setErrors] = useState({});
  const [feedback, setFeedback] = useState(null);
  const { createMistake, loading } = useMistakeStore();

  const set = (field, value) => { setForm(f => ({ ...f, [field]: value })); setErrors(e => ({ ...e, [field]: undefined })); };

  const validate = () => {
    const errs = {};
    if (!form.problemName.trim()) errs.problemName = 'Problem name is required';
    if (!form.mistakeType) errs.mistakeType = 'Mistake type is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    try {
      const payload = { ...form };
      if (!payload.dsaEntry) delete payload.dsaEntry;
      await createMistake(payload);
      setForm(defaultForm(prefill));
      setFeedback({ type: 'success', msg: 'Mistake logged!' });
      setTimeout(() => setFeedback(null), 3000);
      onSuccess?.();
    } catch {
      setFeedback({ type: 'error', msg: 'Failed to log mistake.' });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'BUTTON') {
      e.preventDefault(); handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}
      className="rounded-xl p-6 space-y-5"
      style={{ background: '#161616', border: '1px solid #222' }}>
      <h2 className="text-base font-semibold text-white">Log a Mistake</h2>

      {feedback && (
        <div className="rounded-lg px-4 py-3 text-sm font-medium"
          style={feedback.type === 'success'
            ? { background: '#081a0a', border: '1px solid #153f18', color: '#4ade80' }
            : { background: '#1a0808', border: '1px solid #3f1515', color: '#f87171' }}>
          {feedback.msg}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-zinc-500 mb-1">Problem Name *</label>
          <input type="text" value={form.problemName} onChange={e => set('problemName', e.target.value)}
            placeholder="e.g. Two Sum" autoFocus
            className="w-full rounded-lg px-3 py-2 text-white text-sm outline-none transition-all"
            style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
          {errors.problemName && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.problemName}</p>}
        </div>
        <div>
          <label className="block text-xs text-zinc-500 mb-1">Mistake Type *</label>
          <select value={form.mistakeType} onChange={e => set('mistakeType', e.target.value)}
            className="w-full rounded-lg px-3 py-2 text-white text-sm outline-none"
            style={inputStyle}>
            <option value="">Select type</option>
            {MISTAKE_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
          {errors.mistakeType && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.mistakeType}</p>}
        </div>
      </div>

      <div>
        <label className="block text-xs text-zinc-500 mb-1">Lesson Learned</label>
        <textarea value={form.lesson} onChange={e => set('lesson', e.target.value)}
          placeholder="What will you do differently next time?" rows={3}
          className="w-full rounded-lg px-3 py-2 text-white text-sm outline-none resize-none transition-all"
          style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
      </div>

      <button type="submit" disabled={loading}
        className="w-full font-semibold py-2.5 rounded-lg text-sm transition-all disabled:opacity-50 text-black"
        style={{ background: '#EAB308' }}>
        {loading ? 'Saving...' : 'Log Mistake'}
      </button>
    </form>
  );
}
