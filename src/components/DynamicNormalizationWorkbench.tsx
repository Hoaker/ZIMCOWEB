import React, { useState, useMemo, useEffect } from 'react';
import { 
  Check, 
  Trash2, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Table, 
  Info, 
  ArrowRight, 
  ShieldAlert, 
  HelpCircle,
  FileSpreadsheet,
  Layers,
  CheckSquare,
  Wand2,
  Edit3,
  DollarSign,
  PieChart,
  User,
  Search,
  Filter,
  Sliders,
  CheckCircle,
  XCircle,
  TrendingUp,
  CreditCard,
  Building,
  RefreshCw,
  Calendar,
  Maximize2,
  Minimize2,
  Download,
  AlertCircle,
  ChevronRight,
  ArrowDownRight,
  ArrowUpRight,
  Split,
  Eye,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ParsedRawSheet, 
  ColumnMapping, 
  CanonicalField, 
  CANONICAL_FIELD_OPTIONS,
  normalizeRawRows,
  NormalizedDeductionRecord,
  cleanNumericValue,
  parseSpreadsheetBuffer,
  evaluateHeaderConformance,
  exportBursaryNextMonthAdjustmentSchedule,
  exportProcessedDeductionsSpreadsheet,
  detectMonthFromSheetNameOrText
} from '../lib/deductionNormalizer';

interface DynamicNormalizationWorkbenchProps {
  parsedSheet: ParsedRawSheet;
  ceilings: { ordinarySavingsCeiling: number; specialSavingsCeiling: number };
  onNormalizedComplete: (normalizedRecords: NormalizedDeductionRecord[], specifiedMonth?: string) => void;
  onCancel: () => void;
  showToast: (message: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

type WorkbenchView = 'sanitization_grid' | 'disparity_inspector' | 'account_distribution' | 'column_config';

export default function DynamicNormalizationWorkbench({
  parsedSheet: initialParsedSheet,
  ceilings,
  onNormalizedComplete,
  onCancel,
  showToast
}: DynamicNormalizationWorkbenchProps) {
  // Current active parsed sheet (can change when switching tabs in a multi-sheet file)
  const [currentParsedSheet, setCurrentParsedSheet] = useState<ParsedRawSheet>(initialParsedSheet);
  const [activeSheetName, setActiveSheetName] = useState<string>(initialParsedSheet.sheetName);
  
  // Views: sanitization_grid | disparity_inspector | account_distribution | column_config
  const [activeView, setActiveView] = useState<WorkbenchView>('sanitization_grid');
  const [mappings, setMappings] = useState<ColumnMapping[]>(initialParsedSheet.columnMappings);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'mismatch' | 'disparity' | 'valid'>('all');
  const [showPreflightAlert, setShowPreflightAlert] = useState(false);
  const [unresolvedList, setUnresolvedList] = useState<string[]>([]);
  const [isTableExpanded, setIsTableExpanded] = useState(false);

  // In-memory editable raw rows for live sanitization & cleaning
  const [sanitizedRows, setSanitizedRows] = useState<Array<Record<string, any>>>(() => {
    return initialParsedSheet.rawRows.map(row => ({ ...row }));
  });

  // Track row-level overrides and modifications
  const [modifiedCellKeys, setModifiedCellKeys] = useState<Set<string>>(new Set());

  // Billing month specified for current sheet
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    return initialParsedSheet.suggestedMonth || detectMonthFromSheetNameOrText(initialParsedSheet.sheetName, 'January 2026');
  });

  // Synchronize internal state whenever initialParsedSheet prop updates
  useEffect(() => {
    setCurrentParsedSheet(initialParsedSheet);
    setActiveSheetName(initialParsedSheet.sheetName);
    setMappings(initialParsedSheet.columnMappings);
    setSanitizedRows(initialParsedSheet.rawRows.map(row => ({ ...row })));
    setModifiedCellKeys(new Set());
    const detected = initialParsedSheet.suggestedMonth || detectMonthFromSheetNameOrText(initialParsedSheet.sheetName, 'January 2026');
    setSelectedMonth(detected);
  }, [initialParsedSheet]);

  // Handle Sheet Tab Switch for multi-sheet workbooks
  const handleSwitchSheet = (targetSheet: string) => {
    if (targetSheet === activeSheetName) return;

    if (currentParsedSheet.rawFileBuffer) {
      try {
        const newParsed = parseSpreadsheetBuffer(
          currentParsedSheet.rawFileBuffer, 
          currentParsedSheet.fileName, 
          targetSheet
        );
        setCurrentParsedSheet(newParsed);
        setActiveSheetName(newParsed.sheetName);
        setMappings(newParsed.columnMappings);
        setSanitizedRows(newParsed.rawRows.map(r => ({ ...r })));
        setModifiedCellKeys(new Set());
        const autoMonth = newParsed.suggestedMonth || detectMonthFromSheetNameOrText(newParsed.sheetName, selectedMonth);
        setSelectedMonth(autoMonth);
        showToast(`Switched to sheet "${targetSheet}". Inferred billing cycle: ${autoMonth}. Loaded ${newParsed.rawRows.length} records.`, 'success');
      } catch (err: any) {
        showToast(`Could not load sheet "${targetSheet}": ${err.message}`, 'error');
      }
    } else {
      setActiveSheetName(targetSheet);
      const autoMonth = detectMonthFromSheetNameOrText(targetSheet, selectedMonth);
      setSelectedMonth(autoMonth);
      showToast(`Selected sheet tab: "${targetSheet}" (${autoMonth})`, 'info');
    }
  };

  // Direct 1-Click Mapper: Map a canonical account directly to a selected Excel column
  const handleMapCanonicalFieldToHeader = (canonicalField: CanonicalField, targetRawHeader: string) => {
    setMappings(prev => {
      return prev.map(col => {
        // If this column was previously mapped to this canonical field, unmap it
        if (col.mappedField === canonicalField && col.rawHeader !== targetRawHeader) {
          return { ...col, mappedField: 'unmapped' };
        }
        // If this is the chosen column, map it to the canonical field and ensure it's not excluded
        if (col.rawHeader === targetRawHeader) {
          return { ...col, mappedField: canonicalField, isExcluded: false };
        }
        return col;
      });
    });
    const fieldOpt = CANONICAL_FIELD_OPTIONS.find(o => o.field === canonicalField);
    if (targetRawHeader) {
      showToast(`Mapped column "${targetRawHeader}" to ${fieldOpt?.label || canonicalField}.`, 'success');
    } else {
      showToast(`Unmapped ${fieldOpt?.label || canonicalField}.`, 'info');
    }
  };

  // Active mappings lookup
  const fieldToHeaderMap = useMemo(() => {
    const map: Partial<Record<CanonicalField, string>> = {};
    mappings.forEach(m => {
      if (!m.isExcluded && m.mappedField !== 'unmapped' && m.mappedField !== 'excluded') {
        map[m.mappedField] = m.rawHeader;
      }
    });
    return map;
  }, [mappings]);

  const activeHeaders = useMemo(() => {
    return mappings.filter(m => !m.isExcluded && m.mappedField !== 'excluded').map(m => m.rawHeader);
  }, [mappings]);

  const extraUnmappedHeaders = useMemo(() => {
    return mappings.filter(m => !m.isExcluded && m.mappedField === 'unmapped').map(m => m.rawHeader);
  }, [mappings]);

  // Handle in-cell value edit during sanitization
  const handleCellChange = (rowIndex: number, columnHeader: string, value: string) => {
    setSanitizedRows(prev => {
      const updated = [...prev];
      const row = { ...updated[rowIndex] };
      row[columnHeader] = value;
      updated[rowIndex] = row;
      return updated;
    });

    setModifiedCellKeys(prev => {
      const next = new Set(prev);
      next.add(`${rowIndex}-${columnHeader}`);
      return next;
    });
  };

  // Change mapping of a column
  const handleFieldChange = (rawHeader: string, newField: CanonicalField | 'unmapped') => {
    setMappings(prev => prev.map(col => {
      if (col.rawHeader === rawHeader) {
        return {
          ...col,
          mappedField: newField,
          isExcluded: newField === 'excluded'
        };
      }
      // If reassigned to an existing mapped field, unmap the old owner
      if (newField !== 'unmapped' && newField !== 'excluded' && col.mappedField === newField) {
        return {
          ...col,
          mappedField: 'unmapped'
        };
      }
      return col;
    }));
  };

  // Delete / Exclude a column with 1 click
  const handleDeleteColumn = (rawHeader: string) => {
    setMappings(prev => prev.map(col => {
      if (col.rawHeader === rawHeader) {
        return {
          ...col,
          mappedField: 'excluded',
          isExcluded: true
        };
      }
      return col;
    }));
    showToast(`Deleted / Excluded column "${rawHeader}" from the ingestion pipeline.`, 'warning');
  };

  // Restore an excluded column
  const handleRestoreColumn = (rawHeader: string) => {
    setMappings(prev => prev.map(col => {
      if (col.rawHeader === rawHeader) {
        return {
          ...col,
          mappedField: 'unmapped',
          isExcluded: false
        };
      }
      return col;
    }));
    showToast(`Restored column "${rawHeader}".`, 'success');
  };

  // Quick Action: Delete / Exclude all columns that are not assigned to accounts
  const handleDeleteAllUnmapped = () => {
    let count = 0;
    setMappings(prev => prev.map(col => {
      if (col.mappedField === 'unmapped' && !col.isExcluded) {
        count++;
        return {
          ...col,
          mappedField: 'excluded',
          isExcluded: true
        };
      }
      return col;
    }));
    showToast(`Deleted / Excluded ${count} unneeded non-ledger column(s).`, 'success');
  };

  // Delete a single row from memory
  const handleDeleteRow = (rowIndex: number) => {
    setSanitizedRows(prev => prev.filter((_, idx) => idx !== rowIndex));
    showToast(`Deleted record row #${rowIndex + 1}.`, 'info');
  };

  // 1-Click Auto-Sanitizer: clean messy currency symbols, commas, trailing spaces
  const handleAutoSanitizeNumericValues = () => {
    let cleanedCount = 0;
    const accountKeys = Object.values(fieldToHeaderMap).filter(Boolean) as string[];

    setSanitizedRows(prev => {
      return prev.map((row, rIdx) => {
        const cleanedRow = { ...row };
        accountKeys.forEach(key => {
          const val = row[key];
          if (val !== undefined && val !== null) {
            const strVal = String(val);
            if (strVal.includes('₦') || strVal.includes(',') || strVal.includes('$') || /[a-zA-Z]/.test(strVal)) {
              const num = cleanNumericValue(val);
              cleanedRow[key] = num;
              cleanedCount++;
              setModifiedCellKeys(mKeys => new Set(mKeys).add(`${rIdx}-${key}`));
            }
          }
        });
        return cleanedRow;
      });
    });

    if (cleanedCount > 0) {
      showToast(`Cleaned and normalized ${cleanedCount} dirty currency strings into numbers!`, 'success');
    } else {
      showToast('All account values are already cleanly formatted numbers.', 'info');
    }
  };

  // 1-Click Auto-Balancer: updates declared total column to match itemized sub-account sum
  const handleAutoBalanceSplits = () => {
    const totalHeader = fieldToHeaderMap.total;
    if (!totalHeader) {
      showToast('No Total Deduction column mapped to auto-balance.', 'warning');
      return;
    }

    let balancedCount = 0;
    setSanitizedRows(prev => {
      return prev.map((row, rIdx) => {
        const os = fieldToHeaderMap.ordinarySavings ? cleanNumericValue(row[fieldToHeaderMap.ordinarySavings]) : 0;
        const ss = fieldToHeaderMap.specialSavings ? cleanNumericValue(row[fieldToHeaderMap.specialSavings]) : 0;
        const inv = fieldToHeaderMap.investment ? cleanNumericValue(row[fieldToHeaderMap.investment]) : 0;
        const loan = fieldToHeaderMap.loanReimbursement ? cleanNumericValue(row[fieldToHeaderMap.loanReimbursement]) : 0;
        const cp = fieldToHeaderMap.commodityPurchase ? cleanNumericValue(row[fieldToHeaderMap.commodityPurchase]) : 0;
        const mc = fieldToHeaderMap.muslimCommunity ? cleanNumericValue(row[fieldToHeaderMap.muslimCommunity]) : 0;
        
        const sum = os + ss + inv + loan + cp + mc;
        const currentTotal = cleanNumericValue(row[totalHeader]);

        if (sum !== currentTotal) {
          balancedCount++;
          const updated = { ...row, [totalHeader]: sum };
          setModifiedCellKeys(mKeys => new Set(mKeys).add(`${rIdx}-${totalHeader}`));
          return updated;
        }
        return row;
      });
    });

    if (balancedCount > 0) {
      showToast(`Auto-balanced ${balancedCount} cooperator rows to exactly match their itemized splits sum!`, 'success');
    } else {
      showToast('All cooperator rows are already perfectly balanced.', 'success');
    }
  };

  // Reset to original parsed data
  const handleResetToRaw = () => {
    setMappings(currentParsedSheet.columnMappings);
    setSanitizedRows(currentParsedSheet.rawRows.map(row => ({ ...row })));
    setModifiedCellKeys(new Set());
    showToast('Reset all values and column mappings back to original sheet state.', 'info');
  };

  // Header Conformance
  const headerConformance = useMemo(() => {
    const rawHeaders = currentParsedSheet.rawHeaders;
    return evaluateHeaderConformance(rawHeaders, mappings);
  }, [currentParsedSheet.rawHeaders, mappings]);

  // Aggregate Totals across all rows
  const accountTotals = useMemo(() => {
    let totalOrdinarySavings = 0;
    let totalSpecialSavings = 0;
    let totalInvestment = 0;
    let totalLoanRepayment = 0;
    let totalCommodity = 0;
    let totalMuslimCommunity = 0;
    let totalDeclaredDeductions = 0;
    let totalSplitSum = 0;
    let mismatchCount = 0;
    let totalSentToBursary = 0;
    let totalDisparityVariance = 0;
    let shortfallCount = 0;
    let surplusCount = 0;

    sanitizedRows.forEach(row => {
      const os = fieldToHeaderMap.ordinarySavings ? cleanNumericValue(row[fieldToHeaderMap.ordinarySavings]) : 0;
      const ss = fieldToHeaderMap.specialSavings ? cleanNumericValue(row[fieldToHeaderMap.specialSavings]) : 0;
      const inv = fieldToHeaderMap.investment ? cleanNumericValue(row[fieldToHeaderMap.investment]) : 0;
      const loan = fieldToHeaderMap.loanReimbursement ? cleanNumericValue(row[fieldToHeaderMap.loanReimbursement]) : 0;
      const cp = fieldToHeaderMap.commodityPurchase ? cleanNumericValue(row[fieldToHeaderMap.commodityPurchase]) : 0;
      const mc = fieldToHeaderMap.muslimCommunity ? cleanNumericValue(row[fieldToHeaderMap.muslimCommunity]) : 0;

      const sum = os + ss + inv + loan + cp + mc;
      const declared = fieldToHeaderMap.total ? cleanNumericValue(row[fieldToHeaderMap.total]) : sum;

      totalOrdinarySavings += os;
      totalSpecialSavings += ss;
      totalInvestment += inv;
      totalLoanRepayment += loan;
      totalCommodity += cp;
      totalMuslimCommunity += mc;
      totalSplitSum += sum;
      totalDeclaredDeductions += declared;
      totalSentToBursary += declared;

      const variance = sum - declared;
      totalDisparityVariance += variance;

      if (variance < 0) shortfallCount++;
      else if (variance > 0) surplusCount++;

      if (fieldToHeaderMap.total && sum !== declared) {
        mismatchCount++;
      }
    });

    return {
      totalOrdinarySavings,
      totalSpecialSavings,
      totalInvestment,
      totalLoanRepayment,
      totalCommodity,
      totalMuslimCommunity,
      totalDeclaredDeductions,
      totalSplitSum,
      totalSentToBursary,
      totalDisparityVariance,
      shortfallCount,
      surplusCount,
      mismatchCount,
      isBalanced: totalSplitSum === totalDeclaredDeductions
    };
  }, [sanitizedRows, fieldToHeaderMap]);

  // Enhanced cooperator records with disparity and next-month calculations
  const cooperatorDisparityList = useMemo(() => {
    return sanitizedRows.map((row, index) => {
      const id = fieldToHeaderMap.id ? String(row[fieldToHeaderMap.id] || '').trim() : `ZIM-${String(index + 1).padStart(3, '0')}`;
      const name = fieldToHeaderMap.name ? String(row[fieldToHeaderMap.name] || '').trim() : `Cooperator #${index + 1}`;
      const date = fieldToHeaderMap.date ? String(row[fieldToHeaderMap.date] || '').trim() : '2026-06-25';
      const os = fieldToHeaderMap.ordinarySavings ? cleanNumericValue(row[fieldToHeaderMap.ordinarySavings]) : 0;
      const ss = fieldToHeaderMap.specialSavings ? cleanNumericValue(row[fieldToHeaderMap.specialSavings]) : 0;
      const inv = fieldToHeaderMap.investment ? cleanNumericValue(row[fieldToHeaderMap.investment]) : 0;
      const loan = fieldToHeaderMap.loanReimbursement ? cleanNumericValue(row[fieldToHeaderMap.loanReimbursement]) : 0;
      const cp = fieldToHeaderMap.commodityPurchase ? cleanNumericValue(row[fieldToHeaderMap.commodityPurchase]) : 0;
      const mc = fieldToHeaderMap.muslimCommunity ? cleanNumericValue(row[fieldToHeaderMap.muslimCommunity]) : 0;

      const actualSum = os + ss + inv + loan + cp + mc;
      const sentAmount = fieldToHeaderMap.total ? cleanNumericValue(row[fieldToHeaderMap.total]) : actualSum;
      const variance = actualSum - sentAmount;

      let varianceType: 'exact' | 'shortfall' | 'surplus' = 'exact';
      let nextMonthRecommended = sentAmount;
      let nextMonthAdjustmentNote = 'Standard recurring deduction';
      let varianceBreakdown = 'Exact 100% deduction balance.';

      if (variance < 0) {
        varianceType = 'shortfall';
        const diff = Math.abs(variance);
        nextMonthRecommended = sentAmount + diff;
        nextMonthAdjustmentNote = `Shortfall of ₦${diff.toLocaleString()} added to next month. Expected: ₦${nextMonthRecommended.toLocaleString()}.`;
        varianceBreakdown = `Under-deducted by ₦${diff.toLocaleString()} vs sent schedule.`;
      } else if (variance > 0) {
        varianceType = 'surplus';
        nextMonthRecommended = Math.max(0, sentAmount - variance);
        nextMonthAdjustmentNote = `Surplus of ₦${variance.toLocaleString()} credited. Next deduction adjusted to ₦${nextMonthRecommended.toLocaleString()}.`;
        varianceBreakdown = `Over-deducted by +₦${variance.toLocaleString()} vs sent schedule.`;
      }

      return {
        rowIndex: index,
        row,
        id,
        name,
        date,
        os,
        ss,
        inv,
        loan,
        cp,
        mc,
        actualSum,
        sentAmount,
        variance,
        varianceType,
        nextMonthRecommended,
        nextMonthAdjustmentNote,
        varianceBreakdown,
        isMismatch: actualSum !== sentAmount
      };
    });
  }, [sanitizedRows, fieldToHeaderMap]);

  // Filtered rows for the view grids
  const filteredRows = useMemo(() => {
    return cooperatorDisparityList.filter(item => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesId = item.id.toLowerCase().includes(q);
        if (!matchesName && !matchesId) return false;
      }

      // Status filter
      if (statusFilter === 'mismatch' && !item.isMismatch) return false;
      if (statusFilter === 'disparity' && item.varianceType === 'exact') return false;
      if (statusFilter === 'valid' && item.isMismatch) return false;

      return true;
    });
  }, [cooperatorDisparityList, searchQuery, statusFilter]);

  // Verify and Commit Sanitized Data to Member Ledgers
  const handleAttemptCommit = () => {
    // 1. Identify unmapped and undeleted columns
    const unmappedColumns = mappings.filter(m => !m.isExcluded && m.mappedField === 'unmapped');
    
    if (unmappedColumns.length > 0) {
      setUnresolvedList(unmappedColumns.map(c => c.rawHeader));
      setShowPreflightAlert(true);
      return;
    }

    // 2. Check for required Member ID or Name
    const hasId = mappings.some(m => !m.isExcluded && m.mappedField === 'id');
    const hasName = mappings.some(m => !m.isExcluded && m.mappedField === 'name');

    if (!hasId && !hasName) {
      showToast('Validation Error: You must map at least "Member ID" or "Member Full Name" to identify members.', 'error');
      return;
    }

    // 3. Perform live normalization using sanitized rows
    try {
      const normalized = normalizeRawRows(sanitizedRows, mappings, ceilings);
      if (normalized.length === 0) {
        throw new Error('No valid member records could be constructed from the sanitized dataset.');
      }

      showToast(`Data Sanitization Complete for ${selectedMonth}! Prepared ${normalized.length} records ready for member accounts.`, 'success');
      onNormalizedComplete(normalized, selectedMonth);
    } catch (err: any) {
      console.error('Commit error:', err);
      showToast(`Commit Error: ${err.message}`, 'error');
    }
  };

  // Bulk delete / exclude unmapped and proceed directly
  const handleAutoExcludeAndProceed = () => {
    const updatedMappings: ColumnMapping[] = mappings.map(col => {
      if (col.mappedField === 'unmapped' && !col.isExcluded) {
        return {
          ...col,
          mappedField: 'excluded',
          isExcluded: true
        };
      }
      return col;
    });

    setMappings(updatedMappings);
    setShowPreflightAlert(false);

    try {
      const normalized = normalizeRawRows(sanitizedRows, updatedMappings, ceilings);
      showToast(`Excluded all non-ledger columns and injected ${normalized.length} records for ${selectedMonth}!`, 'success');
      onNormalizedComplete(normalized, selectedMonth);
    } catch (err: any) {
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  // Export Next Month Bursary Schedule
  const handleExportNextMonthSchedule = (format: 'xlsx' | 'csv' = 'xlsx') => {
    try {
      const normalized = normalizeRawRows(sanitizedRows, mappings, ceilings);
      exportBursaryNextMonthAdjustmentSchedule(normalized, activeSheetName, format);
      showToast(`Exported Next-Month Bursary Schedule (${format.toUpperCase()}) successfully!`, 'success');
    } catch (err: any) {
      showToast(`Export Error: ${err.message}`, 'error');
    }
  };

  const unmappedCount = mappings.filter(m => !m.isExcluded && m.mappedField === 'unmapped').length;

  return (
    <div className="space-y-6">
      {/* Top Banner & File Details */}
      <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 lg:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-1">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider rounded-md">
                  Import Tunnel & Sanitization Workbench
                </span>
                <span className="text-xs text-slate-400 font-medium font-mono">{currentParsedSheet.fileName}</span>
                {currentParsedSheet.detectedCycleTitle && (
                  <span className="px-2.5 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-800 text-[10px] font-bold rounded-md">
                    {currentParsedSheet.detectedCycleTitle}
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1 font-headline">
                Bursary Deduction Import Tunnel
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 max-w-3xl leading-relaxed">
                Seamlessly split monthly deduction breakdowns across member sub-accounts (<strong>Ordinary Savings</strong>, <strong>Special Savings</strong>, <strong>Investment</strong>, <strong>Loans</strong>, <strong>Commodities</strong>, <strong>Muslim Community</strong>). Pick the exact sheet tab, specify disparities, and export next-month recommendations back to the Bursary.
              </p>
            </div>
          </div>

          {/* Workflow View Mode Switcher */}
          <div className="flex flex-wrap items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200 self-start lg:self-center gap-1">
            <button
              onClick={() => setActiveView('sanitization_grid')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-2 ${
                activeView === 'sanitization_grid'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Table size={14} />
              1. Sanitization Grid
            </button>
            <button
              onClick={() => setActiveView('disparity_inspector')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-2 ${
                activeView === 'disparity_inspector'
                  ? 'bg-rose-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <AlertTriangle size={14} />
              2. Disparities & Next Month ({accountTotals.shortfallCount + accountTotals.surplusCount})
            </button>
            <button
              onClick={() => setActiveView('account_distribution')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-2 ${
                activeView === 'account_distribution'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Split size={14} />
              3. Account Split Matrix
            </button>
            <button
              onClick={() => setActiveView('column_config')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-2 ${
                activeView === 'column_config'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers size={14} />
              4. Columns ({mappings.length})
            </button>
          </div>
        </div>

        {/* MULTI-SHEET TAB SELECTOR (Pick the Right Sheet) */}
        {currentParsedSheet.availableSheets && currentParsedSheet.availableSheets.length > 0 && (
          <div className="pt-4 pb-2 border-b border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <FileSpreadsheet size={15} className="text-emerald-600" />
                  Select Workbook Sheet:
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  (Choose the specific month sheet to process)
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {currentParsedSheet.availableSheets.map(sheet => {
                  const isActive = sheet === activeSheetName;
                  return (
                    <button
                      key={sheet}
                      onClick={() => handleSwitchSheet(sheet)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
                        isActive
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm font-black ring-2 ring-emerald-600/30'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-300 animate-pulse' : 'bg-slate-300'}`} />
                      {sheet}
                      {isActive && <Check size={12} className="stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* SPECIFY BILLING MONTH FOR CURRENT SHEET */}
        <div className="mt-4 p-4 sm:p-5 bg-gradient-to-r from-emerald-50 via-teal-50/70 to-slate-50 border border-emerald-200/90 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 font-bold shadow-xs">
              <Calendar size={20} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Target Billing Month for Sheet: <span className="text-emerald-800 font-mono font-black underline decoration-emerald-400 decoration-2 underline-offset-2">"{activeSheetName}"</span>
                </span>
                <span className="text-[10px] bg-emerald-100/90 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-300/60">
                  Direct Cooperator Passbook Sync
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                Specify which month this sheet applies to. When pushed, members will see this exact month's statement and itemized deductions in their personal dashboard.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Month Dropdown */}
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-300 shadow-xs focus-within:ring-2 focus-within:ring-emerald-500/30 focus-within:border-emerald-500">
              <span className="text-[10px] font-black uppercase text-slate-400">Month:</span>
              <select
                value={selectedMonth.split(' ')[0] || 'January'}
                onChange={(e) => {
                  const m = e.target.value;
                  const y = selectedMonth.split(' ')[1] || '2026';
                  setSelectedMonth(`${m} ${y}`);
                }}
                className="text-xs font-black text-slate-800 bg-transparent focus:outline-none cursor-pointer"
              >
                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Year Dropdown */}
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-300 shadow-xs focus-within:ring-2 focus-within:ring-emerald-500/30 focus-within:border-emerald-500">
              <span className="text-[10px] font-black uppercase text-slate-400">Year:</span>
              <select
                value={selectedMonth.split(' ')[1] || '2026'}
                onChange={(e) => {
                  const y = e.target.value;
                  const m = selectedMonth.split(' ')[0] || 'January';
                  setSelectedMonth(`${m} ${y}`);
                }}
                className="text-xs font-black text-slate-800 bg-transparent focus:outline-none cursor-pointer"
              >
                {['2024', '2025', '2026', '2027', '2028'].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            {/* Current Selected Cycle Badge */}
            <div className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-emerald-400 text-xs font-black shadow-xs flex items-center gap-1.5 border border-slate-800">
              <Check size={13} className="text-emerald-400 stroke-[3]" />
              <span className="text-white font-medium">Assigned:</span>
              <span className="font-mono text-emerald-400 font-black">{selectedMonth}</span>
            </div>
          </div>
        </div>

        {/* Account Split Aggregate Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pt-6 pb-2">
          {/* Ordinary Savings */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-2xl">
            <span className="text-[9px] font-black text-emerald-800 uppercase tracking-wider block truncate">
              Ordinary Savings
            </span>
            <p className="text-base font-black text-emerald-900 mt-0.5">
              ₦{accountTotals.totalOrdinarySavings.toLocaleString()}
            </p>
            <span className="text-[9px] text-emerald-700/80 font-medium">Standard OS</span>
          </div>

          {/* Special Savings */}
          <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-2xl">
            <span className="text-[9px] font-black text-blue-800 uppercase tracking-wider block truncate">
              Special Savings
            </span>
            <p className="text-base font-black text-blue-900 mt-0.5">
              ₦{accountTotals.totalSpecialSavings.toLocaleString()}
            </p>
            <span className="text-[9px] text-blue-700/80 font-medium">Voluntary SS</span>
          </div>

          {/* Investment / Shares */}
          <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-2xl">
            <span className="text-[9px] font-black text-purple-800 uppercase tracking-wider block truncate">
              Investment / Shares
            </span>
            <p className="text-base font-black text-purple-900 mt-0.5">
              ₦{accountTotals.totalInvestment.toLocaleString()}
            </p>
            <span className="text-[9px] text-purple-700/80 font-medium">Share Capital</span>
          </div>

          {/* Loan Disbursement / Repayment */}
          <div className="p-3 bg-rose-50/70 border border-rose-100 rounded-2xl">
            <span className="text-[9px] font-black text-rose-800 uppercase tracking-wider block truncate">
              Loan Disbursement
            </span>
            <p className="text-base font-black text-rose-900 mt-0.5">
              ₦{accountTotals.totalLoanRepayment.toLocaleString()}
            </p>
            <span className="text-[9px] text-rose-700/80 font-medium">Repayment Split</span>
          </div>

          {/* Commodity Purchase */}
          <div className="p-3 bg-amber-50/70 border border-amber-100 rounded-2xl">
            <span className="text-[9px] font-black text-amber-800 uppercase tracking-wider block truncate">
              Commodity
            </span>
            <p className="text-base font-black text-amber-900 mt-0.5">
              ₦{accountTotals.totalCommodity.toLocaleString()}
            </p>
            <span className="text-[9px] text-amber-700/80 font-medium">Goods Finance</span>
          </div>

          {/* Muslim Community Account */}
          <div className="p-3 bg-teal-50/70 border border-teal-100 rounded-2xl">
            <span className="text-[9px] font-black text-teal-800 uppercase tracking-wider block truncate">
              Muslim Community
            </span>
            <p className="text-base font-black text-teal-900 mt-0.5">
              ₦{accountTotals.totalMuslimCommunity.toLocaleString()}
            </p>
            <span className="text-[9px] text-teal-700/80 font-medium">MCA Contribution</span>
          </div>

          {/* Total Gross Deduction & Disparity Check */}
          <div className="p-3 bg-slate-900 text-white rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black text-emerald-400 uppercase tracking-wider block truncate">
                Total Deduction
              </span>
              {accountTotals.isBalanced ? (
                <CheckCircle size={12} className="text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle size={12} className="text-amber-400 animate-pulse shrink-0" />
              )}
            </div>
            <p className="text-base font-black text-white mt-0.5">
              ₦{accountTotals.totalDeclaredDeductions.toLocaleString()}
            </p>
            <span className="text-[9px] text-slate-400 font-medium truncate block">
              {accountTotals.isBalanced ? '✓ Splits Balanced' : `⚠️ ${accountTotals.mismatchCount} Disparity Flag(s)`}
            </span>
          </div>
        </div>

        {/* Action Controls Bar */}
        <div className="pt-6 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleAutoSanitizeNumericValues}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition"
              title="Strip currency symbols, commas, and trailing characters from numeric cells"
            >
              <Wand2 size={13} className="text-emerald-600" />
              Auto-Sanitize Values
            </button>
            <button
              onClick={handleAutoBalanceSplits}
              className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition"
              title="Re-calculate and sync gross total with individual account splits"
            >
              <DollarSign size={13} />
              Auto-Balance Splits Sum
            </button>
            <button
              onClick={() => handleExportNextMonthSchedule('xlsx')}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition"
              title="Export Next-Month Bursary Adjustment Schedule formatted for Bursary"
            >
              <Download size={13} className="text-emerald-600" />
              Export Next-Month Schedule (.xlsx)
            </button>
            <button
              onClick={handleDeleteAllUnmapped}
              disabled={unmappedCount === 0}
              className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition disabled:opacity-40 disabled:pointer-events-none"
              title="Drop all columns not mapped to account splits"
            >
              <Trash2 size={13} />
              Delete All {unmappedCount} Unneeded Columns
            </button>
            <button
              onClick={handleResetToRaw}
              className="px-3 py-2 text-slate-400 hover:text-slate-700 text-xs font-semibold flex items-center gap-1 transition"
            >
              <RotateCcw size={12} />
              Reset All
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onCancel}
              className="px-5 py-2.5 text-slate-600 hover:text-slate-900 rounded-xl text-xs font-bold uppercase tracking-wider transition"
            >
              Cancel
            </button>
            <button
              onClick={handleAttemptCommit}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg transition-all ${
                unmappedCount > 0
                  ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-700/20'
              }`}
            >
              <Sparkles size={15} />
              Confirm & Inject Sanitized Deductions
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: INTERACTIVE DATA SANITIZATION & ACCOUNT SPLIT GRID */}
      {activeView === 'sanitization_grid' && (
        <div className={`bg-white border border-slate-100 shadow-sm overflow-hidden flex flex-col transition-all duration-200 ${
          isTableExpanded
            ? 'fixed inset-0 z-[100] rounded-none w-screen h-screen p-4 sm:p-6 bg-white overflow-auto'
            : 'rounded-[2.5rem]'
        }`}>
          {/* Table Header Filter & Search Bar */}
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-200/60 p-1 rounded-xl">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition ${
                    statusFilter === 'all' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All Rows ({sanitizedRows.length})
                </button>
                <button
                  onClick={() => setStatusFilter('mismatch')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition flex items-center gap-1 ${
                    statusFilter === 'mismatch' ? 'bg-rose-600 text-white shadow-sm' : 'text-rose-700 hover:text-rose-900'
                  }`}
                >
                  <AlertTriangle size={12} />
                  Disparities ({accountTotals.mismatchCount})
                </button>
                <button
                  onClick={() => setStatusFilter('valid')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition ${
                    statusFilter === 'valid' ? 'bg-emerald-600 text-white shadow-sm' : 'text-emerald-700 hover:text-emerald-900'
                  }`}
                >
                  Balanced ({sanitizedRows.length - accountTotals.mismatchCount})
                </button>
              </div>

              {modifiedCellKeys.size > 0 && (
                <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold rounded-lg flex items-center gap-1">
                  <Edit3 size={11} /> {modifiedCellKeys.size} cell(s) edited
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  type="text" 
                  placeholder="Filter name or ID..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-600 w-52 font-semibold text-slate-800"
                />
              </div>

              <button
                id="btn-expand-workbench-table"
                type="button"
                onClick={() => setIsTableExpanded(!isTableExpanded)}
                className="p-2 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer border border-slate-200/60 shrink-0"
                title={isTableExpanded ? "Restore table size" : "Expand sanitization table to full screen"}
              >
                {isTableExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
            </div>
          </div>

          {/* Quick Mapping Helper Banner if any standard account is unmapped */}
          {(!fieldToHeaderMap.name || !fieldToHeaderMap.ordinarySavings || !fieldToHeaderMap.loanReimbursement || !fieldToHeaderMap.total) && (
            <div className="p-3.5 bg-amber-50/90 border border-amber-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <AlertTriangle size={18} className="text-amber-600 shrink-0" />
                <div>
                  <span className="font-black text-amber-900 block">
                    Verify Account Column Mappings
                  </span>
                  <p className="text-amber-700 text-[11px] font-medium">
                    Use the dropdown menus inside each column header below to assign your Excel columns directly to the corresponding cooperative account.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                <button
                  onClick={() => setActiveView('column_config')}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-[11px] font-black uppercase tracking-wider transition shadow-sm flex items-center gap-1"
                >
                  <Sliders size={12} />
                  Configure All Mappings ({mappings.length})
                </button>
              </div>
            </div>
          )}

          {/* Sanitization Spreadsheet Table */}
          <div className="overflow-x-auto max-h-[600px] custom-scrollbar rounded-xl border border-slate-200 shadow-inner">
            <table className="w-full text-left border-collapse text-xs min-w-[1200px]">
              <thead>
                <tr className="bg-slate-100/90 border-b border-slate-200 text-[10px] font-bold text-slate-700 uppercase tracking-wider sticky top-0 z-10 backdrop-blur-md">
                  <th className="p-3 w-10 text-center">#</th>
                  
                  {/* Deduction Date */}
                  <th className="p-2.5 min-w-[140px] border-r border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-800">Date</span>
                      <Calendar size={12} className="text-slate-400" />
                    </div>
                    <select
                      value={fieldToHeaderMap.date || ''}
                      onChange={(e) => handleMapCanonicalFieldToHeader('date', e.target.value)}
                      className="mt-1 w-full text-[10px] font-semibold bg-white border border-slate-300 rounded px-1 py-0.5 outline-none focus:border-emerald-500 text-slate-700"
                    >
                      <option value="">(Default Date)</option>
                      {mappings.filter(m => !m.isExcluded).map(m => (
                        <option key={m.rawHeader} value={m.rawHeader}>
                          {m.rawHeader}
                        </option>
                      ))}
                    </select>
                  </th>

                  {/* Member Name & ID */}
                  <th className="p-2.5 min-w-[210px] border-r border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-800">Cooperator Name & ID</span>
                      <User size={12} className="text-slate-400" />
                    </div>
                    <div className="grid grid-cols-2 gap-1 mt-1">
                      <select
                        value={fieldToHeaderMap.name || ''}
                        onChange={(e) => handleMapCanonicalFieldToHeader('name', e.target.value)}
                        className={`w-full text-[9px] font-bold rounded px-1 py-0.5 outline-none border ${
                          fieldToHeaderMap.name ? 'bg-white border-slate-300 text-slate-800' : 'bg-amber-50 border-amber-400 text-amber-900 animate-pulse'
                        }`}
                        title="Select column for Cooperator Full Name"
                      >
                        <option value="">Name: (Select)</option>
                        {mappings.filter(m => !m.isExcluded).map(m => (
                          <option key={m.rawHeader} value={m.rawHeader}>
                            Name: {m.rawHeader}
                          </option>
                        ))}
                      </select>

                      <select
                        value={fieldToHeaderMap.id || ''}
                        onChange={(e) => handleMapCanonicalFieldToHeader('id', e.target.value)}
                        className="w-full text-[9px] font-bold bg-white border border-slate-300 rounded px-1 py-0.5 outline-none text-slate-700"
                        title="Select column for Staff ID / Member S/N"
                      >
                        <option value="">ID: (Auto/Select)</option>
                        {mappings.filter(m => !m.isExcluded).map(m => (
                          <option key={m.rawHeader} value={m.rawHeader}>
                            ID: {m.rawHeader}
                          </option>
                        ))}
                      </select>
                    </div>
                  </th>

                  {/* Ordinary Savings Account */}
                  <th className="p-2.5 min-w-[140px] bg-emerald-50/70 border-r border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-950 font-black">OrdSav</span>
                      <span className="text-[9px] text-emerald-800 font-mono font-bold">OS (₦)</span>
                    </div>
                    <select
                      value={fieldToHeaderMap.ordinarySavings || ''}
                      onChange={(e) => handleMapCanonicalFieldToHeader('ordinarySavings', e.target.value)}
                      className={`mt-1 w-full text-[9px] font-bold rounded px-1 py-0.5 outline-none border ${
                        fieldToHeaderMap.ordinarySavings ? 'bg-white border-emerald-300 text-emerald-900' : 'bg-amber-50 border-amber-400 text-amber-900'
                      }`}
                    >
                      <option value="">(Unmapped ₦0)</option>
                      {mappings.filter(m => !m.isExcluded).map(m => (
                        <option key={m.rawHeader} value={m.rawHeader}>
                          {m.rawHeader}
                        </option>
                      ))}
                    </select>
                  </th>

                  {/* Special Savings Account */}
                  <th className="p-2.5 min-w-[140px] bg-blue-50/70 border-r border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-950 font-black">SpecSav</span>
                      <span className="text-[9px] text-blue-800 font-mono font-bold">SS (₦)</span>
                    </div>
                    <select
                      value={fieldToHeaderMap.specialSavings || ''}
                      onChange={(e) => handleMapCanonicalFieldToHeader('specialSavings', e.target.value)}
                      className={`mt-1 w-full text-[9px] font-bold rounded px-1 py-0.5 outline-none border ${
                        fieldToHeaderMap.specialSavings ? 'bg-white border-blue-300 text-blue-900' : 'bg-slate-50 border-slate-300 text-slate-700'
                      }`}
                    >
                      <option value="">(Unmapped ₦0)</option>
                      {mappings.filter(m => !m.isExcluded).map(m => (
                        <option key={m.rawHeader} value={m.rawHeader}>
                          {m.rawHeader}
                        </option>
                      ))}
                    </select>
                  </th>

                  {/* Investment Account */}
                  <th className="p-2.5 min-w-[140px] bg-purple-50/70 border-r border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-purple-950 font-black">InvAcc</span>
                      <span className="text-[9px] text-purple-800 font-mono font-bold">INV (₦)</span>
                    </div>
                    <select
                      value={fieldToHeaderMap.investment || ''}
                      onChange={(e) => handleMapCanonicalFieldToHeader('investment', e.target.value)}
                      className={`mt-1 w-full text-[9px] font-bold rounded px-1 py-0.5 outline-none border ${
                        fieldToHeaderMap.investment ? 'bg-white border-purple-300 text-purple-900' : 'bg-slate-50 border-slate-300 text-slate-700'
                      }`}
                    >
                      <option value="">(Unmapped ₦0)</option>
                      {mappings.filter(m => !m.isExcluded).map(m => (
                        <option key={m.rawHeader} value={m.rawHeader}>
                          {m.rawHeader}
                        </option>
                      ))}
                    </select>
                  </th>

                  {/* Loan Disbursement / Repayment Account */}
                  <th className="p-2.5 min-w-[140px] bg-rose-50/70 border-r border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-rose-950 font-black">LoanRem</span>
                      <span className="text-[9px] text-rose-800 font-mono font-bold">LOAN (₦)</span>
                    </div>
                    <select
                      value={fieldToHeaderMap.loanReimbursement || ''}
                      onChange={(e) => handleMapCanonicalFieldToHeader('loanReimbursement', e.target.value)}
                      className={`mt-1 w-full text-[9px] font-bold rounded px-1 py-0.5 outline-none border ${
                        fieldToHeaderMap.loanReimbursement ? 'bg-white border-rose-300 text-rose-900' : 'bg-slate-50 border-slate-300 text-slate-700'
                      }`}
                    >
                      <option value="">(Unmapped ₦0)</option>
                      {mappings.filter(m => !m.isExcluded).map(m => (
                        <option key={m.rawHeader} value={m.rawHeader}>
                          {m.rawHeader}
                        </option>
                      ))}
                    </select>
                  </th>

                  {/* Commodity Purchase Account */}
                  <th className="p-2.5 min-w-[140px] bg-amber-50/70 border-r border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-amber-950 font-black">CommPur</span>
                      <span className="text-[9px] text-amber-800 font-mono font-bold">CP (₦)</span>
                    </div>
                    <select
                      value={fieldToHeaderMap.commodityPurchase || ''}
                      onChange={(e) => handleMapCanonicalFieldToHeader('commodityPurchase', e.target.value)}
                      className={`mt-1 w-full text-[9px] font-bold rounded px-1 py-0.5 outline-none border ${
                        fieldToHeaderMap.commodityPurchase ? 'bg-white border-amber-300 text-amber-900' : 'bg-slate-50 border-slate-300 text-slate-700'
                      }`}
                    >
                      <option value="">(Unmapped ₦0)</option>
                      {mappings.filter(m => !m.isExcluded).map(m => (
                        <option key={m.rawHeader} value={m.rawHeader}>
                          {m.rawHeader}
                        </option>
                      ))}
                    </select>
                  </th>

                  {/* Muslim Community Account */}
                  <th className="p-2.5 min-w-[140px] bg-teal-50/70 border-r border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-teal-950 font-black">MusComm</span>
                      <span className="text-[9px] text-teal-800 font-mono font-bold">MCA (₦)</span>
                    </div>
                    <select
                      value={fieldToHeaderMap.muslimCommunity || ''}
                      onChange={(e) => handleMapCanonicalFieldToHeader('muslimCommunity', e.target.value)}
                      className={`mt-1 w-full text-[9px] font-bold rounded px-1 py-0.5 outline-none border ${
                        fieldToHeaderMap.muslimCommunity ? 'bg-white border-teal-300 text-teal-900' : 'bg-slate-50 border-slate-300 text-slate-700'
                      }`}
                    >
                      <option value="">(Unmapped ₦0)</option>
                      {mappings.filter(m => !m.isExcluded).map(m => (
                        <option key={m.rawHeader} value={m.rawHeader}>
                          {m.rawHeader}
                        </option>
                      ))}
                    </select>
                  </th>

                  {/* Total Deduction Column (SENT to Bursary) */}
                  <th className="p-2.5 min-w-[150px] bg-slate-200/90 border-r border-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-950 font-black">SENT (to Bursary)</span>
                      <span className="text-[9px] text-slate-700 font-mono font-bold">TOTAL (₦)</span>
                    </div>
                    <select
                      value={fieldToHeaderMap.total || ''}
                      onChange={(e) => handleMapCanonicalFieldToHeader('total', e.target.value)}
                      className={`mt-1 w-full text-[9px] font-bold rounded px-1 py-0.5 outline-none border ${
                        fieldToHeaderMap.total ? 'bg-white border-slate-400 text-slate-900' : 'bg-amber-50 border-amber-400 text-amber-900'
                      }`}
                    >
                      <option value="">(Auto-Sum Splits)</option>
                      {mappings.filter(m => !m.isExcluded).map(m => (
                        <option key={m.rawHeader} value={m.rawHeader}>
                          {m.rawHeader}
                        </option>
                      ))}
                    </select>
                  </th>

                  {/* Live Split Math & Disparity Status */}
                  <th className="p-3 min-w-[160px] border-r border-slate-200 text-center">
                    Disparity Status
                  </th>

                  {/* Next Month Recommendation */}
                  <th className="p-3 min-w-[170px] border-r border-slate-200 text-center bg-indigo-50/60 text-indigo-900">
                    Next Month Rec. (₦)
                  </th>

                  {/* Render extra unmapped raw columns */}
                  {extraUnmappedHeaders.map(extraHeader => (
                    <th key={extraHeader} className="p-3 min-w-[160px] bg-amber-100/50 border-r border-amber-200">
                      <div className="flex items-center justify-between gap-2">
                        <div className="truncate">
                          <span className="text-amber-950 font-bold block truncate" title={extraHeader}>
                            {extraHeader}
                          </span>
                          <span className="text-[8px] text-amber-700 uppercase tracking-widest font-black">
                            Extra Column
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteColumn(extraHeader)}
                          className="p-1 bg-rose-600 hover:bg-rose-700 text-white rounded-md transition shadow-xs shrink-0"
                          title={`Delete "${extraHeader}" column from file`}
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </th>
                  ))}

                  {/* Actions */}
                  <th className="p-3 w-12 text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 font-mono">
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={12 + extraUnmappedHeaders.length} className="p-12 text-center text-slate-400 font-sans">
                      No records matched the filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredRows.map(({ rowIndex, row, id, name, os, ss, inv, loan, cp, mc, actualSum, sentAmount, variance, varianceType, nextMonthRecommended, isMismatch }) => {
                    const dateHeader = fieldToHeaderMap.date;
                    const idHeader = fieldToHeaderMap.id;
                    const nameHeader = fieldToHeaderMap.name;
                    const osHeader = fieldToHeaderMap.ordinarySavings;
                    const ssHeader = fieldToHeaderMap.specialSavings;
                    const invHeader = fieldToHeaderMap.investment;
                    const loanHeader = fieldToHeaderMap.loanReimbursement;
                    const cpHeader = fieldToHeaderMap.commodityPurchase;
                    const mcHeader = fieldToHeaderMap.muslimCommunity;
                    const totalHeader = fieldToHeaderMap.total;

                    return (
                      <tr 
                        key={rowIndex} 
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isMismatch ? 'bg-rose-50/40' : ''
                        }`}
                      >
                        {/* Row Index */}
                        <td className="p-3 text-center text-slate-400 font-sans font-bold text-[11px]">
                          {rowIndex + 1}
                        </td>

                        {/* Deduction Date */}
                        <td className="p-2 border-r border-slate-100 font-sans">
                          {dateHeader ? (
                            <input
                              type="text"
                              value={row[dateHeader] !== undefined ? row[dateHeader] : ''}
                              onChange={(e) => handleCellChange(rowIndex, dateHeader, e.target.value)}
                              className={`w-full px-2 py-1 text-xs font-semibold text-slate-800 bg-transparent border border-transparent hover:border-slate-200 focus:border-emerald-500 focus:bg-white rounded outline-none transition ${
                                modifiedCellKeys.has(`${rowIndex}-${dateHeader}`) ? 'bg-indigo-50/50 border-indigo-200 font-bold' : ''
                              }`}
                              placeholder="YYYY-MM-DD"
                            />
                          ) : (
                            <span className="text-slate-400 italic text-[10px]">Auto / Default</span>
                          )}
                        </td>

                        {/* Member Name & ID */}
                        <td className="p-2 border-r border-slate-100 font-sans">
                          <div className="space-y-1">
                            {nameHeader ? (
                              <input
                                type="text"
                                value={row[nameHeader] !== undefined ? row[nameHeader] : ''}
                                onChange={(e) => handleCellChange(rowIndex, nameHeader, e.target.value)}
                                className={`w-full px-2 py-1 text-xs font-bold text-slate-900 bg-transparent border border-transparent hover:border-slate-200 focus:border-emerald-500 focus:bg-white rounded outline-none transition ${
                                  modifiedCellKeys.has(`${rowIndex}-${nameHeader}`) ? 'bg-indigo-50/50 border-indigo-200 font-extrabold' : ''
                                }`}
                                placeholder="Cooperator Name"
                              />
                            ) : (
                              <span className="text-slate-400 italic text-xs">No Name Column</span>
                            )}

                            {idHeader && (
                              <input
                                type="text"
                                value={row[idHeader] !== undefined ? row[idHeader] : ''}
                                onChange={(e) => handleCellChange(rowIndex, idHeader, e.target.value)}
                                className={`w-full px-2 py-0.5 text-[10px] font-mono text-slate-500 bg-transparent border border-transparent hover:border-slate-200 focus:border-emerald-500 focus:bg-white rounded outline-none transition ${
                                  modifiedCellKeys.has(`${rowIndex}-${idHeader}`) ? 'bg-indigo-50/50 border-indigo-200' : ''
                                }`}
                                placeholder="Staff ID"
                              />
                            )}
                          </div>
                        </td>

                        {/* Ordinary Savings Cell */}
                        <td className="p-2 border-r border-slate-100 bg-emerald-50/20">
                          {osHeader ? (
                            <input
                              type="text"
                              value={row[osHeader] !== undefined ? row[osHeader] : ''}
                              onChange={(e) => handleCellChange(rowIndex, osHeader, e.target.value)}
                              className={`w-full px-2 py-1.5 text-xs font-bold text-emerald-950 bg-transparent border border-transparent hover:border-emerald-300 focus:border-emerald-500 focus:bg-white rounded outline-none transition text-right ${
                                modifiedCellKeys.has(`${rowIndex}-${osHeader}`) ? 'bg-indigo-50 border-indigo-300' : ''
                              }`}
                            />
                          ) : (
                            <span className="text-slate-300 text-right block pr-2">₦0</span>
                          )}
                        </td>

                        {/* Special Savings Cell */}
                        <td className="p-2 border-r border-slate-100 bg-blue-50/20">
                          {ssHeader ? (
                            <input
                              type="text"
                              value={row[ssHeader] !== undefined ? row[ssHeader] : ''}
                              onChange={(e) => handleCellChange(rowIndex, ssHeader, e.target.value)}
                              className={`w-full px-2 py-1.5 text-xs font-bold text-blue-950 bg-transparent border border-transparent hover:border-blue-300 focus:border-blue-500 focus:bg-white rounded outline-none transition text-right ${
                                modifiedCellKeys.has(`${rowIndex}-${ssHeader}`) ? 'bg-indigo-50 border-indigo-300' : ''
                              }`}
                            />
                          ) : (
                            <span className="text-slate-300 text-right block pr-2">₦0</span>
                          )}
                        </td>

                        {/* Investment Account Cell */}
                        <td className="p-2 border-r border-slate-100 bg-purple-50/20">
                          {invHeader ? (
                            <input
                              type="text"
                              value={row[invHeader] !== undefined ? row[invHeader] : ''}
                              onChange={(e) => handleCellChange(rowIndex, invHeader, e.target.value)}
                              className={`w-full px-2 py-1.5 text-xs font-bold text-purple-950 bg-transparent border border-transparent hover:border-purple-300 focus:border-purple-500 focus:bg-white rounded outline-none transition text-right ${
                                modifiedCellKeys.has(`${rowIndex}-${invHeader}`) ? 'bg-indigo-50 border-indigo-300' : ''
                              }`}
                            />
                          ) : (
                            <span className="text-slate-300 text-right block pr-2">₦0</span>
                          )}
                        </td>

                        {/* Loan Disbursement / Repayment Cell */}
                        <td className="p-2 border-r border-slate-100 bg-rose-50/20">
                          {loanHeader ? (
                            <input
                              type="text"
                              value={row[loanHeader] !== undefined ? row[loanHeader] : ''}
                              onChange={(e) => handleCellChange(rowIndex, loanHeader, e.target.value)}
                              className={`w-full px-2 py-1.5 text-xs font-bold text-rose-950 bg-transparent border border-transparent hover:border-rose-300 focus:border-rose-500 focus:bg-white rounded outline-none transition text-right ${
                                modifiedCellKeys.has(`${rowIndex}-${loanHeader}`) ? 'bg-indigo-50 border-indigo-300' : ''
                              }`}
                            />
                          ) : (
                            <span className="text-slate-300 text-right block pr-2">₦0</span>
                          )}
                        </td>

                        {/* Commodity Purchase Cell */}
                        <td className="p-2 border-r border-slate-100 bg-amber-50/20">
                          {cpHeader ? (
                            <input
                              type="text"
                              value={row[cpHeader] !== undefined ? row[cpHeader] : ''}
                              onChange={(e) => handleCellChange(rowIndex, cpHeader, e.target.value)}
                              className={`w-full px-2 py-1.5 text-xs font-bold text-amber-950 bg-transparent border border-transparent hover:border-amber-300 focus:border-amber-500 focus:bg-white rounded outline-none transition text-right ${
                                modifiedCellKeys.has(`${rowIndex}-${cpHeader}`) ? 'bg-indigo-50 border-indigo-300' : ''
                              }`}
                            />
                          ) : (
                            <span className="text-slate-300 text-right block pr-2">₦0</span>
                          )}
                        </td>

                        {/* Muslim Community Account Cell */}
                        <td className="p-2 border-r border-slate-100 bg-teal-50/20">
                          {mcHeader ? (
                            <input
                              type="text"
                              value={row[mcHeader] !== undefined ? row[mcHeader] : ''}
                              onChange={(e) => handleCellChange(rowIndex, mcHeader, e.target.value)}
                              className={`w-full px-2 py-1.5 text-xs font-bold text-teal-950 bg-transparent border border-transparent hover:border-teal-300 focus:border-teal-500 focus:bg-white rounded outline-none transition text-right ${
                                modifiedCellKeys.has(`${rowIndex}-${mcHeader}`) ? 'bg-indigo-50 border-indigo-300' : ''
                              }`}
                            />
                          ) : (
                            <span className="text-slate-300 text-right block pr-2">₦0</span>
                          )}
                        </td>

                        {/* Gross Total Deduction (SENT) */}
                        <td className="p-2 border-r border-slate-200 bg-slate-100/50">
                          {totalHeader ? (
                            <input
                              type="text"
                              value={row[totalHeader] !== undefined ? row[totalHeader] : ''}
                              onChange={(e) => handleCellChange(rowIndex, totalHeader, e.target.value)}
                              className={`w-full px-2 py-1.5 text-xs font-black text-slate-900 bg-transparent border border-transparent hover:border-slate-300 focus:border-emerald-500 focus:bg-white rounded outline-none transition text-right ${
                                modifiedCellKeys.has(`${rowIndex}-${totalHeader}`) ? 'bg-indigo-50 border-indigo-300' : ''
                              }`}
                            />
                          ) : (
                            <span className="text-xs font-black text-slate-900 text-right block pr-2">
                              ₦{actualSum.toLocaleString()}
                            </span>
                          )}
                        </td>

                        {/* Disparity Status Badge */}
                        <td className="p-3 border-r border-slate-100 text-center font-sans">
                          {varianceType === 'shortfall' ? (
                            <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-100 text-rose-800 rounded-lg text-[10px] font-black uppercase">
                              <ArrowDownRight size={12} className="text-rose-700" />
                              Shortfall -₦{Math.abs(variance).toLocaleString()}
                            </div>
                          ) : varianceType === 'surplus' ? (
                            <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg text-[10px] font-black uppercase">
                              <ArrowUpRight size={12} className="text-amber-700" />
                              Surplus +₦{variance.toLocaleString()}
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-[10px] font-black uppercase">
                              <CheckCircle2 size={11} className="text-emerald-700" />
                              Balanced ₦0
                            </div>
                          )}
                        </td>

                        {/* Next Month Recommendation */}
                        <td className="p-2 border-r border-slate-100 bg-indigo-50/30 text-right font-sans">
                          <span className="text-xs font-black text-indigo-950 block">
                            ₦{nextMonthRecommended.toLocaleString()}
                          </span>
                          <span className="text-[9px] text-indigo-700/80 font-medium block">
                            {variance !== 0 ? (variance < 0 ? '+Rollover Shortfall' : '-Credit Offset') : 'Standard Recurrent'}
                          </span>
                        </td>

                        {/* Extra Unmapped Columns */}
                        {extraUnmappedHeaders.map(extraHeader => (
                          <td key={extraHeader} className="p-2 border-r border-amber-100 bg-amber-50/20">
                            <input
                              type="text"
                              value={row[extraHeader] !== undefined ? row[extraHeader] : ''}
                              onChange={(e) => handleCellChange(rowIndex, extraHeader, e.target.value)}
                              className="w-full px-2 py-1 text-xs text-slate-700 bg-transparent border border-transparent hover:border-amber-300 focus:border-amber-500 focus:bg-white rounded outline-none transition"
                            />
                          </td>
                        ))}

                        {/* Row Action */}
                        <td className="p-2 text-center">
                          <button
                            onClick={() => handleDeleteRow(rowIndex)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete this row"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <span>
              Showing {filteredRows.length} of {sanitizedRows.length} total member deduction records in sheet <strong>{activeSheetName}</strong>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleAutoBalanceSplits}
                className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1"
              >
                <Sparkles size={13} /> Fix math discrepancies automatically
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: DISPARITY & VARIANCE INSPECTOR CENTER */}
      {activeView === 'disparity_inspector' && (
        <div className="space-y-6">
          {/* Disparity Overview Banner */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-850 text-white rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full text-[10px] font-black uppercase tracking-wider">
                  Disparity & Next-Month Bursary Schedule
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Sheet: {activeSheetName}
                </span>
              </div>
              <h3 className="text-2xl lg:text-3xl font-black font-headline tracking-tight text-white">
                Bursary Disparity & Rollover Specification
              </h3>
              <p className="text-xs lg:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
                When bursary deduction files arrive, differences between the expected deduction sent to the bursary and the actual amounts collected must be accurately flagged. These rollover shortfalls are calculated automatically to send back to the bursary for the following month.
              </p>

              {/* 4 Large Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-300">
                    Total Sent to Bursary
                  </span>
                  <p className="text-xl font-black text-white mt-1">
                    ₦{accountTotals.totalSentToBursary.toLocaleString()}
                  </p>
                  <span className="text-[10px] text-emerald-400 font-medium">Expected Ingestion</span>
                </div>

                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-300">
                    Actual Itemized Sum
                  </span>
                  <p className="text-xl font-black text-white mt-1">
                    ₦{accountTotals.totalSplitSum.toLocaleString()}
                  </p>
                  <span className="text-[10px] text-blue-400 font-medium">Split across 6 accounts</span>
                </div>

                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-300">
                    Net Disparity Variance
                  </span>
                  <p className={`text-xl font-black mt-1 ${
                    accountTotals.totalDisparityVariance === 0 ? 'text-emerald-400' :
                    accountTotals.totalDisparityVariance < 0 ? 'text-rose-400' : 'text-amber-400'
                  }`}>
                    ₦{accountTotals.totalDisparityVariance.toLocaleString()}
                  </p>
                  <span className="text-[10px] text-slate-300 font-medium">
                    {accountTotals.shortfallCount} shortfalls • {accountTotals.surplusCount} surpluses
                  </span>
                </div>

                <div className="bg-emerald-500/20 backdrop-blur-md p-4 rounded-2xl border border-emerald-500/30">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-300">
                    Next Month Rec. Sum
                  </span>
                  <p className="text-xl font-black text-emerald-200 mt-1">
                    ₦{(accountTotals.totalSentToBursary + (accountTotals.totalDisparityVariance < 0 ? Math.abs(accountTotals.totalDisparityVariance) : 0)).toLocaleString()}
                  </p>
                  <span className="text-[10px] text-emerald-300 font-medium">Ready for Bursary export</span>
                </div>
              </div>

              {/* Action Buttons in Dark Banner */}
              <div className="flex flex-wrap items-center gap-3 mt-6 pt-6 border-t border-white/10">
                <button
                  onClick={() => handleExportNextMonthSchedule('xlsx')}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-2 shadow-lg shadow-emerald-950/30"
                >
                  <Download size={15} />
                  Download Next Month Bursary Schedule (.xlsx)
                </button>
                <button
                  onClick={() => handleExportNextMonthSchedule('csv')}
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-2 border border-white/15"
                >
                  <FileSpreadsheet size={15} />
                  Download CSV (.csv)
                </button>
              </div>
            </div>
          </div>

          {/* Detailed Disparity Table */}
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 lg:p-8 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-lg font-black text-slate-900 font-headline">
                  Cooperator Disparity & Adjustment Breakdown
                </h4>
                <p className="text-xs text-slate-500">
                  Detailed individual disparity breakdown for every cooperator in this cycle.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    statusFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  All ({cooperatorDisparityList.length})
                </button>
                <button
                  onClick={() => setStatusFilter('disparity')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                    statusFilter === 'disparity' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-rose-700'
                  }`}
                >
                  Disparities Only ({accountTotals.shortfallCount + accountTotals.surplusCount})
                </button>
                <button
                  onClick={() => setStatusFilter('valid')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    statusFilter === 'valid' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-emerald-700'
                  }`}
                >
                  Balanced ({cooperatorDisparityList.length - (accountTotals.shortfallCount + accountTotals.surplusCount)})
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs min-w-[850px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="p-3">#</th>
                    <th className="p-3">Cooperator Name & Staff ID</th>
                    <th className="p-3 text-right">SENT (to Bursary)</th>
                    <th className="p-3 text-right">Actual Deducted Sum</th>
                    <th className="p-3 text-center">Disparity / Variance</th>
                    <th className="p-3 text-right bg-indigo-50/50 text-indigo-900">Next Month Recommended</th>
                    <th className="p-3">Instruction Note for Bursary</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {filteredRows.map((item, idx) => {
                    return (
                      <tr 
                        key={item.rowIndex} 
                        className={`hover:bg-slate-50 transition-colors ${
                          item.varianceType !== 'exact' ? 'bg-rose-50/30' : ''
                        }`}
                      >
                        <td className="p-3 text-slate-400 font-sans text-[11px] font-bold">
                          {idx + 1}
                        </td>
                        <td className="p-3 font-sans">
                          <p className="font-extrabold text-slate-900 text-xs">{item.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{item.id}</p>
                        </td>
                        <td className="p-3 text-right font-bold text-slate-800">
                          ₦{item.sentAmount.toLocaleString()}
                        </td>
                        <td className="p-3 text-right font-bold text-slate-900">
                          ₦{item.actualSum.toLocaleString()}
                        </td>
                        <td className="p-3 text-center">
                          {item.varianceType === 'shortfall' ? (
                            <span className="px-2.5 py-1 bg-rose-100 text-rose-800 text-[10px] font-black rounded-lg uppercase inline-flex items-center gap-1">
                              <ArrowDownRight size={11} /> Shortfall -₦{Math.abs(item.variance).toLocaleString()}
                            </span>
                          ) : item.varianceType === 'surplus' ? (
                            <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-[10px] font-black rounded-lg uppercase inline-flex items-center gap-1">
                              <ArrowUpRight size={11} /> Surplus +₦{item.variance.toLocaleString()}
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-lg uppercase inline-flex items-center gap-1">
                              <CheckCircle2 size={11} /> Balanced ₦0
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right bg-indigo-50/30 font-sans">
                          <p className="text-xs font-black text-indigo-950 font-mono">
                            ₦{item.nextMonthRecommended.toLocaleString()}
                          </p>
                          <p className="text-[9px] text-indigo-700 font-sans font-semibold">
                            {item.variance < 0 ? '+₦' + Math.abs(item.variance).toLocaleString() + ' shortfall' : item.variance > 0 ? '-₦' + item.variance.toLocaleString() + ' surplus' : 'Recurrent'}
                          </p>
                        </td>
                        <td className="p-3 font-sans text-xs text-slate-600 max-w-xs leading-normal">
                          {item.nextMonthAdjustmentNote}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: ACCOUNT DISTRIBUTION MATRIX (6-Way Passbook Split) */}
      {activeView === 'account_distribution' && (
        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 lg:p-8 shadow-sm space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 text-[10px] font-black uppercase tracking-wider rounded-md">
                Passbook Sub-Ledger Matrix
              </span>
              <span className="text-xs text-slate-400 font-mono font-medium">{activeSheetName}</span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight mt-1 font-headline">
              6-Way Member Passbook Allocation
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Visualize how every contributor's gross salary deduction is split into their respective cooperative passbook sub-accounts.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs min-w-[900px]">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="p-3">#</th>
                  <th className="p-3">Cooperator</th>
                  <th className="p-3 text-right bg-emerald-50 text-emerald-900">Ordinary Savings</th>
                  <th className="p-3 text-right bg-blue-50 text-blue-900">Special Savings</th>
                  <th className="p-3 text-right bg-purple-50 text-purple-900">Investment</th>
                  <th className="p-3 text-right bg-rose-50 text-rose-900">Loan Repayment</th>
                  <th className="p-3 text-right bg-amber-50 text-amber-900">Commodity</th>
                  <th className="p-3 text-right bg-teal-50 text-teal-900">Muslim Community</th>
                  <th className="p-3 text-right bg-slate-200 text-slate-900">Gross Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {cooperatorDisparityList.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-3 text-slate-400 font-sans">{idx + 1}</td>
                    <td className="p-3 font-sans">
                      <span className="font-extrabold text-slate-900 block">{item.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{item.id}</span>
                    </td>
                    <td className="p-3 text-right bg-emerald-50/30 text-emerald-950 font-bold">₦{item.os.toLocaleString()}</td>
                    <td className="p-3 text-right bg-blue-50/30 text-blue-950 font-bold">₦{item.ss.toLocaleString()}</td>
                    <td className="p-3 text-right bg-purple-50/30 text-purple-950 font-bold">₦{item.inv.toLocaleString()}</td>
                    <td className="p-3 text-right bg-rose-50/30 text-rose-950 font-bold">₦{item.loan.toLocaleString()}</td>
                    <td className="p-3 text-right bg-amber-50/30 text-amber-950 font-bold">₦{item.cp.toLocaleString()}</td>
                    <td className="p-3 text-right bg-teal-50/30 text-teal-950 font-bold">₦{item.mc.toLocaleString()}</td>
                    <td className="p-3 text-right bg-slate-100/60 text-slate-900 font-black">₦{item.actualSum.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-900 text-white font-mono font-black text-xs">
                  <td className="p-3 text-center" colSpan={2}>TOTALS ({cooperatorDisparityList.length} Members)</td>
                  <td className="p-3 text-right text-emerald-400">₦{accountTotals.totalOrdinarySavings.toLocaleString()}</td>
                  <td className="p-3 text-right text-blue-400">₦{accountTotals.totalSpecialSavings.toLocaleString()}</td>
                  <td className="p-3 text-right text-purple-400">₦{accountTotals.totalInvestment.toLocaleString()}</td>
                  <td className="p-3 text-right text-rose-400">₦{accountTotals.totalLoanRepayment.toLocaleString()}</td>
                  <td className="p-3 text-right text-amber-400">₦{accountTotals.totalCommodity.toLocaleString()}</td>
                  <td className="p-3 text-right text-teal-400">₦{accountTotals.totalMuslimCommunity.toLocaleString()}</td>
                  <td className="p-3 text-right text-emerald-300">₦{accountTotals.totalSplitSum.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 4: COLUMN STRUCTURE & DESTINATION RULES */}
      {activeView === 'column_config' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Layers size={16} className="text-emerald-600" />
              Spreadsheet Column Definitions & Destinations ({mappings.length})
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              Map file headers to the 6 individual ZIMCO account destinations or exclude unneeded columns
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {mappings.map((mapping, idx) => {
              const isExcluded = mapping.isExcluded || mapping.mappedField === 'excluded';
              const isUnmapped = !isExcluded && mapping.mappedField === 'unmapped';
              const selectedCanonical = CANONICAL_FIELD_OPTIONS.find(o => o.field === mapping.mappedField);

              return (
                <div 
                  key={mapping.rawHeader}
                  className={`rounded-[2rem] p-6 border transition-all flex flex-col justify-between ${
                    isExcluded
                      ? 'bg-slate-50/70 border-slate-200/80 opacity-70'
                      : isUnmapped
                      ? 'bg-amber-50/30 border-amber-300 shadow-sm ring-1 ring-amber-300/50'
                      : 'bg-white border-slate-200 shadow-sm hover:border-emerald-300'
                  }`}
                >
                  <div>
                    {/* Header Top */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                          Column #{idx + 1}
                        </span>
                        <h4 className="text-base font-extrabold text-slate-900 truncate max-w-[200px]" title={mapping.rawHeader}>
                          {mapping.rawHeader}
                        </h4>
                      </div>

                      <div>
                        {isExcluded ? (
                          <span className="px-2.5 py-1 bg-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-wider rounded-lg flex items-center gap-1">
                            <Trash2 size={11} /> Excluded / Deleted
                          </span>
                        ) : isUnmapped ? (
                          <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wider rounded-lg flex items-center gap-1">
                            <AlertTriangle size={11} /> Unmapped
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider rounded-lg flex items-center gap-1">
                            <Check size={11} /> Mapped to Account
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Sample values preview */}
                    <div className="bg-slate-50 rounded-xl p-3 mb-4 border border-slate-100 text-[11px]">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Sample Values:
                      </span>
                      {mapping.sampleValues.length > 0 ? (
                        <div className="space-y-0.5 font-mono text-slate-700">
                          {mapping.sampleValues.map((val, sIdx) => (
                            <div key={sIdx} className="truncate text-[11px]">
                              • <span className="font-semibold">{val}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Empty sample data</span>
                      )}
                    </div>

                    {/* Mapping Dropdown Selector */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold text-slate-700">
                        Destination Account Field:
                      </label>
                      <select
                        value={isExcluded ? 'excluded' : mapping.mappedField}
                        onChange={(e) => handleFieldChange(mapping.rawHeader, e.target.value as any)}
                        className={`w-full text-xs font-bold rounded-xl p-3 outline-none border transition-all ${
                          isExcluded 
                            ? 'bg-slate-100 border-slate-300 text-slate-500' 
                            : isUnmapped
                            ? 'bg-white border-amber-400 text-amber-900 focus:ring-2 focus:ring-amber-400'
                            : 'bg-white border-emerald-400 text-slate-800 focus:ring-2 focus:ring-emerald-500'
                        }`}
                      >
                        <option value="unmapped">⚠️ -- Select / Unmapped (Requires Action) --</option>
                        <optgroup label="Core Individual Accounts">
                          {CANONICAL_FIELD_OPTIONS.map(opt => (
                            <option key={opt.field} value={opt.field}>
                              {opt.label} {opt.required ? '(Mandatory)' : ''}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="Column Action">
                          <option value="excluded">❌ Exclude / Delete Column from Pipeline</option>
                        </optgroup>
                      </select>

                      {selectedCanonical && !isExcluded && (
                        <p className="text-[10px] text-slate-400 mt-1 italic leading-normal">
                          {selectedCanonical.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    {isExcluded ? (
                      <button
                        onClick={() => handleRestoreColumn(mapping.rawHeader)}
                        className="w-full py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition"
                      >
                        <RotateCcw size={13} />
                        Restore Column
                      </button>
                    ) : (
                      <button
                        onClick={() => handleDeleteColumn(mapping.rawHeader)}
                        className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition"
                      >
                        <Trash2 size={13} />
                        Delete / Exclude Column
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Strict Pre-Flight Normalization Gate Modal */}
      <AnimatePresence>
        {showPreflightAlert && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2.5rem] max-w-lg w-full p-8 shadow-2xl border border-rose-100 relative"
            >
              <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-6">
                <ShieldAlert className="w-8 h-8" />
              </div>

              <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-black uppercase tracking-wider rounded-md">
                Sanitization Gate Checkpoint
              </span>

              <h3 className="text-2xl font-black text-slate-900 tracking-tight mt-1 font-headline">
                Undeleted Non-Ledger Columns
              </h3>

              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                To maintain flawless member account ledgers, all non-account columns must either be deleted or mapped before injection.
              </p>

              <div className="my-5 p-4 bg-rose-50 rounded-2xl border border-rose-100 text-xs">
                <p className="font-extrabold text-rose-900 uppercase tracking-wider text-[10px] mb-2">
                  The following {unresolvedList.length} column(s) are unmapped:
                </p>
                <div className="flex flex-wrap gap-2">
                  {unresolvedList.map(col => (
                    <span key={col} className="px-2.5 py-1 bg-white border border-rose-200 text-rose-800 font-mono font-bold text-[11px] rounded-lg">
                      {col}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={handleAutoExcludeAndProceed}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-700/20 transition flex items-center justify-center gap-2"
                >
                  <CheckSquare size={16} />
                  Delete Extra Columns & Inject
                </button>
                <button
                  onClick={() => setShowPreflightAlert(false)}
                  className="py-3 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold uppercase tracking-wider transition"
                >
                  Review Manually
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
