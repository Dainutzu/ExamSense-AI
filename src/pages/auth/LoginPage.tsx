import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Brain } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/Toast';
import ThemeToggle from '../../components/ui/ThemeToggle';

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const { signIn } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: err } = await signIn(email, password);
    if (err) {
      setError(err.message === 'Invalid login credentials'
        ? 'Invalid email or password. Please try again.'
        : err.message);
      toastError('Sign in failed');
    } else {
      success('Welcome back!', 'Redirecting to your dashboard...');
      navigate('/dashboard');
    }
    setLoading(false);
  }

  return (
    <div className="auth-page">
      <div className="auth-bg" />

      {/* Theme toggle */}
      <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 100 }}>
        <ThemeToggle />
      </div>

      <div className="auth-card">
        {/* Logo */}
        <Link to="/" className="logo" style={{ marginBottom: 32, display: 'inline-flex' }}>
          <div className="logo-icon"><Brain size={18} /></div>
          <span className="logo-text">Exam<span>Sense</span> AI</span>
        </Link>

        <h1 style={{ fontSize: '1.6rem', marginBottom: 4 }}>Welcome back</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 28, fontSize: '0.9rem' }}>
          Sign in to your account to continue
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-wrapper">
              <Mail size={16} className="input-icon-left" />
              <input
                id="login-email"
                type="email"
                className="form-input with-icon-left"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrapper">
              <Lock size={16} className="input-icon-left" />
              <input
                id="login-password"
                type={showPass ? 'text' : 'password'}
                className="form-input with-icon-left with-icon-right"
                placeholder="Your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button type="button" className="input-icon-right" onClick={() => setShowPass(p => !p)} style={{ background: 'none', border: 'none' }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{ padding: '10px 14px', background: 'var(--danger-bg)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--danger)' }}>
              {error}
            </div>
          )}

          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ marginTop: 4 }}
            disabled={loading}
          >
            {loading ? <><div className="spinner spinner-sm" />Signing in...</> : 'Sign In'}
          </button>
        </form>

        <div className="divider" style={{ margin: '24px 0' }}>OR</div>

        <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: 'var(--brand-1)', fontWeight: 600 }}>Create one free</Link>
        </p>
      </div>
    </div>
  );
}
