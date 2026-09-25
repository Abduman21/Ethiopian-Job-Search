import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LoginForm } from "./components/Auth/LoginForm";
import { SignUpForm } from "./components/Auth/SignUpForm";
import { JobSearch } from "./components/JobSeeker/JobSearch";
import { MyApplications } from "./components/JobSeeker/MyApplications";
import { PostJob } from "./components/Employer/PostJob";
import { ManageJobs } from "./components/Employer/ManageJobs";
import { ViewApplications } from "./components/Employer/ViewApplications";
import { Notifications } from "./components/Notifications";
import { ToastProvider } from "./components/Toast";
import {
  Briefcase,
  LogOut,
  Bell,
  FileText,
  PlusCircle,
  Settings,
  Home,
  Menu,
  X,
  Users,
  TrendingUp,
  Search,
  ChevronRight,
  Star,
  Building2,
} from "lucide-react";
import { supabase } from "./lib/supabase";

// ------ Landing Page (not logged in) ------
function LandingPage({ onGetStarted }: { onGetStarted: () => void }) {
  const features = [
    { icon: <Search className="w-7 h-7" />, title: "Smart Job Search", desc: "Find opportunities matching your skills with powerful filters" },
    { icon: <Building2 className="w-7 h-7" />, title: "Top Companies", desc: "Connect with Ethiopia's leading employers across all industries" },
    { icon: <TrendingUp className="w-7 h-7" />, title: "Career Growth", desc: "Track applications and advance your career journey" },
    { icon: <Bell className="w-7 h-7" />, title: "Real-time Alerts", desc: "Get instant notifications on your application status" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white overflow-hidden relative">
        {/* Background decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-400/10 rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" />

        {/* Navbar */}
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold">Ethio Jobs</span>
          </div>
          <button
            onClick={onGetStarted}
            className="px-5 py-2 bg-white text-emerald-700 rounded-xl font-semibold hover:bg-emerald-50 transition-colors text-sm shadow-md"
          >
            Sign In
          </button>
        </div>

        {/* Two-column hero body */}
        <div className="max-w-7xl mx-auto px-4 pt-8 pb-20 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">

            {/* Left – headline & CTA */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-8 border border-white/20">
                <Star className="w-4 h-4 text-yellow-300" />
                Ethiopia&apos;s #1 Job Platform
              </div>
              <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
                Find Your<br />
                <span className="text-emerald-300">Dream Job</span><br />
                in Ethiopia
              </h1>
              <p className="text-lg text-emerald-100 max-w-lg mx-auto lg:mx-0 mb-10">
                Connecting talented professionals with top companies across Addis Ababa and beyond.
                Your next opportunity is one click away.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button
                  onClick={onGetStarted}
                  className="px-8 py-4 bg-white text-emerald-700 rounded-2xl font-bold text-lg hover:bg-emerald-50 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  Get Started
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button
                  onClick={onGetStarted}
                  className="px-8 py-4 bg-white/10 text-white border border-white/30 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all backdrop-blur-sm"
                >
                  Post a Job
                </button>
              </div>

              {/* Stats row */}
              <div className="flex gap-8 mt-12 justify-center lg:justify-start">
                {[
                  { value: "500+", label: "Jobs Posted" },
                  { value: "2K+", label: "Job Seekers" },
                  { value: "150+", label: "Companies" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center lg:text-left">
                    <p className="text-2xl font-extrabold text-white">{stat.value}</p>
                    <p className="text-emerald-200 text-xs mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right – illustration */}
            <div className="flex-1 relative flex justify-center lg:justify-end w-full max-w-lg mx-auto lg:mx-0">
              {/* Soft glow behind image */}
              <div className="absolute inset-0 bg-teal-300/20 rounded-[2rem] blur-3xl scale-105 pointer-events-none" />

              {/* Main illustration card */}
              <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border border-white/20 w-full">
                <img
                  src="/hero-illustration.jpg"
                  alt="Ethiopian professionals ready to work"
                  className="w-full h-auto object-cover block"
                />

                {/* Floating badge – Live jobs */}
                <div className="absolute top-5 left-5 flex items-center gap-2.5 bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-2.5 shadow-xl border border-white/50 animate-bounce-slow">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                  </span>
                  <span className="text-emerald-700 font-bold text-sm">500+ Live Jobs</span>
                </div>

                {/* Floating card – hired today */}
                <div className="absolute bottom-5 right-5 flex items-center gap-3 bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-xl border border-white/50">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-lg">
                    🎉
                  </div>
                  <div>
                    <p className="text-gray-800 font-bold text-xs leading-tight">Hired Today!</p>
                    <p className="text-gray-400 text-xs">Join 2,000+ professionals</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Wave divider into light background */}
        <div className="relative h-12">
          <svg viewBox="0 0 1440 48" fill="none" className="absolute bottom-0 w-full" preserveAspectRatio="none">
            <path d="M0 48h1440V28C1320 8 1080 48 900 38S540 4 360 20 120 52 0 40v8z" fill="#F9FAFB"/>
          </svg>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Everything You Need</h2>
          <p className="text-gray-500 max-w-lg mx-auto">A complete platform built for both job seekers and employers in Ethiopia</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all group">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                {f.icon}
              </div>
              <h3 className="font-bold text-gray-800 mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Find Your Next Opportunity?</h2>
          <p className="text-emerald-100 mb-8">Join thousands of professionals using Ethio Jobs</p>
          <button
            onClick={onGetStarted}
            className="px-8 py-4 bg-white text-emerald-700 rounded-2xl font-bold text-lg hover:bg-emerald-50 transition-all shadow-xl"
          >
            Create Free Account
          </button>
        </div>
      </div>

      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Briefcase className="w-5 h-5 text-emerald-500" />
            <span className="font-bold text-white">Ethio Jobs</span>
          </div>
          <p className="text-sm">&copy; 2025 Ethio Jobs. Connecting Ethiopian talent with opportunities.</p>
        </div>
      </footer>
    </div>
  );
}

// ------ Auth Page ------
function AuthPage({ onBack }: { onBack: () => void }) {
  const [showLogin, setShowLogin] = useState(true);
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 py-10 px-4 flex flex-col justify-center">
      <div className="max-w-6xl mx-auto w-full">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-emerald-700 mb-6 transition-colors text-sm font-semibold bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-200 shadow-sm"
        >
          ← Back to home
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left: Illustration side card for desktop */}
          <div className="hidden lg:flex lg:col-span-5 flex-col justify-between bg-gradient-to-br from-emerald-700 via-teal-800 to-gray-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />

            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">Ethio Jobs</span>
              </div>
              <h2 className="text-2xl font-extrabold leading-snug mb-3">
                Your Career Journey <br />
                <span className="text-emerald-300">Starts in Ethiopia</span>
              </h2>
              <p className="text-emerald-100 text-sm leading-relaxed">
                Connect with leading companies across Addis Ababa, Hawassa, Dire Dawa, and beyond.
              </p>
            </div>

            {/* City Skyline Illustration */}
            <div className="my-6 relative rounded-2xl overflow-hidden shadow-lg border border-white/20">
              <img
                src="/auth-illustration.jpg"
                alt="Ethiopian professionals in Addis Ababa"
                className="w-full h-64 object-cover"
              />
            </div>

            {/* Feature highlights */}
            <div className="space-y-2 text-xs text-emerald-100">
              <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
                <span className="text-emerald-300 font-bold">✓</span>
                <span>Verified Ethiopian employers & top startups</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
                <span className="text-emerald-300 font-bold">✓</span>
                <span>Real-time application status & alerts</span>
              </div>
            </div>
          </div>

          {/* Right: Login or Signup form */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            {showLogin ? (
              <LoginForm onToggle={() => setShowLogin(false)} />
            ) : (
              <SignUpForm onToggle={() => setShowLogin(true)} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ------ Main App (logged in) ------
function AppContent() {
  const { user, profile, loading, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<string>("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const isJobSeeker = profile?.role === "job_seeker";
  const isEmployer = profile?.role === "employer";

  // Fetch unread notification count
  useEffect(() => {
    if (!user) return;
    const fetchUnread = async () => {
      try {
        const { count } = await supabase
          .from("notifications")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("read", false)
          .limit(20);
        setUnreadCount(count ?? 0);
      } catch (e) {
        // ignore
      }
    };
    fetchUnread();
  }, [user, currentView]);


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    if (showLanding) {
      return <LandingPage onGetStarted={() => setShowLanding(false)} />;
    }
    return <AuthPage onBack={() => setShowLanding(true)} />;
  }

  const navItems = isJobSeeker
    ? [
        { id: "home", label: "Find Jobs", icon: <Home className="w-5 h-5" /> },
        { id: "applications", label: "My Applications", icon: <FileText className="w-5 h-5" /> },
      ]
    : [
        { id: "manage-jobs", label: "Manage Jobs", icon: <Settings className="w-5 h-5" /> },
        { id: "applications", label: "Applications", icon: <Users className="w-5 h-5" /> },
      ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button
              onClick={() => setCurrentView(isJobSeeker ? "home" : "manage-jobs")}
              className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-800">Ethio Jobs</span>
            </button>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all text-sm ${
                    currentView === item.id
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}

              {isEmployer && (
                <button
                  onClick={() => setCurrentView("post-job")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all text-sm ml-1 ${
                    currentView === "post-job"
                      ? "bg-emerald-600 text-white"
                      : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                  }`}
                >
                  <PlusCircle className="w-5 h-5" />
                  Post Job
                </button>
              )}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {/* Notification bell */}
              <button
                onClick={() => { setCurrentView("notifications"); setMobileMenuOpen(false); }}
                className={`relative p-2.5 rounded-xl transition-colors ${
                  currentView === "notifications" ? "bg-emerald-100 text-emerald-700" : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {/* User info */}
              <div className="hidden md:flex items-center gap-3 pl-3 border-l border-gray-200 ml-1">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                  {profile.full_name.charAt(0)}
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800 text-sm leading-tight">{profile.full_name}</p>
                  <p className="text-xs text-gray-400 capitalize">{profile.role.replace("_", " ")}</p>
                </div>
                <button
                  onClick={signOut}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2.5 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white shadow-lg">
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setCurrentView(item.id); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors text-sm ${
                    currentView === item.id ? "bg-emerald-600 text-white" : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
              {isEmployer && (
                <button
                  onClick={() => { setCurrentView("post-job"); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors text-sm border border-emerald-200"
                >
                  <PlusCircle className="w-5 h-5" />
                  Post New Job
                </button>
              )}
              <div className="pt-3 mt-2 border-t border-gray-100">
                <div className="flex items-center gap-3 px-4 py-2">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
                    {profile.full_name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{profile.full_name}</p>
                    <p className="text-xs text-gray-400 capitalize">{profile.role.replace("_", " ")}</p>
                  </div>
                </div>
                <button
                  onClick={() => { signOut(); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-600 hover:bg-red-50 font-medium transition-colors text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main content */}
      <main className="flex-1">
        {currentView === "home" && isJobSeeker && <JobSearch />}
        {currentView === "applications" && isJobSeeker && <MyApplications />}
        {currentView === "manage-jobs" && isEmployer && (
          <ManageJobs onPostJob={() => setCurrentView("post-job")} />
        )}
        {currentView === "post-job" && isEmployer && (
          <PostJob onSuccess={() => setCurrentView("manage-jobs")} />
        )}
        {currentView === "applications" && isEmployer && <ViewApplications />}
        {currentView === "notifications" && <Notifications />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 mt-8">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-emerald-600" />
              <span className="font-bold text-gray-700">Ethio Jobs</span>
            </div>
            <p className="text-sm text-gray-400">&copy; 2025 Ethio Jobs. Connecting Ethiopian talent with opportunities.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;

