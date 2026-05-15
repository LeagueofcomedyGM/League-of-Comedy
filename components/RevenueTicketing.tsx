
import React from 'react';
import { motion } from 'motion/react';
import { Ticket, CreditCard, ShieldCheck, ShoppingBag, CheckCircle2 } from 'lucide-react';

export const RevenueTicketing: React.FC = () => {
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
            REVENUE & <span className="text-amber-500">TICKETING</span>
          </motion.h1>
          <motion.p variants={itemVariants} className="text-slate-400 text-xl italic max-w-2xl mx-auto">
            The "no-joke" ticketing platform and merchant services Designed specifically for comedy organizers.
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-32">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-10 rounded-[2.5rem] border-white/5 hover:border-amber-500/30 transition-all group"
          >
            <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 mb-8 group-hover:scale-110 transition-transform">
              <Ticket className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black uppercase italic mb-4">BRANDED LISTINGS</h3>
            <p className="text-slate-400 leading-relaxed">
              Custom event pages that reflect your brand, not ours. Professional, clean, and optimized for conversions.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="glass-card p-10 rounded-[2.5rem] border-white/5 hover:border-amber-500/30 transition-all group"
          >
            <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 mb-8 group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black uppercase italic mb-4">UPSELL ENGINE</h3>
            <p className="text-slate-400 leading-relaxed">
              Increase your average order value by upselling merchandise, parking, or VIP upgrades during the checkout flow.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="glass-card p-10 rounded-[2.5rem] border-white/5 hover:border-amber-500/30 transition-all group"
          >
            <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 mb-8 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black uppercase italic mb-4">SECURE PAYMENTS</h3>
            <p className="text-slate-400 leading-relaxed">
              Powered by Stripe. PCI compliance, professional chargeback management, and instant payouts.
            </p>
          </motion.div>
        </div>

        <section className="glass-card p-12 md:p-20 rounded-[3rem] border-white/5 bg-gradient-to-br from-white/5 to-transparent">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-8">
                PROFESSIONAL <br />
                <span className="text-amber-500">MERCHANT SERVICES</span>
              </h2>
              <div className="space-y-6">
                {[
                  "Custom talent profiles for comedians",
                  "Automated financial reporting",
                  "Chargeback protection & management",
                  "Global payment support via Stripe",
                  "Mobile-first checkout experience"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 text-slate-300">
                    <CheckCircle2 className="w-6 h-6 text-amber-500 flex-shrink-0" />
                    <span className="font-bold italic uppercase tracking-wide">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-video rounded-3xl overflow-hidden bg-slate-900 border border-white/10 flex items-center justify-center">
                <CreditCard className="w-32 h-32 text-slate-800" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
