import React from 'react';
import { 
  ArrowUpRight, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Lock, 
  Info,
  ArrowLeft
} from 'lucide-react';

interface MemberWithdrawalTabProps {
  memberData: any;
  withdrawalAmount: string;
  setWithdrawalAmount: (val: string) => void;
  withdrawalAccount: string;
  setWithdrawalAccount: (val: string) => void;
  withdrawalReason: string;
  setWithdrawalReason: (val: string) => void;
  withdrawalPin: string;
  setWithdrawalPin: (val: string) => void;
  withdrawalState: { status: 'idle' | 'loading' | 'success' | 'error'; message?: string };
  onSubmitWithdrawal: (e: React.FormEvent) => void;
  onBackToOverview: () => void;
}

export const MemberWithdrawalTab: React.FC<MemberWithdrawalTabProps> = ({
  memberData,
  withdrawalAmount,
  setWithdrawalAmount,
  withdrawalAccount,
  setWithdrawalAccount,
  withdrawalReason,
  setWithdrawalReason,
  withdrawalPin,
  setWithdrawalPin,
  withdrawalState,
  onSubmitWithdrawal,
  onBackToOverview,
}) => {
  const userBalances = {
    ss: Number(memberData?.specialSavings || 0),
    ia: Number(memberData?.investmentAmount || 0),
    cp: Number(memberData?.commoditySavings || 0),
    mca: Number(memberData?.muslimCommunitySavings || memberData?.muslimSavings || 0),
    os: Number(memberData?.ordinarySavings || 0),
  };

  const currentMax = userBalances[withdrawalAccount as keyof typeof userBalances] || 0;

  const formatCurrency = (val: number) => {
    return `₦${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-6 pb-12 max-w-2xl mx-auto">
      {/* Back Button */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBackToOverview}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-semibold border border-outline-variant/50 transition cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back to Overview</span>
        </button>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h1 className="font-headline text-2xl font-extrabold text-on-surface tracking-tight">
            Request Payout / Withdrawal
          </h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Funds will be disbursed to your linked bank account after 256-bit PIN authorization.
          </p>
        </div>

        {withdrawalState.status === 'success' ? (
          <div className="p-6 bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <CheckCircle2 size={22} />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base">Payout Request Approved</h3>
                <p className="text-xs text-emerald-800">Electronic transfer initiated</p>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-emerald-900">{withdrawalState.message}</p>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={onBackToOverview}
                className="px-5 py-2.5 bg-emerald-800 text-white rounded-xl text-xs font-bold hover:bg-emerald-900 transition cursor-pointer"
              >
                Return to Overview
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmitWithdrawal} className="space-y-5">
            {withdrawalState.status === 'error' && (
              <div className="p-4 bg-error-container text-on-error-container rounded-xl text-xs flex items-start gap-2.5">
                <AlertCircle size={18} className="shrink-0 mt-0.5 text-error" />
                <span className="leading-relaxed">{withdrawalState.message}</span>
              </div>
            )}

            {/* Select Source Account */}
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1.5">
                Select Source Account
              </label>
              <select
                value={withdrawalAccount}
                onChange={(e) => setWithdrawalAccount(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl px-3.5 py-2.5 text-xs text-on-surface font-medium focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none cursor-pointer"
              >
                <option value="ss">Special Savings (SS) — Balance: {formatCurrency(userBalances.ss)} (Recommended)</option>
                <option value="ia">Investment Account (IA) — Balance: {formatCurrency(userBalances.ia)}</option>
                <option value="cp">Commodity Account (CP) — Balance: {formatCurrency(userBalances.cp)}</option>
                <option value="mca">Muslim Community (MCA) — Balance: {formatCurrency(userBalances.mca)}</option>
                <option value="os">Ordinary Savings (OS) — Balance: {formatCurrency(userBalances.os)} (Reduces Loan Capacity)</option>
              </select>
            </div>

            {/* Withdrawal Amount */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-on-surface">
                  Amount to Withdraw (₦)
                </label>
                <span className="text-[11px] text-on-surface-variant font-mono">
                  Available: <strong className="text-primary">{formatCurrency(currentMax)}</strong>
                </span>
              </div>
              <input
                type="number"
                required
                min="100"
                max={currentMax}
                value={withdrawalAmount}
                onChange={(e) => setWithdrawalAmount(e.target.value)}
                placeholder="Enter amount in Naira"
                className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl px-3.5 py-2.5 text-xs text-on-surface font-mono font-bold focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
              />
            </div>

            {/* Reason / Narrative */}
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1.5">
                Reason / Remarks (Optional)
              </label>
              <input
                type="text"
                value={withdrawalReason}
                onChange={(e) => setWithdrawalReason(e.target.value)}
                placeholder="e.g., Emergency medical expense, school fee top-up"
                className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
              />
            </div>

            {/* Transaction PIN Verification */}
            <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/50 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-on-surface">
                <Lock size={15} className="text-primary" />
                <span>Authorization PIN</span>
              </div>
              <input
                type="password"
                maxLength={6}
                required
                value={withdrawalPin}
                onChange={(e) => setWithdrawalPin(e.target.value)}
                placeholder="Enter your 4-6 digit Transaction PIN"
                className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded-lg px-3 py-2 text-xs text-on-surface font-mono text-center tracking-widest focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
              />
              <p className="text-[11px] text-on-surface-variant text-center">
                Default PIN is <span className="font-mono font-bold">1234</span> unless changed in Security settings.
              </p>
            </div>

            {/* Submission Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onBackToOverview}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-on-surface-variant hover:bg-surface-container-low cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={withdrawalState.status === 'loading' || currentMax <= 0}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary/90 transition shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <ArrowUpRight size={16} />
                <span>{withdrawalState.status === 'loading' ? 'Authorizing Payout...' : 'Confirm Withdrawal'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
