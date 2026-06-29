import { useState } from 'react';
import {
  FileText, ChevronLeft, ChevronRight, X, GraduationCap
} from 'lucide-react';
import { NAV_ITEMS } from '../../config/nav';
import { useNavigate, useLocation } from 'react-router';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  mobileSidebarOpen?: boolean;
  onMobileSidebarClose?: () => void;
}

export default function Sidebar({ mobileSidebarOpen, onMobileSidebarClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = NAV_ITEMS;

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  const handleNavClick = (path: string) => {
    navigate(path);
    onMobileSidebarClose?.();
  };

  const SidebarContent = ({ forMobile = false }: { forMobile?: boolean }) => (
    <div
      className={`h-full bg-slate-900 flex flex-col transition-all duration-300 ease-in-out ${
        !forMobile && collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-slate-700/60 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-900/40">
            <FileText className="w-5 h-5 text-white" />
          </div>
          {(forMobile || !collapsed) && (
            <div className="min-w-0">
              <div className="font-bold text-white text-sm leading-tight">ResearchAI</div>
              <div className="text-[11px] text-slate-400">Academic Assistant</div>
            </div>
          )}
        </div>
        {forMobile && onMobileSidebarClose && (
          <button onClick={onMobileSidebarClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto bg-gradient-to-b from-red-900/20 via-slate-900 to-slate-900 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.label}
              onClick={() => handleNavClick(item.path)}
              title={(!forMobile && collapsed) ? item.label : undefined}
              className={`flex items-center transition-all ${
   collapsed 
    ? 'w-11 h-11 justify-center rounded-xl' 
    : 'w-full px-3 py-2.5 rounded-xl text-left' 
} ${
  active
    ? 'bg-red-600 text-white shadow-md shadow-red-900/20'
    : 'text-slate-300 hover:bg-slate-800 transition-all'
}`}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-white' : 'text-red-600'}`} />
              {(forMobile || !collapsed) && (
                <span className="text-sm font-medium truncate">{item.label}</span>
              )}
              {(forMobile || !collapsed) && active && (
                <div className="ml-auto w-1.5 h-1.5 bg-card rounded-full flex-shrink-0" />
              )}
            </button>
          );
        })}
      </nav>

      {/* User & Collapse */}
      <div className="p-3 border-t border-slate-700/60 flex-shrink-0 space-y-1 bg-slate-900 border-slate-700/60 h-26.5 flex flex-col justify-center">
        {(forMobile || !collapsed) ? (
          <div className="flex items-center gap-2 px-2 py-2 rounded-xl hover:bg-slate-800 transition-colors">
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user?.name?.substring(0, 2).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">{user?.name}</div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                {user?.role === 'lecturer' ? (
                  <><GraduationCap className="w-3 h-3" /> Lecturer</>
                ) : 'Student'}
              </div>
            </div>
            <button
              onClick={handleSignOut}
              title="Sign Out"
              className="text-slate-500 hover:text-red-400 transition-colors p-1"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-1">
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.substring(0, 2).toUpperCase() || 'U'}
            </div>
            <button
              onClick={handleSignOut}
              title="Sign Out"
              className="text-slate-500 hover:text-red-400 transition-colors"
            >
              Sign Out
            </button>
          </div>
        )}

        {/* Collapse toggle — desktop only */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex items-center justify-center p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors rounded-lg border border-transparent hover:border-slate-700"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:block h-full flex-shrink-0">
        <SidebarContent />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onMobileSidebarClose}
          />
          <div className="relative h-full w-60 shadow-2xl">
            <SidebarContent forMobile />
          </div>
        </div>
      )}
    </>
  );
}
