import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { Shield, LogOut } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const handleLogout = async () => {
    await signOut(auth);
    window.location.replace('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex flex-col items-center justify-center gap-6 px-4">
      <div className="flex items-center gap-3">
        <Shield className="w-8 h-8 text-amber-500" />
        <h1 className="text-4xl font-black italic uppercase tracking-tight text-white">Admin Dashboard</h1>
      </div>
      <p className="text-[#8892a4] text-xs font-bold uppercase tracking-widest">Guard confirmed. Build from here.</p>
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 px-6 py-3 bg-[#131b2e] border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest text-[#8892a4] hover:text-white hover:border-white/20 transition-all"
      >
        <LogOut className="w-4 h-4" /> Sign Out
      </button>
    </div>
  );
};
