import React, { useState } from 'react';
import { 
  CreditCard, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Calendar, 
  TrendingUp,
  X
} from 'lucide-react';

interface MemberLoansTabProps {
  memberData: any;
  onOpenHelpdesk: () => void;
}

export const MemberLoansTab: React.FC<MemberLoansTabProps> = ({
  memberData,
  onOpenHelpdesk,
}) => {
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [loanAmount, setLoanAmount] = useState('');
  const [loanTenure, setLoanTenure] = useState('12');
  const [loanPurpose, setLoanPurpose] = useState('Personal / Household Development');
  const [applyState, setApplyState] = useState<{ status: 'idle' | 'loading' | 'success' | 'error'; message?: string }>({ status: 'idle' });

  const os = Number(memberData?.ordinarySavings || 0);
  const maxLoanEligible = 2 * os;
  const outstandingLoans = Number(memberData?.outstandingLoans || 0);
  const availableCredit = Math.max(0, maxLoanEligible - outstandingLoans);

  const formatCurrency = (val: number) => {
    return `₦${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const requested = parseFloat(loanAmount);
    if (isNaN(requested) || requested <= 0) {
      setApplyState({ status: 'error', message: 'Please enter a valid loan amount.' });
      return;
    }
    if (requested > availableCredit) {
      setApplyState({ 
        status: 'error', 
        message: `Requested loan exceeds your maximum available borrowing headroom of ${formatCurrency(availableCredit)}.` 
      });
      return;
    }

    setApplyState({ status: 'loading' });
    setTimeout(() => {
      setApplyState({ 
        status: 'success', 
        message: `Loan application for ${formatCurrency(requested)} over ${loanTenure} months submitted for committee review. Reference: ZMC-LN-${Math.floor(100000 + Math.random() * 900000)}.` 
      });
      setLoanAmount('');
    }, 1200);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header & Quick Apply */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
            Loans & Credit Facilities
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
            Low-interest cooperative financing backed by your Ordinary Savings
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setApplyState({ status: 'idle' });
            setIsApplyModalOpen(true);
          }}
          disabled={availableCredit <= 0}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary/90 transition shadow-xs disabled:opacity-50 cursor-pointer self-start sm:self-auto"
        >
          <CreditCard size={16} />
          <span>Apply for New Loan</span>
        </button>
      </div>

      {/* 2. Credit Eligibility Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Maximum Borrowing Capacity */}
        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-5 shadow-xs">
          <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
            Max Borrowing Limit (2x OS)
          </p>
          <p className="font-headline text-2xl font-extrabold text-on-surface font-mono">
            {formatCurrency(maxLoanEligible)}
          </p>
          <p className="text-[11px] text-on-surface-variant mt-1.5">
            Based on ₦{os.toLocaleString()} Ordinary Savings
          </p>
        </div>

        {/* Current Active Loan Outstanding */}
        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-5 shadow-xs">
          <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
            Outstanding Balance
          </p>
          <p className={`font-headline text-2xl font-extrabold font-mono ${
            outstandingLoans > 0 ? 'text-rose-700' : 'text-on-surface'
          }`}>
            {formatCurrency(outstandingLoans)}
          </p>
          <p className="text-[11px] text-on-surface-variant mt-1.5">
            {outstandingLoans > 0 ? 'Active payroll deduction deduction active' : 'No active outstanding debt'}
          </p>
        </div>

        {/* Available Credit Headroom */}
        <div className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-5 shadow-xs">
          <p className="text-[11px] font-bold text-primary uppercase tracking-wider mb-1">
            Available Credit Line
          </p>
          <p className="font-headline text-2xl font-extrabold text-primary font-mono">
            {formatCurrency(availableCredit)}
          </p>
          <p className="text-[11px] text-on-surface-variant mt-1.5">
            Instant approval capacity
          </p>
        </div>
      </div>

      {/* 3. Active Loan / Application Status */}
      <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="font-headline font-bold text-base sm:text-lg text-on-surface">
          Active Loan Facility
        </h2>

        {outstandingLoans > 0 ? (
          <div className="bg-surface-container-low border border-outline-variant/50 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <CreditCard size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-on-surface">Cooperative Development Loan</h3>
                  <p className="text-[11px] font-mono text-on-surface-variant">Facility ID: LN-2026-044 • Rate: 5.0% Simple Interest</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold self-start sm:self-auto">
                Repayment Active
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-outline-variant/30 text-xs">
              <div>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Principal Disbursed</p>
                <p className="font-bold text-on-surface font-mono mt-0.5">{formatCurrency(outstandingLoans * 1.35)}</p>
              </div>
              <div>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Current Balance</p>
                <p className="font-bold text-rose-700 font-mono mt-0.5">{formatCurrency(outstandingLoans)}</p>
              </div>
              <div>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Monthly Deduction</p>
                <p className="font-bold text-on-surface font-mono mt-0.5">{formatCurrency(outstandingLoans / 8)}</p>
              </div>
              <div>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Estimated Maturity</p>
                <p className="font-bold text-on-surface mt-0.5">8 Cycles Remaining</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center bg-surface-container-low/50 rounded-2xl border border-dashed border-outline-variant/60 space-y-2">
            <CheckCircle2 size={32} className="text-primary mx-auto opacity-70" />
            <h3 className="font-bold text-sm text-on-surface">No Outstanding Loan Obligations</h3>
            <p className="text-xs text-on-surface-variant max-w-md mx-auto">
              Your account is 100% debt-free. You have {formatCurrency(availableCredit)} in available credit headroom.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setApplyState({ status: 'idle' });
                  setIsApplyModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 transition cursor-pointer"
              >
                <span>Start Loan Application</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. Policy & Loan Rules Notice */}
      <div className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-5 flex items-start gap-3.5">
        <ShieldCheck size={20} className="text-primary shrink-0 mt-0.5" />
        <div className="text-xs text-on-surface-variant space-y-1">
          <p className="font-bold text-on-surface">Cooperative Loan Terms & Bylaws</p>
          <p className="leading-relaxed">
            All loans are approved based on the 2x Ordinary Savings guarantee rule. Repayments are automatically debited via monthly payroll deductions over the approved tenure (6 to 24 months). Early liquidation incurs zero penalty.
          </p>
        </div>
      </div>

      {/* Loan Application Modal */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-xl space-y-5 relative">
            <button
              type="button"
              onClick={() => setIsApplyModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low cursor-pointer"
            >
              <X size={18} />
            </button>

            <div>
              <h2 className="font-headline font-bold text-lg sm:text-xl text-on-surface">
                Cooperative Loan Application
              </h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Available credit limit: <strong className="text-primary font-mono">{formatCurrency(availableCredit)}</strong>
              </p>
            </div>

            {applyState.status === 'success' ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl space-y-3">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <CheckCircle2 size={18} className="text-emerald-700 shrink-0" />
                  <span>Application Submitted</span>
                </div>
                <p className="text-xs leading-relaxed">{applyState.message}</p>
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="w-full py-2 bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer hover:bg-emerald-800"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} className="space-y-4">
                {applyState.status === 'error' && (
                  <div className="p-3 bg-error-container text-on-error-container rounded-xl text-xs flex items-start gap-2">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span>{applyState.message}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    Requested Amount (₦)
                  </label>
                  <input
                    type="number"
                    required
                    min="5000"
                    max={availableCredit}
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                    placeholder={`e.g. ${Math.min(availableCredit, 100000)}`}
                    className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl px-3.5 py-2.5 text-xs text-on-surface font-mono font-bold focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">
                      Repayment Tenure
                    </label>
                    <select
                      value={loanTenure}
                      onChange={(e) => setLoanTenure(e.target.value)}
                      className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl px-3 py-2.5 text-xs text-on-surface font-medium focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none cursor-pointer"
                    >
                      <option value="6">6 Months</option>
                      <option value="12">12 Months (Standard)</option>
                      <option value="18">18 Months</option>
                      <option value="24">24 Months</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">
                      Purpose
                    </label>
                    <select
                      value={loanPurpose}
                      onChange={(e) => setLoanPurpose(e.target.value)}
                      className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl px-3 py-2.5 text-xs text-on-surface font-medium focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none cursor-pointer"
                    >
                      <option value="Personal / Household Development">Personal Development</option>
                      <option value="Housing / Renovation">Housing / Renovation</option>
                      <option value="Education / School Fees">Education / Tuition</option>
                      <option value="Medical / Emergency">Emergency / Medical</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 bg-surface-container-low rounded-xl text-[11px] text-on-surface-variant space-y-1">
                  <div className="flex justify-between">
                    <span>Est. Monthly Deduction:</span>
                    <strong className="text-on-surface font-mono">
                      {loanAmount && !isNaN(parseFloat(loanAmount))
                        ? formatCurrency((parseFloat(loanAmount) * 1.05) / parseInt(loanTenure, 10))
                        : '₦0.00'}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Interest Rate:</span>
                    <span className="text-on-surface">5% p.a.</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsApplyModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-on-surface-variant hover:bg-surface-container-low cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={applyState.status === 'loading'}
                    className="px-5 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 transition shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    {applyState.status === 'loading' ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
