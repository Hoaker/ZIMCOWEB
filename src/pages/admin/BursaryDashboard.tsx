import React, { useState, useRef } from 'react';
import AdminLayout from './AdminLayout';
import { 
  Upload, 
  FileText, 
  History, 
  CheckCircle2, 
  ArrowRight, 
  Download, 
  Search,
  Filter,
  Bell,
  RefreshCw,
  Wallet,
  TrendingUp,
  Landmark,
  ShoppingBag,
  CreditCard,
  FileSpreadsheet,
  ChevronRight,
  AlertTriangle,
  Info,
  Trash2,
  Edit2,
  Check,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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

interface ParsedRow {
  rowNum: number;
  id: string;
  name: string;
  ordinarySavings: number;
  specialSavings: number;
  investment: number;
  commodityPurchase: number;
  loanReimbursement: number;
  total: number;
  status: 'valid' | 'warning' | 'error';
  message: string;
}

const MOCK_RECORDS: DeductionRecord[] = [
  { id: 'ZIM-2024-001', name: 'Amao Abdulhameed', ordinarySavings: 25000, specialSavings: 10000, investment: 50000, commodityPurchase: 15000, loanReimbursement: 35000, total: 135000 },
  { id: 'ZIM-2024-002', name: 'Olawale Johnson', ordinarySavings: 15000, specialSavings: 5000, investment: 20000, commodityPurchase: 0, loanReimbursement: 45000, total: 85000 },
  { id: 'ZIM-2024-003', name: 'Sarah Williams', ordinarySavings: 30000, specialSavings: 15000, investment: 100000, commodityPurchase: 25000, loanReimbursement: 0, total: 170000 },
  { id: 'ZIM-2024-004', name: 'Ibrahim Musa', ordinarySavings: 20000, specialSavings: 8000, investment: 30000, commodityPurchase: 10000, loanReimbursement: 20000, total: 88000 },
  { id: 'ZIM-2024-005', name: 'Chinelo Obi', ordinarySavings: 40000, specialSavings: 20000, investment: 150000, commodityPurchase: 50000, loanReimbursement: 60000, total: 320000 },
];

const MOCK_PARSED_ROWS: ParsedRow[] = [
  { rowNum: 1, id: 'ZIM-2024-001', name: 'Amao Abdulhameed', ordinarySavings: 25000, specialSavings: 10000, investment: 50000, commodityPurchase: 15000, loanReimbursement: 35000, total: 135000, status: 'valid', message: 'Math allocations and Staff ID cleared' },
  { rowNum: 2, id: 'ZIM-INVALID-99', name: 'Richard Feynman', ordinarySavings: 15000, specialSavings: 5000, investment: 0, commodityPurchase: 0, loanReimbursement: 0, total: 20000, status: 'error', message: 'CRITICAL: Staff ID pattern unrecognized in society database.' },
  { rowNum: 3, id: 'ZIM-2024-003', name: 'Sarah Williams', ordinarySavings: 30000, specialSavings: 15000, investment: 100000, commodityPurchase: 25000, loanReimbursement: 45050, total: 215050, status: 'warning', message: 'LIMIT WARN: Loan reimbursement ₦45,050 exceeds outstanding debt ceiling (₦30,000).' },
  { rowNum: 4, id: 'ZIM-2024-004', name: 'Ibrahim Musa', ordinarySavings: 20000, specialSavings: 8000, investment: 30000, commodityPurchase: 10000, loanReimbursement: 20000, total: 95000, status: 'error', message: 'MATH MISMATCH: Allocation itemized sum (₦88,000) differs from total specified (₦95,000).' },
  { rowNum: 5, id: 'ZIM-2024-005', name: 'Chinelo Obi', ordinarySavings: 40000, specialSavings: 20000, investment: 150000, commodityPurchase: 50000, loanReimbursement: 60000, total: 320000, status: 'valid', message: 'Math allocations and Staff ID cleared' },
  { rowNum: 6, id: 'ZIM-2024-006', name: 'Fatima Bello', ordinarySavings: 35005, specialSavings: 10000, investment: 50000, commodityPurchase: 0, loanReimbursement: 30000, total: 125005, status: 'warning', message: 'WARN: Ordinary Savings exceeds typical high-value monthly ceiling limits.' }
];

export default function BursaryDashboard() {
  const [isImporting, setIsImporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedRow[] | null>(null);
  const [diagnosticFilter, setDiagnosticFilter] = useState<'all' | 'error' | 'warning' | 'valid'>('all');
  const [editingRow, setEditingRow] = useState<ParsedRow | null>(null);
  const [commitMessage, setCommitMessage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [lastUpload, setLastUpload] = useState({
    fileName: 'ZIMCO_DEDUCTIONS_MAR_2026.xlsx',
    date: 'March 25, 2026 10:30 AM',
    totalAmount: '₦124,500,000',
    recordsCount: 1240,
    status: 'Processed'
  });

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsImporting(true);
      setCommitMessage(null);
      
      // Simulate complex Excel parsing and row diagnostic ingestion
      setTimeout(() => {
        setIsImporting(false);
        setParsedRows(MOCK_PARSED_ROWS);
      }, 1500);
    }
  };

  // Diagnostic Rules Evaluation Code
  const runDiagnosticsOnRow = (row: ParsedRow): ParsedRow => {
    const sum = Number(row.ordinarySavings) + Number(row.specialSavings) + Number(row.investment) + Number(row.commodityPurchase) + Number(row.loanReimbursement);
    
    // Rule 1: Staff ID Validation
    const idPattern = /^ZIM-2024-\d{3}$/;
    if (!idPattern.test(row.id)) {
      return {
        ...row,
        status: 'error',
        message: 'CRITICAL: Staff ID pattern unrecognized in society database.'
      };
    }

    // Rule 2: Allocation Math Mismatch
    if (sum !== Number(row.total)) {
      return {
        ...row,
        status: 'error',
        message: `MATH MISMATCH: Allocation itemized sum (₦${sum.toLocaleString()}) differs from total specified (₦${Number(row.total).toLocaleString()}).`
      };
    }

    // Rule 3: Debt limit warning thresholds
    if (Number(row.loanReimbursement) > 30000) {
      return {
        ...row,
        status: 'warning',
        message: 'LIMIT WARN: Loan reimbursement exceeds outstanding debt ceiling (₦30,000).'
      };
    }

    // Rule 4: Ordinary savings warning limits
    if (Number(row.ordinarySavings) > 30000) {
      return {
        ...row,
        status: 'warning',
        message: 'WARN: Ordinary Savings exceeds typical high-value monthly ceiling limits.'
      };
    }

    // Rule 5: Pass
    return {
      ...row,
      status: 'valid',
      message: 'Math allocations and Staff ID cleared'
    };
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRow || !parsedRows) return;

    // Run custom dynamic diagnostic parameters
    const audited = runDiagnosticsOnRow(editingRow);
    const updated = parsedRows.map(r => r.rowNum === editingRow.rowNum ? audited : r);
    setParsedRows(updated);
    setEditingRow(null);
  };

  const handleDeleteRow = (rowNum: number) => {
    if (!parsedRows) return;
    const filtered = parsedRows.filter(r => r.rowNum !== rowNum);
    setParsedRows(filtered);
  };

  const handleBypassWarning = (rowNum: number) => {
    if (!parsedRows) return;
    const updated = parsedRows.map(r => {
      if (r.rowNum === rowNum) {
        return {
          ...r,
          status: 'valid' as const,
          message: 'Bypassed Audit warning flags manually.'
        };
      }
      return r;
    });
    setParsedRows(updated);
  };

  const handleFinalCommit = () => {
    if (!parsedRows) return;
    const totalSum = parsedRows.reduce((acc, current) => acc + Number(current.total), 0);
    
    // Simulate commit to final ledger databases
    setLastUpload({
      fileName: 'ZIMCO_SCHEDULE_INGESTION_REV_2026.xlsx',
      date: new Date().toLocaleString(),
      totalAmount: `₦${totalSum.toLocaleString()}`,
      recordsCount: parsedRows.length,
      status: 'Processed'
    });

    setParsedRows(null);
    setCommitMessage(`Successfully committed ${parsedRows.length} audit-certified payroll records summing ₦${totalSum.toLocaleString()} into central member ledgers database.`);
    setTimeout(() => setCommitMessage(null), 8000);
  };

  // Count aggregates
  const errorCount = parsedRows?.filter(r => r.status === 'error').length || 0;
  const warnCount = parsedRows?.filter(r => r.status === 'warning').length || 0;
  const validCount = parsedRows?.filter(r => r.status === 'valid').length || 0;

  const displayRows = parsedRows?.filter(r => {
    if (diagnosticFilter === 'all') return true;
    return r.status === diagnosticFilter;
  }) || [];

  return (
    <AdminLayout role="Bursary Management" icon="payments">
      <div className="flex flex-col gap-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-1">
              <Landmark size={14} />
              Zimco Cooperative Society
            </div>
            <h1 className="text-3xl font-black text-on-surface tracking-tight font-headline animate-fade-in">Bursary Management Portal</h1>
            <p className="text-sm text-on-surface-variant mt-1">Manage monthly member deductions and account allocations.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-5 py-2.5 bg-white border border-surface-container-high rounded-xl text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
              <History size={18} />
              Audit Logs
            </button>
            <button 
              onClick={handleImportClick}
              className="px-5 py-2.5 bg-primary text-on-primary rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-primary-container transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
            >
              <Upload size={18} />
              Import Deduction File
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".csv, .xlsx, .xls"
              onChange={handleFileChange}
            />
          </div>
        </div>

        {commitMessage && (
          <div className="p-5 bg-emerald-50 text-emerald-950 border border-emerald-200 rounded-[2rem] text-xs font-semibold flex items-start gap-3 shadow-md">
            <div className="p-2 bg-emerald-100 text-emerald-850 rounded-xl shrink-0">
              <CheckCircle2 size={16} />
            </div>
            <div>
              <p className="font-extrabold text-emerald-900 text-sm">Ledger Database Transaction Committed</p>
              <p className="text-emerald-800 font-medium mt-1">{commitMessage}</p>
            </div>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          <StatCard 
            label="Total Deductions" 
            value="₦124.5M" 
            subValue="+12% vs last month" 
            icon={<Wallet className="text-primary" />} 
            trend="up"
          />
          <StatCard 
            label="Ordinary Savings" 
            value="₦45.2M" 
            subValue="36% of total" 
            icon={<TrendingUp className="text-emerald-500" />} 
            trend="up"
          />
          <StatCard 
            label="Special Savings" 
            value="₦12.8M" 
            subValue="10% of total" 
            icon={<Landmark className="text-indigo-500" />} 
            trend="up"
          />
          <StatCard 
            label="Investment Acc." 
            value="₦28.5M" 
            subValue="23% of total" 
            icon={<TrendingUp className="text-amber-500" />} 
            trend="up"
          />
          <StatCard 
            label="Commodity Purchase" 
            value="₦5.2M" 
            subValue="4% of total" 
            icon={<ShoppingBag className="text-rose-500" />} 
            trend="up"
          />
          <StatCard 
            label="Loan Reimbursements" 
            value="₦32.8M" 
            subValue="26% of total" 
            icon={<CreditCard className="text-blue-500" />} 
            trend="down"
          />
        </div>

        {/* Interactive Ingestion Workspace split panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* File Upload Section Side Panel */}
          <div className="lg:col-span-1 flex flex-col gap-8">
            {/* Import Card */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
              <h2 className="text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
                <Upload size={20} className="text-primary" />
                Upload Monthly Workbooks
              </h2>
              <div 
                onClick={handleImportClick}
                className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer group/drop"
              >
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover/drop:scale-110 group-hover/drop:text-primary transition-all">
                  {isImporting ? <RefreshCw size={32} className="animate-spin text-emerald-700" /> : <FileSpreadsheet size={32} />}
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-slate-800">Choose simulated excel roster</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Excel xlsx or csv parsing</p>
                </div>
              </div>
              
              <div className="mt-6 p-4 rounded-xl bg-slate-50 text-[11px] text-slate-500 font-semibold space-y-1.5 leading-relaxed">
                <span className="font-bold text-slate-800 block uppercase text-[8px] tracking-wider">File Analyzer Instructions:</span>
                <p>Upload files to start the row-by-row math verification engine. Invalid staff IDs and mathematical discrepancies are isolated instantly.</p>
              </div>
            </div>

            {/* Last Upload Info */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
                <History size={20} className="text-primary" />
                Deduction Ledger Log
              </h2>
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-150">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm border border-slate-100">
                      <FileText size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-on-surface truncate w-32">{lastUpload.fileName}</p>
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{lastUpload.date}</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-black rounded-md uppercase tracking-widest">
                    {lastUpload.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                  <div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Committed Sum</p>
                    <p className="text-lg font-black text-slate-800">{lastUpload.totalAmount}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Roster Count</p>
                    <p className="text-lg font-black text-slate-800">{lastUpload.recordsCount} members</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column Workspace */}
          <div className="lg:col-span-2">
            
            {parsedRows === null ? (
              /* Idle listing: deduction workbook content */
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full animate-fade-in">
                <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-on-surface">Master Ledger Deduction</h2>
                    <p className="text-xs text-on-surface-variant mt-1">Raw database snapshot of active member deduction matrix allotments.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                      <input 
                        type="text" 
                        placeholder="Search roster..." 
                        className="pl-9 pr-4 py-2 bg-slate-50 border-none rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-555 w-44"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto flex-grow">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50">
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Member details</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ordinary Savings</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Special Savings</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Investments</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Commodity Finance</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Loan Pay Off</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Agg. Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {MOCK_RECORDS.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.id.toLowerCase().includes(searchQuery.toLowerCase())).map((record) => (
                        <tr key={record.id} className="hover:bg-slate-50/80 transition-colors group text-xs font-semibold">
                          <td className="px-6 py-4">
                            <p className="text-sm font-black text-slate-800">{record.name}</p>
                            <p className="text-[9px] text-slate-400 font-mono mt-0.5">{record.id}</p>
                          </td>
                          <td className="px-6 py-4">₦{record.ordinarySavings.toLocaleString()}</td>
                          <td className="px-6 py-4">₦{record.specialSavings.toLocaleString()}</td>
                          <td className="px-6 py-4">₦{record.investment.toLocaleString()}</td>
                          <td className="px-6 py-4">₦{record.commodityPurchase.toLocaleString()}</td>
                          <td className="px-6 py-4">₦{record.loanReimbursement.toLocaleString()}</td>
                          <td className="px-6 py-4 text-sm font-black text-emerald-800 text-right">₦{record.total.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-6 bg-slate-55 flex items-center justify-between border-t border-slate-100">
                  <p className="text-xs text-slate-450 font-bold text-slate-400">Total Pooled: {MOCK_RECORDS.length} Records</p>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Master database live</span>
                </div>
              </div>
            ) : (
              /* ACTIVE INTERACTIVE WORKSPACE: ADVANCED DIACNOSTIC PARSER REVIEWER */
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full animate-fade-in">
                
                <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <FileSpreadsheet className="text-emerald-700 animate-bounce" size={22} />
                      Ingested Workbook Diagnostics Analyzer
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">Review validation and ledger alignment checks row-by-row before committing final book balances.</p>
                  </div>
                  
                  {/* Filter switches */}
                  <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl">
                    {(['all', 'error', 'warning', 'valid'] as const).map(f => (
                      <button
                        key={f}
                        onClick={() => setDiagnosticFilter(f)}
                        className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                          diagnosticFilter === f
                            ? f === 'error' ? 'bg-red-500 text-white shadow-sm font-black'
                            : f === 'warning' ? 'bg-amber-500 text-white shadow-sm font-black'
                            : f === 'valid' ? 'bg-emerald-600 text-white shadow-sm font-black'
                            : 'bg-slate-900 text-white shadow-sm'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {f === 'all' ? 'All Inbounds' : f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Diagnostics count ribbon banner */}
                <div className="p-4 bg-slate-50 grid grid-cols-4 gap-4 border-b border-slate-100 text-center text-xs font-bold divide-x divide-slate-150">
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase font-black">Lines Analyzed</span>
                    <span className="text-slate-800 font-extrabold">{parsedRows.length} rows</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-rose-500 block uppercase font-black">Math / ID Errors</span>
                    <span className="text-rose-600 font-black flex items-center justify-center gap-1">
                      <AlertTriangle size={12} /> {errorCount} unresolved
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-amber-550 block uppercase font-black text-amber-600">Bypassed Limits</span>
                    <span className="text-amber-600 font-black">{warnCount} flags</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-emerald-600 block uppercase font-black">Valid Complete</span>
                    <span className="text-emerald-705 text-emerald-700 font-black">{validCount} rows</span>
                  </div>
                </div>

                {/* Parser diagnostics row list table */}
                <div className="overflow-x-auto flex-grow">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/40 border-b border-slate-100">
                        <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-12">L#</th>
                        <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Member Profile</th>
                        <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Allocations Breakdown</th>
                        <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Specified Total</th>
                        <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Audit Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-120 divide-slate-100">
                      {displayRows.map(row => (
                        <tr 
                          key={row.rowNum} 
                          className={`hover:bg-slate-50/50 transition-colors text-xs ${
                            row.status === 'error' ? 'bg-red-50/15' : row.status === 'warning' ? 'bg-amber-50/10' : ''
                          }`}
                        >
                          <td className="px-6 py-5 font-mono text-slate-400 font-bold">{row.rowNum}</td>
                          <td className="px-6 py-5">
                            <p className="font-black text-slate-800">{row.name}</p>
                            <span className={`font-mono text-[9px] font-extrabold ${row.status === 'error' && row.id.includes('INVALID') ? 'text-red-600 underline decoration-dashed' : 'text-slate-400'}`}>
                              {row.id}
                            </span>
                          </td>
                          <td className="px-6 py-5 space-y-2 max-w-xs">
                            <div className="flex flex-wrap gap-2 text-[10px] font-mono text-slate-550">
                              <span className="p-1 px-1.5 bg-slate-100 rounded">OS: ₦{row.ordinarySavings.toLocaleString()}</span>
                              <span className="p-1 px-1.5 bg-slate-100 rounded">SS: ₦{row.specialSavings.toLocaleString()}</span>
                              <span className="p-1 px-1.5 bg-slate-100 rounded">Inv: ₦{row.investment.toLocaleString()}</span>
                              <span className="p-1 px-1.5 bg-slate-100 rounded">CP: ₦{row.commodityPurchase.toLocaleString()}</span>
                              <span className="p-1 px-1.5 bg-slate-100 rounded">Debt: ₦{row.loanReimbursement.toLocaleString()}</span>
                            </div>
                            
                            {/* Detailed Diagnostics Message notification */}
                            <div className="flex items-start gap-1.5 text-[11px] font-medium leading-normal mt-1.5">
                              {row.status === 'error' && <AlertTriangle size={13} className="text-red-600 shrink-0 mt-0.5" />}
                              {row.status === 'warning' && <Info size={13} className="text-amber-600 shrink-0 mt-0.5" />}
                              {row.status === 'valid' && <CheckCircle2 size={13} className="text-emerald-600 shrink-0 mt-0.5" />}
                              
                              <span className={
                                row.status === 'error' ? 'text-red-700 font-bold' : 
                                row.status === 'warning' ? 'text-amber-700 font-bold' : 
                                'text-slate-450 text-slate-400'
                              }>
                                {row.message}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right font-black font-mono">
                            ₦{row.total.toLocaleString()}
                          </td>
                          <td className="px-6 py-5 space-y-1 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button 
                                onClick={() => setEditingRow(row)}
                                className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-slate-50 rounded transition"
                                title="Edit Values"
                              >
                                <Edit2 size={13} />
                              </button>
                              
                              {row.status === 'warning' && (
                                <button 
                                  onClick={() => handleBypassWarning(row.rowNum)}
                                  className="p-1 bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-black rounded-md tracking-wider uppercase hover:bg-amber-100/50 transition"
                                  title="Manually Bypass Limit warnings"
                                >
                                  Bypass
                                </button>
                              )}

                              <button 
                                onClick={() => handleDeleteRow(row.rowNum)}
                                className="p-1.5 text-rose-450 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                                title="Strike Row From workbook Ingestion"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Real-time Validation Action Footer */}
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-1 text-xs font-bold text-slate-800">
                      <span>Audit Lock Ingestion status:</span>
                      {errorCount > 0 ? (
                        <span className="text-red-600 font-extrabold flex items-center gap-1">
                          <AlertTriangle size={12} /> {errorCount} Critical Conflicts Block Commitment
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-headline font-black uppercase flex items-center gap-0.5">
                          <CheckCircle2 size={13} /> Fully Reconciled & Certified
                        </span>
                      )}
                    </div>
                    {errorCount > 0 && (
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                        Please reconcile math discrepancies or correct wrong Member ID numbers. You can also strike out rows using the trash action.
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <button 
                      onClick={() => setParsedRows(null)}
                      className="px-4 py-2.5 bg-white border border-slate-201 text-slate-700 hover:bg-slate-50 text-xs font-black uppercase tracking-widest rounded-xl transition"
                    >
                      Rollback Batch
                    </button>
                    <button 
                      onClick={handleFinalCommit}
                      disabled={errorCount > 0}
                      className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow transition-all ${
                        errorCount > 0 
                          ? 'bg-slate-20 bg-slate-100 text-slate-450 text-slate-400 cursor-not-allowed border-none'
                          : 'bg-primary text-on-primary hover:bg-emerald-800 hover:shadow-lg shadow-emerald-700/20'
                      }`}
                    >
                      <CheckCircle2 size={14} />
                      Commit certified workbook allocations
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>

        {/* Edit Row Modal Dialogue */}
        <AnimatePresence>
          {editingRow && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl overflow-hidden w-full max-w-lg"
              >
                <div className="p-6 md:p-8 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                  <div>
                    <span className="text-[9px] text-slate-400 font-black uppercase font-mono tracking-wider">RECONCILE ROW #{editingRow.rowNum}</span>
                    <h3 className="font-bold text-slate-900 max-w-xs truncate font-headline">{editingRow.name}</h3>
                  </div>
                  <button 
                    onClick={() => setEditingRow(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg bg-white shadow-sm border border-slate-100 transition"
                  >
                    <X size={16} />
                  </button>
                </div>

                <form onSubmit={handleSaveEdit} className="p-6 md:p-8 space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1 col-span-2">
                      <label className="block text-[9px] font-black uppercase tracking-widest text-slate-425">Cooperative Staff ID</label>
                      <input 
                        type="text" 
                        value={editingRow.id}
                        onChange={(e) => setEditingRow({ ...editingRow, id: e.target.value })}
                        className="w-full bg-slate-50 border-none rounded-xl py-2 px-3 focus:ring-1 focus:ring-emerald-500 font-mono text-xs font-bold"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[9px] font-black uppercase tracking-widest text-slate-425">Ordinary Savings</label>
                      <input 
                        type="number" 
                        value={editingRow.ordinarySavings}
                        onChange={(e) => setEditingRow({ ...editingRow, ordinarySavings: Number(e.target.value) })}
                        className="w-full bg-slate-50 border-none rounded-xl py-2 px-3 focus:ring-1 focus:ring-emerald-500 font-mono text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[9px] font-black uppercase tracking-widest text-slate-425">Special Savings</label>
                      <input 
                        type="number" 
                        value={editingRow.specialSavings}
                        onChange={(e) => setEditingRow({ ...editingRow, specialSavings: Number(e.target.value) })}
                        className="w-full bg-slate-50 border-none rounded-xl py-2 px-3 focus:ring-1 focus:ring-emerald-500 font-mono text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[9px] font-black uppercase tracking-widest text-slate-425">Investment</label>
                      <input 
                        type="number" 
                        value={editingRow.investment}
                        onChange={(e) => setEditingRow({ ...editingRow, investment: Number(e.target.value) })}
                        className="w-full bg-slate-50 border-none rounded-xl py-2 px-3 focus:ring-1 focus:ring-emerald-500 font-mono text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[9px] font-black uppercase tracking-widest text-slate-425">Commodity Purchase</label>
                      <input 
                        type="number" 
                        value={editingRow.commodityPurchase}
                        onChange={(e) => setEditingRow({ ...editingRow, commodityPurchase: Number(e.target.value) })}
                        className="w-full bg-slate-50 border-none rounded-xl py-2 px-3 focus:ring-1 focus:ring-emerald-500 font-mono text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[9px] font-black uppercase tracking-widest text-slate-425">Loan Reimbursement</label>
                      <input 
                        type="number" 
                        value={editingRow.loanReimbursement}
                        onChange={(e) => setEditingRow({ ...editingRow, loanReimbursement: Number(e.target.value) })}
                        className="w-full bg-slate-50 border-none rounded-xl py-2 px-3 focus:ring-1 focus:ring-emerald-500 font-mono text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[9px] font-black uppercase tracking-widest text-slate-425">Specified Sheet Total</label>
                      <input 
                        type="number" 
                        value={editingRow.total}
                        onChange={(e) => setEditingRow({ ...editingRow, total: Number(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:ring-1 focus:ring-emerald-500 font-mono text-xs font-black"
                      />
                    </div>
                  </div>

                  {/* Math sum helper readout */}
                  <div className="p-3 bg-slate-50 text-[10px] rounded-xl font-mono flex justify-between font-bold border border-slate-100">
                    <span className="text-slate-400 uppercase">Itemized Sum:</span>
                    <span className="text-slate-700">₦{(Number(editingRow.ordinarySavings) + Number(editingRow.specialSavings) + Number(editingRow.investment) + Number(editingRow.commodityPurchase) + Number(editingRow.loanReimbursement)).toLocaleString()}</span>
                  </div>

                  <div className="flex gap-2 justify-end pt-4 border-t border-slate-100">
                    <button 
                      type="button" 
                      onClick={() => setEditingRow(null)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold uppercase tracking-wider"
                    >
                      Dismiss
                    </button>
                    <button 
                      type="submit" 
                      className="px-4 py-2 bg-primary text-on-primary hover:bg-emerald-800 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1"
                    >
                      <Check size={14} />
                      Save & Re-Audit
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Additional Cooperative Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-on-surface flex items-center gap-2">
                <RefreshCw size={18} className="text-primary" />
                Reconciliation
              </h3>
              <span className="px-2 py-1 bg-amber-50 text-amber-600 text-[10px] font-bold rounded-md uppercase tracking-widest animate-pulse">Pending</span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">Cross-reference imported deductions with the latest bank statement to ensure accuracy.</p>
            <button className="mt-auto w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all">Run Reconciliation</button>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-on-surface flex items-center gap-2">
                <Bell size={18} className="text-primary" />
                Member Notifications
              </h3>
              <div className="relative inline-block w-10 h-5">
                <input type="checkbox" className="sr-only peer" id="notify-toggle" defaultChecked />
                <label htmlFor="notify-toggle" className="absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-slate-200 rounded-full transition-all peer-checked:bg-primary"></label>
                <span className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-all peer-checked:translate-x-5"></span>
              </div>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">Automatically send SMS and Email alerts to members once their deductions are successfully allocated.</p>
            <button className="mt-auto w-full py-3 border border-slate-100 text-slate-500 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-all">Configure Alerts</button>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col gap-6">
            <h3 className="font-bold text-on-surface flex items-center gap-2">
              <ShoppingBag size={18} className="text-primary" />
              Commodity Purchase
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-on-surface-variant">Active Orders</span>
                <span className="text-sm font-bold text-on-surface">42</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-on-surface-variant">Pending Deductions</span>
                <span className="text-sm font-bold text-on-surface">₦4,250,000</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-primary h-full w-[65%]"></div>
              </div>
            </div>
            <button className="mt-auto w-full py-3 border border-primary text-primary rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-primary/5 transition-all flex items-center justify-center gap-2">
              Manage Orders
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function StatCard({ label, value, subValue, icon, trend }: { label: string, value: string, subValue: string, icon: React.ReactNode, trend: 'up' | 'down' }) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-[10px] font-bold ${trend === 'up' ? 'text-emerald-600' : 'text-error'}`}>
          {trend === 'up' ? <TrendingUp size={12} /> : <TrendingUp size={12} className="rotate-180" />}
          {trend === 'up' ? '+5.2%' : '-2.1%'}
        </div>
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl font-black text-slate-800 mb-1">{value}</p>
        <p className="text-[10px] font-medium text-slate-400">{subValue}</p>
      </div>
    </div>
  );
}
