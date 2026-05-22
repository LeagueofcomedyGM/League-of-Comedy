
import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Trophy, Globe, MapPin, Star, Users, Loader2, Mic2 } from 'lucide-react';

interface LeaderboardEntry {
  uid:       string;
  name:      string;
  followers: number;
  location:  string;
  image:     string;
  avatar:    string;
}

const AvatarCircle: React.FC<{ entry: LeaderboardEntry; size?: 'sm' | 'lg'; border?: string }> = ({
  entry,
  size = 'sm',
  border,
}) => {
  const cls = size === 'lg'
    ? `w-28 h-28 text-4xl border-4 ${border ?? 'border-slate-700'}`
    : `w-20 h-20 text-2xl border-2 ${border ?? 'border-slate-700'}`;
  return entry.image ? (
    <img
      src={entry.image}
      alt={entry.name}
      className={`${cls} rounded-full object-cover mx-auto mb-4`}
    />
  ) : (
    <div className={`${cls} rounded-full mx-auto mb-4 flex items-center justify-center font-black bg-slate-800`}>
      {entry.avatar}
    </div>
  );
};

export const Leaderboards: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'comedians' | 'fans'>('comedians');
  const [scope,     setScope]     = useState<'global' | 'country' | 'city'>('global');
  const [comedians, setComedians] = useState<LeaderboardEntry[]>([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    async function loadComedians() {
      setLoading(true);
      try {
        const snap = await getDocs(
          query(collection(db, 'comedians'), where('claimed', '==', true))
        );
        const data: LeaderboardEntry[] = snap.docs
          .map(d => {
            const dd = d.data();
            const name: string = dd.comedian_name ?? '';
            const initials = name
              .split(' ')
              .map((w: string) => w[0])
              .filter(Boolean)
              .join('')
              .slice(0, 2)
              .toUpperCase();
            return {
              uid:       d.id,
              name,
              followers: (dd.followers ?? []).length,
              location:  dd.location ?? '',
              image:     dd.comedian_image ?? '',
              avatar:    initials || '?',
            };
          })
          .filter(c => c.name.trim() !== '')
          .sort((a, b) => b.followers - a.followers);
        setComedians(data);
      } catch { /* ignore */ }
      setLoading(false);
    }
    loadComedians();
  }, []);

  const top3 = comedians.slice(0, 3);
  const rest = comedians.slice(3);

  return (
    <div className="min-h-screen pt-12 pb-24 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl lg:text-7xl font-black italic uppercase tracking-tighter mb-4">
            The <span className="text-amber-500">Hall of Fame</span>
          </h1>
          <p className="text-slate-400 text-lg">Recognizing the legends and the fans who make the league possible.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8 glass-card p-4 rounded-2xl border-slate-800">
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 w-full md:w-fit">
            <button
              onClick={() => setActiveTab('comedians')}
              className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-xs font-black uppercase italic transition-all ${activeTab === 'comedians' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Comedians
            </button>
            <button
              onClick={() => setActiveTab('fans')}
              className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-xs font-black uppercase italic transition-all ${activeTab === 'fans' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Fans
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-fit py-2">
            {([
              { id: 'global',  label: 'Global',  icon: <Globe  className="w-3 h-3" /> },
              { id: 'country', label: 'Country', icon: <Globe  className="w-3 h-3" /> },
              { id: 'city',    label: 'City',    icon: <MapPin className="w-3 h-3" /> },
            ] as const).map((s) => (
              <button
                key={s.id}
                onClick={() => setScope(s.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${
                  scope === s.id
                    ? 'border-amber-500 bg-amber-500/10 text-amber-500'
                    : 'border-slate-800 text-slate-500 hover:border-slate-600'
                }`}
              >
                {s.icon} {s.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'comedians' && (
          loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500 opacity-60" />
            </div>
          ) : comedians.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-500 gap-3">
              <Mic2 className="w-12 h-12 opacity-20" />
              <p className="text-sm font-bold uppercase tracking-widest">No comedians on the leaderboard yet</p>
              <p className="text-xs opacity-60">Follow comedians in the Scenes roster to get them ranked.</p>
            </div>
          ) : (
            <>
              {/* Podium for Top 3 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 items-end">
                {/* Rank 2 */}
                {top3[1] && (
                  <div className="order-2 md:order-1 glass-card p-6 rounded-3xl text-center border-slate-800 relative group hover:-translate-y-2 transition-transform h-fit">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-700 text-white px-3 py-1 rounded-full text-xs font-black italic">#2</div>
                    <AvatarCircle entry={top3[1]} />
                    <h3 className="text-xl font-bold uppercase italic">{top3[1].name}</h3>
                    <p className="text-slate-500 text-xs mb-4 uppercase tracking-widest">{top3[1].location}</p>
                    <div className="flex items-center justify-center gap-2 text-2xl font-black text-white">
                      <Users className="w-5 h-5 text-amber-500" />
                      {top3[1].followers.toLocaleString()}
                    </div>
                  </div>
                )}

                {/* Rank 1 */}
                {top3[0] && (
                  <div className={`${top3[1] ? 'order-1 md:order-2' : ''} glass-card p-8 rounded-[2.5rem] text-center border-amber-500/30 relative group hover:-translate-y-4 transition-transform shadow-2xl shadow-amber-500/10`}>
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 px-4 py-2 rounded-full text-sm font-black italic flex items-center gap-2">
                      <Trophy className="w-4 h-4" /> CHAMPION
                    </div>
                    <AvatarCircle entry={top3[0]} size="lg" border="border-amber-500" />
                    <h3 className="text-2xl font-bold uppercase italic">{top3[0].name}</h3>
                    <p className="text-amber-500/80 text-xs mb-6 uppercase tracking-widest font-bold">{top3[0].location}</p>
                    <div className="flex items-center justify-center gap-2 text-4xl font-black gradient-text">
                      <Users className="w-7 h-7 text-amber-500" />
                      {top3[0].followers.toLocaleString()}
                    </div>
                    <div className="mt-4 flex justify-center gap-1">
                      {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />)}
                    </div>
                  </div>
                )}

                {/* Rank 3 */}
                {top3[2] && (
                  <div className="order-3 glass-card p-6 rounded-3xl text-center border-slate-800 relative group hover:-translate-y-2 transition-transform h-fit">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-900/40 text-amber-500 px-3 py-1 rounded-full text-xs font-black italic border border-amber-500/20">#3</div>
                    <AvatarCircle entry={top3[2]} />
                    <h3 className="text-xl font-bold uppercase italic">{top3[2].name}</h3>
                    <p className="text-slate-500 text-xs mb-4 uppercase tracking-widest">{top3[2].location}</p>
                    <div className="flex items-center justify-center gap-2 text-2xl font-black text-white">
                      <Users className="w-5 h-5 text-amber-500" />
                      {top3[2].followers.toLocaleString()}
                    </div>
                  </div>
                )}
              </div>

              {/* List View (rank 4+) */}
              {rest.length > 0 && (
                <div className="space-y-4">
                  {rest.map((item, i) => (
                    <div key={item.uid} className="glass-card p-4 rounded-2xl flex items-center gap-6 border-slate-800/50 hover:bg-slate-900/50 transition-all cursor-pointer group">
                      <div className="text-2xl font-black italic text-slate-600 group-hover:text-red-600 transition-colors w-12 text-center">#{i + 4}</div>
                      <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-400 group-hover:border-red-500 transition-all border-2 border-transparent overflow-hidden shrink-0">
                        {item.image
                          ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          : item.avatar}
                      </div>
                      <div className="flex-grow min-w-0">
                        <h4 className="font-bold uppercase italic truncate">{item.name}</h4>
                        {item.location && (
                          <div className="flex items-center gap-1 text-[10px] text-slate-500 uppercase tracking-widest mt-1">
                            <MapPin className="w-3 h-3" /> {item.location}
                          </div>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <div className="flex items-center gap-1 text-xl font-black italic justify-end">
                          <Users className="w-4 h-4 text-amber-500" />
                          {item.followers.toLocaleString()}
                        </div>
                        <div className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Followers</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-12 text-center">
                <button className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] hover:text-amber-500 transition-colors">
                  View Full Global 1,000 →
                </button>
              </div>
            </>
          )
        )}

        {activeTab === 'fans' && (
          <div className="flex flex-col items-center justify-center py-24 text-slate-500 gap-3">
            <Trophy className="w-12 h-12 opacity-20" />
            <p className="text-sm font-bold uppercase tracking-widest">Fan Rankings Coming Soon</p>
            <p className="text-xs opacity-60">Fan rankings will track support, attendance, and engagement.</p>
          </div>
        )}
      </div>
    </div>
  );
};
