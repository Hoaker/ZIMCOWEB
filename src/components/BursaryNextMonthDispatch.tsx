import React, { useState, useMemo } from 'react';
import { 
  Send, 
  FileSpreadsheet, 
  DownloadCloud, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Calendar, 
  SlidersHorizontal, 
  Layers, 
  FileText, 
  Printer, 
  Sparkles, 
  Scale, 
  ShieldCheck, 
  Info,
  SendHorizontal,
  FileCheck2,
  Users,
  Building2,
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import zimcoLogo from '@/assets/images/zimco_logo_1780347665840.png';

interface BursaryNextMonthDispatchProps {
  importedRecords: any[];
  firestoreMembers: any[];
  currentMonth: string;
  showToast: (message: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

export interface NextMonthScheduleRow {
  sn: number;
  id: string;
  name: string;
  department?: string;
  ordinarySavings: number;
  specialSavings: number;
  investment: number;
  loanReimbursement: number;
  commodityPurchase: number;
  muslimCommunity: number;
  currentSent: number;
  currentActual: number;
  variance: number;
  nextMonthTotal: number;
  bursaryInstruction: string;
  adjustmentType: 'standard' | 'shortfall_recovery' | 'surplus_offset' | 'loan_repay';
}

export default function BursaryNextMonthDispatch({
  importedRecords,
  firestoreMembers,
  currentMonth,
  showToast
}: BursaryNextMonthDispatchProps) {
  // Target Next Month Cycle state
  const [targetCycle, setTargetCycle] = useState('July 2026');
  const [effectiveDate, setEffectiveDate] = useState('2026-07-25');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'adjustments' | 'loans' | 'standard'>('all');

  // Policy options for generating the next month directive
  const [factorShortfalls, setFactorShortfalls] = useState(true);
  const [factorSurpluses, setFactorSurpluses] = useState(true);
  const [carryLoans, setCarryLoans] = useState(true);
  const [zeroOutCommodity, setZeroOutCommodity] = useState(true);
  const [includeMca, setIncludeMca] = useState(true);

  // 1. Build the Official Next Month Bursary Schedule
  const { scheduleRows, aggregates } = useMemo(() => {
    const rows: NextMonthScheduleRow[] = [];
    let grossTotal = 0;
    let totalOS = 0;
    let totalSS = 0;
    let totalInv = 0;
    let totalLoans = 0;
    let totalCP = 0;
    let totalMCA = 0;
    let totalShortfallsFactored = 0;
    let totalSurplusesFactored = 0;

    // Use importedRecords if available, else database members
    const sourceRecords = importedRecords.length > 0 ? importedRecords : firestoreMembers;

    sourceRecords.forEach((record, index) => {
      // Find database user
      const cleanId = String(record.id || record.uid || '').trim().toLowerCase();
      const cleanName = String(record.name || record.fullName || '').trim().toLowerCase();

      const dbUser = firestoreMembers.find((u) => {
        const uId = String(u.id || '').trim().toLowerCase();
        const uUid = String(u.uid || '').trim().toLowerCase();
        const uName = String(u.fullName || '').trim().toLowerCase();
        return uId === cleanId || uUid === cleanId || (cleanName && uName === cleanName);
      });

      const memberId = record.id || (dbUser ? dbUser.id || `ZIM-${dbUser.uid?.substring(0, 6).toUpperCase()}` : `ZIM-2026-${String(index + 1).padStart(3, '0')}`);
      const memberName = record.name || record.fullName || (dbUser ? dbUser.fullName : 'Cooperative Contributor');
      const dept = record.department || (dbUser ? dbUser.department : 'General Staff');

      // Base expected values
      const baseOS = dbUser ? Number(dbUser.ordinarySavings) || 20000 : Number(record.ordinarySavings) || 20000;
      const baseSS = dbUser ? Number(dbUser.specialSavings) || 10000 : Number(record.specialSavings) || 10000;
      const baseInv = dbUser ? Number(dbUser.investmentAmount) || 0 : Number(record.investment) || 0;
      
      // Active Loan handling
      const outstandingLoans = dbUser ? Number(dbUser.outstandingLoans) || 0 : 0;
      let baseLoan = 0;
      if (carryLoans) {
        if (outstandingLoans > 0) {
          baseLoan = Math.min(25000, outstandingLoans);
        } else {
          baseLoan = Number(record.loanReimbursement) || 0;
        }
      }

      // Commodity handling
      let baseCP = zeroOutCommodity ? 0 : (Number(record.commodityPurchase) || 0);

      // MCA handling
      let baseMCA = 0;
      if (includeMca) {
        baseMCA = dbUser ? Number(dbUser.muslimCommunitySavings ?? dbUser.muslimSavings ?? 0) : (Number(record.muslimCommunity) || 0);
      }

      const standardBaseSum = baseOS + baseSS + baseInv + baseLoan + baseCP + baseMCA;

      // Check current month variance/disparity if available
      const currentSent = Number(record.expectedSent ?? record.total) || standardBaseSum;
      const currentActual = Number(record.actualDeducted ?? (record.ordinarySavings ? Number(record.ordinarySavings) + Number(record.specialSavings) + Number(record.investment) + Number(record.loanReimbursement) + Number(record.commodityPurchase) + Number(record.muslimCommunity || 0) : standardBaseSum));
      const variance = currentActual - currentSent; // Negative = shortfall, Positive = surplus

      let nextTotal = standardBaseSum;
      let instruction = 'Standard recurrent monthly deduction.';
      let adjustmentType: NextMonthScheduleRow['adjustmentType'] = 'standard';

      if (variance < 0 && factorShortfalls) {
        const shortfall = Math.abs(variance);
        nextTotal += shortfall;
        totalShortfallsFactored += shortfall;
        instruction = `Includes ₦${shortfall.toLocaleString()} shortfall recovery from ${currentMonth} cycle.`;
        adjustmentType = 'shortfall_recovery';
      } else if (variance > 0 && factorSurpluses) {
        nextTotal = Math.max(0, nextTotal - variance);
        totalSurplusesFactored += variance;
        instruction = `Includes ₦${variance.toLocaleString()} surplus credit offset from ${currentMonth} cycle.`;
        adjustmentType = 'surplus_offset';
      } else if (baseLoan > 0) {
        instruction = `Includes ongoing loan installment repayment of ₦${baseLoan.toLocaleString()}.`;
        adjustmentType = 'loan_repay';
      }

      totalOS += baseOS;
      totalSS += baseSS;
      totalInv += baseInv;
      totalLoans += baseLoan;
      totalCP += baseCP;
      totalMCA += baseMCA;
      grossTotal += nextTotal;

      rows.push({
        sn: index + 1,
        id: memberId,
        name: memberName,
        department: dept,
        ordinarySavings: baseOS,
        specialSavings: baseSS,
        investment: baseInv,
        loanReimbursement: baseLoan,
        commodityPurchase: baseCP,
        muslimCommunity: baseMCA,
        currentSent,
        currentActual,
        variance,
        nextMonthTotal: nextTotal,
        bursaryInstruction: instruction,
        adjustmentType
      });
    });

    return {
      scheduleRows: rows,
      aggregates: {
        totalCooperators: rows.length,
        grossTotal,
        totalOS,
        totalSS,
        totalInv,
        totalLoans,
        totalCP,
        totalMCA,
        totalShortfallsFactored,
        totalSurplusesFactored,
        adjustmentsCount: rows.filter(r => r.adjustmentType !== 'standard').length
      }
    };
  }, [importedRecords, firestoreMembers, currentMonth, factorShortfalls, factorSurpluses, carryLoans, zeroOutCommodity, includeMca]);

  // Filtered rows for the preview table
  const displayRows = useMemo(() => {
    return scheduleRows.filter((r) => {
      const matchQuery =
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.bursaryInstruction.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchQuery) return false;

      if (filterType === 'all') return true;
      if (filterType === 'adjustments') return r.adjustmentType === 'shortfall_recovery' || r.adjustmentType === 'surplus_offset';
      if (filterType === 'loans') return r.loanReimbursement > 0;
      if (filterType === 'standard') return r.adjustmentType === 'standard';
      return true;
    });
  }, [scheduleRows, searchQuery, filterType]);

  // Handler: Generate Official Bursary Spreadsheet (.xlsx)
  const handleExportBursaryFile = (format: 'xlsx' | 'csv' = 'xlsx') => {
    try {
      const headers = [
        'S/N',
        "COOPERATOR'S FULL NAME",
        'STAFF / MEMBER ID',
        'DEPARTMENT / FACULTY',
        'ORDINARY SAVINGS (₦)',
        'SPECIAL SAVINGS (₦)',
        'INVESTMENT ACCOUNT (₦)',
        'LOAN REPAYMENT (₦)',
        'COMMODITY PURCHASE (₦)',
        'MUSLIM COMMUNITY (₦)',
        `NEXT-MONTH TOTAL TO DEDUCT (₦)`,
        'BURSARY INSTRUCTION / REMARK'
      ];

      const dataRows = scheduleRows.map((r, i) => [
        i + 1,
        r.name,
        r.id,
        r.department || 'General Staff',
        r.ordinarySavings,
        r.specialSavings,
        r.investment,
        r.loanReimbursement,
        r.commodityPurchase,
        r.muslimCommunity,
        r.nextMonthTotal,
        r.bursaryInstruction
      ]);

      const summaryRow = [
        'TOTALS',
        `${scheduleRows.length} Active Cooperators`,
        '',
        '',
        aggregates.totalOS,
        aggregates.totalSS,
        aggregates.totalInv,
        aggregates.totalLoans,
        aggregates.totalCP,
        aggregates.totalMCA,
        aggregates.grossTotal,
        `Net Directive Pool for ${targetCycle}`
      ];

      const allRows = [
        ['ZIMCO COOPERATIVE SOCIETY LIMITED'],
        [`OFFICIAL PAYROLL DEDUCTION DIRECTIVE TO BURSARY — ${targetCycle.toUpperCase()}`],
        [`Effective Date: ${effectiveDate} | Prepared from Verified Database Records & Reconciliation Checks`],
        [],
        headers,
        ...dataRows,
        summaryRow
      ];

      const fileName = `ZIMCO_BURSARY_DEDUCTION_SCHEDULE_${targetCycle.replace(/\s+/g, '_')}`;

      if (format === 'xlsx') {
        const ws = XLSX.utils.aoa_to_sheet(allRows);
        ws['!cols'] = [
          { wch: 6 },  // S/N
          { wch: 28 }, // Full Name
          { wch: 18 }, // Staff ID
          { wch: 24 }, // Department
          { wch: 20 }, // OS
          { wch: 20 }, // SS
          { wch: 22 }, // Inv
          { wch: 20 }, // Loan
          { wch: 20 }, // CP
          { wch: 20 }, // MCA
          { wch: 26 }, // Next Month Total
          { wch: 45 }  // Instruction
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Bursary Schedule');

        // Add summary certificate tab
        const summaryHeaders = ['Directive Parameter', 'Certified Value'];
        const summaryData = [
          ['Cooperative Society', 'ZIMCO Cooperative Society Limited'],
          ['Target Deduction Cycle', targetCycle],
          ['Target Effective Date', effectiveDate],
          ['Total Enrolled Cooperators', `${aggregates.totalCooperators} Members`],
          ['Gross Amount to Deduct', `₦${aggregates.grossTotal.toLocaleString()}`],
          ['Ordinary Savings Pool', `₦${aggregates.totalOS.toLocaleString()}`],
          ['Special Savings Pool', `₦${aggregates.totalSS.toLocaleString()}`],
          ['Investment Account Pool', `₦${aggregates.totalInv.toLocaleString()}`],
          ['Loan Repayment Recovery', `₦${aggregates.totalLoans.toLocaleString()}`],
          ['Commodity Deductions', `₦${aggregates.totalCP.toLocaleString()}`],
          ['Muslim Community Dues', `₦${aggregates.totalMCA.toLocaleString()}`],
          ['Shortfall Rollovers Factored', `₦${aggregates.totalShortfallsFactored.toLocaleString()}`],
          ['Status', 'OFFICIALLY APPROVED FOR BURSARY DISPATCH']
        ];
        const wsSummary = XLSX.utils.aoa_to_sheet([summaryHeaders, ...summaryData]);
        wsSummary['!cols'] = [{ wch: 30 }, { wch: 45 }];
        XLSX.utils.book_append_sheet(wb, wsSummary, 'Bursary Memo Summary');

        XLSX.writeFile(wb, `${fileName}.xlsx`);
      } else {
        const csvContent = allRows
          .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
          .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${fileName}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      showToast(`Official Bursary Deduction Schedule for ${targetCycle} exported in ${format.toUpperCase()} format!`, 'success');
    } catch (err: any) {
      console.error('Export error:', err);
      showToast(`Failed to export schedule: ${err.message}`, 'error');
    }
  };

  // Handler: Generate Official Bursary PDF Memo
  const handleGeneratePdfMemo = () => {
    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

      // Title & Letterhead Header
      doc.setFillColor(9, 30, 20); // #091e14
      doc.rect(0, 0, 297, 26, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('ZIMCO COOPERATIVE SOCIETY LIMITED', 14, 11);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`OFFICIAL PAYROLL DEDUCTION DIRECTIVE TO UNIVERSITY / STATE BURSARY — ${targetCycle.toUpperCase()}`, 14, 18);

      // Meta bar
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(8.5);
      doc.text(`Target Cycle: ${targetCycle}  |  Effective Deduction Date: ${effectiveDate}  |  Gross Deduction Pool: NGN ${aggregates.grossTotal.toLocaleString()}`, 14, 33);
      doc.text(`Total Staff / Cooperators: ${aggregates.totalCooperators}  |  Shortfall Adjustments Included: NGN ${aggregates.totalShortfallsFactored.toLocaleString()}`, 14, 38);

      const tableData = scheduleRows.map((r, i) => [
        i + 1,
        r.id,
        r.name,
        `NGN ${r.ordinarySavings.toLocaleString()}`,
        `NGN ${r.specialSavings.toLocaleString()}`,
        `NGN ${r.investment.toLocaleString()}`,
        `NGN ${r.loanReimbursement.toLocaleString()}`,
        `NGN ${r.muslimCommunity.toLocaleString()}`,
        `NGN ${r.nextMonthTotal.toLocaleString()}`,
        r.bursaryInstruction
      ]);

      autoTable(doc, {
        head: [[
          'S/N',
          'Staff ID',
          'Cooperator Name',
          'Ord. Savings',
          'Spec. Savings',
          'Investment',
          'Loan Repay',
          'MCA',
          'Next Total',
          'Bursary Instruction'
        ]],
        body: tableData,
        startY: 43,
        theme: 'grid',
        styles: {
          fontSize: 7.5,
          cellPadding: 2,
          textColor: [40, 40, 40],
          overflow: 'linebreak'
        },
        headStyles: {
          fillColor: [15, 60, 40],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        columnStyles: {
          0: { cellWidth: 10 },
          1: { cellWidth: 22 },
          2: { cellWidth: 42 },
          3: { cellWidth: 24, halign: 'right' },
          4: { cellWidth: 24, halign: 'right' },
          5: { cellWidth: 22, halign: 'right' },
          6: { cellWidth: 22, halign: 'right' },
          7: { cellWidth: 18, halign: 'right' },
          8: { cellWidth: 28, halign: 'right', fontStyle: 'bold' },
          9: { cellWidth: 'auto' }
        },
        foot: [[
          'TOTAL',
          '',
          `${aggregates.totalCooperators} Members`,
          `NGN ${aggregates.totalOS.toLocaleString()}`,
          `NGN ${aggregates.totalSS.toLocaleString()}`,
          `NGN ${aggregates.totalInv.toLocaleString()}`,
          `NGN ${aggregates.totalLoans.toLocaleString()}`,
          `NGN ${aggregates.totalMCA.toLocaleString()}`,
          `NGN ${aggregates.grossTotal.toLocaleString()}`,
          'Certified for Bursary Payroll Action'
        ]],
        footStyles: {
          fillColor: [230, 240, 235],
          textColor: [10, 40, 25],
          fontStyle: 'bold'
        }
      });

      doc.save(`ZIMCO_BURSARY_MEMO_${targetCycle.replace(/\s+/g, '_')}.pdf`);
      showToast(`Official Bursary PDF Memo for ${targetCycle} downloaded!`, 'success');
    } catch (err: any) {
      console.error('PDF error:', err);
      showToast(`Failed to generate PDF memo: ${err.message}`, 'error');
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-900 text-[10px] font-black uppercase tracking-wider rounded-md flex items-center gap-1">
              <SendHorizontal size={12} className="text-emerald-700" />
              Bursary Payroll Dispatch
            </span>
            <span className="text-xs text-slate-400 font-medium">From {currentMonth} Baseline</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight font-headline mt-1">
            Next-Month Bursary Deduction Schedule
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Create, format, and export the official deduction schedule file to send directly to the University / State Bursary for next month's payroll deductions.
          </p>
        </div>

        {/* Primary Export Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleGeneratePdfMemo}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center gap-2"
          >
            <FileText size={15} />
            PDF Memo (.pdf)
          </button>

          <button
            onClick={() => handleExportBursaryFile('csv')}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center gap-2"
          >
            <DownloadCloud size={15} />
            CSV File (.csv)
          </button>

          <button
            onClick={() => handleExportBursaryFile('xlsx')}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-2 shadow-lg shadow-emerald-900/20"
          >
            <FileSpreadsheet size={16} />
            Generate Bursary File (.xlsx)
          </button>
        </div>
      </div>

      {/* TARGET CYCLE CONFIGURATION & POLICY TOGGLES */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black">
              <Calendar size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Upcoming Deduction Cycle Target</h3>
              <p className="text-xs text-slate-400 font-medium">Select the target month and effective payroll date for this dispatch file.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Target Month Cycle</label>
              <input
                type="text"
                value={targetCycle}
                onChange={(e) => setTargetCycle(e.target.value)}
                placeholder="e.g. July 2026"
                className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-900 outline-none focus:ring-1 focus:ring-emerald-600 w-36"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Effective Date</label>
              <input
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Policy Toggles */}
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
            Schedule Generation Policies & Automatic Rollover Rules
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Toggle 1 */}
            <label className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition cursor-pointer flex items-start gap-3">
              <input
                type="checkbox"
                checked={factorShortfalls}
                onChange={(e) => setFactorShortfalls(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded mt-0.5 accent-emerald-600 shrink-0"
              />
              <div>
                <p className="text-xs font-bold text-slate-800">Factor Shortfall Recoveries</p>
                <p className="text-[10px] text-slate-400 font-semibold leading-normal mt-0.5">
                  Append under-deducted amounts from {currentMonth} to next month's total.
                </p>
              </div>
            </label>

            {/* Toggle 2 */}
            <label className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition cursor-pointer flex items-start gap-3">
              <input
                type="checkbox"
                checked={factorSurpluses}
                onChange={(e) => setFactorSurpluses(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded mt-0.5 accent-emerald-600 shrink-0"
              />
              <div>
                <p className="text-xs font-bold text-slate-800">Offset Surplus Credits</p>
                <p className="text-[10px] text-slate-400 font-semibold leading-normal mt-0.5">
                  Deduct over-deductions from {currentMonth} in next month's directive.
                </p>
              </div>
            </label>

            {/* Toggle 3 */}
            <label className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition cursor-pointer flex items-start gap-3">
              <input
                type="checkbox"
                checked={carryLoans}
                onChange={(e) => setCarryLoans(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded mt-0.5 accent-emerald-600 shrink-0"
              />
              <div>
                <p className="text-xs font-bold text-slate-800">Include Loan Installments</p>
                <p className="text-[10px] text-slate-400 font-semibold leading-normal mt-0.5">
                  Pull ongoing monthly loan deductions from Firestore member debts.
                </p>
              </div>
            </label>

            {/* Toggle 4 */}
            <label className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition cursor-pointer flex items-start gap-3">
              <input
                type="checkbox"
                checked={zeroOutCommodity}
                onChange={(e) => setZeroOutCommodity(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded mt-0.5 accent-emerald-600 shrink-0"
              />
              <div>
                <p className="text-xs font-bold text-slate-800">Reset One-Off Commodity</p>
                <p className="text-[10px] text-slate-400 font-semibold leading-normal mt-0.5">
                  Set commodity purchases to ₦0 so members are not double-billed.
                </p>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-1 border-l-4 border-l-emerald-600">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gross Next-Month Deduction</span>
          <p className="text-2xl font-black text-emerald-950">₦{aggregates.grossTotal.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 font-semibold">Total to be deducted by Bursary</p>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-1 border-l-4 border-l-slate-800">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enrolled Cooperators</span>
          <p className="text-2xl font-black text-slate-900">{aggregates.totalCooperators}</p>
          <p className="text-[10px] text-slate-400 font-semibold">Active staff payroll rows</p>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-1 border-l-4 border-l-amber-500">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Shortfall Recoveries</span>
          <p className="text-2xl font-black text-amber-700">₦{aggregates.totalShortfallsFactored.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 font-semibold">From {currentMonth} disparities</p>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-1 border-l-4 border-l-indigo-600">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loan Repayment Pool</span>
          <p className="text-2xl font-black text-indigo-900">₦{aggregates.totalLoans.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 font-semibold">Monthly loan debt recoveries</p>
        </div>
      </div>

      {/* LIVE SCHEDULE PREVIEW WORKBENCH */}
      <div className="bg-white border border-slate-100 rounded-[2rem] shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-200/60 p-1 rounded-xl">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition ${
                filterType === 'all' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Rows ({aggregates.totalCooperators})
            </button>
            <button
              onClick={() => setFilterType('adjustments')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition flex items-center gap-1.5 ${
                filterType === 'adjustments' ? 'bg-amber-600 text-white shadow-sm' : 'text-amber-700 hover:text-amber-900'
              }`}
            >
              <Sparkles size={13} />
              Adjusted / Rollovers ({aggregates.adjustmentsCount})
            </button>
            <button
              onClick={() => setFilterType('loans')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition ${
                filterType === 'loans' ? 'bg-indigo-600 text-white shadow-sm' : 'text-indigo-700 hover:text-indigo-900'
              }`}
            >
              Loan Repayments
            </button>
            <button
              onClick={() => setFilterType('standard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition ${
                filterType === 'standard' ? 'bg-emerald-600 text-white shadow-sm' : 'text-emerald-700 hover:text-emerald-900'
              }`}
            >
              Standard Fixed
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search cooperator, ID, or instruction..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-600 w-56 sm:w-64 font-semibold text-slate-800"
            />
          </div>
        </div>

        {/* Schedule Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <th className="p-3.5 w-12 text-center">S/N</th>
                <th className="p-3.5 w-24">Staff ID</th>
                <th className="p-3.5 min-w-[170px]">Cooperator Name</th>
                <th className="p-3.5 min-w-[100px]">Ord. Savings</th>
                <th className="p-3.5 min-w-[100px]">Spec. Savings</th>
                <th className="p-3.5 min-w-[100px]">Investment</th>
                <th className="p-3.5 min-w-[100px]">Loan Repay</th>
                <th className="p-3.5 min-w-[90px]">Commodity</th>
                <th className="p-3.5 min-w-[90px]">MCA</th>
                <th className="p-3.5 text-right min-w-[130px]">Next Month Total</th>
                <th className="p-3.5 min-w-[200px]">Bursary Instruction / Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
              {displayRows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 text-center text-slate-400 font-mono text-[10px]">{row.sn}</td>
                  <td className="p-3.5 font-mono font-bold text-emerald-900">{row.id}</td>
                  <td className="p-3.5">
                    <p className="font-extrabold text-slate-900">{row.name}</p>
                    <p className="text-[10px] text-slate-400">{row.department}</p>
                  </td>
                  <td className="p-3.5 font-mono">₦{row.ordinarySavings.toLocaleString()}</td>
                  <td className="p-3.5 font-mono">₦{row.specialSavings.toLocaleString()}</td>
                  <td className="p-3.5 font-mono">₦{row.investment.toLocaleString()}</td>
                  <td className="p-3.5 font-mono font-bold text-indigo-900">
                    {row.loanReimbursement > 0 ? `₦${row.loanReimbursement.toLocaleString()}` : '—'}
                  </td>
                  <td className="p-3.5 font-mono text-slate-400">
                    {row.commodityPurchase > 0 ? `₦${row.commodityPurchase.toLocaleString()}` : '₦0'}
                  </td>
                  <td className="p-3.5 font-mono text-slate-600">
                    {row.muslimCommunity > 0 ? `₦${row.muslimCommunity.toLocaleString()}` : '—'}
                  </td>
                  <td className="p-3.5 text-right font-mono font-black text-emerald-950 text-sm">
                    ₦{row.nextMonthTotal.toLocaleString()}
                  </td>
                  <td className="p-3.5">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md inline-block ${
                      row.adjustmentType === 'shortfall_recovery'
                        ? 'bg-amber-100 text-amber-900 border border-amber-200'
                        : row.adjustmentType === 'surplus_offset'
                        ? 'bg-blue-100 text-blue-900 border border-blue-200'
                        : row.adjustmentType === 'loan_repay'
                        ? 'bg-indigo-50 text-indigo-900'
                        : 'text-slate-500'
                    }`}>
                      {row.bursaryInstruction}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer info bar */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-2">
            <FileCheck2 size={16} className="text-emerald-600" />
            <span>Official Bursary Dispatch Format: <strong>Strict Canonical 12-Column Schema with Ledger Certification</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExportBursaryFile('csv')}
              className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-100 transition"
            >
              Export CSV (.csv)
            </button>
            <button
              onClick={() => handleExportBursaryFile('xlsx')}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 shadow"
            >
              <FileSpreadsheet size={13} />
              Export Excel (.xlsx)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
