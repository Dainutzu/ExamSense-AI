import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Trash2, Eye, Search } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useUploads } from '../hooks/useUploads';
import { useToast } from '../components/ui/Toast';
import { formatDateTime, formatFileSize } from '../utils/formatters';

export default function HistoryPage() {
  const { uploads, loading, deleteUpload } = useUploads();
  const { success } = useToast();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'done' | 'processing' | 'error'>('all');

  const filtered = uploads
    .filter(u => u.file_name.toLowerCase().includes(search.toLowerCase()))
    .filter(u => filter === 'all' || u.status === filter);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This will also remove its analysis.`)) return;
    await deleteUpload(id);
    success('Deleted', `"${name}" has been removed.`);
  }

  const statusBadge: Record<string, string> = {
    done: 'badge-success', processing: 'badge-warning',
    pending: 'badge-muted', error: 'badge-danger',
  };

  return (
    <DashboardLayout>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: 6 }}>Upload History</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>All your analyzed exam papers in one place</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="form-input"
            style={{ paddingLeft: 38 }}
            placeholder="Search files..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['all', 'done', 'processing', 'error'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`btn ${filter === f ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'}`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading
          ? <div style={{ padding: 24 }}>
              {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 52, marginBottom: 10, borderRadius: 8 }} />)}
            </div>
          : filtered.length === 0
            ? <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <FileText size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                <p>{search || filter !== 'all' ? 'No matching papers found' : 'No uploads yet'}</p>
                {!search && filter === 'all' && (
                  <Link to="/upload" className="btn btn-primary btn-sm" style={{ marginTop: 16 }}>Upload your first paper</Link>
                )}
              </div>
            : <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
                <table>
                  <thead>
                    <tr>
                      <th>File Name</th>
                      <th>Type</th>
                      <th>Size</th>
                      <th>Status</th>
                      <th>Uploaded</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(upload => (
                      <tr key={upload.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: 8, background: upload.file_type === 'pdf' ? 'var(--danger-bg)' : 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <FileText size={14} color={upload.file_type === 'pdf' ? 'var(--danger)' : 'var(--brand-1)'} />
                            </div>
                            <span style={{ fontWeight: 500, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{upload.file_name}</span>
                          </div>
                        </td>
                        <td><span className="badge badge-muted">{upload.file_type.toUpperCase()}</span></td>
                        <td style={{ color: 'var(--text-muted)' }}>{formatFileSize(upload.file_size)}</td>
                        <td><span className={`badge ${statusBadge[upload.status]}`}>{upload.status}</span></td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{formatDateTime(upload.created_at)}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                            {upload.status === 'done' && (
                              <Link to={`/analysis/${upload.id}`} className="btn btn-ghost btn-sm" style={{ gap: 5 }}>
                                <Eye size={13} /> View
                              </Link>
                            )}
                            <button onClick={() => handleDelete(upload.id, upload.file_name)} className="btn btn-danger btn-sm" style={{ gap: 5 }}>
                              <Trash2 size={13} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
        }
      </div>
    </DashboardLayout>
  );
}
