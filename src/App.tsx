import { useEffect, useState } from 'react';
import { db } from './lib/db';
import { subscribeToAuthState, signOutFirebase, autoProvisionConfiguredAccounts } from './lib/auth';
import { User } from './types';
import { Toaster, toast } from 'react-hot-toast';

import { Login } from './components/Login';
import { DashboardLayout } from './components/DashboardLayout';
import { CheckInOut } from './components/CheckInOut';
import { CheckedInList } from './components/CheckedInList';
import { AdminStudents } from './components/AdminStudents';
import { AdminStaff } from './components/AdminStaff';
import { AdminAttendance } from './components/AdminAttendance';
import { StudentDashboard } from './components/StudentDashboard';
import { KumonLogo } from './components/KumonLogo';
import { Clock, LayoutDashboard, LogOut, ShieldAlert, ArrowLeft } from 'lucide-react';
import { 
  useSchoolBranding, 
  isUserAuthorizedForSchool, 
  parseAppRoute, 
  navigateTo, 
  getSchoolBySlug, 
  getSchoolById,
  SEED_SCHOOLS 
} from './lib/tenantContext';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState(() => parseAppRoute(typeof window !== 'undefined' ? window.location.pathname : ''));
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem('activeUser');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [activeTab, setActiveTab] = useState<string>('attendance');
  const { subtitle, themeColor, school } = useSchoolBranding();

  // Listen to browser navigation (back/forward and custom navigateTo calls)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(parseAppRoute(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Initialize DB and background checks
  useEffect(() => {
    try {
      const storedUserRaw = localStorage.getItem('activeUser');
      if (storedUserRaw) {
        const parsed = JSON.parse(storedUserRaw);
        if (parsed && typeof parsed === 'object' && 'password' in parsed) {
          delete parsed.password;
          localStorage.setItem('activeUser', JSON.stringify(parsed));
        }
      }
    } catch {}

    db.init();
    autoProvisionConfiguredAccounts().catch(() => {});

    const unsubscribeAuth = subscribeToAuthState((appUser) => {
      if (appUser) {
        setUser(appUser);
        localStorage.setItem('activeUser', JSON.stringify(appUser));
      } else {
        setUser(null);
        localStorage.removeItem('activeUser');
      }
    });

    return () => {
      if (typeof unsubscribeAuth === 'function') unsubscribeAuth();
    };
  }, []);

  // Handle Root URL redirect
  useEffect(() => {
    if (currentRoute.type === 'root') {
      if (user) {
        const targetSchool = getSchoolById(user.schoolId) || SEED_SCHOOLS[0];
        navigateTo(`/${targetSchool.slug}/dashboard`);
      } else {
        navigateTo('/login');
      }
    }
  }, [currentRoute, user]);

  const handleLogin = (loggedInUser: User, mode: 'kiosk' | 'dashboard') => {
    setUser(loggedInUser);
    localStorage.setItem('activeUser', JSON.stringify(loggedInUser));
    const targetSchool = getSchoolById(loggedInUser.schoolId) || SEED_SCHOOLS[0];
    navigateTo(`/${targetSchool.slug}/${mode}`);
    if (loggedInUser.role === 'admin' || loggedInUser.role === 'super_admin') {
      setActiveTab('attendance');
    } else {
      setActiveTab('checkedin');
    }
  };

  const handleLogout = async () => {
    try {
      await signOutFirebase();
    } catch (e) {
      console.warn('Sign out error:', e);
    }
    setUser(null);
    localStorage.removeItem('activeUser');
    navigateTo('/login');
  };

  // ROUTE: Global Login (/login)
  if (currentRoute.type === 'login') {
    return (
      <>
        <Toaster position="top-center" />
        <Login onLogin={handleLogin} />
      </>
    );
  }

  // Student self-service mode (if student logs in)
  if (user && user.role === 'student') {
    return (
      <div 
        className="min-h-screen p-4 sm:p-8 flex flex-col justify-center transition-colors duration-300"
        style={{ backgroundColor: themeColor }}
      >
        <Toaster position="top-center" />
        <StudentDashboard user={user} onComplete={handleLogout} />
      </div>
    );
  }

  // ROUTE: School Route (/:schoolSlug/kiosk or /:schoolSlug/dashboard)
  if (currentRoute.type === 'school') {
    const matchedSchool = getSchoolBySlug(currentRoute.schoolSlug) || SEED_SCHOOLS[0];

    // VIEW A: Dedicated Student Check-In Kiosk
    if (currentRoute.view === 'kiosk') {
      return (
        <div 
          className="min-h-screen flex flex-col text-[#3c3c3b] font-sans transition-colors duration-300"
          style={{ backgroundColor: matchedSchool.themeColor || '#2edaff' }}
        >
          <Toaster position="top-center" />
          
          {/* Kiosk Header Bar */}
          <header className="bg-white border-b border-[#e5e1da] shadow-sm px-6 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <KumonLogo variant="horizontal" size="md" subtitle={matchedSchool.subtitle || matchedSchool.name} />
              <div className="hidden sm:flex items-center gap-1.5 ml-2 pl-3 border-l border-[#e5e1da] text-xs text-[#5c869e] font-semibold">
                <Clock size={13} />
                Student Check-In Kiosk
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {user ? (
                <>
                  <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#f8f6f3] border border-[#e5e1da] rounded-xl text-xs text-[#6b6965]">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Staff: <strong>{user.name}</strong></span>
                  </div>

                  <button
                    onClick={() => navigateTo(`/${matchedSchool.slug}/dashboard`)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#f0f9ff] hover:bg-[#e0f2fe] text-[#0284c7] rounded-xl text-xs font-bold transition-all cursor-pointer border border-[#bae6fd]"
                  >
                    <LayoutDashboard size={14} />
                    <span>Dashboard</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#fff1ee] hover:bg-[#d98466] text-[#d98466] hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer border border-[#fbdcd4]"
                    title="Sign out and return to login"
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => navigateTo('/login')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#5c869e] hover:bg-[#4a6d82] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                >
                  <LayoutDashboard size={14} />
                  <span>Staff / Admin Sign In</span>
                </button>
              )}
            </div>
          </header>

          {/* Main Kiosk Content Area */}
          <main className="flex-1 p-4 sm:p-8 max-w-4xl w-full mx-auto">
            <CheckInOut user={user} />
          </main>
        </div>
      );
    }

    // VIEW B: Management Dashboard
    // If not authenticated, prompt to login
    if (!user) {
      return (
        <div 
          className="min-h-screen flex items-center justify-center p-4 transition-colors duration-300"
          style={{ backgroundColor: matchedSchool.themeColor || '#2edaff' }}
        >
          <div className="w-full max-w-md bg-white p-8 rounded-[32px] shadow-xl border border-[#e5e1da] text-center">
            <KumonLogo variant="vertical" size="md" subtitle={matchedSchool.subtitle} />
            <h2 className="text-lg font-bold text-[#1e293b] mt-4 mb-2">Authentication Required</h2>
            <p className="text-xs text-[#64748b] mb-6">
              Please sign in to access the {matchedSchool.name} dashboard.
            </p>
            <button
              onClick={() => navigateTo('/login')}
              className="w-full py-3 px-4 bg-[#5c869e] hover:bg-[#4a6d82] text-white font-bold rounded-xl text-sm transition-all cursor-pointer shadow-md"
            >
              Go to Sign In
            </button>
          </div>
        </div>
      );
    }

    // Authorization check: Is user permitted to access this school's dashboard?
    if (!isUserAuthorizedForSchool(user, matchedSchool.id)) {
      const userSchool = getSchoolById(user.schoolId);
      return (
        <div 
          className="min-h-screen flex items-center justify-center p-4 transition-colors duration-300"
          style={{ backgroundColor: '#fff1ee' }}
        >
          <div className="w-full max-w-md bg-white p-8 rounded-[32px] shadow-xl border border-rose-200 text-center">
            <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShieldAlert size={28} />
            </div>
            <h2 className="text-lg font-bold text-rose-950 mb-2">Access Restricted</h2>
            <p className="text-xs text-[#64748b] mb-4 leading-relaxed">
              You are signed in as <strong>{user.name}</strong> ({user.role}) for <strong>{userSchool?.name || 'another center'}</strong>. You do not have permission to view the <strong>{matchedSchool.name}</strong> portal.
            </p>
            <div className="space-y-2">
              {userSchool && (
                <button
                  onClick={() => navigateTo(`/${userSchool.slug}/dashboard`)}
                  className="w-full py-3 px-4 bg-[#5c869e] hover:bg-[#4a6d82] text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={14} />
                  Go to {userSchool.subtitle || userSchool.name} Dashboard
                </button>
              )}
              <button
                onClick={handleLogout}
                className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Authorized Dashboard View
    const renderDashboardContent = () => {
      if (user.role === 'staff') {
        return <CheckedInList />;
      } else {
        switch (activeTab) {
          case 'attendance': return <AdminAttendance />;
          case 'checkedin': return <CheckedInList />;
          case 'students': return <AdminStudents school={matchedSchool} />;
          case 'staff': return <AdminStaff currentUser={user} school={matchedSchool} />;
          default: return <AdminAttendance />;
        }
      }
    };

    return (
      <>
        <Toaster position="top-right" />
        <DashboardLayout 
          user={user} 
          onLogout={handleLogout} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          onLaunchKiosk={() => navigateTo(`/${matchedSchool.slug}/kiosk`)}
        >
          {renderDashboardContent()}
        </DashboardLayout>
      </>
    );
  }

  // Fallback loading / redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f6f3]">
      <Toaster position="top-center" />
      <div className="text-xs text-[#8c8a86] font-medium">Loading portal...</div>
    </div>
  );
}
