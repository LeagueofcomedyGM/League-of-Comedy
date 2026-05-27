import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { adminNavigate } from './adminNavigate';
import { LayoutDashboard, Mic2, Calendar, Building2, Trophy, LogOut, Shield } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Overview',   path: '/admin',            icon: LayoutDashboard },
  { label: 'Comedians',  path: '/admin/comedians',  icon: Mic2            },
  { label: 'Shows',      path: '/admin/shows',      icon: Calendar        },
  { label: 'Venues',     path: '/admin/venues',     icon: Building2       },
  { label: 'Festivals',  path: '/admin/festivals',  icon: Trophy          },
];

interface Props {
  children: React.ReactNode;
  currentPath: string;
}

export const AdminLayout: React.FC<Props> = ({ children, currentPath }) => {
  const handleLogout = async () => {
    await signOut(auth);
    window.location.replace('/admin/login');
  };

  const activePath = currentPath === '/admin/' ? '/admin' : currentPath;

  return (
    <div className="min-h-screen bg-[#070b14] flex">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-[#0a0e1a] border-r border-white/5 flex flex-col">
        {/* Logo */}
        <div className="px-5 py-6 border-b border-white/5 flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center">
            <Shield className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-white leading-none">League</p>
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#8892a4] leading-none mt-0.5">Admin</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map(item => {
            const isActive = item.path === '/admin'
              ? activePath === '/admin'
              : activePath.startsWith(item.path);
            return (
              <button
                key={item.path}
                onClick={() => adminNavigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                  isActive
                    ? 'bg-amber-500/10 text-amber-400'
                    : 'text-[#8892a4] hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span className="text-xs font-bold">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sign out */}
        <div className="px-3 py-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#8892a4] hover:text-red-400 hover:bg-red-500/5 transition-all"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span className="text-xs font-bold">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  );
};
