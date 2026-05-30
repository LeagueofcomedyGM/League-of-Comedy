import { Timestamp } from 'firebase/firestore';
import { parseShowDate } from './showsImport';
import type { PreviewCol } from '../components/CsvImport';

const AUTO_FIELDS = new Set(['created_at', 'updated_at']);

export const FESTIVAL_REQUIRED_FIELDS = ['festival_name'];

function formatDate(d: Date): string {
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export const FESTIVAL_PREVIEW_COLS: PreviewCol[] = [
  { key: 'festival_name', label: 'festival_name' },
  {
    key: 'start_date',
    label: 'start_date',
    renderCell: (raw, meta, status) => {
      const parsed  = meta.parsedStartDate as Date | null;
      const bad     = (!parsed && !!raw.start_date?.trim()) || status === 'bad_date';
      const display = raw.start_date?.trim()
        ? parsed ? formatDate(parsed) : raw.start_date
        : '—';
      return { value: display, className: bad ? 'text-red-400' : '' };
    },
  },
  {
    key: 'end_date',
    label: 'end_date',
    renderCell: (raw, meta) => {
      const parsed  = meta.parsedEndDate as Date | null;
      const bad     = !parsed && !!raw.end_date?.trim();
      const display = raw.end_date?.trim()
        ? parsed ? formatDate(parsed) : raw.end_date
        : '—';
      return { value: display, className: bad ? 'text-red-400' : '' };
    },
  },
  { key: 'venue_name', label: 'venue_name' },
  { key: 'venue_city', label: 'venue_city' },
];

export function getFestivalDocId(raw: Record<string, string>, _meta: Record<string, unknown>): string {
  return (raw.festival_name ?? '').replace(/\//g, '-').trim() || 'unknown';
}

export function parseFestivalExtra(raw: Record<string, string>): { status?: 'bad_date'; meta?: Record<string, unknown> } {
  const parsedStartDate = raw.start_date?.trim() ? parseShowDate(raw.start_date) : null;
  const parsedEndDate   = raw.end_date?.trim()   ? parseShowDate(raw.end_date)   : null;

  const badDate = (!!raw.start_date?.trim() && !parsedStartDate)
               || (!!raw.end_date?.trim()   && !parsedEndDate);

  return {
    status: badDate ? 'bad_date' : undefined,
    meta:   { parsedStartDate, parsedEndDate },
  };
}

export function buildFestivalDoc(raw: Record<string, string>, meta: Record<string, unknown>): Record<string, unknown> {
  const now             = Timestamp.now();
  const parsedStartDate = meta.parsedStartDate as Date | null;
  const parsedEndDate   = meta.parsedEndDate   as Date | null;
  const result: Record<string, unknown> = { created_at: now, updated_at: now };

  for (const [key, value] of Object.entries(raw)) {
    if (AUTO_FIELDS.has(key)) continue;

    if (key === 'start_date') {
      result.start_date = parsedStartDate ? Timestamp.fromDate(parsedStartDate) : '';
      continue;
    }
    if (key === 'end_date') {
      result.end_date = parsedEndDate ? Timestamp.fromDate(parsedEndDate) : '';
      continue;
    }
    if (key === 'comedian_ids') {
      result.comedian_ids = value?.trim()
        ? value.split(',').map(s => s.trim()).filter(Boolean)
        : [];
      continue;
    }

    if (value === '' || value == null) { result[key] = ''; continue; }
    result[key] = value;
  }

  return result;
}
