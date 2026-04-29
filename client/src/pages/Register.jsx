import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';

function B3Logo({ size = 40 }) {
  return (
    <div
      className="flex items-center justify-center rounded-xl font-black text-black select-none"
      style={{ width: size, height: size, background: '#EAB308', fontSize: size * 0.42, letterSpacing: '-1px' }}
    >
      B<sup style={{ fontSize: size * 0.26, verticalAlign: 'super' }}>3</sup>
    </div>
  );
}

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      await api.post('/auth/register', { email, password });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputProps = (onFocus, onBlur) => ({
    className: 'w-full rounded-lg px-3 py-2.5 text-sm text-white outline-none transition-all placeholder-zinc-600',
    style: { background: '#1a1a1a', border: '1px solid #2a2a2a' },
    onFocus: e => { e.target.style.borderColor = '#EAB308'; },
    onBlur: e => { e.target.style.borderColor = '#2a2a2a'; },
  });

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: '#0d0d0d' }}>
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8 gap-3">
          <B3Logo size={48} />
          <div className="text-center">
            <div className="text-xl font-black text-yellow-400">BrickByBrick</div>
            <div className="text-xs text-zinc-500 mt-0.5">NO SHORTCUTS. JUST SYSTEMS.</div>
          </div>
        </div>

        <h2 className="text-xl font-bold text-white mb-1">Create your account</h2>
        <p className="text-sm text-zinc-500 mb-6">Start building your future today.</p>

        <div className="rounded-2xl p-6 card-shadow" style={{ background: '#161616', border: '1px solid #222' }}>
          {error && (
            <div className="mb-4 px-3 py-2.5 rounded-lg text-sm" style={{ background: '#1a0808', border: '1px solid #3f1515', color: '#f87171' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus placeholder="you@example.com" {...inputProps()} />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Min. 6 characters" {...inputProps()} />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Confirm Password</label>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required placeholder="••••••••" {...inputProps()} />
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full font-semibold rounded-lg py-2.5 text-sm transition-all disabled:opacity-50 text-black"
              style={{ background: '#EAB308' }}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-zinc-500">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-yellow-400 hover:text-yellow-300">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
