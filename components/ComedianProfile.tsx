import React, { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import {
  doc, getDoc, updateDoc, arrayUnion, arrayRemove, increment,
} from 'firebase/firestore';
import { db } from '../firebase';
import { PageType } from '../types';
import { MapPin, Users, Globe, Loader2, Mic2, ArrowLeft, DollarSign } from 'lucide-react';

function getEmbedUrl(url: string): string | null {
  try {
    const ytShort = url.match(/youtu\.be\/([^?&]+)/);
    if (ytShort) return `https://www.youtube.com/embed/${ytShort[1]}`;
    const ytFull  = url.match(/[?&]v=([^&]+)/);
    if (ytFull)  return `https://www.youtube.com/embed/${ytFull[1]}`;
    const vimeo  = url.match(/vimeo\.com\/(\d+)/);
    if (vimeo)   return `https://player.vimeo.com/video/${vimeo[1]}`;
    return null;
  } catch { return null; }
}

interface ComedianData {
  docId:     string;
  uid:       string;
  name:      string;
  image:     string;
  bio:       string;
  location:  string;
  level:     string;
  styles:    string[];
  vibes:     string[];
  themes:    string[];
  setLengths: string[];
  rateRange: string;
  payments:  string[];
  languages: string[];
  clipLink:  string;
  website:   string;
  instagram: string;
  tiktok:    string;
  youtube:   string;
  xLink:     string;
  facebook:  string;
  imdb:      string;
  followers: string[];
}

export const ComedianProfile: React.FC<{
  docId:      string;
  navigateTo: (page: PageType, tab?: string) => void;
  authUser:   FirebaseUser | null;
}> = ({ docId, navigateTo, authUser }) => {
  const [loading,       setLoading]       = useState(true);
  const [profile,       setProfile]       = useState<ComedianData | null>(null);
  const [isFollowing,   setIsFollowing]   = useState(false);
  const [followCount,   setFollowCount]   = useState(0);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const snap = await getDoc(doc(db, 'comedians', docId));
        if (!snap.exists()) { setLoading(false); return; }
        const d = snap.data();
        const followers: string[] = d.followers ?? [];
        setFollowCount(followers.length);
        setProfile({
          docId:     snap.id,
          uid:       d.uid ?? snap.id,
          name:      d.comedian_name     ?? '',
          image:     d.comedian_image    ?? '',
          bio:       d.bio               ?? '',
          location:  d.location          ?? '',
          level:     d.experience_level  ?? '',
          styles:    d.comedy_styles     ?? [],
          vibes:     d.comedy_vibes      ?? [],
          themes:    d.comedy_themes     ?? [],
          setLengths: d.set_lengths      ?? [],
          rateRange: d.rate_range        ?? '',
          payments:  d.payment_methods   ?? [],
          languages: d.languages_spoken  ?? [],
          clipLink:  d.comedy_clip_link  ?? '',
          website:   d.comedian_website  ?? '',
          instagram: d.instagram_link    ?? '',
          tiktok:    d.tiktok_link       ?? '',
          youtube:   d.youtube_link      ?? '',
          xLink:     d.x_link            ?? '',
          facebook:  d.facebook_link     ?? '',
          imdb:      d.imdb_link         ?? '',
          followers,
        });
        if (authUser) {
          const userSnap = await getDoc(doc(db, 'users', authUser.uid));
          const following: string[] = userSnap.data()?.following_comedians ?? [];
          setIsFollowing(following.includes(snap.id));
        }
      } catch { /* ignore */ }
      setLoading(false);
    }
    load();
  }, [docId, authUser]);

  const handleFollow = async () => {
    if (!authUser || !profile) return;
    const nowFollowing = !isFollowing;
    setIsFollowing(nowFollowing);
    setFollowCount(c => c + (nowFollowing ? 1 : -1));
    setFollowLoading(true);
    try {
      await Promise.all([
        updateDoc(doc(db, 'users', authUser.uid), {
          following_comedians: nowFollowing ? arrayUnion(profile.docId) : arrayRemove(profile.docId),
        }),
        updateDoc(doc(db, 'comedians', profile.docId), {
          followers:      nowFollowing ? arrayUnion(authUser.uid) : arrayRemove(authUser.uid),
          follower_count: increment(nowFollowing ? 1 : -1),
        }),
      ]);
    } catch {
      setIsFollowing(!nowFollowing);
      setFollowCount(c => c + (nowFollowing ? -1 : 1));
    }
    setFollowLoading(false);
  };

  const isOwnProfile = authUser && profile && authUser.uid === profile.uid;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-amber-500 opacity-60" />
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-slate-500">
      <Mic2 className="w-12 h-12 opacity-20" />
      <p className="text-sm font-black uppercase tracking-widest">Comedian not found</p>
      <button onClick={() => navigateTo(PageType.SCENES)} className="text-xs text-amber-500 hover:text-amber-400 font-bold uppercase tracking-widest">← Back to Scenes</button>
    </div>
  );

  const embedUrl = profile.clipLink ? getEmbedUrl(profile.clipLink) : null;
  const hasSocials = profile.instagram || profile.tiktok || profile.youtube || profile.xLink || profile.facebook || profile.imdb || profile.website;
  const hasBooking = profile.rateRange || profile.setLengths.length > 0 || profile.payments.length > 0 || profile.languages.length > 0;
  const hasTags    = profile.styles.length > 0 || profile.vibes.length > 0 || profile.themes.length > 0;

  return (
    <div className="min-h-screen pb-24 lg:pb-8">

      {/* Back */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-0">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
      </div>

      {/* Hero */}
      <div className="relative mt-4">
        {embedUrl ? (
          <div className="w-full bg-black overflow-hidden" style={{ maxHeight: 420 }}>
            <div className="aspect-video max-h-[420px]">
              <iframe
                src={embedUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={`${profile.name} — Comedy Clip`}
              />
            </div>
          </div>
        ) : (
          <div className="h-44 sm:h-60 bg-gradient-to-br from-[#1a0a2e] via-[#0f1628] to-[#0a0e1a] relative overflow-hidden">
            <Mic2 className="absolute -right-6 -bottom-6 w-56 h-56 text-white opacity-[0.03]" />
          </div>
        )}

        {/* Avatar */}
        <div className="absolute bottom-0 left-6 sm:left-8 translate-y-1/2">
          {profile.image ? (
            <img
              src={profile.image}
              alt={profile.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl sm:rounded-3xl object-cover border-4 border-[#0a0e1a] shadow-2xl"
            />
          ) : (
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl sm:rounded-3xl bg-amber-500/10 border-4 border-[#0a0e1a] flex items-center justify-center shadow-2xl">
              <Mic2 className="w-10 h-10 text-amber-500 opacity-60" />
            </div>
          )}
        </div>
      </div>

      {/* Identity */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-16 sm:pt-18">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-5xl font-black italic uppercase tracking-tighter text-white leading-none">
              {profile.name || 'Comedian'}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {profile.location && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
                  <MapPin className="w-3 h-3 text-red-500" /> {profile.location}
                </span>
              )}
              {profile.level && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[9px] font-black uppercase tracking-widest text-amber-400">
                  {profile.level}
                </span>
              )}
              <span className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
                <Users className="w-3 h-3" /> {followCount.toLocaleString()} followers
              </span>
            </div>
          </div>

          {!isOwnProfile && authUser && (
            <button
              onClick={handleFollow}
              disabled={followLoading}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase italic tracking-widest transition-all disabled:opacity-50 shrink-0 ${
                isFollowing
                  ? 'bg-white/5 border border-white/10 text-slate-300 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400'
                  : 'bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-900/30'
              }`}
            >
              {isFollowing ? 'Following' : '+ Follow'}
            </button>
          )}
        </div>

        {/* Social icon links */}
        {hasSocials && (
          <div className="flex flex-wrap gap-2 mt-5">
            {profile.instagram && (
              <a href={profile.instagram} target="_blank" rel="noopener noreferrer" title="Instagram"
                className="w-9 h-9 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center hover:bg-pink-500/20 transition-all">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-pink-400" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
            )}
            {profile.tiktok && (
              <a href={profile.tiktok} target="_blank" rel="noopener noreferrer" title="TikTok"
                className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z"/>
                </svg>
              </a>
            )}
            {profile.youtube && (
              <a href={profile.youtube} target="_blank" rel="noopener noreferrer" title="YouTube"
                className="w-9 h-9 rounded-xl bg-red-600/10 border border-red-600/20 flex items-center justify-center hover:bg-red-600/20 transition-all">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-red-500" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            )}
            {profile.xLink && (
              <a href={profile.xLink} target="_blank" rel="noopener noreferrer" title="X / Twitter"
                className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            )}
            {profile.facebook && (
              <a href={profile.facebook} target="_blank" rel="noopener noreferrer" title="Facebook"
                className="w-9 h-9 rounded-xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center hover:bg-blue-600/20 transition-all">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-blue-400" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            )}
            {profile.imdb && (
              <a href={profile.imdb} target="_blank" rel="noopener noreferrer" title="IMDb"
                className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center hover:bg-amber-500/20 transition-all">
                <span className="text-[9px] font-black text-amber-400 tracking-tight">IMDb</span>
              </a>
            )}
            {profile.website && (
              <a href={profile.website} target="_blank" rel="noopener noreferrer" title="Website"
                className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all">
                <Globe className="w-4 h-4 text-slate-400" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Content grid */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">

          {profile.bio && (
            <div className="glass-card p-6 rounded-[2rem] border-slate-800">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">About</h2>
              <p className="text-sm text-slate-300 leading-relaxed">{profile.bio}</p>
            </div>
          )}

          {hasTags && (
            <div className="glass-card p-6 rounded-[2rem] border-slate-800 space-y-5">
              {profile.styles.length > 0 && (
                <div>
                  <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Style</h2>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.styles.map(s => (
                      <span key={s} className="px-2.5 py-1 rounded-full bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-widest text-slate-300">{s}</span>
                    ))}
                  </div>
                </div>
              )}
              {profile.vibes.length > 0 && (
                <div>
                  <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Vibes</h2>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.vibes.map(v => (
                      <span key={v} className="px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[9px] font-black uppercase tracking-widest text-purple-400">{v}</span>
                    ))}
                  </div>
                </div>
              )}
              {profile.themes.length > 0 && (
                <div>
                  <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Themes</h2>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.themes.map(t => (
                      <span key={t} className="px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[9px] font-black uppercase tracking-widest text-blue-400">{t}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Non-embeddable clip fallback */}
          {profile.clipLink && !embedUrl && (
            <div className="glass-card p-6 rounded-[2rem] border-slate-800">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Featured Clip</h2>
              <a href={profile.clipLink} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-red-500/40 hover:bg-slate-900 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-600/20 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 text-red-500" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                </div>
                <p className="text-xs font-black uppercase italic tracking-tight text-white group-hover:text-red-400 transition-colors">Watch Comedy Clip →</p>
              </a>
            </div>
          )}
        </div>

        {/* Sidebar */}
        {hasBooking && (
          <div className="glass-card p-6 rounded-[2rem] border-slate-800 space-y-4 h-fit">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Booking</h2>
            {profile.rateRange && (
              <div className="flex items-center gap-2">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-sm font-bold text-emerald-400">{profile.rateRange}</span>
              </div>
            )}
            {profile.setLengths.length > 0 && (
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-1.5">Set Lengths</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.setLengths.map(s => (
                    <span key={s} className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[9px] font-black uppercase tracking-widest text-blue-400">{s}</span>
                  ))}
                </div>
              </div>
            )}
            {profile.payments.length > 0 && (
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-1.5">Payment</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.payments.map(p => (
                    <span key={p} className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-slate-400">{p}</span>
                  ))}
                </div>
              </div>
            )}
            {profile.languages.length > 0 && (
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-1.5">Languages</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.languages.map(l => (
                    <span key={l} className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-slate-400">{l}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
