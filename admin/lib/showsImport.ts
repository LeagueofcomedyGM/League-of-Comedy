import { Timestamp } from 'firebase/firestore';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const NUMBER_FIELDS = new Set([
  'ticket_price',
  'ticket_count',
  'geolocation_latitude',
  'geolocation_longitude',
]);

const AUTO_FIELDS = new Set(['slug', 'created_at', 'updated_at']);

export function parseShowDate(raw: string): Date | null {
  if (!raw?.trim()) return null;
  const s = raw.trim();

  // AM/PM: M/D/YYYY h:mm AM/PM
  const ampm = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (ampm) {
    let h = parseInt(ampm[4], 10);
    const min = parseInt(ampm[5], 10);
    const period = ampm[6].toUpperCase();
    if (period === 'PM' && h !== 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    const d = new Date(parseInt(ampm[3], 10), parseInt(ampm[1], 10) - 1, parseInt(ampm[2], 10), h, min);
    if (!isNaN(d.getTime())) return d;
  }

  // 24h: M/D/YYYY H:mm
  const h24 = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})$/);
  if (h24) {
    const d = new Date(
      parseInt(h24[3], 10),
      parseInt(h24[1], 10) - 1,
      parseInt(h24[2], 10),
      parseInt(h24[4], 10),
      parseInt(h24[5], 10),
    );
    if (!isNaN(d.getTime())) return d;
  }

  return null;
}

export function generateShowSlug(title: string, date: Date | null, eventId: string): string {
  const titlePart = (title || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/-$/, '')
    .slice(0, 40);

  const datePart = date
    ? `${MONTHS[date.getMonth()]}-${String(date.getDate()).padStart(2, '0')}`
    : 'no-date';

  const idPart = (eventId || '').slice(-6) || 'xxxxxx';

  return `${titlePart}-${datePart}-${idPart}`.replace(/-+/g, '-');
}

export function buildShowDoc(
  raw: Record<string, string>,
  parsedDate: Date | null,
  slug: string,
): Record<string, unknown> {
  const now = Timestamp.now();
  const result: Record<string, unknown> = { slug, created_at: now, updated_at: now };

  for (const [key, value] of Object.entries(raw)) {
    if (AUTO_FIELDS.has(key)) continue;

    if (key === 'show_date') {
      result.show_date = parsedDate ? Timestamp.fromDate(parsedDate) : '';
      continue;
    }

    if (value === '' || value == null) {
      result[key] = '';
      continue;
    }

    if (NUMBER_FIELDS.has(key)) {
      const n = parseFloat(value);
      result[key] = isNaN(n) ? value : n;
    } else {
      result[key] = value;
    }
  }

  return result;
}
