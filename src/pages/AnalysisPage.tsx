import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, BookOpen, Target, Zap, TrendingUp, Download,
  FileText, Brain, Layers, Lightbulb, Calendar, HelpCircle, Star
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import TopicFrequencyChart from '../components/charts/TopicFrequencyChart';
import { useAnalysis } from '../hooks/useAnalysis';
import { supabase } from '../lib/supabase';
import type { Upload } from '../lib/supabase';
import { formatDate, formatFileSize } from '../utils/formatters';
import type { Topic, Recommendation, PredictedArea, TopicMapping, KeyTheory, StudyPlanItem } from '../lib/supabase';

export default function AnalysisPage() {
  const { id } = useParams<{ id: string }>();
  const { fetchAnalysis, analysis, loading } = useAnalysis();
  const [upload, setUpload] = useState<Upload | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'mapping' | 'theories' | 'predictions' | 'plan'>('overview');

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
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 140, borderRadius: 18 }} />)}
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

  const topics: Topic[]                 = analysis.topics ?? [];
  const recommendations: Recommendation[] = analysis.recommendations ?? [];
  const predictedAreas: PredictedArea[] = analysis.predicted_areas ?? [];
  const detectedSubjects: string[]      = analysis.detected_subjects ?? [];
  const topicMapping: TopicMapping[]    = analysis.topic_mapping ?? [];
  const keyTheories: KeyTheory[]        = analysis.key_theories ?? [];
  const highPriorityTopics: string[]    = analysis.high_priority_topics ?? [];
  const predictedQuestions: string[]    = analysis.predicted_questions ?? [];
  const studyPlan: StudyPlanItem[]      = analysis.study_plan ?? [];
  const highTopics                      = topics.filter(t => t.priority === 'high');
  const maxCount                        = Math.max(...topics.map(t => t.count), 1);

  function downloadReport() {
    const report = {
      fileName: upload?.file_name,
      analyzedAt: analysis!.created_at,
      questionCount: analysis!.question_count,
      detectedSubjects,
      topics,
      recommendations,
      predictedAreas,
      topicMapping,
      keyTheories,
      highPriorityTopics,
      predictedQuestions,
      studyPlan,
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `examSense-report-${Date.now()}.json`;
    a.click();
  }

  const tabs = [
    { key: 'overview',    label: 'Overview',         icon: TrendingUp },
    { key: 'mapping',     label: 'Topic Mapping',    icon: Layers },
    { key: 'theories',    label: 'Key Theories',     icon: Lightbulb },
    { key: 'predictions', label: 'Predictions',      icon: Target },
    { key: 'plan',        label: 'Study Plan',       icon: Calendar },
  ] as const;

  return (
    <DashboardLayout>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
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

      {/* Detected Subjects Banner */}
      {detectedSubjects.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(168,85,247,0.12))',
          border: '1px solid rgba(99,102,241,0.25)',
          borderRadius: 'var(--radius-lg)',
          padding: '14px 20px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap'
        }}>
          <Brain size={18} color="var(--brand-1)" />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Detected Subject{detectedSubjects.length > 1 ? 's' : ''}:</span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {detectedSubjects.map((s, i) => (
              <span key={i} style={{
                padding: '3px 12px',
                borderRadius: 20,
                fontSize: '0.78rem',
                fontWeight: 700,
                background: i === 0 ? 'var(--brand-1)' : 'rgba(99,102,241,0.15)',
                color: i === 0 ? '#fff' : 'var(--brand-1)',
                border: i === 0 ? 'none' : '1px solid rgba(99,102,241,0.3)'
              }}>{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Questions Found',    value: analysis.question_count, color: 'var(--brand-1)' },
          { label: 'Topics Detected',    value: topics.length,           color: 'var(--brand-2)' },
          { label: 'High Priority',      value: highTopics.length,       color: 'var(--danger)' },
          { label: 'Key Theories',       value: keyTheories.length,      color: 'var(--warning)' },
          { label: 'Predicted Questions',value: predictedQuestions.length, color: 'var(--success)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card" style={{ textAlign: 'center', padding: '18px 14px' }}>
            <div style={{ fontSize: '1.9rem', fontWeight: 800, fontFamily: 'Space Grotesk', color }}>{value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 22, overflowX: 'auto', paddingBottom: 4 }}>
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px',
              borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer',
              fontSize: '0.83rem', fontWeight: 600, whiteSpace: 'nowrap',
              background: activeTab === key ? 'var(--brand-1)' : 'var(--bg-elevated)',
              color: activeTab === key ? '#fff' : 'var(--text-secondary)',
              transition: 'all 0.18s ease',
              boxShadow: activeTab === key ? '0 2px 12px rgba(99,102,241,0.35)' : 'none',
            }}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* ── Tab: Overview ── */}
      {activeTab === 'overview' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, marginBottom: 20 }}>
            {/* Topic Frequency Chart */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <TrendingUp size={20} color="var(--brand-1)" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>Topic Frequency</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>How often each topic appeared</div>
                </div>
              </div>
              <TopicFrequencyChart topics={topics} height={300} />
            </div>

            {/* High Priority Topics */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <Star size={20} color="var(--warning)" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>High Priority Study Areas</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Focus on these first</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {highPriorityTopics.map((t, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg, var(--brand-1), var(--brand-2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 800, color: '#fff', flexShrink: 0 }}>{i + 1}</div>
                    <span style={{ fontSize: '0.84rem', fontWeight: 500, color: 'var(--text-primary)' }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Detailed Topic Breakdown */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <BookOpen size={20} color="var(--brand-1)" />
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>Detailed Topic Breakdown</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>All topics with priority levels</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {topics.map((topic, i) => (
                <div key={i} className="topic-bar-item">
                  <div className="topic-bar-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}>{topic.name}</span>
                      <span className={`badge ${topic.priority === 'high' ? 'badge-danger' : topic.priority === 'medium' ? 'badge-warning' : 'badge-success'}`}>{topic.priority}</span>
                    </div>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{topic.count} {topic.count === 1 ? 'time' : 'times'}</span>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <Zap size={20} color="var(--brand-1)" />
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>AI Study Recommendations</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Personalised advice based on your paper</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recommendations.map((rec, i) => (
                <div key={i} className={`recommendation-item ${rec.importance}`}>
                  <div style={{ flexShrink: 0, width: 24, height: 24, borderRadius: '50%', background: rec.importance === 'critical' ? 'var(--danger-bg)' : rec.importance === 'important' ? 'var(--warning-bg)' : 'var(--success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, color: rec.importance === 'critical' ? 'var(--danger)' : rec.importance === 'important' ? 'var(--warning)' : 'var(--success)', border: `1px solid ${rec.importance === 'critical' ? 'rgba(244,63,94,0.3)' : rec.importance === 'important' ? 'rgba(251,146,60,0.3)' : 'rgba(34,211,238,0.3)'}` }}>{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4, color: rec.importance === 'critical' ? 'var(--danger)' : rec.importance === 'important' ? 'var(--warning)' : 'var(--success)' }}>{rec.importance}</div>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.55 }}>{rec.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── Tab: Topic Mapping ── */}
      {activeTab === 'mapping' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ padding: '14px 18px', background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(168,85,247,0.08))', border: '1px solid rgba(99,102,241,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Layers size={16} color="var(--brand-1)" />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Each topic is mapped across related academic disciplines to help you study with broader context and prepare for cross-subject questions.
              </span>
            </div>
          </div>
          {topicMapping.map((mapping, i) => (
            <div key={i} className="card">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg, var(--brand-1), var(--brand-2))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '0.8rem', flexShrink: 0 }}>{i + 1}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{mapping.core_topic}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>{mapping.question}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {mapping.related_fields.map((field, j) => (
                    <span key={j} style={{ padding: '2px 10px', background: 'rgba(99,102,241,0.1)', borderRadius: 12, fontSize: '0.74rem', fontWeight: 600, color: 'var(--brand-1)', border: '1px solid rgba(99,102,241,0.2)' }}>{field}</span>
                  ))}
                </div>
              </div>
              <div style={{ padding: '12px 14px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', marginBottom: 10, border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--brand-1)', marginBottom: 5 }}>Explanation</div>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{mapping.explanation}</p>
              </div>
              {mapping.exam_notes && (
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '10px 12px', background: 'rgba(251,146,60,0.07)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(251,146,60,0.2)' }}>
                  <Zap size={13} color="var(--warning)" style={{ marginTop: 2, flexShrink: 0 }} />
                  <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}><strong style={{ color: 'var(--warning)' }}>Exam tip:</strong> {mapping.exam_notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Tab: Key Theories ── */}
      {activeTab === 'theories' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {keyTheories.map((theory, i) => (
              <div key={i} className="card" style={{ borderLeft: '3px solid var(--brand-1)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Lightbulb size={16} color="var(--brand-1)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.3 }}>{theory.name}</div>
                    <span style={{ display: 'inline-block', marginTop: 4, padding: '2px 9px', background: 'rgba(99,102,241,0.1)', borderRadius: 10, fontSize: '0.72rem', fontWeight: 600, color: 'var(--brand-1)' }}>{theory.subject}</span>
                  </div>
                </div>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{theory.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tab: Predictions ── */}
      {activeTab === 'predictions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Confidence bars */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <Target size={20} color="var(--brand-1)" />
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>AI-Predicted Exam Areas</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Likelihood of appearing in your next exam</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {predictedAreas.map((p, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--text-primary)' }}>{p.area}</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: p.confidence >= 80 ? 'var(--danger)' : p.confidence >= 60 ? 'var(--warning)' : 'var(--success)' }}>{p.confidence}%</span>
                  </div>
                  <div className="confidence-bar">
                    <div className="confidence-fill" style={{ width: `${p.confidence}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Predicted questions */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <HelpCircle size={20} color="var(--brand-2)" />
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>Likely Exam Questions</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Practice these types of questions</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {predictedQuestions.map((q, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px 14px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.82rem', color: 'var(--brand-1)', minWidth: 22 }}>Q{i + 1}</span>
                  <span style={{ fontSize: '0.87rem', color: 'var(--text-primary)', lineHeight: 1.55 }}>{q}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Study Plan ── */}
      {activeTab === 'plan' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ padding: '14px 18px', background: 'linear-gradient(135deg, rgba(34,211,238,0.08), rgba(99,102,241,0.08))', border: '1px solid rgba(34,211,238,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar size={16} color="var(--success)" />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                A focused {studyPlan.length}-day study plan generated based on topics detected in your paper.
              </span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {studyPlan.map((item, i) => (
              <div key={i} className="card" style={{ borderTop: '3px solid var(--brand-1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, var(--brand-1), var(--brand-2))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '0.78rem', flexShrink: 0 }}>{i + 1}</div>
                  <div>
                    <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 600 }}>{item.day}</div>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>{item.focus}</div>
                  </div>
                </div>
                <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {item.tasks.map((task, j) => (
                    <li key={j} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--success)', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0, marginTop: 1 }}>✓</span>
                      <span style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
