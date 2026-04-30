import { useState } from 'react';
import dayjs from 'dayjs';
import useDsaStore from '../../store/dsaStore';

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

const defaultForm = () => ({
  topic: '', problemName: '', difficulty: 'Medium', timeTaken: '',
  solved: false, pattern: '', mistake: '', notes: '',
  date: dayjs().format('YYYY-MM-DD'),
});

const inputStyle = { background: 'var(--bg-input)', border: '1px solid var(--border-input)' };
const focusIn  = e => e.target.style.borderColor = 'var(--accent)';
const focusOut = e => e.target.style.borderColor = 'var(--border-input)';

export default function DSAForm({ onSuccess }) {
  const [form, setForm] = useState(defaultForm());
  const [errors, setErrors] = useState({});
  const [mistakeWarning, setMistakeWarning] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const { createEntry, loading } = useDsaStore();

  const set = (field, value) => { setForm(f => ({ ...f, [field]: value })); setErrors(e => ({ ...e, [field]: undefined })); };

  const validate = () => {
    const errs = {};
    if (!form.topic.trim()) errs.topic = 'Topic is required';
    if (!form.problemName.trim()) errs.problemName = 'Problem name is required';
    if (!form.difficulty) errs.difficulty = 'Difficulty is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    if (!form.mistake.trim() && !mistakeWarning) { setMistakeWarning(true); return; }
    try {
      await createEntry({ ...form, timeTaken: form.timeTaken ? Number(form.timeTaken) : undefined });
      setForm(defaultForm()); setMistakeWarning(false);
      setFeedback({ type: 'success', msg: 'Entry added successfully!' });
      setTimeout(() => setFeedback(null), 3000);
      onSuccess?.();
    } catch {
      setFeedback({ type: 'error', msg: 'Failed to add entry. Please try again.' });
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
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <h2 className="text-base font-semibold text-white">Add Problem</h2>

      {feedback && (
        <div className="rounded-lg px-4 py-3 text-sm font-medium flex items-center gap-2"
          style={feedback.type === 'success'
            ? { background: '#081a0a', border: '1px solid #153f18', color: '#4ade80' }
            : { background: '#1a0808', border: '1px solid #3f1515', color: '#f87171' }}>          {feedback.msg}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          ['problemName', 'text', 'Problem Name *', 'e.g. Two Sum', true],
          ['topic',       'text', 'Topic *',        'e.g. Arrays, Trees', false],
          ['pattern',     'text', 'Pattern',        'e.g. Sliding Window', false],
        ].map(([field, type, label, placeholder, autoFocus]) => (
          <div key={field}>
            <label className="block text-xs text-zinc-500 mb-1">{label}</label>
            <input type={type} value={form[field]} onChange={e => set(field, e.target.value)}
              placeholder={placeholder} autoFocus={autoFocus}
              className="w-full rounded-lg px-3 py-2 text-white text-sm outline-none transition-all"
              style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
            {errors[field] && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors[field]}</p>}
          </div>
        ))}

        <div>
          <label className="block text-xs text-zinc-500 mb-1">Difficulty *</label>
          <select value={form.difficulty} onChange={e => set('difficulty', e.target.value)}
            className="w-full rounded-lg px-3 py-2 text-white text-sm outline-none"
            style={inputStyle}>
            {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs text-zinc-500 mb-1">Time Taken (minutes)</label>
          <input type="number" min="0" value={form.timeTaken} onChange={e => set('timeTaken', e.target.value)}
            placeholder="e.g. 30"
            className="w-full rounded-lg px-3 py-2 text-white text-sm outline-none transition-all"
            style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
        </div>

        <div>
          <label className="block text-xs text-zinc-500 mb-1">Date</label>
          <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
            className="w-full rounded-lg px-3 py-2 text-white text-sm outline-none"
            style={inputStyle} />
        </div>
      </div>

      <div>
        <label className="block text-xs text-zinc-500 mb-2">Solved? *</label>
        <div className="flex gap-5">
          {[true, false].map(val => (
            <label key={String(val)} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="solved" checked={form.solved === val} onChange={() => set('solved', val)} className="accent-yellow-400" />
              <span className="text-sm font-medium" style={{ color: val ? '#4ade80' : '#f87171' }}>{val ? 'Solved' : 'Unsolved'}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs text-zinc-500 mb-1">Mistake / What went wrong</label>
        <textarea value={form.mistake} onChange={e => { set('mistake', e.target.value); setMistakeWarning(false); }}
          placeholder="Describe what you got wrong or struggled with..." rows={3}
          className="w-full rounded-lg px-3 py-2 text-white text-sm outline-none resize-none transition-all"
          style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
        {mistakeWarning && (
          <div className="mt-2 rounded-lg px-3 py-2.5 text-sm" style={{ background: '#1a1500', border: '1px solid #3f3000', color: '#EAB308' }}>
            Writing your mistake helps you improve. Are you sure you want to skip?
            <div className="flex gap-3 mt-2">
              <button type="submit" className="text-xs px-3 py-1 rounded-lg font-medium text-black" style={{ background: 'var(--accent)' }}>Yes, skip</button>
              <button type="button" onClick={() => setMistakeWarning(false)} className="text-xs px-3 py-1 rounded-lg text-zinc-300" style={{ background: 'var(--bg-elevated)' }}>Let me add it</button>
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="block text-xs text-zinc-500 mb-1">Notes</label>
        <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
          placeholder="Any additional notes..." rows={2}
          className="w-full rounded-lg px-3 py-2 text-white text-sm outline-none resize-none transition-all"
          style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
      </div>

      {!mistakeWarning && (
        <button type="submit" disabled={loading}
          className="w-full font-semibold py-2.5 rounded-lg text-sm transition-all disabled:opacity-50 text-black"
          style={{ background: 'var(--accent)' }}>
          {loading ? 'Saving...' : 'Add Problem'}
        </button>
      )}
    </form>
  );
}
