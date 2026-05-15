
import React, { useState } from 'react';
import { X, Upload, Calendar, Clock, MapPin, Ticket, Info, ChevronRight, Check } from 'lucide-react';

interface ListEventFormProps {
  onClose: () => void;
}

export const ListEventForm: React.FC<ListEventFormProps> = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const nextStep = () => setStep(prev => Math.min(prev + 1, totalSteps));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 my-8 overflow-hidden">
        {/* Header */}
        <div className="p-8 bg-gradient-to-br from-red-600/20 to-slate-900 relative">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white transition-colors hover:bg-slate-800 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-600 rounded-lg shadow-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-black italic tracking-tight">LIST YOUR EVENT</h2>
          </div>
          <p className="text-slate-400 max-w-md">Share your event with thousands of comedy fans and performers worldwide.</p>
          
          {/* Progress bar */}
          <div className="mt-8 flex gap-2">
            {[1, 2, 3, 4].map(s => (
              <div 
                key={s} 
                className={`h-1.5 flex-grow rounded-full transition-all duration-500 ${s <= step ? 'bg-red-500' : 'bg-slate-800'}`}
              />
            ))}
          </div>
        </div>

        {/* Form Body */}
        <div className="p-8 max-h-[70vh] overflow-y-auto space-y-8">
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-sm font-black border border-slate-700">1</span>
                Basic Information
              </h3>
              
              <div className="space-y-6">
                <div className="border-2 border-dashed border-slate-700 rounded-2xl p-10 flex flex-col items-center justify-center gap-4 bg-slate-950/50 hover:bg-slate-950 hover:border-red-500/50 transition-all cursor-pointer group">
                  <div className="p-4 bg-slate-900 rounded-full group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8 text-slate-400 group-hover:text-red-500" />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-slate-300">Click to upload or drag & drop</p>
                    <p className="text-xs text-slate-500 mt-1">JPEG, PNG, WebP or GIF (max 5MB)</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Event Name *</label>
                    <input type="text" placeholder="e.g. Comedy Central Roast" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 focus:border-red-500 outline-none transition-all" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Showcase Type</label>
                    <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 focus:border-red-500 outline-none transition-all appearance-none">
                      <option>Showcase</option>
                      <option>Open Mic</option>
                      <option>Headliner</option>
                      <option>Festival</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Ticket Price</label>
                      <input type="text" placeholder="Free / $10" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 focus:border-red-500 outline-none transition-all" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Ticket Link</label>
                      <input type="text" placeholder="https://..." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 focus:border-red-500 outline-none transition-all" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-sm font-black border border-slate-700">2</span>
                Venue & Location
              </h3>
              <div className="space-y-4">
                <input type="text" placeholder="Venue Name *" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 focus:border-red-500 outline-none" />
                <input type="text" placeholder="Street Address *" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 focus:border-red-500 outline-none" />
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="Town / City *" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 focus:border-red-500 outline-none" />
                  <input type="text" placeholder="Postcode *" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 focus:border-red-500 outline-none" />
                </div>
                <input type="text" placeholder="Venue Capacity (optional)" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 focus:border-red-500 outline-none" />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-sm font-black border border-slate-700">3</span>
                Date & Time
              </h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button className="p-4 rounded-2xl bg-slate-950 border-2 border-red-500 flex flex-col items-center gap-2 group transition-all">
                  <Calendar className="w-6 h-6 text-red-500" />
                  <span className="text-sm font-bold">One-Off Event</span>
                </button>
                <button className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center gap-2 hover:border-slate-700 transition-all">
                  <Calendar className="w-6 h-6 text-slate-500" />
                  <span className="text-sm font-bold text-slate-400">Multiple Dates</span>
                </button>
              </div>
              <div className="space-y-4">
                <input type="date" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 focus:border-red-500 outline-none text-slate-400" />
                <input type="time" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 focus:border-red-500 outline-none text-slate-400" />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-sm font-black border border-slate-700">4</span>
                Event Description
              </h3>
              <div className="space-y-4">
                <textarea 
                  rows={6}
                  placeholder="Describe your event, including what makes it special, what performers can expect, and any important details..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 focus:border-red-500 outline-none resize-none"
                />
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex gap-3">
                  <Info className="w-5 h-5 text-amber-500 shrink-0" />
                  <p className="text-xs text-amber-500/80 leading-relaxed">
                    Great descriptions mention the venue atmosphere, target audience, and perks for comedians (drinks, recordings, etc).
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-slate-800 bg-slate-900/50 flex justify-between gap-4">
          <button 
            onClick={prevStep}
            disabled={step === 1}
            className={`px-6 py-4 rounded-xl font-bold transition-all ${step === 1 ? 'opacity-0' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
          >
            Back
          </button>
          
          {step < totalSteps ? (
            <button 
              onClick={nextStep}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-bold transition-all flex items-center gap-2 shadow-xl shadow-red-900/20"
            >
              Continue <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button 
              onClick={() => { alert('Event submitted successfully!'); onClose(); }}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-bold transition-all flex items-center gap-2 shadow-xl shadow-green-900/20"
            >
              List Your Event <Check className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
