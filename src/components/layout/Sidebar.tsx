import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Upload, History, Settings,
  LogOut, Brain, ChevronRight, Crown, Zap, Menu, X
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../ui/Toast';
import { FREE_PLAN_UPLOAD_LIMIT } from '../../utils/validators';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/upload',    icon: Upload,          label: 'Upload Paper' },
  { to: '/history',   icon: History,         label: 'History' },
  { to: '/settings',  icon: Settings,        label: 'Settings' },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, profile } = useAuth();
  const { success } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
    success('Signed out', 'See you next time!');
    navigate('/');
  }

  const isPro = profile?.plan === 'pro';
  const uploadCount = profile?.upload_count ?? 0;
  const usagePct = isPro ? 0 : Math.min((uploadCount / FREE_PLAN_UPLOAD_LIMIT) * 100, 100);
  const usageClass = usagePct >= 100 ? 'danger' : usagePct >= 70 ? 'warning' : 'safe';

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '20px 12px' }}>
      {/* Logo */}
      <div style={{ padding: '8px 4px 24px', borderBottom: '1px solid var(--border-subtle)', marginBottom: 16 }}>
        <Link to="/dashboard" className="logo" style={{ textDecoration: 'none' }}>
          <div className="logo-icon"><Brain size={18} /></div>
          <span className="logo-text">Exam<span>Sense</span> AI</span>
        </Link>
      </div>

      {/* Nav Items */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            className={`sidebar-nav-item ${location.pathname === to ? 'active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            <Icon size={18} className="nav-icon" />
            <span>{label}</span>
            {location.pathname === to && <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />}
          </Link>
        ))}
      </nav>

      {/* Plan & Usage */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 16, marginTop: 16 }}>
        {!isPro && (
          <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: '12px', marginBottom: 12, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>Free Plan</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{uploadCount}/{FREE_PLAN_UPLOAD_LIMIT}</span>
            </div>
            <div className="usage-bar"><div className={`usage-fill ${usageClass}`} style={{ width: `${usagePct}%` }} /></div>
            {usagePct >= 100 && (
              <Link to="/settings" className="btn btn-primary btn-sm" style={{ marginTop: 10, width: '100%', justifyContent: 'center', gap: 6 }}>
                <Crown size={13} /> Upgrade to Pro
              </Link>
            )}
          </div>
        )}
        {isPro && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'rgba(99,102,241,0.08)', borderRadius: 'var(--radius-md)', marginBottom: 12, border: '1px solid rgba(99,102,241,0.2)' }}>
            <Zap size={14} color="var(--brand-1)" />
            <span style={{ fontSize: '0.8rem', color: 'var(--brand-1)', fontWeight: 600 }}>Pro Plan — Unlimited</span>
          </div>
        )}

        {/* User & Sign Out */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 4px' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>
            {profile?.full_name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {profile?.full_name ?? 'Student'}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {profile?.email}
            </div>
          </div>
          <button onClick={handleSignOut} className="btn btn-ghost btn-icon" title="Sign out" style={{ padding: 6, flexShrink: 0 }}>
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="btn btn-ghost btn-icon"
        onClick={() => setMobileOpen(o => !o)}
        style={{ position: 'fixed', top: 16, left: 16, zIndex: 200, display: 'none' }}
        id="mobile-sidebar-toggle"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${mobileOpen ? 'open' : ''}`}>
        <SidebarContent />
      </aside>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99, backdropFilter: 'blur(4px)' }}
        />
      )}
    </>
  );
}
