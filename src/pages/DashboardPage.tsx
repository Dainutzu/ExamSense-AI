import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Upload, FileText, TrendingUp, Brain, ChevronRight, Zap, BookOpen, Target, Sparkles, X } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import TopicFrequencyChart from '../components/charts/TopicFrequencyChart';
import StudyProgressChart from '../components/charts/StudyProgressChart';
import { useAuth } from '../contexts/AuthContext';
import { useUploads } from '../hooks/useUploads';
import { useAnalysis } from '../hooks/useAnalysis';
import { formatRelativeTime, formatFileSize } from '../utils/formatters';
import type { Analysis, Topic } from '../lib/supabase';
import { useToast } from '../components/ui/Toast';

export default function DashboardPage() {
  const { profile } = useAuth();
  const { uploads, loading: uploadsLoading } = useUploads();
  const { fetchAllAnalyses } = useAnalysis();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [allTopics, setAllTopics] = useState<Topic[]>([]);
  
  const { success } = useToast();
  const [showVerifiedBanner, setShowVerifiedBanner] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('verified') === 'true') {
      setShowVerifiedBanner(true);
      success('Email Verified! 🎉', 'Welcome to ExamSense AI. Your email has been successfully confirmed.');
      
      // Clean query parameter from URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [success]);

  useEffect(() => {
    fetchAllAnalyses().then(data => {
      setAnalyses(data);
      // Aggregate topics across all analyses
      const topicMap = new Map<string, Topic>();
      data.forEach(a => {
        (a.topics || []).forEach((t: Topic) => {
          const existing = topicMap.get(t.name);
          if (existing) {
            topicMap.set(t.name, { ...existing, count: existing.count + t.count });
          } else {
            topicMap.set(t.name, { ...t });
          }
        });
      });
      setAllTopics(Array.from(topicMap.values()).sort((a, b) => b.count - a.count));
    });
  }, [fetchAllAnalyses]);

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Student';
  const recentUploads = uploads.slice(0, 5);
  const totalQuestions = analyses.reduce((s, a) => s + (a.question_count || 0), 0);
  const highPriority = allTopics.filter(t => t.priority === 'high').length;
  const mediumPriority = allTopics.filter(t => t.priority === 'medium').length;
  const lowPriority = allTopics.filter(t => t.priority === 'low').length;

  const latestRecs = analyses[0]?.recommendations ?? [];


  const statusBadge: Record<string, string> = {
    done: 'badge-success', processing: 'badge-warning',
    pending: 'badge-muted', error: 'badge-danger',
  };

  return (
    <DashboardLayout>
      {showVerifiedBanner && (
        <div style={{
          background: 'linear-gradient(135deg, var(--brand-1) 0%, #6366f1 50%, #4f46e5 100%)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px 24px',
          color: 'white',
          marginBottom: 32,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16
        }}>
          {/* Subtle background decoration */}
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, zIndex: 1 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Sparkles size={20} style={{ color: '#fbbf24' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8, color: 'white', margin: 0 }}>
                Thank you for verifying your email!
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'rgba(255, 255, 255, 0.9)', margin: 0, fontWeight: 500 }}>
                Your account is now fully verified. You can start uploading papers, analyzing topics, and planning your study strategy.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowVerifiedBanner(false)}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: 'white',
              borderRadius: 'var(--radius-md)',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.2s',
              zIndex: 1,
              flexShrink: 0
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)')}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', marginBottom: 4 }}>
              Good {getGreeting()}, {firstName} 👋
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {uploads.length === 0
                ? "Upload your first exam paper to get started"
                : `You have ${uploads.length} paper${uploads.length > 1 ? 's' : ''} analyzed`}
            </p>
          </div>
          <Link to="/upload" className="btn btn-primary" style={{ gap: 8 }}>
            <Upload size={16} /> Upload Paper
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        {[
          { icon: <FileText size={20} />, value: uploads.length, label: 'Papers Uploaded' },
          { icon: <Brain size={20} />, value: analyses.length, label: 'Analyses Done' },
          { icon: <BookOpen size={20} />, value: totalQuestions, label: 'Questions Found' },
          { icon: <Target size={20} />, value: allTopics.length, label: 'Topics Detected' },
        ].map(({ icon, value, label }) => (
          <div key={label} className="stat-card">
            <div className="stat-icon">{icon}</div>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, marginBottom: 24 }}>

        {/* Topic Frequency Chart */}
        <div className="card">
          <div className="section-header">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div className="section-title">Most Repeated Topics</div>
                <div className="section-subtitle">Aggregated across all your uploaded papers</div>
              </div>
              <TrendingUp size={18} color="var(--brand-1)" />
            </div>
          </div>
          {allTopics.length > 0
            ? <TopicFrequencyChart topics={allTopics} height={320} />
            : <EmptyState icon={<TrendingUp size={32} />} text="Upload and analyze papers to see topic trends" />
          }
        </div>

        {/* Priority Breakdown */}
        <div className="card">
          <div className="section-header">
            <div className="section-title">Priority Breakdown</div>
            <div className="section-subtitle">Topic distribution by priority</div>
          </div>
          {allTopics.length > 0
            ? <StudyProgressChart high={highPriority} medium={mediumPriority} low={lowPriority} />
            : <EmptyState icon={<Target size={32} />} text="No data yet" />
          }
        </div>
      </div>

      {/* Bottom Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

        {/* Recent Uploads */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="section-title" style={{ fontSize: '1.05rem' }}>Recent Uploads</div>
              <div className="section-subtitle">Your latest exam papers</div>
            </div>
            <Link to="/history" style={{ fontSize: '0.82rem', color: 'var(--brand-1)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <ChevronRight size={14} />
            </Link>
          </div>
          <div>
            {uploadsLoading
              ? [1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 56, margin: '8px 16px', borderRadius: 8 }} />)
              : recentUploads.length === 0
                ? <div style={{ padding: '32px 24px', textAlign: 'center' }}>
                    <EmptyState icon={<FileText size={28} />} text="No uploads yet" />
                    <Link to="/upload" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>Upload your first paper</Link>
                  </div>
                : recentUploads.map(upload => (
                    <Link
                      key={upload.id}
                      to={`/analysis/${upload.id}`}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 24px', borderBottom: '1px solid var(--border-subtle)', textDecoration: 'none', transition: 'background 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: upload.file_type === 'pdf' ? 'var(--danger-bg)' : 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <FileText size={16} color={upload.file_type === 'pdf' ? 'var(--danger)' : 'var(--brand-1)'} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {upload.file_name}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'flex', gap: 8 }}>
                          <span>{formatFileSize(upload.file_size)}</span>
                          <span>·</span>
                          <span>{formatRelativeTime(upload.created_at)}</span>
                        </div>
                      </div>
                      <span className={`badge ${statusBadge[upload.status]}`}>{upload.status}</span>
                    </Link>
                  ))
            }
          </div>
        </div>

        {/* Study Recommendations */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div className="section-title" style={{ fontSize: '1.05rem' }}>Study Recommendations</div>
              <div className="section-subtitle">Based on your latest analysis</div>
            </div>
            <Zap size={18} color="var(--brand-1)" />
          </div>
          {latestRecs.length === 0
            ? <EmptyState icon={<Brain size={28} />} text="Analyze a paper to get AI study recommendations" />
            : <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {latestRecs.slice(0, 4).map((rec, i) => (
                  <div key={i} className={`recommendation-item ${rec.importance}`}>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%', flexShrink: 0, marginTop: 6,
                      background: rec.importance === 'critical' ? 'var(--danger)' : rec.importance === 'important' ? 'var(--warning)' : 'var(--success)'
                    }} />
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>{rec.text}</p>
                  </div>
                ))}
              </div>
          }
        </div>
      </div>

      {/* Quick Upload CTA */}
      {uploads.length === 0 && (
        <div className="cta-banner" style={{ marginTop: 32 }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ color: 'white', fontSize: '1.6rem', marginBottom: 12 }}>Ready to study smarter?</h2>
            <p style={{ color: 'rgba(255,255,255,0.85)', marginBottom: 24, maxWidth: 480, margin: '0 auto 24px' }}>
              Upload your first past exam paper and let our AI detect patterns, rank topics, and guide your revision.
            </p>
            <Link to="/upload" className="btn" style={{ background: 'white', color: 'var(--brand-1)', fontWeight: 700, padding: '14px 32px', borderRadius: 'var(--radius-lg)' }}>
              <Upload size={16} /> Upload Your First Paper
            </Link>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '32px 16px', color: 'var(--text-muted)' }}>
      <div style={{ opacity: 0.4 }}>{icon}</div>
      <p style={{ fontSize: '0.85rem', textAlign: 'center' }}>{text}</p>
    </div>
  );
}
