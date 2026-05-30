import React, { useState, useRef, useCallback } from 'react';
import Papa from 'papaparse';
import { doc, writeBatch } from 'firebase/firestore';
import { db } from '../../firebase';
import { AdminLayout } from '../AdminLayout';
import { ShowsManage } from '../components/ShowsManage';
import { parseShowDate, generateShowSlug, buildShowDoc, makeShowDocId } from '../lib/showsImport';
import { Calendar, Upload, CheckCircle2, Loader2, FileText } from 'lucide-react';

type RowStatus = 'ok' | 'bad_date' | 'missing_required';
type Step      = 'idle' | 'parsing' | 'preview' | 'importing' | 'done';

interface ParsedRow {
  _index:      number;
  _status:     RowStatus;
  _parsedDate: Date | null;
  _slug:       string;
  _raw:        Record<string, string>;
}

interface ImportReport {
  written: number;
  errors:  number;
}

const REQUIRED_FIELDS = ['show_title', 'events_platform', 'event_id', 'venue_name', 'venue_city'];

const STATUS_CONFIG: Record<RowStatus, { label: string; cls: string }> = {
  ok:               { label: 'OK',            cls: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' },
  bad_date:         { label: 'BAD DATE',       cls: 'bg-red-500/10    text-red-400    border border-red-500/20'    },
  missing_required: { label: 'MISSING FIELDS', cls: 'bg-red-500/10    text-red-400    border border-red-500/20'    },
};

const PREVIEW_COLS = [
  { key: 'show_title',      label: 'show_title'      },
  { key: 'events_platform', label: 'events_platform' },
  { key: 'event_id',        label: 'event_id'        },
  { key: 'show_date',       label: 'show_date'       },
  { key: 'venue_name',      label: 'venue_name'      },
  { key: 'venue_city',      label: 'venue_city'      },
];

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

interface Props { currentPath: string; }

export const ShowsPage: React.FC<Props> = ({ currentPath }) => {
  const [tab, setTab] = useState<'manage' | 'import'>('manage');

  // ── Import state ──────────────────────────────────────────────────────────
  const [step,       setStep]       = useState<Step>('idle');
  const [rows,       setRows]       = useState<ParsedRow[]>([]);
  const [fileName,   setFileName]   = useState('');
  const [report,     setReport]     = useState<ImportReport | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      alert('Please select a .csv file.');
      return;
    }
    setFileName(file.name);
    setStep('parsing');

    Papa.parse<Record<string, string>>(file, {
      header:         true,
      skipEmptyLines: true,
      complete: (result) => {
        const parsed: ParsedRow[] = result.data.map((raw, index) => {
          const missingRequired = REQUIRED_FIELDS.some(f => !raw[f]?.trim());
          const parsedDate      = parseShowDate(raw.show_date ?? '');
          const badDate         = !parsedDate;

          let status: RowStatus = 'ok';
          if (missingRequired) status = 'missing_required';
          else if (badDate)    status = 'bad_date';

          const slug = generateShowSlug(raw.show_title ?? '', parsedDate, raw.event_id ?? '');
          return { _index: index, _status: status, _parsedDate: parsedDate, _slug: slug, _raw: raw };
        });

        setRows(parsed);
        setStep('preview');
      },
      error: () => {
        alert('Failed to parse CSV. Please check the file and try again.');
        setStep('idle');
      },
    });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleConfirm = async () => {
    setStep('importing');

    const toImport   = rows.filter(r => r._status === 'ok');
    const baseErrors = rows.filter(r => r._status !== 'ok').length;

    let written = 0;
    let errors  = baseErrors;

    for (const ch of chunk<ParsedRow>(toImport, 499)) {
      try {
        const batch = writeBatch(db);
        for (const row of ch) {
          const data  = buildShowDoc(row._raw, row._parsedDate, row._slug);
          const docId = makeShowDocId(row._raw.events_platform ?? '', row._raw.event_id ?? '');
          batch.set(doc(db, 'shows', docId), data);
        }
        await batch.commit();
        written += ch.length;
      } catch {
        errors += ch.length;
      }
    }

    setReport({ written, errors });
    setStep('done');
  };

  const reset = () => { setStep('idle'); setRows([]); setFileName(''); setReport(null); };

  const okCount  = rows.filter(r => r._status === 'ok').length;
  const errCount = rows.filter(r => r._status !== 'ok').length;

  const tabCls = (active: boolean) =>
    `px-4 py-2.5 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${
      active
        ? 'text-white border-blue-400'
        : 'text-[#8892a4] border-transparent hover:text-white'
    }`;

  return (
    <AdminLayout currentPath={currentPath}>
      <div className="p-8 max-w-6xl">

        {/* Header + tabs */}
        <div className="flex items-center gap-3 mb-1">
          <Calendar className="w-5 h-5 text-blue-400" />
          <h1 className="text-2xl font-black uppercase tracking-tight text-white">Shows</h1>
        </div>
        <div className="flex gap-0 border-b border-white/5 mb-6">
          <button className={tabCls(tab === 'manage')} onClick={() => setTab('manage')}>Manage</button>
          <button className={tabCls(tab === 'import')} onClick={() => setTab('import')}>CSV Import</button>
        </div>

        {/* ── MANAGE TAB ─────────────────────────────────── */}
        {tab === 'manage' && <ShowsManage />}

        {/* ── IMPORT TAB ─────────────────────────────────── */}
        {tab === 'import' && (
          <>
            {step === 'idle' && (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-20 text-center cursor-pointer transition-all select-none ${
                  isDragging ? 'border-blue-400 bg-blue-500/5' : 'border-white/10 hover:border-white/20 bg-[#0a0e1a]'
                }`}
              >
                <Upload className="w-8 h-8 text-[#8892a4] mx-auto mb-4" />
                <p className="text-sm font-bold text-white mb-1">Drop a CSV file here or click to browse</p>
                <p className="text-xs text-[#8892a4]">.csv only · headers must match Firestore field names</p>
                <input
                  ref={fileInputRef} type="file" id="csv-upload" name="csv-upload"
                  accept=".csv" className="hidden" onChange={handleFileChange}
                />
              </div>
            )}

            {step === 'parsing' && (
              <div className="bg-[#0a0e1a] border border-white/5 rounded-2xl p-20 flex flex-col items-center gap-4">
                <Loader2 className="w-7 h-7 animate-spin text-blue-400" />
                <p className="text-sm font-bold text-[#8892a4]">Parsing CSV…</p>
              </div>
            )}

            {step === 'preview' && (
              <div className="space-y-5">
                <div className="bg-[#0a0e1a] border border-white/5 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-[#8892a4] shrink-0" />
                    <span className="text-sm font-bold text-white">{fileName}</span>
                    <span className="text-xs text-[#8892a4]">{rows.length} rows total</span>
                  </div>
                  <div className="flex items-center gap-5 text-xs font-black uppercase tracking-widest">
                    <span className="text-emerald-400">{okCount} ready</span>
                    <span className="text-red-400">{errCount} error{errCount !== 1 ? 's' : ''}</span>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#8892a4] mb-2">
                    Preview — first {Math.min(5, rows.length)} rows
                  </p>
                  <div className="bg-[#0a0e1a] border border-white/5 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-white/5">
                            <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-[#8892a4] whitespace-nowrap">Status</th>
                            {PREVIEW_COLS.map(c => (
                              <th key={c.key} className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-[#8892a4] whitespace-nowrap">{c.label}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {rows.slice(0, 5).map(row => {
                            const cfg = STATUS_CONFIG[row._status];
                            const raw = row._raw;
                            const dateDisplay = raw.show_date
                              ? row._parsedDate
                                ? row._parsedDate.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
                                : raw.show_date
                              : '—';
                            return (
                              <tr key={row._index} className="border-b border-white/5 last:border-0">
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${cfg.cls}`}>{cfg.label}</span>
                                </td>
                                <td className="px-4 py-3 text-white font-medium max-w-[180px]"><span className="block truncate">{raw.show_title || '—'}</span></td>
                                <td className="px-4 py-3 text-[#8892a4] whitespace-nowrap">{raw.events_platform || '—'}</td>
                                <td className="px-4 py-3 text-[#8892a4] font-mono whitespace-nowrap">{raw.event_id || '—'}</td>
                                <td className={`px-4 py-3 whitespace-nowrap ${row._status === 'bad_date' ? 'text-red-400' : 'text-[#8892a4]'}`}>{dateDisplay}</td>
                                <td className="px-4 py-3 text-[#8892a4] whitespace-nowrap">{raw.venue_name || '—'}</td>
                                <td className="px-4 py-3 text-[#8892a4] whitespace-nowrap">{raw.venue_city || '—'}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button onClick={reset} className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-[#8892a4] border border-white/10 hover:border-white/20 hover:text-white transition-all">
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={okCount === 0}
                    className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-500 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Import {okCount} Show{okCount !== 1 ? 's' : ''}
                  </button>
                </div>
              </div>
            )}

            {step === 'importing' && (
              <div className="bg-[#0a0e1a] border border-white/5 rounded-2xl p-20 flex flex-col items-center gap-4">
                <Loader2 className="w-7 h-7 animate-spin text-blue-400" />
                <p className="text-sm font-bold text-[#8892a4]">Writing to Firestore…</p>
              </div>
            )}

            {step === 'done' && report && (
              <div className="bg-[#0a0e1a] border border-white/5 rounded-2xl p-10 space-y-6">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-sm font-black uppercase tracking-widest text-white">Import Complete</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-5 text-center">
                    <p className="text-3xl font-black text-emerald-400 mb-1">{report.written}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400/60">Written</p>
                  </div>
                  <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-5 text-center">
                    <p className="text-3xl font-black text-red-400 mb-1">{report.errors}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-red-400/60">Errors</p>
                  </div>
                </div>
                <button onClick={() => { reset(); }} className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-[#8892a4] border border-white/10 hover:border-white/20 hover:text-white transition-all">
                  Import Another File
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
};
