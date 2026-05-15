
import React from 'react';
import { PageType } from '../types';
import { Sparkles, MessageSquare, Video, CheckCircle2, Search, Zap, Clock, Star, Users, Trophy } from 'lucide-react';

interface CorporatePageProps {
  navigateTo: (page: PageType, tab?: string) => void;
}

export const CorporatePage: React.FC<CorporatePageProps> = ({ navigateTo }) => {
  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative pt-32 pb-24 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/corp/1920/1080')] bg-cover bg-center opacity-20 grayscale -z-20"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/90 to-slate-950 -z-10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold uppercase tracking-widest mb-8">
            <Sparkles className="w-3 h-3" /> Corporate Entertainment
          </div>
          <h1 className="text-5xl lg:text-8xl font-black mb-8 italic tracking-tighter uppercase">
            Book a Comedian <br />
            <span className="text-amber-500">For Your Event</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-12 leading-relaxed">
            Make your next conference, awards night, or company party unforgettable. Find professional comedians who know how to work a corporate crowd.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-10 py-5 rounded-2xl text-xl font-black transition-all shadow-2xl shadow-amber-500/30 active:scale-95">
              Browse Comedians
            </button>
            <button className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white px-10 py-5 rounded-2xl text-xl font-black transition-all active:scale-95">
              Get In Touch
            </button>
          </div>
        </div>
      </section>

      {/* Why Book */}
      <section className="py-24 bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-16 items-center">
           <div>
              <h2 className="text-4xl lg:text-6xl font-black mb-8 italic uppercase tracking-tighter">Why Book a <span className="text-red-500">Comedian?</span></h2>
              <p className="text-xl text-slate-400 leading-relaxed mb-8 italic">
                Comedy is the secret ingredient that turns a good event into a memorable one.
              </p>
              <div className="space-y-8">
                {[
                  { title: "Break the Ice", desc: "A good comedian gets everyone laughing together, creating instant connection and positive energy in the room.", icon: <Zap className="text-amber-500" /> },
                  { title: "Memorable Moments", desc: "People remember how you made them feel. A great comedy set creates stories your team will talk about for years.", icon: <Trophy className="text-red-500" /> },
                  { title: "Energize the Room", desc: "After a long day of meetings or presentations, comedy is the perfect way to lift spirits and re-engage your audience.", icon: <Clock className="text-blue-500" /> }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 group">
                    <div className="p-4 bg-slate-950 rounded-2xl h-fit shadow-xl group-hover:scale-110 transition-transform">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold mb-2 uppercase italic">{item.title}</h4>
                      <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
           </div>
           
           <div className="relative">
              <div className="glass-card rounded-3xl overflow-hidden p-2">
                <img src="https://picsum.photos/seed/audience/800/1000" className="w-full h-auto rounded-2xl opacity-60 grayscale hover:grayscale-0 transition-all duration-700" />
              </div>
              <div className="absolute -bottom-8 -left-8 glass-card p-6 rounded-2xl border-amber-500/50 shadow-2xl animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-3">
                    <div className="w-10 h-10 rounded-full border-2 border-slate-950 bg-red-500"></div>
                    <div className="w-10 h-10 rounded-full border-2 border-slate-950 bg-amber-500"></div>
                    <div className="w-10 h-10 rounded-full border-2 border-slate-950 bg-blue-500"></div>
                  </div>
                  <span className="text-sm font-black italic">500+ Corporate Acts</span>
                </div>
              </div>
           </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl lg:text-6xl font-black mb-16 italic text-center uppercase tracking-tighter">Perfect for <span className="text-amber-500">Any Business Event</span></h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              "Conferences & Summits",
              "Awards Ceremonies",
              "Christmas Parties",
              "Team Building Days",
              "Product Launches",
              "After Dinner Speaking"
            ].map((event, idx) => (
              <div key={idx} className="glass-card p-10 rounded-3xl group hover:bg-slate-900/80 transition-all border border-transparent hover:border-slate-800">
                <div className="w-12 h-1 bg-red-600 mb-6 group-hover:w-full transition-all duration-500"></div>
                <h3 className="text-2xl font-bold mb-4 italic uppercase">{event}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Our professional comedians have years of experience tailoring their sets for high-pressure corporate environments.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-slate-950">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl font-black italic mb-16 text-center uppercase">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              { q: "How much does a corporate comedian cost?", a: "Fees vary based on the comedian's experience and event location. Expect anywhere from $500 to $5,000+ for established acts." },
              { q: "How long should a corporate set be?", a: "Most corporate sets are 20-45 minutes. For after-dinner speaking, 30-40 minutes is typical." },
              { q: "Will the comedian keep it clean?", a: "Professional corporate comedians know how to tailor their material for business audiences. You can specify your preference." },
              { q: "How far in advance should I book?", a: "For major events, book 2-3 months ahead to secure your preferred act. For smaller events, 2-4 weeks is usually sufficient." }
            ].map((item, idx) => (
              <div key={idx} className="glass-card p-8 rounded-2xl border-slate-800">
                <h4 className="text-xl font-bold mb-4 italic uppercase text-amber-500">{item.q}</h4>
                <p className="text-slate-400 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 text-center">
        <h2 className="text-4xl lg:text-6xl font-black italic mb-12 uppercase tracking-tighter">Ready to Book Your <br /> Entertainment?</h2>
        <button className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-12 py-6 rounded-2xl text-2xl font-black transition-all shadow-2xl shadow-amber-500/20 active:scale-95 mb-8">
          BROWSE CORPORATE COMEDIANS
        </button>
        <div className="flex flex-wrap justify-center gap-8 text-slate-500 font-bold uppercase tracking-widest text-xs">
          <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-500" /> Free to Browse</div>
          <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-500" /> No Booking Fees</div>
          <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-500" /> Direct Contact</div>
        </div>
      </section>
    </div>
  );
};
