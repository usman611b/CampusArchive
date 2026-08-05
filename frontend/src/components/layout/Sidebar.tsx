import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AcademicsService, DepartmentApiItem } from '../../services/academicsService';
import { apiClient } from '../../services/apiClient';
import {
  LayoutDashboard,
  GraduationCap,
  ChevronDown,
  ChevronRight,
  Search,
  Upload,
  Bookmark,
  FileText,
  Bell,
  User as UserIcon,
  LogOut,
  ShieldAlert,
  Sparkles,
  Code2,
  Layers,
  Cpu,
  Briefcase
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  selectedDeptSlug?: string;
  onSelectDepartment?: (deptSlug: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  selectedDeptSlug,
  onSelectDepartment
}) => {
  const { user, logout } = useAuth();
  const [academicsOpen, setAcademicsOpen] = useState(true);
  const [departments, setDepartments] = useState<DepartmentApiItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    AcademicsService.getDepartments()
      .then((deptList) => setDepartments(deptList || []))
      .catch(() => setDepartments([]));
  }, []);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    const loadUnread = () => {
      apiClient
        .get('/notifications')
        .then((res) => {
          const list = res.data.data.notifications || [];
          setUnreadCount(list.filter((n: any) => !n.is_read).length);
        })
        .catch(() => setUnreadCount(0));
    };

    loadUnread();
    const timer = setInterval(loadUnread, 10000); // 10-second polling sync
    window.addEventListener('notification_received', loadUnread);
    window.addEventListener('notifications_updated', loadUnread);
    return () => {
      clearInterval(timer);
      window.removeEventListener('notification_received', loadUnread);
      window.removeEventListener('notifications_updated', loadUnread);
    };
  }, [user]);

  const getDeptIcon = (iconName: string) => {
    switch (iconName) {
      case 'Code2': return Code2;
      case 'Layers': return Layers;
      case 'Cpu': return Cpu;
      case 'Briefcase': return Briefcase;
      default: return GraduationCap;
    }
  };

  const isAdminUser = user && !['STUDENT', 'GUEST'].includes(user.role as string);

  return (
    <aside className="w-64 border-r border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 flex flex-col justify-between hidden md:flex shrink-0 min-h-[calc(100vh-4rem)] transition-colors overflow-y-auto">
      
      {/* Upper Navigation Section */}
      <div className="space-y-5">
        
        {/* User Status Card */}
        <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center font-extrabold text-white shadow-md shadow-blue-500/20 shrink-0">
            {user?.fullName ? user.fullName[0].toUpperCase() : 'U'}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-extrabold text-slate-900 dark:text-white truncate">{user?.fullName || 'User Profile'}</h4>
            <p className="text-[11px] text-slate-700 dark:text-zinc-300 font-extrabold truncate">{user?.universityName || 'Lahore Garrison University'}</p>
            <div className="mt-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[11px] font-black text-amber-900 dark:text-amber-400">Karma {user?.contributionScore ?? 0} pts</span>
            </div>
          </div>
        </div>

        {/* Dashboard Link */}
        <button
          onClick={() => setActiveView('dashboard')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
            activeView === 'dashboard'
              ? 'bg-blue-100 dark:bg-blue-600/30 text-blue-900 dark:text-blue-200 border border-blue-300 dark:border-blue-500/40 shadow-xs'
              : 'text-slate-800 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-800 border border-transparent'
          }`}
        >
          <LayoutDashboard className={`w-4 h-4 ${activeView === 'dashboard' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-zinc-300'}`} />
          <span>Dashboard</span>
        </button>

        {/* Academics Explorer Collapsible Group */}
        <div className="space-y-1">
          <button
            onClick={() => setAcademicsOpen(!academicsOpen)}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider hover:text-blue-600 dark:hover:text-blue-400"
          >
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>🎓 Academics</span>
            </div>
            {academicsOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-900 dark:text-white" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-900 dark:text-white" />}
          </button>

          {academicsOpen && (
            <div className="pl-3 space-y-1 border-l-2 border-slate-300 dark:border-zinc-800 ml-3 pt-1">
              {departments.map((dept) => {
                const Icon = getDeptIcon(dept.iconName);
                const isSelected = activeView === 'academics' && selectedDeptSlug === dept.slug;
                return (
                  <button
                    key={dept.id}
                    onClick={() => {
                      setActiveView('academics');
                      if (onSelectDepartment) onSelectDepartment(dept.slug);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-extrabold transition-all ${
                      isSelected
                        ? 'bg-blue-100 dark:bg-blue-600/30 text-blue-900 dark:text-blue-200 border border-blue-300 dark:border-blue-500/40 shadow-xs'
                        : 'text-slate-800 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-800 border border-transparent'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 text-slate-700 dark:text-zinc-300 shrink-0" />
                    <span className="truncate">{dept.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Global Tools Navigation */}
        <div className="space-y-1 pt-2 border-t border-slate-300 dark:border-zinc-800">
          
          <button
            onClick={() => setActiveView('search')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
              activeView === 'search'
                ? 'bg-blue-100 dark:bg-blue-600/30 text-blue-900 dark:text-blue-200 border border-blue-300 dark:border-blue-500/40 shadow-xs'
                : 'text-slate-800 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-800 border border-transparent'
            }`}
          >
            <Search className="w-4 h-4 text-slate-700 dark:text-zinc-300" />
            <span>Search</span>
          </button>

          <button
            onClick={() => setActiveView('upload')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
              activeView === 'upload'
                ? 'bg-blue-100 dark:bg-blue-600/30 text-blue-900 dark:text-blue-200 border border-blue-300 dark:border-blue-500/40 shadow-xs'
                : 'text-slate-800 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-800 border border-transparent'
            }`}
          >
            <Upload className="w-4 h-4 text-slate-700 dark:text-zinc-300" />
            <span>Upload Resource</span>
          </button>

          <button
            onClick={() => setActiveView('my-uploads')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
              activeView === 'my-uploads'
                ? 'bg-blue-100 dark:bg-blue-600/30 text-blue-900 dark:text-blue-200 border border-blue-300 dark:border-blue-500/40 shadow-xs'
                : 'text-slate-800 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-800 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-slate-700 dark:text-zinc-300" />
              <span>My Uploads</span>
            </div>
          </button>

          <button
            onClick={() => setActiveView('bookmarks')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
              activeView === 'bookmarks'
                ? 'bg-blue-100 dark:bg-blue-600/30 text-blue-900 dark:text-blue-200 border border-blue-300 dark:border-blue-500/40 shadow-xs'
                : 'text-slate-800 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-800 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3">
              <Bookmark className="w-4 h-4 text-slate-700 dark:text-zinc-300" />
              <span>Bookmarks</span>
            </div>
          </button>

          <button
            onClick={() => setActiveView('notifications')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
              activeView === 'notifications'
                ? 'bg-blue-100 dark:bg-blue-600/30 text-blue-900 dark:text-blue-200 border border-blue-300 dark:border-blue-500/40 shadow-xs'
                : 'text-slate-800 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-800 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-slate-700 dark:text-zinc-300" />
              <span>Notifications</span>
            </div>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-600 text-white shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveView('profile')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
              activeView === 'profile'
                ? 'bg-blue-100 dark:bg-blue-600/30 text-blue-900 dark:text-blue-200 border border-blue-300 dark:border-blue-500/40 shadow-xs'
                : 'text-slate-800 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-800 border border-transparent'
            }`}
          >
            <UserIcon className="w-4 h-4 text-slate-700 dark:text-zinc-300" />
            <span>Profile</span>
          </button>
        </div>

        {/* Admin Console Shortcut - High Contrast */}
        {isAdminUser && (
          <div className="pt-2 border-t border-slate-300 dark:border-zinc-800">
            <button
              onClick={() => setActiveView('admin')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-black transition-all ${
                activeView === 'admin'
                  ? 'bg-red-600 text-white shadow-md shadow-red-500/30'
                  : 'bg-red-50 dark:bg-red-500/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-500/30 hover:bg-red-100'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
              <span>Admin Console</span>
            </button>
          </div>
        )}
      </div>

      {/* Logout Footer Button */}
      <div className="pt-4 border-t border-slate-300 dark:border-zinc-800 mt-6">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-extrabold text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/10 border border-transparent transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
