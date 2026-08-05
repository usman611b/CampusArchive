import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import {
  AdminService,
  AdminAnalytics,
  PendingResource,
  AdminUser,
  AuditLogItem
} from '../services/adminService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  ShieldAlert,
  Crown,
  Check,
  X,
  FileText,
  Clock,
  Users,
  Search,
  BarChart3,
  ScrollText,
  Megaphone,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Star,
  Download,
  TrendingUp,
  UserCheck,
  UserX,
  Trash2,
  ChevronDown,
  Send,
  RefreshCw,
  Sparkles,
  Lock
} from 'lucide-react';

type AdminTab = 'overview' | 'moderation' | 'users' | 'audit' | 'announcements';

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: 'bg-gradient-to-r from-amber-500 to-purple-600 text-white font-black shadow-xs',
  ADMINISTRATOR: 'bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-500/30 font-bold',
  MODERATOR: 'bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30 font-bold',
  STUDENT: 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-medium',
};

function formatRelativeTime(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export const AdminDashboardView: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Analytics
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  // Moderation Queue
  const [pendingItems, setPendingItems] = useState<PendingResource[]>([]);
  const [moderationStatusFilter, setModerationStatusFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'>('PENDING');
  const [isLoadingQueue, setIsLoadingQueue] = useState(false);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [deletingResourceId, setDeletingResourceId] = useState<string | null>(null);

  // User Management
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [userTotal, setUserTotal] = useState(0);
  const [userQuery, setUserQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);

  // Announcements
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [announcementTarget, setAnnouncementTarget] = useState('ALL');
  const [isSendingAnnouncement, setIsSendingAnnouncement] = useState(false);
  const [announcementResult, setAnnouncementResult] = useState<string | null>(null);

  const userRoleStr = (user?.role as string) || 'STUDENT';
  const isSuperAdmin = userRoleStr === 'SUPER_ADMIN';
  const isAllowedAdmin = ['SUPER_ADMIN', 'ADMINISTRATOR', 'MODERATOR'].includes(userRoleStr);

  // ── Data Loaders ────────────────────────────────────────────────────────────

  useEffect(() => {
    if (activeTab === 'overview' && isAllowedAdmin) {
      setIsLoadingAnalytics(true);
      AdminService.getAnalytics().then(setAnalytics).catch(() => {}).finally(() => setIsLoadingAnalytics(false));
    }
  }, [activeTab, isAllowedAdmin]);

  useEffect(() => {
    if (activeTab === 'moderation' && isAllowedAdmin) {
      setIsLoadingQueue(true);
      AdminService.getModerationQueue(moderationStatusFilter)
        .then(setPendingItems)
        .catch(() => {})
        .finally(() => setIsLoadingQueue(false));
    }
  }, [activeTab, moderationStatusFilter, isAllowedAdmin]);

  useEffect(() => {
    const handleUploadEvent = () => {
      if (isAllowedAdmin) {
        AdminService.getModerationQueue().then(setPendingItems).catch(() => {});
        AdminService.getAnalytics().then(setAnalytics).catch(() => {});
      }
    };
    window.addEventListener('resource_uploaded', handleUploadEvent);
    return () => window.removeEventListener('resource_uploaded', handleUploadEvent);
  }, [isAllowedAdmin]);

  useEffect(() => {
    if (activeTab === 'users' && isAllowedAdmin) {
      setIsLoadingUsers(true);
      AdminService.getUsers({ q: userQuery, role: userRoleFilter !== 'ALL' ? userRoleFilter : undefined })
        .then(({ users, total }) => { setUsers(users); setUserTotal(total); })
        .catch(() => {})
        .finally(() => setIsLoadingUsers(false));
    }
  }, [activeTab, userQuery, userRoleFilter, isAllowedAdmin]);

  useEffect(() => {
    if (activeTab === 'audit' && isAllowedAdmin) {
      setIsLoadingAudit(true);
      AdminService.getAuditLogs().then(({ auditLogs }) => setAuditLogs(auditLogs)).catch(() => {}).finally(() => setIsLoadingAudit(false));
    }
  }, [activeTab, isAllowedAdmin]);

  const { showSuccess, showError, showWarning, showInfo } = useToast();

  // ── Actions ─────────────────────────────────────────────────────────────────

  const handleApprove = async (id: string) => {
    try {
      await AdminService.approveResource(id);
      setPendingItems((prev) => prev.filter((r) => r.id !== id));
      if (analytics) setAnalytics({ ...analytics, pendingResources: analytics.pendingResources - 1, approvedResources: analytics.approvedResources + 1 });
      showSuccess('Resource Approved!', 'The academic document is now live in the global catalog.');
    } catch { showError('Approval Failed', 'Failed to approve resource.'); }
  };

  const handleReject = async (id: string) => {
    if (!rejectReason.trim()) { showWarning('Reason Required', 'Please enter a rejection reason.'); return; }
    try {
      await AdminService.rejectResource(id, rejectReason);
      setPendingItems((prev) => prev.filter((r) => r.id !== id));
      setRejectingId(null);
      setRejectReason('');
      if (analytics) setAnalytics({ ...analytics, pendingResources: analytics.pendingResources - 1 });
      showInfo('Resource Rejected', 'The uploader will be notified with your feedback.');
    } catch { showError('Rejection Failed', 'Failed to reject resource.'); }
  };

  const handleSuspendUser = async (userId: string) => {
    const reason = prompt('Enter suspension reason:');
    if (!reason) return;
    try {
      await AdminService.suspendUser(userId, reason);
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, isSuspended: true } : u));
      showWarning('User Suspended', 'The student account access has been restricted.');
    } catch (err: any) { showError('Suspension Failed', err?.response?.data?.message || 'Failed to suspend user.'); }
  };

  const handleRestoreUser = async (userId: string) => {
    try {
      await AdminService.restoreUser(userId);
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, isSuspended: false } : u));
      showSuccess('Account Restored', 'The user account access has been restored.');
    } catch { showError('Restore Failed', 'Failed to restore user.'); }
  };

  const handleAdminDeleteResource = async (id: string, title: string) => {
    const reason = window.prompt(`Delete "${title}"?\n\nEnter a reason (shown to the uploader in their notifications):`);
    if (reason === null) return; // cancelled
    setDeletingResourceId(id);
    try {
      await AdminService.deleteResource(id, reason || 'Removed by administrator');
      setPendingItems((prev) => prev.filter((r) => r.id !== id));
      if (analytics) setAnalytics({ ...analytics, pendingResources: Math.max(0, analytics.pendingResources - 1), totalResources: Math.max(0, analytics.totalResources - 1) });
      showSuccess('Resource Deleted', 'The resource has been removed and the uploader has been notified.');
    } catch (err: any) {
      showError('Delete Failed', err?.response?.data?.message || 'Failed to delete resource.');
    } finally {
      setDeletingResourceId(null);
    }
  };

  const handleChangeRole = async (userId: string, currentRole: string) => {
    const roles = isSuperAdmin
      ? ['STUDENT', 'MODERATOR', 'ADMINISTRATOR', 'SUPER_ADMIN']
      : ['STUDENT', 'MODERATOR'];

    const newRole = prompt(`Change role from "${currentRole}" to:\n${roles.join(', ')}`);
    if (!newRole || !roles.includes(newRole)) return;

    try {
      await AdminService.changeUserRole(userId, newRole);
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole as any } : u));
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to change role.');
    }
  };

  const handleSendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle.trim() || !announcementMessage.trim()) return;
    setIsSendingAnnouncement(true);
    try {
      const { notified } = await AdminService.sendAnnouncement(announcementTitle, announcementMessage, announcementTarget);
      setAnnouncementResult(`✅ Announcement sent to ${notified} users.`);
      setAnnouncementTitle('');
      setAnnouncementMessage('');
    } catch {
      setAnnouncementResult('❌ Failed to send announcement.');
    } finally {
      setIsSendingAnnouncement(false);
    }
  };

  // ── Protection Check: If Student, return 403 Forbidden ────────────────────────
  if (!user || !isAllowedAdmin) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto border border-red-200 dark:border-red-500/30">
          <Lock className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">403 Forbidden</h3>
        <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed font-medium">
          Access Denied. You do not have administrator permissions to access the Operations Console.
        </p>
      </div>
    );
  }

  // ── Tabs Config ──────────────────────────────────────────────────────────────

  const tabs: { id: AdminTab; label: string; icon: React.FC<any> }[] = [
    { id: 'overview', label: 'Overview & Analytics', icon: BarChart3 },
    { id: 'moderation', label: `Moderation Queue${analytics ? ` (${analytics.pendingResources})` : ''}`, icon: FileText },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'audit', label: 'Audit Logs', icon: ScrollText },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in pb-16">

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-zinc-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <ShieldAlert className="w-7 h-7 text-red-600 dark:text-red-500" />
            <span>Admin Operations Console</span>
          </h1>
          <p className="text-sm text-slate-600 dark:text-zinc-400 mt-1 font-medium">
            Full operational visibility, moderation controls, RBAC management, and audit logging.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 ${ROLE_COLORS[userRoleStr]}`}>
            {isSuperAdmin && <Crown className="w-3.5 h-3.5 fill-amber-300" />}
            <span>{userRoleStr.replace('_', ' ')}</span>
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-zinc-800 scrollbar-none">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === id
                ? 'bg-red-600 text-white shadow-md shadow-red-500/20'
                : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 hover:border-red-400'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* ── TAB: OVERVIEW & ANALYTICS ─────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {isLoadingAnalytics ? (
            <div className="flex items-center gap-3 justify-center py-16 text-red-600">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-sm font-bold">Loading analytics from Supabase...</span>
            </div>
          ) : analytics ? (
            <>
              {/* KPI Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {[
                  { label: 'Total Users', value: analytics.totalUsers.toLocaleString(), icon: Users, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10' },
                  { label: 'Total Resources', value: analytics.totalResources.toLocaleString(), icon: FileText, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
                  { label: 'Pending Review', value: analytics.pendingResources.toLocaleString(), icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
                  { label: 'Approved', value: analytics.approvedResources.toLocaleString(), icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
                  { label: 'Total Downloads', value: analytics.totalDownloads.toLocaleString(), icon: Download, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
                ].map(({ label, value, icon: Icon, color, bg }) => (
                  <Card key={label} className="p-5 space-y-3 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 shadow-sm">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${bg}`}>
                      <Icon className={`w-4 h-4 ${color}`} />
                    </div>
                    <div>
                      <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{value}</div>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium mt-0.5">{label}</p>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Top Contributors Leaderboard */}
              {analytics.topContributors.length > 0 && (
                <Card className="p-6 space-y-4 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 shadow-sm">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Platform Top Contributors
                  </h3>
                  <div className="space-y-3">
                    {analytics.topContributors.map((c, i) => (
                      <div key={c.userId} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800">
                        <div className="flex items-center gap-3">
                          <span className={`w-6 text-center font-extrabold text-xs ${i === 0 ? 'text-amber-500' : 'text-slate-500 dark:text-zinc-400'}`}>#{i + 1}</span>
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center overflow-hidden">
                            {c.avatarUrl ? <img src={c.avatarUrl} alt={c.fullName} className="w-full h-full object-cover" /> : c.fullName[0]}
                          </div>
                          <div>
                            <p className="text-xs font-extrabold text-slate-900 dark:text-white">{c.fullName}</p>
                            <p className="text-[10px] text-blue-600 dark:text-blue-400 font-mono">@{c.username}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                          <span className="text-slate-600 dark:text-zinc-400">{c.uploadsCount} uploads</span>
                          <span className="text-amber-600 dark:text-amber-400">{c.avgRating.toFixed(1)} ★</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">{c.karmaScore} pts</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </>
          ) : null}
        </div>
      )}

      {/* ── TAB: MODERATION QUEUE & RESOURCE LIBRARY ───────────────────────────── */}
      {activeTab === 'moderation' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-zinc-800 pb-3">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-500" />
              <span>Resource Moderation & Library</span>
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsLoadingQueue(true);
                AdminService.getModerationQueue(moderationStatusFilter)
                  .then(setPendingItems)
                  .catch(() => {})
                  .finally(() => setIsLoadingQueue(false));
              }}
              isLoading={isLoadingQueue}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Refresh
            </Button>
          </div>

          {/* Status Sub-filter Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { id: 'PENDING', label: 'Pending Review' },
              { id: 'APPROVED', label: 'Approved & Live' },
              { id: 'REJECTED', label: 'Rejected Submissions' },
              { id: 'ALL', label: 'All Resources' },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setModerationStatusFilter(id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                  moderationStatusFilter === id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {isLoadingQueue ? (
            <div className="flex items-center gap-3 justify-center py-16 text-amber-600">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-sm font-bold">Loading moderation queue...</span>
            </div>
          ) : pendingItems.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-300 dark:border-zinc-800 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Queue is Empty!</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">All submitted resources have been reviewed.</p>
            </div>
          ) : (
            <Card className="p-4 divide-y divide-slate-100 dark:divide-zinc-800 border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              {pendingItems.map((item) => (
                <div key={item.id} className="py-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{item.title}</span>
                          {(item as any).fileType && (
                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-[10px] font-bold text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">
                              {(item as any).fileType}
                            </span>
                          )}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 flex flex-wrap items-center gap-1 font-medium">
                          <span>by <strong className="text-slate-700 dark:text-zinc-300">{item.uploader?.fullName || (item as any).uploaderName || 'Unknown'}</strong></span>
                          {(item as any).departmentName && <span> • {(item as any).departmentName}</span>}
                          {(item as any).semesterName && <span className="font-bold text-blue-600 dark:text-blue-400"> • {(item as any).semesterName}</span>}
                          {item.course && <span> • <span className="font-mono text-slate-800 dark:text-zinc-200 font-bold">{item.course.code}</span> — {item.course.title}</span>}
                          {item.category && <span> • {item.category.name}</span>}
                          {(item as any).fileSizeFormatted && <span className="font-semibold text-slate-500 dark:text-zinc-400"> • {(item as any).fileSizeFormatted}</span>}
                        </p>
                        {item.description && (
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 line-clamp-1">{item.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatRelativeTime(item.createdAt)}
                      </span>
                      <button
                        onClick={() => handleApprove(item.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/20 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 text-xs font-bold transition-all"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Approve
                      </button>
                      <button
                        onClick={() => setRejectingId(rejectingId === item.id ? null : item.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-500/20 hover:bg-red-100 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/30 text-xs font-bold transition-all"
                      >
                        <X className="w-3.5 h-3.5" />
                        Reject
                      </button>
                      <button
                        onClick={() => handleAdminDeleteResource(item.id, item.title)}
                        disabled={deletingResourceId === item.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-red-50 dark:hover:bg-red-500/20 text-zinc-600 dark:text-zinc-400 hover:text-red-700 dark:hover:text-red-400 border border-zinc-200 dark:border-zinc-700 hover:border-red-300 dark:hover:border-red-500/40 text-xs font-bold transition-all disabled:opacity-50"
                        title="Delete resource permanently (soft-delete with audit log)"
                      >
                        {deletingResourceId === item.id
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <Trash2 className="w-3.5 h-3.5" />}
                        Delete
                      </button>
                    </div>
                  </div>

                  {rejectingId === item.id && (
                    <div className="flex gap-2 ml-13 pl-12">
                      <input
                        type="text"
                        placeholder="Enter rejection reason..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="flex-1 bg-slate-50 dark:bg-zinc-950 border border-red-300 dark:border-red-500/40 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
                      />
                      <button
                        onClick={() => handleReject(item.id)}
                        className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all"
                      >
                        Confirm Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </Card>
          )}
        </div>
      )}

      {/* ── TAB: USER MANAGEMENT ──────────────────────────────────────────────── */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400 dark:text-zinc-500" />
              <input
                type="text"
                placeholder="Search by name, email, or username..."
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                className="w-full bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-600 font-medium"
              />
            </div>
            <select
              value={userRoleFilter}
              onChange={(e) => setUserRoleFilter(e.target.value)}
              className="bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-medium"
            >
              {['ALL', 'STUDENT', 'MODERATOR', 'ADMINISTRATOR', 'SUPER_ADMIN'].map((r) => (
                <option key={r} value={r}>{r === 'ALL' ? 'All Roles' : r}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 font-medium">
            <span>{userTotal.toLocaleString()} users found</span>
          </div>

          {isLoadingUsers ? (
            <div className="flex items-center gap-3 justify-center py-16 text-blue-600">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-sm font-bold">Loading users from Supabase...</span>
            </div>
          ) : (
            <Card className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 overflow-hidden">
              <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                {users.map((u) => (
                  <div key={u.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center overflow-hidden shrink-0">
                        {u.avatarUrl ? <img src={u.avatarUrl} alt={u.fullName} className="w-full h-full object-cover" /> : u.fullName[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-extrabold text-slate-900 dark:text-white">{u.fullName}</span>
                          {u.isSuspended && <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 text-[10px] font-bold">SUSPENDED</span>}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">@{u.username} • {u.email}</p>
                        {u.universityName && <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">{u.universityName}</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2.5 py-1 rounded-xl text-[10px] ${ROLE_COLORS[u.role] || ROLE_COLORS['STUDENT']}`}>{u.role}</span>
                      <button
                        onClick={() => handleChangeRole(u.id, u.role)}
                        className="px-2.5 py-1.5 rounded-xl text-[10px] font-bold bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 transition-all"
                      >
                        Change Role
                      </button>
                      {u.isSuspended ? (
                        <button
                          onClick={() => handleRestoreUser(u.id)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 transition-all"
                        >
                          <UserCheck className="w-3 h-3" />
                          Restore
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSuspendUser(u.id)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-bold bg-red-50 dark:bg-red-500/10 hover:bg-red-100 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20 transition-all"
                        >
                          <UserX className="w-3 h-3" />
                          Suspend
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {users.length === 0 && !isLoadingUsers && (
                  <div className="text-center py-12 text-xs text-slate-500 dark:text-zinc-400">No users found matching your filters.</div>
                )}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ── TAB: AUDIT LOGS ───────────────────────────────────────────────────── */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <ScrollText className="w-5 h-5 text-blue-500" />
              System Audit Logs
            </h2>
            <Button variant="ghost" size="sm" onClick={() => {
              setIsLoadingAudit(true);
              AdminService.getAuditLogs().then(({ auditLogs }) => setAuditLogs(auditLogs)).catch(() => {}).finally(() => setIsLoadingAudit(false));
            }} isLoading={isLoadingAudit} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
              Refresh
            </Button>
          </div>

          {isLoadingAudit ? (
            <div className="flex items-center gap-3 justify-center py-16 text-blue-600">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-sm font-bold">Loading audit logs...</span>
            </div>
          ) : (
            <Card className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
              <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                {auditLogs.length === 0 ? (
                  <div className="text-center py-12 text-xs text-slate-500 dark:text-zinc-400">No audit logs found.</div>
                ) : auditLogs.map((log) => (
                  <div key={log.id} className="p-4 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                      <ScrollText className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-xs font-extrabold text-slate-900 dark:text-white font-mono">{log.action}</span>
                        <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">{formatRelativeTime(log.createdAt)}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                        {log.admin ? `By ${log.admin.fullName} (@${log.admin.username})` : 'System'}
                        {log.resource && ` on "${log.resource.title}"`}
                        {log.reason && ` — ${log.reason}`}
                      </p>
                      {log.details && typeof log.details === 'object' && (
                        <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5 font-mono">
                          {JSON.stringify(log.details)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ── TAB: ANNOUNCEMENTS ────────────────────────────────────────────────── */}
      {activeTab === 'announcements' && (
        <div className="max-w-2xl space-y-6">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-purple-500" />
              Send Platform Announcement
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Broadcasts a notification to all (or targeted) users. Delivered instantly to their Notifications page.
            </p>
          </div>

          <Card className="p-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
            <form onSubmit={handleSendAnnouncement} className="space-y-4">
              <div>
                <label className="text-xs font-extrabold text-slate-900 dark:text-white">Announcement Title <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  placeholder="e.g. 2024 Past Papers Now Available!"
                  className="w-full mt-1 bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-900 dark:text-white">Message <span className="text-red-500">*</span></label>
                <textarea
                  required
                  rows={4}
                  value={announcementMessage}
                  onChange={(e) => setAnnouncementMessage(e.target.value)}
                  placeholder="Write the full announcement text..."
                  className="w-full mt-1 bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-900 dark:text-white">Target Audience</label>
                <select
                  value={announcementTarget}
                  onChange={(e) => setAnnouncementTarget(e.target.value)}
                  className="w-full mt-1 bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white font-medium"
                >
                  <option value="ALL">All Users</option>
                  <option value="STUDENT">Students Only</option>
                  <option value="MODERATOR">Moderators Only</option>
                  <option value="ADMINISTRATOR">Administrators Only</option>
                </select>
              </div>

              {announcementResult && (
                <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                  announcementResult.startsWith('✅')
                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                    : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20'
                }`}>
                  {announcementResult}
                </div>
              )}

              <Button type="submit" variant="primary" isLoading={isSendingAnnouncement} leftIcon={<Send className="w-4 h-4" />} className="w-full font-bold">
                Send Announcement
              </Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardView;
