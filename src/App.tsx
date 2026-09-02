import { useEffect, useState } from 'react';
import { db } from './lib/db';
import { subscribeToAuthState, signOutFirebase } from './lib/auth';
import { User } from './types';
import { Toaster } from 'react-hot-toast';

import { Login } from './components/Login';
import { DashboardLayout } from './components/DashboardLayout';
import { CheckInOut } from './components/CheckInOut';
import { CheckedInList } from './components/CheckedInList';
import { AdminStudents } from './components/AdminStudents';
import { AdminStaff } from './components/AdminStaff';
import { AdminAttendance } from './components/AdminAttendance';
import { StudentDashboard } from './components/StudentDashboard';
import { KumonLogo } from './components/KumonLogo';
import { Clock, LayoutDashboard, Lock, LogOut, Shield } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [appMode, setAppMode] = useState<'kiosk' | 'dashboard'>('kiosk');
  const [activeTab, setActiveTab] = useState<string>('attendance');

  useEffect(() => {
    // Sanitize any legacy cached passwords from localStorage
    try {
      const storedUserRaw = localStorage.getItem('activeUser');
      if (storedUserRaw) {
        const parsed = JSON.parse(storedUserRaw);
        if (parsed && typeof parsed === 'object' && 'password' in parsed) {
          delete parsed.password;
          localStorage.setItem('activeUser', JSON.stringify(parsed));
        }
      }
      const cachedUsersRaw = localStorage.getItem('checkin_users');
      if (cachedUsersRaw) {
        const parsedUsers = JSON.parse(cachedUsersRaw);
        if (Array.isArray(parsedUsers)) {
          const sanitized = parsedUsers.map(({ password, ...rest }: any) => rest);
          localStorage.setItem('checkin_users', JSON.stringify(sanitized));
        }
      }
    } catch {}

    // Initialize DB with seed data if empty
    db.init();
    
    // Check local storage for persistent session
    const storedUser = localStorage.getItem('activeUser');
    const storedMode = localStorage.getItem('appMode') as 'kiosk' | 'dashboard' | null;
    if (storedMode) setAppMode(storedMode);

    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        setUser(u);
        if (u.role === 'admin') setActiveTab('attendance');
        else if (u.role === 'staff') setActiveTab('checkedin');
      } catch (e) {
        console.warn('Failed to parse activeUser:', e);
      }
    }

    // Subscribe to Firebase Auth state
    const unsubscribeAuth = subscribeToAuthState((appUser, fbUser) => {
      if (appUser && fbUser) {
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

  // Inactivity timeout for kiosk and shared terminals (15 minutes of inactivity)
  useEffect(() => {
    if (!user) return;

    const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000;
    let timeoutId: ReturnType<typeof setTimeout>;

    const resetInactivityTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        handleLogout();
      }, INACTIVITY_TIMEOUT_MS);
    };

    const activityEvents = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    activityEvents.forEach(evt => window.addEventListener(evt, resetInactivityTimer, { passive: true }));
    resetInactivityTimer();

    return () => {
      clearTimeout(timeoutId);
      activityEvents.forEach(evt => window.removeEventListener(evt, resetInactivityTimer));
    };
  }, [user]);

  const handleLogin = (loggedInUser: User, mode: 'kiosk' | 'dashboard') => {
    setUser(loggedInUser);
    setAppMode(mode);
    localStorage.setItem('activeUser', JSON.stringify(loggedInUser));
    localStorage.setItem('appMode', mode);
    if (loggedInUser.role === 'admin') {
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
    localStorage.removeItem('appMode');
    localStorage.removeItem('checkin_users');
    localStorage.removeItem('checkin_students');
    localStorage.removeItem('checkin_attendance');
  };

  const switchMode = (mode: 'kiosk' | 'dashboard') => {
    setAppMode(mode);
    localStorage.setItem('appMode', mode);
  };

  if (!user) {
    return (
      <>
        <Toaster position="top-center" />
        <Login onLogin={handleLogin} />
      </>
    );
  }

  // Student self-service mode (if student logs in)
  if (user.role === 'student') {
    return (
      <div className="min-h-screen bg-[#2edaff] p-4 sm:p-8 flex flex-col justify-center">
        <Toaster position="top-center" />
        <StudentDashboard user={user} onComplete={handleLogout} />
      </div>
    );
  }

  // MODE A: DEDICATED STUDENT CHECK-IN KIOSK (NO DASHBOARD/SIDEBAR CLUTTER)
  if (appMode === 'kiosk') {
    return (
      <div className="min-h-screen bg-[#2edaff] flex flex-col text-[#3c3c3b] font-sans">
        <Toaster position="top-center" />
        
        {/* Kiosk Header Bar */}
        <header className="bg-white border-b border-[#e5e1da] shadow-sm px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <KumonLogo variant="horizontal" size="md" subtitle="Dublin - East" />
            <div className="hidden sm:flex items-center gap-1.5 ml-2 pl-3 border-l border-[#e5e1da] text-xs text-[#5c869e] font-semibold">
              <Clock size={13} />
              Student Check-In Kiosk
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#f8f6f3] border border-[#e5e1da] rounded-xl text-xs text-[#6b6965]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Staff: <strong>{user.name}</strong></span>
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#fff1ee] hover:bg-[#d98466] text-[#d98466] hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer border border-[#fbdcd4]"
              title="Sign out and return to login"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* Main Kiosk Content Area */}
        <main className="flex-1 p-4 sm:p-8 max-w-4xl w-full mx-auto">
          <CheckInOut user={user} />
        </main>
      </div>
    );
  }

  // MODE B: ADMIN & STAFF MANAGEMENT DASHBOARD (SIDEBAR + MANAGEMENT VIEWS)
  const renderDashboardContent = () => {
    if (user.role === 'staff') {
      return <CheckedInList />;
    } else {
      switch (activeTab) {
        case 'attendance': return <AdminAttendance />;
        case 'checkedin': return <CheckedInList />;
        case 'students': return <AdminStudents />;
        case 'staff': return <AdminStaff />;
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
        onLaunchKiosk={() => switchMode('kiosk')}
      >
        {renderDashboardContent()}
      </DashboardLayout>
    </>
  );
}
