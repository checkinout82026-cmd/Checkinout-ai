import React, { useState, useEffect } from 'react';
import { db, deduplicateUsers } from '../lib/db';
import { registerStaffOrAdmin, CONFIGURED_ACCOUNTS } from '../lib/auth';
import { User, Role } from '../types';
import toast from 'react-hot-toast';
import { 
  UserPlus, 
  Shield, 
  Trash2, 
  Loader2, 
  CheckCircle2, 
  Edit3, 
  User as UserIcon, 
  Lock, 
  Info, 
  X, 
  Eye, 
  EyeOff
} from 'lucide-react';

interface AdminStaffProps {
  currentUser?: User | null;
}

export function AdminStaff({ currentUser }: AdminStaffProps) {
  const [staffList, setStaffList] = useState<User[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // Deletion Confirmation Modal State
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  // Determine current active user (from props or cached session)
  const effectiveUser = currentUser || (() => {
    try {
      const stored = localStorage.getItem('activeUser');
      return stored ? JSON.parse(stored) as User : null;
    } catch {
      return null;
    }
  })();

  const isUserSelf = (target: User) => {
    if (!effectiveUser) return false;
    return (
      target.id === effectiveUser.id ||
      (!!effectiveUser.username && target.username?.toLowerCase() === effectiveUser.username.toLowerCase()) ||
      (!!effectiveUser.email && target.email?.toLowerCase() === effectiveUser.email.toLowerCase())
    );
  };

  const displayedStaff = deduplicateUsers(staffList).filter(u => u.role !== 'student');
  const activeAdminCount = displayedStaff.filter(u => u.role === 'admin' && u.isActive !== false).length;

  // Form state for creating user (no phone, no email)
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<Role>('staff');

  // Form state for editing user (no phone, no email)
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
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
    const cleanUsername = username.trim();
    if (!cleanUsername) {
      toast.error('Please specify a username');
      return;
    }

    if (staffList.find(u => u.username.toLowerCase() === cleanUsername.toLowerCase())) {
      toast.error('Username already taken. Please choose another username.');
      return;
    }

    const cleanPassword = password.trim();
    if (!cleanPassword || cleanPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    const generatedEmail = `${cleanUsername.toLowerCase()}@school.org`;

    setLoading(true);
    try {
      // Create user in Firebase Auth & Firestore
      await registerStaffOrAdmin(
        generatedEmail,
        cleanPassword,
        name.trim() || cleanUsername,
        role,
        '', // No phone
        cleanUsername
      );
      toast.success(`${role === 'admin' ? 'Administrator' : 'Staff member'} created with username "${cleanUsername}"!`);
      
      // Reset form
      setName('');
      setUsername('');
      setPassword('');
      setRole('staff');
      setShowAddForm(false);
    } catch (err: any) {
      console.warn('Firebase Auth user creation notice:', err);
      const newUser: User = {
        id: 'u_' + crypto.randomUUID().slice(0, 8),
        username: cleanUsername,
        name: name.trim() || cleanUsername,
        fullName: name.trim() || cleanUsername,
        role,
        email: generatedEmail,
        phone: '',
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
    setEditRole(user.role || 'staff');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const cleanUsername = editUsername.trim();
    if (!cleanUsername) {
      toast.error('Username cannot be empty');
      return;
    }

    // Check if username is taken by another user
    const existing = staffList.find(
      u => u.id !== editingUser.id && u.username.toLowerCase() === cleanUsername.toLowerCase()
    );
    if (existing) {
      toast.error(`Username "${cleanUsername}" is already taken by another account`);
      return;
    }

    if (isUserSelf(editingUser) && editRole !== 'admin' && activeAdminCount <= 1) {
      toast.error('You cannot demote yourself. The system must have at least one active administrator.');
      return;
    }

    setLoading(true);
    try {
      const updatedUser: User = {
        ...editingUser,
        username: cleanUsername,
        name: editName.trim() || cleanUsername,
        fullName: editName.trim() || cleanUsername,
        email: editingUser.email || `${cleanUsername.toLowerCase()}@school.org`,
        phone: '',
        role: editRole,
        updatedAt: new Date().toISOString()
      };

      await db.saveUser(updatedUser);
      toast.success(`Account updated! Username is "${cleanUsername}"`);
      setEditingUser(null);
    } catch (err) {
      console.error('Error saving user update:', err);
      toast.error('Failed to update account');
    } finally {
      setLoading(false);
    }
  };

  const initiateDeleteStaff = (target: User) => {
    if (isUserSelf(target)) {
      toast.error('Security alert: You cannot delete your own active administrator account.');
      return;
    }

    if (target?.role === 'admin' && activeAdminCount <= 1) {
      toast.error('Action blocked: Cannot delete the last remaining administrator. The system must have at least one active administrator.');
      return;
    }

    setUserToDelete(target);
  };

  const executeDeleteStaff = async () => {
    if (!userToDelete) return;
    setIsDeletingUser(true);
    try {
      await db.deleteUser(userToDelete.id);
      toast.success(`Account for ${userToDelete.name || userToDelete.username} removed from database`);
      setUserToDelete(null);
    } catch (err: any) {
      console.error('Delete staff error:', err);
      toast.error(err?.message || 'Failed to remove account');
    } finally {
      setIsDeletingUser(false);
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
              {displayedStaff.length} Accounts
            </span>
          </div>
          <p className="text-[#8c8a86] mt-1 text-sm">
            Manage username credentials and access permissions for staff and administrator accounts.
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

      {/* Instructions Banner */}
      <div className="bg-[#f0f6fa] border border-[#d2e4ef] p-4 rounded-2xl flex items-start gap-3.5">
        <div className="p-2 bg-[#5c869e]/15 text-[#5c869e] rounded-xl shrink-0 mt-0.5">
          <Info size={18} />
        </div>
        <div className="text-xs text-[#3c3c3b] space-y-1">
          <p className="font-semibold text-sm text-[#2d4b5a]">How to Sign In &amp; Authorize Releases</p>
          <p className="text-[#4b6573] leading-relaxed">
            Staff and Administrators sign in simply using their <strong>Username</strong> and <strong>Password</strong>.
            You can also use these same credentials when student pickup requires staff verification.
          </p>
        </div>
      </div>

      {/* CREATE NEW USER FORM (No phone or email) */}
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
              className="text-[#8c8a86] hover:text-[#4a4a48] p-1 cursor-pointer"
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
                  placeholder="e.g. Instructor1 or FrontDesk"
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
                placeholder="e.g. Staff Name"
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

      {/* EDIT EXISTING USER MODAL / FORM (No phone or email) */}
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
                  placeholder="e.g. Ajita or Sanjay"
                />
                <UserIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5c869e]" />
              </div>
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

            <div className="md:col-span-2">
              <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-2">Full Name</label>
              <input
                type="text"
                required
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="w-full px-4 py-3 bg-[#f8f6f3] border border-[#e5e1da] rounded-2xl outline-none focus:ring-2 focus:ring-[#5c869e] text-[#3c3c3b]"
              />
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

      {/* STAFF & ADMIN TABLE (No phone or email columns) */}
      <div className="bg-white rounded-[32px] border border-[#e5e1da] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#fcfaf7] text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold border-b border-[#f2efe9]">
              <tr>
                <th className="px-8 py-5">Name &amp; Role</th>
                <th className="px-8 py-5">Username (Login ID)</th>
                <th className="px-8 py-5">Access Permissions</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f2efe9] text-sm">
              {displayedStaff.map(s => (
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
                    {s.role === 'admin' ? (
                      <span className="font-medium text-[#4b6573]">Full Administrator (All Controls)</span>
                    ) : (
                      <span className="text-[#8c8a86]">Staff Member (Check-In / Out)</span>
                    )}
                  </td>
                  <td className="px-8 py-4">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Active
                    </span>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <div className="flex items-center justify-end gap-2.5">
                      <button 
                        onClick={() => handleStartEdit(s)}
                        title="Edit Username and Role"
                        className="px-3 py-1.5 bg-[#f0f6fa] hover:bg-[#5c869e] text-[#5c869e] hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Edit3 size={13} />
                        Edit Account
                      </button>
                      {isUserSelf(s) ? (
                        <span 
                          title="You cannot delete your own active administrator account"
                          className="px-2.5 py-1 text-[11px] font-bold bg-[#edeae6] text-[#8c8a86] rounded-xl select-none"
                        >
                          You
                        </span>
                      ) : s.role === 'admin' && activeAdminCount <= 1 ? (
                        <span 
                          title="Cannot delete the sole remaining administrator"
                          className="px-2.5 py-1 text-[11px] font-bold bg-[#edeae6] text-[#8c8a86] rounded-xl select-none"
                        >
                          Sole Admin
                        </span>
                      ) : (
                        <button 
                          onClick={() => initiateDeleteStaff(s)} 
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

      {/* Remove Account Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-[32px] p-6 sm:p-7 border border-[#e5e1da] shadow-2xl animate-in zoom-in-95 space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#fff1ed] flex-shrink-0 flex items-center justify-center text-[#c95d3b]">
                <Trash2 size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-serif font-bold text-[#4a4a48]">Remove Account?</h3>
                <p className="text-xs text-[#8c8a86] leading-relaxed">
                  Are you sure you want to remove <strong className="text-[#3c3c3b]">{userToDelete.name || userToDelete.username}</strong> (Username: <span className="font-mono text-[#5c869e] font-semibold">{userToDelete.username}</span>)? This user will no longer be able to sign in or perform actions in the system.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-[#fcfbf9] rounded-2xl border border-[#e5e1da] text-xs space-y-1 text-[#4a4a48]">
              <div className="flex justify-between">
                <span className="text-[#8c8a86]">Role:</span>
                <span className="font-semibold capitalize">{userToDelete.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8c8a86]">Account ID:</span>
                <span className="font-mono text-[11px] text-[#8c8a86]">{userToDelete.id}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={executeDeleteStaff}
                disabled={isDeletingUser}
                className="flex-1 py-3 bg-[#d98466] hover:bg-[#c95d3b] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
              >
                {isDeletingUser ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Removing...
                  </>
                ) : (
                  'Remove Account'
                )}
              </button>
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                disabled={isDeletingUser}
                className="px-5 py-3 bg-[#f2efe9] text-[#8c8a86] hover:text-[#4a4a48] font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
