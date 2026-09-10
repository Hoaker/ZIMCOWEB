import React from 'react';
import { 
  X, 
  Printer, 
  Download, 
  ShieldCheck, 
  Calendar, 
  Building2, 
  CheckCircle2, 
  FileText,
  User,
  ArrowDownLeft
} from 'lucide-react';
import { MonthlySavingsRecordItem } from '../MonthlySavingsPassbookTable';

interface MonthlyDeductionSlipModalProps {
  record: MonthlySavingsRecordItem | null;
  memberData: any;
  onClose: () => void;
}

export const MonthlyDeductionSlipModal: React.FC<MonthlyDeductionSlipModalProps> = ({
  record,
  memberData,
  onClose
}) => {
  if (!record) return null;

  const formatCurrency = (val?: number) => {
    return `₦${Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handlePrint = () => {
    window.print();
  };

  const os = Number(record.ordinarySavings || 0);
  const ss = Number(record.specialSavings || 0);
  const ia = Number(record.investment || 0);
  const cp = Number(record.commodityPurchase || 0);
  const mc = Number(record.muslimCommunity || 0);
  const lr = Number(record.loanReimbursement || 0);
  const total = Number(record.total || (os + ss + ia + cp + mc + lr));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="bg-surface-container-lowest border border-outline-variant rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Action Bar */}
        <div className="flex items-center justify-between border-b border-outline-variant/40 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <FileText size={18} />
            </div>
            <div>
              <h3 className="font-headline font-bold text-base text-on-surface">
                Official Monthly Deduction Advice
              </h3>
              <p className="text-xs text-on-surface-variant font-mono">
                Cycle: {record.month}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface border border-outline-variant/60 text-xs font-bold transition cursor-pointer"
            >
              <Printer size={14} />
              <span>Print Slip</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition cursor-pointer"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Slip Content */}
        <div className="space-y-6 bg-white p-6 rounded-xl border border-slate-200 text-slate-900 shadow-2xs print:border-none print:p-0">
          {/* Organization Letterhead */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-emerald-700 pb-4 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-black text-sm">
                  Z
                </div>
                <div>
                  <h2 className="font-headline font-black text-lg text-emerald-900 tracking-tight leading-tight">
                    ZIMCO CO-OPERATIVE SOCIETY
                  </h2>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Staff Multi-Purpose Cooperative Society Limited • Treasury & Bursary Ledger
                  </p>
                </div>
              </div>
            </div>

            <div className="text-right sm:text-right">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase tracking-wider border border-emerald-200">
                <CheckCircle2 size={12} />
                <span>Bursary Verified</span>
              </span>
              <p className="text-[11px] text-slate-500 font-mono mt-1">
                Ref: {record.id || `PAY-${record.month.replace(/\s+/g, '-').toUpperCase()}`}
              </p>
            </div>
          </div>

          {/* Cooperator Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl text-xs border border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Cooperator Name</span>
              <span className="font-bold text-slate-800 line-clamp-1">{memberData?.fullName || memberData?.name || 'Member'}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Staff / Member ID</span>
              <span className="font-mono font-bold text-slate-800">{memberData?.id || 'ZMC-001'}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Payroll Cycle</span>
              <span className="font-bold text-emerald-800">{record.month}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Processing Date</span>
              <span className="text-slate-700">{record.date || 'Standard Payroll Schedule'}</span>
            </div>
          </div>

          {/* Deductions Itemized Table */}
          <div>
            <h4 className="font-headline font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">
              Itemized Monthly Account Allocations
            </h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-4">Account Category</th>
                    <th className="py-2.5 px-4 text-center">Ledger Code</th>
                    <th className="py-2.5 px-4 text-right">Deduction (₦)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  <tr>
                    <td className="py-2.5 px-4 font-bold text-slate-800">Ordinary Savings (OS)</td>
                    <td className="py-2.5 px-4 text-center text-slate-500 font-mono text-[11px]">GL-101</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">{formatCurrency(os)}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-bold text-slate-800">Special Savings (SS)</td>
                    <td className="py-2.5 px-4 text-center text-slate-500 font-mono text-[11px]">GL-102</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">{formatCurrency(ss)}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-bold text-slate-800">Investment Account (IA)</td>
                    <td className="py-2.5 px-4 text-center text-slate-500 font-mono text-[11px]">GL-201</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">{formatCurrency(ia)}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-bold text-slate-800">Commodity Purchase (CP)</td>
                    <td className="py-2.5 px-4 text-center text-slate-500 font-mono text-[11px]">GL-301</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">{formatCurrency(cp)}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-bold text-slate-800">Muslim Community Account (MCA)</td>
                    <td className="py-2.5 px-4 text-center text-slate-500 font-mono text-[11px]">GL-401</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">{formatCurrency(mc)}</td>
                  </tr>
                  {lr > 0 && (
                    <tr className="bg-amber-50/50">
                      <td className="py-2.5 px-4 font-bold text-amber-900">Loan Repayment Recovery (LR)</td>
                      <td className="py-2.5 px-4 text-center text-amber-700 font-mono text-[11px]">GL-501</td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-amber-900">{formatCurrency(lr)}</td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-emerald-50/80 border-t-2 border-emerald-600 font-bold">
                  <tr>
                    <td colSpan={2} className="py-3 px-4 text-emerald-950 uppercase text-[11px]">
                      Total Net Monthly Deductions Credited
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-sm text-emerald-950">
                      {formatCurrency(total)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Bursary Endorsement & Verification Footer */}
          <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
              <span>Electronically certified and verified via ZIMCO Central Bursary Ingestion Engine.</span>
            </div>
            <div className="font-mono text-[10px] text-slate-400">
              Generated {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Footer Button */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold transition cursor-pointer"
          >
            Close Advice Slip
          </button>
        </div>
      </div>
    </div>
  );
};
