import React, { useState, useEffect } from 'react';
import { db } from '../lib/db';
import { registerStaffOrAdmin, sendPasswordReset } from '../lib/auth';
import { User, Role } from '../types';
import { formatPhoneNumber } from '../lib/utils';
import toast from 'react-hot-toast';
import { UserPlus, KeyRound, Shield, Trash2, Mail, Loader2, CheckCircle2, Edit3, User as UserIcon, Lock, Phone, Info, X, Eye, EyeOff } from 'lucide-react';

export function AdminStaff() {
  const [staffList, setStaffList] = useState<User[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // Form state for creating user
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<Role>('staff');

  // Form state for editing user
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState<Role>('staff');

  useEffect(() => {
    const unsubscribe = db.subscribeUsers((users) => {
      setStaffList(users);
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername) {
      toast.error('Please specify a username');
      return;
    }

    if (staffList.find(u => u.username.toLowerCase() === cleanUsername)) {
      toast.error('Username already taken. Please choose another username.');
      return;
    }

    const cleanEmail = email.trim() || `${cleanUsername}@school.org`;
    const cleanPassword = password.trim();
    if (!cleanPassword || cleanPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      // Create user in Firebase Auth & Firestore
      await registerStaffOrAdmin(
        cleanEmail,
        cleanPassword,
        name.trim(),
        role,
        phone.trim(),
        cleanUsername
      );
      toast.success(`${role === 'admin' ? 'Administrator' : 'Staff member'} created with username "${cleanUsername}"!`);
      
      // Reset
      setName('');
      setUsername('');
      setPassword('');
      setEmail('');
      setPhone('');
      setRole('staff');
      setShowAddForm(false);
    } catch (err: any) {
      console.warn('Firebase Auth user creation notice:', err);
      // Fallback to Firestore saving directly
      const newUser: User = {
        id: 'u_' + crypto.randomUUID().slice(0, 8),
        username: cleanUsername,
        password: cleanPassword,
        name: name.trim(),
        fullName: name.trim(),
        role,
        email: cleanEmail,
        phone: phone.trim() || '',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await db.saveUser(newUser);
      toast.success(`Account saved with username "${cleanUsername}"`);
      setShowAddForm(false);
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (user: User) => {
    setEditingUser(user);
    setEditName(user.name || user.fullName || '');
    setEditUsername(user.username || '');
    setEditPassword(user.password || '');
    setEditEmail(user.email || '');
    setEditPhone(user.phone || '');
    setEditRole(user.role || 'staff');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const cleanUsername = editUsername.trim().toLowerCase();
    if (!cleanUsername) {
      toast.error('Username cannot be empty');
      return;
    }

    // Check if username is taken by another user
    const existing = staffList.find(u => u.id !== editingUser.id && u.username.toLowerCase() === cleanUsername);
    if (existing) {
      toast.error(`Username "${cleanUsername}" is already taken by another account`);
      return;
    }

    setLoading(true);
    try {
      const updatedUser: User = {
        ...editingUser,
        username: cleanUsername,
        name: editName.trim(),
        fullName: editName.trim(),
        password: editPassword.trim() || editingUser.password || '',
        email: editEmail.trim() || `${cleanUsername}@school.org`,
        phone: editPhone.trim(),
        role: editRole,
        updatedAt: new Date().toISOString()
      };

      await db.saveUser(updatedUser);
      toast.success(`Account updated! New username is "${cleanUsername}"`);
      setEditingUser(null);
    } catch (err) {
      console.error('Error saving user update:', err);
      toast.error('Failed to update account');
    } finally {
      setLoading(false);
    }
  };

  const handleSendReset = async (userEmail: string, userName: string) => {
    if (!userEmail) {
      toast.error('No email specified for this user');
      return;
    }
    try {
      await sendPasswordReset(userEmail);
      toast.success(`Password reset email sent to ${userName} (${userEmail})`);
    } catch (err: any) {
      console.error('Reset password error:', err);
      toast.error('Could not send password reset email');
    }
  };

  const deleteStaff = async (id: string, userName: string) => {
    if (confirm(`Are you sure you want to remove ${userName}?`)) {
      await db.deleteUser(id);
      toast.success('Account removed from database');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-serif font-semibold text-[#4a4a48]">Manage Staff & Admins</h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-[#5c869e]/15 text-[#4b6573] rounded-full">
              {staffList.filter(u => u.role !== 'student').length} Accounts
            </span>
          </div>
          <p className="text-[#8c8a86] mt-1 text-sm">
            Configure usernames, passwords, and permissions for all staff and administrator accounts.
          </p>
        </div>
        <button
          onClick={() => { setShowAddForm(!showAddForm); setEditingUser(null); }}
          className="inline-flex items-center gap-2 px-5 py-3 bg-[#5c869e] hover:opacity-90 text-white font-bold rounded-2xl transition-all shadow-sm text-sm cursor-pointer"
        >
          <UserPlus size={18} />
          {showAddForm ? 'Close Form' : 'Add Staff or Admin'}
        </button>
      </div>

      {/* Instructions / How-To Banner */}
      <div className="bg-[#f0f6fa] border border-[#d2e4ef] p-4 rounded-2xl flex items-start gap-3.5">
        <div className="p-2 bg-[#5c869e]/15 text-[#5c869e] rounded-xl shrink-0 mt-0.5">
          <Info size={18} />
        </div>
        <div className="text-xs text-[#3c3c3b] space-y-1">
          <p className="font-semibold text-sm text-[#2d4b5a]">How to Set &amp; Use Usernames</p>
          <p className="text-[#4b6573] leading-relaxed">
            Staff and Administrators sign in using their <strong>Username</strong> and <strong>Password</strong> directly on the Staff / Admin tab of the login screen. You can set any custom username (e.g. <code className="bg-white px-1.5 py-0.5 rounded border border-[#d2e4ef] font-mono text-[11px]">sarah.staff</code>, <code className="bg-white px-1.5 py-0.5 rounded border border-[#d2e4ef] font-mono text-[11px]">admin</code>, or <code className="bg-white px-1.5 py-0.5 rounded border border-[#d2e4ef] font-mono text-[11px]">dublin_staff</code>) by clicking <strong>"Edit Account"</strong> below or creating a new account.
          </p>
        </div>
      </div>

      {/* CREATE NEW USER FORM */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-[32px] border border-[#e5e1da] shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Shield size={20} className="text-[#5c869e]" />
              <h2 className="text-lg font-serif font-semibold text-[#4a4a48]">Register New Account</h2>
            </div>
            <button 
              type="button" 
              onClick={() => setShowAddForm(false)} 
              className="text-[#8c8a86] hover:text-[#4a4a48] p-1"
            >
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleAddStaff} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-2">
                Username (Used to Log In) *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="e.g. sarah.staff or admin"
                  className="w-full pl-10 pr-4 py-3 bg-[#f8f6f3] border border-[#e5e1da] rounded-2xl outline-none focus:ring-2 focus:ring-[#5c869e] text-[#3c3c3b] font-mono text-sm"
                />
                <UserIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8c8a86]" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-2">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-[#f8f6f3] border border-[#e5e1da] rounded-2xl outline-none focus:ring-2 focus:ring-[#5c869e] text-[#3c3c3b] font-mono text-sm"
                />
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8c8a86]" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8c8a86] hover:text-[#4a4a48] p-1 cursor-pointer transition-colors"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-2">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Sarah Jenkins"
                className="w-full px-4 py-3 bg-[#f8f6f3] border border-[#e5e1da] rounded-2xl outline-none focus:ring-2 focus:ring-[#5c869e] text-[#3c3c3b]"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-2">Access Role *</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as Role)}
                className="w-full px-4 py-3 bg-[#f8f6f3] border border-[#e5e1da] rounded-2xl outline-none focus:ring-2 focus:ring-[#5c869e] text-[#3c3c3b]"
              >
                <option value="staff">Staff (Daily Student Check In / Out)</option>
                <option value="admin">Administrator (Full System Access & Settings)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-2">Phone Number (Optional)</label>
              <div className="relative">
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(formatPhoneNumber(e.target.value))}
                  placeholder="(614) - 555- 0000"
                  className="w-full pl-10 pr-4 py-3 bg-[#f8f6f3] border border-[#e5e1da] rounded-2xl outline-none focus:ring-2 focus:ring-[#5c869e] text-[#3c3c3b]"
                />
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8c8a86]" />
              </div>
              <p className="text-[11px] text-[#8c8a86] mt-1">Dashes not needed — just type 10 digits</p>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-2">Email Address (Optional)</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="sarah@school.org"
                  className="w-full pl-10 pr-4 py-3 bg-[#f8f6f3] border border-[#e5e1da] rounded-2xl outline-none focus:ring-2 focus:ring-[#5c869e] text-[#3c3c3b]"
                />
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8c8a86]" />
              </div>
            </div>

            <div className="md:col-span-2 flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-[#5c869e] hover:opacity-90 text-white font-bold rounded-2xl transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                Create Account
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-6 py-3 bg-[#f2efe9] hover:bg-[#edeae6] text-[#8c8a86] font-bold rounded-2xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT EXISTING USER MODAL / FORM */}
      {editingUser && (
        <div className="bg-white p-6 rounded-[32px] border-2 border-[#5c869e] shadow-md animate-in fade-in">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Edit3 size={20} className="text-[#5c869e]" />
              <h2 className="text-lg font-serif font-semibold text-[#4a4a48]">
                Edit Account: <span className="text-[#5c869e]">{editingUser.name}</span>
              </h2>
            </div>
            <button 
              type="button" 
              onClick={() => setEditingUser(null)} 
              className="text-[#8c8a86] hover:text-[#4a4a48] p-1 cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSaveEdit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-2">
                Username (Login Identifier) *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={editUsername}
                  onChange={e => setEditUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#f8f6f3] border border-[#e5e1da] rounded-2xl outline-none focus:ring-2 focus:ring-[#5c869e] text-[#3c3c3b] font-mono text-sm font-bold"
                  placeholder="e.g. smith.admin or admin"
                />
                <UserIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5c869e]" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-2">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showEditPassword ? "text" : "password"}
                  required
                  value={editPassword}
                  onChange={e => setEditPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-[#f8f6f3] border border-[#e5e1da] rounded-2xl outline-none focus:ring-2 focus:ring-[#5c869e] text-[#3c3c3b] font-mono text-sm"
                />
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8c8a86]" />
                <button
                  type="button"
                  onClick={() => setShowEditPassword(!showEditPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8c8a86] hover:text-[#4a4a48] p-1 cursor-pointer transition-colors"
                  title={showEditPassword ? "Hide password" : "Show password"}
                >
                  {showEditPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-2">Full Name</label>
              <input
                type="text"
                required
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="w-full px-4 py-3 bg-[#f8f6f3] border border-[#e5e1da] rounded-2xl outline-none focus:ring-2 focus:ring-[#5c869e] text-[#3c3c3b]"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-2">Access Role</label>
              <select
                value={editRole}
                onChange={e => setEditRole(e.target.value as Role)}
                className="w-full px-4 py-3 bg-[#f8f6f3] border border-[#e5e1da] rounded-2xl outline-none focus:ring-2 focus:ring-[#5c869e] text-[#3c3c3b]"
              >
                <option value="staff">Staff (Daily Check In / Out)</option>
                <option value="admin">Administrator (Full Access & Settings)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-2">Phone Number</label>
              <div className="relative">
                <input
                  type="text"
                  value={editPhone}
                  onChange={e => setEditPhone(formatPhoneNumber(e.target.value))}
                  placeholder="(614) - 555- 0000"
                  className="w-full pl-10 pr-4 py-3 bg-[#f8f6f3] border border-[#e5e1da] rounded-2xl outline-none focus:ring-2 focus:ring-[#5c869e] text-[#3c3c3b]"
                />
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8c8a86]" />
              </div>
              <p className="text-[11px] text-[#8c8a86] mt-1">Dashes not needed — just type 10 digits</p>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-2">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={editEmail}
                  onChange={e => setEditEmail(e.target.value)}
                  placeholder="user@school.org"
                  className="w-full pl-10 pr-4 py-3 bg-[#f8f6f3] border border-[#e5e1da] rounded-2xl outline-none focus:ring-2 focus:ring-[#5c869e] text-[#3c3c3b]"
                />
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8c8a86]" />
              </div>
            </div>

            <div className="md:col-span-2 flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-[#5c869e] hover:opacity-90 text-white font-bold rounded-2xl transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-6 py-3 bg-[#f2efe9] hover:bg-[#edeae6] text-[#8c8a86] font-bold rounded-2xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* STAFF & ADMIN TABLE */}
      <div className="bg-white rounded-[32px] border border-[#e5e1da] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#fcfaf7] text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold border-b border-[#f2efe9]">
              <tr>
                <th className="px-8 py-5">Name &amp; Role</th>
                <th className="px-8 py-5">Username (Login ID)</th>
                <th className="px-8 py-5">Phone Number</th>
                <th className="px-8 py-5">Email</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f2efe9] text-sm">
              {staffList.filter(u => u.role !== 'student').map(s => (
                <tr key={s.id} className="hover:bg-[#e8f2f8]/50 transition-colors text-[#3c3c3b]">
                  <td className="px-8 py-4">
                    <div className="font-semibold text-[#3c3c3b] flex items-center gap-2">
                      <span>{s.name || s.fullName}</span>
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${s.role === 'admin' ? 'bg-[#5c869e]/15 text-[#4b6573] border border-[#5c869e]/30' : 'bg-[#f8f6f3] text-[#8c8a86] border border-[#edeae6]'}`}>
                        {s.role}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#5c869e]/10 text-[#4b6573] font-mono font-bold text-xs">
                      <UserIcon size={12} />
                      {s.username}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-xs text-[#6b6965]">
                    {s.phone ? (
                      <span className="flex items-center gap-1.5 font-medium text-[#4a4a48]">
                        <Phone size={13} className="text-[#8c8a86]" /> {s.phone}
                      </span>
                    ) : (
                      <span className="text-[#b5b3af]">-</span>
                    )}
                  </td>
                  <td className="px-8 py-4 text-xs text-[#6b6965]">
                    {s.email ? (
                      <span className="flex items-center gap-1.5 text-[#6b6965]">
                        <Mail size={13} className="text-[#8c8a86]" /> {s.email}
                      </span>
                    ) : (
                      <span className="text-[#b5b3af]">-</span>
                    )}
                  </td>
                  <td className="px-8 py-4 text-right">
                    <div className="flex items-center justify-end gap-2.5">
                      <button 
                        onClick={() => handleStartEdit(s)}
                        title="Edit Username, Password, and Info"
                        className="px-3 py-1.5 bg-[#f0f6fa] hover:bg-[#5c869e] text-[#5c869e] hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Edit3 size={13} />
                        Edit Account
                      </button>
                      {s.id !== 'admin_keshav' && s.id !== 'admin_smith' && (
                        <button 
                          onClick={() => deleteStaff(s.id, s.name)} 
                          title="Remove Account"
                          className="p-1.5 text-[#d98466] hover:bg-[#d98466]/10 rounded-xl font-bold transition-all cursor-pointer"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
