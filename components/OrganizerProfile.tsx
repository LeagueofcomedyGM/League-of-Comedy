import React, { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import {
  doc, getDoc, getDocs, collection, query, where,
  updateDoc, arrayUnion, arrayRemove, increment,
} from 'firebase/firestore';
import { db } from '../firebase';
import { PageType } from '../types';
import { MapPin, Users, Briefcase, Loader2, Building2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { ApplyModal, ApplyGig } from './ApplyModal';

interface OrganizerData {
  uid:           string;
  name:          string;
  bio:           string;
  city:          string;
  state:         string;
  roles:         string[];
  bookingStyles: string[];
  bookingVibes:  string[];
  bookingLevels: string[];
  showTypes:     string[];
  followers:     string[];
}

interface ActiveGig {
  id:       string;
  title:    string;
  category: string;
  payRange: string;
  city:     string;
  state:    string;
  date:     string;
}

export const OrganizerProfile: React.FC<{
  uid:        string;
  navigateTo: (page: PageType, tab?: string) => void;
  authUser:   FirebaseUser | null;
  userRole?:  string;
}> = ({ uid, navigateTo, authUser, userRole }) => {
  const [loading,       setLoading]       = useState(true);
  const [profile,       setProfile]       = useState<OrganizerData | null>(null);
  const [activeGigs,    setActiveGigs]    = useState<ActiveGig[]>([]);
  const [isFollowing,   setIsFollowing]   = useState(false);
  const [followCount,   setFollowCount]   = useState(0);
  const [followLoading, setFollowLoading] = useState(false);
  const [gigAppStatuses, setGigAppStatuses] = useState<Record<string, string>>({});
  const [applyingToGig, setApplyingToGig] = useState<ApplyGig | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const oSnap = await getDoc(doc(db, 'organizers', uid));
        if (!oSnap.exists()) { setLoading(false); return; }
        const o = oSnap.data();
        if (o.is_public === false) { setLoading(false); return; }

        const followers: string[] = o.followers ?? [];
        setFollowCount(followers.length);
        setProfile({
          uid,
          name:          o.display_name             ?? '',
          bio:           o.bio                      ?? '',
          city:          o.city                     ?? '',
          state:         o.state                    ?? '',
          roles:         o.organizer_roles          ?? [],
          bookingStyles: o.booking_styles           ?? [],
          bookingVibes:  o.booking_vibes            ?? [],
          bookingLevels: o.booking_experience_levels ?? [],
          showTypes:     o.show_types               ?? [],
          followers,
        });

        const gigsSnap = await getDocs(
          query(collection(db, 'gigs'), where('posted_by_uid', '==', uid), where('status', '==', 'published'))
        );
        const gigDocs = gigsSnap.docs.map(d => {
          const g = d.data();
          return {
            id:       d.id,
            title:    g.title    ?? '',
            category: g.category ?? '',
            payRange: g.pay_range ?? '',
            city:     g.city     ?? '',
            state:    g.state    ?? '',
            date:     g.date     ?? '',
          };
        });
        setActiveGigs(gigDocs);

        if (authUser && userRole === 'comedian' && gigDocs.length > 0) {
          const gigIds = gigDocs.map(g => g.id);
          const appsSnap = await getDocs(
            query(collection(db, 'applications'),
              where('comedian_uid', '==', authUser.uid),
              where('gig_id', 'in', gigIds.slice(0, 30))
            )
          );
          const priority: Record<string, number> = { accepted: 3, pending: 2, declined: 1 };
          const statuses: Record<string, string> = {};
          appsSnap.docs.forEach(d => {
            const { gig_id, status = 'pending' } = d.data();
            if (!statuses[gig_id] || (priority[status] ?? 0) > (priority[statuses[gig_id]] ?? 0)) {
              statuses[gig_id] = status;
            }
          });
          setGigAppStatuses(statuses);
        }

        if (authUser) {
          const userSnap = await getDoc(doc(db, 'users', authUser.uid));
          const following: string[] = userSnap.data()?.following_organizers ?? [];
          setIsFollowing(following.includes(uid));
        }
      } catch { /* ignore */ }
      setLoading(false);
    }
    load();
  }, [uid, authUser]);

  const handleFollow = async () => {
    if (!authUser || !profile) return;
    const nowFollowing = !isFollowing;
    setIsFollowing(nowFollowing);
    setFollowCount(c => c + (nowFollowing ? 1 : -1));
    setFollowLoading(true);
    try {
      await Promise.all([
        updateDoc(doc(db, 'users', authUser.uid), {
          following_organizers: nowFollowing ? arrayUnion(uid) : arrayRemove(uid),
        }),
        updateDoc(doc(db, 'organizers', uid), {
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

  const isOwnProfile = authUser?.uid === uid;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-amber-500 opacity-60" />
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-slate-500">
      <Building2 className="w-12 h-12 opacity-20" />
      <p className="text-sm font-black uppercase tracking-widest">Profile not available</p>
      <button onClick={() => navigateTo(PageType.SCENES)} className="text-xs text-amber-500 hover:text-amber-400 font-bold uppercase tracking-widest">← Back to Scenes</button>
    </div>
  );

  const location = [profile.city, profile.state].filter(Boolean).join(', ');
  const initials  = profile.name.split(' ').map(w => w[0]).filter(Boolean).join('').slice(0, 2).toUpperCase();
  const hasPrefs  = profile.bookingStyles.length > 0 || profile.bookingVibes.length > 0 || profile.bookingLevels.length > 0 || profile.showTypes.length > 0;

  return (
    <>
    <div className="min-h-screen pb-24 lg:pb-8">

      {/* Back */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
      </div>

      {/* Hero */}
      <div className="relative mt-4">
        <div className="h-44 sm:h-60 bg-gradient-to-br from-[#1a0830] via-[#0f1628] to-[#0a0e1a] relative overflow-hidden">
          <Building2 className="absolute -right-6 -bottom-6 w-56 h-56 text-white opacity-[0.03]" />
        </div>
        <div className="absolute bottom-0 left-6 sm:left-8 translate-y-1/2">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-red-600 to-amber-500 border-4 border-[#0a0e1a] flex items-center justify-center shadow-2xl">
            <span className="text-2xl sm:text-3xl font-black italic text-white">{initials || '?'}</span>
          </div>
        </div>
      </div>

      {/* Identity */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-16 sm:pt-18">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-5xl font-black italic uppercase tracking-tighter text-white leading-none">
              {profile.name || 'Organizer'}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {location && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
                  <MapPin className="w-3 h-3 text-red-500" /> {location}
                </span>
              )}
              {profile.roles.map(r => (
                <span key={r} className="px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-[9px] font-black uppercase tracking-widest text-red-400">{r}</span>
              ))}
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
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">

          {profile.bio && (
            <div className="glass-card p-6 rounded-[2rem] border-slate-800">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">About</h2>
              <p className="text-sm text-slate-300 leading-relaxed">{profile.bio}</p>
            </div>
          )}

          {activeGigs.length > 0 && (
            <div className="glass-card p-6 rounded-[2rem] border-slate-800">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Open Gigs</h2>
              <div className="space-y-3">
                {activeGigs.map(gig => {
                  const appStatus = gigAppStatuses[gig.id];
                  const canApply = userRole === 'comedian' && authUser && authUser.uid !== uid;
                  return (
                    <div
                      key={gig.id}
                      className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/30 hover:bg-slate-900 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="text-sm font-black italic uppercase tracking-tight text-white group-hover:text-amber-400 transition-colors truncate">{gig.title}</h3>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {gig.category && <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{gig.category}</span>}
                            {gig.payRange  && <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">{gig.payRange}</span>}
                            {[gig.city, gig.state].filter(Boolean).join(', ') && (
                              <span className="text-[9px] font-bold text-slate-500 flex items-center gap-0.5">
                                <MapPin className="w-2.5 h-2.5" />{[gig.city, gig.state].filter(Boolean).join(', ')}
                              </span>
                            )}
                            {gig.date && (
                              <span className="text-[9px] font-bold text-slate-500">
                                {new Date(gig.date + 'T00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            )}
                          </div>
                        </div>
                        <Briefcase className="w-4 h-4 text-slate-600 group-hover:text-amber-500 transition-colors shrink-0 mt-0.5" />
                      </div>

                      {canApply && (
                        <div className="mt-3 pt-3 border-t border-slate-800 flex justify-end">
                          {appStatus === 'declined' ? (
                            <span className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-500 bg-slate-800 border border-slate-700">
                              Not Selected
                            </span>
                          ) : appStatus === 'pending' || appStatus === 'accepted' ? (
                            <span className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3" /> Applied
                            </span>
                          ) : (
                            <button
                              onClick={() => setApplyingToGig({ id: gig.id, title: gig.title, category: gig.category, pay_range: gig.payRange, city: gig.city, state: gig.state })}
                              className="px-4 py-1.5 rounded-lg bg-brand-gradient text-white text-[9px] font-black uppercase italic tracking-widest hover:opacity-90 transition-all shadow-lg shadow-orange-900/20 active:scale-95"
                            >
                              Apply Now
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar: booking preferences */}
        {hasPrefs && (
          <div className="glass-card p-6 rounded-[2rem] border-slate-800 space-y-4 h-fit">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Booking Preferences</h2>
            {profile.showTypes.length > 0 && (
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-1.5">Show Types</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.showTypes.map(s => (
                    <span key={s} className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[9px] font-black uppercase tracking-widest text-amber-400">{s}</span>
                  ))}
                </div>
              </div>
            )}
            {profile.bookingStyles.length > 0 && (
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-1.5">Comedy Styles</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.bookingStyles.map(s => (
                    <span key={s} className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-slate-400">{s}</span>
                  ))}
                </div>
              </div>
            )}
            {profile.bookingVibes.length > 0 && (
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-1.5">Vibes</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.bookingVibes.map(v => (
                    <span key={v} className="px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[9px] font-black uppercase tracking-widest text-purple-400">{v}</span>
                  ))}
                </div>
              </div>
            )}
            {profile.bookingLevels.length > 0 && (
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-1.5">Experience Levels</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.bookingLevels.map(l => (
                    <span key={l} className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[9px] font-black uppercase tracking-widest text-blue-400">{l}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>

    {applyingToGig && (
      <ApplyModal
        gig={applyingToGig}
        authUser={authUser}
        onClose={() => setApplyingToGig(null)}
        onSuccess={gigId => { setGigAppStatuses(prev => ({ ...prev, [gigId]: 'pending' })); setApplyingToGig(null); }}
      />
    )}
  </>
  );
};
