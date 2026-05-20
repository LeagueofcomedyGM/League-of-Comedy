
import React, { useState } from 'react';
import { X, Mic2, Briefcase, Calendar, Info, Upload, MapPin, Users } from 'lucide-react';

interface PostSpotModalProps {
  onClose: () => void;
  initialMode?: 'CHOICE' | 'SHOW' | 'GIG';
}

const GIG_CATEGORIES = ['Showcase', 'Corporate', 'Private', 'Writing', 'TV / Film'];
const GIG_RATE_RANGES = ['Free / Unpaid', '$1–$100', '$100–$250', '$250–$500', '$500–$1,000', '$1,000+', 'Negotiable'];
const GIG_SET_LENGTHS = ['5 min', '10 min', '15 min', '20 min', '30 min', '45 min', '60+ min'];
const GIG_EXP_LEVELS = ['Rookie', 'Open-Micer', 'Feature Act', 'Headliner', 'All-Star / Headliner'];
const GIG_STYLES = ['Alt/Surreal', 'Deadpan', 'Impressions', 'Musical/Variety', 'Physical/Slapstick', 'Storytelling'];
const GIG_VIBES = ['Clean/Family Friendly', 'Mature/Adult', 'Edgy/Explicit'];

const PillSingle: React.FC<{
  options: string[];
  selected: string;
  onChange: (v: string) => void;
}> = ({ options, selected, onChange }) => (
  <div className="flex flex-wrap gap-2 mt-2">
    {options.map(opt => (
      <button
        key={opt}
        type="button"
        onClick={() => onChange(selected === opt ? '' : opt)}
        className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
          selected === opt
            ? 'bg-[#e53e3e] text-white'
            : 'bg-[#131b2e] border border-white/5 text-[#8892a4] hover:border-white/20 hover:text-white'
        }`}
      >
        {opt}
      </button>
    ))}
  </div>
);

const PillMulti: React.FC<{
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
}> = ({ options, selected, onChange }) => {
  const toggle = (opt: string) =>
    onChange(selected.includes(opt) ? selected.filter(s => s !== opt) : [...selected, opt]);
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {options.map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => toggle(opt)}
          className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
            selected.includes(opt)
              ? 'bg-[#e53e3e] text-white'
              : 'bg-[#131b2e] border border-white/5 text-[#8892a4] hover:border-white/20 hover:text-white'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
};

export const PostSpotModal: React.FC<PostSpotModalProps> = ({ onClose, initialMode = 'CHOICE' }) => {
  const [mode, setMode] = useState<'CHOICE' | 'SHOW' | 'GIG'>(initialMode);
  const [step, setStep] = useState(1);

  // ── Gig form state ─────────────────────────────────────────────────────────
  const [gigTitle,     setGigTitle]     = useState('');
  const [category,     setCategory]     = useState('');
  const [venueName,    setVenueName]    = useState('');
  const [city,         setCity]         = useState('');
  const [gigState,     setGigState]     = useState('');
  const [gigDate,      setGigDate]      = useState('');
  const [gigTime,      setGigTime]      = useState('');
  const [spots,        setSpots]        = useState('1');
  const [deadline,     setDeadline]     = useState('');
  const [publicBrief,  setPublicBrief]  = useState('');
  const [payRange,     setPayRange]     = useState('');
  const [setLengths,   setSetLengths]   = useState<string[]>([]);
  const [expLevel,     setExpLevel]     = useState('');
  const [styles,       setStyles]       = useState<string[]>([]);
  const [vibes,        setVibes]        = useState<string[]>([]);

  const inputCls = "w-full bg-[#131b2e] border border-white/5 rounded-xl px-4 py-3 focus:border-[#e53e3e] outline-none transition-all font-bold text-sm text-white placeholder-[#8892a4]";
  const lbl = (text: string) => (
    <label className="block text-[10px] font-black uppercase tracking-widest text-[#8892a4] mb-2">{text}</label>
  );

  // ── Choice screen ──────────────────────────────────────────────────────────
  const renderChoice = () => (
    <div className="animate-in fade-in zoom-in-95 duration-300">
      <div className="text-center mb-10">
        <div className="mx-auto w-12 h-12 bg-[#e53e3e] rounded-xl flex items-center justify-center mb-4 shadow-xl shadow-red-900/20">
          <Calendar className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-3xl font-black italic uppercase tracking-tighter">POST A SPOT</h2>
        <p className="text-[#8892a4] text-sm mt-2">What are you looking to post?</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div
          onClick={() => setMode('SHOW')}
          className="glass-card p-8 rounded-2xl border-white/10 hover:border-[#f6a623]/30 cursor-pointer group transition-all hover:-translate-y-1"
        >
          <div className="p-4 bg-[#131b2e] rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform">
            <Mic2 className="w-8 h-8 text-[#f6a623]" />
          </div>
          <h3 className="text-xl font-black italic uppercase mb-3">POST A SHOW</h3>
          <p className="text-[10px] text-[#8892a4] font-medium leading-relaxed">List a live comedy event, set up ticketing through League of Comedy, and get discovered by fans in your city.</p>
        </div>

        <div
          onClick={() => { setMode('GIG'); setStep(1); }}
          className="glass-card p-8 rounded-2xl border-white/10 hover:border-[#e53e3e]/30 cursor-pointer group transition-all hover:-translate-y-1"
        >
          <div className="p-4 bg-[#131b2e] rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform">
            <Briefcase className="w-8 h-8 text-[#e53e3e]" />
          </div>
          <h3 className="text-xl font-black italic uppercase mb-3">POST A GIG</h3>
          <p className="text-[10px] text-[#8892a4] font-medium leading-relaxed">Post an open opportunity for comedians to apply — showcases, corporate events, private parties, and more.</p>
        </div>
      </div>
    </div>
  );

  // ── Gig form ───────────────────────────────────────────────────────────────
  const renderGigForm = () => {
    const TOTAL_STEPS = 3;

    const step1Valid = gigTitle.trim() !== '' && category !== '';

    return (
      <div className="animate-in slide-in-from-bottom-4 duration-500">
        {/* Header + progress */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Briefcase className="w-6 h-6 text-[#e53e3e]" />
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">POST A GIG</h2>
          </div>
          <div className="flex gap-2">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-grow rounded-full transition-all duration-500 ${i + 1 <= step ? 'bg-brand-gradient' : 'bg-[#131b2e]'}`}
              />
            ))}
          </div>
          <p className="text-[10px] text-[#8892a4] font-bold uppercase tracking-widest mt-3">
            {step === 1 && 'Step 1 of 3 — The Basics'}
            {step === 2 && 'Step 2 of 3 — Requirements'}
            {step === 3 && 'Step 3 of 3 — Review & Publish'}
          </p>
        </div>

        <div className="max-h-[58vh] overflow-y-auto pr-2 space-y-6 no-scrollbar">

          {/* ── Step 1: Basics ──────────────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                {lbl('Gig Title *')}
                <input
                  type="text"
                  value={gigTitle}
                  onChange={e => setGigTitle(e.target.value)}
                  placeholder="e.g. Friday Night Showcase @ The Laugh Den"
                  className={inputCls}
                />
              </div>

              <div>
                {lbl('Gig Category *')}
                <PillSingle options={GIG_CATEGORIES} selected={category} onChange={setCategory} />
              </div>

              <div>
                {lbl('Venue Name')}
                <input
                  type="text"
                  value={venueName}
                  onChange={e => setVenueName(e.target.value)}
                  placeholder="e.g. The Laugh Den"
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  {lbl('City')}
                  <input
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    placeholder="City"
                    className={inputCls}
                  />
                </div>
                <div>
                  {lbl('State')}
                  <input
                    type="text"
                    value={gigState}
                    onChange={e => setGigState(e.target.value)}
                    placeholder="State"
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  {lbl('Date')}
                  <input
                    type="date"
                    value={gigDate}
                    onChange={e => setGigDate(e.target.value)}
                    className={`${inputCls} text-[#8892a4]`}
                  />
                </div>
                <div>
                  {lbl('Start Time')}
                  <input
                    type="time"
                    value={gigTime}
                    onChange={e => setGigTime(e.target.value)}
                    className={`${inputCls} text-[#8892a4]`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  {lbl('Spots Available')}
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={spots}
                    onChange={e => setSpots(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  {lbl('Application Deadline')}
                  <input
                    type="date"
                    value={deadline}
                    onChange={e => setDeadline(e.target.value)}
                    className={`${inputCls} text-[#8892a4]`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: Requirements ────────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                {lbl('Public Brief')}
                <p className="text-[10px] text-[#8892a4] font-medium mb-2">
                  Visible to all comedians. Describe the gig, audience, and tone in 2–3 sentences.
                </p>
                <textarea
                  value={publicBrief}
                  onChange={e => setPublicBrief(e.target.value)}
                  placeholder="e.g. We're booking 3 feature acts for our monthly showcase. Audience is mixed 25-45, all vibes welcome. Must have 10+ min of tight material."
                  rows={4}
                  className={`${inputCls} resize-none`}
                />
              </div>

              <div>
                {lbl('Pay / Compensation *')}
                <PillSingle options={GIG_RATE_RANGES} selected={payRange} onChange={setPayRange} />
              </div>

              <div>
                {lbl('Set Length Required')}
                <PillMulti options={GIG_SET_LENGTHS} selected={setLengths} onChange={setSetLengths} />
              </div>

              <div>
                {lbl('Experience Level Required')}
                <p className="text-[10px] text-[#8892a4] font-medium mb-1">Leave blank to accept all levels.</p>
                <PillSingle options={GIG_EXP_LEVELS} selected={expLevel} onChange={setExpLevel} />
              </div>

              <div>
                {lbl('Comedy Styles Wanted')}
                <PillMulti options={GIG_STYLES} selected={styles} onChange={setStyles} />
              </div>

              <div>
                {lbl('Comedy Vibe')}
                <PillMulti options={GIG_VIBES} selected={vibes} onChange={setVibes} />
              </div>
            </div>
          )}

          {/* ── Step 3: Review & Publish ─────────────────────────────────── */}
          {step === 3 && (
            <div className="space-y-5">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">Draft Preview</p>

              {/* Preview card */}
              <div className="glass-card p-6 rounded-2xl border-white/10 bg-[#0f1628] space-y-4">
                {category && (
                  <span className="inline-block px-3 py-1 rounded-full bg-[#e53e3e]/10 border border-[#e53e3e]/20 text-[9px] font-black uppercase tracking-widest text-[#e53e3e]">
                    {category}
                  </span>
                )}
                <h4 className="text-xl font-black italic uppercase tracking-tight">
                  {gigTitle || 'Untitled Gig'}
                </h4>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-bold text-[#8892a4]">
                  {(city || gigState) && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {[venueName, city, gigState].filter(Boolean).join(', ')}
                    </span>
                  )}
                  {gigDate && <span>{new Date(gigDate + 'T00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
                  {gigTime && <span>{gigTime}</span>}
                </div>

                {payRange && (
                  <p className="text-[#48bb78] font-black italic tracking-widest text-sm">{payRange}</p>
                )}

                {publicBrief && (
                  <p className="text-xs text-[#8892a4] font-medium leading-relaxed">{publicBrief}</p>
                )}

                <div className="flex flex-wrap gap-2 pt-1">
                  {expLevel && (
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[9px] font-black uppercase tracking-widest text-amber-400">
                      {expLevel}
                    </span>
                  )}
                  {setLengths.map(s => (
                    <span key={s} className="px-2.5 py-1 rounded-full bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-widest text-[#8892a4]">
                      {s}
                    </span>
                  ))}
                  {styles.map(s => (
                    <span key={s} className="px-2.5 py-1 rounded-full bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-widest text-[#8892a4]">
                      {s}
                    </span>
                  ))}
                  {vibes.map(v => (
                    <span key={v} className="px-2.5 py-1 rounded-full bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-widest text-[#8892a4]">
                      {v}
                    </span>
                  ))}
                </div>

                {spots && (
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#8892a4]">
                    <Users className="w-3.5 h-3.5" />
                    {spots} spot{Number(spots) !== 1 ? 's' : ''} available
                    {deadline && ` · Deadline ${new Date(deadline + 'T00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                  </div>
                )}
              </div>

              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex gap-3">
                <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-blue-400 leading-relaxed font-bold uppercase tracking-wider">
                  League of Comedy charges a 10% booking fee on confirmed bookings. No upfront cost to post.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer nav */}
        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : (initialMode === 'GIG' ? onClose() : setMode('CHOICE'))}
            className="text-xs font-black uppercase tracking-widest text-[#8892a4] hover:text-white transition-colors italic"
          >
            {step === 1 && initialMode !== 'GIG' ? '← Back' : step > 1 ? '← Back' : 'Cancel'}
          </button>

          <div className="flex items-center gap-4">
            {step === 3 && (
              <button
                onClick={onClose}
                className="text-xs font-black uppercase tracking-widest text-[#8892a4] hover:text-white transition-colors italic underline underline-offset-4"
              >
                Save as Draft
              </button>
            )}
            <button
              onClick={() => step < TOTAL_STEPS ? setStep(step + 1) : onClose()}
              disabled={step === 1 && !step1Valid}
              className="bg-brand-gradient text-white px-8 py-4 rounded-xl text-xs font-black uppercase italic tracking-widest shadow-xl active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {step === TOTAL_STEPS ? 'Publish Gig →' : 'Continue →'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ── Show form ──────────────────────────────────────────────────────────────
  const renderShowForm = () => (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-8">
        <Mic2 className="w-6 h-6 text-[#f6a623]" />
        <h2 className="text-2xl font-black italic uppercase tracking-tighter">POST A SHOW</h2>
      </div>
      <div className="space-y-6">
        <div className="border-2 border-dashed border-white/5 rounded-2xl p-12 flex flex-col items-center justify-center gap-4 bg-[#131b2e]/50 hover:bg-[#131b2e] transition-all cursor-pointer group">
          <div className="p-4 bg-[#0a0e1a] rounded-full group-hover:scale-110 transition-transform">
            <Upload className="w-6 h-6 text-[#8892a4] group-hover:text-[#f6a623]" />
          </div>
          <p className="font-bold text-sm text-[#8892a4]">Upload show poster (min 800×1000)</p>
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-[#8892a4] mb-2">Show Title *</label>
          <input type="text" placeholder="e.g. London Comedy Roast" className="w-full bg-[#131b2e] border border-white/5 rounded-xl px-5 py-4 focus:border-[#f6a623] outline-none font-bold text-sm text-white placeholder-[#8892a4]" />
        </div>
        <button
          onClick={onClose}
          className="w-full bg-brand-gradient text-white py-5 rounded-2xl text-xs font-black uppercase italic tracking-widest shadow-xl active:scale-95 transition-all mt-6"
        >
          Continue to Ticketing →
        </button>
        <button
          onClick={() => setMode('CHOICE')}
          className="w-full py-4 text-xs font-black uppercase tracking-widest text-[#8892a4] hover:text-white transition-colors italic"
        >
          Cancel
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0f1628] rounded-[2.5rem] p-10 border border-white/10 shadow-2xl my-8">
        <button
          onClick={onClose}
          className="absolute top-8 right-8 p-2 text-[#8892a4] hover:text-white transition-colors hover:bg-white/5 rounded-full"
        >
          <X className="w-6 h-6" />
        </button>

        {mode === 'CHOICE' && renderChoice()}
        {mode === 'GIG'    && renderGigForm()}
        {mode === 'SHOW'   && renderShowForm()}
      </div>
    </div>
  );
};
