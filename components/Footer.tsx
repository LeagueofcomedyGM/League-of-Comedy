
import React from 'react';
import { PageType } from '../types';
import { Twitter, Facebook, Instagram, MessageCircle } from 'lucide-react';

interface FooterProps {
  navigateTo: (page: PageType, tab?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigateTo }) => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
          <div>
            <h3 className="text-white font-bold mb-4">For Fans</h3>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li><button onClick={() => navigateTo(PageType.FAN_GETTING_STARTED)} className="text-left hover:text-amber-500 transition-colors">Getting Started</button></li>
              <li><button onClick={() => navigateTo(PageType.HOME, 'SHOWS')} className="text-left hover:text-amber-500 transition-colors">Find Shows</button></li>
              <li><button onClick={() => navigateTo(PageType.HOME, 'ROSTER')} className="text-left hover:text-amber-500 transition-colors">Discover Comedians</button></li>
              <li><button onClick={() => navigateTo(PageType.HOME, 'VENUES')} className="text-left hover:text-amber-500 transition-colors">Browse Venues</button></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold mb-4">For Comedians</h3>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li><button onClick={() => navigateTo(PageType.COMEDIANS)} className="text-left hover:text-amber-500 transition-colors">Getting Started</button></li>
              <li><button className="text-left hover:text-amber-500 transition-colors">Open Mic Nights</button></li>
              <li><button onClick={() => navigateTo(PageType.HOW_TO_GET_GIGS)} className="text-left hover:text-amber-500 transition-colors">How to Get Gigs</button></li>
              <li><button className="text-left hover:text-amber-500 transition-colors">Find Organizers</button></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold mb-4">For Organizers</h3>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li><button onClick={() => navigateTo(PageType.ORGANIZER_GETTING_STARTED)} className="text-left hover:text-amber-500 transition-colors">Getting Started</button></li>
              <li><button onClick={() => navigateTo(PageType.ORGANIZER_MANAGEMENT_CENTER)} className="text-left hover:text-amber-500 transition-colors">Management Center</button></li>
              <li><button onClick={() => navigateTo(PageType.REVENUE_TICKETING)} className="text-left hover:text-amber-500 transition-colors">Revenue & Ticketing</button></li>
              <li><button onClick={() => navigateTo(PageType.CORPORATE)} className="text-left hover:text-amber-500 transition-colors">Corporate Events</button></li>
              <li><button onClick={() => navigateTo(PageType.DIGITAL_ENGAGEMENT)} className="text-left hover:text-amber-500 transition-colors">Digital Engagement</button></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold mb-4">Browse</h3>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li><button className="text-left hover:text-amber-500 transition-colors">News</button></li>
              <li><button className="text-left hover:text-amber-500 transition-colors">Comedy Venues</button></li>
              <li><button className="text-left hover:text-amber-500 transition-colors">Comedians A-Z</button></li>
              <li><button className="text-left hover:text-amber-500 transition-colors">FAQ</button></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold mb-4">Company</h3>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li><button onClick={() => navigateTo(PageType.CONTACT)} className="text-left hover:text-amber-500 transition-colors">Contact & Press</button></li>
              <li><button className="text-left hover:text-amber-500 transition-colors">Privacy Policy</button></li>
              <li><button className="text-left hover:text-amber-500 transition-colors">Terms of Service</button></li>
              <li><button className="text-left hover:text-amber-500 transition-colors">About League of Comedy</button></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-slate-500 text-sm">
            © 2026 League of Comedy. All rights reserved.
            <p className="mt-2 text-xs opacity-75 max-w-md">
              League of Comedy is the home base for comedy discovery, booking, live event management, and community connection.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 bg-slate-900 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
              <Twitter className="w-5 h-5" />
            </button>
            <button className="p-2 bg-slate-900 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
              <Facebook className="w-5 h-5" />
            </button>
            <button className="p-2 bg-slate-900 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
              <Instagram className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Floating Chat/Support Bubble */}
      <button className="fixed bottom-6 right-6 p-4 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-full shadow-2xl shadow-amber-500/20 transition-all hover:scale-110 active:scale-90 z-40">
        <MessageCircle className="w-6 h-6 fill-current" />
      </button>
    </footer>
  );
};
