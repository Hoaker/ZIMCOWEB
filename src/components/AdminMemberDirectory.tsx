import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Search, 
  Filter, 
  Building2, 
  Wallet, 
  ShieldCheck, 
  PiggyBank, 
  TrendingUp, 
  ChevronDown, 
  ChevronRight,
  Maximize2, 
  Minimize2,
  Lock,
  ArrowUpDown,
  ShoppingBag,
  CreditCard,
  PieChart as PieChartIcon,
  BarChart3,
  Eye,
  Info,
  BadgeCheck,
  CheckCircle2,
  FileSpreadsheet,
  Layers,
  Sparkles,
  ArrowRight
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
  CartesianGrid, 
  Legend 
} from 'recharts';
import MemberAccountDetailsModal, { ManagedMemberAccount } from './MemberAccountDetailsModal';
import { extractSurname, isExactOrTokenNameMatch, deriveDefaultPassword } from '../lib/deductionNormalizer';

interface AdminMemberDirectoryProps {
  importedRecords: any[];
  firestoreMembers: any[];
  onSelectMember?: (memberId: string) => void;
  showToast: (message: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

const ACCOUNT_THEMES = {
  ordinary: {
    color: '#0284c7',
    bg: 'bg-sky-50',
    text: 'text-sky-800',
    border: 'border-sky-200',
    name: 'Ordinary Savings (OS)',
    shortName: 'Ordinary Savings',
    purpose: 'Foundational non-withdrawable equity pool backing cooperative borrowing power and dividend eligibility.',
    rules: 'Mandatory monthly contribution • Non-withdrawable active equity • 100% cooperator enrollment'
  },
  special: {
    color: '#059669',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    name: 'Special Savings (SS)',
    shortName: 'Special Savings',
    purpose: 'Voluntary liquidity reserve for targeted personal projects with flexible withdrawal privileges upon 48h notice.',
    rules: 'Voluntary savings • Withdrawable on-demand • Statutory interest/surplus yield'
  },
  investment: {
    color: '#7c3aed',
    bg: 'bg-purple-50',
    text: 'text-purple-800',
    border: 'border-purple-200',
    name: 'Investment Capital (IC)',
    shortName: 'Investment Shares',
    purpose: 'Institutional equity shares invested in long-term cooperative ventures, commercial assets, and property.',
    rules: 'Equity shares capital • Annual AGM profit dividend distributions • Capital growth'
  },
  commodity: {
    color: '#d97706',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    name: 'Commodity Purchase (CP)',
    shortName: 'Commodity Account',
    purpose: 'Structured installment deduction account for bulk procurement of foodstuffs, rice, and durable household assets.',
    rules: 'Asset-backed consumer facility • Direct vendor disbursement • Structured amortization'
  },
  muslim: {
    color: '#0d9488',
    bg: 'bg-teal-50',
    text: 'text-teal-800',
    border: 'border-teal-200',
    name: 'Muslim Community (MCA)',
    shortName: 'Muslim Community',
    purpose: 'Interest-free ethical cooperator fund operating under Islamic cooperative finance principles for mutual welfare.',
    rules: 'Zero-interest (Riba-free) • Community welfare • Ethical solidarity fund'
  }
};

export default function AdminMemberDirectory({
  importedRecords,
  firestoreMembers,
  onSelectMember,
  showToast
}: AdminMemberDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [accountFilter, setAccountFilter] = useState('all');
  const [isTableExpanded, setIsTableExpanded] = useState(false);
  const [chartViewMode, setChartViewMode] = useState<'distribution' | 'comparison'>('distribution');

  // Selected member for deep account inspection modal
  const [selectedMember, setSelectedMember] = useState<ManagedMemberAccount | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Helper to normalize names for strict deduplication
  const normalizeText = (text?: string) => {
    if (!text) return '';
    return text.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
  };

  const extractSurname = (fullName?: string) => {
    if (!fullName) return '';
    const parts = fullName.trim().split(/[\s,.-]+/).filter(Boolean);
    return parts[0] ? parts[0].toLowerCase() : '';
  };

  // Robust Deduplication & Clean Aggregator:
  // Strictly prevent redundancy when members are imported via deduction spreadsheets
  const aggregatedMembers = useMemo(() => {
    const memberMap = new Map<string, ManagedMemberAccount>();
    const seenNames = new Set<string>();
    const seenEmails = new Set<string>();

    // 1. Process official Firestore database members
    firestoreMembers
      .filter(u => !u.isAlias && (u.role === 'member' || !u.role || u.isCooperator))
      .forEach((u, idx) => {
        // Skip document if it's purely a surname uppercase alias doc without digits (e.g. 'ABAS')
        const docId = String(u.id || u.docId || u.uid || '').trim();
        const isLikelySurnameAlias = /^[A-Za-z]+$/.test(docId) && !docId.startsWith('ZIM-') && !docId.startsWith('STF-') && !docId.startsWith('USR-');
        
        const rawName = u.fullName || u.name || 'Registered Cooperator';
        const cleanName = normalizeText(rawName);
        const cleanEmail = normalizeText(u.email);

        // Check if cooperator already indexed via canonical doc
        if (cleanName && seenNames.has(cleanName) && isLikelySurnameAlias) {
          return;
        }
        if (cleanEmail && seenEmails.has(cleanEmail) && isLikelySurnameAlias) {
          return;
        }

        const canonicalId = (u.memberId && u.memberId.startsWith('ZIM-')) 
          ? u.memberId 
          : (u.id && String(u.id).startsWith('ZIM-'))
            ? String(u.id)
            : `ZIM-2026-${String(idx + 1).padStart(3, '0')}`;

        const idKey = canonicalId.toUpperCase();
        
        const os = Number(u.ordinarySavings) || 0;
        const ss = Number(u.specialSavings) || 0;
        const inv = Number(u.investmentAmount ?? u.investment ?? 0);
        const cp = Number(u.commoditySavings ?? u.commodityPurchase ?? 0);
        const mc = Number(u.muslimCommunitySavings ?? u.muslimSavings ?? u.muslimCommunity ?? 0);
        const lr = Number(u.outstandingLoans ?? u.loanReimbursement ?? 0);

        const memberRecord: ManagedMemberAccount = {
          id: canonicalId,
          docId: u.docId || u.id || canonicalId,
          name: rawName,
          staffId: u.staffId || u.payrollNo || '',
          department: u.department || '',
          ordinarySavings: os,
          specialSavings: ss,
          investment: inv,
          commodityPurchase: cp,
          loanReimbursement: lr,
          muslimCommunity: mc,
          total: os + ss + inv + cp + mc,
          status: u.kycStatus || 'Active',
          email: u.email || '',
          phone: u.phone || '',
          lastDeductionAmount: Number(u.lastDeductionAmount) || 0,
          lastDeductionDate: u.lastDeductionDate || '',
          lastDeductionBreakdown: u.lastDeductionBreakdown || null,
          defaultPassword: deriveDefaultPassword(u.id || u.memberId || idKey)
        };

        memberMap.set(idKey, memberRecord);
        if (cleanName) seenNames.add(cleanName);
        if (cleanEmail) seenEmails.add(cleanEmail);
      });

    // 2. Synchronize with imported active deduction sheet records:
    // CRITICAL: DO NOT add imported deduction rows as a separate set of new members!
    // Instead, match against existing members and update their account payment figures.
    importedRecords.forEach((r) => {
      const recordIdClean = String(r.id || '').trim().toUpperCase();
      const recordStaffClean = String(r.staffId || r.id || '').trim().toUpperCase();
      const recordNameClean = normalizeText(r.name);

      // Find matching cooperator in memberMap
      let matchedKey: string | null = null;
      for (const [key, member] of memberMap.entries()) {
        const mId = member.id.toUpperCase();
        const mStaff = (member.staffId || '').toUpperCase();
        const mName = normalizeText(member.name);

        if (recordIdClean && (mId === recordIdClean || mStaff === recordIdClean)) {
          matchedKey = key;
          break;
        }
        if (recordStaffClean && (mStaff === recordStaffClean || mId === recordStaffClean)) {
          matchedKey = key;
          break;
        }
        if (recordNameClean && mName && isExactOrTokenNameMatch(r.name, member.name)) {
          matchedKey = key;
          break;
        }
      }

      if (matchedKey && memberMap.has(matchedKey)) {
        // Merge deduction info into existing member's account record
        const existing = memberMap.get(matchedKey)!;
        const os = Number(r.ordinarySavings) || existing.ordinarySavings;
        const ss = Number(r.specialSavings) || existing.specialSavings;
        const inv = Number(r.investment) || existing.investment;
        const cp = Number(r.commodityPurchase) || existing.commodityPurchase;
        const mc = Number(r.muslimCommunity) || existing.muslimCommunity;
        const lr = Number(r.loanReimbursement) || existing.loanReimbursement;

        memberMap.set(matchedKey, {
          ...existing,
          ordinarySavings: os,
          specialSavings: ss,
          investment: inv,
          commodityPurchase: cp,
          muslimCommunity: mc,
          loanReimbursement: lr,
          total: os + ss + inv + cp + mc,
          lastDeductionAmount: Number(r.total) || existing.lastDeductionAmount,
          lastDeductionDate: r.date || existing.lastDeductionDate,
          lastDeductionBreakdown: {
            ordinarySavings: r.ordinarySavings || 0,
            specialSavings: r.specialSavings || 0,
            investment: r.investment || 0,
            commodityPurchase: r.commodityPurchase || 0,
            muslimCommunity: r.muslimCommunity || 0,
            loanReimbursement: r.loanReimbursement || 0,
            total: r.total || 0,
            cycle: r.date || 'Current Cycle'
          }
        });
      }
      // If not matched, WE DO NOT CREATE A REDUNDANT SET OF NEW MEMBERS.
      // This strictly respects the user directive: "Whenever members are imported using the import deduction file, if there are new members among the list of the Excel record, don't record them as a set of new members. Make sure there's no redundancy."
    });

    return Array.from(memberMap.values());
  }, [firestoreMembers, importedRecords]);

  // Extract unique departments for filter dropdown
  const uniqueDepartments = useMemo(() => {
    const deps = new Set<string>();
    aggregatedMembers.forEach(m => {
      if (m.department) deps.add(m.department);
    });
    return Array.from(deps).sort();
  }, [aggregatedMembers]);

  // Aggregate totals across all cooperative accounts
  const totalOrdinarySavings = useMemo(() => aggregatedMembers.reduce((acc, m) => acc + m.ordinarySavings, 0), [aggregatedMembers]);
  const totalSpecialSavings = useMemo(() => aggregatedMembers.reduce((acc, m) => acc + m.specialSavings, 0), [aggregatedMembers]);
  const totalInvestment = useMemo(() => aggregatedMembers.reduce((acc, m) => acc + m.investment, 0), [aggregatedMembers]);
  const totalCommodity = useMemo(() => aggregatedMembers.reduce((acc, m) => acc + m.commodityPurchase, 0), [aggregatedMembers]);
  const totalMuslimCommunity = useMemo(() => aggregatedMembers.reduce((acc, m) => acc + m.muslimCommunity, 0), [aggregatedMembers]);
  const totalSocietyAssets = useMemo(() => aggregatedMembers.reduce((acc, m) => acc + m.total, 0), [aggregatedMembers]);

  // Active membership counts per account
  const activeOrdinaryCount = useMemo(() => aggregatedMembers.filter(m => m.ordinarySavings > 0).length, [aggregatedMembers]);
  const activeSpecialCount = useMemo(() => aggregatedMembers.filter(m => m.specialSavings > 0).length, [aggregatedMembers]);
  const activeInvestmentCount = useMemo(() => aggregatedMembers.filter(m => m.investment > 0).length, [aggregatedMembers]);
  const activeCommodityCount = useMemo(() => aggregatedMembers.filter(m => m.commodityPurchase > 0).length, [aggregatedMembers]);
  const activeMuslimCount = useMemo(() => aggregatedMembers.filter(m => m.muslimCommunity > 0).length, [aggregatedMembers]);

  // Chart data representation for cooperative account distribution
  const accountDistributionChartData = useMemo(() => {
    return [
      { name: 'Ordinary Savings', short: 'Ordinary (OS)', value: totalOrdinarySavings, color: ACCOUNT_THEMES.ordinary.color },
      { name: 'Special Savings', short: 'Special (SS)', value: totalSpecialSavings, color: ACCOUNT_THEMES.special.color },
      { name: 'Investment Capital', short: 'Investment (IC)', value: totalInvestment, color: ACCOUNT_THEMES.investment.color },
      { name: 'Commodity Purchase', short: 'Commodity (CP)', value: totalCommodity, color: ACCOUNT_THEMES.commodity.color },
      { name: 'Muslim Community', short: 'Muslim (MCA)', value: totalMuslimCommunity, color: ACCOUNT_THEMES.muslim.color }
    ].filter(item => item.value > 0);
  }, [totalOrdinarySavings, totalSpecialSavings, totalInvestment, totalCommodity, totalMuslimCommunity]);

  // Filter and sort members
  const filteredMembers = useMemo(() => {
    return aggregatedMembers
      .filter(member => {
        const matchesQuery = 
          searchQuery === '' ||
          member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          member.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (member.staffId && member.staffId.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (member.department && member.department.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesDepartment = departmentFilter === 'all' || member.department === departmentFilter;

        let matchesAccount = true;
        if (accountFilter === 'ordinary') matchesAccount = member.ordinarySavings > 0;
        if (accountFilter === 'special') matchesAccount = member.specialSavings > 0;
        if (accountFilter === 'investment') matchesAccount = member.investment > 0;
        if (accountFilter === 'commodity') matchesAccount = member.commodityPurchase > 0;
        if (accountFilter === 'muslim') matchesAccount = member.muslimCommunity > 0;

        return matchesQuery && matchesDepartment && matchesAccount;
      })
      .sort((a, b) => a.id.localeCompare(b.id));
  }, [aggregatedMembers, searchQuery, departmentFilter, accountFilter]);

  // Helper to open account details modal
  const handleOpenMemberDossier = (member: ManagedMemberAccount) => {
    setSelectedMember(member);
    setIsModalOpen(true);
    if (onSelectMember) {
      onSelectMember(member.id);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Users size={14} className="text-emerald-600" />
            <span>Cooperative Membership Registry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-headline">
            Member Directory & Accounts Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
            Roster of all {aggregatedMembers.length} enrolled cooperators displaying basic identification and managed cooperative accounts.
          </p>
        </div>

        {/* View mode toggle for descriptive representations */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200/80 shrink-0 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setChartViewMode('distribution')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              chartViewMode === 'distribution'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <PieChartIcon size={14} />
            <span>Distribution View</span>
          </button>
          <button
            type="button"
            onClick={() => setChartViewMode('comparison')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              chartViewMode === 'comparison'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <BarChart3 size={14} />
            <span>Comparison Graph</span>
          </button>
        </div>
      </div>

      {/* DESCRIPTIVE ACCOUNTS & GRAPHICAL PORTFOLIO SECTION (Replacing raw number cards) */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
              Institutional Asset Overview
            </span>
            <h3 className="text-lg font-black text-slate-900 mt-1 font-headline">
              Descriptive Accounts Portfolio & Society Distribution
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparative representation of all 5 operational accounts managed by ZIMCO Cooperative Society
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Total Society Assets</span>
            <p className="text-2xl sm:text-3xl font-black font-mono text-emerald-800">
              ₦{totalSocietyAssets.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Graphical Representation (Charts) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Chart Container */}
          <div className="lg:col-span-5 bg-slate-50/70 border border-slate-100 rounded-2xl p-5 h-72 flex flex-col justify-center items-center">
            {chartViewMode === 'distribution' ? (
              <div className="w-full h-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={accountDistributionChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {accountDistributionChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(val: any) => [`₦${Number(val).toLocaleString()}`, 'Portfolio Total']}
                      contentStyle={{ borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Badge in Donut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total Pool</span>
                  <span className="text-sm font-black font-mono text-slate-900">
                    ₦{(totalSocietyAssets / 1000000).toFixed(2)}M
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 mt-0.5">
                    {aggregatedMembers.length} Members
                  </span>
                </div>
              </div>
            ) : (
              <div className="w-full h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={accountDistributionChartData} margin={{ top: 15, right: 15, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="short" tick={{ fontSize: 10, fontWeight: 'bold', fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(val) => `₦${(val/1000000).toFixed(1)}M`} />
                    <Tooltip 
                      formatter={(val: any) => [`₦${Number(val).toLocaleString()}`, 'Total Balance']}
                      contentStyle={{ borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {accountDistributionChartData.map((entry, index) => (
                        <Cell key={`bar-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Account Summaries & Progress Weights */}
          <div className="lg:col-span-7 space-y-3.5">
            {/* 1. Ordinary Savings */}
            <div className="p-3.5 rounded-2xl bg-white border border-sky-100 shadow-xs hover:border-sky-300 transition">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                    <Wallet size={13} />
                  </div>
                  <span className="text-xs font-black text-slate-900">{ACCOUNT_THEMES.ordinary.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-black text-slate-900">
                    ₦{totalOrdinarySavings.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] font-bold text-sky-700 ml-1.5">
                    ({totalSocietyAssets > 0 ? ((totalOrdinarySavings / totalSocietyAssets) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                <div 
                  className="bg-sky-600 h-1.5 rounded-full transition-all duration-500" 
                  style={{ width: `${totalSocietyAssets > 0 ? (totalOrdinarySavings / totalSocietyAssets) * 100 : 0}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                <span>{activeOrdinaryCount} members</span>
                <span>Avg: ₦{activeOrdinaryCount > 0 ? Math.round(totalOrdinarySavings / activeOrdinaryCount).toLocaleString() : 0}/member</span>
              </div>
            </div>

            {/* 2. Special Savings */}
            <div className="p-3.5 rounded-2xl bg-white border border-emerald-100 shadow-xs hover:border-emerald-300 transition">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <PiggyBank size={13} />
                  </div>
                  <span className="text-xs font-black text-slate-900">{ACCOUNT_THEMES.special.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-black text-slate-900">
                    ₦{totalSpecialSavings.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 ml-1.5">
                    ({totalSocietyAssets > 0 ? ((totalSpecialSavings / totalSocietyAssets) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                <div 
                  className="bg-emerald-600 h-1.5 rounded-full transition-all duration-500" 
                  style={{ width: `${totalSocietyAssets > 0 ? (totalSpecialSavings / totalSocietyAssets) * 100 : 0}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                <span>{activeSpecialCount} members</span>
                <span>Avg: ₦{activeSpecialCount > 0 ? Math.round(totalSpecialSavings / activeSpecialCount).toLocaleString() : 0}/member</span>
              </div>
            </div>

            {/* 3. Investment Capital */}
            <div className="p-3.5 rounded-2xl bg-white border border-purple-100 shadow-xs hover:border-purple-300 transition">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                    <TrendingUp size={13} />
                  </div>
                  <span className="text-xs font-black text-slate-900">{ACCOUNT_THEMES.investment.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-black text-slate-900">
                    ₦{totalInvestment.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] font-bold text-purple-700 ml-1.5">
                    ({totalSocietyAssets > 0 ? ((totalInvestment / totalSocietyAssets) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                <div 
                  className="bg-purple-600 h-1.5 rounded-full transition-all duration-500" 
                  style={{ width: `${totalSocietyAssets > 0 ? (totalInvestment / totalSocietyAssets) * 100 : 0}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                <span>{activeInvestmentCount} shareholders</span>
                <span>Annual dividend surplus</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom 2 Accounts Strip (Commodity Purchase & Muslim Community Account) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Commodity Purchase */}
          <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200/70">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <ShoppingBag size={14} />
                </div>
                <div>
                  <span className="text-xs font-black text-slate-900">{ACCOUNT_THEMES.commodity.name}</span>
                  <p className="text-[11px] text-slate-500">{activeCommodityCount} active members</p>
                </div>
              </div>
              <span className="text-sm font-mono font-black text-amber-900">
                ₦{totalCommodity.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Muslim Community Account */}
          <div className="p-4 rounded-2xl bg-teal-50/40 border border-teal-200/70">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
                  <ShieldCheck size={14} />
                </div>
                <div>
                  <span className="text-xs font-black text-slate-900">{ACCOUNT_THEMES.muslim.name}</span>
                  <p className="text-[11px] text-slate-500">{activeMuslimCount} members</p>
                </div>
              </div>
              <span className="text-sm font-mono font-black text-teal-900">
                ₦{totalMuslimCommunity.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* REDESIGNED MEMBER DIRECTORY INTERFACE: ONLY BASIC INFORMATION */}
      <div className={`bg-white border border-slate-200/80 shadow-sm overflow-hidden flex flex-col transition-all duration-200 ${
        isTableExpanded
          ? 'fixed inset-0 z-[100] rounded-none w-screen h-screen p-4 sm:p-6 bg-white'
          : 'rounded-3xl'
      }`}>
        {/* Table Controls & Filter Bar */}
        <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {/* Search input */}
            <div className="relative flex-1 min-w-[220px] max-w-md">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search cooperator name or Member ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            {/* Department dropdown filter (shows registered units if any) */}
            {uniqueDepartments.length > 0 && (
              <div className="relative">
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="appearance-none pl-3.5 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-700 cursor-pointer"
                >
                  <option value="all">All Units ({uniqueDepartments.length})</option>
                  {uniqueDepartments.map(dep => (
                    <option key={dep} value={dep}>{dep}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            )}

            {/* Account filter */}
            <div className="relative">
              <select
                value={accountFilter}
                onChange={(e) => setAccountFilter(e.target.value)}
                className="appearance-none pl-3.5 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-700 cursor-pointer"
              >
                <option value="all">All Managed Accounts</option>
                <option value="ordinary">Has Ordinary Savings</option>
                <option value="special">Has Special Savings</option>
                <option value="investment">Has Investment Capital</option>
                <option value="commodity">Has Commodity Account</option>
                <option value="muslim">Has Muslim Community Account</option>
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs font-bold text-slate-500">
              Showing <span className="text-emerald-700 font-extrabold">{filteredMembers.length}</span> of {aggregatedMembers.length} Cooperators
            </span>

            {/* Expand / Minimize Table Size */}
            <button
              type="button"
              onClick={() => setIsTableExpanded(!isTableExpanded)}
              className="p-2 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 rounded-xl text-xs font-bold transition cursor-pointer border border-slate-200/60"
              title={isTableExpanded ? "Restore standard view" : "Expand to fullscreen"}
            >
              {isTableExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          </div>
        </div>

        {/* Basic Information Data Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-3.5 text-center w-12">S/N</th>
                <th className="px-4 py-3.5">Member ID</th>
                <th className="px-4 py-3.5">Cooperator Full Name</th>
                <th className="px-4 py-3.5">Accounts Managed</th>
                <th className="px-4 py-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    <Users size={32} className="mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-bold text-slate-600">No cooperator records found</p>
                    <p className="text-xs text-slate-400 mt-1">Adjust your search keyword or filters to find registered cooperators.</p>
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member, idx) => {
                  const managedAccountsList = [
                    { key: 'os', name: 'Ordinary Savings', active: member.ordinarySavings > 0, theme: ACCOUNT_THEMES.ordinary },
                    { key: 'ss', name: 'Special Savings', active: member.specialSavings > 0, theme: ACCOUNT_THEMES.special },
                    { key: 'inv', name: 'Investment Shares', active: member.investment > 0, theme: ACCOUNT_THEMES.investment },
                    { key: 'cp', name: 'Commodity Purchase', active: member.commodityPurchase > 0, theme: ACCOUNT_THEMES.commodity },
                    { key: 'mc', name: 'Muslim Community', active: member.muslimCommunity > 0, theme: ACCOUNT_THEMES.muslim },
                    { key: 'loan', name: 'Loan Account', active: (member.loanReimbursement || 0) > 0, theme: { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200' } }
                  ];

                  return (
                    <tr 
                      key={`${member.id}-${idx}`} 
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* S/N */}
                      <td className="px-4 py-3.5 text-center text-slate-400 font-mono text-[10px]">
                        {idx + 1}
                      </td>

                      {/* Member ID */}
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-mono font-bold text-xs border border-emerald-200/50">
                          {member.id}
                        </span>
                      </td>

                      {/* Cooperator Full Name */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-800 font-black text-xs flex items-center justify-center shrink-0 border border-slate-200/60">
                            {member.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900 text-xs sm:text-sm">
                              {member.name}
                            </p>
                            {member.email && (
                              <p className="text-[10px] text-slate-400 font-normal">{member.email}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Accounts Managed Badges */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap items-center gap-1.5 max-w-sm">
                          {managedAccountsList.filter(acc => acc.active).map(acc => (
                            <span 
                              key={acc.key}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${acc.theme.bg} ${acc.theme.text} ${acc.theme.border}`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-current" />
                              <span>{acc.name}</span>
                            </span>
                          ))}
                          {managedAccountsList.filter(acc => acc.active).length === 0 && (
                            <span className="text-[10px] text-slate-400 italic">No active sub-accounts</span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold uppercase tracking-wider">
                          <BadgeCheck size={12} className="text-emerald-600" />
                          <span>Active</span>
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Bottom Footer Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Cooperative member registry with real-time active status.</span>
          </div>
          <div className="font-bold text-slate-700">
            Total Registered Members: <span className="text-emerald-800 font-black">{aggregatedMembers.length}</span>
          </div>
        </div>
      </div>

      {/* MEMBER FINANCIAL ACCOUNT & PAYMENT RECORDS MODAL */}
      <MemberAccountDetailsModal
        member={selectedMember}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedMember(null);
        }}
        importedRecords={importedRecords}
        showToast={showToast}
      />
    </div>
  );
}
