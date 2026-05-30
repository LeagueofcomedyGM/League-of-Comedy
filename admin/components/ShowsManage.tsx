import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  collection, getDocs, deleteDoc, doc,
  query, where, orderBy, Timestamp, writeBatch,
  limit, startAfter,
} from 'firebase/firestore';
import type { QueryDocumentSnapshot, QueryConstraint } from 'firebase/firestore';
import { db } from '../../firebase';
import { Plus, Search, Trash2, Edit2, Download, ChevronLeft, ChevronRight, Loader2, RefreshCw } from 'lucide-react';
import { ShowModal } from './ShowModal';
import type { ShowDoc } from './ShowModal';

// ── Constants ──────────────────────────────────────────────────────────────────
const PER_PAGE = 25;
type DateFilter = 'upcoming' | 'past' | 'this_week' | 'this_month' | 'next_30' | 'all';

interface ActiveFilters {
  dateFilter: DateFilter;
  platform:   string;
  city:       string;
  country:    string;
}

// ── Query builder ──────────────────────────────────────────────────────────────
// Composite indexes needed in Firebase console for non-trivial filter combos:
//   events_platform ASC + show_date ASC
//   venue_city      ASC + show_date ASC
//   country_code    ASC + show_date ASC
// Firestore will surface a clickable link in the browser console if an index is missing.
function buildPageQuery(f: ActiveFilters, cursor: QueryDocumentSnapshot | null) {
  const now  = Timestamp.now();
  const coll = collection(db, 'shows');
  const cs: QueryConstraint[] = [];

  switch (f.dateFilter) {
    case 'upcoming':
      cs.push(where('show_date', '>=', now), orderBy('show_date', 'asc'));
      break;
    case 'past':
      cs.push(where('show_date', '<', now), orderBy('show_date', 'desc'));
      break;
    case 'this_week': {
      const end = new Timestamp(now.seconds + 7 * 86400, 0);
      cs.push(where('show_date', '>=', now), where('show_date', '<', end), orderBy('show_date', 'asc'));
      break;
    }
    case 'this_month': {
      const d = new Date();
      const s = Timestamp.fromDate(new Date(d.getFullYear(), d.getMonth(), 1));
      const e = Timestamp.fromDate(new Date(d.getFullYear(), d.getMonth() + 1, 1));
      cs.push(where('show_date', '>=', s), where('show_date', '<', e), orderBy('show_date', 'asc'));
      break;
    }
    case 'next_30': {
      const end = new Timestamp(now.seconds + 30 * 86400, 0);
      cs.push(where('show_date', '>=', now), where('show_date', '<', end), orderBy('show_date', 'asc'));
      break;
    }
    default:
      cs.push(orderBy('show_date', 'asc'));
  }

  if (f.platform) cs.push(where('events_platform', '==', f.platform));
  if (f.city)     cs.push(where('venue_city',      '==', f.city));
  if (f.country)  cs.push(where('country_code',    '==', f.country));

  if (cursor) cs.push(startAfter(cursor));
  cs.push(limit(PER_PAGE));

  return query(coll, ...cs);
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function fmtDate(ts: unknown): string {
  if (!ts || typeof ts !== 'object' || !('toDate' in (ts as object))) return '—';
  return (ts as Timestamp).toDate().toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
}

const inputCls  = "bg-[#0a0e1a] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-[#8892a4] focus:outline-none focus:border-white/30 transition-colors";
const selectCls = "bg-[#0a0e1a] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30 transition-colors";

// ── Component ──────────────────────────────────────────────────────────────────
export const ShowsManage: React.FC = () => {

  // Active Firestore query parameters
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    dateFilter: 'upcoming', platform: '', city: '', country: '',
  });
  const [pageIndex, setPageIndex] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);
  // Cursor stack: index i holds the startAfter doc for page i (null = first page)
  const cursorStack = useRef<(QueryDocumentSnapshot | null)[]>([null]);

  // Data
  const [shows,      setShows]      = useState<ShowDoc[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [hasMore,    setHasMore]    = useState(false);
  const [queryError, setQueryError] = useState('');

  // Pending text inputs (committed to activeFilters on Enter or Apply click)
  const [platformInput, setPlatformInput] = useState('');
  const [cityInput,     setCityInput]     = useState('');
  const [countryInput,  setCountryInput]  = useState('');

  // UI
  const [search,      setSearch]      = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [modalShow,   setModalShow]   = useState<ShowDoc | 'add' | null>(null);
  const [deleting,    setDeleting]    = useState(false);

  // ── Load page from Firestore ─────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setSelectedIds(new Set());
    setSearch('');
    setQueryError('');

    getDocs(buildPageQuery(activeFilters, cursorStack.current[pageIndex] ?? null))
      .then(snap => {
        if (cancelled) return;
        setShows(snap.docs.map(d => ({ _id: d.id, ...d.data() } as ShowDoc)));
        setHasMore(snap.docs.length === PER_PAGE);
        if (snap.docs.length > 0) {
          cursorStack.current[pageIndex + 1] = snap.docs[snap.docs.length - 1];
        }
        setLoading(false);
      })
      .catch(err => {
        if (cancelled) return;
        console.error('Failed to load shows', err);
        setQueryError('Query failed — if you applied a filter, a composite index may be needed. Check the browser console for a direct link to create it.');
        setShows([]);
        setHasMore(false);
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [activeFilters, pageIndex, reloadKey]);

  // ── Filter helpers ───────────────────────────────────────────────────────────
  const applyFilters = (newFilters: ActiveFilters) => {
    cursorStack.current = [null];
    setActiveFilters(newFilters);
    if (pageIndex === 0) setReloadKey(k => k + 1);
    else setPageIndex(0);
  };

  const refresh = () => {
    cursorStack.current = [null];
    if (pageIndex === 0) setReloadKey(k => k + 1);
    else setPageIndex(0);
  };

  const commitTextFilters = () => {
    applyFilters({
      ...activeFilters,
      platform: platformInput.trim(),
      city:     cityInput.trim(),
      country:  countryInput.trim().toUpperCase(),
    });
  };

  const onEnter = (e: React.KeyboardEvent) => { if (e.key === 'Enter') commitTextFilters(); };

  // ── Navigation ───────────────────────────────────────────────────────────────
  const goNext = () => { if (hasMore && !loading) setPageIndex(p => p + 1); };
  const goPrev = () => { if (pageIndex > 0 && !loading) setPageIndex(p => p - 1); };

  // ── Client-side search on current page (≤25 docs) ───────────────────────────
  const filtered = useMemo(() => {
    if (!search.trim()) return shows;
    const q = search.toLowerCase();
    return shows.filter(s =>
      String(s.show_title   ?? '').toLowerCase().includes(q) ||
      String(s.venue_name   ?? '').toLowerCase().includes(q) ||
      String(s.venue_city   ?? '').toLowerCase().includes(q) ||
      String(s.country_code ?? '').toLowerCase().includes(q)
    );
  }, [shows, search]);

  // ── Selection ────────────────────────────────────────────────────────────────
  const allSelected = filtered.length > 0 && filtered.every(s => selectedIds.has(s._id));
  const toggleAll = () => setSelectedIds(prev => {
    const n = new Set(prev);
    allSelected ? filtered.forEach(s => n.delete(s._id)) : filtered.forEach(s => n.add(s._id));
    return n;
  });
  const toggleOne = (id: string) => setSelectedIds(prev => {
    const n = new Set(prev);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  // ── Delete ───────────────────────────────────────────────────────────────────
  const handleDelete = async (show: ShowDoc) => {
    if (!window.confirm(`Delete "${show.show_title}"?`)) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, 'shows', show._id));
      setShows(prev => prev.filter(s => s._id !== show._id));
      setSelectedIds(prev => { const n = new Set(prev); n.delete(show._id); return n; });
    } catch { alert('Failed to delete show.'); }
    finally  { setDeleting(false); }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.size) return;
    if (!window.confirm(`Delete ${selectedIds.size} show${selectedIds.size !== 1 ? 's' : ''}?`)) return;
    setDeleting(true);
    try {
      const ids = [...selectedIds];
      for (let i = 0; i < ids.length; i += 499) {
        const batch = writeBatch(db);
        ids.slice(i, i + 499).forEach(id => batch.delete(doc(db, 'shows', id)));
        await batch.commit();
      }
      setShows(prev => prev.filter(s => !selectedIds.has(s._id)));
      setSelectedIds(new Set());
    } catch { alert('Failed to delete shows.'); }
    finally  { setDeleting(false); }
  };

  // ── Export ───────────────────────────────────────────────────────────────────
  const handleExport = () => {
    const toExport = selectedIds.size ? filtered.filter(s => selectedIds.has(s._id)) : filtered;
    if (!toExport.length) return;
    const headers = [
      'show_title','events_platform','event_id','show_date',
      'venue_name','venue_city','venue_state','country_code',
      'venue_address','ticket_url','ticket_price','ticket_count','show_image_url',
    ];
    const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const rows   = toExport.map(s =>
      headers.map(h => escape(h === 'show_date' ? fmtDate(s.show_date) : String(s[h] ?? ''))).join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    Object.assign(document.createElement('a'), { href: url, download: 'shows-export.csv' }).click();
    URL.revokeObjectURL(url);
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setModalShow('add')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-500 text-white transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Add Show
          </button>

          {selectedIds.size > 0 && (
            <>
              <button
                onClick={handleBulkDelete}
                disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-all disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete {selectedIds.size}
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-[#8892a4] border border-white/10 hover:border-white/20 hover:text-white transition-all"
              >
                <Download className="w-3.5 h-3.5" /> Export {selectedIds.size}
              </button>
            </>
          )}

          {selectedIds.size === 0 && filtered.length > 0 && (
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-[#8892a4] border border-white/10 hover:border-white/20 hover:text-white transition-all"
            >
              <Download className="w-3.5 h-3.5" /> Export Page
            </button>
          )}
        </div>

        <button onClick={refresh} title="Refresh" className="text-[#8892a4] hover:text-white transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">

        {/* Date — applied immediately on change */}
        <select
          value={activeFilters.dateFilter}
          onChange={e => applyFilters({ ...activeFilters, dateFilter: e.target.value as DateFilter })}
          className={selectCls}
        >
          <option value="upcoming">Upcoming</option>
          <option value="past">Past</option>
          <option value="this_week">This Week</option>
          <option value="this_month">This Month</option>
          <option value="next_30">Next 30 Days</option>
          <option value="all">All Shows</option>
        </select>

        {/* Platform / City / Country — Firestore where clauses, committed on Enter or Apply */}
        <input
          value={platformInput}
          onChange={e => setPlatformInput(e.target.value)}
          onKeyDown={onEnter}
          placeholder="Platform (Enter to apply)"
          className={`${inputCls} w-44`}
        />
        <input
          value={cityInput}
          onChange={e => setCityInput(e.target.value)}
          onKeyDown={onEnter}
          placeholder="City"
          className={`${inputCls} w-32`}
        />
        <input
          value={countryInput}
          onChange={e => setCountryInput(e.target.value.toUpperCase())}
          onKeyDown={onEnter}
          placeholder="CC"
          maxLength={2}
          className={`${inputCls} w-16`}
        />
        <button
          onClick={commitTextFilters}
          className="px-3 py-2 rounded-lg text-xs font-black uppercase tracking-widest text-[#8892a4] border border-white/10 hover:border-white/20 hover:text-white transition-all"
        >
          Apply
        </button>

        {/* Search — client-side within the current page only */}
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8892a4]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search within page…"
            className={`w-full ${inputCls} pl-9`}
          />
        </div>
      </div>

      {/* Status */}
      {queryError ? (
        <p className="text-xs text-red-400">{queryError}</p>
      ) : (
        <p className="text-xs text-[#8892a4]">
          {loading
            ? 'Loading…'
            : `${filtered.length} show${filtered.length !== 1 ? 's' : ''} · page ${pageIndex + 1}${selectedIds.size ? ` · ${selectedIds.size} selected` : ''}`
          }
        </p>
      )}

      {/* Table */}
      <div className="bg-[#0a0e1a] border border-white/5 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center py-20 text-[#8892a4] text-sm font-bold uppercase tracking-widest">
            No shows found
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-4 py-3 w-10">
                    <input type="checkbox" checked={allSelected} onChange={toggleAll} className="accent-blue-500" />
                  </th>
                  {['Title', 'Date', 'Venue', 'City', 'Country', 'Platform', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-[#8892a4] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(show => (
                  <tr
                    key={show._id}
                    className={`border-b border-white/5 last:border-0 transition-colors ${selectedIds.has(show._id) ? 'bg-blue-500/5' : 'hover:bg-white/[0.02]'}`}
                  >
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selectedIds.has(show._id)} onChange={() => toggleOne(show._id)} className="accent-blue-500" />
                    </td>
                    <td className="px-4 py-3 text-white font-medium max-w-[200px]">
                      <span className="block truncate">{String(show.show_title || '—')}</span>
                    </td>
                    <td className="px-4 py-3 text-[#8892a4] whitespace-nowrap">{fmtDate(show.show_date)}</td>
                    <td className="px-4 py-3 text-[#8892a4] max-w-[150px]">
                      <span className="block truncate">{String(show.venue_name || '—')}</span>
                    </td>
                    <td className="px-4 py-3 text-[#8892a4] whitespace-nowrap">{String(show.venue_city    || '—')}</td>
                    <td className="px-4 py-3 text-[#8892a4] whitespace-nowrap">{String(show.country_code  || '—')}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {String(show.events_platform || '—')}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <button onClick={() => setModalShow(show)} className="text-[#8892a4] hover:text-white transition-colors">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(show)} disabled={deleting} className="text-[#8892a4] hover:text-red-400 transition-colors disabled:opacity-50">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination — Prev / Next only; total count unknown without full scan */}
      {!loading && (pageIndex > 0 || hasMore) && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#8892a4]">Page {pageIndex + 1}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={goPrev}
              disabled={pageIndex === 0 || loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[#8892a4] hover:text-white hover:bg-white/5 disabled:opacity-30 transition-all"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            <button
              onClick={goNext}
              disabled={!hasMore || loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[#8892a4] hover:text-white hover:bg-white/5 disabled:opacity-30 transition-all"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {modalShow !== null && (
        <ShowModal
          show={modalShow === 'add' ? null : modalShow}
          onClose={() => setModalShow(null)}
          onSaved={refresh}
        />
      )}
    </div>
  );
};
