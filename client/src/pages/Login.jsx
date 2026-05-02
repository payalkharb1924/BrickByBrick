import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import useAuthStore from '../store/authStore';

function B3Logo({ size = 40 }) {
  return (
    <div
      className="flex items-center justify-center rounded-xl font-black text-black select-none"
      style={{ width: size, height: size, background: 'var(--accent)', fontSize: size * 0.42, letterSpacing: '-1px' }}
    >
      B<sup style={{ fontSize: size * 0.26, verticalAlign: 'super' }}>3</sup>
    </div>
  );
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      login(data.data.user, data.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>
      {/* Left branding panel */}
      <div className="hidden lg:flex flex-col justify-between w-80 p-10 shrink-0" style={{ background: 'var(--bg-sub)', borderRight: '1px solid var(--border-sub)' }}>
        <div>
          <div className="flex items-center gap-3 mb-8">
            <B3Logo size={44} />
            <div>
              <div className="text-lg font-black leading-tight" style={{ color: 'var(--accent)' }}>BRICKBYBRICK</div>
              <div className="text-xs text-zinc-500">BUILD YOUR FUTURE</div>
            </div>
          </div>
          <div className="text-sm font-bold leading-relaxed" style={{ color: 'var(--accent)' }}>
            ONE BRICK AT A TIME.
          </div>
        </div>
        <div>
          <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-input)' }}>
            <B3Logo size={52} />
            <div>
              <div className="text-base font-black" style={{ color: 'var(--accent)' }}>BrickByBrick</div>
              <div className="text-xs text-zinc-500 mt-0.5">NO SHORTCUTS. JUST SYSTEMS.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right login form */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center mb-8 gap-3 lg:hidden">
            <B3Logo size={48} />
            <div className="text-center">
              <div className="text-xl font-black" style={{ color: 'var(--accent)' }}>BrickByBrick</div>
              <div className="text-xs text-zinc-500 mt-0.5">NO SHORTCUTS. JUST SYSTEMS.</div>
            </div>
          </div>

          <h2 className="text-xl font-bold text-white mb-1">Welcome back</h2>
          <p className="text-sm text-zinc-500 mb-6">Sign in to continue building.</p>

          <div className="rounded-2xl p-6 card-shadow" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            {error && (
              <div className="mb-4 px-3 py-2.5 rounded-lg text-sm" style={{ background: '#1a0808', border: '1px solid #3f1515', color: '#f87171' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Email</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  required autoFocus
                  className="w-full rounded-lg px-3 py-2.5 text-sm text-white outline-none transition-all placeholder-zinc-600"
                  style={{ background: 'var(--bg-input)', border: '1px solid var(--border-input)' }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border-input)'}
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Password</label>
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full rounded-lg px-3 py-2.5 text-sm text-white outline-none transition-all placeholder-zinc-600"
                  style={{ background: 'var(--bg-input)', border: '1px solid var(--border-input)' }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border-input)'}
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit" disabled={loading}
                className="w-full font-semibold rounded-lg py-2.5 text-sm transition-all disabled:opacity-50 text-black"
                style={{ background: 'var(--accent)' }}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-zinc-500">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium transition-colors" style={{ color: 'var(--accent)' }} onMouseEnter={e => e.target.style.opacity = '0.8'} onMouseLeave={e => e.target.style.opacity = '1'}>Register</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
