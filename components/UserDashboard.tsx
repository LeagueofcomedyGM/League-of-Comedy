import React, { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import {
  doc, getDoc, updateDoc, setDoc, deleteDoc,
  collection, query, where, limit, getDocs, documentId,
  arrayRemove, increment, Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { PageType, UserRole } from '../types';
import { PostSpotModal, ExistingGig } from './PostSpotModal';
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
  Lock,
  Building2,
  ChevronDown,
  X,
  CheckCircle2,
} from 'lucide-react';

interface UserDashboardProps {
  role: UserRole;
  authUser: FirebaseUser | null;
  initialTab?: string | null;
  navigateTo?: (page: PageType, tab?: string) => void;
}

// ── Nav config per role ────────────────────────────────────────────────────────

const NAV_ITEMS: Record<string, { id: string; label: string; icon: React.ReactNode }[]> = {
  fan: [
    { id: 'home',         label: 'Overview',    icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'edit-profile', label: 'Edit Profile', icon: <PencilLine className="w-4 h-4" /> },
    { id: 'tickets',      label: 'My Tickets',   icon: <Ticket className="w-4 h-4" /> },
    { id: 'following',    label: 'Following',    icon: <Heart className="w-4 h-4" /> },
    { id: 'settings',     label: 'Settings',     icon: <Settings className="w-4 h-4" /> },
  ],
  comedian: [
    { id: 'home',         label: 'Overview',    icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'edit-profile', label: 'Edit Profile', icon: <PencilLine className="w-4 h-4" /> },
    { id: 'events',       label: 'My Events',   icon: <Calendar className="w-4 h-4" /> },
    { id: 'gigs',         label: 'My Gigs',   icon: <Briefcase className="w-4 h-4" /> },
    { id: 'tickets',      label: 'My Tickets',  icon: <Ticket className="w-4 h-4" /> },
    { id: 'following',    label: 'Following',   icon: <Heart className="w-4 h-4" /> },
    { id: 'messages',     label: 'Messages',    icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'settings',     label: 'Settings',    icon: <Settings className="w-4 h-4" /> },
  ],
  organizer: [
    { id: 'home',         label: 'Overview',    icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'edit-profile', label: 'Edit Profile', icon: <PencilLine className="w-4 h-4" /> },
    { id: 'events',       label: 'My Events',   icon: <Calendar className="w-4 h-4" /> },
    { id: 'gigs',         label: 'My Gigs',   icon: <Briefcase className="w-4 h-4" /> },
    { id: 'tickets',      label: 'My Tickets',  icon: <Ticket className="w-4 h-4" /> },
    { id: 'following',    label: 'Following',   icon: <Heart className="w-4 h-4" /> },
    { id: 'messages',     label: 'Messages',    icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'settings',     label: 'Settings',    icon: <Settings className="w-4 h-4" /> },
  ],
  venue: [
    { id: 'home',         label: 'Overview',    icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'edit-profile', label: 'Edit Profile', icon: <PencilLine className="w-4 h-4" /> },
    { id: 'settings',     label: 'Settings',    icon: <Settings className="w-4 h-4" /> },
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
  organizer: 'Organizer',
  venue:     'Venue',
};

const WELCOME_SUBTITLES: Record<string, string> = {
  fan:       'Discover shows, follow your favourite comedians, and earn LAF points.',
  comedian:  'Manage your bookings, apply to gigs, and grow your audience.',
  organizer: 'Post gigs, manage your shows, and book the best talent.',
  venue:     'Manage your venue listings and connect with organisers.',
};

// ── Profile field option lists ─────────────────────────────────────────────────

const COMEDY_STYLES     = ['Alt/Surreal', 'Deadpan', 'Impressions', 'Musical/Variety', 'Physical/Slapstick', 'Storytelling'];
const COMEDY_VIBES      = ['Clean/Family Friendly', 'Mature/Adult', 'Edgy/Explicit'];
const COMEDY_THEMES     = ['Cultural', 'Dark', 'Topical/Political'];
const EXPERIENCE_LEVELS = ['Rookie', 'Open-Micer', 'Feature Act', 'Headliner', 'All-Star / Headliner'];
const SET_LENGTHS       = ['5 min', '10 min', '15 min', '20 min', '30 min', '45 min', '60+ min'];
const RATE_RANGES       = ['Free / Unpaid', '$1–$100', '$100–$250', '$250–$500', '$500–$1,000', '$1,000+', 'Negotiable'];
const PAYMENT_METHODS   = ['Cash', 'Venmo', 'PayPal', 'Zelle', 'CashApp', 'Check', 'Wire Transfer', 'Invoice'];
const LANGUAGES         = ['English', 'Spanish', 'French', 'Portuguese', 'German', 'Mandarin', 'Cantonese', 'Japanese', 'Korean', 'Arabic', 'Hindi', 'Other'];
const ORGANIZER_ROLES   = ['Producer', 'Booker', 'Promoter', 'Venue Owner', 'Club Manager', 'Festival Organizer', 'Corporate Event Planner', 'Bar / Restaurant Booker'];
const GENDER_OPTIONS    = ['Man', 'Woman', 'Non-Binary', 'Transgender', 'Genderqueer', 'Prefer not to say'];
const ETHNICITY_OPTIONS = ['Black / African American', 'White / European', 'Hispanic / Latino', 'Asian', 'Middle Eastern', 'Pacific Islander', 'Native American', 'Mixed / Multiracial', 'Other', 'Prefer not to say'];

// ── Shared form components ─────────────────────────────────────────────────────

const SectionHeader: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="pt-2">
    <h3 className="text-xs font-black italic uppercase tracking-widest text-slate-400">{title}</h3>
    {subtitle && <p className="text-[10px] text-slate-600 mt-0.5 font-medium">{subtitle}</p>}
    <hr className="border-slate-800 mt-3" />
  </div>
);

const Field: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  textarea?: boolean;
  hint?: string;
}> = ({ label, value, onChange, placeholder, type = 'text', textarea, hint }) => (
  <div>
    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{label}</label>
    {hint && <p className="text-[10px] text-slate-600 mb-2 font-medium">{hint}</p>}
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

const SelectField: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}> = ({ label, value, onChange, options, placeholder }) => (
  <div>
    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{label}</label>
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full bg-[#131b2e] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-red-500 transition-colors appearance-none"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

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
      <div className="flex flex-wrap gap-2 mt-2">
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

const SaveButton: React.FC<{ saving: boolean; saved: boolean; onClick: () => void }> = ({ saving, saved, onClick }) => (
  <button
    onClick={onClick}
    disabled={saving || saved}
    className={`mt-8 flex items-center gap-2 px-8 py-3 rounded-xl text-xs font-black uppercase italic tracking-widest transition-all ${
      saved
        ? 'bg-emerald-600 text-white cursor-default'
        : 'bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed'
    }`}
  >
    {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
    {saved   && <Check   className="w-3.5 h-3.5" />}
    {saved ? 'Saved!' : saving ? 'Saving…' : 'Save Changes'}
  </button>
);

// ── Comedian Edit Profile ──────────────────────────────────────────────────────

const ComedianEditProfile: React.FC<{ uid: string }> = ({ uid }) => {
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [saved, setSaved]             = useState(false);
  const [docId, setDocId]             = useState(uid);

  // String fields
  const [fields, setFields]           = useState<Record<string, string>>({});
  // Array fields
  const [styles, setStyles]           = useState<string[]>([]);
  const [vibes, setVibes]             = useState<string[]>([]);
  const [themes, setThemes]           = useState<string[]>([]);
  const [setLengths, setSetLengths]   = useState<string[]>([]);
  const [payments, setPayments]       = useState<string[]>([]);
  const [languages, setLanguages]     = useState<string[]>([]);
  // Private demographics
  const [shareDemo, setShareDemo]     = useState(false);
  const [genderIds, setGenderIds]     = useState<string[]>([]);
  const [ethnicities, setEthnicities] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDocs(
          query(collection(db, 'comedians'), where('uid', '==', uid), limit(1))
        );
        if (!snap.empty) {
          const d    = snap.docs[0];
          const data = d.data();
          setDocId(d.id);
          setFields({
            comedian_name:    data.comedian_name    ?? '',
            comedian_image:   data.comedian_image   ?? '',
            bio:              data.bio              ?? '',
            location:         data.location ?? data.current_city ?? '',
            comedian_website: data.comedian_website ?? '',
            comedy_clip_link: data.comedy_clip_link ?? '',
            experience_level: data.experience_level ?? '',
            rate_range:       data.rate_range       ?? '',
            instagram_link:   data.instagram_link   ?? '',
            facebook_link:    data.facebook_link    ?? '',
            x_link:           data.x_link           ?? '',
            tiktok_link:      data.tiktok_link      ?? '',
            youtube_link:     data.youtube_link     ?? '',
            imdb_link:        data.imdb_link        ?? '',
          });
          setStyles(data.comedy_styles    ?? []);
          setVibes(data.comedy_vibes      ?? []);
          setThemes(data.comedy_themes    ?? []);
          setSetLengths(data.set_lengths  ?? []);
          setPayments(data.payment_methods ?? []);
          setLanguages(data.languages_spoken ?? []);
          setShareDemo(data.share_demographics ?? false);
          setGenderIds(data.gender_identity ?? []);
          setEthnicities(data.race_ethnicity ?? []);
        }
      } catch { /* ignore */ }
      setLoading(false);
    }
    load();
  }, [uid]);

  const set = (k: string, v: string) => setFields(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, 'comedians', docId), {
        ...fields,
        comedy_styles:      styles,
        comedy_vibes:       vibes,
        comedy_themes:      themes,
        set_lengths:        setLengths,
        payment_methods:    payments,
        languages_spoken:   languages,
        share_demographics: shareDemo,
        gender_identity:    shareDemo ? genderIds    : [],
        race_ethnicity:     shareDemo ? ethnicities  : [],
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { /* ignore */ }
    setSaving(false);
  };

  if (loading) return (
    <div className="glass-card p-20 rounded-[2.5rem] border-slate-800 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-red-500 opacity-60" />
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="glass-card p-8 rounded-[2.5rem] border-slate-800">
        <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-8">Edit Profile</h2>

        <div className="space-y-5 max-w-2xl">

          {/* ── Public: Basics ── */}
          <SectionHeader title="Profile" />
          <Field label="Stage Name" value={fields.comedian_name ?? ''} onChange={v => set('comedian_name', v)} placeholder="Your public performer name" />
          <Field label="Profile Image URL" value={fields.comedian_image ?? ''} onChange={v => set('comedian_image', v)} placeholder="https://…" type="url" hint="Direct link to your headshot. File upload coming soon." />
          <Field label="Bio" value={fields.bio ?? ''} onChange={v => set('bio', v)} placeholder="Tell bookers and fans about yourself" textarea />
          <Field label="Location" value={fields.location ?? ''} onChange={v => set('location', v)} placeholder="e.g. Los Angeles, CA" />
          <Field label="Website" value={fields.comedian_website ?? ''} onChange={v => set('comedian_website', v)} placeholder="https://yoursite.com" type="url" />
          <Field label="Featured Comedy Clip" value={fields.comedy_clip_link ?? ''} onChange={v => set('comedy_clip_link', v)} placeholder="YouTube or Vimeo link" type="url" />

          {/* ── Public: Performance ── */}
          <SectionHeader title="Performance" subtitle="Public filters — how bookers and fans find you" />
          <SelectField label="Experience Level" value={fields.experience_level ?? ''} onChange={v => set('experience_level', v)} options={EXPERIENCE_LEVELS} placeholder="Select level…" />
          <MultiSelect label="Comedy Styles"  options={COMEDY_STYLES}  selected={styles}     onChange={setStyles}     />
          <MultiSelect label="Comedy Vibes"   options={COMEDY_VIBES}   selected={vibes}      onChange={setVibes}      />
          <MultiSelect label="Comedy Themes"  options={COMEDY_THEMES}  selected={themes}     onChange={setThemes}     hint="Optional" />
          <MultiSelect label="Set Lengths"    options={SET_LENGTHS}    selected={setLengths} onChange={setSetLengths} />

          {/* ── Public: Booking ── */}
          <SectionHeader title="Booking" />
          <SelectField label="Rate Range" value={fields.rate_range ?? ''} onChange={v => set('rate_range', v)} options={RATE_RANGES} placeholder="Select rate…" />
          <MultiSelect label="Payment Methods"  options={PAYMENT_METHODS} selected={payments}  onChange={setPayments}  />
          <MultiSelect label="Languages Spoken" options={LANGUAGES}        selected={languages} onChange={setLanguages} />

          {/* ── Public: Social Links ── */}
          <SectionHeader title="Social Links" />
          <Field label="Instagram" value={fields.instagram_link ?? ''} onChange={v => set('instagram_link', v)} placeholder="https://instagram.com/yourhandle" type="url" />
          <Field label="TikTok"    value={fields.tiktok_link    ?? ''} onChange={v => set('tiktok_link', v)}    placeholder="https://tiktok.com/@yourhandle"   type="url" />
          <Field label="X / Twitter" value={fields.x_link       ?? ''} onChange={v => set('x_link', v)}        placeholder="https://x.com/yourhandle"         type="url" />
          <Field label="Facebook"  value={fields.facebook_link  ?? ''} onChange={v => set('facebook_link', v)} placeholder="https://facebook.com/yourpage"     type="url" />
          <Field label="YouTube"   value={fields.youtube_link   ?? ''} onChange={v => set('youtube_link', v)}  placeholder="https://youtube.com/@yourchannel"  type="url" />
          <Field label="IMDb"      value={fields.imdb_link      ?? ''} onChange={v => set('imdb_link', v)}     placeholder="https://imdb.com/name/…"          type="url" />

          {/* ── Private: Demographics ── */}
          <SectionHeader title="Demographics" subtitle="Private — never shown publicly. Helps us measure representation in comedy." />
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-white">Share Demographics</h4>
              <p className="text-[10px] text-slate-500 mt-1 font-medium">Opt in to share gender identity and ethnicity.</p>
            </div>
            <button
              type="button"
              onClick={() => setShareDemo(v => !v)}
              className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${shareDemo ? 'bg-red-600' : 'bg-slate-700'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${shareDemo ? 'translate-x-6' : ''}`} />
            </button>
          </div>
          {shareDemo && (
            <>
              <MultiSelect label="Gender Identity" options={GENDER_OPTIONS}    selected={genderIds}    onChange={setGenderIds}    />
              <MultiSelect label="Race / Ethnicity" options={ETHNICITY_OPTIONS} selected={ethnicities}  onChange={setEthnicities}  />
            </>
          )}
        </div>

        <SaveButton saving={saving} saved={saved} onClick={handleSave} />
      </div>
    </div>
  );
};

// ── Organizer Edit Profile ─────────────────────────────────────────────────────

const OrganizerEditProfile: React.FC<{ uid: string }> = ({ uid }) => {
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [fields, setFields]     = useState<Record<string, string>>({});
  const [roles, setRoles]       = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const [uSnap, oSnap] = await Promise.all([
          getDoc(doc(db, 'users', uid)),
          getDoc(doc(db, 'organizers', uid)),
        ]);
        const u = uSnap.data() ?? {};
        const o = oSnap.data() ?? {};
        setFields({
          display_name:  u.display_name  ?? '',
          city:          o.city          ?? '',
          state:         o.state         ?? '',
          bio:           o.bio           ?? '',
          contact_email: o.contact_email ?? '',
          phone:         o.phone         ?? '',
        });
        setRoles(o.organizer_roles ?? []);
      } catch { /* ignore */ }
      setLoading(false);
    }
    load();
  }, [uid]);

  const set = (k: string, v: string) => setFields(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const { display_name, city, state, bio, contact_email, phone } = fields;
      await Promise.all([
        updateDoc(doc(db, 'users',      uid), { display_name }),
        updateDoc(doc(db, 'organizers', uid), {
          display_name, city, state, bio, contact_email, phone,
          organizer_roles: roles,
        }),
      ]);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { /* ignore */ }
    setSaving(false);
  };

  if (loading) return (
    <div className="glass-card p-20 rounded-[2.5rem] border-slate-800 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-red-500 opacity-60" />
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="glass-card p-8 rounded-[2.5rem] border-slate-800">
        <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-8">Edit Profile</h2>

        <div className="space-y-5 max-w-2xl">
          <SectionHeader title="Public Profile" />
          <Field label="Display Name" value={fields.display_name ?? ''} onChange={v => set('display_name', v)} placeholder="Your name or organisation" />
          <Field label="Bio" value={fields.bio ?? ''} onChange={v => set('bio', v)} placeholder="Tell comedians about the shows you run" textarea />
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="City"  value={fields.city  ?? ''} onChange={v => set('city', v)}  placeholder="e.g. New York" />
            <Field label="State" value={fields.state ?? ''} onChange={v => set('state', v)} placeholder="e.g. NY" />
          </div>
          <MultiSelect label="Organizer Roles" options={ORGANIZER_ROLES} selected={roles} onChange={setRoles} />

          <SectionHeader title="Private Contact Info" subtitle="Not shown publicly — used for platform communications only." />
          <Field label="Contact Email" value={fields.contact_email ?? ''} onChange={v => set('contact_email', v)} placeholder="booking@yourcompany.com" type="email" />
          <Field label="Phone"         value={fields.phone         ?? ''} onChange={v => set('phone', v)}         placeholder="+1 (555) 000-0000"         type="tel" />
        </div>

        <SaveButton saving={saving} saved={saved} onClick={handleSave} />
      </div>
    </div>
  );
};

// ── Fan Edit Profile ───────────────────────────────────────────────────────────

const FanEditProfile: React.FC<{ uid: string }> = ({ uid }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [fields, setFields]   = useState<Record<string, string>>({});

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDoc(doc(db, 'users', uid));
        const data = snap.data() ?? {};
        setFields({
          display_name: data.display_name ?? '',
          location:     data.location     ?? '',
        });
      } catch { /* ignore */ }
      setLoading(false);
    }
    load();
  }, [uid]);

  const set = (k: string, v: string) => setFields(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', uid), fields);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { /* ignore */ }
    setSaving(false);
  };

  if (loading) return (
    <div className="glass-card p-20 rounded-[2.5rem] border-slate-800 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-red-500 opacity-60" />
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="glass-card p-8 rounded-[2.5rem] border-slate-800">
        <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-8">Edit Profile</h2>
        <div className="space-y-5 max-w-2xl">
          <Field label="Display Name" value={fields.display_name ?? ''} onChange={v => set('display_name', v)} placeholder="How should we address you?" />
          <Field label="Location"     value={fields.location     ?? ''} onChange={v => set('location', v)}     placeholder="e.g. Chicago, IL" />
        </div>
        <SaveButton saving={saving} saved={saved} onClick={handleSave} />
      </div>
    </div>
  );
};

// ── Comedian settings (Settings tab) ──────────────────────────────────────────

const AVAILABILITY_OPTIONS = [
  { value: 'available',   label: 'Available for Bookings',   hint: 'Actively looking for gigs' },
  { value: 'limited',     label: 'Limited Availability',     hint: 'Open to the right opportunities' },
  { value: 'unavailable', label: 'Unavailable / On Hiatus',  hint: 'Not taking bookings right now' },
];

const TRAVEL_OPTIONS = [
  { value: 'local',         label: 'Local Only',     hint: 'My city / metro area' },
  { value: 'regional',      label: 'Regional',       hint: 'Within a few hours' },
  { value: 'national',      label: 'National',       hint: 'Anywhere in the country' },
  { value: 'international', label: 'International',  hint: 'Open to travel abroad' },
];

const RadioPills: React.FC<{
  label: string;
  hint?: string;
  options: { value: string; label: string; hint: string }[];
  selected: string;
  onChange: (v: string) => void;
}> = ({ label, hint, options, selected, onChange }) => (
  <div>
    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{label}</label>
    {hint && <p className="text-[10px] text-slate-600 mb-3 font-medium">{hint}</p>}
    <div className="space-y-2 mt-2">
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl border text-left transition-all ${
            selected === opt.value
              ? 'bg-red-600/10 border-red-600/40 text-white'
              : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-white'
          }`}
        >
          <div className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
            selected === opt.value ? 'border-red-500' : 'border-slate-600'
          }`}>
            {selected === opt.value && <div className="w-1.5 h-1.5 rounded-full bg-red-500" />}
          </div>
          <div>
            <div className="text-[11px] font-black uppercase italic tracking-widest">{opt.label}</div>
            <div className="text-[10px] text-slate-500 font-medium mt-0.5">{opt.hint}</div>
          </div>
        </button>
      ))}
    </div>
  </div>
);

const ComedianSettings: React.FC<{ uid: string }> = ({ uid }) => {
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [saved, setSaved]             = useState(false);
  const [availability, setAvailability] = useState('');
  const [travel, setTravel]           = useState('');
  const [docId, setDocId]             = useState(uid);

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDocs(
          query(collection(db, 'comedians'), where('uid', '==', uid), limit(1))
        );
        if (!snap.empty) {
          const data = snap.docs[0].data();
          setDocId(snap.docs[0].id);
          setAvailability(data.availability_status ?? '');
          setTravel(data.travel_willingness        ?? '');
        }
      } catch { /* ignore */ }
      setLoading(false);
    }
    load();
  }, [uid]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, 'comedians', docId), {
        availability_status: availability,
        travel_willingness:  travel,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { /* ignore */ }
    setSaving(false);
  };

  if (loading) return (
    <div className="glass-card p-12 rounded-[2.5rem] border-slate-800 flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-red-500 opacity-60" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="glass-card p-8 rounded-[2.5rem] border-slate-800">
        <h3 className="text-2xl font-black italic uppercase mb-1">Booking Settings</h3>
        <p className="text-xs text-slate-500 font-medium mb-8">
          Private — helps organisers know when and where you're available to book.
        </p>
        <div className="space-y-8 max-w-lg">
          <RadioPills
            label="Availability Status"
            options={AVAILABILITY_OPTIONS}
            selected={availability}
            onChange={setAvailability}
          />
          <RadioPills
            label="Travel Willingness"
            options={TRAVEL_OPTIONS}
            selected={travel}
            onChange={setTravel}
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving || saved}
        className={`flex items-center gap-2 px-8 py-3 rounded-xl text-xs font-black uppercase italic tracking-widest transition-all ${
          saved
            ? 'bg-emerald-600 text-white cursor-default'
            : 'bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed'
        }`}
      >
        {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
        {saved   && <Check   className="w-3.5 h-3.5" />}
        {saved ? 'Saved!' : saving ? 'Saving…' : 'Save Settings'}
      </button>
    </div>
  );
};

// ── Organizer settings (Settings tab) ─────────────────────────────────────────

const OrganizerSettings: React.FC<{ uid: string }> = ({ uid }) => {
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [styles, setStyles]     = useState<string[]>([]);
  const [vibes, setVibes]       = useState<string[]>([]);
  const [levels, setLevels]     = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDoc(doc(db, 'organizers', uid));
        const data = snap.data() ?? {};
        setIsPublic(data.is_public ?? true);
        setStyles(data.booking_styles            ?? []);
        setVibes(data.booking_vibes              ?? []);
        setLevels(data.booking_experience_levels ?? []);
      } catch { /* ignore */ }
      setLoading(false);
    }
    load();
  }, [uid]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, 'organizers', uid), {
        is_public:                 isPublic,
        booking_styles:            styles,
        booking_vibes:             vibes,
        booking_experience_levels: levels,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { /* ignore */ }
    setSaving(false);
  };

  if (loading) return (
    <div className="glass-card p-12 rounded-[2.5rem] border-slate-800 flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-red-500 opacity-60" />
    </div>
  );

  return (
    <div className="space-y-6">

      {/* Profile Visibility */}
      <div className="glass-card p-8 rounded-[2.5rem] border-slate-800">
        <h3 className="text-2xl font-black italic uppercase mb-1">Profile Visibility</h3>
        <p className="text-xs text-slate-500 font-medium mb-8">
          Control whether your organizer profile appears in search and scenes.
        </p>
        <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-950 border border-slate-800">
          <div>
            <h4 className="text-sm font-black italic uppercase tracking-tight text-white">
              {isPublic ? 'Public Profile' : 'Private Profile'}
            </h4>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              {isPublic
                ? 'Your profile is visible to comedians and fans.'
                : 'Your profile is hidden from search and discovery.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsPublic(v => !v)}
            className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${isPublic ? 'bg-red-600' : 'bg-slate-700'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isPublic ? 'translate-x-6' : ''}`} />
          </button>
        </div>
      </div>

      {/* Booking Preferences */}
      <div className="glass-card p-8 rounded-[2.5rem] border-slate-800">
        <h3 className="text-2xl font-black italic uppercase mb-1">Booking Preferences</h3>
        <p className="text-xs text-slate-500 font-medium mb-8">
          Private — tells us what talent you typically book so we can surface the right comedians.
        </p>
        <div className="space-y-6">
          <MultiSelect
            label="Comedy Styles You Book"
            options={COMEDY_STYLES}
            selected={styles}
            onChange={setStyles}
          />
          <MultiSelect
            label="Comedy Vibes You Book"
            options={COMEDY_VIBES}
            selected={vibes}
            onChange={setVibes}
          />
          <MultiSelect
            label="Experience Levels"
            options={EXPERIENCE_LEVELS}
            selected={levels}
            onChange={setLevels}
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving || saved}
        className={`flex items-center gap-2 px-8 py-3 rounded-xl text-xs font-black uppercase italic tracking-widest transition-all ${
          saved
            ? 'bg-emerald-600 text-white cursor-default'
            : 'bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed'
        }`}
      >
        {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
        {saved   && <Check   className="w-3.5 h-3.5" />}
        {saved ? 'Saved!' : saving ? 'Saving…' : 'Save Settings'}
      </button>
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

  if (loading) return (
    <div className="glass-card p-12 rounded-[2.5rem] border-slate-800 flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-red-500 opacity-60" />
    </div>
  );

  return (
    <div className="glass-card p-8 rounded-[2.5rem] border-slate-800">
      <h3 className="text-2xl font-black italic uppercase mb-1">Discovery Preferences</h3>
      <p className="text-xs text-slate-500 font-medium mb-8">
        Private — used to surface shows, comedians, and clips that match your taste.
      </p>
      <div className="space-y-6">
        <MultiSelect label="Comedy Style"   options={COMEDY_STYLES}  selected={styles}  onChange={setStyles}  />
        <MultiSelect label="Comedy Vibe"    options={COMEDY_VIBES}   selected={vibes}   onChange={setVibes}   />
        <MultiSelect label="Comedy Themes"  options={COMEDY_THEMES}  selected={themes}  onChange={setThemes}  hint="Optional" />
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
        {saved   && <Check   className="w-3.5 h-3.5" />}
        {saved ? 'Saved!' : saving ? 'Saving…' : 'Save Preferences'}
      </button>
    </div>
  );
};

// ── Scene metadata ─────────────────────────────────────────────────────────────

const SCENE_META: Record<string, { name: string; location: string }> = {
  'los-angeles': { name: 'Los Angeles', location: 'Los Angeles, CA' },
  'new-york':    { name: 'New York',    location: 'New York, NY' },
  'london':      { name: 'London',      location: 'London, UK' },
  'chicago':     { name: 'Chicago',     location: 'Chicago, IL' },
  'austin':      { name: 'Austin',      location: 'Austin, TX' },
  'manchester':  { name: 'Manchester',  location: 'Manchester, UK' },
  'toronto':     { name: 'Toronto',     location: 'Toronto, ON' },
};

const slugToName     = (s: string) => SCENE_META[s]?.name     ?? s.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
const slugToLocation = (s: string) => SCENE_META[s]?.location ?? '';

// ── Following tab ──────────────────────────────────────────────────────────────

// ── My Gigs Tab ───────────────────────────────────────────────────────────────

function getEmbedUrl(url: string): string | null {
  try {
    const ytShort = url.match(/youtu\.be\/([^?&]+)/);
    if (ytShort) return `https://www.youtube.com/embed/${ytShort[1]}`;
    const ytFull = url.match(/[?&]v=([^&]+)/);
    if (ytFull) return `https://www.youtube.com/embed/${ytFull[1]}`;
    const vimeo = url.match(/vimeo\.com\/(\d+)/);
    if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
    return null;
  } catch { return null; }
}

interface MyApplication {
  appId:          string;
  gigId:          string;
  message:        string;
  appliedAt:      Timestamp | null;
  status:         string;
  gigTitle:       string;
  gigCategory:    string;
  gigPayRange:    string;
  gigCity:        string;
  gigState:       string;
  gigVenueName:   string;
  gigDate:        string;
  gigTime:        string;
  gigDeadline:    string;
  gigPublicBrief: string;
  gigSetLengths:  string[];
  gigSpots:       number;
}

interface PostedGigItem {
  id:               string;
  title:            string;
  category:         string;
  pay_range:        string;
  city:             string;
  state:            string;
  status:           string;
  posted_at:        Timestamp | null;
  spots:            number;
  spots_filled:     number;
  venue_name:       string;
  date:             string;
  time:             string;
  deadline:         string;
  public_brief:     string;
  set_lengths:      string[];
  experience_level: string;
  styles:           string[];
  vibes:            string[];
}

interface GigApplicant {
  appId:        string;
  comedianUid:  string;
  comedianName: string;
  message:      string;
  appliedAt:    Timestamp | null;
  status:       string;
}

const GigsTab: React.FC<{ uid: string; role: UserRole; refreshKey?: number }> = ({ uid, role, refreshKey = 0 }) => {
  const [subTab,            setSubTab]            = useState<'applied' | 'posted'>(role === 'organizer' ? 'posted' : 'applied');
  const [loading,           setLoading]           = useState(true);
  const [applications,      setApplications]      = useState<MyApplication[]>([]);
  const [postedGigs,        setPostedGigs]        = useState<PostedGigItem[]>([]);
  const [expandedGigId,     setExpandedGigId]     = useState<string | null>(null);
  const [expandedAppId,     setExpandedAppId]     = useState<string | null>(null);
  const [applicantsMap,     setApplicantsMap]     = useState<Record<string, GigApplicant[]>>({});
  const [loadingApplicants, setLoadingApplicants] = useState<string | null>(null);
  const [viewingApplicant,  setViewingApplicant]  = useState<{ applicant: GigApplicant; gigTitle: string; gigId: string } | null>(null);
  const [applicantProfile,  setApplicantProfile]  = useState<Record<string, any> | null>(null);
  const [loadingProfile,    setLoadingProfile]    = useState(false);
  const [updatingStatus,    setUpdatingStatus]    = useState<'accepted' | 'declined' | 'pending' | null>(null);
  const [withdrawingId,     setWithdrawingId]     = useState<string | null>(null);
  const [editingGig,        setEditingGig]        = useState<ExistingGig | null>(null);
  const [gigVersion,        setGigVersion]        = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const [appsSnap, gigsSnap] = await Promise.all([
          role !== 'organizer'
            ? getDocs(query(collection(db, 'applications'), where('comedian_uid', '==', uid)))
            : Promise.resolve(null),
          getDocs(query(collection(db, 'gigs'), where('posted_by_uid', '==', uid))),
        ]);

        const gigs: PostedGigItem[] = gigsSnap.docs.map(d => {
          const data = d.data();
          return {
            id:               d.id,
            title:            data.title            ?? '',
            category:         data.category         ?? '',
            pay_range:        data.pay_range         ?? '',
            city:             data.city              ?? '',
            state:            data.state             ?? '',
            status:           data.status            ?? 'published',
            posted_at:        data.posted_at         ?? null,
            spots:            data.spots             ?? 1,
            spots_filled:     data.spots_filled      ?? 0,
            venue_name:       data.venue_name        ?? '',
            date:             data.date              ?? '',
            time:             data.time              ?? '',
            deadline:         data.deadline          ?? '',
            public_brief:     data.public_brief      ?? '',
            set_lengths:      data.set_lengths       ?? [],
            experience_level: data.experience_level  ?? '',
            styles:           data.styles            ?? [],
            vibes:            data.vibes             ?? [],
          };
        });
        gigs.sort((a, b) => (b.posted_at?.toMillis() ?? 0) - (a.posted_at?.toMillis() ?? 0));
        setPostedGigs(gigs);

        if (appsSnap && appsSnap.docs.length > 0) {
          const rawApps = appsSnap.docs.map(d => ({ appId: d.id, ...(d.data() as any) }));
          const gigIds  = [...new Set<string>(rawApps.map(a => a.gig_id))];
          const gigDocs = await Promise.all(gigIds.map(id => getDoc(doc(db, 'gigs', id))));
          const gigMap: Record<string, any> = {};
          gigDocs.forEach(d => { if (d.exists()) gigMap[d.id] = d.data(); });

          setApplications(rawApps.map(a => {
            const g = gigMap[a.gig_id] ?? {};
            return {
              appId:          a.appId,
              gigId:          a.gig_id,
              message:        a.message    ?? '',
              appliedAt:      a.applied_at ?? null,
              status:         a.status     ?? 'pending',
              gigTitle:       g.title       ?? 'Unknown Gig',
              gigCategory:    g.category    ?? '',
              gigPayRange:    g.pay_range   ?? '',
              gigCity:        g.city        ?? '',
              gigState:       g.state       ?? '',
              gigVenueName:   g.venue_name  ?? '',
              gigDate:        g.date        ?? '',
              gigTime:        g.time        ?? '',
              gigDeadline:    g.deadline    ?? '',
              gigPublicBrief: g.public_brief ?? '',
              gigSetLengths:  g.set_lengths  ?? [],
              gigSpots:       g.spots        ?? 1,
            };
          }));
        }
      } catch { /* ignore */ }
      setLoading(false);
    }
    load();
  }, [uid, role, gigVersion, refreshKey]);

  const handleWithdraw = async (appId: string) => {
    setWithdrawingId(appId);
    try {
      await deleteDoc(doc(db, 'applications', appId));
      setApplications(prev => prev.filter(a => a.appId !== appId));
    } catch { /* ignore */ }
    setWithdrawingId(null);
  };

  const toggleApplicants = async (gigId: string) => {
    if (expandedGigId === gigId) { setExpandedGigId(null); return; }
    if (applicantsMap[gigId])    { setExpandedGigId(gigId); return; }
    setLoadingApplicants(gigId);
    try {
      const appsSnap  = await getDocs(query(collection(db, 'applications'), where('gig_id', '==', gigId)));
      const rawApps   = appsSnap.docs.map(d => ({ appId: d.id, ...(d.data() as any) }));

      // Deduplicate by comedian_uid — keep the highest-priority status per comedian
      const statusPriority: Record<string, number> = { accepted: 3, pending: 2, declined: 1 };
      const dedupedMap: Record<string, typeof rawApps[0]> = {};
      rawApps.forEach(a => {
        const existing = dedupedMap[a.comedian_uid];
        if (!existing || (statusPriority[a.status ?? 'pending'] ?? 0) > (statusPriority[existing.status ?? 'pending'] ?? 0)) {
          dedupedMap[a.comedian_uid] = a;
        }
      });
      const deduped = Object.values(dedupedMap);

      const comDocs   = await Promise.all(deduped.map(a => getDoc(doc(db, 'comedians', a.comedian_uid))));
      const applicants: GigApplicant[] = deduped.map((a, i) => ({
        appId:        a.appId,
        comedianUid:  a.comedian_uid,
        comedianName: comDocs[i].data()?.comedian_name ?? 'Comedian',
        message:      a.message    ?? '',
        appliedAt:    a.applied_at ?? null,
        status:       a.status     ?? 'pending',
      }));
      setApplicantsMap(prev => ({ ...prev, [gigId]: applicants }));
      setExpandedGigId(gigId);
    } catch { /* ignore */ }
    setLoadingApplicants(null);
  };

  const openApplicantProfile = async (applicant: GigApplicant, gigTitle: string, gigId: string) => {
    setViewingApplicant({ applicant, gigTitle, gigId });
    setApplicantProfile(null);
    setLoadingProfile(true);
    try {
      const snap = await getDoc(doc(db, 'comedians', applicant.comedianUid));
      setApplicantProfile(snap.exists() ? snap.data() ?? null : null);
    } catch { /* ignore */ }
    setLoadingProfile(false);
  };

  const handleStatusUpdate = async (newStatus: 'accepted' | 'declined' | 'pending') => {
    if (!viewingApplicant) return;
    const prevStatus = viewingApplicant.applicant.status;
    const gigId = viewingApplicant.gigId;
    setUpdatingStatus(newStatus);
    try {
      await updateDoc(doc(db, 'applications', viewingApplicant.applicant.appId), { status: newStatus });

      // Keep spots_filled in sync: +1 when accepting, -1 when un-accepting
      if (newStatus === 'accepted' && prevStatus !== 'accepted') {
        await updateDoc(doc(db, 'gigs', gigId), { spots_filled: increment(1) });
        setPostedGigs(prev => prev.map(g =>
          g.id === gigId ? { ...g, spots_filled: g.spots_filled + 1 } : g
        ));
      } else if (prevStatus === 'accepted' && newStatus !== 'accepted') {
        await updateDoc(doc(db, 'gigs', gigId), { spots_filled: increment(-1) });
        setPostedGigs(prev => prev.map(g =>
          g.id === gigId ? { ...g, spots_filled: Math.max(0, g.spots_filled - 1) } : g
        ));
      }

      // Update applicantsMap so the list row reflects the change
      setApplicantsMap(prev => ({
        ...prev,
        [gigId]: (prev[gigId] ?? []).map(a =>
          a.appId === viewingApplicant.applicant.appId ? { ...a, status: newStatus } : a
        ),
      }));
      // Update the modal's live applicant
      setViewingApplicant(prev =>
        prev ? { ...prev, applicant: { ...prev.applicant, status: newStatus } } : null
      );
    } catch { /* ignore */ }
    setUpdatingStatus(null);
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending:   'bg-amber-500/10 border-amber-500/20 text-amber-400',
      published: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
      accepted:  'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
      draft:     'bg-slate-500/10 border-slate-500/20 text-slate-400',
      declined:  'bg-red-500/10 border-red-500/20 text-red-400',
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${styles[status] ?? styles.pending}`}>
        {status}
      </span>
    );
  };

  if (loading) return (
    <div className="glass-card p-12 rounded-[2.5rem] border-slate-800 flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-red-500 opacity-60" />
    </div>
  );

  return (
    <>
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">

      {/* Sub-tab toggle — comedians only */}
      {role !== 'organizer' && (
        <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 w-fit">
          {(['applied', 'posted'] as const).map(t => (
            <button
              key={t}
              onClick={() => setSubTab(t)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase italic tracking-widest transition-all ${
                subTab === t ? 'bg-[#1e293b] text-white shadow' : 'text-slate-500 hover:text-white'
              }`}
            >
              {t === 'applied' ? 'Applied' : 'Posted'}
            </button>
          ))}
        </div>
      )}

      {/* Applied */}
      {subTab === 'applied' && role !== 'organizer' && (
        <div className="glass-card p-8 rounded-[2.5rem] border-slate-800">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-black italic uppercase tracking-widest">Applied</h3>
            {applications.length > 0 && (
              <span className="ml-auto text-[10px] font-black text-slate-500 uppercase tracking-widest">
                {applications.length} application{applications.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {applications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-600 gap-3">
              <Briefcase className="w-8 h-8 opacity-30" />
              <p className="text-[10px] font-bold uppercase tracking-widest">No applications yet</p>
              <p className="text-[11px] font-medium text-slate-700">Browse the Gig Board and hit Apply Now.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map(app => (
                <div
                  key={app.appId}
                  className={`bg-slate-950 rounded-2xl border overflow-hidden ${
                    app.status === 'accepted' ? 'border-emerald-500/30' : 'border-slate-800'
                  }`}
                >
                  <div
                    className={`p-4 flex items-start justify-between gap-4 ${app.status === 'accepted' ? 'cursor-pointer hover:bg-white/[0.02] transition-colors' : ''}`}
                    onClick={() => app.status === 'accepted' && setExpandedAppId(expandedAppId === app.appId ? null : app.appId)}
                  >
                    <div className="min-w-0 flex-grow">
                      <h4 className="text-sm font-black italic uppercase tracking-tight text-white truncate">{app.gigTitle}</h4>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {app.gigCategory && <span className="text-[9px] font-black uppercase tracking-widest text-[#8892a4]">{app.gigCategory}</span>}
                        {app.gigPayRange && <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">{app.gigPayRange}</span>}
                        {[app.gigCity, app.gigState].filter(Boolean).join(', ') && (
                          <span className="text-[9px] font-bold text-[#8892a4] flex items-center gap-1">
                            <MapPin className="w-2.5 h-2.5" />{[app.gigCity, app.gigState].filter(Boolean).join(', ')}
                          </span>
                        )}
                      </div>
                      {app.message && (
                        <p className="text-[11px] text-slate-500 mt-2 leading-relaxed line-clamp-2 italic">"{app.message}"</p>
                      )}
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      {statusBadge(app.status)}
                      {app.status === 'accepted' && (
                        <ChevronDown className={`w-4 h-4 text-emerald-500 transition-transform ${expandedAppId === app.appId ? 'rotate-180' : ''}`} />
                      )}
                      {app.status === 'pending' && (
                        <button
                          onClick={e => { e.stopPropagation(); handleWithdraw(app.appId); }}
                          disabled={withdrawingId === app.appId}
                          className="px-3 py-1 rounded-lg text-[9px] font-black uppercase italic tracking-widest border border-slate-700 text-slate-500 hover:border-red-600/50 hover:text-red-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {withdrawingId === app.appId ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Withdraw'}
                        </button>
                      )}
                    </div>
                  </div>

                  {app.status === 'accepted' && expandedAppId === app.appId && (
                    <div className="px-4 pb-4">
                      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 space-y-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5" /> You're booked — here are the details
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          {app.gigVenueName && (
                            <div className="flex items-start gap-2">
                              <Building2 className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                              <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Venue</p>
                                <p className="text-[11px] font-bold text-white">{app.gigVenueName}</p>
                              </div>
                            </div>
                          )}
                          {[app.gigCity, app.gigState].filter(Boolean).join(', ') && (
                            <div className="flex items-start gap-2">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                              <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Location</p>
                                <p className="text-[11px] font-bold text-white">{[app.gigCity, app.gigState].filter(Boolean).join(', ')}</p>
                              </div>
                            </div>
                          )}
                          {app.gigDate && (
                            <div className="flex items-start gap-2">
                              <Calendar className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                              <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Date</p>
                                <p className="text-[11px] font-bold text-white">
                                  {new Date(app.gigDate + 'T00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                  {app.gigTime ? ` · ${new Date('1970-01-01T' + app.gigTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}` : ''}
                                </p>
                              </div>
                            </div>
                          )}
                          {app.gigSetLengths.length > 0 && (
                            <div className="flex items-start gap-2">
                              <Clock className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                              <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Set Length</p>
                                <p className="text-[11px] font-bold text-white">{app.gigSetLengths.join(', ')}</p>
                              </div>
                            </div>
                          )}
                          {app.gigPayRange && (
                            <div className="flex items-start gap-2">
                              <Zap className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                              <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Pay</p>
                                <p className="text-[11px] font-bold text-emerald-400">{app.gigPayRange}</p>
                              </div>
                            </div>
                          )}
                          {app.gigSpots > 1 && (
                            <div className="flex items-start gap-2">
                              <Users className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                              <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Open Spots</p>
                                <p className="text-[11px] font-bold text-white">{app.gigSpots}</p>
                              </div>
                            </div>
                          )}
                        </div>
                        {app.gigPublicBrief && (
                          <div className="pt-2 border-t border-emerald-500/10">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Notes from organizer</p>
                            <p className="text-[11px] text-slate-300 leading-relaxed">{app.gigPublicBrief}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Posted */}
      {(subTab === 'posted' || role === 'organizer') && (
        <div className="glass-card p-8 rounded-[2.5rem] border-slate-800">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-4 h-4 text-red-500" />
            <h3 className="text-sm font-black italic uppercase tracking-widest">Posted</h3>
            {postedGigs.length > 0 && (
              <span className="ml-auto text-[10px] font-black text-slate-500 uppercase tracking-widest">
                {postedGigs.length} gig{postedGigs.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {postedGigs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-600 gap-3">
              <Briefcase className="w-8 h-8 opacity-30" />
              <p className="text-[10px] font-bold uppercase tracking-widest">No gigs posted yet</p>
              <p className="text-[11px] font-medium text-slate-700">Use Post a Gig to create your first listing.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {postedGigs.map(gig => {
                const isExpanded    = expandedGigId === gig.id;
                const isLoadingThis = loadingApplicants === gig.id;
                const applicants    = applicantsMap[gig.id];

                return (
                  <div key={gig.id} className="rounded-2xl border border-slate-800 overflow-hidden">
                    <button
                      onClick={() => toggleApplicants(gig.id)}
                      className="w-full p-4 bg-slate-950 hover:bg-slate-900 transition-colors flex items-center gap-4 text-left"
                    >
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h4 className="text-sm font-black italic uppercase tracking-tight text-white truncate">{gig.title}</h4>
                          {statusBadge(gig.status)}
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {gig.category && <span className="text-[9px] font-black uppercase tracking-widest text-[#8892a4]">{gig.category}</span>}
                          {gig.pay_range && <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">{gig.pay_range}</span>}
                          {[gig.city, gig.state].filter(Boolean).join(', ') && (
                            <span className="text-[9px] font-bold text-[#8892a4] flex items-center gap-1">
                              <MapPin className="w-2.5 h-2.5" />{[gig.city, gig.state].filter(Boolean).join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="shrink-0 flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Applicants</p>
                          <p className="text-base font-black text-white italic">
                            {isLoadingThis
                              ? <Loader2 className="w-4 h-4 animate-spin inline" />
                              : applicants != null ? applicants.length : '—'}
                          </p>
                        </div>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setEditingGig({
                              id:               gig.id,
                              title:            gig.title,
                              category:         gig.category,
                              venue_name:       gig.venue_name,
                              city:             gig.city,
                              state:            gig.state,
                              date:             gig.date,
                              time:             gig.time,
                              spots:            gig.spots,
                              deadline:         gig.deadline,
                              public_brief:     gig.public_brief,
                              pay_range:        gig.pay_range,
                              set_lengths:      gig.set_lengths,
                              experience_level: gig.experience_level,
                              styles:           gig.styles,
                              vibes:            gig.vibes,
                              status:           gig.status,
                              applicantCount:   applicants?.length ?? 0,
                            });
                          }}
                          className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/20 transition-all"
                          title="Edit gig"
                        >
                          <PencilLine className="w-3.5 h-3.5" />
                        </button>
                        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-slate-800 bg-[#0a0e1a]">
                        {!applicants || applicants.length === 0 ? (
                          <div className="flex items-center justify-center py-8 gap-2 text-slate-600">
                            <Users className="w-4 h-4 opacity-40" />
                            <p className="text-[10px] font-bold uppercase tracking-widest">No applications yet</p>
                          </div>
                        ) : (
                          <div className="divide-y divide-slate-800/50">
                            {applicants.map(applicant => (
                              <div key={applicant.appId} className="p-4 flex items-start gap-4">
                                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                                  <Mic2 className="w-4 h-4 text-amber-500" />
                                </div>
                                <div className="flex-grow min-w-0">
                                  <div className="flex items-center justify-between gap-2 mb-1">
                                    <h5 className="text-sm font-black italic uppercase tracking-tight text-white">{applicant.comedianName}</h5>
                                    <div className="flex items-center gap-2 shrink-0">
                                      {statusBadge(applicant.status)}
                                      <button
                                        onClick={() => openApplicantProfile(applicant, gig.title, gig.id)}
                                        className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-all"
                                      >
                                        View Profile
                                      </button>
                                    </div>
                                  </div>
                                  {applicant.message && (
                                    <p className="text-[11px] text-slate-500 leading-relaxed italic">"{applicant.message}"</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>

    {/* Applicant Profile Modal */}

    {viewingApplicant && (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm overflow-y-auto">
        <div className="relative w-full max-w-xl bg-[#0f1628] rounded-[2rem] sm:rounded-[2.5rem] border border-white/10 shadow-2xl my-4 sm:my-8 overflow-hidden">

          {/* Close */}
          <button
            onClick={() => setViewingApplicant(null)}
            className="absolute top-4 right-4 z-20 p-2 bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 rounded-full transition-all"
          >
            <X className="w-4 h-4" />
          </button>

          {loadingProfile ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-6 h-6 animate-spin text-amber-500 opacity-60" />
            </div>
          ) : (() => {
            const clipLink = applicantProfile?.comedy_clip_link ?? '';
            const embedUrl = clipLink ? getEmbedUrl(clipLink) : null;
            return (
              <>
                {/* Hero — embedded video or gradient fallback */}
                <div className="relative">
                  {embedUrl ? (
                    <div className="aspect-video w-full bg-black">
                      <iframe
                        src={embedUrl}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="Comedy Clip"
                      />
                    </div>
                  ) : (
                    <div className="h-28 sm:h-36 bg-gradient-to-br from-[#131b2e] to-[#0a0e1a]" />
                  )}

                  {/* Avatar — overlaps bottom of hero */}
                  <div className="absolute bottom-0 left-6 sm:left-8 translate-y-1/2">
                    {applicantProfile?.comedian_image ? (
                      <img
                        src={applicantProfile.comedian_image}
                        alt={viewingApplicant.applicant.comedianName}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-4 border-[#0f1628] shadow-xl"
                      />
                    ) : (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-500/10 border-4 border-[#0f1628] flex items-center justify-center shadow-xl">
                        <Mic2 className="w-7 h-7 sm:w-8 sm:h-8 text-amber-500 opacity-60" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="pt-12 sm:pt-14 px-6 sm:px-8 pb-8 space-y-5">

                  {/* Name + meta */}
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black italic uppercase tracking-tighter text-white">
                      {viewingApplicant.applicant.comedianName}
                    </h2>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {applicantProfile?.location && (
                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-red-500" /> {applicantProfile.location}
                        </span>
                      )}
                      {applicantProfile?.experience_level && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[9px] font-black uppercase tracking-widest text-amber-400">
                          {applicantProfile.experience_level}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Applying for */}
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Applying for: <span className="text-white">{viewingApplicant.gigTitle}</span>
                  </div>

                  {/* Pitch */}
                  {viewingApplicant.applicant.message && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Their Pitch</p>
                      <p className="text-sm text-slate-300 leading-relaxed italic bg-slate-900 rounded-xl p-4 border border-slate-800">
                        "{viewingApplicant.applicant.message}"
                      </p>
                    </div>
                  )}

                  {/* Bio */}
                  {applicantProfile?.bio && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">About</p>
                      <p className="text-sm text-slate-400 leading-relaxed">{applicantProfile.bio}</p>
                    </div>
                  )}

                  {/* Styles + set lengths */}
                  {((applicantProfile?.comedy_styles ?? []).length > 0 || (applicantProfile?.set_lengths ?? []).length > 0) && (
                    <div className="flex flex-wrap gap-2">
                      {(applicantProfile?.comedy_styles ?? []).map((s: string) => (
                        <span key={s} className="px-2.5 py-1 rounded-full bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-widest text-slate-400">{s}</span>
                      ))}
                      {(applicantProfile?.set_lengths ?? []).map((s: string) => (
                        <span key={s} className="px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[9px] font-black uppercase tracking-widest text-blue-400">{s}</span>
                      ))}
                    </div>
                  )}

                  {/* Fallback clip link if not embeddable */}
                  {clipLink && !embedUrl && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Featured Clip</p>
                      <a
                        href={clipLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-red-500/40 hover:bg-slate-800 transition-all group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-600/20 flex items-center justify-center shrink-0">
                          <ArrowRight className="w-4 h-4 text-red-500 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                        <p className="text-xs font-black uppercase italic tracking-tight text-white truncate">Watch Comedy Clip</p>
                      </a>
                    </div>
                  )}

                  {/* Social links */}
                  {(applicantProfile?.instagram_link || applicantProfile?.youtube_link || applicantProfile?.x_link) && (
                    <div className="flex gap-2 flex-wrap">
                      {applicantProfile?.instagram_link && (
                        <a href={applicantProfile.instagram_link} target="_blank" rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-pink-500/10 border border-pink-500/20 text-pink-400 hover:bg-pink-500/20 transition-all">
                          Instagram
                        </a>
                      )}
                      {applicantProfile?.youtube_link && (
                        <a href={applicantProfile.youtube_link} target="_blank" rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all">
                          YouTube
                        </a>
                      )}
                      {applicantProfile?.x_link && (
                        <a href={applicantProfile.x_link} target="_blank" rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-all">
                          X / Twitter
                        </a>
                      )}
                    </div>
                  )}

                  {/* Accept / Decline */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-3">
                    <div>{statusBadge(viewingApplicant.applicant.status)}</div>
                    {viewingApplicant.applicant.status === 'pending' ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStatusUpdate('declined')}
                          disabled={!!updatingStatus}
                          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase italic tracking-widest border border-slate-700 text-slate-400 hover:border-red-600 hover:text-red-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {updatingStatus === 'declined' ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Decline'}
                        </button>
                        <button
                          onClick={() => handleStatusUpdate('accepted')}
                          disabled={!!updatingStatus}
                          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase italic tracking-widest bg-emerald-600 text-white hover:bg-emerald-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-emerald-900/30"
                        >
                          {updatingStatus === 'accepted' ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Accept'}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleStatusUpdate('pending')}
                        disabled={!!updatingStatus}
                        className="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase italic tracking-widest border border-slate-700 text-slate-400 hover:border-white/20 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {updatingStatus ? <Loader2 className="w-3 h-3 animate-spin inline" /> : 'Reset to Pending'}
                      </button>
                    )}
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      </div>
    )}

    {editingGig && (
      <PostSpotModal
        existingGig={editingGig}
        onClose={() => setEditingGig(null)}
        onSuccess={() => {
          setEditingGig(null);
          setApplicantsMap({});
          setGigVersion(v => v + 1);
        }}
      />
    )}
    </>
  );
};

const FollowingTab: React.FC<{ uid: string; navigateTo: (page: PageType, tab?: string) => void }> = ({ uid, navigateTo }) => {
  const [sceneSlugs,      setSceneSlugs]      = useState<string[]>([]);
  const [sceneCounts,     setSceneCounts]     = useState<Record<string, number>>({});
  const [comedianIds,     setComedianIds]     = useState<string[]>([]);
  const [comedianNames,   setComedianNames]   = useState<Record<string, string>>({});
  const [organizerIds,    setOrganizerIds]    = useState<string[]>([]);
  const [organizerNames,  setOrganizerNames]  = useState<Record<string, string>>({});
  const [loading,         setLoading]         = useState(true);
  const [unfollowingScene,     setUnfollowingScene]     = useState<string | null>(null);
  const [unfollowingComedian,  setUnfollowingComedian]  = useState<string | null>(null);
  const [unfollowingOrganizer, setUnfollowingOrganizer] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const userSnap = await getDoc(doc(db, 'users', uid));
        const data     = userSnap.data() ?? {};

        const slugs: string[] = data.following_scenes    ?? [];
        const cids:  string[] = data.following_comedians ?? [];
        const oids:  string[] = data.following_organizers ?? [];
        setSceneSlugs(slugs);
        setComedianIds(cids);
        setOrganizerIds(oids);

        await Promise.all([
          slugs.length > 0 && (async () => {
            const counts: Record<string, number> = {};
            await Promise.all(slugs.map(async slug => {
              const snap = await getDoc(doc(db, 'scenes', slug));
              if (snap.exists()) counts[slug] = snap.data().follower_count ?? 0;
            }));
            setSceneCounts(counts);
          })(),
          cids.length > 0 && (async () => {
            const names: Record<string, string> = {};
            await Promise.all(cids.map(async cid => {
              const snap = await getDoc(doc(db, 'comedians', cid));
              names[cid] = snap.data()?.comedian_name ?? 'Comedian';
            }));
            setComedianNames(names);
          })(),
          oids.length > 0 && (async () => {
            const names: Record<string, string> = {};
            await Promise.all(oids.map(async oid => {
              const snap = await getDoc(doc(db, 'organizers', oid));
              names[oid] = snap.data()?.display_name ?? 'Organizer';
            }));
            setOrganizerNames(names);
          })(),
        ]);
      } catch { /* ignore */ }
      setLoading(false);
    }
    load();
  }, [uid]);

  const handleUnfollowScene = async (slug: string) => {
    setUnfollowingScene(slug);
    setSceneSlugs(prev => prev.filter(s => s !== slug));
    try {
      await Promise.all([
        updateDoc(doc(db, 'users', uid), { following_scenes: arrayRemove(slug) }),
        setDoc(doc(db, 'scenes', slug), { follower_count: increment(-1) }, { merge: true }),
      ]);
    } catch {
      setSceneSlugs(prev => [...prev, slug]);
    }
    setUnfollowingScene(null);
  };

  const handleUnfollowComedian = async (cid: string) => {
    setUnfollowingComedian(cid);
    setComedianIds(prev => prev.filter(c => c !== cid));
    try {
      await updateDoc(doc(db, 'users', uid), { following_comedians: arrayRemove(cid) });
    } catch {
      setComedianIds(prev => [...prev, cid]);
    }
    setUnfollowingComedian(null);
  };

  const handleUnfollowOrganizer = async (oid: string) => {
    setUnfollowingOrganizer(oid);
    setOrganizerIds(prev => prev.filter(o => o !== oid));
    try {
      await updateDoc(doc(db, 'users', uid), { following_organizers: arrayRemove(oid) });
    } catch {
      setOrganizerIds(prev => [...prev, oid]);
    }
    setUnfollowingOrganizer(null);
  };

  const unfollowBtn = (onClick: () => void, loading: boolean) => (
    <button
      onClick={onClick}
      disabled={loading}
      className="flex items-center justify-center px-4 py-2 rounded-xl text-[10px] font-black uppercase italic tracking-widest border border-slate-700 text-slate-400 hover:border-red-600 hover:text-red-400 transition-all disabled:opacity-40 min-w-[80px]"
    >
      {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Unfollow'}
    </button>
  );

  if (loading) return (
    <div className="glass-card p-12 rounded-[2.5rem] border-slate-800 flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-red-500 opacity-60" />
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">

      {/* Scenes */}
      <div className="glass-card p-8 rounded-[2.5rem] border-slate-800">
        <div className="flex items-center gap-3 mb-6">
          <MapPin className="w-4 h-4 text-red-500" />
          <h3 className="text-sm font-black italic uppercase tracking-widest">Scenes</h3>
          {sceneSlugs.length > 0 && (
            <span className="ml-auto text-[10px] font-black text-slate-500 uppercase tracking-widest">
              {sceneSlugs.length} followed
            </span>
          )}
        </div>

        {sceneSlugs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-slate-600 gap-3">
            <MapPin className="w-8 h-8 opacity-30" />
            <p className="text-[10px] font-bold uppercase tracking-widest">No scenes followed yet</p>
            <p className="text-[11px] font-medium text-slate-700">Browse Scenes and hit Follow Scene to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sceneSlugs.map(slug => (
              <div key={slug} className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-600/20 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-red-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black italic uppercase tracking-tight">{slugToName(slug)}</h4>
                    <p className="text-[10px] text-slate-500 font-medium">{slugToLocation(slug)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {sceneCounts[slug] != null && (
                    <div className="text-right hidden sm:block mr-3">
                      <p className="text-xs font-black text-white">{sceneCounts[slug].toLocaleString()}</p>
                      <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">followers</p>
                    </div>
                  )}
                  <button
                    onClick={() => navigateTo(PageType.SCENES, slug)}
                    className="px-4 py-2 rounded-xl text-[10px] font-black uppercase italic tracking-widest bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-all"
                  >
                    View
                  </button>
                  {unfollowBtn(() => handleUnfollowScene(slug), unfollowingScene === slug)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Comedians */}
      <div className="glass-card p-8 rounded-[2.5rem] border-slate-800">
        <div className="flex items-center gap-3 mb-6">
          <Mic2 className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-black italic uppercase tracking-widest">Comedians</h3>
          {comedianIds.length > 0 && (
            <span className="ml-auto text-[10px] font-black text-slate-500 uppercase tracking-widest">
              {comedianIds.length} followed
            </span>
          )}
        </div>

        {comedianIds.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-slate-600 gap-3">
            <Users className="w-8 h-8 opacity-30" />
            <p className="text-[10px] font-bold uppercase tracking-widest">No comedians followed yet</p>
            <p className="text-[11px] font-medium text-slate-700">Follow comedians from the Roster tab on any Scene.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {comedianIds.map(cid => (
              <div key={cid} className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                    <Mic2 className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black italic uppercase tracking-tight">
                      {comedianNames[cid] ?? 'Comedian'}
                    </h4>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigateTo(PageType.COMEDIAN_PROFILE, cid)}
                    className="px-4 py-2 rounded-xl text-[10px] font-black uppercase italic tracking-widest bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-all"
                  >
                    View
                  </button>
                  {unfollowBtn(() => handleUnfollowComedian(cid), unfollowingComedian === cid)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Organizers */}
      <div className="glass-card p-8 rounded-[2.5rem] border-slate-800">
        <div className="flex items-center gap-3 mb-6">
          <Building2 className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-black italic uppercase tracking-widest">Organizers</h3>
          {organizerIds.length > 0 && (
            <span className="ml-auto text-[10px] font-black text-slate-500 uppercase tracking-widest">
              {organizerIds.length} followed
            </span>
          )}
        </div>

        {organizerIds.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-slate-600 gap-3">
            <Building2 className="w-8 h-8 opacity-30" />
            <p className="text-[10px] font-bold uppercase tracking-widest">No organizers followed yet</p>
            <p className="text-[11px] font-medium text-slate-700">Follow organizers from the Organizers tab on any Scene.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {organizerIds.map(oid => (
              <div key={oid} className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black italic uppercase tracking-tight">
                      {organizerNames[oid] ?? 'Organizer'}
                    </h4>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigateTo(PageType.ORGANIZER_PROFILE, oid)}
                    className="px-4 py-2 rounded-xl text-[10px] font-black uppercase italic tracking-widest bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-all"
                  >
                    View
                  </button>
                  {unfollowBtn(() => handleUnfollowOrganizer(oid), unfollowingOrganizer === oid)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

// ── Action cards (Comedian + Organizer only) ───────────────────────────────────

const ActionCards: React.FC<{ onPostGig: () => void }> = ({ onPostGig }) => (
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
      <button disabled className="w-full flex items-center justify-center gap-2 bg-red-600/10 border border-red-600/20 text-red-400 py-3 rounded-xl text-[10px] font-black uppercase italic tracking-widest cursor-not-allowed opacity-60">
        Coming Soon <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>

    <div className="glass-card p-6 rounded-3xl border-slate-800 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20">
          <Briefcase className="w-5 h-5 text-amber-500" />
        </div>
        <div>
          <h4 className="text-sm font-black italic uppercase tracking-tight text-white">Post a Gig</h4>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">Post an open opportunity for comedians to apply.</p>
        </div>
      </div>
      <button
        onClick={onPostGig}
        className="w-full flex items-center justify-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 py-3 rounded-xl text-[10px] font-black uppercase italic tracking-widest hover:bg-amber-500/20 hover:text-amber-300 active:scale-95 transition-all"
      >
        Post a Gig <ArrowRight className="w-3.5 h-3.5" />
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
        { icon: <Heart className="w-3.5 h-3.5 text-pink-400" />,    text: 'Follow comedians, organizers, and scenes' },
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
        { icon: <Heart className="w-3.5 h-3.5 text-purple-400" />,       text: 'Follow comedians, organizers, and scenes' },
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
        { icon: <Heart className="w-3.5 h-3.5 text-purple-400" />,       text: 'Follow comedians, organizers, and scenes' },
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

export const UserDashboard: React.FC<UserDashboardProps> = ({ role, authUser, initialTab, navigateTo }) => {
  const [activeTab,      setActiveTab]      = useState(initialTab ?? 'home');
  const [isPostGigOpen,  setIsPostGigOpen]  = useState(false);
  const [gigsKey,        setGigsKey]        = useState(0);
  const [liveStats,        setLiveStats]        = useState<Record<string, number>>({});
  const [comedianDocId,    setComedianDocId]    = useState<string | null>(null);
  const [followersOpen,    setFollowersOpen]    = useState(false);
  const [followersList,    setFollowersList]    = useState<{ uid: string; name: string; role: string }[]>([]);
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [followersTab,     setFollowersTab]     = useState<'all' | 'fan' | 'comedian' | 'organizer'>('all');

  useEffect(() => {
    if (!authUser) return;
    async function loadStats() {
      try {
        if (role === 'organizer') {
          const [orgSnap, gigsSnap] = await Promise.all([
            getDoc(doc(db, 'organizers', authUser!.uid)),
            getDocs(query(collection(db, 'gigs'), where('posted_by_uid', '==', authUser!.uid))),
          ]);
          const followers: string[] = orgSnap.data()?.followers ?? [];
          const gigIds = gigsSnap.docs.map(d => d.id);
          let talentBooked = 0;
          if (gigIds.length > 0) {
            const appsSnap = await getDocs(
              query(collection(db, 'applications'), where('gig_id', 'in', gigIds.slice(0, 30)))
            );
            talentBooked = appsSnap.docs.filter(d => d.data().status === 'accepted').length;
          }
          setLiveStats({ 'Followers': followers.length, 'Talent Booked': talentBooked });
        } else if (role === 'comedian') {
          let followers: string[] = [];
          const directSnap = await getDoc(doc(db, 'comedians', authUser!.uid));
          if (directSnap.exists()) {
            followers = directSnap.data()?.followers ?? [];
            setComedianDocId(authUser!.uid);
          } else {
            // Legacy claimed profile — doc ID differs from UID
            const q = await getDocs(query(collection(db, 'comedians'), where('uid', '==', authUser!.uid)));
            if (!q.empty) {
              followers = q.docs[0].data().followers ?? [];
              setComedianDocId(q.docs[0].id);
            }
          }
          setLiveStats({ 'Followers': followers.length });
        } else if (role === 'fan') {
          const snap = await getDoc(doc(db, 'users', authUser!.uid));
          const data = snap.data() ?? {};
          const followingCount =
            (data.following_comedians?.length ?? 0) +
            (data.following_scenes?.length    ?? 0) +
            (data.following_organizers?.length ?? 0);
          setLiveStats({ 'Following': followingCount });
        }
      } catch { /* ignore */ }
    }
    loadStats();
  }, [authUser, role]);

  const openFollowersModal = async () => {
    if (!authUser || (role !== 'comedian' && role !== 'organizer')) return;
    setFollowersOpen(true);
    if (followersList.length > 0) return; // already loaded
    setLoadingFollowers(true);
    try {
      let uids: string[] = [];
      if (role === 'comedian') {
        const direct = await getDoc(doc(db, 'comedians', authUser.uid));
        if (direct.exists()) {
          uids = direct.data()?.followers ?? [];
        } else {
          const q = await getDocs(query(collection(db, 'comedians'), where('uid', '==', authUser.uid)));
          if (!q.empty) uids = q.docs[0].data().followers ?? [];
        }
      } else {
        const snap = await getDoc(doc(db, 'organizers', authUser.uid));
        uids = snap.data()?.followers ?? [];
      }

      // Batch fetch all comedian and organizer docs in 2 parallel queries
      const batched = uids.slice(0, 30);
      const [comedianDocs, orgDocs] = await Promise.all([
        getDocs(query(collection(db, 'comedians'), where(documentId(), 'in', batched))),
        getDocs(query(collection(db, 'organizers'), where(documentId(), 'in', batched))),
      ]);
      const comedianMap: Record<string, string> = {};
      comedianDocs.docs.forEach(d => { if (d.data()?.comedian_name) comedianMap[d.id] = d.data().comedian_name; });
      const orgMap: Record<string, string> = {};
      orgDocs.docs.forEach(d => { if (d.data()?.display_name) orgMap[d.id] = d.data().display_name; });

      const fanUids = uids.filter(uid => !comedianMap[uid] && !orgMap[uid]);
      const fanMap: Record<string, string> = {};
      if (fanUids.length > 0) {
        const fanDocs = await getDocs(query(collection(db, 'users'), where(documentId(), 'in', fanUids.slice(0, 30))));
        fanDocs.docs.forEach(d => { fanMap[d.id] = d.data()?.display_name ?? ''; });
      }

      const resolved = uids.map(uid => {
        if (comedianMap[uid]) return { uid, name: comedianMap[uid], role: 'comedian' };
        if (orgMap[uid])      return { uid, name: orgMap[uid],      role: 'organizer' };
        return { uid, name: fanMap[uid] || 'Fan', role: 'fan' };
      });
      setFollowersList(resolved);
    } catch { /* ignore */ }
    setLoadingFollowers(false);
  };

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  const displayName = authUser?.displayName ?? authUser?.email?.split('@')[0] ?? 'Member';
  const firstName   = displayName.split(' ')[0];
  const initial     = displayName[0]?.toUpperCase() ?? '?';

  const navItems  = NAV_ITEMS[role]   ?? NAV_ITEMS.fan;
  const stats     = STATS[role]       ?? STATS.fan;
  const roleLabel = ROLE_LABELS[role] ?? 'Member';

  const renderHome = () => (
    <div className="space-y-6 animate-in fade-in duration-500">

      <div className="glass-card p-8 rounded-[2.5rem] border-slate-800 bg-gradient-to-br from-red-600/10 to-transparent relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-red-600/10 blur-[100px] rounded-full" />
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-2">
              Welcome Back, <span className="text-amber-500">{firstName}</span>
            </h2>
            <p className="text-slate-400 font-medium max-w-lg">{WELCOME_SUBTITLES[role]}</p>
          </div>
          {navigateTo && role === 'comedian' && comedianDocId && (
            <button
              onClick={() => navigateTo(PageType.COMEDIAN_PROFILE, comedianDocId)}
              className="shrink-0 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase italic tracking-widest text-slate-300 hover:bg-amber-500/10 hover:border-amber-500/30 hover:text-amber-400 transition-all"
            >
              View Profile →
            </button>
          )}
          {navigateTo && role === 'organizer' && authUser && (
            <button
              onClick={() => navigateTo(PageType.ORGANIZER_PROFILE, authUser.uid)}
              className="shrink-0 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase italic tracking-widest text-slate-300 hover:bg-amber-500/10 hover:border-amber-500/30 hover:text-amber-400 transition-all"
            >
              View Profile →
            </button>
          )}
        </div>
      </div>

      {(role === 'comedian' || role === 'organizer') && (
        <ActionCards onPostGig={() => setIsPostGigOpen(true)} />
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const isFollowersCard = s.label === 'Followers' && (role === 'comedian' || role === 'organizer');
          return (
            <div
              key={i}
              onClick={isFollowersCard ? openFollowersModal : undefined}
              className={`glass-card p-5 rounded-3xl border-slate-800/50 transition-all group ${isFollowersCard ? 'cursor-pointer hover:border-amber-500/30' : 'hover:bg-slate-900/50'}`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 group-hover:scale-110 transition-transform">
                  {s.icon}
                </div>
                {isFollowersCard && <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 group-hover:text-amber-500 transition-colors">View →</span>}
              </div>
              <div className="text-3xl font-black italic">
                {liveStats[s.label] !== undefined ? liveStats[s.label].toLocaleString() : s.val}
              </div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{s.label}</div>
            </div>
          );
        })}
      </div>

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
      {role === 'fan'      && authUser ? <FanPreferencesSettings uid={authUser.uid} /> :
       role === 'comedian'  && authUser ? <ComedianSettings      uid={authUser.uid} /> :
       role === 'organizer' && authUser ? <OrganizerSettings     uid={authUser.uid} /> :
       null}

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

  const renderEditProfile = () => {
    if (!authUser) return null;
    if (role === 'comedian')  return <ComedianEditProfile  uid={authUser.uid} />;
    if (role === 'organizer') return <OrganizerEditProfile uid={authUser.uid} />;
    return <FanEditProfile uid={authUser.uid} />;
  };

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
          {activeTab === 'edit-profile' && renderEditProfile()}
          {activeTab === 'following'    && authUser && navigateTo && <FollowingTab uid={authUser.uid} navigateTo={navigateTo} />}
          {activeTab === 'gigs'         && authUser && <GigsTab uid={authUser.uid} role={role} refreshKey={gigsKey} />}
          {activeTab !== 'home' && activeTab !== 'settings' && activeTab !== 'edit-profile' && activeTab !== 'following' && activeTab !== 'gigs' && (
            <div className="glass-card p-20 rounded-[2.5rem] border-slate-800 text-center text-slate-500 flex flex-col items-center justify-center italic font-bold opacity-50 uppercase tracking-[0.2em] text-xs">
              <Zap className="w-12 h-12 mb-4 animate-pulse" />
              Feature Incoming
            </div>
          )}
        </div>
      </div>

      {isPostGigOpen && (
        <PostSpotModal
          initialMode="GIG"
          onClose={() => setIsPostGigOpen(false)}
          onSuccess={() => { setIsPostGigOpen(false); setGigsKey(v => v + 1); }}
        />
      )}

      {followersOpen && (() => {
        const counts = {
          all:       followersList.length,
          fan:       followersList.filter(f => f.role === 'fan').length,
          comedian:  followersList.filter(f => f.role === 'comedian').length,
          organizer: followersList.filter(f => f.role === 'organizer').length,
        };
        const visible = followersTab === 'all' ? followersList : followersList.filter(f => f.role === followersTab);
        const tabs: { id: typeof followersTab; label: string }[] = [
          { id: 'all',       label: 'All' },
          { id: 'comedian',  label: 'Comedians' },
          { id: 'organizer', label: 'Organizers' },
          { id: 'fan',       label: 'Fans' },
        ];
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setFollowersOpen(false)}>
            <div className="glass-card w-full max-w-md rounded-[2rem] border-slate-700 overflow-hidden" onClick={e => e.stopPropagation()}>

              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4">
                <div>
                  <h3 className="text-sm font-black italic uppercase tracking-widest">Followers</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                    {counts.all} total
                  </p>
                </div>
                <button onClick={() => setFollowersOpen(false)} className="p-2 rounded-xl hover:bg-slate-800 transition-colors">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {/* Tabs */}
              {!loadingFollowers && counts.all > 0 && (
                <div className="flex gap-1 px-4 pb-3 overflow-x-auto no-scrollbar">
                  {tabs.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setFollowersTab(t.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
                        followersTab === t.id
                          ? t.id === 'comedian'  ? 'bg-red-500/10 border-red-500/30 text-red-400'
                          : t.id === 'organizer' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                          : t.id === 'fan'       ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                                                 : 'bg-white/10 border-white/20 text-white'
                          : 'border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      {t.label}
                      <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${
                        followersTab === t.id ? 'bg-white/10' : 'bg-slate-800'
                      }`}>
                        {counts[t.id]}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* List */}
              <div className="px-4 pb-4 max-h-[55vh] overflow-y-auto space-y-2">
                {loadingFollowers ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-amber-500 opacity-60" />
                  </div>
                ) : counts.all === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-600 gap-3">
                    <Users className="w-8 h-8 opacity-30" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">No followers yet</p>
                  </div>
                ) : visible.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-slate-600 gap-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest">No {followersTab}s following you yet</p>
                  </div>
                ) : (
                  visible.map(f => (
                    <div key={f.uid} className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center font-black text-sm text-slate-400 shrink-0">
                        {f.name[0]?.toUpperCase() ?? '?'}
                      </div>
                      <p className="flex-grow text-sm font-bold text-white truncate">{f.name}</p>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full border shrink-0 ${
                        f.role === 'comedian'  ? 'border-red-500/20 bg-red-500/10 text-red-400' :
                        f.role === 'organizer' ? 'border-amber-500/20 bg-amber-500/10 text-amber-400' :
                                                 'border-slate-700 bg-slate-800 text-slate-400'
                      }`}>{f.role}</span>
                      {navigateTo && f.role === 'comedian' && (
                        <button
                          onClick={() => { setFollowersOpen(false); navigateTo(PageType.COMEDIAN_PROFILE, f.uid); }}
                          className="text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-amber-400 transition-colors shrink-0"
                        >
                          View →
                        </button>
                      )}
                      {navigateTo && f.role === 'organizer' && (
                        <button
                          onClick={() => { setFollowersOpen(false); navigateTo(PageType.ORGANIZER_PROFILE, f.uid); }}
                          className="text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-amber-400 transition-colors shrink-0"
                        >
                          View →
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>

            </div>
          </div>
        );
      })()}
    </div>
  );
};
