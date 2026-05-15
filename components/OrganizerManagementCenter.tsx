
import React from 'react';
import { motion } from 'motion/react';
import { Database, RefreshCw, BarChart3, FileText, CheckCircle2 } from 'lucide-react';

export const OrganizerManagementCenter: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="pt-32 pb-24 px-4 bg-[#0a0e1a] min-h-screen text-white overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="text-center mb-24"
        >
          <motion.h1 variants={itemVariants} className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter leading-none mb-6">
            ORGANIZER <span className="text-amber-500">MANAGEMENT CENTER</span>
          </motion.h1>
          <motion.p variants={itemVariants} className="text-slate-400 text-xl italic max-w-2xl mx-auto">
            Manage your events and tracking in one place.
          </motion.p>
        </motion.div>

        <section className="grid lg:grid-cols-2 gap-16 items-center mb-32">
          <div className="space-y-8">
            <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter">
              EVENT <span className="text-amber-500">MANAGEMENT</span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              Update your League of Comedy profile, and our platform instantly syncs those changes to the enterprise ShowClix platform. No manual data entry, no errors.
            </p>
            <div className="space-y-6">
              {[
                "Instant synchronization across platforms",
                "Unified talent management",
                "Automated event creation",
                "Real-time ticket inventory sync"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 text-slate-300">
                  <RefreshCw className="w-6 h-6 text-amber-500 flex-shrink-0" />
                  <span className="font-bold italic uppercase tracking-wide">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-card p-12 rounded-[3rem] border-white/5 bg-gradient-to-br from-white/5 to-transparent relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Database className="w-48 h-48" />
            </div>
            <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center text-slate-950">
                  <Database className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black uppercase italic">EVENT TRACKING</h3>
              </div>
              <div className="p-6 bg-slate-900/80 rounded-2xl border border-white/10 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 uppercase tracking-wider">Status</span>
                  <span className="text-amber-500 font-bold">SYNCED</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 uppercase tracking-wider">Last Update</span>
                  <span className="text-slate-300">Just now</span>
                </div>
                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full w-full bg-amber-500"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">
              HOLISTIC <span className="text-amber-500">INSIGHTS</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: BarChart3, title: "TICKET TRENDS", desc: "Monitor purchase patterns and arrival times in real-time." },
              { icon: FileText, title: "AUTO-REPORTS", desc: "Automated financial reports delivered directly to your inbox." },
              { icon: CheckCircle2, title: "VERIFIED DATA", desc: "Clean, actionable data from every touchpoint of your show." }
            ].map((item, i) => (
              <div key={i} className="glass-card p-10 rounded-[2.5rem] border-white/5 text-center">
                <item.icon className="w-12 h-12 text-amber-500 mx-auto mb-6" />
                <h3 className="text-xl font-black uppercase italic mb-4">{item.title}</h3>
                <p className="text-slate-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
