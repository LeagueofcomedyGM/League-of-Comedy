import React from 'react';
import { AdminLayout } from '../AdminLayout';
import { Mic2 } from 'lucide-react';

interface Props { currentPath: string; }

export const ComeidiansPage: React.FC<Props> = ({ currentPath }) => (
  <AdminLayout currentPath={currentPath}>
    <div className="p-8">
      <div className="flex items-center gap-3 mb-8">
        <Mic2 className="w-5 h-5 text-amber-400" />
        <h1 className="text-2xl font-black uppercase tracking-tight text-white">Comedians</h1>
      </div>
      <div className="bg-[#0a0e1a] border border-white/5 rounded-2xl p-12 text-center">
        <p className="text-[#8892a4] text-sm font-bold uppercase tracking-widest">Coming soon</p>
      </div>
    </div>
  </AdminLayout>
);
