import React, { useEffect, useState } from 'react';
import { Course, CourseSectionType } from '../types/academic';
import { ResourceCard, ResourceItem } from '../components/resource/ResourceCard';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import {
  AcademicsService,
  ResourceApiItem,
  CommentApiItem,
  ContributorApiItem
} from '../services/academicsService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  BookOpen,
  FileText,
  FileCheck,
  Rocket,
  Book,
  MessageSquare,
  Award,
  Star,
  ChevronLeft,
  Upload,
  Send,
  Info,
  Loader2,
  Video,
  FlaskConical,
  ThumbsUp,
  Sparkles
} from 'lucide-react';

interface CourseHubViewProps {
  course: Course;
  onBack: () => void;
  onSelectResource: (resource: ResourceItem) => void;
  bookmarkedIds: string[];
  onBookmarkToggle: (id: string) => void;
  onNavigateToUpload: () => void;
}

const CATEGORY_SLUG_MAP: Record<string, string> = {
  'notes': 'lecture-notes',
  'past-papers': 'past-papers',
  'assignments': 'assignments',
  'projects': 'projects',
  'books': 'textbooks',
  'videos': 'video-tutorials',
  'lab-manuals': 'lab-manuals',
};

// Converts a backend ResourceApiItem to the frontend ResourceItem shape
function toResourceItem(r: ResourceApiItem): ResourceItem {
  const cObj = (r as any).course || (r as any).courses;
  const dept = (r as any).departmentName || cObj?.programs?.departments?.name || 'Academic';
  const semObj = cObj?.semesters;
  const semNum = semObj?.semester_number || (r as any).semesterNumber;
  const sem = (r as any).semesterName || (semNum ? `Semester ${semNum}` : 'Semester 1');
  const crs = (r as any).courseTitle || cObj?.title || cObj?.code || '';
  const tagsList = (r as any).tags || [];

  return {
    id: r.id,
    title: r.title,
    description: r.description,
    department: dept,
    semester: sem,
    course: crs,
    uploaderName: r.uploader?.fullName || (r as any).uploaderName || 'Anonymous Contributor',
    uploaderAvatar: undefined,
    rating: r.averageRating || 0,
    reviewsCount: (r as any).ratingCount || 0,
    viewsCount: r.viewsCount || 0,
    downloadsCount: r.downloadsCount || 0,
    commentsCount: (r as any).commentsCount || 0,
    category: (r as any).categoryName || (r as any).category?.name || 'Resource',
    fileType: (r as any).fileType || 'PDF',
    fileSize: (r as any).fileSizeFormatted || '',
    pagesCount: 0,
    uploadedAt: new Date(r.createdAt || (r as any).created_at).toLocaleDateString(),
    gradientClass: 'bg-gradient-to-tr from-blue-700 to-indigo-700',
    tags: tagsList
  };
}

export const CourseHubView: React.FC<CourseHubViewProps> = ({
  course,
  onBack,
  onSelectResource,
  bookmarkedIds,
  onBookmarkToggle,
  onNavigateToUpload
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<CourseSectionType>('overview');

  // Resource state by section tab
  const [resources, setResources] = useState<ResourceApiItem[]>([]);
  const [isLoadingResources, setIsLoadingResources] = useState(false);

  // Discussion state
  const [comments, setComments] = useState<CommentApiItem[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  // Contributors state
  const [contributors, setContributors] = useState<ContributorApiItem[]>([]);
  const [isLoadingContributors, setIsLoadingContributors] = useState(false);

  // Load resources when resource tab is selected
  useEffect(() => {
    const resourceTabs = ['notes', 'past-papers', 'assignments', 'projects', 'books', 'videos', 'lab-manuals', 'overview'];
    if (!resourceTabs.includes(activeTab)) return;
    setIsLoadingResources(true);
    const catSlug = CATEGORY_SLUG_MAP[activeTab];
    AcademicsService.getCourseResources(course.id, catSlug)
      .then(setResources)
      .catch(() => setResources([]))
      .finally(() => setIsLoadingResources(false));
  }, [activeTab, course.id]);

  // Load comments when discussion tab is selected
  useEffect(() => {
    if (activeTab !== 'discussion') return;
    setIsLoadingComments(true);
    AcademicsService.getCourseDiscussions(course.id)
      .then(setComments)
      .catch(() => setComments([]))
      .finally(() => setIsLoadingComments(false));
  }, [activeTab, course.id]);

  // Load contributors when contributors tab is selected
  useEffect(() => {
    if (activeTab !== 'contributors') return;
    setIsLoadingContributors(true);
    AcademicsService.getCourseContributors(course.id)
      .then(setContributors)
      .catch(() => setContributors([]))
      .finally(() => setIsLoadingContributors(false));
  }, [activeTab, course.id]);

  const { showSuccess, showError } = useToast();

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !user) return;
    setIsPosting(true);
    try {
      const newComment = await AcademicsService.postCourseComment(course.id, commentText.trim());
      setComments((prev) => [newComment, ...prev]);
      setCommentText('');
      showSuccess('Discussion Message Posted!', 'Your question or tip has been published to the course Q&A board.');
    } catch {
      showError('Failed to Post Comment', 'Please make sure you are signed in.');
    } finally {
      setIsPosting(false);
    }
  };

  const sc = course.sectionsCount || {};
  const courseSections = [
    { id: 'overview', label: 'Overview', icon: Info },
    { id: 'notes', label: `Notes (${(sc as any).notes ?? 0})`, icon: BookOpen },
    { id: 'past-papers', label: `Past Papers (${(sc as any).pastPapers ?? 0})`, icon: FileText },
    { id: 'assignments', label: `Assignments (${(sc as any).assignments ?? 0})`, icon: FileCheck },
    { id: 'projects', label: `Projects (${(sc as any).projects ?? 0})`, icon: Rocket },
    { id: 'books', label: `Books (${(sc as any).books ?? 0})`, icon: Book },
    { id: 'videos', label: `Videos (${(sc as any).videos ?? 0})`, icon: Video },
    { id: 'lab-manuals', label: `Lab Manuals (${(sc as any).labManuals ?? 0})`, icon: FlaskConical },
    { id: 'discussion', label: `Discussion (${comments.length})`, icon: MessageSquare },
    { id: 'contributors', label: 'Contributors', icon: Award }
  ];

  const resourceItems = resources.map(toResourceItem);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in pb-16">

      {/* Back Navigation */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-white transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Academic Explorer</span>
      </button>

      {/* Course Hub Hero Banner */}
      <Card className="p-8 relative overflow-hidden bg-gradient-to-tr from-slate-900 via-blue-950 to-indigo-950 text-white border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-mono font-bold">
                {course.code}
              </span>
              <Badge variant="blue" className="py-0.5 px-3 text-xs font-bold">
                Semester {course.semesterNumber} Course Hub
              </Badge>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              {course.title}
            </h1>

            <p className="text-xs sm:text-sm text-blue-200 font-medium">
              Instructor: <strong className="text-white">{course.instructorName}</strong>
              {course.creditHours ? ` • ${course.creditHours} Credit Hours` : ''}
            </p>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={onNavigateToUpload}
            leftIcon={<Upload className="w-4 h-4" />}
            className="shadow-lg shadow-blue-500/30 font-bold shrink-0"
          >
            Upload to Course Hub
          </Button>
        </div>

        {/* Quick Stats Strip — Live from DB */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-white/10 relative z-10">
          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center space-y-0.5">
            <div className="text-xl font-extrabold text-white">{course.totalResources ?? resources.length}</div>
            <p className="text-[11px] text-zinc-300 font-medium">Archived Resources</p>
          </div>
          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center space-y-0.5">
            <div className="text-xl font-extrabold text-white">{course.contributorsCount ?? 0}</div>
            <p className="text-[11px] text-zinc-300 font-medium">Contributors</p>
          </div>
          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center space-y-0.5">
            <div className="text-xl font-extrabold text-amber-300 flex justify-center items-center gap-1">
              <Star className="w-4 h-4 fill-amber-300" />
              <span>{(course.averageRating ?? 0).toFixed(1)}</span>
            </div>
            <p className="text-[11px] text-zinc-300 font-medium">Average Rating</p>
          </div>
          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center space-y-0.5">
            <div className="text-xl font-extrabold text-emerald-300">{(sc as any).pastPapers ?? 0}</div>
            <p className="text-[11px] text-zinc-300 font-medium">Verified Past Exams</p>
          </div>
        </div>
      </Card>

      {/* Section Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-zinc-800 scrollbar-none">
        {courseSections.map((sec) => {
          const Icon = sec.icon;
          const isActive = activeTab === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => setActiveTab(sec.id as CourseSectionType)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 hover:border-blue-400'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{sec.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 space-y-3 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 shadow-sm">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Course Syllabus & Overview</h3>
              <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed font-medium">
                {course.description}
              </p>
            </Card>

            <div className="space-y-4">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Recently Uploaded Resources</h3>
              {isLoadingResources ? (
                <div className="flex items-center gap-2 py-8 text-blue-600">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-xs font-bold">Loading resources from Supabase...</span>
                </div>
              ) : resourceItems.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-500 dark:text-zinc-400 border border-dashed border-slate-300 dark:border-zinc-700 rounded-2xl">
                  No approved resources uploaded yet. Be the first to contribute!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {resourceItems.slice(0, 4).map((res) => (
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

          <div className="space-y-6">
            <Card className="p-6 space-y-4 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 shadow-sm">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Course Statistics</h3>
              <div className="space-y-3 text-xs text-slate-700 dark:text-zinc-300 font-medium">
                <div className="flex justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                  <span>Course Code</span>
                  <strong className="text-slate-900 dark:text-white font-mono">{course.code}</strong>
                </div>
                <div className="flex justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                  <span>Instructor</span>
                  <strong className="text-slate-900 dark:text-white">{course.instructorName}</strong>
                </div>
                <div className="flex justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                  <span>Total Resources</span>
                  <strong className="text-slate-900 dark:text-white">{course.totalResources ?? resourceItems.length} files</strong>
                </div>
                <div className="flex justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                  <span>Average Rating</span>
                  <strong className="text-amber-600 dark:text-amber-400">{(course.averageRating ?? 0).toFixed(1)} ★</strong>
                </div>
                <div className="flex justify-between">
                  <span>Contributors</span>
                  <strong className="text-slate-900 dark:text-white">{course.contributorsCount ?? 0}</strong>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TABS: Resource Sections */}
      {['notes', 'past-papers', 'assignments', 'projects', 'books', 'videos', 'lab-manuals'].includes(activeTab) && (
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-slate-200 dark:border-zinc-800 pb-3">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white capitalize">
              {activeTab.replace('-', ' ')} Collection
            </h3>
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
              {isLoadingResources ? 'Loading...' : `${resourceItems.length} files for ${course.code}`}
            </span>
          </div>

          {isLoadingResources ? (
            <div className="flex items-center gap-2 py-16 text-blue-600 justify-center">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-xs font-bold">Fetching from Supabase...</span>
            </div>
          ) : resourceItems.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-slate-300 dark:border-zinc-700 rounded-3xl space-y-3">
              <BookOpen className="w-10 h-10 text-slate-400 dark:text-zinc-500 mx-auto" />
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white">No resources in this section yet</h4>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Be the first contributor to upload {activeTab.replace('-', ' ')} for {course.code}!</p>
              <Button variant="primary" size="sm" onClick={onNavigateToUpload} leftIcon={<Upload className="w-4 h-4" />}>
                Upload First Resource
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {resourceItems.map((res) => (
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
      )}

      {/* TAB: Discussion Q&A — Supabase Realtime-Ready */}
      {activeTab === 'discussion' && (
        <div className="space-y-6 max-w-4xl">
          <Card className="p-6 space-y-4 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 shadow-sm">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>Course Q&A Discussion Board</span>
              <Badge variant="blue">{comments.length} messages</Badge>
            </h3>

            {/* Post Comment Form */}
            {user ? (
              <form onSubmit={handlePostComment} className="flex gap-2">
                <input
                  type="text"
                  placeholder={`Ask a question about ${course.code} or share an exam tip...`}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1 bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-600 font-medium"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isPosting}
                  leftIcon={<Send className="w-3.5 h-3.5" />}
                  className="font-bold"
                >
                  Post
                </Button>
              </form>
            ) : (
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-xs text-slate-600 dark:text-zinc-400 font-medium text-center">
                Sign in to join the discussion for {course.code}
              </div>
            )}

            {/* Comments List */}
            {isLoadingComments ? (
              <div className="flex items-center gap-2 py-8 text-blue-600 justify-center">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-xs font-bold">Loading discussions from Supabase...</span>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500 dark:text-zinc-400">
                No discussions yet. Start the first Q&A thread for {course.code}!
              </div>
            ) : (
              <div className="space-y-3 pt-4">
                {comments.map((c) => (
                  <div key={c.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 text-xs space-y-1.5">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-[11px] flex items-center justify-center">
                          {c.author.fullName[0]?.toUpperCase() || 'U'}
                        </div>
                        <span className="font-extrabold text-slate-900 dark:text-white">{c.author.fullName}</span>
                        <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono">@{c.author.username}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">
                          {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <button className="flex items-center gap-1 text-slate-400 hover:text-blue-600 transition-colors">
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span className="text-[10px]">{c.isHelpfulCount}</span>
                        </button>
                      </div>
                    </div>
                    <p className="text-slate-700 dark:text-zinc-300 leading-relaxed font-medium pl-9">{c.content}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* TAB: Contributors — Live from Supabase Karma Engine */}
      {activeTab === 'contributors' && (
        <div className="space-y-6">
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Top Course Contributors</h3>
          {isLoadingContributors ? (
            <div className="flex items-center gap-2 py-8 text-blue-600 justify-center">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-xs font-bold">Fetching contributors from Supabase Karma Engine...</span>
            </div>
          ) : contributors.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-slate-300 dark:border-zinc-700 rounded-3xl text-xs text-slate-500 dark:text-zinc-400">
              No contributors yet. Upload the first resource to become the #1 contributor for {course.code}!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {contributors.map((c, index) => (
                <Card key={c.userId} className="p-6 text-center space-y-3 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 shadow-sm">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xl mx-auto shadow-md overflow-hidden">
                      {c.avatarUrl ? (
                        <img src={c.avatarUrl} alt={c.fullName} className="w-full h-full object-cover" />
                      ) : (
                        c.fullName[0]?.toUpperCase() || 'U'
                      )}
                    </div>
                    {index === 0 && (
                      <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-amber-400 text-white flex items-center justify-center">
                        <Sparkles className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-slate-900 dark:text-white">{c.fullName}</h4>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-bold font-mono">@{c.username}</p>
                  </div>
                  <div className="flex justify-center gap-4 text-xs text-slate-600 dark:text-zinc-400 font-medium pt-2 border-t border-slate-100 dark:border-zinc-800">
                    <span>{c.uploadsCount} uploads</span>
                    <span className="text-amber-600 dark:text-amber-400">{c.avgRating.toFixed(1)} ★</span>
                    <span className="text-emerald-600 dark:text-emerald-400">{c.karmaScore} pts</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default CourseHubView;
