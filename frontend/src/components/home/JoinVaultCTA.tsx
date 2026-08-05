import React from 'react';
import { Upload, ArrowRight, Sparkles, BookOpen, ShieldCheck } from 'lucide-react';

interface JoinVaultCTAProps {
  onUploadClick: () => void;
  onBrowseClick: () => void;
}

export const JoinVaultCTA: React.FC<JoinVaultCTAProps> = ({ onUploadClick, onBrowseClick }) => {
  return (
    <section className="py-16 relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative rounded-3xl p-8 sm:p-14 overflow-hidden bg-gradient-to-tr from-blue-900 via-indigo-950 to-purple-950 border border-blue-500/30 shadow-2xl text-white">
        
        {/* Background Radial Glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/20 blur-[140px] pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/20 blur-[140px] pointer-events-none rounded-full" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>Preserve Academic Knowledge</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Have Lecture Notes or Past Exams to Share?
          </h2>

          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-2xl">
            Help thousands of fellow university students excel in their courses. Upload your verified midterm solutions, lab guides, or summaries and earn contributor karma today.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              onClick={onUploadClick}
              className="px-8 py-3.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-500/30 flex items-center gap-2 transition-all hover:scale-105"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Academic Resource</span>
            </button>

            <button
              onClick={onBrowseClick}
              className="px-8 py-3.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm flex items-center gap-2 backdrop-blur-md transition-all"
            >
              <span>Explore Vault</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Guarantee Badges */}
          <div className="pt-6 border-t border-white/10 flex flex-wrap gap-6 text-xs text-zinc-300 font-medium">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              100% Free Forever
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-blue-400" />
              Instant PDF Indexing
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Earn Contributor Badges
            </span>
          </div>
        </div>

      </div>
    </section>
  );
};

export default JoinVaultCTA;
