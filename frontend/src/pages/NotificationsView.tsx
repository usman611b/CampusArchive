import React, { useEffect, useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import {
  NotificationsService,
  NotificationItem
} from '../services/searchNotificationsBookmarksService';
import { useAuth } from '../context/AuthContext';
import {
  Bell,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  Clock,
  Trash2,
  CheckCheck,
  Loader2,
  XCircle
} from 'lucide-react';

export const NotificationsView: React.FC = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isActing, setIsActing] = useState(false);

  const loadNotifications = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await NotificationsService.getAll();
      setNotifications(data);
    } catch {
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [user]);

  const handleMarkAllRead = async () => {
    if (!user) return;
    setIsActing(true);
    try {
      await NotificationsService.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      window.dispatchEvent(new Event('notifications_updated'));
    } finally {
      setIsActing(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await NotificationsService.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      window.dispatchEvent(new Event('notifications_updated'));
    } catch {}
  };

  const handleClearAll = async () => {
    if (!user) return;
    setIsActing(true);
    try {
      await NotificationsService.clearAll();
      setNotifications([]);
      window.dispatchEvent(new Event('notifications_updated'));
    } finally {
      setIsActing(false);
    }
  };

  const filtered = notifications.filter((n) => (filter === 'unread' ? !n.isRead : true));
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'APPROVAL': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'REJECTION': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'COMMENT_REPLY': return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'KARMA_EARNED': return <Sparkles className="w-4 h-4 text-amber-500" />;
      default: return <ShieldCheck className="w-4 h-4 text-purple-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'APPROVAL': return 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30';
      case 'REJECTION': return 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30';
      case 'COMMENT_REPLY': return 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30';
      case 'KARMA_EARNED': return 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30';
      default: return 'bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/30';
    }
  };

  const formatTime = (iso: string) => {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center space-y-4">
        <Bell className="w-12 h-12 text-slate-400 dark:text-zinc-500 mx-auto" />
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Sign In to View Notifications</h3>
        <p className="text-xs text-slate-500 dark:text-zinc-400">Your notifications are linked to your CampusArchive account.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in pb-16">

      <PageHeader
        icon={<Bell className="w-7 h-7 text-blue-600 dark:text-blue-500" />}
        title="Notifications & Alerts"
        subtitle="Real-time updates on resource approval, Q&A replies, karma earned, and announcements."
        badge={
          unreadCount > 0 ? (
            <Badge variant="blue" className="py-1 px-3 text-xs font-bold">
              {unreadCount} Unread
            </Badge>
          ) : undefined
        }
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAllRead}
              disabled={isActing || unreadCount === 0}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-300 dark:border-zinc-700 disabled:opacity-40"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
            <button
              onClick={handleClearAll}
              disabled={isActing || notifications.length === 0}
              className="px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold transition-all flex items-center gap-1.5 border border-red-200 dark:border-red-500/20 disabled:opacity-40"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear all</span>
            </button>
          </div>
        }
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-3">
        {(['all', 'unread'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              filter === f
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 hover:bg-slate-200'
            }`}
          >
            {f === 'all' ? `All Activity (${notifications.length})` : `Unread (${unreadCount})`}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="flex items-center gap-3 justify-center py-16 text-blue-600">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-sm font-bold">Loading from Supabase...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-300 dark:border-zinc-800 space-y-3">
          <Bell className="w-10 h-10 text-slate-400 dark:text-zinc-500 mx-auto" />
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            {filter === 'unread' ? 'All Caught Up!' : 'No Notifications Yet'}
          </h3>
          <p className="text-xs text-slate-600 dark:text-zinc-400 font-medium">
            {filter === 'unread'
              ? 'You have no unread notifications.'
              : 'Notifications will appear here once you upload resources or join discussions.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <Card
              key={item.id}
              onClick={() => !item.isRead && handleMarkRead(item.id)}
              className={`p-5 flex items-start gap-4 transition-all border cursor-pointer ${
                !item.isRead
                  ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-500/30 shadow-sm'
                  : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800'
              }`}
            >
              <div className={`w-9 h-9 rounded-2xl border flex items-center justify-center shrink-0 shadow-sm mt-0.5 ${getTypeColor(item.type)}`}>
                {getIcon(item.type)}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{item.title}</span>
                    {!item.isRead && (
                      <span className="w-2 h-2 rounded-full bg-blue-500 ring-2 ring-blue-500/20" />
                    )}
                  </h4>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono font-medium flex items-center gap-1 shrink-0 ml-2">
                    <Clock className="w-3 h-3" />
                    {formatTime(item.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed font-medium">
                  {item.message}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}

    </div>
  );
};

export default NotificationsView;
