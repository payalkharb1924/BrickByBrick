import { useState } from 'react';
import dayjs from 'dayjs';
import useJobStore from '../../store/jobStore';

const SOURCES  = ['Careers Page', 'LinkedIn', 'Referral', 'Other'];
const STATUSES = ['Applied', 'Referral Asked', 'Interview Scheduled', 'Rejected', 'No Response'];

const defaultForm = () => ({
  company: '', role: '', source: '', referral: false,
  status: 'Applied', followUpDate: '', notes: '',
  date: dayjs().format('YYYY-MM-DD'),
});

const inputStyle = { background: '#1a1a1a', border: '1px solid #2a2a2a' };
const focusIn  = e => e.target.style.borderColor = '#EAB308';
const focusOut = e => e.target.style.borderColor = '#2a2a2a';

export default function JobForm({ onSuccess }) {
  const [form, setForm] = useState(defaultForm());
  const [errors, setErrors] = useState({});
  const [feedback, setFeedback] = useState(null);
  const { createApplication, loading } = useJobStore();

  const set = (field, value) => { setForm(f => ({ ...f, [field]: value })); setErrors(e => ({ ...e, [field]: undefined })); };

  const validate = () => {
    const errs = {};
    if (!form.company.trim()) errs.company = 'Company is required';
    if (!form.role.trim()) errs.role = 'Role is required';
    if (!form.source) errs.source = 'Source is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    try {
      await createApplication(form);
      setForm(defaultForm());
      setFeedback({ type: 'success', msg: 'Application added successfully!' });
      setTimeout(() => setFeedback(null), 3000);
      onSuccess?.();
    } catch {
      setFeedback({ type: 'error', msg: 'Failed to add application. Please try again.' });
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
      <h2 className="text-base font-semibold text-white">Add Application</h2>

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
          <label className="block text-xs text-zinc-500 mb-1">Company *</label>
          <input type="text" value={form.company} onChange={e => set('company', e.target.value)}
            placeholder="e.g. Google" autoFocus
            className="w-full rounded-lg px-3 py-2 text-white text-sm outline-none transition-all"
            style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
          {errors.company && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.company}</p>}
        </div>
        <div>
          <label className="block text-xs text-zinc-500 mb-1">Role *</label>
          <input type="text" value={form.role} onChange={e => set('role', e.target.value)}
            placeholder="e.g. Software Engineer"
            className="w-full rounded-lg px-3 py-2 text-white text-sm outline-none transition-all"
            style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
          {errors.role && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.role}</p>}
        </div>
        <div>
          <label className="block text-xs text-zinc-500 mb-1">Source *</label>
          <select value={form.source} onChange={e => set('source', e.target.value)}
            className="w-full rounded-lg px-3 py-2 text-white text-sm outline-none"
            style={inputStyle}>
            <option value="">Select source</option>
            {SOURCES.map(s => <option key={s}>{s}</option>)}
          </select>
          {errors.source && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.source}</p>}
        </div>
        <div>
          <label className="block text-xs text-zinc-500 mb-1">Status</label>
          <select value={form.status} onChange={e => set('status', e.target.value)}
            className="w-full rounded-lg px-3 py-2 text-white text-sm outline-none"
            style={inputStyle}>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-zinc-500 mb-1">Date Applied</label>
          <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
            className="w-full rounded-lg px-3 py-2 text-white text-sm outline-none"
            style={inputStyle} />
        </div>
        <div>
          <label className="block text-xs text-zinc-500 mb-1">Follow-up Date</label>
          <input type="date" value={form.followUpDate} onChange={e => set('followUpDate', e.target.value)}
            className="w-full rounded-lg px-3 py-2 text-white text-sm outline-none"
            style={inputStyle} />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input type="checkbox" id="referral" checked={form.referral} onChange={e => set('referral', e.target.checked)} className="accent-yellow-400 w-4 h-4" />
        <label htmlFor="referral" className="text-sm text-zinc-400 cursor-pointer">Applied via referral</label>
      </div>

      <div>
        <label className="block text-xs text-zinc-500 mb-1">Notes</label>
        <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
          placeholder="Any additional notes..." rows={3}
          className="w-full rounded-lg px-3 py-2 text-white text-sm outline-none resize-none transition-all"
          style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
      </div>

      <button type="submit" disabled={loading}
        className="w-full font-semibold py-2.5 rounded-lg text-sm transition-all disabled:opacity-50 text-black"
        style={{ background: '#EAB308' }}>
        {loading ? 'Saving...' : 'Add Application'}
      </button>
    </form>
  );
}
