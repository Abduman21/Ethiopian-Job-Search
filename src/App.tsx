import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/Auth/LoginForm';
import { SignUpForm } from './components/Auth/SignUpForm';
import { JobSearch } from './components/JobSeeker/JobSearch';
import { MyApplications } from './components/JobSeeker/MyApplications';
import { PostJob } from './components/Employer/PostJob';
import { ManageJobs } from './components/Employer/ManageJobs';
import { ViewApplications } from './components/Employer/ViewApplications';
import { Notifications } from './components/Notifications';
import { Briefcase, LogOut, Bell, User, FileText, PlusCircle, Settings, Home } from 'lucide-react';

function AppContent() {
  const { user, profile, loading, signOut } = useAuth();
  const [showLogin, setShowLogin] = useState(true);
  const [currentView, setCurrentView] = useState<string>('home');
  const [showPostJob, setShowPostJob] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-xl text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 py-12 px-4">
        <div className="max-w-7xl mx-auto mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Briefcase className="w-16 h-16 text-emerald-600" />
          </div>
          <h1 className="text-5xl font-bold text-gray-800 mb-2">Ethio Jobs</h1>
          <p className="text-xl text-gray-600">Find Your Dream Job in Ethiopia</p>
        </div>
        {showLogin ? (
          <LoginForm onToggle={() => setShowLogin(false)} />
        ) : (
          <SignUpForm onToggle={() => setShowLogin(true)} />
        )}
      </div>
    );
  }

  const isJobSeeker = profile.role === 'job_seeker';
  const isEmployer = profile.role === 'employer';

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Briefcase className="w-8 h-8 text-emerald-600" />
              <span className="text-2xl font-bold text-gray-800">Ethio Jobs</span>
            </div>

            <div className="flex items-center gap-6">
              {isJobSeeker && (
                <>
                  <button
                    onClick={() => setCurrentView('home')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                      currentView === 'home'
                        ? 'bg-emerald-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Home className="w-5 h-5" />
                    Jobs
                  </button>
                  <button
                    onClick={() => setCurrentView('applications')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                      currentView === 'applications'
                        ? 'bg-emerald-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <FileText className="w-5 h-5" />
                    My Applications
                  </button>
                </>
              )}

              {isEmployer && (
                <>
                  <button
                    onClick={() => setCurrentView('manage-jobs')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                      currentView === 'manage-jobs'
                        ? 'bg-emerald-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Settings className="w-5 h-5" />
                    Manage Jobs
                  </button>
                  <button
                    onClick={() => setCurrentView('applications')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                      currentView === 'applications'
                        ? 'bg-emerald-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <FileText className="w-5 h-5" />
                    Applications
                  </button>
                  <button
                    onClick={() => {
                      setShowPostJob(true);
                      setCurrentView('post-job');
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
                  >
                    <PlusCircle className="w-5 h-5" />
                    Post Job
                  </button>
                </>
              )}

              <button
                onClick={() => setCurrentView('notifications')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                  currentView === 'notifications'
                    ? 'bg-emerald-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Bell className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
                <div className="text-right">
                  <p className="font-semibold text-gray-800">{profile.full_name}</p>
                  <p className="text-sm text-gray-600 capitalize">{profile.role.replace('_', ' ')}</p>
                </div>
                <button
                  onClick={signOut}
                  className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main>
        {currentView === 'home' && isJobSeeker && <JobSearch />}
        {currentView === 'applications' && isJobSeeker && <MyApplications />}
        {currentView === 'manage-jobs' && isEmployer && <ManageJobs />}
        {currentView === 'post-job' && isEmployer && (
          <PostJob onSuccess={() => {
            setCurrentView('manage-jobs');
            setShowPostJob(false);
          }} />
        )}
        {currentView === 'applications' && isEmployer && <ViewApplications />}
        {currentView === 'notifications' && <Notifications />}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center text-gray-600">
            <p className="mb-2">&copy; 2025 Ethio Jobs. All rights reserved.</p>
            <p className="text-sm">Connecting Ethiopian talent with opportunities</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
