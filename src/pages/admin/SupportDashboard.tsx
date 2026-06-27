import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { 
  LifeBuoy, 
  Search, 
  Filter, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  User, 
  AlertCircle,
  MoreVertical,
  Check,
  ChevronRight,
  UserCheck,
  Building,
  DollarSign,
  History,
  Send,
  Wrench
} from 'lucide-react';
import { SupportTicket } from '../../components/MemberHelpdesk';

export default function SupportDashboard() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  // Assignment / Updates state
  const [assigneeInput, setAssigneeInput] = useState('');
  const [statusInput, setStatusInput] = useState<SupportTicket['status']>('pending');
  const [notationText, setNotationText] = useState('');
  const [ticketReplyMsg, setTicketReplyMsg] = useState('');
  const [sysAlert, setSysAlert] = useState<{ type: 'success' | 'info'; text: string } | null>(null);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = () => {
    const saved = localStorage.getItem('zimco_support_tickets');
    if (saved) {
      const parsed = JSON.parse(saved) as SupportTicket[];
      setTickets(parsed);
      // Synchronize currently viewed ticket if any
      if (selectedTicket) {
        const found = parsed.find(t => t.id === selectedTicket.id);
        if (found) setSelectedTicket(found);
      }
    }
  };

  const handleSaveTicketChanges = (updatedTicket: SupportTicket) => {
    const saved = localStorage.getItem('zimco_support_tickets');
    if (saved) {
      const parsed = JSON.parse(saved) as SupportTicket[];
      const nextTickets = parsed.map(t => t.id === updatedTicket.id ? updatedTicket : t);
      localStorage.setItem('zimco_support_tickets', JSON.stringify(nextTickets));
      setTickets(nextTickets);
      setSelectedTicket(updatedTicket);
    }
  };

  const handleSyncTicket = () => {
    loadTickets();
    setSysAlert({ type: 'success', text: 'Ticket Queue Refreshed from local ledger.' });
    setTimeout(() => setSysAlert(null), 3000);
  };

  const handleUpdateAssignment = (id: string, agent: string) => {
    const ticket = tickets.find(t => t.id === id);
    if (!ticket) return;

    const updated: SupportTicket = {
      ...ticket,
      assignee: agent,
      status: ticket.status === 'pending' ? 'assigned' : ticket.status,
      replies: [
        ...ticket.replies,
        {
          author: 'System Operations',
          message: `Ticket successfully assigned and dispatched to ${agent} for immediate audit.`,
          timestamp: new Date().toISOString()
        }
      ]
    };
    handleSaveTicketChanges(updated);
    setSysAlert({ type: 'success', text: `Assigned agent successfully to ${agent}` });
    setTimeout(() => setSysAlert(null), 3000);
  };

  const handleUpdateStatus = (id: string, newStatus: SupportTicket['status']) => {
    const ticket = tickets.find(t => t.id === id);
    if (!ticket) return;

    const updated: SupportTicket = {
      ...ticket,
      status: newStatus,
      replies: [
        ...ticket.replies,
        {
          author: 'System Operations',
          message: `Ticket audit status shifted to [${newStatus.toUpperCase()}].`,
          timestamp: new Date().toISOString()
        }
      ]
    };
    handleSaveTicketChanges(updated);
    setSysAlert({ type: 'success', text: `Status updated to ${newStatus}` });
    setTimeout(() => setSysAlert(null), 3000);
  };

  const handleSaveNotation = (id: string) => {
    if (!notationText) return;
    const ticket = tickets.find(t => t.id === id);
    if (!ticket) return;

    const updated: SupportTicket = {
      ...ticket,
      notation: notationText,
      replies: [
        ...ticket.replies,
        {
          author: 'Admin Escalation Auditor',
          message: `Audit Note recorded: ${notationText}`,
          timestamp: new Date().toISOString()
        }
      ]
    };
    handleSaveTicketChanges(updated);
    setNotationText('');
    setSysAlert({ type: 'info', text: 'Internal notation appended to ticket log.' });
    setTimeout(() => setSysAlert(null), 3500);
  };

  const handleAdminReply = (id: string) => {
    if (!ticketReplyMsg) return;
    const ticket = tickets.find(t => t.id === id);
    if (!ticket) return;

    const updated: SupportTicket = {
      ...ticket,
      replies: [
        ...ticket.replies,
        {
          author: 'Admin Support Team',
          message: ticketReplyMsg,
          timestamp: new Date().toISOString()
        }
      ]
    };
    handleSaveTicketChanges(updated);
    setTicketReplyMsg('');
  };

  const handleDeployLedgerCorrection = (id: string) => {
    const ticket = tickets.find(t => t.id === id);
    if (!ticket) return;

    // Simulate direct ledger recalculation action
    const correctionMsg = ticket.category === 'loan_adjustment'
      ? `Re-calculated outstanding zero-interest balance on commodity finance. Found offset discrepancy of ₦${(ticket.amountAffected || 0).toLocaleString()} from parsed payroll. Applied electronic balance correction to primary ledger.`
      : `Verified bank payout stack clearance sheet with Wema/NIBSS. Flushed bottleneck and processed final manual bank settlement of ₦${(ticket.amountAffected || 0).toLocaleString()}. Clearance confirmed.`;

    const updated: SupportTicket = {
      ...ticket,
      status: 'resolved',
      notation: correctionMsg,
      replies: [
        ...ticket.replies,
        {
          author: 'Ledger Settlement Automated Core',
          message: correctionMsg,
          timestamp: new Date().toISOString()
        },
        {
          author: 'System Operations',
          message: 'Ticket closed with fully resolved clearance status.',
          timestamp: new Date().toISOString()
        }
      ]
    };

    handleSaveTicketChanges(updated);
    setSysAlert({ type: 'success', text: 'Ledger Discrepancy Correction Deployed, Member Notified.' });
    setTimeout(() => setSysAlert(null), 5000);
  };

  // Quick stats calculations
  const totalOpen = tickets.filter(t => t.status !== 'resolved').length;
  const criticalCount = tickets.filter(t => t.urgency === 'critical' || t.urgency === 'high').length;
  const unassignedCount = tickets.filter(t => !t.assignee).length;

  const filteredTickets = tickets.filter(t => {
    const matchSearch = t.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        t.memberName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        t.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = categoryFilter === 'all' || t.category === categoryFilter;
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    
    return matchSearch && matchCategory && matchStatus;
  });

  const getUrgencyBadge = (urg: SupportTicket['urgency']) => {
    switch(urg) {
      case 'critical': return <span className="px-2 py-0.5 bg-red-105 border border-red-200 text-red-600 font-mono font-black uppercase text-[9px] rounded-md tracking-wider">Critical</span>;
      case 'high': return <span className="px-2 py-0.5 bg-orange-105 border border-orange-200 text-orange-600 font-mono font-black uppercase text-[9px] rounded-md tracking-wider">High</span>;
      default: return <span className="px-2 py-0.5 bg-slate-50 border border-slate-200 text-slate-500 font-mono font-black uppercase text-[9px] rounded-md tracking-wider">{urg}</span>;
    }
  };

  const getStatusText = (stat: SupportTicket['status']) => {
    switch (stat) {
      case 'resolved': return <span className="text-emerald-750 text-emerald-600 font-black">Resolved</span>;
      case 'investigating': return <span className="text-blue-750 text-blue-600 font-black">Auditing</span>;
      case 'assigned': return <span className="text-indigo-750 text-indigo-600 font-black">Assigned</span>;
      default: return <span className="text-slate-505 text-slate-500 font-black">Pending</span>;
    }
  };

  return (
    <AdminLayout role="Society Audit & Support" icon="support_agent">
      <div className="flex flex-col gap-8">
        
        {/* Helpdesk Title Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-1 animate-pulse">
              <LifeBuoy size={14} />
              Zimco Operations Escalation Center
            </div>
            <h1 className="text-3xl font-black text-on-surface tracking-tight font-headline">Escalated Ticket Helpdesk</h1>
            <p className="text-sm text-on-surface-variant mt-1">Manage, dispatch, audit, and resolve member loan ledger discrepancies or payout clearing bottlenecks.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleSyncTicket}
              className="px-5 py-2.5 bg-white border border-surface-container-high rounded-xl text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
            >
              <History size={18} />
              Sync Ledger Queue
            </button>
          </div>
        </div>

        {/* System Messages Banner */}
        {sysAlert && (
          <div className="p-4 bg-emerald-50 text-emerald-950 border border-emerald-250 rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-sm">
            <CheckCircle2 size={16} className="text-emerald-700" />
            <span>{sysAlert.text}</span>
          </div>
        )}

        {/* Metric Aggregates Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-black tracking-widest uppercase">Open Tickets</span>
              <p className="text-3xl font-black text-slate-900">{totalOpen}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-700 font-bold">
              {totalOpen}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-black tracking-widest uppercase">High/Crit Gravity</span>
              <p className="text-3xl font-black text-rose-600">{criticalCount}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 font-bold">
              {criticalCount}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-black tracking-widest uppercase">Unresolved Dispatch</span>
              <p className="text-3xl font-black text-indigo-600">{unassignedCount}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
              {unassignedCount}
            </div>
          </div>
        </div>

        {/* Core Layout split panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Support queue dispatch roster queue */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
            
            {/* Filter controls */}
            <div className="p-6 md:p-8 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Support Queue Queue</h3>
                <p className="text-xs text-slate-400 mt-0.5">Filter concerns through categorization parameters.</p>
              </div>

              {/* Filtering matrix widgets */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                  <input 
                    type="text" 
                    placeholder="Search query/ID..." 
                    className="pl-8 pr-4 py-2 bg-white border border-slate-205 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-500 w-36 md:w-44"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-205 rounded-xl text-xs outline-none font-bold text-slate-700"
                >
                  <option value="all">All Specs</option>
                  <option value="loan_adjustment">Loan Balance</option>
                  <option value="withdrawal_bottleneck">Withdrawals</option>
                  <option value="savings_discrepancy">Savings Acc</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-205 rounded-xl text-xs outline-none font-bold text-slate-700"
                >
                  <option value="all">All States</option>
                  <option value="pending">Pending</option>
                  <option value="assigned">Assigned</option>
                  <option value="investigating">Auditing</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>

            {/* Inbound ticket stream grid */}
            <div className="divide-y divide-slate-100 overflow-y-auto max-h-[500px]">
              {filteredTickets.length === 0 ? (
                <div className="text-center py-16 text-slate-400 flex flex-col items-center justify-center p-6 gap-2">
                  <AlertCircle size={32} className="text-slate-300" />
                  <p className="text-sm font-semibold">No tickets mapped matching parameters.</p>
                </div>
              ) : (
                filteredTickets.map(t => (
                  <div 
                    key={t.id} 
                    onClick={() => setSelectedTicket(t)}
                    className={`p-6 transition-colors hover:bg-slate-50 cursor-pointer flex items-start gap-4 ${
                      selectedTicket?.id === t.id ? 'bg-emerald-50/10' : ''
                    }`}
                  >
                    <div className="space-y-2 grow">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-405 text-slate-400">{t.id}</span>
                        {getUrgencyBadge(t.urgency)}
                        <span className="text-[10px] px-2 py-0.5 rounded-md text-emerald-950 font-bold bg-slate-105 border border-slate-201 text-slate-500 border-slate-200 uppercase tracking-tighter">
                          {t.category.replace('_', ' ')}
                        </span>
                      </div>
                      <h4 className="font-black text-slate-900 tracking-tight text-sm uppercase">{t.subject}</h4>
                      
                      {/* Sub-line summary reporting data info */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                        <span className="text-slate-700 font-extrabold flex items-center gap-1">
                          <User size={10} /> {t.memberName}
                        </span>
                        <span>Opened: {new Date(t.createdAt).toLocaleDateString()}</span>
                        {t.assignee ? (
                          <span className="text-emerald-700">Dispatcher: {t.assignee}</span>
                        ) : (
                          <span className="text-amber-600 font-extrabold animate-pulse">Dispatch Required</span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      {getStatusText(t.status)}
                      {t.amountAffected && (
                        <div className="text-[10px] font-mono text-rose-600 font-extrabold bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                          ₦{t.amountAffected.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-400 text-center font-bold font-mono">
              TOTAL TICKETS POOLED: {filteredTickets.length} INBOUND CASES
            </div>
          </div>

          {/* Detailed action workflow drawer */}
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 space-y-6">
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <LifeBuoy className="text-emerald-700" size={18} />
                Audit Dispatcher Action
              </h3>

              {!selectedTicket ? (
                <div className="text-center py-12 p-4 text-slate-400 text-xs font-semibold bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  Select a support ticket from the dispatch queue stream to audit notes, assign staff, and deploy corrections.
                </div>
              ) : (
                <div className="space-y-6">
                  
                  {/* General Complaint Details Metadata */}
                  <div className="pb-4 border-b border-slate-100 space-y-3">
                    <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">COMPLAINT SOURCE DETAIL</span>
                    <div className="p-4 bg-slate-50 rounded-2xl text-xs space-y-2 border border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between font-bold text-slate-800">
                        <span>John Doe (ID: {selectedTicket.memberId})</span>
                        <span className="text-rose-605 text-rose-600 font-mono">₦{(selectedTicket.amountAffected || 0).toLocaleString()}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed italic">{selectedTicket.description}</p>
                    </div>
                  </div>

                  {/* Dispatcher Staff Assignment Selector dropdown */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Dispatch / Assign Officer</label>
                    <select
                      value={selectedTicket.assignee || ''}
                      onChange={(e) => handleUpdateAssignment(selectedTicket.id, e.target.value)}
                      className="w-full bg-slate-50 px-3 py-2.5 rounded-xl text-xs font-bold outline-none border border-transparent focus:border-emerald-600 focus:bg-white"
                    >
                      <option value="">-- UNASSIGNED (QUEUE) --</option>
                      <option value="Agent Olawale">Agent Olawale (Loan Ledger Audit Team)</option>
                      <option value="Agent Ibrahim">Agent Ibrahim (SS Clearing Settlement Team)</option>
                      <option value="Super Admin Hameed">Super Admin Hameed (Global Auditor)</option>
                      <option value="Agent Chinelo">Agent Chinelo (Society Disbursals Dept)</option>
                    </select>
                  </div>

                  {/* Status update selector dropdown */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Shift Support Status</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['pending', 'assigned', 'investigating', 'resolved'] as const).map(st => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => handleUpdateStatus(selectedTicket.id, st)}
                          className={`py-2 text-[10px] font-black uppercase tracking-wider rounded-xl border ${
                            selectedTicket.status === st
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-400/25'
                              : 'bg-slate-50 text-slate-505 border-slate-105 border-slate-200'
                          }`}
                        >
                          {st === 'investigating' ? 'Audit' : st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Direct Automated Corrections Ledger adjustment */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-205 border-slate-200 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs uppercase tracking-tight">
                      <Wrench size={14} className="text-emerald-700 animate-spin" style={{ animationDuration: '5s' }} />
                      <span>Direct Ledger Clearance</span>
                    </div>
                    <p className="text-[10px] text-slate-450 text-slate-500 leading-relaxed font-semibold">
                      Deploy direct automated ledgers reconciliation or flush the withdrawal payout clearing gateway pipeline safely. No SQL required.
                    </p>
                    <button
                      type="button"
                      onClick={() => handleDeployLedgerCorrection(selectedTicket.id)}
                      className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 size={12} />
                      <span>Deploy Ledger Recalculation Correction</span>
                    </button>
                  </div>

                  {/* Internal Admin Notation Section */}
                  <div className="space-y-1 pb-4 border-b border-slate-105 border-slate-100">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Append Internal Audit Log Notation</label>
                    <textarea
                      placeholder="Verified ledger statement. Adjusting database offsets..."
                      value={notationText}
                      onChange={(e) => setNotationText(e.target.value)}
                      className="w-full bg-slate-50 px-3 py-2.5 border-none rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-500 resize-none h-20 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveNotation(selectedTicket.id)}
                      className="w-full py-2 border border-slate-201 hover:bg-slate-50 text-slate-700 text-[10px] font-extrabold uppercase tracking-widest rounded-xl transition-all"
                    >
                      Save Private Audit Notation
                    </button>
                  </div>

                  {/* Thread stream notation log preview */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-mono text-slate-400 font-extrabold uppercase">Audit Message & Operations log</p>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                      {selectedTicket.replies?.map((r, idx) => (
                        <div key={idx} className="p-3 bg-slate-950 text-slate-200 rounded-xl text-[10px] font-mono leading-relaxed border border-slate-900">
                          <div className="flex justify-between text-slate-400 font-bold uppercase mb-1">
                            <span>{r.author}</span>
                            <span>{new Date(r.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <p>{r.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Admin response output to ticket chat */}
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={ticketReplyMsg}
                      onChange={(e) => setTicketReplyMsg(e.target.value)}
                      placeholder="Publish response to member thread..."
                      className="grow bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAdminReply(selectedTicket.id);
                      }}
                    />
                    <button
                      onClick={() => handleAdminReply(selectedTicket.id)}
                      className="bg-slate-900 text-white rounded-xl px-4 text-xs font-bold font-mono transition-transform active:scale-[0.98]"
                    >
                      Reply
                    </button>
                  </div>

                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </AdminLayout>
  );
}
