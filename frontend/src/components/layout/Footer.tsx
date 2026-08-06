import React from 'react';
import { BookOpen, Github, Twitter, Linkedin, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-zinc-950/90 text-slate-600 dark:text-zinc-400 text-xs py-12 relative z-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-xs shadow-sm">
                C
              </div>
              <span className="font-extrabold text-base text-slate-900 dark:text-white tracking-tight font-display">CampusArchive</span>
            </div>
            <p className="text-slate-600 dark:text-zinc-400 text-xs leading-relaxed font-medium">
              Cloud-based academic resource management platform empowering university students to preserve and share knowledge.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-3">Resources</h4>
            <ul className="space-y-2 text-slate-600 dark:text-zinc-400 font-medium">
              <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Past Midterm Papers</a></li>
              <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Lecture Notes & Slides</a></li>
              <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Lab Reports & Code</a></li>
              <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Homework Solutions</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-3">Departments</h4>
            <ul className="space-y-2 text-slate-600 dark:text-zinc-400 font-medium">
              <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Computer Science (BSCS)</a></li>
              <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Electrical Engineering</a></li>
              <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Business Administration</a></li>
              <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Mechanical Engineering</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-3">Platform</h4>
            <ul className="space-y-2 text-slate-600 dark:text-zinc-400 font-medium">
              <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">System Architecture</a></li>
              <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Supabase Cloud Storage</a></li>
              <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Academic Integrity</a></li>
              <li><Link to="/contact" className="hover:text-slate-900 dark:hover:text-white transition-colors">Contact & Support</Link></li>
              <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Moderator Guidelines</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 dark:border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 dark:text-zinc-500 font-medium">
          <p>© 2026 CampusArchive. All rights reserved.</p>
          <div className="flex items-center gap-1 text-slate-600 dark:text-zinc-400">
            <span>Built with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span>for university students</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
