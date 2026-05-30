import { Timestamp } from 'firebase/firestore';
import type { PreviewCol } from '../components/CsvImport';

const BOOLEAN_FIELDS = new Set(['verified']);
const AUTO_FIELDS    = new Set(['created_at', 'updated_at']);

export const COMEDIAN_REQUIRED_FIELDS = ['comedian_name'];

export const COMEDIAN_PREVIEW_COLS: PreviewCol[] = [
  { key: 'comedian_name',    label: 'comedian_name' },
  { key: 'instagram_link',   label: 'instagram'     },
  { key: 'comedian_website', label: 'website'       },
  { key: 'verified',         label: 'verified'      },
  { key: 'bio',              label: 'bio'           },
];

export function getComedianDocId(raw: Record<string, string>, _meta: Record<string, unknown>): string {
  return (raw.comedian_name ?? '').replace(/\//g, '-').trim() || 'unknown';
}

export function buildComedianDoc(raw: Record<string, string>, _meta: Record<string, unknown>): Record<string, unknown> {
  const now = Timestamp.now();
  const result: Record<string, unknown> = { created_at: now, updated_at: now };

  for (const [key, value] of Object.entries(raw)) {
    if (AUTO_FIELDS.has(key)) continue;
    if (value === '' || value == null) { result[key] = ''; continue; }
    result[key] = BOOLEAN_FIELDS.has(key) ? value.toLowerCase() === 'true' : value;
  }

  return result;
}
