import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Star, Download, Bookmark, FileText, Clock, ArrowUpRight, MessageSquare } from 'lucide-react';

export interface ResourceItem {
  id: string;
  title: string;
  department: string;
  semester: string;
  course: string;
  uploaderName: string;
  uploaderAvatar?: string;
  rating: number;
  reviewsCount: number;
  viewsCount: number;
  downloadsCount: number;
  commentsCount: number;
  category: string;
  fileType: string;
  fileSize: string;
  pagesCount: number;
  uploadedAt: string;
  gradientClass: string;
  description: string;
  tags: string[];
}

interface ResourceCardProps {
  resource: ResourceItem;
  onSelect: (resource: ResourceItem) => void;
  isBookmarked?: boolean;
  onBookmarkToggle?: (id: string) => void;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  onSelect,
  isBookmarked = false,
  onBookmarkToggle
}) => {
  return (
    <Card
      hoverEffect
      onClick={() => onSelect(resource)}
      className="p-0 overflow-hidden cursor-pointer group flex flex-col justify-between border-slate-200 dark:border-zinc-800 glass-card-hover bg-white dark:bg-zinc-900 shadow-sm rounded-3xl transition-all duration-300"
    >
      {/* Top Cover Gradient Banner */}
      <div className={`h-36 ${resource.gradientClass} p-4 flex flex-col justify-between relative overflow-hidden transition-all group-hover:scale-[1.03]`}>
        {/* Heavy Contrast Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/20" />

        {/* Top Header Controls: Category & Bookmark Toggle */}
        <div className="relative z-10 flex items-center justify-between">
          <Badge variant="blue" className="bg-black/60 backdrop-blur-md border-white/20 text-white font-bold text-[10px] shadow-sm uppercase tracking-wide">
            {resource.category.replace('EXAM_', '').replace('_', ' ')}
          </Badge>

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onBookmarkToggle) onBookmarkToggle(resource.id);
            }}
            className={`p-2 rounded-full backdrop-blur-md transition-all ${
              isBookmarked
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/50 scale-110'
                : 'bg-black/50 text-white/80 hover:text-white hover:bg-black/80 border border-white/20'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 fill-current" />
          </button>
        </div>

        {/* Center Artwork Title */}
        <div className="relative z-10 space-y-0.5">
          <h3 className="text-base font-extrabold text-white tracking-tight drop-shadow-md leading-tight group-hover:text-blue-300 transition-colors">
            {resource.title}
          </h3>
          <p className="text-[11px] text-zinc-200 font-semibold drop-shadow flex items-center gap-1">
            <span>{resource.department && resource.department !== 'undefined' ? resource.department : ''}</span>
            {resource.department && resource.semester && <span>•</span>}
            <span>{resource.semester && resource.semester !== 'undefined' ? resource.semester : ''}</span>
          </p>
        </div>
      </div>

      {/* Card Content & Metadata */}
      <div className="p-4 space-y-3 bg-white dark:bg-zinc-900 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1 font-bold text-slate-800 dark:text-zinc-100 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-zinc-700">
              <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              {resource.fileType || 'FILE'}{resource.fileSize ? ` • ${resource.fileSize}` : ''}
            </span>
            <span className="flex items-center gap-1 text-slate-500 dark:text-zinc-400 font-medium">
              <Clock className="w-3 h-3 text-slate-400" />
              {(!resource.uploadedAt || resource.uploadedAt === 'Invalid Date')
                ? 'Recent'
                : resource.uploadedAt.includes('T')
                ? new Date(resource.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : resource.uploadedAt}
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-zinc-300 font-medium line-clamp-2 leading-relaxed">
            {resource.description}
          </p>
        </div>

        {/* Card Tags */}
        <div className="flex flex-wrap gap-1">
          {(resource.tags && Array.isArray(resource.tags) ? resource.tags : []).slice(0, 3).map((tag) => (
            <span key={tag} className="text-[10px] font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 px-2 py-0.5 rounded-md">
              #{tag}
            </span>
          ))}
        </div>

        {/* Card Footer: Author Pill & Downloads Counter */}
        <div className="pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            <span className="font-extrabold">{resource.rating.toFixed(1)}</span>
            <span className="text-[10px] text-slate-500 font-normal">({resource.reviewsCount})</span>
          </div>

          <div className="flex items-center gap-3 text-slate-700 dark:text-zinc-300">
            <span className="flex items-center gap-1 text-xs font-bold">
              <MessageSquare className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{resource.commentsCount}</span>
            </span>
            <span className="flex items-center gap-1 text-xs font-bold">
              <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{resource.downloadsCount}</span>
            </span>
            <span className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ResourceCard;
