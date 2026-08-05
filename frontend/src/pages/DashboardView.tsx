import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { PageHeader } from '../components/ui/PageHeader';
import { ResourceCard, ResourceItem } from '../components/resource/ResourceCard';
import { DashboardService, DashboardMetricsData } from '../services/dashboardService';
import { SearchService } from '../services/searchNotificationsBookmarksService';
import { Upload, Download, Bookmark, Star, ArrowUpRight, Sparkles, Award } from 'lucide-react';

interface DashboardViewProps {
  resources: ResourceItem[];
  onSelectResource: (resource: ResourceItem) => void;
  bookmarkedIds: string[];
  onBookmarkToggle: (id: string) => void;
  onNavigateToUpload: () => void;
  onNavigateToAdmin?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  resources: initialResources,
  onSelectResource,
  bookmarkedIds,
  onBookmarkToggle,
  onNavigateToUpload,
  onNavigateToAdmin
}) => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetricsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [recentResources, setRecentResources] = useState<ResourceItem[]>(initialResources);

  useEffect(() => {
    DashboardService.getDashboardMetrics()
      .then((data) => setMetrics(data))
      .catch(() => {})
      .finally(() => setIsLoading(false));

    // Fetch live recent resources if initialResources is empty
    if (!initialResources || initialResources.length === 0) {
      SearchService.search({ sort: 'latest', limit: 4 })
        .then((res) => {
          const mapped: ResourceItem[] = (res.resources || []).map((r) => ({
            id: r.id,
            title: r.title,
            description: r.description,
            department: r.course?.code || '',
            semester: r.course ? `Semester ${r.course.semesterNumber}` : '',
            course: r.course?.title || '',
            uploaderName: r.uploader?.fullName || 'Anonymous',
            rating: r.averageRating || 0,
            reviewsCount: r.ratingCount || 0,
            viewsCount: 0,
            downloadsCount: 0,
            commentsCount: r.commentsCount || 0,
            category: r.category?.name || 'Notes',
            fileType: 'PDF',
            fileSize: '',
            pagesCount: 0,
            uploadedAt: r.createdAt,
            gradientClass: 'card-gradient-purple',
            tags: []
          }));
          setRecentResources(mapped);
        })
        .catch(() => {});
    }
  }, [initialResources]);

  const totalResources = metrics?.platformCounters?.totalResources ?? 0;
  const totalStudents = metrics?.platformCounters?.totalStudents ?? 0;
  const totalDownloads = metrics?.platformCounters?.totalDownloads ?? 0;
  const totalCourses = metrics?.platformCounters?.totalCourses ?? 0;
  const topContributor = metrics?.topContributor;

  const isAdminUser = user && !['STUDENT', 'GUEST'].includes(user.role as string);

  return (
    <div className="space-y-8 animate-in fade-in pb-16">

      {/* Shared Page Header Component */}
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <span>Welcome back, {user?.fullName || 'User'}!</span>
            <span className="text-2xl">👋</span>
          </span>
        }
        subtitle="Here's what's happening with your academic platform today."
        action={
          <div className="flex items-center gap-2">
            {isAdminUser && onNavigateToAdmin && (
              <button
                onClick={onNavigateToAdmin}
                className="px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-lg shadow-red-500/25 transition-all flex items-center gap-2"
              >
                <span>🛡️ Open Admin Console</span>
              </button>
            )}
            <button
              onClick={onNavigateToUpload}
              className="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Resource</span>
            </button>
          </div>
        }
      />

      {/* Admin Operations Banner */}
      {isAdminUser && onNavigateToAdmin && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-red-900/40 via-purple-900/30 to-slate-900 border border-red-500/30 text-white flex items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/30 border border-red-500/40 text-red-300 flex items-center justify-center font-bold text-lg shrink-0">
              🛡️
            </div>
            <div>
              <h4 className="text-sm font-extrabold">Administrator / Moderator Console Active</h4>
              <p className="text-xs text-slate-300">You have active moderation privileges ({user.role}). Manage users, triage pending resources, and send announcements.</p>
            </div>
          </div>
          <button
            onClick={onNavigateToAdmin}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shrink-0 shadow-md transition-all"
          >
            Launch Console →
          </button>
        </div>
      )}

      {/* 4 Metric Cards Grid - Fully Dynamic Backend Data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Card 1: Total Platform Resources */}
        <Card hoverEffect className="p-5 space-y-3 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-zinc-400">Total Resources</span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold">
              <Upload className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {isLoading ? '...' : totalResources.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-extrabold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Live SQL Aggregation</span>
          </div>
        </Card>

        {/* Card 2: Total Active Students */}
        <Card hoverEffect className="p-5 space-y-3 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-zinc-400">Enrolled Students</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Download className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {isLoading ? '...' : totalStudents.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-extrabold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Live Student Count</span>
          </div>
        </Card>

        {/* Card 3: Total Downloads */}
        <Card hoverEffect className="p-5 space-y-3 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-zinc-400">Total Downloads</span>
            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 flex items-center justify-center font-bold">
              <Bookmark className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {isLoading ? '...' : totalDownloads.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-extrabold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Verified Downloads</span>
          </div>
        </Card>

        {/* Card 4: Top Contributor Score */}
        <Card hoverEffect className="p-5 space-y-3 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-zinc-400">Top Contributor Score</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {isLoading ? '...' : (topContributor?.score || 0)}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-400 font-extrabold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{topContributor?.name || 'No contributors yet'}</span>
          </div>
        </Card>
      </div>

      {/* Top Contributor Spotlight Banner */}
      {topContributor && (
        <Card className="p-6 bg-gradient-to-tr from-slate-900 via-indigo-950 to-blue-950 text-white border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 via-amber-500 to-amber-600 font-bold text-2xl text-slate-950 flex items-center justify-center shadow-lg ring-4 ring-amber-400/20">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-300">#1 Top Contributor Spotlight</span>
                <Badge variant="amber" className="text-[10px] py-0.5 px-2 font-extrabold">Score: {topContributor.score}</Badge>
              </div>
              <h3 className="text-xl font-extrabold text-white mt-1">{topContributor.name}</h3>
              <p className="text-xs text-slate-300 font-medium mt-0.5">{topContributor.department} • {topContributor.rating}★ Rating</p>
            </div>
          </div>
          <Badge variant="emerald" className="py-2 px-4 text-xs font-extrabold">
            Calculated Karma Engine
          </Badge>
        </Card>
      )}

      {/* Recent Resources Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">Recent Resources</h2>
        </div>

        {recentResources.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800">
            <p className="text-sm font-semibold text-slate-600 dark:text-zinc-400">No resources uploaded yet. Be the first to contribute!</p>
            <button
              onClick={onNavigateToUpload}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-full transition-all"
            >
              Upload Notes
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentResources.slice(0, 4).map((res) => (
              <ResourceCard
                key={res.id}
                resource={res}
                onSelect={onSelectResource}
                isBookmarked={bookmarkedIds.includes(res.id)}
                onBookmarkToggle={onBookmarkToggle}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardView;
