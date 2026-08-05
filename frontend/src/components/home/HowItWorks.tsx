import React from 'react';
import { Search, Eye, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

const STEPS = [
  {
    step: '01',
    title: 'Search & Filter Vault',
    description: 'Enter your university course code, semester, or topic to find verified study notes and past papers.',
    icon: Search,
    color: 'from-blue-600 to-indigo-600',
    badge: '100ms Search'
  },
  {
    step: '02',
    title: 'Instant Modal Preview',
    description: 'Inspect multi-page PDFs, check peer ratings, view AI summaries, and read instructor verified solutions.',
    icon: Eye,
    color: 'from-purple-600 to-pink-600',
    badge: 'Inline PDF Reader'
  },
  {
    step: '03',
    title: 'Ace Exams & Contribute',
    description: 'Download study materials in 1-click and upload your own notes to build your student karma rank.',
    icon: Sparkles,
    color: 'from-emerald-600 to-teal-600',
    badge: 'Earn Badges'
  }
];

export const HowItWorks: React.FC = () => {
  return (
    <section className="py-16 relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="p-8 sm:p-12 rounded-3xl bg-zinc-900 text-white border border-white/10 shadow-2xl relative overflow-hidden">
        
        {/* Background Radial Light Orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 blur-[100px] pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/20 blur-[100px] pointer-events-none rounded-full" />

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2 relative z-10">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-400">Simple 3-Step Process</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">How CampusArchive Works</h2>
          <p className="text-sm text-zinc-400">From quick search to exam mastery in three effortless steps.</p>
        </div>

        {/* 3 Step Card Sequence */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          {STEPS.map((s, index) => {
            const Icon = s.icon;
            return (
              <div key={s.step} className="relative space-y-4 p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all group">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${s.color} text-white flex items-center justify-center font-bold shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-3xl font-extrabold text-white/20 font-mono">{s.step}</span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wide bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                    {s.badge}
                  </span>
                  <h3 className="text-lg font-bold text-white tracking-tight mt-2">{s.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed mt-1">{s.description}</p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default HowItWorks;
