import React, { useState } from 'react';
import { 
  Download, 
  Printer, 
  Copy, 
  Check, 
  X, 
  Search, 
  Key, 
  ShieldCheck, 
  UserCheck, 
  Eye, 
  EyeOff, 
  ArrowRight,
  Sparkles,
  Info,
  CreditCard,
  Building2
} from 'lucide-react';
import { motion } from 'motion/react';
import zimcoLogo from '@/assets/images/zimco_logo_1780347665840.png';

export interface NewMemberCredential {
  id: string; // Zimco ID
  name: string; // Full Name
  surname: string; // Default password
  email?: string;
  initialDeduction: number;
  ordinarySavings?: number;
  specialSavings?: number;
  investment?: number;
  commodityPurchase?: number;
  loanReimbursement?: number;
  muslimCommunity?: number;
  dateImported?: string;
  status?: string;
}

interface NewMembersCredentialModalProps {
  isOpen: boolean;
  onClose: () => void;
  newMembers: NewMemberCredential[];
  activeMonth?: string;
  showToast: (message: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

export default function NewMembersCredentialModal({
  isOpen,
  onClose,
  newMembers,
  activeMonth = 'Current Cycle',
  showToast
}: NewMembersCredentialModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [activeView, setActiveView] = useState<'table' | 'slips'>('table');

  if (!isOpen) return null;

  const filteredMembers = newMembers.filter(m => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q) || m.surname.toLowerCase().includes(q);
  });

  const totalDeductions = newMembers.reduce((acc, curr) => acc + (curr.initialDeduction || 0), 0);

  // Download CSV Roster
  const handleDownloadCSV = () => {
    if (newMembers.length === 0) return;

    const headers = [
      'ZIMCO ID',
      'Full Name',
      'Default Password (Surname)',
      'Initial Deduction (NGN)',
      'Cycle Period',
      'Login Portal URL',
      'Login Instructions'
    ];

    const rows = newMembers.map(m => [
      `"${m.id}"`,
      `"${m.name.replace(/"/g, '""')}"`,
      `"${m.surname}"`,
      `"${m.initialDeduction}"`,
      `"${activeMonth}"`,
      `"https://zimco.org/login/member"`,
      `"Enter Zimco ID & Surname in lowercase. Prompted to change password on 1st login."`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `zimco_new_members_credentials_${activeMonth.toLowerCase().replace(/\s+/g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Downloaded login credentials roster for ${newMembers.length} new members!`, 'success');
  };

  // Copy single credential
  const handleCopySingle = (member: NewMemberCredential) => {
    const text = `ZIMCO Member Login Credentials:\nName: ${member.name}\nZimco ID: ${member.id}\nDefault Password: ${member.surname}\nLogin URL: https://zimco.org/login/member`;
    navigator.clipboard.writeText(text);
    setCopiedId(member.id);
    setTimeout(() => setCopiedId(null), 2000);
    showToast(`Copied login details for ${member.name}`, 'success');
  };

  // Copy all credentials to clipboard
  const handleCopyAll = () => {
    if (newMembers.length === 0) return;

    let text = `====================================================\n`;
    text += `ZIMCO COOPERATIVE - NEW MEMBERS LOGIN CREDENTIALS\n`;
    text += `Cycle: ${activeMonth} | Total New Accounts: ${newMembers.length}\n`;
    text += `Login Portal: https://zimco.org/login/member\n`;
    text += `====================================================\n\n`;

    newMembers.forEach((m, idx) => {
      text += `${idx + 1}. ${m.name}\n`;
      text += `   Zimco ID: ${m.id}\n`;
      text += `   Default Password: ${m.surname}\n`;
      text += `   Initial Deduction: ₦${m.initialDeduction.toLocaleString()}\n\n`;
    });

    text += `Note: Members should log in with their Zimco ID and Surname in lowercase, then set their permanent password.`;

    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
    showToast(`Copied credentials for all ${newMembers.length} members to clipboard!`, 'success');
  };

  // Print Slips
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden my-auto"
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-start justify-between relative overflow-hidden shrink-0">
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
              <UserCheck className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                  New Member Accounts Generated
                </span>
                <span className="text-xs text-emerald-200/80 font-medium">
                  {activeMonth}
                </span>
              </div>
              <h2 className="text-2xl font-black tracking-tight mt-1">
                New Members Login Credentials Roster
              </h2>
              <p className="text-xs text-emerald-100/80 mt-1 max-w-2xl leading-relaxed">
                The members below were not previously registered in the cooperative database. Their accounts have been created with their <strong>Zimco ID</strong> and their <strong>surname</strong> as the default initial password.
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Highlight Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 sm:p-6 bg-slate-50 border-b border-slate-200 shrink-0">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">New Members</span>
            <div className="text-xl font-black text-emerald-700 mt-0.5">{newMembers.length}</div>
            <span className="text-[10px] text-slate-500 font-medium">Auto-assigned Zimco IDs</span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Total Deductions</span>
            <div className="text-xl font-black text-slate-800 mt-0.5">₦{totalDeductions.toLocaleString()}</div>
            <span className="text-[10px] text-slate-500 font-medium">Initial ledger injection</span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Default Password</span>
            <div className="text-sm font-black text-amber-700 mt-1 flex items-center gap-1">
              <Key size={14} className="text-amber-600" />
              <span>Surname (lowercase)</span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium">e.g. "adewale", "musa"</span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Login Portal URL</span>
            <div className="text-xs font-mono font-bold text-slate-700 mt-1 truncate">/login/member</div>
            <span className="text-[10px] text-emerald-600 font-bold">First login prompts reset</span>
          </div>
        </div>

        {/* Toolbar & Controls */}
        <div className="px-6 py-4 bg-white border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text"
                placeholder="Search member name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600 w-52 sm:w-64"
              />
            </div>

            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              <button
                onClick={() => setActiveView('table')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeView === 'table' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Table View
              </button>
              <button
                onClick={() => setActiveView('slips')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeView === 'slips' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Printable Slips ({filteredMembers.length})
              </button>
            </div>

            <button
              onClick={() => setShowPasswords(!showPasswords)}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              title={showPasswords ? "Mask passwords" : "Show passwords"}
            >
              {showPasswords ? <EyeOff size={13} /> : <Eye size={13} />}
              <span className="hidden sm:inline">{showPasswords ? 'Mask' : 'Reveal'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyAll}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-200"
              title="Copy formatted credentials to clipboard"
            >
              {copiedAll ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              <span>{copiedAll ? 'Copied All!' : 'Copy All'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-200"
              title="Print credential slips or export to PDF"
            >
              <Printer size={14} />
              <span>Print Slips</span>
            </button>

            <button
              onClick={handleDownloadCSV}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-2 shadow-sm"
              title="Download CSV file containing Zimco IDs and names"
            >
              <Download size={14} />
              <span>Download CSV List</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
          {newMembers.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <UserCheck size={36} className="mx-auto text-slate-300 mb-2" />
              <p className="font-bold text-sm">No new members detected in this workbook.</p>
              <p className="text-xs text-slate-400 mt-1">All members in this file were already matched with existing database records.</p>
            </div>
          ) : activeView === 'table' ? (
            /* Table View */
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">ZIMCO ID</th>
                    <th className="px-4 py-3">Full Name</th>
                    <th className="px-4 py-3">Default Password (Surname)</th>
                    <th className="px-4 py-3 text-right">Initial Deduction</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredMembers.map((member, idx) => (
                    <tr key={member.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 text-slate-400 font-mono font-medium">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                          {member.id}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900">
                        {member.name}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 font-mono text-xs">
                          <span className={`px-2 py-0.5 rounded-md font-semibold ${
                            showPasswords 
                              ? 'bg-amber-50 text-amber-900 border border-amber-200' 
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {showPasswords ? member.surname : '••••••••'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-black text-slate-800">
                        ₦{member.initialDeduction.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                          <ShieldCheck size={11} /> Ready to Login
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleCopySingle(member)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 rounded-lg text-xs font-semibold transition inline-flex items-center gap-1"
                          title="Copy member credentials"
                        >
                          {copiedId === member.id ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                          <span>{copiedId === member.id ? 'Copied' : 'Copy'}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Printable Slips View */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMembers.map((member, idx) => (
                <div 
                  key={member.id}
                  className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-5 relative overflow-hidden shadow-sm page-break-inside-avoid"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <img src={zimcoLogo} alt="ZIMCO Logo" className="w-7 h-7 object-contain" />
                      <div>
                        <h4 className="font-black text-xs text-slate-900 tracking-tight">ZIMCO COOPERATIVE</h4>
                        <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-wider">Member Access Slip</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-slate-400">#{idx + 1}</span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Member Name</span>
                      <p className="font-bold text-slate-900 text-sm">{member.name}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-[9px] font-extrabold uppercase text-slate-400 block">ZIMCO ID</span>
                        <p className="font-mono font-bold text-emerald-800 text-xs">{member.id}</p>
                      </div>
                      <div>
                        <span className="text-[9px] font-extrabold uppercase text-slate-400 block">Default Password</span>
                        <p className="font-mono font-bold text-amber-800 text-xs">{member.surname}</p>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-500 bg-emerald-50/50 p-2 rounded-lg border border-emerald-100 leading-snug">
                      <strong>How to Access:</strong> Visit <em>https://zimco.org/login/member</em>. Enter your Zimco ID and your Surname in lowercase. You will be prompted to set your new personal password on first login.
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Info size={14} className="text-emerald-700 shrink-0" />
            <span>All credentials follow ZIMCO automated member onboarding protocols.</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
}
