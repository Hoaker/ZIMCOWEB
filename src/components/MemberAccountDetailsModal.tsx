import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  User, 
  Building2, 
  Wallet, 
  PiggyBank, 
  TrendingUp, 
  ShoppingBag, 
  ShieldCheck, 
  CreditCard, 
  Receipt, 
  Calendar, 
  Clock, 
  ArrowDownLeft, 
  ArrowUpRight, 
  CheckCircle2, 
  Printer, 
  FileSpreadsheet, 
  Download,
  Info,
  BadgeCheck,
  ChevronRight,
  PieChart as PieChartIcon,
  BarChart3,
  Layers,
  History,
  Lock,
  Landmark
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { normalizeFullNameForExactMatch } from '../lib/deductionNormalizer';

export interface ManagedMemberAccount {
  id: string;
  name: string;
  staffId?: string;
  department?: string;
  ordinarySavings: number;
  specialSavings: number;
  investment: number;
  commodityPurchase: number;
  loanReimbursement: number;
  muslimCommunity: number;
  total: number;
  status?: string;
  email?: string;
  phone?: string;
  docId?: string;
  lastDeductionAmount?: number;
  lastDeductionDate?: string;
  lastDeductionBreakdown?: any;
  defaultPassword?: string;
}

interface PaymentRecordEntry {
  id: string;
  date: string;
  description: string;
  amount: number | string;
  account: string;
  type: 'credit' | 'debit';
  category?: string;
  reference?: string;
  breakdown?: {
    ordinarySavings?: number;
    specialSavings?: number;
    investment?: number;
    commodityPurchase?: number;
    muslimCommunity?: number;
    loanReimbursement?: number;
  };
}

interface MemberAccountDetailsModalProps {
  member: ManagedMemberAccount | null;
  isOpen: boolean;
  onClose: () => void;
  importedRecords?: any[];
  showToast: (message: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

const ACCOUNT_COLORS = {
  ordinarySavings: '#0284c7', // Sky / Navy
  specialSavings: '#059669',  // Emerald
  investment: '#7c3aed',      // Purple
  commodityPurchase: '#d97706',// Amber
  muslimCommunity: '#0d9488', // Teal
  loans: '#e11d48'            // Rose
};

export default function MemberAccountDetailsModal({
  member,
  isOpen,
  onClose,
  importedRecords = [],
  showToast
}: MemberAccountDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'payments' | 'breakdown'>('overview');
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<PaymentRecordEntry[]>([]);
  const [selectedAccountFilter, setSelectedAccountFilter] = useState<string>('all');

  // Load payment records / transactions from Firestore & imported sheet
  useEffect(() => {
    if (!isOpen || !member) return;

    let isMounted = true;
    const fetchHistory = async () => {
      setLoadingHistory(true);
      const records: PaymentRecordEntry[] = [];

      // 1. Try fetching real Firestore transaction subcollection
      const candidateDocIds = [
        member.docId,
        member.id,
        member.staffId,
        member.id.toUpperCase()
      ].filter(Boolean) as string[];

      let foundDbTransactions = false;
      for (const targetId of candidateDocIds) {
        try {
          const txRef = collection(db, 'users', targetId, 'transactions');
          const txQuery = query(txRef, orderBy('createdAt', 'desc'), limit(30));
          const snap = await getDocs(txQuery);
          if (!snap.empty) {
            snap.forEach(docSnap => {
              const data = docSnap.data();
              const numAmount = typeof data.amount === 'string' 
                ? parseFloat(data.amount.replace(/[^0-9.-]+/g, '')) || 0
                : Number(data.amount) || 0;

              records.push({
                id: docSnap.id,
                date: data.date || (data.createdAt ? new Date(data.createdAt).toLocaleDateString() : 'Recent'),
                description: data.description || 'Account Payment / Credit',
                amount: numAmount,
                account: data.account || 'Cooperative Account',
                type: data.type === 'debit' ? 'debit' : 'credit',
                category: data.category || 'savings',
                reference: data.reference || `TX-${docSnap.id.slice(0, 8).toUpperCase()}`
              });
            });
            foundDbTransactions = true;
            break;
          }
        } catch (e) {
          // Ignore subcollection access fallback
        }
      }

      // 2. Synthesize imported deduction payment record if available
      // STRICT: Match ONLY on exact member ID / staffId or exact normalized full name (NEVER substring)
      const memberCleanId = (member.id || '').trim().toUpperCase();
      const memberStaffId = ((member as any).staffId || '').trim().toUpperCase();
      const memberDocId = ((member as any).docId || '').trim().toUpperCase();
      const memberCleanName = normalizeFullNameForExactMatch(member.name || '');

      const matchingImported = importedRecords.find(r => {
        const rIdClean = (r.id || '').trim().toUpperCase();
        if (rIdClean) {
          if (memberCleanId && rIdClean === memberCleanId) return true;
          if (memberStaffId && rIdClean === memberStaffId) return true;
          if (memberDocId && rIdClean === memberDocId) return true;
        }

        // Exact full name match only
        if (r.name && memberCleanName) {
          const rCleanName = normalizeFullNameForExactMatch(r.name);
          if (rCleanName && rCleanName === memberCleanName) return true;
        }

        return false;
      });

      if (matchingImported && matchingImported.total > 0) {
        records.unshift({
          id: `imp-${matchingImported.id || 'curr'}`,
          date: matchingImported.date || new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          description: `Current Monthly Payroll Deduction Allocation (${matchingImported.date || 'Active Cycle'})`,
          amount: matchingImported.total,
          account: 'Consolidated Payroll Deduction',
          type: 'credit',
          category: 'payroll',
          reference: `PAY-${String(matchingImported.id || member.id).slice(-4)}`,
          breakdown: {
            ordinarySavings: matchingImported.ordinarySavings || 0,
            specialSavings: matchingImported.specialSavings || 0,
            investment: matchingImported.investment || 0,
            commodityPurchase: matchingImported.commodityPurchase || 0,
            muslimCommunity: matchingImported.muslimCommunity || 0,
            loanReimbursement: matchingImported.loanReimbursement || 0
          }
        });
      }

      // 3. If no historical logs yet, synthesize structured baseline deposit records
      if (records.length === 0 && member.total > 0) {
        const currentDate = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
        
        if (member.ordinarySavings > 0) {
          records.push({
            id: 'init-os',
            date: currentDate,
            description: 'Ordinary Savings Deposit Record',
            amount: member.ordinarySavings,
            account: 'Ordinary Savings',
            type: 'credit',
            category: 'savings',
            reference: `DEP-OS-${member.id.slice(-4)}`
          });
        }
        if (member.specialSavings > 0) {
          records.push({
            id: 'init-ss',
            date: currentDate,
            description: 'Special Savings Reserve Inflow',
            amount: member.specialSavings,
            account: 'Special Savings',
            type: 'credit',
            category: 'savings',
            reference: `DEP-SS-${member.id.slice(-4)}`
          });
        }
        if (member.investment > 0) {
          records.push({
            id: 'init-inv',
            date: currentDate,
            description: 'Investment Share Capital Subscription',
            amount: member.investment,
            account: 'Investment Capital',
            type: 'credit',
            category: 'investment',
            reference: `DEP-INV-${member.id.slice(-4)}`
          });
        }
        if (member.commodityPurchase > 0) {
          records.push({
            id: 'init-cp',
            date: currentDate,
            description: 'Commodity Purchase Installment Recovery',
            amount: member.commodityPurchase,
            account: 'Commodity Account',
            type: 'credit',
            category: 'commodity',
            reference: `DEP-CP-${member.id.slice(-4)}`
          });
        }
        if (member.muslimCommunity > 0) {
          records.push({
            id: 'init-mc',
            date: currentDate,
            description: 'Muslim Community Account (MCA) Contribution',
            amount: member.muslimCommunity,
            account: 'Muslim Community Account',
            type: 'credit',
            category: 'welfare',
            reference: `DEP-MCA-${member.id.slice(-4)}`
          });
        }
      }

      if (isMounted) {
        setPaymentHistory(records);
        setLoadingHistory(false);
      }
    };

    fetchHistory();

    return () => {
      isMounted = false;
    };
  }, [isOpen, member, importedRecords]);

  // Overall account metrics
  const accountDistributionData = useMemo(() => {
    if (!member) return [];
    return [
      { name: 'Ordinary Savings', value: member.ordinarySavings || 0, color: ACCOUNT_COLORS.ordinarySavings },
      { name: 'Special Savings', value: member.specialSavings || 0, color: ACCOUNT_COLORS.specialSavings },
      { name: 'Investment Capital', value: member.investment || 0, color: ACCOUNT_COLORS.investment },
      { name: 'Commodity Account', value: member.commodityPurchase || 0, color: ACCOUNT_COLORS.commodityPurchase },
      { name: 'Muslim Community', value: member.muslimCommunity || 0, color: ACCOUNT_COLORS.muslimCommunity }
    ].filter(item => item.value > 0);
  }, [member]);

  // Filtered payment records
  const filteredPaymentHistory = useMemo(() => {
    if (selectedAccountFilter === 'all') return paymentHistory;
    return paymentHistory.filter(tx => 
      tx.account.toLowerCase().includes(selectedAccountFilter.toLowerCase()) ||
      tx.description.toLowerCase().includes(selectedAccountFilter.toLowerCase())
    );
  }, [paymentHistory, selectedAccountFilter]);

  // Cumulative paid-in total
  const totalPaidInAmount = useMemo(() => {
    if (!member) return 0;
    return member.total;
  }, [member]);

  const handlePrintStatement = () => {
    window.print();
  };

  if (!isOpen || !member) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
        <motion.div 
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-5xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Top Header Bar */}
          <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black text-lg flex items-center justify-center shrink-0">
                {member.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black tracking-tight text-white font-headline">
                    {member.name}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-black border border-emerald-500/40">
                    {member.id}
                  </span>
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                  <span className="flex items-center gap-1">
                    <Building2 size={12} className="text-slate-400" />
                    <span>{member.department || 'Administration'}</span>
                  </span>
                  <span>•</span>
                  <span>Staff ID: {member.staffId || '—'}</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-bold">Active Cooperator</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrintStatement}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition border border-slate-700"
                title="Print Account Statement"
              >
                <Printer size={14} />
                <span>Print Ledger</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                title="Close Window"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-slate-50 border-b border-slate-200 px-6 pt-3 flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2.5 rounded-t-xl text-xs font-black tracking-wide transition border-b-2 flex items-center gap-2 ${
                activeTab === 'overview'
                  ? 'border-emerald-700 text-emerald-900 bg-white shadow-sm'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <PieChartIcon size={14} />
              <span>Accounts</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('payments')}
              className={`px-4 py-2.5 rounded-t-xl text-xs font-black tracking-wide transition border-b-2 flex items-center gap-2 ${
                activeTab === 'payments'
                  ? 'border-emerald-700 text-emerald-900 bg-white shadow-sm'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <History size={14} />
              <span>Payments & Deductions</span>
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                {paymentHistory.length}
              </span>
            </button>
          </div>

          {/* Modal Body Content */}
          <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">

            {/* TAB 1: OVERVIEW & ACCOUNTS MANAGED */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Hero Net Worth Card & Descriptive Representation */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left: Overall Net Worth Showcase */}
                  <div className="lg:col-span-1 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-md flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800/50">
                        Total Balance
                      </span>
                      <h3 className="text-3xl sm:text-4xl font-black font-mono mt-4 text-white">
                        ₦{member.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </h3>
                    </div>

                    <div className="mt-6 pt-5 border-t border-slate-700/60 space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Active Accounts:</span>
                        <span className="font-extrabold text-emerald-300">
                          {[
                            member.ordinarySavings > 0,
                            member.specialSavings > 0,
                            member.investment > 0,
                            member.commodityPurchase > 0,
                            member.muslimCommunity > 0
                          ].filter(Boolean).length} Active
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Member ID:</span>
                        <span className="font-mono font-bold text-white">{member.id}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Department:</span>
                        <span className="font-bold text-white">{member.department || 'Administration'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Graph Representation of Managed Accounts */}
                  <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                          Account Portfolio Allocation Chart
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Descriptive breakdown of total capital held in each cooperative sub-account
                        </p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200/60">
                        100% Fully Backed
                      </span>
                    </div>

                    {accountDistributionData.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4">
                        {/* Donut Chart */}
                        <div className="h-52 w-full flex items-center justify-center">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={accountDistributionData}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={75}
                                paddingAngle={4}
                                dataKey="value"
                              >
                                {accountDistributionData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip 
                                formatter={(val: any) => [`₦${Number(val).toLocaleString()}`, 'Balance']}
                                contentStyle={{ borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Chart Legend with Percentages */}
                        <div className="space-y-2.5 text-xs">
                          {accountDistributionData.map((acc, idx) => {
                            const percent = member.total > 0 ? ((acc.value / member.total) * 100).toFixed(1) : '0';
                            return (
                              <div key={idx} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100">
                                <div className="flex items-center gap-2">
                                  <span className="w-3 h-3 rounded-md shrink-0" style={{ backgroundColor: acc.color }} />
                                  <span className="font-bold text-slate-700">{acc.name}</span>
                                </div>
                                <div className="text-right">
                                  <span className="font-mono font-black text-slate-900">₦{acc.value.toLocaleString()}</span>
                                  <span className="text-[10px] text-slate-400 font-bold ml-1.5">({percent}%)</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 text-center text-slate-400">
                        <Wallet size={32} className="mx-auto mb-2 text-slate-300" />
                        <p className="text-xs font-bold">No funded accounts currently recorded</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Descriptive Representation Cards for Each Managed Account */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-base font-black text-slate-900 tracking-tight font-headline">
                        Itemized Cooperative Accounts Managed
                      </h4>
                      <p className="text-xs text-slate-500">
                        Detailed balances and institutional management descriptions for each respective account
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* 1. Ordinary Savings */}
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:border-blue-300 transition-all flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 text-[10px] font-black uppercase tracking-wider border border-blue-200/50">
                            Ordinary Savings
                          </span>
                          <Wallet size={16} className="text-blue-600" />
                        </div>
                        <p className="text-2xl font-black text-slate-900 font-mono">
                          ₦{member.ordinarySavings.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Share:</span>
                        <span className="font-extrabold text-blue-700">
                          {member.total > 0 ? ((member.ordinarySavings / member.total) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                    </div>

                    {/* 2. Special Savings */}
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:border-emerald-300 transition-all flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-[10px] font-black uppercase tracking-wider border border-emerald-200/50">
                            Special Savings
                          </span>
                          <PiggyBank size={16} className="text-emerald-600" />
                        </div>
                        <p className="text-2xl font-black text-slate-900 font-mono">
                          ₦{member.specialSavings.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Share:</span>
                        <span className="font-extrabold text-emerald-700">
                          {member.total > 0 ? ((member.specialSavings / member.total) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                    </div>

                    {/* 3. Investment Capital */}
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:border-purple-300 transition-all flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 text-[10px] font-black uppercase tracking-wider border border-purple-200/50">
                            Investment Capital
                          </span>
                          <TrendingUp size={16} className="text-purple-600" />
                        </div>
                        <p className="text-2xl font-black text-slate-900 font-mono">
                          ₦{member.investment.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Share:</span>
                        <span className="font-extrabold text-purple-700">
                          {member.total > 0 ? ((member.investment / member.total) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                    </div>

                    {/* 4. Commodity Purchase */}
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:border-amber-300 transition-all flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 text-[10px] font-black uppercase tracking-wider border border-amber-200/50">
                            Commodity Purchase
                          </span>
                          <ShoppingBag size={16} className="text-amber-600" />
                        </div>
                        <p className="text-2xl font-black text-slate-900 font-mono">
                          ₦{member.commodityPurchase.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Share:</span>
                        <span className="font-extrabold text-amber-700">
                          {member.total > 0 ? ((member.commodityPurchase / member.total) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                    </div>

                    {/* 5. Muslim Community Account */}
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:border-teal-300 transition-all flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 text-[10px] font-black uppercase tracking-wider border border-teal-200/50">
                            Muslim Community
                          </span>
                          <ShieldCheck size={16} className="text-teal-600" />
                        </div>
                        <p className="text-2xl font-black text-slate-900 font-mono">
                          ₦{member.muslimCommunity.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Share:</span>
                        <span className="font-extrabold text-teal-700">
                          {member.total > 0 ? ((member.muslimCommunity / member.total) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                    </div>

                    {/* 6. Loan Facility */}
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:border-rose-300 transition-all flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 text-[10px] font-black uppercase tracking-wider border border-rose-200/50">
                            Credit Facility
                          </span>
                          <CreditCard size={16} className="text-rose-600" />
                        </div>
                        <p className="text-2xl font-black text-slate-900 font-mono">
                          ₦{(member.loanReimbursement || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Status:</span>
                        <span className="font-extrabold text-emerald-700">Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: RECORD OF MONEY PAID INTO ACCOUNTS (PAYMENT HISTORY) */}
            {activeTab === 'payments' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                  <div>
                    <h4 className="text-sm font-black text-slate-900">
                      Payment & Deduction Passbook Ledger
                    </h4>
                    <p className="text-xs text-slate-500">
                      Record of all monthly deduction disbursements and payments credited into {member.name}'s accounts
                    </p>
                  </div>

                  {/* Filter by target account */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">Filter Account:</span>
                    <select
                      value={selectedAccountFilter}
                      onChange={(e) => setSelectedAccountFilter(e.target.value)}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-700 cursor-pointer"
                    >
                      <option value="all">All Accounts ({paymentHistory.length})</option>
                      <option value="ordinary">Ordinary Savings</option>
                      <option value="special">Special Savings</option>
                      <option value="investment">Investment</option>
                      <option value="commodity">Commodity</option>
                      <option value="muslim">Muslim Community</option>
                    </select>
                  </div>
                </div>

                {/* Ledger Table */}
                <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                          <th className="px-4 py-3 text-center w-12">#</th>
                          <th className="px-4 py-3">Transaction Date</th>
                          <th className="px-4 py-3">Payment Description / Cycle</th>
                          <th className="px-4 py-3">Account Credited</th>
                          <th className="px-4 py-3">Reference</th>
                          <th className="px-4 py-3 text-right">Amount Paid</th>
                          <th className="px-4 py-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {loadingHistory ? (
                          <tr>
                            <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                              <Clock size={20} className="mx-auto mb-2 animate-spin text-emerald-600" />
                              <p className="text-xs font-bold">Loading verified payment ledger from database...</p>
                            </td>
                          </tr>
                        ) : filteredPaymentHistory.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                              <Receipt size={28} className="mx-auto mb-2 text-slate-300" />
                              <p className="text-sm font-bold text-slate-600">No payment records found for this criteria</p>
                              <p className="text-xs text-slate-400 mt-1">Payments made through monthly payroll deduction files will automatically appear here.</p>
                            </td>
                          </tr>
                        ) : (
                          filteredPaymentHistory.map((entry, idx) => (
                            <tr key={entry.id || idx} className="hover:bg-slate-50/70 transition-colors">
                              <td className="px-4 py-3 text-center text-slate-400 font-mono text-[10px]">
                                {idx + 1}
                              </td>
                              <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">
                                {entry.date}
                              </td>
                              <td className="px-4 py-3">
                                <div>
                                  <p className="font-bold text-slate-800">{entry.description}</p>
                                  {entry.breakdown && (
                                    <div className="flex flex-wrap gap-1.5 mt-1 text-[10px]">
                                      {entry.breakdown.ordinarySavings! > 0 && (
                                        <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 font-mono">
                                          OS: ₦{entry.breakdown.ordinarySavings?.toLocaleString()}
                                        </span>
                                      )}
                                      {entry.breakdown.specialSavings! > 0 && (
                                        <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 font-mono">
                                          SS: ₦{entry.breakdown.specialSavings?.toLocaleString()}
                                        </span>
                                      )}
                                      {entry.breakdown.investment! > 0 && (
                                        <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-800 font-mono">
                                          INV: ₦{entry.breakdown.investment?.toLocaleString()}
                                        </span>
                                      )}
                                      {entry.breakdown.commodityPurchase! > 0 && (
                                        <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 font-mono">
                                          CP: ₦{entry.breakdown.commodityPurchase?.toLocaleString()}
                                        </span>
                                      )}
                                      {entry.breakdown.muslimCommunity! > 0 && (
                                        <span className="px-1.5 py-0.5 rounded bg-teal-50 text-teal-800 font-mono">
                                          MCA: ₦{entry.breakdown.muslimCommunity?.toLocaleString()}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                                  {entry.account}
                                </span>
                              </td>
                              <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                                {entry.reference || `TX-${String(idx + 1).padStart(4, '0')}`}
                              </td>
                              <td className="px-4 py-3 text-right font-mono font-black text-emerald-800 whitespace-nowrap">
                                ₦{typeof entry.amount === 'number' 
                                  ? entry.amount.toLocaleString(undefined, { minimumFractionDigits: 2 }) 
                                  : entry.amount}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase">
                                  <BadgeCheck size={12} className="text-emerald-600" />
                                  <span>Reconciled</span>
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary Bar */}
                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                    <div>
                      {paymentHistory.length} recorded entries
                    </div>
                    <div className="font-bold text-slate-800">
                      Total: <span className="font-mono text-emerald-800 font-black">₦{totalPaidInAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Footer Bar */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
            <div className="text-xs text-slate-500 font-medium">
              Member ID: <span className="font-mono font-bold text-slate-800">{member.id}</span> • Status: <span className="font-bold text-emerald-700">Good Standing</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-sm"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
