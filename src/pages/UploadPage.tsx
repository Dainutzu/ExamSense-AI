import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, AlertCircle, Crown, CheckCircle } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import DropZone from '../components/FileUpload/DropZone';
import UploadProgress from '../components/FileUpload/UploadProgress';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';
import { supabase } from '../lib/supabase';
import { useAnalysis } from '../hooks/useAnalysis';
import { FREE_PLAN_UPLOAD_LIMIT } from '../utils/validators';

interface UploadState {
  fileName: string;
  progress: number;
  status: 'uploading' | 'processing' | 'done' | 'error';
  uploadId?: string;
}

export default function UploadPage() {
  const { user, profile, refreshProfile } = useAuth();
  const { runAnalysis } = useAnalysis();
  const { success, error: toastError, info } = useToast();
  const navigate = useNavigate();

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadStates, setUploadStates] = useState<UploadState[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [doneUploadId, setDoneUploadId] = useState<string | null>(null);

  const isPro = profile?.plan === 'pro';
  const uploadCount = profile?.upload_count ?? 0;
  const atLimit = !isPro && uploadCount >= FREE_PLAN_UPLOAD_LIMIT;

  const handleFilesSelected = useCallback((files: File[]) => {
    setSelectedFiles(files);
    setUploadStates([]);
    setDoneUploadId(null);
  }, []);

  async function handleUpload() {
    if (!user || selectedFiles.length === 0 || isProcessing) return;

    if (atLimit) {
      toastError('Upload limit reached', 'Upgrade to Pro for unlimited uploads');
      return;
    }

    setIsProcessing(true);

    for (const file of selectedFiles) {
      const fileName = file.name;

      // Set uploading state
      setUploadStates(prev => [...prev, { fileName, progress: 10, status: 'uploading' }]);

      try {
        // 1. Upload to Supabase Storage
        const storagePath = `${user.id}/${Date.now()}-${file.name}`;
        const { error: storageErr } = await supabase.storage
          .from('exam-papers')
          .upload(storagePath, file);

        if (storageErr) throw new Error(storageErr.message);

        setUploadStates(prev => prev.map(u => u.fileName === fileName ? { ...u, progress: 40 } : u));

        // 2. Create upload record
        const fileType = file.type === 'application/pdf' ? 'pdf' : 'image';
        const { data: uploadRecord, error: dbErr } = await supabase
          .from('uploads')
          .insert({
            user_id: user.id,
            file_name: file.name,
            file_size: file.size,
            file_type: fileType,
            storage_path: storagePath,
            status: 'processing',
          })
          .select()
          .single();

        if (dbErr) throw new Error(dbErr.message);

        // Increment upload count
        await supabase.from('profiles').update({ upload_count: uploadCount + 1 }).eq('id', user.id);
        await refreshProfile();

        setUploadStates(prev => prev.map(u => u.fileName === fileName
          ? { ...u, progress: 60, status: 'processing', uploadId: uploadRecord.id }
          : u));

        info('Processing...', `AI is analyzing ${file.name}`);

        // 3. Run AI analysis
        const analysis = await runAnalysis(file, uploadRecord.id);

        setUploadStates(prev => prev.map(u => u.fileName === fileName ? { ...u, progress: 100, status: 'done' } : u));

        if (analysis) {
          setDoneUploadId(uploadRecord.id);
          success('Analysis complete!', `Found ${analysis.topics?.length ?? 0} topics in ${file.name}`);
        }

      } catch (err: any) {
        setUploadStates(prev => prev.map(u => u.fileName === fileName ? { ...u, progress: 100, status: 'error' } : u));
        toastError('Upload failed', err.message);
      }
    }

    setIsProcessing(false);
  }

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: '1.75rem', marginBottom: 6 }}>Upload Exam Paper</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Upload past exam papers (PDF or images) and our AI will extract questions, detect topics, and generate study recommendations.
          </p>
        </div>

        {/* Limit Warning */}
        {atLimit && (
          <div style={{ padding: '16px 20px', background: 'var(--warning-bg)', border: '1px solid rgba(251,146,60,0.3)', borderRadius: 'var(--radius-lg)', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
            <AlertCircle size={20} color="var(--warning)" style={{ flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: 'var(--warning)', fontSize: '0.9rem' }}>Free plan limit reached</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                You've used {uploadCount}/{FREE_PLAN_UPLOAD_LIMIT} free uploads. Upgrade to Pro for unlimited analysis.
              </div>
            </div>
            <a href="/settings" className="btn btn-primary btn-sm" style={{ gap: 6, flexShrink: 0 }}>
              <Crown size={13} /> Upgrade
            </a>
          </div>
        )}

        {/* Drop Zone */}
        <div className="card" style={{ marginBottom: 24 }}>
          <DropZone
            onFilesSelected={handleFilesSelected}
            isUploading={isProcessing}
          />
        </div>

        {/* Upload Progress */}
        {uploadStates.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
            {uploadStates.map((u, i) => (
              <UploadProgress key={i} fileName={u.fileName} progress={u.progress} status={u.status} />
            ))}
          </div>
        )}

        {/* Action Buttons */}
        {selectedFiles.length > 0 && uploadStates.every(u => u.status !== 'done') && (
          <button
            id="start-upload-btn"
            className="btn btn-primary btn-lg"
            onClick={handleUpload}
            disabled={isProcessing || atLimit}
            style={{ width: '100%', marginBottom: 16 }}
          >
            {isProcessing
              ? <><div className="spinner spinner-sm" />Processing...</>
              : <><Upload size={18} />Analyze {selectedFiles.length} Paper{selectedFiles.length > 1 ? 's' : ''}</>
            }
          </button>
        )}

        {/* View Results */}
        {doneUploadId && (
          <div style={{ textAlign: 'center', padding: '20px', background: 'var(--success-bg)', border: '1px solid rgba(34,211,238,0.2)', borderRadius: 'var(--radius-lg)' }}>
            <CheckCircle size={32} color="var(--success)" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ color: 'var(--success)', marginBottom: 8 }}>Analysis Complete!</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: 16 }}>
              Your exam paper has been analyzed successfully.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/analysis/${doneUploadId}`)}
            >
              View Full Results →
            </button>
          </div>
        )}

        {/* Info Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 24 }}>
          {[
            { icon: '🔍', title: 'Text Extraction', desc: 'AI reads every page of your PDF or image and extracts all text accurately.' },
            { icon: '📊', title: 'Topic Detection', desc: 'Questions are grouped into topics and ranked by how often they appear.' },
            { icon: '🎯', title: 'Priority Scoring', desc: 'Topics are scored High, Medium, or Low based on repeat frequency.' },
            { icon: '💡', title: 'Study Advice', desc: 'Personalized recommendations tell you exactly what to focus on.' },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="card" style={{ padding: '16px' }}>
              <div style={{ fontSize: '1.4rem', marginBottom: 8 }}>{icon}</div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>{title}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
