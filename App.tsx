import React, { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { auth, db } from './firebase';
import { handleUserSignup, getUserProfile } from './lib/profile';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './components/Home';
import { ForComedians } from './components/ForComedians';
import { CorporatePage } from './components/CorporatePage';
import { ContactPage } from './components/ContactPage';
import { Leaderboards } from './components/Leaderboards';
import { OpportunityBoard } from './components/OpportunityBoard';
import { ScenesPage } from './components/ScenesPage';
import { HowToGetGigs } from './components/HowToGetGigs';
import { FanGettingStarted } from './components/FanGettingStarted';
import { OrganizerGettingStarted } from './components/OrganizerGettingStarted';
import { RevenueTicketing } from './components/RevenueTicketing';
import { DigitalEngagement } from './components/DigitalEngagement';
import { OrganizerManagementCenter } from './components/OrganizerManagementCenter';
import { UserDashboard } from './components/UserDashboard';
import { PostSpotModal } from './components/PostSpotModal';
import { AuthPage } from './components/AuthPage';
import { ComedianProfile } from './components/ComedianProfile';
import { OrganizerProfile } from './components/OrganizerProfile';
import { PageType, UserRole } from './types';
import { Home as HomeIcon, User, Trophy, Briefcase, MapPin, MailCheck, Loader2 } from 'lucide-react';

const MobileBottomNav: React.FC<{
  currentPage: PageType;
  navigateTo: (page: PageType) => void;
}> = ({ currentPage, navigateTo }) => {
  const items = [
    { icon: HomeIcon, label: 'Home',    page: PageType.HOME },
    { icon: MapPin,   label: 'Scenes',  page: PageType.SCENES },
    { icon: Briefcase,label: 'Gigs',    page: PageType.OPPORTUNITIES },
    { icon: Trophy,   label: 'Leaders', page: PageType.LEADERBOARDS },
    { icon: User,     label: 'Profile', page: PageType.DASHBOARD },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0f1628]/95 backdrop-blur-lg border-t border-white/5 px-6 py-3 flex justify-between items-center">
      {items.map((item) => (
        <button
          key={item.page}
          onClick={() => navigateTo(item.page)}
          className={`flex flex-col items-center gap-1 transition-all flex-1 ${
            currentPage === item.page ? 'text-amber-500 scale-110' : 'text-[#8892a4]'
          }`}
        >
          <item.icon className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-tighter">{item.label}</span>
        </button>
      ))}
    </div>
  );
};

const SCENES_SNAPSHOT_URL =
  'https://storage.googleapis.com/league-of-comedy-user-auth.firebasestorage.app/scenes-meta.json';

function App() {
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [currentPage, setCurrentPage] = useState<PageType>(PageType.HOME);
  const [initialTab, setInitialTab] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('fan');
  const [sceneFollowerCounts, setSceneFollowerCounts] = useState<Record<string, number>>({});
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [verificationState, setVerificationState] = useState<{
    email: string;
    userType: string;
  } | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && !user.emailVerified) {
        setAuthUser(null);
        setUserRole('fan');
      } else if (user) {
        setIsAuthModalOpen(false);
        try {
          const profile = await getUserProfile(user.uid);
          if (profile.found && profile.userType) {
            setUserRole(profile.userType as UserRole);
          }
        } catch { /* Firestore unavailable */ }
        setAuthUser(user); // set after role is resolved so both update together
      } else {
        setUserRole('fan');
        setAuthUser(null);
      }
    });
    return unsubscribe;
  }, []);

  // Poll for email verification after signup
  useEffect(() => {
    if (!verificationState) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const { userType } = verificationState;

    intervalRef.current = setInterval(async () => {
      const user = auth.currentUser;
      if (!user) {
        clearInterval(intervalRef.current!);
        setVerificationState(null);
        return;
      }
      try {
        await user.reload();
        if (auth.currentUser?.emailVerified) {
          clearInterval(intervalRef.current!);
          setAuthUser(auth.currentUser);
          try {
            await handleUserSignup(user.uid, user.email ?? '', userType);
          } catch {
            // Firestore unavailable — continue anyway
          }
          setUserRole(userType as UserRole);
          sessionStorage.removeItem('loc_pending_user_type');
          setVerificationState(null);
          navigateTo(PageType.DASHBOARD, 'edit-profile');
        }
      } catch {
        // Network hiccup — try again next tick
      }
    }, 3000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [verificationState]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    async function loadSceneCounts() {
      try {
        const res = await fetch(SCENES_SNAPSHOT_URL);
        if (res.ok) {
          setSceneFollowerCounts(await res.json());
          return;
        }
      } catch { /* fall through to Firestore */ }
      try {
        const snap = await getDocs(collection(db, 'scenes'));
        const counts: Record<string, number> = {};
        snap.docs.forEach(d => {
          const fc = d.data().follower_count;
          if (fc != null) counts[d.id] = fc as number;
        });
        setSceneFollowerCounts(counts);
      } catch { /* ignore */ }
    }
    loadSceneCounts();
  }, []);

  const updateSceneFollowerCount = (slug: string, newCount: number) => {
    setSceneFollowerCounts(prev => ({ ...prev, [slug]: newCount }));
  };

  useEffect(() => {
    const handleHashChange = () => {
      const fullHash = window.location.hash.replace('#', '');
      const [page, tab] = fullHash.split(':');

      if (Object.values(PageType).includes(page as PageType)) {
        setCurrentPage(page as PageType);
        setInitialTab(tab || null);
        window.scrollTo(0, 0);
      } else {
        setCurrentPage(PageType.HOME);
        setInitialTab(null);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (page: PageType, tab?: string) => {
    const newHash = tab ? `${page}:${tab}` : page;
    if (window.location.hash === `#${newHash}`) {
      const event = new HashChangeEvent('hashchange');
      window.dispatchEvent(event);
    } else {
      window.location.hash = newHash;
    }
  };

  const openAuth = (mode: 'signin' | 'signup') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleLogout = async () => {
    await signOut(auth);
    setCurrentPage(PageType.HOME);
    window.location.hash = '';
  };

  const renderContent = () => {
    switch (currentPage) {
      case PageType.HOME:
        return <Home navigateTo={navigateTo} onPostSpot={() => setIsPostModalOpen(true)} initialTab={initialTab} authUser={authUser} />;
      case PageType.COMEDIANS:
        return <ForComedians navigateTo={navigateTo} />;
      case PageType.CORPORATE:
        return <CorporatePage navigateTo={navigateTo} />;
      case PageType.CONTACT:
        return <ContactPage />;
      case PageType.LEADERBOARDS:
        return <Leaderboards navigateTo={navigateTo} />;
      case PageType.OPPORTUNITIES:
        return <OpportunityBoard role={userRole} authUser={authUser} onPostSpot={() => setIsPostModalOpen(true)} />;
      case PageType.SCENES:
        return <ScenesPage navigateTo={navigateTo} initialTab={initialTab} authUser={authUser} userRole={userRole} sceneFollowerCounts={sceneFollowerCounts} onSceneFollowChange={updateSceneFollowerCount} />;
      case PageType.HOW_TO_GET_GIGS:
        return <HowToGetGigs />;
      case PageType.ORGANIZER_GETTING_STARTED:
        return <OrganizerGettingStarted />;
      case PageType.FAN_GETTING_STARTED:
        return <FanGettingStarted navigateTo={navigateTo} />;
      case PageType.REVENUE_TICKETING:
        return <RevenueTicketing />;
      case PageType.DIGITAL_ENGAGEMENT:
        return <DigitalEngagement />;
      case PageType.ORGANIZER_MANAGEMENT_CENTER:
        return <OrganizerManagementCenter />;
      case PageType.DASHBOARD:
        return <UserDashboard role={userRole} authUser={authUser} initialTab={initialTab} navigateTo={navigateTo} />;
      case PageType.COMEDIAN_PROFILE:
        return <ComedianProfile docId={initialTab ?? ''} navigateTo={navigateTo} authUser={authUser} userRole={userRole} />;
      case PageType.ORGANIZER_PROFILE:
        return <OrganizerProfile uid={initialTab ?? ''} navigateTo={navigateTo} authUser={authUser} userRole={userRole} />;
      default:
        return <Home navigateTo={navigateTo} onPostSpot={() => setIsPostModalOpen(true)} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0e1a] text-white overflow-x-hidden">
      <Navbar
        currentPage={currentPage}
        navigateTo={navigateTo}
        onOpenAuth={openAuth}
        onLogout={handleLogout}
        authUser={authUser}
        isOpen={isMenuOpen}
        setIsOpen={setIsMenuOpen}
      />

      {/* Email verification banner */}
      {verificationState && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-amber-500/10 border-b border-amber-500/20 py-3 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
            <MailCheck className="w-4 h-4 text-amber-500 shrink-0" />
            <p className="text-amber-300 text-sm font-bold">
              Check your inbox — verify your email to complete your profile
            </p>
            <Loader2 className="w-4 h-4 text-amber-500 animate-spin shrink-0" />
          </div>
        </div>
      )}

      <main className="flex-grow pb-24 lg:pb-0">
        {renderContent()}
      </main>
      <Footer navigateTo={navigateTo} />
      <MobileBottomNav
        currentPage={currentPage}
        navigateTo={navigateTo}
      />

      {isPostModalOpen && (
        <PostSpotModal onClose={() => setIsPostModalOpen(false)} />
      )}

      {isAuthModalOpen && (
        <AuthPage
          initialMode={authModalMode}
          onClose={() => setIsAuthModalOpen(false)}
          navigateTo={navigateTo}
          onVerificationPending={(email, userType) => {
            setVerificationState({ email, userType });
            setIsAuthModalOpen(false);
          }}
          onRoleSet={(role) => setUserRole(role as UserRole)}
        />
      )}
    </div>
  );
}

export default App;
