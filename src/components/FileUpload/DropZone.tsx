import { useCallback, useState } from 'react';
import { Upload, FileText, Image, X, CheckCircle, AlertCircle } from 'lucide-react';
import { validateFile, getFileType } from '../../utils/validators';
import { formatFileSize } from '../../utils/formatters';

interface FileWithPreview {
  file: File;
  id: string;
  valid: boolean;
  error?: string;
  preview?: string;
}

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
  isUploading?: boolean;
  maxFiles?: number;
}

export default function DropZone({ onFilesSelected, isUploading = false, maxFiles = 5 }: DropZoneProps) {
  const [dragging, setDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);

  const processFiles = useCallback((rawFiles: File[]) => {
    const processed: FileWithPreview[] = rawFiles.slice(0, maxFiles).map(file => {
      const validation = validateFile(file);
      const id = Math.random().toString(36).slice(2);
      let preview: string | undefined;

      if (file.type.startsWith('image/') && validation.valid) {
        preview = URL.createObjectURL(file);
      }

      return { file, id, valid: validation.valid, error: validation.error, preview };
    });

    setSelectedFiles(processed);
    const validFiles = processed.filter(f => f.valid).map(f => f.file);
    if (validFiles.length > 0) onFilesSelected(validFiles);
  }, [maxFiles, onFilesSelected]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  }, [processFiles]);

  const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(Array.from(e.target.files));
  }, [processFiles]);

  const removeFile = (id: string) => {
    setSelectedFiles(prev => {
      const updated = prev.filter(f => f.id !== id);
      onFilesSelected(updated.filter(f => f.valid).map(f => f.file));
      return updated;
    });
  };

  return (
    <div>
      {/* Drop Zone */}
      <div
        className={`drop-zone ${dragging ? 'dragging' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !isUploading && document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          multiple
          accept=".pdf,image/jpeg,image/png,image/webp"
          style={{ display: 'none' }}
          onChange={onInputChange}
          disabled={isUploading}
        />
        <div className="drop-zone-icon">
          <Upload size={28} color="white" />
        </div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
          {dragging ? 'Drop your files here' : 'Drag & drop exam papers'}
        </h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
          or <span style={{ color: 'var(--brand-1)', fontWeight: 600, cursor: 'pointer' }}>browse your files</span>
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          {['PDF Documents', 'JPEG Images', 'PNG Images', 'WEBP Images'].map(t => (
            <span key={t} className="badge badge-brand">{t}</span>
          ))}
        </div>
        <p style={{ marginTop: 16, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Max file size: 10MB per file</p>
      </div>

      {/* File Previews */}
      {selectedFiles.length > 0 && (
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {selectedFiles.map(({ file, id, valid, error, preview }) => (
            <div key={id} className="file-preview-item" style={{ borderColor: valid ? undefined : 'var(--danger)' }}>
              {/* Icon / Preview */}
              {preview
                ? <img src={preview} alt="" style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6 }} />
                : <div className={`file-type-icon ${getFileType(file) === 'pdf' ? 'file-type-pdf' : 'file-type-image'}`}>
                    {getFileType(file) === 'pdf' ? <FileText size={16} /> : <Image size={16} />}
                  </div>
              }

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</div>
                {valid
                  ? <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{formatFileSize(file.size)}</div>
                  : <div className="form-error"><AlertCircle size={12} />{error}</div>
                }
              </div>

              {/* Status */}
              {valid
                ? <CheckCircle size={18} color="var(--success)" />
                : <AlertCircle size={18} color="var(--danger)" />
              }

              {/* Remove */}
              <button
                onClick={e => { e.stopPropagation(); removeFile(id); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
              >
                <X size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
