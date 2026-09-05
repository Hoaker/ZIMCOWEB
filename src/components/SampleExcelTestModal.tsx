import React from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Play, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  X, 
  ArrowRight,
  Database,
  Sliders,
  Wand2,
  Trash2,
  Table
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  SAMPLE_TEST_FILES, 
  SampleTestFileConfig, 
  downloadSampleExcelFile, 
  downloadAllSampleExcelFiles, 
  loadSampleAsParsedSheet 
} from '../lib/sampleSpreadsheets';
import { ParsedRawSheet } from '../lib/deductionNormalizer';

interface SampleExcelTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSampleForWorkbench: (parsedSheet: ParsedRawSheet) => void;
  showToast: (message: string, type?: 'success' | 'warning' | 'error') => void;
}

export default function SampleExcelTestModal({
  isOpen,
  onClose,
  onSelectSampleForWorkbench,
  showToast
}: SampleExcelTestModalProps) {
  if (!isOpen) return null;

  const handleDownload = (config: SampleTestFileConfig) => {
    downloadSampleExcelFile(config);
    showToast(`Downloading "${config.filename}"...`, 'success');
  };

  const handleDownloadAll = () => {
    downloadAllSampleExcelFiles();
    showToast('Downloading all 5 test Excel workbooks...', 'success');
  };

  const handleInstantTest = (config: SampleTestFileConfig) => {
    const parsed = loadSampleAsParsedSheet(config);
    onSelectSampleForWorkbench(parsed);
    onClose();
    showToast(`Loaded "${config.title}" into the Normalization & Sanitization Workbench!`, 'success');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden my-6"
        >
          {/* Header */}
          <div className="p-6 md:p-8 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white flex items-start justify-between relative overflow-hidden">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-[10px] font-black uppercase tracking-wider mb-3">
                <FileSpreadsheet size={13} />
                5 Specialized Test Scenarios
              </div>
              <h2 className="text-2xl md:text-3xl font-black font-headline tracking-tight text-white">
                Download & Test Sample Payroll Spreadsheets
              </h2>
              <p className="text-xs md:text-sm text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
                Test the dynamic column sanitization engine, in-grid column deletion, currency symbol stripper, split math verification, and member ledger injection.
              </p>
            </div>

            <div className="flex items-center gap-3 relative z-10">
              <button
                onClick={handleDownloadAll}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition shadow-md shadow-emerald-900/30"
              >
                <Download size={14} />
                Download All 5 (.xlsx)
              </button>
              <button
                onClick={onClose}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-slate-300 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Background Glow */}
            <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          </div>

          {/* Modal Body: Cards List */}
          <div className="p-6 md:p-8 overflow-y-auto space-y-4 custom-scrollbar flex-1 bg-slate-50/50">
            {SAMPLE_TEST_FILES.map((config, index) => {
              return (
                <div
                  key={config.id}
                  className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 text-xs font-black flex items-center justify-center font-mono">
                        {index + 1}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                        config.badgeColor === 'emerald' ? 'bg-emerald-100 text-emerald-800' :
                        config.badgeColor === 'amber' ? 'bg-amber-100 text-amber-900' :
                        config.badgeColor === 'blue' ? 'bg-blue-100 text-blue-800' :
                        config.badgeColor === 'rose' ? 'bg-rose-100 text-rose-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {config.badge}
                      </span>
                      <span className="text-xs font-mono text-slate-400 font-bold">
                        {config.filename}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        • {config.recordsCount} Rows • {config.columnsCount} Columns
                      </span>
                    </div>

                    <h3 className="text-base font-black text-slate-900 font-headline">
                      {config.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {config.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {config.featuresTested.map((feat, fIdx) => (
                        <span 
                          key={fIdx}
                          className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-md"
                        >
                          ✓ {feat}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions for this file */}
                  <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
                    <button
                      onClick={() => handleDownload(config)}
                      className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition"
                      title="Download real Excel .xlsx file"
                    >
                      <Download size={14} className="text-slate-600" />
                      Download .xlsx
                    </button>
                    <button
                      onClick={() => handleInstantTest(config)}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm shadow-emerald-700/20 transition"
                      title="Directly launch inside Sanitization Workbench"
                    >
                      <Play size={14} className="fill-white" />
                      Test in Workbench
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-4 md:p-6 bg-white border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500 font-medium">
              💡 <strong>Tip:</strong> You can download these files and upload them through the standard file picker, or click <em>"Test in Workbench"</em> for instant zero-friction testing.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDownloadAll}
                className="sm:hidden px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold uppercase"
              >
                Download All (.xlsx)
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold uppercase tracking-wider transition"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
