
import React from 'react';
import { PageType } from '../types';
import { 
  Zap, 
  Video, 
  Target, 
  Star, 
  MapPin, 
  MousePointer2, 
  Bell, 
  UserCircle, 
  ChevronRight,
  ShieldCheck,
  CheckCircle
} from 'lucide-react';

interface ForComediansProps {
  navigateTo: (page: PageType, tab?: string) => void;
}

export const ForComedians: React.FC<ForComediansProps> = ({ navigateTo }) => {
  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative pt-32 pb-24 overflow-hidden bg-slate-950">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/10 border border-red-500/20 text-red-500 text-xs font-bold uppercase tracking-widest mb-8">
            <Star className="w-3 h-3 fill-current" /> For Stand-Up Comedians
          </div>
          <h1 className="text-5xl lg:text-8xl font-black mb-8 italic tracking-tighter">
            STOP WAITING. <br />
            <span className="gradient-text">START GETTING BOOKED.</span>
          </h1>
          <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            League of Comedy connects you directly with organizers and venues looking for talent. Find gigs, apply with one click, and grow your career.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-red-600 hover:bg-red-700 text-white px-10 py-5 rounded-2xl text-xl font-bold transition-all shadow-xl shadow-red-900/30 active:scale-95">
              Create Free Profile
            </button>
            <button 
              onClick={() => navigateTo(PageType.OPPORTUNITIES)}
              className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white px-10 py-5 rounded-2xl text-xl font-bold transition-all active:scale-95"
            >
              Browse Open Gigs
            </button>
          </div>
          <p className="mt-8 text-slate-500 font-medium">No credit card required to get started.</p>
        </div>
        
        {/* Animated Background Element */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-64 bg-gradient-to-t from-red-600/10 to-transparent blur-3xl rounded-[100%]"></div>
      </section>

      {/* Pain Points */}
      <section className="py-24 bg-slate-900/50 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-extrabold mb-8 italic uppercase">Tired of Chasing Gigs?</h2>
              <p className="text-xl text-slate-400 mb-12">We get it. Finding comedy gigs the old way is exhausting and often unproductive.</p>
              
              <div className="space-y-6">
                {[
                  { title: "Cold Emailing Promoters", desc: "Sending dozens of emails that never get replies. Wondering if anyone even saw your message.", emoji: "😫" },
                  { title: "Networking Burnout", desc: "Spending more time schmoozing than actually performing. Comedy should be about the craft.", emoji: "😞" },
                  { title: "Missing Opportunities", desc: "Finding out about gigs after they've already been filled. Always one step behind.", emoji: "🤷‍♂️" }
                ].map((item, idx) => (
                  <div key={idx} className="glass-card p-6 rounded-2xl flex gap-6 hover:border-red-500/30 transition-all">
                    <div className="text-4xl">{item.emoji}</div>
                    <div>
                      <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                      <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-4">
                  <div className="aspect-[3/4] rounded-2xl bg-slate-800 overflow-hidden shadow-2xl transform -translate-y-8">
                    <img src="https://picsum.photos/seed/mic1/400/600" className="w-full h-full object-cover grayscale opacity-50" />
                  </div>
                  <div className="aspect-square rounded-2xl bg-slate-800 overflow-hidden shadow-2xl">
                    <img src="https://picsum.photos/seed/mic2/400/400" className="w-full h-full object-cover grayscale opacity-50" />
                  </div>
               </div>
               <div className="space-y-4">
                  <div className="aspect-square rounded-2xl bg-slate-800 overflow-hidden shadow-2xl">
                    <img src="https://picsum.photos/seed/mic3/400/400" className="w-full h-full object-cover grayscale opacity-50" />
                  </div>
                  <div className="aspect-[3/4] rounded-2xl bg-slate-800 overflow-hidden shadow-2xl transform translate-y-8">
                    <img src="https://picsum.photos/seed/mic4/400/600" className="w-full h-full object-cover grayscale opacity-50" />
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-4 text-center mb-16">
          <h2 className="text-4xl lg:text-6xl font-black italic tracking-tight mb-6">THERE'S A BETTER WAY</h2>
          <p className="text-xl text-slate-400">League of Comedy puts the gigs in front of you. Apply directly and let your work speak for itself.</p>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { icon: <MapPin className="text-red-500" />, title: "Find Local Gigs", desc: "Search for open spots at venues near you. Filter by location, date, spot type, and pay." },
            { icon: <Video className="text-amber-500" />, title: "Showcase Your Videos", desc: "Upload your best clips so organizers can see your style before booking. No more describing your act." },
            { icon: <MousePointer2 className="text-blue-500" />, title: "One-Click Applications", desc: "Apply to opportunities instantly. Your profile and videos do the talking. No more cover letters." },
            { icon: <Bell className="text-emerald-500" />, title: "Get Notified", desc: "Receive email alerts when new spots open in your area. Never miss an opportunity again." },
            { icon: <UserCircle className="text-purple-500" />, title: "Build Your Profile", desc: "Create a professional comedy profile that showcases your experience, style, and best work." },
            { icon: <ShieldCheck className="text-yellow-500" />, title: "All Experience Levels", desc: "From open mic newbies to seasoned pros. Find gigs that match your experience level." }
          ].map((item, idx) => (
            <div key={idx} className="glass-card p-8 rounded-2xl border-transparent hover:border-slate-800 transition-all hover:-translate-y-2 group">
              <div className="mb-6 p-4 bg-slate-900 rounded-2xl w-fit group-hover:scale-110 transition-transform">{item.icon}</div>
              <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
              <p className="text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Step by Step */}
      <section className="py-24 bg-gradient-to-b from-slate-950 to-red-950/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
          <h2 className="text-4xl font-black italic mb-4">HOW TO GET COMEDY GIGS</h2>
          <p className="text-slate-400 text-lg">Three simple steps to your next booking</p>
        </div>
        
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-12 relative">
           {[
             { step: 1, title: "Create Your Profile", desc: "Sign up and build your comedy profile. Add your bio, experience, location, and upload your best video clips." },
             { step: 2, title: "Browse & Apply", desc: "Search for open spots at venues near you. Found one you like? Apply with one click and add a personal message." },
             { step: 3, title: "Get Booked", desc: "Organizers review your profile and videos. When they like what they see, you get the booking. Simple as that." }
           ].map((item) => (
             <div key={item.step} className="text-center group">
               <div className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center text-2xl font-black mx-auto mb-6 group-hover:rotate-12 transition-transform shadow-xl shadow-red-600/20">
                 {item.step}
               </div>
               <h4 className="text-xl font-bold mb-4">{item.title}</h4>
               <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
             </div>
           ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 text-center">
        <div className="max-w-4xl mx-auto px-4 glass-card p-12 rounded-[2rem] border-red-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 blur-3xl"></div>
          <h2 className="text-4xl lg:text-5xl font-black mb-6 italic">READY TO GET MORE GIGS?</h2>
          <p className="text-xl text-slate-400 mb-10">Join thousands of comedians already using League of Comedy. Create your profile in 30 seconds.</p>
          <button className="bg-red-600 hover:bg-red-700 text-white px-12 py-5 rounded-2xl text-xl font-bold transition-all shadow-2xl shadow-red-900/40 mb-12 active:scale-95">
            CREATE PROFILE
          </button>
          
          <div className="flex flex-wrap justify-center gap-8 text-slate-400 font-medium">
            <div className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-red-500" /> Easy Setup</div>
            <div className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-red-500" /> No Hidden Fees</div>
            <div className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-red-500" /> Cancel Anytime</div>
          </div>
        </div>
      </section>
    </div>
  );
};
