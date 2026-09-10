import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  ArrowLeft, 
  FileText, 
  FileDown, 
  CheckCircle2, 
  Search, 
  TrendingUp, 
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  Layers,
  Building2,
  Wallet,
  PiggyBank,
  Coins,
  ShoppingBag,
  Filter,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';
import { MonthlySavingsRecordItem } from '../MonthlySavingsPassbookTable';
import { MonthlyDeductionSlipModal } from './MonthlyDeductionSlipModal';
import { MemberViewType } from './MemberSidebar';

interface MemberYearlyRecordViewProps {
  memberData: any;
  transactions: any[];
  monthlySavingsRecords: MonthlySavingsRecordItem[];
  onBackToOverview: () => void;
  onNavigateView: (view: MemberViewType) => void;
  onDownloadPDF: (scopeAccount?: string) => void;
  isDownloadingPDF: boolean;
}

export const MemberYearlyRecordView: React.FC<MemberYearlyRecordViewProps> = ({
  memberData,
  transactions = [],
  monthlySavingsRecords = [],
  onBackToOverview,
  onNavigateView,
  onDownloadPDF,
  isDownloadingPDF
}) => {
  const currentYear = new Date().getFullYear();

  // Helper to extract 4-digit year from date or month string
  const extractYear = (val: string | number | undefined): number | null => {
    if (!val) return null;
    const str = String(val);
    const match = str.match(/\b(20\d{2})\b/);
    if (match) {
      return parseInt(match[1], 10);
    }
    return null;
  };

  // Discover all distinct years present in actual transactions, monthly cycles, or current year
  const availableYears = useMemo(() => {
    const yearSet = new Set<number>();
    yearSet.add(currentYear);
    yearSet.add(currentYear - 1); // e.g. 2025

    monthlySavingsRecords.forEach(r => {
      const yr = extractYear(r.month) || extractYear(r.cycle) || extractYear(r.date);
      if (yr && yr >= 2018 && yr <= currentYear + 2) {
        yearSet.add(yr);
      }
    });

    transactions.forEach(t => {
      const yr = extractYear(t.date) || extractYear(t.timestamp) || extractYear(t.createdAt);
      if (yr && yr >= 2018 && yr <= currentYear + 2) {
        yearSet.add(yr);
      }
    });

    // Default historical fallbacks if co-op historical data is needed
    [2024, 2023, 2022].forEach(y => yearSet.add(y));

    return Array.from(yearSet).sort((a, b) => b - a); // Descending (e.g. 2026, 2025, 2024...)
  }, [monthlySavingsRecords, transactions, currentYear]);

  const [selectedYear, setSelectedYear] = useState<number>(() => availableYears[0] || currentYear);
  const [accountFilter, setAccountFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeSlipRecord, setActiveSlipRecord] = useState<MonthlySavingsRecordItem | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'monthly_cycles' | 'transactions_feed'>('monthly_cycles');

  const formatCurrency = (val: number) => {
    return `₦${Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Filter monthly records strictly by the chosen year
  const yearMonthlyRecords = useMemo(() => {
    return monthlySavingsRecords.filter(r => {
      const yr = extractYear(r.month) || extractYear(r.cycle) || extractYear(r.date);
      // If no year found, default check if string includes selectedYear
      if (!yr) {
        return String(r.month || '').includes(String(selectedYear));
      }
      return yr === selectedYear;
    });
  }, [monthlySavingsRecords, selectedYear]);

  // Filter transactions strictly by the chosen year
  const yearTransactions = useMemo(() => {
    return transactions.filter(t => {
      const yr = extractYear(t.date) || extractYear(t.timestamp) || extractYear(t.createdAt);
      if (!yr) {
        return String(t.date || '').includes(String(selectedYear));
      }
      return yr === selectedYear;
    });
  }, [transactions, selectedYear]);

  // Compute live annual ledger totals directly from year records and transactions
  const yearSummary = useMemo(() => {
    // Totals from monthly savings cycles
    const totalOrdinarySavings = yearMonthlyRecords.reduce((acc, r) => acc + (Number(r.ordinarySavings) || 0), 0);
    const totalSpecialSavings = yearMonthlyRecords.reduce((acc, r) => acc + (Number(r.specialSavings) || 0), 0);
    const totalInvestment = yearMonthlyRecords.reduce((acc, r) => acc + (Number(r.investment) || 0), 0);
    const totalCommodity = yearMonthlyRecords.reduce((acc, r) => acc + (Number(r.commodityPurchase) || 0), 0);
    const totalMuslimCommunity = yearMonthlyRecords.reduce((acc, r) => acc + (Number(r.muslimCommunity) || 0), 0);
    const totalLoanRepayments = yearMonthlyRecords.reduce((acc, r) => acc + (Number(r.loanReimbursement) || 0), 0);
    const totalDeductions = yearMonthlyRecords.reduce((acc, r) => acc + (Number(r.total) || 0), 0);

    // Totals from direct transactions for this year
    let totalDirectCredits = 0;
    let totalDirectDebits = 0;

    yearTransactions.forEach(t => {
      const amt = typeof t.amount === 'number' ? t.amount : Number(String(t.amount || '').replace(/[^0-9.-]/g, '')) || 0;
      const type = (t.type || '').toLowerCase();
      if (type.includes('credit') || type.includes('deposit') || type.includes('topup') || type.includes('inflow')) {
        totalDirectCredits += amt;
      } else if (type.includes('debit') || type.includes('withdraw') || type.includes('payout')) {
        totalDirectDebits += amt;
      }
    });

    const netYearInflow = totalDeductions + totalDirectCredits - totalDirectDebits;

    return {
      totalOrdinarySavings,
      totalSpecialSavings,
      totalInvestment,
      totalCommodity,
      totalMuslimCommunity,
      totalLoanRepayments,
      totalDeductions,
      totalDirectCredits,
      totalDirectDebits,
      netYearInflow,
      cycleCount: yearMonthlyRecords.length,
      txCount: yearTransactions.length
    };
  }, [yearMonthlyRecords, yearTransactions]);

  // Filtered lists based on search and account type
  const filteredMonthlyRecords = useMemo(() => {
    let list = yearMonthlyRecords;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(r => 
        (r.month || '').toLowerCase().includes(q) || 
        (r.cycle || '').toLowerCase().includes(q) ||
        (r.date || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [yearMonthlyRecords, searchQuery]);

  const filteredTransactions = useMemo(() => {
    let list = yearTransactions;
    if (accountFilter !== 'all') {
      list = list.filter(t => (t.account || '').toLowerCase().includes(accountFilter.toLowerCase()));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(t => 
        (t.description || '').toLowerCase().includes(q) ||
        (t.account || '').toLowerCase().includes(q) ||
        (t.date || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [yearTransactions, accountFilter, searchQuery]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Breadcrumbs */}
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
          <span className="text-xs font-bold text-on-surface">Yearly Record & Statement</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onDownloadPDF(`Annual Statement - ${selectedYear}`)}
            disabled={isDownloadingPDF}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface border border-outline-variant/60 text-xs font-bold transition cursor-pointer"
          >
            <FileDown size={14} className="text-primary" />
            <span>{isDownloadingPDF ? 'Generating...' : `Export ${selectedYear} PDF Statement`}</span>
          </button>
        </div>
      </div>

      {/* Hero Card: Year Selector & Summary */}
      <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-outline-variant/50">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold border border-primary/20">
                Annual Member Ledger
              </span>
              <span className="text-xs text-on-surface-variant font-medium">
                Live Audited Statement
              </span>
            </div>
            <h1 className="font-headline text-2xl sm:text-3xl font-bold text-on-surface">
              {selectedYear} Annual Statement & Records
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
              Member ID: <strong className="text-on-surface">{memberData?.id || memberData?.memberId || 'Active Member'}</strong> • {memberData?.fullName || memberData?.name}
            </p>
          </div>

          {/* Year Selector Pills */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <span className="text-xs font-semibold text-on-surface-variant flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-primary" /> Select year:
            </span>
            <div className="flex flex-wrap gap-1.5 p-1 bg-surface-container-low rounded-xl border border-outline-variant/40">
              {availableYears.map(year => (
                <button
                  key={year}
                  type="button"
                  onClick={() => setSelectedYear(year)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-headline font-bold transition cursor-pointer ${
                    selectedYear === year
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Annual Breakdown Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 pt-6">
          <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/40">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-on-surface-variant mb-1">
              <PiggyBank className="w-3.5 h-3.5 text-primary" />
              <span>Ordinary (OS)</span>
            </div>
            <p className="font-headline font-bold text-base sm:text-lg text-on-surface">
              {formatCurrency(yearSummary.totalOrdinarySavings)}
            </p>
            <span className="text-[10px] text-on-surface-variant">Core Thrift</span>
          </div>

          <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/40">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-on-surface-variant mb-1">
              <Coins className="w-3.5 h-3.5 text-secondary" />
              <span>Special (SS)</span>
            </div>
            <p className="font-headline font-bold text-base sm:text-lg text-on-surface">
              {formatCurrency(yearSummary.totalSpecialSavings)}
            </p>
            <span className="text-[10px] text-on-surface-variant">Voluntary Target</span>
          </div>

          <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/40">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-on-surface-variant mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-primary" />
              <span>Investment (IA)</span>
            </div>
            <p className="font-headline font-bold text-base sm:text-lg text-on-surface">
              {formatCurrency(yearSummary.totalInvestment)}
            </p>
            <span className="text-[10px] text-on-surface-variant">Fixed Ventures</span>
          </div>

          <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/40">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-on-surface-variant mb-1">
              <ShoppingBag className="w-3.5 h-3.5 text-on-surface-variant" />
              <span>Commodity (CP)</span>
            </div>
            <p className="font-headline font-bold text-base sm:text-lg text-on-surface">
              {formatCurrency(yearSummary.totalCommodity)}
            </p>
            <span className="text-[10px] text-on-surface-variant">Bulk Goods</span>
          </div>

          <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/40">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-on-surface-variant mb-1">
              <Wallet className="w-3.5 h-3.5 text-primary" />
              <span>MCA Pool</span>
            </div>
            <p className="font-headline font-bold text-base sm:text-lg text-on-surface">
              {formatCurrency(yearSummary.totalMuslimCommunity)}
            </p>
            <span className="text-[10px] text-on-surface-variant">Non-Interest</span>
          </div>

          <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-primary mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              <span>Total Annual Inflow</span>
            </div>
            <p className="font-headline font-bold text-base sm:text-lg text-primary">
              {formatCurrency(yearSummary.totalDeductions + yearSummary.totalDirectCredits)}
            </p>
            <span className="text-[10px] text-primary/80 font-medium">All accounts combined</span>
          </div>
        </div>
      </div>

      {/* Sub-Tabs: Monthly Cycles vs Transaction Ledger */}
      <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-3xl overflow-hidden shadow-xs">
        <div className="p-4 sm:p-6 border-b border-outline-variant/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveSubTab('monthly_cycles')}
              className={`px-4 py-2 rounded-xl text-xs font-headline font-bold transition cursor-pointer flex items-center gap-2 ${
                activeSubTab === 'monthly_cycles'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Monthly Deductions ({yearMonthlyRecords.length} cycles)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('transactions_feed')}
              className={`px-4 py-2 rounded-xl text-xs font-headline font-bold transition cursor-pointer flex items-center gap-2 ${
                activeSubTab === 'transactions_feed'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Direct Transactions ({yearTransactions.length})</span>
            </button>
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
            <input
              type="text"
              placeholder="Search statements or cycles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-surface border border-outline-variant/60 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* View 1: Monthly Cycles Table */}
        {activeSubTab === 'monthly_cycles' && (
          <div className="overflow-x-auto">
            {filteredMonthlyRecords.length === 0 ? (
              <div className="p-12 text-center text-on-surface-variant space-y-2">
                <Calendar className="w-10 h-10 mx-auto opacity-40 text-primary" />
                <p className="font-headline font-semibold text-sm text-on-surface">No deduction records for {selectedYear}</p>
                <p className="text-xs max-w-sm mx-auto">
                  Either no payroll deductions were posted for this year, or historical records have not yet been imported by the bursary officer.
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant border-b border-outline-variant/60 font-semibold">
                    <th className="py-3 px-4">Cycle / Month</th>
                    <th className="py-3 px-4 text-right">Ordinary (OS)</th>
                    <th className="py-3 px-4 text-right">Special (SS)</th>
                    <th className="py-3 px-4 text-right">Investment (IA)</th>
                    <th className="py-3 px-4 text-right">Commodity (CP)</th>
                    <th className="py-3 px-4 text-right">MCA Pool</th>
                    <th className="py-3 px-4 text-right">Loan Repay</th>
                    <th className="py-3 px-4 text-right font-bold text-on-surface">Total Deducted</th>
                    <th className="py-3 px-4 text-center">Slip</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/40">
                  {filteredMonthlyRecords.map((rec, idx) => (
                    <tr key={idx} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-on-surface flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                        <span>{rec.month || rec.cycle || `Cycle ${idx + 1}`}</span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-on-surface">
                        {formatCurrency(Number(rec.ordinarySavings) || 0)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-on-surface">
                        {formatCurrency(Number(rec.specialSavings) || 0)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-on-surface">
                        {formatCurrency(Number(rec.investment) || 0)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-on-surface">
                        {formatCurrency(Number(rec.commodityPurchase) || 0)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-on-surface">
                        {formatCurrency(Number(rec.muslimCommunity) || 0)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-on-surface">
                        {formatCurrency(Number(rec.loanReimbursement) || 0)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-primary">
                        {formatCurrency(Number(rec.total) || 0)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setActiveSlipRecord(rec)}
                          className="px-2.5 py-1 rounded-lg bg-surface border border-outline-variant/60 hover:bg-surface-container text-primary font-semibold text-[11px] transition cursor-pointer"
                        >
                          View Slip
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-surface-container font-bold text-on-surface border-t-2 border-outline-variant/80">
                    <td className="py-3.5 px-4 font-headline text-xs uppercase tracking-wider">
                      {selectedYear} Annual Totals
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono">{formatCurrency(yearSummary.totalOrdinarySavings)}</td>
                    <td className="py-3.5 px-4 text-right font-mono">{formatCurrency(yearSummary.totalSpecialSavings)}</td>
                    <td className="py-3.5 px-4 text-right font-mono">{formatCurrency(yearSummary.totalInvestment)}</td>
                    <td className="py-3.5 px-4 text-right font-mono">{formatCurrency(yearSummary.totalCommodity)}</td>
                    <td className="py-3.5 px-4 text-right font-mono">{formatCurrency(yearSummary.totalMuslimCommunity)}</td>
                    <td className="py-3.5 px-4 text-right font-mono">{formatCurrency(yearSummary.totalLoanRepayments)}</td>
                    <td className="py-3.5 px-4 text-right font-mono text-primary text-sm font-extrabold">{formatCurrency(yearSummary.totalDeductions)}</td>
                    <td className="py-3.5 px-4 text-center text-xs font-normal text-on-surface-variant">—</td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        )}

        {/* View 2: Direct Transactions List */}
        {activeSubTab === 'transactions_feed' && (
          <div className="p-4 sm:p-6 space-y-3">
            {filteredTransactions.length === 0 ? (
              <div className="p-12 text-center text-on-surface-variant space-y-2">
                <FileText className="w-10 h-10 mx-auto opacity-40 text-primary" />
                <p className="font-headline font-semibold text-sm text-on-surface">No direct transactions logged for {selectedYear}</p>
                <p className="text-xs max-w-sm mx-auto">
                  Direct online top-ups, manual payments, or dividend payouts for this period will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-outline-variant/40">
                {filteredTransactions.map((tx, idx) => {
                  const isCredit = (tx.type || '').toLowerCase().includes('credit') || (tx.type || '').toLowerCase().includes('deposit');
                  const amt = typeof tx.amount === 'number' ? tx.amount : Number(String(tx.amount || '').replace(/[^0-9.-]/g, '')) || 0;
                  return (
                    <div key={idx} className="py-3.5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          isCredit ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                        }`}>
                          {isCredit ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-on-surface">{tx.description || tx.reference || 'Transaction'}</p>
                          <p className="text-[11px] text-on-surface-variant">
                            {tx.account || 'Cooperative Account'} • {tx.date || tx.timestamp || `${selectedYear}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-headline font-bold text-xs sm:text-sm ${
                          isCredit ? 'text-emerald-700' : 'text-rose-700'
                        }`}>
                          {isCredit ? '+' : '-'}{formatCurrency(amt)}
                        </p>
                        <span className="text-[10px] text-on-surface-variant uppercase font-medium">
                          {tx.status || 'Verified'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Slip Modal */}
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
