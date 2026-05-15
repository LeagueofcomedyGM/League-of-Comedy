
import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export const HowToGetGigs: React.FC = () => {
  return (
    <div className="pt-32 pb-24 px-4 bg-[#0a0e1a] min-h-screen text-white">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-4">
          How to Get Comedy Gigs
        </h1>
        <p className="text-slate-400 text-lg mb-20">
          Three simple steps to your next booking
        </p>

        <div className="grid md:grid-cols-3 gap-12 mb-32">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-xl font-black mb-6">1</div>
            <h3 className="text-xl font-black uppercase mb-4">Create Your Profile</h3>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Sign up and build your comedy profile. Add your bio, experience, location, and upload your best video clips.
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-xl font-black mb-6">2</div>
            <h3 className="text-xl font-black uppercase mb-4">Browse & Apply</h3>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Search for open spots at venues near you. Found one you like? Apply with one click and add a personal message.
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-xl font-black mb-6">3</div>
            <h3 className="text-xl font-black uppercase mb-4">Get Booked</h3>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Organizers review your profile and videos. When they like what they see, you get the booking. Simple as that.
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-12 md:p-20 rounded-[3rem] border-white/5 bg-gradient-to-b from-white/5 to-transparent">
            <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-6">
              Ready to Get More Gigs?
            </h2>
            <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto">
              Join thousands of comedians already using League of Comedy. Create your profile in 30 seconds.
            </p>
            
            <button className="bg-red-600 hover:bg-red-700 text-white px-12 py-5 rounded-2xl text-lg font-black transition-all shadow-2xl shadow-red-900/40 active:scale-95 italic uppercase tracking-wider mb-10">
              Create Profile
            </button>

            <div className="flex flex-wrap justify-center gap-8 text-slate-400 text-sm font-bold">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-red-600" />
                Easy Setup
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-red-600" />
                No Hidden Fees
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-red-600" />
                Cancel Anytime
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
