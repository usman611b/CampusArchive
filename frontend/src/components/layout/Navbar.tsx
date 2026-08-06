import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  Search,
  Bell,
  User as UserIcon,
  LogOut,
  Upload,
  BookOpen,
  LayoutDashboard,
  Menu,
  X,
  Sparkles,
  ShieldAlert,
  Sun,
  Moon
} from 'lucide-react';

interface NavbarProps {
  onSearchOpen?: () => void;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSearchOpen, activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    const loadUnread = () => {
      import('../../services/apiClient').then(({ apiClient }) => {
        apiClient
          .get('/notifications')
          .then((res) => {
            const list = res.data.data.notifications || [];
            setUnreadCount(list.filter((n: any) => !n.is_read).length);
          })
          .catch(() => setUnreadCount(0));
      });
    };

    const handleNotificationsUpdated = (event: Event) => {
      const nextCount = (event as CustomEvent<{ unreadCount?: number }>).detail?.unreadCount;
      if (typeof nextCount === 'number') {
        setUnreadCount(Math.max(0, nextCount));
      }
      loadUnread();
    };

    loadUnread();
    const timer = setInterval(loadUnread, 10000);
    window.addEventListener('notification_received', loadUnread);
    window.addEventListener('notifications_updated', handleNotificationsUpdated);
    return () => {
      clearInterval(timer);
      window.removeEventListener('notification_received', loadUnread);
      window.removeEventListener('notifications_updated', handleNotificationsUpdated);
    };
  }, [user]);

  // Global Keyboard Shortcut listener (CMD + K or Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (onSearchOpen) onSearchOpen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSearchOpen]);

  const handleNavClick = (tabKey: string, path: string) => {
    if (setActiveTab) setActiveTab(tabKey);
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 backdrop-blur-xl transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => handleNavClick('home', '/')}
            className="flex items-center gap-3 group text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white block leading-none group-hover:text-blue-500 transition-colors font-display">
                CampusArchive
              </span>
              <span className="text-[10px] text-slate-700 dark:text-zinc-300 font-extrabold tracking-wide">
                Preserving Knowledge
              </span>
            </div>
          </button>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 ml-4">
            {[
              { label: 'Home', key: 'home', path: '/' },
              { label: 'Browse', key: 'academics', path: '/browse' },
              { label: 'Upload', key: 'upload', path: '/upload' },
              { label: 'Dashboard', key: 'dashboard', path: '/dashboard' },
            ].map((link) => (
              <button
                key={link.key}
                onClick={() => handleNavClick(link.key, link.path)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                  (activeTab === link.key || location.pathname === link.path || (link.key === 'academics' && (activeTab === 'browse' || location.pathname === '/academics')))
                    ? 'text-blue-800 dark:text-white bg-blue-100 dark:bg-zinc-800 border border-blue-300 dark:border-white/20 shadow-xs'
                    : 'text-slate-800 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-800'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Global Search Bar (CMD + K Trigger) */}
        <div className="hidden lg:flex flex-1 max-w-md mx-4">
          <button
            onClick={() => handleNavClick('search', '/search')}
            className="w-full bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-900 border border-slate-300 dark:border-zinc-800 rounded-full px-4 py-2 text-xs text-slate-800 dark:text-zinc-200 font-semibold flex items-center justify-between transition-all group shadow-inner"
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-4 h-4 text-slate-500 dark:text-zinc-400 group-hover:text-blue-500 transition-colors" />
              <span>Search notes, past papers, books, projects...</span>
            </div>
            <kbd className="px-2 py-0.5 text-[10px] bg-slate-200 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-zinc-200 rounded-md font-mono font-bold">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Actions: Theme Switcher + Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-slate-800 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 transition-all hover:scale-105"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

          {isAuthenticated ? (
            <>
              {/* Notifications Quick Link */}
              <button
                onClick={() => handleNavClick('notifications', '/notifications')}
                className="relative p-2 rounded-full text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 transition-all hover:scale-105"
                title="Notifications"
              >
                <Bell className="w-4 h-4 text-slate-700 dark:text-zinc-300" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white font-extrabold text-[9px] flex items-center justify-center shadow-xs">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Quick Upload Button */}
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleNavClick('upload', '/upload')}
                leftIcon={<Upload className="w-4 h-4" />}
                className="rounded-full shadow-md shadow-blue-500/20 font-bold text-xs"
              >
                Upload Resource
              </Button>

              {/* User Avatar & Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1 pr-3 rounded-full bg-slate-100 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-bold text-xs text-zinc-950">
                    {user?.fullName ? user.fullName[0].toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white max-w-[100px] truncate">
                    {user?.fullName || 'Account'}
                  </span>
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 rounded-2xl shadow-2xl p-1.5 space-y-1 z-50 text-xs animate-in fade-in zoom-in-95">
                    <div className="p-3 border-b border-slate-200 dark:border-zinc-800">
                      <p className="font-extrabold text-slate-900 dark:text-white truncate">{user?.fullName || 'Student'}</p>
                      <p className="text-[11px] text-slate-700 dark:text-zinc-300 truncate font-semibold">{user?.email}</p>
                      <div className="mt-2 flex items-center gap-1.5">
                        <Badge variant="blue" className="text-[10px] py-0 px-2 font-extrabold">
                          Karma: {user?.contributionScore ?? 0} pts
                        </Badge>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        handleNavClick('profile', '/profile');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-900 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors font-extrabold text-left"
                    >
                      <UserIcon className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
                      <span>My Profile</span>
                    </button>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        handleNavClick('dashboard', '/dashboard');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-900 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors font-extrabold text-left"
                    >
                      <LayoutDashboard className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
                      <span>Dashboard</span>
                    </button>

                    {user && !['STUDENT', 'GUEST'].includes(user.role as string) && (
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          handleNavClick('admin', '/admin');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors font-extrabold text-left"
                      >
                        <ShieldAlert className="w-4 h-4" />
                        <span>Admin Dashboard</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-left font-extrabold"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm" className="font-extrabold text-xs">
                  Log In
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm" className="rounded-full shadow-md shadow-blue-500/25 font-bold text-xs">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-800 dark:text-zinc-200 bg-slate-100 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-800 dark:text-zinc-200 bg-slate-100 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 space-y-3 animate-in slide-in-from-top-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 dark:text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search resources..."
              onClick={() => handleNavClick('search', '/search')}
              className="w-full bg-slate-100 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            {[
              { label: 'Home', key: 'home', path: '/' },
              { label: 'Browse Vault', key: 'academics', path: '/browse' },
              { label: 'Upload Notes', key: 'upload', path: '/upload' },
              { label: 'Dashboard', key: 'dashboard', path: '/dashboard' },
            ].map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.key, item.path)}
                className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 text-xs font-bold text-slate-900 dark:text-white text-center"
              >
                {item.label}
              </button>
            ))}
          </div>

          {!isAuthenticated && (
            <div className="flex gap-2 pt-2 border-t border-slate-300 dark:border-zinc-900">
              <Link to="/login" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="secondary" size="sm" className="w-full">Log In</Button>
              </Link>
              <Link to="/register" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" size="sm" className="w-full">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
