import React from 'react';
import { User } from '../types';
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
        <div className="p-6 border-b border-[#e5e1da]">
          <img
            src="/kumon_logo.webp"
            alt="Kumon"
            className="h-10 w-auto object-contain"
          />

          <h2 className="mt-2 text-2xl font-bold text-black">
            Dublin - East
          </h2>

          <div className="mt-3 inline-flex items-center gap-2 px-3 py-2 bg-[#f8f6f3] border border-[#edeae6] rounded-md text-[10px] uppercase font-bold tracking-widest text-[#8c8a86]">
            <span className="w-2 h-2 rounded-full bg-[#005BAC]"></span>
            {user.name} ({user.role})
          </div>

          {/* Quick Launch Student Kiosk Button */}
          {onLaunchKiosk && (
            <button
              onClick={onLaunchKiosk}
              className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#5c869e] hover:opacity-90 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Clock size={15} />
              Open Student Kiosk
              <ArrowUpRight size={14} className="opacity-75" />
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

        <div className="p-4 border-t border-[#e5e1da] space-y-3">
          <button 
            onClick={onLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium rounded-lg text-[#d98466] hover:bg-[#f2efe9] transition-colors cursor-pointer"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
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
