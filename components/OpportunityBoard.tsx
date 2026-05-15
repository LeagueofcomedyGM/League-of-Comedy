
import React, { useState } from 'react';
import { Search, Filter, Briefcase, Calendar, MapPin, DollarSign, Clock, Users, ArrowUpRight, Zap, CheckCircle2, Building, Mic2, Trophy, Star } from 'lucide-react';

interface OpportunityBoardProps {
  role: string;
  onPostSpot?: () => void;
}

export const OpportunityBoard: React.FC<OpportunityBoardProps> = ({ role, onPostSpot }) => {
  const [mainTab, setMainTab] = useState<'comedians' | 'organizers'>('comedians');
  const [view, setView] = useState<'browse' | 'invites'>('browse');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const opportunities = [
    { id: 1, title: "10-Minute Spot (Paid)", venue: "The Comedy Store", location: "London", date: "Friday, Nov 12", pay: "$50", type: "Showcase", tags: ["Verified Only", "Pro Tier"] },
    { id: 2, title: "After Dinner Speaker", venue: "Goldman Sachs", location: "Global / Remote", date: "Dec 15", pay: "$2,500", type: "Corporate", tags: ["Corporate Clean"] },
    { id: 3, title: "Open Mic Headliner", venue: "Chuckles Pub", location: "Manchester", date: "Weekly", pay: "Drinks + $20", type: "Bar Gig", tags: ["Open to All"] },
    { id: 4, title: "Writing Gig: Roast Battle", venue: "TV Production House", location: "London", date: "Jan 2026", pay: "$400/Day", type: "Writing", tags: ["Experience Required"] },
    { id: 5, title: "Private Birthday Party", venue: "Private Residence", location: "Beverly Hills", date: "Feb 14", pay: "$1,200", type: "Private", tags: ["Clean Only", "High Energy"] },
  ];

  return (
    <div className="min-h-screen pt-4 lg:pt-12 pb-24 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 lg:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest mb-4">
            <Zap className="w-3 h-3 fill-current" /> Live Gig Market
          </div>
          <h1 className="text-4xl lg:text-7xl font-black italic uppercase tracking-tighter">
            Gigs <span className="text-red-600">Board</span>
          </h1>
          <p className="text-[#8892a4] mt-2 max-w-xl font-medium text-xs lg:text-base">Connecting talent with gigs. From open mic spots to international corporate headlining tours.</p>
        </div>

        {/* NEW MAIN TAB BAR - Matches HomeBase Style */}
        <div className="flex items-center gap-2 mb-8 lg:mb-12 overflow-x-auto no-scrollbar py-1">
          {[
            { label: 'FOR COMEDIANS', id: 'comedians' },
            { label: 'FOR ORGANIZERS', id: 'organizers' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setMainTab(tab.id as any)}
              className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.1em] transition-all whitespace-nowrap ${
                mainTab === tab.id 
                ? 'bg-brand-gradient text-white shadow-lg' 
                : 'bg-[#131b2e] text-[#8892a4] hover:text-white border border-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {mainTab === 'comedians' ? (
          <div className="animate-in fade-in duration-500">
            {/* Sub-toggle and Layout for Comedians */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-[#131b2e] border border-white/5 rounded-xl text-xs font-black uppercase italic text-[#8892a4]"
              >
                <Filter className="w-4 h-4" /> {isFilterOpen ? 'Hide Filters' : 'Show Filters'}
              </button>
              <div className="flex bg-[#131b2e] p-1 rounded-xl border border-white/5 w-full sm:w-auto">
                <button 
                  onClick={() => setView('browse')}
                  className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-[10px] sm:text-xs font-black uppercase italic transition-all ${view === 'browse' ? 'bg-[#1e293b] text-white shadow-lg' : 'text-[#8892a4]'}`}
                >
                  Browse Markets
                </button>
                <button 
                  onClick={() => setView('invites')}
                  className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-[10px] sm:text-xs font-black uppercase italic transition-all ${view === 'invites' ? 'bg-[#1e293b] text-white shadow-lg' : 'text-[#8892a4]'}`}
                >
                  Invitations (0)
                </button>
              </div>
            </div>

            <div className="grid lg:grid-cols-[300px_1fr] gap-8">
              {/* Sidebar Filters */}
              <aside className={`${isFilterOpen ? 'block' : 'hidden'} lg:block space-y-6`}>
                <div className="glass-card p-6 rounded-2xl border-white/10">
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <Filter className="w-4 h-4" /> Filters
                  </h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#8892a4] block mb-3">Gig Category</label>
                      <div className="space-y-2">
                        {['Showcase', 'Corporate', 'Private', 'Writing', 'TV/Film'].map(tag => (
                          <label key={tag} className="flex items-center gap-3 cursor-pointer group">
                            <div className="w-4 h-4 rounded border border-white/10 bg-[#0a0e1a] flex items-center justify-center group-hover:border-[#e53e3e] transition-all">
                              <CheckCircle2 className="w-3 h-3 text-[#e53e3e] scale-0 group-has-[:checked]:scale-100 transition-transform" />
                            </div>
                            <input type="checkbox" className="hidden peer" />
                            <span className="text-xs font-bold text-[#8892a4] peer-checked:text-white transition-colors">{tag}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#8892a4] block mb-3">Min. Pay (Budget)</label>
                      <input type="range" className="w-full h-1.5 bg-[#131b2e] rounded-lg appearance-none cursor-pointer accent-[#e53e3e]" />
                      <div className="flex justify-between text-[10px] font-black text-[#8892a4] mt-2">
                        <span>$0</span>
                        <span>$5,000+</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#8892a4] block mb-3">Tier Required</label>
                      <select className="w-full bg-[#0a0e1a] border border-white/10 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-[#e53e3e] transition-all">
                        <option>All Tiers</option>
                        <option>Pro Tier Only</option>
                        <option>Verified Comedians</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-brand-gradient p-6 rounded-2xl text-white shadow-2xl shadow-orange-900/20">
                   <h4 className="text-xl font-black italic uppercase leading-none mb-2 text-white">Upgrade to PRO</h4>
                   <p className="text-xs font-bold mb-6 leading-relaxed opacity-90 text-white/80">Get instant SMS alerts for high-pay corporate gigs and priority matching.</p>
                   <button className="w-full bg-[#0a0e1a] text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-xl">Go Pro Now</button>
                </div>
              </aside>

              {/* Main List */}
              <div className="space-y-4">
                 <div className="relative mb-8">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8892a4]" />
                   <input 
                    type="text" 
                    placeholder="Search gigs by venue, city, or keyword..." 
                    className="w-full bg-[#131b2e] border border-white/10 rounded-2xl pl-12 pr-4 py-5 text-sm font-bold focus:border-[#e53e3e] outline-none transition-all shadow-2xl" 
                   />
                 </div>

                 {opportunities.map((opp) => (
                   <div key={opp.id} className="glass-card p-6 rounded-2xl border-white/10 hover:border-white/20 hover:bg-[#131b2e]/40 transition-all group">
                     <div className="flex flex-col md:flex-row justify-between gap-6">
                       <div className="flex-grow">
                         <div className="flex items-center gap-3 mb-2">
                           <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${['Corporate', 'Private'].includes(opp.type) ? 'bg-[#f6a623] text-[#0a0e1a]' : 'bg-[#1e293b] text-[#8892a4]'}`}>
                             {opp.type}
                           </span>
                           <span className="text-[10px] font-bold text-[#8892a4] flex items-center gap-1">
                             <Clock className="w-3 h-3" /> Posted 2h ago
                           </span>
                         </div>
                         <h3 className="text-2xl font-bold uppercase italic mb-2 group-hover:text-brand-gradient transition-colors text-white">{opp.title}</h3>
                         
                         <div className="flex flex-wrap items-center gap-6 mt-4">
                           <div className="flex items-center gap-2 text-[#8892a4] text-xs font-bold">
                             <MapPin className="w-4 h-4 text-[#e53e3e]" /> {opp.location} • {opp.venue}
                           </div>
                           <div className="flex items-center gap-2 text-[#8892a4] text-xs font-bold">
                             <Calendar className="w-4 h-4 text-[#e53e3e]" /> {opp.date}
                           </div>
                           <div className="flex items-center gap-2 text-[#48bb78] text-xs font-black uppercase italic tracking-widest">
                             <DollarSign className="w-4 h-4" /> {opp.pay}
                           </div>
                         </div>
                       </div>

                       <div className="flex flex-col sm:flex-row md:flex-col justify-between items-start sm:items-center md:items-end gap-4 min-w-[140px]">
                          <div className="flex -space-x-2">
                            <div className="w-8 h-8 rounded-full bg-[#1e293b] border-2 border-[#0a0e1a] flex items-center justify-center text-[8px] font-bold text-white">12</div>
                            <div className="w-8 h-8 rounded-full bg-[#334155] border-2 border-[#0a0e1a] flex items-center justify-center text-[8px] font-bold text-[#8892a4] leading-none">Apps</div>
                          </div>
                          <button className="w-full sm:w-auto bg-brand-gradient hover:opacity-90 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-xl shadow-orange-900/20 active:scale-95 italic">
                            Apply Now <ArrowUpRight className="w-4 h-4" />
                          </button>
                       </div>
                     </div>
                     
                     <div className="mt-6 pt-6 border-t border-white/5 flex flex-wrap gap-2">
                        {opp.tags.map(tag => (
                          <span key={tag} className="text-[9px] font-black uppercase tracking-widest text-[#8892a4] px-3 py-1 bg-[#0a0e1a] rounded-full border border-white/5">
                            {tag}
                          </span>
                        ))}
                     </div>
                   </div>
                 ))}
                 
                 <button className="w-full py-6 text-[#8892a4] font-black uppercase text-[10px] tracking-[0.3em] hover:text-white transition-colors">
                   Load More Opportunities
                 </button>
              </div>
            </div>
          </div>
        ) : (
          /* FOR ORGANIZERS LANDING CONTENT */
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto space-y-24">
             <div className="text-center">
                <div className="inline-flex p-6 bg-[#131b2e] rounded-3xl border border-white/5 mb-8">
                  <Building className="w-12 h-12 text-[#f6a623]" />
                </div>
                <h2 className="text-4xl lg:text-7xl font-black italic uppercase tracking-tighter mb-6">POST. FIND. <span className="text-brand-gradient">BOOK.</span></h2>
                <p className="text-xl text-[#8892a4] font-medium leading-relaxed max-w-3xl mx-auto">List your shows, find the right comedian for your event, and manage everything in one place. Thousands of acts ready to perform.</p>
                <div className="mt-12">
                   <button 
                    onClick={onPostSpot}
                    className="bg-brand-gradient text-white px-12 py-6 rounded-2xl text-xl font-black uppercase italic tracking-widest shadow-2xl shadow-orange-900/40 active:scale-95 transition-all"
                   >
                     POST A SPOT NOW
                   </button>
                </div>
             </div>

             <div className="grid md:grid-cols-3 gap-8">
               {[
                 { icon: <Mic2 className="text-[#f6a623]" />, title: "TOP TALENT", desc: "Access a verified roster of professional comedians for any audience." },
                 { icon: <Trophy className="text-[#e53e3e]" />, title: "RANKED ACTS", desc: "Browse comedians by their performance data and league rankings." },
                 { icon: <Star className="text-blue-500" />, title: "SECURE BOOKING", desc: "Direct communication and secure contracts managed by the league." }
               ].map((item, i) => (
                 <div key={i} className="glass-card p-10 rounded-[2.5rem] border-white/5 text-center group hover:bg-[#131b2e]/60 transition-all">
                    <div className="p-5 bg-[#0a0e1a] rounded-2xl w-fit mx-auto mb-6 group-hover:scale-110 transition-transform">{item.icon}</div>
                    <h4 className="text-xl font-black italic uppercase mb-4 text-white">{item.title}</h4>
                    <p className="text-xs text-[#8892a4] font-bold uppercase tracking-widest leading-loose">{item.desc}</p>
                 </div>
               ))}
             </div>

             <div className="glass-card p-12 rounded-[3rem] border-white/10 bg-gradient-to-br from-[#131b2e] to-transparent flex flex-col md:flex-row items-center justify-between gap-12">
                <div className="max-w-md">
                   <h3 className="text-3xl font-black italic uppercase mb-4 text-white">HIRE FOR CORPORATE</h3>
                   <p className="text-[#8892a4] font-medium mb-8">Need a clean, professional act for a corporate gala, product launch, or company retreat? Our dedicated corporate desk can hand-pick the perfect talent for you.</p>
                   <button className="text-xs font-black uppercase tracking-[0.2em] text-[#f6a623] hover:text-white transition-all flex items-center gap-2 italic">
                     LEARN ABOUT CORPORATE BOOKING <ArrowUpRight className="w-4 h-4" />
                   </button>
                </div>
                <div className="w-full max-w-[300px] aspect-square rounded-[2rem] overflow-hidden border-2 border-white/5">
                   <img src="https://picsum.photos/seed/corpbook/600/600" className="w-full h-full object-cover opacity-60 grayscale" />
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
