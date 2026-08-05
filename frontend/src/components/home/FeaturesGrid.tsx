import React from 'react';
import {
  ShieldCheck,
  Search,
  Users,
  FileCheck,
  Award,
  Zap,
  Sparkles
} from 'lucide-react';

const FEATURES = [
  {
    icon: ShieldCheck,
    title: 'Verified Past Exams',
    description: 'Access solved midterm and final papers checked by course TAs and top-scoring university seniors.',
    color: 'from-blue-500/15 to-indigo-500/15 text-blue-600 dark:text-blue-400'
  },
  {
    icon: Search,
    title: 'Smart Search & Tagging',
    description: 'Instant search by course code, professor name, semester, or topic keywords in under 100 milliseconds.',
    color: 'from-purple-500/15 to-pink-500/15 text-purple-600 dark:text-purple-400'
  },
  {
    icon: Users,
    title: 'Peer Review & Rating',
    description: 'Rate notes, comment with solution corrections, and bookmark your essential study sets for finals week.',
    color: 'from-emerald-500/15 to-teal-500/15 text-emerald-600 dark:text-emerald-400'
  },
  {
    icon: FileCheck,
    title: 'High-Speed Inline Reader',
    description: 'Read multi-page lecture notes and PDF lab manuals directly in your browser with zero latency.',
    color: 'from-amber-500/15 to-orange-500/15 text-amber-600 dark:text-amber-400'
  },
  {
    icon: Award,
    title: 'Contributor Karma System',
    description: 'Upload your notes to earn university reputation points, verified contributor badges, and leaderboard rankings.',
    color: 'from-rose-500/15 to-pink-500/15 text-rose-600 dark:text-rose-400'
  },
  {
    icon: Zap,
    title: '100% Free & Open Vault',
    description: 'Zero paywalls, no forced subscription traps. Built by students, dedicated to preserving academic knowledge.',
    color: 'from-cyan-500/15 to-blue-500/15 text-cyan-600 dark:text-cyan-400'
  }
];

export const FeaturesGrid: React.FC = () => {
  return (
    <section className="py-20 relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Background Decorative Ambient Blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-72 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 text-xs font-bold border border-purple-200 dark:border-purple-500/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Built for Student Excellence</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Everything You Need to <span className="text-gradient-accent">Ace Your Exams</span>
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 font-medium">
          Streamlined tools designed to make study resource discovery fast, reliable, and collaborative.
        </p>
      </div>

      {/* Grid of Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {FEATURES.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <div
              key={idx}
              className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-white/10 glass-card-hover hover:border-slate-300 dark:hover:border-zinc-700 transition-all duration-300 relative group overflow-hidden shadow-xs"
            >
              {/* Feature Icon Shield */}
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${feature.color} border border-slate-200/60 dark:border-white/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm`}>
                <Icon className="w-7 h-7" />
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {feature.title}
              </h3>

              <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed font-medium">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>

    </section>
  );
};

export default FeaturesGrid;
