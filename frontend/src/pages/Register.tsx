import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { UserPlus, Mail, Lock, User as UserIcon, Building, AlertCircle, CheckCircle2, Sun, Moon, Edit3 } from 'lucide-react';

const PAKISTANI_UNIVERSITIES = [
  'Lahore Garrison University (LGU)',
  'NUST - National University of Sciences & Technology',
  'FAST-NUCES (National University of Computer & Emerging Sciences)',
  'COMSATS University Islamabad',
  'LUMS - Lahore University of Management Sciences',
  'University of the Punjab (PU Lahore)',
  'UET Lahore - University of Engineering & Technology',
  'UHS - University of Health Sciences Lahore',
  'KMU - Khyber Medical University Peshawar',
  'JSMU - Jinnah Sindh Medical University Karachi',
  'Dow University of Health Sciences (DUHS Karachi)',
  'King Edward Medical University (KEMU Lahore)',
  'Aga Khan University (AKU Karachi)',
  'Quaid-i-Azam University (QAU Islamabad)',
  'GIKI - Ghulam Ishaq Khan Institute',
  'IBA Karachi - Institute of Business Administration',
  'University of Agriculture Faisalabad (UAF)',
  'International Islamic University Islamabad (IIUI)',
  'Air University Islamabad',
  'Bahria University Islamabad',
  'Riphah International University',
  'University of Karachi (UoK)',
  'Government College University (GCU Lahore)',
  'Other University / Institution (Type Custom)'
];

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedUniversityOption, setSelectedUniversityOption] = useState(PAKISTANI_UNIVERSITIES[0]);
  const [customUniversityName, setCustomUniversityName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const finalUniversityName =
    selectedUniversityOption === 'Other University / Institution (Type Custom)'
      ? customUniversityName.trim() || 'University Campus Archive'
      : selectedUniversityOption;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    const generatedUsername = username.trim() || email.split('@')[0] || `user_${Math.floor(Math.random() * 10000)}`;

    try {
      await register({
        email,
        password,
        fullName,
        username: generatedUsername,
        universityName: finalUniversityName
      });
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || 'Registration failed. Please check your details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden transition-colors">
      
      {/* Theme Switcher Top Right */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-2.5 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:text-blue-600 transition-all shadow-md z-20"
        title="Toggle Theme"
      >
        {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
      </button>

      {/* Background Accent Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 mb-2">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Join CampusArchive</h1>
          <p className="text-sm text-slate-600 dark:text-zinc-400 font-medium">
            Create your account using any email (Gmail, Outlook, or University email)
          </p>
        </div>

        <Card className="p-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 shadow-xl">
          {isSuccess ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Registration Successful!</h2>
              <p className="text-xs text-slate-600 dark:text-zinc-400 max-w-xs mx-auto font-medium">
                Welcome to CampusArchive! Your account has been registered for <strong className="text-slate-900 dark:text-zinc-200">{email}</strong>.
              </p>
              <Button variant="primary" className="w-full mt-4" onClick={() => navigate('/login')}>
                Sign In to Your Account
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 flex items-start gap-2.5 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <Input
                label="Full Name"
                placeholder="Usman Ali"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                leftIcon={<UserIcon className="w-4 h-4" />}
              />

              <Input
                label="Username"
                placeholder="usmanali (optional)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                leftIcon={<UserIcon className="w-4 h-4" />}
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="student@gmail.com, yahoo.com, or uni email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
              />

              <Input
                label="Password"
                type="password"
                placeholder="12+ chars with upper, lower & number"
                required
                minLength={12}
                maxLength={128}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
              />

              {/* University / Institution Selector */}
              <div className="text-left space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Select University / Institution <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Building className="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none" />
                  <select
                    className="w-full bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 rounded-lg pl-9 pr-3 py-2 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                    value={selectedUniversityOption}
                    onChange={(e) => setSelectedUniversityOption(e.target.value)}
                  >
                    {PAKISTANI_UNIVERSITIES.map((uni) => (
                      <option key={uni} value={uni}>{uni}</option>
                    ))}
                  </select>
                </div>

                {/* Custom University Type-In Input if "Other" selected */}
                {selectedUniversityOption === 'Other University / Institution (Type Custom)' && (
                  <Input
                    label="Type Your Custom University / Organization Name"
                    placeholder="Enter your institution or college name..."
                    value={customUniversityName}
                    onChange={(e) => setCustomUniversityName(e.target.value)}
                    required
                    leftIcon={<Edit3 className="w-4 h-4" />}
                  />
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-2 font-extrabold shadow-lg shadow-blue-500/20"
                isLoading={isLoading}
              >
                Create Account
              </Button>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-zinc-800/80 text-center text-xs text-slate-600 dark:text-zinc-400">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
              Sign In
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Register;
