
import React from 'react';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Mic2, 
  Video, 
  Share2, 
  Ticket, 
  Navigation, 
  Building, 
  Heart, 
  Mail, 
  History, 
  Zap, 
  Trophy, 
  Star,
  ChevronRight,
  Filter,
  Layout,
  UserPlus
} from 'lucide-react';

export const FanGettingStarted: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0a0e1a] pt-24 pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#131b2e] border border-white/5 text-[#f6a623] text-[10px] font-black uppercase tracking-[0.2em] mb-8">
            <Zap className="w-3 h-3" /> FOR THE FANS
          </div>
          <h1 className="text-5xl lg:text-7xl font-black italic uppercase tracking-tight text-white mb-6 px-2">
            YOUR ALL-IN-ONE <span className="text-brand-gradient">COMEDY HUB</span>
          </h1>
          <p className="text-xl text-[#8892a4] max-w-3xl mx-auto font-medium leading-relaxed">
            The League of Comedy is designed to simplify how you discover, plan, and enjoy live comedy. 
            Everything you need for the perfect night out, all in one place.
          </p>
        </div>

        <div className="space-y-32">
          {/* Section 1: Find Every Show */}
          <section className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-brand-gradient rounded-2xl flex items-center justify-center shadow-lg shadow-orange-900/20">
                  <Search className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-black italic uppercase tracking-tight text-white">1. Find Every Show in One Place</h2>
              </div>
              <p className="text-[#8892a4] text-lg mb-8 leading-relaxed">
                The League of Comedy is designed to solve the "fragmentation problem" by putting the entire comedy ecosystem into a single, searchable database.
              </p>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="shrink-0 w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#f6a623]"></div>
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1">Centralized Discovery</h4>
                    <p className="text-[#8892a4] text-sm">Access a single destination for comedy shows aggregated from multiple major ticketing platforms.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="shrink-0 w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#f6a623]"></div>
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1">Smart Search & Filters</h4>
                    <p className="text-[#8892a4] text-sm">Use keyword, city, or date filters to find exactly what you are looking for.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="shrink-0 w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#f6a623]"></div>
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1">Flexible Views</h4>
                    <p className="text-[#8892a4] text-sm">Browse upcoming events through a standard list, a map view to see what is nearby, or a calendar view to plan your month.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2 glass-card p-4 rounded-[3rem] border-white/10 shadow-2xl">
              <div className="aspect-video rounded-[2.5rem] overflow-hidden bg-slate-900 relative">
                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                  <Layout className="w-32 h-32 text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent"></div>
                <div className="absolute bottom-8 left-8 right-8 p-6 bg-[#0a0e1a]/80 backdrop-blur-md rounded-2xl border border-white/5">
                  <div className="flex items-center gap-3 mb-3">
                    <Filter className="w-4 h-4 text-[#f6a623]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white">Live Search Engine</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full mb-2"></div>
                  <div className="h-2 w-2/3 bg-white/5 rounded-full"></div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Discover Your Kind of Laughs */}
          <section className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="glass-card p-4 rounded-[3rem] border-white/10 shadow-2xl">
              <div className="aspect-video rounded-[2.5rem] overflow-hidden bg-slate-900 relative">
                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                  <Mic2 className="w-32 h-32 text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-bl from-red-500/10 to-transparent"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex gap-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-24 h-32 bg-[#0a0e1a] rounded-xl border border-white/10 p-2 flex flex-col items-center">
                        <div className="w-full h-16 bg-white/5 rounded-lg mb-2"></div>
                        <div className="w-12 h-1.5 bg-white/10 rounded-full mb-1"></div>
                        <div className="w-8 h-1 bg-white/5 rounded-full"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-brand-gradient rounded-2xl flex items-center justify-center shadow-lg shadow-orange-900/20">
                  <Mic2 className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-black italic uppercase tracking-tight text-white">2. Discover Your Kind of Laughs</h2>
              </div>
              <p className="text-[#8892a4] text-lg mb-8 leading-relaxed">
                Finding the right comedian is easier when you can preview their style before you buy a ticket.
              </p>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="shrink-0 w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#f6a623]"></div>
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1">Comedian Roster</h4>
                    <p className="text-[#8892a4] text-sm">Browse the directory of performers using a simple A-Z filter or search by name.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="shrink-0 w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#f6a623]"></div>
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1">Preview the Talent</h4>
                    <p className="text-[#8892a4] text-sm">Visit comedian profiles to view showcase video clips and embedded social media feeds from Instagram, TikTok, and YouTube.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="shrink-0 w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#f6a623]"></div>
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1">Direct Connections</h4>
                    <p className="text-[#8892a4] text-sm">Use the provided social media links to explore a comedian's work further and ensure their brand of humor matches your taste.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Effortless Planning */}
          <section className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-brand-gradient rounded-2xl flex items-center justify-center shadow-lg shadow-orange-900/20">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-black italic uppercase tracking-tight text-white">3. Effortless Planning</h2>
              </div>
              <p className="text-[#8892a4] text-lg mb-8 leading-relaxed">
                We simplify the logistics of a night out so you can focus on enjoying the performance.
              </p>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="shrink-0 w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#f6a623]"></div>
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1">Direct Ticket Access</h4>
                    <p className="text-[#8892a4] text-sm">Every show listing features a "Buy Tickets" button that links you directly to the official partner's checkout page.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="shrink-0 w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#f6a623]"></div>
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1">Integrated Logistics</h4>
                    <p className="text-[#8892a4] text-sm">Find turn-by-turn navigation and nearby food options directly on the show page to help you plan your entire evening.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="shrink-0 w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#f6a623]"></div>
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1">Venue Essentials</h4>
                    <p className="text-[#8892a4] text-sm">Quickly check for age restrictions (18+/21+), parking availability, accessibility features, and venue amenities before you head out.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2 glass-card p-4 rounded-[3rem] border-white/10 shadow-2xl">
              <div className="aspect-video rounded-[2.5rem] overflow-hidden bg-slate-900 relative">
                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                  <Navigation className="w-32 h-32 text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-transparent"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#0a0e1a]/80 backdrop-blur-xl rounded-full border border-white/10 flex items-center justify-center">
                  <div className="text-center">
                    <Ticket className="w-10 h-10 text-[#f6a623] mx-auto mb-2" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white">One-Click Booking</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Personalized Comedy Feed */}
          <section className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="glass-card p-4 rounded-[3rem] border-white/10 shadow-2xl">
              <div className="aspect-video rounded-[2.5rem] overflow-hidden bg-slate-900 relative">
                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                  <Heart className="w-32 h-32 text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-transparent"></div>
                <div className="absolute bottom-8 left-8 right-8 space-y-3">
                  <div className="h-12 w-full bg-[#0a0e1a]/80 backdrop-blur rounded-xl border border-white/5 flex items-center px-4 gap-3">
                    <div className="w-6 h-6 rounded-full bg-brand-gradient"></div>
                    <div className="h-2 w-24 bg-white/10 rounded-full"></div>
                  </div>
                  <div className="h-12 w-full bg-[#0a0e1a]/80 backdrop-blur rounded-xl border border-white/5 flex items-center px-4 gap-3">
                    <div className="w-6 h-6 rounded-full bg-white/10"></div>
                    <div className="h-2 w-32 bg-white/10 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-brand-gradient rounded-2xl flex items-center justify-center shadow-lg shadow-orange-900/20">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-black italic uppercase tracking-tight text-white">4. Your Personalized Comedy Feed</h2>
              </div>
              <p className="text-[#8892a4] text-lg mb-8 leading-relaxed">
                Tailor the platform so the best comedy finds you based on your personal preferences.
              </p>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="shrink-0 w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#f6a623]"></div>
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1">Follow Your Favorites</h4>
                    <p className="text-[#8892a4] text-sm">Follow specific comedians or venues to receive updates and see their latest show dates in your personal dashboard.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="shrink-0 w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#f6a623]"></div>
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1">Custom Newsletters</h4>
                    <p className="text-[#8892a4] text-sm">Subscribe to city-specific editions (like LA, NY, or Chicago) and choose your preferred frequency—weekly, bi-weekly, or monthly.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="shrink-0 w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#f6a623]"></div>
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1">Save for Later</h4>
                    <p className="text-[#8892a4] text-sm">Use "Like" and "Want to Go" buttons to keep track of interesting shows and build your personal show history.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5: Simple Rewards */}
          <section className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-brand-gradient rounded-2xl flex items-center justify-center shadow-lg shadow-orange-900/20">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-black italic uppercase tracking-tight text-white">5. Simple Rewards (LAF Points)</h2>
              </div>
              <p className="text-[#8892a4] text-lg mb-8 leading-relaxed">
                While you enjoy the convenience of the platform, you naturally earn rewards for your engagement.
              </p>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="shrink-0 w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#f6a623]"></div>
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1">Earn as You Engage</h4>
                    <p className="text-[#8892a4] text-sm">Receive LAF Points for basic actions like creating an account, completing your profile, following artists, or referring friends.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="shrink-0 w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#f6a623]"></div>
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1">Track Your Rank</h4>
                    <p className="text-[#8892a4] text-sm">See how you stack up against other fans on city-wide or global leaderboards based on your community activity.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="shrink-0 w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#f6a623]"></div>
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1">Upgrade for More</h4>
                    <p className="text-[#8892a4] text-sm">Paid subscription tiers (Superfan and VIP) allow you to earn LAF Tokens, which can be redeemed for ticket discounts and exclusive perks.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2 glass-card p-4 rounded-[3rem] border-white/10 shadow-2xl">
              <div className="aspect-video rounded-[2.5rem] overflow-hidden bg-slate-900 relative">
                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                  <Trophy className="w-32 h-32 text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-bl from-amber-500/10 to-transparent"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-5xl font-black italic text-brand-gradient mb-2">1,250</div>
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white">LAF POINTS EARNED</div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* CTA Section */}
        <div className="mt-32 p-12 rounded-[3rem] bg-brand-gradient text-center relative overflow-hidden shadow-2xl shadow-orange-900/40">
          <div className="absolute top-0 right-0 p-12 opacity-10">
            <Zap className="w-64 h-64 text-white" />
          </div>
          <h2 className="text-4xl font-black italic uppercase tracking-tight text-white mb-6 relative z-10 px-2">Ready to Start Your Comedy Journey?</h2>
          <p className="text-white/80 text-lg mb-10 max-w-2xl mx-auto font-medium relative z-10">
            Join thousands of fans who use the League of Comedy to find the best shows and support their favorite performers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            <button className="bg-white text-[#0a0e1a] px-10 py-5 rounded-2xl text-lg font-black italic uppercase tracking-wider hover:bg-white/90 transition-all active:scale-95">
              Create Free Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
