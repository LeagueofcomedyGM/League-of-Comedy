import React, { useState } from 'react';
import { 
  Check, 
  Zap, 
  Star, 
  Shield, 
  LayoutDashboard, 
  Calendar, 
  Video, 
  Bell, 
  MessageSquare, 
  Briefcase, 
  MapPin, 
  ChevronRight, 
  ChevronDown,
  Search,
  X,
  Users, 
  Mic2,
  Trophy,
  Heart,
  Play,
  ArrowUpRight,
  Instagram,
  Youtube
} from 'lucide-react';
import { PageType, UserRole } from '../types';

interface ScenesPageProps {
  navigateTo: (page: PageType, tab?: string) => void;
  initialTab?: string | null;
}

export const ScenesPage: React.FC<ScenesPageProps> = ({ navigateTo, initialTab }) => {
  const [activeTab, setActiveTab] = useState('SHOWS');
  const [isFollowed, setIsFollowed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const AVAILABLE_SCENES = [
    { name: "Los Angeles", slug: "los-angeles", region: "CA", country: "USA" },
    { name: "New York", slug: "new-york", region: "NY", country: "USA" },
    { name: "London", slug: "london", region: "UK", country: "UK" },
    { name: "Chicago", slug: "chicago", region: "IL", country: "USA" },
    { name: "Austin", slug: "austin", region: "TX", country: "USA" },
    { name: "Manchester", slug: "manchester", region: "UK", country: "UK" },
    { name: "Toronto", slug: "toronto", region: "ON", country: "Canada" },
  ];

  const filteredScenes = AVAILABLE_SCENES.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSceneName = () => {
    if (!initialTab) return "Los Angeles";
    return initialTab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const sceneName = getSceneName();

  const sceneData = {
    name: sceneName,
    city: sceneName,
    state: initialTab?.includes('london') ? 'UK' : 'CA',
    followers: "1,204",
    coverImage: "https://plus.unsplash.com/premium_photo-1725408106567-a77bd9beff7c?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8TG9zJTIwQW5nZWxlc3xlbnwwfHwwfHx8MA%3D%3D"
  };

  const tabs = [
    { id: 'SHOWS', label: 'Shows' },
    { id: 'MICS', label: 'Open Mics' },
    { id: 'ROSTER', label: 'Roster' },
    { id: 'GIGS', label: 'Gigs' },
    { id: 'CLIPS', label: 'Clips' }
  ];

  const mockShows = [
    { title: "Music City Rollin Jamboree Comedy Tour", venue: "L&L Market", city: "Los Angeles", date: "Feb 17, 2026", time: "11:30 AM", price: "50.00" },
    { title: "\"Savannah for Morons\" Comedy Trolley Tour", venue: "The Comedy Store", city: "Los Angeles", date: "Feb 17, 2026", time: "2:00 PM", price: "59.00" },
    { title: "Mac King Comedy Magic Show", venue: "Laugh Factory", city: "Los Angeles", date: "Feb 17, 2026", time: "3:00 PM", price: "36.50" },
  ];

  const mockMics = [
    { title: "Newbie Night Open Mic", venue: "The Fourth Wall", city: "Los Angeles", date: "Every Monday", time: "6:00 PM", price: "0.00" },
    { title: "Chaos Open Mic", venue: "The Hollywood Improv", city: "Los Angeles", date: "Every Tuesday", time: "10:30 PM", price: "5.00" },
  ];

  const mockComedians = [
    { id: 1, name: "Julius Carr", location: "Los Angeles, CA", level: "HEADLINER", points: 12450, rank: 1, followers: "52k", styles: ["Standup", "Clean"], isVerified: true, tier: 'pro' },
    { id: 2, name: "Lizzy Laughs", location: "Los Angeles, CA", level: "BEGINNER", points: 7600, rank: 5, followers: "8k", styles: ["Clean", "Standup"], isVerified: false, tier: 'free' },
    { id: 3, name: "Marcus Vibe", location: "Los Angeles, CA", level: "INTERMEDIATE", points: 8900, rank: 4, followers: "12k", styles: ["Storytelling"], isVerified: true, tier: 'pro' },
  ];

  const mockGigs = [
    { id: 1, title: "After Dinner Speaker", venue: "Goldman Sachs", location: "Los Angeles, CA", deadline: "Dec 15", pay: "$2,500" },
    { id: 2, title: "Corporate Roast", venue: "Tech Innovations Inc", location: "Santa Monica, CA", deadline: "Jan 10", pay: "$1,800" },
    { id: 3, title: "Private Birthday Party", venue: "Private Residence", location: "Beverly Hills, CA", deadline: "Feb 14", pay: "$1,200" },
  ];

  const mockClips = [
    { id: 1, comedian: "Julius Carr", title: "Living in LA be like...", thumbnail: "https://picsum.photos/seed/clip1/400/225" },
    { id: 2, comedian: "Marcus Vibe", title: "My first time at The Store", thumbnail: "https://picsum.photos/seed/clip2/400/225" },
    { id: 3, comedian: "Lizzy Laughs", title: "Clean Comedy Special", thumbnail: "https://picsum.photos/seed/clip3/400/225" },
  ];

  const handleFollowClick = () => {
    alert("Please sign in to follow this scene.");
  };

  const renderShows = (shows: typeof mockShows) => (
    <div className="animate-in fade-in duration-500">
      {/* Mobile View */}
      <div className="lg:hidden space-y-4">
        {shows.map((event, i) => (
          <div key={i} className="glass-card p-3 rounded-2xl border-white/5 flex items-center gap-4 group cursor-pointer">
            <div className="w-20 h-20 rounded-xl bg-slate-800 overflow-hidden shrink-0 border border-white/5">
              <img src={`https://picsum.photos/seed/ev${i}/400/400`} className="w-full h-full object-cover grayscale opacity-60 group-hover:scale-110 transition-transform duration-500" alt="Show" />
            </div>
            <div className="flex-grow min-w-0">
              <div className="flex justify-between items-start mb-1">
                <div className="min-w-0">
                  <h4 className="text-sm font-black italic uppercase tracking-tighter text-white truncate">{event.title}</h4>
                  <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest truncate">{event.city} • {event.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[9px] text-[#8892a4] font-bold uppercase tracking-widest mb-2">
                <MapPin className="w-3 h-3 text-amber-500" /> {event.venue}
              </div>
              <button className="w-full py-1.5 bg-brand-gradient text-white rounded-lg text-[9px] font-black uppercase italic tracking-widest shadow-xl shadow-orange-900/10">BUY (${event.price})</button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop View */}
      <div className="hidden lg:block">
        <div className="comedy-shows-container">
          {shows.map((show, i) => (
            <div key={i} className="comedy-show-card">
              <div className="comedy-show-image" style={{ backgroundImage: `url(https://picsum.photos/seed/show${i}/400/400)` }}>
                <div className="comedy-price-tag">${show.price}</div>
              </div>
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
  );

  const renderRoster = () => (
    <div className="animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        {mockComedians.map(comedian => (
          <div 
            key={comedian.id} 
            className="bg-[#f6a623] md:glass-card p-3 md:p-0 rounded-2xl md:rounded-xl border-none md:border-white/5 flex md:flex-row items-center md:items-stretch gap-4 md:gap-0 hover:brightness-110 md:hover:brightness-100 md:hover:bg-transparent transition-all cursor-pointer overflow-hidden group"
          >
            <div className="w-20 h-20 md:w-[40%] md:h-[150px] rounded-xl md:rounded-none overflow-hidden shrink-0">
              <img src={`https://picsum.photos/seed/com${comedian.id}/400/400`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={comedian.name} />
            </div>
            <div className="flex-grow min-w-0 bg-[#f6a623] p-3 md:p-4 flex flex-col justify-center">
              <h4 className="text-sm md:text-xl font-black italic uppercase tracking-tighter text-[#0a0e1a] mb-1 truncate">{comedian.name}</h4>
              <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-[#0a0e1a]/70 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#e53e3e]" /> {comedian.location}
              </p>
              <div className="flex gap-2 mt-2 md:mt-auto">
                 <button 
                   className="w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform shadow-sm"
                   style={{ background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285aeb 90%)' }}
                 >
                   <Instagram className="w-3 h-3 md:w-4 md:h-4" />
                 </button>
                 <button className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-black flex items-center justify-center text-white hover:scale-110 transition-transform shadow-sm">
                   <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 md:w-4 md:h-4"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                 </button>
                 <button className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#ff0000] flex items-center justify-center text-white hover:scale-110 transition-transform shadow-sm">
                   <Youtube className="w-3 h-3 md:w-4 md:h-4" />
                 </button>
              </div>
            </div>
            <div className="md:hidden">
              <ArrowUpRight className="w-4 h-4 text-[#0a0e1a]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderGigs = () => (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {mockGigs.map(gig => (
        <div key={gig.id} className="glass-card p-6 md:p-8 rounded-[2rem] border border-white/5 hover:border-white/20 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-brand-gradient rounded-2xl flex items-center justify-center shrink-0">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="text-xl font-black italic uppercase text-white tracking-tight leading-none mb-2">{gig.title}</h4>
              <p className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-2">
                <Users className="w-3 h-3" /> {gig.venue} • {gig.location}
              </p>
            </div>
          </div>
          <div className="flex flex-row md:flex-row items-center gap-8 md:gap-12">
            <div className="text-right md:text-left flex-1 md:flex-none">
              <p className="text-[10px] font-black text-[#8892a4] uppercase tracking-widest mb-1">PAY RATE</p>
              <p className="text-lg font-black text-white italic uppercase">{gig.pay}</p>
            </div>
            <div className="text-right md:text-left flex-1 md:flex-none">
              <p className="text-[10px] font-black text-[#8892a4] uppercase tracking-widest mb-1">DEADLINE</p>
              <p className="text-lg font-black text-[#e53e3e] italic uppercase">{gig.deadline}</p>
            </div>
            <button className="bg-[#131b2e] border-2 border-white/5 hover:bg-[#1e293b] hover:text-white text-[#8892a4] px-6 py-3 rounded-xl text-xs font-black italic uppercase tracking-wider transition-all">VIEW GIG</button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderClips = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {mockClips.map(clip => (
        <div key={clip.id} className="glass-card rounded-3xl lg:rounded-[2rem] overflow-hidden border border-white/5 group h-full flex flex-col">
          <div className="aspect-video relative overflow-hidden bg-slate-900">
            <img src={clip.thumbnail} className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" alt={clip.title} />
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-100 group-hover:opacity-0 transition-opacity">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                <Play className="w-5 h-5 text-white fill-current ml-0.5" />
              </div>
            </div>
          </div>
          <div className="p-5 lg:p-6 flex-grow">
            <p className="text-[9px] lg:text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-2">{clip.comedian}</p>
            <h4 className="text-lg font-black italic uppercase text-white leading-tight tracking-tight group-hover:text-red-500 transition-colors line-clamp-2">{clip.title}</h4>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      {/* Dynamic Header */}
      <div className="relative">
        {/* Search Switcher - Top on Mobile, Relative on Desktop */}
        <div className="absolute top-6 left-0 right-0 z-50 px-4 md:hidden">
          <div className="flex flex-row gap-2">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-slate-500" />
              </div>
              <input 
                type="text"
                placeholder="Search scenes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsDropdownOpen(true)}
                className="w-full bg-[#0f1628]/95 backdrop-blur-xl border border-white/10 rounded-2xl py-4 pl-10 pr-10 text-white text-xs font-bold placeholder:text-slate-600 focus:outline-none focus:border-red-500/50 transition-all shadow-2xl"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              {isDropdownOpen && searchQuery && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#0f1628] border border-white/10 rounded-2xl overflow-hidden z-50 shadow-2xl">
                  {filteredScenes.length > 0 ? (
                    filteredScenes.map(scene => (
                      <button
                        key={scene.slug}
                        onClick={() => {
                          navigateTo(PageType.SCENES, scene.slug);
                          setIsDropdownOpen(false);
                          setSearchQuery('');
                        }}
                        className="w-full px-4 py-4 text-left hover:bg-white/5 flex items-center justify-between group"
                      >
                        <div>
                          <p className="text-white font-black italic uppercase tracking-tight text-xs">{scene.name}</p>
                        </div>
                        <ChevronRight className="w-3 h-3 text-slate-700" />
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-center text-slate-500 text-[10px] font-bold italic uppercase">No results</div>
                  )}
                </div>
              )}
            </div>
            
            <div className="relative shrink-0">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center justify-center bg-[#0f1628]/95 backdrop-blur-xl border border-white/10 rounded-2xl py-4 px-4 text-white text-[10px] font-black italic uppercase tracking-widest shadow-2xl min-w-[80px]"
              >
                <div className="flex items-center gap-1">
                  <span>SCENES</span>
                  <ChevronDown className={`w-3 h-3 text-red-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {isDropdownOpen && !searchQuery && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-[#0f1628] border border-white/10 rounded-2xl overflow-hidden z-50 shadow-2xl">
                  {AVAILABLE_SCENES.map(scene => (
                    <button
                      key={scene.slug}
                      onClick={() => {
                        navigateTo(PageType.SCENES, scene.slug);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full px-4 py-4 text-left hover:bg-white/5 flex items-center justify-between group"
                    >
                      <p className="text-white font-black italic uppercase tracking-tight text-xs">{scene.name}</p>
                      {sceneName.toLowerCase() === scene.name.toLowerCase() && <div className="w-1 h-1 bg-red-500 rounded-full" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="h-64 lg:h-96 w-full relative overflow-hidden">
          <img 
            src={sceneData.coverImage} 
            className="w-full h-full object-cover opacity-40" 
            alt={sceneData.name}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1a] via-[#0a0e1a]/20 to-transparent"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 relative -mt-32 pb-8">
          {/* Scene Switcher / Search (Desktop Only) */}
          <div className="hidden md:flex mb-12 flex-row gap-4 items-center">
            <div className="relative w-full max-w-md">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-slate-500" />
              </div>
              <input 
                type="text"
                placeholder="Search comedy scenes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsDropdownOpen(true)}
                className="w-full bg-[#0f1628]/90 backdrop-blur-xl border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white text-sm font-bold placeholder:text-slate-600 focus:outline-none focus:border-red-500/50 transition-all shadow-2xl"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-4 flex items-center text-slate-500 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              {isDropdownOpen && searchQuery && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#0f1628] border border-white/10 rounded-2xl overflow-hidden z-50 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                  {filteredScenes.length > 0 ? (
                    filteredScenes.map(scene => (
                      <button
                        key={scene.slug}
                        onClick={() => {
                          navigateTo(PageType.SCENES, scene.slug);
                          setIsDropdownOpen(false);
                          setSearchQuery('');
                        }}
                        className="w-full px-6 py-4 text-left hover:bg-white/5 flex items-center justify-between group transition-colors"
                      >
                        <div>
                          <p className="text-white font-black italic uppercase tracking-tight group-hover:text-red-500 transition-colors">{scene.name}</p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{scene.region}, {scene.country}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-red-500 transition-all" />
                      </button>
                    ))
                  ) : (
                    <div className="px-6 py-8 text-center">
                      <p className="text-slate-500 text-sm font-bold italic uppercase">No scenes found</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="relative w-full md:w-auto">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center justify-between md:justify-start gap-3 w-full md:w-auto bg-[#0f1628]/90 backdrop-blur-xl border border-white/10 rounded-2xl py-4 px-6 text-white text-sm font-bold hover:border-white/20 transition-all shadow-2xl whitespace-nowrap"
              >
                <span>MORE SCENES</span>
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDropdownOpen && !searchQuery && (
                <div className="absolute top-full left-0 md:left-auto md:right-0 mt-2 w-full md:w-64 bg-[#0f1628] border border-white/10 rounded-2xl overflow-hidden z-50 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-2 border-b border-white/5 bg-slate-900/50">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-4 py-2">Popular Scenes</p>
                  </div>
                  <div className="max-h-80 overflow-y-auto no-scrollbar">
                    {AVAILABLE_SCENES.map(scene => (
                      <button
                        key={scene.slug}
                        onClick={() => {
                          navigateTo(PageType.SCENES, scene.slug);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full px-6 py-4 text-left hover:bg-white/5 flex items-center justify-between group transition-colors ${sceneName.toLowerCase() === scene.name.toLowerCase() ? 'bg-white/5' : ''}`}
                      >
                        <div>
                          <p className={`font-black italic uppercase tracking-tight transition-colors ${sceneName.toLowerCase() === scene.name.toLowerCase() ? 'text-red-500' : 'text-white group-hover:text-red-500'}`}>{scene.name}</p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{scene.region}</p>
                        </div>
                        {sceneName.toLowerCase() === scene.name.toLowerCase() && <Check className="w-4 h-4 text-red-500" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-brand-gradient flex items-center justify-center shadow-2xl">
                  <Mic2 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-5xl lg:text-7xl font-black italic uppercase tracking-tighter text-white leading-none">
                    {sceneData.name}
                  </h1>
                  <p className="text-lg font-bold text-[#8892a4] uppercase tracking-[0.2em] flex items-center gap-2 mt-2">
                    <MapPin className="w-4 h-4 text-red-500" /> {sceneData.city}, {sceneData.state}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-8 bg-[#0f1628]/80 backdrop-blur-xl p-4 px-8 rounded-3xl border border-white/5">
              <div className="text-center">
                <p className="text-[10px] font-black text-[#8892a4] uppercase tracking-widest mb-1">FOLLOWERS</p>
                <p className="text-2xl font-black text-white italic uppercase">{sceneData.followers}</p>
              </div>
              <div className="h-10 w-px bg-white/10"></div>
              <button 
                onClick={handleFollowClick}
                className="bg-brand-gradient hover:opacity-90 text-white px-8 py-3 rounded-2xl text-sm font-black italic uppercase tracking-widest shadow-xl transition-all active:scale-95"
              >
                FOLLOW SCENE
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="sticky top-16 z-40 bg-[#0a0e1a]/95 backdrop-blur-md border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto no-scrollbar gap-2 py-4">
            {tabs.map((tab) => (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id)}
                className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest italic transition-all whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-white/10 text-white ring-1 ring-white/20' 
                    : 'text-[#8892a4] hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 py-12 pb-32">
        {activeTab === 'SHOWS' && renderShows(mockShows)}
        {activeTab === 'MICS' && renderShows(mockMics)}
        {activeTab === 'ROSTER' && renderRoster()}
        {activeTab === 'GIGS' && renderGigs()}
        {activeTab === 'CLIPS' && renderClips()}
      </div>
    </div>
  );
};
