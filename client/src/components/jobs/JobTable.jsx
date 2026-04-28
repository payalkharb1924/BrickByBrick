import { useState } from 'react';
import dayjs from 'dayjs';
import { CheckCircle2 } from 'lucide-react';
import useJobStore from '../../store/jobStore';

const STATUS_BADGE = {
  Applied:               { background: '#0a1020', color: '#60a5fa' },
  'Referral Asked':      { background: '#150a20', color: '#c084fc' },
  'Interview Scheduled': { background: '#0a1a0a', color: '#4ade80' },
  Rejected:              { background: '#1a0808', color: '#f87171' },
  'No Response':         { background: '#1a1a1a', color: '#666' },
};

const STATUSES = ['Applied', 'Referral Asked', 'Interview Scheduled', 'Rejected', 'No Response'];
const SOURCES = ['Careers Page', 'LinkedIn', 'Referral', 'Other'];

function EditModal({ app, onClose, onSave }) {
  const [form, setForm] = useState({
    company: app.company || '',
    role: app.role || '',
    source: app.source || '',
    referral: app.referral || false,
    status: app.status || 'Applied',
    followUpDate: app.followUpDate ? dayjs(app.followUpDate).format('YYYY-MM-DD') : '',
    notes: app.notes || '',
    date: app.date ? dayjs(app.date).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
  });
  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="rounded-xl p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto modal-enter" style={{ background: '#161616', border: '1px solid #2a2a2a' }}>
        <h3 className="text-white font-semibold text-base">Edit Application</h3>
        <div className="grid grid-cols-2 gap-3">
          {[['company', 'Company'], ['role', 'Role']].map(([field, label]) => (
            <div key={field}>
              <label className="block text-xs text-zinc-500 mb-1">{label}</label>
              <input type="text" value={form[field]} onChange={(e) => set(field, e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-white text-sm outline-none transition-all"
                style={{ background: '#1e1e1e', border: '1px solid #2a2a2a' }}
                onFocus={e => e.target.style.borderColor = '#EAB308'}
                onBlur={e => e.target.style.borderColor = '#2a2a2a'} />
            </div>
          ))}
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Source</label>
            <select value={form.source} onChange={(e) => set('source', e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-white text-sm outline-none"
              style={{ background: '#1e1e1e', border: '1px solid #2a2a2a' }}>
              {SOURCES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Status</label>
            <select value={form.status} onChange={(e) => set('status', e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-white text-sm outline-none"
              style={{ background: '#1e1e1e', border: '1px solid #2a2a2a' }}>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Date Applied</label>
            <input type="date" value={form.date} onChange={(e) => set('date', e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-white text-sm outline-none"
              style={{ background: '#1e1e1e', border: '1px solid #2a2a2a' }} />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Follow-up Date</label>
            <input type="date" value={form.followUpDate} onChange={(e) => set('followUpDate', e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-white text-sm outline-none"
              style={{ background: '#1e1e1e', border: '1px solid #2a2a2a' }} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input type="checkbox" id="edit-referral" checked={form.referral} onChange={(e) => set('referral', e.target.checked)} className="accent-yellow-400 w-4 h-4" />
          <label htmlFor="edit-referral" className="text-sm text-zinc-400 cursor-pointer">Applied via referral</label>
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
          <button onClick={() => onSave(form)} className="flex-1 text-black text-sm font-semibold py-2 rounded-lg" style={{ background: '#EAB308' }}>Save</button>
          <button onClick={onClose} className="flex-1 text-zinc-300 text-sm py-2 rounded-lg" style={{ background: '#1e1e1e', border: '1px solid #2a2a2a' }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

const PAGE_SIZE = 10;

export default function JobTable() {
  const { applications, loading, error, fetchApplications, updateApplication, deleteApplication } = useJobStore();
  const [filters, setFilters] = useState({ status: '', company: '' });
  const [sort, setSort] = useState({ sortBy: 'date', order: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [editApp, setEditApp] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const applyFilters = (overrides = {}) => {
    const merged = { ...filters, ...sort, ...overrides };
    const params = {};
    if (merged.status) params.status = merged.status;
    if (merged.company) params.company = merged.company;
    params.sortBy = merged.sortBy;
    params.order = merged.order;
    fetchApplications(params);
    setCurrentPage(1);
  };

  const setFilter = (field, value) => { const u = { ...filters, [field]: value }; setFilters(u); applyFilters({ ...u }); };
  const setSort_ = (field, value) => { const u = { ...sort, [field]: value }; setSort(u); applyFilters({ ...u }); };

  const totalPages = Math.max(1, Math.ceil(applications.length / PAGE_SIZE));
  const pagedApps = applications.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs text-zinc-500 mb-1">Company</label>
          <input type="text" value={filters.company} onChange={(e) => setFilter('company', e.target.value)}
            placeholder="Filter by company"
            className="rounded-lg px-3 py-2 text-white text-sm outline-none w-40 transition-all"
            style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}
            onFocus={e => e.target.style.borderColor = '#EAB308'}
            onBlur={e => e.target.style.borderColor = '#2a2a2a'} />
        </div>
        {[['status','Status',STATUSES],['sortBy','Sort By',[['date','Date'],['company','Company'],['status','Status']]],['order','Order',[['desc','Desc'],['asc','Asc']]]].map(([key, label, opts]) => (
          <div key={key}>
            <label className="block text-xs text-zinc-500 mb-1">{label}</label>
            <select
              value={key === 'status' ? filters.status : sort[key]}
              onChange={(e) => key === 'status' ? setFilter('status', e.target.value) : setSort_(key, e.target.value)}
              className="rounded-lg px-3 py-2 text-white text-sm outline-none"
              style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
              {key === 'status' && <option value="">All</option>}
              {opts.map((o) => Array.isArray(o) ? <option key={o[0]} value={o[0]}>{o[1]}</option> : <option key={o}>{o}</option>)}
            </select>
          </div>
        ))}
      </div>

      {error && (
        <div className="rounded-xl p-4 flex items-center justify-between gap-3 text-sm" style={{ background: '#1a0808', border: '1px solid #3f1515', color: '#f87171' }}>
          <span>{error}</span>
          <button onClick={() => fetchApplications({ sortBy: 'date', order: 'desc' })}
            className="text-xs px-3 py-1.5 rounded-lg shrink-0 text-black font-medium" style={{ background: '#EAB308' }}>Retry</button>
        </div>
      )}

      {loading ? (
        <div className="overflow-x-auto rounded-xl animate-pulse" style={{ border: '1px solid #222' }}>
          <table className="w-full text-sm text-left">
            <thead style={{ background: '#1a1a1a' }}>
              <tr>{['Date','Company','Role','Source','Referral','Status','Follow-up','Actions'].map((h) => <th key={h} className="px-4 py-3 text-xs text-zinc-500 uppercase whitespace-nowrap">{h}</th>)}</tr>
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
      ) : applications.length === 0 ? (
        <div className="text-zinc-600 text-sm py-10 text-center">No applications found.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid #222' }}>
          <table className="w-full text-sm text-left">
            <thead style={{ background: '#1a1a1a' }}>
              <tr>{['Date','Company','Role','Source','Referral','Status','Follow-up','Actions'].map((h) => <th key={h} className="px-4 py-3 text-xs text-zinc-500 uppercase whitespace-nowrap">{h}</th>)}</tr>
            </thead>
            <tbody style={{ background: '#161616' }}>
              {pagedApps.map((app) => (
                <tr key={app._id} className="transition-colors" style={{ borderTop: '1px solid #1e1e1e' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#1a1a1a'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td className="px-4 py-3 text-zinc-500 whitespace-nowrap">{dayjs(app.date).format('MMM D, YYYY')}</td>
                  <td className="px-4 py-3 text-white font-medium">{app.company}</td>
                  <td className="px-4 py-3 text-zinc-400">{app.role}</td>
                  <td className="px-4 py-3 text-zinc-500">{app.source}</td>
                  <td className="px-4 py-3">{app.referral ? <span className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: '#4ade80' }}><CheckCircle2 size={12} /> Yes</span> : <span className="text-zinc-600 text-xs">No</span>}</td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 rounded text-xs font-medium" style={STATUS_BADGE[app.status] || { background: '#1e1e1e', color: '#666' }}>{app.status}</span></td>
                  <td className="px-4 py-3 text-zinc-500 whitespace-nowrap">{app.followUpDate ? dayjs(app.followUpDate).format('MMM D') : '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button onClick={() => setEditApp(app)} className="text-xs px-2 py-1 rounded font-medium" style={{ background: '#1e1e1e', color: '#EAB308', border: '1px solid #2a2a2a' }}>Edit</button>
                      <button onClick={() => setDeleteId(app._id)} className="text-xs px-2 py-1 rounded font-medium" style={{ background: '#1a0808', color: '#f87171', border: '1px solid #3f1515' }}>Delete</button>
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
            className="px-3 py-1.5 rounded-lg text-white disabled:opacity-30" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>← Prev</button>
          <span>Page {currentPage} of {totalPages}</span>
          <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => p + 1)}
            className="px-3 py-1.5 rounded-lg text-white disabled:opacity-30" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>Next →</button>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="rounded-xl p-6 w-80 space-y-4 modal-enter" style={{ background: '#161616', border: '1px solid #2a2a2a' }}>
            <p className="text-white text-sm">Delete this application?</p>
            <div className="flex gap-3">
              <button onClick={async () => { await deleteApplication(deleteId); setDeleteId(null); }}
                className="flex-1 text-white text-sm py-2 rounded-lg" style={{ background: '#3f1515', border: '1px solid #5a1f1f' }}>Delete</button>
              <button onClick={() => setDeleteId(null)}
                className="flex-1 text-zinc-300 text-sm py-2 rounded-lg" style={{ background: '#1e1e1e', border: '1px solid #2a2a2a' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {editApp && <EditModal app={editApp} onClose={() => setEditApp(null)} onSave={async (data) => { await updateApplication(editApp._id, data); setEditApp(null); }} />}
    </div>
  );
}
