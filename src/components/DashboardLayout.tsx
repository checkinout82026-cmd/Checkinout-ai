import React from 'react';
import { User } from '../types';
import { KumonLogo } from './KumonLogo';
import { LogOut, LayoutDashboard, Users, Clock, ShieldCheck, ArrowUpRight } from 'lucide-react';

interface LayoutProps {
  user: User;
  onLogout: () => void;
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLaunchKiosk?: () => void;
}

export function DashboardLayout({ user, onLogout, children, activeTab, setActiveTab, onLaunchKiosk }: LayoutProps) {
  const isStaff = user.role === 'staff';
  const isAdmin = user.role === 'admin';

  return (
    <div className="min-h-screen bg-[#2edaff] flex flex-col md:flex-row text-[#3c3c3b] font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-[#e5e1da] text-[#8c8a86] flex flex-col shrink-0">
        <div className="p-5 border-b border-[#e5e1da]">
          <KumonLogo variant="horizontal" size="sm" subtitle="Dublin - East" />

          {/* User Profile + Top Sign Out Action */}
          <div className="mt-3.5 flex items-center justify-between gap-2 p-2 bg-[#f8f6f3] border border-[#edeae6] rounded-xl">
            <div className="flex flex-col min-w-0 pr-1">
              <span className="text-xs font-bold text-[#1e293b] truncate leading-tight">{user.name}</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0099DD]"></span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#5c869e]">{user.role}</span>
              </div>
            </div>
            
            <button
              onClick={onLogout}
              title="Sign Out of Portal"
              className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
            >
              <LogOut size={13} />
              <span>Sign Out</span>
            </button>
          </div>

          {/* Quick Launch Student Kiosk Button */}
          {onLaunchKiosk && (
            <button
              onClick={onLaunchKiosk}
              className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#5c869e] hover:opacity-90 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Clock size={14} />
              Open Student Kiosk
              <ArrowUpRight size={13} className="opacity-75" />
            </button>
          )}
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {isStaff && (
            <NavItem 
              icon={<Users size={18} />} 
              label="Checked-In List" 
              active={activeTab === 'checkedin'} 
              onClick={() => setActiveTab('checkedin')} 
            />
          )}
          {isAdmin && (
            <>
              <NavItem 
                icon={<LayoutDashboard size={18} />} 
                label="Attendance Records" 
                active={activeTab === 'attendance'} 
                onClick={() => setActiveTab('attendance')} 
              />
              <NavItem 
                icon={<Users size={18} />} 
                label="Checked-In Live Roster" 
                active={activeTab === 'checkedin'} 
                onClick={() => setActiveTab('checkedin')} 
              />
              <NavItem 
                icon={<Users size={18} />} 
                label="Manage Students" 
                active={activeTab === 'students'} 
                onClick={() => setActiveTab('students')} 
              />
              <NavItem 
                icon={<ShieldCheck size={18} />} 
                label="Manage Staff" 
                active={activeTab === 'staff'} 
                onClick={() => setActiveTab('staff')} 
              />
            </>
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
        active 
          ? 'bg-[#5c869e] text-white' 
          : 'text-[#8c8a86] hover:bg-[#f8f6f3] hover:text-[#3c3c3b]'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
