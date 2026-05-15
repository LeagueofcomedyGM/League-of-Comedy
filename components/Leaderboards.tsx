
import React, { useState } from 'react';
import { Trophy, Globe, MapPin, Search, ChevronUp, Star, Zap } from 'lucide-react';

export const Leaderboards: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'comedians' | 'fans'>('comedians');
  const [scope, setScope] = useState<'global' | 'country' | 'city'>('global');

  const mockData = [
    { rank: 1, name: "Julius Carr", points: 12450, location: "New York, USA", avatar: "JC", trend: 'up' },
    { rank: 2, name: "Sarah 'The Sting' Miller", points: 11200, location: "London, UK", avatar: "SM", trend: 'up' },
    { rank: 3, name: "Funny Bones", points: 9850, location: "Austin, TX", avatar: "FB", trend: 'down' },
    { rank: 4, name: "Marcus Vibe", points: 8900, location: "Chicago, IL", avatar: "MV", trend: 'up' },
    { rank: 5, name: "Lizzy Laughs", points: 7600, location: "Los Angeles, CA", avatar: "LL", trend: 'same' },
  ];

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
            {[
              { id: 'global', label: 'Global', icon: <Globe className="w-3 h-3" /> },
              { id: 'country', label: 'Country', icon: <Globe className="w-3 h-3" /> },
              { id: 'city', label: 'City', icon: <MapPin className="w-3 h-3" /> }
            ].map((s) => (
              <button 
                key={s.id}
                onClick={() => setScope(s.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${scope === s.id ? 'border-amber-500 bg-amber-500/10 text-amber-500' : 'border-slate-800 text-slate-500 hover:border-slate-600'}`}
              >
                {s.icon} {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Podium for Top 3 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 items-end">
          {/* Rank 2 */}
          <div className="order-2 md:order-1 glass-card p-6 rounded-3xl text-center border-slate-800 relative group hover:-translate-y-2 transition-transform h-fit">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-700 text-white px-3 py-1 rounded-full text-xs font-black italic">#2</div>
            <div className="w-20 h-20 bg-slate-800 rounded-full mx-auto mb-4 border-2 border-slate-600 overflow-hidden flex items-center justify-center text-2xl font-black">{mockData[1].avatar}</div>
            <h3 className="text-xl font-bold uppercase italic">{mockData[1].name}</h3>
            <p className="text-slate-500 text-xs mb-4 uppercase tracking-widest">{mockData[1].location}</p>
            <div className="text-2xl font-black text-white">{mockData[1].points.toLocaleString()} LAF</div>
          </div>
          
          {/* Rank 1 */}
          <div className="order-1 md:order-2 glass-card p-8 rounded-[2.5rem] text-center border-amber-500/30 relative group hover:-translate-y-4 transition-transform shadow-2xl shadow-amber-500/10">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 px-4 py-2 rounded-full text-sm font-black italic flex items-center gap-2">
              <Trophy className="w-4 h-4" /> CHAMPION
            </div>
            <div className="w-28 h-28 bg-amber-500/20 rounded-full mx-auto mb-4 border-4 border-amber-500 overflow-hidden flex items-center justify-center text-4xl font-black">{mockData[0].avatar}</div>
            <h3 className="text-2xl font-bold uppercase italic">{mockData[0].name}</h3>
            <p className="text-amber-500/80 text-xs mb-6 uppercase tracking-widest font-bold">{mockData[0].location}</p>
            <div className="text-4xl font-black gradient-text">{mockData[0].points.toLocaleString()} LAF</div>
            <div className="mt-4 flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />)}
            </div>
          </div>

          {/* Rank 3 */}
          <div className="order-3 glass-card p-6 rounded-3xl text-center border-slate-800 relative group hover:-translate-y-2 transition-transform h-fit">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-900/40 text-amber-500 px-3 py-1 rounded-full text-xs font-black italic border border-amber-500/20">#3</div>
            <div className="w-20 h-20 bg-slate-800 rounded-full mx-auto mb-4 border-2 border-slate-700 overflow-hidden flex items-center justify-center text-2xl font-black">{mockData[2].avatar}</div>
            <h3 className="text-xl font-bold uppercase italic">{mockData[2].name}</h3>
            <p className="text-slate-500 text-xs mb-4 uppercase tracking-widest">{mockData[2].location}</p>
            <div className="text-2xl font-black text-white">{mockData[2].points.toLocaleString()} LAF</div>
          </div>
        </div>

        {/* List View */}
        <div className="space-y-4">
          {mockData.slice(3).map((item) => (
            <div key={item.rank} className="glass-card p-4 rounded-2xl flex items-center gap-6 border-slate-800/50 hover:bg-slate-900/50 transition-all cursor-pointer group">
              <div className="text-2xl font-black italic text-slate-600 group-hover:text-red-600 transition-colors w-12 text-center">#{item.rank}</div>
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-400 group-hover:border-red-500 transition-all border-2 border-transparent">{item.avatar}</div>
              <div className="flex-grow">
                <h4 className="font-bold uppercase italic">{item.name}</h4>
                <div className="flex items-center gap-4 text-[10px] text-slate-500 uppercase tracking-widest mt-1">
                   <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {item.location}</span>
                   {item.trend === 'up' && <span className="text-green-500 flex items-center gap-0.5"><ChevronUp className="w-3 h-3" /> Trending Up</span>}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-black italic">{item.points.toLocaleString()}</div>
                <div className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">LAF Points</div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <button className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] hover:text-amber-500 transition-colors">
            View Full Global 1,000 →
          </button>
        </div>
      </div>
    </div>
  );
};
