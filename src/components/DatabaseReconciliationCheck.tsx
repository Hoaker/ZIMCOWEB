import React, { useState, useMemo } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Search, 
  DownloadCloud, 
  FileSpreadsheet, 
  RefreshCcw, 
  ShieldAlert, 
  Database, 
  ArrowRight, 
  Check, 
  X, 
  Edit3, 
  Trash2, 
  UserX, 
  Scale, 
  SlidersHorizontal,
  Sparkles,
  AlertOctagon,
  FileCheck2,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';

export interface DatabaseReconciliationItem {
  id: string;
  name: string;
  isRegisteredInDb: boolean;
  dbUser?: any;
  
  // Uploaded amounts from spreadsheet
  uploadedOS: number;
  uploadedSS: number;
  uploadedInv: number;
  uploadedLoan: number;
  uploadedCP: number;
  uploadedMCA: number;
  uploadedTotal: number;

  // Expected amounts according to Firestore Database
  expectedOS: number;
  expectedSS: number;
  expectedInv: number;
  expectedLoan: number;
  expectedCP: number;
  expectedMCA: number;
  expectedTotal: number;

  // Variances (Uploaded - Expected)
  varianceOS: number;
  varianceSS: number;
  varianceInv: number;
  varianceLoan: number;
  varianceCP: number;
  varianceMCA: number;
  varianceTotal: number;

  // Status and details
  status: 'matched' | 'variance' | 'critical_error';
  discrepancyList: Array<{
    field: string;
    label: string;
    message: string;
    severity: 'critical' | 'warning' | 'info';
    uploadedVal: number;
    expectedVal: number;
    diff: number;
  }>;
}

export interface OmittedDbMemberItem {
  id: string;
  name: string;
  email?: string;
  ordinarySavings: number;
  specialSavings: number;
  investmentAmount: number;
  outstandingLoans: number;
  expectedLoanRepay: number;
  commoditySavings: number;
  muslimSavings: number;
  expectedTotal: number;
}

interface DatabaseReconciliationCheckProps {
  importedRecords: any[];
  firestoreMembers: any[];
  ceilings: { ordinarySavingsCeiling: number; specialSavingsCeiling: number };
  activeMonth: string;
  onUpdateRecord: (id: string, updatedFields: Record<string, any>) => void;
  onAlignAllWithDatabase: (alignedRecords: any[]) => void;
  onAddOmittedMemberToSheet?: (member: OmittedDbMemberItem) => void;
  showToast: (message: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

export default function DatabaseReconciliationCheck({
  importedRecords,
  firestoreMembers,
  ceilings,
  activeMonth,
  onUpdateRecord,
  onAlignAllWithDatabase,
  onAddOmittedMemberToSheet,
  showToast
}: DatabaseReconciliationCheckProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'critical' | 'variance' | 'matched' | 'omitted'>('all');
  const [selectedRecordForEdit, setSelectedRecordForEdit] = useState<DatabaseReconciliationItem | null>(null);
  const [isReconExpanded, setIsReconExpanded] = useState(false);
  const [isReconciling, setIsReconciling] = useState(false);

  // 1. Process and Compare Uploaded Rows against Database Records
  const { reconciliationRecords, omittedMembers, stats } = useMemo(() => {
    const list: DatabaseReconciliationItem[] = [];
    let criticalCount = 0;
    let varianceCount = 0;
    let matchedCount = 0;
    let totalUploadedSum = 0;
    let totalExpectedSum = 0;

    // Map each uploaded row
    importedRecords.forEach((record) => {
      // Find matching user in database (match by staff ID, UID, or case-insensitive full name)
      const cleanId = String(record.id || '').trim().toLowerCase();
      const cleanName = String(record.name || '').trim().toLowerCase();

      const dbUser = firestoreMembers.find((u) => {
        const uId = String(u.id || '').trim().toLowerCase();
        const uUid = String(u.uid || '').trim().toLowerCase();
        const uName = String(u.fullName || '').trim().toLowerCase();
        return uId === cleanId || uUid === cleanId || (cleanName && uName === cleanName);
      });

      const uploadedOS = Number(record.ordinarySavings) || 0;
      const uploadedSS = Number(record.specialSavings) || 0;
      const uploadedInv = Number(record.investment) || 0;
      const uploadedLoan = Number(record.loanReimbursement) || 0;
      const uploadedCP = Number(record.commodityPurchase) || 0;
      const uploadedMCA = Number(record.muslimCommunity) || 0;
      const uploadedSum = uploadedOS + uploadedSS + uploadedInv + uploadedLoan + uploadedCP + uploadedMCA;
      const uploadedTotal = Number(record.total) || uploadedSum;

      totalUploadedSum += uploadedTotal;

      const discrepancyList: DatabaseReconciliationItem['discrepancyList'] = [];
      let isCritical = false;

      // Check 1: Member Registration in Database
      if (!dbUser) {
        isCritical = true;
        discrepancyList.push({
          field: 'member',
          label: 'Unregistered Cooperator',
          message: 'CRITICAL: Member ID / Name not found in cooperative Firestore database.',
          severity: 'critical',
          uploadedVal: 0,
          expectedVal: 0,
          diff: 0
        });
      }

      // Expected Database Values
      const expectedOS = dbUser ? Number(dbUser.ordinarySavings) || 20000 : 0;
      const expectedSS = dbUser ? Number(dbUser.specialSavings) || 10000 : 0;
      const expectedInv = dbUser ? Number(dbUser.investmentAmount) || 0 : 0;
      const outstandingLoans = dbUser ? Number(dbUser.outstandingLoans) || 0 : 0;
      // If member has active outstanding loan, expected minimum repayment is ₦25,000 or full balance if less
      const expectedLoan = outstandingLoans > 0 ? Math.min(25000, outstandingLoans) : 0;
      const expectedCP = dbUser ? Number(dbUser.commoditySavings) || 0 : 0;
      const expectedMCA = dbUser ? Number(dbUser.muslimCommunitySavings ?? dbUser.muslimSavings ?? 0) : 0;
      const expectedTotal = expectedOS + expectedSS + expectedInv + expectedLoan + expectedCP + expectedMCA;

      totalExpectedSum += expectedTotal;

      // Check 2: Mathematical check on uploaded row
      if (uploadedSum !== uploadedTotal) {
        isCritical = true;
        discrepancyList.push({
          field: 'math',
          label: 'Spreadsheet Math Mismatch',
          message: `Uploaded itemized sum (₦${uploadedSum.toLocaleString()}) does not match declared total (₦${uploadedTotal.toLocaleString()}).`,
          severity: 'critical',
          uploadedVal: uploadedTotal,
          expectedVal: uploadedSum,
          diff: uploadedTotal - uploadedSum
        });
      }

      // Check 3: Ordinary Savings Ceiling
      if (uploadedOS > ceilings.ordinarySavingsCeiling) {
        isCritical = true;
        discrepancyList.push({
          field: 'ordinarySavings',
          label: 'OS Ceiling Limit Exceeded',
          message: `Uploaded Ordinary Savings (₦${uploadedOS.toLocaleString()}) exceeds maximum allowed ceiling (₦${ceilings.ordinarySavingsCeiling.toLocaleString()}).`,
          severity: 'critical',
          uploadedVal: uploadedOS,
          expectedVal: ceilings.ordinarySavingsCeiling,
          diff: uploadedOS - ceilings.ordinarySavingsCeiling
        });
      } else if (dbUser && uploadedOS !== expectedOS) {
        discrepancyList.push({
          field: 'ordinarySavings',
          label: 'Ordinary Savings Variance',
          message: `Uploaded OS (₦${uploadedOS.toLocaleString()}) differs from DB profile commitment (₦${expectedOS.toLocaleString()}).`,
          severity: 'warning',
          uploadedVal: uploadedOS,
          expectedVal: expectedOS,
          diff: uploadedOS - expectedOS
        });
      }

      // Check 4: Special Savings Ceiling & DB Target
      if (uploadedSS > ceilings.specialSavingsCeiling) {
        isCritical = true;
        discrepancyList.push({
          field: 'specialSavings',
          label: 'SS Ceiling Limit Exceeded',
          message: `Uploaded Special Savings (₦${uploadedSS.toLocaleString()}) exceeds maximum allowed ceiling (₦${ceilings.specialSavingsCeiling.toLocaleString()}).`,
          severity: 'critical',
          uploadedVal: uploadedSS,
          expectedVal: ceilings.specialSavingsCeiling,
          diff: uploadedSS - ceilings.specialSavingsCeiling
        });
      } else if (dbUser && uploadedSS !== expectedSS) {
        discrepancyList.push({
          field: 'specialSavings',
          label: 'Special Savings Variance',
          message: `Uploaded SS (₦${uploadedSS.toLocaleString()}) differs from DB profile commitment (₦${expectedSS.toLocaleString()}).`,
          severity: 'warning',
          uploadedVal: uploadedSS,
          expectedVal: expectedSS,
          diff: uploadedSS - expectedSS
        });
      }

      // Check 5: Loan Repayment Discrepancies
      if (dbUser) {
        if (outstandingLoans > 0 && uploadedLoan === 0) {
          isCritical = true;
          discrepancyList.push({
            field: 'loanReimbursement',
            label: 'Omitted Loan Repayment',
            message: `CRITICAL: Member has active loan balance of ₦${outstandingLoans.toLocaleString()}, but uploaded deduction is ₦0 (Expected repayment: ₦${expectedLoan.toLocaleString()}).`,
            severity: 'critical',
            uploadedVal: 0,
            expectedVal: expectedLoan,
            diff: -expectedLoan
          });
        } else if (outstandingLoans === 0 && uploadedLoan > 0) {
          discrepancyList.push({
            field: 'loanReimbursement',
            label: 'No Active Loan in DB',
            message: `Uploaded loan deduction of ₦${uploadedLoan.toLocaleString()}, but member has ₦0 outstanding loan in database.`,
            severity: 'warning',
            uploadedVal: uploadedLoan,
            expectedVal: 0,
            diff: uploadedLoan
          });
        } else if (uploadedLoan !== expectedLoan) {
          discrepancyList.push({
            field: 'loanReimbursement',
            label: 'Loan Installment Variance',
            message: `Uploaded loan installment (₦${uploadedLoan.toLocaleString()}) differs from expected monthly repayment (₦${expectedLoan.toLocaleString()}).`,
            severity: 'warning',
            uploadedVal: uploadedLoan,
            expectedVal: expectedLoan,
            diff: uploadedLoan - expectedLoan
          });
        }
      }

      // Check 6: Investment variance
      if (dbUser && uploadedInv !== expectedInv) {
        discrepancyList.push({
          field: 'investment',
          label: 'Investment Contribution Variance',
          message: `Uploaded Investment (₦${uploadedInv.toLocaleString()}) differs from DB recurring plan (₦${expectedInv.toLocaleString()}).`,
          severity: 'info',
          uploadedVal: uploadedInv,
          expectedVal: expectedInv,
          diff: uploadedInv - expectedInv
        });
      }

      // Check 7: Muslim Community Account variance
      if (dbUser && uploadedMCA !== expectedMCA) {
        discrepancyList.push({
          field: 'muslimCommunity',
          label: 'MCA Contribution Variance',
          message: `Uploaded Muslim Community contribution (₦${uploadedMCA.toLocaleString()}) differs from DB dues (₦${expectedMCA.toLocaleString()}).`,
          severity: 'info',
          uploadedVal: uploadedMCA,
          expectedVal: expectedMCA,
          diff: uploadedMCA - expectedMCA
        });
      }

      // Check 8: Overall Total Disparity
      if (dbUser && uploadedTotal !== expectedTotal && !discrepancyList.some(d => d.field === 'math')) {
        const diffTotal = uploadedTotal - expectedTotal;
        if (Math.abs(diffTotal) > 0) {
          discrepancyList.push({
            field: 'total',
            label: diffTotal < 0 ? 'Under-deducted Disparity' : 'Surplus Deduction Disparity',
            message: diffTotal < 0 
              ? `Overall under-deducted by ₦${Math.abs(diffTotal).toLocaleString()} against expected DB baseline.`
              : `Overall surplus deduction of ₦${diffTotal.toLocaleString()} against expected DB baseline.`,
            severity: 'warning',
            uploadedVal: uploadedTotal,
            expectedVal: expectedTotal,
            diff: diffTotal
          });
        }
      }

      // Assign Status
      let itemStatus: DatabaseReconciliationItem['status'] = 'matched';
      if (isCritical || discrepancyList.some(d => d.severity === 'critical')) {
        itemStatus = 'critical_error';
        criticalCount++;
      } else if (discrepancyList.length > 0) {
        itemStatus = 'variance';
        varianceCount++;
      } else {
        matchedCount++;
      }

      list.push({
        id: record.id,
        name: record.name,
        isRegisteredInDb: !!dbUser,
        dbUser,
        uploadedOS,
        uploadedSS,
        uploadedInv,
        uploadedLoan,
        uploadedCP,
        uploadedMCA,
        uploadedTotal,
        expectedOS,
        expectedSS,
        expectedInv,
        expectedLoan,
        expectedCP,
        expectedMCA,
        expectedTotal,
        varianceOS: uploadedOS - expectedOS,
        varianceSS: uploadedSS - expectedSS,
        varianceInv: uploadedInv - expectedInv,
        varianceLoan: uploadedLoan - expectedLoan,
        varianceCP: uploadedCP - expectedCP,
        varianceMCA: uploadedMCA - expectedMCA,
        varianceTotal: uploadedTotal - expectedTotal,
        status: itemStatus,
        discrepancyList
      });
    });

    // Find Omitted Members in Database who are missing from the uploaded file
    const omitted: OmittedDbMemberItem[] = [];
    firestoreMembers.forEach((u) => {
      if (u.role === 'member') {
        const uId = String(u.id || '').trim().toLowerCase();
        const uUid = String(u.uid || '').trim().toLowerCase();
        const uName = String(u.fullName || '').trim().toLowerCase();

        const isInUploaded = importedRecords.some((r) => {
          const rId = String(r.id || '').trim().toLowerCase();
          const rName = String(r.name || '').trim().toLowerCase();
          return rId === uId || rId === uUid || (rName && rName === uName);
        });

        if (!isInUploaded) {
          const os = Number(u.ordinarySavings) || 20000;
          const ss = Number(u.specialSavings) || 10000;
          const inv = Number(u.investmentAmount) || 0;
          const outstandingLoans = Number(u.outstandingLoans) || 0;
          const expectedLoan = outstandingLoans > 0 ? Math.min(25000, outstandingLoans) : 0;
          const cp = Number(u.commoditySavings) || 0;
          const mc = Number(u.muslimCommunitySavings ?? u.muslimSavings ?? 0);
          const total = os + ss + inv + expectedLoan + cp + mc;

          omitted.push({
            id: u.id || `ZIM-${u.uid?.substring(0, 6).toUpperCase()}`,
            name: u.fullName || 'Registered Cooperator',
            email: u.email,
            ordinarySavings: os,
            specialSavings: ss,
            investmentAmount: inv,
            outstandingLoans,
            expectedLoanRepay: expectedLoan,
            commoditySavings: cp,
            muslimSavings: mc,
            expectedTotal: total
          });
        }
      }
    });

    return {
      reconciliationRecords: list,
      omittedMembers: omitted,
      stats: {
        totalRows: list.length,
        criticalCount,
        varianceCount,
        matchedCount,
        totalDiscrepancies: criticalCount + varianceCount,
        omittedCount: omitted.length,
        totalUploadedSum,
        totalExpectedSum,
        netDisparity: totalUploadedSum - totalExpectedSum
      }
    };
  }, [importedRecords, firestoreMembers, ceilings]);

  // Filtered rows for the view
  const displayRows = useMemo(() => {
    return reconciliationRecords.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.discrepancyList.some(d => d.label.toLowerCase().includes(searchQuery.toLowerCase()) || d.message.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchSearch) return false;

      if (filterType === 'all') return true;
      if (filterType === 'critical') return item.status === 'critical_error';
      if (filterType === 'variance') return item.status === 'variance';
      if (filterType === 'matched') return item.status === 'matched';
      return true;
    });
  }, [reconciliationRecords, searchQuery, filterType]);

  // Handler: Align all uploaded records with expected database values
  const handleAutoAlignAll = () => {
    setIsReconciling(true);
    showToast('Auto-aligning uploaded deduction records with database profile commitments...', 'info');

    setTimeout(() => {
      const aligned = importedRecords.map((record) => {
        const item = reconciliationRecords.find(r => r.id === record.id);
        if (item && item.isRegisteredInDb) {
          return {
            ...record,
            ordinarySavings: item.expectedOS,
            specialSavings: item.expectedSS,
            investment: item.expectedInv,
            loanReimbursement: item.expectedLoan,
            commodityPurchase: item.expectedCP,
            muslimCommunity: item.expectedMCA,
            total: item.expectedTotal,
            status: 'valid',
            message: 'Aligned with database profile commitments.',
            isModified: true
          };
        }
        return record;
      });

      onAlignAllWithDatabase(aligned);
      setIsReconciling(false);
      showToast('Successfully aligned records with database expected values!', 'success');
    }, 600);
  };

  // Handler: Align a single record with database
  const handleAlignSingleRecord = (item: DatabaseReconciliationItem) => {
    if (!item.isRegisteredInDb) {
      showToast('Cannot auto-align unregistered cooperator. Please register member or update ID.', 'error');
      return;
    }

    onUpdateRecord(item.id, {
      ordinarySavings: item.expectedOS,
      specialSavings: item.expectedSS,
      investment: item.expectedInv,
      loanReimbursement: item.expectedLoan,
      commodityPurchase: item.expectedCP,
      muslimCommunity: item.expectedMCA,
      total: item.expectedTotal,
      status: 'valid',
      message: 'Aligned with database profile values.',
      isModified: true
    });

    showToast(`Aligned ${item.name} (${item.id}) with database expected values!`, 'success');
  };

  // Handler: Export comprehensive reconciliation report
  const handleExportReconciliationReport = (format: 'xlsx' | 'csv' = 'xlsx') => {
    try {
      const headers = [
        'S/N',
        'Staff / Member ID',
        'Cooperator Full Name',
        'DB Registration Status',
        'Uploaded Total (₦)',
        'DB Expected Total (₦)',
        'Net Disparity (₦)',
        'Reconciliation Status',
        'Discrepancy Details & Audit Warnings',
        'Uploaded OS (₦)',
        'DB Expected OS (₦)',
        'Uploaded SS (₦)',
        'DB Expected SS (₦)',
        'Uploaded Loan (₦)',
        'DB Expected Loan (₦)',
        'Active Loan in DB (₦)'
      ];

      const dataRows = reconciliationRecords.map((item, idx) => {
        const discText = item.discrepancyList.map(d => `[${d.label}]: ${d.message}`).join(' | ') || 'All values perfectly matched';
        const activeLoan = item.dbUser ? Number(item.dbUser.outstandingLoans) || 0 : 0;

        return [
          idx + 1,
          item.id,
          item.name,
          item.isRegisteredInDb ? 'REGISTERED' : 'UNREGISTERED_IN_DB',
          item.uploadedTotal,
          item.expectedTotal,
          item.varianceTotal,
          item.status.toUpperCase(),
          discText,
          item.uploadedOS,
          item.expectedOS,
          item.uploadedSS,
          item.expectedSS,
          item.uploadedLoan,
          item.expectedLoan,
          activeLoan
        ];
      });

      const summaryRow = [
        'TOTALS',
        `${reconciliationRecords.length} Cooperators`,
        '',
        `${stats.criticalCount} Critical Errors | ${stats.varianceCount} Variances | ${stats.matchedCount} Matched`,
        stats.totalUploadedSum,
        stats.totalExpectedSum,
        stats.netDisparity,
        stats.criticalCount > 0 ? 'CRITICAL DISCREPANCIES DETECTED' : 'RECONCILIATION AUDIT READY',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        ''
      ];

      const allRows = [
        [`ZIMCO COOPERATIVE - DATABASE DEDUCTION RECONCILIATION AUDIT REPORT (${activeMonth})`],
        [`Generated: ${new Date().toLocaleString()} | Verified by Chief Bursar`],
        [],
        headers,
        ...dataRows,
        summaryRow
      ];

      const fileName = `ZIMCO_RECONCILIATION_CHECK_AUDIT_${activeMonth.replace(/\s+/g, '_')}`;

      if (format === 'xlsx') {
        const ws = XLSX.utils.aoa_to_sheet(allRows);
        ws['!cols'] = [
          { wch: 6 },
          { wch: 16 },
          { wch: 28 },
          { wch: 22 },
          { wch: 18 },
          { wch: 20 },
          { wch: 18 },
          { wch: 22 },
          { wch: 45 },
          { wch: 16 },
          { wch: 18 },
          { wch: 16 },
          { wch: 18 },
          { wch: 18 },
          { wch: 18 },
          { wch: 20 }
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Reconciliation Check');

        // Add second sheet for omitted members if any
        if (omittedMembers.length > 0) {
          const omittedHeaders = [
            'S/N',
            'Staff ID',
            'Full Name',
            'Email Address',
            'Ordinary Savings (₦)',
            'Special Savings (₦)',
            'Investment (₦)',
            'Outstanding Loan (₦)',
            'Expected Loan Repay (₦)',
            'Total Expected Deduction (₦)',
            'Alert Reason'
          ];
          const omittedRows = omittedMembers.map((m, i) => [
            i + 1,
            m.id,
            m.name,
            m.email || '—',
            m.ordinarySavings,
            m.specialSavings,
            m.investmentAmount,
            m.outstandingLoans,
            m.expectedLoanRepay,
            m.expectedTotal,
            'Registered member with active deduction commitments omitted from uploaded file'
          ]);

          const wsOmitted = XLSX.utils.aoa_to_sheet([
            [`OMITTED DATABASE COOPERATORS NOT IN UPLOADED PAYROLL FILE (${activeMonth})`],
            [],
            omittedHeaders,
            ...omittedRows
          ]);
          wsOmitted['!cols'] = [
            { wch: 6 },
            { wch: 16 },
            { wch: 28 },
            { wch: 26 },
            { wch: 20 },
            { wch: 20 },
            { wch: 18 },
            { wch: 22 },
            { wch: 22 },
            { wch: 26 },
            { wch: 45 }
          ];
          XLSX.utils.book_append_sheet(wb, wsOmitted, 'Omitted DB Members');
        }

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

      showToast(`Reconciliation audit report exported in ${format.toUpperCase()} format!`, 'success');
    } catch (err: any) {
      console.error('Export error:', err);
      showToast(`Export failed: ${err.message}`, 'error');
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-900 text-[10px] font-black uppercase tracking-wider rounded-md flex items-center gap-1">
              <Database size={12} className="text-indigo-700" />
              Database Cross-Check Engine
            </span>
            <span className="text-xs text-slate-400 font-medium">Cycle: {activeMonth}</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight font-headline mt-1">
            Database Reconciliation Check
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Automated verification comparing uploaded deduction values against cooperator commitments and active loans in Firestore.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => handleExportReconciliationReport('xlsx')}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 shadow"
            title="Download full cross-examination spreadsheet report"
          >
            <FileSpreadsheet size={15} />
            Export Audit (.xlsx)
          </button>

          <button
            onClick={handleAutoAlignAll}
            disabled={isReconciling || stats.totalDiscrepancies === 0}
            className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-2 shadow-sm ${
              stats.totalDiscrepancies === 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-900/20'
            }`}
            title="Auto-align all uploaded rows with their respective database profile expectations"
          >
            <RefreshCcw size={15} className={isReconciling ? 'animate-spin' : ''} />
            Auto-Align All with DB
          </button>
        </div>
      </div>

      {/* PROMINENT VISUAL ALERT BANNER */}
      {stats.criticalCount > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-gradient-to-r from-rose-50 to-rose-100/60 border-2 border-rose-300 rounded-[2rem] shadow-sm relative overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-900/20">
                <AlertOctagon size={24} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-rose-600 text-white text-[9px] font-black uppercase tracking-wider rounded">
                    Action Required
                  </span>
                  <h3 className="text-base font-black text-rose-950">
                    {stats.criticalCount} Critical Database Discrepanc{stats.criticalCount > 1 ? 'ies' : 'y'} Flagged
                  </h3>
                </div>
                <p className="text-xs text-rose-900/80 leading-relaxed font-medium">
                  The uploaded deduction file contains critical conflicts against Firestore (e.g. unregistered member IDs, ceiling violations, or omitted loan repayments). Review and correct highlighted rows below.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setFilterType('critical')}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition shadow-sm"
              >
                Inspect Critical Rows
              </button>
            </div>
          </div>
        </motion.div>
      ) : stats.varianceCount > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 bg-gradient-to-r from-amber-50 to-amber-100/60 border border-amber-300 rounded-[2rem] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black text-amber-950">
                {stats.varianceCount} Non-Critical Value Variance{stats.varianceCount > 1 ? 's' : ''} Detected
              </h3>
              <p className="text-xs text-amber-900/80 font-medium mt-0.5">
                Certain uploaded deductions deviate from members' recurring target commitments. You can auto-align or accept overrides.
              </p>
            </div>
          </div>

          <button
            onClick={() => setFilterType('variance')}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition shrink-0"
          >
            View Variances
          </button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-[2rem] shadow-sm flex items-center gap-3.5"
        >
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black text-emerald-950">
              100% Database Reconciliation Match
            </h3>
            <p className="text-xs text-emerald-800 font-medium mt-0.5">
              All uploaded spreadsheet records perfectly match registered cooperator accounts, loan repayment schedules, and ceiling thresholds.
            </p>
          </div>
        </motion.div>
      )}

      {/* KPI METRIC CARDS RIBBON */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-1 border-l-4 border-l-slate-800">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Uploaded Deduction</span>
          <p className="text-2xl font-black text-slate-900">₦{stats.totalUploadedSum.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 font-semibold">{stats.totalRows} contributor rows processed</p>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-1 border-l-4 border-l-indigo-600">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expected Database Pool</span>
          <p className="text-2xl font-black text-indigo-900">₦{stats.totalExpectedSum.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 font-semibold">Based on active member profiles</p>
        </div>

        <div className={`bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-1 border-l-4 ${
          stats.netDisparity === 0 ? 'border-l-emerald-600' : stats.netDisparity < 0 ? 'border-l-rose-600' : 'border-l-amber-500'
        }`}>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Net Disparity / Variance</span>
          <p className={`text-2xl font-black ${
            stats.netDisparity === 0 ? 'text-emerald-600' : stats.netDisparity < 0 ? 'text-rose-600' : 'text-amber-600'
          }`}>
            {stats.netDisparity >= 0 ? '+' : ''}₦{stats.netDisparity.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-400 font-semibold">
            {stats.netDisparity === 0 ? 'Exact balance match' : stats.netDisparity < 0 ? 'Net payroll shortfall' : 'Net surplus deduction'}
          </p>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-1 border-l-4 border-l-purple-600">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Discrepancy Breakdown</span>
          <div className="flex items-center gap-2 pt-0.5">
            <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-black rounded-md">
              {stats.criticalCount} Errors
            </span>
            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-black rounded-md">
              {stats.varianceCount} Variances
            </span>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-md">
              {stats.matchedCount} Clean
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-semibold mt-1">
            {stats.omittedCount > 0 ? `${stats.omittedCount} registered members omitted` : 'No database members omitted'}
          </p>
        </div>
      </div>

      {/* COMPARISON WORKBENCH & TABLE */}
      <div className={`bg-white border border-slate-100 shadow-sm overflow-hidden flex flex-col transition-all duration-200 ${
        isReconExpanded ? 'fixed inset-0 z-[100] rounded-none w-screen h-screen p-4 sm:p-6 bg-white' : 'rounded-[2rem]'
      }`}>
        {/* Table Toolbar */}
        <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-200/60 p-1 rounded-xl">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition ${
                filterType === 'all' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Records ({stats.totalRows})
            </button>
            <button
              onClick={() => setFilterType('critical')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition flex items-center gap-1.5 ${
                filterType === 'critical' ? 'bg-rose-600 text-white shadow-sm' : 'text-rose-700 hover:text-rose-900'
              }`}
            >
              <AlertOctagon size={13} />
              Critical Errors ({stats.criticalCount})
            </button>
            <button
              onClick={() => setFilterType('variance')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition flex items-center gap-1.5 ${
                filterType === 'variance' ? 'bg-amber-600 text-white shadow-sm' : 'text-amber-700 hover:text-amber-900'
              }`}
            >
              <AlertTriangle size={13} />
              Variances ({stats.varianceCount})
            </button>
            <button
              onClick={() => setFilterType('matched')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition flex items-center gap-1.5 ${
                filterType === 'matched' ? 'bg-emerald-600 text-white shadow-sm' : 'text-emerald-700 hover:text-emerald-900'
              }`}
            >
              <CheckCircle2 size={13} />
              Matched ({stats.matchedCount})
            </button>
            {stats.omittedCount > 0 && (
              <button
                onClick={() => setFilterType('omitted')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition flex items-center gap-1.5 ${
                  filterType === 'omitted' ? 'bg-purple-600 text-white shadow-sm' : 'text-purple-700 hover:text-purple-900'
                }`}
              >
                <UserX size={13} />
                Omitted DB Members ({stats.omittedCount})
              </button>
            )}
          </div>

          {/* Search & Table Actions */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Search staff, ID, or discrepancy..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-600 w-48 sm:w-64 font-semibold text-slate-800"
              />
            </div>

            <button
              onClick={() => setIsReconExpanded(!isReconExpanded)}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition"
              title={isReconExpanded ? "Restore view" : "Full screen"}
            >
              {isReconExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          </div>
        </div>

        {/* VIEW: OMITTED MEMBERS */}
        {filterType === 'omitted' ? (
          <div className="p-6 space-y-6">
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl flex items-start gap-3">
              <UserX className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-black uppercase text-purple-950">Omitted Database Members</h4>
                <p className="text-xs text-purple-800 font-medium mt-0.5">
                  The following {omittedMembers.length} cooperator accounts are registered in the Firestore database with active monthly deduction plans or active loan repayments, but were NOT found in the uploaded payroll sheet.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <th className="p-3">Staff ID</th>
                    <th className="p-3">Full Name</th>
                    <th className="p-3">Expected OS (₦)</th>
                    <th className="p-3">Expected SS (₦)</th>
                    <th className="p-3">Expected Loan (₦)</th>
                    <th className="p-3">Active Loan Debt (₦)</th>
                    <th className="p-3 text-right">Expected Total (₦)</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {omittedMembers.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-3 font-mono font-bold text-purple-900">{m.id}</td>
                      <td className="p-3">
                        <p className="font-extrabold text-slate-900">{m.name}</p>
                        <p className="text-[10px] text-slate-400">{m.email || 'Registered Member'}</p>
                      </td>
                      <td className="p-3 font-mono">₦{m.ordinarySavings.toLocaleString()}</td>
                      <td className="p-3 font-mono">₦{m.specialSavings.toLocaleString()}</td>
                      <td className="p-3 font-mono font-bold text-amber-700">
                        {m.expectedLoanRepay > 0 ? `₦${m.expectedLoanRepay.toLocaleString()}` : '—'}
                      </td>
                      <td className="p-3 font-mono text-slate-500">
                        {m.outstandingLoans > 0 ? `₦${m.outstandingLoans.toLocaleString()}` : '₦0'}
                      </td>
                      <td className="p-3 text-right font-mono font-black text-purple-950">
                        ₦{m.expectedTotal.toLocaleString()}
                      </td>
                      <td className="p-3 text-right">
                        {onAddOmittedMemberToSheet && (
                          <button
                            onClick={() => onAddOmittedMemberToSheet(m)}
                            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition"
                          >
                            Add to Sheet
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* VIEW: UPLOADED VS DATABASE COMPARISON TABLE */
          <div className="overflow-x-auto custom-scrollbar flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <th className="p-3.5 w-24">Member ID</th>
                  <th className="p-3.5 min-w-[160px]">Cooperator Name</th>
                  <th className="p-3.5 text-center min-w-[130px]">Reconciliation Flag</th>
                  <th className="p-3.5 min-w-[110px]">Uploaded OS</th>
                  <th className="p-3.5 min-w-[110px]">Uploaded SS</th>
                  <th className="p-3.5 min-w-[110px]">Uploaded Loan</th>
                  <th className="p-3.5 min-w-[110px]">Inv / CP / MCA</th>
                  <th className="p-3.5 text-right min-w-[120px]">Uploaded Total</th>
                  <th className="p-3.5 text-right min-w-[120px]">DB Expected</th>
                  <th className="p-3.5 text-right min-w-[110px]">Disparity</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {displayRows.map((item) => {
                  const hasCritical = item.status === 'critical_error';
                  const hasVariance = item.status === 'variance';

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        hasCritical ? 'bg-rose-50/20' : hasVariance ? 'bg-amber-50/15' : ''
                      }`}
                    >
                      {/* ID */}
                      <td className="p-3.5 font-mono font-bold text-slate-600">
                        {item.id}
                        {!item.isRegisteredInDb && (
                          <span className="block text-[8px] text-rose-600 font-black uppercase">Unregistered</span>
                        )}
                      </td>

                      {/* Name & Discrepancies */}
                      <td className="p-3.5">
                        <p className="font-extrabold text-slate-900">{item.name}</p>
                        {item.discrepancyList.length > 0 && (
                          <div className="space-y-1 mt-1">
                            {item.discrepancyList.map((d, i) => (
                              <div
                                key={i}
                                className={`text-[9px] font-bold flex items-start gap-1 p-1 rounded ${
                                  d.severity === 'critical'
                                    ? 'bg-rose-100 text-rose-900 border border-rose-200'
                                    : d.severity === 'warning'
                                    ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                    : 'bg-indigo-50 text-indigo-900'
                                }`}
                              >
                                {d.severity === 'critical' ? (
                                  <AlertOctagon size={11} className="shrink-0 text-rose-600 mt-0.5" />
                                ) : (
                                  <AlertTriangle size={11} className="shrink-0 text-amber-600 mt-0.5" />
                                )}
                                <span>{d.message}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Reconciliation Flag Status */}
                      <td className="p-3.5 text-center">
                        {item.status === 'critical_error' ? (
                          <span className="px-2.5 py-1 bg-rose-600 text-white text-[9px] font-black rounded-full uppercase tracking-wider inline-flex items-center gap-1 shadow-sm">
                            <AlertOctagon size={11} />
                            Critical Error
                          </span>
                        ) : item.status === 'variance' ? (
                          <span className="px-2.5 py-1 bg-amber-500 text-white text-[9px] font-black rounded-full uppercase tracking-wider inline-flex items-center gap-1 shadow-sm">
                            <AlertTriangle size={11} />
                            Variance Alert
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-emerald-600 text-white text-[9px] font-black rounded-full uppercase tracking-wider inline-flex items-center gap-1 shadow-sm">
                            <CheckCircle2 size={11} />
                            Matched & Clean
                          </span>
                        )}
                      </td>

                      {/* OS Comparison */}
                      <td className="p-3.5 font-mono">
                        <div className={`${item.varianceOS !== 0 ? 'text-amber-800 font-bold' : 'text-slate-800'}`}>
                          ₦{item.uploadedOS.toLocaleString()}
                        </div>
                        {item.varianceOS !== 0 && (
                          <span className="text-[8px] text-slate-400 block font-sans font-medium">
                            DB: ₦{item.expectedOS.toLocaleString()} ({item.varianceOS > 0 ? '+' : ''}₦{item.varianceOS.toLocaleString()})
                          </span>
                        )}
                      </td>

                      {/* SS Comparison */}
                      <td className="p-3.5 font-mono">
                        <div className={`${item.varianceSS !== 0 ? 'text-amber-800 font-bold' : 'text-slate-800'}`}>
                          ₦{item.uploadedSS.toLocaleString()}
                        </div>
                        {item.varianceSS !== 0 && (
                          <span className="text-[8px] text-slate-400 block font-sans font-medium">
                            DB: ₦{item.expectedSS.toLocaleString()} ({item.varianceSS > 0 ? '+' : ''}₦{item.varianceSS.toLocaleString()})
                          </span>
                        )}
                      </td>

                      {/* Loan Comparison */}
                      <td className="p-3.5 font-mono">
                        <div className={`${item.varianceLoan !== 0 ? 'text-rose-800 font-black' : 'text-slate-800'}`}>
                          ₦{item.uploadedLoan.toLocaleString()}
                        </div>
                        {item.varianceLoan !== 0 && (
                          <span className="text-[8px] text-rose-600 block font-sans font-bold">
                            DB Exp: ₦{item.expectedLoan.toLocaleString()}
                          </span>
                        )}
                      </td>

                      {/* Other splits */}
                      <td className="p-3.5 font-mono text-[10px] text-slate-600 space-y-0.5">
                        <div>Inv: ₦{item.uploadedInv.toLocaleString()}</div>
                        <div>CP: ₦{item.uploadedCP.toLocaleString()}</div>
                        <div>MCA: ₦{item.uploadedMCA.toLocaleString()}</div>
                      </td>

                      {/* Uploaded Total */}
                      <td className="p-3.5 text-right font-mono font-black text-slate-900 text-xs">
                        ₦{item.uploadedTotal.toLocaleString()}
                      </td>

                      {/* Expected Total */}
                      <td className="p-3.5 text-right font-mono font-bold text-indigo-900 text-xs">
                        ₦{item.expectedTotal.toLocaleString()}
                      </td>

                      {/* Disparity */}
                      <td className="p-3.5 text-right font-mono font-bold">
                        {item.varianceTotal === 0 ? (
                          <span className="text-emerald-600">₦0</span>
                        ) : item.varianceTotal < 0 ? (
                          <span className="text-rose-600 font-black">
                            -₦{Math.abs(item.varianceTotal).toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-amber-600 font-black">
                            +₦{item.varianceTotal.toLocaleString()}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right">
                        {item.discrepancyList.length > 0 && item.isRegisteredInDb && (
                          <button
                            onClick={() => handleAlignSingleRecord(item)}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[9px] font-black uppercase tracking-wider transition"
                            title="Set uploaded values to database expectations"
                          >
                            Align DB
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Summary */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-600">
          <div>
            <span>Audit Status: </span>
            {stats.criticalCount > 0 ? (
              <span className="text-rose-600 font-black uppercase">
                {stats.criticalCount} Critical Errors Pending Resolution
              </span>
            ) : stats.varianceCount > 0 ? (
              <span className="text-amber-600 font-black uppercase">
                {stats.varianceCount} Variances Flagged (Non-blocking)
              </span>
            ) : (
              <span className="text-emerald-600 font-black uppercase">
                Certified Reconciled & Ready for Deployment
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExportReconciliationReport('csv')}
              className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-100 transition"
            >
              CSV Report
            </button>
            <button
              onClick={() => handleExportReconciliationReport('xlsx')}
              className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5"
            >
              <FileSpreadsheet size={13} />
              Excel (.xlsx) Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
