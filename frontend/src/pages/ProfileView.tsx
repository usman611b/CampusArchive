import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ResourceCard, ResourceItem } from '../components/resource/ResourceCard';
import { AuthService } from '../services/authService';
import { MyUploadsService } from '../services/adminService';
import { BookmarksService } from '../services/searchNotificationsBookmarksService';
import {
  User as UserIcon,
  Award,
  CheckCircle2,
  Download,
  Upload,
  Bookmark,
  Star,
  Sparkles,
  ShieldCheck,
  Calendar,
  Building,
  Camera,
  Settings,
  Lock,
  Save,
  Mail,
  GraduationCap,
  FileText,
  Trash2
} from 'lucide-react';

interface ProfileViewProps {
  sampleResources: ResourceItem[];
  onSelectResource: (resource: ResourceItem) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ sampleResources, onSelectResource }) => {
  const { user, refreshUser, logout } = useAuth();
  const [activeMainTab, setActiveMainTab] = useState<'overview' | 'settings' | 'security'>('overview');
  const [activeSubTab, setActiveSubTab] = useState<'uploads' | 'bookmarks'>('uploads');

  // Live User Stats State
  const [myUploadsCount, setMyUploadsCount] = useState<number>(0);
  const [myBookmarksCount, setMyBookmarksCount] = useState<number>(0);
  const [myUploadsList, setMyUploadsList] = useState<ResourceItem[]>([]);

  // Form State for Profile Settings
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [username, setUsername] = useState(user?.username || '');
  const [email] = useState(user?.email || '');
  const [university, setUniversity] = useState(user?.universityName || 'Lahore Garrison University');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatarUrl || null);

  // Sync state when user changes
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setUsername(user.username || '');
      setUniversity(user.universityName || 'Lahore Garrison University');
      setBio(user.bio || '');
      setAvatarPreview(user.avatarUrl || null);
    }
  }, [user]);

  // Fetch user stats & uploads
  useEffect(() => {
    MyUploadsService.getMyUploads()
      .then((uploads) => {
        setMyUploadsCount(uploads.length);
        const mapped: ResourceItem[] = uploads.map((u) => ({
          id: u.id,
          title: u.title,
          description: u.description,
          department: u.course?.code || '',
          semester: '',
          course: u.course?.title || '',
          uploaderName: user?.fullName || 'Me',
          rating: u.averageRating || 0,
          reviewsCount: u.ratingCount || 0,
          viewsCount: 0,
          downloadsCount: 0,
          commentsCount: u.commentsCount || 0,
          category: u.category?.name || 'Notes',
          fileType: 'PDF',
          fileSize: '',
          pagesCount: 0,
          uploadedAt: u.createdAt,
          gradientClass: 'card-gradient-purple',
          tags: []
        }));
        setMyUploadsList(mapped);
      })
      .catch(() => {});

    BookmarksService.getAll()
      .then((bks) => setMyBookmarksCount(bks.length))
      .catch(() => {});
  }, [user]);

  // Security Settings Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // In production, file should be uploaded to Supabase Storage.
      // Here we preview local file.
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await AuthService.updateProfile({
        fullName,
        username,
        universityName: university,
        bio,
        avatarUrl: avatarPreview?.startsWith('http') ? avatarPreview : undefined
      });
      await refreshUser();
      setSaveSuccessMessage('Profile settings saved to Supabase PostgreSQL!');
      setTimeout(() => setSaveSuccessMessage(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    if (newPassword.length < 12) {
      alert('New password must be at least 12 characters.');
      return;
    }
    setIsSaving(true);
    try {
      await AuthService.changePassword(currentPassword, newPassword);
      setIsSaving(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      await logout();
      window.location.assign('/login');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to change password.');
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!currentPassword) {
      alert('Enter your current password above before deleting your account.');
      return;
    }
    const confirmation = window.prompt('Type DELETE to permanently anonymize and disable your account.');
    if (confirmation !== 'DELETE') return;
    try {
      await AuthService.deleteAccount(currentPassword);
      await logout();
      window.location.assign('/');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete account.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in pb-16">
      
      {/* Profile Header Banner Card */}
      <Card className="p-8 relative overflow-hidden bg-gradient-to-tr from-slate-900 via-indigo-950 to-blue-950 text-white border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left relative z-10">
          
          {/* Avatar Container with Upload Overlay */}
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center font-bold text-3xl text-white shadow-2xl ring-4 ring-blue-500/30 overflow-hidden">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                fullName ? fullName[0].toUpperCase() : 'U'
              )}
            </div>

            <label
              htmlFor="avatar-upload"
              className="absolute inset-0 rounded-full bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white"
            >
              <Camera className="w-6 h-6" />
            </label>
            <input type="file" id="avatar-upload" accept="image/*" onChange={handleAvatarChange} className="hidden" />

            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center border-2 border-zinc-950 font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          {/* User Profile Information */}
          <div className="space-y-2 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-2xl font-extrabold text-white tracking-tight font-display">{fullName || 'Student Account'}</h1>
                <p className="text-xs text-blue-300 font-mono font-semibold">@{username || 'user'}</p>
              </div>

              <Badge variant="emerald" className="py-1 px-3 text-xs flex items-center gap-1.5 self-center sm:self-auto font-extrabold">
                <ShieldCheck className="w-3.5 h-3.5" /> {user?.role || 'Verified Student'}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-zinc-300 pt-1 font-semibold">
              <span className="flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-zinc-400" />
                {university}
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-zinc-400" />
                {email}
              </span>
            </div>

            {/* Badges Row */}
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-3">
              <span className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-[11px] font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Karma Score: {user?.contributionScore ?? 0} pts
              </span>
              <span className="px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[11px] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Verified Member
              </span>
            </div>
          </div>
        </div>

        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-8 border-t border-white/10 mt-6">
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center space-y-1">
            <div className="text-2xl font-extrabold text-white">{myUploadsCount}</div>
            <p className="text-[11px] text-zinc-300 font-bold">Resources Uploaded</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center space-y-1">
            <div className="text-2xl font-extrabold text-white">{myBookmarksCount}</div>
            <p className="text-[11px] text-zinc-300 font-bold">Saved Bookmarks</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center space-y-1">
            <div className="text-2xl font-extrabold text-amber-300 flex justify-center items-center gap-1">
              <Sparkles className="w-5 h-5 fill-amber-300" />
              <span>{user?.contributionScore ?? 0}</span>
            </div>
            <p className="text-[11px] text-zinc-300 font-bold">Contribution Karma</p>
          </div>
        </div>
      </Card>

      {/* Main Navigation Tabs: Overview vs Settings vs Security */}
      <div className="flex items-center gap-3 border-b border-theme pb-3">
        <button
          onClick={() => setActiveMainTab('overview')}
          className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeMainTab === 'overview'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-theme-card text-theme-primary border border-theme hover:border-blue-400'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>Profile Overview</span>
        </button>

        <button
          onClick={() => setActiveMainTab('settings')}
          className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeMainTab === 'settings'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-theme-card text-theme-primary border border-theme hover:border-blue-400'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Account Settings</span>
        </button>

        <button
          onClick={() => setActiveMainTab('security')}
          className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeMainTab === 'security'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-theme-card text-theme-primary border border-theme hover:border-blue-400'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Security & Password</span>
        </button>
      </div>

      {saveSuccessMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-extrabold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{saveSuccessMessage}</span>
        </div>
      )}

      {/* View 1: Overview Tab */}
      {activeMainTab === 'overview' && (
        <div className="space-y-6">
          <Card className="p-6 bg-theme-card border-theme space-y-3">
            <h3 className="text-sm font-extrabold text-theme-primary uppercase tracking-wider">About Me</h3>
            <p className="text-xs text-theme-secondary leading-relaxed font-medium">
              {bio || 'No bio specified yet. Update your profile settings to add a bio.'}
            </p>
          </Card>

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-theme pb-3">
              <h3 className="text-base font-extrabold text-theme-primary">Uploaded Resources</h3>
            </div>

            {myUploadsList.length === 0 ? (
              <div className="p-8 text-center bg-theme-card rounded-2xl border border-theme">
                <p className="text-xs text-theme-secondary font-semibold">You haven't uploaded any resources yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {myUploadsList.map((res) => (
                  <ResourceCard
                    key={res.id}
                    resource={res}
                    onSelect={onSelectResource}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* View 2: Account Settings Tab */}
      {activeMainTab === 'settings' && (
        <Card className="p-8 bg-theme-card border-theme space-y-6">
          <div>
            <h2 className="text-lg font-extrabold text-theme-primary">Personal Details</h2>
            <p className="text-xs text-theme-secondary font-medium">Update your profile info stored in Supabase PostgreSQL.</p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Ali Ahmad"
                required
              />

              <Input
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. aliahmad"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="Email Address"
                value={email}
                disabled
              />

              <Input
                label="University Name"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                placeholder="e.g. Lahore Garrison University"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-theme-primary mb-2">Bio / Summary</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="w-full rounded-2xl bg-theme-app border border-theme p-3 text-xs text-theme-primary focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Write a short summary about your academic interests..."
              />
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" variant="primary" disabled={isSaving} leftIcon={<Save className="w-4 h-4" />}>
                {isSaving ? 'Saving...' : 'Save Profile Changes'}
              </Button>
            </div>
          </form>

        </Card>
      )}

      {/* View 3: Security & Password Tab */}
      {activeMainTab === 'security' && (
        <Card className="p-8 bg-theme-card border-theme space-y-6">
          <div>
            <h2 className="text-lg font-extrabold text-theme-primary">Change Password</h2>
            <p className="text-xs text-theme-secondary font-medium">Ensure your account uses a strong, secure password.</p>
          </div>

          <form onSubmit={handleSaveSecurity} className="space-y-5 max-w-xl">
            <Input
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <Input
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <div className="pt-4 flex justify-end">
              <Button type="submit" variant="primary" disabled={isSaving} leftIcon={<Lock className="w-4 h-4" />}>
                {isSaving ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </form>

          <div className="border-t border-red-500/20 pt-6 mt-8">
            <h3 className="text-sm font-extrabold text-red-500">Delete account</h3>
            <p className="text-xs text-theme-secondary mt-1 mb-4">Enter your current password above, then permanently anonymize your profile and disable sign-in while preserving shared academic resources.</p>
            <Button type="button" variant="danger" onClick={handleDeleteAccount} leftIcon={<Trash2 className="w-4 h-4" />}>
              Delete My Account
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ProfileView;
