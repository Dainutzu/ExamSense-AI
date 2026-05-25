import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Target, Zap, TrendingUp, Download, FileText } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import TopicFrequencyChart from '../components/charts/TopicFrequencyChart';
import { useAnalysis } from '../hooks/useAnalysis';
import { supabase } from '../lib/supabase';
import type { Upload } from '../lib/supabase';
import { formatDate, formatFileSize } from '../utils/formatters';
import type { Topic, Recommendation, PredictedArea } from '../lib/supabase';

export default function AnalysisPage() {
  const { id } = useParams<{ id: string }>();
  const { fetchAnalysis, analysis, loading } = useAnalysis();
  const [upload, setUpload] = useState<Upload | null>(null);

  useEffect(() => {
    if (id) {
      fetchAnalysis(id);
      supabase.from('uploads').select('*').eq('id', id).single()
        .then(({ data }) => setUpload(data as Upload));
    }
  }, [id, fetchAnalysis]);

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 140, borderRadius: 18 }} />)}
        </div>
      </DashboardLayout>
    );
  }

  if (!analysis) {
    return (
      <DashboardLayout>
        <div style={{ textAlign: 'center', padding: '80px 24px' }}>
          <FileText size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px', opacity: 0.4 }} />
          <h2 style={{ marginBottom: 8 }}>No Analysis Found</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>This paper may still be processing or does not exist.</p>
          <Link to="/dashboard" className="btn btn-secondary">← Back to Dashboard</Link>
        </div>
      </DashboardLayout>
    );
  }

  const topics: Topic[]           = analysis.topics ?? [];
  const recommendations: Recommendation[] = analysis.recommendations ?? [];
  const predictedAreas: PredictedArea[]   = analysis.predicted_areas ?? [];
  const highTopics   = topics.filter(t => t.priority === 'high');
  const maxCount = Math.max(...topics.map(t => t.count), 1);

  function downloadReport() {
    const report = {
      fileName: upload?.file_name,
      analyzedAt: analysis!.created_at,
      questionCount: analysis!.question_count,
      topics,
      recommendations,
      predictedAreas,
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `examSense-report-${Date.now()}.json`;
    a.click();
  }

  return (
    <DashboardLayout>
      {/* Back + Header */}
      <div style={{ marginBottom: 28 }}>
        <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 16, fontWeight: 500 }}>
          <ArrowLeft size={15} /> Back to Dashboard
        </Link>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', marginBottom: 6 }}>Analysis Results</h1>
            {upload && (
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <FileText size={13} /> {upload.file_name}
                </span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{formatFileSize(upload.file_size)}</span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Analyzed {formatDate(analysis.created_at)}</span>
              </div>
            )}
          </div>
          <button onClick={downloadReport} className="btn btn-secondary" style={{ gap: 8 }}>
            <Download size={15} /> Download Report
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Questions Found', value: analysis.question_count, color: 'var(--brand-1)' },
          { label: 'Topics Detected', value: topics.length, color: 'var(--brand-2)' },
          { label: 'High Priority', value: highTopics.length, color: 'var(--danger)' },
          { label: 'Recommendations', value: recommendations.length, color: 'var(--success)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card" style={{ textAlign: 'center', padding: '20px 16px' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'Space Grotesk', color }}>{value}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, marginBottom: 24 }}>
        {/* Topic Chart */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <TrendingUp size={20} color="var(--brand-1)" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>Topic Frequency</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>How often each topic appeared in the paper</div>
            </div>
          </div>
          <TopicFrequencyChart topics={topics} height={320} />
        </div>

        {/* Predicted Areas */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Target size={20} color="var(--brand-1)" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>Predicted Exam Areas</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>AI-predicted high-likelihood areas</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {predictedAreas.map((p, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--text-primary)' }}>{p.area}</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: p.confidence >= 80 ? 'var(--danger)' : p.confidence >= 60 ? 'var(--warning)' : 'var(--success)' }}>
                    {p.confidence}%
                  </span>
                </div>
                <div className="confidence-bar">
                  <div className="confidence-fill" style={{ width: `${p.confidence}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Topic Breakdown */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <BookOpen size={20} color="var(--brand-1)" />
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>Detailed Topic Breakdown</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>All topics detected with priority levels</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {topics.map((topic, i) => (
            <div key={i} className="topic-bar-item">
              <div className="topic-bar-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}>{topic.name}</span>
                  <span className={`badge ${topic.priority === 'high' ? 'badge-danger' : topic.priority === 'medium' ? 'badge-warning' : 'badge-success'}`}>
                    {topic.priority}
                  </span>
                </div>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {topic.count} {topic.count === 1 ? 'time' : 'times'}
                </span>
              </div>
              <div className="topic-bar-track">
                <div className="topic-bar-fill" style={{ width: `${(topic.count / maxCount) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <Zap size={20} color="var(--brand-1)" />
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>AI Study Recommendations</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Personalized advice based on your paper's patterns</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {recommendations.map((rec, i) => (
            <div key={i} className={`recommendation-item ${rec.importance}`}>
              <div style={{ flexShrink: 0, width: 24, height: 24, borderRadius: '50%', background: rec.importance === 'critical' ? 'var(--danger-bg)' : rec.importance === 'important' ? 'var(--warning-bg)' : 'var(--success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, color: rec.importance === 'critical' ? 'var(--danger)' : rec.importance === 'important' ? 'var(--warning)' : 'var(--success)', border: `1px solid ${rec.importance === 'critical' ? 'rgba(244,63,94,0.3)' : rec.importance === 'important' ? 'rgba(251,146,60,0.3)' : 'rgba(34,211,238,0.3)'}` }}>
                {i + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4, color: rec.importance === 'critical' ? 'var(--danger)' : rec.importance === 'important' ? 'var(--warning)' : 'var(--success)' }}>
                  {rec.importance}
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.55 }}>{rec.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
