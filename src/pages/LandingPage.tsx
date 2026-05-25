import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Brain, BarChart2, Target, Zap, Shield,
  BookOpen, TrendingUp, Check, X as XIcon,
  Star, ArrowRight, Sparkles, FileText, Users
} from 'lucide-react';
import ThemeToggle from '../components/ui/ThemeToggle';

const features = [
  { icon: <Brain size={22} />, title: 'AI-Powered Analysis', desc: 'GPT-4o reads your exam papers, understands context, and extracts every question with remarkable accuracy.', gradient: 'from-indigo to-violet' },
  { icon: <Target size={22} />, title: 'Topic Detection', desc: 'Automatically groups questions into topics and counts how often each subject area repeats across papers.', gradient: 'from-violet to-purple' },
  { icon: <TrendingUp size={22} />, title: 'Study Priority Ranking', desc: 'Topics scored High, Medium, or Low priority based on repeat frequency — so you focus on what matters most.', gradient: 'from-purple to-fuchsia' },
  { icon: <FileText size={22} />, title: 'PDF & Image Support', desc: 'Upload PDF exam papers or scanned image files. Our AI extracts text from both formats flawlessly.', gradient: 'from-fuchsia to-pink' },
  { icon: <Zap size={22} />, title: 'Instant Recommendations', desc: 'Get personalized study advice immediately after upload — no waiting, no manual work.', gradient: 'from-pink to-rose' },
  { icon: <BarChart2 size={22} />, title: 'Visual Insights', desc: 'Beautiful charts show topic frequency at a glance, helping you plan your revision calendar efficiently.', gradient: 'from-indigo to-cyan' },
];

const steps = [
  { num: 1, title: 'Upload Your Paper', desc: 'Drag & drop any past exam paper in PDF or image format. We accept papers from any university or A/L subject.' },
  { num: 2, title: 'AI Analyzes It', desc: 'Our AI engine extracts questions, detects topic patterns, and ranks subjects by how frequently they appear.' },
  { num: 3, title: 'Study Smarter', desc: 'Get topic breakdowns, priority scores, predicted exam areas, and personalized recommendations within seconds.' },
];

const testimonials = [
  { name: 'Kavindi P.', role: 'A/L Mathematics Student', rating: 5, text: 'ExamSense AI changed how I study completely. I uploaded 5 years of past papers and instantly saw which topics appear every year. Scored A in Maths!' },
  { name: 'Tharushi R.', role: 'BSc Engineering, University of Moratuwa', rating: 5, text: 'The topic frequency chart is incredibly useful. I stopped wasting time on low-priority areas and focused on what actually comes in exams.' },
  { name: 'Dineth K.', role: 'A/L Physics & Chemistry', rating: 5, text: 'I was skeptical at first, but the AI recommendations were spot on. Three of the five predicted areas came in my A/L exam!' },
];

const planFeatures = {
  free: ['2 uploads per month', 'AI topic detection', 'Basic recommendations', 'Topic frequency chart', 'Download JSON report'],
  pro: ['Unlimited uploads', 'Advanced AI analysis (GPT-4o)', 'Full recommendations suite', 'Exam area predictions', 'Priority processing', 'Export PDF reports', 'Analysis history', 'Priority support'],
};

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>

      {/* ── Navbar ── */}
      <nav className="landing-nav" style={{ boxShadow: scrolled ? 'var(--shadow-sm)' : 'none' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <Link to="/" className="logo">
            <div className="logo-icon"><Brain size={18} /></div>
            <span className="logo-text">Exam<span>Sense</span> AI</span>
          </Link>

          {/* Desktop Nav */}
          <div className="flex gap-6 items-center" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {['Features', 'How it Works', 'Pricing'].map(label => (
              <a key={label} href={`#${label.toLowerCase().replace(/ /g, '-')}`}
                style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--text-secondary)', padding: '6px 12px', borderRadius: 'var(--radius-md)', transition: 'all 0.2s', textDecoration: 'none' }}
                onMouseEnter={e => { (e.target as HTMLElement).style.color = 'var(--text-primary)'; (e.target as HTMLElement).style.background = 'var(--bg-elevated)'; }}
                onMouseLeave={e => { (e.target as HTMLElement).style.color = 'var(--text-secondary)'; (e.target as HTMLElement).style.background = 'transparent'; }}
              >
                {label}
              </a>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <ThemeToggle />
            <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
            <Link to="/signup" className="btn btn-primary btn-sm">Get Started Free</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hero-section" id="hero">
        <div className="hero-bg" />
        {/* Decorative blobs */}
        <div style={{ position: 'absolute', top: '20%', right: '-5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.08), transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '-5%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.06), transparent 70%)', pointerEvents: 'none' }} />

        <div className="container hero-content" style={{ textAlign: 'center', paddingTop: 80, paddingBottom: 80 }}>
          {/* Pill badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 600, color: 'var(--brand-1)', marginBottom: 28 }}>
            <Sparkles size={13} />
            Powered by GPT-4o · Built for Sri Lankan Students
          </div>

          <h1 style={{ fontSize: 'clamp(2.2rem, 6vw, 4rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: 24, maxWidth: 780, margin: '0 auto 24px' }}>
            Stop Guessing.{' '}
            <span className="gradient-text">Study What Actually Comes</span>
            {' '}in Your Exams.
          </h1>

          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: 580, margin: '0 auto 36px', lineHeight: 1.7 }}>
            Upload past exam papers and let AI detect repeated topics, rank study priorities, and generate personalized recommendations — in seconds.
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 56 }}>
            <Link to="/signup" className="btn btn-primary btn-xl" style={{ gap: 10 }}>
              <Zap size={18} /> Start Analyzing Free
              <ArrowRight size={16} />
            </Link>
            <a href="#how-it-works" className="btn btn-secondary btn-xl" style={{ gap: 8 }}>
              <BookOpen size={16} /> See How It Works
            </a>
          </div>

          {/* Social proof */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ display: 'flex' }}>
                {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="var(--warning)" color="var(--warning)" />)}
              </div>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 500 }}>4.9/5 from 200+ students</span>
            </div>
            <div style={{ width: 1, height: 16, background: 'var(--border-subtle)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Users size={14} color="var(--text-muted)" />
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>500+ papers analyzed</span>
            </div>
            <div style={{ width: 1, height: 16, background: 'var(--border-subtle)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Shield size={14} color="var(--text-muted)" />
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Secure & private</span>
            </div>
          </div>

          {/* Hero mockup card */}
          <div className="animate-float" style={{ marginTop: 64, maxWidth: 680, margin: '64px auto 0' }}>
            <div className="card animate-pulse-glow" style={{ padding: '28px 32px', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Brain size={20} color="white" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Analysis Complete — A/L Math Paper 2023</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--success)', fontWeight: 600 }}>✓ 42 questions detected · 10 topics identified</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { name: 'Calculus & Differentiation', count: 12, pct: 100, color: 'var(--danger)' },
                  { name: 'Probability & Statistics', count: 9, pct: 75, color: 'var(--warning)' },
                  { name: 'Linear Algebra', count: 8, pct: 67, color: 'var(--brand-1)' },
                  { name: 'Integration Techniques', count: 7, pct: 58, color: 'var(--brand-2)' },
                ].map(({ name, count, pct, color }) => (
                  <div key={name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{name}</span>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color }}>{count}×</span>
                    </div>
                    <div style={{ height: 5, background: 'var(--bg-elevated)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 1s ease' }} />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
                <span className="badge badge-danger">🔴 Calculus: HIGH priority</span>
                <span className="badge badge-warning">🟡 Stats: HIGH priority</span>
                <span className="badge badge-brand">💡 4 AI recommendations</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" style={{ padding: '100px 0', background: 'var(--bg-surface)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 600, color: 'var(--brand-1)', marginBottom: 16 }}>
              <Sparkles size={12} /> FEATURES
            </div>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', marginBottom: 16 }}>Everything You Need to Study Smarter</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: 520, margin: '0 auto' }}>
              Our AI does the heavy lifting — you focus on learning the right topics.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {features.map(({ icon, title, desc }) => (
              <div key={title} className="card" style={{ padding: '28px' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginBottom: 18, boxShadow: 'var(--shadow-brand)' }}>
                  {icon}
                </div>
                <h3 style={{ fontSize: '1.05rem', marginBottom: 10 }}>{title}</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" style={{ padding: '100px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 600, color: 'var(--brand-1)', marginBottom: 16 }}>
              <Zap size={12} /> HOW IT WORKS
            </div>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', marginBottom: 16 }}>From Upload to Insights in 3 Steps</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: 480, margin: '0 auto' }}>No setup needed. Just upload your paper and get instant results.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 28, position: 'relative' }}>
            {steps.map(({ num, title, desc }, i) => (
              <div key={num} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative' }}>
                <div className="step-number" style={{ marginBottom: 20, width: 56, height: 56, fontSize: '1.3rem' }}>{num}</div>
                {i < steps.length - 1 && (
                  <div style={{ position: 'absolute', top: 28, left: 'calc(50% + 36px)', right: 'calc(-50% + 36px)', height: 2, background: 'var(--gradient-brand)', opacity: 0.3, display: 'none' }} />
                )}
                <h3 style={{ fontSize: '1.1rem', marginBottom: 12 }}>{title}</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" style={{ padding: '100px 0', background: 'var(--bg-surface)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 600, color: 'var(--brand-1)', marginBottom: 16 }}>
              <Crown size={12} /> PRICING
            </div>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', marginBottom: 16 }}>Simple, Student-Friendly Pricing</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: 480, margin: '0 auto' }}>Start free. Upgrade when you need more. No hidden fees.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, maxWidth: 760, margin: '0 auto' }}>
            {/* Free */}
            <div className="card pricing-card" style={{ padding: '36px 28px' }}>
              <div style={{ marginBottom: 6 }}>
                <span className="badge badge-muted">Free Plan</span>
              </div>
              <div className="pricing-price" style={{ margin: '16px 0' }}>
                <span className="currency">LKR </span>0
                <span className="period"> / forever</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 24 }}>
                Perfect for trying out ExamSense AI
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 28 }}>
                {planFeatures.free.map(f => (
                  <div key={f} className="price-feature">
                    <Check size={15} className="check" />
                    <span>{f}</span>
                  </div>
                ))}
                {['Unlimited uploads', 'Priority processing', 'PDF export'].map(f => (
                  <div key={f} className="price-feature" style={{ opacity: 0.5 }}>
                    <XIcon size={15} className="cross" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              <Link to="/signup" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                Get Started Free
              </Link>
            </div>

            {/* Pro */}
            <div className="card pricing-card featured" style={{ padding: '36px 28px', marginTop: 0 }}>
              <div style={{ marginBottom: 6 }}>
                <span className="badge badge-pro">⚡ Pro Plan</span>
              </div>
              <div className="pricing-price" style={{ margin: '16px 0' }}>
                <span className="currency">LKR </span>1,490
                <span className="period"> / month</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 24 }}>
                For serious students who want maximum results
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 28 }}>
                {planFeatures.pro.map(f => (
                  <div key={f} className="price-feature">
                    <Check size={15} className="check" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              <Link to="/signup" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', gap: 8 }}>
                <Zap size={15} /> Start Pro Free Trial
              </Link>
              <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 12 }}>7-day free trial · Cancel anytime</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonials" style={{ padding: '100px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 600, color: 'var(--brand-1)', marginBottom: 16 }}>
              <Star size={12} /> STUDENT STORIES
            </div>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', marginBottom: 16 }}>Students Love ExamSense AI</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {testimonials.map(({ name, role, rating, text }) => (
              <div key={name} className="testimonial-card">
                <div style={{ paddingTop: 24 }}>
                  <div style={{ display: 'flex', gap: 2, marginBottom: 14 }}>
                    {Array.from({ length: rating }).map((_, i) => (
                      <Star key={i} size={14} fill="var(--warning)" color="var(--warning)" />
                    ))}
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 20 }}>"{text}"</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.95rem', flexShrink: 0 }}>
                      {name[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{name}</div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{role}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section style={{ padding: '60px 0 100px' }}>
        <div className="container">
          <div className="cta-banner">
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{ color: 'white', fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', marginBottom: 16, fontWeight: 800 }}>
                Ready to Study Smarter?
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.88)', marginBottom: 32, maxWidth: 500, margin: '0 auto 32px', fontSize: '1rem' }}>
                Join hundreds of students using AI to master their exams. Start free — no credit card required.
              </p>
              <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/signup" className="btn" style={{ background: 'white', color: 'var(--brand-1)', fontWeight: 700, padding: '14px 32px', borderRadius: 'var(--radius-lg)', gap: 8 }}>
                  <Zap size={16} /> Get Started Free
                </Link>
                <Link to="/login" className="btn" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', padding: '14px 32px', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(10px)' }}>
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', padding: '40px 0', background: 'var(--bg-surface)' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
          <Link to="/" className="logo">
            <div className="logo-icon"><Brain size={16} /></div>
            <span className="logo-text" style={{ fontSize: '1rem' }}>Exam<span>Sense</span> AI</span>
          </Link>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {[['Features', '#features'], ['Pricing', '#pricing'], ['Sign In', '/login'], ['Get Started', '/signup']].map(([label, href]) => (
              href.startsWith('#')
                ? <a key={label} href={href} style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'none' }}>{label}</a>
                : <Link key={label} to={href} style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{label}</Link>
            ))}
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>© 2026 ExamSense AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function Crown({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/>
    </svg>
  );
}
