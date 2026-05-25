interface UploadProgressProps {
  fileName: string;
  progress: number;
  status: 'uploading' | 'processing' | 'done' | 'error';
}

export default function UploadProgress({ fileName, progress, status }: UploadProgressProps) {
  const statusConfig = {
    uploading:  { label: 'Uploading...', color: 'var(--brand-1)' },
    processing: { label: 'Analyzing with AI...', color: 'var(--brand-3)' },
    done:       { label: 'Analysis complete!', color: 'var(--success)' },
    error:      { label: 'Error occurred', color: 'var(--danger)' },
  };

  const { label, color } = statusConfig[status];

  return (
    <div style={{ padding: '16px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--text-primary)' }}>{fileName}</span>
        <span style={{ fontSize: '0.82rem', fontWeight: 600, color }}>{label}</span>
      </div>
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{
            width: `${progress}%`,
            background: status === 'error' ? 'var(--danger)' : status === 'done' ? 'linear-gradient(90deg, var(--success), #38bdf8)' : undefined
          }}
        />
      </div>
      {status === 'processing' && (
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 8 }}>
          🤖 AI is extracting questions and detecting topic patterns...
        </p>
      )}
    </div>
  );
}
