
import React, { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, arrayUnion, arrayRemove, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { PageType } from '../types';
import {
  Calendar,
  ChevronRight,
  Zap,
  Ticket,
  Mic2,
  Building,
  MapPin,
  Heart,
  Globe,
  Search,
  Navigation,
  Star,
  ShieldCheck,
  Trophy,
  Users,
  Video,
  Play,
  Lock,
  ArrowLeft,
  ArrowUpRight,
  Instagram,
  Twitter,
  Youtube,
  Facebook,
  Film,
  MessageSquare,
  X as XIcon,
  Tent,
  Coffee,
  Beer,
  Music,
  Info,
  CheckCircle,
  Smile,
  Check,
  Loader2
} from 'lucide-react';

interface HomeRosterComedian {
  docId:     string;
  name:      string;
  image:     string;
  location:  string;
  level:     string;
  styles:    string[];
  instagram: string;
  xLink:     string;
  youtube:   string;
  followerCount: number;
  likes:     number;
}

interface HomeProps {
  navigateTo: (page: PageType, tab?: string) => void;
  onPostSpot: () => void;
  initialTab?: string | null;
  authUser?: FirebaseUser | null;
}

export const Home: React.FC<HomeProps> = ({ navigateTo, onPostSpot, initialTab, authUser }) => {
  const [activeTab, setActiveTab] = useState<string | null>(initialTab || null);
  const [selectedComedianId, setSelectedComedianId] = useState<string | null>(null);
  const [alphabetFilter, setAlphabetFilter] = useState<string | null>(null);
  const [isMobileAlphabetOpen, setIsMobileAlphabetOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('USA');
  const [rosterComedians,     setRosterComedians]     = useState<HomeRosterComedian[]>([]);
  const [loadingRoster,       setLoadingRoster]       = useState(true);
  const [followingComedians,  setFollowingComedians]  = useState<Set<string>>(new Set());
  const [followingComedianId, setFollowingComedianId] = useState<string | null>(null);
  const [hoverComedianId,     setHoverComedianId]     = useState<string | null>(null);
  const [likedComedians,      setLikedComedians]      = useState<Set<string>>(new Set());
  const [likingComedianId,    setLikingComedianId]    = useState<string | null>(null);
  const [comedianLikes,       setComedianLikes]       = useState<Record<string, number>>({});

  const countries = ['USA', 'UK', 'Canada', 'Australia', 'France', 'Germany', 'India'];

  React.useEffect(() => {
    setActiveTab(initialTab || null);
  }, [initialTab]);

  useEffect(() => {
    async function loadComedians() {
      try {
        const snap = await getDocs(
          query(collection(db, 'comedians'), where('claimed', '==', true))
        );
        const comedians: HomeRosterComedian[] = snap.docs
          .map(d => {
            const data = d.data();
            return {
              docId:         d.id,
              name:          data.comedian_name    ?? '',
              image:         data.comedian_image    ?? '',
              location:      data.location          ?? '',
              level:         data.experience_level  ?? '',
              styles:        data.comedy_styles     ?? [],
              instagram:     data.instagram_link    ?? '',
              xLink:         data.x_link            ?? '',
              youtube:       data.youtube_link      ?? '',
              followerCount: data.follower_count    ?? 0,
              likes:         data.likes             ?? 0,
            };
          })
          .filter(c => c.name.trim() !== '');
        setRosterComedians(comedians);
        const likesMap: Record<string, number> = {};
        comedians.forEach(c => { likesMap[c.docId] = c.likes; });
        setComedianLikes(likesMap);
      } catch { /* ignore */ }
      setLoadingRoster(false);
    }
    loadComedians();
  }, []);

  useEffect(() => {
    if (!authUser) { setFollowingComedians(new Set()); return; }
    async function loadFollowing() {
      try {
        const snap = await getDoc(doc(db, 'users', authUser!.uid));
        const data = snap.data() ?? {};
        setFollowingComedians(new Set(data.following_comedians ?? []));
        setLikedComedians(new Set(data.liked_comedians ?? []));
      } catch { /* ignore */ }
    }
    loadFollowing();
  }, [authUser]);

  const handleComedianFollow = async (comedianId: string) => {
    if (!authUser) {
      alert("Please sign in to follow comedians.");
      return;
    }
    const nowFollowing = !followingComedians.has(comedianId);
    setFollowingComedians(prev => {
      const next = new Set(prev);
      nowFollowing ? next.add(comedianId) : next.delete(comedianId);
      return next;
    });
    setFollowingComedianId(comedianId);
    try {
      await Promise.all([
        updateDoc(doc(db, 'users', authUser.uid), {
          following_comedians: nowFollowing ? arrayUnion(comedianId) : arrayRemove(comedianId),
        }),
        updateDoc(doc(db, 'comedians', comedianId), {
          follower_count: increment(nowFollowing ? 1 : -1),
          followers: nowFollowing ? arrayUnion(authUser.uid) : arrayRemove(authUser.uid),
        }),
      ]);
    } catch {
      setFollowingComedians(prev => {
        const next = new Set(prev);
        nowFollowing ? next.delete(comedianId) : next.add(comedianId);
        return next;
      });
    }
    setFollowingComedianId(null);
  };

  const handleComedianLike = async (comedianId: string) => {
    if (!authUser) {
      alert("Please sign in to like comedians.");
      return;
    }
    const nowLiking = !likedComedians.has(comedianId);

    setLikedComedians(prev => {
      const next = new Set(prev);
      nowLiking ? next.add(comedianId) : next.delete(comedianId);
      return next;
    });
    setComedianLikes(prev => ({
      ...prev,
      [comedianId]: (prev[comedianId] ?? 0) + (nowLiking ? 1 : -1),
    }));
    setLikingComedianId(comedianId);

    try {
      await Promise.all([
        updateDoc(doc(db, 'users', authUser.uid), {
          liked_comedians: nowLiking ? arrayUnion(comedianId) : arrayRemove(comedianId),
        }),
        updateDoc(doc(db, 'comedians', comedianId), {
          likes: increment(nowLiking ? 1 : -1),
        }),
      ]);
    } catch {
      setLikedComedians(prev => {
        const next = new Set(prev);
        nowLiking ? next.delete(comedianId) : next.add(comedianId);
        return next;
      });
      setComedianLikes(prev => ({
        ...prev,
        [comedianId]: (prev[comedianId] ?? 0) + (nowLiking ? -1 : 1),
      }));
    }
    setLikingComedianId(null);
  };

  const tabs = [
    { label: 'COMEDY SHOWS', id: 'SHOWS' },
    { label: 'COMEDY ROSTER', id: 'ROSTER' },
    { label: 'VENUES', id: 'VENUES' },
    { label: 'FESTIVALS', id: 'FESTIVALS' },
    { label: 'CLIPS', id: 'CLIPS' }
  ];

  const getSearchPlaceholder = () => {
    switch (activeTab) {
      case 'SHOWS': return 'Search by Comedian, Venue, or City';
      case 'ROSTER': return 'Search by Comedian, Venue, or City';
      case 'VENUES': return 'Search comedy clubs, bars, or theaters';
      case 'FESTIVALS': return 'Search comedy festivals & tours';
      case 'CLIPS': return 'Search funny clips & specials';
      default: return 'Search...';
    }
  };

  const currentTabLabel = tabs.find(t => t.id === activeTab)?.label || "";
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#".split("");

  const categories = [
    { icon: <Mic2 className="w-5 h-5" />, label: 'Shows', color: 'bg-blue-500' },
    { icon: <Smile className="w-5 h-5" />, label: 'Roster', color: 'bg-red-500' },
    { icon: <Building className="w-5 h-5" />, label: 'Venues', color: 'bg-amber-500' },
    { icon: <Tent className="w-5 h-5" />, label: 'Festivals', color: 'bg-orange-500' },
    { icon: <Video className="w-5 h-5" />, label: 'Clips', color: 'bg-purple-500' },
  ];

  const mockVenues = [
    { id: 1, name: "The Comedy Store", city: "London", type: "Club", capacity: "400", rating: 4.9, features: ["Food", "Bar", "Recording"], isVerified: true },
    { id: 2, name: "Top Secret Comedy Club", city: "London", type: "Club", capacity: "200", rating: 4.8, features: ["Bar", "Late Night"], isVerified: true },
    { id: 3, name: "The Stand", city: "Edinburgh", type: "Theater", capacity: "150", rating: 4.7, features: ["Food", "Bar"], isVerified: true },
    { id: 4, name: "Comedy Cellar", city: "New York", type: "Club", capacity: "100", rating: 4.9, features: ["Historic", "Bar"], isVerified: true },
    { id: 5, name: "Laugh Factory", city: "Los Angeles", type: "Theater", capacity: "300", rating: 4.7, features: ["Recording", "VIP"], isVerified: true },
    { id: 6, name: "Glee Club", city: "Birmingham", type: "Theater", capacity: "450", rating: 4.6, features: ["Food", "Multi-room"], isVerified: false },
  ];

  const mockFestivals = [
    { id: 1, name: "Edinburgh Fringe", city: "Edinburgh", date: "Aug 2026", duration: "25 Days", status: "APPLICATIONS OPEN", icon: <Tent className="text-red-500" /> },
    { id: 2, name: "Just For Laughs", city: "Montreal", date: "July 2026", duration: "12 Days", status: "INVITE ONLY", icon: <Mic2 className="text-amber-500" /> },
    { id: 3, name: "Melbourne Comedy Festival", city: "Melbourne", date: "Mar 2026", duration: "21 Days", status: "BUY TICKETS", icon: <Star className="text-blue-500" /> },
    { id: 4, name: "Leiceister Comedy Festival", city: "Leicester", date: "Feb 2026", duration: "19 Days", status: "LIVE NOW", icon: <Zap className="text-green-500" /> },
  ];

  const selectedComedian = rosterComedians.find(c => c.docId === selectedComedianId);

  const renderRoster = () => {
    if (loadingRoster) return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-amber-500 opacity-60" />
      </div>
    );

    const filtered = alphabetFilter
      ? rosterComedians.filter(c => c.name[0]?.toUpperCase() === alphabetFilter)
      : rosterComedians;

    if (filtered.length === 0) return (
      <div className="flex flex-col items-center justify-center py-20 text-[#8892a4] gap-3">
        <Mic2 className="w-10 h-10 opacity-20" />
        <p className="text-[10px] font-bold uppercase tracking-widest">No comedians found</p>
      </div>
    );

    return (
      <div className="animate-in fade-in duration-500">
        <div className="mb-10 relative">
          <div className="hidden md:flex flex-wrap gap-2 items-center">
            <button onClick={() => setAlphabetFilter(null)} className={`alphabet-pill-all ${!alphabetFilter ? 'active' : ''}`}>All Comedians</button>
            <div className="flex flex-wrap gap-2">
              {alphabet.map(letter => (
                <button key={letter} onClick={() => setAlphabetFilter(letter)} className={`alphabet-pill ${alphabetFilter === letter ? 'active' : ''}`}>{letter}</button>
              ))}
            </div>
          </div>
          <div className="md:hidden flex items-center justify-between">
            <button onClick={() => setAlphabetFilter(null)} className={`alphabet-pill-all ${!alphabetFilter ? 'active' : ''}`}>All Comedians</button>
            <button onClick={() => setIsMobileAlphabetOpen(true)} className="w-[50px] h-[42px] bg-brand-gradient flex items-center justify-center rounded-lg shadow-lg">
              <span className="text-white font-black italic text-lg">AZ</span>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
          {filtered.map(comedian => {
            const cid         = comedian.docId;
            const isOwnCard   = authUser?.uid === cid;
            const isFollowing = followingComedians.has(cid);
            const isLoading   = followingComedianId === cid;
            const isHovering  = hoverComedianId === cid;

            return (
              <div
                key={cid}
                onClick={() => setSelectedComedianId(cid)}
                className="bg-[#f6a623] md:glass-card p-3 md:p-0 rounded-2xl md:rounded-xl border-none md:border-white/5 flex md:flex-row items-center md:items-stretch gap-4 md:gap-0 hover:brightness-110 md:hover:brightness-100 md:hover:bg-transparent transition-all cursor-pointer overflow-hidden group"
              >
                <div className="w-20 h-20 md:w-[40%] md:h-[150px] rounded-xl md:rounded-none overflow-hidden shrink-0 bg-slate-800 flex items-center justify-center">
                  {comedian.image
                    ? <img src={comedian.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={comedian.name} />
                    : <Mic2 className="w-8 h-8 text-slate-600" />}
                </div>
                <div className="flex-grow min-w-0 bg-[#f6a623] p-3 md:p-4 flex flex-col justify-center">
                  <h4 className="text-sm md:text-xl font-black italic uppercase tracking-tighter text-[#0a0e1a] mb-1 truncate">{comedian.name}</h4>
                  <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-[#0a0e1a]/70 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#e53e3e]" /> {comedian.location || 'Location not set'}
                  </p>
                  {comedian.level && (
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#0a0e1a]/50 mt-0.5">{comedian.level}</p>
                  )}
                  <div className="flex items-center justify-between mt-2 md:mt-auto">
                    <div className="flex items-center gap-2">
                      {comedian.instagram && (
                        <button
                          onClick={e => { e.stopPropagation(); window.open(comedian.instagram, '_blank'); }}
                          className="w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform shadow-sm"
                          style={{ background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285aeb 90%)' }}
                        >
                          <Instagram className="w-3 h-3 md:w-4 md:h-4" />
                        </button>
                      )}
                      {comedian.xLink && (
                        <button onClick={e => { e.stopPropagation(); window.open(comedian.xLink, '_blank'); }} className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-black flex items-center justify-center text-white hover:scale-110 transition-transform shadow-sm">
                          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 md:w-4 md:h-4"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                        </button>
                      )}
                      {comedian.youtube && (
                        <button onClick={e => { e.stopPropagation(); window.open(comedian.youtube, '_blank'); }} className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#ff0000] flex items-center justify-center text-white hover:scale-110 transition-transform shadow-sm">
                          <Youtube className="w-3 h-3 md:w-4 md:h-4" />
                        </button>
                      )}
                      <button
                        onClick={e => { e.stopPropagation(); handleComedianLike(cid); }}
                        disabled={likingComedianId === cid}
                        className={`flex items-center gap-0.5 text-[10px] font-black transition-all ml-1 disabled:opacity-40 ${
                          likedComedians.has(cid) ? 'text-red-500' : 'text-[#0a0e1a]/30 hover:text-red-400'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${likedComedians.has(cid) ? 'fill-red-500' : ''}`} />
                        <span>{comedianLikes[cid] ?? 0}</span>
                      </button>
                    </div>

                    {isOwnCard ? (
                      <span className="px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-black/10 text-[#0a0e1a]/40">You</span>
                    ) : (
                      <button
                        onClick={e => { e.stopPropagation(); handleComedianFollow(cid); }}
                        onMouseEnter={() => setHoverComedianId(cid)}
                        onMouseLeave={() => setHoverComedianId(null)}
                        disabled={isLoading}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                          isLoading
                            ? 'bg-black/20 text-black/40'
                            : isFollowing
                              ? isHovering ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
                              : 'bg-[#0a0e1a] text-white hover:bg-black'
                        }`}
                      >
                        {isLoading
                          ? <Loader2 className="w-3 h-3 animate-spin" />
                          : isFollowing
                            ? isHovering ? 'Unfollow' : <><Check className="w-3 h-3" /> Following</>
                            : '+ Follow'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderVenues = () => (
    <div className="animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        {mockVenues.map(venue => (
          <div key={venue.id} className="glass-card p-3 md:p-6 rounded-2xl md:rounded-[2rem] border-white/5 hover:border-white/20 transition-all flex items-center md:items-stretch gap-4 md:gap-6 group cursor-pointer">
            <div className="w-20 h-20 md:w-32 md:h-32 rounded-xl md:rounded-2xl bg-slate-800 overflow-hidden shrink-0 border border-white/5">
              <img src={`https://picsum.photos/seed/venue${venue.id}/400/400`} className="w-full h-full object-cover grayscale opacity-60 group-hover:scale-110 transition-transform duration-500" alt={venue.name} />
            </div>
            <div className="flex-grow min-w-0">
              <div className="flex justify-between items-start mb-1 md:mb-2">
                <div className="min-w-0">
                  <h4 className="text-sm md:text-xl font-black italic uppercase tracking-tighter text-white truncate">{venue.name}</h4>
                  <p className="text-[9px] md:text-[10px] font-black text-amber-500 uppercase tracking-widest truncate">{venue.city} • {venue.type}</p>
                </div>
                {venue.isVerified && <ShieldCheck className="w-4 h-4 md:w-5 md:h-5 text-blue-500 shrink-0 ml-2" />}
              </div>
              <div className="flex items-center gap-4 mb-2 md:mb-4">
                <div className="flex items-center gap-1 text-[10px] md:text-xs font-bold text-white">
                  <Star className="w-3 h-3 md:w-4 md:h-4 text-[#f6a623] fill-current" /> {venue.rating}
                </div>
              </div>
              <div className="hidden md:flex flex-wrap gap-2 mb-6">
                {["Parking", "Nearby Food", "Directions"].map(f => (
                  <span key={f} className="text-[8px] font-black uppercase tracking-widest px-2 py-1 bg-white/5 rounded-full text-[#8892a4] border border-white/5">{f}</span>
                ))}
              </div>
              <button className="w-full py-1.5 md:py-2 bg-brand-gradient text-white rounded-lg text-[9px] md:text-[10px] font-black uppercase italic tracking-widest shadow-xl shadow-orange-900/10">VENUE INFO</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFestivals = () => (
    <div className="animate-in fade-in duration-500">
      <div className="space-y-6">
        {mockFestivals.map(fest => (
          <div key={fest.id} className="glass-card overflow-hidden rounded-[2.5rem] border-white/5 hover:border-white/20 transition-all flex flex-col md:flex-row items-stretch">
            <div className="md:w-64 h-48 md:h-auto bg-slate-800 relative group overflow-hidden">
               <img src={`https://picsum.photos/seed/fest${fest.id}/600/400`} className="w-full h-full object-cover grayscale opacity-40 group-hover:scale-110 transition-transform duration-1000" />
               <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-12 h-12 bg-[#0a0e1a]/80 backdrop-blur rounded-full flex items-center justify-center">
                   {fest.icon}
                 </div>
               </div>
            </div>
            <div className="flex-grow p-10 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">{fest.name}</h3>
                    <p className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-2 mt-1">
                      <MapPin className="w-3 h-3" /> {fest.city}
                    </p>
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest italic border ${fest.status === 'APPLICATIONS OPEN' ? 'border-red-500 text-red-500 bg-red-500/10' : 'border-white/10 text-[#8892a4]'}`}>
                    {fest.status}
                  </span>
                </div>
                <div className="flex gap-12 mb-8">
                  <div>
                    <p className="text-[10px] font-black text-[#8892a4] uppercase tracking-widest mb-1">DATE</p>
                    <p className="text-lg font-black italic uppercase text-white">{fest.date}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-[#8892a4] uppercase tracking-widest mb-1">DURATION</p>
                    <p className="text-lg font-black italic uppercase text-white">{fest.duration}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <button className="flex-1 py-4 bg-brand-gradient text-white rounded-2xl text-xs font-black uppercase italic tracking-widest shadow-xl shadow-orange-900/20 active:scale-95 transition-all">APPLY TO PERFORM</button>
                <button className="flex-1 py-4 bg-white/5 border border-white/10 text-white rounded-2xl text-xs font-black uppercase italic tracking-widest hover:bg-white/10 transition-all">VIEW FESTIVAL HUB</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderClips = () => (
    <div className="animate-in fade-in duration-500">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="glass-card rounded-3xl lg:rounded-[2.5rem] overflow-hidden border border-white/5 group h-full flex flex-col">
            <div className="aspect-video relative overflow-hidden bg-slate-900">
              <img src={`https://picsum.photos/seed/clip${i}/800/450`} className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" alt="Clip" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-100 group-hover:opacity-0 transition-opacity">
                <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center">
                  <Play className="w-4 h-4 lg:w-6 lg:h-6 text-white fill-current ml-1" />
                </div>
              </div>
              <div className="absolute bottom-2 right-2 lg:bottom-4 lg:right-4 bg-black/60 backdrop-blur px-2 py-1 rounded text-[10px] font-black text-white italic">03:45</div>
            </div>
            <div className="p-5 lg:p-8 flex-grow">
              <div className="flex items-center gap-2 mb-3 lg:mb-4">
                <div className="w-5 h-5 lg:w-6 lg:h-6 rounded-full overflow-hidden bg-slate-800">
                  <img src={`https://i.pravatar.cc/100?u=${i}`} className="w-full h-full object-cover" />
                </div>
                <p className="text-[9px] lg:text-[10px] font-black text-amber-500 uppercase tracking-widest">Julius Carr</p>
              </div>
              <h4 className="text-lg lg:text-xl font-black italic uppercase text-white leading-tight tracking-tight group-hover:text-red-500 transition-colors mb-4 line-clamp-2">Why I hate traffic in LA...</h4>
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 text-[9px] lg:text-[10px] font-bold text-[#8892a4] uppercase tracking-widest"><Heart className="w-3 h-3" /> 1.2k</span>
                  <span className="flex items-center gap-1 text-[9px] lg:text-[10px] font-bold text-[#8892a4] uppercase tracking-widest"><MessageSquare className="w-3 h-3" /> 45</span>
                </div>
                <button className="text-[#8892a4] hover:text-white transition-colors"><Zap className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderProfile = () => {
    if (!selectedComedian) return null;
    const [profileTab, setProfileTab] = useState('VIDEOS');
    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-500 pb-24">
        <div className="relative mb-24">
          <button onClick={() => setSelectedComedianId(null)} className="absolute top-6 left-6 z-20 flex items-center gap-2 text-xs font-black uppercase italic tracking-widest text-white/80 hover:text-white bg-black/40 px-4 py-2 rounded-full backdrop-blur-md">
            <ArrowLeft className="w-4 h-4" /> Back to Roster
          </button>
          <div className="h-64 md:h-80 w-full relative">
            <div className="w-full h-full bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1a] via-[#0a0e1a]/40 to-transparent"></div>
          </div>
          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center">
            <div className="w-32 h-32 rounded-full border-4 border-[#0a0e1a] overflow-hidden bg-slate-800 shadow-2xl flex items-center justify-center">
              {selectedComedian.image
                ? <img src={selectedComedian.image} className="w-full h-full object-cover" alt={selectedComedian.name} />
                : <Mic2 className="w-12 h-12 text-slate-600" />}
            </div>
            <div className="mt-6 text-center">
              <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white">{selectedComedian.name}</h2>
              <div className="flex items-center justify-center gap-3 mt-2">
                <p className="text-[#8892a4] text-sm font-bold flex items-center gap-1"><MapPin className="w-4 h-4 text-[#e53e3e]" /> {selectedComedian.location}</p>
                <span className="px-3 py-0.5 bg-[#e53e3e]/10 text-[#e53e3e] text-[10px] font-black uppercase rounded italic border border-[#e53e3e]/20">{selectedComedian.level}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center gap-8 mb-16">
          <div className="flex gap-4">
            {selectedComedian.instagram && (
              <button
                onClick={() => window.open(selectedComedian.instagram, '_blank')}
                className="social-icon-btn ig p-3 w-12 h-12"
              >
                <Instagram className="w-6 h-6" />
              </button>
            )}
            {selectedComedian.youtube && (
              <button
                onClick={() => window.open(selectedComedian.youtube, '_blank')}
                className="social-icon-btn yt p-3 w-12 h-12"
              >
                <Youtube className="w-6 h-6" />
              </button>
            )}
            {selectedComedian.xLink && (
              <button
                onClick={() => window.open(selectedComedian.xLink, '_blank')}
                className="social-icon-btn x p-3 w-12 h-12"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </button>
            )}
          </div>
          <div className="flex gap-4 w-full max-w-md">
            <button className="flex-1 py-4 border-2 border-white/10 rounded-2xl text-xs font-black uppercase italic tracking-widest hover:text-white/5 transition-all">FOLLOW ({selectedComedian.followerCount.toLocaleString()})</button>
            <button className="flex-1 py-4 bg-brand-gradient text-white rounded-2xl text-xs font-black uppercase italic tracking-widest shadow-xl shadow-orange-900/20 active:scale-95 transition-all">BOOK ME</button>
          </div>
        </div>
        <div className="border-b border-white/5 mb-12 flex justify-center gap-12">
          {['VIDEOS', 'SHOWS', 'ABOUT', 'REVIEWS'].map(t => (
            <button key={t} onClick={() => setProfileTab(t)} className={`pb-4 text-xs font-black uppercase tracking-[0.2em] italic transition-all relative ${profileTab === t ? 'text-white' : 'text-[#8892a4] hover:text-white'}`}>
              {t}
              {profileTab === t && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#e53e3e] rounded-full"></div>}
            </button>
          ))}
        </div>
        {profileTab === 'VIDEOS' && (
          <div className="space-y-12">
            <div className="aspect-video w-full rounded-3xl bg-slate-900 overflow-hidden relative border border-white/10 shadow-2xl group cursor-pointer">
              <img src={`https://picsum.photos/seed/vid1/1200/800`} className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-[#e53e3e] rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform"><Play className="w-8 h-8 text-white fill-current ml-1" /></div>
              </div>
              <div className="absolute bottom-8 left-8">
                 <h4 className="text-2xl font-black italic uppercase text-white mb-2">Live @ The Comedy Store - 2026 Special</h4>
                 <p className="text-[#8892a4] text-xs font-bold uppercase tracking-widest">12:45 • FEATURED CLIP</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative">
      {/* Mobile Search Header */}
      <div className="lg:hidden bg-[#0a0e1a] px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <p className="text-[8px] font-black text-[#8892a4] uppercase tracking-widest">Current Location</p>
              <p className="text-xs font-black text-white uppercase italic">London, UK <ChevronRight className="inline w-3 h-3 rotate-90" /></p>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#131b2e] border border-white/5 flex items-center justify-center">
            <Search className="w-5 h-5 text-[#8892a4]" />
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8892a4]" />
          <input
            type="text"
            placeholder="Search events, comedians..."
            className="w-full bg-[#131b2e] border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-white placeholder:text-[#8892a4] focus:outline-none focus:border-amber-500/50 transition-all"
          />
        </div>

        {/* Mobile Categories */}
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4">
          {categories.map((cat, i) => (
            <div
              key={i}
              onClick={() => {
                if (cat.label === 'Roster') navigateTo(PageType.HOME, 'ROSTER');
                else if (cat.label === 'Shows') navigateTo(PageType.HOME, 'SHOWS');
                else if (cat.label === 'Venues') navigateTo(PageType.HOME, 'VENUES');
                else if (cat.label === 'Festivals') navigateTo(PageType.HOME, 'FESTIVALS');
                else if (cat.label === 'Clips') navigateTo(PageType.HOME, 'CLIPS');
              }}
              className="flex flex-col items-center gap-2 shrink-0 cursor-pointer active:scale-95 transition-transform"
            >
              <div className={`w-14 h-14 rounded-2xl ${cat.color} flex items-center justify-center shadow-lg shadow-black/20`}>
                {React.cloneElement(cat.icon as React.ReactElement, { className: "w-6 h-6 text-white" })}
              </div>
              <span className="text-[10px] font-black text-[#8892a4] uppercase tracking-tighter">{cat.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="sticky top-16 z-40 bg-[#0a0e1a] border-b border-white/5 hidden lg:block">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center gap-2 overflow-x-auto no-scrollbar py-4">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => { navigateTo(PageType.HOME, tab.id); setSelectedComedianId(null); }} className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.1em] transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-brand-gradient text-white shadow-lg' : 'bg-[#131b2e] text-[#8892a4] hover:text-white border border-white/5'}`}>{tab.label}</button>
            ))}
          </div>
        </div>
      </div>

      {!activeTab ? (
        <div className="animate-in fade-in duration-700">
          {/* Mobile Hero Section */}
          <section className="relative min-h-[60vh] lg:min-h-[85vh] flex items-center pt-8 pb-16 lg:pt-16 lg:pb-24 overflow-hidden bg-[#0a0e1a]">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#e53e3e]/10 blur-[150px] rounded-full"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#f56500]/10 blur-[150px] rounded-full"></div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:grid lg:grid-cols-[1fr_2.2fr] gap-12 text-center lg:text-left">
              <div className="flex flex-col justify-center py-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#131b2e] border border-white/5 text-[#f6a623] text-[10px] font-black uppercase tracking-[0.2em] mb-8 w-fit mx-auto lg:mx-0"><Zap className="w-3 h-3" /> YOUR LEAGUE FOR LAUGHS</div>
                <h1 className="text-5xl lg:text-8xl font-black leading-[0.9] mb-10 italic uppercase tracking-tighter text-white"><span className="block">DISCOVER. BOOK.</span><span className="text-brand-gradient italic">CONNECT.</span></h1>
                <p className="text-xl text-[#8892a4] mb-12 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">Step Your Comedy Game Up.</p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
                  <button onClick={() => navigateTo(PageType.OPPORTUNITIES)} className="bg-brand-gradient hover:opacity-90 text-white px-10 py-5 rounded-2xl text-lg font-black transition-all flex items-center justify-center gap-2 shadow-2xl shadow-orange-900/40 group active:scale-95 italic uppercase tracking-wider">GIGS BOARD <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></button>
                  <button onClick={() => navigateTo(PageType.SCENES)} className="bg-[#131b2e] border-2 border-white/5 hover:bg-[#1e293b] text-white px-10 py-5 rounded-2xl text-lg font-black transition-all flex items-center justify-center gap-2 shadow-xl active:scale-95 italic uppercase tracking-wider">GET STARTED</button>
                </div>
              </div>
              <div className="relative hidden lg:flex flex-col">
                <div className="glass-card p-4 rounded-[3rem] border-white/10 shadow-2xl transition-all duration-700 animate-swipe-left flex-grow flex">
                  <div className="flex-grow rounded-[2.5rem] overflow-hidden relative">
                    <img
                      src="https://leagueofcomedy.com/wp-content/uploads/2025/08/Comedy-Show-Audience-4.png"
                      alt="Laughing Audience"
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1a]/80 via-transparent to-transparent"></div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="lg:hidden px-4 pb-8">

            {/* Mobile Invite Banner */}
            <div className="mt-8 bg-blue-500/10 border border-blue-500/20 rounded-[2rem] p-6 relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-xl font-black italic uppercase tracking-tighter text-white mb-2">Invite your friends</h3>
                <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4">Get 100 LAF Points for every referral & signup</p>
                <button className="bg-blue-500 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase italic">INVITE</button>
              </div>
              <div className="absolute right-[-20px] top-1/2 -translate-y-1/2 w-32 h-32 bg-blue-500/20 blur-2xl rounded-full"></div>
            </div>
          </div>


          <section className="py-16 lg:py-32 bg-[#0a0e1a] relative animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <div className="max-w-7xl mx-auto px-4">
               <h2 className="text-3xl lg:text-7xl font-black text-center mb-12 lg:mb-24 tracking-tight">
                 HOW IT <span className="text-brand-gradient italic uppercase ml-2 pr-2">WORKS</span>
               </h2>
               <div className="grid lg:grid-cols-3 gap-8">
                  <div className="bg-[#0f1628] p-6 lg:p-12 rounded-3xl lg:rounded-[3rem] border border-white/5 flex flex-col items-center text-center group hover:-translate-y-2 transition-all duration-500">
                     <div className="w-12 h-12 lg:w-20 lg:h-20 bg-[#131b2e] rounded-xl lg:rounded-3xl mb-4 lg:mb-8 flex items-center justify-center group-hover:scale-110 transition-transform"><Ticket className="w-6 h-6 lg:w-10 lg:h-10 text-[#f6a623]" /></div>
                     <div className="text-[#e53e3e] text-[8px] lg:text-[10px] font-black uppercase tracking-[0.3em] mb-2 lg:mb-4">FOR FANS</div>
                     <h3 className="text-xl lg:text-3xl font-black italic uppercase mb-4 lg:mb-6 tracking-tight leading-none">DISCOVER.<br/>ATTEND. EARN.</h3>
                     <p className="text-[#8892a4] font-medium leading-relaxed mb-6 lg:mb-10 text-xs lg:text-sm">Find comedy shows in your city, buy tickets, and earn LAF Points every time you attend. Climb the leaderboards and unlock exclusive rewards.</p>
                     <button onClick={() => navigateTo(PageType.HOME, 'SHOWS')} className="mt-auto w-full py-3 lg:py-4 rounded-xl border border-white/10 text-[10px] lg:text-[11px] font-black uppercase italic tracking-[0.2em] hover:bg-white/5 transition-all">BROWSE SHOWS</button>
                  </div>
                  <div className="bg-[#0f1628] p-6 lg:p-12 rounded-3xl lg:rounded-[3rem] border border-white/5 flex flex-col items-center text-center group hover:-translate-y-2 transition-all duration-500">
                     <div className="w-12 h-12 lg:w-20 lg:h-20 bg-[#131b2e] rounded-xl lg:rounded-3xl mb-4 lg:mb-8 flex items-center justify-center group-hover:scale-110 transition-transform"><Mic2 className="w-6 h-6 lg:w-10 lg:h-10 text-[#f6a623]" /></div>
                     <div className="text-[#e53e3e] text-[8px] lg:text-[10px] font-black uppercase tracking-[0.3em] mb-2 lg:mb-4">FOR COMEDIANS</div>
                     <h3 className="text-xl lg:text-3xl font-black italic uppercase mb-4 lg:mb-6 tracking-tight leading-none">APPLY. PERFORM.<br/>RISE.</h3>
                     <p className="text-[#8892a4] font-medium leading-relaxed mb-6 lg:mb-10 text-xs lg:text-sm">Build your professional profile, apply to gigs, and get booked by venues and event organizers worldwide. Your next gig is waiting.</p>
                     <button onClick={() => navigateTo(PageType.HOME, 'ROSTER')} className="mt-auto w-full py-3 lg:py-4 rounded-xl border border-white/10 text-[10px] lg:text-[11px] font-black uppercase italic tracking-[0.2em] hover:bg-white/5 transition-all">GET STARTED</button>
                  </div>
                  <div className="bg-[#0f1628] p-6 lg:p-12 rounded-3xl lg:rounded-[3rem] border border-[#e53e3e]/20 flex flex-col items-center text-center group hover:-translate-y-2 transition-all duration-500 shadow-2xl shadow-red-900/10">
                     <div className="w-12 h-12 lg:w-20 lg:h-20 bg-[#131b2e] rounded-xl lg:rounded-3xl mb-4 lg:mb-8 flex items-center justify-center group-hover:scale-110 transition-transform"><Building className="w-6 h-6 lg:w-10 lg:h-10 text-[#f6a623]" /></div>
                     <div className="text-[#e53e3e] text-[8px] lg:text-[10px] font-black uppercase tracking-[0.2em] mb-2 lg:mb-4">FOR VENUES & ORGANIZERS</div>
                     <h3 className="text-xl lg:text-3xl font-black italic uppercase mb-4 lg:mb-6 tracking-tight leading-none">POST. FIND. BOOK.</h3>
                     <p className="text-[#8892a4] font-medium leading-relaxed mb-6 lg:mb-10 text-xs lg:text-sm">List your shows, find the right comedian for your event, and manage everything in one place. Thousands of acts ready to perform.</p>
                     <button onClick={onPostSpot} className="mt-auto w-full py-4 lg:py-5 rounded-xl bg-brand-gradient text-white text-[10px] lg:text-[11px] font-black uppercase italic tracking-[0.2em] shadow-xl shadow-orange-900/20 active:scale-95 transition-all">POST A SPOT</button>
                  </div>
               </div>
            </div>
          </section>
        </div>
      ) : (
        <div className="animate-in slide-in-from-bottom-2 duration-500">
          <div className="bg-[#131b2e] border-b border-white/5 sticky top-[137px] z-30 hidden lg:block">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-6">
              <div className="shrink-0"><h2 className="text-lg font-black italic uppercase tracking-tight text-white whitespace-nowrap">{currentTabLabel}</h2></div>
              {(activeTab === 'SHOWS' || activeTab === 'VENUES') && (
                <div className="relative shrink-0 transition-all">
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="appearance-none bg-[#0a0e1a] pl-4 pr-10 py-2 rounded-full border border-white/10 text-[#f6a623] font-black italic uppercase text-xs cursor-pointer hover:border-[#f6a623]/30 transition-all focus:outline-none focus:ring-1 focus:ring-[#f6a623]/50"
                  >
                    {countries.map(c => <option key={c} value={c} className="bg-[#0a0e1a] text-white font-sans font-bold">{c}</option>)}
                  </select>
                  <ChevronRight className="w-4 h-4 rotate-90 text-[#f6a623] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              )}
              <div className="flex-grow flex gap-2">
                <div className="flex-grow relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8892a4]" />
                  <input type="text" placeholder={getSearchPlaceholder()} className="roster-search-input !py-2 !pl-10 !text-xs" />
                </div>
                {(activeTab === 'SHOWS') && (
                  <div className="w-32 relative shrink-0"><input type="text" placeholder="02/16/2026" className="roster-search-input !py-2 !text-xs text-center" /></div>
                )}
                <button className="bg-brand-gradient text-white px-6 py-2 rounded-lg text-[10px] font-black uppercase italic shrink-0">SEARCH</button>
                <button className="bg-white/5 text-[#8892a4] px-6 py-2 rounded-lg text-[10px] font-black uppercase italic shrink-0">CLEAR</button>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 py-12">
            {activeTab === 'SHOWS' && (
              <div className="animate-in fade-in duration-500">
                {/* Mobile View */}
                <div className="lg:hidden -mt-4">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">Upcoming Shows</h2>
                    <button className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-1">SEE ALL <ChevronRight className="w-3 h-3" /></button>
                  </div>

                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="glass-card p-3 rounded-2xl border-white/5 flex items-center gap-4 group cursor-pointer">
                        <div className="w-20 h-20 rounded-xl bg-slate-800 overflow-hidden shrink-0 border border-white/5">
                          <img src={`https://picsum.photos/seed/event${i}/400/400`} className="w-full h-full object-cover grayscale opacity-60 group-hover:scale-110 transition-transform duration-500" alt="Show" />
                        </div>
                        <div className="flex-grow min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <div className="min-w-0">
                              <h4 className="text-sm font-black italic uppercase tracking-tighter text-white truncate">International Band Music Concert</h4>
                              <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest truncate">London, UK • June 10</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex -space-x-1.5">
                              {[1, 2, 3].map(j => (
                                <div key={j} className="w-4 h-4 rounded-full border border-[#0f1628] overflow-hidden">
                                  <img src={`https://i.pravatar.cc/100?u=${i}${j}`} className="w-full h-full object-cover" />
                                </div>
                              ))}
                            </div>
                            <span className="text-[7px] font-black text-[#8892a4] uppercase tracking-widest">+20 attending</span>
                          </div>
                          <button className="w-full py-1.5 bg-brand-gradient text-white rounded-lg text-[9px] font-black uppercase italic tracking-widest shadow-xl shadow-orange-900/10">BUY TICKETS</button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-12">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">Nearby You</h2>
                      <button className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-1">SEE ALL <ChevronRight className="w-3 h-3" /></button>
                    </div>
                    <div className="space-y-4">
                      {[
                        { title: "Comedy Night @ The Store", date: "Wed, 12 Mar • 8:00 PM", price: "$25", img: "https://picsum.photos/seed/store/400/300" },
                        { title: "Standup Showcase", date: "Thu, 13 Mar • 7:30 PM", price: "$15", img: "https://picsum.photos/seed/showcase/400/300" },
                        { title: "Late Night Laughs", date: "Fri, 14 Mar • 10:00 PM", price: "$20", img: "https://picsum.photos/seed/late/400/300" }
                      ].map((event, i) => (
                        <div key={i} className="glass-card p-3 rounded-2xl border-white/5 flex items-center gap-4 group cursor-pointer">
                          <div className="w-20 h-20 rounded-xl bg-slate-800 overflow-hidden shrink-0 border border-white/5">
                            <img src={event.img} className="w-full h-full object-cover grayscale opacity-60 group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                          </div>
                          <div className="flex-grow min-w-0">
                            <div className="flex justify-between items-start mb-1">
                              <div className="min-w-0">
                                <h4 className="text-sm font-black italic uppercase tracking-tighter text-white truncate">{event.title}</h4>
                                <p className="text-[9px] font-black text-red-500 uppercase tracking-widest truncate">{event.date}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-[9px] text-[#8892a4] font-bold uppercase tracking-widest mb-2">
                              <MapPin className="w-3 h-3 text-amber-500" /> London, UK
                            </div>
                            <button className="w-full py-1.5 bg-brand-gradient text-white rounded-lg text-[9px] font-black uppercase italic tracking-widest shadow-xl shadow-orange-900/10">BUY ({event.price})</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Desktop View */}
                <div className="hidden lg:block">
                  {selectedCountry === 'USA' && (
                    <div className="comedy-filter-buttons no-scrollbar">
                       <button className="comedy-filter-btn active">All Shows</button>
                       <button className="comedy-filter-btn">Los Angeles</button>
                       <button className="comedy-filter-btn">New York</button>
                       <button className="comedy-filter-btn">Chicago</button>
                       <button className="comedy-filter-btn">Las Vegas</button>
                       <button className="comedy-filter-btn">San Francisco</button>
                       <button className="comedy-filter-btn">Austin</button>
                       <button className="comedy-filter-btn">Boston</button>
                       <button className="comedy-filter-btn">Denver</button>
                       <button className="comedy-filter-btn">Portland</button>
                    </div>
                  )}
                  <div className="comedy-shows-container">
                    {[
                      { title: "Music City Rollin Jamboree Comedy Tour", venue: "L&L Market", city: "Nashville", date: "Feb 17, 2026", time: "11:30 AM", price: "50.00" },
                      { title: "\"Savannah for Morons\" Comedy Trolley Tour", venue: "250 Martin King Blvd", city: "Savannah", date: "Feb 17, 2026", time: "2:00 PM", price: "59.00" },
                      { title: "Mac King Comedy Magic Show", venue: "Excalibur Casino", city: "Las Vegas", date: "Feb 17, 2026", time: "3:00 PM", price: "36.50" },
                    ].map((show, i) => (
                      <div key={i} className="comedy-show-card">
                         <div className="comedy-show-image" style={{ backgroundImage: `url(https://picsum.photos/seed/show${i}/400/400)` }}><div className="comedy-price-tag">${show.price}</div></div>
                         <div className="comedy-show-content">
                            <div className="flex flex-col gap-1">
                               <h4 className="comedy-show-title">{show.title}</h4>
                               <div className="flex items-center gap-2">
                                  <p className="comedy-venue-name">{show.venue}</p>
                                  <p className="comedy-city-text">• {show.city}</p>
                               </div>
                            </div>
                            <div className="comedy-utility-buttons">
                               <div className="comedy-utility-btn">PARKING</div>
                               <div className="comedy-utility-btn">FOOD</div>
                               <div className="comedy-utility-btn"><MapPin className="w-3 h-3" /> MAP</div>
                            </div>
                         </div>
                         <div className="comedy-datetime hidden md:flex">
                            <p className="comedy-date">{show.date}</p>
                            <p className="comedy-time">{show.time}</p>
                         </div>
                         <div className="comedy-ticket-section"><button className="comedy-ticket-btn">BUY TICKETS</button></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'ROSTER' && (selectedComedianId ? renderProfile() : renderRoster())}
            {activeTab === 'VENUES' && renderVenues()}
            {activeTab === 'FESTIVALS' && renderFestivals()}
            {activeTab === 'CLIPS' && renderClips()}
          </div>
        </div>
      )}
    </div>
  );
};
