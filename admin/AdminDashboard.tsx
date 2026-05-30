import React, { useState, useEffect } from 'react';
import { collection, getCountFromServer } from 'firebase/firestore';
import { db } from '../firebase';
import { AdminLayout } from './AdminLayout';
import { adminNavigate } from './adminNavigate';
import { Mic2, Calendar, Building2, Trophy, Users, UserCheck, Loader2, ArrowRight } from 'lucide-react';

interface Counts {
  comedians:  number;
  shows:      number;
  venues:     number;
  festivals:  number;
  fans:       number;
  organizers: number;
}

const CONTENT_CARDS = [
  { key: 'comedians',  label: 'Comedians',  icon: Mic2,      path: '/admin/comedians', color: 'text-amber-400'   },
  { key: 'shows',      label: 'Shows',      icon: Calendar,  path: '/admin/shows',     color: 'text-blue-400'    },
  { key: 'venues',     label: 'Venues',     icon: Building2, path: '/admin/venues',    color: 'text-emerald-400' },
  { key: 'festivals',  label: 'Festivals',  icon: Trophy,    path: '/admin/festivals', color: 'text-purple-400'  },
] as const;

const USER_CARDS = [
  { key: 'fans',       label: 'Fans',       icon: Users,     color: 'text-pink-400'   },
  { key: 'organizers', label: 'Organizers', icon: UserCheck, color: 'text-cyan-400'   },
] as const;

interface Props { currentPath: string; }

export const AdminDashboard: React.FC<Props> = ({ currentPath }) => {
  const [counts,  setCounts]  = useState<Counts>({ comedians: 0, shows: 0, venues: 0, festivals: 0, fans: 0, organizers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCounts() {
      const keys = ['comedians', 'shows', 'venues', 'festivals', 'users', 'organizers'] as const;
      const results = await Promise.allSettled(
        keys.map(k => getCountFromServer(collection(db, k)))
      );
      const resolved = results.map((r, i) => {
        if (r.status === 'rejected') console.error(`Count failed for ${keys[i]}:`, r.reason);
        return r.status === 'fulfilled' ? r.value.data().count : 0;
      });
      setCounts({
        comedians:  resolved[0],
        shows:      resolved[1],
        venues:     resolved[2],
        festivals:  resolved[3],
        fans:       resolved[4],
        organizers: resolved[5],
      });
      setLoading(false);
    }
    loadCounts();
  }, []);

  return (
    <AdminLayout currentPath={currentPath}>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-black uppercase tracking-tight text-white">Overview</h1>
          <p className="text-xs text-[#8892a4] font-medium mt-1">Live document counts across all collections.</p>
        </div>

        {/* Content collections */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {CONTENT_CARDS.map(card => {
            const Icon = card.icon;
            return (
              <button
                key={card.key}
                onClick={() => adminNavigate(card.path)}
                className="bg-[#0a0e1a] border border-white/5 hover:border-white/15 rounded-2xl p-6 text-left transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <Icon className={`w-5 h-5 ${card.color}`} />
                  <ArrowRight className="w-4 h-4 text-[#8892a4] group-hover:text-white transition-colors" />
                </div>
                <div>
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-[#8892a4] mb-1" />
                  ) : (
                    <p className="text-3xl font-black text-white mb-1">{counts[card.key].toLocaleString()}</p>
                  )}
                  <p className="text-[11px] font-black uppercase tracking-widest text-[#8892a4]">{card.label}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Users */}
        <div className="mt-8">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#8892a4] mb-4">Users</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {USER_CARDS.map(card => {
              const Icon = card.icon;
              return (
                <div
                  key={card.key}
                  className="bg-[#0a0e1a] border border-white/5 rounded-2xl p-6"
                >
                  <div className="mb-4">
                    <Icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                  <div>
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-[#8892a4] mb-1" />
                    ) : (
                      <p className="text-3xl font-black text-white mb-1">{counts[card.key].toLocaleString()}</p>
                    )}
                    <p className="text-[11px] font-black uppercase tracking-widest text-[#8892a4]">{card.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};
