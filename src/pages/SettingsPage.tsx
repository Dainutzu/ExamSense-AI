import { useState } from 'react';
import { User, Lock, Crown, Eye, EyeOff, Zap, AlertTriangle } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';
import { supabase } from '../lib/supabase';
import ThemeToggle from '../components/ui/ThemeToggle';
import { FREE_PLAN_UPLOAD_LIMIT } from '../utils/validators';
import { formatLKR } from '../utils/formatters';

export default function SettingsPage() {
  const { profile, user, refreshProfile } = useAuth();
  const { success, error: toastError, info } = useToast();

  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [savingProfile, setSavingProfile] = useState(false);

  const [newPass, setNewPass]         = useState('');
  const [showPasses, setShowPasses]   = useState(false);
  const [savingPass, setSavingPass]   = useState(false);

  const isPro = profile?.plan === 'pro';
  const uploadCount = profile?.upload_count ?? 0;
  const usagePct = isPro ? 0 : Math.min((uploadCount / FREE_PLAN_UPLOAD_LIMIT) * 100, 100);

  async function saveProfile() {
    if (!user) return;
    setSavingProfile(true);
    const { error } = await supabase.from('profiles').update({ full_name: fullName }).eq('id', user.id);
    if (error) toastError('Failed to save', error.message);
    else { await refreshProfile(); success('Profile updated!'); }
    setSavingProfile(false);
  }

  async function changePassword() {
    if (!newPass || newPass.length < 8) { toastError('Password too short', 'Minimum 8 characters'); return; }
    setSavingPass(true);
    const { error } = await supabase.auth.updateUser({ password: newPass });
    if (error) toastError('Failed to update password', error.message);
    else { success('Password updated!'); setNewPass(''); }
    setSavingPass(false);
  }

  function simulateUpgrade() {
    info('Coming soon', 'Payment integration with Stripe will be available soon. Contact support for Pro access.');
  }

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: '1.75rem', marginBottom: 6 }}>Settings</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Manage your account and preferences</p>
        </div>

        {/* Profile */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={18} color="var(--brand-1)" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>Profile Information</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Your name and email address</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                id="settings-name"
                type="text"
                className="form-input"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Your full name"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                value={user?.email ?? ''}
                disabled
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              />
              <span className="form-hint">Email cannot be changed from here</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={saveProfile} disabled={savingProfile} className="btn btn-primary">
                {savingProfile ? <><div className="spinner spinner-sm" /> Saving...</> : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>

        {/* Password */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Lock size={18} color="var(--brand-1)" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>Change Password</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Update your account password</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <div className="input-wrapper">
                <input
                  id="settings-new-password"
                  type={showPasses ? 'text' : 'password'}
                  className="form-input with-icon-right"
                  placeholder="Min. 8 characters"
                  value={newPass}
                  onChange={e => setNewPass(e.target.value)}
                />
                <button type="button" className="input-icon-right" onClick={() => setShowPasses(p => !p)} style={{ background: 'none', border: 'none' }}>
                  {showPasses ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={changePassword} disabled={savingPass || !newPass} className="btn btn-primary">
                {savingPass ? <><div className="spinner spinner-sm" /> Updating...</> : 'Update Password'}
              </button>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>🎨</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>Appearance</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Switch between dark and light mode</div>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>

        {/* Plan */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Crown size={18} color="var(--brand-1)" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>Subscription Plan</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Manage your plan and usage</div>
            </div>
          </div>

          <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: '16px', border: '1px solid var(--border)', marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                {isPro ? '⚡ Pro Plan' : '🆓 Free Plan'}
              </span>
              <span className={`badge ${isPro ? 'badge-pro' : 'badge-muted'}`}>
                {isPro ? 'Active' : `${uploadCount}/${FREE_PLAN_UPLOAD_LIMIT} used`}
              </span>
            </div>
            {!isPro && (
              <>
                <div className="usage-bar" style={{ marginBottom: 8 }}>
                  <div className={`usage-fill ${usagePct >= 100 ? 'danger' : usagePct >= 70 ? 'warning' : 'safe'}`} style={{ width: `${usagePct}%` }} />
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {FREE_PLAN_UPLOAD_LIMIT - uploadCount > 0
                    ? `${FREE_PLAN_UPLOAD_LIMIT - uploadCount} upload${FREE_PLAN_UPLOAD_LIMIT - uploadCount !== 1 ? 's' : ''} remaining`
                    : 'Upload limit reached — upgrade to continue'
                  }
                </p>
              </>
            )}
          </div>

          {!isPro && (
            <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.1))', borderRadius: 'var(--radius-md)', padding: '20px', border: '1px solid rgba(99,102,241,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Zap size={18} color="var(--brand-1)" />
                <span style={{ fontWeight: 700, fontSize: '1rem' }}>Upgrade to Pro</span>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                {['Unlimited paper uploads', 'Advanced AI analysis', 'Priority processing', 'Export reports (PDF)', 'Early access to new features'].map(f => (
                  <li key={f} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: 'var(--success)', fontWeight: 700 }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <button onClick={simulateUpgrade} className="btn btn-primary">
                  <Crown size={15} /> Upgrade — {formatLKR(1490)}/mo
                </button>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Cancel anytime</span>
              </div>
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div className="card" style={{ border: '1px solid rgba(244,63,94,0.2)', background: 'var(--danger-bg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <AlertTriangle size={18} color="var(--danger)" />
            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--danger)' }}>Danger Zone</div>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
            Deleting your account is permanent and cannot be undone. All your data, uploads, and analyses will be removed.
          </p>
          <button
            className="btn btn-danger"
            onClick={() => toastError('Not yet available', 'Please contact support to delete your account.')}
          >
            Delete Account
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
