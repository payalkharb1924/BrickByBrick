import { useEffect, useState } from 'react';
import { BookOpen, Plus, ExternalLink, Trash2, Star } from 'lucide-react';
import useResourceStore from '../store/resourceStore';

const CATEGORIES = ['DSA', 'System Design', 'Behavioral', 'Resume', 'Other'];
const inputCls = 'rounded-lg px-3 py-2 text-sm text-white outline-none w-full placeholder-zinc-600';
const inputStyle = { background: 'var(--bg-input)', border: '1px solid var(--border-input)' };

export default function Resources() {
  const { resources, loading, fetchResources, createResource, updateResource, deleteResource } = useResourceStore();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('All');
  const [form, setForm] = useState({ title: '', url: '', category: 'DSA', notes: '' });

  useEffect(() => { fetchResources(filter !== 'All' ? filter : undefined); }, [filter]);

  const add = async () => {
    if (!form.title.trim()) return;
    await createResource({ ...form, starred: false });
    setForm({ title: '', url: '', category: 'DSA', notes: '' });
    setShowForm(false);
  };

  const remove = (id) => deleteResource(id);
  const toggleStar = (r) => updateResource(r._id, { starred: !r.starred });

  return (
    <div className="p-5 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen size={18} style={{ color: 'var(--accent)' }} />
          <h1 className="text-xl font-bold text-white">Resources</h1>
        </div>
        <button onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-black"
          style={{ background: 'var(--accent)' }}>
          <Plus size={13} /> Add Resource
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 flex-wrap">
        {['All', ...CATEGORIES].map(c => (
          <button key={c} onClick={() => setFilter(c)}
            className="px-3 py-1 rounded-lg text-xs font-medium transition-colors"
            style={filter === c ? { background: 'var(--accent)', color: '#000' } : { background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
            {c}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="rounded-xl p-4 space-y-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-input)' }}>
          <h3 className="text-sm font-semibold text-white">Add Resource</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Title *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. LeetCode Patterns" className={inputCls} style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">URL</label>
              <input value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} placeholder="https://..." className={inputCls} style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className={inputCls} style={inputStyle}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Notes</label>
              <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Short description..." className={inputCls} style={inputStyle} />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={add} className="px-4 py-1.5 rounded-lg text-xs font-semibold text-black" style={{ background: 'var(--accent)' }}>Save</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-1.5 rounded-lg text-xs text-zinc-400" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-input)' }}>Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-pulse">
          {[0,1,2,3].map(i => <div key={i} className="h-28 rounded-xl" style={{ background: 'var(--bg-card)' }} />)}
        </div>
      ) : resources.length === 0 ? (
        <div className="text-zinc-600 text-sm py-8 text-center">No resources yet. Add your first one!</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {resources.map(r => (
            <div key={r._id} className="rounded-xl p-4 flex flex-col gap-2" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{r.title}</div>
                  <span className="text-xs px-1.5 py-0.5 rounded mt-1 inline-block" style={{ background: 'var(--bg-elevated)', color: 'var(--accent)' }}>{r.category}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => toggleStar(r)} className={`transition-colors ${r.starred ? 'text-white' : 'text-zinc-600 hover:text-white'}`} style={r.starred ? { color: 'var(--accent)' } : {}}>
                    <Star size={13} fill={r.starred ? 'currentColor' : 'none'} />
                  </button>
                  <button onClick={() => remove(r._id)} className="text-zinc-600 hover:text-red-400 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              {r.notes && <p className="text-xs text-zinc-500">{r.notes}</p>}
              {r.url && (
                <a href={r.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs transition-colors mt-auto" style={{ color: 'var(--accent)' }}>
                  Open link <ExternalLink size={11} />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
