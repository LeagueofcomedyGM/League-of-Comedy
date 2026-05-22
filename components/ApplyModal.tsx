import React, { useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Briefcase, ArrowUpRight, Loader2, X } from 'lucide-react';

export interface ApplyGig {
  id:        string;
  title:     string;
  category:  string;
  pay_range: string;
  city:      string;
  state:     string;
}

export const ApplyModal: React.FC<{
  gig:       ApplyGig;
  authUser:  FirebaseUser | null;
  onClose:   () => void;
  onSuccess: (gigId: string) => void;
}> = ({ gig, authUser, onClose, onSuccess }) => {
  const [pitch,       setPitch]       = useState('');
  const [submitting,  setSubmitting]  = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async () => {
    const uid = authUser?.uid;
    if (!uid) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      await addDoc(collection(db, 'applications'), {
        gig_id:       gig.id,
        comedian_uid: uid,
        message:      pitch.trim(),
        applied_at:   serverTimestamp(),
        status:       'pending',
      });
      onSuccess(gig.id);
    } catch {
      setSubmitError('Something went wrong. Please try again.');
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-[#0f1628] rounded-[2.5rem] p-8 border border-white/10 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-[#8892a4] hover:text-white transition-colors hover:bg-white/5 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <Briefcase className="w-5 h-5 text-[#e53e3e]" />
          <h2 className="text-xl font-black italic uppercase tracking-tighter">Apply for Gig</h2>
        </div>

        <div className="bg-[#131b2e] border border-white/5 rounded-2xl p-4 mb-6 space-y-1">
          <p className="text-sm font-black italic uppercase tracking-tight text-white">{gig.title}</p>
          <div className="flex flex-wrap gap-3 text-[10px] font-bold text-[#8892a4] uppercase tracking-widest">
            {gig.category && <span className="text-[#e53e3e]">{gig.category}</span>}
            {gig.pay_range && <span className="text-emerald-400">{gig.pay_range}</span>}
            <span>{[gig.city, gig.state].filter(Boolean).join(', ')}</span>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-[10px] font-black uppercase tracking-widest text-[#8892a4] mb-2">
            Pitch / Message <span className="font-medium normal-case tracking-normal">(optional)</span>
          </label>
          <textarea
            value={pitch}
            onChange={e => setPitch(e.target.value)}
            placeholder="Tell them about yourself and why you're a great fit for this gig..."
            rows={4}
            className="w-full bg-[#131b2e] border border-white/5 rounded-xl px-4 py-3 focus:border-[#e53e3e] outline-none transition-all font-medium text-sm text-white placeholder-[#8892a4] resize-none"
          />
        </div>

        {submitError && (
          <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-4">{submitError}</p>
        )}

        <div className="flex items-center justify-between gap-4">
          <button
            onClick={onClose}
            disabled={submitting}
            className="text-xs font-black uppercase tracking-widest text-[#8892a4] hover:text-white transition-colors italic disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 bg-brand-gradient text-white px-8 py-4 rounded-xl text-xs font-black uppercase italic tracking-widest shadow-xl active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {submitting
              ? <><Loader2 className="w-3 h-3 animate-spin" /> Submitting…</>
              : <>Submit Application <ArrowUpRight className="w-3 h-3" /></>}
          </button>
        </div>
      </div>
    </div>
  );
};
