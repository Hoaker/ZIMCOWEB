import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { 
  Maximize2, 
  Minimize2, 
  CheckCircle2, 
  XCircle, 
  Check, 
  Download, 
  TrendingUp, 
  FileSpreadsheet, 
  User, 
  Building2, 
  Clock, 
  AlertCircle 
} from 'lucide-react';
import { triggerLoanNotification } from '../../lib/notificationService';
import { db } from '../../lib/firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';

interface PendingLoan {
  id: string;
  memberId: string;
  name: string;
  email: string;
  phone: string;
  amount: number;
  amountFormatted: string;
  risk: 'Low' | 'Medium' | 'High';
  date: string;
  status: 'pending' | 'approved' | 'rejected' | 'disbursed';
}

export default function LoanDashboard() {
  const [isTableExpanded, setIsTableExpanded] = useState(false);
  const [loans, setLoans] = useState<PendingLoan[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const snap = await getDocs(collection(db, 'loans'));
        const loaded: PendingLoan[] = [];
        snap.forEach((dSnap) => {
          const d = dSnap.data();
          loaded.push({
            id: dSnap.id,
            memberId: d.memberId || '',
            name: d.name || d.memberName || 'Member',
            email: d.email || d.memberEmail || '',
            phone: d.phone || d.memberPhone || '',
            amount: Number(d.amount) || 0,
            amountFormatted: d.amountFormatted || `₦${(Number(d.amount) || 0).toLocaleString()}`,
            risk: d.risk || 'Low',
            date: d.date || 'Recent',
            status: d.status || 'pending'
          });
        });
        setLoans(loaded);
      } catch (err) {
        console.warn('Could not fetch loans from Firestore:', err);
        setLoans([]);
      }
    };

    fetchLoans();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const handleAction = async (loan: PendingLoan, action: 'approved' | 'rejected' | 'disbursed') => {
    setLoans(prev => prev.map(l => l.id === loan.id ? { ...l, status: action } : l));

    try {
      await setDoc(doc(db, 'loans', loan.id), { status: action }, { merge: true });
    } catch (dbErr) {
      console.warn('Silent loan status update notice:', dbErr);
    }

    try {
      await triggerLoanNotification({
        memberId: loan.memberId,
        memberName: loan.name,
        memberEmail: loan.email,
        memberPhone: loan.phone,
        loanId: loan.id,
        amount: loan.amount,
        status: action,
        disbursedDate: action === 'disbursed' ? new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : undefined
      });

      const actionText = action === 'approved' ? 'Approved' : action === 'rejected' ? 'Declined' : 'Disbursed';
      showToast(`Loan ${loan.id} ${actionText}! Automated SMS & Email alerts dispatched to ${loan.name}.`);
    } catch (err) {
      console.warn('Loan notification error:', err);
      showToast(`Loan ${loan.id} updated.`);
    }
  };

  const pendingCount = loans.filter(l => l.status === 'pending').length;
  const approvedVolume = loans.filter(l => l.status === 'approved' || l.status === 'disbursed').reduce((s, l) => s + l.amount, 0);
  const totalVolume = loans.reduce((s, l) => s + l.amount, 0);

  const lowRiskCount = loans.filter(l => l.risk === 'Low').length;
  const medRiskCount = loans.filter(l => l.risk === 'Medium').length;
  const highRiskCount = loans.filter(l => l.risk === 'High').length;

  const riskData = loans.length > 0 ? [
    { name: 'Low Risk', value: lowRiskCount, color: '#10b981' },
    { name: 'Medium Risk', value: medRiskCount, color: '#f59e0b' },
    { name: 'High Risk', value: highRiskCount, color: '#f43f5e' },
  ] : [
    { name: 'No Applications', value: 0, color: '#94a3b8' }
  ];

  return (
    <AdminLayout role="Loan Approvals" icon="fact_check">
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-emerald-700 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-xs font-bold">{toastMessage}</p>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-[0.2em] mb-1">
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            Credit Operations
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-on-surface tracking-tight font-headline">Loan Approvals</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-3.5 py-2 sm:px-5 sm:py-2.5 bg-white border border-surface-container-high rounded-xl text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm cursor-pointer">
            <Download className="w-4 h-4 shrink-0 text-slate-600" />
            Export Data
          </button>
          <button className="px-3.5 py-2 sm:px-5 sm:py-2.5 bg-primary text-on-primary rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-primary-container transition-all flex items-center gap-2 shadow-lg shadow-primary/20 cursor-pointer">
            <TrendingUp className="w-4 h-4 shrink-0" />
            Risk Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard label="Pending Applications" value={pendingCount.toString()} subValue="Requires review" icon={<Clock className="w-5 h-5" />} />
        <StatCard label="Approved (This Month)" value={approvedVolume > 0 ? `₦${(approvedVolume / 1000000).toFixed(1)}M` : '₦0.00'} subValue="Authorized for payout" icon={<CheckCircle2 className="w-5 h-5" />} />
        <StatCard label="Total Loan Volume" value={totalVolume > 0 ? `₦${(totalVolume / 1000000).toFixed(1)}M` : '₦0.00'} subValue="Active portfolio" icon={<Building2 className="w-5 h-5" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pending Applications Table */}
        <div className={`bg-white shadow-sm border border-surface-container-high transition-all duration-200 ${
          isTableExpanded
            ? 'fixed inset-0 z-[100] rounded-none w-screen h-screen p-6 sm:p-10 bg-white overflow-auto'
            : 'lg:col-span-2 rounded-2xl p-6 sm:p-8'
        }`}>
          <div className="flex justify-between items-center mb-8 sm:mb-10">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-on-surface font-headline">Pending Applications</h2>
              <p className="text-xs text-on-surface-variant mt-1 font-medium">Review and authorize member loan requests with instant SMS/Email alerts</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                id="btn-expand-loan-table"
                type="button"
                onClick={() => setIsTableExpanded(!isTableExpanded)}
                className="p-2 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer border border-slate-200/60"
                title={isTableExpanded ? "Restore table size" : "Expand loan applications table to full screen"}
              >
                {isTableExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-surface-container-high">
                  <th className="pb-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Applicant</th>
                  <th className="pb-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Amount</th>
                  <th className="pb-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Risk Level</th>
                  <th className="pb-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest text-right">Review & Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loans.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400 text-xs font-medium">
                      No loan records or pending applications in database.
                    </td>
                  </tr>
                ) : (
                  loans.map(loan => {
                  const riskColor = loan.risk === 'Low' ? 'text-emerald-600 bg-emerald-50' : loan.risk === 'Medium' ? 'text-amber-600 bg-amber-50' : 'text-rose-600 bg-rose-50';
                  return (
                    <tr key={loan.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 sm:py-5">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-white transition-colors shrink-0">
                            <User className="w-4 h-4 text-slate-600" />
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm font-bold text-on-surface">{loan.name}</p>
                            <p className="text-[9px] sm:text-[10px] font-medium text-on-surface-variant uppercase tracking-widest">{loan.date} • {loan.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 sm:py-5">
                        <p className="text-xs sm:text-sm font-black text-on-surface font-headline">{loan.amountFormatted}</p>
                      </td>
                      <td className="py-4 sm:py-5">
                        <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full ${riskColor}`}>
                          {loan.risk} Risk
                        </span>
                      </td>
                      <td className="py-4 sm:py-5 text-right">
                        {loan.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button 
                              onClick={() => handleAction(loan, 'approved')}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-[10px] font-black uppercase tracking-wider transition active:scale-95 cursor-pointer flex items-center gap-1"
                              title="Approve loan and send automated SMS & Email notification"
                            >
                              <Check size={12} />
                              Approve
                            </button>
                            <button 
                              onClick={() => handleAction(loan, 'rejected')}
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-xl text-[10px] font-black uppercase tracking-wider transition active:scale-95 cursor-pointer flex items-center gap-1"
                              title="Decline loan and notify member"
                            >
                              <XCircle size={12} />
                              Decline
                            </button>
                          </div>
                        ) : loan.status === 'approved' ? (
                          <div className="flex items-center justify-end gap-2">
                            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-xl text-[10px] font-bold uppercase">Approved</span>
                            <button 
                              onClick={() => handleAction(loan, 'disbursed')}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-bold uppercase shadow-sm active:scale-95 transition cursor-pointer"
                            >
                              Disburse
                            </button>
                          </div>
                        ) : loan.status === 'disbursed' ? (
                          <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-xl text-[10px] font-black uppercase">Disbursed</span>
                        ) : (
                          <span className="px-2.5 py-1 bg-rose-100 text-rose-800 rounded-xl text-[10px] font-black uppercase">Declined</span>
                        )}
                      </td>
                    </tr>
                  );
                }))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Risk Assessment Overview */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-surface-container-high flex flex-col">
          <h2 className="text-xl sm:text-2xl font-black text-on-surface mb-6 font-headline">Risk Assessment</h2>
          
          <div className="h-64 w-full mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-6 flex-1">
            {riskData.map((item) => (
              <RiskItem key={item.name} label={item.name} count={item.value} color={item.color} />
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function StatCard({ label, value, subValue, icon }: { label: string, value: string, subValue: string, icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-surface-container-high relative overflow-hidden group hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-6">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-surface-container-low flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
          {icon}
        </div>
      </div>
      <div className="relative z-10">
        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.15em] mb-2">{label}</p>
        <p className="text-2xl sm:text-3xl font-black text-on-surface mb-1 font-headline tracking-tight">{value}</p>
        <p className="text-[10px] font-medium text-on-surface-variant/70">{subValue}</p>
      </div>
    </div>
  );
}

interface RiskItemProps {
  label: string;
  count: number;
  color: string;
}

const RiskItem: React.FC<RiskItemProps> = ({ label, count, color }) => {
  const total = 124;
  const percentage = (count / total) * 100;
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{label}</p>
        <p className="text-xs font-black text-on-surface">{Math.round(percentage)}%</p>
      </div>
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${percentage}%`, backgroundColor: color }}></div>
      </div>
    </div>
  );
};
