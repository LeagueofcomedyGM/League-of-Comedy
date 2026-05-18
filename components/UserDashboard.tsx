import React, { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import {
  doc, getDoc, updateDoc,
  collection, query, where, limit, getDocs,
} from 'firebase/firestore';
import { db } from '../firebase';
import { UserRole } from '../types';
import {
  Trophy,
  Ticket,
  Settings,
  MessageSquare,
  Star,
  Zap,
  LayoutDashboard,
  Calendar,
  Briefcase,
  Users,
  Heart,
  QrCode,
  Clock,
  Plus,
  UserSearch,
  MapPin,
  Mic2,
  ArrowRight,
  PencilLine,
  Loader2,
  Check,
} from 'lucide-react';

interface UserDashboardProps {
  role: UserRole;
  authUser: FirebaseUser | null;
  initialTab?: string | null;
}

// ── Nav config per role ────────────────────────────────────────────────────────

const NAV_ITEMS: Record<string, { id: string; label: string; icon: React.ReactNode }[]> = {
  fan: [
    { id: 'home',         label: 'Overview',     icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'edit-profile', label: 'Edit Profile',  icon: <PencilLine className="w-4 h-4" /> },
    { id: 'tickets',      label: 'My Tickets',    icon: <Ticket className="w-4 h-4" /> },
    { id: 'following',    label: 'Following',     icon: <Heart className="w-4 h-4" /> },
    { id: 'settings',     label: 'Settings',      icon: <Settings className="w-4 h-4" /> },
  ],
  comedian: [
    { id: 'home',         label: 'Overview',     icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'edit-profile', label: 'Edit Profile',  icon: <PencilLine className="w-4 h-4" /> },
    { id: 'events',       label: 'My Events',    icon: <Calendar className="w-4 h-4" /> },
    { id: 'gigs',         label: 'Gig Board',    icon: <Briefcase className="w-4 h-4" /> },
    { id: 'tickets',      label: 'My Tickets',   icon: <Ticket className="w-4 h-4" /> },
    { id: 'following',    label: 'Following',    icon: <Heart className="w-4 h-4" /> },
    { id: 'messages',     label: 'Messages',     icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'settings',     label: 'Settings',     icon: <Settings className="w-4 h-4" /> },
  ],
  organizer: [
    { id: 'home',         label: 'Overview',     icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'edit-profile', label: 'Edit Profile',  icon: <PencilLine className="w-4 h-4" /> },
    { id: 'events',       label: 'My Events',    icon: <Calendar className="w-4 h-4" /> },
    { id: 'gigs',         label: 'Gig Board',    icon: <Briefcase className="w-4 h-4" /> },
    { id: 'tickets',      label: 'My Tickets',   icon: <Ticket className="w-4 h-4" /> },
    { id: 'following',    label: 'Following',    icon: <Heart className="w-4 h-4" /> },
    { id: 'messages',     label: 'Messages',     icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'settings',     label: 'Settings',     icon: <Settings className="w-4 h-4" /> },
  ],
  venue: [
    { id: 'home',         label: 'Overview',     icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'edit-profile', label: 'Edit Profile',  icon: <PencilLine className="w-4 h-4" /> },
    { id: 'settings',     label: 'Settings',     icon: <Settings className="w-4 h-4" /> },
  ],
};

// ── Stats per role ─────────────────────────────────────────────────────────────

const STATS: Record<string, { label: string; val: string; icon: React.ReactNode }[]> = {
  fan: [
    { label: 'Shows Attended', val: '0', icon: <Ticket className="text-red-500" /> },
    { label: 'LAF Points',     val: '0', icon: <Trophy className="text-amber-500" /> },
    { label: 'Following',      val: '0', icon: <Heart className="text-blue-500" /> },
    { label: 'Leaderboard',    val: '—', icon: <Star className="text-purple-500" /> },
  ],
  comedian: [
    { label: 'Followers',      val: '0', icon: <Users className="text-red-500" /> },
    { label: 'Upcoming Shows', val: '0', icon: <Calendar className="text-amber-500" /> },
    { label: 'LAF Points',     val: '0', icon: <Trophy className="text-blue-500" /> },
    { label: 'Gig Invites',    val: '0', icon: <Briefcase className="text-emerald-500" /> },
  ],
  organizer: [
    { label: 'Shows Created',  val: '0', icon: <Calendar className="text-red-500" /> },
    { label: 'Tickets Sold',   val: '0', icon: <Ticket className="text-amber-500" /> },
    { label: 'Talent Booked',  val: '0', icon: <Mic2 className="text-emerald-500" /> },
    { label: 'Followers',      val: '0', icon: <Users className="text-blue-500" /> },
  ],
  venue: [
    { label: 'Shows',          val: '0', icon: <Calendar className="text-red-500" /> },
    { label: 'Followers',      val: '0', icon: <Users className="text-blue-500" /> },
    { label: 'LAF Points',     val: '0', icon: <Trophy className="text-amber-500" /> },
    { label: 'Leaderboard',    val: '—', icon: <Star className="text-purple-500" /> },
  ],
};

const ROLE_LABELS: Record<string, string> = {
  fan:       'Fan',
  comedian:  'Comedian',
  organizer: 'Event Organizer',
  venue:     'Venue',
};

const WELCOME_SUBTITLES: Record<string, string> = {
  fan:       'Discover shows, follow your favourite comedians, and earn LAF points.',
  comedian:  'Manage your bookings, apply to gigs, and grow your audience.',
  organizer: 'Post gigs, manage your shows, and book the best talent.',
  venue:     'Manage your venue listings and connect with organisers.',
};

const COMEDY_STYLES  = ['Alt/Surreal', 'Deadpan', 'Impressions', 'Musical/Variety', 'Physical/Slapstick', 'Storytelling'];
const COMEDY_VIBES   = ['Clean/Family Friendly', 'Mature/Adult', 'Edgy/Explicit'];
const COMEDY_THEMES  = ['Cultural', 'Dark', 'Topical/Political'];

// ── Shared form field ──────────────────────────────────────────────────────────

const Field: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  textarea?: boolean;
}> = ({ label, value, onChange, placeholder, type = 'text', textarea }) => (
  <div>
    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
      {label}
    </label>
    {textarea ? (
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full bg-[#131b2e] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-red-500 transition-colors resize-none"
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#131b2e] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-red-500 transition-colors"
      />
    )}
  </div>
);

// ── Multi-select pill picker ───────────────────────────────────────────────────

const MultiSelect: React.FC<{
  label: string;
  hint?: string;
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
}> = ({ label, hint, options, selected, onChange }) => {
  const toggle = (opt: string) =>
    onChange(selected.includes(opt) ? selected.filter(s => s !== opt) : [...selected, opt]);

  return (
    <div>
      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{label}</label>
      {hint && <p className="text-[10px] text-slate-600 mb-3 font-medium">{hint}</p>}
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
              selected.includes(opt)
                ? 'bg-red-600 text-white'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:border-slate-600 hover:text-white'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

// ── Edit Profile panel ─────────────────────────────────────────────────────────

const EditProfile: React.FC<{ uid: string; role: UserRole }> = ({ uid, role }) => {
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [comedianDocId, setComedianDocId] = useState(uid);
  const [fields, setFields]     = useState<Record<string, string>>({});
  const [styles, setStyles]     = useState<string[]>([]);
  const [vibes, setVibes]       = useState<string[]>([]);
  const [themes, setThemes]     = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        if (role === 'comedian') {
          const snap = await getDocs(
            query(collection(db, 'comedians'), where('uid', '==', uid), limit(1))
          );
          if (!snap.empty) {
            const d = snap.docs[0];
            setComedianDocId(d.id);
            const data = d.data();
            setFields({
              comedian_name:    data.comedian_name    ?? '',
              bio:              data.bio              ?? '',
              current_city:     data.current_city     ?? '',
              comedian_website: data.comedian_website ?? '',
              comedy_clip_link: data.comedy_clip_link ?? '',
              instagram_link:   data.instagram_link   ?? '',
              facebook_link:    data.facebook_link    ?? '',
              x_link:           data.x_link           ?? '',
              tiktok_link:      data.tiktok_link      ?? '',
              youtube_link:     data.youtube_link     ?? '',
              imdb_link:        data.imdb_link        ?? '',
            });
            setStyles(data.comedy_styles ?? []);
            setVibes(data.comedy_vibes   ?? []);
            setThemes(data.comedy_themes ?? []);
          }
        } else if (role === 'organizer') {
          const [uSnap, oSnap] = await Promise.all([
            getDoc(doc(db, 'users', uid)),
            getDoc(doc(db, 'organizers', uid)),
          ]);
          const u = uSnap.data() ?? {};
          const o = oSnap.data() ?? {};
          setFields({
            display_name: u.display_name ?? '',
            phone:        o.phone        ?? '',
            city:         o.city         ?? '',
            state:        o.state        ?? '',
            bio:          o.bio          ?? '',
          });
        } else {
          const snap = await getDoc(doc(db, 'users', uid));
          const data = snap.data() ?? {};
          setFields({
            display_name: data.display_name ?? '',
            location:     data.location     ?? '',
          });
        }
      } catch { /* ignore */ }
      setLoading(false);
    }
    load();
  }, [uid, role]);

  const set = (k: string, v: string) => setFields(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      if (role === 'comedian') {
        await updateDoc(doc(db, 'comedians', comedianDocId), {
          ...fields,
          comedy_styles: styles,
          comedy_vibes:  vibes,
          comedy_themes: themes,
        });
      } else if (role === 'organizer') {
        const { display_name, phone, city, state, bio } = fields;
        await Promise.all([
          updateDoc(doc(db, 'users', uid),      { display_name }),
          updateDoc(doc(db, 'organizers', uid), { phone, city, state, bio }),
        ]);
      } else {
        await updateDoc(doc(db, 'users', uid), fields);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { /* ignore */ }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="glass-card p-20 rounded-[2.5rem] border-slate-800 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-500 opacity-60" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="glass-card p-8 rounded-[2.5rem] border-slate-800">
        <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-8">Edit Profile</h2>

        <div className="space-y-5 max-w-2xl">
          {role === 'comedian' && (
            <>
              <Field label="Display Name" value={fields.comedian_name ?? ''} onChange={v => set('comedian_name', v)} placeholder="Your stage name" />
              <Field label="Bio" value={fields.bio ?? ''} onChange={v => set('bio', v)} placeholder="Tell bookers and fans about yourself" textarea />
              <Field label="Current City" value={fields.current_city ?? ''} onChange={v => set('current_city', v)} placeholder="e.g. Los Angeles, CA" />
              <Field label="Website" value={fields.comedian_website ?? ''} onChange={v => set('comedian_website', v)} placeholder="https://yoursite.com" type="url" />
              <Field label="Comedy Clip" value={fields.comedy_clip_link ?? ''} onChange={v => set('comedy_clip_link', v)} placeholder="YouTube or Vimeo link" type="url" />

              <hr className="border-slate-800" />
              <h3 className="text-xs font-black italic uppercase tracking-widest text-slate-400">Social Links</h3>

              <Field label="Instagram" value={fields.instagram_link ?? ''} onChange={v => set('instagram_link', v)} placeholder="https://instagram.com/yourhandle" type="url" />
              <Field label="TikTok" value={fields.tiktok_link ?? ''} onChange={v => set('tiktok_link', v)} placeholder="https://tiktok.com/@yourhandle" type="url" />
              <Field label="X / Twitter" value={fields.x_link ?? ''} onChange={v => set('x_link', v)} placeholder="https://x.com/yourhandle" type="url" />
              <Field label="Facebook" value={fields.facebook_link ?? ''} onChange={v => set('facebook_link', v)} placeholder="https://facebook.com/yourpage" type="url" />
              <Field label="YouTube" value={fields.youtube_link ?? ''} onChange={v => set('youtube_link', v)} placeholder="https://youtube.com/@yourchannel" type="url" />
              <Field label="IMDb" value={fields.imdb_link ?? ''} onChange={v => set('imdb_link', v)} placeholder="https://imdb.com/name/..." type="url" />

              <hr className="border-slate-800" />
              <h3 className="text-xs font-black italic uppercase tracking-widest text-slate-400">How Bookers & Fans Find You</h3>

              <MultiSelect label="Comedy Style" options={COMEDY_STYLES} selected={styles} onChange={setStyles} />
              <MultiSelect label="Comedy Vibe" options={COMEDY_VIBES} selected={vibes} onChange={setVibes} />
              <MultiSelect label="Comedy Themes" hint="Optional" options={COMEDY_THEMES} selected={themes} onChange={setThemes} />
            </>
          )}

          {role === 'organizer' && (
            <>
              <Field label="Display Name" value={fields.display_name ?? ''} onChange={v => set('display_name', v)} placeholder="Your name or organisation" />
              <Field label="Bio" value={fields.bio ?? ''} onChange={v => set('bio', v)} placeholder="Tell comedians about the shows you run" textarea />
              <Field label="Phone" value={fields.phone ?? ''} onChange={v => set('phone', v)} placeholder="+1 (555) 000-0000" type="tel" />
              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="City" value={fields.city ?? ''} onChange={v => set('city', v)} placeholder="e.g. New York" />
                <Field label="State" value={fields.state ?? ''} onChange={v => set('state', v)} placeholder="e.g. NY" />
              </div>
            </>
          )}

          {(role === 'fan' || role === 'venue') && (
            <>
              <Field label="Display Name" value={fields.display_name ?? ''} onChange={v => set('display_name', v)} placeholder="How should we address you?" />
              <Field label="Location" value={fields.location ?? ''} onChange={v => set('location', v)} placeholder="e.g. Chicago, IL" />
            </>
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={saving || saved}
          className={`mt-8 flex items-center gap-2 px-8 py-3 rounded-xl text-xs font-black uppercase italic tracking-widest transition-all ${
            saved
              ? 'bg-emerald-600 text-white cursor-default'
              : 'bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed'
          }`}
        >
          {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {saved   && <Check className="w-3.5 h-3.5" />}
          {saved ? 'Saved!' : saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

// ── Fan discovery preferences (Settings tab) ──────────────────────────────────

const FanPreferencesSettings: React.FC<{ uid: string }> = ({ uid }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [styles, setStyles]   = useState<string[]>([]);
  const [vibes, setVibes]     = useState<string[]>([]);
  const [themes, setThemes]   = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDoc(doc(db, 'users', uid));
        const data = snap.data() ?? {};
        setStyles(data.comedy_styles ?? []);
        setVibes(data.comedy_vibes   ?? []);
        setThemes(data.comedy_themes ?? []);
      } catch { /* ignore */ }
      setLoading(false);
    }
    load();
  }, [uid]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', uid), {
        comedy_styles: styles,
        comedy_vibes:  vibes,
        comedy_themes: themes,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { /* ignore */ }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="glass-card p-12 rounded-[2.5rem] border-slate-800 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-red-500 opacity-60" />
      </div>
    );
  }

  return (
    <div className="glass-card p-8 rounded-[2.5rem] border-slate-800">
      <h3 className="text-2xl font-black italic uppercase mb-1">Discovery Preferences</h3>
      <p className="text-xs text-slate-500 font-medium mb-8">
        Private — used to surface shows, comedians, and clips that match your taste.
      </p>
      <div className="space-y-6">
        <MultiSelect label="Comedy Style" options={COMEDY_STYLES} selected={styles} onChange={setStyles} />
        <MultiSelect label="Comedy Vibe" options={COMEDY_VIBES} selected={vibes} onChange={setVibes} />
        <MultiSelect label="Comedy Themes" hint="Optional" options={COMEDY_THEMES} selected={themes} onChange={setThemes} />
      </div>
      <button
        onClick={handleSave}
        disabled={saving || saved}
        className={`mt-8 flex items-center gap-2 px-8 py-3 rounded-xl text-xs font-black uppercase italic tracking-widest transition-all ${
          saved
            ? 'bg-emerald-600 text-white cursor-default'
            : 'bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed'
        }`}
      >
        {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
        {saved   && <Check className="w-3.5 h-3.5" />}
        {saved ? 'Saved!' : saving ? 'Saving…' : 'Save Preferences'}
      </button>
    </div>
  );
};

// ── Action cards (Comedian + Organizer only) ───────────────────────────────────

const ActionCards = () => (
  <div className="grid sm:grid-cols-2 gap-4">
    <div className="glass-card p-6 rounded-3xl border-slate-800 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-red-600/10 rounded-2xl border border-red-600/20">
          <Plus className="w-5 h-5 text-red-500" />
        </div>
        <div>
          <h4 className="text-sm font-black italic uppercase tracking-tight text-white">Create an Event</h4>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">Plan a show, set a date, and sell tickets.</p>
        </div>
      </div>
      <button
        disabled
        className="w-full flex items-center justify-center gap-2 bg-red-600/10 border border-red-600/20 text-red-400 py-3 rounded-xl text-[10px] font-black uppercase italic tracking-widest cursor-not-allowed opacity-60"
      >
        Coming Soon <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>

    <div className="glass-card p-6 rounded-3xl border-slate-800 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20">
          <UserSearch className="w-5 h-5 text-amber-500" />
        </div>
        <div>
          <h4 className="text-sm font-black italic uppercase tracking-tight text-white">Book Talent</h4>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">Find and invite comedians to your shows.</p>
        </div>
      </div>
      <button
        disabled
        className="w-full flex items-center justify-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 py-3 rounded-xl text-[10px] font-black uppercase italic tracking-widest cursor-not-allowed opacity-60"
      >
        Coming Soon <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  </div>
);

// ── Capability lists ───────────────────────────────────────────────────────────

const FanCapabilities = () => (
  <div className="glass-card p-6 rounded-3xl border-slate-800">
    <h3 className="text-sm font-black italic uppercase tracking-widest text-white mb-4">What You Can Do</h3>
    <ul className="space-y-3">
      {[
        { icon: <MapPin className="w-3.5 h-3.5 text-red-400" />,    text: 'Discover shows, comedians, venues & festivals' },
        { icon: <Ticket className="w-3.5 h-3.5 text-amber-400" />,  text: 'Buy tickets to live shows' },
        { icon: <Heart className="w-3.5 h-3.5 text-pink-400" />,    text: 'Follow comedians and scenes' },
        { icon: <Star className="w-3.5 h-3.5 text-blue-400" />,     text: 'Like, comment, and share clips' },
        { icon: <Trophy className="w-3.5 h-3.5 text-purple-400" />, text: 'Earn LAF points and climb the leaderboard' },
        { icon: <QrCode className="w-3.5 h-3.5 text-emerald-400" />,text: 'Check in at shows via QR code' },
      ].map((item, i) => (
        <li key={i} className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
          <span className="shrink-0">{item.icon}</span>
          {item.text}
        </li>
      ))}
    </ul>
  </div>
);

const ComedianCapabilities = () => (
  <div className="glass-card p-6 rounded-3xl border-slate-800">
    <h3 className="text-sm font-black italic uppercase tracking-widest text-white mb-4">Your Tools</h3>
    <ul className="space-y-3">
      {[
        { icon: <Calendar className="w-3.5 h-3.5 text-red-400" />,       text: 'Create, edit & manage events' },
        { icon: <Briefcase className="w-3.5 h-3.5 text-amber-400" />,    text: 'Apply to open gigs' },
        { icon: <Plus className="w-3.5 h-3.5 text-emerald-400" />,       text: 'Post your own gig opportunities' },
        { icon: <Users className="w-3.5 h-3.5 text-blue-400" />,         text: 'Review & accept gig submissions' },
        { icon: <MessageSquare className="w-3.5 h-3.5 text-pink-400" />, text: 'Send and respond to gig invites' },
        { icon: <Heart className="w-3.5 h-3.5 text-purple-400" />,       text: 'Follow comedians and scenes' },
      ].map((item, i) => (
        <li key={i} className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
          <span className="shrink-0">{item.icon}</span>
          {item.text}
        </li>
      ))}
    </ul>
  </div>
);

const OrganizerCapabilities = () => (
  <div className="glass-card p-6 rounded-3xl border-slate-800">
    <h3 className="text-sm font-black italic uppercase tracking-widest text-white mb-4">Your Tools</h3>
    <ul className="space-y-3">
      {[
        { icon: <Calendar className="w-3.5 h-3.5 text-red-400" />,       text: 'Create, edit & manage shows' },
        { icon: <Briefcase className="w-3.5 h-3.5 text-amber-400" />,    text: 'Post gig opportunities' },
        { icon: <Users className="w-3.5 h-3.5 text-blue-400" />,         text: 'Review & accept gig submissions' },
        { icon: <MessageSquare className="w-3.5 h-3.5 text-pink-400" />, text: 'Send gig invites to comedians' },
        { icon: <Heart className="w-3.5 h-3.5 text-purple-400" />,       text: 'Follow comedians and scenes' },
        { icon: <MapPin className="w-3.5 h-3.5 text-emerald-400" />,     text: 'Choose public or private profile visibility' },
      ].map((item, i) => (
        <li key={i} className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
          <span className="shrink-0">{item.icon}</span>
          {item.text}
        </li>
      ))}
    </ul>
  </div>
);

// ── Main component ─────────────────────────────────────────────────────────────

export const UserDashboard: React.FC<UserDashboardProps> = ({ role, authUser, initialTab }) => {
  const [activeTab, setActiveTab] = useState(initialTab ?? 'home');

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  const displayName = authUser?.displayName ?? authUser?.email?.split('@')[0] ?? 'Member';
  const firstName   = displayName.split(' ')[0];
  const initial     = displayName[0]?.toUpperCase() ?? '?';

  const navItems  = NAV_ITEMS[role]  ?? NAV_ITEMS.fan;
  const stats     = STATS[role]      ?? STATS.fan;
  const roleLabel = ROLE_LABELS[role] ?? 'Member';

  const renderHome = () => (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Welcome Banner */}
      <div className="glass-card p-8 rounded-[2.5rem] border-slate-800 bg-gradient-to-br from-red-600/10 to-transparent relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-red-600/10 blur-[100px] rounded-full" />
        <div className="relative z-10">
          <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-2">
            Welcome Back, <span className="text-amber-500">{firstName}</span>
          </h2>
          <p className="text-slate-400 font-medium max-w-lg">{WELCOME_SUBTITLES[role]}</p>
        </div>
      </div>

      {/* Action Buttons — Comedian & Organizer only */}
      {(role === 'comedian' || role === 'organizer') && <ActionCards />}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="glass-card p-5 rounded-3xl border-slate-800/50 hover:bg-slate-900/50 transition-all group">
            <div className="flex justify-between items-start mb-3">
              <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 group-hover:scale-110 transition-transform">
                {s.icon}
              </div>
            </div>
            <div className="text-3xl font-black italic">{s.val}</div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Bottom section: capabilities + Activity */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {role === 'fan'       && <FanCapabilities />}
          {role === 'comedian'  && <ComedianCapabilities />}
          {role === 'organizer' && <OrganizerCapabilities />}
          {role === 'venue'     && <FanCapabilities />}
        </div>

        <div className="glass-card p-6 rounded-3xl border-slate-800">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xs font-black italic uppercase tracking-widest">Activity</h3>
            <button className="text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">View All</button>
          </div>
          <div className="flex flex-col items-center justify-center py-8 text-center gap-3 text-slate-600">
            <Clock className="w-8 h-8 opacity-30" />
            <p className="text-[10px] font-bold uppercase tracking-widest">No activity yet</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      {role === 'fan' && authUser ? (
        <FanPreferencesSettings uid={authUser.uid} />
      ) : (
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
          <button className="mt-8 bg-red-600 text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest italic hover:bg-red-700 transition-all">
            Save Preferences
          </button>
        </div>
      )}

      <div className="glass-card p-8 rounded-[2.5rem] border-slate-800">
        <h3 className="text-2xl font-black italic uppercase mb-8">LAF Points & Rewards</h3>
        <div className="p-6 bg-slate-950 border border-slate-800 rounded-3xl mb-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">Current Balance</span>
            <span className="text-xs font-black uppercase tracking-widest text-amber-500">{roleLabel}</span>
          </div>
          <div className="flex items-end gap-3 mb-6">
            <div className="text-6xl font-black italic tracking-tighter">0</div>
            <div className="text-sm font-black italic text-amber-500 mb-2">LAF</div>
          </div>
          <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div className="h-full bg-gradient-to-r from-red-600 to-amber-500 w-0 rounded-full" />
          </div>
          <p className="text-[10px] text-slate-500 mt-3 font-bold uppercase tracking-widest">Attend shows to start earning LAF points</p>
        </div>
        <button className="w-full py-5 rounded-2xl bg-amber-500/20 border border-amber-500/20 text-amber-400 text-xs font-black uppercase tracking-[0.2em] italic cursor-not-allowed opacity-60">
          Redeem for VIP Upgrades — Coming Soon
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-4 lg:pt-12 pb-24 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col lg:grid lg:grid-cols-[260px_1fr] gap-8 lg:gap-12">

        {/* Mobile Profile Header */}
        <div className="lg:hidden">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-24 h-24 rounded-full border-4 border-amber-500/20 overflow-hidden mb-4 shadow-2xl flex items-center justify-center bg-[#131b2e]">
              {authUser?.photoURL
                ? <img src={authUser.photoURL} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                : <span className="text-3xl font-black text-white">{initial}</span>}
            </div>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">{displayName}</h2>
            <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-4">{roleLabel}</p>
            <button
              onClick={() => setActiveTab('edit-profile')}
              className="w-full max-w-[200px] py-3 border border-white/10 rounded-xl text-[10px] font-black uppercase italic tracking-widest hover:bg-white/5 transition-all"
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="hidden lg:block space-y-4">
          <div className="glass-card p-4 sm:p-6 rounded-[2rem] border-slate-800">
            <div className="flex items-center gap-4 mb-6 p-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-800 border-2 border-red-600 overflow-hidden flex items-center justify-center font-black text-lg sm:text-xl shrink-0">
                {authUser?.photoURL
                  ? <img src={authUser.photoURL} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  : initial}
              </div>
              <div className="min-w-0">
                <h4 className="font-bold uppercase italic text-xs sm:text-sm truncate">{displayName}</h4>
                <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest">{roleLabel}</p>
              </div>
            </div>

            <nav className="flex lg:flex-col gap-1 overflow-x-auto no-scrollbar pb-2 lg:pb-0">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest italic transition-all whitespace-nowrap lg:w-full ${
                    activeTab === item.id
                      ? 'bg-red-600 text-white shadow-lg'
                      : 'text-slate-500 hover:bg-slate-900 hover:text-slate-300'
                  }`}
                >
                  {item.icon}
                  <span className="hidden sm:inline lg:inline">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="glass-card p-4 rounded-[2rem] border-slate-800 text-center">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 italic">Account Type</p>
            <div className="inline-block px-4 py-1.5 bg-brand-gradient rounded-full text-white text-[10px] font-black uppercase italic tracking-widest">
              {roleLabel}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="min-w-0">
          {activeTab === 'home'         && renderHome()}
          {activeTab === 'settings'     && renderSettings()}
          {activeTab === 'edit-profile' && authUser && (
            <EditProfile uid={authUser.uid} role={role} />
          )}
          {activeTab !== 'home' && activeTab !== 'settings' && activeTab !== 'edit-profile' && (
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
