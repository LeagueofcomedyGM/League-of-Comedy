
import React, { useState } from 'react';
import { X, Mic2, Briefcase, Calendar, Clock, MapPin, DollarSign, ChevronRight, Info, Check, Upload } from 'lucide-react';

interface PostSpotModalProps {
  onClose: () => void;
}

export const PostSpotModal: React.FC<PostSpotModalProps> = ({ onClose }) => {
  const [mode, setMode] = useState<'CHOICE' | 'SHOW' | 'GIG'>('CHOICE');
  const [step, setStep] = useState(1);

  const renderChoice = () => (
    <div className="animate-in fade-in zoom-in-95 duration-300">
      <div className="text-center mb-10">
        <div className="mx-auto w-12 h-12 bg-[#e53e3e] rounded-xl flex items-center justify-center mb-4 shadow-xl shadow-red-900/20">
           <Calendar className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-3xl font-black italic uppercase tracking-tighter">POST A SPOT</h2>
        <p className="text-[#8892a4] text-sm mt-2">What are you looking to post?</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div 
          onClick={() => setMode('SHOW')}
          className="glass-card p-8 rounded-2xl border-white/10 hover:border-[#f6a623]/30 cursor-pointer group transition-all hover:-translate-y-1"
        >
          <div className="p-4 bg-[#131b2e] rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform">
             <Mic2 className="w-8 h-8 text-[#f6a623]" />
          </div>
          <h3 className="text-xl font-black italic uppercase mb-3">POST A SHOW</h3>
          <p className="text-[10px] text-[#8892a4] font-medium leading-relaxed">List a live comedy event, set up ticketing through League of Comedy, and get discovered by fans in your city.</p>
        </div>

        <div 
          onClick={() => setMode('GIG')}
          className="glass-card p-8 rounded-2xl border-white/10 hover:border-[#e53e3e]/30 cursor-pointer group transition-all hover:-translate-y-1"
        >
          <div className="p-4 bg-[#131b2e] rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform">
             <Briefcase className="w-8 h-8 text-[#e53e3e]" />
          </div>
          <h3 className="text-xl font-black italic uppercase mb-3">POST A GIG</h3>
          <p className="text-[10px] text-[#8892a4] font-medium leading-relaxed">Post a paid opportunity for comedians to apply to — corporate events, private parties, festivals, and more.</p>
        </div>
      </div>
    </div>
  );

  const renderGigForm = () => {
    return (
      <div className="animate-in slide-in-from-bottom-4 duration-500">
        <div className="mb-8">
           <div className="flex items-center gap-3 mb-4">
             <Briefcase className="w-6 h-6 text-[#e53e3e]" />
             <h2 className="text-2xl font-black italic uppercase tracking-tighter">POST A GIG</h2>
           </div>
           {/* Progress Bar */}
           <div className="flex gap-2">
             {[1, 2, 3].map(s => (
               <div key={s} className={`h-1.5 flex-grow rounded-full transition-all duration-500 ${s <= step ? 'bg-brand-gradient' : 'bg-[#131b2e]'}`}></div>
             ))}
           </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto pr-4 space-y-8 custom-scrollbar">
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#8892a4]">Gig Title *</label>
                <input type="text" placeholder="e.g. After Dinner Speaker - Tech Gala" className="w-full bg-[#131b2e] border border-white/5 rounded-xl px-5 py-4 focus:border-[#e53e3e] outline-none transition-all font-bold text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#8892a4]">Gig Type</label>
                <select className="w-full bg-[#131b2e] border border-white/5 rounded-xl px-5 py-4 focus:border-[#e53e3e] outline-none appearance-none font-bold text-sm">
                  <option>Corporate Event</option>
                  <option>Private Party</option>
                  <option>Campus / University</option>
                  <option>Festival / Tour</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#8892a4]">Date</label>
                  <input type="date" className="w-full bg-[#131b2e] border border-white/5 rounded-xl px-5 py-4 focus:border-[#e53e3e] outline-none font-bold text-sm text-[#8892a4]" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#8892a4]">Time</label>
                  <input type="time" className="w-full bg-[#131b2e] border border-white/5 rounded-xl px-5 py-4 focus:border-[#e53e3e] outline-none font-bold text-sm text-[#8892a4]" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#8892a4]">Location</label>
                <input type="text" placeholder="City, Country" className="w-full bg-[#131b2e] border border-white/5 rounded-xl px-5 py-4 focus:border-[#e53e3e] outline-none font-bold text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#8892a4]">Budget Range ($)</label>
                <div className="grid grid-cols-2 gap-4">
                  <input type="number" placeholder="Min" className="w-full bg-[#131b2e] border border-white/5 rounded-xl px-5 py-4 focus:border-[#e53e3e] outline-none font-bold text-sm" />
                  <input type="number" placeholder="Max" className="w-full bg-[#131b2e] border border-white/5 rounded-xl px-5 py-4 focus:border-[#e53e3e] outline-none font-bold text-sm" />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#8892a4]">Full Description</label>
                <textarea rows={4} placeholder="Describe the event, audience, tone, and requirements..." className="w-full bg-[#131b2e] border border-white/5 rounded-2xl px-5 py-4 focus:border-[#e53e3e] outline-none resize-none font-medium text-sm"></textarea>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#8892a4]">Experience Level Required</label>
                <div className="flex flex-wrap gap-2">
                  {['Beginner', 'Intermediate', 'Professional', 'Headliner'].map(level => (
                    <button key={level} className="px-4 py-2 rounded-full border border-white/5 bg-[#131b2e] text-[10px] font-black uppercase tracking-widest hover:border-[#e53e3e] transition-all">
                      {level}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#8892a4]">Performance Style</label>
                <div className="flex flex-wrap gap-2">
                  {['Standup', 'Improv', 'Clean', 'After Dinner', 'Storytelling', 'Sketch'].map(style => (
                    <button key={style} className="px-4 py-2 rounded-full border border-white/5 bg-[#131b2e] text-[10px] font-black uppercase tracking-widest hover:border-[#e53e3e] transition-all">
                      {style}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#8892a4]">Set Length Required</label>
                <select className="w-full bg-[#131b2e] border border-white/5 rounded-xl px-5 py-4 outline-none font-bold text-sm">
                  <option>10 min</option>
                  <option>20 min</option>
                  <option>30 min</option>
                  <option>45 min</option>
                  <option>60 min</option>
                  <option>Flexible</option>
                </select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
               <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#f6a623]">Review & Publish</h3>
               <div className="glass-card p-6 rounded-2xl border-white/10 bg-[#0f1628]">
                  <div className="text-[10px] font-black uppercase tracking-widest text-[#e53e3e] mb-2 italic">DRAFT PREVIEW</div>
                  <h4 className="text-xl font-black italic uppercase mb-2">After Dinner Speaker - Tech Gala</h4>
                  <p className="text-xs font-bold text-[#8892a4] mb-4">Corporate Event • London, UK • Dec 15</p>
                  <div className="flex items-center gap-2 text-[#48bb78] font-black italic tracking-widest text-sm">
                    <DollarSign className="w-4 h-4" /> $2,000 - $3,000
                  </div>
               </div>
               <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex gap-3">
                 <Info className="w-5 h-5 text-blue-500 shrink-0" />
                 <p className="text-[10px] text-blue-400 leading-relaxed font-bold uppercase tracking-wider">
                   League of Comedy charges a 10% booking fee on confirmed bookings. No upfront cost to post.
                 </p>
               </div>
            </div>
          )}
        </div>

        <div className="mt-10 pt-8 border-t border-white/5 flex items-center justify-between">
          <button 
            onClick={() => step > 1 ? setStep(step - 1) : setMode('CHOICE')}
            className="text-xs font-black uppercase tracking-widest text-[#8892a4] hover:text-white transition-colors italic"
          >
            Back
          </button>
          
          <div className="flex gap-4">
             {step === 3 && (
               <button className="text-xs font-black uppercase tracking-widest text-[#8892a4] hover:text-white transition-colors italic mr-4 underline underline-offset-4">
                 Save as Draft
               </button>
             )}
             <button 
              onClick={() => step < 3 ? setStep(step + 1) : onClose()}
              className="bg-brand-gradient text-white px-8 py-4 rounded-xl text-xs font-black uppercase italic tracking-widest shadow-xl active:scale-95 transition-all"
             >
              {step === 3 ? 'Publish Gig' : 'Continue →'}
             </button>
          </div>
        </div>
      </div>
    );
  };

  const renderShowForm = () => {
    return (
      <div className="animate-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-3 mb-8">
           <Mic2 className="w-6 h-6 text-[#f6a623]" />
           <h2 className="text-2xl font-black italic uppercase tracking-tighter">POST A SHOW</h2>
        </div>
        <div className="space-y-6">
           <div className="border-2 border-dashed border-white/5 rounded-2xl p-12 flex flex-col items-center justify-center gap-4 bg-[#131b2e]/50 hover:bg-[#131b2e] transition-all cursor-pointer group">
              <div className="p-4 bg-[#0a0e1a] rounded-full group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6 text-[#8892a4] group-hover:text-[#f6a623]" />
              </div>
              <p className="font-bold text-sm text-[#8892a4]">Upload show poster (min 800x1000)</p>
           </div>
           <div className="space-y-1">
             <label className="text-[10px] font-black uppercase tracking-widest text-[#8892a4]">Show Title *</label>
             <input type="text" placeholder="e.g. London Comedy Roast" className="w-full bg-[#131b2e] border border-white/5 rounded-xl px-5 py-4 focus:border-[#f6a623] outline-none font-bold text-sm" />
           </div>
           <button 
            onClick={onClose}
            className="w-full bg-brand-gradient text-white py-5 rounded-2xl text-xs font-black uppercase italic tracking-widest shadow-xl active:scale-95 transition-all mt-6"
           >
            Continue to Ticketing →
           </button>
           <button 
            onClick={() => setMode('CHOICE')}
            className="w-full py-4 text-xs font-black uppercase tracking-widest text-[#8892a4] hover:text-white transition-colors italic"
           >
            Cancel
           </button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0f1628] rounded-[2.5rem] p-10 border border-white/10 shadow-2xl my-8">
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 p-2 text-[#8892a4] hover:text-white transition-colors hover:bg-white/5 rounded-full"
        >
          <X className="w-6 h-6" />
        </button>

        {mode === 'CHOICE' && renderChoice()}
        {mode === 'GIG' && renderGigForm()}
        {mode === 'SHOW' && renderShowForm()}
      </div>
    </div>
  );
};
