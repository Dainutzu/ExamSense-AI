import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Brain, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { isValidEmail } from '../../utils/validators';
import ThemeToggle from '../../components/ui/ThemeToggle';

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  const { signUp, resendSignUpEmail } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const passwordChecks = [
    { label: '8+ characters',     ok: password.length >= 8 },
    { label: 'Uppercase letter',  ok: /[A-Z]/.test(password) },
    { label: 'Number included',   ok: /[0-9]/.test(password) },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!isValidEmail(email)) { setError('Please enter a valid email address.'); return; }
    if (!passwordChecks.every(c => c.ok)) { setError('Please meet all password requirements.'); return; }

    setLoading(true);
    const { data, error: err } = await signUp(email, password, fullName);
    if (err) {
      setError(err.message.includes('already registered') ? 'This email is already in use. Try logging in.' : err.message);
      toastError('Sign up failed');
    } else {
      // Check if session or user is immediately returned (meaning email confirm is disabled)
      if (data?.session || data?.user?.identities?.length === 0) {
        success('Account created!', 'Welcome to ExamSense AI!');
        navigate('/dashboard');
      } else {
        setSignupSuccess(true);
        success('Account created!', 'Verification email sent!');
      }
    }
    setLoading(false);
  }

  async function handleResend() {
    if (!email) return;
    setResending(true);
    const { error: err } = await resendSignUpEmail(email);
    if (err) {
      toastError(err.message || 'Failed to resend confirmation email.');
    } else {
      success('Confirmation link sent!', 'Please check your email.');
      setResendCountdown(60);
    }
    setResending(false);
  }

  return (
    <div className="auth-page">
      <div className="auth-bg" />

      <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 100 }}>
        <ThemeToggle />
      </div>

      <div className="auth-card">
        {signupSuccess ? (
          <div style={{ textAlign: 'center' }}>
            <Link to="/" className="logo" style={{ marginBottom: 32, display: 'inline-flex' }}>
              <div className="logo-icon"><Brain size={18} /></div>
              <span className="logo-text">Exam<span>Sense</span> AI</span>
            </Link>

            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'rgba(99, 102, 241, 0.1)',
              color: 'var(--brand-1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              border: '1px solid rgba(99, 102, 241, 0.2)'
            }}>
              <Mail size={24} style={{ animation: 'pulse 2s infinite' }} />
            </div>

            <h1 style={{ fontSize: '1.5rem', marginBottom: 8, fontWeight: 700 }}>Confirm your email</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.9rem', lineHeight: 1.6 }}>
              We've sent a verification link to <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>. Please check your inbox and click the link to activate your account.
            </p>

            <div style={{
              padding: '16px',
              background: 'var(--bg-elevated)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.82rem',
              color: 'var(--text-secondary)',
              marginBottom: 24,
              textAlign: 'left'
            }}>
              <h4 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>Next Steps:</h4>
              <ol style={{ paddingLeft: 16, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <li>Open the email from ExamSense AI</li>
                <li>Click the confirmation link inside</li>
                <li>You'll be redirected straight to your dashboard with a thank you!</li>
              </ol>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button
                type="button"
                className="btn btn-secondary btn-lg"
                style={{ width: '100%', justifyContent: 'center' }}
                disabled={resending || resendCountdown > 0}
                onClick={handleResend}
              >
                {resending ? (
                  <><div className="spinner spinner-sm" style={{ marginRight: 8 }} /> Resending...</>
                ) : resendCountdown > 0 ? (
                  `Resend email in ${resendCountdown}s`
                ) : (
                  'Resend verification email'
                )}
              </button>

              <Link to="/login" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>
                Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <>
            <Link to="/" className="logo" style={{ marginBottom: 28, display: 'inline-flex' }}>
              <div className="logo-icon"><Brain size={18} /></div>
              <span className="logo-text">Exam<span>Sense</span> AI</span>
            </Link>

            <h1 style={{ fontSize: '1.6rem', marginBottom: 4 }}>Create your account</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: 28, fontSize: '0.9rem' }}>
              Start analyzing exam papers for free — no credit card needed
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Full Name */}
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="input-wrapper">
                  <User size={16} className="input-icon-left" />
                  <input
                    id="signup-name"
                    type="text"
                    className="form-input with-icon-left"
                    placeholder="Your full name"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    required
                    autoComplete="name"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-wrapper">
                  <Mail size={16} className="input-icon-left" />
                  <input
                    id="signup-email"
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
                    id="signup-password"
                    type={showPass ? 'text' : 'password'}
                    className="form-input with-icon-left with-icon-right"
                    placeholder="Create a strong password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                  <button type="button" className="input-icon-right" onClick={() => setShowPass(p => !p)} style={{ background: 'none', border: 'none' }}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Password strength */}
                {password.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
                    {passwordChecks.map(({ label, ok }) => (
                      <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: ok ? 'var(--success)' : 'var(--text-muted)' }}>
                        <CheckCircle size={12} style={{ opacity: ok ? 1 : 0.4 }} />
                        {label}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {error && (
                <div style={{ padding: '10px 14px', background: 'var(--danger-bg)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--danger)' }}>
                  {error}
                </div>
              )}

              <button
                id="signup-submit"
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ marginTop: 4 }}
                disabled={loading}
              >
                {loading ? <><div className="spinner spinner-sm" />Creating account...</> : 'Create Free Account'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--brand-1)', fontWeight: 600 }}>Sign in</Link>
            </p>

            <p style={{ textAlign: 'center', marginTop: 16, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              By signing up, you agree to our Terms of Service and Privacy Policy.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
