import React, { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { ResourceCard, ResourceItem } from '../components/resource/ResourceCard';
import { Badge } from '../components/ui/Badge';
import {
  SearchService,
  SearchResult,
  SearchCategory
} from '../services/searchNotificationsBookmarksService';
import {
  Search,
  SlidersHorizontal,
  Loader2,
  FileSearch,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '../components/ui/Button';

interface GlobalSearchViewProps {
  onSelectResource: (resource: ResourceItem) => void;
  bookmarkedIds: string[];
  onBookmarkToggle: (id: string) => void;
}

function toResourceItem(r: SearchResult): ResourceItem {
  const dept = (r as any).departmentName || (r.course as any)?.programs?.departments?.name || (r.course as any)?.semesters?.programs?.departments?.name || 'Academic';
  const sem = (r as any).semesterName || (r.course?.semesterNumber ? `Semester ${r.course.semesterNumber}` : 'Semester 1');
  const crs = r.course?.title || (r as any).courseTitle || '';
  const tagsList = (r as any).tags || [];

  return {
    id: r.id,
    title: r.title,
    description: r.description,
    department: dept,
    semester: sem,
    course: crs,
    uploaderName: r.uploader?.fullName || 'Anonymous Contributor',
    uploaderAvatar: r.uploader?.avatarUrl ?? undefined,
    rating: (r as any).averageRating || 0,
    reviewsCount: (r as any).ratingCount || 0,
    viewsCount: (r as any).viewsCount || 0,
    downloadsCount: (r as any).downloadsCount || 0,
    commentsCount: (r as any).commentsCount || 0,
    category: r.category?.name || (r as any).categoryName || 'Resource',
    fileType: (r as any).fileType || 'PDF',
    fileSize: (r as any).fileSizeFormatted || '',
    pagesCount: 0,
    uploadedAt: new Date(r.createdAt).toLocaleDateString(),
    gradientClass: 'bg-gradient-to-tr from-blue-700 to-indigo-700',
    tags: tagsList
  };
}

const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'downloads', label: 'Most Downloaded' }
];

export const GlobalSearchView: React.FC<GlobalSearchViewProps> = ({
  onSelectResource,
  bookmarkedIds,
  onBookmarkToggle
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [sortBy, setSortBy] = useState<'latest' | 'rating' | 'downloads'>('latest');
  const [categories, setCategories] = useState<SearchCategory[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const LIMIT = 20;

  // Load categories once on mount
  useEffect(() => {
    SearchService.getCategories().then(setCategories).catch(() => {});
  }, []);

  // Debounce the search query by 400ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery), 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Fetch results when query/category/sort/page changes
  const fetchResults = useCallback(async () => {
    setIsLoading(true);
    setHasSearched(true);
    try {
      const catSlug = selectedCategory === 'ALL' ? undefined : selectedCategory;
      const data = await SearchService.search({
        q: debouncedQuery,
        category: catSlug,
        sort: sortBy,
        page,
        limit: LIMIT
      });
      setResults(data.resources);
      setTotal(data.total);
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedQuery, selectedCategory, sortBy, page]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const totalPages = Math.ceil(total / LIMIT);

  const allCategories = [{ id: 'ALL', name: 'All Resources', slug: 'ALL' }, ...categories];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in pb-16">
      <PageHeader
        icon={<Search className="w-7 h-7 text-blue-600 dark:text-blue-500" />}
        title="Global Faceted Search Portal"
        subtitle="Search across all approved academic resources — lecture notes, past papers, projects, and more."
        badge={
          hasSearched && !isLoading ? (
            <Badge variant="blue" className="py-1 px-3 text-xs font-bold">
              {total.toLocaleString()} result{total !== 1 ? 's' : ''} found
            </Badge>
          ) : undefined
        }
      />

      {/* Search Bar + Sort */}
      <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-lg space-y-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 dark:text-zinc-500 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Search by course, topic, instructor, or keyword..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl pl-12 pr-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-600 font-medium"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value as any); setPage(1); }}
            className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white font-medium focus:outline-none focus:border-blue-600"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>Sort: {o.label}</option>
            ))}
          </select>
        </div>

        {/* Category Filter Pills — Live from DB */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <SlidersHorizontal className="w-4 h-4 text-slate-400 dark:text-zinc-500 shrink-0" />
          {allCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setSelectedCategory(cat.slug); setPage(1); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat.slug
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count Row */}
      <div className="flex justify-between items-center border-b border-slate-200 dark:border-zinc-800 pb-3">
        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
          {isLoading ? 'Searching...' : `${total.toLocaleString()} Results`}
        </h2>
        {totalPages > 1 && (
          <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
            Page {page} of {totalPages}
          </span>
        )}
      </div>

      {/* Results Grid */}
      {isLoading ? (
        <div className="flex items-center gap-3 justify-center py-20 text-blue-600">
          <Loader2 className="w-7 h-7 animate-spin" />
          <span className="text-sm font-bold">Searching Supabase...</span>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-slate-300 dark:border-zinc-700 rounded-3xl space-y-3">
          <FileSearch className="w-12 h-12 text-slate-400 dark:text-zinc-500 mx-auto" />
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">No Results Found</h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Try a different search term or remove category filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {results.map((r) => (
            <ResourceCard
              key={r.id}
              resource={toResourceItem(r)}
              onSelect={onSelectResource}
              isBookmarked={bookmarkedIds.includes(r.id)}
              onBookmarkToggle={onBookmarkToggle}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 pt-4">
          <Button
            variant="ghost"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            leftIcon={<ChevronLeft className="w-4 h-4" />}
          >
            Previous
          </Button>
          <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">
            {page} / {totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            rightIcon={<ChevronRight className="w-4 h-4" />}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default GlobalSearchView;
