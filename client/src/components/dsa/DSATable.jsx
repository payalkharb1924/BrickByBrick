import { useState } from 'react';
import dayjs from 'dayjs';
import { XCircle, Clock, CheckCircle2 } from 'lucide-react';
import useDsaStore from '../../store/dsaStore';
import MistakeForm from '../mistakes/MistakeForm';
import Modal from '../Modal';

const DIFFICULTY_BADGE = {
  Easy:   { background: '#0f2a0f', color: '#4ade80' },
  Medium: { background: '#1a1500', color: '#EAB308' },
  Hard:   { background: '#1a0808', color: '#f87171' },
};

function statusBadge(entry) {
  if (!entry.solved) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium" style={{ background: '#1a0808', color: '#f87171' }}><XCircle size={11} /> Unsolved</span>;
  const today = dayjs().startOf('day');
  const hasOverdue = entry.revisionDates?.some((d) => dayjs(d).isBefore(today) || dayjs(d).isSame(today, 'day'));
  if (hasOverdue) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium" style={{ background: '#1a1500', color: '#EAB308' }}><Clock size={11} /> Revision Due</span>;
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium" style={{ background: '#0f2a0f', color: '#4ade80' }}><CheckCircle2 size={11} /> Done</span>;
}

function EditModal({ entry, onClose, onSave }) {
  const [form, setForm] = useState({
    topic: entry.topic || '', problemName: entry.problemName || '',
    difficulty: entry.difficulty || '', timeTaken: entry.timeTaken ?? '',
    solved: entry.solved, pattern: entry.pattern || '',
    mistake: entry.mistake || '', notes: entry.notes || '',
  });
  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  return (
    <Modal>
      <div className="rounded-xl p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto" style={{ background: '#161616', border: '1px solid #2a2a2a' }}>
        <h3 className="text-white font-semibold text-base">Edit Entry</h3>
        <div className="grid grid-cols-2 gap-3">
          {[['problemName', 'Problem Name'], ['topic', 'Topic'], ['pattern', 'Pattern']].map(([field, label]) => (
            <div key={field} className={field === 'pattern' ? 'col-span-2' : ''}>
              <label className="block text-xs text-zinc-500 mb-1">{label}</label>
              <input type="text" value={form[field]} onChange={(e) => set(field, e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-white text-sm outline-none transition-all"
                style={{ background: '#1e1e1e', border: '1px solid #2a2a2a' }}
                onFocus={e => e.target.style.borderColor = '#EAB308'}
                onBlur={e => e.target.style.borderColor = '#2a2a2a'} />
            </div>
          ))}
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Difficulty</label>
            <select value={form.difficulty} onChange={(e) => set('difficulty', e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-white text-sm outline-none"
              style={{ background: '#1e1e1e', border: '1px solid #2a2a2a' }}>
              {['Easy', 'Medium', 'Hard'].map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Time (min)</label>
            <input type="number" min="0" value={form.timeTaken} onChange={(e) => set('timeTaken', e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-white text-sm outline-none transition-all"
              style={{ background: '#1e1e1e', border: '1px solid #2a2a2a' }}
              onFocus={e => e.target.style.borderColor = '#EAB308'}
              onBlur={e => e.target.style.borderColor = '#2a2a2a'} />
          </div>
        </div>
        <div>
          <label className="block text-xs text-zinc-500 mb-1">Solved?</label>
          <div className="flex gap-4">
            {[true, false].map((val) => (
              <label key={String(val)} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="edit-solved" checked={form.solved === val} onChange={() => set('solved', val)} className="accent-yellow-400" />
                <span className="text-sm" style={{ color: val ? '#4ade80' : '#f87171' }}>{val ? 'Solved' : 'Unsolved'}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs text-zinc-500 mb-1">Mistake</label>
          <textarea value={form.mistake} onChange={(e) => set('mistake', e.target.value)} rows={2}
            className="w-full rounded-lg px-3 py-2 text-white text-sm outline-none resize-none transition-all"
            style={{ background: '#1e1e1e', border: '1px solid #2a2a2a' }}
            onFocus={e => e.target.style.borderColor = '#EAB308'}
            onBlur={e => e.target.style.borderColor = '#2a2a2a'} />
        </div>
        <div>
          <label className="block text-xs text-zinc-500 mb-1">Notes</label>
          <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={2}
            className="w-full rounded-lg px-3 py-2 text-white text-sm outline-none resize-none transition-all"
            style={{ background: '#1e1e1e', border: '1px solid #2a2a2a' }}
            onFocus={e => e.target.style.borderColor = '#EAB308'}
            onBlur={e => e.target.style.borderColor = '#2a2a2a'} />
        </div>
        <div className="flex gap-3 pt-2">
          <button onClick={() => onSave({ ...form, timeTaken: form.timeTaken ? Number(form.timeTaken) : undefined })}
            className="flex-1 text-black text-sm font-semibold py-2 rounded-lg transition-colors"
            style={{ background: '#EAB308' }}>Save</button>
          <button onClick={onClose}
            className="flex-1 text-zinc-300 text-sm font-medium py-2 rounded-lg transition-colors"
            style={{ background: '#1e1e1e', border: '1px solid #2a2a2a' }}>Cancel</button>
        </div>
      </div>
    </Modal>
  );
}

const PAGE_SIZE = 10;

export default function DSATable() {
  const { entries, loading, error, fetchEntries, updateEntry, deleteEntry } = useDsaStore();
  const [filters, setFilters] = useState({ topic: '', difficulty: '', solved: '' });
  const [sort, setSort] = useState({ sortBy: 'date', order: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [editEntry, setEditEntry] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [mistakePrefill, setMistakePrefill] = useState(null);

  const applyFilters = (overrides = {}) => {
    const merged = { ...filters, ...sort, ...overrides };
    const params = {};
    if (merged.topic) params.topic = merged.topic;
    if (merged.difficulty) params.difficulty = merged.difficulty;
    if (merged.solved !== '') params.solved = merged.solved;
    params.sortBy = merged.sortBy;
    params.order = merged.order;
    fetchEntries(params);
    setCurrentPage(1);
  };

  const setFilter = (field, value) => { const u = { ...filters, [field]: value }; setFilters(u); applyFilters({ ...u }); };
  const setSort_ = (field, value) => { const u = { ...sort, [field]: value }; setSort(u); applyFilters({ ...u }); };

  const totalPages = Math.max(1, Math.ceil(entries.length / PAGE_SIZE));
  const pagedEntries = entries.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-end">
        {[['topic', 'text', 'Topic'], ['difficulty', 'select', 'Difficulty'], ['solved', 'select', 'Status']].map(([field, type, label]) => (
          <div key={field}>
            <label className="block text-xs text-zinc-500 mb-1">{label}</label>
            {type === 'text' ? (
              <input type="text" value={filters[field]} onChange={(e) => setFilter(field, e.target.value)}
                placeholder={`Filter by ${field}`}
                className="rounded-lg px-3 py-2 text-white text-sm outline-none w-36 transition-all"
                style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}
                onFocus={e => e.target.style.borderColor = '#EAB308'}
                onBlur={e => e.target.style.borderColor = '#2a2a2a'} />
            ) : (
              <select value={filters[field]} onChange={(e) => setFilter(field, e.target.value)}
                className="rounded-lg px-3 py-2 text-white text-sm outline-none"
                style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
                <option value="">All</option>
                {field === 'difficulty' ? ['Easy', 'Medium', 'Hard'].map((d) => <option key={d}>{d}</option>) : [['true', 'Solved'], ['false', 'Unsolved']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            )}
          </div>
        ))}
        {[['sortBy', 'Sort By', [['date','Date'],['difficulty','Difficulty'],['timeTaken','Time']]], ['order', 'Order', [['desc','Desc'],['asc','Asc']]]].map(([key, label, opts]) => (
          <div key={key}>
            <label className="block text-xs text-zinc-500 mb-1">{label}</label>
            <select value={sort[key]} onChange={(e) => setSort_(key, e.target.value)}
              className="rounded-lg px-3 py-2 text-white text-sm outline-none"
              style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
              {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
        ))}
      </div>

      {error && (
        <div className="rounded-xl p-4 flex items-center justify-between gap-3 text-sm" style={{ background: '#1a0808', border: '1px solid #3f1515', color: '#f87171' }}>
          <span>{error}</span>
          <button onClick={() => fetchEntries({ sortBy: 'date', order: 'desc' })}
            className="text-xs px-3 py-1.5 rounded-lg transition-colors shrink-0 text-black font-medium" style={{ background: '#EAB308' }}>Retry</button>
        </div>
      )}

      {loading ? (
        <div className="overflow-x-auto rounded-xl animate-pulse" style={{ border: '1px solid #222' }}>
          <table className="w-full text-sm text-left">
            <thead style={{ background: '#1a1a1a' }}>
              <tr>{['Date','Problem','Topic','Difficulty','Time','Status','Pattern','Actions'].map((h) => <th key={h} className="px-4 py-3 text-xs text-zinc-500 uppercase whitespace-nowrap">{h}</th>)}</tr>
            </thead>
            <tbody style={{ background: '#161616' }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} style={{ borderTop: '1px solid #1e1e1e' }}>
                  {Array.from({ length: 8 }).map((__, j) => <td key={j} className="px-4 py-3"><div className="h-4 rounded w-full" style={{ background: '#1e1e1e' }} /></td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : entries.length === 0 ? (
        <div className="text-zinc-600 text-sm py-10 text-center">No entries found.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid #222' }}>
          <table className="w-full text-sm text-left">
            <thead style={{ background: '#1a1a1a' }}>
              <tr>{['Date','Problem','Topic','Difficulty','Time','Status','Pattern','Actions'].map((h) => <th key={h} className="px-4 py-3 text-xs text-zinc-500 uppercase whitespace-nowrap">{h}</th>)}</tr>
            </thead>
            <tbody style={{ background: '#161616' }}>
              {pagedEntries.map((entry) => (
                <tr key={entry._id} className="transition-colors" style={{ borderTop: '1px solid #1e1e1e' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#1a1a1a'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td className="px-4 py-3 text-zinc-500 whitespace-nowrap">{dayjs(entry.date).format('MMM D, YYYY')}</td>
                  <td className="px-4 py-3 text-white font-medium">{entry.problemName}</td>
                  <td className="px-4 py-3 text-zinc-400">{entry.topic}</td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 rounded text-xs font-medium" style={DIFFICULTY_BADGE[entry.difficulty] || { background: '#1e1e1e', color: '#888' }}>{entry.difficulty}</span></td>
                  <td className="px-4 py-3 text-zinc-500">{entry.timeTaken ? `${entry.timeTaken}m` : '—'}</td>
                  <td className="px-4 py-3">{statusBadge(entry)}</td>
                  <td className="px-4 py-3 text-zinc-500">{entry.pattern || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button onClick={() => setEditEntry(entry)} className="text-xs px-2 py-1 rounded font-medium transition-colors" style={{ background: '#1e1e1e', color: '#EAB308', border: '1px solid #2a2a2a' }}>Edit</button>
                      <button onClick={() => setMistakePrefill({ problemName: entry.problemName, dsaEntryId: entry._id })} className="text-xs px-2 py-1 rounded font-medium transition-colors" style={{ background: '#1a1500', color: '#EAB308', border: '1px solid #3f3000' }}>+ Mistake</button>
                      <button onClick={() => setDeleteId(entry._id)} className="text-xs px-2 py-1 rounded font-medium transition-colors" style={{ background: '#1a0808', color: '#f87171', border: '1px solid #3f1515' }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center gap-3 justify-end text-sm text-zinc-500">
          <button disabled={currentPage <= 1} onClick={() => setCurrentPage((p) => p - 1)}
            className="px-3 py-1.5 rounded-lg transition-colors text-white disabled:opacity-30" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>← Prev</button>
          <span>Page {currentPage} of {totalPages}</span>
          <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => p + 1)}
            className="px-3 py-1.5 rounded-lg transition-colors text-white disabled:opacity-30" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>Next →</button>
        </div>
      )}

      {deleteId && (
        <Modal>
          <div className="rounded-xl p-6 w-80 space-y-4" style={{ background: '#161616', border: '1px solid #2a2a2a' }}>
            <p className="text-white text-sm">Are you sure you want to delete this entry?</p>
            <div className="flex gap-3">
              <button onClick={async () => { await deleteEntry(deleteId); setDeleteId(null); }}
                className="flex-1 text-white text-sm py-2 rounded-lg transition-colors" style={{ background: '#3f1515', border: '1px solid #5a1f1f' }}>Delete</button>
              <button onClick={() => setDeleteId(null)}
                className="flex-1 text-zinc-300 text-sm py-2 rounded-lg transition-colors" style={{ background: '#1e1e1e', border: '1px solid #2a2a2a' }}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      {editEntry && <EditModal entry={editEntry} onClose={() => setEditEntry(null)} onSave={async (data) => { await updateEntry(editEntry._id, data); setEditEntry(null); }} />}

      {mistakePrefill && (
        <Modal>
          <div className="w-full max-w-lg">
            <MistakeForm prefill={mistakePrefill} onSuccess={() => setMistakePrefill(null)} />
            <button onClick={() => setMistakePrefill(null)} className="mt-3 w-full text-sm text-zinc-500 hover:text-white transition-colors">Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
