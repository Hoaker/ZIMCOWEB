import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  ArrowLeft, 
  FileText, 
  Printer, 
  FileDown, 
  CheckCircle2, 
  Search, 
  TrendingUp, 
  ArrowUpDown, 
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  Layers,
  Building2,
  Wallet,
  Sparkles
} from 'lucide-react';
import { MonthlySavingsRecordItem, MonthlySavingsPassbookTable } from '../MonthlySavingsPassbookTable';
import { MonthlyDeductionSlipModal } from './MonthlyDeductionSlipModal';
import { MemberViewType } from './MemberSidebar';

interface MonthlyRecordsDedicatedViewProps {
  memberData: any;
  monthlySavingsRecords: MonthlySavingsRecordItem[];
  onBackToOverview: () => void;
  onNavigateView: (view: MemberViewType) => void;
  onDownloadPDF: (scopeAccount?: string) => void;
  isDownloadingPDF: boolean;
}

export const MonthlyRecordsDedicatedView: React.FC<MonthlyRecordsDedicatedViewProps> = ({
  memberData,
  monthlySavingsRecords,
  onBackToOverview,
  onNavigateView,
  onDownloadPDF,
  isDownloadingPDF
}) => {
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>('all');
  const [sortAscending, setSortAscending] = useState<boolean>(true);
  const [expandedMonthKey, setExpandedMonthKey] = useState<string | null>(null);
  const [activeSlipRecord, setActiveSlipRecord] = useState<MonthlySavingsRecordItem | null>(null);

  const formatCurrency = (val: number) => {
    return `₦${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Sort records
  const sortedRecords = useMemo(() => {
    const MONTH_ORDER: Record<string, number> = {
      'january': 1, 'february': 2, 'march': 3, 'april': 4, 'may': 5, 'june': 6,
      'july': 7, 'august': 8, 'september': 9, 'october': 10, 'november': 11, 'december': 12
    };

    const copy = [...monthlySavingsRecords];
    copy.sort((a, b) => {
      const getScore = (item: any) => {
        const lower = String(item.month || item.cycle || '').toLowerCase();
        const yrMatch = lower.match(/20\d\d/);
        const yr = yrMatch ? parseInt(yrMatch[0], 10) : 2026;
        let mScore = 99;
        for (const [mName, mNum] of Object.entries(MONTH_ORDER)) {
          if (lower.includes(mName)) {
            mScore = mNum;
            break;
          }
        }
        return yr * 100 + mScore;
      };
      const diff = getScore(a) - getScore(b);
      return sortAscending ? diff : -diff;
    });

    return copy;
  }, [monthlySavingsRecords, sortAscending]);

  // Filtered by selected month if not 'all'
  const displayedRecords = useMemo(() => {
    if (selectedMonthFilter === 'all') return sortedRecords;
    return sortedRecords.filter(r => r.month === selectedMonthFilter || r.cycle === selectedMonthFilter);
  }, [sortedRecords, selectedMonthFilter]);

  // Aggregate stats for the currently selected filter
  const stats = useMemo(() => {
    const recsToSum = selectedMonthFilter === 'all' ? monthlySavingsRecords : displayedRecords;
    const totalDeducted = recsToSum.reduce((acc, r) => acc + (Number(r.total) || 0), 0);
    const ordSum = recsToSum.reduce((acc, r) => acc + (Number(r.ordinarySavings) || 0), 0);
    const specSum = recsToSum.reduce((acc, r) => acc + (Number(r.specialSavings) || 0), 0);
    const investSum = recsToSum.reduce((acc, r) => acc + (Number(r.investment) || 0), 0);
    const commoditySum = recsToSum.reduce((acc, r) => acc + (Number(r.commodityPurchase) || 0), 0);
    const mcaSum = recsToSum.reduce((acc, r) => acc + (Number(r.muslimCommunity) || 0), 0);
    const loanRepaySum = recsToSum.reduce((acc, r) => acc + (Number(r.loanReimbursement) || 0), 0);

    return {
      totalDeducted,
      ordSum,
      specSum,
      investSum,
      commoditySum,
      mcaSum,
      loanRepaySum,
      cycleCount: recsToSum.length
    };
  }, [monthlySavingsRecords, displayedRecords, selectedMonthFilter]);

  // List of unique months for the selector pills
  const availableMonths = useMemo(() => {
    return Array.from(new Set(monthlySavingsRecords.map(r => r.month).filter(Boolean)));
  }, [monthlySavingsRecords]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToOverview}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-semibold border border-outline-variant/50 transition cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Back to Overview</span>
          </button>
          <span className="text-xs text-on-surface-variant">/</span>
          <span className="text-xs font-bold text-on-surface">Monthly Accounts Passbook</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onDownloadPDF('Monthly Passbook')}
            disabled={isDownloadingPDF}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface border border-outline-variant/60 text-xs font-bold transition cursor-pointer"
          >
            <FileDown size={14} className="text-primary" />
            <span>{isDownloadingPDF ? 'Generating...' : 'Export PDF Statement'}</span>
          </button>
        </div>
      </div>

      {/* Header Hero Banner with Month-by-Month Focus */}
      <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase tracking-wider border border-emerald-200">
                Audited Monthly Ledger
              </span>
              <span className="text-xs text-on-surface-variant font-mono">
                {monthlySavingsRecords.length} Monthly Cycles Verified
              </span>
            </div>

            <h1 className="font-headline text-2xl sm:text-3xl lg:text-4xl font-extrabold text-on-surface tracking-tight">
              {selectedMonthFilter === 'all' ? 'Month-by-Month Passbook Records' : `${selectedMonthFilter} Account Deductions`}
            </h1>
            
            <p className="text-xs sm:text-sm text-on-surface-variant">
              Every salary deduction pushed by the Bursary is recorded month by month. Inspect monthly savings allocations, loan repayments, and running account balances.
            </p>
          </div>

          {/* Month Deduction Summary Card */}
          <div className="bg-surface-container-low border border-outline-variant/50 rounded-2xl p-5 shrink-0 min-w-[240px]">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
              {selectedMonthFilter === 'all' ? 'Total Deductions Recorded' : `${selectedMonthFilter} Total Deducted`}
            </span>
            <div className="font-headline text-2xl sm:text-3xl font-extrabold text-primary font-mono">
              {formatCurrency(stats.totalDeducted)}
            </div>
            <div className="text-[11px] text-on-surface-variant mt-2 flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-emerald-700" />
              <span>Certified across {stats.cycleCount} monthly cycles</span>
            </div>
          </div>
        </div>
      </div>

      {/* Month Selector Filter Bar */}
      <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-headline font-bold text-sm text-on-surface">
              Filter Records By Month
            </h3>
            <p className="text-xs text-on-surface-variant">
              Select a specific cycle or view the entire chronological progression
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSortAscending(!sortAscending)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface border border-outline-variant/60 text-xs font-bold transition cursor-pointer"
            >
              <ArrowUpDown size={13} />
              <span>{sortAscending ? 'Jan → Dec (Ascending)' : 'Dec → Jan (Descending)'}</span>
            </button>
          </div>
        </div>

        {/* Month Pills List */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => setSelectedMonthFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              selectedMonthFilter === 'all'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'bg-surface-container-low hover:bg-surface-container text-on-surface border border-outline-variant/50'
            }`}
          >
            All Recorded Months ({monthlySavingsRecords.length})
          </button>

          {availableMonths.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setSelectedMonthFilter(m)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedMonthFilter === m
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container-low hover:bg-surface-container text-on-surface border border-outline-variant/50'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Account Distribution for the Chosen Month(s) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-headline font-bold text-sm sm:text-base text-on-surface">
            {selectedMonthFilter === 'all' ? 'All-Time Account Allocations' : `Account Allocations for ${selectedMonthFilter}`}
          </h2>
          <span className="text-xs text-on-surface-variant">
            {stats.cycleCount} {stats.cycleCount === 1 ? 'month' : 'months'} included
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-4">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase block">Ordinary Savings</span>
            <p className="font-headline text-base sm:text-lg font-bold text-on-surface font-mono mt-1">
              {formatCurrency(stats.ordSum)}
            </p>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-4">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase block">Special Savings</span>
            <p className="font-headline text-base sm:text-lg font-bold text-on-surface font-mono mt-1">
              {formatCurrency(stats.specSum)}
            </p>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-4">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase block">Investment Account</span>
            <p className="font-headline text-base sm:text-lg font-bold text-on-surface font-mono mt-1">
              {formatCurrency(stats.investSum)}
            </p>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-4">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase block">Commodity Purchase</span>
            <p className="font-headline text-base sm:text-lg font-bold text-on-surface font-mono mt-1">
              {formatCurrency(stats.commoditySum)}
            </p>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-4">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase block">Muslim Community</span>
            <p className="font-headline text-base sm:text-lg font-bold text-on-surface font-mono mt-1">
              {formatCurrency(stats.mcaSum)}
            </p>
          </div>

          <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4">
            <span className="text-[10px] font-bold text-emerald-800 uppercase block">Total Deductions</span>
            <p className="font-headline text-base sm:text-lg font-extrabold text-emerald-950 font-mono mt-1">
              {formatCurrency(stats.totalDeducted)}
            </p>
          </div>
        </div>
      </div>

      {/* Primary Month-by-Month Passbook Table */}
      <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant/40 pb-4">
          <div>
            <h2 className="font-headline font-bold text-base sm:text-lg text-on-surface">
              Month-by-Month Passbook Ledger
            </h2>
            <p className="text-xs text-on-surface-variant">
              Click on any row to expand the itemized breakdown, or click 'Slip' to view and print the official advice slip.
            </p>
          </div>
        </div>

        <MonthlySavingsPassbookTable
          records={displayedRecords}
          expandedMonthKey={expandedMonthKey}
          onToggleExpand={(key) => setExpandedMonthKey(prev => prev === key ? null : key)}
          sortAscending={sortAscending}
          onToggleSort={() => setSortAscending(!sortAscending)}
          onSwitchToAllActivity={() => onNavigateView('dashboard')}
          onViewSlip={(rec) => setActiveSlipRecord(rec)}
        />
      </div>

      {/* Official Monthly Deduction Slip Modal */}
      {activeSlipRecord && (
        <MonthlyDeductionSlipModal
          record={activeSlipRecord}
          memberData={memberData}
          onClose={() => setActiveSlipRecord(null)}
        />
      )}
    </div>
  );
};
