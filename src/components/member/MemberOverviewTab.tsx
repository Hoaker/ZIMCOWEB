import React, { useState, useMemo } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  ArrowDownToLine, 
  FileDown, 
  Search, 
  X, 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Layers, 
  Calendar, 
  ExternalLink, 
  Sparkles, 
  ChevronRight, 
  TrendingUp, 
  Wallet, 
  PiggyBank,
  FileText
} from 'lucide-react';
import { MonthlySavingsPassbookTable, MonthlySavingsRecordItem } from '../MonthlySavingsPassbookTable';
import { MonthlyDeductionSlipModal } from './MonthlyDeductionSlipModal';
import { MemberViewType } from './MemberSidebar';

interface MemberOverviewTabProps {
  memberData: any;
  transactions: any[];
  filteredTransactions: any[];
  monthlySavingsRecords: MonthlySavingsRecordItem[];
  expandedMonthKey: string | null;
  onToggleExpandMonth: (key: string) => void;
  savingsSortAscending: boolean;
  onToggleSavingsSort: () => void;
  kycStatus: 'draft' | 'submitted' | 'failed' | 'verified';
  onNavigateView: (view: MemberViewType) => void;
  onOpenTopUp: (defaultAccount?: string) => void;
  onDownloadPDF: (scopeAccount?: string) => void;
  isDownloadingPDF: boolean;
  activitySearchQuery: string;
  setActivitySearchQuery: (query: string) => void;
  activityTypeFilter: string;
  setActivityTypeFilter: (filter: any) => void;
  activityDatePreset: string;
  setActivityDatePreset: (preset: any) => void;
  formatGreetingName: (fullName?: string) => string;
}

export const MemberOverviewTab: React.FC<MemberOverviewTabProps> = ({
  memberData,
  transactions,
  filteredTransactions,
  monthlySavingsRecords,
  expandedMonthKey,
  onToggleExpandMonth,
  savingsSortAscending,
  onToggleSavingsSort,
  kycStatus,
  onNavigateView,
  onOpenTopUp,
  onDownloadPDF,
  isDownloadingPDF,
  activitySearchQuery,
  setActivitySearchQuery,
  activityTypeFilter,
  setActivityTypeFilter,
  activityDatePreset,
  setActivityDatePreset,
  formatGreetingName,
}) => {
  const [activeTab, setActiveTab] = useState<'passbook' | 'transactions'>('passbook');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [activeSlipRecord, setActiveSlipRecord] = useState<MonthlySavingsRecordItem | null>(null);

  // Overall account balances
  const allOS = Number(memberData?.ordinarySavings || 0);
  const allSS = Number(memberData?.specialSavings || 0);
  const allIA = Number(memberData?.investmentAmount || 0);
  const allCP = Number(memberData?.commoditySavings || 0);
  const allMCA = Number(memberData?.muslimCommunitySavings || memberData?.muslimSavings || 0);
  const allTotalBalance = allOS + allSS + allIA + allCP + allMCA;

  // Available unique months
  const availableMonths = useMemo(() => {
    return Array.from(new Set(monthlySavingsRecords.map(r => r.month).filter(Boolean)));
  }, [monthlySavingsRecords]);

  // Selected month record (if any)
  const currentMonthRecord = useMemo(() => {
    if (selectedMonth === 'all') return null;
    return monthlySavingsRecords.find(r => r.month === selectedMonth || r.cycle === selectedMonth) || null;
  }, [monthlySavingsRecords, selectedMonth]);

  // Dynamic values depending on selected month
  const displayOS = currentMonthRecord ? Number(currentMonthRecord.ordinarySavings || 0) : allOS;
  const displaySS = currentMonthRecord ? Number(currentMonthRecord.specialSavings || 0) : allSS;
  const displayIA = currentMonthRecord ? Number(currentMonthRecord.investment || 0) : allIA;
  const displayCP = currentMonthRecord ? Number(currentMonthRecord.commodityPurchase || 0) : allCP;
  const displayMCA = currentMonthRecord ? Number(currentMonthRecord.muslimCommunity || 0) : allMCA;
  const displayTotal = currentMonthRecord 
    ? Number(currentMonthRecord.total || (displayOS + displaySS + displayIA + displayCP + displayMCA))
    : allTotalBalance;

  const maxLoanEligible = 2 * allOS;
  const outstandingLoans = Number(memberData?.outstandingLoans || 0);
  const availableCredit = Math.max(0, maxLoanEligible - outstandingLoans);

  const formatCurrency = (val: number) => {
    return `₦${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Greeting & Status Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
            Welcome back, {formatGreetingName(memberData?.fullName)}
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
            Member ID: <span className="font-mono font-semibold text-on-surface">{memberData?.id || 'ZMC-001'}</span>
            {memberData?.department && ` • ${memberData.department}`}
          </p>
        </div>

        {/* KYC & Trust Quick Indicator */}
        <div className="flex items-center gap-2">
          {kycStatus === 'verified' ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60 text-xs font-semibold">
              <CheckCircle2 size={14} className="text-emerald-700" />
              <span>KYC Verified</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onNavigateView('kyc')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-semibold hover:bg-amber-100 transition cursor-pointer"
            >
              <AlertTriangle size={14} className="text-amber-700" />
              <span>Complete Verification</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Month-by-Month Accounts Explorer Selector */}
      <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Calendar size={16} />
            </div>
            <div>
              <h3 className="font-headline font-bold text-xs sm:text-sm text-on-surface">
                Month-by-Month Account Filter
              </h3>
              <p className="text-[11px] text-on-surface-variant">
                Select a cycle below to inspect that specific month's deductions across your 5 sub-accounts
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateView('monthly')}
            className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>Open Dedicated Monthly Ledger</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Month Buttons List */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => setSelectedMonth('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              selectedMonth === 'all'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'bg-surface-container-low hover:bg-surface-container text-on-surface border border-outline-variant/50'
            }`}
          >
            All Cycles Cumulative
          </button>

          {availableMonths.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setSelectedMonth(m)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedMonth === m
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container-low hover:bg-surface-container text-on-surface border border-outline-variant/50'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Primary Financial Portfolio Hero Card */}
      <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
              {selectedMonth === 'all' 
                ? 'Total Cumulative Portfolio Balance' 
                : `${selectedMonth} • Total Monthly Deductions Credited`}
            </span>
            <div className="font-headline text-3xl sm:text-4xl lg:text-5xl font-extrabold text-primary font-mono tracking-tight">
              {formatCurrency(displayTotal)}
            </div>
            <p className="text-xs text-on-surface-variant flex items-center gap-1.5 pt-1">
              <ShieldCheck size={14} className="text-primary" />
              <span>
                {selectedMonth === 'all' 
                  ? `Recorded across ${monthlySavingsRecords.length} verified monthly cycles` 
                  : `Audited payroll credit for cycle ${selectedMonth}`}
              </span>
            </p>
          </div>

          {/* Core Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {currentMonthRecord && (
              <button
                type="button"
                onClick={() => setActiveSlipRecord(currentMonthRecord)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition shadow-xs cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-none"
              >
                <FileText size={16} />
                <span>View {selectedMonth} Slip</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onOpenTopUp()}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary/90 transition shadow-xs cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
            >
              <ArrowDownToLine size={16} />
              <span>Deposit Funds</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateView('withdrawal')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface border border-outline-variant/60 font-bold text-xs transition cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
            >
              <ArrowUpRight size={16} />
              <span>Request Payout</span>
            </button>

            <button
              type="button"
              onClick={() => onDownloadPDF(selectedMonth === 'all' ? undefined : selectedMonth)}
              disabled={isDownloadingPDF}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface border border-outline-variant/60 font-bold text-xs transition disabled:opacity-50 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
            >
              <FileDown size={16} className="text-primary" />
              <span>{isDownloadingPDF ? 'Generating...' : 'Statement PDF'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Account Breakdown Cards Grid (Focus on Month Records) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-headline font-bold text-base sm:text-lg text-on-surface">
            {selectedMonth === 'all' ? 'Savings & Investment Accounts' : `Account Allocations for ${selectedMonth}`}
          </h2>
          <span className="text-xs text-on-surface-variant">5 Sub-Accounts Active</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Ordinary Savings */}
          <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-4 sm:p-5 hover:border-primary/40 transition flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-on-surface">Ordinary Savings (OS)</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800">4.5% p.a.</span>
              </div>
              <p className="text-[11px] text-on-surface-variant">
                {selectedMonth === 'all' ? 'Mandatory payroll anchor' : `Deduction credited in ${selectedMonth}`}
              </p>
              <p className="font-headline text-xl font-extrabold text-on-surface font-mono pt-2">
                {formatCurrency(displayOS)}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-outline-variant/30 flex items-center justify-between">
              <button
                type="button"
                onClick={() => onNavigateView('os')}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View Monthly Ledger</span>
                <ChevronRight size={14} />
              </button>
              <button
                type="button"
                onClick={() => onOpenTopUp('ordinarySavings')}
                className="text-xs text-on-surface-variant hover:text-on-surface font-medium cursor-pointer"
              >
                + Deposit
              </button>
            </div>
          </div>

          {/* Special Savings */}
          <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-4 sm:p-5 hover:border-primary/40 transition flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-on-surface">Special Savings (SS)</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800">5.5% p.a.</span>
              </div>
              <p className="text-[11px] text-on-surface-variant">
                {selectedMonth === 'all' ? 'Voluntary high-yield reserve' : `Deduction credited in ${selectedMonth}`}
              </p>
              <p className="font-headline text-xl font-extrabold text-on-surface font-mono pt-2">
                {formatCurrency(displaySS)}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-outline-variant/30 flex items-center justify-between">
              <button
                type="button"
                onClick={() => onNavigateView('ss')}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View Monthly Ledger</span>
                <ChevronRight size={14} />
              </button>
              <button
                type="button"
                onClick={() => onOpenTopUp('specialSavings')}
                className="text-xs text-on-surface-variant hover:text-on-surface font-medium cursor-pointer"
              >
                + Deposit
              </button>
            </div>
          </div>

          {/* Investment Account */}
          <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-4 sm:p-5 hover:border-primary/40 transition flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-on-surface">Investment Capital (IA)</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800">8.0% p.a.</span>
              </div>
              <p className="text-[11px] text-on-surface-variant">
                {selectedMonth === 'all' ? 'Long-term development shares' : `Deduction credited in ${selectedMonth}`}
              </p>
              <p className="font-headline text-xl font-extrabold text-on-surface font-mono pt-2">
                {formatCurrency(displayIA)}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-outline-variant/30 flex items-center justify-between">
              <button
                type="button"
                onClick={() => onNavigateView('ia')}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View Monthly Ledger</span>
                <ChevronRight size={14} />
              </button>
              <button
                type="button"
                onClick={() => onOpenTopUp('investment')}
                className="text-xs text-on-surface-variant hover:text-on-surface font-medium cursor-pointer"
              >
                + Deposit
              </button>
            </div>
          </div>

          {/* Commodity Purchase */}
          <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-4 sm:p-5 hover:border-primary/40 transition flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-on-surface">Commodity Purchase (CP)</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800">6.0% p.a.</span>
              </div>
              <p className="text-[11px] text-on-surface-variant">
                {selectedMonth === 'all' ? 'Wholesale goods credit' : `Deduction credited in ${selectedMonth}`}
              </p>
              <p className="font-headline text-xl font-extrabold text-on-surface font-mono pt-2">
                {formatCurrency(displayCP)}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-outline-variant/30 flex items-center justify-between">
              <button
                type="button"
                onClick={() => onNavigateView('cp')}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View Monthly Ledger</span>
                <ChevronRight size={14} />
              </button>
              <button
                type="button"
                onClick={() => onOpenTopUp('commodity')}
                className="text-xs text-on-surface-variant hover:text-on-surface font-medium cursor-pointer"
              >
                + Deposit
              </button>
            </div>
          </div>

          {/* Muslim Community Account */}
          <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-4 sm:p-5 hover:border-primary/40 transition flex flex-col justify-between sm:col-span-2 lg:col-span-1">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-on-surface">Muslim Community (MCA)</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-800">Non-Interest</span>
              </div>
              <p className="text-[11px] text-on-surface-variant">
                {selectedMonth === 'all' ? 'Sharia-compliant ethical pool' : `Deduction credited in ${selectedMonth}`}
              </p>
              <p className="font-headline text-xl font-extrabold text-on-surface font-mono pt-2">
                {formatCurrency(displayMCA)}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-outline-variant/30 flex items-center justify-between">
              <button
                type="button"
                onClick={() => onNavigateView('mca')}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View Monthly Ledger</span>
                <ChevronRight size={14} />
              </button>
              <button
                type="button"
                onClick={() => onOpenTopUp('muslimCommunity')}
                className="text-xs text-on-surface-variant hover:text-on-surface font-medium cursor-pointer"
              >
                + Deposit
              </button>
            </div>
          </div>

          {/* Loan Eligibility Quick Card */}
          <div className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-4 sm:p-5 flex flex-col justify-between sm:col-span-2 lg:col-span-1">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                  <CreditCard size={15} className="text-primary" />
                  <span>Loan Credit Line</span>
                </span>
                <span className="text-[10px] font-bold text-on-surface-variant">2x OS Balance</span>
              </div>
              <p className="text-[11px] text-on-surface-variant">Available borrowing headroom based on Ordinary Savings</p>
              <p className="font-headline text-xl font-extrabold text-primary font-mono pt-2">
                {formatCurrency(availableCredit)}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-outline-variant/30 flex items-center justify-between">
              <button
                type="button"
                onClick={() => onNavigateView('loans')}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Apply / Manage Loans</span>
                <ChevronRight size={14} />
              </button>
              {outstandingLoans > 0 && (
                <span className="text-[11px] font-mono text-rose-700 font-bold">
                  Owing {formatCurrency(outstandingLoans)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Passbook & Activity Section with Progressive Tabs */}
      <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant/40 pb-4">
          <div>
            <h2 className="font-headline font-bold text-base sm:text-lg text-on-surface">
              Monthly Passbook Ledger
            </h2>
            <p className="text-xs text-on-surface-variant">
              Chronological deduction cycles and audited account credits
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-xl border border-outline-variant/40 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('passbook')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'passbook'
                  ? 'bg-surface-container-lowest text-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Calendar size={13} />
              <span>Monthly Passbook ({monthlySavingsRecords.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('transactions')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'transactions'
                  ? 'bg-surface-container-lowest text-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Layers size={13} />
              <span>All Receipts ({transactions.length})</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Monthly Savings Passbook Table */}
        {activeTab === 'passbook' && (
          <MonthlySavingsPassbookTable
            records={monthlySavingsRecords}
            expandedMonthKey={expandedMonthKey}
            onToggleExpand={onToggleExpandMonth}
            sortAscending={savingsSortAscending}
            onToggleSort={onToggleSavingsSort}
            onSwitchToAllActivity={() => setActiveTab('transactions')}
            onViewSlip={(rec) => setActiveSlipRecord(rec)}
          />
        )}

        {/* Tab 2: All Transactions with Search & Category Filter */}
        {activeTab === 'transactions' && (
          <div className="space-y-4 pt-1">
            {/* Filter Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-2.5 bg-surface-container-low rounded-xl border border-outline-variant/40">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input
                  type="text"
                  value={activitySearchQuery}
                  onChange={(e) => setActivitySearchQuery(e.target.value)}
                  placeholder="Search by description, date, or amount..."
                  className="w-full bg-surface-container-lowest border border-outline-variant/50 text-on-surface text-xs rounded-lg pl-8 pr-7 py-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none placeholder:text-on-surface-variant/60"
                />
                {activitySearchQuery && (
                  <button
                    type="button"
                    onClick={() => setActivitySearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={activityTypeFilter}
                  onChange={(e) => setActivityTypeFilter(e.target.value)}
                  className="bg-surface-container-lowest border border-outline-variant/50 text-on-surface text-xs rounded-lg px-2.5 py-2 font-medium focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  <option value="savings">Savings</option>
                  <option value="loans">Loans</option>
                  <option value="commodities">Commodities</option>
                  <option value="withdrawals">Withdrawals</option>
                  <option value="fees">Fees & Levies</option>
                </select>

                <button
                  type="button"
                  onClick={() => onDownloadPDF()}
                  disabled={isDownloadingPDF}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-surface-container-lowest hover:bg-surface-container text-on-surface border border-outline-variant/60 rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  <FileDown size={14} className="text-primary" />
                  <span className="hidden sm:inline">Export</span>
                </button>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="overflow-x-auto -mx-2 sm:mx-0">
              <table className="w-full text-left min-w-[500px] sm:min-w-full">
                <thead>
                  <tr className="border-b border-outline-variant/40">
                    <th className="pb-2.5 font-bold text-on-surface-variant text-[10px] sm:text-xs uppercase tracking-wider px-3">Date</th>
                    <th className="pb-2.5 font-bold text-on-surface-variant text-[10px] sm:text-xs uppercase tracking-wider px-3">Description / Account</th>
                    <th className="pb-2.5 font-bold text-on-surface-variant text-[10px] sm:text-xs uppercase tracking-wider text-right px-3">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20 text-xs sm:text-sm">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-xs font-medium text-on-surface-variant">
                        No transactions found matching the filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((tx, idx) => (
                      <tr key={tx.id || idx} className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="py-3 px-3 font-mono text-[11px] text-on-surface-variant whitespace-nowrap">
                          {tx.date || 'Recent'}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                              tx.type === 'credit' 
                                ? 'bg-emerald-50 text-emerald-700' 
                                : 'bg-rose-50 text-rose-700'
                            }`}>
                              {tx.type === 'credit' ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                            </div>
                            <div>
                              <p className="font-bold text-on-surface line-clamp-1">{tx.description}</p>
                              <p className="text-[10px] text-on-surface-variant">{tx.account || 'Cooperative Ledger'}</p>
                            </div>
                          </div>
                        </td>
                        <td className={`py-3 px-3 font-mono font-bold text-right whitespace-nowrap ${
                          tx.type === 'credit' ? 'text-emerald-700' : 'text-rose-700'
                        }`}>
                          {tx.type === 'credit' ? '+' : '-'}{tx.amount}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
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
