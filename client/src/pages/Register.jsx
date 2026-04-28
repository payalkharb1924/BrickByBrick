import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap } from 'lucide-react';
import api from '../api/client';

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

  const inputStyle = { background: '#1a1a1a', border: '1px solid #2a2a2a' };
  const focusIn = e => e.target.style.borderColor = '#EAB308';
  const focusOut = e => e.target.style.borderColor = '#2a2a2a';

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0a0a0a' }}>
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8 gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: '#EAB308' }}>
            <Zap size={22} color="#000" strokeWidth={2.5} />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-white">GrindTracker</h1>
            <p className="text-zinc-500 text-sm mt-0.5">Create your account</p>
          </div>
        </div>

        <div className="rounded-2xl p-6" style={{ background: '#111111', border: '1px solid #1f1f1f' }}>
          {error && (
            <div className="mb-4 px-3 py-2.5 rounded-lg text-sm" style={{ background: '#1a0a0a', border: '1px solid #3f1515', color: '#f87171' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: 'Email', type: 'email', value: email, onChange: setEmail, placeholder: 'you@example.com', autoFocus: true },
              { label: 'Password', type: 'password', value: password, onChange: setPassword, placeholder: 'Min. 6 characters' },
              { label: 'Confirm Password', type: 'password', value: confirm, onChange: setConfirm, placeholder: '••••••••' },
            ].map(({ label, type, value, onChange, placeholder, autoFocus }) => (
              <div key={label}>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">{label}</label>
                <input
                  type={type}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  required
                  autoFocus={autoFocus}
                  className="w-full rounded-lg px-3 py-2.5 text-sm text-white outline-none transition-all"
                  style={inputStyle}
                  onFocus={focusIn}
                  onBlur={focusOut}
                  placeholder={placeholder}
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full font-semibold rounded-lg py-2.5 text-sm transition-all duration-150 disabled:opacity-50"
              style={{ background: '#EAB308', color: '#000' }}
              onMouseEnter={e => !loading && (e.target.style.background = '#ca9a06')}
              onMouseLeave={e => (e.target.style.background = '#EAB308')}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-zinc-500">
            Already have an account?{' '}
            <Link to="/login" className="font-medium" style={{ color: '#EAB308' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
