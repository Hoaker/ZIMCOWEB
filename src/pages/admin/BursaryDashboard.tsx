import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileSpreadsheet, 
  DownloadCloud, 
  RefreshCcw, 
  Settings as SettingsIcon, 
  Search, 
  Filter, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Sparkles, 
  LogOut, 
  ShieldCheck, 
  Calendar,
  TrendingUp,
  CreditCard,
  Building,
  User,
  Sliders,
  BellRing,
  FileText,
  Upload,
  ArrowRight,
  Wallet,
  Landmark,
  ShoppingBag,
  ArrowUpDown,
  History,
  CheckCircle,
  Clock,
  Menu,
  Maximize2,
  Minimize2,
  Send,
  SendHorizontal,
  FileCheck2,
  Database,
  Scale,
  AlertOctagon,
  Users,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { collection, getDocs, doc, writeBatch } from 'firebase/firestore';
import zimcoLogo from '@/assets/images/zimco_logo_1780347665840.png';
import SessionTimeoutListener from '../../components/SessionTimeoutListener';
import { 
  parseSpreadsheetBuffer, 
  exportNormalizedSpreadsheet, 
  generateSampleRawSheet, 
  extractCycleMonthYear,
  ParsedRawSheet, 
  NormalizedDeductionRecord 
} from '../../lib/deductionNormalizer';
import DynamicNormalizationWorkbench from '../../components/DynamicNormalizationWorkbench';
import SampleExcelTestModal from '../../components/SampleExcelTestModal';
import NewMembersCredentialModal, { NewMemberCredential } from '../../components/NewMembersCredentialModal';
import DatabaseReconciliationCheck from '../../components/DatabaseReconciliationCheck';
import BursaryNextMonthDispatch from '../../components/BursaryNextMonthDispatch';
import AdminMemberDirectory from '../../components/AdminMemberDirectory';
import { SAMPLE_TEST_FILES } from '../../lib/sampleSpreadsheets';

interface DeductionRecord {
  id: string;
  name: string;
  date?: string;
  ordinarySavings: number;
  specialSavings: number;
  investment: number;
  commodityPurchase: number;
  loanReimbursement: number;
  muslimCommunity?: number;
  total: number;
  status?: 'valid' | 'warning' | 'error';
  message?: string;
  isModified?: boolean;
  originalValues?: {
    ordinarySavings: number;
    specialSavings: number;
    investment: number;
    commodityPurchase: number;
    loanReimbursement: number;
    muslimCommunity?: number;
  };
}

interface ReconciliationItem {
  id: string;
  memberName: string;
  staffId: string;
  expectedAmount: number;
  statementAmount: number;
  status: 'matched' | 'mismatch' | 'pending';
  depositorName: string;
  paymentRef: string;
}

export default function BursaryDashboard() {
  const navigate = useNavigate();
  
  // Custom sidebar active tab state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'import' | 'export' | 'reconcile' | 'bursary_dispatch' | 'members' | 'settings'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('zimco_bursary_sidebar_collapsed') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('zimco_bursary_sidebar_collapsed', isSidebarCollapsed ? 'true' : 'false');
  }, [isSidebarCollapsed]);

  // Dynamic Ingestion & Normalization states
  const [importWorkflowStage, setImportWorkflowStage] = useState<'review' | 'normalization'>('review');
  const [parsedRawSheet, setParsedRawSheet] = useState<ParsedRawSheet | null>(null);
  const [showSampleModal, setShowSampleModal] = useState(false);

  // Firestore integration states
  const [firestoreMembers, setFirestoreMembers] = useState<any[]>([]);
  const [loadingFirestore, setLoadingFirestore] = useState(false);

  // Core deduction sheets state
  const [activeMonth, setActiveMonth] = useState('June 2026');
  const [importedRecords, setImportedRecords] = useState<DeductionRecord[]>([]);
  const [isImported, setIsImported] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [diagnosticFilter, setDiagnosticFilter] = useState<'all' | 'error' | 'warning' | 'valid'>('all');
  const [editingRow, setEditingRow] = useState<DeductionRecord | null>(null);
  const [isDeductionsTableExpanded, setIsDeductionsTableExpanded] = useState(false);
  const [isReconTableExpanded, setIsReconTableExpanded] = useState(false);
  const [isNextMonthTableExpanded, setIsNextMonthTableExpanded] = useState(false);

  // Modification & Export tracking
  const [modifiedRecords, setModifiedRecords] = useState<DeductionRecord[]>([]);
  const [revertOnNextMonth, setRevertOnNextMonth] = useState(true);
  const [zeroOutCommodityNextMonth, setZeroOutCommodityNextMonth] = useState(true);
  const [zeroOutLoansNextMonth, setZeroOutLoansNextMonth] = useState(true);

  // Push to members dashboards state
  const [pushStatus, setPushStatus] = useState<'idle' | 'pushing' | 'success' | 'error'>('idle');
  const [pushProgress, setPushProgress] = useState(0);
  const [toastNotification, setToastNotification] = useState<{message: string; type: 'success' | 'warning' | 'error'} | null>(null);

  // Newly Provisioned Members credentials state & follow-up interface
  const [newlyProvisionedMembers, setNewlyProvisionedMembers] = useState<NewMemberCredential[]>([]);
  const [showNewMembersModal, setShowNewMembersModal] = useState(false);

  // Reconciliation state
  const [reconciliationList, setReconciliationList] = useState<ReconciliationItem[]>([]);
  const [reconciliationStats, setReconciliationStats] = useState({ totalExpected: 0, totalCleared: 0, status: 'Pending' });
  const [isAutoMatching, setIsAutoMatching] = useState(false);

  // Settings state
  const [ordinarySavingsCeiling, setOrdinarySavingsCeiling] = useState(250000);
  const [specialSavingsCeiling, setSpecialSavingsCeiling] = useState(150000);
  const [autoReconciliationTolerance, setAutoReconciliationTolerance] = useState(0);
  const [lockoutDate, setLockoutDate] = useState('25');
  const [notificationSms, setNotificationSms] = useState(true);
  const [notificationEmail, setNotificationEmail] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch real users from Firestore on mount
  useEffect(() => {
    const fetchMembers = async () => {
      setLoadingFirestore(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const membersList: any[] = [];
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          membersList.push({
            ...data,
            docId: docSnap.id,
            firestoreDocId: docSnap.id,
            id: data.id || docSnap.id,
            uid: data.uid || docSnap.id,
            memberId: data.memberId || data.id || docSnap.id,
          });
        });
        setFirestoreMembers(membersList);
        // Clean initial state: no dummy deduction records until user imports workbook
        setImportedRecords([]);
        setIsImported(false);
      } catch (err) {
        console.error("Error fetching Firestore members in Bursary Dashboard:", err);
        setFirestoreMembers([]);
        setImportedRecords([]);
        setIsImported(false);
        handleFirestoreError(err, OperationType.LIST, 'users');
      } finally {
        setLoadingFirestore(false);
      }
    };
    fetchMembers();
  }, []);

  // Initialize statement list for reconciliation
  useEffect(() => {
    if (importedRecords.length > 0) {
      const items: ReconciliationItem[] = importedRecords.map((r, idx) => {
        const matchesNameSim = r.name.split(' ')[0] || '';
        return {
          id: `tx-rec-${idx}`,
          memberName: r.name,
          staffId: r.id,
          expectedAmount: r.ordinarySavings + r.specialSavings + r.investment + r.commodityPurchase + r.loanReimbursement + (r.muslimCommunity || 0),
          statementAmount: 0, // Unmatched initially
          status: 'pending',
          depositorName: `${r.name.toUpperCase()} TRF`,
          paymentRef: `FT2619000${120 + idx}`
        };
      });
      setReconciliationList(items);
    }
  }, [isImported]);

  const showToast = (message: string, type: 'success' | 'warning' | 'error' | 'info' = 'success') => {
    setToastNotification({ message, type });
    setTimeout(() => {
      setToastNotification(null);
    }, 4000);
  };

  const handleLogout = () => {
    navigate('/portal');
  };

  // Drag and drop / file import simulation
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleDownloadTemplate = () => {
    const csvContent = [
      ['Member ID', 'Full Name', 'Ordinary Savings (₦)', 'Special Savings (₦)', 'Investment (₦)', 'Commodity Purchase (₦)', 'Muslim Community Account (₦)', 'Credit Reimbursement (₦)', 'Aggregated Sum (₦)'],
      ['ZIM-2026-001', 'Amao Abdulhameed', '150000', '80000', '500000', '0', '10000', '0', '740000'],
      ['ZIM-2026-002', 'Olawale Johnson', '350000', '40000', '200000', '0', '0', '0', '590000'], // Exceeds ceiling limits (limit mismatch error)
      ['ZIM-2026-003', 'Sarah Williams', '120000', '60000', '150000', '0', '15000', '0', '345000'],
      ['ZIM-2026-004', 'Ibrahim Musa', '50000', '25000', '0', '0', '5000', '0', '5000'], // Sum total mismatch (math error)
      ['ZIM-2026-005', 'Chinelo Obi', '200000', '100000', '1000000', '0', '0', '0', '1300000']
    ].map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'zimco_monthly_deductions_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Monthly deduction CSV template downloaded!', 'success');
  };

  // One-click testing: load sample multi-column spreadsheet with extra non-ledger columns
  const handleLoadSampleMultiColumnPayroll = () => {
    setIsParsing(true);
    setTimeout(() => {
      const sampleSheet = generateSampleRawSheet();
      setParsedRawSheet(sampleSheet);
      setImportWorkflowStage('normalization');
      setIsParsing(false);
      showToast(`Loaded sample payroll "${sampleSheet.fileName}" with 13 detected columns!`, 'success');
    }, 400);
  };

  // Dynamic Excel/CSV Parser with dynamic column discovery
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setIsParsing(true);
      showToast(`Selected "${file.name}". Extracting dynamic columns...`, 'success');

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const buffer = event.target?.result as ArrayBuffer;
          if (!buffer) {
            throw new Error('Empty file content');
          }

          const parsed = parseSpreadsheetBuffer(buffer, file.name);
          setParsedRawSheet(parsed);
          setImportWorkflowStage('normalization');
          setIsParsing(false);
          showToast(`Extracted ${parsed.rawHeaders.length} columns from ${parsed.fileName}. Opening Normalization Workbench.`, 'success');
        } catch (error: any) {
          console.error('Error parsing spreadsheet file:', error);
          setIsParsing(false);
          showToast(`Error parsing file: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
        }
      };

      reader.onerror = () => {
        setIsParsing(false);
        showToast('Error reading spreadsheet file', 'error');
      };

      reader.readAsArrayBuffer(file);
    }
  };

  // Helper to extract surname in lowercase from cooperator full name
  const extractSurname = (fullName: string): string => {
    if (!fullName) return 'member';
    const cleaned = fullName.trim();
    // Support "ABAS, Sharafat T." format
    if (cleaned.includes(',')) {
      const partBeforeComma = cleaned.split(',')[0].trim();
      const cleanSurname = partBeforeComma.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      if (cleanSurname) return cleanSurname;
    }
    const parts = cleaned.split(/\s+/).filter(Boolean);
    const firstWord = parts[0]?.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    return firstWord || 'member';
  };

  // Helper to identify newly introduced members from imported deduction records
  const identifyNewMembers = (records: DeductionRecord[], existingMembersList: any[]): NewMemberCredential[] => {
    const newItems: NewMemberCredential[] = [];

    records.forEach((record) => {
      const recordNameClean = (record.name || '').trim().toLowerCase();
      const recordIdClean = (record.id || '').trim().toUpperCase();

      const exists = existingMembersList.some(u => {
        const uDocId = (u.docId || u.firestoreDocId || '').toUpperCase();
        const uId = (u.id || u.memberId || u.uid || '').toUpperCase();
        const uUid = (u.uid || '').toUpperCase();
        const uName = (u.fullName || u.name || '').toLowerCase();
        return (recordIdClean && (uDocId === recordIdClean || uId === recordIdClean || uUid === recordIdClean)) || (recordNameClean && uName === recordNameClean);
      });

      if (!exists) {
        const surname = extractSurname(record.name);
        const assignedId = record.id && record.id.startsWith('ZIM-') 
          ? record.id 
          : `ZIM-2026-${String(existingMembersList.length + newItems.length + 1).padStart(3, '0')}`;
        
        newItems.push({
          id: assignedId,
          name: record.name,
          surname: surname,
          email: `member_${assignedId.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}@zimco.org`,
          initialDeduction: record.total || 0,
          ordinarySavings: record.ordinarySavings || 0,
          specialSavings: record.specialSavings || 0,
          investment: record.investment || 0,
          commodityPurchase: record.commodityPurchase || 0,
          loanReimbursement: record.loanReimbursement || 0,
          muslimCommunity: record.muslimCommunity || 0,
          dateImported: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          status: 'Ready'
        });
      }
    });

    return newItems;
  };

  // Called when Dynamic Normalization Workbench successfully sanitizes and normalizes the spreadsheet
  const handleNormalizationComplete = (normalizedList: NormalizedDeductionRecord[]) => {
    const auditedRecords: DeductionRecord[] = normalizedList.map(item => {
      const baseRecord: DeductionRecord = {
        id: item.id,
        name: item.name,
        date: item.date,
        ordinarySavings: item.ordinarySavings,
        specialSavings: item.specialSavings,
        investment: item.investment,
        commodityPurchase: item.commodityPurchase,
        loanReimbursement: item.loanReimbursement,
        muslimCommunity: item.muslimCommunity,
        total: item.total
      };
      return reAuditRecord(baseRecord);
    });

    // Auto-sync deduction cycle month if date column was specified
    if (normalizedList.length > 0 && normalizedList[0].date) {
      const cyclePeriod = extractCycleMonthYear(normalizedList[0].date);
      if (cyclePeriod) {
        setActiveMonth(cyclePeriod);
      }
    }

    setImportedRecords(auditedRecords);
    setIsImported(true);
    setImportWorkflowStage('review');

    // Detect new members that are not in the current Firestore / Database register
    const newMembersFound = identifyNewMembers(auditedRecords, firestoreMembers);
    setNewlyProvisionedMembers(newMembersFound);

    const errCount = auditedRecords.filter(r => r.status === 'error').length;
    const warnCount = auditedRecords.filter(r => r.status === 'warning').length;

    if (errCount > 0 || warnCount > 0) {
      showToast(`Ingested ${auditedRecords.length} records (${newMembersFound.length} new members identified). ${errCount} mathematical errors flagged.`, 'warning');
    } else {
      if (newMembersFound.length > 0) {
        showToast(`Normalized ${auditedRecords.length} records. Found ${newMembersFound.length} new members ready to be provisioned!`, 'success');
      } else {
        showToast(`Successfully normalized and verified ${auditedRecords.length} society records!`, 'success');
      }
    }
  };

  // Diagnostic rule evaluation code
  const reAuditRecord = (row: DeductionRecord): DeductionRecord => {
    const sum = Number(row.ordinarySavings) + Number(row.specialSavings) + Number(row.investment) + Number(row.commodityPurchase) + Number(row.loanReimbursement) + Number(row.muslimCommunity || 0);
    
    // Check ordinary savings ceiling limit
    if (Number(row.ordinarySavings) > ordinarySavingsCeiling) {
      return {
        ...row,
        status: 'error',
        message: `LIMIT MISMATCH: Ordinary Savings ₦${Number(row.ordinarySavings).toLocaleString()} exceeds ceiling threshold limits (₦${ordinarySavingsCeiling.toLocaleString()}).`
      };
    }

    // Check special savings ceiling limit
    if (Number(row.specialSavings) > specialSavingsCeiling) {
      return {
        ...row,
        status: 'error',
        message: `LIMIT MISMATCH: Special Savings ₦${Number(row.specialSavings).toLocaleString()} exceeds ceiling threshold limits (₦${specialSavingsCeiling.toLocaleString()}).`
      };
    }

    // Check total match
    if (sum !== Number(row.total)) {
      return {
        ...row,
        status: 'error',
        message: `MATH ERROR: Row itemized allocations sum is ₦${sum.toLocaleString()} but spreadsheet total label says ₦${Number(row.total).toLocaleString()}.`
      };
    }

    // High total caution warning
    if (sum > 200000) {
      return {
        ...row,
        status: 'warning',
        message: 'WARN: High-value deduction requires supplemental approval certificate.'
      };
    }

    return {
      ...row,
      status: 'valid',
      message: 'All fields cleared and matched against register.'
    };
  };

  // Save edits during spreadsheet review
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRow) return;

    // Evaluate edits
    const audited = reAuditRecord(editingRow);
    
    // Track previous value for modification history
    const original = importedRecords.find(r => r.id === editingRow.id);
    const isModified = original ? (
      original.ordinarySavings !== audited.ordinarySavings ||
      original.specialSavings !== audited.specialSavings ||
      original.investment !== audited.investment ||
      original.commodityPurchase !== audited.commodityPurchase ||
      original.loanReimbursement !== audited.loanReimbursement ||
      (original.muslimCommunity || 0) !== (audited.muslimCommunity || 0)
    ) : false;

    const finalRecord = {
      ...audited,
      isModified,
      originalValues: original && !original.isModified ? {
        ordinarySavings: original.ordinarySavings,
        specialSavings: original.specialSavings,
        investment: original.investment,
        commodityPurchase: original.commodityPurchase,
        loanReimbursement: original.loanReimbursement,
        muslimCommunity: original.muslimCommunity
      } : original?.originalValues || {
        ordinarySavings: audited.ordinarySavings,
        specialSavings: audited.specialSavings,
        investment: audited.investment,
        commodityPurchase: audited.commodityPurchase,
        loanReimbursement: audited.loanReimbursement,
        muslimCommunity: audited.muslimCommunity
      }
    };

    const updated = importedRecords.map(r => r.id === editingRow.id ? finalRecord : r);
    setImportedRecords(updated);

    // Track in modified list
    if (isModified) {
      setModifiedRecords(prev => {
        const filtered = prev.filter(p => p.id !== finalRecord.id);
        return [...filtered, finalRecord];
      });
    } else {
      setModifiedRecords(prev => prev.filter(p => p.id !== finalRecord.id));
    }

    setEditingRow(null);
    showToast(`Successfully saved and re-audited record for ${finalRecord.name}.`, 'success');
  };

  // Reconcile alert bypasses
  const handleBypassWarning = (id: string) => {
    const updated = importedRecords.map(r => {
      if (r.id === id) {
        return {
          ...r,
          status: 'valid' as const,
          message: 'Bypassed Audit warning flags manually.'
        };
      }
      return r;
    });
    setImportedRecords(updated);
    showToast('Bypassed high-value audit warning flag.', 'success');
  };

  // Delete row from workbook
  const handleDeleteRow = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove the deduction entry for ${name}?`)) {
      setImportedRecords(prev => prev.filter(r => r.id !== id));
      setModifiedRecords(prev => prev.filter(r => r.id !== id));
      showToast(`Removed row for ${name} from active workbook.`, 'warning');
    }
  };

  // Push finalized balances to Member Dashboards (Firestore integration!)
  const handlePushToMembers = async () => {
    const errors = importedRecords.filter(r => r.status === 'error');
    if (errors.length > 0) {
      showToast('Cannot push file to member dashboards while critical errors exist. Please resolve them first!', 'error');
      return;
    }

    setPushStatus('pushing');
    setPushProgress(10);

    try {
      // Loop and batch update members in Firestore
      const updateInterval = setInterval(() => {
        setPushProgress(prev => {
          if (prev >= 90) {
            clearInterval(updateInterval);
            return 90;
          }
          return prev + 20;
        });
      }, 300);

      // Perform updates in database if available
      const batch = writeBatch(db);
      let matchedCount = 0;
      let newMembersCreatedCount = 0;
      const loggedInMemberId = localStorage.getItem('zimco_id');
      const newlyCreatedList: NewMemberCredential[] = [];
      const updatedFirestoreMembers = [...firestoreMembers];

      const pushedRegistry: any[] = [];

      for (let i = 0; i < importedRecords.length; i++) {
        const record = importedRecords[i];
        // Find user by staff ID, Firestore doc ID, or matching email/name
        const dbUser = firestoreMembers.find(u => {
          const uDocId = (u.docId || u.firestoreDocId || '').toUpperCase();
          const uId = (u.id || u.memberId || '').toUpperCase();
          const uUid = (u.uid || '').toUpperCase();
          const uName = (u.fullName || u.name || '').toLowerCase();
          const rId = (record.id || '').toUpperCase();
          const rName = (record.name || '').toLowerCase();
          const uSurname = extractSurname(uName);
          const rSurname = extractSurname(rName);
          const surnameMatch = (rSurname && uSurname && (rSurname === uSurname || (rSurname === 'abas' && uSurname === 'abbas') || (rSurname === 'abbas' && uSurname === 'abas')));
          return (rId && (uDocId === rId || uId === rId || uUid === rId)) || (rName && (uName === rName || uName.includes(rName) || rName.includes(uName))) || surnameMatch;
        });
        
        const currentDateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
        const currentIsoStr = new Date().toISOString();

        const deductionBreakdown = {
          ordinarySavings: record.ordinarySavings || 0,
          specialSavings: record.specialSavings || 0,
          investment: record.investment || 0,
          loanReimbursement: record.loanReimbursement || 0,
          commodityPurchase: record.commodityPurchase || 0,
          muslimCommunity: record.muslimCommunity || 0,
          total: record.total || 0,
          cycle: activeMonth,
          injectedAt: currentIsoStr,
          status: 'Disbursed / Pushed Directly'
        };

        if (dbUser) {
          matchedCount++;
          // Prioritize verified Firestore doc ID to prevent document missing errors
          const targetDocId = dbUser.docId || dbUser.firestoreDocId || dbUser.id || dbUser.memberId || dbUser.uid;
          const userRef = doc(db, 'users', targetDocId);
          
          // Calculate new savings totals
          const currentOrdinarySavings = Number(dbUser.ordinarySavings) || 0;
          const currentSpecialSavings = Number(dbUser.specialSavings) || 0;
          const currentInvestment = Number(dbUser.investmentAmount) || 0;
          const currentCommodity = Number(dbUser.commoditySavings) || 0;
          const currentMuslimCommunity = Number(dbUser.muslimCommunitySavings || dbUser.muslimSavings) || 0;
          const currentLoans = Number(dbUser.outstandingLoans) || 0;

          const newOrdinary = currentOrdinarySavings + (record.ordinarySavings || 0);
          const newSpecial = currentSpecialSavings + (record.specialSavings || 0);
          const newInvestment = currentInvestment + (record.investment || 0);
          const newCommodity = currentCommodity + (record.commodityPurchase || 0);
          const newMuslimCommunity = currentMuslimCommunity + (record.muslimCommunity || 0);
          const newLoans = Math.max(0, currentLoans - (record.loanReimbursement || 0));

          const userBalancePayload = {
            ordinarySavings: newOrdinary,
            specialSavings: newSpecial,
            investmentAmount: newInvestment,
            commoditySavings: newCommodity,
            muslimCommunitySavings: newMuslimCommunity,
            muslimSavings: newMuslimCommunity,
            outstandingLoans: newLoans,
            lastDeductionAmount: record.total,
            lastDeductionDate: currentIsoStr,
            lastDeductionBreakdown: deductionBreakdown
          };

          // Use setDoc with { merge: true } on batch to prevent "No document to update" error
          batch.set(userRef, userBalancePayload, { merge: true });

          // Also synchronize Auth UID document if it differs from the primary docId
          if (dbUser.uid && dbUser.uid !== targetDocId) {
            const authUserRef = doc(db, 'users', dbUser.uid);
            batch.set(authUserRef, userBalancePayload, { merge: true });
          }

          // Alias document by surname for instant direct doc lookup
          const existingSurname = extractSurname(dbUser.fullName || dbUser.name || record.name);
          if (existingSurname) {
            const aliasSurnameRef = doc(db, 'users', existingSurname.toUpperCase());
            batch.set(aliasSurnameRef, userBalancePayload, { merge: true });
          }

          // 1. Overall summary transaction entry
          const summaryTxRef = doc(collection(db, 'users', targetDocId, 'transactions'));
          batch.set(summaryTxRef, {
            date: currentDateStr,
            description: `Monthly Payroll Deduction - ${activeMonth}`,
            amount: `₦${Number(record.total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            account: 'Payroll Allocation',
            type: 'credit',
            category: 'savings',
            createdAt: currentIsoStr
          });

          // 2. Itemized transaction splits if amounts are > 0
          if (record.ordinarySavings > 0) {
            const osTxRef = doc(collection(db, 'users', targetDocId, 'transactions'));
            batch.set(osTxRef, {
              date: currentDateStr,
              description: `Ordinary Savings Allocation (${activeMonth})`,
              amount: `₦${Number(record.ordinarySavings).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              account: 'Ordinary Savings',
              type: 'credit',
              category: 'savings',
              createdAt: currentIsoStr
            });
          }

          if (record.specialSavings > 0) {
            const ssTxRef = doc(collection(db, 'users', targetDocId, 'transactions'));
            batch.set(ssTxRef, {
              date: currentDateStr,
              description: `Special Savings Allocation (${activeMonth})`,
              amount: `₦${Number(record.specialSavings).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              account: 'Special Savings',
              type: 'credit',
              category: 'savings',
              createdAt: currentIsoStr
            });
          }

          if (record.investment > 0) {
            const iaTxRef = doc(collection(db, 'users', targetDocId, 'transactions'));
            batch.set(iaTxRef, {
              date: currentDateStr,
              description: `Investment Capital Allocation (${activeMonth})`,
              amount: `₦${Number(record.investment).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              account: 'Investment Account',
              type: 'credit',
              category: 'investment',
              createdAt: currentIsoStr
            });
          }

          if (record.loanReimbursement > 0) {
            const loanTxRef = doc(collection(db, 'users', targetDocId, 'transactions'));
            batch.set(loanTxRef, {
              date: currentDateStr,
              description: `Loan Repayment Recovery (${activeMonth})`,
              amount: `₦${Number(record.loanReimbursement).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              account: 'Loan Disbursement',
              type: 'debit',
              category: 'loans',
              createdAt: currentIsoStr
            });
          }

          if (record.commodityPurchase > 0) {
            const cpTxRef = doc(collection(db, 'users', targetDocId, 'transactions'));
            batch.set(cpTxRef, {
              date: currentDateStr,
              description: `Commodity Purchase Deduction (${activeMonth})`,
              amount: `₦${Number(record.commodityPurchase).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              account: 'Commodity Account',
              type: 'credit',
              category: 'commodities',
              createdAt: currentIsoStr
            });
          }

          if (record.muslimCommunity && record.muslimCommunity > 0) {
            const mcaTxRef = doc(collection(db, 'users', targetDocId, 'transactions'));
            batch.set(mcaTxRef, {
              date: currentDateStr,
              description: `Muslim Community Allocation (${activeMonth})`,
              amount: `₦${Number(record.muslimCommunity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              account: 'Muslim Community Account',
              type: 'credit',
              category: 'savings',
              createdAt: currentIsoStr
            });
          }

          // Save in pushed registry for instant propagation across all tabs
          pushedRegistry.push({
            id: dbUser.id || targetDocId,
            docId: targetDocId,
            memberId: dbUser.memberId || dbUser.id || targetDocId,
            fullName: dbUser.fullName || dbUser.name || record.name,
            name: dbUser.fullName || dbUser.name || record.name,
            surname: existingSurname,
            email: dbUser.email,
            ...userBalancePayload
          });

          // If active logged in user matches, save sync in localStorage for instant live preview
          if (loggedInMemberId === dbUser.id || loggedInMemberId === dbUser.uid || loggedInMemberId === targetDocId) {
            localStorage.setItem('zimco_last_deduction_sync', JSON.stringify(userBalancePayload));
          }

          const foundIdx = updatedFirestoreMembers.findIndex(u => (u.docId && u.docId === targetDocId) || u.id === dbUser.id || u.uid === dbUser.uid);
          if (foundIdx !== -1) {
            updatedFirestoreMembers[foundIdx] = {
              ...updatedFirestoreMembers[foundIdx],
              ...userBalancePayload
            };
          }
        } else {
          // PROVISION NEW MEMBER RECORD IN FIRESTORE DIRECTLY
          newMembersCreatedCount++;
          const surname = extractSurname(record.name);
          const assignedId = record.id && String(record.id).startsWith('ZIM-') 
            ? String(record.id) 
            : `ZIM-2026-${String(firestoreMembers.length + newMembersCreatedCount).padStart(3, '0')}`;
          
          const rawIdClean = assignedId.replace(/[^A-Za-z0-9]/g, '').toLowerCase();
          const targetEmail = `member_${rawIdClean}@zimco.org`;
          const newUid = assignedId; // Primary key for member doc
          const newUserRef = doc(db, 'users', newUid);

          const newMemberData = {
            id: assignedId,
            uid: newUid,
            docId: newUid,
            firestoreDocId: newUid,
            memberId: assignedId,
            fullName: record.name,
            name: record.name,
            surname: surname,
            email: targetEmail,
            role: 'member',
            status: 'active',
            ordinarySavings: record.ordinarySavings || 0,
            specialSavings: record.specialSavings || 0,
            investmentAmount: record.investment || 0,
            commoditySavings: record.commodityPurchase || 0,
            muslimCommunitySavings: record.muslimCommunity || 0,
            muslimSavings: record.muslimCommunity || 0,
            outstandingLoans: 0,
            lastDeductionAmount: record.total,
            lastDeductionDate: currentIsoStr,
            lastDeductionBreakdown: deductionBreakdown,
            createdAt: currentIsoStr,
            mustChangePassword: true
          };

          batch.set(newUserRef, newMemberData, { merge: true });

          // Also create alias docs for uppercase surname (e.g., 'ABAS' or 'ABBAS') for direct lookup
          if (surname) {
            const surnameUpper = surname.toUpperCase();
            const aliasRef1 = doc(db, 'users', surnameUpper);
            batch.set(aliasRef1, newMemberData, { merge: true });

            if (surname.toLowerCase() === 'abas') {
              const aliasRef2 = doc(db, 'users', 'ABBAS');
              batch.set(aliasRef2, newMemberData, { merge: true });
            } else if (surname.toLowerCase() === 'abbas') {
              const aliasRef2 = doc(db, 'users', 'ABAS');
              batch.set(aliasRef2, newMemberData, { merge: true });
            }
          }

          // Alias by spreadsheet S/N or record ID if provided
          if (record.id && String(record.id).trim() !== assignedId) {
            const idAliasRef = doc(db, 'users', String(record.id).trim().toUpperCase());
            batch.set(idAliasRef, newMemberData, { merge: true });
          }

          // Initial enrollment transactions
          const summaryTxRef = doc(collection(db, 'users', newUid, 'transactions'));
          batch.set(summaryTxRef, {
            date: currentDateStr,
            description: `Initial Payroll Deduction Enrollment - ${activeMonth}`,
            amount: `₦${Number(record.total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            account: 'Payroll Allocation',
            type: 'credit',
            category: 'savings',
            createdAt: currentIsoStr
          });

          if (record.ordinarySavings > 0) {
            const osTxRef = doc(collection(db, 'users', newUid, 'transactions'));
            batch.set(osTxRef, {
              date: currentDateStr,
              description: `Ordinary Savings Initial Allocation (${activeMonth})`,
              amount: `₦${Number(record.ordinarySavings).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              account: 'Ordinary Savings',
              type: 'credit',
              category: 'savings',
              createdAt: currentIsoStr
            });
          }

          if (record.specialSavings > 0) {
            const ssTxRef = doc(collection(db, 'users', newUid, 'transactions'));
            batch.set(ssTxRef, {
              date: currentDateStr,
              description: `Special Savings Initial Allocation (${activeMonth})`,
              amount: `₦${Number(record.specialSavings).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              account: 'Special Savings',
              type: 'credit',
              category: 'savings',
              createdAt: currentIsoStr
            });
          }

          if (record.investment > 0) {
            const iaTxRef = doc(collection(db, 'users', newUid, 'transactions'));
            batch.set(iaTxRef, {
              date: currentDateStr,
              description: `Investment Capital Initial Allocation (${activeMonth})`,
              amount: `₦${Number(record.investment).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              account: 'Investment Account',
              type: 'credit',
              category: 'investment',
              createdAt: currentIsoStr
            });
          }

          if (record.commodityPurchase > 0) {
            const cpTxRef = doc(collection(db, 'users', newUid, 'transactions'));
            batch.set(cpTxRef, {
              date: currentDateStr,
              description: `Commodity Purchase Deduction (${activeMonth})`,
              amount: `₦${Number(record.commodityPurchase).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              account: 'Commodity Account',
              type: 'credit',
              category: 'commodities',
              createdAt: currentIsoStr
            });
          }

          if (record.muslimCommunity && record.muslimCommunity > 0) {
            const mcaTxRef = doc(collection(db, 'users', newUid, 'transactions'));
            batch.set(mcaTxRef, {
              date: currentDateStr,
              description: `Muslim Community Allocation (${activeMonth})`,
              amount: `₦${Number(record.muslimCommunity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              account: 'Muslim Community Account',
              type: 'credit',
              category: 'savings',
              createdAt: currentIsoStr
            });
          }

          newlyCreatedList.push({
            id: assignedId,
            name: record.name,
            surname: surname,
            email: targetEmail,
            initialDeduction: record.total || 0,
            ordinarySavings: record.ordinarySavings || 0,
            specialSavings: record.specialSavings || 0,
            investment: record.investment || 0,
            commodityPurchase: record.commodityPurchase || 0,
            loanReimbursement: record.loanReimbursement || 0,
            muslimCommunity: record.muslimCommunity || 0,
            dateImported: currentDateStr,
            status: 'Provisioned'
          });

          pushedRegistry.push(newMemberData);
          updatedFirestoreMembers.push(newMemberData);
        }
      }

      // Store in localStorage registry for instant access across tabs and offline state
      try {
        const existingRegistry = JSON.parse(localStorage.getItem('zimco_pushed_deductions_registry') || '[]');
        // Merge with new pushed members
        const mergedRegistry = [...existingRegistry];
        pushedRegistry.forEach(newItem => {
          const idx = mergedRegistry.findIndex((e: any) => e.id === newItem.id || e.fullName === newItem.fullName || e.email === newItem.email);
          if (idx !== -1) {
            mergedRegistry[idx] = { ...mergedRegistry[idx], ...newItem };
          } else {
            mergedRegistry.push(newItem);
          }
        });
        localStorage.setItem('zimco_pushed_deductions_registry', JSON.stringify(mergedRegistry));
        localStorage.setItem('zimco_all_members_register', JSON.stringify(updatedFirestoreMembers));
      } catch (cacheErr) {
        console.warn('LocalStorage push registry error:', cacheErr);
      }

      if (matchedCount > 0 || newMembersCreatedCount > 0) {
        await batch.commit();
        setFirestoreMembers(updatedFirestoreMembers);
      }

      if (newlyCreatedList.length > 0) {
        setNewlyProvisionedMembers(newlyCreatedList);
      }

      setPushProgress(100);
      setTimeout(() => {
        setPushStatus('success');
        if (newMembersCreatedCount > 0) {
          showToast(`Direct Push Successful! Provisioned ${newMembersCreatedCount} members & updated ledgers directly. No admin approval required.`, 'success');
          setShowNewMembersModal(true);
        } else {
          showToast(`Direct Push Successful! Synchronized ${importedRecords.length} member ledgers directly. Member dashboards updated immediately!`, 'success');
        }
      }, 500);

    } catch (err) {
      console.error("Error writing batch to firestore:", err);
      setPushStatus('error');
      showToast('Push transaction failed. Local state remains intact.', 'error');
      handleFirestoreError(err, OperationType.WRITE, 'users');
    }
  };

  // Reconciliation Simulation match tool
  const handleAutoReconcile = () => {
    setIsAutoMatching(true);
    showToast('Matching ledger files with banking clearing transcripts...', 'success');

    setTimeout(() => {
      let matchedCount = 0;
      let mismatchCount = 0;

      const matchedList = reconciliationList.map(item => {
        // Find corresponding expected record
        const record = importedRecords.find(r => r.id === item.staffId);
        if (record) {
          const totalExpected = record.ordinarySavings + record.specialSavings + record.investment + record.commodityPurchase + record.loanReimbursement + (record.muslimCommunity || 0);
          
          // Simulation matches deposits perfectly for demo, except maybe 1 mismatch for realism
          const actualDeposit = item.staffId === 'ZIM-2026-004' ? totalExpected - 5000 : totalExpected;
          const isMatched = actualDeposit === totalExpected;

          if (isMatched) matchedCount++;
          else mismatchCount++;

          return {
            ...item,
            statementAmount: actualDeposit,
            status: isMatched ? 'matched' as const : 'mismatch' as const
          };
        }
        return item;
      });

      setReconciliationList(matchedList);
      setIsAutoMatching(false);

      const totalCleared = matchedList.reduce((acc, current) => acc + current.statementAmount, 0);
      const totalExpected = matchedList.reduce((acc, current) => acc + current.expectedAmount, 0);

      setReconciliationStats({
        totalExpected,
        totalCleared,
        status: mismatchCount > 0 ? 'Resolved with Caveats' : 'Cleared & Fully Balanced'
      });

      showToast(`Reconciliation complete. ${matchedCount} matched perfectly, ${mismatchCount} item mismatch highlighted.`, mismatchCount > 0 ? 'warning' : 'success');
    }, 2000);
  };

  // Update single imported record
  const handleUpdateImportedRecord = (id: string, updatedFields: Record<string, any>) => {
    setImportedRecords(prev => prev.map(r => {
      if (r.id === id) {
        return { ...r, ...updatedFields, isModified: true };
      }
      return r;
    }));
  };

  // Align all imported records with database expectations
  const handleAlignAllWithDatabase = (alignedRecords: DeductionRecord[]) => {
    setImportedRecords(alignedRecords);
    setModifiedRecords(alignedRecords.filter(r => r.isModified));
  };

  // Add omitted database member to sheet
  const handleAddOmittedMemberToSheet = (member: any) => {
    const newRecord: DeductionRecord = {
      id: member.id,
      name: member.name,
      ordinarySavings: member.ordinarySavings,
      specialSavings: member.specialSavings,
      investment: member.investmentAmount,
      commodityPurchase: member.commoditySavings,
      loanReimbursement: member.expectedLoanRepay,
      muslimCommunity: member.muslimSavings,
      total: member.expectedTotal,
      status: 'valid',
      message: 'Appended from Firestore database member profile.',
      isModified: true
    };
    setImportedRecords(prev => [...prev, newRecord]);
    showToast(`Added ${member.name} (${member.id}) to active deduction sheet!`, 'success');
  };

  // Export File generation (Both current finalized, and next month template!)
  // Export File generation (supports Excel .xlsx and CSV, current finalized, and next month template!)
  const handleExportFile = (format: 'xlsx' | 'csv', isNextMonth: boolean = false) => {
    try {
      const recordsToExport: NormalizedDeductionRecord[] = importedRecords.map(r => ({
        id: r.id,
        name: r.name,
        ordinarySavings: r.ordinarySavings,
        specialSavings: r.specialSavings,
        investment: r.investment,
        commodityPurchase: r.commodityPurchase,
        loanReimbursement: r.loanReimbursement,
        muslimCommunity: r.muslimCommunity || 0,
        total: r.total,
        isModified: r.isModified,
        originalValues: r.originalValues
      }));

      const baseName = isNextMonth
        ? 'ZIMCO_DEDUCTIONS_NEXT_MONTH_TEMPLATE'
        : `ZIMCO_DEDUCTIONS_FINALIZED_${activeMonth.replace(/\s+/g, '_')}`;

      exportNormalizedSpreadsheet(recordsToExport, format, baseName, {
        isNextMonth,
        revertOnNextMonth,
        zeroOutCommodityNextMonth,
        zeroOutLoansNextMonth
      });

      showToast(
        isNextMonth 
          ? `Generated next month ${format.toUpperCase()} template. Temporary allocations reverted to defaults.`
          : `Final current cycle ${format.toUpperCase()} deduction workbook exported successfully.`,
        'success'
      );
    } catch (err: any) {
      console.error('Export error:', err);
      showToast(`Export failed: ${err.message}`, 'error');
    }
  };

  // Aggregates for active view
  const errorCount = importedRecords.filter(r => r.status === 'error').length;
  const warnCount = importedRecords.filter(r => r.status === 'warning').length;
  const validCount = importedRecords.filter(r => r.status === 'valid').length;

  const totalPoolSum = importedRecords.reduce((sum, r) => sum + (r.ordinarySavings + r.specialSavings + r.investment + r.commodityPurchase + r.loanReimbursement + (r.muslimCommunity || 0)), 0);
  const ordSavingsSum = importedRecords.reduce((sum, r) => sum + r.ordinarySavings, 0);
  const specSavingsSum = importedRecords.reduce((sum, r) => sum + r.specialSavings, 0);
  const investSum = importedRecords.reduce((sum, r) => sum + r.investment, 0);
  const commoditySum = importedRecords.reduce((sum, r) => sum + r.commodityPurchase, 0);
  const loanRepaySum = importedRecords.reduce((sum, r) => sum + r.loanReimbursement, 0);
  const mcaSum = importedRecords.reduce((sum, r) => sum + (r.muslimCommunity || 0), 0);

  const displayRows = importedRecords.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.id.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (diagnosticFilter === 'all') return true;
    return r.status === diagnosticFilter;
  });

  return (
    <div className="bg-[#f8fafc] text-slate-900 antialiased flex min-h-screen relative font-sans">
      <SessionTimeoutListener onLogout={handleLogout} />

      {/* Broadcast Toast Notification system */}
      <AnimatePresence>
        {toastNotification && (
          <motion.div 
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.95 }}
            className={`fixed top-6 right-6 z-[200] max-w-sm rounded-[1.5rem] p-4 shadow-xl border flex items-start gap-3 ${
              toastNotification.type === 'error' 
                ? 'bg-rose-50 border-rose-200 text-rose-950'
                : toastNotification.type === 'warning'
                ? 'bg-amber-50 border-amber-200 text-amber-950'
                : 'bg-emerald-50 border-emerald-200 text-emerald-950'
            }`}
          >
            {toastNotification.type === 'error' ? (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            ) : toastNotification.type === 'warning' ? (
              <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-bold text-xs uppercase tracking-wider">Bursary Control Alert</p>
              <p className="text-xs font-semibold mt-1 leading-relaxed">{toastNotification.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* UNIQUE SIDEBAR NAVIGATION BAR */}
      <aside className={`
        fixed inset-y-0 left-0 z-[90] bg-[#091e14] text-slate-200 border-r border-[#143224] flex flex-col
        transition-all duration-300 ease-in-out shrink-0
        lg:sticky lg:top-0 lg:h-screen
        ${isSidebarOpen ? 'translate-x-0 w-72 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
        ${isSidebarCollapsed ? 'lg:w-20' : 'lg:w-72'}
      `}>
        {/* Sidebar Header branding & 3-line Menu Toggle */}
        <div className={`px-3.5 py-4 border-b border-[#143224] flex items-center min-h-[72px] ${isSidebarCollapsed ? 'justify-center' : 'justify-between gap-2.5'}`}>
          {/* Desktop 3-line Menu Hamburger Toggle Button on Left */}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden lg:flex p-2 rounded-xl text-slate-300 hover:text-emerald-400 hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
            title={isSidebarCollapsed ? "Show / Expand sidebar menu" : "Hide / Collapse sidebar menu"}
            aria-label={isSidebarCollapsed ? "Expand sidebar menu" : "Hide sidebar menu"}
          >
            <Menu size={20} className="text-emerald-400" />
          </button>

          {/* Branding Logo & Title */}
          {(!isSidebarCollapsed || isSidebarOpen) && (
            <div className="flex items-center gap-2.5 overflow-hidden flex-1">
              <img src={zimcoLogo} alt="ZIMCO Logo" className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/30 shrink-0" referrerPolicy="no-referrer" />
              <div className="whitespace-nowrap transition-opacity duration-200 overflow-hidden">
                <div className="text-base font-black tracking-tight text-white flex items-center gap-1 leading-tight truncate">
                  ZIMCO 
                  <span className="text-[9px] bg-emerald-500 text-slate-950 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">Bursary</span>
                </div>
                <div className="text-[9px] tracking-widest uppercase font-bold text-slate-400 mt-0.5 truncate">Deduction & Ingestion</div>
              </div>
            </div>
          )}

          {/* Mobile Close Button */}
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors ml-auto cursor-pointer"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Unique Menu Navigation List */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          <SidebarTabLink 
            label="Dashboard" 
            icon={<LayoutDashboard size={18} />} 
            active={activeTab === 'dashboard'} 
            collapsed={isSidebarCollapsed && !isSidebarOpen}
            onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }} 
          />
          <SidebarTabLink 
            label="Import deduction file" 
            icon={<FileSpreadsheet size={18} />} 
            active={activeTab === 'import'} 
            collapsed={isSidebarCollapsed && !isSidebarOpen}
            badge={errorCount > 0 ? String(errorCount) : undefined}
            badgeColor="bg-rose-600"
            onClick={() => { setActiveTab('import'); setIsSidebarOpen(false); }} 
          />
          <SidebarTabLink 
            label="Export deduction file" 
            icon={<DownloadCloud size={18} />} 
            active={activeTab === 'export'} 
            collapsed={isSidebarCollapsed && !isSidebarOpen}
            badge={modifiedRecords.length > 0 ? String(modifiedRecords.length) : undefined}
            badgeColor="bg-amber-600"
            onClick={() => { setActiveTab('export'); setIsSidebarOpen(false); }} 
          />
          <SidebarTabLink 
            label="Reconciliation Check" 
            icon={<RefreshCcw size={18} />} 
            active={activeTab === 'reconcile'} 
            collapsed={isSidebarCollapsed && !isSidebarOpen}
            badge={errorCount > 0 ? `${errorCount} alerts` : undefined}
            badgeColor="bg-rose-600"
            onClick={() => { setActiveTab('reconcile'); setIsSidebarOpen(false); }} 
          />
          <SidebarTabLink 
            label="Send to Bursary" 
            icon={<Send size={18} />} 
            active={activeTab === 'bursary_dispatch'} 
            collapsed={isSidebarCollapsed && !isSidebarOpen}
            badge="Next Cycle"
            badgeColor="bg-emerald-500"
            onClick={() => { setActiveTab('bursary_dispatch'); setIsSidebarOpen(false); }} 
          />
          <SidebarTabLink 
            label="Member Directory" 
            icon={<Users size={18} />} 
            active={activeTab === 'members'} 
            collapsed={isSidebarCollapsed && !isSidebarOpen}
            badge={String(firestoreMembers.length || importedRecords.length || 0)}
            badgeColor="bg-emerald-600"
            onClick={() => { setActiveTab('members'); setIsSidebarOpen(false); }} 
          />
          <SidebarTabLink 
            label="Settings" 
            icon={<SettingsIcon size={18} />} 
            active={activeTab === 'settings'} 
            collapsed={isSidebarCollapsed && !isSidebarOpen}
            onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }} 
          />
        </nav>

        {/* Sidebar Footer details */}
        <div className="p-3 border-t border-[#143224] mt-auto bg-[#07170f]">
          {(!isSidebarCollapsed || isSidebarOpen) ? (
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shrink-0">
                  <User size={16} />
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-white truncate">Chief Bursar Officer</p>
                  <p className="text-[9px] text-slate-400 uppercase font-medium">Bursary Management</p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#092116] border border-[#143224] mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Ledger Cycle Lock</span>
                  <span className="text-[8px] text-emerald-400 font-extrabold uppercase">Open</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={11} className="text-emerald-500" />
                  <p className="text-[9px] font-semibold text-slate-300">Locking in {lockoutDate - new Date().getDate() || 15} days</p>
                </div>
              </div>

              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-rose-900/60 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
              >
                <LogOut size={13} />
                Exit Portal
              </button>
            </div>
          ) : (
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center p-2 text-slate-400 hover:text-rose-400 hover:bg-white/5 rounded-xl transition-colors"
              title="Exit Portal (Logout)"
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </aside>

      {/* Main Container Content */}
      <div className="flex-grow flex flex-col min-h-screen min-w-0">
        
        {/* Custom Header Bar */}
        <header className="sticky top-0 h-16 bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-100 flex items-center justify-between px-4 sm:px-6 md:px-8 z-30">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              aria-label="Open menu"
            >
              <Menu size={18} />
            </button>
            
            {/* Breadcrumb path */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span>Bursary Portal</span>
              <ArrowRight size={12} />
              <span className="text-emerald-700">
                {activeTab === 'dashboard' && 'Core Dashboard'}
                {activeTab === 'import' && 'Import & Review Worksheet'}
                {activeTab === 'export' && 'Reversion & Export Workspaces'}
                {activeTab === 'reconcile' && 'Database Reconciliation & Discrepancy Check'}
                {activeTab === 'bursary_dispatch' && 'Next-Month Bursary Deduction Dispatch'}
                {activeTab === 'members' && 'Cooperative Society Member Directory'}
                {activeTab === 'settings' && 'Bursary Threshold Settings'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Current Payroll Cycle Indicator */}
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full text-xs font-black text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="truncate max-w-[120px] sm:max-w-none">Cycle: {activeMonth}</span>
            </div>
            
            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-extrabold text-slate-800">Bursary Desk</p>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Cooperative Ledger Auth</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                BM
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Inner Tab View Router */}
        <main className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            
            {/* 1. DASHBOARD VIEW */}
            {activeTab === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-8"
              >
                <div>
                  <h1 className="text-3xl font-black text-slate-900 tracking-tight font-headline">Bursary Operations</h1>
                  <p className="text-sm text-slate-500 mt-1">Audit, cross-reference, and synchronize monthly payroll deduction sheets into member ledgers.</p>
                </div>

                {/* Dashboard Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <DashboardStatCard 
                    label="Total Ingestion Pool" 
                    value={`₦${totalPoolSum.toLocaleString()}`} 
                    subValue={`${importedRecords.length} member profiles active`} 
                    icon={<Wallet className="text-emerald-600" />} 
                    color="border-l-4 border-l-emerald-600"
                  />
                  <DashboardStatCard 
                    label="Ordinary Savings Weight" 
                    value={`₦${ordSavingsSum.toLocaleString()}`} 
                    subValue={`${((ordSavingsSum / (totalPoolSum || 1)) * 100).toFixed(1)}% of total pool`} 
                    icon={<TrendingUp className="text-blue-600" />} 
                    color="border-l-4 border-l-blue-600"
                  />
                  <DashboardStatCard 
                    label="Loan Payback Allocation" 
                    value={`₦${loanRepaySum.toLocaleString()}`} 
                    subValue={`${((loanRepaySum / (totalPoolSum || 1)) * 100).toFixed(1)}% of total pool`} 
                    icon={<CreditCard className="text-amber-600" />} 
                    color="border-l-4 border-l-amber-600"
                  />
                </div>

                {/* Main Split Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Category allocations breakdown list */}
                  <div className="lg:col-span-1 bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm space-y-6">
                    <h3 className="font-extrabold text-slate-900 text-sm tracking-wider uppercase">Deduction Distribution</h3>
                    
                    <div className="space-y-4 pt-2">
                      <CategoryWeightBar label="Ordinary Savings" value={ordSavingsSum} total={totalPoolSum} color="bg-emerald-600" />
                      <CategoryWeightBar label="Special Savings" value={specSavingsSum} total={totalPoolSum} color="bg-blue-600" />
                      <CategoryWeightBar label="Investment Accounts" value={investSum} total={totalPoolSum} color="bg-indigo-600" />
                      <CategoryWeightBar label="Commodity Purchase" value={commoditySum} total={totalPoolSum} color="bg-rose-500" />
                      <CategoryWeightBar label="Muslim Community" value={mcaSum} total={totalPoolSum} color="bg-teal-600" />
                      <CategoryWeightBar label="Loan Reimbursements" value={loanRepaySum} total={totalPoolSum} color="bg-amber-500" />
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-[11px] leading-relaxed font-medium text-slate-500">
                      <span className="font-bold text-slate-800 block mb-1">Deductions Strategy Memo</span>
                      These allocations are pulled directly from payroll sheets and remain temporary modifications until ledger locks. Modified records revert next cycle if enabled.
                    </div>
                  </div>

                  {/* Quick Action blocks */}
                  <div className="lg:col-span-2 space-y-8">
                    
                    {/* Synchronisation Status Banner */}
                    <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full pointer-events-none"></div>
                      <div className="space-y-2 max-w-lg">
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 font-black px-2.5 py-1 rounded-full uppercase tracking-wider">Direct Disbursement Controller</span>
                        <h3 className="text-xl font-bold text-slate-900">Direct Push to Member Dashboards</h3>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Once reviews are complete and mathematical checks pass, approve and push this workbook. This adds the deductions directly to each cooperative member's virtual ledger and passbook immediately without requiring any secondary admin approval.
                        </p>
                      </div>

                      <div className="shrink-0">
                        {pushStatus === 'pushing' ? (
                          <div className="text-center space-y-2">
                            <RefreshCcw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
                            <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Pushing {pushProgress}%</p>
                          </div>
                        ) : pushStatus === 'success' ? (
                          <div className="p-3 bg-emerald-55 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-2xl flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                            <span className="text-xs font-black uppercase">Pushed & Live on Member Accounts</span>
                          </div>
                        ) : importedRecords.length === 0 ? (
                          <button 
                            onClick={() => { setActiveTab('import'); setImportWorkflowStage('review'); }}
                            className="px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2.5 shadow transition-all bg-emerald-700 hover:bg-emerald-800 text-white shadow-emerald-950/20 shadow-lg cursor-pointer"
                          >
                            <FileSpreadsheet size={16} />
                            Import Deduction Workbook
                          </button>
                        ) : (
                          <button 
                            onClick={handlePushToMembers}
                            disabled={errorCount > 0}
                            className={`px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2.5 shadow transition-all ${
                              errorCount > 0 
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-none'
                                : 'bg-[#091e14] hover:bg-[#143224] text-white shadow-emerald-950/20 shadow-lg'
                            }`}
                          >
                            <Sparkles size={16} />
                            Approve & Push to Member Dashboards
                          </button>
                        )}
                        {errorCount > 0 && (
                          <span className="text-[9px] text-rose-600 font-extrabold mt-1.5 block text-center">
                            * {errorCount} unresolved error blocks
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Pending Reconciliation Checklist */}
                    <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="font-extrabold text-slate-900 text-sm tracking-wider uppercase">Payroll Checklist Status</h3>
                        <span className="px-3 py-1 bg-amber-50 text-amber-700 text-[10px] font-black rounded-full uppercase tracking-wider">Reconcile Needed</span>
                      </div>

                      <div className="divide-y divide-slate-100">
                        <ChecklistRow label="Ingestion Workbook Validation" status={errorCount > 0 ? 'warning' : 'complete'} text={errorCount > 0 ? `${errorCount} unresolved formatting/math alerts` : 'All spreadsheet cells pass rules'} />
                        <ChecklistRow label="Cross-Reference Banking clearing" status={reconciliationStats.totalCleared > 0 ? 'complete' : 'pending'} text={reconciliationStats.totalCleared > 0 ? reconciliationStats.status : 'Compare deposited transfers against workbook'} />
                        <ChecklistRow label="Modified Deduction temporary audit" status={modifiedRecords.length > 0 ? 'caution' : 'complete'} text={modifiedRecords.length > 0 ? `${modifiedRecords.length} records marked to auto-revert next month` : 'All records set to default values'} />
                      </div>
                    </div>

                  </div>
                </div>
              </motion.div>
            )}

            {/* 2. IMPORT DEDUCTION FILE VIEW (spreadsheet reviewing & editing!) */}
            {activeTab === 'import' && (
              <motion.div 
                key="import"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-8"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider rounded-md">
                        Dynamic ETL Ingestion
                      </span>
                      {parsedRawSheet && (
                        <span className="text-xs text-slate-400 font-medium font-mono">
                          {parsedRawSheet.fileName}
                        </span>
                      )}
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight font-headline mt-1">
                      Import Deduction Workbook
                    </h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                      Upload any Excel or CSV workbook, normalize columns, exclude unnecessary fields, and adjust allocations before deploying to member ledgers.
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2">
                    {/* View Switcher if a sheet was parsed */}
                    {parsedRawSheet && (
                      <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                        <button
                          onClick={() => setImportWorkflowStage('normalization')}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition ${
                            importWorkflowStage === 'normalization'
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Sanitization & Account Cleaner
                        </button>
                        <button
                          onClick={() => setImportWorkflowStage('review')}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition ${
                            importWorkflowStage === 'review'
                              ? 'bg-slate-900 text-white shadow-sm'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Review & Ledger Editor
                        </button>
                      </div>
                    )}

                    {newlyProvisionedMembers.length > 0 && (
                      <button 
                        onClick={() => setShowNewMembersModal(true)}
                        className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm shadow-amber-500/20"
                        title="View and download login credentials roster for newly detected members"
                      >
                        <UserCheck size={15} />
                        New Member Credentials ({newlyProvisionedMembers.length})
                      </button>
                    )}

                    <button 
                      onClick={() => setShowSampleModal(true)}
                      className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm shadow-emerald-900/20"
                      title="Explore, download, or directly load 5 specialized Excel test files"
                    >
                      <FileSpreadsheet size={15} />
                      5 Sample Excel Test Files
                    </button>

                    <button 
                      onClick={handleDownloadTemplate}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-1.5 border border-slate-200"
                      title="Download a clean monthly deduction CSV template"
                    >
                      <DownloadCloud size={15} />
                      Template
                    </button>

                    <button 
                      onClick={handleImportClick}
                      className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 shadow"
                    >
                      <Upload size={15} />
                      Choose Excel Workbook
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

                {/* Import/Parsing State */}
                {isParsing ? (
                  <div className="bg-white border border-slate-100 rounded-[2.5rem] p-16 text-center shadow-sm space-y-4">
                    <RefreshCcw className="w-12 h-12 text-emerald-600 animate-spin mx-auto" />
                    <div>
                      <p className="font-extrabold text-sm text-slate-800 uppercase tracking-widest">Parsing Spreadsheet Cells & Dynamic Columns</p>
                      <p className="text-xs text-slate-500 mt-1">Extracting worksheet headers and running smart alias detection...</p>
                    </div>
                  </div>
                ) : importWorkflowStage === 'normalization' && parsedRawSheet ? (
                  /* 1. Dynamic Column Normalization & Exclusion Workbench */
                  <DynamicNormalizationWorkbench
                    parsedSheet={parsedRawSheet}
                    ceilings={{ ordinarySavingsCeiling, specialSavingsCeiling }}
                    onNormalizedComplete={handleNormalizationComplete}
                    onCancel={() => setImportWorkflowStage('review')}
                    showToast={showToast}
                  />
                ) : (
                  /* 2. Review and Inline Verification Sheet */
                  <div className="space-y-6">
                    {/* Newly Identified Members Alert Banner */}
                    {newlyProvisionedMembers.length > 0 && (
                      <div className="bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 border border-amber-300 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                        <div className="flex items-start sm:items-center gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 font-bold shadow-sm">
                            <UserCheck size={20} />
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-black uppercase tracking-wider text-amber-950 bg-amber-200/80 px-2.5 py-0.5 rounded-md">
                                {newlyProvisionedMembers.length} New Member Accounts Detected
                              </span>
                              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                                Default Password: Surname (lowercase)
                              </span>
                            </div>
                            <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                              These members are not in the current database. Their <strong>Zimco IDs</strong> will be assigned and their default password will be set to their <strong>surname</strong>.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <button
                            onClick={() => setShowNewMembersModal(true)}
                            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-md"
                          >
                            <DownloadCloud size={14} className="text-amber-400" />
                            <span>View & Download Credentials List</span>
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    
                    {/* Left Diagnostic Panel */}
                    <div className="lg:col-span-1 bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm space-y-6 self-start">
                      <h3 className="font-extrabold text-slate-900 text-sm tracking-wider uppercase">Workbook Quality</h3>
                      
                      <div className="space-y-4">
                        <QualityStatBadge label="Total Rows" count={importedRecords.length} type="neutral" />
                        <QualityStatBadge label="Critical Errors" count={errorCount} type="error" />
                        <QualityStatBadge label="Warnings Flagged" count={warnCount} type="warning" />
                        <QualityStatBadge label="Pass Verification" count={validCount} type="success" />
                      </div>

                      <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 text-[11px] leading-relaxed text-amber-800 font-medium">
                        <div className="flex items-center gap-1.5 font-bold uppercase text-amber-950 mb-1">
                          <AlertTriangle size={13} /> Review Guidelines
                        </div>
                        Before pushing deductions, all spreadsheet mathematical mismatch errors must be corrected manually using the inline editor tools.
                      </div>
                    </div>

                    {/* Spreadsheet live editor workspace */}
                    <div className={`bg-white border border-slate-100 shadow-sm overflow-hidden flex flex-col transition-all duration-200 ${
                      isDeductionsTableExpanded 
                        ? 'fixed inset-0 z-[100] rounded-none w-screen h-screen p-4 sm:p-6 bg-white' 
                        : 'lg:col-span-3 rounded-[2rem]'
                    }`}>
                      
                      {/* Live filter tab */}
                      <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="flex items-center gap-2 bg-slate-200/50 p-1 rounded-xl">
                            {(['all', 'error', 'warning', 'valid'] as const).map(f => (
                              <button
                                key={f}
                                onClick={() => setDiagnosticFilter(f)}
                                className={`px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                                  diagnosticFilter === f
                                    ? f === 'error' ? 'bg-rose-600 text-white shadow-sm'
                                    : f === 'warning' ? 'bg-amber-600 text-white shadow-sm'
                                    : f === 'valid' ? 'bg-emerald-600 text-white shadow-sm'
                                    : 'bg-slate-900 text-white shadow-sm'
                                    : 'text-slate-500 hover:text-slate-800'
                                }`}
                              >
                                {f === 'all' ? 'All Rows' : f}
                              </button>
                            ))}
                          </div>
                          {isDeductionsTableExpanded && (
                            <span className="text-xs font-bold text-slate-500 hidden md:inline">
                              Full Screen Spreadsheet View ({activeMonth})
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <input 
                              type="text" 
                              placeholder="Query name or ID..." 
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-600 w-44 font-semibold text-slate-800"
                            />
                          </div>
                          <button
                            id="btn-expand-deductions-table"
                            type="button"
                            onClick={() => setIsDeductionsTableExpanded(!isDeductionsTableExpanded)}
                            className="p-2 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer border border-slate-200/60"
                            title={isDeductionsTableExpanded ? "Restore table size" : "Expand table to full screen"}
                          >
                            {isDeductionsTableExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                          </button>
                        </div>
                      </div>

                      {/* Spreadsheet layout */}
                      <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100 text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider sm:tracking-widest">
                              <th className="px-2.5 sm:px-4 py-2.5 sm:py-4 w-20 sm:w-28 text-[9px] sm:text-[10px]">Member ID</th>
                              <th className="px-2 sm:px-3 py-2.5 sm:py-4 min-w-[90px] sm:min-w-[110px] text-[9px] sm:text-[10px]">Date (D/M/Y)</th>
                              <th className="px-2.5 sm:px-4 py-2.5 sm:py-4 min-w-[120px] sm:min-w-[140px] text-[9px] sm:text-[10px]">Full Name</th>
                              <th className="px-2 sm:px-3 py-2.5 sm:py-4 text-[9px] sm:text-[10px]">OS (₦)</th>
                              <th className="px-2 sm:px-3 py-2.5 sm:py-4 text-[9px] sm:text-[10px]">SS (₦)</th>
                              <th className="px-2 sm:px-3 py-2.5 sm:py-4 text-[9px] sm:text-[10px]">Inv (₦)</th>
                              <th className="px-2 sm:px-3 py-2.5 sm:py-4 text-[9px] sm:text-[10px]">Loan (₦)</th>
                              <th className="px-2 sm:px-3 py-2.5 sm:py-4 text-[9px] sm:text-[10px]">CP (₦)</th>
                              <th className="px-2 sm:px-3 py-2.5 sm:py-4 text-[9px] sm:text-[10px]">MCA (₦)</th>
                              <th className="px-2.5 sm:px-4 py-2.5 sm:py-4 text-right text-[9px] sm:text-[10px]">Sum (₦)</th>
                              <th className="px-2.5 sm:px-4 py-2.5 sm:py-4 text-right text-[9px] sm:text-[10px]">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-[10px] sm:text-xs font-semibold text-slate-700">
                            {displayRows.map(record => {
                              const isEditing = editingRow?.id === record.id;
                              return (
                                <tr 
                                  key={record.id}
                                  className={`hover:bg-slate-50/40 transition-colors ${
                                    record.status === 'error' ? 'bg-rose-50/10' : record.status === 'warning' ? 'bg-amber-50/10' : ''
                                  }`}
                                >
                                  {/* ID */}
                                  <td className="px-2.5 sm:px-4 py-2 sm:py-4 font-mono font-bold text-slate-500 text-[10px] sm:text-xs">
                                    {isEditing ? (
                                      <input 
                                        type="text"
                                        value={editingRow?.id || ''}
                                        onChange={(e) => setEditingRow(prev => prev ? { ...prev, id: e.target.value } : null)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1 text-[10px] sm:text-xs focus:ring-1 focus:ring-emerald-600 font-mono text-slate-800 font-bold"
                                      />
                                    ) : (
                                      <span>{record.id}</span>
                                    )}
                                  </td>

                                  {/* Date */}
                                  <td className="px-2 sm:px-3 py-2 sm:py-4 font-mono text-[9px] sm:text-xs text-slate-600">
                                    {isEditing ? (
                                      <input 
                                        type="text"
                                        value={editingRow?.date || ''}
                                        onChange={(e) => setEditingRow(prev => prev ? { ...prev, date: e.target.value } : null)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1 text-[10px] sm:text-xs focus:ring-1 focus:ring-emerald-600 font-mono text-slate-800"
                                        placeholder="YYYY-MM-DD"
                                      />
                                    ) : (
                                      <span>{record.date || '—'}</span>
                                    )}
                                  </td>

                                  {/* Name & status label info */}
                                  <td className="px-2.5 sm:px-4 py-2 sm:py-4">
                                    {isEditing ? (
                                      <input 
                                        type="text"
                                        value={editingRow?.name || ''}
                                        onChange={(e) => setEditingRow(prev => prev ? { ...prev, name: e.target.value } : null)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1 text-[10px] sm:text-xs focus:ring-1 focus:ring-emerald-600 text-slate-800 font-bold"
                                      />
                                    ) : (
                                      <div>
                                        <p className="font-extrabold text-slate-800 flex items-center gap-1.5 text-[10px] sm:text-xs">
                                          {record.name}
                                          {record.isModified && (
                                            <span className="px-1 py-0.2 bg-amber-100 text-amber-800 text-[7px] sm:text-[8px] rounded font-black uppercase tracking-wider">Modified</span>
                                          )}
                                        </p>
                                        {record.message && (
                                          <p className={`text-[8px] sm:text-[10px] font-bold mt-0.5 sm:mt-1 flex items-center gap-1 leading-normal ${
                                            record.status === 'error' ? 'text-rose-600' : record.status === 'warning' ? 'text-amber-600' : 'text-slate-400'
                                          }`}>
                                            {record.status === 'error' && <AlertTriangle size={11} className="shrink-0" />}
                                            {record.status === 'warning' && <Info size={11} className="shrink-0" />}
                                            {record.status === 'valid' && <CheckCircle2 size={11} className="shrink-0 text-emerald-600" />}
                                            {record.message}
                                          </p>
                                        )}
                                      </div>
                                    )}
                                  </td>

                                  {/* Ordinary Savings */}
                                  <td className="px-2 sm:px-3 py-2 sm:py-4 text-[10px] sm:text-xs font-mono">
                                    {isEditing ? (
                                      <input 
                                        type="number"
                                        value={editingRow?.ordinarySavings ?? 0}
                                        onChange={(e) => setEditingRow(prev => prev ? { ...prev, ordinarySavings: Number(e.target.value) } : null)}
                                        className="w-16 sm:w-20 bg-slate-50 border border-slate-200 rounded-lg p-1 text-[10px] sm:text-xs focus:ring-1 focus:ring-emerald-600 font-mono text-slate-800"
                                      />
                                    ) : (
                                      <span>₦{record.ordinarySavings.toLocaleString()}</span>
                                    )}
                                  </td>

                                  {/* Special Savings */}
                                  <td className="px-2 sm:px-3 py-2 sm:py-4 text-[10px] sm:text-xs font-mono">
                                    {isEditing ? (
                                      <input 
                                        type="number"
                                        value={editingRow?.specialSavings ?? 0}
                                        onChange={(e) => setEditingRow(prev => prev ? { ...prev, specialSavings: Number(e.target.value) } : null)}
                                        className="w-16 sm:w-20 bg-slate-50 border border-slate-200 rounded-lg p-1 text-[10px] sm:text-xs focus:ring-1 focus:ring-emerald-600 font-mono text-slate-800"
                                      />
                                    ) : (
                                      <span>₦{record.specialSavings.toLocaleString()}</span>
                                    )}
                                  </td>

                                  {/* Investment Account */}
                                  <td className="px-2 sm:px-3 py-2 sm:py-4 text-[10px] sm:text-xs font-mono">
                                    {isEditing ? (
                                      <input 
                                        type="number"
                                        value={editingRow?.investment ?? 0}
                                        onChange={(e) => setEditingRow(prev => prev ? { ...prev, investment: Number(e.target.value) } : null)}
                                        className="w-16 sm:w-20 bg-slate-50 border border-slate-200 rounded-lg p-1 text-[10px] sm:text-xs focus:ring-1 focus:ring-emerald-600 font-mono text-slate-800"
                                      />
                                    ) : (
                                      <span>₦{(record.investment || 0).toLocaleString()}</span>
                                    )}
                                  </td>

                                  {/* Loan Payback */}
                                  <td className="px-2 sm:px-3 py-2 sm:py-4 text-[10px] sm:text-xs font-mono">
                                    {isEditing ? (
                                      <input 
                                        type="number"
                                        value={editingRow?.loanReimbursement ?? 0}
                                        onChange={(e) => setEditingRow(prev => prev ? { ...prev, loanReimbursement: Number(e.target.value) } : null)}
                                        className="w-16 sm:w-20 bg-slate-50 border border-slate-200 rounded-lg p-1 text-[10px] sm:text-xs focus:ring-1 focus:ring-emerald-600 font-mono text-slate-800"
                                      />
                                    ) : (
                                      <span>₦{record.loanReimbursement.toLocaleString()}</span>
                                    )}
                                  </td>

                                  {/* Commodity Purchase */}
                                  <td className="px-2 sm:px-3 py-2 sm:py-4 text-[10px] sm:text-xs font-mono">
                                    {isEditing ? (
                                      <input 
                                        type="number"
                                        value={editingRow?.commodityPurchase ?? 0}
                                        onChange={(e) => setEditingRow(prev => prev ? { ...prev, commodityPurchase: Number(e.target.value) } : null)}
                                        className="w-16 sm:w-20 bg-slate-50 border border-slate-200 rounded-lg p-1 text-[10px] sm:text-xs focus:ring-1 focus:ring-emerald-600 font-mono text-slate-800"
                                      />
                                    ) : (
                                      <span>₦{(record.commodityPurchase || 0).toLocaleString()}</span>
                                    )}
                                  </td>

                                  {/* Muslim Community */}
                                  <td className="px-2 sm:px-3 py-2 sm:py-4 text-[10px] sm:text-xs font-mono">
                                    {isEditing ? (
                                      <input 
                                        type="number"
                                        value={editingRow?.muslimCommunity ?? 0}
                                        onChange={(e) => setEditingRow(prev => prev ? { ...prev, muslimCommunity: Number(e.target.value) } : null)}
                                        className="w-16 sm:w-20 bg-slate-50 border border-slate-200 rounded-lg p-1 text-[10px] sm:text-xs focus:ring-1 focus:ring-emerald-600 font-mono text-slate-800"
                                      />
                                    ) : (
                                      <span>₦{(record.muslimCommunity || 0).toLocaleString()}</span>
                                    )}
                                  </td>

                                  {/* Row Total */}
                                  <td className="px-2.5 sm:px-4 py-2 sm:py-4 text-right font-mono">
                                    {isEditing ? (
                                      <div>
                                        <input 
                                          type="number"
                                          value={editingRow?.total ?? 0}
                                          onChange={(e) => setEditingRow(prev => prev ? { ...prev, total: Number(e.target.value) } : null)}
                                          className="w-20 sm:w-24 bg-slate-50 border border-emerald-500 rounded-lg p-1 text-[10px] sm:text-xs font-bold font-mono text-slate-800 text-right focus:ring-1 focus:ring-emerald-600"
                                        />
                                        <span className="text-[7px] sm:text-[8px] text-emerald-600 block mt-0.5 sm:mt-1 font-bold">
                                          Calc: ₦{((editingRow?.ordinarySavings || 0) + (editingRow?.specialSavings || 0) + (editingRow?.investment || 0) + (editingRow?.commodityPurchase || 0) + (editingRow?.loanReimbursement || 0) + (editingRow?.muslimCommunity || 0)).toLocaleString()}
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="text-xs sm:text-sm font-black text-slate-800">
                                        ₦{(record.ordinarySavings + record.specialSavings + (record.investment || 0) + (record.commodityPurchase || 0) + record.loanReimbursement + (record.muslimCommunity || 0)).toLocaleString()}
                                      </span>
                                    )}
                                  </td>

                                  {/* Row actions */}
                                  <td className="px-2.5 sm:px-4 py-2 sm:py-4 text-right">
                                    <div className="flex items-center justify-end gap-1 sm:gap-2">
                                      {isEditing ? (
                                        <>
                                          <button 
                                            onClick={handleSaveEdit}
                                            className="p-1 px-2 sm:px-2.5 bg-emerald-600 text-white rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-wider hover:bg-emerald-700 transition"
                                          >
                                            Save
                                          </button>
                                          <button 
                                            onClick={() => setEditingRow(null)}
                                            className="p-1 px-2 sm:px-2.5 bg-slate-100 text-slate-500 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-wider hover:bg-slate-200 transition"
                                          >
                                            Cancel
                                          </button>
                                        </>
                                      ) : (
                                        <>
                                          <button 
                                            onClick={() => setEditingRow({ ...record })}
                                            className="p-1 sm:p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition"
                                            title="Edit allocations cell"
                                          >
                                            <Edit3 size={13} />
                                          </button>
                                          {record.status === 'warning' && (
                                            <button 
                                              onClick={() => handleBypassWarning(record.id)}
                                              className="p-1 bg-amber-50 text-amber-700 text-[8px] sm:text-[9px] font-black rounded-lg uppercase tracking-wider hover:bg-amber-100 transition"
                                            >
                                              Bypass
                                            </button>
                                          )}
                                          <button 
                                            onClick={() => handleDeleteRow(record.id, record.name)}
                                            className="p-1 sm:p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                            title="Delete entry"
                                          >
                                            <Trash2 size={13} />
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                            {displayRows.length === 0 && (
                              <tr>
                                <td colSpan={11} className="text-center py-12 text-slate-400">
                                  <div className="flex flex-col items-center justify-center gap-3">
                                    <FileSpreadsheet className="w-10 h-10 text-emerald-600/50" />
                                    <div>
                                      <p className="text-sm font-black text-slate-800">No Ingestion Records Loaded</p>
                                      <p className="text-xs text-slate-500 max-w-sm mt-0.5">
                                        Upload your June 2026 payroll deduction workbook (.xlsx, .xls, or .csv) to populate the spreadsheet ledger.
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                      <button
                                        type="button"
                                        onClick={handleImportClick}
                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-2 shadow-sm"
                                      >
                                        <Upload size={14} />
                                        <span>Choose Excel File</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setShowSampleModal(true)}
                                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                                      >
                                        Load Sample Test Workbook
                                      </button>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Deploy Ledger Action Footer */}
                      <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <p className="text-xs font-bold text-slate-800">Deploy Sheet Status</p>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                            {importedRecords.length === 0
                              ? 'No spreadsheet records loaded yet. Upload your payroll file to deploy.'
                              : errorCount > 0 
                                ? `${errorCount} critical mathematical mismatches must be resolved.` 
                                : 'Workbook certified. Ready to deploy allocations.'}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {newlyProvisionedMembers.length > 0 && (
                            <button
                              onClick={() => setShowNewMembersModal(true)}
                              className="px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-all"
                            >
                              <UserCheck size={14} className="text-amber-600" />
                              <span>Login Credentials ({newlyProvisionedMembers.length})</span>
                            </button>
                          )}

                          <button 
                            onClick={handlePushToMembers}
                            disabled={errorCount > 0 || importedRecords.length === 0}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow transition-all ${
                              errorCount > 0 || importedRecords.length === 0
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-none shadow-none'
                                : 'bg-primary hover:bg-emerald-800 text-on-primary hover:shadow-lg'
                            }`}
                          >
                            <Sparkles size={14} />
                            Approve & Push Directly to Member Accounts
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              )}
              </motion.div>
            )}

            {/* 3. EXPORT DEDUCTION FILE VIEW (Reversion controls & next month preparation!) */}
            {activeTab === 'export' && (
              <motion.div 
                key="export"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-8"
              >
                <div>
                  <h1 className="text-3xl font-black text-slate-900 tracking-tight font-headline">Export & Cycle Reset Workbench</h1>
                  <p className="text-sm text-slate-500 mt-1">Export active finalized payroll spreadsheets, and configure automatic reversion mechanics for next month's deductions.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Controls column */}
                  <div className="lg:col-span-1 bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm space-y-6">
                    <h3 className="font-extrabold text-slate-900 text-sm tracking-wider uppercase">Reversion Rules & Settings</h3>
                    
                    <div className="space-y-5 pt-2">
                      {/* Toggle Auto-revert */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <label className="block text-xs font-extrabold text-slate-800">Auto-revert Modified Amounts</label>
                          <p className="text-[10px] text-slate-400 leading-normal font-medium">Revert temporary allocations back to previous defaults in the next month's template.</p>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={revertOnNextMonth}
                          onChange={(e) => setRevertOnNextMonth(e.target.checked)}
                          className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 accent-emerald-600 mt-1"
                        />
                      </div>

                      {/* Toggle Zero out Commodity */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <label className="block text-xs font-extrabold text-slate-800">Zero-out Commodity Purchases</label>
                          <p className="text-[10px] text-slate-400 leading-normal font-medium">Reset commodity finance deduction values back to ₦0 in next month's roster list.</p>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={zeroOutCommodityNextMonth}
                          onChange={(e) => setZeroOutCommodityNextMonth(e.target.checked)}
                          className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 accent-emerald-600 mt-1"
                        />
                      </div>

                      {/* Toggle Zero out Loan Repayments */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <label className="block text-xs font-extrabold text-slate-800">Zero-out Loan Repayments</label>
                          <p className="text-[10px] text-slate-400 leading-normal font-medium">Reset loan reimbursement values back to ₦0 next cycle unless re-authorized.</p>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={zeroOutLoansNextMonth}
                          onChange={(e) => setZeroOutLoansNextMonth(e.target.checked)}
                          className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 accent-emerald-600 mt-1"
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-[11px] leading-relaxed text-emerald-800 font-medium">
                      <span className="font-bold text-emerald-950 block mb-1">Deduction Cycle Lock Memo</span>
                      All active modifications are safely isolated. Exporting next month's preview clears out unrenewed transaction balances automatically.
                    </div>
                  </div>

                  {/* Right Sheet Workspace column */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* List of modifications tracking */}
                    <div className={`bg-white border border-slate-100 shadow-sm overflow-hidden flex flex-col transition-all duration-200 ${
                      isNextMonthTableExpanded
                        ? 'fixed inset-0 z-[100] rounded-none w-screen h-screen p-4 sm:p-6 bg-white'
                        : 'rounded-[2rem] p-6'
                    }`}>
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <h3 className="font-extrabold text-slate-900 text-sm tracking-wider uppercase">Tracked Modifications (Current Cycle)</h3>
                        <button
                          id="btn-expand-next-month-table"
                          type="button"
                          onClick={() => setIsNextMonthTableExpanded(!isNextMonthTableExpanded)}
                          className="p-2 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer border border-slate-200/60"
                          title={isNextMonthTableExpanded ? "Restore table size" : "Expand table to full screen"}
                        >
                          {isNextMonthTableExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                        </button>
                      </div>
                      
                      {modifiedRecords.length === 0 ? (
                        <div className="py-8 text-center text-slate-400 font-semibold space-y-1 bg-slate-50/50 rounded-2xl border border-dashed border-slate-100">
                          <p className="text-xs font-bold text-slate-650">No temporary modifications logged</p>
                          <p className="text-[10px] uppercase tracking-widest">Adjust cells in the review sheet to track reversion changes</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                <th className="py-3">Member Details</th>
                                <th className="py-3">Savings Change (OS / SS)</th>
                                <th className="py-3">Next Month Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                              {modifiedRecords.map(r => (
                                <tr key={r.id}>
                                  <td className="py-3.5">
                                    <p className="font-extrabold text-slate-800">{r.name}</p>
                                    <p className="text-[9px] font-mono text-slate-400 mt-0.5">{r.id}</p>
                                  </td>
                                  <td className="py-3.5 space-y-1">
                                    <p className="text-[10px] text-slate-500">
                                      OS: ₦{r.originalValues?.ordinarySavings.toLocaleString()} → <span className="font-extrabold text-emerald-600">₦{r.ordinarySavings.toLocaleString()}</span>
                                    </p>
                                    <p className="text-[10px] text-slate-500">
                                      SS: ₦{r.originalValues?.specialSavings.toLocaleString()} → <span className="font-extrabold text-blue-600">₦{r.specialSavings.toLocaleString()}</span>
                                    </p>
                                  </td>
                                  <td className="py-3.5">
                                    <span className="px-2 py-1 bg-amber-50 text-amber-700 text-[9px] font-black rounded uppercase tracking-wider">
                                      {revertOnNextMonth ? 'Revert to original default' : 'Keep Modified values'}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* Dual export cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Current Month Export */}
                      <div className="bg-[#091e14] text-white border border-[#143224] rounded-[2rem] p-6 shadow-sm flex flex-col justify-between min-h-[16rem] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full"></div>
                        <div>
                          <span className="text-[9px] bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded uppercase tracking-wider">Active Batch export</span>
                          <h4 className="text-lg font-bold mt-2">Final Current Cycle Workbook</h4>
                          <p className="text-[11px] text-slate-350 text-slate-400 mt-1 leading-relaxed">
                            Download the finalized, reviewed deductions sheet representing modified values active for the current month.
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 pt-4">
                          <button 
                            onClick={() => handleExportFile('xlsx', false)}
                            className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-1.5"
                          >
                            <FileSpreadsheet size={14} />
                            Excel (.xlsx)
                          </button>
                          <button 
                            onClick={() => handleExportFile('csv', false)}
                            className="w-full py-2.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 border border-emerald-800 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-1.5"
                          >
                            <DownloadCloud size={14} />
                            CSV (.csv)
                          </button>
                        </div>
                      </div>

                      {/* Next Month Template Prep */}
                      <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm flex flex-col justify-between min-h-[16rem] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-bl-full"></div>
                        <div>
                          <span className="text-[9px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded uppercase tracking-wider">Next Month sheet prep</span>
                          <h4 className="text-lg font-bold mt-2">Next Month Ledger Template</h4>
                          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                            Generate the base template file for next month's deductions. Temporary modified cells revert back to their default state automatically.
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 pt-4">
                          <button 
                            onClick={() => handleExportFile('xlsx', true)}
                            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-1.5"
                          >
                            <FileSpreadsheet size={14} />
                            Excel (.xlsx)
                          </button>
                          <button 
                            onClick={() => handleExportFile('csv', true)}
                            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-1.5"
                          >
                            <DownloadCloud size={14} />
                            CSV (.csv)
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </motion.div>
            )}

            {/* 4. RECONCILIATION CHECK VIEW */}
            {activeTab === 'reconcile' && (
              <motion.div 
                key="reconcile"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
              >
                <DatabaseReconciliationCheck 
                  importedRecords={importedRecords}
                  firestoreMembers={firestoreMembers}
                  ceilings={{ ordinarySavingsCeiling, specialSavingsCeiling }}
                  activeMonth={activeMonth}
                  onUpdateRecord={handleUpdateImportedRecord}
                  onAlignAllWithDatabase={handleAlignAllWithDatabase}
                  onAddOmittedMemberToSheet={handleAddOmittedMemberToSheet}
                  showToast={showToast}
                />
              </motion.div>
            )}

            {/* 5. BURSARY NEXT-MONTH DISPATCH VIEW */}
            {activeTab === 'bursary_dispatch' && (
              <motion.div 
                key="bursary_dispatch"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
              >
                <BursaryNextMonthDispatch 
                  importedRecords={importedRecords}
                  firestoreMembers={firestoreMembers}
                  currentMonth={activeMonth}
                  showToast={showToast}
                />
              </motion.div>
            )}

            {/* 5. SETTINGS VIEW */}
            {activeTab === 'settings' && (
              <motion.div 
                key="settings"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-8"
              >
                <div>
                  <h1 className="text-3xl font-black text-slate-900 tracking-tight font-headline">Bursary Configuration Settings</h1>
                  <p className="text-sm text-slate-500 mt-1">Configure monthly deduction thresholds, automatic alerting preference loops, and cycle scheduling lockdates.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* General limits configuration card */}
                  <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm space-y-6">
                    <h3 className="font-extrabold text-slate-900 text-sm tracking-wider uppercase">Deduction Threshold Ceilings</h3>
                    
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-700">Ordinary Savings (OS) Limit / Month</label>
                        <input 
                          type="number" 
                          value={ordinarySavingsCeiling}
                          onChange={(e) => setOrdinarySavingsCeiling(Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:ring-1 focus:ring-emerald-600 font-mono text-slate-800"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-700">Special Savings (SS) Limit / Month</label>
                        <input 
                          type="number" 
                          value={specialSavingsCeiling}
                          onChange={(e) => setSpecialSavingsCeiling(Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:ring-1 focus:ring-emerald-600 font-mono text-slate-800"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-700">Auto Reconciliation Margin Tolerance (₦)</label>
                        <input 
                          type="number" 
                          value={autoReconciliationTolerance}
                          onChange={(e) => setAutoReconciliationTolerance(Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:ring-1 focus:ring-emerald-600 font-mono text-slate-800"
                        />
                      </div>
                    </div>
                  </div>

                  {/* System behavior settings card */}
                  <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm space-y-6">
                    <h3 className="font-extrabold text-slate-900 text-sm tracking-wider uppercase">Cycle Locking & Alerting Rules</h3>
                    
                    <div className="space-y-4">
                      {/* Cycle lockout day */}
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-700">Deductions Locking Day (Every Month)</label>
                        <select 
                          value={lockoutDate} 
                          onChange={(e) => setLockoutDate(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:ring-1 focus:ring-emerald-600 text-slate-800 font-bold"
                        >
                          <option value="20">20th of the month</option>
                          <option value="22">22nd of the month</option>
                          <option value="25">25th of the month (Default)</option>
                          <option value="28">28th of the month</option>
                        </select>
                      </div>

                      {/* SMS & Email alert checkboxes */}
                      <div className="pt-2 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-700">Send SMS Notification to Members on Sync</label>
                          <input 
                            type="checkbox" 
                            checked={notificationSms}
                            onChange={(e) => setNotificationSms(e.target.checked)}
                            className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 accent-emerald-600"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-700">Send Email Notification to Members on Sync</label>
                          <input 
                            type="checkbox" 
                            checked={notificationEmail}
                            onChange={(e) => setNotificationEmail(e.target.checked)}
                            className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 accent-emerald-600"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save parameters action bar */}
                <div className="bg-white border border-slate-100 rounded-[1.5rem] p-6 shadow-sm flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500 leading-normal">
                    * Modifying settings changes active compliance bounds for spreadsheet parsing algorithms in real-time.
                  </span>
                  <button 
                    onClick={() => showToast('Bursary threshold settings saved successfully.', 'success')}
                    className="px-6 py-2.5 bg-primary hover:bg-emerald-800 text-on-primary rounded-xl text-xs font-black uppercase tracking-widest shadow transition-all"
                  >
                    Save Changes
                  </button>
                </div>
              </motion.div>
            )}

            {/* 6. MEMBER DIRECTORY & ROSTER TAB */}
            {activeTab === 'members' && (
              <motion.div 
                key="members"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
              >
                <AdminMemberDirectory
                  importedRecords={importedRecords}
                  firestoreMembers={firestoreMembers}
                  showToast={showToast}
                />
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>

      {/* 5 Specialized Sample Excel Test Files Modal */}
      <SampleExcelTestModal
        isOpen={showSampleModal}
        onClose={() => setShowSampleModal(false)}
        onSelectSampleForWorkbench={(parsedSheet) => {
          setParsedRawSheet(parsedSheet);
          setImportWorkflowStage('normalization');
          setIsImported(true);
        }}
        showToast={showToast}
      />

      {/* Follow-up Interface: Downloadable Credentials List for Newly Ingested Members */}
      <NewMembersCredentialModal
        isOpen={showNewMembersModal}
        onClose={() => setShowNewMembersModal(false)}
        newMembers={newlyProvisionedMembers}
        activeMonth={activeMonth}
        showToast={showToast}
      />
    </div>
  );
}

/* SUB COMPONENTS */

function SidebarTabLink({ label, icon, active, badge, badgeColor = 'bg-primary', collapsed = false, onClick }: { 
  label: string; 
  icon: React.ReactNode; 
  active: boolean; 
  badge?: string; 
  badgeColor?: string;
  collapsed?: boolean;
  onClick: () => void;
}) {
  return (
    <button 
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={`w-full flex items-center gap-3 px-3.5 py-2.5 transition-all duration-200 rounded-xl text-xs uppercase tracking-wider font-bold ${
        collapsed ? 'lg:justify-center' : 'justify-between'
      } ${
        active 
          ? 'bg-[#143224] text-white shadow-md shadow-emerald-950/10' 
          : 'text-slate-400 hover:text-white hover:bg-white/5'
      }`}
    >
      <div className="flex items-center gap-3 truncate">
        <span className="shrink-0">{icon}</span>
        {!collapsed && <span className="truncate">{label}</span>}
      </div>
      {badge && !collapsed && (
        <span className={`px-2 py-0.5 ${badgeColor} text-white text-[9px] font-black rounded-full shrink-0`}>
          {badge}
        </span>
      )}
      {badge && collapsed && (
        <span className={`w-2 h-2 ${badgeColor} rounded-full shrink-0 absolute top-2 right-2`}></span>
      )}
    </button>
  );
}

function DashboardStatCard({ label, value, subValue, icon, color }: { 
  label: string; 
  value: string; 
  subValue: string; 
  icon: React.ReactNode; 
  color: string;
}) {
  return (
    <div className={`bg-white rounded-3xl p-6 shadow-sm border border-slate-100 ${color}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div>
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
        <p className="text-2xl font-black text-slate-800 mt-0.5 tracking-tight">{value}</p>
        <p className="text-[10px] text-slate-400 font-semibold mt-1 leading-normal">{subValue}</p>
      </div>
    </div>
  );
}

function CategoryWeightBar({ label, value, total, color }: { 
  label: string; 
  value: number; 
  total: number; 
  color: string;
}) {
  const percent = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs font-semibold">
        <span className="text-slate-500 font-extrabold">{label}</span>
        <span className="text-slate-800 font-black">₦{value.toLocaleString()} ({percent.toFixed(1)}%)</span>
      </div>
      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
        <div className={`${color} h-full`} style={{ width: `${percent}%` }}></div>
      </div>
    </div>
  );
}

function ChecklistRow({ label, status, text }: { 
  label: string; 
  status: 'complete' | 'caution' | 'warning' | 'pending'; 
  text: string;
}) {
  return (
    <div className="py-3.5 flex items-start gap-3 text-xs">
      <div className="mt-0.5 shrink-0">
        {status === 'complete' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
        {status === 'caution' && <Info className="w-4 h-4 text-amber-500" />}
        {status === 'warning' && <AlertTriangle className="w-4 h-4 text-rose-500 animate-bounce" />}
        {status === 'pending' && <Clock className="w-4 h-4 text-slate-400" />}
      </div>
      <div>
        <p className="font-extrabold text-slate-800">{label}</p>
        <p className="text-[10px] text-slate-400 font-semibold mt-0.5 leading-normal">{text}</p>
      </div>
    </div>
  );
}

function QualityStatBadge({ label, count, type }: { 
  label: string; 
  count: number; 
  type: 'neutral' | 'error' | 'warning' | 'success';
}) {
  return (
    <div className={`p-3 rounded-2xl flex items-center justify-between text-xs font-bold border ${
      type === 'error' ? 'bg-rose-50 border-rose-100 text-rose-800' :
      type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-800' :
      type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
      'bg-slate-50 border-slate-100 text-slate-700'
    }`}>
      <span>{label}</span>
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase text-white ${
        type === 'error' ? 'bg-rose-600' :
        type === 'warning' ? 'bg-amber-600' :
        type === 'success' ? 'bg-emerald-600' :
        'bg-slate-700'
      }`}>{count}</span>
    </div>
  );
}
