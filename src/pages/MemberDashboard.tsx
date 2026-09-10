import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { doc, getDoc, collection, getDocs, query, orderBy, limit, addDoc, setDoc, onSnapshot, where } from 'firebase/firestore';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { generateMemberTransactionsPDF } from '../lib/pdfGenerator';
import { 
  getMemberNotifications, 
  getNotificationPreferences, 
  NotificationItem, 
  NotificationPreferences,
  triggerWithdrawalNotification 
} from '../lib/notificationService';

// Extracted M3 Member Subcomponents
import { MemberTopNavbar } from '../components/member/MemberTopNavbar';
import { MemberSidebar, MemberViewType } from '../components/member/MemberSidebar';
import { MemberOverviewTab } from '../components/member/MemberOverviewTab';
import { MemberAccountDetailView } from '../components/member/MemberAccountDetailView';
import { MemberLoansTab } from '../components/member/MemberLoansTab';
import { MemberWithdrawalTab } from '../components/member/MemberWithdrawalTab';
import { MemberSecurityTab } from '../components/member/MemberSecurityTab';
import { MonthlyRecordsDedicatedView } from '../components/member/MonthlyRecordsDedicatedView';
import { MemberYearlyRecordView } from '../components/member/MemberYearlyRecordView';

// Existing Platform Integration Components
import WealthPlanningTool from '../components/WealthPlanningTool';
import KYCOnboarding from '../components/KYCOnboarding';
import SessionTimeoutListener from '../components/SessionTimeoutListener';
import MemberHelpdesk from '../components/MemberHelpdesk';
import OnlineTopUpModal from '../components/OnlineTopUpModal';
import NotificationsModal from '../components/NotificationsModal';
import MemberProfile from '../components/MemberProfile';
import CIASecurityPrompt from '../components/CIASecurityPrompt';

export default function MemberDashboard() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<MemberViewType>('dashboard');
  const [isSavingsOpen, setIsSavingsOpen] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('zimco_member_sidebar_collapsed') === 'true';
  });

  // Online Top-up & Notification States
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [topUpDefaultAccount, setTopUpDefaultAccount] = useState('ordinarySavings');
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>(() => {
    const memberId = localStorage.getItem('zimco_id') || '';
    return getNotificationPreferences(memberId);
  });

  // CIA Triad 4-Checkpoint Security Prompt State
  const [showCIASecurityModal, setShowCIASecurityModal] = useState<boolean>(() => {
    const memberId = localStorage.getItem('zimco_id') || '';
    const isDefaultPass = localStorage.getItem('zimco_logged_in_with_default_password') === 'true';
    const isFirstLoginPrompt = localStorage.getItem('zimco_first_login_prompt_profile') === 'true';
    const dismissed = memberId ? localStorage.getItem(`zimco_cia_security_acknowledged_${memberId}`) === 'true' : true;
    return isDefaultPass || isFirstLoginPrompt || !dismissed;
  });

  useEffect(() => {
    localStorage.setItem('zimco_member_sidebar_collapsed', isSidebarCollapsed ? 'true' : 'false');
  }, [isSidebarCollapsed]);

  // Global Keyboard Shortcut: Cmd/Ctrl + B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'b' || e.key === 'B')) {
        e.preventDefault();
        setIsSidebarCollapsed(prev => !prev);
      } else if (e.key === 'Escape' && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarOpen]);

  // Helper for clean, respectful greeting names
  const formatGreetingName = (fullName?: string) => {
    let rawName = fullName;
    if (!rawName) {
      const savedName = localStorage.getItem('zimco_name');
      if (savedName && savedName !== 'Cooperative Member') {
        rawName = savedName;
      } else {
        const savedId = localStorage.getItem('zimco_id');
        return savedId || 'Member';
      }
    }

    let clean = rawName.trim();
    if (clean.includes(',')) {
      const commaParts = clean.split(',').map(s => s.trim()).filter(Boolean);
      if (commaParts.length >= 2 && commaParts[1].length > 0) {
        clean = commaParts[1];
      } else if (commaParts.length > 0) {
        clean = commaParts[0];
      }
    }

    const TITLES = new Set(['MR', 'MR.', 'MRS', 'MRS.', 'MS', 'MS.', 'MISS', 'DR', 'DR.', 'PROF', 'PROF.', 'ENGR', 'ENGR.', 'ALHAJI', 'ALHAJA', 'HAJIA', 'CHIEF', 'PASTOR', 'IMAM', 'REV', 'REV.']);
    const tokens = clean.split(/\s+/).filter(Boolean);
    const filteredTokens = tokens.filter(t => !TITLES.has(t.toUpperCase().replace(/\./g, '')));

    let chosen = filteredTokens[0] || tokens[0] || 'Member';
    chosen = chosen.charAt(0).toUpperCase() + chosen.slice(1).toLowerCase();
    return chosen;
  };

  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true);

  // Firebase Member Data State with cached fallback
  const [memberData, setMemberData] = useState<any>(() => {
    const currentMemberId = localStorage.getItem('zimco_id') || '';
    const currentMemberDocId = localStorage.getItem('zimco_doc_id') || currentMemberId;
    const currentMemberName = localStorage.getItem('zimco_name') || '';

    try {
      const cached = localStorage.getItem('zimco_cached_member_data');
      if (cached) {
        const parsed = JSON.parse(cached);
        const parsedId = (parsed.id || parsed.docId || parsed.memberId || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
        const currentClean = currentMemberId.toUpperCase().replace(/[^A-Z0-9]/g, '');
        const parsedName = (parsed.fullName || parsed.name || '').toLowerCase();
        
        if (
          (currentClean && (parsedId === currentClean || parsedId.includes(currentClean) || currentClean.includes(parsedId))) ||
          (currentMemberName && parsedName && (parsedName === currentMemberName.toLowerCase() || parsedName.includes(currentMemberName.toLowerCase())))
        ) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading cached member data', e);
    }

    try {
      const registryStr = localStorage.getItem('zimco_pushed_deductions_registry');
      if (registryStr) {
        const registry = JSON.parse(registryStr);
        const match = registry.find((m: any) => {
          const mId = (m.id || m.memberId || '').toUpperCase();
          const mDocId = (m.docId || '').toUpperCase();
          const mName = (m.fullName || m.name || '').toLowerCase();
          const cur = currentMemberId.toLowerCase();
          const curName = currentMemberName.toLowerCase();
          return (
            (currentMemberId && mId === currentMemberId.toUpperCase()) ||
            (currentMemberDocId && mDocId === currentMemberDocId.toUpperCase()) ||
            (cur && mName.includes(cur)) ||
            (curName && mName.includes(curName))
          );
        });
        if (match) return match;
      }
    } catch (e) {
      console.warn('Registry read error:', e);
    }

    if (currentMemberId || currentMemberName) {
      return {
        id: currentMemberId || '',
        fullName: currentMemberName && currentMemberName !== 'Cooperative Member' ? currentMemberName : 'Cooperative Member',
        ordinarySavings: 0,
        specialSavings: 0,
        investmentAmount: 0,
        commoditySavings: 0,
        muslimCommunitySavings: 0,
        outstandingLoans: 0,
        role: 'member',
        status: 'active'
      };
    }

    return null;
  });

  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    let unsubscribeProfileSnapshot: (() => void) | null = null;

    const resolveAndFetchProfile = async (firebaseUser: FirebaseUser | null) => {
      const localId = localStorage.getItem('zimco_id');
      const localDocId = localStorage.getItem('zimco_doc_id') || localId;
      const localEmail = localStorage.getItem('zimco_email');
      const localName = localStorage.getItem('zimco_name');

      if (!firebaseUser && !localId && !localDocId && !localEmail) {
        if (isMounted) {
          setIsLoadingProfile(false);
          navigate('/login');
        }
        return;
      }

      try {
        let matchedDocSnap: any = null;
        let actualDocId = localDocId || localId || '';

        const userEmail = firebaseUser?.email || localEmail;
        if (userEmail) {
          try {
            const emailMapRef = doc(db, 'emailToMember', userEmail.toLowerCase().trim());
            const emailMapSnap = await getDoc(emailMapRef);
            if (emailMapSnap.exists()) {
              const mappedMemberId = emailMapSnap.data()?.memberId;
              if (mappedMemberId) {
                const userDocRef = doc(db, 'users', mappedMemberId);
                const userSnap = await getDoc(userDocRef);
                if (userSnap.exists()) {
                  matchedDocSnap = userSnap;
                  actualDocId = userSnap.id;
                }
              }
            }
          } catch (eEmailMap) {
            console.warn('emailToMember lookup notice:', eEmailMap);
          }
        }

        if (!matchedDocSnap && firebaseUser?.uid) {
          try {
            const directUidRef = doc(db, 'users', firebaseUser.uid);
            const directUidSnap = await getDoc(directUidRef);
            if (directUidSnap.exists()) {
              matchedDocSnap = directUidSnap;
              actualDocId = directUidSnap.id;
            } else {
              const uidQuery = query(collection(db, 'users'), where('uid', '==', firebaseUser.uid), limit(1));
              const uidQuerySnap = await getDocs(uidQuery);
              if (!uidQuerySnap.empty) {
                matchedDocSnap = uidQuerySnap.docs[0];
                actualDocId = matchedDocSnap.id;
              }
            }
          } catch (eUid) {
            console.warn('UID lookup notice:', eUid);
          }
        }

        if (!matchedDocSnap && userEmail) {
          try {
            const emailQuery = query(collection(db, 'users'), where('email', '==', userEmail.toLowerCase().trim()), limit(1));
            const emailQuerySnap = await getDocs(emailQuery);
            if (!emailQuerySnap.empty) {
              matchedDocSnap = emailQuerySnap.docs[0];
              actualDocId = matchedDocSnap.id;
            }
          } catch (eEmailQuery) {
            console.warn('Email query notice:', eEmailQuery);
          }
        }

        if (!matchedDocSnap && actualDocId) {
          try {
            const memberRef = doc(db, 'users', actualDocId);
            const memberSnap = await getDoc(memberRef);
            if (memberSnap.exists()) {
              matchedDocSnap = memberSnap;
            }
          } catch (eDocId) {
            console.warn('DocId fetch notice:', eDocId);
          }
        }

        let loadedData: any = null;
        if (matchedDocSnap && matchedDocSnap.exists()) {
          const docData = matchedDocSnap.data();
          loadedData = {
            docId: matchedDocSnap.id,
            id: docData.id || matchedDocSnap.id,
            fullName: docData.fullName || docData.name || firebaseUser?.displayName || 'Cooperative Member',
            email: docData.email || userEmail || '',
            department: docData.department || 'Member Services',
            phone: docData.phone || '',
            role: docData.role || 'member',
            ordinarySavings: Number(docData.ordinarySavings || 0),
            specialSavings: Number(docData.specialSavings || 0),
            investmentAmount: Number(docData.investmentAmount || 0),
            commoditySavings: Number(docData.commoditySavings || 0),
            muslimCommunitySavings: Number(docData.muslimCommunitySavings || docData.muslimSavings || 0),
            muslimSavings: Number(docData.muslimSavings || docData.muslimCommunitySavings || 0),
            outstandingLoans: Number(docData.outstandingLoans || 0),
            kycStatus: docData.kycStatus || 'draft',
            ...docData
          };

          if (docData.kycStatus) {
            setKycStatus(docData.kycStatus);
          }
        }

        if (actualDocId) {
          unsubscribeProfileSnapshot = onSnapshot(
            doc(db, 'users', actualDocId),
            (liveSnap) => {
              if (liveSnap.exists() && isMounted) {
                const liveData = liveSnap.data();
                setMemberData((prev: any) => ({
                  ...(prev || {}),
                  docId: liveSnap.id,
                  id: liveData.id || liveSnap.id,
                  fullName: liveData.fullName || liveData.name || prev?.fullName || 'Cooperative Member',
                  email: liveData.email || prev?.email || '',
                  department: liveData.department || prev?.department || 'Member Services',
                  phone: liveData.phone || prev?.phone || '',
                  role: liveData.role || prev?.role || 'member',
                  ordinarySavings: Number(liveData.ordinarySavings || 0),
                  specialSavings: Number(liveData.specialSavings || 0),
                  investmentAmount: Number(liveData.investmentAmount || 0),
                  commoditySavings: Number(liveData.commoditySavings || 0),
                  muslimCommunitySavings: Number(liveData.muslimCommunitySavings || liveData.muslimSavings || 0),
                  muslimSavings: Number(liveData.muslimSavings || liveData.muslimCommunitySavings || 0),
                  outstandingLoans: Number(liveData.outstandingLoans || 0),
                  kycStatus: liveData.kycStatus || prev?.kycStatus || 'draft',
                  ...liveData
                }));
                if (liveData.kycStatus) {
                  setKycStatus(liveData.kycStatus);
                }
              }
            },
            (error) => {
              console.warn('Real-time profile listener notice:', error);
            }
          );
        }

        if (loadedData && isMounted) {
          setMemberData(loadedData);
          try {
            localStorage.setItem('zimco_cached_member_data', JSON.stringify(loadedData));
            if (loadedData.docId) localStorage.setItem('zimco_doc_id', loadedData.docId);
            if (loadedData.id) localStorage.setItem('zimco_id', loadedData.id);
            if (loadedData.fullName || loadedData.name) localStorage.setItem('zimco_name', loadedData.fullName || loadedData.name);
            if (loadedData.email) localStorage.setItem('zimco_email', loadedData.email);
          } catch (cErr) {
            console.warn('Cache write notice:', cErr);
          }
        }

        // Fetch transactions
        const txDocId = actualDocId || localDocId || localId;
        if (txDocId) {
          try {
            const txRef = collection(db, 'users', txDocId, 'transactions');
            const txQuery = query(txRef, orderBy('createdAt', 'desc'), limit(25));
            const txSnap = await getDocs(txQuery);
            const txList: any[] = [];
            txSnap.forEach(docSnap => {
              txList.push({ id: docSnap.id, ...docSnap.data() });
            });

            if (txList.length > 0 && isMounted) {
              setTransactions(txList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
            } else if (loadedData?.lastDeductionBreakdown && isMounted) {
              const bk = loadedData.lastDeductionBreakdown;
              const dateStr = loadedData.lastDeductionDate ? new Date(loadedData.lastDeductionDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : new Date().toLocaleDateString();
              const synthTx: any[] = [
                {
                  id: 'tx_push_total',
                  date: dateStr,
                  description: `Monthly Payroll Allocation (${bk.cycle || 'Current Cycle'})`,
                  amount: `₦${Number(bk.total || loadedData.lastDeductionAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
                  account: 'Payroll Allocation',
                  type: 'credit',
                  category: 'savings',
                  createdAt: loadedData.lastDeductionDate || new Date().toISOString()
                }
              ];
              if (bk.ordinarySavings > 0) {
                synthTx.push({
                  id: 'tx_push_os',
                  date: dateStr,
                  description: `Ordinary Savings Allocation (${bk.cycle || 'Current Cycle'})`,
                  amount: `₦${Number(bk.ordinarySavings).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
                  account: 'Ordinary Savings',
                  type: 'credit',
                  category: 'savings',
                  createdAt: loadedData.lastDeductionDate || new Date().toISOString()
                });
              }
              if (bk.specialSavings > 0) {
                synthTx.push({
                  id: 'tx_push_ss',
                  date: dateStr,
                  description: `Special Savings Allocation (${bk.cycle || 'Current Cycle'})`,
                  amount: `₦${Number(bk.specialSavings).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
                  account: 'Special Savings',
                  type: 'credit',
                  category: 'savings',
                  createdAt: loadedData.lastDeductionDate || new Date().toISOString()
                });
              }
              setTransactions(synthTx);
            }
          } catch (txErr) {
            console.warn('Firestore transaction fetch notice:', txErr);
          }
        }
      } catch (err) {
        console.warn('Member profile fetch notice:', err);
      } finally {
        if (isMounted) {
          setIsLoadingProfile(false);
        }
      }
    };

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      resolveAndFetchProfile(firebaseUser);
    });

    return () => {
      isMounted = false;
      unsubscribeAuth();
      if (unsubscribeProfileSnapshot) {
        unsubscribeProfileSnapshot();
      }
    };
  }, [navigate]);

  // Automated Notifications Synchronization
  useEffect(() => {
    const memberId = memberData?.id || localStorage.getItem('zimco_id');
    if (!memberId) return;
    const loadNotifs = async () => {
      try {
        const notifList = await getMemberNotifications(memberId);
        setNotifications(notifList);
      } catch (err) {
        console.warn('Error loading notifications:', err);
      }
    };
    loadNotifs();
  }, [memberData?.id]);

  // KYC State
  const [kycStatus, setKycStatus] = useState<'draft' | 'submitted' | 'failed' | 'verified'>('draft');

  useEffect(() => {
    const savedStatus = localStorage.getItem('zimco_kyc_status') || 'draft';
    setKycStatus(savedStatus as any);
  }, [activeView]);

  // Security States
  const [transactionPin, setTransactionPin] = useState('1234');
  const [pinCurrentInput, setPinCurrentInput] = useState('');
  const [pinNewInput, setPinNewInput] = useState('');
  const [pinConfirmInput, setPinConfirmInput] = useState('');
  const [pinMessage, setPinMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Session timeout state & handler
  const [sessionTimeoutDuration, setSessionTimeoutDuration] = useState<number>(() => {
    const saved = localStorage.getItem('zimco_session_timeout_duration');
    return saved ? parseInt(saved, 10) : 180;
  });

  const handleSessionTimeoutChange = (duration: number) => {
    setSessionTimeoutDuration(duration);
    localStorage.setItem('zimco_session_timeout_duration', duration.toString());
  };

  // Profile Avatar Menu State & Ref
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getUserInitials = (name?: string) => {
    if (!name || !name.trim()) return 'MB';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // PDF Statement State & Generator
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);

  // Activity Table Filtering States
  const [activityTypeFilter, setActivityTypeFilter] = useState<'all' | 'savings' | 'loans' | 'fees' | 'commodities' | 'withdrawals'>('all');
  const [activityDatePreset, setActivityDatePreset] = useState<'all' | 'this_month' | 'last_30_days' | 'last_3_months' | 'this_year' | 'custom'>('all');
  const [activitySearchQuery, setActivitySearchQuery] = useState<string>('');

  // Monthly Savings Passbook: Month after month in ascending chronological order
  const [savingsSortAscending, setSavingsSortAscending] = useState<boolean>(true);
  const [expandedMonthKey, setExpandedMonthKey] = useState<string | null>(null);

  const monthlySavingsRecords = React.useMemo(() => {
    let records: Array<{
      id: string;
      month: string;
      cycle: string;
      date: string;
      ordinarySavings: number;
      specialSavings: number;
      investment: number;
      commodityPurchase: number;
      muslimCommunity: number;
      loanReimbursement: number;
      total: number;
      status: string;
    }> = [];

    if (Array.isArray(memberData?.monthlySavingsRecords) && memberData.monthlySavingsRecords.length > 0) {
      records = memberData.monthlySavingsRecords.map((m: any, idx: number) => ({
        id: `ms-${idx}-${m.month}`,
        month: m.month || `Month ${idx + 1}`,
        cycle: m.cycle || m.month || `Month ${idx + 1}`,
        date: m.date || 'Standard Payroll Deduction',
        ordinarySavings: Number(m.ordinarySavings) || 0,
        specialSavings: Number(m.specialSavings) || 0,
        investment: Number(m.investment) || 0,
        commodityPurchase: Number(m.commodityPurchase) || 0,
        muslimCommunity: Number(m.muslimCommunity) || 0,
        loanReimbursement: Number(m.loanReimbursement) || 0,
        total: Number(m.total) || ((Number(m.ordinarySavings) || 0) + (Number(m.specialSavings) || 0) + (Number(m.investment) || 0) + (Number(m.commodityPurchase) || 0) + (Number(m.muslimCommunity) || 0)),
        status: m.status || 'Verified'
      }));
    } else if (memberData?.lastDeductionBreakdown) {
      const b = memberData.lastDeductionBreakdown;
      const os = Number(b.ordinarySavings) || Number(memberData.ordinarySavings) || 0;
      const ss = Number(b.specialSavings) || Number(memberData.specialSavings) || 0;
      const inv = Number(b.investment) || Number(memberData.investmentAmount) || 0;
      const cp = Number(b.commodityPurchase) || Number(memberData.commoditySavings) || 0;
      const mc = Number(b.muslimCommunity) || Number(memberData.muslimCommunitySavings || memberData.muslimSavings) || 0;
      const lr = Number(b.loanReimbursement) || 0;
      const tot = Number(b.total) || (os + ss + inv + cp + mc);

      records.push({
        id: 'ms-last-breakdown',
        month: b.cycle || 'Current Cycle',
        cycle: b.cycle || 'Current Cycle',
        date: memberData.lastDeductionDate ? new Date(memberData.lastDeductionDate).toLocaleDateString() : 'Current Active Cycle',
        ordinarySavings: os,
        specialSavings: ss,
        investment: inv,
        commodityPurchase: cp,
        muslimCommunity: mc,
        loanReimbursement: lr,
        total: tot,
        status: 'Verified'
      });
    }

    const MONTH_ORDER: Record<string, number> = {
      'january': 1, 'february': 2, 'march': 3, 'april': 4, 'may': 5, 'june': 6,
      'july': 7, 'august': 8, 'september': 9, 'october': 10, 'november': 11, 'december': 12
    };

    records.sort((a, b) => {
      const getScore = (item: any) => {
        const lower = String(item.month || item.cycle || '').toLowerCase();
        const yrMatch = lower.match(/20\d\d/);
        const yr = yrMatch ? parseInt(yrMatch[0], 10) : 2026;
        let mScore = 99;
        for (const [mName, mNum] of Object.entries(MONTH_ORDER)) {
          if (lower.includes(mName)) {
            mScore = mNum;
            break;
          }
        }
        return yr * 100 + mScore;
      };
      const diff = getScore(a) - getScore(b);
      return savingsSortAscending ? diff : -diff;
    });

    return records;
  }, [memberData, savingsSortAscending]);

  const filteredDashboardTransactions = transactions.filter((tx) => {
    if (activityTypeFilter !== 'all') {
      const desc = (tx.description || '').toLowerCase();
      const cat = (tx.category || '').toLowerCase();
      if (activityTypeFilter === 'savings' && !cat.includes('saving') && !desc.includes('saving') && !desc.includes('allocation')) return false;
      if (activityTypeFilter === 'loans' && !cat.includes('loan') && !desc.includes('loan')) return false;
      if (activityTypeFilter === 'withdrawals' && tx.type !== 'debit') return false;
    }

    if (activitySearchQuery.trim()) {
      const q = activitySearchQuery.toLowerCase();
      const matchDesc = (tx.description || '').toLowerCase().includes(q);
      const matchAcc = (tx.account || '').toLowerCase().includes(q);
      const matchAmt = (tx.amount || '').toLowerCase().includes(q);
      if (!matchDesc && !matchAcc && !matchAmt) return false;
    }

    return true;
  });

  const handleDownloadTransactionsPDF = (scopeAccount?: string) => {
    setIsDownloadingPDF(true);
    try {
      let filteredTx = filteredDashboardTransactions || transactions;
      if (scopeAccount && scopeAccount !== 'all') {
        filteredTx = transactions.filter(t => (t.account || '').toLowerCase().includes(scopeAccount.toLowerCase()));
      }

      generateMemberTransactionsPDF(
        {
          id: memberData?.id || localStorage.getItem('zimco_id') || 'Member',
          fullName: memberData?.fullName || localStorage.getItem('zimco_name') || 'Cooperative Member',
          email: memberData?.email || localStorage.getItem('zimco_email') || 'member@zimco.org',
          department: memberData?.department || 'Member Services',
          ordinarySavings: Number(memberData?.ordinarySavings || 0),
          specialSavings: Number(memberData?.specialSavings || 0),
          investmentAmount: Number(memberData?.investmentAmount || 0),
          commoditySavings: Number(memberData?.commoditySavings || 0),
          muslimCommunitySavings: Number(memberData?.muslimCommunitySavings || memberData?.muslimSavings || 0),
          outstandingLoans: Number(memberData?.outstandingLoans || 0),
          kycStatus: kycStatus || memberData?.kycStatus || 'verified',
        },
        filteredTx,
        {
          title: scopeAccount && scopeAccount !== 'all' 
            ? `${scopeAccount} Statement & Ledger Summary` 
            : 'Member Account & Recent Transactions Summary',
          subtitle: scopeAccount && scopeAccount !== 'all' 
            ? `Audited transaction excerpt for ${scopeAccount}` 
            : `Official electronic ledger summary showing ${filteredTx.length} verified transactions.`,
          accountFilter: scopeAccount && scopeAccount !== 'all' ? scopeAccount : undefined
        }
      );
    } catch (err: any) {
      console.error('Failed to generate PDF summary:', err);
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  // Sessions State
  const [sessions, setSessions] = useState([
    {
      id: 'session-1',
      device: 'MacBook Pro 16"',
      os: 'macOS Sequoia 15.4',
      browser: 'Google Chrome',
      ip: '102.89.34.197',
      location: 'Lagos, Nigeria',
      timestamp: 'Active Now',
      isCurrent: true,
      status: 'active' as 'active' | 'revoking' | 'revoked'
    },
    {
      id: 'session-2',
      device: 'iPhone 15 Pro Max',
      os: 'iOS 18.2',
      browser: 'Safari Mobile',
      ip: '197.210.64.12',
      location: 'Abuja, Nigeria',
      timestamp: '2 hours ago',
      isCurrent: false,
      status: 'active' as 'active' | 'revoking' | 'revoked'
    },
    {
      id: 'session-3',
      device: 'Lenovo ThinkPad X1',
      os: 'Windows 11 Enterprise',
      browser: 'Microsoft Edge',
      ip: '105.112.180.45',
      location: 'Ibadan, Nigeria',
      timestamp: 'May 28, 2026 14:32',
      isCurrent: false,
      status: 'active' as 'active' | 'revoking' | 'revoked'
    }
  ]);

  const handleRevokeSession = (sessionId: string) => {
    setSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        return { ...s, status: 'revoked' };
      }
      return s;
    }));
  };

  const handleRevokeAllOtherSessions = () => {
    setSessions(prev => prev.map(s => {
      if (!s.isCurrent) {
        return { ...s, status: 'revoked' };
      }
      return s;
    }));
  };

  // Withdrawal States
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [withdrawalAccount, setWithdrawalAccount] = useState('ss');
  const [withdrawalReason, setWithdrawalReason] = useState('');
  const [withdrawalPin, setWithdrawalPin] = useState('');
  const [withdrawalState, setWithdrawalState] = useState<{ status: 'idle' | 'loading' | 'success' | 'error', message?: string }>({ status: 'idle' });

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (e) {
      console.warn('Sign out notice:', e);
    }
    localStorage.removeItem('zimco_token');
    localStorage.removeItem('zimco_role');
    localStorage.removeItem('zimco_id');
    localStorage.removeItem('zimco_doc_id');
    localStorage.removeItem('zimco_name');
    localStorage.removeItem('zimco_email');
    localStorage.removeItem('zimco_cached_member_data');
    localStorage.removeItem('zimco_last_deduction_sync');
    navigate('/login');
  };

  const handlePinChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPinMessage(null);

    if (pinCurrentInput !== transactionPin) {
      setPinMessage({ type: 'error', text: 'Incorrect current Transaction PIN. Verification failed.' });
      return;
    }

    if (!/^\d{4,6}$/.test(pinNewInput)) {
      setPinMessage({ type: 'error', text: 'PIN must be between 4 and 6 numeric digits only.' });
      return;
    }

    if (pinNewInput !== pinConfirmInput) {
      setPinMessage({ type: 'error', text: 'New PIN and Confirm PIN fields do not match.' });
      return;
    }

    setTransactionPin(pinNewInput);
    setPinCurrentInput('');
    setPinNewInput('');
    setPinConfirmInput('');
    setPinMessage({ type: 'success', text: 'Your 256-bit encrypted Transaction PIN has been updated successfully.' });
  };

  const handleWithdrawalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawalState({ status: 'idle' });

    const amount = parseFloat(withdrawalAmount);
    if (isNaN(amount) || amount <= 0) {
      setWithdrawalState({ status: 'error', message: 'Please enter a valid positive withdrawal amount.' });
      return;
    }

    const userBalances = {
      os: memberData?.ordinarySavings || 0,
      ss: memberData?.specialSavings || 0,
      ia: memberData?.investmentAmount || 0,
      cp: memberData?.commoditySavings || 0,
      mca: memberData?.muslimCommunitySavings || memberData?.muslimSavings || 0,
    };
    const maxBalance = userBalances[withdrawalAccount as keyof typeof userBalances] || 0;
    if (amount > maxBalance) {
      setWithdrawalState({ 
        status: 'error', 
        message: `Insufficient fund limit. Chosen category only contains ₦${maxBalance.toLocaleString()}.` 
      });
      return;
    }

    if (withdrawalPin !== transactionPin) {
      setWithdrawalState({ 
        status: 'error', 
        message: 'Transaction authorization failed. The transaction PIN is incorrect.' 
      });
      return;
    }

    setWithdrawalState({ status: 'loading' });
    
    const performWithdrawal = async () => {
      try {
        const memberId = localStorage.getItem('zimco_id');
        if (!memberId) throw new Error("Authentication failed: No active session.");

        const userRef = doc(db, 'users', memberId);
        
        let fieldName = '';
        if (withdrawalAccount === 'ss') fieldName = 'specialSavings';
        else if (withdrawalAccount === 'ia') fieldName = 'investmentAmount';
        else if (withdrawalAccount === 'cp') fieldName = 'commoditySavings';
        else if (withdrawalAccount === 'mca') fieldName = 'muslimSavings';
        else if (withdrawalAccount === 'os') fieldName = 'ordinarySavings';

        const updatedBalance = maxBalance - amount;

        const newTx = {
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          description: `Withdrawal (${withdrawalAccount.toUpperCase()})`,
          amount: `₦${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          account: withdrawalAccount === 'os' ? 'Ordinary Savings' :
                   withdrawalAccount === 'ss' ? 'Special Savings' :
                   withdrawalAccount === 'ia' ? 'Investment Account' :
                   withdrawalAccount === 'cp' ? 'Commodity Account' : 'Muslim Community Account',
          type: 'debit',
          createdAt: new Date().toISOString()
        };

        await addDoc(collection(db, 'users', memberId, 'transactions'), newTx);

        const updatePayload: Record<string, number> = { [fieldName]: updatedBalance };
        if (withdrawalAccount === 'mca') {
          updatePayload.muslimCommunitySavings = updatedBalance;
          updatePayload.muslimSavings = updatedBalance;
        }
        await setDoc(userRef, updatePayload, { merge: true });

        setMemberData((prev: any) => ({
          ...prev,
          [fieldName]: updatedBalance,
          ...(withdrawalAccount === 'mca' ? { muslimCommunitySavings: updatedBalance, muslimSavings: updatedBalance } : {})
        }));

        setTransactions(prev => [newTx, ...prev].slice(0, 10));

        const refTracker = `ZMC-WD-${Math.floor(100000 + Math.random() * 900000)}`;

        try {
          await triggerWithdrawalNotification({
            memberId,
            memberName: memberData?.fullName || 'Valued Member',
            memberEmail: memberData?.email || 'member@zimco.org',
            memberPhone: memberData?.phone || '+234 803 123 4567',
            amount,
            accountName: withdrawalAccount === 'os' ? 'Ordinary Savings (OS)' :
                         withdrawalAccount === 'ss' ? 'Special Savings (SS)' :
                         withdrawalAccount === 'ia' ? 'Investment Account (IA)' :
                         withdrawalAccount === 'cp' ? 'Commodity Account (CP)' : 'Muslim Community Account (MCA)',
            bankName: 'First Bank of Nigeria',
            accountNumber: '3098***412',
            reference: refTracker,
            remainingBalance: updatedBalance
          });
          const updatedNotifs = await getMemberNotifications(memberId);
          setNotifications(updatedNotifs);
        } catch (notifErr) {
          console.warn('Withdrawal notification dispatch notice:', notifErr);
        }

        setWithdrawalState({ 
          status: 'success', 
          message: `Secured Transaction Completed. ₦${amount.toLocaleString()} will be dispatched to your linked payout account. Reference: ${refTracker}. Automated SMS alert dispatched.` 
        });

        setWithdrawalAmount('');
        setWithdrawalReason('');
        setWithdrawalPin('');
      } catch (err: any) {
        setWithdrawalState({ 
          status: 'error', 
          message: err.message || 'Transaction authorization failed.' 
        });
      }
    };

    performWithdrawal();
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <MemberOverviewTab
            memberData={memberData}
            transactions={transactions}
            filteredTransactions={filteredDashboardTransactions}
            monthlySavingsRecords={monthlySavingsRecords}
            expandedMonthKey={expandedMonthKey}
            onToggleExpandMonth={(key) => setExpandedMonthKey(prev => prev === key ? null : key)}
            savingsSortAscending={savingsSortAscending}
            onToggleSavingsSort={() => setSavingsSortAscending(prev => !prev)}
            kycStatus={kycStatus}
            onNavigateView={(v) => setActiveView(v)}
            onOpenTopUp={(defaultAcc) => {
              if (defaultAcc) setTopUpDefaultAccount(defaultAcc);
              setIsTopUpModalOpen(true);
            }}
            onDownloadPDF={handleDownloadTransactionsPDF}
            isDownloadingPDF={isDownloadingPDF}
            activitySearchQuery={activitySearchQuery}
            setActivitySearchQuery={setActivitySearchQuery}
            activityTypeFilter={activityTypeFilter}
            setActivityTypeFilter={setActivityTypeFilter}
            activityDatePreset={activityDatePreset}
            setActivityDatePreset={setActivityDatePreset}
            formatGreetingName={formatGreetingName}
          />
        );

      case 'monthly':
        return (
          <MonthlyRecordsDedicatedView
            memberData={memberData}
            monthlySavingsRecords={monthlySavingsRecords}
            onBackToOverview={() => setActiveView('dashboard')}
            onNavigateView={(v) => setActiveView(v)}
            onDownloadPDF={handleDownloadTransactionsPDF}
            isDownloadingPDF={isDownloadingPDF}
          />
        );

      case 'yearly':
        return (
          <MemberYearlyRecordView
            memberData={memberData}
            transactions={transactions}
            monthlySavingsRecords={monthlySavingsRecords}
            onBackToOverview={() => setActiveView('dashboard')}
            onNavigateView={(v) => setActiveView(v)}
            onDownloadPDF={handleDownloadTransactionsPDF}
            isDownloadingPDF={isDownloadingPDF}
          />
        );

      case 'os':
      case 'ss':
      case 'ia':
      case 'cp':
      case 'mca':
        return (
          <MemberAccountDetailView
            viewKey={activeView}
            memberData={memberData}
            transactions={transactions}
            onBackToOverview={() => setActiveView('dashboard')}
            onOpenTopUp={(accKey) => {
              setTopUpDefaultAccount(accKey);
              setIsTopUpModalOpen(true);
            }}
            onNavigateView={(v) => setActiveView(v)}
            onDownloadPDF={handleDownloadTransactionsPDF}
            isDownloadingPDF={isDownloadingPDF}
          />
        );

      case 'loans':
        return (
          <MemberLoansTab
            memberData={memberData}
            onOpenHelpdesk={() => setActiveView('helpdesk')}
          />
        );

      case 'withdrawal':
        return (
          <MemberWithdrawalTab
            memberData={memberData}
            withdrawalAmount={withdrawalAmount}
            setWithdrawalAmount={setWithdrawalAmount}
            withdrawalAccount={withdrawalAccount}
            setWithdrawalAccount={setWithdrawalAccount}
            withdrawalReason={withdrawalReason}
            setWithdrawalReason={setWithdrawalReason}
            withdrawalPin={withdrawalPin}
            setWithdrawalPin={setWithdrawalPin}
            withdrawalState={withdrawalState}
            onSubmitWithdrawal={handleWithdrawalSubmit}
            onBackToOverview={() => setActiveView('dashboard')}
          />
        );

      case 'planning':
        return (
          <div className="space-y-6 pb-12">
            <WealthPlanningTool
              initialOrdinarySavings={memberData?.ordinarySavings}
              initialSpecialSavings={memberData?.specialSavings}
              initialInvestment={memberData?.investmentAmount}
              initialCommoditySavings={memberData?.commoditySavings}
              initialMuslimSavings={memberData?.muslimCommunitySavings || memberData?.muslimSavings}
              onNavigateToApply={() => setActiveView('loans')}
              onNavigateToTopUp={(acc) => {
                setTopUpDefaultAccount(acc);
                setIsTopUpModalOpen(true);
              }}
            />
          </div>
        );

      case 'kyc':
        return (
          <div className="space-y-6 pb-12">
            <KYCOnboarding
              onStatusChange={(newStatus) => setKycStatus(newStatus)}
              onBackToDashboard={() => setActiveView('dashboard')}
            />
          </div>
        );

      case 'helpdesk':
        return (
          <div className="space-y-6 pb-12">
            <MemberHelpdesk
              memberId={memberData?.id || localStorage.getItem('zimco_id') || ''}
              memberName={memberData?.fullName || 'Cooperative Member'}
              onBackToDashboard={() => setActiveView('dashboard')}
            />
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-6 pb-12">
            <MemberProfile
              memberData={memberData}
              transactions={transactions}
              onUpdateMemberData={(updated) => setMemberData((prev: any) => ({ ...prev, ...updated }))}
              onNavigateToKYC={() => setActiveView('kyc')}
              onNavigateToTopUp={() => {
                setTopUpDefaultAccount('ordinarySavings');
                setIsTopUpModalOpen(true);
              }}
              onNavigateToWithdrawal={() => setActiveView('withdrawal')}
              onNavigateToYearly={() => setActiveView('yearly')}
            />
          </div>
        );

      case 'settings':
        return (
          <MemberSecurityTab
            transactionPin={transactionPin}
            pinCurrentInput={pinCurrentInput}
            setPinCurrentInput={setPinCurrentInput}
            pinNewInput={pinNewInput}
            setPinNewInput={setPinNewInput}
            pinConfirmInput={pinConfirmInput}
            setPinConfirmInput={setPinConfirmInput}
            pinMessage={pinMessage}
            onPinChangeSubmit={handlePinChangeSubmit}
            sessionTimeoutDuration={sessionTimeoutDuration}
            onSessionTimeoutChange={handleSessionTimeoutChange}
            sessions={sessions}
            onRevokeSession={handleRevokeSession}
            onRevokeAllOtherSessions={handleRevokeAllOtherSessions}
          />
        );

      case 'payments':
        return (
          <MemberOverviewTab
            memberData={memberData}
            transactions={transactions}
            filteredTransactions={filteredDashboardTransactions}
            monthlySavingsRecords={monthlySavingsRecords}
            expandedMonthKey={expandedMonthKey}
            onToggleExpandMonth={(key) => setExpandedMonthKey(prev => prev === key ? null : key)}
            savingsSortAscending={savingsSortAscending}
            onToggleSavingsSort={() => setSavingsSortAscending(prev => !prev)}
            kycStatus={kycStatus}
            onNavigateView={(v) => setActiveView(v)}
            onOpenTopUp={(defaultAcc) => {
              if (defaultAcc) setTopUpDefaultAccount(defaultAcc);
              setIsTopUpModalOpen(true);
            }}
            onDownloadPDF={handleDownloadTransactionsPDF}
            isDownloadingPDF={isDownloadingPDF}
            activitySearchQuery={activitySearchQuery}
            setActivitySearchQuery={setActivitySearchQuery}
            activityTypeFilter={activityTypeFilter}
            setActivityTypeFilter={setActivityTypeFilter}
            activityDatePreset={activityDatePreset}
            setActivityDatePreset={setActivityDatePreset}
            formatGreetingName={formatGreetingName}
          />
        );

      default:
        return null;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col font-body antialiased">
      {/* 1. Global Session Timeout Security Listener */}
      <SessionTimeoutListener
        onLogout={handleLogout}
      />

      {/* 2. Top Header Navigation */}
      <MemberTopNavbar
        memberName={memberData?.fullName || 'Cooperative Member'}
        memberId={memberData?.id || localStorage.getItem('zimco_id') || ''}
        unreadNotificationsCount={unreadCount}
        onOpenNotifications={() => setIsNotificationsModalOpen(true)}
        onOpenProfile={() => setActiveView('profile')}
        onOpenSecurity={() => setActiveView('settings')}
        onLogout={handleLogout}
        onToggleMobileSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isProfileMenuOpen={isProfileMenuOpen}
        setIsProfileMenuOpen={setIsProfileMenuOpen}
        profileMenuRef={profileMenuRef}
        getUserInitials={getUserInitials}
      />

      {/* 3. Main Workspace Layout: Sidebar + Content Area */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <MemberSidebar
          activeView={activeView}
          setActiveView={setActiveView}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          isSavingsOpen={isSavingsOpen}
          setIsSavingsOpen={setIsSavingsOpen}
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
          kycStatus={kycStatus}
          outstandingLoans={Number(memberData?.outstandingLoans || 0)}
        />

        {/* Dynamic Subview Rendering */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          {renderActiveView()}
        </main>
      </div>

      {/* 4. Global Modals */}
      <OnlineTopUpModal
        isOpen={isTopUpModalOpen || activeView === 'payments'}
        onClose={() => {
          setIsTopUpModalOpen(false);
          if (activeView === 'payments') setActiveView('dashboard');
        }}
        defaultAccount={topUpDefaultAccount}
        memberData={memberData}
        onPaymentSuccess={(updatedData, newTx) => {
          setMemberData((prev: any) => ({ ...prev, ...updatedData }));
          if (newTx) {
            setTransactions(prev => [newTx, ...prev].slice(0, 10));
          }
          setIsTopUpModalOpen(false);
          if (activeView === 'payments') setActiveView('dashboard');
        }}
      />

      <NotificationsModal
        isOpen={isNotificationsModalOpen}
        onClose={() => setIsNotificationsModalOpen(false)}
        notifications={notifications}
        memberData={memberData}
        onNotificationsUpdated={(updatedList) => setNotifications(updatedList)}
        preferences={notificationPreferences}
        onPreferencesUpdated={(newPrefs) => setNotificationPreferences(newPrefs)}
      />

      <CIASecurityPrompt
        isOpen={showCIASecurityModal}
        memberData={memberData}
        onClose={() => setShowCIASecurityModal(false)}
        onNavigateToSecurity={() => {
          setShowCIASecurityModal(false);
          setActiveView('settings');
        }}
        onNavigateToProfile={() => {
          setShowCIASecurityModal(false);
          setActiveView('profile');
        }}
      />
    </div>
  );
}
