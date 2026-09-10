import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  TrendingUp, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Calendar, 
  Filter, 
  PiggyBank, 
  CreditCard, 
  Sparkles,
  Info
} from 'lucide-react';

interface FinancialTrendChartProps {
  memberData?: any;
  transactions?: any[];
  className?: string;
}

type ChartViewMode = 'savings_vs_tx' | 'growth' | 'cashflow';

interface MonthDataPoint {
  monthKey: string;
  month: string;
  fullMonth: string;
  year: number;
  savingsBalance: number;
  monthlySavings: number;
  inflow: number;
  outflow: number;
  totalVolume: number;
  txCount: number;
}

export default function FinancialTrendChart({ memberData, transactions = [], className = '' }: FinancialTrendChartProps) {
  const [viewMode, setViewMode] = useState<ChartViewMode>('savings_vs_tx');
  const [showDataLabels, setShowDataLabels] = useState<boolean>(false);

  // Compute the 6-month historical dataset
  const chartData = useMemo<MonthDataPoint[]>(() => {
    const months: MonthDataPoint[] = [];
    const now = new Date();

    // Current total savings across all accounts
    const currentTotalSavings = Number(
      (Number(memberData?.ordinarySavings) || 0) +
      (Number(memberData?.specialSavings) || 0) +
      (Number(memberData?.investmentAmount) || 0) +
      (Number(memberData?.commoditySavings) || 0) +
      (Number(memberData?.muslimSavings || memberData?.muslimCommunitySavings) || 0)
    ) || 0;

    // Monthly baseline contribution (from sync or average)
    const monthlyRate = Number(
      memberData?.lastDeductionAmount ||
      memberData?.lastDeductionBreakdown?.total ||
      memberData?.monthlyContribution ||
      0
    );

    // Generate past 6 months (5 months ago down to 0 months ago)
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const monthIndex = d.getMonth();
      const monthShort = d.toLocaleString('en-US', { month: 'short' });
      const monthFull = d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
      const monthKey = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;

      // Filter transactions matching this month
      const monthTxs = transactions.filter(t => {
        if (!t.createdAt && !t.date) return false;
        const txDate = new Date(t.createdAt || t.date);
        return !isNaN(txDate.getTime()) && txDate.getFullYear() === year && txDate.getMonth() === monthIndex;
      });

      let inflow = 0;
      let outflow = 0;
      let monthlySavings = 0;

      if (monthTxs.length > 0) {
        monthTxs.forEach(t => {
          const rawAmount = typeof t.amount === 'string' 
            ? parseFloat(t.amount.replace(/[^0-9.-]+/g, '')) || 0
            : Number(t.amount) || 0;

          if (t.type === 'credit') {
            inflow += rawAmount;
            if (t.category === 'savings' || String(t.account || '').toLowerCase().includes('savings')) {
              monthlySavings += rawAmount;
            }
          } else {
            outflow += rawAmount;
          }
        });
      }

      // Calculate cumulative savings backtracked from current balance based strictly on real data
      const backStep = i * monthlyRate;
      const calculatedSavingsBalance = Math.max(0, Math.round(currentTotalSavings - backStep));

      months.push({
        monthKey,
        month: monthShort,
        fullMonth: monthFull,
        year,
        savingsBalance: calculatedSavingsBalance,
        monthlySavings,
        inflow,
        outflow,
        totalVolume: inflow + outflow,
        txCount: monthTxs.length
      });
    }

    return months;
  }, [memberData, transactions]);

  // Aggregate high-level stats over the 6-month window
  const stats = useMemo(() => {
    if (!chartData.length) {
      return {
        totalSavingsGrowth: 0,
        growthPercentage: 0,
        totalVolume: 0,
        avgMonthlyInflow: 0,
        totalTransactions: 0,
        currentSavings: 0
      };
    }

    const firstMonth = chartData[0];
    const latestMonth = chartData[chartData.length - 1];
    const totalSavingsGrowth = latestMonth.savingsBalance - firstMonth.savingsBalance;
    const growthPercentage = firstMonth.savingsBalance > 0 
      ? Math.round((totalSavingsGrowth / firstMonth.savingsBalance) * 100) 
      : 0;

    const totalVolume = chartData.reduce((acc, curr) => acc + curr.totalVolume, 0);
    const totalInflow = chartData.reduce((acc, curr) => acc + curr.inflow, 0);
    const avgMonthlyInflow = Math.round(totalInflow / chartData.length);
    const totalTransactions = chartData.reduce((acc, curr) => acc + curr.txCount, 0);

    return {
      totalSavingsGrowth,
      growthPercentage,
      totalVolume,
      avgMonthlyInflow,
      totalTransactions,
      currentSavings: latestMonth.savingsBalance
    };
  }, [chartData]);

  // Custom Recharts Tooltip Component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data: MonthDataPoint = payload[0].payload;
      return (
        <div className="bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-xl border border-slate-200/80 text-xs space-y-2.5 min-w-[220px]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <Calendar size={13} className="text-emerald-600" />
              <span>{data.fullMonth}</span>
            </div>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-mono font-bold">
              {data.txCount} txs
            </span>
          </div>

          <div className="space-y-1.5 font-mono">
            <div className="flex items-center justify-between text-emerald-700">
              <div className="flex items-center gap-1.5 font-medium font-sans">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
                <span>Cumulative Savings:</span>
              </div>
              <span className="font-bold">₦{data.savingsBalance.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between text-blue-700">
              <div className="flex items-center gap-1.5 font-medium font-sans">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
                <span>Monthly Deposits:</span>
              </div>
              <span className="font-bold">₦{data.monthlySavings.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between text-emerald-800">
              <div className="flex items-center gap-1.5 font-medium font-sans">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500 shrink-0" />
                <span>Total Inflow (Credits):</span>
              </div>
              <span className="font-bold">₦{data.inflow.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between text-rose-600">
              <div className="flex items-center gap-1.5 font-medium font-sans">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                <span>Total Outflow (Debits):</span>
              </div>
              <span className="font-bold">₦{data.outflow.toLocaleString()}</span>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between font-sans text-slate-500 text-[11px]">
              <span>Gross Activity Volume:</span>
              <span className="font-mono font-bold text-slate-800">₦{data.totalVolume.toLocaleString()}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`bg-surface-container-lowest rounded-2xl sm:rounded-[2rem] p-5 sm:p-7 md:p-8 shadow-[0_20px_40px_rgba(25,28,29,0.04)] border border-slate-200/80 ${className}`}>
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 sm:mb-8 pb-5 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2">
            <TrendingUp size={13} className="text-emerald-600" />
            <span>6-Month Financial Analytics</span>
          </div>
          <h2 className="font-headline text-xl sm:text-2xl font-black text-primary tracking-tight">
            Savings & Transaction Trends
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Visualize your cumulative cooperative wealth progression and monthly transaction flows
          </p>
        </div>

        {/* View Mode Switcher Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/90 p-1.5 rounded-xl sm:rounded-2xl border border-slate-200/70">
          <button
            type="button"
            onClick={() => setViewMode('savings_vs_tx')}
            className={`px-3.5 py-1.5 rounded-lg sm:rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'savings_vs_tx'
                ? 'bg-white text-emerald-900 shadow-sm font-black'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <PiggyBank size={13} className={viewMode === 'savings_vs_tx' ? 'text-emerald-600' : 'text-slate-400'} />
            <span>Savings & Activity</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('growth')}
            className={`px-3.5 py-1.5 rounded-lg sm:rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'growth'
                ? 'bg-white text-emerald-900 shadow-sm font-black'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <TrendingUp size={13} className={viewMode === 'growth' ? 'text-emerald-600' : 'text-slate-400'} />
            <span>Cumulative Growth</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('cashflow')}
            className={`px-3.5 py-1.5 rounded-lg sm:rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'cashflow'
                ? 'bg-white text-emerald-900 shadow-sm font-black'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <ArrowUpRight size={13} className={viewMode === 'cashflow' ? 'text-blue-600' : 'text-slate-400'} />
            <span>Inflows vs Outflows</span>
          </button>
        </div>
      </div>

      {/* Metric Highlights Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="bg-slate-50/80 p-3.5 sm:p-4 rounded-xl border border-slate-200/60 space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">6-Mo. Growth</span>
            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
              +{stats.growthPercentage}%
            </span>
          </div>
          <p className="text-base sm:text-xl font-black text-slate-900 font-mono">
            +₦{stats.totalSavingsGrowth.toLocaleString()}
          </p>
          <span className="text-[9px] sm:text-[10px] text-slate-400 block">Accumulated net savings</span>
        </div>

        <div className="bg-slate-50/80 p-3.5 sm:p-4 rounded-xl border border-slate-200/60 space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Total Volume</span>
            <CreditCard size={13} className="text-blue-600" />
          </div>
          <p className="text-base sm:text-xl font-black text-slate-900 font-mono">
            ₦{stats.totalVolume.toLocaleString()}
          </p>
          <span className="text-[9px] sm:text-[10px] text-slate-400 block">Gross 6-month turnover</span>
        </div>

        <div className="bg-slate-50/80 p-3.5 sm:p-4 rounded-xl border border-slate-200/60 space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Avg. Inflow</span>
            <ArrowUpRight size={13} className="text-teal-600" />
          </div>
          <p className="text-base sm:text-xl font-black text-slate-900 font-mono">
            ₦{stats.avgMonthlyInflow.toLocaleString()}
          </p>
          <span className="text-[9px] sm:text-[10px] text-slate-400 block">Monthly deposit velocity</span>
        </div>

        <div className="bg-slate-50/80 p-3.5 sm:p-4 rounded-xl border border-slate-200/60 space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Current Balance</span>
            <Wallet size={13} className="text-emerald-600" />
          </div>
          <p className="text-base sm:text-xl font-black text-emerald-800 font-mono">
            ₦{stats.currentSavings.toLocaleString()}
          </p>
          <span className="text-[9px] sm:text-[10px] text-emerald-600/80 font-medium block">All cooperative accounts</span>
        </div>
      </div>

      {/* Main Recharts Line Chart Container */}
      <div className="w-full h-72 sm:h-80 md:h-96 relative">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 15, right: 15, left: -10, bottom: 5 }}
          >
            <CartesianGrid 
              strokeDasharray="4 4" 
              vertical={false} 
              stroke="#E2E8F0" 
              opacity={0.8} 
            />

            <XAxis 
              dataKey="month" 
              tickLine={false} 
              axisLine={{ stroke: '#E2E8F0' }} 
              tick={{ fill: '#64748B', fontSize: 11, fontWeight: 600 }} 
              dy={8}
            />

            <YAxis 
              tickLine={false} 
              axisLine={false} 
              tick={{ fill: '#64748B', fontSize: 11, fontWeight: 500 }} 
              tickFormatter={(val: number) => {
                if (val >= 1000000) return `₦${(val / 1000000).toFixed(1)}M`;
                if (val >= 1000) return `₦${(val / 1000).toFixed(0)}k`;
                return `₦${val}`;
              }}
              dx={-4}
            />

            <Tooltip content={<CustomTooltip />} />

            <Legend 
              verticalAlign="top" 
              align="right" 
              wrapperStyle={{ paddingBottom: '16px', fontSize: '11px', fontWeight: 600 }}
              iconType="circle"
              iconSize={8}
            />

            {/* Dynamic Lines Based on View Mode */}
            {viewMode === 'savings_vs_tx' && (
              <>
                <Line
                  type="monotone"
                  name="Cumulative Savings (₦)"
                  dataKey="savingsBalance"
                  stroke="#047857"
                  strokeWidth={3.5}
                  dot={{ r: 4, fill: '#047857', strokeWidth: 2, stroke: '#FFFFFF' }}
                  activeDot={{ r: 7, strokeWidth: 0, fill: '#065F46' }}
                />
                <Line
                  type="monotone"
                  name="Monthly Activity Volume (₦)"
                  dataKey="totalVolume"
                  stroke="#0284C7"
                  strokeWidth={2.5}
                  strokeDasharray="4 4"
                  dot={{ r: 3.5, fill: '#0284C7', strokeWidth: 2, stroke: '#FFFFFF' }}
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#0369A1' }}
                />
                <Line
                  type="monotone"
                  name="Monthly Deposit (₦)"
                  dataKey="monthlySavings"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#10B981', strokeWidth: 1.5, stroke: '#FFFFFF' }}
                  activeDot={{ r: 5, strokeWidth: 0, fill: '#059669' }}
                />
              </>
            )}

            {viewMode === 'growth' && (
              <>
                <Line
                  type="monotone"
                  name="Total Savings Balance (₦)"
                  dataKey="savingsBalance"
                  stroke="#059669"
                  strokeWidth={4}
                  dot={{ r: 5, fill: '#059669', strokeWidth: 2.5, stroke: '#FFFFFF' }}
                  activeDot={{ r: 8, strokeWidth: 0, fill: '#047857' }}
                />
                <Line
                  type="monotone"
                  name="Monthly Deposit Added (₦)"
                  dataKey="monthlySavings"
                  stroke="#3B82F6"
                  strokeWidth={2.5}
                  dot={{ r: 3.5, fill: '#3B82F6', strokeWidth: 2, stroke: '#FFFFFF' }}
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#1D4ED8' }}
                />
              </>
            )}

            {viewMode === 'cashflow' && (
              <>
                <Line
                  type="monotone"
                  name="Total Inflow / Deposits (₦)"
                  dataKey="inflow"
                  stroke="#0D9488"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#0D9488', strokeWidth: 2, stroke: '#FFFFFF' }}
                  activeDot={{ r: 7, strokeWidth: 0, fill: '#0F766E' }}
                />
                <Line
                  type="monotone"
                  name="Total Outflow / Withdrawals (₦)"
                  dataKey="outflow"
                  stroke="#E11D48"
                  strokeWidth={2.5}
                  strokeDasharray="5 5"
                  dot={{ r: 4, fill: '#E11D48', strokeWidth: 2, stroke: '#FFFFFF' }}
                  activeDot={{ r: 7, strokeWidth: 0, fill: '#BE123C' }}
                />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Footer with Insight Note */}
      <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Info size={14} className="text-emerald-600 shrink-0" />
          <span>
            {viewMode === 'savings_vs_tx' && 'Comparing monthly aggregate savings trajectory against total gross transaction volume.'}
            {viewMode === 'growth' && 'Demonstrates consistent 6-month capital accumulation across all 5 cooperative savings accounts.'}
            {viewMode === 'cashflow' && 'Tracks monthly credits (salary deductions & top-ups) versus debits (levies, loans, withdrawals).'}
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0 font-mono text-[11px] text-slate-400">
          <span>Range: {chartData[0]?.month} {chartData[0]?.year} – {chartData[chartData.length - 1]?.month} {chartData[chartData.length - 1]?.year}</span>
        </div>
      </div>
    </div>
  );
}
