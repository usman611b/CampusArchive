import React, { useEffect, useState, useMemo } from 'react';
import { ResourceCard, ResourceItem } from '../components/resource/ResourceCard';
import { PageHeader } from '../components/ui/PageHeader';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import {
  BookmarksService,
  BookmarkItem
} from '../services/searchNotificationsBookmarksService';
import { useAuth } from '../context/AuthContext';
import {
  Bookmark,
  Search,
  Layers,
  Loader2,
  BookOpen,
  RefreshCw,
  LogIn
} from 'lucide-react';

interface ResourceLibraryViewProps {
  onSelectResource: (resource: ResourceItem) => void;
  bookmarkedIds: string[];
  onBookmarkToggle: (id: string) => void;
}

function toResourceItem(b: BookmarkItem): ResourceItem {
  return {
    id: b.id,
    title: b.title,
    description: b.description,
    department: b.departmentName || '',
    semester: b.semesterName || (b.course ? `Semester ${b.course.semesterNumber}` : ''),
    course: b.courseTitle || b.course?.title || '',
    uploaderName: b.uploaderName || b.uploader?.fullName || 'Anonymous',
    uploaderAvatar: undefined,
    rating: b.averageRating || 0,
    reviewsCount: b.ratingCount || 0,
    viewsCount: b.viewsCount || 0,
    downloadsCount: b.downloadsCount || 0,
    commentsCount: b.commentsCount || 0,
    category: b.categoryName || b.category?.name || 'Resource',
    fileType: b.fileType || 'FILE',
    fileSize: b.fileSizeFormatted || '',
    pagesCount: 0,
    uploadedAt: b.createdAt,
    gradientClass: 'bg-gradient-to-tr from-indigo-600 to-purple-700',
    tags: b.tags || []
  };
}

export const ResourceLibraryView: React.FC<ResourceLibraryViewProps> = ({
  onSelectResource,
  bookmarkedIds,
  onBookmarkToggle
}) => {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const loadBookmarks = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await BookmarksService.getAll();
      setBookmarks(data);
    } catch {
      setBookmarks([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBookmarks();

    const handleSync = () => loadBookmarks();
    window.addEventListener('bookmark_toggled', handleSync);
    window.addEventListener('resource_uploaded', handleSync);
    return () => {
      window.removeEventListener('bookmark_toggled', handleSync);
      window.removeEventListener('resource_uploaded', handleSync);
    };
  }, [user]);

  // Re-sync: if a bookmark was removed externally, remove it from local list
  useEffect(() => {
    setBookmarks((prev) => prev.filter((b) => bookmarkedIds.includes(b.id)));
  }, [bookmarkedIds]);

  const categories = useMemo(() => {
    const cats = new Set(bookmarks.map((b) => b.category?.name || 'Resource'));
    return ['All', ...Array.from(cats)];
  }, [bookmarks]);

  const filtered = useMemo(() => {
    return bookmarks.filter((b) => {
      const matchesSearch =
        !searchQuery ||
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.course?.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.description || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'All' || (b.category?.name || 'Resource') === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [bookmarks, searchQuery, selectedCategory]);

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto py-20 text-center space-y-4">
        <Bookmark className="w-12 h-12 text-slate-400 dark:text-zinc-500 mx-auto" />
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Sign In to See Your Bookmarks</h3>
        <p className="text-xs text-slate-500 dark:text-zinc-400">Your saved resources are linked to your CampusArchive account.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in pb-16">

      <PageHeader
        icon={<Bookmark className="w-7 h-7 text-blue-600 dark:text-blue-500" />}
        title="Saved Bookmarks"
        subtitle="Your personally bookmarked academic resources — accessible anytime, synced across devices."
        badge={
          !isLoading ? (
            <Badge variant="blue" className="py-1 px-3 text-xs font-bold">
              {bookmarks.length} saved resource{bookmarks.length !== 1 ? 's' : ''}
            </Badge>
          ) : undefined
        }
        action={
          <Button
            variant="ghost"
            size="sm"
            onClick={loadBookmarks}
            isLoading={isLoading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
        }
      />

      {/* Filter Toolbar */}
      <div className="space-y-4 bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div className="flex gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 dark:text-zinc-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Filter your saved resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-blue-600 font-medium"
            />
          </div>
        </div>

        {/* Category Pills — derived from actual bookmarked resources */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pt-2 border-t border-slate-200 dark:border-zinc-800">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-zinc-950 text-slate-700 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-900 border border-slate-200 dark:border-zinc-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center gap-3 justify-center py-20 text-blue-600">
          <Loader2 className="w-7 h-7 animate-spin" />
          <span className="text-sm font-bold">Loading bookmarks from Supabase...</span>
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="text-center py-20 space-y-4 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800">
          <Bookmark className="w-12 h-12 text-slate-400 dark:text-zinc-500 mx-auto" />
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">No Bookmarks Yet</h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-xs mx-auto">
            Browse the Academic Explorer, Course Hubs, or Search — then click the bookmark icon on any resource to save it here.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 space-y-3 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800">
          <Layers className="w-10 h-10 text-slate-400 dark:text-zinc-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Matches Found</h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400">Try adjusting your filters or search term.</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
              Showing {filtered.length} of {bookmarks.length} bookmarked resource{bookmarks.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map((b) => (
              <ResourceCard
                key={b.id}
                resource={toResourceItem(b)}
                onSelect={onSelectResource}
                isBookmarked={bookmarkedIds.includes(b.id)}
                onBookmarkToggle={onBookmarkToggle}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ResourceLibraryView;
