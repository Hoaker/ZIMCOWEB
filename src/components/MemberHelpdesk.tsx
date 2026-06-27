import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LifeBuoy, 
  MessageSquare, 
  Send, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  User, 
  HelpCircle,
  FileText,
  TrendingDown,
  ArrowRight,
  ChevronDown
} from 'lucide-react';

export interface SupportTicket {
  id: string;
  memberId: string;
  memberName: string;
  category: 'loan_adjustment' | 'withdrawal_bottleneck' | 'savings_discrepancy' | 'general';
  subject: string;
  description: string;
  amountAffected?: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'assigned' | 'investigating' | 'resolved';
  assignee?: string;
  createdAt: string;
  notation?: string;
  replies: { author: string; message: string; timestamp: string }[];
}

const DEFAULT_TICKETS: SupportTicket[] = [
  {
    id: 'TKT-2026-621',
    memberId: 'ZIM-2024-001',
    memberName: 'Amao Abdulhameed',
    category: 'loan_adjustment',
    subject: 'Mismatched Loan Out-balance on Commodity Purchase',
    description: 'The interest-free commodity financing ledger is showing ₦135,000 outstanding, but my bank deduction sheet processed on March 25th already allocated ₦35,000. It seems the payment post did not register.',
    amountAffected: 35000,
    urgency: 'high',
    status: 'assigned',
    assignee: 'Agent Olawale',
    createdAt: '2026-06-01T14:21:00Z',
    notation: 'Re-checking batch deduction worksheet dated Mar 25.',
    replies: [
      { author: 'System', message: 'Ticket opened automatically upon intake.', timestamp: '2026-06-01T14:21:00Z' },
      { author: 'Admin Hameed', message: 'Assigned to Olawale to verify commodity warehouse invoice.', timestamp: '2026-06-01T16:30:00Z' }
    ]
  },
  {
    id: 'TKT-2026-592',
    memberId: 'ZIM-2024-001',
    memberName: 'Amao Abdulhameed',
    category: 'withdrawal_bottleneck',
    subject: 'SS Account Settlement Delay to Wema Bank LLC',
    description: 'I initiated a withdrawal request of ₦75,000 from Special Savings three days ago. The status is marked "Completed" in my panel but the local bank transfer hasn\'t cleared into my account.',
    amountAffected: 75000,
    urgency: 'medium',
    status: 'resolved',
    assignee: 'Agent Ibrahim',
    createdAt: '2026-05-30T09:15:00Z',
    notation: 'Settlement confirmed. Ref: BRY-99430291-N.',
    replies: [
      { author: 'System', message: 'Ticket created.', timestamp: '2026-05-30T09:15:00Z' },
      { author: 'Agent Ibrahim', message: 'NIBSS transaction was momentarily queued. Overriden manually. Please confirm status.', timestamp: '2026-05-31T11:00:00Z' }
    ]
  }
];

export default function MemberHelpdesk() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [showFaq, setShowFaq] = useState<number | null>(null);
  
  // Form State
  const [category, setCategory] = useState<'loan_adjustment' | 'withdrawal_bottleneck' | 'savings_discrepancy' | 'general'>('loan_adjustment');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [successMsg, setSuccessMsg] = useState('');
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [userReply, setUserReply] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('zimco_support_tickets');
    if (saved) {
      setTickets(JSON.parse(saved));
    } else {
      localStorage.setItem('zimco_support_tickets', JSON.stringify(DEFAULT_TICKETS));
      setTickets(DEFAULT_TICKETS);
    }
  }, []);

  const saveUpdatedTickets = (updated: SupportTicket[]) => {
    setTickets(updated);
    localStorage.setItem('zimco_support_tickets', JSON.stringify(updated));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !description) return;

    const newTicket: SupportTicket = {
      id: `TKT-2026-${Math.floor(100 + Math.random() * 900)}`,
      memberId: 'ZIM-2024-001',
      memberName: 'John Doe', // default dashboard logged in name
      category,
      subject,
      description,
      amountAffected: amount ? parseFloat(amount) : undefined,
      urgency,
      status: 'pending',
      createdAt: new Date().toISOString(),
      replies: [
        { author: 'System', message: 'Support ticket submitted successfully to helpdesk triage.', timestamp: new Date().toISOString() }
      ]
    };

    const newArr = [newTicket, ...tickets];
    saveUpdatedTickets(newArr);

    // Reset Form
    setSubject('');
    setDescription('');
    setAmount('');
    setUrgency('medium');
    setSuccessMsg('Support Ticket Filed! Our cooperative administration is auditing your concerns.');
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  const handleSendReply = (ticketId: string) => {
    if (!userReply.trim()) return;
    const updated = tickets.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          replies: [...t.replies, {
            author: 'John Doe (Member)',
            message: userReply,
            timestamp: new Date().toISOString()
          }]
        };
      }
      return t;
    });

    saveUpdatedTickets(updated);
    setUserReply('');
    
    // Find active ticket and update local detailed view
    const match = updated.find(t => t.id === ticketId);
    if (match) setActiveTicket(match);
  };

  const getCategoryBadge = (cat: SupportTicket['category']) => {
    switch(cat) {
      case 'loan_adjustment':
        return <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider rounded-md border border-amber-100 dark:border-amber-900/35">Loan Adjustment</span>;
      case 'withdrawal_bottleneck':
        return <span className="px-2.5 py-1 bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-400 text-[10px] font-black uppercase tracking-wider rounded-md border border-red-100 dark:border-red-900/35">Withdrawal Delay</span>;
      case 'savings_discrepancy':
        return <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-800 dark:text-indigo-400 text-[10px] font-black uppercase tracking-wider rounded-md border border-indigo-100 dark:border-indigo-900/35">Savings Discrepancy</span>;
      default:
        return <span className="px-2.5 py-1 bg-slate-50 dark:bg-slate-850 text-slate-700 dark:text-slate-300 text-[10px] font-black uppercase tracking-wider rounded-md border border-slate-200 dark:border-slate-800">General Support</span>;
    }
  };

  const getUrgencyColor = (urg: SupportTicket['urgency']) => {
    switch (urg) {
      case 'critical': return 'text-red-600 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30';
      case 'high': return 'text-orange-600 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/30';
      case 'medium': return 'text-amber-600 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30';
      default: return 'text-slate-500 bg-slate-50 dark:bg-slate-850/50 border-slate-200 dark:border-slate-850';
    }
  };

  const getStatusBadge = (stat: SupportTicket['status']) => {
    switch (stat) {
      case 'resolved':
        return <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-extrabold uppercase tracking-widest rounded-full border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-1.5"><CheckCircle2 size={10} /> Resolved</span>;
      case 'investigating':
        return <span className="px-3 py-1 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 text-[10px] font-extrabold uppercase tracking-widest rounded-full border border-blue-100 dark:border-blue-900/30 flex items-center gap-1.5"><Clock size={10} /> Auditing</span>;
      case 'assigned':
        return <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 text-[10px] font-extrabold uppercase tracking-widest rounded-full border border-indigo-100 dark:border-indigo-900/30 flex items-center gap-1.5"><User size={10} /> Assigned</span>;
      default:
        return <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-extrabold uppercase tracking-widest rounded-full border border-slate-200 dark:border-slate-700 flex items-center gap-1.5"><AlertCircle size={10} /> Pending</span>;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* List Queue & Detail Column */}
      <div className="lg:col-span-2 flex flex-col gap-8">
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-10 border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                <LifeBuoy className="text-emerald-700 dark:text-emerald-400" size={24} />
                Your Support Tickets
              </h2>
              <p className="text-xs text-slate-500 mt-1">Escalated bottlenecks concerning loan reconciliations and balance corrections.</p>
            </div>
          </div>

          <div className="space-y-4">
            {tickets.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-200 rounded-3xl p-6 bg-slate-50/50">
                <p className="text-sm text-slate-500 font-medium">No open tickets found. Create an escalation concern on the right.</p>
              </div>
            ) : (
              tickets.map(ticket => (
                <div 
                  key={ticket.id} 
                  onClick={() => setActiveTicket(ticket)}
                  className={`p-6 rounded-3xl border transition-all cursor-pointer ${
                    activeTicket?.id === ticket.id 
                      ? 'border-emerald-600 bg-emerald-50/15 ring-1 ring-emerald-550/10' 
                      : 'border-slate-105 bg-white hover:bg-slate-50/40 border-slate-100 dark:border-slate-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-bold text-slate-400">{ticket.id}</span>
                      {getCategoryBadge(ticket.category)}
                      <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-md border ${getUrgencyColor(ticket.urgency)}`}>
                        {ticket.urgency}
                      </span>
                    </div>
                    {getStatusBadge(ticket.status)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-tight text-sm line-clamp-1">{ticket.subject}</h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{ticket.description}</p>
                  </div>
                  
                  {ticket.amountAffected && (
                    <div className="mt-3 flex items-center justify-between text-[11px] font-mono p-2 bg-slate-50 dark:bg-slate-950 rounded-xl px-3 border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400 font-bold uppercase">Escalated Discrepancy Amount</span>
                      <span className="text-rose-600 font-black">₦{ticket.amountAffected.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <span>Opened: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                    {ticket.assignee ? (
                      <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                        <User size={10} /> Active Agent: {ticket.assignee}
                      </span>
                    ) : (
                      <span className="text-slate-400 lowercase">awaiting dispatch...</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Detailed Ticket Chat View Panel */}
        {activeTicket && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-10 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-5">
              <div>
                <span className="text-[10px] font-mono text-slate-400 font-extrabold">{activeTicket.id} &bull; TICKET THREAD</span>
                <h3 className="font-headline font-black text-slate-900 dark:text-white text-lg">{activeTicket.subject}</h3>
              </div>
              <button 
                onClick={() => setActiveTicket(null)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
              >
                Close Thread
              </button>
            </div>

            {/* Original Intake Description Card */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-2">
              <span className="text-[9px] font-mono font-bold text-emerald-800 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-md uppercase tracking-wider">Original Complaint Detail</span>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">{activeTicket.description}</p>
            </div>

            {/* Admin Internal Notation Feedback Notice */}
            {activeTicket.notation && (
              <div className="p-4 bg-emerald-50/20 border border-emerald-100 dark:border-emerald-900/15 rounded-xl text-xs text-emerald-950 flex items-start gap-2">
                <div className="p-1 bg-emerald-100 rounded text-emerald-800 shrink-0 uppercase tracking-widest font-mono text-[8px] font-black">Admin Alert</div>
                <div>
                  <span className="font-extrabold text-emerald-900 block">Agent Audit Action Resolved:</span>
                  <span className="text-emerald-800 font-semibold mt-0.5 block">{activeTicket.notation}</span>
                </div>
              </div>
            )}

            {/* Chronological Chat Stream */}
            <div className="space-y-4">
              <p className="text-[10px] font-mono text-slate-400 font-black uppercase tracking-wider">Conversation Log</p>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-3">
                {activeTicket.replies?.map((rep, idx) => (
                  <div 
                    key={idx} 
                    className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-1 ${
                      rep.author.includes('Member') || rep.author.includes('John')
                        ? 'bg-slate-50 dark:bg-slate-850/30 border-slate-100 dark:border-slate-800'
                        : 'bg-emerald-500/5 border-emerald-500/10 text-emerald-950 dark:text-emerald-300'
                    }`}
                  >
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-slate-800 dark:text-slate-200">{rep.author}</span>
                      <span className="text-slate-400 font-mono font-medium">{new Date(rep.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="font-semibold">{rep.message}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Reply Input Form */}
            {activeTicket.status !== 'resolved' && (
              <div className="flex gap-2 border-t border-slate-100 dark:border-slate-850 pt-4">
                <input 
                  type="text" 
                  value={userReply}
                  onChange={(e) => setUserReply(e.target.value)}
                  placeholder="Ask a question or update details regarding this issue..."
                  className="grow bg-slate-50 dark:bg-slate-950 px-4 py-3 rounded-xl text-xs border border-transparent focus:border-emerald-500 outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendReply(activeTicket.id);
                  }}
                />
                <button
                  onClick={() => handleSendReply(activeTicket.id)}
                  className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-5 text-xs font-bold transition-colors flex items-center justify-center gap-1"
                >
                  <Send size={12} />
                  <span>Send</span>
                </button>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Escalation Intake Form Column */}
      <div className="flex flex-col gap-8">
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-16 -mt-16"></div>
          
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <MessageSquare size={20} className="text-emerald-700 dark:text-emerald-400" />
            Lodge Support Case
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Category</label>
              <select 
                value={category}
                onChange={(e: any) => setCategory(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 px-4 py-3 border-none rounded-2xl text-xs focus:ring-2 focus:ring-primary/25 outline-none font-bold"
              >
                <option value="loan_adjustment">Loan Balance Mismatch</option>
                <option value="withdrawal_bottleneck">Withdrawal Delayed Bottleneck</option>
                <option value="savings_discrepancy">Savings Ledger Discrepancy</option>
                <option value="general">Other Technical Support</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Subject</label>
              <input 
                type="text" 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of the bottleneck..."
                className="w-full bg-slate-50 dark:bg-slate-950 px-4 py-3 border-none rounded-2xl text-xs focus:ring-2 focus:ring-primary/25 outline-none font-semibold"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Description</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detail what happened, including dates or transaction batch IDs..."
                className="w-full bg-slate-50 dark:bg-slate-950 px-4 py-3 border-none rounded-2xl text-xs focus:ring-2 focus:ring-primary/25 outline-none font-medium h-32 resize-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Affected Amount (₦) - Optional</label>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount mismatch issues e.g. 5000"
                className="w-full bg-slate-50 dark:bg-slate-950 px-4 py-3 border-none rounded-2xl text-xs focus:ring-2 focus:ring-primary/25 outline-none font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Escalation Priority</label>
              <div className="grid grid-cols-4 gap-2">
                {(['low', 'medium', 'high', 'critical'] as const).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setUrgency(p)}
                    className={`py-2 text-[10px] font-black uppercase tracking-wider rounded-xl border ${
                      urgency === p
                        ? 'bg-rose-50 text-rose-700 border-rose-300 ring-1 ring-rose-400/25'
                        : 'bg-slate-50 text-slate-505 border-slate-105 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-3.5 bg-primary text-on-primary rounded-2xl text-xs font-headline font-black uppercase tracking-widest hover:bg-emerald-800 transition-all flex items-center justify-center gap-2"
            >
              <Send size={14} />
              <span>Submit Escalation Complaint</span>
            </button>

            {successMsg && (
              <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-150 rounded-2xl text-[11px] font-semibold flex items-start gap-2 animate-bounce">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}
          </form>
        </div>

        {/* FAQ Helper Card */}
        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-[2.5rem] p-8 space-y-5">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
            <HelpCircle size={18} className="text-emerald-700" />
            Triage Cheat Sheet
          </h3>
          
          <div className="space-y-3">
            {[
              { q: "How long do loan adjustments take?", a: "Once investigated, our bursary department corrects ledger balances in real-time. Expect audit resolution in 24 hours." },
              { q: "What is a withdrawal bottleneck?", a: "When your savings accounts show a completed withdrawal but the central banking vault takes minutes to post into your personal bank clearing sheet." },
              { q: "Is sovereign identity telemetry encrypted?", a: "Yes. All support data and ticket notation attachments are fully encrypted through Zimco Secure protocol." }
            ].map((faq, i) => (
              <div key={i} className="border-b border-slate-200 dark:border-slate-850 pb-3 last:border-0 last:pb-0">
                <button
                  onClick={() => setShowFaq(showFaq === i ? null : i)}
                  className="w-full flex items-center justify-between text-left text-xs font-bold text-slate-800 dark:text-slate-300 hover:text-emerald-700 transition"
                >
                  <span>{faq.q}</span>
                  <ChevronDown size={14} className={`transform transition-transform ${showFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {showFaq === i && (
                  <p className="text-xs text-slate-500 mt-2 font-medium leading-relaxed">{faq.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
