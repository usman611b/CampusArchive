import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute } from './router/ProtectedRoute';
import { LiquidShaderBackground } from './components/ui/LiquidShaderBackground';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';

// Views & Landing Components
import { LandingHero } from './components/home/LandingHero';
import { DepartmentExplorer } from './components/home/DepartmentExplorer';
import { FeaturesGrid } from './components/home/FeaturesGrid';
import { HowItWorks } from './components/home/HowItWorks';
import { ContributorSpotlight } from './components/home/ContributorSpotlight';
import { JoinVaultCTA } from './components/home/JoinVaultCTA';

// Workspace Views & Modals
import { DashboardView } from './pages/DashboardView';
import { AcademicsView } from './pages/AcademicsView';
import { CourseHubView } from './pages/CourseHubView';
import { GlobalSearchView } from './pages/GlobalSearchView';
import { UploadWizardModal } from './components/resource/UploadWizardModal';
import { ResourceLibraryView } from './pages/ResourceLibraryView';
import { ProfileView } from './pages/ProfileView';
import { NotificationsView } from './pages/NotificationsView';
import { AdminDashboardView } from './pages/AdminDashboardView';
import { MyUploadsView } from './pages/MyUploadsView';
import { ResourceDetailsModal } from './components/resource/ResourceDetailsModal';
import { ResourceCard, ResourceItem } from './components/resource/ResourceCard';
import { PageHeader } from './components/ui/PageHeader';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

// Domain Models
import { Course } from './types/academic';
import { useAuth } from './context/AuthContext';
import { BookmarksService } from './services/searchNotificationsBookmarksService';
import { ResourceService } from './services/resourceService';
import { supabaseClient } from './services/supabaseClient';
import { useToast } from './context/ToastContext';

// Map URL paths to activeView keys and vice versa
const PATH_TO_VIEW: Record<string, string> = {
  '/': 'home',
  '/browse': 'academics',
  '/dashboard': 'dashboard',
  '/search': 'search',
  '/upload': 'upload',
  '/bookmarks': 'bookmarks',
  '/my-uploads': 'my-uploads',
  '/notifications': 'notifications',
  '/profile': 'profile',
  '/admin': 'admin',
  '/course-hub': 'course-hub',
};

const VIEW_TO_PATH: Record<string, string> = {};
Object.entries(PATH_TO_VIEW).forEach(([path, view]) => {
  VIEW_TO_PATH[view] = path;
});

export const MainAppContent: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { showInfo } = useToast();

  // Derive initial activeView from URL
  const getViewFromPath = useCallback((pathname: string) => {
    return PATH_TO_VIEW[pathname] || 'home';
  }, []);

  const [activeView, setActiveView] = useState<string>(getViewFromPath(location.pathname));
  const [selectedDeptSlug, setSelectedDeptSlug] = useState<string>('computer-science');
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [selectedResource, setSelectedResource] = useState<ResourceItem | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [isUploadWizardOpen, setIsUploadWizardOpen] = useState(false);

  // Load Bookmarked IDs from Backend API whenever user is authenticated
  const syncBookmarkIds = useCallback(() => {
    if (user) {
      BookmarksService.getIds()
        .then((ids) => setBookmarkedIds(ids || []))
        .catch(() => setBookmarkedIds([]));
    } else {
      setBookmarkedIds([]);
    }
  }, [user]);

  useEffect(() => {
    syncBookmarkIds();

    const handleBookmarkEvent = () => syncBookmarkIds();
    window.addEventListener('bookmark_toggled', handleBookmarkEvent);
    window.addEventListener('resource_uploaded', handleBookmarkEvent);
    return () => {
      window.removeEventListener('bookmark_toggled', handleBookmarkEvent);
      window.removeEventListener('resource_uploaded', handleBookmarkEvent);
    };
  }, [syncBookmarkIds]);

  // Supabase Realtime Subscription for Instant Notifications
  useEffect(() => {
    if (!user) return;

    const channel = supabaseClient
      .channel(`realtime:notifications:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          window.dispatchEvent(new Event('notification_received'));
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [user]);

  // Sync activeView when URL changes (e.g., from Navbar clicks)
  useEffect(() => {
    if (isAuthLoading) return;

    const protectedPaths = new Set([
      '/dashboard', '/upload', '/bookmarks', '/my-uploads',
      '/notifications', '/profile', '/admin'
    ]);
    if (!user && protectedPaths.has(location.pathname)) {
      setIsUploadWizardOpen(false);
      navigate('/login', { replace: true, state: { from: { pathname: location.pathname } } });
      return;
    }

    const viewFromUrl = getViewFromPath(location.pathname);
    if (viewFromUrl !== activeView) {
      setActiveView(viewFromUrl);
    }
    if (location.pathname === '/upload') {
      setIsUploadWizardOpen(true);
    }
  }, [location.pathname, getViewFromPath, isAuthLoading, navigate, user]);

  // When activeView changes programmatically, update URL
  const handleSetActiveView = useCallback((view: string) => {
    setActiveView(view);
    const targetPath = VIEW_TO_PATH[view];
    if (targetPath && targetPath !== location.pathname) {
      navigate(targetPath);
    }
  }, [navigate, location.pathname]);

  const requestUpload = useCallback(() => {
    if (!user) {
      setIsUploadWizardOpen(false);
      showInfo('Sign In Required', 'Please sign in to upload academic resources.');
      navigate('/login', { state: { from: { pathname: '/upload' } } });
      return;
    }
    setIsUploadWizardOpen(true);
  }, [navigate, showInfo, user]);

  // Real API Bookmark Toggle with state sync
  const handleBookmarkToggle = async (id: string) => {
    if (!user) {
      showInfo('Sign In Required', 'Please sign in to save resources.');
      navigate('/login', { state: { from: { pathname: location.pathname } } });
      return;
    }

    // Optimistic UI update
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((bId) => bId !== id) : [...prev, id]
    );

    try {
      const res = await ResourceService.toggleBookmark(id);
      if (res.isBookmarked) {
        setBookmarkedIds((prev) => [...new Set([...prev, id])]);
      } else {
        setBookmarkedIds((prev) => prev.filter((bId) => bId !== id));
      }
      window.dispatchEvent(new Event('bookmark_toggled'));
    } catch {
      // Revert on error
      syncBookmarkIds();
    }
  };

  const handleSelectCourse = (course: Course) => {
    setActiveCourse(course);
    handleSetActiveView('course-hub');
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <DashboardView
            resources={[]}
            onSelectResource={setSelectedResource}
            bookmarkedIds={bookmarkedIds}
            onBookmarkToggle={handleBookmarkToggle}
            onNavigateToUpload={requestUpload}
            onNavigateToAdmin={() => handleSetActiveView('admin')}
          />
        );

      case 'academics':
      case 'browse':
        return (
          <AcademicsView
            initialDeptSlug={selectedDeptSlug}
            onSelectCourse={handleSelectCourse}
            onSelectResource={setSelectedResource}
            bookmarkedIds={bookmarkedIds}
            onBookmarkToggle={handleBookmarkToggle}
          />
        );

      case 'course-hub':
        return activeCourse ? (
          <CourseHubView
            course={activeCourse}
            onBack={() => handleSetActiveView('academics')}
            onSelectResource={setSelectedResource}
            bookmarkedIds={bookmarkedIds}
            onBookmarkToggle={handleBookmarkToggle}
            onNavigateToUpload={requestUpload}
          />
        ) : (
          <AcademicsView
            initialDeptSlug={selectedDeptSlug}
            onSelectCourse={handleSelectCourse}
            onSelectResource={setSelectedResource}
            bookmarkedIds={bookmarkedIds}
            onBookmarkToggle={handleBookmarkToggle}
          />
        );

      case 'search':
        return (
          <GlobalSearchView
            onSelectResource={setSelectedResource}
            bookmarkedIds={bookmarkedIds}
            onBookmarkToggle={handleBookmarkToggle}
          />
        );

      case 'upload':
        return (
          <MyUploadsView
            onNavigateToUpload={requestUpload}
          />
        );

      case 'bookmarks':
        return (
          <ResourceLibraryView
            onSelectResource={setSelectedResource}
            bookmarkedIds={bookmarkedIds}
            onBookmarkToggle={handleBookmarkToggle}
          />
        );

      case 'my-uploads':
        return (
          <MyUploadsView
            onNavigateToUpload={requestUpload}
          />
        );

      case 'notifications':
        return <NotificationsView />;

      case 'profile':
        return <ProfileView sampleResources={[]} onSelectResource={setSelectedResource} />;

      case 'admin':
        return <AdminDashboardView />;

      default:
        return (
          <>
            <LandingHero
              onSearchSubmit={() => handleSetActiveView('search')}
              onBrowseClick={() => handleSetActiveView('academics')}
              onUploadClick={requestUpload}
            />
            <DepartmentExplorer onSelectDepartment={(dept) => {
              setSelectedDeptSlug(dept);
              handleSetActiveView('academics');
            }} />
            <FeaturesGrid />
            <HowItWorks />
            <ContributorSpotlight />
            <JoinVaultCTA
              onBrowseClick={() => handleSetActiveView('academics')}
              onUploadClick={requestUpload}
            />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-200 antialiased selection:bg-blue-500/20 selection:text-blue-500">
      
      {/* Background Liquid Shader Animation */}
      <LiquidShaderBackground />

      {/* Global SaaS Navbar */}
      <Navbar
        activeTab={activeView}
        setActiveTab={handleSetActiveView}
        onSearchOpen={() => handleSetActiveView('search')}
      />

      {/* Main Layout Container — relative z-10 ensures content renders above canvas */}
      <div className="flex-1 flex w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6 relative z-10">
        
        {/* Workspace Sidebar (visible on non-home pages or when toggled) */}
        {activeView !== 'home' && (
          <Sidebar
            activeView={activeView}
            setActiveView={(view) => {
              if (view === 'upload') {
                requestUpload();
              } else {
                handleSetActiveView(view);
              }
            }}
            selectedDeptSlug={selectedDeptSlug}
            onSelectDepartment={(slug) => {
              setSelectedDeptSlug(slug);
              handleSetActiveView('academics');
            }}
          />
        )}

        {/* View Router Render Outlet */}
        <main className="flex-1 min-w-0">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Resource Details Modal */}
      {selectedResource && (
        <ResourceDetailsModal
          resource={selectedResource}
          onClose={() => setSelectedResource(null)}
          isBookmarked={bookmarkedIds.includes(selectedResource.id)}
          onBookmarkToggle={handleBookmarkToggle}
        />
      )}

      {/* 7-Step Guided Upload Wizard Modal */}
      <UploadWizardModal
        isOpen={isUploadWizardOpen}
        onClose={() => setIsUploadWizardOpen(false)}
        onSuccess={() => {
          handleSetActiveView('my-uploads');
        }}
      />

      {/* Global Footer */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/*" element={<MainAppContent />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
