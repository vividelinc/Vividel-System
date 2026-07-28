import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  Users,
  Camera,
  CalendarCheck,
  Briefcase,
  Settings,
  LogOut,
  ExternalLink,
  Layers
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { logoutUser, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  const navItems = [
    { label: 'Overview', path: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Leads & Calls', path: '/dashboard/leads', icon: <Users className="w-4 h-4" /> },
    { label: 'Bookings Pipeline', path: '/dashboard/bookings', icon: <CalendarCheck className="w-4 h-4" /> },
    { label: 'Client Records', path: '/dashboard/clients', icon: <Briefcase className="w-4 h-4" /> },
    { label: 'Services', path: '/dashboard/services', icon: <Camera className="w-4 h-4" /> },
    { label: 'Settings', path: '/dashboard/settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 bg-[#241E10] border-r border-[#554A32] flex flex-col justify-between shrink-0 h-screen sticky top-0">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-[#554A32] flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#40E0D0] to-[#585D27] flex items-center justify-center font-bold text-[#2B2414] text-xl shadow-lg shadow-[#40E0D0]/20">
            V
          </div>
          <div>
            <h1 className="font-bold tracking-wider text-[#E9E4DC] text-base font-serif">
              VIVIDEL INC.
            </h1>
            <p className="text-[10px] text-[#40E0D0] uppercase tracking-widest font-semibold">
              Studio OS
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#40E0D0] text-[#2B2414] font-bold shadow-md shadow-[#40E0D0]/20'
                    : 'text-[#BCA890] hover:text-[#E9E4DC] hover:bg-[#38301C]'
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Quick Links */}
        <div className="px-4 py-2">
          <a
            href="/book"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-[#40E0D0] bg-[#40E0D0]/10 border border-[#40E0D0]/30 hover:bg-[#40E0D0]/20 transition-all"
          >
            <span className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5" /> Client Booking Form
            </span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-[#554A32] bg-[#352D1A]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#3E3521] border border-[#40E0D0]/50 flex items-center justify-center text-xs font-bold text-[#40E0D0] shrink-0">
              JA
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#E9E4DC] truncate">James Akabo Jnr</p>
              <p className="text-[10px] text-[#BCA890] truncate">{user?.email || 'vividelinc@gmail.com'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="text-[#BCA890] hover:text-rose-400 p-1.5 rounded-lg hover:bg-[#3E3521] transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
