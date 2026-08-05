import React, { useEffect, useState } from 'react';
import { Award, Star, BookOpen, ShieldCheck } from 'lucide-react';
import { DashboardService } from '../../services/dashboardService';

interface Contributor {
  rank: number;
  id?: string;
  name: string;
  username: string;
  avatarUrl?: string | null;
  department: string;
  score: number;
  uploads: number;
  downloads: number;
  rating?: number;
}

export const ContributorSpotlight: React.FC = () => {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    DashboardService.getLeaderboard()
      .then((data) => setContributors(data || []))
      .catch(() => setContributors([]))
      .finally(() => setIsLoading(false));
  }, []);

  const AVATAR_GRADIENTS = [
    'from-blue-600 to-indigo-600',
    'from-purple-600 to-pink-600',
    'from-emerald-600 to-teal-600',
    'from-amber-600 to-orange-600'
  ];

  return (
    <section className="py-16 relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b border-slate-200 dark:border-white/10 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-bold mb-3 border border-amber-200 dark:border-amber-500/20">
            <Award className="w-3.5 h-3.5" />
            <span>Community Honor Roll</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Top Student Contributors
          </h2>
          <p className="text-sm text-slate-600 dark:text-zinc-400 mt-1 max-w-xl font-medium">
            Recognizing dedicated students sharing high-grade past exams and verified lecture notes.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-500 dark:text-zinc-400 font-medium">
          Loading student leaderboard...
        </div>
      ) : contributors.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 space-y-3">
          <Award className="w-12 h-12 text-amber-500 mx-auto opacity-40" />
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">No Contributor Data Yet</h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto font-medium">
            Be the first student to upload approved study resources and climb the platform honor roll!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {contributors.slice(0, 4).map((c, idx) => (
            <div
              key={c.id || c.name}
              className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-white/10 glass-card-hover hover:border-amber-400 transition-all flex flex-col justify-between space-y-4 relative overflow-hidden shadow-xs"
            >
              {/* Rank Badge Header */}
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 font-extrabold text-xs border border-amber-200 dark:border-amber-500/20">
                  #{c.rank || idx + 1} Rank
                </span>
                <span className="text-[10px] font-bold text-slate-600 dark:text-zinc-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  Karma: {c.score}
                </span>
              </div>

              {/* Avatar & User Details */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${
                    AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length]
                  } flex items-center justify-center font-bold text-white shadow-md text-base`}
                >
                  {c.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">{c.name}</h3>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 font-medium">{c.department}</p>
                </div>
              </div>

              {/* Metrics Ticker */}
              <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {c.score} Karma
                </span>
                <span className="text-slate-600 dark:text-zinc-400 flex items-center gap-1 font-semibold">
                  <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  {c.uploads} Uploads
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default ContributorSpotlight;
