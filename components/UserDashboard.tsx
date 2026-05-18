
import React, { useState } from 'react';
import { UserRole } from '../types';
import { 
  Trophy, 
  Ticket, 
  Settings, 
  Bell, 
  History, 
  QrCode, 
  CreditCard, 
  MessageSquare,
  Star,
  Zap,
  LayoutDashboard,
  Calendar,
  Briefcase,
  Users,
  PieChart,
  MapPin,
  Clock
} from 'lucide-react';

interface UserDashboardProps {
  role: UserRole;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ role }) => {
  const [activeTab, setActiveTab] = useState('home');

  const stats = {
    fan: [
      { label: 'Attended', val: '24', icon: <Ticket className="text-red-500" /> },
      { label: 'LAF Points', val: '1,240', icon: <Trophy className="text-amber-500" /> },
      { label: 'Tokens', val: '45', icon: <Star className="text-blue-500" /> },
      { label: 'Rank', val: '#12', icon: <Zap className="text-purple-500" /> },
    ],
    comedian: [
      { label: 'Followers', val: '5.2k', icon: <Users className="text-red-500" /> },
      { label: 'Upcoming', val: '8', icon: <Calendar className="text-amber-500" /> },
      { label: 'Points', val: '9,850', icon: <Trophy className="text-blue-500" /> },
      { label: 'Earnings', val: '$1.4k', icon: <CreditCard className="text-emerald-500" /> },
    ],
    organizer: [
      { label: 'Shows', val: '12', icon: <Calendar className="text-red-500" /> },
      { label: 'Tickets Sold', val: '1.2k', icon: <Ticket className="text-amber-500" /> },
      { label: 'Revenue', val: '$15k', icon: <CreditCard className="text-emerald-500" /> },
      { label: 'Followers', val: '850', icon: <Users className="text-blue-500" /> },
    ]
  };

  const renderHome = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Banner */}
      <div className="glass-card p-8 rounded-[2.5rem] border-slate-800 bg-gradient-to-br from-red-600/10 to-transparent relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-red-600/10 blur-[100px] rounded-full"></div>
        <div className="relative z-10">
          <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-2">Welcome Back, <span className="text-amber-500">Julius</span></h2>
          <p className="text-slate-400 font-medium max-w-lg">You have 2 upcoming shows this week. Your performance at "The Store" earned you 50 bonus LAF points!</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats[role as keyof typeof stats].map((s, i) => (
          <div key={i} className="glass-card p-6 rounded-3xl border-slate-800/50 hover:bg-slate-900/50 transition-all group">
            <div className="flex justify-between items-start mb-4">
               <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 group-hover:scale-110 transition-transform">{s.icon}</div>
               <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">+12%</span>
            </div>
            <div className="text-3xl font-black italic">{s.val}</div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 glass-card p-8 rounded-[2.5rem] border-slate-800">
           <div className="flex items-center justify-between mb-8">
             <h3 className="text-xl font-black italic uppercase">Recent Activity</h3>
             <button className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">View All</button>
           </div>
           <div className="space-y-6">
             {[
               { title: "Checked in @ The Store", desc: "Verified attendance via QR code", pts: "+50 LAF", time: "Yesterday" },
               { title: "Applied to Opportunity", desc: "10-Min Spot @ Chuckles", pts: "Pending", time: "2 days ago" },
               { title: "New Follower", desc: "Sarah Miller started following you", pts: "+10 LAF", time: "3 days ago" },
             ].map((act, i) => (
               <div key={i} className="flex items-center gap-4 group">
                 <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800 group-hover:border-amber-500/50 transition-all">
                   <Clock className="w-4 h-4 text-slate-500" />
                 </div>
                 <div className="flex-grow">
                   <h4 className="text-sm font-bold">{act.title}</h4>
                   <p className="text-[10px] text-slate-500 uppercase tracking-widest">{act.desc} • {act.time}</p>
                 </div>
                 <div className="text-xs font-black italic text-amber-500">{act.pts}</div>
               </div>
             ))}
           </div>
        </div>

        {/* QR Scanner Showcase */}
        <div className="glass-card p-8 rounded-[2.5rem] border-slate-800 text-center flex flex-col items-center justify-center gap-6 bg-slate-900/30">
           <div className="w-full aspect-square max-w-[200px] border-2 border-dashed border-red-500/30 rounded-3xl p-6 relative group cursor-pointer hover:bg-slate-900 transition-all">
             <div className="absolute inset-0 bg-red-600/5 group-hover:bg-red-600/10 transition-all rounded-[1.4rem]"></div>
             <QrCode className="w-full h-full text-white opacity-40 group-hover:opacity-100 transition-all" />
             <div className="absolute top-1/2 left-0 w-full h-0.5 bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.8)] animate-scan"></div>
           </div>
           <div>
             <h4 className="text-lg font-black italic uppercase">QR Check-In</h4>
             <p className="text-xs text-slate-500 mt-2 font-medium">Scan show QR code to earn verified points and rewards.</p>
           </div>
           <button className="w-full bg-slate-950 border border-slate-800 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-slate-600 transition-all">Open Scanner</button>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="glass-card p-8 rounded-[2.5rem] border-slate-800">
        <h3 className="text-2xl font-black italic uppercase mb-8">Newsletter Preferences</h3>
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-6 p-4 rounded-2xl hover:bg-slate-900 transition-all border border-transparent hover:border-slate-800">
             <div>
               <h4 className="font-bold uppercase text-sm mb-1">City-Specific Editions</h4>
               <p className="text-xs text-slate-500">Get local gigs and trending shows in your city.</p>
             </div>
             <select className="bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-xs font-bold outline-none focus:border-red-500">
               <option>London</option>
               <option>New York</option>
               <option>Austin</option>
             </select>
          </div>
          <div className="flex items-center justify-between gap-6 p-4 rounded-2xl hover:bg-slate-900 transition-all border border-transparent hover:border-slate-800">
             <div>
               <h4 className="font-bold uppercase text-sm mb-1">Frequency</h4>
               <p className="text-xs text-slate-500">Choose how often you want to hear from us.</p>
             </div>
             <select className="bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-xs font-bold outline-none focus:border-red-500">
               <option>Weekly (Enthusiast)</option>
               <option>Bi-Weekly (Regular)</option>
               <option>Monthly (Occasional)</option>
               <option>Event-Based Only</option>
             </select>
          </div>
        </div>
        <button className="mt-8 bg-red-600 text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest italic hover:bg-red-700 transition-all">Save Preferences</button>
      </div>

      <div className="glass-card p-8 rounded-[2.5rem] border-slate-800">
         <h3 className="text-2xl font-black italic uppercase mb-8">LAF Points & Rewards</h3>
         <div className="p-6 bg-slate-950 border border-slate-800 rounded-3xl mb-6">
           <div className="flex justify-between items-center mb-4">
             <span className="text-xs font-black uppercase tracking-widest text-slate-500">Current Balance</span>
             <span className="text-xs font-black uppercase tracking-widest text-amber-500">Verified Member</span>
           </div>
           <div className="flex items-end gap-3 mb-6">
             <div className="text-6xl font-black italic tracking-tighter">1,240</div>
             <div className="text-sm font-black italic text-amber-500 mb-2">LAF</div>
           </div>
           <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
             <div className="h-full bg-gradient-to-r from-red-600 to-amber-500 w-[65%] rounded-full shadow-[0_0_15px_rgba(245,158,11,0.3)]"></div>
           </div>
           <p className="text-[10px] text-slate-500 mt-3 font-bold uppercase tracking-widest">760 pts to next achievement: "Gig Scout"</p>
         </div>
         <button className="w-full py-5 rounded-2xl bg-amber-500 text-slate-950 text-xs font-black uppercase tracking-[0.2em] italic hover:bg-amber-600 transition-all shadow-2xl shadow-amber-500/10">Redeem for VIP Upgrades</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-4 lg:pt-12 pb-24 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col lg:grid lg:grid-cols-[280px_1fr] gap-8 lg:gap-12">
        {/* Mobile Profile Header */}
        <div className="lg:hidden">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-24 h-24 rounded-full border-4 border-amber-500/20 overflow-hidden mb-4 shadow-2xl">
              <img src="https://i.pravatar.cc/300?u=julius" className="w-full h-full object-cover" />
            </div>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Julius Carr</h2>
            <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-4">Professional Headliner</p>
            
            <div className="flex gap-8 mb-6">
              <div className="text-center">
                <p className="text-lg font-black text-white">350</p>
                <p className="text-[8px] font-black text-[#8892a4] uppercase tracking-widest">Following</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-black text-white">5.2k</p>
                <p className="text-[8px] font-black text-[#8892a4] uppercase tracking-widest">Followers</p>
              </div>
            </div>

            <button className="w-full max-w-[200px] py-3 border border-white/10 rounded-xl text-[10px] font-black uppercase italic tracking-widest hover:bg-white/5 transition-all">Edit Profile</button>
          </div>

          <div className="mb-8">
            <h3 className="text-xs font-black uppercase tracking-widest text-white mb-2">About Me</h3>
            <p className="text-[11px] text-[#8892a4] leading-relaxed font-medium">
              Enjoy your favorite dish and a lovely your friends and family and have a great time. Food from local food trucks will be available for purchase. <span className="text-amber-500">Read More...</span>
            </p>
          </div>

          <div className="mb-10">
            <h3 className="text-xs font-black uppercase tracking-widest text-white mb-3">Interests</h3>
            <div className="flex flex-wrap gap-2">
              {['Games Online', 'Concert', 'Music', 'Art', 'Movie', 'Others'].map(tag => (
                <span key={tag} className="px-3 py-1 bg-[#131b2e] border border-white/5 rounded-full text-[8px] font-black uppercase text-[#8892a4]">{tag}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Nav - Hidden on mobile, replaced by MobileBottomNav in App.tsx */}
        <aside className="hidden lg:block space-y-4">
           <div className="glass-card p-4 sm:p-6 rounded-[2rem] border-slate-800">
             <div className="flex items-center gap-4 mb-6 sm:mb-8 p-2">
               <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-800 border-2 border-red-600 flex items-center justify-center font-black text-lg sm:text-xl">J</div>
               <div>
                 <h4 className="font-bold uppercase italic text-xs sm:text-sm">Julius Carr</h4>
                 <p className="text-[9px] sm:text-[10px] font-black text-amber-500 uppercase tracking-widest">PRO MEMBER</p>
               </div>
             </div>

             <nav className="flex lg:flex-col gap-1 overflow-x-auto no-scrollbar pb-2 lg:pb-0">
               {[
                 { id: 'home', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
                 { id: 'gigs', label: 'My Bookings', icon: <Briefcase className="w-4 h-4" /> },
                 { id: 'tickets', label: 'My Tickets', icon: <Ticket className="w-4 h-4" /> },
                 { id: 'analytics', label: 'Insights', icon: <PieChart className="w-4 h-4" /> },
                 { id: 'messages', label: 'Messages', icon: <MessageSquare className="w-4 h-4" /> },
                 { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
               ].map((item) => (
                 <button 
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest italic transition-all whitespace-nowrap lg:w-full ${activeTab === item.id ? 'bg-red-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-900 hover:text-slate-300'}`}
                 >
                   {item.icon} <span className="hidden sm:inline lg:inline">{item.label}</span>
                 </button>
               ))}
             </nav>
           </div>

           <div className="glass-card p-4 rounded-[2rem] border-slate-800 text-center">
             <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 italic">Account Type</p>
             <div className="inline-block px-4 py-1.5 bg-brand-gradient rounded-full text-white text-[10px] font-black uppercase italic tracking-widest">
               {role === 'comedian' ? 'Comedian' : role === 'organizer' ? 'Organizer' : 'Fan'}
             </div>
           </div>
        </aside>

        {/* Main Dashboard Content */}
        <div className="min-w-0">
          {activeTab === 'home' && renderHome()}
          {activeTab === 'settings' && renderSettings()}
          {activeTab !== 'home' && activeTab !== 'settings' && (
            <div className="glass-card p-20 rounded-[2.5rem] border-slate-800 text-center text-slate-500 flex flex-col items-center justify-center italic font-bold opacity-50 uppercase tracking-[0.2em] text-xs">
              <Zap className="w-12 h-12 mb-4 animate-pulse" />
              Feature Incoming
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
