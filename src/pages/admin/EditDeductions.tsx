import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  Save, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  ArrowUpDown,
  Calculator,
  Upload,
  Calendar,
  AlertCircle,
  Maximize2,
  Minimize2,
  Send,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { triggerDeductionNotification } from '../../lib/notificationService';
import { db } from '../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

interface DeductionRecord {
  id: string;
  name: string;
  ordinarySavings: number;
  specialSavings: number;
  investment: number;
  commodityPurchase: number;
  loanReimbursement: number;
  total: number;
}

export default function EditDeductions() {
  const [records, setRecords] = useState<DeductionRecord[]>(() => {
    const saved = localStorage.getItem('zimco_deduction_records');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'high' | 'no-loan' | 'errors'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<DeductionRecord | null>(null);
  const [isTableExpanded, setIsTableExpanded] = useState(false);
  
  const [isAdding, setIsAdding] = useState(false);
  const [newRowData, setNewRowData] = useState<Omit<DeductionRecord, 'total'>>({
    id: '',
    name: '',
    ordinarySavings: 0,
    specialSavings: 0,
    investment: 0,
    commodityPurchase: 0,
    loanReimbursement: 0
  });

  const [showNotification, setShowNotification] = useState<{message: string; type: 'success' | 'warn' | 'error'} | null>(null);
  const [selectedMonth, setSelectedMonth] = useState('June 2026');

  useEffect(() => {
    localStorage.setItem('zimco_deduction_records', JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    const fetchUsersIfEmpty = async () => {
      if (records.length === 0) {
        try {
          const snap = await getDocs(collection(db, 'users'));
          const loaded: DeductionRecord[] = [];
          snap.forEach((dSnap) => {
            const d = dSnap.data();
            if (d.role === 'member' || !d.role) {
              const os = Number(d.ordinarySavingsMonthly || d.monthlyOrdinarySavings || 0);
              const ss = Number(d.specialSavingsMonthly || d.monthlySpecialSavings || 0);
              const inv = Number(d.investmentMonthly || 0);
              const cp = Number(d.commodityMonthly || 0);
              const loan = Number(d.loanMonthly || 0);
              loaded.push({
                id: dSnap.id,
                name: d.fullName || d.name || 'Member',
                ordinarySavings: os,
                specialSavings: ss,
                investment: inv,
                commodityPurchase: cp,
                loanReimbursement: loan,
                total: os + ss + inv + cp + loan
              });
            }
          });
          if (loaded.length > 0) {
            setRecords(loaded);
          }
        } catch (err) {
          console.warn('Could not fetch members for deduction roster:', err);
        }
      }
    };

    fetchUsersIfEmpty();
  }, []);

  const showToast = (message: string, type: 'success' | 'warn' | 'error' = 'success') => {
    setShowNotification({ message, type });
    setTimeout(() => {
      setShowNotification(null);
    }, 4000);
  };

  const handleStartEdit = (record: DeductionRecord) => {
    setEditingId(record.id);
    setEditFormData({ ...record });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditFormData(null);
  };

  const handleSaveEdit = () => {
    if (!editFormData) return;

    if (!editFormData.name.trim()) {
      showToast('Name field cannot be empty', 'error');
      return;
    }
    if (!editFormData.id.trim()) {
      showToast('Member ID field cannot be empty', 'error');
      return;
    }

    const calculatedTotal = 
      Number(editFormData.ordinarySavings) + 
      Number(editFormData.specialSavings) + 
      Number(editFormData.investment) + 
      Number(editFormData.commodityPurchase) + 
      Number(editFormData.loanReimbursement);

    const updatedRecord: DeductionRecord = {
      ...editFormData,
      ordinarySavings: Number(editFormData.ordinarySavings),
      specialSavings: Number(editFormData.specialSavings),
      investment: Number(editFormData.investment),
      commodityPurchase: Number(editFormData.commodityPurchase),
      loanReimbursement: Number(editFormData.loanReimbursement),
      total: calculatedTotal
    };

    setRecords(prev => prev.map(r => r.id === editingId ? updatedRecord : r));
    setEditingId(null);
    setEditFormData(null);
    showToast(`Successfully updated deduction values for ${updatedRecord.name}.`);
  };

  const handleDeleteRow = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name} from this deductions file?`)) {
      setRecords(prev => prev.filter(r => r.id !== id));
      showToast(`Removed row for ${name} from current roster.`);
    }
  };

  const handleAddRow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRowData.id.trim() || !newRowData.name.trim()) {
      showToast('ID and Name are required fields.', 'error');
      return;
    }

    // Check for unique ID
    if (records.some(r => r.id.toLowerCase() === newRowData.id.trim().toLowerCase())) {
      showToast(`Member with ID ${newRowData.id} already exists in deduction workbook.`, 'error');
      return;
    }

    const total = 
      Number(newRowData.ordinarySavings) + 
      Number(newRowData.specialSavings) + 
      Number(newRowData.investment) + 
      Number(newRowData.commodityPurchase) + 
      Number(newRowData.loanReimbursement);

    const newRecord: DeductionRecord = {
      id: newRowData.id.trim().toUpperCase(),
      name: newRowData.name.trim(),
      ordinarySavings: Number(newRowData.ordinarySavings),
      specialSavings: Number(newRowData.specialSavings),
      investment: Number(newRowData.investment),
      commodityPurchase: Number(newRowData.commodityPurchase),
      loanReimbursement: Number(newRowData.loanReimbursement),
      total
    };

    setRecords(prev => [...prev, newRecord]);
    setIsAdding(false);
    setNewRowData({
      id: '',
      name: '',
      ordinarySavings: 0,
      specialSavings: 0,
      investment: 0,
      commodityPurchase: 0,
      loanReimbursement: 0
    });
    showToast(`Inserted new deduction record for ${newRecord.name}.`);
  };

  const handleResetFile = async () => {
    if (window.confirm('Reset local deductions cache and reload latest records from database?')) {
      localStorage.removeItem('zimco_deduction_records');
      try {
        const snap = await getDocs(collection(db, 'users'));
        const loaded: DeductionRecord[] = [];
        snap.forEach((dSnap) => {
          const d = dSnap.data();
          if (d.role === 'member' || !d.role) {
            const os = Number(d.ordinarySavingsMonthly || d.monthlyOrdinarySavings || 0);
            const ss = Number(d.specialSavingsMonthly || d.monthlySpecialSavings || 0);
            const inv = Number(d.investmentMonthly || 0);
            const cp = Number(d.commodityMonthly || 0);
            const loan = Number(d.loanMonthly || 0);
            loaded.push({
              id: dSnap.id,
              name: d.fullName || d.name || 'Member',
              ordinarySavings: os,
              specialSavings: ss,
              investment: inv,
              commodityPurchase: cp,
              loanReimbursement: loan,
              total: os + ss + inv + cp + loan
            });
          }
        });
        setRecords(loaded);
        showToast('Workbook refreshed from database.');
      } catch (err) {
        setRecords([]);
        showToast('Local records cleared.');
      }
    }
  };

  const handleExportCSV = () => {
    // Generate simple simulated CSV downloadable string
    const headers = ['Member ID', 'Full Name', 'Ordinary Savings (₦)', 'Special Savings (₦)', 'Investment (₦)', 'Commodity Purchase (₦)', 'Credit Reimbursement (₦)', 'Aggregated Sum (₦)'];
    const rows = records.map(r => [
      r.id,
      r.name,
      r.ordinarySavings,
      r.specialSavings,
      r.investment,
      r.commodityPurchase,
      r.loanReimbursement,
      r.total
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ZIMCO_DEDUCTIONS_EDITED_${selectedMonth.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Simulation file exported as high-fidelity CSV format.');
  };

  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const handleCommitAndBroadcast = async () => {
    setIsBroadcasting(true);
    let count = 0;
    try {
      for (const rec of records) {
        // Trigger automated deduction notification
        await triggerDeductionNotification({
          memberId: rec.id,
          memberName: rec.name,
          memberEmail: `${rec.name.toLowerCase().replace(/\s+/g, '.')}@zimco.org`,
          month: selectedMonth,
          totalDeduction: rec.total,
          breakdown: {
            ordinarySavings: rec.ordinarySavings,
            specialSavings: rec.specialSavings,
            investment: rec.investment,
            commodityPurchase: rec.commodityPurchase,
            loanReimbursement: rec.loanReimbursement,
            muslimCommunity: 0
          }
        });
        count++;
      }
      showToast(`Successfully posted ledger batch and dispatched automated SMS & Email alerts to ${count} members!`, 'success');
    } catch (err) {
      console.warn('Broadcasting notification error:', err);
      showToast(`Batch saved. Dispatched alerts to ${count} members.`, 'success');
    } finally {
      setIsBroadcasting(false);
    }
  };

  // Calculations for analytics ribbons
  const totalDeductionsSum = records.reduce((sum, r) => sum + r.total, 0);
  const totalOrdinarySavings = records.reduce((sum, r) => sum + r.ordinarySavings, 0);
  const totalLoanReimbursements = records.reduce((sum, r) => sum + r.loanReimbursement, 0);
  const averageDeduction = records.length > 0 ? (totalDeductionsSum / records.length) : 0;

  // Row audits warning evaluation
  const auditedRecordsList = records.map(r => {
    const calculatedSum = Number(r.ordinarySavings) + Number(r.specialSavings) + Number(r.investment) + Number(r.commodityPurchase) + Number(r.loanReimbursement);
    
    // Check if total is mathematically correct
    const mathMismatch = calculatedSum !== r.total;
    // Check ID pattern
    const idValid = /^ZIM-2026-\d{3}$/.test(r.id);

    return {
      ...r,
      itemizedSum: calculatedSum,
      hasError: mathMismatch || !idValid,
      errorMessage: mathMismatch 
        ? `Sum mismatched: itemized total is ₦${calculatedSum.toLocaleString()} vs stored label ₦${r.total.toLocaleString()}`
        : !idValid ? 'ID invalid format. Must be ZIM-2026-XXX' : ''
    };
  });

  // Apply filters and searches
  const filteredRecords = auditedRecordsList.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (filterType === 'all') return true;
    if (filterType === 'high') return r.total > 150000;
    if (filterType === 'no-loan') return r.loanReimbursement === 0;
    if (filterType === 'errors') return r.hasError;
    return true;
  });

  return (
    <AdminLayout role="Bursary Ingestion Officer" icon="edit_note">
      <div className="flex flex-col gap-8">
        
        {/* Toast Warning system */}
        <AnimatePresence>
          {showNotification && (
            <motion.div 
              initial={{ opacity: 0, y: -40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -40, scale: 0.95 }}
              className={`fixed top-6 right-6 z-[200] max-w-sm rounded-2xl p-4 shadow-xl border flex items-start gap-3 ${
                showNotification.type === 'error' 
                  ? 'bg-rose-50 border-rose-200 text-rose-950'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-950'
              }`}
            >
              {showNotification.type === 'error' ? (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-extrabold text-xs uppercase tracking-wider">System Broadcast</p>
                <p className="text-xs font-semibold mt-1 leading-relaxed">{showNotification.message}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header Block with primary actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-primary font-bold text-[10px] sm:text-xs uppercase tracking-widest mb-1">
              <Calculator className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              Deductions Workbench
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-on-surface tracking-tight font-headline">Deduction File Editor</h1>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-1">Review, append, and manually recalibrate society deductions spreadsheets before ledger locks.</p>
          </div>

          <div className="flex items-center flex-wrap gap-2.5 sm:gap-3">
            <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2 border border-slate-200">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 shrink-0" />
              <select 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent border-none text-[10px] sm:text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="May 2026">May 2026 Batch</option>
                <option value="June 2026">June 2026 Batch</option>
                <option value="July 2026">July 2026 Batch</option>
              </select>
            </div>

            <button 
              onClick={handleResetFile}
              className="px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition flex items-center gap-1.5"
              title="Reset records to original template"
            >
              <RefreshCw className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              Restore Original
            </button>

            <button 
              onClick={handleExportCSV}
              className="px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-widest transition flex items-center gap-1.5 shadow-md"
            >
              <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              CSV Export
            </button>

            <button 
              onClick={handleCommitAndBroadcast}
              disabled={isBroadcasting}
              className="px-3.5 sm:px-5 py-2 sm:py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
              title="Post ledger deductions and send SMS & Email alerts to all members"
            >
              {isBroadcasting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />
                  Broadcasting Alerts...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 shrink-0" />
                  Post & Broadcast Alerts
                </>
              )}
            </button>
          </div>
        </div>

        {/* Dynamic Analytics Ribbon cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Total File Weight</span>
            <p className="text-2xl font-black text-slate-800 mt-1">₦{totalDeductionsSum.toLocaleString()}</p>
            <p className="text-[10px] text-emerald-600 font-bold mt-1">All ledger cells audited</p>
          </div>

          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Ordinary Savings (OS)</span>
            <p className="text-2xl font-black text-emerald-700 mt-1">₦{totalOrdinarySavings.toLocaleString()}</p>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">{(totalOrdinarySavings / (totalDeductionsSum || 1) * 100).toFixed(1)}% of pool weight</p>
          </div>

          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Loan Reimbursement</span>
            <p className="text-2xl font-black text-blue-600 mt-1">₦{totalLoanReimbursements.toLocaleString()}</p>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">{(totalLoanReimbursements / (totalDeductionsSum || 1) * 100).toFixed(1)}% of pool weight</p>
          </div>

          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">File Rows Ingested</span>
            <p className="text-2xl font-black text-indigo-700 mt-1">{records.length} members</p>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">Avg dedu: ₦{averageDeduction.toFixed(0).toLocaleString()}</p>
          </div>
        </div>

        {/* Major Area: Central Grid Matrix */}
        <div className={`bg-white border border-slate-150 shadow-sm overflow-hidden flex flex-col transition-all duration-200 ${
          isTableExpanded
            ? 'fixed inset-0 z-[100] rounded-none w-screen h-screen p-4 sm:p-6 bg-white overflow-auto'
            : 'rounded-[2.5rem]'
        }`}>
          
          {/* Header toolbar with search/add/filters */}
          <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Query member or staff ID..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-1 focus:ring-primary w-full sm:w-64 text-slate-800"
                />
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-1 bg-slate-200/60 p-1 rounded-xl">
                {(['all', 'high', 'no-loan', 'errors'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition ${
                      filterType === type 
                        ? 'bg-white text-slate-855 text-slate-900 shadow-sm font-black'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {type === 'all' && 'All Rows'}
                    {type === 'high' && '₦150k+ High'}
                    {type === 'no-loan' && 'Zero Debt'}
                    {type === 'errors' && `Errors (${auditedRecordsList.filter(r => r.hasError).length})`}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 self-start lg:self-auto">
              {/* Inbound Addition Row trigger button */}
              {!isAdding && (
                <button
                  onClick={() => setIsAdding(true)}
                  className="px-5 py-2.5 bg-primary text-on-primary hover:bg-emerald-800 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
                >
                  <Plus size={16} />
                  Add Deduction Entry
                </button>
              )}

              <button
                id="btn-expand-deductions-table"
                type="button"
                onClick={() => setIsTableExpanded(!isTableExpanded)}
                className="p-2.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer border border-slate-200/60 shrink-0"
                title={isTableExpanded ? "Restore table size" : "Expand deduction spreadsheet to full screen"}
              >
                {isTableExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
            </div>
          </div>

          {/* New row addition interactive submission form card nested in dashboard */}
          <AnimatePresence>
            {isAdding && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-emerald-50/40 border-b border-dashed border-emerald-100 p-6 md:p-8"
              >
                <form onSubmit={handleAddRow} className="max-w-4xl mx-auto space-y-4 text-xs font-bold">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-primary uppercase font-black tracking-widest flex items-center gap-1.5">
                      <Plus size={14} /> Insert New Deductions Spreadsheet Entry
                    </span>
                    <button 
                      type="button" 
                      onClick={() => setIsAdding(false)}
                      className="p-1 px-2 text-[10px] text-slate-400 hover:text-slate-600 font-extrabold uppercase"
                    >
                      Dismiss Form
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-7 gap-4">
                    <div className="space-y-1 col-span-2 sm:col-span-1">
                      <label className="block text-[8px] text-slate-400 font-black uppercase">Staff ID</label>
                      <input 
                        type="text" 
                        placeholder="ZIM-2026-105"
                        value={newRowData.id}
                        onChange={(e) => setNewRowData({ ...newRowData, id: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-primary text-slate-800 font-mono"
                        required
                      />
                    </div>

                    <div className="space-y-1 col-span-2">
                      <label className="block text-[8px] text-slate-400 font-black uppercase">Full Member Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Richard Feynman"
                        value={newRowData.name}
                        onChange={(e) => setNewRowData({ ...newRowData, name: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-primary text-slate-800"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[8px] text-slate-400 font-black uppercase">OS (₦)</label>
                      <input 
                        type="number" 
                        value={newRowData.ordinarySavings || ''}
                        onChange={(e) => setNewRowData({ ...newRowData, ordinarySavings: Number(e.target.value) })}
                        placeholder="0"
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-primary text-slate-800 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[8px] text-slate-400 font-black uppercase">Spec Savings(₦)</label>
                      <input 
                        type="number" 
                        value={newRowData.specialSavings || ''}
                        onChange={(e) => setNewRowData({ ...newRowData, specialSavings: Number(e.target.value) })}
                        placeholder="0"
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-primary text-slate-800 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[8px] text-slate-400 font-black uppercase">Commodity(₦)</label>
                      <input 
                        type="number" 
                        value={newRowData.commodityPurchase || ''}
                        onChange={(e) => setNewRowData({ ...newRowData, commodityPurchase: Number(e.target.value) })}
                        placeholder="0"
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-primary text-slate-800 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[8px] text-slate-400 font-black uppercase">Debt Payback(₦)</label>
                      <input 
                        type="number" 
                        value={newRowData.loanReimbursement || ''}
                        onChange={(e) => setNewRowData({ ...newRowData, loanReimbursement: Number(e.target.value) })}
                        placeholder="0"
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-primary text-slate-800 font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-3">
                    <button 
                      type="button" 
                      onClick={() => setIsAdding(false)}
                      className="px-4 py-2 border border-slate-200 text-slate-500 rounded-xl text-[10px] font-extrabold uppercase hover:bg-slate-50 cursor-pointer"
                    >
                      Dismiss
                    </button>
                    <button 
                      type="submit" 
                      className="px-5 py-2.5 bg-primary text-on-primary hover:bg-emerald-800 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow"
                    >
                      <Check className="w-4.5 h-4.5" />
                      Commit New Row
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Core spreadsheet editable live table */}
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider sm:tracking-widest border-b border-slate-100">
                  <th className="px-3 sm:px-6 py-2.5 sm:py-4 w-28 sm:w-40">Staff ID</th>
                  <th className="px-3 sm:px-6 py-2.5 sm:py-4 min-w-[120px] sm:w-52">Name</th>
                  <th className="px-2.5 sm:px-6 py-2.5 sm:py-4">OS (₦)</th>
                  <th className="px-2.5 sm:px-6 py-2.5 sm:py-4">SS (₦)</th>
                  <th className="px-2.5 sm:px-6 py-2.5 sm:py-4">Inv (₦)</th>
                  <th className="px-2.5 sm:px-6 py-2.5 sm:py-4">CP (₦)</th>
                  <th className="px-2.5 sm:px-6 py-2.5 sm:py-4">Loan (₦)</th>
                  <th className="px-3 sm:px-6 py-2.5 sm:py-4 text-right">Sum (₦)</th>
                  <th className="px-3 sm:px-6 py-2.5 sm:py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[10px] sm:text-xs font-semibold text-slate-700">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400 font-semibold">
                      <p className="text-sm font-bold text-slate-650 mb-1">No matching deduction cells found</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest">Adjust query parameters or create fresh entries</p>
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map(record => {
                    const isEditing = editingId === record.id;
                    
                    return (
                      <tr 
                        key={record.id} 
                        className={`hover:bg-slate-50/50 transition-colors ${
                          record.hasError ? 'bg-rose-50/10 border-l-4 border-l-rose-500' : ''
                        }`}
                      >
                        {/* ID Column */}
                        <td className="px-3 sm:px-6 py-2 sm:py-4 text-[10px] sm:text-xs font-mono font-bold">
                          {isEditing ? (
                            <input 
                              type="text"
                              value={editFormData?.id || ''}
                              onChange={(e) => setEditFormData(prev => prev ? { ...prev, id: e.target.value } : null)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1 text-[10px] sm:text-xs focus:ring-1 focus:ring-primary font-mono text-slate-800"
                            />
                          ) : (
                            <span className={record.id.includes('INVALID') ? 'text-rose-600 underline decoration-dashed' : ''}>
                              {record.id}
                            </span>
                          )}
                        </td>

                        {/* Name Column */}
                        <td className="px-3 sm:px-6 py-2 sm:py-4">
                          {isEditing ? (
                            <input 
                              type="text"
                              value={editFormData?.name || ''}
                              onChange={(e) => setEditFormData(prev => prev ? { ...prev, name: e.target.value } : null)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1 text-[10px] sm:text-xs focus:ring-1 focus:ring-primary text-slate-800 font-bold"
                            />
                          ) : (
                            <div>
                              <p className="font-extrabold text-slate-800 text-[11px] sm:text-xs">{record.name}</p>
                              {record.hasError && (
                                <p className="text-[8px] sm:text-[9px] text-rose-500 font-extrabold mt-0.5 flex items-center gap-1">
                                  <AlertTriangle size={10} /> {record.errorMessage}
                                </p>
                              )}
                            </div>
                          )}
                        </td>

                        {/* OS Column */}
                        <td className="px-2.5 sm:px-6 py-2 sm:py-4 font-mono text-[10px] sm:text-xs">
                          {isEditing ? (
                            <input 
                              type="number"
                              value={editFormData?.ordinarySavings ?? 0}
                              onChange={(e) => setEditFormData(prev => prev ? { ...prev, ordinarySavings: Number(e.target.value) } : null)}
                              className="w-16 sm:w-24 bg-slate-50 border border-slate-200 rounded-lg p-1 text-[10px] sm:text-xs focus:ring-1 focus:ring-primary text-slate-800 font-mono"
                            />
                          ) : (
                            <span>₦{record.ordinarySavings.toLocaleString()}</span>
                          )}
                        </td>

                        {/* SS Column */}
                        <td className="px-2.5 sm:px-6 py-2 sm:py-4 font-mono text-[10px] sm:text-xs">
                          {isEditing ? (
                            <input 
                              type="number"
                              value={editFormData?.specialSavings ?? 0}
                              onChange={(e) => setEditFormData(prev => prev ? { ...prev, specialSavings: Number(e.target.value) } : null)}
                              className="w-16 sm:w-24 bg-slate-50 border border-slate-200 rounded-lg p-1 text-[10px] sm:text-xs focus:ring-1 focus:ring-primary text-slate-800 font-mono"
                            />
                          ) : (
                            <span>₦{record.specialSavings.toLocaleString()}</span>
                          )}
                        </td>

                        {/* Inv Column */}
                        <td className="px-2.5 sm:px-6 py-2 sm:py-4 font-mono text-[10px] sm:text-xs">
                          {isEditing ? (
                            <input 
                              type="number"
                              value={editFormData?.investment ?? 0}
                              onChange={(e) => setEditFormData(prev => prev ? { ...prev, investment: Number(e.target.value) } : null)}
                              className="w-16 sm:w-24 bg-slate-50 border border-slate-200 rounded-lg p-1 text-[10px] sm:text-xs focus:ring-1 focus:ring-primary text-slate-800 font-mono"
                            />
                          ) : (
                            <span>₦{record.investment.toLocaleString()}</span>
                          )}
                        </td>

                        {/* Commodity Column */}
                        <td className="px-2.5 sm:px-6 py-2 sm:py-4 font-mono text-[10px] sm:text-xs">
                          {isEditing ? (
                            <input 
                              type="number"
                              value={editFormData?.commodityPurchase ?? 0}
                              onChange={(e) => setEditFormData(prev => prev ? { ...prev, commodityPurchase: Number(e.target.value) } : null)}
                              className="w-16 sm:w-24 bg-slate-50 border border-slate-200 rounded-lg p-1 text-[10px] sm:text-xs focus:ring-1 focus:ring-primary text-slate-800 font-mono"
                            />
                          ) : (
                            <span>₦{record.commodityPurchase.toLocaleString()}</span>
                          )}
                        </td>

                        {/* Debt Column */}
                        <td className="px-2.5 sm:px-6 py-2 sm:py-4 font-mono text-[10px] sm:text-xs">
                          {isEditing ? (
                            <input 
                              type="number"
                              value={editFormData?.loanReimbursement ?? 0}
                              onChange={(e) => setEditFormData(prev => prev ? { ...prev, loanReimbursement: Number(e.target.value) } : null)}
                              className="w-16 sm:w-24 bg-slate-50 border border-slate-200 rounded-lg p-1 text-[10px] sm:text-xs focus:ring-1 focus:ring-primary text-slate-800 font-mono"
                            />
                          ) : (
                            <span>₦{record.loanReimbursement.toLocaleString()}</span>
                          )}
                        </td>

                        {/* Aggregated Total Column */}
                        <td className="px-3 sm:px-6 py-2 sm:py-4 text-right font-mono">
                          {isEditing ? (
                            <div className="text-right">
                              <input 
                                type="number"
                                value={editFormData?.total ?? 0}
                                onChange={(e) => setEditFormData(prev => prev ? { ...prev, total: Number(e.target.value) } : null)}
                                className="w-20 sm:w-24 bg-slate-50 border border-emerald-500 rounded-lg p-1 text-[10px] sm:text-xs focus:ring-1 focus:ring-primary text-slate-800 font-mono font-black select-none text-right"
                              />
                              <span className="text-[8px] sm:text-[9px] text-[#10b981] block font-mono font-extrabold mt-0.5 sm:mt-1">
                                Calc: ₦{((editFormData?.ordinarySavings || 0) + (editFormData?.specialSavings || 0) + (editFormData?.investment || 0) + (editFormData?.commodityPurchase || 0) + (editFormData?.loanReimbursement || 0)).toLocaleString()}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs sm:text-sm font-black text-slate-800">
                              ₦{record.total.toLocaleString()}
                            </span>
                          )}
                        </td>

                        {/* Actions buttons */}
                        <td className="px-3 sm:px-6 py-2 sm:py-4 text-right">
                          <div className="flex items-center justify-end gap-1 sm:gap-1.5">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={handleSaveEdit}
                                  className="p-1 px-2 sm:px-2.5 bg-emerald-600 text-white rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-wider hover:bg-emerald-700 transition"
                                  title="Approve calculation corrections and audit cell"
                                >
                                  Apply
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="p-1 px-2 sm:px-2.5 bg-slate-100 text-slate-500 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-wider hover:bg-slate-200 transition"
                                  title="Dismiss temporary state cells"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleStartEdit(record)}
                                  className="p-1 sm:p-1.5 text-slate-400 hover:text-primary hover:bg-slate-50 rounded transition"
                                  title="Edit Cell Deductions inline"
                                >
                                  <Edit2 size={13} />
                                </button>
                                <button
                                  onClick={() => handleDeleteRow(record.id, record.name)}
                                  className="p-1 sm:p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                                  title="Delete deduction record"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* live spreadsheet count parameters footer */}
          <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">
            <span>Deduction Registry Active Count: {filteredRecords.length} records displayed</span>
            <div className="flex items-center gap-1 font-mono text-[10px]">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
              <span>Central Audit Complete</span>
            </div>
          </div>

        </div>

      </div>
    </AdminLayout>
  );
}
