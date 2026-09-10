import React, { useState, useMemo } from 'react';
import { Calendar, CheckCircle2, ChevronDown, ChevronRight, ArrowUpDown, Layers, FileText, Search, Printer, Filter } from 'lucide-react';

export interface MonthlySavingsRecordItem {
  id: string;
  month: string;
  date: string;
  cycle: string;
  year?: number;
  ordinarySavings: number;
  specialSavings: number;
  investment: number;
  commodityPurchase: number;
  muslimCommunity: number;
  loanReimbursement?: number;
  total: number;
  status: string;
  cumulativeBalance?: number;
}

interface MonthlySavingsPassbookTableProps {
  records: MonthlySavingsRecordItem[];
  expandedMonthKey: string | null;
  onToggleExpand: (key: string) => void;
  sortAscending: boolean;
  onToggleSort: () => void;
  onSwitchToAllActivity: () => void;
  onViewSlip?: (record: MonthlySavingsRecordItem) => void;
}

export const MonthlySavingsPassbookTable: React.FC<MonthlySavingsPassbookTableProps> = ({
  records,
  expandedMonthKey,
  onToggleExpand,
  sortAscending,
  onToggleSort,
  onSwitchToAllActivity,
  onViewSlip,
}) => {
  const [filterMonthText, setFilterMonthText] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('all');

  // Extract all available years from records or default years
  const availableYears = useMemo(() => {
    const yearsSet = new Set<string>();
    records.forEach(r => {
      const match = (r.month || r.cycle || r.date || '').match(/20\d\d/);
      if (match) {
        yearsSet.add(match[0]);
      } else if (r.year) {
        yearsSet.add(String(r.year));
      }
    });
    // Ensure standard years are included
    ['2026', '2025', '2024', '2023', '2022'].forEach(y => yearsSet.add(y));
    return Array.from(yearsSet).sort((a, b) => Number(b) - Number(a));
  }, [records]);

  // Filter records by year and search query
  const displayRecords = useMemo(() => {
    return records.filter(r => {
      const cycleString = (r.month || '') + ' ' + (r.cycle || '') + ' ' + (r.date || '');
      
      // Year filter
      if (selectedYear !== 'all') {
        const hasYear = cycleString.includes(selectedYear) || (r.year && String(r.year) === selectedYear);
        if (!hasYear) return false;
      }

      // Search text filter
      if (filterMonthText.trim()) {
        const matchesSearch = cycleString.toLowerCase().includes(filterMonthText.toLowerCase());
        if (!matchesSearch) return false;
      }

      return true;
    });
  }, [records, selectedYear, filterMonthText]);

  // Compute yearly totals for selected scope
  const yearlyTotals = useMemo(() => {
    let ord = 0;
    let spec = 0;
    let inv = 0;
    let comm = 0;
    let muslim = 0;
    let tot = 0;

    displayRecords.forEach(r => {
      ord += Number(r.ordinarySavings || 0);
      spec += Number(r.specialSavings || 0);
      inv += Number(r.investment || 0);
      comm += Number(r.commodityPurchase || 0);
      muslim += Number(r.muslimCommunity || 0);
      tot += Number(r.total || 0);
    });

    return { ord, spec, inv, comm, muslim, tot };
  }, [displayRecords]);

  return (
    <div className="mt-2 space-y-4">
      {/* Informative Sorting & Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 px-4 py-3 bg-surface-container-low border border-outline-variant/60 rounded-2xl text-xs text-on-surface">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary shrink-0"></span>
          <span className="font-semibold text-on-surface">
            Cooperative accounts recorded month after month in chronological order
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Year Filter */}
          <div className="flex items-center gap-1.5 bg-surface-container-lowest px-2.5 py-1 rounded-lg border border-outline-variant/50">
            <Filter size={11} className="text-on-surface-variant" />
            <span className="text-[11px] font-semibold text-on-surface-variant">Year:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-transparent text-[11px] font-bold text-primary focus-visible:outline-none cursor-pointer"
            >
              <option value="all">All Years</option>
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              value={filterMonthText}
              onChange={(e) => setFilterMonthText(e.target.value)}
              placeholder="Search month..."
              className="bg-surface-container-lowest border border-outline-variant/50 text-on-surface text-[11px] rounded-lg pl-7 pr-2 py-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary w-28 sm:w-32"
            />
          </div>

          <span className="text-[11px] text-on-surface-variant font-mono">
            {displayRecords.length} {displayRecords.length === 1 ? 'cycle' : 'cycles'}
          </span>

          <button
            type="button"
            onClick={onToggleSort}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:text-primary/90 bg-surface-container-lowest px-2.5 py-1 rounded-lg border border-outline-variant/50 cursor-pointer transition"
          >
            <ArrowUpDown size={11} />
            <span>{sortAscending ? 'Jan → Dec' : 'Dec → Jan'}</span>
          </button>
        </div>
      </div>

      {/* Yearly Summary Bar when a specific year is active or records exist */}
      {displayRecords.length > 0 && selectedYear !== 'all' && (
        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-bold font-mono text-[11px]">
              {selectedYear} Annual Summary
            </span>
            <span className="text-on-surface-variant text-[11px]">
              {displayRecords.length} contribution cycles recorded
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
            <span className="text-on-surface-variant">Ordinary: <strong className="text-on-surface">₦{yearlyTotals.ord.toLocaleString()}</strong></span>
            <span className="text-on-surface-variant">Special: <strong className="text-on-surface">₦{yearlyTotals.spec.toLocaleString()}</strong></span>
            <span className="text-on-surface-variant">Total: <strong className="text-primary font-bold">₦{yearlyTotals.tot.toLocaleString()}</strong></span>
          </div>
        </div>
      )}

      {displayRecords.length > 0 ? (
        <div className="overflow-x-auto -mx-2 sm:mx-0">
          <table className="w-full text-left min-w-[640px] sm:min-w-full">
            <thead>
              <tr className="border-b border-outline-variant/40">
                <th className="pb-3 font-bold text-on-surface-variant text-[10px] sm:text-xs uppercase tracking-wider px-3">Month / Cycle</th>
                <th className="pb-3 font-bold text-on-surface-variant text-[10px] sm:text-xs uppercase tracking-wider text-right px-3">Ordinary Savings</th>
                <th className="pb-3 font-bold text-on-surface-variant text-[10px] sm:text-xs uppercase tracking-wider text-right px-3">Special Savings</th>
                <th className="pb-3 font-bold text-on-surface-variant text-[10px] sm:text-xs uppercase tracking-wider text-right px-3">Investment / Other</th>
                <th className="pb-3 font-bold text-on-surface-variant text-[10px] sm:text-xs uppercase tracking-wider text-right px-3">Total Deducted</th>
                <th className="pb-3 font-bold text-on-surface-variant text-[10px] sm:text-xs uppercase tracking-wider text-center px-3">Status</th>
                <th className="pb-3 font-bold text-on-surface-variant text-[10px] sm:text-xs uppercase tracking-wider text-center px-3">Slip</th>
                <th className="pb-3 font-bold text-on-surface-variant text-[10px] sm:text-xs uppercase tracking-wider text-center px-2">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-xs sm:text-sm">
              {displayRecords.map((mRecord, mIdx) => {
                const isExpanded = expandedMonthKey === mRecord.id;
                const otherSavings = (mRecord.investment || 0) + (mRecord.commodityPurchase || 0) + (mRecord.muslimCommunity || 0) + (mRecord.loanReimbursement || 0);

                return (
                  <React.Fragment key={mRecord.id || `month-${mIdx}`}>
                    <tr 
                      className={`group hover:bg-surface-container-low/60 transition-colors cursor-pointer ${
                        isExpanded ? 'bg-surface-container-low' : ''
                      }`}
                      onClick={() => onToggleExpand(mRecord.id)}
                    >
                      {/* Month Column with Ascending Step Number */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary font-mono font-bold text-xs flex items-center justify-center shrink-0">
                            {mIdx + 1}
                          </div>
                          <div>
                            <span className="font-bold text-on-surface block group-hover:text-primary transition-colors">
                              {mRecord.month}
                            </span>
                            <span className="text-[10px] text-on-surface-variant">
                              {mRecord.date}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Ordinary Savings */}
                      <td className="py-3.5 px-3 font-mono font-bold text-on-surface text-right whitespace-nowrap">
                        ₦{Number(mRecord.ordinarySavings || 0).toLocaleString()}
                      </td>

                      {/* Special Savings */}
                      <td className="py-3.5 px-3 font-mono text-on-surface-variant text-right whitespace-nowrap">
                        ₦{Number(mRecord.specialSavings || 0).toLocaleString()}
                      </td>

                      {/* Investment & Other Accounts */}
                      <td className="py-3.5 px-3 font-mono text-on-surface-variant text-right whitespace-nowrap">
                        ₦{Number(otherSavings).toLocaleString()}
                      </td>

                      {/* Total Deducted in this Month */}
                      <td className="py-3.5 px-3 font-mono font-extrabold text-primary text-right whitespace-nowrap">
                        ₦{Number(mRecord.total || 0).toLocaleString()}
                      </td>

                      {/* Clearance Status */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary-container text-on-primary-container border border-primary/20">
                          <CheckCircle2 size={11} className="text-primary" />
                          <span>{mRecord.status || 'Verified'}</span>
                        </span>
                      </td>

                      {/* Monthly Deduction Slip Action */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => onViewSlip && onViewSlip(mRecord)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-surface-container-low hover:bg-surface-container text-primary border border-outline-variant/50 text-[11px] font-bold transition cursor-pointer"
                          title="View Official Monthly Deduction Advice Slip"
                        >
                          <FileText size={12} />
                          <span>Slip</span>
                        </button>
                      </td>

                      {/* Expand Chevron */}
                      <td className="py-3.5 px-2 text-center text-on-surface-variant">
                        <div className="inline-flex p-1 rounded-md group-hover:bg-surface-container">
                          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </div>
                      </td>
                    </tr>

                    {/* Expandable Itemized Ledger Breakdown */}
                    {isExpanded && (
                      <tr className="bg-surface-container-low/40">
                        <td colSpan={8} className="p-4 sm:p-5">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-2">
                              <span className="text-xs font-bold text-on-surface uppercase tracking-wider">
                                Itemized Deductions for {mRecord.month}
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onViewSlip && onViewSlip(mRecord);
                                  }}
                                  className="text-xs text-primary font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                                >
                                  <Printer size={12} />
                                  <span>Print Month Slip</span>
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3">
                              <div className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/40">
                                <span className="text-[10px] font-bold text-on-surface-variant uppercase block">Ordinary Savings</span>
                                <span className="font-mono font-bold text-on-surface text-xs sm:text-sm">
                                  ₦{Number(mRecord.ordinarySavings || 0).toLocaleString()}
                                </span>
                              </div>
                              <div className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/40">
                                <span className="text-[10px] font-bold text-on-surface-variant uppercase block">Special Savings</span>
                                <span className="font-mono font-bold text-on-surface text-xs sm:text-sm">
                                  ₦{Number(mRecord.specialSavings || 0).toLocaleString()}
                                </span>
                              </div>
                              <div className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/40">
                                <span className="text-[10px] font-bold text-on-surface-variant uppercase block">Investment Account</span>
                                <span className="font-mono font-bold text-on-surface text-xs sm:text-sm">
                                  ₦{Number(mRecord.investment || 0).toLocaleString()}
                                </span>
                              </div>
                              <div className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/40">
                                <span className="text-[10px] font-bold text-on-surface-variant uppercase block">Commodity Account</span>
                                <span className="font-mono font-bold text-on-surface text-xs sm:text-sm">
                                  ₦{Number(mRecord.commodityPurchase || 0).toLocaleString()}
                                </span>
                              </div>
                              <div className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/40">
                                <span className="text-[10px] font-bold text-on-surface-variant uppercase block">Muslim Community</span>
                                <span className="font-mono font-bold text-on-surface text-xs sm:text-sm">
                                  ₦{Number(mRecord.muslimCommunity || 0).toLocaleString()}
                                </span>
                              </div>
                              <div className="bg-primary/10 p-3 rounded-xl border border-primary/20">
                                <span className="text-[10px] font-bold text-primary uppercase block">Month Total</span>
                                <span className="font-mono font-bold text-primary text-xs sm:text-sm">
                                  ₦{Number(mRecord.total || 0).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-12 px-4 text-center bg-surface-container-low rounded-xl border border-outline-variant/40 flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
            <Calendar size={22} />
          </div>
          <h3 className="font-bold text-on-surface text-sm sm:text-base">No Monthly Savings Records Found</h3>
          <p className="text-xs text-on-surface-variant max-w-md mt-1 mb-4 leading-relaxed">
            {selectedYear !== 'all' 
              ? `No monthly deduction records found for the year ${selectedYear}. Try switching to "All Years".` 
              : 'Your monthly cooperative deductions and account allocations will appear here month by month in ascending chronological order once processed by the Bursary.'}
          </p>
          <div className="flex items-center gap-2">
            {selectedYear !== 'all' ? (
              <button
                type="button"
                onClick={() => setSelectedYear('all')}
                className="px-3.5 py-1.5 bg-primary text-on-primary text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Show All Years
              </button>
            ) : (
              <button
                type="button"
                onClick={onSwitchToAllActivity}
                className="px-3.5 py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
              >
                <Layers size={13} />
                <span>Check All Activity Log</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
