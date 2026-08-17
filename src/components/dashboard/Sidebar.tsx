import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import vividelLogo from '../../assets/vividel-logo.png';
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
    <aside className="w-64 bg-[#10151A] border-r border-[#262D34] flex flex-col justify-between shrink-0 h-screen sticky top-0">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-[#262D34]">
          <img src={vividelLogo} alt="Vividel Inc." className="h-8 w-auto" />
          <p className="mt-2 text-[10px] text-[#2DD4BF] uppercase tracking-widest font-semibold">
            Studio OS
          </p>
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
                    ? 'bg-[#2DD4BF] text-[#0A0D10] font-bold shadow-md shadow-[#2DD4BF]/20'
                    : 'text-[#8B96A0] hover:text-[#F2F4F5] hover:bg-[#1D242B]'
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
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-[#2DD4BF] bg-[#2DD4BF]/10 border border-[#2DD4BF]/30 hover:bg-[#2DD4BF]/20 transition-all"
          >
            <span className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5" /> Client Booking Form
            </span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-[#262D34] bg-[#10151A]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#171D23] border border-[#2DD4BF]/50 flex items-center justify-center text-xs font-bold text-[#2DD4BF] shrink-0">
              JA
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#F2F4F5] truncate">James Akabo Jnr</p>
              <p className="text-[10px] text-[#8B96A0] truncate">{user?.email || 'vividelinc@gmail.com'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="text-[#8B96A0] hover:text-rose-400 p-1.5 rounded-lg hover:bg-[#171D23] transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
