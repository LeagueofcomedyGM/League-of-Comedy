
import React from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { PageType } from '../types';
import { Menu, X, LogOut } from 'lucide-react';

interface NavbarProps {
  currentPage: PageType;
  navigateTo: (page: PageType, tab?: string) => void;
  onOpenAuth: (mode: 'signin' | 'signup') => void;
  onLogout: () => void;
  authUser: FirebaseUser | null;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  navigateTo,
  onOpenAuth,
  onLogout,

  authUser,
  isOpen,
  setIsOpen,
}) => {
  const navItems = [
    { label: 'HOMEBASE', page: PageType.HOME },
    { label: 'SCENES', page: PageType.SCENES },
    { label: 'GIGS BOARD', page: PageType.OPPORTUNITIES },
    { label: 'LEADERBOARDS', page: PageType.LEADERBOARDS },
  ];

  const userInitial = authUser
    ? (authUser.displayName?.[0] ?? authUser.email?.[0] ?? '?').toUpperCase()
    : null;

  return (
    <nav className="sticky top-0 z-50 bg-[#0a0e1a]/95 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <div className="flex items-center gap-4">
            <div
              className="flex items-center gap-2 cursor-pointer group shrink-0"
              onClick={() => navigateTo(PageType.HOME)}
            >
              <img
                src="https://leagueofcomedy.com/wp-content/uploads/2024/09/League-of-Comedy-Logo_Classic-2.png"
                alt="League of Comedy"
                className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="hidden sm:flex lg:hidden items-center gap-1 text-[#8892a4] text-[10px] font-black uppercase tracking-widest">
              <Menu className="w-3 h-3 text-amber-500" />
              <span>London, UK</span>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.page}
                onClick={() => navigateTo(item.page)}
                className={`text-xs font-bold uppercase tracking-widest transition-all hover:underline underline-offset-8 decoration-white/20 ${
                  currentPage === item.page ? 'text-brand-gradient' : 'text-[#8892a4] hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Action Area */}
          <div className="flex items-center gap-2 sm:gap-3">

            {authUser ? (
              /* Signed-in state */
              <>
                {/* User avatar — clickable to go to dashboard */}
                <button
                  onClick={() => navigateTo(PageType.DASHBOARD)}
                  className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#0f1628] rounded-lg border border-white/5 hover:border-white/20 transition-all"
                >
                  {authUser.photoURL ? (
                    <img
                      src={authUser.photoURL}
                      alt="avatar"
                      className="w-6 h-6 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-brand-gradient flex items-center justify-center text-white text-[10px] font-black">
                      {userInitial}
                    </div>
                  )}
                  <span className="text-white text-[11px] font-bold max-w-[100px] truncate">
                    {authUser.displayName ?? authUser.email}
                  </span>
                </button>

                <button
                  onClick={onLogout}
                  title="Sign out"
                  className="hidden md:flex text-[#8892a4] hover:text-red-400 transition-colors p-2 bg-[#0f1628] rounded-lg border border-white/5"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              /* Signed-out state */
              <>
                <button
                  onClick={() => onOpenAuth('signin')}
                  className="hidden md:flex text-[#8892a4] hover:text-white transition-colors px-4 py-2 rounded-lg border border-white/10 text-xs font-black uppercase italic tracking-wider"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuth('signup')}
                  className="hidden md:flex bg-[#0f1628] hover:bg-[#131b2e] text-white transition-colors px-4 py-2 rounded-lg border border-white/10 text-xs font-black uppercase italic tracking-wider"
                >
                  Sign Up
                </button>
              </>
            )}

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-[#8892a4] p-1.5 sm:p-2 bg-[#131b2e] rounded-lg border border-white/5"
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="lg:hidden glass-card bg-[#0a0e1a] border-t border-white/5 animate-in slide-in-from-top duration-300">
          <div className="px-4 pt-4 pb-6 space-y-4">
            {navItems.map((item) => (
              <button
                key={item.page}
                onClick={() => { navigateTo(item.page); setIsOpen(false); }}
                className={`block w-full text-left py-2 text-sm font-bold uppercase tracking-widest ${
                  currentPage === item.page ? 'text-brand-gradient' : 'text-[#8892a4]'
                }`}
              >
                {item.label}
              </button>
            ))}

            <div className="pt-4 border-t border-white/5 space-y-3">
              {authUser ? (
                <>
                  <button
                    onClick={() => { navigateTo(PageType.DASHBOARD); setIsOpen(false); }}
                    className="w-full text-center bg-[#131b2e] text-white py-3 rounded-xl font-bold uppercase text-xs italic tracking-wider"
                  >
                    DASHBOARD
                  </button>
                  <button
                    onClick={() => { setIsOpen(false); onLogout(); }}
                    className="w-full flex items-center justify-center gap-2 text-red-400 py-3 rounded-xl font-bold uppercase text-xs italic tracking-wider border border-red-500/20 hover:bg-red-500/10 transition-all"
                  >
                    <LogOut className="w-4 h-4" /> SIGN OUT
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { onOpenAuth('signin'); setIsOpen(false); }}
                    className="w-full text-center bg-[#131b2e] text-white py-3 rounded-xl font-bold uppercase text-xs italic tracking-wider border border-white/10"
                  >
                    SIGN IN
                  </button>
                  <button
                    onClick={() => { onOpenAuth('signup'); setIsOpen(false); }}
                    className="w-full text-center bg-brand-gradient text-white py-3 rounded-xl font-black uppercase text-xs italic tracking-wider shadow-lg"
                  >
                    SIGN UP
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
