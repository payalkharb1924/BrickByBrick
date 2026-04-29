import { useEffect, useState } from 'react';
import { Target, Plus, CheckCircle2, Circle, Trash2 } from 'lucide-react';
import useGoalStore from '../store/goalStore';

const CATEGORIES = ['DSA', 'Jobs', 'Learning', 'Personal'];
const inputCls = 'rounded-lg px-3 py-2 text-sm text-white outline-none w-full placeholder-zinc-600';
const inputStyle = { background: '#1a1a1a', border: '1px solid #2a2a2a' };

export default function Goals() {
  const { goals, loading, fetchGoals, createGoal, updateGoal, deleteGoal } = useGoalStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', category: 'DSA', target: '', current: '' });

  useEffect(() => { fetchGoals(); }, []);

  const addGoal = async () => {
    if (!form.title.trim() || !form.target) return;
    await createGoal({ title: form.title, category: form.category, target: Number(form.target), current: Number(form.current) || 0 });
    setForm({ title: '', category: 'DSA', target: '', current: '' });
    setShowForm(false);
  };

  const toggle = (g) => updateGoal(g._id, { done: !g.done });
  const remove = (id) => deleteGoal(id);
  const updateProgress = (g, val) => updateGoal(g._id, { current: Math.min(Number(val), g.target) });

  const active = goals.filter(g => !g.done);
  const completed = goals.filter(g => g.done);

  return (
    <div className="p-5 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target size={18} className="text-yellow-400" />
          <h1 className="text-xl font-bold text-white">Goals</h1>
        </div>
        <button onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-black"
          style={{ background: '#EAB308' }}>
          <Plus size={13} /> Add Goal
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl p-4 space-y-3" style={{ background: '#161616', border: '1px solid #2a2a2a' }}>
          <h3 className="text-sm font-semibold text-white">New Goal</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Goal Title *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Solve 200 problems" className={inputCls} style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className={inputCls} style={inputStyle}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Target *</label>
              <input type="number" min="1" value={form.target} onChange={e => setForm(f => ({ ...f, target: e.target.value }))}
                placeholder="e.g. 150" className={inputCls} style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Current Progress</label>
              <input type="number" min="0" value={form.current} onChange={e => setForm(f => ({ ...f, current: e.target.value }))}
                placeholder="e.g. 0" className={inputCls} style={inputStyle} />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={addGoal} className="px-4 py-1.5 rounded-lg text-xs font-semibold text-black" style={{ background: '#EAB308' }}>Save Goal</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-1.5 rounded-lg text-xs text-zinc-400" style={{ background: '#1e1e1e', border: '1px solid #2a2a2a' }}>Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="animate-pulse space-y-2">
          {[0,1,2].map(i => <div key={i} className="h-20 rounded-xl" style={{ background: '#161616' }} />)}
        </div>
      ) : (
        <>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-3">Active ({active.length})</h2>
            {active.length === 0 ? (
              <div className="text-zinc-600 text-sm py-6 text-center">No active goals. Add one above!</div>
            ) : (
              <div className="space-y-3">
                {active.map(g => {
                  const pct = g.target > 0 ? Math.round((g.current / g.target) * 100) : 0;
                  return (
                    <div key={g._id} className="rounded-xl p-4" style={{ background: '#161616', border: '1px solid #222' }}>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-start gap-2.5">
                          <button onClick={() => toggle(g)} className="mt-0.5 text-zinc-500 hover:text-yellow-400 transition-colors">
                            <Circle size={16} />
                          </button>
                          <div>
                            <div className="text-sm font-medium text-white">{g.title}</div>
                            <span className="text-xs px-1.5 py-0.5 rounded mt-1 inline-block" style={{ background: '#1e1e1e', color: '#EAB308' }}>{g.category}</span>
                          </div>
                        </div>
                        <button onClick={() => remove(g._id)} className="text-zinc-600 hover:text-red-400 transition-colors shrink-0">
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#2a2a2a' }}>
                          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: '#EAB308' }} />
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <input type="number" min="0" max={g.target} value={g.current}
                            onChange={e => updateProgress(g, e.target.value)}
                            className="w-12 text-center rounded px-1 py-0.5 text-xs text-white outline-none"
                            style={{ background: '#1e1e1e', border: '1px solid #2a2a2a' }} />
                          <span className="text-xs text-zinc-500">/ {g.target}</span>
                          <span className="text-xs font-semibold text-yellow-400 ml-1">{pct}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {completed.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-3">Completed ({completed.length})</h2>
              <div className="space-y-2">
                {completed.map(g => (
                  <div key={g._id} className="rounded-xl p-3 flex items-center gap-3 opacity-50" style={{ background: '#161616', border: '1px solid #222' }}>
                    <button onClick={() => toggle(g)} className="text-green-400">
                      <CheckCircle2 size={16} />
                    </button>
                    <span className="text-sm text-zinc-400 line-through flex-1">{g.title}</span>
                    <button onClick={() => remove(g._id)} className="text-zinc-600 hover:text-red-400 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
