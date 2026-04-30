import { useState } from 'react';
import dayjs from 'dayjs';
import { Target, Pencil, Trash2, X, Zap } from 'lucide-react';
import useReviewStore from '../../store/reviewStore';
import Modal from '../Modal';

const inputCls = 'w-full rounded-lg px-3 py-2 text-sm text-white outline-none transition-all placeholder-zinc-600';
const inputStyle = { background: 'var(--bg-input)', border: '1px solid var(--border-input)' };
const focusIn  = e => e.target.style.borderColor = 'var(--accent)';
const focusOut = e => e.target.style.borderColor = 'var(--border-input)';

function EditModal({ review, onClose }) {
  const { updateReview } = useReviewStore();
  const [form, setForm] = useState({
    totalProblemsSolved: review.totalProblemsSolved ?? '',
    mediumCount:         review.mediumCount ?? '',
    hardCount:           review.hardCount ?? '',
    applicationsSent:    review.applicationsSent ?? '',
    referralsSent:       review.referralsSent ?? '',
    responsesReceived:   review.responsesReceived ?? '',
    weakTopics:          (review.weakTopics || []).join(', '),
    nextWeekFocus:       review.nextWeekFocus || '',
    insights:            review.insights || '',
  });
  const [saving, setSaving] = useState(false);

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateReview(review._id, {
        ...form,
        weakTopics: form.weakTopics ? form.weakTopics.split(',').map(t => t.trim()).filter(Boolean) : [],
        totalProblemsSolved: Number(form.totalProblemsSolved) || 0,
        mediumCount:         Number(form.mediumCount) || 0,
        hardCount:           Number(form.hardCount) || 0,
        applicationsSent:    Number(form.applicationsSent) || 0,
        referralsSent:       Number(form.referralsSent) || 0,
        responsesReceived:   Number(form.responsesReceived) || 0,
      });
      onClose();
    } catch {
      // error handled by store
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal>
      <div className="rounded-xl p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-input)' }}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">
            Edit Review — <span style={{ color: '#EAB308' }}>{dayjs(review.weekStartDate).format('MMM D, YYYY')}</span>
          </h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white"><X size={15} /></button>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-3">Numbers</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              ['totalProblemsSolved', 'Problems Solved'],
              ['mediumCount',         'Medium'],
              ['hardCount',           'Hard'],
              ['applicationsSent',    'Applications Sent'],
              ['referralsSent',       'Referrals Asked'],
              ['responsesReceived',   'Responses Received'],
            ].map(([field, label]) => (
              <div key={field}>
                <label className="block text-xs text-zinc-500 mb-1">{label}</label>
                <input type="number" min="0" value={form[field]} onChange={e => set(field, e.target.value)}
                  className={inputCls} style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs text-zinc-500 mb-1">Weak Topics (comma-separated)</label>
          <input type="text" value={form.weakTopics} onChange={e => set('weakTopics', e.target.value)}
            placeholder="e.g. Graphs, DP" className={inputCls} style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
        </div>

        <div>
          <label className="block text-xs text-zinc-500 mb-1">Next Week Focus</label>
          <textarea value={form.nextWeekFocus} onChange={e => set('nextWeekFocus', e.target.value)}
            rows={2} className={`${inputCls} resize-none`} style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
        </div>

        <div>
          <label className="block text-xs text-zinc-500 mb-1">Insights / Reflection</label>
          <textarea value={form.insights} onChange={e => set('insights', e.target.value)}
            rows={3} className={`${inputCls} resize-none`} style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
        </div>

        <div className="flex gap-3 pt-1">
          <button onClick={handleSave} disabled={saving}
            className="flex-1 text-black text-sm font-semibold py-2 rounded-lg disabled:opacity-50 flex items-center justify-center gap-1.5"
            style={{ background: 'var(--accent)' }}>
            <Zap size={13} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button onClick={onClose}
            className="flex-1 text-zinc-300 text-sm py-2 rounded-lg"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-input)' }}>Cancel</button>
        </div>
      </div>
    </Modal>
  );
}

function DeleteConfirm({ review, onClose }) {
  const { deleteReview } = useReviewStore();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteReview(review._id);
      onClose();
    } catch {
      setDeleting(false);
    }
  };

  return (
    <Modal>
      <div className="rounded-xl p-6 w-80 space-y-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-input)' }}>
        <h3 className="text-sm font-semibold text-white">Delete Review?</h3>
        <p className="text-xs text-zinc-400">
          This will permanently delete the review for week of{' '}
          <span style={{ color: 'var(--accent)' }}>{dayjs(review.weekStartDate).format('MMM D, YYYY')}</span>.
        </p>
        <div className="flex gap-3">
          <button onClick={handleDelete} disabled={deleting}
            className="flex-1 text-white text-sm py-2 rounded-lg disabled:opacity-50 transition-colors"
            style={{ background: '#3f1515', border: '1px solid #5a1f1f' }}>
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
          <button onClick={onClose}
            className="flex-1 text-zinc-300 text-sm py-2 rounded-lg"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-input)' }}>Cancel</button>
        </div>
      </div>
    </Modal>
  );
}

export default function ReviewList({ reviews, loading, error, onRetry }) {
  const [editReview, setEditReview] = useState(null);
  const [deleteReview, setDeleteReview] = useState(null);

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl p-5 space-y-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="h-4 rounded w-40" style={{ background: 'var(--bg-elevated)' }} />
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {Array.from({ length: 6 }).map((__, j) => <div key={j} className="rounded-lg h-14" style={{ background: 'var(--bg-elevated)' }} />)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl p-4 flex items-center justify-between gap-3 text-sm"
        style={{ background: '#1a0808', border: '1px solid #3f1515', color: '#f87171' }}>
        <span>{error}</span>
        {onRetry && <button onClick={onRetry} className="text-xs px-3 py-1.5 rounded-lg shrink-0 text-black font-medium" style={{ background: '#EAB308' }}>Retry</button>}
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="rounded-xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <p className="text-zinc-500 text-sm">No reviews yet. Complete your first weekly review!</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {reviews.map((r) => (
          <div key={r._id} className="rounded-xl p-5 space-y-3 transition-all duration-200"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-input)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>

            {/* Header row */}
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold text-sm">
                Week of <span style={{ color: 'var(--accent)' }}>{dayjs(r.weekStartDate).format('MMM D, YYYY')}</span>
              </h3>
              <div className="flex items-center gap-1">
                <button onClick={() => setEditReview(r)}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-yellow-400 hover:bg-white/5 transition-colors">
                  <Pencil size={13} />
                </button>
                <button onClick={() => setDeleteReview(r)}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-white/5 transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
              {[['Problems', r.totalProblemsSolved],['Medium', r.mediumCount],['Hard', r.hardCount],
                ['Applied', r.applicationsSent],['Referrals', r.referralsSent],['Responses', r.responsesReceived]
              ].map(([label, val]) => (
                <div key={label} className="rounded-lg p-2" style={{ background: 'var(--bg-elevated)' }}>
                  <div className="text-white font-bold text-lg">{val ?? 0}</div>
                  <div className="text-zinc-500 text-xs">{label}</div>
                </div>
              ))}
            </div>

            {r.weakTopics?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-zinc-500">Weak topics:</span>
                {r.weakTopics.map((t) => (
                  <span key={t} className="text-xs px-2 py-0.5 rounded"
                    style={{ background: '#1a0808', color: '#f87171', border: '1px solid #3f1515' }}>{t}</span>
                ))}
              </div>
            )}

            {r.nextWeekFocus && (
              <p className="text-zinc-400 text-xs flex items-center gap-1.5">
                <Target size={12} style={{ color: 'var(--accent)' }} className="shrink-0" /> {r.nextWeekFocus}
              </p>
            )}

            {r.insights && <p className="text-zinc-600 text-xs whitespace-pre-line">{r.insights}</p>}
          </div>
        ))}
      </div>

      {editReview && <EditModal review={editReview} onClose={() => setEditReview(null)} />}
      {deleteReview && <DeleteConfirm review={deleteReview} onClose={() => setDeleteReview(null)} />}
    </>
  );
}
