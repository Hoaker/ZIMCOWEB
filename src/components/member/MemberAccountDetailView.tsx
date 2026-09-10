import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  ArrowDownToLine, 
  ArrowUpRight, 
  FileDown, 
  Search, 
  X, 
  ShieldCheck, 
  TrendingUp, 
  ArrowDownLeft, 
  Info,
  LifeBuoy,
  Calendar,
  Layers,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { MemberViewType } from './MemberSidebar';
import { MonthlySavingsRecordItem } from '../MonthlySavingsPassbookTable';
import { MonthlyDeductionSlipModal } from './MonthlyDeductionSlipModal';

interface MemberAccountDetailViewProps {
  viewKey: 'os' | 'ss' | 'ia' | 'cp' | 'mca';
  memberData: any;
  transactions: any[];
  monthlySavingsRecords?: MonthlySavingsRecordItem[];
  onBackToOverview: () => void;
  onOpenTopUp: (accountKey: string) => void;
  onNavigateView: (view: MemberViewType) => void;
  onDownloadPDF: (scopeAccount?: string) => void;
  isDownloadingPDF: boolean;
}

export const MemberAccountDetailView: React.FC<MemberAccountDetailViewProps> = ({
  viewKey,
  memberData,
  transactions,
  monthlySavingsRecords = [],
  onBackToOverview,
  onOpenTopUp,
  onNavigateView,
  onDownloadPDF,
  isDownloadingPDF,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLedgerTab, setActiveLedgerTab] = useState<'monthly' | 'transactions'>('monthly');
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>('all');
  const [activeSlipRecord, setActiveSlipRecord] = useState<MonthlySavingsRecordItem | null>(null);

  const accountConfig = {
    os: {
      key: 'ordinarySavings',
      fieldKey: 'ordinarySavings' as const,
      title: 'Ordinary Savings (OS)',
      shortTitle: 'Ordinary Savings',
      rate: '4.5% p.a.',
      rateNumeric: 0.045,
      balance: Number(memberData?.ordinarySavings || 0),
      description: 'The cornerstone cooperative account. Mandatory monthly payroll contribution that establishes loan borrowing eligibility and annual dividend shares.',
      badgeColor: 'bg-emerald-50 text-emerald-800',
    },
    ss: {
      key: 'specialSavings',
      fieldKey: 'specialSavings' as const,
      title: 'Special Savings (SS)',
      shortTitle: 'Special Savings',
      rate: '5.5% p.a.',
      rateNumeric: 0.055,
      balance: Number(memberData?.specialSavings || 0),
      description: 'High-yield voluntary savings pool designed for personal targets, projects, and instant emergency liquidity with unrestricted withdrawal capability.',
      badgeColor: 'bg-emerald-50 text-emerald-800',
    },
    ia: {
      key: 'investment',
      fieldKey: 'investment' as const,
      title: 'Investment Account (IA)',
      shortTitle: 'Investment Account',
      rate: '8.0% p.a.',
      rateNumeric: 0.08,
      balance: Number(memberData?.investmentAmount || 0),
      description: 'Long-term wealth accumulation vehicle participating directly in cooperative commercial projects, real estate assets, and fixed-income ventures.',
      badgeColor: 'bg-blue-50 text-blue-800',
    },
    cp: {
      key: 'commodity',
      fieldKey: 'commodityPurchase' as const,
      title: 'Commodity Purchase (CP)',
      shortTitle: 'Commodity Account',
      rate: '6.0% p.a.',
      rateNumeric: 0.06,
      balance: Number(memberData?.commoditySavings || 0),
      description: 'Dedicated fund for purchasing household goods, electronics, and foodstuff in bulk at wholesale cooperative rates with flexible repayment terms.',
      badgeColor: 'bg-emerald-50 text-emerald-800',
    },
    mca: {
      key: 'muslimCommunity',
      fieldKey: 'muslimCommunity' as const,
      title: 'Muslim Community Account (MCA)',
      shortTitle: 'Muslim Community Account',
      rate: 'Non-Interest (Profit Share)',
      rateNumeric: 0.05,
      balance: Number(memberData?.muslimCommunitySavings || memberData?.muslimSavings || 0),
      description: 'Sharia-compliant non-interest financial pool governed by Islamic commercial jurisprudence with ethical profit-sharing distribution.',
      badgeColor: 'bg-purple-50 text-purple-800',
    },
  }[viewKey];

  const formatCurrency = (val: number) => {
    return `₦${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Extract month-by-month deduction history for this specific account
  const accountMonthlyRecords = useMemo(() => {
    let runningBalance = 0;
    // Calculate in chronological order
    return monthlySavingsRecords.map(r => {
      const monthAlloc = Number(r[accountConfig.fieldKey] || 0);
      runningBalance += monthAlloc;
      return {
        ...r,
        monthAllocation: monthAlloc,
        runningBalance
      };
    });
  }, [monthlySavingsRecords, accountConfig.fieldKey]);

  // Filter monthly records
  const displayMonthlyRecords = useMemo(() => {
    let list = accountMonthlyRecords;
    if (selectedMonthFilter !== 'all') {
      list = list.filter(r => r.month === selectedMonthFilter || r.cycle === selectedMonthFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(r => r.month.toLowerCase().includes(q) || r.date.toLowerCase().includes(q));
    }
    return list;
  }, [accountMonthlyRecords, selectedMonthFilter, searchQuery]);

  // Filter general transactions for this specific account
  const accountTransactions = transactions.filter(t => {
    const acc = (t.account || '').toLowerCase();
    const target = accountConfig.shortTitle.toLowerCase();
    return acc.includes(target) || (viewKey === 'os' && acc.includes('payroll'));
  });

  const displayTransactions = searchQuery.trim()
    ? accountTransactions.filter(t => 
        (t.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.amount || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.date || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : accountTransactions;

  const estimatedDividend = (accountConfig.balance * accountConfig.rateNumeric) * 0.12;

  return (
    <div className="space-y-6 pb-12">
      {/* Navigation Breadcrumb & Back button */}
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
        <span className="text-xs font-bold text-on-surface">{accountConfig.shortTitle}</span>
      </div>

      {/* Account Hero Card */}
      <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${accountConfig.badgeColor}`}>
                {accountConfig.rate}
              </span>
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                Audited Monthly Account
              </span>
            </div>
            
            <h1 className="font-headline text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
              {accountConfig.title}
            </h1>
            
            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              {accountConfig.description}
            </p>
          </div>

          <div className="space-y-3 bg-surface-container-low border border-outline-variant/50 rounded-2xl p-5 min-w-[260px]">
            <div>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                Current Total Balance
              </span>
              <div className="font-headline text-2xl sm:text-3xl font-extrabold text-primary font-mono mt-0.5">
                {formatCurrency(accountConfig.balance)}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1 border-t border-outline-variant/30">
              <button
                type="button"
                onClick={() => onOpenTopUp(accountConfig.key)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-primary text-on-primary rounded-xl text-xs font-bold hover:bg-primary/90 transition shadow-xs cursor-pointer"
              >
                <ArrowDownToLine size={14} />
                <span>Deposit</span>
              </button>
              
              <button
                type="button"
                onClick={() => onNavigateView('withdrawal')}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-surface-container-lowest hover:bg-surface-container text-on-surface border border-outline-variant/60 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                <ArrowUpRight size={14} />
                <span>Withdraw</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Account Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-4">
          <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
            Audited Monthly Payroll Cycles
          </p>
          <p className="font-headline text-xl font-extrabold text-on-surface font-mono">
            {accountMonthlyRecords.length} Cycles Credited
          </p>
          <p className="text-[11px] text-on-surface-variant mt-1">
            Automatically deducted and credited directly via Bursary
          </p>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-4">
          <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
            Est. Accrued Surplus Dividend
          </p>
          <p className="font-headline text-xl font-extrabold text-primary font-mono">
            {formatCurrency(estimatedDividend)}
          </p>
          <p className="text-[11px] text-on-surface-variant mt-1">
            Distributed annually at the Annual General Meeting (AGM)
          </p>
        </div>

        <div className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-4 flex flex-col justify-between sm:col-span-2 lg:col-span-1">
          <div>
            <p className="text-[11px] font-bold text-on-surface flex items-center gap-1.5 mb-1">
              <LifeBuoy size={14} className="text-primary" />
              <span>Need Account Assistance?</span>
            </p>
            <p className="text-xs text-on-surface-variant">
              Contact your assigned cooperative account officer for portfolio advice.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateView('helpdesk')}
            className="mt-3 text-xs font-bold text-primary hover:underline text-left cursor-pointer"
          >
            Open Support Ticket →
          </button>
        </div>
      </div>

      {/* Primary Month-by-Month Account Ledger */}
      <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant/40 pb-4">
          <div>
            <h2 className="font-headline font-bold text-base sm:text-lg text-on-surface">
              {accountConfig.shortTitle} • Month-by-Month Records
            </h2>
            <p className="text-xs text-on-surface-variant">
              Complete monthly schedule of payroll deductions and running balances for {accountConfig.shortTitle}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* View Switcher Tabs */}
            <div className="inline-flex p-1 rounded-xl bg-surface-container-low border border-outline-variant/40">
              <button
                type="button"
                onClick={() => setActiveLedgerTab('monthly')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                  activeLedgerTab === 'monthly'
                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <Calendar size={13} />
                <span>Month-by-Month ({accountMonthlyRecords.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveLedgerTab('transactions')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                  activeLedgerTab === 'transactions'
                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <Layers size={13} />
                <span>All Receipts ({accountTransactions.length})</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => onDownloadPDF(accountConfig.shortTitle)}
              disabled={isDownloadingPDF}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-container-low hover:bg-surface-container text-on-surface border border-outline-variant/60 rounded-xl text-xs font-bold transition cursor-pointer self-start sm:self-auto"
            >
              <FileDown size={14} className="text-primary" />
              <span>Statement PDF</span>
            </button>
          </div>
        </div>

        {/* Search & Month Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${accountConfig.shortTitle} records...`}
              className="w-full bg-surface-container-low border border-outline-variant/50 text-on-surface text-xs rounded-xl pl-8 pr-7 py-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none placeholder:text-on-surface-variant/60"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Month-by-Month View */}
        {activeLedgerTab === 'monthly' ? (
          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <table className="w-full text-left min-w-[540px] sm:min-w-full">
              <thead>
                <tr className="border-b border-outline-variant/40">
                  <th className="pb-2.5 font-bold text-on-surface-variant text-[10px] sm:text-xs uppercase tracking-wider px-3">Month / Cycle</th>
                  <th className="pb-2.5 font-bold text-on-surface-variant text-[10px] sm:text-xs uppercase tracking-wider text-right px-3">Monthly Deduction</th>
                  <th className="pb-2.5 font-bold text-on-surface-variant text-[10px] sm:text-xs uppercase tracking-wider text-right px-3">Running Balance</th>
                  <th className="pb-2.5 font-bold text-on-surface-variant text-[10px] sm:text-xs uppercase tracking-wider text-center px-3">Status</th>
                  <th className="pb-2.5 font-bold text-on-surface-variant text-[10px] sm:text-xs uppercase tracking-wider text-center px-3">Slip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 text-xs sm:text-sm">
                {displayMonthlyRecords.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs font-medium text-on-surface-variant">
                      No monthly deduction records recorded for {accountConfig.shortTitle} yet.
                    </td>
                  </tr>
                ) : (
                  displayMonthlyRecords.map((rec, idx) => (
                    <tr key={rec.id || idx} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary font-mono font-bold text-xs flex items-center justify-center shrink-0">
                            {idx + 1}
                          </div>
                          <div>
                            <span className="font-bold text-on-surface block">{rec.month}</span>
                            <span className="text-[10px] text-on-surface-variant">{rec.date}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 font-mono font-bold text-right text-emerald-700 whitespace-nowrap">
                        +₦{Number(rec.monthAllocation).toLocaleString()}
                      </td>

                      <td className="py-3 px-3 font-mono font-bold text-right text-on-surface whitespace-nowrap">
                        ₦{Number(rec.runningBalance).toLocaleString()}
                      </td>

                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 size={11} className="text-emerald-700" />
                          <span>Verified</span>
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setActiveSlipRecord(rec)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container-low hover:bg-surface-container text-primary border border-outline-variant/50 text-xs font-bold transition cursor-pointer"
                        >
                          <FileText size={12} />
                          <span>Advice Slip</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* Detailed Transaction Ledger */
          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <table className="w-full text-left min-w-[480px] sm:min-w-full">
              <thead>
                <tr className="border-b border-outline-variant/40">
                  <th className="pb-2.5 font-bold text-on-surface-variant text-[10px] sm:text-xs uppercase tracking-wider px-3">Date</th>
                  <th className="pb-2.5 font-bold text-on-surface-variant text-[10px] sm:text-xs uppercase tracking-wider px-3">Description</th>
                  <th className="pb-2.5 font-bold text-on-surface-variant text-[10px] sm:text-xs uppercase tracking-wider text-right px-3">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 text-xs sm:text-sm">
                {displayTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-xs font-medium text-on-surface-variant">
                      No receipts found for this account.
                    </td>
                  </tr>
                ) : (
                  displayTransactions.map((tx, idx) => (
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
                          <span className="font-bold text-on-surface line-clamp-1">{tx.description}</span>
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
