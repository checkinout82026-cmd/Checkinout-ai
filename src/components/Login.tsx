import React, { useState } from 'react';
import { signInWithEmail } from '../lib/auth';
import { User } from '../types';
import { KumonLogo } from './KumonLogo';
import toast from 'react-hot-toast';
import { Shield, Lock, User as UserIcon, Loader2, Eye, EyeOff, ArrowRight, Clock, LayoutDashboard } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User, targetMode: 'kiosk' | 'dashboard') => void;
}

export function Login({ onLogin }: LoginProps) {
  const [targetMode, setTargetMode] = useState<'kiosk' | 'dashboard'>('kiosk');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Handle Staff/Admin Sign In using Username & Password
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = username.trim();
    if (!cleanUsername) {
      toast.error('Please enter your username');
      return;
    }
    if (!password) {
      toast.error('Please enter your password');
      return;
    }

    setLoading(true);
    try {
      const user = await signInWithEmail(cleanUsername, password);
      toast.success(`Welcome, ${user.name}! Opening ${targetMode === 'kiosk' ? 'Check-In Kiosk' : 'Management Dashboard'}`);
      onLogin(user, targetMode);
    } catch (err: any) {
      console.warn('Sign in attempt failed:', err?.code || err);
      let errorMsg = 'Invalid username or password';
      if (err?.code === 'auth/too-many-requests') {
        errorMsg = 'Too many attempts. Please wait a moment and try again.';
      }
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#2edaff] text-[#3c3c3b] font-sans p-4">
      <div className="w-full max-w-md bg-white p-7 sm:p-9 rounded-[36px] shadow-xl border border-[#e5e1da] animate-in fade-in zoom-in-95 duration-200">
        {/* Header Branding */}
        <div className="text-center mb-6 flex flex-col items-center">
          <KumonLogo variant="vertical" size="lg" subtitle="Dublin - East" />
        </div>

        {/* Portal Mode Selector (Kiosk vs Management Dashboard) */}
        <div className="bg-[#f8f6f3] p-1.5 rounded-2xl border border-[#e5e1da] grid grid-cols-2 gap-1.5 mb-6">
          <button
            type="button"
            onClick={() => setTargetMode('kiosk')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              targetMode === 'kiosk'
                ? 'bg-[#5c869e] text-white shadow-sm'
                : 'text-[#8c8a86] hover:text-[#3c3c3b]'
            }`}
          >
            <Clock size={15} />
            Check-In Kiosk
          </button>
          <button
            type="button"
            onClick={() => setTargetMode('dashboard')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              targetMode === 'dashboard'
                ? 'bg-[#5c869e] text-white shadow-sm'
                : 'text-[#8c8a86] hover:text-[#3c3c3b]'
            }`}
          >
            <LayoutDashboard size={15} />
            Management Portal
          </button>
        </div>

        {/* Dynamic Mode Caption */}
        <div className="text-center mb-5">
          {targetMode === 'kiosk' ? (
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#5c869e]/10 text-[#4b6573] rounded-full text-[11px] font-bold uppercase tracking-wider">
                <Clock size={13} className="text-[#5c869e]" />
                Staff Check-In Kiosk
              </div>
              <p className="text-xs text-[#8c8a86] mt-1">
                Unlock the dedicated student check-in &amp; check-out kiosk.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#5c869e]/10 text-[#4b6573] rounded-full text-[11px] font-bold uppercase tracking-wider">
                <Shield size={13} className="text-[#5c869e]" />
                Admin &amp; Staff Dashboard
              </div>
              <p className="text-xs text-[#8c8a86] mt-1">
                Access attendance logs, roster, staff accounts, and reports.
              </p>
            </div>
          )}
        </div>

        {/* SIGN IN FORM */}
        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-2">
              Username
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-[#f8f6f3] border border-[#e5e1da] rounded-2xl focus:ring-2 focus:ring-[#5c869e] focus:border-[#5c869e] outline-none transition-all text-[#3c3c3b] font-medium"
                placeholder="Enter your username"
                autoFocus
                required
                disabled={loading}
              />
              <UserIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8c8a86]" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold">
                Password
              </label>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-12 py-3.5 bg-[#f8f6f3] border border-[#e5e1da] rounded-2xl focus:ring-2 focus:ring-[#5c869e] focus:border-[#5c869e] outline-none transition-all text-[#3c3c3b] font-medium font-mono"
                placeholder="••••••••"
                required
                disabled={loading}
              />
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8c8a86]" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8c8a86] hover:text-[#3c3c3b] p-1 cursor-pointer transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#5c869e] hover:opacity-90 active:scale-[0.99] text-white font-bold py-4 rounded-2xl transition-all mt-3 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-sm text-sm"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Signing In...
              </>
            ) : targetMode === 'kiosk' ? (
              <>
                <Clock size={18} />
                Launch Check-In Kiosk
                <ArrowRight size={16} />
              </>
            ) : (
              <>
                <Shield size={18} />
                Open Management Dashboard
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
