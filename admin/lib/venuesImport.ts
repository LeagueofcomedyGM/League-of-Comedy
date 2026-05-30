import { Timestamp } from 'firebase/firestore';
import type { PreviewCol } from '../components/CsvImport';

const NUMBER_FIELDS = new Set(['geolocation_latitude', 'geolocation_longitude', 'capacity']);
const AUTO_FIELDS   = new Set(['created_at', 'updated_at']);

export const VENUE_REQUIRED_FIELDS = ['venue_name', 'venue_city'];

export const VENUE_PREVIEW_COLS: PreviewCol[] = [
  { key: 'venue_name',    label: 'venue_name'    },
  { key: 'venue_city',    label: 'venue_city'    },
  { key: 'venue_state',   label: 'venue_state'   },
  { key: 'venue_address', label: 'venue_address' },
  { key: 'capacity',      label: 'capacity'      },
];

export function getVenueDocId(raw: Record<string, string>, _meta: Record<string, unknown>): string {
  const name = (raw.venue_name ?? '').replace(/\//g, '-').trim();
  const city = (raw.venue_city ?? '').replace(/\//g, '-').trim();
  return `${name}::${city}` || 'unknown';
}

export function buildVenueDoc(raw: Record<string, string>, _meta: Record<string, unknown>): Record<string, unknown> {
  const now = Timestamp.now();
  const result: Record<string, unknown> = { created_at: now, updated_at: now };

  for (const [key, value] of Object.entries(raw)) {
    if (AUTO_FIELDS.has(key)) continue;
    if (value === '' || value == null) { result[key] = ''; continue; }
    if (NUMBER_FIELDS.has(key)) {
      const n = parseFloat(value);
      result[key] = isNaN(n) ? value : n;
    } else {
      result[key] = value;
    }
  }

  return result;
}
