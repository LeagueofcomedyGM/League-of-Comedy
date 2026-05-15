
import React from 'react';
import { motion } from 'motion/react';
import { QrCode, Smartphone, Gift, Users, CheckCircle2 } from 'lucide-react';

export const DigitalEngagement: React.FC = () => {
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
        <section className="grid lg:grid-cols-2 gap-16 items-center mb-32">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="space-y-8"
          >
            <motion.div variants={itemVariants}>
              <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none mb-6">
                DIGITAL <br />
                <span className="text-amber-500">ENGAGEMENT</span>
              </h1>
              <p className="text-slate-400 text-lg italic max-w-lg">
                Sells the onsite fan experience using web-based tools instead of a native app. No downloads required.
              </p>
            </motion.div>

            <div className="space-y-10">
              <motion.div variants={itemVariants} className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-amber-500">
                  <QrCode className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase italic mb-2">FAN SCANS</h3>
                  <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                    QR codes placed throughout the venue for scan-to-win activations and digital scavenger hunts.
                  </p>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-amber-500">
                  <Gift className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase italic mb-2">INSTANT REWARDS</h3>
                  <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                    Keep attendees entertained between sets with interactive surveys and instant digital prizes.
                  </p>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-amber-500">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase italic mb-2">DATA CAPTURE</h3>
                  <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                    Collect valuable behavioral data and fan preferences in real-time without interrupting the show.
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative flex justify-center"
          >
            <div className="w-64 h-[500px] bg-slate-900 rounded-[3rem] border-8 border-slate-800 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl"></div>
              <div className="p-6 pt-12 text-center">
                <div className="w-20 h-20 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-500 mx-auto mb-6">
                  <QrCode className="w-10 h-10" />
                </div>
                <h4 className="text-lg font-black italic uppercase mb-2">SCAN TO WIN</h4>
                <p className="text-xs text-slate-500 mb-8">Scan the code on your table to enter the raffle!</p>
                <div className="space-y-4">
                  <div className="h-10 bg-slate-800 rounded-xl"></div>
                  <div className="h-10 bg-slate-800 rounded-xl"></div>
                  <div className="h-10 bg-amber-500 rounded-xl"></div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="text-center">
          <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-16">
            WHY <span className="text-amber-500">WEB-BASED?</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Smartphone, title: "NO DOWNLOADS", desc: "Fans are 10x more likely to engage when they don't have to install an app." },
              { icon: Users, title: "REAL-TIME DATA", desc: "Watch engagement metrics live as the show progresses." },
              { icon: CheckCircle2, title: "UNIVERSAL", desc: "Works on every modern smartphone with a camera and browser." }
            ].map((item, i) => (
              <div key={i} className="glass-card p-10 rounded-[2.5rem] border-white/5">
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
