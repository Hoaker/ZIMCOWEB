import React, { useState, useMemo } from 'react';
import { Search, Users, ExternalLink, CheckCircle2, AlertCircle, Shield, User, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

interface MemberRecord {
  id: string;
  name?: string;
  fullName?: string;
  email?: string;
  staffId?: string;
  status?: string;
  role?: string;
  department?: string;
  totalSavings?: number;
  [key: string]: any;
}

interface DeductionRecord {
  id: string;
  name: string;
  ordinarySavings: number;
  specialSavings: number;
  investment: number;
  commodityPurchase: number;
  loanReimbursement: number;
  totalDeduction: number;
  [key: string]: any;
}

interface BursaryMemberRosterProps {
  importedRecords: DeductionRecord[];
  firestoreMembers: MemberRecord[];
  showToast?: (message: string, type: 'success' | 'warning' | 'error') => void;
}

export default function BursaryMemberRoster({
  importedRecords,
  firestoreMembers,
}: BursaryMemberRosterProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');

  // Combine firestore members with any sheet records that might not be in firestore yet
  const roster = useMemo(() => {
    // Map of id -> Member
    const memberMap = new Map<string, {
      id: string;
      name: string;
      staffId: string;
      email: string;
      status: string;
      department?: string;
      monthlyDeduction?: number;
    }>();

    // Add Firestore members first
    firestoreMembers.forEach((m) => {
      const id = m.id || m.staffId || '';
      const name = m.fullName || m.name || 'Unknown Member';
      const staffId = m.staffId || m.id || 'N/A';
      const email = m.email || '';
      const status = m.status || 'Active';
      const department = m.department || '';
      
      // Check if this member has a deduction in importedRecords
      const matchedRecord = importedRecords.find(
        (r) => r.id.toLowerCase() === id.toLowerCase() || 
               r.name.toLowerCase() === name.toLowerCase() ||
               (staffId && r.id.toLowerCase() === staffId.toLowerCase())
      );

      memberMap.set(id, {
        id,
        name,
        staffId,
        email,
        status,
        department,
        monthlyDeduction: matchedRecord ? matchedRecord.totalDeduction : undefined,
      });
    });

    // Also add importedRecords if not already in map
    importedRecords.forEach((r) => {
      if (!memberMap.has(r.id)) {
        memberMap.set(r.id, {
          id: r.id,
          name: r.name,
          staffId: r.id,
          email: '',
          status: 'Active',
          department: '',
          monthlyDeduction: r.totalDeduction,
        });
      }
    });

    return Array.from(memberMap.values());
  }, [firestoreMembers, importedRecords]);

  // Filter roster
  const filteredRoster = useMemo(() => {
    return roster.filter((m) => {
      const matchesSearch = 
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.staffId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.department && m.department.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = 
        statusFilter === 'all' || 
        m.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [roster, searchTerm, statusFilter]);

  const activeCount = roster.filter((m) => m.status.toLowerCase() === 'active').length;
  const suspendedCount = roster.filter((m) => m.status.toLowerCase() === 'suspended').length;
  const inSheetCount = roster.filter((m) => m.monthlyDeduction !== undefined).length;

  return (
    <div className="space-y-6">
      {/* Top Banner with Quick Stats & Admin Directory Link */}
      <div className="bg-surface-container border border-outline-variant/60 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-container text-on-primary-container flex items-center justify-center shrink-0">
            <Users size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-on-surface font-headline">Bursary Member Directory</h3>
            <p className="text-xs text-on-surface-variant mt-0.5 max-w-xl leading-relaxed">
              Read-only view for member verification, ZIM ID matching, and payroll cycle status. For credential resets, role assignments, and member management, visit the Admin Portal.
            </p>
          </div>
        </div>
        <Link
          to="/admin"
          className="px-4 py-2.5 bg-surface hover:bg-surface-container-high text-primary border border-outline-variant rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors shrink-0 shadow-xs cursor-pointer font-label"
        >
          <ExternalLink size={14} />
          Open Full Admin Directory
        </Link>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-primary-container/40 text-primary flex items-center justify-center">
            <Users size={18} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-label">Total Verified</span>
            <p className="text-xl font-bold text-on-surface font-headline">{roster.length}</p>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-secondary-container/40 text-secondary flex items-center justify-center">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-label">Active Members</span>
            <p className="text-xl font-bold text-on-surface font-headline">{activeCount}</p>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-tertiary-container/40 text-tertiary flex items-center justify-center">
            <Filter size={18} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-label">In Current Payroll Sheet</span>
            <p className="text-xl font-bold text-on-surface font-headline">{inSheetCount}</p>
          </div>
        </div>
      </div>

      {/* Controls Bar: Search & Status Filter */}
      <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search member name or ZIM ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-surface-container border border-outline-variant rounded-xl text-xs text-on-surface placeholder:text-on-surface-variant/60 focus:outline-hidden focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer font-label transition-colors ${
              statusFilter === 'all'
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
            }`}
          >
            All ({roster.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer font-label transition-colors ${
              statusFilter === 'active'
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Active ({activeCount})
          </button>
          {suspendedCount > 0 && (
            <button
              onClick={() => setStatusFilter('suspended')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer font-label transition-colors ${
                statusFilter === 'suspended'
                  ? 'bg-error text-on-error'
                  : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Suspended ({suspendedCount})
            </button>
          )}
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-on-surface">
            <thead className="bg-surface-container text-on-surface-variant uppercase text-[10px] font-bold tracking-wider border-b border-outline-variant/60 font-label">
              <tr>
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">ZIM / Staff ID</th>
                <th className="py-3 px-4">Department / Unit</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Current Sheet Deduction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/40">
              {filteredRoster.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-on-surface-variant">
                    <p className="font-semibold">No members match the search criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredRoster.map((member) => (
                  <tr key={member.id} className="hover:bg-surface-container/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container font-bold text-xs flex items-center justify-center shrink-0">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-on-surface">{member.name}</p>
                          {member.email && (
                            <p className="text-[10px] text-on-surface-variant">{member.email}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-primary">
                      {member.staffId}
                    </td>
                    <td className="py-3 px-4 text-on-surface-variant">
                      {member.department || 'General Member'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-label ${
                          member.status.toLowerCase() === 'active'
                            ? 'bg-primary-container text-on-primary-container'
                            : 'bg-error-container text-on-error-container'
                        }`}
                      >
                        {member.status.toLowerCase() === 'active' ? (
                          <CheckCircle2 size={10} />
                        ) : (
                          <AlertCircle size={10} />
                        )}
                        {member.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {member.monthlyDeduction !== undefined ? (
                        <span className="font-mono font-bold text-on-surface">
                          ₦{member.monthlyDeduction.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-on-surface-variant/60 italic text-[11px]">
                          Not in active sheet
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
