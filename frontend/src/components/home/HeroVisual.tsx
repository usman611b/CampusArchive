import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Award,
  CheckCircle2,
  Download,
  Star,
  BookOpen,
  Zap,
  TrendingUp,
  ShieldCheck,
  Eye,
  ArrowUpRight
} from 'lucide-react';

export const HeroVisual: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'preview' | 'ai'>('preview');

  return (
    <div className="relative w-full max-w-xl mx-auto aspect-[5/4] sm:aspect-square flex items-center justify-center select-none py-6">
      
      {/* Background Radial Glowing Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-blue-600/20 via-purple-600/15 to-pink-500/15 blur-[100px] rounded-full pointer-events-none animate-pulse-glow" />
      <div className="absolute -top-6 -right-6 w-48 h-48 bg-cyan-500/15 blur-[80px] rounded-full pointer-events-none" />

      {/* Floating 3D Badge 1 - Top Left: Verified Past Exam Pill */}
      <div className="absolute top-2 left-2 sm:-left-4 z-30 animate-float-slow">
        <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white/95 dark:bg-zinc-900 border border-slate-200/90 dark:border-blue-500/30 shadow-lg shadow-slate-200/60 dark:shadow-2xl backdrop-blur-xl">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-extrabold text-slate-900 dark:text-white flex items-center gap-1">
              Verified 2025 Past Exam
              <CheckCircle2 className="w-3 h-3 text-emerald-500 fill-emerald-500/20" />
            </div>
            <div className="text-[9px] text-slate-500 dark:text-zinc-400 font-medium">Verified by CS Dept TA</div>
          </div>
        </div>
      </div>

      {/* Floating 3D Badge 2 - Top Right: AI Summarized Badge */}
      <div className="absolute top-8 -right-2 sm:-right-6 z-30 animate-float-reverse">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-purple-500/25 border border-white/20">
          <Sparkles className="w-3.5 h-3.5 animate-spin-slow text-amber-300" />
          <span>AI-Powered Summaries</span>
        </div>
      </div>

      {/* Floating 3D Badge 3 - Bottom Right: Live Downloads Ticker */}
      <div className="absolute bottom-6 right-0 sm:-right-4 z-30 animate-float-slow" style={{ animationDelay: '1.5s' }}>
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-900 dark:bg-zinc-900 text-white border border-slate-800 dark:border-white/10 shadow-xl shadow-slate-900/20 backdrop-blur-xl">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>+1,240 Downloads</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-[10px] text-zinc-400">In the last 24 hours</div>
          </div>
        </div>
      </div>

      {/* Main Glassmorphic Interactive Preview Card Stack */}
      <div className="relative z-20 w-full max-w-md transform sm:rotate-[-2deg] transition-all hover:rotate-0 duration-500">
        
        {/* Decorative Stack Card Behind */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl transform rotate-6 scale-95 opacity-20 blur-sm -z-10" />

        {/* Primary Glass Card */}
        <div className="w-full bg-white/95 dark:bg-zinc-900 border border-slate-200/90 dark:border-white/15 rounded-3xl p-5 sm:p-6 shadow-xl shadow-slate-200/60 dark:shadow-blue-500/10 backdrop-blur-2xl space-y-4">
          
          {/* Card Header Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 p-0.5 shadow-md shadow-blue-500/20">
                <div className="w-full h-full bg-white dark:bg-zinc-900 rounded-[14px] flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div>
                <div className="text-xs font-extrabold text-blue-600 dark:text-blue-400 tracking-wide uppercase flex items-center gap-1">
                  <span>CS101</span>
                  <span>•</span>
                  <span>Semester 4</span>
                </div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight truncate max-w-[200px]">
                  Data Structures & Algorithms Notes
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 px-2.5 py-1 rounded-full text-xs font-extrabold border border-amber-300 dark:border-amber-500/30">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              <span>4.9</span>
            </div>
          </div>

          {/* Tab Switcher inside Visual Card */}
          <div className="flex bg-slate-100 dark:bg-zinc-950 p-1 rounded-xl text-xs font-semibold border border-slate-200/60 dark:border-zinc-800">
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 font-bold ${
                activeTab === 'preview'
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>PDF Live Preview</span>
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 font-bold ${
                activeTab === 'ai'
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>AI Key Insights</span>
            </button>
          </div>

          {/* Interactive Card Body: Content Toggle */}
          {activeTab === 'preview' ? (
            <div className="space-y-3 bg-slate-50 dark:bg-zinc-950/60 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80">
              {/* Fake Document Lines Simulation */}
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-zinc-400 pb-2 border-b border-slate-200 dark:border-zinc-800">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span className="font-semibold">Page 1 of 68</span>
                </span>
                <span className="text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-100 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-500/20">
                  Verified PDF
                </span>
              </div>

              <div className="space-y-2">
                <div className="h-3 bg-slate-200 dark:bg-zinc-800 rounded-full w-3/4 animate-pulse" />
                <div className="h-2 bg-slate-200 dark:bg-zinc-800 rounded-full w-full" />
                <div className="h-2 bg-slate-200 dark:bg-zinc-800 rounded-full w-5/6" />
                <div className="h-2 bg-slate-200 dark:bg-zinc-800 rounded-full w-2/3" />
              </div>

              {/* Code Snippet Box inside PDF Preview */}
              <div className="bg-slate-900 text-emerald-400 p-3 rounded-xl text-[11px] font-mono shadow-inner border border-slate-800">
                <div className="text-slate-400 text-[10px] mb-1">// Binary Search Tree Insert Method</div>
                <code>struct Node* insert(Node* node, int key);</code>
              </div>
            </div>
          ) : (
            <div className="space-y-3 bg-purple-50 dark:bg-purple-950/40 p-4 rounded-2xl border border-purple-200 dark:border-purple-500/30">
              <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-extrabold text-xs">
                <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Automated AI Summary</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed font-sans font-medium">
                Covers Stacks, Queues, BST Operations, AVL Balancing, Heap Sort, and Dijkstra’s Algorithm with C++ implementation examples.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {['#dsa', '#binary_trees', '#avl_tree', '#c++'].map((tag) => (
                  <span key={tag} className="text-[10px] font-bold bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-500/20">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Card Footer Ticker */}
          <div className="pt-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-extrabold text-[10px] text-white">
                UA
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-zinc-100">Uploaded by Usman Ali</div>
                <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">CS Senior • 4.9 Score</div>
              </div>
            </div>

            <button className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all hover:scale-105">
              <span>View</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};

export default HeroVisual;
