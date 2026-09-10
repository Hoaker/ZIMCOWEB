import React from 'react';
import { 
  Upload, 
  FileSpreadsheet, 
  DownloadCloud, 
  RefreshCcw, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Sparkles, 
  Edit3, 
  Trash2, 
  UserCheck, 
  Wand2, 
  Maximize2, 
  Minimize2, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  FileCheck2,
  Wallet,
  TrendingUp,
  CreditCard,
  Building,
  ShieldCheck,
  CheckCircle,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ParsedRawSheet, NormalizedDeductionRecord, DataQualityFlag } from '../../lib/deductionNormalizer';
import DynamicNormalizationWorkbench from '../DynamicNormalizationWorkbench';
import { NewMemberCredential } from '../NewMembersCredentialModal';

export interface DeductionRecord {
  id: string;
  name: string;
  date?: string;
  ordinarySavings: number;
  specialSavings: number;
  investment: number;
  commodityPurchase: number;
  loanReimbursement: number;
  muslimCommunity?: number;
  total: number;
  status?: 'valid' | 'warning' | 'error';
  message?: string;
  isModified?: boolean;
  originalValues?: {
    ordinarySavings: number;
    specialSavings: number;
    investment: number;
    commodityPurchase: number;
    loanReimbursement: number;
    muslimCommunity?: number;
  };
  dataQualityFlags?: DataQualityFlag[];
}

interface PayrollImportStepperProps {
  currentStep: 1 | 2 | 3;
  setCurrentStep: (step: 1 | 2 | 3) => void;
  parsedRawSheet: ParsedRawSheet | null;
  importWorkflowStage: 'review' | 'normalization';
  setImportWorkflowStage: (stage: 'review' | 'normalization') => void;
  handleImportClick: () => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  isParsing: boolean;
  setShowSampleModal: (show: boolean) => void;
  handleDownloadTemplate: () => void;
  handleNormalizationComplete: (normalizedList: NormalizedDeductionRecord[], specifiedMonth?: string) => void;
  ceilings: { ordinarySavingsCeiling: number; specialSavingsCeiling: number };
  showToast: (message: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
  importedRecords: DeductionRecord[];
  modifiedRecords: DeductionRecord[];
  errorCount: number;
  warnCount: number;
  validCount: number;
  totalPoolSum: number;
  ordSavingsSum: number;
  specSavingsSum: number;
  investSum: number;
  commoditySum: number;
  loanRepaySum: number;
  mcaSum: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  diagnosticFilter: 'all' | 'error' | 'warning' | 'valid';
  setDiagnosticFilter: (filter: 'all' | 'error' | 'warning' | 'valid') => void;
  isDeductionsTableExpanded: boolean;
  setIsDeductionsTableExpanded: (expanded: boolean) => void;
  editingRow: DeductionRecord | null;
  setEditingRow: React.Dispatch<React.SetStateAction<DeductionRecord | null>>;
  handleSaveEdit: (e: React.FormEvent) => void;
  handleBypassWarning: (id: string) => void;
  handleDeleteRow: (id: string, name: string) => void;
  handleAutoBalanceAllMismatches: () => void;
  newlyProvisionedMembers: NewMemberCredential[];
  setShowNewMembersModal: (show: boolean) => void;
  pushStatus: 'idle' | 'pushing' | 'success' | 'error';
  pushProgress: number;
  handlePushToMembers: (validOnly?: boolean) => void;
  activeMonth: string;
  setActiveMonth: (month: string) => void;
  onNavigateToReconcile: () => void;
  onNavigateToExport: () => void;
  onSwitchSheet?: (sheetName: string) => void;
  importMode?: 'live' | 'historical';
  setImportMode?: (mode: 'live' | 'historical') => void;
}

export default function PayrollImportStepper({
  currentStep,
  setCurrentStep,
  parsedRawSheet,
  importWorkflowStage,
  setImportWorkflowStage,
  handleImportClick,
  handleFileChange,
  fileInputRef,
  isParsing,
  setShowSampleModal,
  handleDownloadTemplate,
  handleNormalizationComplete,
  ceilings,
  showToast,
  importedRecords,
  errorCount,
  warnCount,
  validCount,
  totalPoolSum,
  ordSavingsSum,
  specSavingsSum,
  investSum,
  commoditySum,
  loanRepaySum,
  mcaSum,
  searchQuery,
  setSearchQuery,
  diagnosticFilter,
  setDiagnosticFilter,
  isDeductionsTableExpanded,
  setIsDeductionsTableExpanded,
  editingRow,
  setEditingRow,
  handleSaveEdit,
  handleBypassWarning,
  handleDeleteRow,
  handleAutoBalanceAllMismatches,
  newlyProvisionedMembers,
  setShowNewMembersModal,
  pushStatus,
  pushProgress,
  handlePushToMembers,
  activeMonth,
  setActiveMonth,
  onNavigateToReconcile,
  onNavigateToExport,
  onSwitchSheet,
  importMode = 'live',
  setImportMode
}: PayrollImportStepperProps) {
  const [qualityFilter, setQualityFilter] = React.useState<'all' | 'unparsed' | 'dates' | 'totals' | 'flagged'>('all');
  const [internalMode, setInternalMode] = React.useState<'live' | 'historical'>(importMode);

  const currentMode = setImportMode ? importMode : internalMode;
  const handleSetMode = (m: 'live' | 'historical') => {
    if (setImportMode) {
      setImportMode(m);
    } else {
      setInternalMode(m);
    }
  };

  // Month & Year split management
  const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const YEARS = [2023, 2024, 2025, 2026, 2027, 2028];

  const parsedMonthParts = activeMonth.split(' ');
  const currentMonthName = MONTHS.includes(parsedMonthParts[0]) ? parsedMonthParts[0] : 'January';
  const currentYearNum = parseInt(parsedMonthParts[1], 10) || 2026;

  const handleMonthChange = (newMonth: string) => {
    setActiveMonth(`${newMonth} ${currentYearNum}`);
  };

  const handleYearChange = (newYear: number) => {
    setActiveMonth(`${currentMonthName} ${newYear}`);
  };

  // Compute Data Quality counts
  const unparsedRows = importedRecords.filter(r => r.dataQualityFlags?.some(f => f.type === 'unparsed_number'));
  const ambiguousDateRows = importedRecords.filter(r => r.dataQualityFlags?.some(f => f.type === 'ambiguous_date'));
  const suspectedTotalRows = importedRecords.filter(r => r.dataQualityFlags?.some(f => f.type === 'suspected_total_row'));
  const flaggedRows = importedRecords.filter(r => (r.dataQualityFlags && r.dataQualityFlags.length > 0) || r.status === 'error' || r.status === 'warning');
  const duplicateHeaderCollisions = parsedRawSheet?.duplicateHeaderCollisions || [];

  const displayRows = importedRecords.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.id.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    // Quality filter
    if (qualityFilter === 'unparsed') {
      return r.dataQualityFlags?.some(f => f.type === 'unparsed_number');
    }
    if (qualityFilter === 'dates') {
      return r.dataQualityFlags?.some(f => f.type === 'ambiguous_date');
    }
    if (qualityFilter === 'totals') {
      return r.dataQualityFlags?.some(f => f.type === 'suspected_total_row');
    }
    if (qualityFilter === 'flagged') {
      return (r.dataQualityFlags && r.dataQualityFlags.length > 0) || r.status === 'error' || r.status === 'warning';
    }

    // Standard diagnostic filter
    if (diagnosticFilter === 'all') return true;
    return r.status === diagnosticFilter;
  });

  const steps = [
    { number: 1, title: 'Upload & Map', desc: 'Select or drag workbook & map columns' },
    { number: 2, title: 'Review & Verify', desc: 'Audit math, fix rows & inspect allocations' },
    { number: 3, title: 'Confirm & Push', desc: 'Summary certification & live ledger push' }
  ];

  const availableSheets = parsedRawSheet?.availableSheets || [];
  const currentSheetIndex = parsedRawSheet ? availableSheets.indexOf(parsedRawSheet.sheetName) : -1;
  const nextSheetName = currentSheetIndex >= 0 && currentSheetIndex < availableSheets.length - 1
    ? availableSheets[currentSheetIndex + 1]
    : null;

  return (
    <div className="space-y-6">
      {/* Hidden file input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept=".csv, .xlsx, .xls"
        onChange={handleFileChange}
      />

      {/* Stepper Header Bar with Cycle & Mode Controls */}
      <div className="bg-white border border-outline-variant rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 bg-primary-container text-on-primary-container text-[10px] font-black uppercase tracking-wider rounded-md font-label">
                Payroll Deduction Ingestion
              </span>

              {/* Import Mode Selector: Live Cycle vs Historical Record */}
              <div className="inline-flex p-0.5 bg-surface-container rounded-lg border border-outline-variant text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => handleSetMode('live')}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    currentMode === 'live'
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  This Month's Live Cycle
                </button>
                <button
                  type="button"
                  onClick={() => handleSetMode('historical')}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    currentMode === 'historical'
                      ? 'bg-secondary text-on-secondary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Historical Record
                </button>
              </div>
              
              {/* Year + Month Selectors */}
              <div className="flex items-center gap-1.5 bg-surface-container-low px-2.5 py-1 rounded-lg border border-outline-variant/60">
                <span className="text-xs text-on-surface-variant font-medium">Cycle:</span>
                <select
                  value={currentMonthName}
                  onChange={(e) => handleMonthChange(e.target.value)}
                  className="bg-transparent text-xs font-bold text-on-surface focus-visible:outline-none cursor-pointer"
                >
                  {MONTHS.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <select
                  value={currentYearNum}
                  onChange={(e) => handleYearChange(parseInt(e.target.value, 10))}
                  className="bg-transparent text-xs font-bold text-on-surface focus-visible:outline-none cursor-pointer border-l border-outline-variant pl-1.5"
                >
                  {YEARS.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight font-headline">
                {currentMode === 'historical' ? `Historical Payroll Import (${activeMonth})` : `Monthly Payroll Deductions (${activeMonth})`}
              </h1>
              {currentMode === 'historical' && (
                <p className="text-xs text-secondary font-medium mt-0.5">
                  Historical Mode active: Ingestion archives historical transaction records without automatically advancing the active monthly cycle.
                </p>
              )}
            </div>
          </div>

          {/* Stepper navigation indicators */}
          <div className="flex items-center gap-2 sm:gap-3 bg-surface-container-low p-1.5 rounded-xl border border-outline-variant shrink-0">
            {steps.map((s, idx) => {
              const isActive = currentStep === s.number;
              const isCompleted = currentStep > s.number;
              const isAccessible = s.number === 1 || (s.number === 2 && (importedRecords.length > 0 || parsedRawSheet)) || (s.number === 3 && importedRecords.length > 0);

              return (
                <React.Fragment key={s.number}>
                  <button
                    onClick={() => {
                      if (isAccessible) {
                        setCurrentStep(s.number as 1 | 2 | 3);
                      }
                    }}
                    disabled={!isAccessible}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-primary text-on-primary shadow-xs font-bold' 
                        : isCompleted
                        ? 'text-primary hover:bg-primary-container/40'
                        : isAccessible
                        ? 'text-on-surface-variant hover:text-on-surface'
                        : 'text-outline cursor-not-allowed opacity-60'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      isActive
                        ? 'bg-white text-primary'
                        : isCompleted
                        ? 'bg-primary text-white'
                        : 'bg-surface-container-highest text-on-surface-variant'
                    }`}>
                      {isCompleted ? <Check size={11} strokeWidth={3} /> : s.number}
                    </span>
                    <span className="hidden sm:inline whitespace-nowrap">{s.title}</span>
                  </button>
                  {idx < steps.length - 1 && (
                    <div className="w-3 h-px bg-outline-variant shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Multi-Sheet Selector Ribbon */}
        {availableSheets.length > 1 && (
          <div className="mt-4 pt-3 border-t border-outline-variant flex flex-wrap items-center justify-between gap-3 bg-surface-container-low/50 -mx-4 -mb-4 sm:-mx-5 sm:-mb-5 p-3 sm:px-5 rounded-b-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface">
                <FileSpreadsheet size={15} className="text-primary" />
                <span>Workbook Sheets ({availableSheets.length}):</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {availableSheets.map((sName, sIdx) => {
                  const isCurrent = parsedRawSheet?.sheetName === sName;
                  return (
                    <button
                      key={sName}
                      type="button"
                      onClick={() => onSwitchSheet?.(sName)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-primary text-on-primary shadow-xs'
                          : 'bg-white hover:bg-surface-container text-on-surface border border-outline-variant'
                      }`}
                    >
                      <span>{sIdx + 1}. {sName}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {nextSheetName && (
              <button
                type="button"
                onClick={() => onSwitchSheet?.(nextSheetName)}
                className="px-3.5 py-1.5 bg-secondary text-on-secondary hover:bg-secondary/90 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <span>Load Next Sheet ({nextSheetName})</span>
                <ArrowRight size={13} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* STEP 1: UPLOAD & MAPPING */}
      {currentStep === 1 && (
        <motion.div
          key="step-1"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="space-y-6"
        >
          {isParsing ? (
            <div className="bg-white border border-outline-variant rounded-2xl p-16 text-center shadow-xs space-y-4">
              <RefreshCcw className="w-12 h-12 text-primary animate-spin mx-auto" />
              <div>
                <p className="font-bold text-base text-on-surface font-headline">Parsing Spreadsheet Cells & Columns</p>
                <p className="text-xs text-on-surface-variant mt-1">Extracting worksheet headers and running auto-alias normalization...</p>
              </div>
            </div>
          ) : importWorkflowStage === 'normalization' && parsedRawSheet ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-primary-container/40 border border-primary-container p-3.5 rounded-xl">
                <div className="flex items-center gap-2 text-xs text-on-primary-container font-medium">
                  <Info size={16} className="text-primary shrink-0" />
                  <span>Map columns to canonical accounts and review sanitized rows before proceeding.</span>
                </div>
                <button
                  onClick={() => {
                    setImportWorkflowStage('review');
                    setCurrentStep(2);
                  }}
                  className="px-3.5 py-1.5 bg-primary text-on-primary rounded-lg text-xs font-bold hover:bg-primary/90 transition"
                >
                  Skip to Review →
                </button>
              </div>

              <DynamicNormalizationWorkbench
                parsedSheet={parsedRawSheet}
                ceilings={ceilings}
                onNormalizedComplete={(normalizedList, month) => {
                  handleNormalizationComplete(normalizedList, month);
                  setCurrentStep(2);
                }}
                onCancel={() => setImportWorkflowStage('review')}
                showToast={showToast}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Primary Upload Drop Zone */}
              <div className="lg:col-span-2 bg-white border-2 border-dashed border-outline-variant hover:border-primary/60 rounded-2xl p-8 sm:p-12 text-center transition-all flex flex-col items-center justify-center space-y-4 group">
                <div className="w-16 h-16 rounded-2xl bg-primary-container/60 text-primary flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                  <Upload size={32} />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold mb-2">
                    <Calendar size={13} />
                    <span>Target Payroll Cycle: {activeMonth}</span>
                  </div>
                  <h3 className="text-lg font-bold text-on-surface font-headline">Upload Deduction Spreadsheet</h3>
                  <p className="text-xs text-on-surface-variant max-w-md mt-1 leading-relaxed">
                    Select your Excel (<code className="text-primary font-mono">.xlsx</code>, <code className="text-primary font-mono">.xls</code>) or <code className="text-primary font-mono">.csv</code> file. Deductions will be allocated to members for <strong className="text-on-surface">{activeMonth}</strong>.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={handleImportClick}
                    className="px-6 py-3 bg-primary hover:bg-primary/90 text-on-primary rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-xs cursor-pointer"
                  >
                    <Upload size={15} />
                    Choose Excel / CSV File
                  </button>
                  <button
                    onClick={() => setShowSampleModal(true)}
                    className="px-5 py-3 bg-secondary-container text-on-secondary-container hover:bg-secondary-container/80 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 border border-secondary/30 cursor-pointer"
                  >
                    <FileSpreadsheet size={15} className="text-secondary" />
                    Load Sample Test File
                  </button>
                </div>

                {parsedRawSheet && (
                  <div className="mt-4 p-3 bg-surface-container rounded-xl border border-outline-variant text-left w-full max-w-md flex items-center justify-between">
                    <div className="truncate">
                      <p className="text-xs font-bold text-on-surface truncate">{parsedRawSheet.fileName}</p>
                      <p className="text-[10px] text-on-surface-variant">{parsedRawSheet.rawRows.length} rows detected • Sheet: {parsedRawSheet.sheetName}</p>
                    </div>
                    <button
                      onClick={() => setImportWorkflowStage('normalization')}
                      className="px-3 py-1 bg-white hover:bg-surface-container-high border border-outline-variant rounded-lg text-xs font-bold text-primary shrink-0 cursor-pointer"
                    >
                      Configure Mappings
                    </button>
                  </div>
                )}
              </div>

              {/* Sidebar Quick Actions & Templates */}
              <div className="space-y-4">
                <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-xs space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface font-label">Spreadsheet Guides</h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Ensure your spreadsheet includes columns for Member ID/Name and standard deduction items (Ordinary Savings, Special Savings, Investments, Loan Paybacks).
                  </p>
                  <button
                    onClick={handleDownloadTemplate}
                    className="w-full py-2.5 bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <DownloadCloud size={14} className="text-primary" />
                    Download Standard CSV Template
                  </button>
                </div>

                {importedRecords.length > 0 && (
                  <div className="bg-tertiary-container/30 border border-tertiary-container rounded-2xl p-6 shadow-xs space-y-3">
                    <div className="flex items-center gap-2 text-tertiary">
                      <CheckCircle size={18} />
                      <h4 className="text-xs font-bold uppercase tracking-wider font-label">Records In Buffer</h4>
                    </div>
                    <p className="text-xs text-on-surface-variant">
                      <strong>{importedRecords.length}</strong> records are currently loaded in memory for <strong>{activeMonth}</strong>.
                    </p>
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="w-full py-2.5 bg-primary text-on-primary rounded-xl text-xs font-bold hover:bg-primary/90 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <span>Proceed to Step 2: Review</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* STEP 2: REVIEW & VERIFY */}
      {currentStep === 2 && (
        <motion.div
          key="step-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="space-y-6"
        >
          {/* Diagnostic Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-white border border-outline-variant rounded-2xl p-4 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Total Rows</span>
              <p className="text-xl font-bold text-on-surface font-headline mt-0.5">{importedRecords.length}</p>
            </div>
            <div className={`rounded-2xl p-4 shadow-xs border ${errorCount > 0 ? 'bg-error-container/20 border-error/30' : 'bg-white border-outline-variant'}`}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-error">Mathematical Discrepancies</span>
              <p className="text-xl font-bold text-error font-headline mt-0.5">{errorCount}</p>
            </div>
            <div className="bg-white border border-outline-variant rounded-2xl p-4 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">Warnings / Ceilings</span>
              <p className="text-xl font-bold text-secondary font-headline mt-0.5">{warnCount}</p>
            </div>
            <div className="bg-white border border-outline-variant rounded-2xl p-4 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-tertiary">Verified Rows</span>
              <p className="text-xl font-bold text-tertiary font-headline mt-0.5">{validCount}</p>
            </div>
          </div>

          {/* Newly Identified Members Alert Banner */}
          {newlyProvisionedMembers.length > 0 && (
            <div className="bg-secondary-container/40 border border-secondary-container rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-secondary text-white flex items-center justify-center shrink-0 font-bold shadow-xs">
                  <UserCheck size={20} />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-on-secondary-container bg-secondary-container px-2.5 py-0.5 rounded-md">
                      {newlyProvisionedMembers.length} New Member Accounts Detected
                    </span>
                    <span className="text-[11px] font-semibold text-primary bg-primary-container px-2 py-0.5 rounded-md">
                      Default Password: Surname (lowercase)
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                    These members will be automatically enrolled when this workbook is pushed to ledgers.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowNewMembersModal(true)}
                className="px-4 py-2 bg-on-surface text-surface rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-on-surface/90 transition flex items-center gap-2 shrink-0 cursor-pointer shadow-xs"
              >
                <DownloadCloud size={14} className="text-secondary" />
                <span>Download Credentials</span>
              </button>
            </div>
          )}

          {/* Duplicate Header Collision Banner */}
          {duplicateHeaderCollisions.length > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 text-xs text-on-surface shadow-xs">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center shrink-0 font-bold">
                <AlertTriangle size={17} />
              </div>
              <div className="space-y-1.5">
                <p className="font-bold text-sm text-on-surface">Duplicate Column Header Detection</p>
                {duplicateHeaderCollisions.map((col, idx) => (
                  <p key={idx} className="text-xs text-on-surface-variant leading-relaxed">
                    Two columns matched <strong>{col.fieldLabel}</strong>: "<span className="font-mono font-semibold text-on-surface bg-surface-container px-1.5 py-0.5 rounded">{col.keptHeader}</span>" and "<span className="font-mono font-semibold text-on-surface bg-surface-container px-1.5 py-0.5 rounded">{col.droppedHeader}</span>". The first was linked and the second was unmapped. You can switch or adjust mappings in Step 1 if needed.
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Data Quality Scope Summary Strip */}
          <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-900 border border-amber-500/20">
                  <Info size={12} className="text-amber-700" />
                  Data Quality Audit
                </span>
                <span className="text-xs font-bold text-on-surface">
                  {flaggedRows.length > 0 ? `${flaggedRows.length} rows need a look` : 'All rows clean & verified'}
                </span>
              </div>

              {/* Quick filter chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                {unparsedRows.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setQualityFilter(qualityFilter === 'unparsed' ? 'all' : 'unparsed')}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                      qualityFilter === 'unparsed'
                        ? 'bg-amber-700 text-white border-amber-800 shadow-xs'
                        : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                    }`}
                  >
                    <span className="font-mono font-bold">{unparsedRows.length}</span>
                    <span>non-number cell{unparsedRows.length > 1 ? 's' : ''} (defaulted to 0)</span>
                  </button>
                )}

                {ambiguousDateRows.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setQualityFilter(qualityFilter === 'dates' ? 'all' : 'dates')}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                      qualityFilter === 'dates'
                        ? 'bg-amber-700 text-white border-amber-800 shadow-xs'
                        : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                    }`}
                  >
                    <span className="font-mono font-bold">{ambiguousDateRows.length}</span>
                    <span>ambiguous date{ambiguousDateRows.length > 1 ? 's' : ''}</span>
                  </button>
                )}

                {suspectedTotalRows.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setQualityFilter(qualityFilter === 'totals' ? 'all' : 'totals')}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                      qualityFilter === 'totals'
                        ? 'bg-error text-white border-error shadow-xs'
                        : 'bg-error-container/40 text-error border-error/30 hover:bg-error-container/60'
                    }`}
                  >
                    <AlertTriangle size={12} />
                    <span className="font-mono font-bold">{suspectedTotalRows.length}</span>
                    <span>suspected total row{suspectedTotalRows.length > 1 ? 's' : ''}</span>
                  </button>
                )}

                {qualityFilter !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setQualityFilter('all')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-on-surface-variant bg-surface-container hover:bg-surface-container-high border border-outline-variant transition cursor-pointer"
                  >
                    <span>Clear Filter</span>
                  </button>
                )}

                {flaggedRows.length === 0 && (
                  <span className="text-xs text-on-surface-variant font-medium flex items-center gap-1">
                    <CheckCircle2 size={13} className="text-tertiary" />
                    No unparsed cells, date ambiguities, or orphan total rows detected.
                  </span>
                )}
              </div>
            </div>

            <div className="shrink-0 flex items-center">
              <span className="text-[11px] font-medium text-on-surface-variant bg-white px-3 py-1.5 rounded-xl border border-outline-variant">
                Advisory review — "Approve & Push" stays active
              </span>
            </div>
          </div>

          {/* Table Container */}
          <div className={`bg-white border border-outline-variant shadow-xs overflow-hidden flex flex-col transition-all duration-200 ${
            isDeductionsTableExpanded 
              ? 'fixed inset-0 z-[100] rounded-none w-screen h-screen p-4 sm:p-6 bg-white' 
              : 'rounded-2xl'
          }`}>
            {/* Toolbar */}
            <div className="p-4 sm:p-5 border-b border-outline-variant bg-surface-container-lowest flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 bg-surface-container p-1 rounded-xl border border-outline-variant">
                  {(['all', 'error', 'warning', 'valid'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setDiagnosticFilter(f)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                        diagnosticFilter === f
                          ? f === 'error' ? 'bg-error text-on-error shadow-xs'
                          : f === 'warning' ? 'bg-secondary text-on-secondary shadow-xs'
                          : f === 'valid' ? 'bg-tertiary text-on-tertiary shadow-xs'
                          : 'bg-primary text-on-primary shadow-xs'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      {f === 'all' ? 'All Rows' : f}
                    </button>
                  ))}
                </div>

                {errorCount > 0 && (
                  <button
                    type="button"
                    onClick={handleAutoBalanceAllMismatches}
                    className="px-3.5 py-1.5 bg-secondary-container hover:bg-secondary-container/80 text-on-secondary-container border border-secondary/30 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                  >
                    <Wand2 size={12} className="text-secondary" />
                    <span>Auto-Balance Splits ({errorCount})</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" size={14} />
                  <input 
                    type="text" 
                    placeholder="Search name or ID..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-1.5 bg-surface-container-low border border-outline-variant rounded-xl text-xs outline-none focus:border-primary w-48 font-medium text-on-surface"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setIsDeductionsTableExpanded(!isDeductionsTableExpanded)}
                  className="p-2 bg-surface-container hover:bg-surface-container-high text-on-surface-variant rounded-xl text-xs font-bold transition cursor-pointer border border-outline-variant"
                  title={isDeductionsTableExpanded ? "Restore size" : "Expand to fullscreen"}
                >
                  {isDeductionsTableExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-label">
                    <th className="px-3 py-3 w-28">Member ID</th>
                    <th className="px-3 py-3 w-28">Cycle</th>
                    <th className="px-3 py-3 min-w-[140px]">Full Name</th>
                    <th className="px-3 py-3 text-right">Ordinary (₦)</th>
                    <th className="px-3 py-3 text-right">Special (₦)</th>
                    <th className="px-3 py-3 text-right">Invest (₦)</th>
                    <th className="px-3 py-3 text-right">Loan (₦)</th>
                    <th className="px-3 py-3 text-right">Commodity (₦)</th>
                    <th className="px-3 py-3 text-right">MCA (₦)</th>
                    <th className="px-3 py-3 text-right">Declared Sum (₦)</th>
                    <th className="px-3 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant text-xs font-medium text-on-surface">
                  {displayRows.map((record, index) => {
                    const isEditing = editingRow?.id === record.id;
                    const calculatedSum = record.ordinarySavings + record.specialSavings + (record.investment || 0) + (record.commodityPurchase || 0) + record.loanReimbursement + (record.muslimCommunity || 0);
                    
                    return (
                      <tr 
                        key={`${record.id || 'rec'}-${index}`}
                        className={`hover:bg-surface-container-lowest transition-colors ${
                          record.status === 'error' ? 'bg-error-container/10' : record.status === 'warning' ? 'bg-secondary-container/10' : ''
                        }`}
                      >
                        <td className="px-3 py-2.5 font-mono font-bold text-on-surface-variant text-xs">
                          {isEditing ? (
                            <input 
                              type="text"
                              value={editingRow?.id || ''}
                              onChange={(e) => setEditingRow(prev => prev ? { ...prev, id: e.target.value } : null)}
                              className="w-full bg-white border border-outline rounded p-1 text-xs font-mono font-bold"
                            />
                          ) : (
                            <span>{record.id}</span>
                          )}
                        </td>

                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant font-medium text-[10px]">
                            <Calendar size={10} className="text-primary" />
                            <span>{record.date || activeMonth}</span>
                          </span>
                        </td>

                        <td className="px-3 py-2.5">
                          {isEditing ? (
                            <input 
                              type="text"
                              value={editingRow?.name || ''}
                              onChange={(e) => setEditingRow(prev => prev ? { ...prev, name: e.target.value } : null)}
                              className="w-full bg-white border border-outline rounded p-1 text-xs font-bold"
                            />
                          ) : (
                            <div>
                              <p className="font-bold text-on-surface flex items-center gap-1.5">
                                {record.name}
                                {record.isModified && (
                                  <span className="px-1.5 py-0.2 bg-secondary-container text-on-secondary-container text-[8px] rounded font-bold uppercase">Modified</span>
                                )}
                              </p>
                              {record.message && (
                                <p className={`text-[10px] font-medium mt-0.5 flex items-center gap-1 ${
                                  record.status === 'error' ? 'text-error' : record.status === 'warning' ? 'text-secondary' : 'text-on-surface-variant'
                                }`}>
                                  {record.status === 'error' && <AlertTriangle size={11} className="shrink-0" />}
                                  {record.status === 'warning' && <Info size={11} className="shrink-0" />}
                                  {record.status === 'valid' && <CheckCircle2 size={11} className="shrink-0 text-tertiary" />}
                                  {record.message}
                                </p>
                              )}

                              {/* Data Quality Inline Badges */}
                              {record.dataQualityFlags && record.dataQualityFlags.length > 0 && (
                                <div className="mt-1 flex flex-col gap-1">
                                  {record.dataQualityFlags.map((flag, fIdx) => (
                                    <div 
                                      key={fIdx}
                                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-medium w-fit ${
                                        flag.type === 'suspected_total_row'
                                          ? 'bg-red-50 text-red-900 border border-red-200'
                                          : 'bg-amber-50 text-amber-900 border border-amber-200'
                                      }`}
                                    >
                                      {flag.type === 'suspected_total_row' ? (
                                        <AlertTriangle size={11} className="text-red-700 shrink-0" />
                                      ) : (
                                        <Info size={11} className="text-amber-700 shrink-0" />
                                      )}
                                      <span>{flag.message}</span>
                                      {flag.type === 'suspected_total_row' && (
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteRow(record.id, record.name);
                                          }}
                                          className="ml-1 px-1.5 py-0.5 bg-red-600 hover:bg-red-700 text-white rounded text-[9px] font-bold uppercase transition cursor-pointer"
                                          title="Exclude this summary row from the batch"
                                        >
                                          Exclude
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Numbers */}
                        <td className="px-3 py-2.5 text-right font-mono">
                          {isEditing ? (
                            <input 
                              type="number"
                              value={editingRow?.ordinarySavings ?? 0}
                              onChange={(e) => setEditingRow(prev => prev ? { ...prev, ordinarySavings: Number(e.target.value) } : null)}
                              className="w-20 bg-white border border-outline rounded p-1 text-xs text-right font-mono"
                            />
                          ) : (
                            <span>₦{record.ordinarySavings.toLocaleString()}</span>
                          )}
                        </td>

                        <td className="px-3 py-2.5 text-right font-mono">
                          {isEditing ? (
                            <input 
                              type="number"
                              value={editingRow?.specialSavings ?? 0}
                              onChange={(e) => setEditingRow(prev => prev ? { ...prev, specialSavings: Number(e.target.value) } : null)}
                              className="w-20 bg-white border border-outline rounded p-1 text-xs text-right font-mono"
                            />
                          ) : (
                            <span>₦{record.specialSavings.toLocaleString()}</span>
                          )}
                        </td>

                        <td className="px-3 py-2.5 text-right font-mono">
                          {isEditing ? (
                            <input 
                              type="number"
                              value={editingRow?.investment ?? 0}
                              onChange={(e) => setEditingRow(prev => prev ? { ...prev, investment: Number(e.target.value) } : null)}
                              className="w-20 bg-white border border-outline rounded p-1 text-xs text-right font-mono"
                            />
                          ) : (
                            <span>₦{(record.investment || 0).toLocaleString()}</span>
                          )}
                        </td>

                        <td className="px-3 py-2.5 text-right font-mono">
                          {isEditing ? (
                            <input 
                              type="number"
                              value={editingRow?.loanReimbursement ?? 0}
                              onChange={(e) => setEditingRow(prev => prev ? { ...prev, loanReimbursement: Number(e.target.value) } : null)}
                              className="w-20 bg-white border border-outline rounded p-1 text-xs text-right font-mono"
                            />
                          ) : (
                            <span>₦{record.loanReimbursement.toLocaleString()}</span>
                          )}
                        </td>

                        <td className="px-3 py-2.5 text-right font-mono">
                          {isEditing ? (
                            <input 
                              type="number"
                              value={editingRow?.commodityPurchase ?? 0}
                              onChange={(e) => setEditingRow(prev => prev ? { ...prev, commodityPurchase: Number(e.target.value) } : null)}
                              className="w-20 bg-white border border-outline rounded p-1 text-xs text-right font-mono"
                            />
                          ) : (
                            <span>₦{(record.commodityPurchase || 0).toLocaleString()}</span>
                          )}
                        </td>

                        <td className="px-3 py-2.5 text-right font-mono">
                          {isEditing ? (
                            <input 
                              type="number"
                              value={editingRow?.muslimCommunity ?? 0}
                              onChange={(e) => setEditingRow(prev => prev ? { ...prev, muslimCommunity: Number(e.target.value) } : null)}
                              className="w-20 bg-white border border-outline rounded p-1 text-xs text-right font-mono"
                            />
                          ) : (
                            <span>₦{(record.muslimCommunity || 0).toLocaleString()}</span>
                          )}
                        </td>

                        {/* Total Sum */}
                        <td className="px-3 py-2.5 text-right font-mono">
                          {isEditing ? (
                            <input 
                              type="number"
                              value={editingRow?.total ?? 0}
                              onChange={(e) => setEditingRow(prev => prev ? { ...prev, total: Number(e.target.value) } : null)}
                              className="w-24 bg-white border border-primary rounded p-1 text-xs text-right font-mono font-bold"
                            />
                          ) : (
                            <span className="font-bold text-on-surface">₦{calculatedSum.toLocaleString()}</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-3 py-2.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isEditing ? (
                              <>
                                <button 
                                  onClick={handleSaveEdit}
                                  className="px-2 py-1 bg-primary text-on-primary rounded text-[10px] font-bold uppercase hover:bg-primary/90 transition cursor-pointer"
                                >
                                  Save
                                </button>
                                <button 
                                  onClick={() => setEditingRow(null)}
                                  className="px-2 py-1 bg-surface-container text-on-surface-variant rounded text-[10px] font-bold uppercase hover:bg-surface-container-high transition cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button 
                                  onClick={() => setEditingRow({ ...record })}
                                  className="p-1 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded transition cursor-pointer"
                                  title="Edit row"
                                >
                                  <Edit3 size={13} />
                                </button>
                                {record.status === 'warning' && (
                                  <button 
                                    onClick={() => handleBypassWarning(record.id)}
                                    className="px-1.5 py-0.5 bg-secondary-container text-on-secondary-container text-[8px] font-bold rounded uppercase hover:bg-secondary-container/80 transition cursor-pointer"
                                  >
                                    Bypass
                                  </button>
                                )}
                                <button 
                                  onClick={() => handleDeleteRow(record.id, record.name)}
                                  className="p-1 text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded transition cursor-pointer"
                                  title="Delete row"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {displayRows.length === 0 && (
                    <tr>
                      <td colSpan={11} className="text-center py-12 text-on-surface-variant">
                        No records match the current filter or search query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Stepper Footer Controls */}
            <div className="p-4 sm:p-5 bg-surface-container-low border-t border-outline-variant flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2.5 bg-white border border-outline-variant hover:bg-surface-container rounded-xl text-xs font-bold text-on-surface transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>← Back to Step 1: Upload</span>
              </button>

              <div className="flex items-center gap-2">
                {errorCount > 0 && (
                  <button
                    onClick={handleAutoBalanceAllMismatches}
                    className="px-4 py-2.5 bg-secondary-container hover:bg-secondary-container/80 text-on-secondary-container border border-secondary/30 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Wand2 size={14} className="text-secondary" />
                    <span>Auto-Balance ({errorCount})</span>
                  </button>
                )}
                <button
                  onClick={() => setCurrentStep(3)}
                  className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-on-primary rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Proceed to Step 3: Confirm & Push</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* STEP 3: CONFIRM & PUSH */}
      {currentStep === 3 && (
        <motion.div
          key="step-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="space-y-6"
        >
          {/* Preflight Summary Banner */}
          <div className="bg-white border border-outline-variant rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-outline-variant">
              <div>
                <span className="text-[10px] bg-primary-container text-on-primary-container font-bold px-2.5 py-0.5 rounded uppercase tracking-wider font-label">
                  Step 3 Certification
                </span>
                <h3 className="text-2xl font-bold text-on-surface font-headline mt-1">Pre-Push Ledger Certification</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Review finalized deduction distribution across accounts before directly updating member passbooks.
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Total Ingestion Pool</span>
                <p className="text-3xl font-bold text-primary font-headline">₦{totalPoolSum.toLocaleString()}</p>
                <p className="text-xs text-on-surface-variant font-medium">{importedRecords.length} member accounts affected</p>
              </div>
            </div>

            {/* Target Month Posting Notice */}
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-on-surface">
                  Posting to Cycle: <span className="text-primary font-extrabold">{activeMonth}</span>
                </p>
                <p className="text-[11px] text-on-surface-variant mt-0.5">
                  After pushing, every member will see their respective breakdown for <strong>{activeMonth}</strong> in their personal user interface under "Monthly Passbook" and can view/print their official deduction advice slip.
                </p>
              </div>
            </div>

            {/* Allocation breakdown grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant">
                <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Ordinary Savings</span>
                <p className="text-sm font-bold text-on-surface font-mono mt-0.5">₦{ordSavingsSum.toLocaleString()}</p>
              </div>
              <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant">
                <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Special Savings</span>
                <p className="text-sm font-bold text-on-surface font-mono mt-0.5">₦{specSavingsSum.toLocaleString()}</p>
              </div>
              <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant">
                <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Investment Capital</span>
                <p className="text-sm font-bold text-on-surface font-mono mt-0.5">₦{investSum.toLocaleString()}</p>
              </div>
              <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant">
                <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Commodity Purchase</span>
                <p className="text-sm font-bold text-on-surface font-mono mt-0.5">₦{commoditySum.toLocaleString()}</p>
              </div>
              <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant">
                <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Muslim Community</span>
                <p className="text-sm font-bold text-on-surface font-mono mt-0.5">₦{mcaSum.toLocaleString()}</p>
              </div>
              <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant">
                <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Loan Reimbursement</span>
                <p className="text-sm font-bold text-on-surface font-mono mt-0.5">₦{loanRepaySum.toLocaleString()}</p>
              </div>
            </div>

            {/* Checklist Verification */}
            <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant space-y-2">
              <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider font-label">Pre-Deployment Audit Checklist</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
                <div className="flex items-center gap-2 text-tertiary">
                  <CheckCircle2 size={16} />
                  <span>Column Aliases & Headers Normalized</span>
                </div>
                <div className={`flex items-center gap-2 ${errorCount === 0 ? 'text-tertiary' : 'text-error'}`}>
                  {errorCount === 0 ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                  <span>{errorCount === 0 ? 'Mathematical Splits Balanced' : `${errorCount} Discrepancies Flagged`}</span>
                </div>
                <div className="flex items-center gap-2 text-tertiary">
                  <CheckCircle2 size={16} />
                  <span>Audit Trail Logs Prepared</span>
                </div>
              </div>
            </div>

            {/* Execution Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-outline-variant">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2.5 bg-white border border-outline-variant hover:bg-surface-container rounded-xl text-xs font-bold text-on-surface transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>← Back to Step 2: Review</span>
              </button>

              <div className="flex items-center gap-3">
                {pushStatus === 'pushing' ? (
                  <div className="flex items-center gap-3 px-6 py-3 bg-primary-container text-on-primary-container rounded-xl text-xs font-bold">
                    <RefreshCcw size={16} className="animate-spin text-primary" />
                    <span>Pushing Allocations ({pushProgress}%)...</span>
                  </div>
                ) : pushStatus === 'success' ? (
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 px-6 py-3 bg-tertiary text-on-tertiary rounded-xl text-xs font-bold">
                      <CheckCircle size={16} />
                      <span>Successfully Pushed to All Member Ledgers!</span>
                    </div>
                    {nextSheetName && (
                      <button
                        type="button"
                        onClick={() => {
                          onSwitchSheet?.(nextSheetName);
                          setCurrentStep(1);
                        }}
                        className="px-5 py-3 bg-secondary text-on-secondary hover:bg-secondary/90 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-xs"
                      >
                        <span>Load Next Sheet: {nextSheetName}</span>
                        <ArrowRight size={15} />
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    id="btn-confirm-and-push-stepper"
                    onClick={() => handlePushToMembers(false)}
                    disabled={importedRecords.length === 0}
                    className={`px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all cursor-pointer shadow-sm ${
                      importedRecords.length === 0
                        ? 'bg-surface-container text-outline cursor-not-allowed'
                        : errorCount > 0
                        ? 'bg-secondary hover:bg-secondary/90 text-on-secondary shadow-secondary/20'
                        : 'bg-primary hover:bg-primary/90 text-on-primary shadow-primary/20'
                    }`}
                  >
                    <Sparkles size={16} />
                    <span>Approve & Push Directly to Member Ledgers</span>
                    {errorCount > 0 && (
                      <span className="ml-1 px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-black">
                        Auto-Balance & Push
                      </span>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
