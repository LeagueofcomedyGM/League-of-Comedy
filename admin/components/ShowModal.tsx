import React, { useState, useEffect } from 'react';
import { doc, setDoc, deleteDoc, Timestamp, arrayUnion } from 'firebase/firestore';
import { db } from '../../firebase';
import { makeShowDocId, generateShowSlug } from '../lib/showsImport';
import { X, Loader2 } from 'lucide-react';

export interface ShowDoc {
  _id:                   string;
  show_title:            string;
  events_platform:       string;
  event_id:              string;
  show_date:             unknown;
  venue_name:            string;
  venue_city:            string;
  venue_state:           string;
  country_code:          string;
  venue_address:         string;
  ticket_url:            string;
  ticket_price:          unknown;
  ticket_count:          unknown;
  show_image_url:        string;
  geolocation_latitude:  unknown;
  geolocation_longitude: unknown;
  nearby_restaurants:    string;
  nearby_parking:        string;
  event_description:     string;
  meta_title:            string;
  meta_description:      string;
  h1_tag:                string;
  h2_tag:                string;
  image_alt_text:        string;
  slug:                  string;
  created_at:            unknown;
  [key: string]:         unknown;
}

interface FormData {
  show_title:            string;
  events_platform:       string;
  event_id:              string;
  show_date:             string;
  show_image_url:        string;
  ticket_url:            string;
  ticket_price:          string;
  ticket_count:          string;
  venue_name:            string;
  venue_city:            string;
  venue_state:           string;
  country_code:          string;
  venue_address:         string;
  geolocation_latitude:  string;
  geolocation_longitude: string;
  nearby_restaurants:    string;
  nearby_parking:        string;
  event_description:     string;
  meta_title:            string;
  meta_description:      string;
  h1_tag:                string;
  h2_tag:                string;
  image_alt_text:        string;
}

const EMPTY: FormData = {
  show_title: '', events_platform: '', event_id: '', show_date: '',
  show_image_url: '', ticket_url: '', ticket_price: '', ticket_count: '',
  venue_name: '', venue_city: '', venue_state: '', country_code: '',
  venue_address: '', geolocation_latitude: '', geolocation_longitude: '',
  nearby_restaurants: '', nearby_parking: '',
  event_description: '', meta_title: '', meta_description: '',
  h1_tag: '', h2_tag: '', image_alt_text: '',
};

function tsToInput(ts: unknown): string {
  if (!ts || typeof ts !== 'object' || !('toDate' in (ts as object))) return '';
  const d = (ts as Timestamp).toDate();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

function parseLocalDate(val: string): Date | null {
  if (!val) return null;
  const [datePart, timePart = '00:00'] = val.split('T');
  const [yr, mo, dy] = datePart.split('-').map(Number);
  const [hr, mn]     = timePart.split(':').map(Number);
  const d = new Date(yr, mo - 1, dy, hr, mn);
  return isNaN(d.getTime()) ? null : d;
}

interface Props {
  show:    ShowDoc | null;
  onClose: () => void;
  onSaved: () => void;
}

const cls = "w-full bg-[#070b14] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-[#8892a4] focus:outline-none focus:border-white/30 transition-colors";

const Field = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black uppercase tracking-widest text-[#8892a4]">
      {label}{required && <span className="text-red-400 ml-1">*</span>}
    </label>
    {children}
  </div>
);

export const ShowModal: React.FC<Props> = ({ show, onClose, onSaved }) => {
  const [form,   setForm]   = useState<FormData>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  useEffect(() => {
    if (show) {
      setForm({
        show_title:            String(show.show_title            ?? ''),
        events_platform:       String(show.events_platform       ?? ''),
        event_id:              String(show.event_id              ?? ''),
        show_date:             tsToInput(show.show_date),
        show_image_url:        String(show.show_image_url        ?? ''),
        ticket_url:            String(show.ticket_url            ?? ''),
        ticket_price:          String(show.ticket_price          ?? ''),
        ticket_count:          String(show.ticket_count          ?? ''),
        venue_name:            String(show.venue_name            ?? ''),
        venue_city:            String(show.venue_city            ?? ''),
        venue_state:           String(show.venue_state           ?? ''),
        country_code:          String(show.country_code          ?? ''),
        venue_address:         String(show.venue_address         ?? ''),
        geolocation_latitude:  String(show.geolocation_latitude  ?? ''),
        geolocation_longitude: String(show.geolocation_longitude ?? ''),
        nearby_restaurants:    String(show.nearby_restaurants    ?? ''),
        nearby_parking:        String(show.nearby_parking        ?? ''),
        event_description:     String(show.event_description     ?? ''),
        meta_title:            String(show.meta_title            ?? ''),
        meta_description:      String(show.meta_description      ?? ''),
        h1_tag:                String(show.h1_tag                ?? ''),
        h2_tag:                String(show.h2_tag                ?? ''),
        image_alt_text:        String(show.image_alt_text        ?? ''),
      });
    } else {
      setForm(EMPTY);
    }
    setError('');
  }, [show]);

  const set = (k: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    if (!form.show_title.trim() || !form.events_platform.trim() || !form.event_id.trim()
        || !form.venue_name.trim() || !form.venue_city.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const parsedDate = parseLocalDate(form.show_date);
      const newDocId   = makeShowDocId(form.events_platform, form.event_id);
      const oldDocId   = show?._id;

      const data: Record<string, unknown> = {
        show_title:            form.show_title.trim(),
        events_platform:       form.events_platform.trim(),
        event_id:              form.event_id.trim(),
        show_date:             parsedDate ? Timestamp.fromDate(parsedDate) : '',
        show_image_url:        form.show_image_url.trim(),
        ticket_url:            form.ticket_url.trim(),
        ticket_price:          form.ticket_price  ? (parseFloat(form.ticket_price)  || form.ticket_price.trim())  : '',
        ticket_count:          form.ticket_count  ? (parseInt(form.ticket_count, 10) || form.ticket_count.trim()) : '',
        venue_name:            form.venue_name.trim(),
        venue_city:            form.venue_city.trim(),
        venue_state:           form.venue_state.trim(),
        country_code:          form.country_code.trim().toUpperCase(),
        venue_address:         form.venue_address.trim(),
        geolocation_latitude:  form.geolocation_latitude  ? (parseFloat(form.geolocation_latitude)  || '') : '',
        geolocation_longitude: form.geolocation_longitude ? (parseFloat(form.geolocation_longitude) || '') : '',
        nearby_restaurants:    form.nearby_restaurants.trim(),
        nearby_parking:        form.nearby_parking.trim(),
        event_description:     form.event_description.trim(),
        meta_title:            form.meta_title.trim(),
        meta_description:      form.meta_description.trim(),
        h1_tag:                form.h1_tag.trim(),
        h2_tag:                form.h2_tag.trim(),
        image_alt_text:        form.image_alt_text.trim(),
        updated_at:            Timestamp.now(),
        slug:    show?.slug       ?? generateShowSlug(form.show_title, parsedDate, form.event_id),
        created_at: show?.created_at ?? Timestamp.now(),
      };

      if (oldDocId && oldDocId !== newDocId) {
        await deleteDoc(doc(db, 'shows', oldDocId));
      }

      await setDoc(doc(db, 'shows', newDocId), data);

      // Keep filter metadata current
      const platform = form.events_platform.trim();
      const city     = form.venue_city.trim();
      const country  = form.country_code.trim().toUpperCase();
      try {
        await setDoc(doc(db, 'metadata', 'shows_filters'), {
          ...(platform && { platforms: arrayUnion(platform) }),
          ...(city     && { cities:    arrayUnion(city)     }),
          ...(country  && { countries: arrayUnion(country)  }),
        }, { merge: true });
      } catch { /* non-critical */ }

      onSaved();
      onClose();
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0a0e1a] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0">
          <h2 className="text-sm font-black uppercase tracking-widest text-white">
            {show ? 'Edit Show' : 'Add Show'}
          </h2>
          <button onClick={onClose} className="text-[#8892a4] hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">

          {/* Basic Info */}
          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#8892a4] border-b border-white/5 pb-2">Basic Info</p>
            <Field label="Show Title" required>
              <input className={cls} value={form.show_title} onChange={set('show_title')} placeholder="Sunday Night Stand Up" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Platform" required>
                <input className={cls} value={form.events_platform} onChange={set('events_platform')} placeholder="Fever" />
              </Field>
              <Field label="Event ID" required>
                <input className={cls} value={form.event_id} onChange={set('event_id')} placeholder="LG-8ZTKH4" />
              </Field>
            </div>
            <Field label="Show Date & Time">
              <input type="datetime-local" className={cls} value={form.show_date} onChange={set('show_date')} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Ticket URL">
                <input className={cls} value={form.ticket_url} onChange={set('ticket_url')} placeholder="https://…" />
              </Field>
              <Field label="Image URL">
                <input className={cls} value={form.show_image_url} onChange={set('show_image_url')} placeholder="https://…" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Ticket Price">
                <input type="number" step="0.01" min="0" className={cls} value={form.ticket_price} onChange={set('ticket_price')} placeholder="0.00" />
              </Field>
              <Field label="Ticket Count">
                <input type="number" min="0" className={cls} value={form.ticket_count} onChange={set('ticket_count')} placeholder="0" />
              </Field>
            </div>
          </div>

          {/* Venue */}
          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#8892a4] border-b border-white/5 pb-2">Venue</p>
            <Field label="Venue Name" required>
              <input className={cls} value={form.venue_name} onChange={set('venue_name')} placeholder="The Comedy Store" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="City" required>
                <input className={cls} value={form.venue_city} onChange={set('venue_city')} placeholder="Melbourne" />
              </Field>
              <Field label="State">
                <input className={cls} value={form.venue_state} onChange={set('venue_state')} placeholder="VIC" />
              </Field>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <Field label="Country Code">
                <input className={cls} value={form.country_code} onChange={set('country_code')} maxLength={2} placeholder="AU" />
              </Field>
              <div className="col-span-3" />
            </div>
            <Field label="Address">
              <input className={cls} value={form.venue_address} onChange={set('venue_address')} placeholder="123 Main St" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Latitude">
                <input type="number" step="0.000001" className={cls} value={form.geolocation_latitude} onChange={set('geolocation_latitude')} placeholder="-37.8136" />
              </Field>
              <Field label="Longitude">
                <input type="number" step="0.000001" className={cls} value={form.geolocation_longitude} onChange={set('geolocation_longitude')} placeholder="144.9631" />
              </Field>
            </div>
          </div>

          {/* Additional */}
          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#8892a4] border-b border-white/5 pb-2">Additional</p>
            <Field label="Nearby Restaurants">
              <textarea className={cls} rows={2} value={form.nearby_restaurants} onChange={set('nearby_restaurants')} />
            </Field>
            <Field label="Nearby Parking">
              <textarea className={cls} rows={2} value={form.nearby_parking} onChange={set('nearby_parking')} />
            </Field>
          </div>

          {/* SEO */}
          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#8892a4] border-b border-white/5 pb-2">SEO</p>
            <Field label="Event Description">
              <textarea className={cls} rows={3} value={form.event_description} onChange={set('event_description')} />
            </Field>
            <Field label="Meta Title">
              <input className={cls} value={form.meta_title} onChange={set('meta_title')} />
            </Field>
            <Field label="Meta Description">
              <textarea className={cls} rows={2} value={form.meta_description} onChange={set('meta_description')} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="H1 Tag">
                <input className={cls} value={form.h1_tag} onChange={set('h1_tag')} />
              </Field>
              <Field label="H2 Tag">
                <input className={cls} value={form.h2_tag} onChange={set('h2_tag')} />
              </Field>
            </div>
            <Field label="Image Alt Text">
              <input className={cls} value={form.image_alt_text} onChange={set('image_alt_text')} />
            </Field>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between shrink-0">
          <span className="text-xs text-red-400">{error}</span>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-[#8892a4] border border-white/10 hover:border-white/20 hover:text-white transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-500 text-white transition-all disabled:opacity-50"
            >
              {saving && <Loader2 className="w-3 h-3 animate-spin" />}
              {show ? 'Save Changes' : 'Add Show'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
