import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  collection, getDocs, deleteDoc, doc,
  query, where, orderBy, Timestamp, writeBatch,
} from 'firebase/firestore';
import { db } from '../../firebase';
import { Plus, Search, Trash2, Edit2, Download, ChevronLeft, ChevronRight, Loader2, RefreshCw } from 'lucide-react';
import { ShowModal } from './ShowModal';
import type { ShowDoc } from './ShowModal';

const PER_PAGE = 25;
type DateFilter = 'upcoming' | 'past' | 'this_week' | 'this_month' | 'next_30' | 'all';

function buildQuery(df: DateFilter) {
  const now  = Timestamp.now();
  const coll = collection(db, 'shows');
  switch (df) {
    case 'upcoming':
      return query(coll, where('show_date', '>=', now), orderBy('show_date', 'asc'));
    case 'past':
      return query(coll, where('show_date', '<',  now), orderBy('show_date', 'desc'));
    case 'this_week': {
      const end = new Timestamp(now.seconds + 7 * 86400, 0);
      return query(coll, where('show_date', '>=', now), where('show_date', '<', end), orderBy('show_date', 'asc'));
    }
    case 'this_month': {
      const d   = new Date();
      const s   = Timestamp.fromDate(new Date(d.getFullYear(), d.getMonth(), 1));
      const e   = Timestamp.fromDate(new Date(d.getFullYear(), d.getMonth() + 1, 1));
      return query(coll, where('show_date', '>=', s), where('show_date', '<', e), orderBy('show_date', 'asc'));
    }
    case 'next_30': {
      const end = new Timestamp(now.seconds + 30 * 86400, 0);
      return query(coll, where('show_date', '>=', now), where('show_date', '<', end), orderBy('show_date', 'asc'));
    }
    default:
      return query(coll, orderBy('show_date', 'asc'));
  }
}

function fmtDate(ts: unknown): string {
  if (!ts || typeof ts !== 'object' || !('toDate' in (ts as object))) return '—';
  return (ts as Timestamp).toDate().toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
}

const selectCls = "bg-[#0a0e1a] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30 transition-colors";

export const ShowsManage: React.FC = () => {
  const [shows,          setShows]          = useState<ShowDoc[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [dateFilter,     setDateFilter]     = useState<DateFilter>('upcoming');
  const [search,         setSearch]         = useState('');
  const [platformFilter, setPlatformFilter] = useState('');
  const [cityFilter,     setCityFilter]     = useState('');
  const [countryFilter,  setCountryFilter]  = useState('');
  const [page,           setPage]           = useState(1);
  const [selectedIds,    setSelectedIds]    = useState<Set<string>>(new Set());
  const [modalShow,      setModalShow]      = useState<ShowDoc | 'add' | null>(null);
  const [deleting,       setDeleting]       = useState(false);

  const loadShows = useCallback(async () => {
    setLoading(true);
    setSelectedIds(new Set());
    setPage(1);
    try {
      const snap = await getDocs(buildQuery(dateFilter));
      setShows(snap.docs.map(d => ({ _id: d.id, ...d.data() } as ShowDoc)));
    } catch (e) {
      console.error('Failed to load shows', e);
    } finally {
      setLoading(false);
    }
  }, [dateFilter]);

  useEffect(() => { loadShows(); }, [loadShows]);

  // Unique dropdown options derived from loaded shows
  const platforms = useMemo(() =>
    [...new Set(shows.map(s => String(s.events_platform ?? '')).filter(Boolean))].sort()
  , [shows]);
  const cities = useMemo(() =>
    [...new Set(shows.map(s => String(s.venue_city ?? '')).filter(Boolean))].sort()
  , [shows]);
  const countries = useMemo(() =>
    [...new Set(shows.map(s => String(s.country_code ?? '')).filter(Boolean))].sort()
  , [shows]);

  // Client-side filtering
  const filtered = useMemo(() => {
    let r = shows;
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(s =>
        String(s.show_title  ?? '').toLowerCase().includes(q) ||
        String(s.venue_name  ?? '').toLowerCase().includes(q) ||
        String(s.venue_city  ?? '').toLowerCase().includes(q) ||
        String(s.country_code ?? '').toLowerCase().includes(q)
      );
    }
    if (platformFilter) r = r.filter(s => s.events_platform === platformFilter);
    if (cityFilter)     r = r.filter(s => s.venue_city      === cityFilter);
    if (countryFilter)  r = r.filter(s => s.country_code    === countryFilter);
    return r;
  }, [shows, search, platformFilter, cityFilter, countryFilter]);

  useEffect(() => { setPage(1); }, [search, platformFilter, cityFilter, countryFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageShows  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const allPageSelected = pageShows.length > 0 && pageShows.every(s => selectedIds.has(s._id));
  const togglePage = () => setSelectedIds(prev => {
    const n = new Set(prev);
    allPageSelected ? pageShows.forEach(s => n.delete(s._id)) : pageShows.forEach(s => n.add(s._id));
    return n;
  });
  const toggleOne = (id: string) => setSelectedIds(prev => {
    const n = new Set(prev);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

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

  const handleExport = () => {
    const toExport = selectedIds.size
      ? filtered.filter(s => selectedIds.has(s._id))
      : filtered;
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
    const csv  = [headers.join(','), ...rows].join('\n');
    const url  = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a    = Object.assign(document.createElement('a'), { href: url, download: 'shows-export.csv' });
    a.click();
    URL.revokeObjectURL(url);
  };

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
              <Download className="w-3.5 h-3.5" /> Export All
            </button>
          )}
        </div>

        <button onClick={loadShows} title="Refresh" className="text-[#8892a4] hover:text-white transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <select value={dateFilter} onChange={e => setDateFilter(e.target.value as DateFilter)} className={selectCls}>
          <option value="upcoming">Upcoming</option>
          <option value="past">Past</option>
          <option value="this_week">This Week</option>
          <option value="this_month">This Month</option>
          <option value="next_30">Next 30 Days</option>
          <option value="all">All Shows</option>
        </select>

        {platforms.length > 0 && (
          <select value={platformFilter} onChange={e => setPlatformFilter(e.target.value)} className={selectCls}>
            <option value="">All Platforms</option>
            {platforms.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        )}

        {cities.length > 0 && (
          <select value={cityFilter} onChange={e => setCityFilter(e.target.value)} className={selectCls}>
            <option value="">All Cities</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        )}

        {countries.length > 0 && (
          <select value={countryFilter} onChange={e => setCountryFilter(e.target.value)} className={selectCls}>
            <option value="">All Countries</option>
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        )}

        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8892a4]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search title, venue, city, country…"
            className="w-full bg-[#0a0e1a] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-[#8892a4] focus:outline-none focus:border-white/30 transition-colors"
          />
        </div>
      </div>

      {/* Count */}
      <p className="text-xs text-[#8892a4]">
        {loading ? 'Loading…' : `${filtered.length.toLocaleString()} show${filtered.length !== 1 ? 's' : ''}${selectedIds.size ? ` · ${selectedIds.size} selected` : ''}`}
      </p>

      {/* Table */}
      <div className="bg-[#0a0e1a] border border-white/5 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
          </div>
        ) : pageShows.length === 0 ? (
          <p className="text-center py-20 text-[#8892a4] text-sm font-bold uppercase tracking-widest">
            No shows found
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-4 py-3 w-10">
                    <input type="checkbox" checked={allPageSelected} onChange={togglePage} className="accent-blue-500" />
                  </th>
                  {['Title','Date','Venue','City','Country','Platform',''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-[#8892a4] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageShows.map(show => (
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

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#8892a4]">Page {page} of {totalPages}</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg text-[#8892a4] hover:text-white hover:bg-white/5 disabled:opacity-30 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {(() => {
              const start = Math.max(1, Math.min(page - 3, totalPages - 6));
              const end   = Math.min(totalPages, start + 6);
              return Array.from({ length: end - start + 1 }, (_, i) => start + i).map(n => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${page === n ? 'bg-blue-600 text-white' : 'text-[#8892a4] hover:text-white hover:bg-white/5'}`}
                >
                  {n}
                </button>
              ));
            })()}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg text-[#8892a4] hover:text-white hover:bg-white/5 disabled:opacity-30 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {modalShow !== null && (
        <ShowModal
          show={modalShow === 'add' ? null : modalShow}
          onClose={() => setModalShow(null)}
          onSaved={loadShows}
        />
      )}
    </div>
  );
};
