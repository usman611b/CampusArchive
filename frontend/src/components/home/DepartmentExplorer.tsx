import React, { useEffect, useState } from 'react';
import { AcademicsService, DepartmentApiItem } from '../../services/academicsService';
import {
  Code2,
  Cpu,
  Building2,
  Stethoscope,
  Briefcase,
  Cog,
  BookOpen,
  ArrowRight,
  Sparkles,
  Loader2,
  GraduationCap,
  Users,
  Star,
  Download
} from 'lucide-react';

interface DepartmentExplorerProps {
  onSelectDepartment?: (deptSlug: string) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Code2,
  Cpu,
  Briefcase,
  Stethoscope,
  Building: Building2,
  Building2,
  Cog
};

const COLOR_MAP: Record<string, { bg: string; border: string }> = {
  'computer-science': {
    bg: 'from-blue-600/10 via-indigo-600/5 to-blue-500/5',
    border: 'group-hover:border-blue-500/50'
  },
  'electrical-engineering': {
    bg: 'from-purple-600/10 via-indigo-600/5 to-purple-500/5',
    border: 'group-hover:border-purple-500/50'
  },
  'business-management': {
    bg: 'from-amber-600/10 via-orange-600/5 to-amber-500/5',
    border: 'group-hover:border-amber-500/50'
  },
  'medical-life-sciences': {
    bg: 'from-emerald-600/10 via-teal-600/5 to-emerald-500/5',
    border: 'group-hover:border-emerald-500/50'
  },
  'civil-engineering': {
    bg: 'from-cyan-600/10 via-blue-600/5 to-cyan-500/5',
    border: 'group-hover:border-cyan-500/50'
  },
  'mechanical-engineering': {
    bg: 'from-rose-600/10 via-pink-600/5 to-rose-500/5',
    border: 'group-hover:border-rose-500/50'
  }
};

export const DepartmentExplorer: React.FC<DepartmentExplorerProps> = ({
  onSelectDepartment
}) => {
  const [departments, setDepartments] = useState<DepartmentApiItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    AcademicsService.getDepartments()
      .then((data) => setDepartments(data || []))
      .catch(() => setDepartments([]))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <section className="py-16 relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b border-slate-200 dark:border-white/10 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-bold mb-3 border border-blue-200 dark:border-blue-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Academic Faculties — Supabase Live</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Explore Resources by Department
          </h2>
          <p className="text-sm text-slate-600 dark:text-zinc-400 mt-1 max-w-xl font-medium">
            Select your discipline to access verified past papers, lecture notes, lab manuals, and course guides.
          </p>
        </div>

        <button
          onClick={() => onSelectDepartment && onSelectDepartment('computer-science')}
          className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500 transition-colors group"
        >
          <span>Browse All Departments</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Grid of Department Cards — 100% Dynamic from Backend */}
      {isLoading ? (
        <div className="flex items-center justify-center gap-3 py-16 text-blue-600">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-sm font-bold">Loading departments from Supabase...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => {
            const Icon = ICON_MAP[dept.iconName] || GraduationCap;
            const color = COLOR_MAP[dept.slug] || {
              bg: 'from-blue-600/10 to-indigo-600/5',
              border: 'group-hover:border-blue-500/50'
            };

            return (
              <div
                key={dept.id}
                onClick={() => onSelectDepartment && onSelectDepartment(dept.slug)}
                className={`group cursor-pointer p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-white/10 hover:border-slate-300 ${color.border} transition-all duration-300 glass-card-hover relative overflow-hidden flex flex-col justify-between shadow-xs`}
              >
                {/* Background Glow */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${color.bg} opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}
                />

                <div className="relative z-10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-800 dark:text-white group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold font-mono bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30">
                      {dept.code}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {dept.name}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1 line-clamp-2 font-medium leading-relaxed">
                      {dept.description}
                    </p>
                  </div>
                </div>

                {/* Live Dynamic Stats Strip */}
                <div className="relative z-10 pt-4 mt-4 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-600 dark:text-zinc-400 flex items-center gap-1.5 font-semibold">
                    <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    {dept.resourcesCount} Files • {dept.programsCount ?? 0} Programs
                  </span>
                  <span className="text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    Explore <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default DepartmentExplorer;
