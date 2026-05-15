
import React from 'react';
import { Send, Mail, MapPin, Phone, MessageSquare, Twitter, Facebook, Instagram } from 'lucide-react';

export const ContactPage: React.FC = () => {
  return (
    <div className="pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl lg:text-7xl font-black mb-6 italic tracking-tighter uppercase">GET IN <span className="text-red-600">TOUCH</span></h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">Have questions? Need support? Want to partner with us? We'd love to hear from you.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Form */}
          <div className="glass-card p-10 rounded-[2.5rem] border-slate-800">
            <h2 className="text-3xl font-black italic mb-8 uppercase tracking-tight">Send us a Message</h2>
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Full Name *</label>
                <input type="text" placeholder="Your name" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-6 py-4 outline-none focus:border-red-500 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Email Address *</label>
                <input type="email" placeholder="your@email.com" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-6 py-4 outline-none focus:border-red-500 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Enquiry Type</label>
                <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-6 py-4 outline-none focus:border-red-500 transition-all appearance-none">
                  <option>General Enquiry</option>
                  <option>Booking Help</option>
                  <option>Comedian Support</option>
                  <option>Press & Media</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Message *</label>
                <textarea rows={4} placeholder="Tell us more..." className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 outline-none focus:border-red-500 transition-all resize-none"></textarea>
              </div>
              <button className="w-full bg-red-600 hover:bg-red-700 text-white py-5 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-2xl shadow-red-900/20 active:scale-95">
                SEND MESSAGE <Send className="w-5 h-5" />
              </button>
            </form>
          </div>

          {/* Info Side */}
          <div className="space-y-12">
            <div className="glass-card p-10 rounded-[2.5rem] border-slate-800">
              <h2 className="text-3xl font-black italic mb-6 uppercase tracking-tight">Press & Media</h2>
              <p className="text-slate-400 mb-8 leading-relaxed">
                League of Comedy is the leading platform connecting comedians with performance opportunities worldwide. We're transforming how talent is discovered.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4 group cursor-pointer">
                  <div className="p-3 bg-slate-900 rounded-xl group-hover:bg-red-600 transition-all">
                    <Mail className="w-5 h-5 text-red-500 group-hover:text-white" />
                  </div>
                  <span className="text-slate-300 font-bold group-hover:text-red-500 transition-colors">press@leagueofcomedy.com</span>
                </div>
                <div className="flex items-center gap-4 group cursor-pointer">
                  <div className="p-3 bg-slate-900 rounded-xl group-hover:bg-red-600 transition-all">
                    <MessageSquare className="w-5 h-5 text-red-500 group-hover:text-white" />
                  </div>
                  <span className="text-slate-300 font-bold group-hover:text-red-500 transition-colors">Live Chat Support</span>
                </div>
              </div>
            </div>

            <div className="glass-card p-10 rounded-[2.5rem] border-slate-800">
               <h2 className="text-3xl font-black italic mb-6 uppercase tracking-tight">Connect</h2>
               <div className="flex gap-4">
                  {[Twitter, Facebook, Instagram].map((Icon, idx) => (
                    <button key={idx} className="p-4 bg-slate-900 rounded-2xl text-slate-400 hover:text-white hover:bg-red-600 transition-all group">
                      <Icon className="w-6 h-6" />
                    </button>
                  ))}
               </div>
               <div className="mt-8 pt-8 border-t border-slate-800 text-slate-500 text-xs">
                 <p className="mb-2 uppercase font-black tracking-widest">Global HQ</p>
                 <p>123 Laugh Lane, Comedy District, London, UK</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
