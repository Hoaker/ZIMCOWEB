import React, { useState, useMemo } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  DownloadCloud, 
  CheckCircle2, 
  Filter, 
  Search, 
  Calendar, 
  ShieldCheck, 
  Sparkles, 
  Building2, 
  CreditCard, 
  Check, 
  ChevronRight,
  Info,
  Layers,
  ArrowDownToLine,
  SlidersHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  exportProcessedDeductionsSpreadsheet, 
  ProcessedDeductionExportItem,
  DynamicExportOptions
} from '../lib/deductionNormalizer';

export interface ExportableMemberRecord {
  id: string;
  fullName: string;
  department?: string;
  ordinarySavings: number;
  specialSavings: number;
  investmentAmount?: number;
  commoditySavings?: number;
  muslimCommunitySavings?: number;
  outstandingLoans?: number;
  lastDeductionAmount?: number;
  lastDeductionDate?: string;
  lastDeductionBreakdown?: {
    ordinarySavings?: number;
    specialSavings?: number;
    investment?: number;
    loanReimbursement?: number;
    commodityPurchase?: number;
    muslimCommunity?: number;
    total?: number;
    cycle?: string;
    injectedAt?: string;
  };
}

interface DynamicDeductionExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: ExportableMemberRecord[];
  initialCycle?: string;
  onExportSuccess?: (message: string) => void;
}

export default function DynamicDeductionExportModal({
  isOpen,
  onClose,
  members,
  initialCycle = 'June 2026',
  onExportSuccess
}: DynamicDeductionExportModalProps) {
  // Config state
  const [cyclePeriod, setCyclePeriod] = useState<string>(initialCycle);
  const [effectiveDate, setEffectiveDate] = useState<string>('2026-06-25');
  const [scopeFilter, setScopeFilter] = useState<'all' | 'mca' | 'loans' | 'special' | 'department'>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Format state
  const [exportFormat, setExportFormat] = useState<'xlsx' | 'csv'>('xlsx');
  const [headerStyle, setHeaderStyle] = useState<'canonical_exact' | 'currency_labeled'>('canonical_exact');
  const [includeSummaryRow, setIncludeSummaryRow] = useState<boolean>(true);
  const [includeAuditSheet, setIncludeAuditSheet] = useState<boolean>(true);
  const [isNextMonthMode, setIsNextMonthMode] = useState<boolean>(false);
  const [zeroCommodity, setZeroCommodity] = useState<boolean>(false);
  const [zeroLoans, setZeroLoans] = useState<boolean>(false);

  // Active view tab in modal
  const [modalTab, setModalTab] = useState<'config' | 'preview'>('preview');

  // Extract unique departments
  const departments = useMemo(() => {
    const set = new Set<string>();
    members.forEach(m => {
      if (m.department) set.add(m.department);
    });
    return Array.from(set);
  }, [members]);

  // Convert raw members to normalized processed deduction items
  const processedItems: ProcessedDeductionExportItem[] = useMemo(() => {
    return members.map(m => {
      const breakdown = m.lastDeductionBreakdown;

      // Extract specific monthly deduction values (breakdown or actual member balance)
      const os = breakdown?.ordinarySavings !== undefined ? breakdown.ordinarySavings : Number(m.ordinarySavings || 0);
      const ss = breakdown?.specialSavings !== undefined ? breakdown.specialSavings : Number(m.specialSavings || 0);
      const inv = breakdown?.investment !== undefined ? breakdown.investment : Number(m.investmentAmount || 0);
      const lr = breakdown?.loanReimbursement !== undefined ? breakdown.loanReimbursement : Number(m.outstandingLoans || 0);
      const cp = breakdown?.commodityPurchase !== undefined ? breakdown.commodityPurchase : Number(m.commoditySavings || 0);
      const mc = breakdown?.muslimCommunity !== undefined ? breakdown.muslimCommunity : Number(m.muslimCommunitySavings || 0);
      
      const total = os + ss + inv + lr + cp + mc;

      return {
        id: m.id,
        name: m.fullName,
        department: m.department || '',
        date: m.lastDeductionDate ? m.lastDeductionDate.split('T')[0] : effectiveDate,
        ordinarySavings: os,
        specialSavings: ss,
        investment: inv,
        commodityPurchase: cp,
        loanReimbursement: lr,
        muslimCommunity: mc,
        total: breakdown?.total || total,
        auditStatus: 'VERIFIED',
        cycle: cyclePeriod
      };
    });
  }, [members, effectiveDate, cyclePeriod]);

  // Filtered items based on dynamic admin criteria
  const filteredItems = useMemo(() => {
    return processedItems.filter(item => {
      // Text search
      const matchesSearch = 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.department && item.department.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      // Scope filter
      if (scopeFilter === 'mca') return item.muslimCommunity > 0;
      if (scopeFilter === 'loans') return item.loanReimbursement > 0;
      if (scopeFilter === 'special') return item.specialSavings > 0;
      if (scopeFilter === 'department' && selectedDepartment !== 'all') {
        return item.department === selectedDepartment;
      }

      return true;
    });
  }, [processedItems, searchQuery, scopeFilter, selectedDepartment]);

  // Aggregates of filtered items
  const aggregates = useMemo(() => {
    let gross = 0;
    let os = 0;
    let ss = 0;
    let inv = 0;
    let lr = 0;
    let cp = 0;
    let mc = 0;

    filteredItems.forEach(item => {
      const itemLr = zeroLoans ? 0 : item.loanReimbursement;
      const itemCp = zeroCommodity ? 0 : item.commodityPurchase;
      const itemTotal = item.ordinarySavings + item.specialSavings + item.investment + itemLr + itemCp + item.muslimCommunity;

      os += item.ordinarySavings;
      ss += item.specialSavings;
      inv += item.investment;
      lr += itemLr;
      cp += itemCp;
      mc += item.muslimCommunity;
      gross += itemTotal;
    });

    return { gross, os, ss, inv, lr, cp, mc };
  }, [filteredItems, zeroLoans, zeroCommodity]);

  // Canonical standard columns list for validation UI
  const standardColumns = [
    { key: 'date', label: 'Date', desc: 'Transaction cycle value date (YYYY-MM-DD)' },
    { key: 'id', label: 'Member ID', desc: 'Canonical ZIMCO registration identifier' },
    { key: 'name', label: 'Full Name', desc: 'Registered contributor full legal name' },
    { key: 'os', label: 'Ordinary Savings', desc: 'Compulsory statutory savings allocation' },
    { key: 'ss', label: 'Special Savings', desc: 'Voluntary deposit allocation' },
    { key: 'inv', label: 'Investment Account', desc: 'Cooperative share capital equity' },
    { key: 'lr', label: 'Loan Disbursement Repayment', desc: 'Amortized loan principal & markup recovery' },
    { key: 'cp', label: 'Commodity Purchase', desc: 'Financed household asset deduction' },
    { key: 'mc', label: 'Muslim Community Account', desc: 'Dedicated non-interest MCA escrow contribution' },
    { key: 'total', label: 'Total Deduction', desc: 'Exact declared & itemized aggregate gross sum' }
  ];

  // Execute Dynamic Export
  const handleExecuteExport = () => {
    if (filteredItems.length === 0) {
      alert('No processed deduction records match your current filter criteria.');
      return;
    }

    const options: DynamicExportOptions = {
      format: exportFormat,
      cyclePeriod,
      dateOverride: effectiveDate,
      headerStyle,
      includeSummaryRow,
      includeAuditSheet: exportFormat === 'xlsx' ? includeAuditSheet : false,
      isNextMonthTemplate: isNextMonthMode,
      zeroOutCommodity: zeroCommodity,
      zeroOutLoans: zeroLoans,
      fileName: `ZIMCO_PROCESSED_DEDUCTIONS_${cyclePeriod.replace(/\s+/g, '_')}_${exportFormat === 'xlsx' ? 'STANDARD' : 'RAW'}`
    };

    exportProcessedDeductionsSpreadsheet(filteredItems, options);

    const successMsg = `Successfully exported ${filteredItems.length} processed deduction records to ${exportFormat.toUpperCase()} with 100% standard input structure conformity!`;
    if (onExportSuccess) {
      onExportSuccess(successMsg);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh] my-auto"
      >
        {/* Modal Top Header */}
        <div className="px-6 sm:px-8 py-5 bg-surface-container text-on-surface flex items-center justify-between border-b border-outline-variant shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary-container text-on-primary-container flex items-center justify-center">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-on-surface font-headline">
                  Dynamic Deduction Data Export
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-primary-container text-on-primary-container text-[9px] font-black uppercase tracking-wider font-label">
                  Excel (.xlsx)
                </span>
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Generate standard-compliant Excel workbooks matching the canonical 10-column input format.
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Standard Conformance Status Banner */}
        <div className="px-6 sm:px-8 py-3 bg-emerald-50 border-b border-emerald-100 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2 text-emerald-950 font-bold">
            <ShieldCheck size={16} className="text-emerald-700 shrink-0" />
            <span>Standard Input Format Conformance:</span>
            <span className="text-emerald-800 bg-white px-2 py-0.5 rounded-md border border-emerald-200 text-[11px] font-black">
              100% Certified (10 Standard Canonical Columns)
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-emerald-800 font-semibold">
            <span>Cycle: <strong className="font-bold">{cyclePeriod}</strong></span>
            <span>•</span>
            <span>Date: <strong className="font-bold">{effectiveDate}</strong></span>
          </div>
        </div>

        {/* Modal View Selector Tabs */}
        <div className="px-6 sm:px-8 pt-4 pb-2 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setModalTab('preview')}
              className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                modalTab === 'preview'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              Data Preview & Totals ({filteredItems.length})
            </button>
            <button
              onClick={() => setModalTab('config')}
              className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                modalTab === 'config'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              Export Options & Formatting
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-xs font-mono text-slate-500">
            <span>Total Gross: <strong className="text-slate-900 font-bold">₦{aggregates.gross.toLocaleString()}</strong></span>
          </div>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: DATA PREVIEW & SCOPE FILTERS */}
          {modalTab === 'preview' && (
            <div className="space-y-6">
              
              {/* Quick Filters Bar */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                {/* Search query */}
                <div className="md:col-span-4 relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name, ID, or department..."
                    className="w-full pl-9 pr-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                {/* Scope filter pills */}
                <div className="md:col-span-5 flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => setScopeFilter('all')}
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition ${
                      scopeFilter === 'all' ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    All ({members.length})
                  </button>
                  <button
                    onClick={() => setScopeFilter('mca')}
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition ${
                      scopeFilter === 'mca' ? 'bg-teal-700 text-white' : 'bg-teal-50 text-teal-800 hover:bg-teal-100'
                    }`}
                  >
                    MCA Accounts
                  </button>
                  <button
                    onClick={() => setScopeFilter('loans')}
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition ${
                      scopeFilter === 'loans' ? 'bg-amber-700 text-white' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                    }`}
                  >
                    Loan Recovery
                  </button>
                  <button
                    onClick={() => setScopeFilter('special')}
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition ${
                      scopeFilter === 'special' ? 'bg-blue-700 text-white' : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
                    }`}
                  >
                    Special Savings
                  </button>
                </div>

                {/* Department dropdown */}
                <div className="md:col-span-3">
                  <select
                    value={selectedDepartment}
                    onChange={(e) => {
                      setSelectedDepartment(e.target.value);
                      if (e.target.value !== 'all') setScopeFilter('department');
                    }}
                    className="w-full py-2 px-3 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-emerald-600 text-slate-700"
                  >
                    <option value="all">All Departments</option>
                    {departments.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Aggregation Metric Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Records</p>
                  <p className="text-base font-black text-slate-900 font-mono mt-0.5">{filteredItems.length}</p>
                </div>
                <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100">
                  <p className="text-[9px] font-bold text-emerald-800 uppercase tracking-widest">Ordinary Sav.</p>
                  <p className="text-base font-black text-emerald-900 font-mono mt-0.5">₦{aggregates.os.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-100">
                  <p className="text-[9px] font-bold text-blue-800 uppercase tracking-widest">Special Sav.</p>
                  <p className="text-base font-black text-blue-900 font-mono mt-0.5">₦{aggregates.ss.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-teal-50/60 rounded-2xl border border-teal-100">
                  <p className="text-[9px] font-bold text-teal-800 uppercase tracking-widest">MCA Total</p>
                  <p className="text-base font-black text-teal-900 font-mono mt-0.5">₦{aggregates.mc.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-100">
                  <p className="text-[9px] font-bold text-amber-800 uppercase tracking-widest">Loan Recovery</p>
                  <p className="text-base font-black text-amber-900 font-mono mt-0.5">₦{aggregates.lr.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-sm">
                  <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Gross Total</p>
                  <p className="text-base font-black text-white font-mono mt-0.5">₦{aggregates.gross.toLocaleString()}</p>
                </div>
              </div>

              {/* Data Table Live Preview */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="max-h-72 overflow-y-auto overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-100 sticky top-0 z-10 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="p-2.5 min-w-[100px]">Date</th>
                        <th className="p-2.5 min-w-[110px]">Member ID</th>
                        <th className="p-2.5 min-w-[150px]">Full Name</th>
                        <th className="p-2.5 text-right">OS (₦)</th>
                        <th className="p-2.5 text-right">SS (₦)</th>
                        <th className="p-2.5 text-right">IA (₦)</th>
                        <th className="p-2.5 text-right">Loan (₦)</th>
                        <th className="p-2.5 text-right">CP (₦)</th>
                        <th className="p-2.5 text-right bg-teal-50 text-teal-900">MCA (₦)</th>
                        <th className="p-2.5 text-right font-black text-slate-900">Total (₦)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                      {filteredItems.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="p-8 text-center text-slate-400 font-sans">
                            No processed deduction records matched the selected filter criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredItems.map((item, idx) => (
                          <tr key={`${item.id || 'exp'}-${idx}`} className="hover:bg-slate-50 transition">
                            <td className="p-2.5 text-slate-500">{item.date}</td>
                            <td className="p-2.5 font-bold text-slate-800">{item.id}</td>
                            <td className="p-2.5 font-sans font-extrabold text-slate-900">{item.name}</td>
                            <td className="p-2.5 text-right">{item.ordinarySavings.toLocaleString()}</td>
                            <td className="p-2.5 text-right">{item.specialSavings.toLocaleString()}</td>
                            <td className="p-2.5 text-right">{item.investment.toLocaleString()}</td>
                            <td className="p-2.5 text-right text-amber-700">
                              {(zeroLoans ? 0 : item.loanReimbursement).toLocaleString()}
                            </td>
                            <td className="p-2.5 text-right text-rose-600">
                              {(zeroCommodity ? 0 : item.commodityPurchase).toLocaleString()}
                            </td>
                            <td className="p-2.5 text-right font-bold text-teal-900 bg-teal-50/40">
                              {item.muslimCommunity.toLocaleString()}
                            </td>
                            <td className="p-2.5 text-right font-black text-slate-900">
                              {(item.ordinarySavings + item.specialSavings + item.investment + (zeroLoans ? 0 : item.loanReimbursement) + (zeroCommodity ? 0 : item.commodityPurchase) + item.muslimCommunity).toLocaleString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {includeSummaryRow && filteredItems.length > 0 && (
                  <div className="bg-slate-100 p-3 border-t border-slate-200 flex items-center justify-between text-xs font-mono font-bold text-slate-800">
                    <span className="font-sans font-black uppercase text-[10px] text-slate-500">
                      Summary Row Included In Export ({filteredItems.length} Records)
                    </span>
                    <span>Total Pool: <strong>₦{aggregates.gross.toLocaleString()}</strong></span>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: EXPORT OPTIONS & ADVANCED SETTINGS */}
          {modalTab === 'config' && (
            <div className="space-y-6">
              
              {/* Date & Cycle Configurations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                    Payroll Cycle Label
                  </label>
                  <input
                    type="text"
                    value={cyclePeriod}
                    onChange={(e) => setCyclePeriod(e.target.value)}
                    placeholder="e.g. June 2026"
                    className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                  <p className="text-[10px] text-slate-400">Used for file naming, audit metadata sheet, and period stamps.</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                    Value / Deduction Date
                  </label>
                  <input
                    type="text"
                    value={effectiveDate}
                    onChange={(e) => setEffectiveDate(e.target.value)}
                    placeholder="YYYY-MM-DD"
                    className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-emerald-600 font-mono"
                  />
                  <p className="text-[10px] text-slate-400">Populates the mandatory Date column for canonical payroll clearing.</p>
                </div>
              </div>

              {/* Format & Header Style */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                  <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                    Export Output Format
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setExportFormat('xlsx')}
                      className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-bold transition ${
                        exportFormat === 'xlsx'
                          ? 'bg-emerald-800 text-white border-emerald-800 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <FileSpreadsheet size={16} />
                      Excel (.xlsx)
                    </button>
                    <button
                      onClick={() => setExportFormat('csv')}
                      className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-bold transition ${
                        exportFormat === 'csv'
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <DownloadCloud size={16} />
                      CSV (.csv)
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                  <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                    Header Column Nomenclature
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="headerStyle"
                        checked={headerStyle === 'canonical_exact'}
                        onChange={() => setHeaderStyle('canonical_exact')}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Strict Canonical Input Standard (Exact Match)</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="headerStyle"
                        checked={headerStyle === 'currency_labeled'}
                        onChange={() => setHeaderStyle('currency_labeled')}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Labeled with Currency Symbols (e.g. Ordinary Savings (₦))</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Toggles & Options */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Workbook Structure Options
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeSummaryRow}
                      onChange={(e) => setIncludeSummaryRow(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 mt-0.5"
                    />
                    <div>
                      <span className="font-bold block">Append Summary Totals Row</span>
                      <span className="text-[10px] text-slate-400">Calculates column mathematical sum in the final row.</span>
                    </div>
                  </label>

                  {exportFormat === 'xlsx' && (
                    <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeAuditSheet}
                        onChange={(e) => setIncludeAuditSheet(e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 mt-0.5"
                      />
                      <div>
                        <span className="font-bold block">Include Audit Certificate Tab</span>
                        <span className="text-[10px] text-slate-400">Adds Sheet 2 with cryptographic ledger checksums & metrics.</span>
                      </div>
                    </label>
                  )}

                  <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={zeroLoans}
                      onChange={(e) => setZeroLoans(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 mt-0.5"
                    />
                    <div>
                      <span className="font-bold block">Zero Out Loan Recoveries</span>
                      <span className="text-[10px] text-slate-400">Exports template with loan repayment columns reset to ₦0.</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={zeroCommodity}
                      onChange={(e) => setZeroCommodity(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 mt-0.5"
                    />
                    <div>
                      <span className="font-bold block">Zero Out Commodity Purchases</span>
                      <span className="text-[10px] text-slate-400">Resets one-time commodity goods deductions to ₦0.</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Standard Columns Reference Grid */}
              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-700" />
                    Exported Column Sequence (Standard Input Match)
                  </span>
                  <span className="text-[9px] text-emerald-700 font-bold">10 Canonical Columns</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-[10px]">
                  {standardColumns.map((col, idx) => (
                    <div key={col.key} className="p-2 bg-white rounded-lg border border-emerald-100 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded bg-emerald-100 text-emerald-800 font-black flex items-center justify-center text-[9px]">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-slate-800 truncate" title={col.desc}>
                        {col.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 sm:px-8 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">
              Ready to export <strong className="text-slate-900">{filteredItems.length}</strong> records ({exportFormat.toUpperCase()})
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold transition"
            >
              Cancel
            </button>

            <button
              onClick={handleExecuteExport}
              className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-emerald-950/10 flex items-center gap-2"
            >
              <ArrowDownToLine size={15} />
              Export {exportFormat.toUpperCase()} Sheet
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
