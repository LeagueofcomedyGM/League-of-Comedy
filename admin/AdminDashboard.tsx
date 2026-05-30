import React, { useState, useEffect } from 'react';
import { collection, getCountFromServer } from 'firebase/firestore';
import { db } from '../firebase';
import { AdminLayout } from './AdminLayout';
import { adminNavigate } from './adminNavigate';
import { Theater, Calendar, Building2, Trophy, Users, Mic2, UserCheck, Loader2, ArrowRight } from 'lucide-react';

interface Counts {
  scenes:     number;
  shows:      number;
  venues:     number;
  festivals:  number;
  fans:       number;
  comedians:  number;
  organizers: number;
}

const CONTENT_CARDS = [
  { key: 'scenes'    as const, label: 'Scenes',    icon: Theater,   color: 'text-orange-400',  path: undefined             },
  { key: 'shows'     as const, label: 'Shows',     icon: Calendar,  color: 'text-blue-400',    path: '/admin/shows'        },
  { key: 'venues'    as const, label: 'Venues',    icon: Building2, color: 'text-emerald-400', path: '/admin/venues'       },
  { key: 'festivals' as const, label: 'Festivals', icon: Trophy,    color: 'text-purple-400',  path: '/admin/festivals'    },
];

const USER_CARDS = [
  { key: 'fans'       as const, label: 'Fans',       icon: Users,     color: 'text-pink-400',  path: undefined              },
  { key: 'comedians'  as const, label: 'Comedians',  icon: Mic2,      color: 'text-amber-400', path: '/admin/comedians'     },
  { key: 'organizers' as const, label: 'Organizers', icon: UserCheck, color: 'text-cyan-400',  path: undefined              },
];

const cardBase = "bg-[#0a0e1a] border border-white/5 rounded-2xl p-6 text-left transition-all group";

interface Props { currentPath: string; }

export const AdminDashboard: React.FC<Props> = ({ currentPath }) => {
  const [counts,  setCounts]  = useState<Counts>({ scenes: 0, shows: 0, venues: 0, festivals: 0, fans: 0, comedians: 0, organizers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCounts() {
      const entries: Array<[keyof Counts, string]> = [
        ['scenes',     'scenes'],
        ['shows',      'shows'],
        ['venues',     'venues'],
        ['festivals',  'festivals'],
        ['fans',       'users'],
        ['comedians',  'comedians'],
        ['organizers', 'organizers'],
      ];
      const results = await Promise.allSettled(
        entries.map(([, col]) => getCountFromServer(collection(db, col)))
      );
      setCounts(prev => {
        const next = { ...prev };
        results.forEach((r, i) => {
          if (r.status === 'fulfilled') next[entries[i][0]] = r.value.data().count;
          else console.error(`Count failed for ${entries[i][1]}:`, r.reason);
        });
        return next;
      });
      setLoading(false);
    }
    loadCounts();
  }, []);

  const renderCard = (card: typeof CONTENT_CARDS[number] | typeof USER_CARDS[number]) => {
    const Icon = card.icon;
    const body = (
      <>
        <div className="flex items-start justify-between mb-4">
          <Icon className={`w-5 h-5 ${card.color}`} />
          {card.path && <ArrowRight className="w-4 h-4 text-[#8892a4] group-hover:text-white transition-colors" />}
        </div>
        {loading
          ? <Loader2 className="w-5 h-5 animate-spin text-[#8892a4] mb-1" />
          : <p className="text-3xl font-black text-white mb-1">{counts[card.key].toLocaleString()}</p>
        }
        <p className="text-[11px] font-black uppercase tracking-widest text-[#8892a4]">{card.label}</p>
      </>
    );

    return card.path
      ? <button key={card.label} onClick={() => adminNavigate(card.path!)} className={`${cardBase} hover:border-white/15`}>{body}</button>
      : <div key={card.label} className={cardBase}>{body}</div>;
  };

  return (
    <AdminLayout currentPath={currentPath}>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-black uppercase tracking-tight text-white">Overview</h1>
          <p className="text-xs text-[#8892a4] font-medium mt-1">Live document counts across all collections.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {CONTENT_CARDS.map(renderCard)}
        </div>

        <div className="mt-8">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#8892a4] mb-4">Users</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
            {USER_CARDS.map(renderCard)}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
