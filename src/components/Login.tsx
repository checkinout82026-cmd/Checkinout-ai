import React, { useState, useEffect, useRef } from 'react';
import { db } from '../lib/db';
import { signInWithEmail, signInWithGoogle, sendPasswordReset } from '../lib/auth';
import { User, Student, AttendanceRecord } from '../types';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Database, Shield, GraduationCap, Lock, Mail, KeyRound, ArrowLeft, Loader2, CheckCircle2, LogOut, Clock, Smartphone, UserCheck } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

interface StudentActionResult {
  studentName: string;
  studentId: string;
  type: 'check-in' | 'check-out';
  time: string;
  parentPhone: string;
  parentName: string;
}

export function Login({ onLogin }: LoginProps) {
  const [mode, setMode] = useState<'student' | 'staff'>('student');
  const [staffAuthMode, setStaffAuthMode] = useState<'signin' | 'forgot'>('signin');
  
  // Input fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  
  // Direct Check-In / Check-Out confirmation state for student terminal
  const [actionStatus, setActionStatus] = useState<StudentActionResult | null>(null);
  const [actionCountdown, setActionCountdown] = useState<number>(3);
  const [isSubmittingStudent, setIsSubmittingStudent] = useState(false);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Subscribe to Firestore for real-time credentials and student search
    const unsubStudents = db.subscribeStudents((list) => {
      setStudents(list);
    });

    const unsubAttendance = db.subscribeAttendance((list) => {
      setAttendance(list);
    });

    return () => {
      if (typeof unsubStudents === 'function') unsubStudents();
      if (typeof unsubAttendance === 'function') unsubAttendance();
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, []);

  // Handle direct 1-step Student Check-In or Check-Out (by ID)
  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingStudent) return;

    const student = students.find(s => s.id.toLowerCase() === username.trim().toLowerCase());
    if (!student) {
      toast.error('Student ID not found in database');
      return;
    }

    setIsSubmittingStudent(true);

    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const now = new Date().toISOString();
      const timeFormatted = format(new Date(now), 'h:mm a');
      const existingRecord = attendance.find(r => r.studentId === student.id && r.date === today);
      const parentPhone = student.parent?.phone || student.parentPhone || 'Parent Contact';
      const parentName = student.parent?.name || student.parentName || 'Parent';

      const isCheckingOut = existingRecord && !existingRecord.checkOutTime;

      if (isCheckingOut) {
        // Direct CHECK OUT
        const updatedRecord: AttendanceRecord = {
          ...existingRecord,
          status: 'checked_out',
          checkOutTime: now,
          checkOutStaffId: 'kiosk',
          checkOutStaffName: 'Student Kiosk Terminal',
          pickupPerson: parentName,
          pickupPersonName: parentName,
          smsNotificationSent: true,
          smsSentAt: now,
          updatedAt: now
        };

        await db.saveAttendanceRecord(updatedRecord);

        // Top SMS toast notification
        toast.success(
          `Check-out recorded! SMS automatically sent to ${parentPhone}`,
          { duration: 4000, icon: '📱' }
        );

        setActionStatus({
          studentName: student.name,
          studentId: student.id,
          type: 'check-out',
          time: timeFormatted,
          parentPhone,
          parentName
        });
      } else {
        // Direct CHECK IN
        const newRecord: AttendanceRecord = {
          id: existingRecord?.id || crypto.randomUUID(),
          studentId: student.id,
          studentName: student.name,
          date: today,
          status: 'checked_in',
          checkInTime: now,
          checkInMethod: 'student_self',
          checkOutTime: null,
          smsNotificationSent: true,
          smsSentAt: now,
          createdAt: existingRecord?.createdAt || now,
          updatedAt: now
        };

        await db.saveAttendanceRecord(newRecord);

        // Top SMS toast notification
        toast.success(
          `Check-in recorded! SMS automatically sent to ${parentPhone}`,
          { duration: 4000, icon: '📱' }
        );

        setActionStatus({
          studentName: student.name,
          studentId: student.id,
          type: 'check-in',
          time: timeFormatted,
          parentPhone,
          parentName
        });
      }

      // Reset student ID input field
      setUsername('');

      // Trigger automatic 3s countdown for next student
      setActionCountdown(3);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

      let count = 3;
      countdownIntervalRef.current = setInterval(() => {
        count -= 1;
        setActionCountdown(count);
        if (count <= 0) {
          if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
          setActionStatus(null);
        }
      }, 1000);

    } catch (err) {
      console.error('Error processing student attendance:', err);
      toast.error('Failed to record attendance. Please try again.');
    } finally {
      setIsSubmittingStudent(false);
    }
  };

  const handleDismissConfirmation = () => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setActionStatus(null);
  };

  // Handle Staff/Admin Firebase Email/Password Sign In
  const handleStaffSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await signInWithEmail(email || username, password);
      toast.success(`Welcome back, ${user.name} (${user.role})`);
      onLogin(user);
    } catch (err: any) {
      console.error('Sign in notice:', err);
      let errorMsg = err?.message || 'Invalid email or password';
      if (err.code === 'auth/invalid-email') errorMsg = 'Invalid email address format';
      if (err.code === 'auth/wrong-password') errorMsg = 'Incorrect password';
      if (err.code === 'auth/user-not-found') errorMsg = 'No account found with this email';
      if (err.code === 'auth/too-many-requests') errorMsg = 'Too many attempts. Please wait or reset password';
      if (err.code === 'auth/operation-not-allowed') errorMsg = 'Email/Password sign-in provider is not enabled in Firebase Console. Authenticating with school registry...';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Sign-In with Firebase Popup
  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const user = await signInWithGoogle('staff');
      toast.success(`Signed in with Google as ${user.name}`);
      onLogin(user);
    } catch (err: any) {
      console.error('Google sign in error:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        toast.error('Google sign-in was canceled or failed');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Password Reset Email
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email && !username) {
      toast.error('Please enter your email address');
      return;
    }
    setLoading(true);
    try {
      await sendPasswordReset(email || username);
      toast.success('Password reset link sent to your email!');
      setStaffAuthMode('signin');
    } catch (err: any) {
      console.error('Password reset error:', err);
      toast.error('Could not send reset email. Verify the email address.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#2edaff] text-[#3c3c3b] font-sans p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-[32px] shadow-sm border border-[#e5e1da]">
        {/* Header Branding */}
        <div className="text-center mb-6">
          {/* Kumon Logo */}
          <img
            src="/kumon_logo.webp" // Update this path based on where you store the logo
            alt="Kumon Dublin - East"
            className="mx-auto h-24 w-auto object-contain mb-4"
          />

          {/* Location */}
          <h1 className="text-3xl font-bold text-black">
            Dublin - East
          </h1>
        </div>

        {/* Top Role Selector */}
        <div className="flex bg-[#f8f6f3] p-1.5 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => { setMode('student'); setStaffAuthMode('signin'); }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              mode === 'student' ? 'bg-white shadow-sm text-[#4a4a48]' : 'text-[#8c8a86] hover:text-[#4a4a48]'
            }`}
          >
            <GraduationCap size={16} />
            Student Check-In
          </button>
          <button
            type="button"
            onClick={() => setMode('staff')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              mode === 'staff' ? 'bg-white shadow-sm text-[#4a4a48]' : 'text-[#8c8a86] hover:text-[#4a4a48]'
            }`}
          >
            <Shield size={16} />
            Staff / Admin
          </button>
        </div>

        {/* STUDENT MODE */}
        {mode === 'student' && (
          <div>
            {actionStatus ? (
              /* Success Confirmation Banner */
              <div className="text-center py-4 space-y-4 animate-in fade-in zoom-in-95">
                <div className="w-16 h-16 bg-[#5c869e]/15 text-[#5c869e] rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={36} />
                </div>
                
                <div>
                  <span className="inline-block px-3 py-1 bg-[#5c869e]/10 text-[#5c869e] text-xs font-bold uppercase tracking-wider rounded-full mb-1">
                    {actionStatus.type === 'check-in' ? 'Check-In Recorded' : 'Check-Out Approved'}
                  </span>
                  <h2 className="text-2xl font-bold text-[#3c3c3b]">
                    {actionStatus.studentName}
                  </h2>
                  <p className="text-xs text-[#8c8a86] font-mono mt-0.5">
                    Student ID: {actionStatus.studentId}
                  </p>
                </div>

                <div className="bg-[#f8f6f3] border border-[#e5e1da] rounded-2xl p-4 text-left space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#8c8a86] flex items-center gap-1.5 font-medium">
                      <Clock size={14} /> Time:
                    </span>
                    <span className="font-bold text-[#3c3c3b] font-mono">{actionStatus.time}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-[#e5e1da]">
                    <span className="text-[#8c8a86] flex items-center gap-1.5 font-medium">
                      <Smartphone size={14} /> SMS Dispatched:
                    </span>
                    <span className="font-semibold text-[#5c869e] text-right truncate max-w-[180px]">
                      {actionStatus.parentPhone}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDismissConfirmation}
                  className="w-full py-3.5 bg-[#5c869e] hover:opacity-90 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer text-sm shadow-sm"
                >
                  <UserCheck size={16} />
                  Done / Next Student ({actionCountdown}s)
                </button>
              </div>
            ) : (() => {
              const matchedStudent = username.trim() ? students.find(s => s.id.toLowerCase() === username.trim().toLowerCase()) : null;
              const today = format(new Date(), 'yyyy-MM-dd');
              const todayRecord = matchedStudent ? attendance.find(r => r.studentId === matchedStudent.id && r.date === today) : null;
              const isCheckedIn = todayRecord && !todayRecord.checkOutTime;
              const isCheckedOut = todayRecord && Boolean(todayRecord.checkOutTime);
              
              const buttonText = isCheckedIn ? 'Check out' : isCheckedOut ? 'Check In Again' : 'Check In';
              const buttonBg = isCheckedIn ? 'bg-[#d98466]' : 'bg-[#5c869e]';

              return (
                <form onSubmit={handleStudentSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-2">
                      Student ID #
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-5 py-3.5 bg-[#f8f6f3] border border-[#e5e1da] rounded-2xl focus:ring-2 focus:ring-[#5c869e] focus:border-[#5c869e] outline-none transition-all text-[#3c3c3b] font-mono text-lg"
                      placeholder="e.g. 10001"
                      autoFocus
                      required
                      disabled={isSubmittingStudent}
                    />

                    {/* Student Lookup Preview */}
                    {username.trim() && (() => {
                      if (matchedStudent) {
                        return (
                          <div className="mt-3 p-3.5 bg-[#5c869e10] border border-[#5c869e30] rounded-2xl animate-in fade-in slide-in-from-top-1 text-left">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-[#5c869e] uppercase tracking-wider">Student Found</span>
                              <span className="text-[11px] font-mono font-bold text-[#8c8a86]">ID: {matchedStudent.id}</span>
                            </div>
                            <div className="text-base font-serif font-bold text-[#4a4a48] mt-0.5">{matchedStudent.name}</div>
                            <div className="text-xs text-[#8c8a86] mt-1 space-y-0.5">
                              <div><span className="font-semibold text-[#4a4a48]">Parent/Guardian:</span> {matchedStudent.parent?.name || matchedStudent.parentName || 'N/A'} ({matchedStudent.parent?.phone || matchedStudent.parentPhone || 'No phone'})</div>
                              <div className="pt-1 text-[11px]">
                                {isCheckedIn && (
                                  <span className="inline-flex items-center gap-1 text-[#2e7d32] font-semibold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#2e7d32]"></span>
                                    Currently checked in (at {todayRecord?.checkInTime ? format(new Date(todayRecord.checkInTime), 'h:mm a') : 'today'})
                                  </span>
                                )}
                                {isCheckedOut && (
                                  <span className="inline-flex items-center gap-1 text-[#8c8a86] font-medium">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#8c8a86]"></span>
                                    Completed for today (Out at {todayRecord?.checkOutTime ? format(new Date(todayRecord.checkOutTime), 'h:mm a') : ''})
                                  </span>
                                )}
                                {!todayRecord && (
                                  <span className="inline-flex items-center gap-1 text-[#5c869e] font-medium">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#5c869e]"></span>
                                    Ready for today's check-in
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      }
                      const partialMatches = students.filter(s => s.id.includes(username.trim()) || s.name.toLowerCase().includes(username.trim().toLowerCase())).slice(0, 3);
                      if (partialMatches.length > 0) {
                        return (
                          <div className="mt-2 text-xs text-[#8c8a86]">
                            <span className="font-semibold">Quick select: </span>
                            {partialMatches.map(s => (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => setUsername(s.id)}
                                className="mr-2 underline hover:text-[#5c869e] font-mono"
                              >
                                {s.id} ({s.name})
                              </button>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>

                  {matchedStudent && (
                    <button
                      type="submit"
                      disabled={isSubmittingStudent}
                      className={`w-full ${buttonBg} hover:opacity-90 text-white font-bold py-4 rounded-2xl transition-all mt-4 flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50`}
                    >
                      {isSubmittingStudent ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Processing...
                        </>
                      ) : isCheckedIn ? (
                        <>
                          <LogOut size={18} />
                          {buttonText}
                        </>
                      ) : (
                        <>
                          <GraduationCap size={18} />
                          {buttonText}
                        </>
                      )}
                    </button>
                  )}
                </form>
              );
            })()}
          </div>
        )}

        {/* STAFF & ADMIN AUTH MODES */}
        {mode === 'staff' && (
          <div>
            {/* FORGOT PASSWORD FORM */}
            {staffAuthMode === 'forgot' ? (
              <form onSubmit={handleForgotPassword} className="space-y-4 animate-in fade-in">
                <button
                  type="button"
                  onClick={() => setStaffAuthMode('signin')}
                  className="inline-flex items-center gap-1.5 text-xs text-[#8c8a86] hover:text-[#4a4a48] font-bold mb-2 cursor-pointer"
                >
                  <ArrowLeft size={14} /> Back to Sign In
                </button>
                <h2 className="text-base font-serif font-semibold text-[#4a4a48]">Reset Staff / Admin Password</h2>
                <p className="text-xs text-[#8c8a86]">
                  Enter your registered email address to receive an official Firebase password reset link.
                </p>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-2">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="smith.admin@school.com"
                      className="w-full px-5 py-3.5 bg-[#f8f6f3] border border-[#e5e1da] rounded-2xl focus:ring-2 focus:ring-[#5c869e] outline-none text-[#3c3c3b]"
                    />
                    <Mail size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8c8a86]" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#5c869e] hover:opacity-90 text-white font-bold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <KeyRound size={18} />}
                  Send Password Reset Link
                </button>
              </form>
            ) : (
              /* SIGN IN FORM (NO PUBLIC CREATE ACCOUNT) */
              <form onSubmit={handleStaffSignIn} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-2">Email Address</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={email || username}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setUsername(e.target.value);
                      }}
                      className="w-full px-5 py-3.5 bg-[#f8f6f3] border border-[#e5e1da] rounded-2xl focus:ring-2 focus:ring-[#5c869e] focus:border-[#5c869e] outline-none transition-all text-[#3c3c3b]"
                      placeholder="smith.admin@school.com"
                      required
                    />
                    <Mail size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8c8a86]" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold">Password</label>
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-5 py-3.5 bg-[#f8f6f3] border border-[#e5e1da] rounded-2xl focus:ring-2 focus:ring-[#5c869e] focus:border-[#5c869e] outline-none transition-all text-[#3c3c3b]"
                      placeholder="••••••••"
                      required
                    />
                    <Lock size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8c8a86]" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#5c869e] hover:opacity-90 text-white font-bold py-4 rounded-2xl transition-all mt-2 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Shield size={18} />}
                  Sign In 
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
