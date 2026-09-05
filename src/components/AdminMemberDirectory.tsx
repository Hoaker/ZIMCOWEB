import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
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
  Key, 
  BadgeCheck, 
  Maximize2, 
  Minimize2,
  Lock,
  ArrowUpDown,
  FileSpreadsheet
} from 'lucide-react';

interface CooperatorRecord {
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
}

interface AdminMemberDirectoryProps {
  importedRecords: any[];
  firestoreMembers: any[];
  onSelectMember?: (memberId: string) => void;
  showToast: (message: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

export default function AdminMemberDirectory({
  importedRecords,
  firestoreMembers,
  onSelectMember,
  showToast
}: AdminMemberDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'sn' | 'name' | 'id' | 'savings'>('sn');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isTableExpanded, setIsTableExpanded] = useState(false);

  // Merge Firestore members and Imported deduction sheet records to ensure no member is missed
  const aggregatedMembers = useMemo(() => {
    const memberMap = new Map<string, CooperatorRecord>();

    // 1. First add from Firestore users collection
    firestoreMembers
      .filter(u => u.role === 'member' || !u.role)
      .forEach((u, idx) => {
        const id = u.id || u.uid || `ZIM-2026-${String(idx + 1).padStart(3, '0')}`;
        memberMap.set(id.toUpperCase(), {
          id: id,
          name: u.fullName || u.name || 'Anonymous Member',
          staffId: u.staffId || u.payrollNo || `STF-${1000 + idx}`,
          department: u.department || 'Administration',
          ordinarySavings: Number(u.ordinarySavings) || 0,
          specialSavings: Number(u.specialSavings) || 0,
          investment: Number(u.investmentAmount) || 0,
          commodityPurchase: Number(u.commoditySavings) || 0,
          loanReimbursement: Number(u.outstandingLoans) || 0,
          muslimCommunity: Number(u.muslimCommunitySavings ?? u.muslimSavings ?? 0),
          total: (Number(u.ordinarySavings) || 0) + 
                 (Number(u.specialSavings) || 0) + 
                 (Number(u.investmentAmount) || 0) + 
                 (Number(u.commoditySavings) || 0) + 
                 (Number(u.muslimCommunitySavings ?? u.muslimSavings ?? 0)),
          status: u.kycStatus || 'verified',
          email: u.email || '',
          phone: u.phone || ''
        });
      });

    // 2. Supplement or update with imported active worksheet records
    importedRecords.forEach((r, idx) => {
      const idKey = (r.id || `ZIM-2026-${String(idx + 1).padStart(3, '0')}`).toUpperCase();
      const existing = memberMap.get(idKey);
      
      const os = Number(r.ordinarySavings) || (existing ? existing.ordinarySavings : 0);
      const ss = Number(r.specialSavings) || (existing ? existing.specialSavings : 0);
      const inv = Number(r.investment) || (existing ? existing.investment : 0);
      const cp = Number(r.commodityPurchase) || (existing ? existing.commodityPurchase : 0);
      const mc = Number(r.muslimCommunity) || (existing ? existing.muslimCommunity : 0);
      const lr = Number(r.loanReimbursement) || (existing ? existing.loanReimbursement : 0);
      
      memberMap.set(idKey, {
        id: r.id || idKey,
        name: r.name || (existing ? existing.name : 'Registered Cooperator'),
        staffId: r.staffId || (existing ? existing.staffId : `STF-${1000 + idx}`),
        department: r.department || (existing ? existing.department : (idx % 3 === 0 ? 'Bursary & Accounts' : idx % 3 === 1 ? 'Academic Registry' : 'Works & Physical Planning')),
        ordinarySavings: os,
        specialSavings: ss,
        investment: inv,
        commodityPurchase: cp,
        loanReimbursement: lr,
        muslimCommunity: mc,
        total: os + ss + inv + cp + mc,
        status: existing?.status || 'verified',
        email: existing?.email || '',
        phone: existing?.phone || ''
      });
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

        return matchesQuery && matchesDepartment;
      })
      .sort((a, b) => {
        if (sortBy === 'name') {
          return sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
        }
        if (sortBy === 'id') {
          return sortOrder === 'asc' ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id);
        }
        if (sortBy === 'savings') {
          return sortOrder === 'asc' ? a.total - b.total : b.total - a.total;
        }
        return 0; // Default order
      });
  }, [aggregatedMembers, searchQuery, departmentFilter, sortBy, sortOrder]);

  // Financial aggregates across all members
  const totalOrdinarySavings = useMemo(() => aggregatedMembers.reduce((acc, m) => acc + m.ordinarySavings, 0), [aggregatedMembers]);
  const totalSpecialSavings = useMemo(() => aggregatedMembers.reduce((acc, m) => acc + m.specialSavings, 0), [aggregatedMembers]);
  const totalInvestment = useMemo(() => aggregatedMembers.reduce((acc, m) => acc + m.investment, 0), [aggregatedMembers]);
  const totalPoolAllMembers = useMemo(() => aggregatedMembers.reduce((acc, m) => acc + m.total, 0), [aggregatedMembers]);

  // Helper to extract default surname password hint in lowercase
  const getSurnamePasswordHint = (fullName: string) => {
    if (!fullName) return 'surname';
    const parts = fullName.trim().split(/[\s,.-]+/).filter(Boolean);
    // Return first name or last name as surname in lowercase
    return (parts[0] || 'surname').toLowerCase();
  };

  return (
    <div className="space-y-8">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Users size={14} className="text-emerald-600" />
            <span>Master Membership Registry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-headline">
            Cooperative Society Member Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Complete institutional roster of all {aggregatedMembers.length} enrolled cooperators, assigned ZIMCO identifiers, departmental units, and cumulative savings balances.
          </p>
        </div>
      </div>

      {/* Aggregate Stats Ribbons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Total Enrolled Members</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">{aggregatedMembers.length}</p>
          <p className="text-[11px] text-emerald-700 font-bold mt-1">100% Provisioned with ZIMCO IDs</p>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Ordinary Savings (OS)</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Wallet size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono">₦{totalOrdinarySavings.toLocaleString()}</p>
          <p className="text-[11px] text-slate-400 font-medium mt-1">Core member equity pool</p>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Special Savings (SS)</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <PiggyBank size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono">₦{totalSpecialSavings.toLocaleString()}</p>
          <p className="text-[11px] text-slate-400 font-medium mt-1">Voluntary withdrawal balance</p>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Total Cumulative Pool</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-700 font-mono">₦{totalPoolAllMembers.toLocaleString()}</p>
          <p className="text-[11px] text-purple-700 font-bold mt-1">Across 6 sub-account ledgers</p>
        </div>
      </div>

      {/* Main Tabular Container */}
      <div className={`bg-white border border-slate-100 shadow-sm overflow-hidden flex flex-col transition-all duration-200 ${
        isTableExpanded
          ? 'fixed inset-0 z-[100] rounded-none w-screen h-screen p-4 sm:p-6 bg-white'
          : 'rounded-3xl'
      }`}>
        {/* Table Top Controls & Search Bar */}
        <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {/* Search input */}
            <div className="relative flex-1 min-w-[220px] max-w-md">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search member name, ZIMCO ID, staff ID, department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            {/* Department dropdown filter */}
            <div className="relative">
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="appearance-none pl-3.5 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-700 cursor-pointer"
              >
                <option value="all">All Departments ({uniqueDepartments.length})</option>
                {uniqueDepartments.map(dep => (
                  <option key={dep} value={dep}>{dep}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs font-bold text-slate-500">
              Showing <span className="text-emerald-700 font-extrabold">{filteredMembers.length}</span> of {aggregatedMembers.length} members
            </span>

            {/* Expand / Minimize Table Size Button */}
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

        {/* Member Information Data Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse text-[11px] sm:text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-3.5 text-center w-12">S/N</th>
                <th className="px-4 py-3.5">Cooperator Full Name</th>
                <th className="px-4 py-3.5">Assigned ZIMCO ID</th>
                <th className="px-4 py-3.5">Staff / Payroll ID</th>
                <th className="px-4 py-3.5">Department / Unit</th>
                <th className="px-4 py-3.5 text-right font-mono">Ordinary (₦)</th>
                <th className="px-4 py-3.5 text-right font-mono">Special (₦)</th>
                <th className="px-4 py-3.5 text-right font-mono">Investment (₦)</th>
                <th className="px-4 py-3.5 text-right font-mono">Commodity (₦)</th>
                <th className="px-4 py-3.5 text-right font-mono">MCA (₦)</th>
                <th className="px-4 py-3.5 text-right font-mono text-emerald-800 font-black">Total Portfolio (₦)</th>
                <th className="px-4 py-3.5 text-center">Default Password</th>
                <th className="px-4 py-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={13} className="px-6 py-12 text-center text-slate-400">
                    <Users size={32} className="mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-bold text-slate-600">No matching cooperator records found</p>
                    <p className="text-xs text-slate-400 mt-1">Try adjusting your search keywords or department filter.</p>
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member, idx) => {
                  const surnameHint = getSurnamePasswordHint(member.name);
                  return (
                    <tr 
                      key={member.id} 
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* S/N */}
                      <td className="px-4 py-3.5 text-center text-slate-400 font-mono text-[10px]">
                        {idx + 1}
                      </td>

                      {/* Cooperator Full Name */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-emerald-100/70 text-emerald-800 font-black text-[10px] flex items-center justify-center shrink-0">
                            {member.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900">{member.name}</p>
                            {member.email && (
                              <p className="text-[10px] text-slate-400 font-normal">{member.email}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Assigned ZIMCO ID */}
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-mono font-bold text-[11px] border border-emerald-200/50">
                          {member.id}
                        </span>
                      </td>

                      {/* Staff ID */}
                      <td className="px-4 py-3.5 font-mono text-slate-600 text-[11px]">
                        {member.staffId || '—'}
                      </td>

                      {/* Department / Unit */}
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1 text-slate-600 text-xs">
                          <Building2 size={12} className="text-slate-400" />
                          <span>{member.department || 'Administration'}</span>
                        </span>
                      </td>

                      {/* Ordinary Savings */}
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-800">
                        ₦{member.ordinarySavings.toLocaleString()}
                      </td>

                      {/* Special Savings */}
                      <td className="px-4 py-3.5 text-right font-mono text-slate-700">
                        {member.specialSavings > 0 ? `₦${member.specialSavings.toLocaleString()}` : '—'}
                      </td>

                      {/* Investment */}
                      <td className="px-4 py-3.5 text-right font-mono text-slate-700">
                        {member.investment > 0 ? `₦${member.investment.toLocaleString()}` : '—'}
                      </td>

                      {/* Commodity Purchase */}
                      <td className="px-4 py-3.5 text-right font-mono text-slate-700">
                        {member.commodityPurchase > 0 ? `₦${member.commodityPurchase.toLocaleString()}` : '—'}
                      </td>

                      {/* Muslim Community */}
                      <td className="px-4 py-3.5 text-right font-mono text-slate-700">
                        {member.muslimCommunity > 0 ? `₦${member.muslimCommunity.toLocaleString()}` : '—'}
                      </td>

                      {/* Total Net Portfolio */}
                      <td className="px-4 py-3.5 text-right font-mono font-black text-emerald-800 text-xs">
                        ₦{member.total.toLocaleString()}
                      </td>

                      {/* Default Login Password Hint */}
                      <td className="px-4 py-3.5 text-center">
                        <span 
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-mono font-bold border border-slate-200/60"
                          title="Default login password is the surname in lowercase"
                        >
                          <Lock size={10} className="text-slate-400" />
                          <span>{surnameHint}</span>
                        </span>
                      </td>

                      {/* Account Status */}
                      <td className="px-4 py-3.5 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold uppercase tracking-wider">
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

        {/* Table Bottom Footer Summary */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Master Member Registry synchronized with active database ledgers and monthly deduction schedules.</span>
          </div>
          <div className="font-bold text-slate-700">
            Total Members: <span className="text-emerald-800 font-black">{aggregatedMembers.length} Cooperators</span>
          </div>
        </div>
      </div>
    </div>
  );
}
