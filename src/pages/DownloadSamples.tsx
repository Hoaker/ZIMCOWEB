import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  FileSpreadsheet, 
  Download, 
  CheckCircle2, 
  ArrowLeft, 
  Play, 
  Sparkles, 
  ExternalLink,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { 
  SAMPLE_TEST_FILES, 
  SampleTestFileConfig, 
  downloadSampleExcelFile, 
  downloadAllSampleExcelFiles 
} from '../lib/sampleSpreadsheets';

export default function DownloadSamples() {
  const [searchParams] = useSearchParams();
  const [downloadedList, setDownloadedList] = useState<string[]>([]);
  const [autoTriggered, setAutoTriggered] = useState(false);

  useEffect(() => {
    const fileId = searchParams.get('file');
    const autoAll = searchParams.get('all');

    if (!autoTriggered) {
      if (autoAll === 'true') {
        setAutoTriggered(true);
        downloadAllSampleExcelFiles();
        setDownloadedList(SAMPLE_TEST_FILES.map(f => f.id));
      } else if (fileId) {
        const target = SAMPLE_TEST_FILES.find(f => f.id === fileId);
        if (target) {
          setAutoTriggered(true);
          downloadSampleExcelFile(target);
          setDownloadedList([target.id]);
        }
      }
    }
  }, [searchParams, autoTriggered]);

  const handleDownload = (config: SampleTestFileConfig) => {
    downloadSampleExcelFile(config);
    if (!downloadedList.includes(config.id)) {
      setDownloadedList(prev => [...prev, config.id]);
    }
  };

  const handleDownloadAll = () => {
    downloadAllSampleExcelFiles();
    setDownloadedList(SAMPLE_TEST_FILES.map(f => f.id));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-body antialiased selection:bg-emerald-500 selection:text-white">
      {/* Top Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-6 py-4 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-900/40">
            <FileSpreadsheet size={22} />
          </div>
          <div>
            <h1 className="font-headline font-black text-lg text-white tracking-tight flex items-center gap-2">
              ZIMCO Excel Test Suite
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider border border-emerald-500/30">
                5 .XLSX Workbooks
              </span>
            </h1>
            <p className="text-xs text-slate-400">Institutional Payroll Sanitization & Ingestion Test Files</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/bursary"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition border border-slate-700"
          >
            <ArrowLeft size={14} />
            Back to Bursary
          </Link>
          <button
            onClick={handleDownloadAll}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-900/40 transition"
          >
            <Download size={14} />
            Download All 5 (.xlsx)
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-10 space-y-8">
        {/* Banner */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-emerald-950/70 border border-emerald-500/20 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl">
          <div className="relative z-10 space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-black uppercase tracking-wider">
              <Sparkles size={14} />
              Instant Browser Download Trigger
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white font-headline tracking-tight">
              Download Real Microsoft Excel Spreadsheets
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Click the download button on any test case below. The genuine <code className="text-emerald-400 font-mono bg-emerald-950/60 px-1.5 py-0.5 rounded">.xlsx</code> binary spreadsheet will immediately save to your device's <strong>Downloads</strong> folder.
            </p>
          </div>
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* 5 Cards List */}
        <div className="space-y-4">
          {SAMPLE_TEST_FILES.map((config, index) => {
            const isDownloaded = downloadedList.includes(config.id);

            return (
              <div
                key={config.id}
                id={`sample-card-${config.id}`}
                className="bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-6 transition-all shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 text-xs font-black flex items-center justify-center font-mono border border-slate-700">
                      0{index + 1}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                      config.badgeColor === 'emerald' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      config.badgeColor === 'amber' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      config.badgeColor === 'blue' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                      config.badgeColor === 'rose' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                      'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    }`}>
                      {config.badge}
                    </span>
                    <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/50">
                      {config.filename}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      ({config.recordsCount} Rows • {config.columnsCount} Columns)
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white font-headline">
                    {config.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {config.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {config.featuresTested.map((feat, fIdx) => (
                      <span 
                        key={fIdx}
                        className="px-2.5 py-1 bg-slate-800 text-slate-300 text-[11px] font-medium rounded-lg border border-slate-700/60"
                      >
                        ✓ {feat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Download Actions */}
                <div className="flex flex-col sm:flex-row items-stretch md:items-center gap-3 shrink-0">
                  <button
                    onClick={() => handleDownload(config)}
                    className={`px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-md ${
                      isDownloaded
                        ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40 hover:bg-slate-750'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40'
                    }`}
                  >
                    {isDownloaded ? (
                      <>
                        <CheckCircle2 size={16} className="text-emerald-400" />
                        Downloaded (Click to Re-Download)
                      </>
                    ) : (
                      <>
                        <Download size={16} />
                        Download .xlsx File
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Instructions Box */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 text-slate-400 text-xs space-y-2">
          <h4 className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-400" />
            Testing Workflow Steps
          </h4>
          <ol className="list-decimal list-inside space-y-1.5 text-slate-300">
            <li>Click <strong>"Download .xlsx File"</strong> on any test case above.</li>
            <li>Go to the <strong><Link to="/admin/bursary" className="text-emerald-400 underline hover:text-emerald-300">Bursary Dashboard</Link></strong> and drag & drop the downloaded file into the upload zone.</li>
            <li>Use the in-grid tools (column deletions, auto-sanitize values, split synchronizer) to normalize data.</li>
            <li>Click <strong>"Confirm & Push to Members"</strong> to synchronize the ledgers with individual accounts.</li>
          </ol>
        </div>
      </main>
    </div>
  );
}
