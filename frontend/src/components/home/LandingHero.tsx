import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { HeroVisual } from './HeroVisual';
import { DashboardService } from '../../services/dashboardService';
import { Search, ArrowRight, Upload, Sparkles, BookOpen, Users, GraduationCap, Building } from 'lucide-react';

interface LandingHeroProps {
  onSearchSubmit: (query: string) => void;
  onBrowseClick: () => void;
  onUploadClick: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onSearchSubmit,
  onBrowseClick,
  onUploadClick
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [metrics, setMetrics] = useState<{
    totalResources: number;
    totalStudents: number;
    totalCourses: number;
    totalDepartments: number;
  }>({ totalResources: 0, totalStudents: 0, totalCourses: 0, totalDepartments: 6 });

  useEffect(() => {
    DashboardService.getDashboardMetrics()
      .then((data) => {
        if (data?.platformCounters) {
          setMetrics({
            totalResources: data.platformCounters.totalResources || 0,
            totalStudents: data.platformCounters.totalStudents || 0,
            totalCourses: data.platformCounters.totalCourses || 0,
            totalDepartments: 6
          });
        }
      })
      .catch(() => {});
  }, []);

  const QUICK_TAGS = [
    'All',
    'Past Midterms',
    'Lecture Notes',
    'Lab Manuals',
    'Reference Books',
    'Projects'
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearchSubmit(searchQuery);
    }
  };

  const handleTagClick = (tag: string) => {
    setSelectedTag(tag);
    if (tag !== 'All') {
      setSearchQuery(tag);
      onSearchSubmit(tag);
    } else {
      setSearchQuery('');
    }
  };

  return (
    <section className="relative pt-6 sm:pt-10 pb-16 overflow-hidden">
      
      {/* Background Radial Glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-blue-600/20 via-purple-600/15 to-pink-600/15 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Hero Text & Search Bar */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-400 text-xs font-bold shadow-sm backdrop-blur-md animate-ambient-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-500 animate-spin-slow" />
              <span>#1 Academic Resource Platform for Students</span>
            </div>

            {/* Headline */}
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.08] font-display">
                <span className="text-slate-900 dark:text-white">Preserving Knowledge.</span> <br />
                <span className="text-gradient-accent">Empowering Students.</span>
              </h1>

              <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-sans font-medium">
                Upload, discover, and share academic resources from your university community. Access verified past exams, lecture notes, lab manuals, and projects.
              </p>
            </div>

            {/* Hero Search Bar */}
            <div className="space-y-3 max-w-xl mx-auto lg:mx-0">
              <form onSubmit={handleSearch} className="relative flex items-center">
                <Search className="w-5 h-5 text-slate-400 dark:text-zinc-400 absolute left-4 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search notes, past papers, books, projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700/80 focus:border-blue-600 text-slate-900 dark:text-zinc-100 placeholder-slate-400 rounded-full pl-12 pr-36 py-4 text-sm shadow-lg shadow-slate-200/50 dark:shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 backdrop-blur-xl transition-all font-medium"
                />
                
                <div className="absolute right-2 flex items-center gap-1.5">
                  <span className="hidden sm:inline-block px-2 py-1 text-[10px] bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 rounded-md font-mono font-bold">
                    ⌘K
                  </span>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all hover:scale-105"
                  >
                    Search
                  </button>
                </div>
              </form>

              {/* Quick Filter Tag Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs justify-center lg:justify-start scrollbar-none">
                <span className="text-[11px] text-slate-600 dark:text-zinc-400 font-bold mr-1">Trending:</span>
                {QUICK_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all whitespace-nowrap ${
                      selectedTag === tag
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                        : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Dual CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-1">
              <Button
                variant="primary"
                size="lg"
                onClick={onBrowseClick}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="rounded-full px-8 shadow-lg shadow-blue-500/25 text-sm font-bold"
              >
                Browse Resources
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={onUploadClick}
                leftIcon={<Upload className="w-4 h-4 text-blue-600 dark:text-blue-500" />}
                className="rounded-full px-8 border-slate-300 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-800 dark:text-white text-sm font-bold"
              >
                Upload Resource
              </Button>
            </div>

            {/* Metric Counters Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-slate-200 dark:border-white/10 text-center lg:text-left">
              <div className="flex items-center gap-3 justify-center lg:justify-start p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/50 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">{metrics.totalResources.toLocaleString()}</div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">Resources</div>
                </div>
              </div>

              <div className="flex items-center gap-3 justify-center lg:justify-start p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/50 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">{metrics.totalStudents.toLocaleString()}</div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">Students</div>
                </div>
              </div>

              <div className="flex items-center gap-3 justify-center lg:justify-start p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/50 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">{metrics.totalCourses.toLocaleString()}</div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">Courses</div>
                </div>
              </div>

              <div className="flex items-center gap-3 justify-center lg:justify-start p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/50 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">{metrics.totalDepartments.toLocaleString()}</div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">Departments</div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Hero Visual */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <HeroVisual />
          </div>

        </div>
      </div>
    </section>
  );
};

export default LandingHero;
