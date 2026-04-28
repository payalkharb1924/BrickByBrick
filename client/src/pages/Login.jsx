import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap } from 'lucide-react';
import api from '../api/client';
import useAuthStore from '../store/authStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
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
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0a0a0a' }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8 gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: '#EAB308' }}>
            <Zap size={22} color="#000" strokeWidth={2.5} />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-white">GrindTracker</h1>
            <p className="text-zinc-500 text-sm mt-0.5">Sign in to your account</p>
          </div>
        </div>

        <div className="rounded-2xl p-6" style={{ background: '#111111', border: '1px solid #1f1f1f' }}>
          {error && (
            <div className="mb-4 px-3 py-2.5 rounded-lg text-sm flex items-center gap-2" style={{ background: '#1a0a0a', border: '1px solid #3f1515', color: '#f87171' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                className="w-full rounded-lg px-3 py-2.5 text-sm text-white outline-none transition-all"
                style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}
                onFocus={e => e.target.style.borderColor = '#EAB308'}
                onBlur={e => e.target.style.borderColor = '#2a2a2a'}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg px-3 py-2.5 text-sm text-white outline-none transition-all"
                style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}
                onFocus={e => e.target.style.borderColor = '#EAB308'}
                onBlur={e => e.target.style.borderColor = '#2a2a2a'}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full font-semibold rounded-lg py-2.5 text-sm transition-all duration-150 disabled:opacity-50"
              style={{ background: '#EAB308', color: '#000' }}
              onMouseEnter={e => !loading && (e.target.style.background = '#ca9a06')}
              onMouseLeave={e => (e.target.style.background = '#EAB308')}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-zinc-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium transition-colors" style={{ color: '#EAB308' }}>
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
