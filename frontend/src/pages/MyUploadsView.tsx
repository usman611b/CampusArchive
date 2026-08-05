import React, { useEffect, useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { MyUploadsService, UserUpload } from '../services/adminService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Upload,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  BookOpen,
  Trash2
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; icon: React.FC<any>; cls: string }> = {
  PENDING: {
    label: 'Pending Review',
    icon: Clock,
    cls: 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-500/30'
  },
  APPROVED: {
    label: 'Approved & Live',
    icon: CheckCircle2,
    cls: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30'
  },
  REJECTED: {
    label: 'Rejected',
    icon: XCircle,
    cls: 'bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-300 border-red-200 dark:border-red-500/30'
  }
};

interface MyUploadsViewProps {
  onNavigateToUpload: () => void;
}

export const MyUploadsView: React.FC<MyUploadsViewProps> = ({ onNavigateToUpload }) => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [uploads, setUploads] = useState<UserUpload[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadUploads = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await MyUploadsService.getMyUploads();
      setUploads(data);
    } catch {
      setUploads([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUpload = async (upload: UserUpload) => {
    const confirmed = window.confirm(
      `Delete "${upload.title}"?\n\nThis will permanently remove your upload. This cannot be undone.`
    );
    if (!confirmed) return;
    setDeletingId(upload.id);
    try {
      await MyUploadsService.deleteMyUpload(upload.id);
      setUploads((prev) => prev.filter((u) => u.id !== upload.id));
      showSuccess('Upload Deleted', `"${upload.title}" has been removed from your contributions.`);
    } catch (err: any) {
      showError('Delete Failed', err?.response?.data?.message || 'Failed to delete upload.');
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    loadUploads();

    const handleUploadEvent = () => {
      loadUploads();
    };
    window.addEventListener('resource_uploaded', handleUploadEvent);
    return () => window.removeEventListener('resource_uploaded', handleUploadEvent);
  }, [user]);

  const filtered = uploads.filter((u) => filterStatus === 'ALL' || u.status === filterStatus);
  const counts = {
    ALL: uploads.length,
    APPROVED: uploads.filter((u) => u.status === 'APPROVED').length,
    PENDING: uploads.filter((u) => u.status === 'PENDING').length,
    REJECTED: uploads.filter((u) => u.status === 'REJECTED').length
  };

  if (!user) {
    return (
      <div className="max-w-5xl mx-auto py-20 text-center space-y-4">
        <Upload className="w-12 h-12 text-slate-400 dark:text-zinc-500 mx-auto" />
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Sign In to View Your Uploads</h3>
        <p className="text-xs text-slate-500 dark:text-zinc-400">Your contributions are linked to your CampusArchive account.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in pb-16">
      <PageHeader
        icon={<Upload className="w-7 h-7 text-blue-600 dark:text-blue-500" />}
        title="My Academic Contributions"
        subtitle="Track your uploaded notes, past papers, and projects — and their moderation status."
        badge={
          !isLoading ? (
            <Badge variant="blue" className="py-1 px-3 text-xs font-bold">
              {counts.ALL} submission{counts.ALL !== 1 ? 's' : ''}
            </Badge>
          ) : undefined
        }
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={loadUploads}
              isLoading={isLoading}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={onNavigateToUpload}
              leftIcon={<Upload className="w-3.5 h-3.5" />}
            >
              Upload New
            </Button>
          </div>
        }
      />

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-3">
        {(['ALL', 'APPROVED', 'PENDING', 'REJECTED'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              filterStatus === s
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 hover:bg-slate-200'
            }`}
          >
            {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()} ({counts[s]})
          </button>
        ))}
      </div>

      {/* Uploads List */}
      {isLoading ? (
        <div className="flex items-center gap-3 justify-center py-20 text-blue-600">
          <Loader2 className="w-7 h-7 animate-spin" />
          <span className="text-sm font-bold">Loading your uploads from Supabase...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-slate-300 dark:border-zinc-700 rounded-3xl space-y-4">
          <BookOpen className="w-12 h-12 text-slate-400 dark:text-zinc-500 mx-auto" />
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            {filterStatus === 'ALL' ? 'No uploads yet' : `No ${filterStatus.toLowerCase()} submissions`}
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-xs mx-auto">
            {filterStatus === 'ALL'
              ? 'Start contributing to CampusArchive by uploading notes, past papers, or projects for your courses.'
              : `You have no submissions with ${filterStatus.toLowerCase()} status.`}
          </p>
          {filterStatus === 'ALL' && (
            <Button variant="primary" size="sm" onClick={onNavigateToUpload} leftIcon={<Upload className="w-4 h-4" />}>
              Upload First Resource
            </Button>
          )}
        </div>
      ) : (
        <Card className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
          <div className="divide-y divide-slate-100 dark:divide-zinc-800">
            {filtered.map((upload) => {
              const sc = STATUS_CONFIG[upload.status] || STATUS_CONFIG['PENDING'];
              const StatusIcon = sc.icon;
              return (
                <div key={upload.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-zinc-800/30 transition-all">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{upload.title}</span>
                        {upload.fileType && (
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-[10px] font-bold text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">
                            {upload.fileType}
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 flex flex-wrap items-center gap-1.5 font-medium">
                        {upload.departmentName && <span className="font-semibold text-slate-700 dark:text-zinc-300">{upload.departmentName}</span>}
                        {upload.departmentName && upload.semesterName && <span>•</span>}
                        {upload.semesterName && <span className="font-bold text-blue-600 dark:text-blue-400">{upload.semesterName}</span>}
                        {(upload.departmentName || upload.semesterName) && upload.course && <span>•</span>}
                        {upload.course && (
                          <span className="font-mono text-slate-800 dark:text-zinc-200 font-bold">{upload.course.code} {upload.course.title ? `— ${upload.course.title}` : ''}</span>
                        )}
                        {upload.category && <span>• {upload.category.name}</span>}
                        {upload.fileSizeFormatted && <span className="font-semibold text-slate-500 dark:text-zinc-400">• {upload.fileSizeFormatted}</span>}
                      </p>
                      {upload.tags && upload.tags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 mt-1.5">
                          {upload.tags.map((t) => (
                            <span key={t} className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-zinc-800 text-blue-700 dark:text-blue-400 text-[10px] font-bold border border-blue-200 dark:border-zinc-700">
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                      {upload.description && (
                        <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1 line-clamp-1 font-medium">{upload.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(upload.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-extrabold border ${sc.cls}`}>
                      <StatusIcon className="w-3 h-3" />
                      {sc.label}
                    </span>
                    <button
                      onClick={() => handleDeleteUpload(upload)}
                      disabled={deletingId === upload.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-red-50 dark:hover:bg-red-500/20 text-slate-500 dark:text-zinc-400 hover:text-red-700 dark:hover:text-red-400 border border-slate-200 dark:border-zinc-700 hover:border-red-300 dark:hover:border-red-500/40 text-[10px] font-bold transition-all disabled:opacity-50"
                      title="Delete your upload"
                    >
                      {deletingId === upload.id
                        ? <Loader2 className="w-3 h-3 animate-spin" />
                        : <Trash2 className="w-3 h-3" />}
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};

export default MyUploadsView;
