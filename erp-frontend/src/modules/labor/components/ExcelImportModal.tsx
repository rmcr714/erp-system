import React, { useRef, useState } from 'react';
import type { Laborer } from '../types/laborer';

// ─── Types ───────────────────────────────────────────────────────────────────

interface RowError {
  rowNumber: number;
  grNo: string;
  message: string;
}

interface ImportResult {
  totalRows: number;
  validCount: number;
  errorCount: number;
  validRows: Partial<Laborer>[];
  errors: RowError[];
}

interface Props {
  isOpen: boolean;
  siteId: number;
  siteName?: string;
  onClose: () => void;
  onSuccess: () => void;
}

type Step = 'upload' | 'preview' | 'confirming' | 'done';

// ─── Component ───────────────────────────────────────────────────────────────

const ExcelImportModal: React.FC<Props> = ({ isOpen, siteId, siteName, onClose, onSuccess }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<Step>('upload');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [finalResult, setFinalResult] = useState<ImportResult | null>(null);
  const [activeTab, setActiveTab] = useState<'valid' | 'errors'>('valid');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const reset = () => {
    setFile(null);
    setStep('upload');
    setLoading(false);
    setResult(null);
    setFinalResult(null);
    setActiveTab('valid');
    setError(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.name.endsWith('.xlsx')) {
      setError('Only .xlsx files are supported.');
      return;
    }
    setError(null);
    setFile(f);
  };

  const handlePreview = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('siteId', String(siteId));
      const res = await fetch('/api/laborers/import/preview', { method: 'POST', body: form });
      if (!res.ok) throw new Error('Server error during preview.');
      const data: ImportResult = await res.json();
      setResult(data);
      setActiveTab(data.validCount > 0 ? 'valid' : 'errors');
      setStep('preview');
    } catch (e: any) {
      setError(e.message || 'Failed to preview file.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!file || !result) return;
    setStep('confirming');
    setLoading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('siteId', String(siteId));
      const res = await fetch('/api/laborers/import/confirm', { method: 'POST', body: form });
      if (!res.ok) throw new Error('Server error during import.');
      const data: ImportResult = await res.json();
      setFinalResult(data);
      setStep('done');
      onSuccess();
    } catch (e: any) {
      setError(e.message || 'Import failed.');
      setStep('preview');
    } finally {
      setLoading(false);
    }
  };

  // ─── Render Helpers ──────────────────────────────────────────────────────
  const handleDownloadTemplate = async () => {
    setError(null);
    try {
      const res = await fetch('/api/laborers/import/template');
      if (!res.ok) throw new Error('Failed to download template');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'laborer_import_template.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      setError('Failed to download template: ' + e.message);
    }
  };


  const StepIndicator = () => (
    <div className="flex items-center gap-2 mb-6">
      {(['upload', 'preview', 'done'] as const).map((s, i) => {
        const labels = ['Upload', 'Preview', 'Done'];
        const active = step === s || (step === 'confirming' && s === 'preview');
        const done = (i === 0 && (step === 'preview' || step === 'confirming' || step === 'done')) ||
                     (i === 1 && step === 'done');
        return (
          <React.Fragment key={s}>
            <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors ${
              active ? 'text-accent-primary' : done ? 'text-emerald-400' : 'text-text-secondary/40'
            }`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all ${
                active ? 'border-accent-primary bg-accent-primary/20 text-accent-primary' :
                done ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400' :
                'border-white/10 text-white/20'
              }`}>
                {done ? '✓' : i + 1}
              </span>
              {labels[i]}
            </div>
            {i < 2 && <div className={`flex-1 h-px transition-colors ${done ? 'bg-emerald-500/50' : 'bg-white/10'}`} />}
          </React.Fragment>
        );
      })}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-4xl max-h-[90vh] flex flex-col bg-[#0f1623] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-white/10 bg-white/[0.02] flex-shrink-0">
          <div>
            <h2 className="text-xl font-black font-outfit text-white tracking-tight flex items-center gap-3">
              <span className="text-2xl">📊</span> Import Laborers via Excel
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              Site: <span className="text-accent-primary font-semibold">{siteName || `ID ${siteId}`}</span>
              {' · '}Status defaults to <span className="text-amber-400 font-semibold">Inactive</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleDownloadTemplate}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
            >
              📥 Download Excel Template
            </button>
            <button
              onClick={handleClose}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white transition-all text-lg"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <StepIndicator />

          {/* ── STEP: UPLOAD ── */}
          {step === 'upload' && (
            <div className="flex flex-col items-center gap-6">
              <label
                htmlFor="excel-file-input"
                className={`w-full max-w-lg border-2 border-dashed rounded-2xl p-10 flex flex-col items-center gap-4 cursor-pointer transition-all group ${
                  file
                    ? 'border-emerald-500/70 bg-emerald-500/5'
                    : 'border-white/20 bg-white/[0.02] hover:border-accent-primary/50 hover:bg-accent-primary/5'
                }`}
              >
                <span className="text-5xl group-hover:scale-110 transition-transform">
                  {file ? '✅' : '📁'}
                </span>
                {file ? (
                  <div className="text-center">
                    <p className="text-emerald-400 font-bold">{file.name}</p>
                    <p className="text-text-secondary text-sm mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-text-primary font-semibold">Drop your .xlsx file here</p>
                    <p className="text-text-secondary text-sm mt-1">or click to browse</p>
                  </div>
                )}
                <input
                  id="excel-file-input"
                  ref={fileRef}
                  type="file"
                  accept=".xlsx"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>

              {/* Column guide */}
              <div className="w-full max-w-lg bg-white/[0.03] border border-white/10 rounded-xl p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-3">Required Column Headers in Excel</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { col: 'GR No', req: true },
                    { col: 'Full Name', req: false },
                    { col: 'Designation', req: false },
                    { col: 'Contact No', req: false },
                    { col: 'Date of Joining', req: false },
                    { col: 'Date of Birth', req: false },
                    { col: 'Blood Group', req: false },
                    { col: 'Address', req: false },
                    { col: 'State', req: false },
                    { col: 'Pincode', req: false },
                    { col: 'ID Type', req: false },
                    { col: 'ID Number', req: false },
                    { col: 'Bank Name', req: false },
                    { col: 'Branch', req: false },
                    { col: 'Account No', req: false },
                    { col: 'IFSC Code', req: false },
                    { col: 'PF No', req: false },
                    { col: 'Salary Per Day', req: false },
                    { col: 'Employer Name', req: false },
                    { col: 'Status', req: false },
                    { col: 'Remarks', req: false },
                  ].map(({ col, req }) => (
                    <span key={col} className={`text-xs px-2 py-1 rounded-md font-mono ${
                      req ? 'bg-accent-primary/20 text-accent-primary border border-accent-primary/30' : 'bg-white/5 text-text-secondary'
                    }`}>
                      {req && '* '}{col}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-text-secondary mt-3">* Required. Dates must be <span className="font-mono text-amber-400">dd/MM/yyyy</span> format.</p>
              </div>

              {error && (
                <div className="w-full max-w-lg bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
                  ⚠️ {error}
                </div>
              )}
            </div>
          )}

          {/* ── STEP: PREVIEW ── */}
          {(step === 'preview' || step === 'confirming') && result && (
            <div className="flex flex-col gap-5">
              {/* Summary cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <p className="text-3xl font-black text-white">{result.totalRows}</p>
                  <p className="text-xs font-bold uppercase tracking-widest text-text-secondary mt-1">Total Rows</p>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
                  <p className="text-3xl font-black text-emerald-400">{result.validCount}</p>
                  <p className="text-xs font-bold uppercase tracking-widest text-emerald-500/80 mt-1">Ready to Import</p>
                </div>
                <div className={`rounded-xl p-4 text-center border ${
                  result.errorCount > 0
                    ? 'bg-red-500/10 border-red-500/20'
                    : 'bg-white/5 border-white/10'
                }`}>
                  <p className={`text-3xl font-black ${result.errorCount > 0 ? 'text-red-400' : 'text-white/30'}`}>
                    {result.errorCount}
                  </p>
                  <p className="text-xs font-bold uppercase tracking-widest text-text-secondary mt-1">Errors</p>
                </div>
              </div>

              {/* Tab switch */}
              <div className="flex gap-2 border-b border-white/10 pb-0">
                <button
                  onClick={() => setActiveTab('valid')}
                  className={`px-5 py-2.5 text-sm font-bold rounded-t-lg transition-all border-b-2 ${
                    activeTab === 'valid'
                      ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                      : 'border-transparent text-text-secondary hover:text-white'
                  }`}
                >
                  ✅ Valid ({result.validCount})
                </button>
                <button
                  onClick={() => setActiveTab('errors')}
                  className={`px-5 py-2.5 text-sm font-bold rounded-t-lg transition-all border-b-2 ${
                    activeTab === 'errors'
                      ? 'border-red-500 text-red-400 bg-red-500/10'
                      : 'border-transparent text-text-secondary hover:text-white'
                  }`}
                >
                  ❌ Errors ({result.errorCount})
                </button>
              </div>

              {/* Valid rows table */}
              {activeTab === 'valid' && (
                <div className="rounded-xl border border-white/10 overflow-hidden">
                  {result.validRows.length === 0 ? (
                    <div className="p-8 text-center text-text-secondary text-sm">No valid rows to import.</div>
                  ) : (
                    <div className="overflow-x-auto overflow-y-auto max-h-[380px]">
                      <table className="min-w-full text-sm">
                        <thead className="sticky top-0 z-10">
                          <tr className="bg-[#0f1a2b] text-left border-b border-white/10">
                            {[
                              '#', 'GR No', 'Full Name', 'Designation', 'Phone',
                              'Employer', 'Site',
                              'DOJ', 'DOB', 'Blood Group', 'Height', 'Weight',
                              'Address', 'State', 'Pincode',
                              'ID Type', 'ID Number',
                              'Bank', 'Branch', 'Account No', 'IFSC',
                              'PF No', 'Salary', 'Status', 'Ref By', 'Remarks'
                            ].map(h => (
                              <th key={h} className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-text-secondary whitespace-nowrap">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {result.validRows.map((row: any, i: number) => {
                            // dateOfJoining / dateOfBirth come as [year, month, day] array or string from Jackson
                            const fmtDate = (d: any) => {
                              if (!d) return '—';
                              try {
                                if (Array.isArray(d)) {
                                  const dt = new Date(d[0], d[1] - 1, d[2]);
                                  return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                                }
                                const dt = new Date(d);
                                return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                              } catch {
                                return String(d);
                              }
                            };
                            return (
                              <tr key={i} className={`border-t border-white/5 hover:bg-white/[0.03] transition-colors ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}>
                                <td className="px-4 py-2.5 text-text-secondary/50 text-xs font-mono">{i + 1}</td>
                                <td className="px-4 py-2.5 font-mono font-bold text-accent-primary whitespace-nowrap">{row.grNo}</td>
                                <td className="px-4 py-2.5 text-text-primary whitespace-nowrap">{row.fullName || '—'}</td>
                                <td className="px-4 py-2.5 text-text-secondary whitespace-nowrap">{row.designation || '—'}</td>
                                <td className="px-4 py-2.5 text-text-secondary font-mono whitespace-nowrap">{row.contactNo || '—'}</td>
                                <td className="px-4 py-2.5 text-emerald-400/80 font-bold whitespace-nowrap text-xs">{row.employerName || '—'}</td>
                                <td className="px-4 py-2.5 text-accent-primary/80 font-bold whitespace-nowrap text-xs truncate max-w-[120px]" title={siteName || `ID ${siteId}`}>{siteName || `ID ${siteId}`}</td>
                                <td className="px-4 py-2.5 text-text-secondary whitespace-nowrap text-xs">{fmtDate(row.dateOfJoining)}</td>
                                <td className="px-4 py-2.5 text-text-secondary whitespace-nowrap text-xs">{fmtDate(row.dateOfBirth)}</td>
                                <td className="px-4 py-2.5 whitespace-nowrap">
                                  {row.bloodGroup
                                    ? <span className="px-2 py-0.5 bg-red-500/20 text-red-300 rounded-md font-mono text-xs">{row.bloodGroup}</span>
                                    : <span className="text-text-secondary/40">—</span>
                                  }
                                </td>
                                <td className="px-4 py-2.5 text-text-secondary whitespace-nowrap text-xs">{row.height || '—'}</td>
                                <td className="px-4 py-2.5 text-text-secondary whitespace-nowrap text-xs">{row.weight || '—'}</td>
                                <td className="px-4 py-2.5 text-text-secondary text-xs max-w-[140px] truncate" title={row.permanentAddress?.line}>
                                  {row.permanentAddress?.line || '—'}
                                </td>
                                <td className="px-4 py-2.5 text-text-secondary whitespace-nowrap text-xs">{row.permanentAddress?.state || '—'}</td>
                                <td className="px-4 py-2.5 text-text-secondary font-mono whitespace-nowrap text-xs">{row.permanentAddress?.pincode || '—'}</td>
                                <td className="px-4 py-2.5 text-text-secondary whitespace-nowrap text-xs">{row.idProof?.type || '—'}</td>
                                <td className="px-4 py-2.5 text-text-secondary font-mono whitespace-nowrap text-xs">{row.idProof?.idNumber || '—'}</td>
                                <td className="px-4 py-2.5 text-text-secondary whitespace-nowrap text-xs">{row.bankDetails?.bankName || '—'}</td>
                                <td className="px-4 py-2.5 text-text-secondary whitespace-nowrap text-xs">{row.bankDetails?.branch || '—'}</td>
                                <td className="px-4 py-2.5 text-text-secondary font-mono whitespace-nowrap text-xs">{row.bankDetails?.accountNo || '—'}</td>
                                <td className="px-4 py-2.5 text-text-secondary font-mono whitespace-nowrap text-xs">{row.bankDetails?.ifscCode || '—'}</td>
                                <td className="px-4 py-2.5 text-text-secondary font-mono whitespace-nowrap text-xs">{row.pfNo || '—'}</td>
                                <td className="px-4 py-2.5 text-emerald-400 font-bold font-mono whitespace-nowrap text-xs">
                                   {row.salaryPerDay ? `₹${row.salaryPerDay}` : '—'}
                                </td>
                                <td className="px-4 py-2.5 whitespace-nowrap">
                                   <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-tighter ${
                                     row.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400' :
                                     row.status === 'ON_LEAVE' ? 'bg-amber-500/20 text-amber-400' :
                                     'bg-red-500/20 text-red-400'
                                   }`}>
                                     {row.status || '—'}
                                   </span>
                                </td>
                                <td className="px-4 py-2.5 text-text-secondary whitespace-nowrap text-xs">{row.joinByReference || '—'}</td>
                                <td className="px-4 py-2.5 text-text-secondary text-xs truncate max-w-[150px]" title={row.remarks}>{row.remarks || '—'}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Error rows table */}
              {activeTab === 'errors' && (
                <div className="overflow-x-auto rounded-xl border border-red-500/20">
                  {result.errors.length === 0 ? (
                    <div className="p-8 text-center text-emerald-400 text-sm">🎉 No errors found!</div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-red-500/10 text-left">
                          {['Row #', 'GR No', 'Issue'].map(h => (
                            <th key={h} className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-red-400/80">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {result.errors.map((err: RowError, i: number) => (
                          <tr key={i} className="border-t border-red-500/10 hover:bg-red-500/5 transition-colors">
                            <td className="px-4 py-3 font-mono text-red-400/80">{err.rowNumber || '—'}</td>
                            <td className="px-4 py-3 font-mono text-red-300">{err.grNo || '—'}</td>
                            <td className="px-4 py-3 text-red-300/80">{err.message}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
                  ⚠️ {error}
                </div>
              )}
            </div>
          )}

          {/* ── STEP: DONE ── */}
          {step === 'done' && finalResult && (
            <div className="flex flex-col items-center gap-6 py-8">
              <span className="text-6xl animate-bounce">🎉</span>
              <div className="text-center">
                <h3 className="text-2xl font-black text-emerald-400">Import Complete!</h3>
                <p className="text-text-secondary mt-2">
                  Successfully imported <span className="text-white font-bold">{finalResult.validCount}</span> laborers
                  {finalResult.errorCount > 0 && (
                    <> · <span className="text-red-400 font-bold">{finalResult.errorCount}</span> failed</>
                  )}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="px-8 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
              >
                Done
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {step !== 'done' && (
          <div className="flex items-center justify-between px-8 py-5 border-t border-white/10 bg-white/[0.02] flex-shrink-0">
            <button
              onClick={step === 'upload' ? handleClose : reset}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-text-secondary hover:text-white bg-white/5 hover:bg-white/10 transition-all"
            >
              {step === 'upload' ? 'Cancel' : '← Back'}
            </button>

            {step === 'upload' && (
              <button
                onClick={handlePreview}
                disabled={!file || loading}
                className="px-6 py-2.5 rounded-xl text-sm font-bold bg-accent-primary text-white hover:bg-accent-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-accent-primary/20 flex items-center gap-2"
              >
                {loading ? (
                  <><span className="animate-spin">⏳</span> Analyzing...</>
                ) : (
                  <><span>🔍</span> Preview Import</>
                )}
              </button>
            )}

            {step === 'preview' && (
              <button
                onClick={handleConfirm}
                disabled={!result || result.validCount === 0 || loading}
                className="px-6 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2"
              >
                <span>✅</span> Confirm & Import {result?.validCount} Workers
              </button>
            )}

            {step === 'confirming' && (
              <button disabled className="px-6 py-2.5 rounded-xl text-sm font-bold bg-emerald-600/50 text-white/50 cursor-not-allowed flex items-center gap-2">
                <span className="animate-spin">⏳</span> Importing...
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExcelImportModal;
