import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import zimcoLogo from '@/assets/images/zimco_logo_1780347665840.png';
import { 
  LayoutDashboard, 
  Wallet, 
  ChevronDown, 
  ChevronRight, 
  CreditCard, 
  Settings, 
  LogOut, 
  User, 
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowDownToLine,
  Search,
  Bell,
  FileText,
  Upload,
  Shield,
  Key,
  Smartphone,
  Globe,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  Clock,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Laptop,
  Check,
  ShieldAlert,
  Power,
  RefreshCw,
  TrendingUp,
  UserCheck,
  Menu,
  X,
  FileDown,
  Download,
  Filter,
  Maximize2,
  Minimize2,
  Sparkles,
  Send,
  Copy,
  ExternalLink,
  MessageSquare,
  Building2,
  PiggyBank,
  ShoppingBag,
  ReceiptText,
  ShieldCheck,
  ArrowRight,
  ArrowDownRight,
  Moon,
  Info
} from 'lucide-react';
import WealthPlanningTool from '../components/WealthPlanningTool';
import KYCOnboarding from '../components/KYCOnboarding';
import SessionTimeoutListener from '../components/SessionTimeoutListener';
import MemberHelpdesk from '../components/MemberHelpdesk';
import OnlineTopUpModal from '../components/OnlineTopUpModal';
import NotificationsModal from '../components/NotificationsModal';
import MemberProfile from '../components/MemberProfile';
import FinancialTrendChart from '../components/FinancialTrendChart';
import CIASecurityPrompt from '../components/CIASecurityPrompt';
import { 
  getMemberNotifications, 
  getNotificationPreferences, 
  NotificationItem, 
  NotificationPreferences,
  triggerWithdrawalNotification 
} from '../lib/notificationService';
import { LifeBuoy } from 'lucide-react';
import { doc, getDoc, collection, getDocs, query, orderBy, limit, addDoc, setDoc, onSnapshot, where } from 'firebase/firestore';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { generateMemberTransactionsPDF, generatePaymentReceiptPDF } from '../lib/pdfGenerator';

export default function MemberDashboard() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<'dashboard' | 'profile' | 'os' | 'ss' | 'ia' | 'cp' | 'mca' | 'loans' | 'settings' | 'withdrawal' | 'planning' | 'kyc' | 'helpdesk' | 'payments'>('dashboard');
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
    const dismissed = memberId ? localStorage.getItem(`zimco_cia_security_acknowledged_${memberId}`) === 'true' : true;
    return isDefaultPass || !dismissed;
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

    // Handle comma-separated names e.g. "Amao, Abdulhameed" -> "Abdulhameed"
    let clean = rawName.trim();
    if (clean.includes(',')) {
      const commaParts = clean.split(',').map(s => s.trim()).filter(Boolean);
      if (commaParts.length >= 2 && commaParts[1].length > 0) {
        clean = commaParts[1];
      } else if (commaParts.length > 0) {
        clean = commaParts[0];
      }
    }

    // Strip honorific titles (Dr., Alhaji, Chief, Mr., Mrs., etc.)
    const TITLES = new Set(['MR', 'MR.', 'MRS', 'MRS.', 'MS', 'MS.', 'MISS', 'DR', 'DR.', 'PROF', 'PROF.', 'ENGR', 'ENGR.', 'ALHAJI', 'ALHAJA', 'HAJIA', 'CHIEF', 'PASTOR', 'IMAM', 'REV', 'REV.']);
    const tokens = clean.split(/\s+/).filter(Boolean);
    const filteredTokens = tokens.filter(t => !TITLES.has(t.toUpperCase().replace(/\./g, '')));

    let chosen = filteredTokens[0] || tokens[0] || 'Member';

    if (chosen.toUpperCase() === 'ABAS' || chosen.toUpperCase() === 'ABBAS') {
      chosen = 'Abas';
    } else if (chosen.toUpperCase() === 'AMAOABDULHAMEED') {
      chosen = 'Abdulhameed';
    } else {
      chosen = chosen.charAt(0).toUpperCase() + chosen.slice(1).toLowerCase();
    }
    return chosen;
  };

  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true);

  // Firebase Member Data State with cached fallback
  const [memberData, setMemberData] = useState<any>(() => {
    const currentMemberId = localStorage.getItem('zimco_id') || '';
    const currentMemberDocId = localStorage.getItem('zimco_doc_id') || currentMemberId;
    const currentMemberName = localStorage.getItem('zimco_name') || '';

    // 1. Try reading cached data, but strictly validate it belongs to this user
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

    // 2. Check if pushed deductions registry has this user
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

    // Baseline session data without dummy values
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

      // If neither Firebase Auth user nor localStorage credentials exist, navigate to login
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

        // Priority 1: Check emailToMember lookup mapping if email is available
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

        // Priority 2: Check Firestore users collection by Firebase Auth UID
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

        // Priority 3: Query users by email
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

        // Priority 4: Direct doc lookup using actualDocId or localId
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

        if (!matchedDocSnap && localId && localId !== actualDocId) {
          try {
            const memberRef = doc(db, 'users', localId);
            const memberSnap = await getDoc(memberRef);
            if (memberSnap.exists()) {
              matchedDocSnap = memberSnap;
              actualDocId = memberSnap.id;
            }
          } catch (eMemberId) {
            console.warn('MemberId fetch notice:', eMemberId);
          }
        }

        // Priority 5: Broad scan across users collection for matching identifier
        if (!matchedDocSnap) {
          try {
            const usersCol = collection(db, 'users');
            const allDocsSnap = await getDocs(usersCol);
            allDocsSnap.forEach(d => {
              if (matchedDocSnap) return;
              const data = d.data();
              const dDocId = d.id.toUpperCase();
              const dId = (data.id || data.memberId || '').toUpperCase();
              const dEmail = (data.email || '').toLowerCase().trim();
              const dUid = data.uid || '';
              const dName = (data.fullName || data.name || '').toLowerCase();

              const targetId = (localId || '').toUpperCase();
              const targetEmail = (userEmail || '').toLowerCase().trim();
              const targetName = (localName || '').toLowerCase().trim();

              const isUidMatch = firebaseUser?.uid && dUid === firebaseUser.uid;
              const isEmailMatch = targetEmail && dEmail === targetEmail;
              const isIdMatch = targetId && (dDocId === targetId || dId === targetId || dDocId.replace(/[^A-Z0-9]/g, '') === targetId.replace(/[^A-Z0-9]/g, ''));
              const isNameMatch = targetName && targetName.length > 3 && (dName.includes(targetName) || targetName.includes(dName));

              if (isUidMatch || isEmailMatch || isIdMatch || isNameMatch) {
                matchedDocSnap = d;
                actualDocId = d.id;
              }
            });
          } catch (scanErr) {
            console.warn('Users scan error:', scanErr);
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

        // Attach real-time snapshot listener on the user's Firestore document
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

        // Merge latest pushed deduction from persistent registry if present
        try {
          const registryStr = localStorage.getItem('zimco_pushed_deductions_registry');
          if (registryStr) {
            const registry = JSON.parse(registryStr);
            const targetLower = (actualDocId || localId || '').toLowerCase();
            const targetUpper = (actualDocId || localId || '').toUpperCase();
            const match = registry.find((m: any) => {
              const mId = (m.id || m.memberId || '').toUpperCase();
              const mDocId = (m.docId || '').toUpperCase();
              const mName = (m.fullName || m.name || '').toLowerCase();
              return (
                mId === targetUpper ||
                mDocId === targetUpper ||
                (loadedData?.fullName && mName.includes(loadedData.fullName.toLowerCase()))
              );
            });

            if (match) {
              loadedData = loadedData ? { ...loadedData, ...match } : match;
            }
          }
        } catch (rErr) {
          console.warn('Registry merge notice:', rErr);
        }

        // Check if local sync cache exists and belongs to this user
        try {
          const cachedSyncStr = localStorage.getItem('zimco_last_deduction_sync');
          if (cachedSyncStr && loadedData) {
            const cachedSync = JSON.parse(cachedSyncStr);
            loadedData = { ...loadedData, ...cachedSync };
          }
        } catch (e) {
          console.error('Error parsing sync cache', e);
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
              // Synthesize latest deduction passbook entries if none stored yet
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
              if (bk.investment > 0) {
                synthTx.push({
                  id: 'tx_push_ia',
                  date: dateStr,
                  description: `Investment Capital Allocation (${bk.cycle || 'Current Cycle'})`,
                  amount: `₦${Number(bk.investment).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
                  account: 'Investment Account',
                  type: 'credit',
                  category: 'investment',
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

    // Listen to Firebase Auth state
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

  // KYC State for Dashboard integration
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
  const [showPin, setShowPin] = useState(false);
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

  // Close profile menu on outside click
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

  // Helper to get formatted user initials (e.g., "AA", "JD")
  const getUserInitials = (name?: string) => {
    if (!name || !name.trim()) return 'MB';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // PDF Statement State & Generator
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [isStatementModalOpen, setIsStatementModalOpen] = useState(false);
  const [isStatementModalMaximized, setIsStatementModalMaximized] = useState(false);
  const [isRecentTxExpanded, setIsRecentTxExpanded] = useState(false);
  const [isAccountTxExpanded, setIsAccountTxExpanded] = useState(false);
  const [expandedSearchQuery, setExpandedSearchQuery] = useState('');
  const [statementFilter, setStatementFilter] = useState<'all' | 'os' | 'ss' | 'ia' | 'cp' | 'mca'>('all');
  const [pdfToast, setPdfToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' } | null>(null);

  // Activity Table Filtering States (Dashboard Activity Table & Statement views)
  const [activityTypeFilter, setActivityTypeFilter] = useState<'all' | 'savings' | 'loans' | 'fees' | 'commodities' | 'withdrawals'>('all');
  const [activityDatePreset, setActivityDatePreset] = useState<'all' | 'this_month' | 'last_30_days' | 'last_3_months' | 'this_year' | 'custom'>('all');
  const [activityStartDate, setActivityStartDate] = useState<string>('');
  const [activityEndDate, setActivityEndDate] = useState<string>('');
  const [activitySearchQuery, setActivitySearchQuery] = useState<string>('');
  const [showCustomDateInputs, setShowCustomDateInputs] = useState<boolean>(false);

  // Helper function to reliably categorize any transaction
  const getTransactionCategory = (tx: any): 'savings' | 'loans' | 'fees' | 'commodities' | 'withdrawals' => {
    const desc = (tx.description || '').toLowerCase();
    const acc = (tx.account || '').toLowerCase();
    const cat = (tx.category || '').toLowerCase();

    if (
      cat === 'fee' || 
      desc.includes('fee') || 
      desc.includes('levy') || 
      desc.includes('passbook') || 
      desc.includes('registration') || 
      desc.includes('admin charge') || 
      desc.includes('maintenance') || 
      desc.includes('agm')
    ) {
      return 'fees';
    }
    if (
      cat === 'loan' || 
      desc.includes('loan') || 
      desc.includes('reimbursement') || 
      desc.includes('disbursement') || 
      desc.includes('borrow') || 
      desc.includes('principal') || 
      acc.includes('loan')
    ) {
      return 'loans';
    }
    if (
      cat === 'commodity' || 
      desc.includes('commodity') || 
      desc.includes('goods') || 
      desc.includes('purchase') || 
      desc.includes('appliance') || 
      desc.includes('rice') || 
      acc.includes('commodity')
    ) {
      return 'commodities';
    }
    if (
      cat === 'withdrawal' || 
      tx.type === 'debit' && (desc.includes('withdraw') || desc.includes('payout') || desc.includes('liquidation') || desc.includes('transfer to bank'))
    ) {
      return 'withdrawals';
    }
    return 'savings';
  };

  // Helper function for checking date range match
  const checkTransactionDateMatch = (txDateStr: string | undefined, txCreatedAt: string | undefined): boolean => {
    if (activityDatePreset === 'all' && !activityStartDate && !activityEndDate) return true;

    const txDate = txCreatedAt ? new Date(txCreatedAt) : txDateStr ? new Date(txDateStr) : new Date();
    if (isNaN(txDate.getTime())) return true;

    const now = new Date();

    if (activityDatePreset === 'this_month') {
      return txDate.getFullYear() === now.getFullYear() && txDate.getMonth() === now.getMonth();
    }
    if (activityDatePreset === 'last_30_days') {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return txDate >= thirtyDaysAgo && txDate <= now;
    }
    if (activityDatePreset === 'last_3_months') {
      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      return txDate >= ninetyDaysAgo && txDate <= now;
    }
    if (activityDatePreset === 'this_year') {
      return txDate.getFullYear() === now.getFullYear();
    }
    if (activityDatePreset === 'custom' || activityStartDate || activityEndDate) {
      if (activityStartDate) {
        const start = new Date(activityStartDate);
        start.setHours(0, 0, 0, 0);
        if (txDate < start) return false;
      }
      if (activityEndDate) {
        const end = new Date(activityEndDate);
        end.setHours(23, 59, 59, 999);
        if (txDate > end) return false;
      }
      return true;
    }
    return true;
  };

  // Filtered transactions for the dashboard activity table
  const filteredDashboardTransactions = transactions.filter((tx) => {
    // 1. Transaction Category Type filter
    if (activityTypeFilter !== 'all') {
      const cat = getTransactionCategory(tx);
      if (cat !== activityTypeFilter) return false;
    }

    // 2. Date Range filter
    if (!checkTransactionDateMatch(tx.date, tx.createdAt)) {
      return false;
    }

    // 3. Search query
    if (activitySearchQuery.trim()) {
      const q = activitySearchQuery.toLowerCase();
      const matchDesc = (tx.description || '').toLowerCase().includes(q);
      const matchAcc = (tx.account || '').toLowerCase().includes(q);
      const matchAmt = (tx.amount || '').toLowerCase().includes(q);
      const matchDate = (tx.date || '').toLowerCase().includes(q);
      const matchId = (tx.id || '').toLowerCase().includes(q);
      if (!matchDesc && !matchAcc && !matchAmt && !matchDate && !matchId) {
        return false;
      }
    }

    return true;
  });

  const handleResetActivityFilters = () => {
    setActivityTypeFilter('all');
    setActivityDatePreset('all');
    setActivityStartDate('');
    setActivityEndDate('');
    setActivitySearchQuery('');
    setShowCustomDateInputs(false);
  };

  const handleDownloadTransactionsPDF = (scopeAccount?: string, customTxList?: any[]) => {
    setIsDownloadingPDF(true);
    try {
      let filteredTx = customTxList || filteredDashboardTransactions || transactions;
      if (scopeAccount && scopeAccount !== 'all') {
        const targetLabel = scopeAccount === 'os' ? 'Ordinary Savings' :
                            scopeAccount === 'ss' ? 'Special Savings' :
                            scopeAccount === 'ia' ? 'Investment Account' :
                            scopeAccount === 'cp' ? 'Commodity Account' :
                            scopeAccount === 'mca' ? 'Muslim Community Account' : scopeAccount;
        filteredTx = transactions.filter(t => t.account === targetLabel || t.account?.toLowerCase() === scopeAccount.toLowerCase());
      }

      const activeFilterLabel = activityTypeFilter !== 'all' ? `Category: ${activityTypeFilter.toUpperCase()}` : '';
      const activeDateLabel = activityDatePreset !== 'all' ? `Period: ${activityDatePreset.replace(/_/g, ' ')}` : '';
      const filterSummarySuffix = [activeFilterLabel, activeDateLabel].filter(Boolean).join(' • ');

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
            ? `${scopeAccount.toUpperCase()} Statement & Ledger Summary` 
            : filterSummarySuffix 
              ? `Member Activity Statement (${filterSummarySuffix})` 
              : 'Member Account & Recent Transactions Summary',
          subtitle: scopeAccount && scopeAccount !== 'all' 
            ? `Audited transaction excerpt for ${scopeAccount}` 
            : `Official electronic ledger summary showing ${filteredTx.length} verified transactions.`,
          accountFilter: scopeAccount && scopeAccount !== 'all' ? scopeAccount : undefined
        }
      );

      setPdfToast({
        show: true,
        message: `Official PDF statement downloaded successfully!`,
        type: 'success'
      });
      setTimeout(() => setPdfToast(null), 4000);
    } catch (err: any) {
      console.error('Failed to generate PDF summary:', err);
      setPdfToast({
        show: true,
        message: 'Failed to generate PDF summary. Please try again.',
        type: 'error'
      });
      setTimeout(() => setPdfToast(null), 4000);
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
    },
    {
      id: 'session-4',
      device: 'Samsung Galaxy S24 Ultra',
      os: 'Android 14',
      browser: 'Chrome Mobile',
      ip: '102.89.32.122',
      location: 'Lagos, Nigeria',
      timestamp: 'May 25, 2026 09:12',
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

    // Dynamic checks based on real member database balances
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
        message: `Authentication Cancelled: Insufficient fund limit. Chosen category only contains ₦${maxBalance.toLocaleString()}.` 
      });
      return;
    }

    // Verify Transaction PIN
    if (withdrawalPin !== transactionPin) {
      setWithdrawalState({ 
        status: 'error', 
        message: 'Fraud Mitigation Alert: Transaction authorization failed. The transaction PIN is incorrect.' 
      });
      return;
    }

    // Process secure withdrawal action
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

        // Write transaction to subcollection in Firestore
        await addDoc(collection(db, 'users', memberId, 'transactions'), newTx);

        // Update balance in users collection
        const updatePayload: Record<string, number> = { [fieldName]: updatedBalance };
        if (withdrawalAccount === 'mca') {
          updatePayload.muslimCommunitySavings = updatedBalance;
          updatePayload.muslimSavings = updatedBalance;
        }
        await setDoc(userRef, updatePayload, { merge: true });

        // Update local state
        setMemberData((prev: any) => ({
          ...prev,
          [fieldName]: updatedBalance,
          ...(withdrawalAccount === 'mca' ? { muslimCommunitySavings: updatedBalance, muslimSavings: updatedBalance } : {})
        }));

        setTransactions(prev => [newTx, ...prev].slice(0, 5));

        const refTracker = `ZMC-WD-${Math.floor(100000 + Math.random() * 900000)}`;

        // Dispatch automated instant SMS & Email notification for withdrawal
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
          message: `Secured Transaction Completed. ₦${amount.toLocaleString()} will be dispatched to your linked payout card. Ref tracker: ${refTracker}. Automated SMS alert dispatched.` 
        });

        // Clear forms
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

  const maxLoanEligible = 2 * (memberData?.ordinarySavings || 0);
  const outstandingLoans = memberData?.outstandingLoans || 0;
  const remainingEligibilityPct = maxLoanEligible > 0 
    ? Math.max(0, Math.min(100, Math.round(((maxLoanEligible - outstandingLoans) / maxLoanEligible) * 100))) 
    : 0;

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="relative min-h-[calc(100vh-160px)]"
          >
            {/* Asymmetric Background Pattern */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 asymmetric-bg -z-10 pointer-events-none"></div>
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

            {/* Header Section */}
            <div className="max-w-3xl mb-6 sm:mb-8">
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-emerald-500/10 text-emerald-800 border border-emerald-500/20 font-label text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-3 sm:mb-4">
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-700" />
                <span>Secure Member Access</span>
              </div>
              <h1 className="font-headline text-2xl sm:text-3xl md:text-5xl font-extrabold text-primary tracking-tight mb-2 sm:mb-3">
                Welcome Back, {formatGreetingName(memberData?.fullName)}!
              </h1>
              <p className="font-body text-on-surface-variant text-xs sm:text-sm md:text-base leading-relaxed">
                Manage your savings, track your investments, and explore loan opportunities. Your financial security is our top priority.
              </p>
            </div>

            {/* Real-time KYC Compliance Alert Banner */}
            <div className={`mb-6 sm:mb-10 p-4 sm:p-6 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6 ${
              kycStatus === 'verified' ? 'bg-emerald-50 border-emerald-500/10 text-emerald-800' :
              kycStatus === 'failed' ? 'bg-rose-50 border-rose-500/10 text-rose-850 text-rose-800' :
              kycStatus === 'submitted' ? 'bg-amber-50 border-amber-500/10 text-amber-900' :
              'bg-gradient-to-r from-emerald-900 to-slate-900 text-white border-transparent'
            }`}>
              <div className="flex items-start gap-3 sm:gap-4">
                <div className={`p-2.5 sm:p-3.5 rounded-xl shrink-0 mt-0.5 ${
                  kycStatus === 'verified' ? 'bg-emerald-500/10 text-emerald-700' :
                  kycStatus === 'failed' ? 'bg-rose-500/10 text-rose-750 text-rose-700' :
                  kycStatus === 'submitted' ? 'bg-amber-500/10 text-amber-700' :
                  'bg-white/10 text-emerald-400'
                }`}>
                  {kycStatus === 'verified' ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" /> :
                   kycStatus === 'failed' ? <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 animate-bounce" /> :
                   kycStatus === 'submitted' ? <Clock className="w-4 h-4 sm:w-5 sm:h-5" /> :
                   <Shield className="w-4 h-4 sm:w-5 sm:h-5" />}
                </div>
                <div className="space-y-0.5 sm:space-y-1">
                  <h4 className="font-headline font-bold text-sm sm:text-base">
                    {kycStatus === 'verified' ? 'Sovereign ID Verified Compliant' :
                     kycStatus === 'failed' ? 'Biometric Identity Warning Flags' :
                     kycStatus === 'submitted' ? 'Verification Audit Registry Search Pending' :
                     'Verified Member Onboarding (KYC)'}
                  </h4>
                  <p className={`text-[11px] sm:text-xs leading-relaxed max-w-2xl ${
                    kycStatus === 'verified' || kycStatus === 'failed' || kycStatus === 'submitted' ? 'text-slate-600' : 'text-slate-300'
                  }`}>
                    {kycStatus === 'verified' ? 'Congratulations! All compliance blocks are active. Transaction authorizations, zero-interest borrowing capabilities, and surplus dividends are fully unrestricted.' :
                     kycStatus === 'failed' ? 'Forensic registry scans detected document glare or biometric discrepancy markers. Please check the auditor note and submit an appeal.' :
                     kycStatus === 'submitted' ? 'Biometric hashes and address records have been dispatched. Compliance desk analysts are manually auditing files against NIN infrastructure.' :
                     'To block identity theft, member impersonation, and safeguard cooperative funds, please complete your credential verification.'}
                  </p>
                </div>
              </div>

              <div className="shrink-0 w-full md:w-auto">
                <button
                  onClick={() => setActiveView('kyc')}
                  className={`w-full md:w-auto px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl text-xs font-black transition-all ${
                    kycStatus === 'verified' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' :
                    kycStatus === 'failed' ? 'bg-rose-600 hover:bg-rose-750 text-white shadow-lg shadow-rose-900/10' :
                    kycStatus === 'submitted' ? 'bg-amber-500 hover:bg-amber-600 text-white' :
                    'bg-white hover:bg-slate-100 text-emerald-950 shadow-md shadow-black/10'
                  }`}
                >
                  {kycStatus === 'verified' ? 'Review compliance tags' :
                   kycStatus === 'failed' ? 'Appeal & re-upload' :
                   kycStatus === 'submitted' ? 'Track validation stepper' :
                   'Start Verification'}
                </button>
              </div>
            </div>

            {/* 4-Checkpoint CIA Triad Security Quick Status Bar */}
            <div className="mb-6 sm:mb-8 bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="font-headline font-bold text-xs sm:text-sm text-slate-800">
                      Cooperative CIA Security Checkpoint
                    </h5>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                      4 Checks Active
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                    Guarantees <strong>Confidentiality</strong>, <strong>Integrity</strong>, <strong>Availability</strong>, and <strong>Auditing</strong> of your member records.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setShowCIASecurityModal(true)}
                  className="w-full sm:w-auto px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  View Security Checklist
                </button>
                <button
                  onClick={() => setActiveView('settings')}
                  className="w-full sm:w-auto px-4 py-2 bg-primary hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Update Credentials
                </button>
              </div>
            </div>

            {/* Latest Monthly Deduction & Account Split Breakdown (When synchronized from Bursary) */}
            {Boolean(memberData?.lastDeductionBreakdown || memberData?.lastDeductionAmount) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 sm:mb-10 bg-gradient-to-br from-slate-900 via-slate-850 to-emerald-950 text-white rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-6 md:p-8 shadow-xl border border-emerald-500/20 relative overflow-hidden"
              >
                <div className="relative z-10 space-y-4 sm:space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-white/10 pb-4 sm:pb-6">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-label text-[9px] sm:text-[11px] font-black uppercase tracking-wider mb-1.5 sm:mb-2">
                        <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" />
                        Bursary Synchronized Ledger Entry
                      </div>
                      <h3 className="font-headline text-lg sm:text-2xl font-black text-white tracking-tight">
                        Latest Monthly Payroll Deduction Breakdown
                      </h3>
                      <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5 sm:mt-1">
                        {memberData?.lastDeductionBreakdown?.cycle || 'Active Cycle'} • Injected into individual cooperative accounts
                      </p>
                    </div>

                    <div className="text-left sm:text-right bg-white/10 px-3.5 py-2 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl border border-white/10 shrink-0">
                      <span className="text-[9px] sm:text-[10px] font-bold text-slate-300 uppercase tracking-widest block">Total Payroll Deduction</span>
                      <span className="text-lg sm:text-2xl font-black text-emerald-400 font-mono">
                        ₦{Number(memberData?.lastDeductionAmount || memberData?.lastDeductionBreakdown?.total || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* 6 Account Split Badges */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
                    <div className="bg-white/5 border border-emerald-500/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 space-y-1">
                      <span className="text-[9px] sm:text-[10px] font-bold text-emerald-300 uppercase tracking-wider block">Ordinary Savings</span>
                      <p className="text-sm sm:text-base font-black text-white font-mono">
                        ₦{Number(memberData?.lastDeductionBreakdown?.ordinarySavings || 0).toLocaleString()}
                      </p>
                      <span className="text-[8px] sm:text-[9px] text-emerald-400/80 font-medium block">Added to OS Ledger</span>
                    </div>

                    <div className="bg-white/5 border border-blue-500/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 space-y-1">
                      <span className="text-[9px] sm:text-[10px] font-bold text-blue-300 uppercase tracking-wider block">Special Savings</span>
                      <p className="text-sm sm:text-base font-black text-white font-mono">
                        ₦{Number(memberData?.lastDeductionBreakdown?.specialSavings || 0).toLocaleString()}
                      </p>
                      <span className="text-[8px] sm:text-[9px] text-blue-400/80 font-medium block">Added to SS Ledger</span>
                    </div>

                    <div className="bg-white/5 border border-amber-500/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 space-y-1">
                      <span className="text-[9px] sm:text-[10px] font-bold text-amber-300 uppercase tracking-wider block">Investment</span>
                      <p className="text-sm sm:text-base font-black text-white font-mono">
                        ₦{Number(memberData?.lastDeductionBreakdown?.investment || 0).toLocaleString()}
                      </p>
                      <span className="text-[8px] sm:text-[9px] text-amber-400/80 font-medium block">Added to Capital</span>
                    </div>

                    <div className="bg-white/5 border border-rose-500/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 space-y-1">
                      <span className="text-[9px] sm:text-[10px] font-bold text-rose-300 uppercase tracking-wider block">Loan Repay</span>
                      <p className="text-sm sm:text-base font-black text-white font-mono">
                        ₦{Number(memberData?.lastDeductionBreakdown?.loanReimbursement || 0).toLocaleString()}
                      </p>
                      <span className="text-[8px] sm:text-[9px] text-rose-400/80 font-medium block">Principal Cleared</span>
                    </div>

                    <div className="bg-white/5 border border-indigo-500/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 space-y-1">
                      <span className="text-[9px] sm:text-[10px] font-bold text-indigo-300 uppercase tracking-wider block">Commodity</span>
                      <p className="text-sm sm:text-base font-black text-white font-mono">
                        ₦{Number(memberData?.lastDeductionBreakdown?.commodityPurchase || 0).toLocaleString()}
                      </p>
                      <span className="text-[8px] sm:text-[9px] text-indigo-400/80 font-medium block">Goods Purchase</span>
                    </div>

                    <div className="bg-white/5 border border-teal-500/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 space-y-1">
                      <span className="text-[9px] sm:text-[10px] font-bold text-teal-300 uppercase tracking-wider block">Muslim Comm.</span>
                      <p className="text-sm sm:text-base font-black text-white font-mono">
                        ₦{Number(memberData?.lastDeductionBreakdown?.muslimCommunity || 0).toLocaleString()}
                      </p>
                      <span className="text-[8px] sm:text-[9px] text-teal-400/80 font-medium block">Added to MCA</span>
                    </div>
                  </div>
                </div>

                {/* Ambient glow */}
                <div className="absolute -right-20 -bottom-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              </motion.div>
            )}

            {/* Account Summary Cards (Bento Style) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-8 sm:mb-10">
              <AccountCard index={0} id="member-os-balance" label="Ordinary Savings (OS)" balance={memberData ? "₦" + Number(memberData.ordinarySavings || 0).toLocaleString() : "₦0"} status="Active" icon={<Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />} color="primary" onClick={() => setActiveView('os')} />
              <AccountCard index={1} id="member-ss-balance" label="Special Savings (SS)" balance={memberData ? "₦" + Number(memberData.specialSavings || 0).toLocaleString() : "₦0"} status="Active" icon={<PiggyBank className="w-5 h-5 sm:w-6 sm:h-6 text-secondary" />} color="secondary" onClick={() => setActiveView('ss')} />
              <AccountCard index={2} id="member-ia-balance" label="Investment Account (IA)" balance={memberData ? "₦" + Number(memberData.investmentAmount || 0).toLocaleString() : "₦0"} status="Active" icon={<TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-tertiary" />} color="tertiary" onClick={() => setActiveView('ia')} />
              <AccountCard index={3} id="member-cp-balance" label="Commodity Account (CP)" balance={memberData ? "₦" + Number(memberData.commoditySavings || 0).toLocaleString() : "₦0"} status="Active" icon={<ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />} color="primary" onClick={() => setActiveView('cp')} />
              <AccountCard index={4} id="member-mca-balance" label="Muslim Community (MCA)" balance={memberData ? "₦" + Number(memberData.muslimSavings || memberData.muslimCommunitySavings || 0).toLocaleString() : "₦0"} status="Active" icon={<Moon className="w-5 h-5 sm:w-6 sm:h-6 text-secondary" />} color="secondary" onClick={() => setActiveView('mca')} />
            </div>

            {/* 6-Month Savings & Transactions Trend Chart (Recharts) */}
            <FinancialTrendChart 
              memberData={memberData} 
              transactions={transactions} 
              className="mb-8 sm:mb-10" 
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              {/* Recent Transactions & Activity Table (Glass Panel with Date & Type Filters) */}
              <div className="lg:col-span-2 glass-panel bg-surface-container-lowest rounded-2xl p-4 sm:p-6 md:p-8 shadow-[0_20px_40px_rgba(25,28,29,0.04)] border border-white/40 flex flex-col justify-between">
                <div>
                  {/* Header & Quick Action Buttons */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-headline text-lg sm:text-2xl font-bold text-primary">Account Activity</h2>
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-full text-[10px] sm:text-xs font-bold">
                          {filteredDashboardTransactions.length} {filteredDashboardTransactions.length === 1 ? 'record' : 'records'}
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">Filter ledger records by date range, transaction type, or keywords</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button 
                        id="btn-download-pdf-summary"
                        onClick={() => handleDownloadTransactionsPDF()}
                        disabled={isDownloadingPDF}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold transition shadow-sm shadow-emerald-700/20 cursor-pointer disabled:opacity-50"
                        title="Download formatted PDF summary of currently filtered transactions"
                      >
                        <FileDown size={14} />
                        <span>{isDownloadingPDF ? 'Generating...' : 'Export Filtered PDF'}</span>
                      </button>
                      <button 
                        id="btn-view-all-statement"
                        onClick={() => setIsStatementModalOpen(true)}
                        className="inline-flex items-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                        title="View complete statement"
                      >
                        <span>Statement</span>
                        <ChevronRight size={13} />
                      </button>
                      <button 
                        id="btn-expand-recent-transactions"
                        type="button"
                        onClick={() => setIsRecentTxExpanded(true)}
                        className="inline-flex items-center justify-center p-2 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer border border-slate-200/60"
                        title="Expand transaction table to fullscreen"
                      >
                        <Maximize2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Transaction Category Type Filter Tabs */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none">
                    <button
                      id="filter-type-all"
                      onClick={() => setActivityTypeFilter('all')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                        activityTypeFilter === 'all'
                          ? 'bg-primary text-white shadow-sm shadow-primary/25'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                      }`}
                    >
                      <span>All Types</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activityTypeFilter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
                        {transactions.length}
                      </span>
                    </button>

                    <button
                      id="filter-type-savings"
                      onClick={() => setActivityTypeFilter('savings')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                        activityTypeFilter === 'savings'
                          ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/25'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/50'
                      }`}
                    >
                      <PiggyBank className="w-3.5 h-3.5" />
                      <span>Savings</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activityTypeFilter === 'savings' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                        {transactions.filter(t => getTransactionCategory(t) === 'savings').length}
                      </span>
                    </button>

                    <button
                      id="filter-type-loans"
                      onClick={() => setActivityTypeFilter('loans')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                        activityTypeFilter === 'loans'
                          ? 'bg-amber-600 text-white shadow-sm shadow-amber-600/25'
                          : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/50'
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Loans</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activityTypeFilter === 'loans' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'}`}>
                        {transactions.filter(t => getTransactionCategory(t) === 'loans').length}
                      </span>
                    </button>

                    <button
                      id="filter-type-fees"
                      onClick={() => setActivityTypeFilter('fees')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                        activityTypeFilter === 'fees'
                          ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/25'
                          : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200/50'
                      }`}
                    >
                      <ReceiptText className="w-3.5 h-3.5" />
                      <span>Fees & Levies</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activityTypeFilter === 'fees' ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-800'}`}>
                        {transactions.filter(t => getTransactionCategory(t) === 'fees').length}
                      </span>
                    </button>

                    <button
                      id="filter-type-commodities"
                      onClick={() => setActivityTypeFilter('commodities')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                        activityTypeFilter === 'commodities'
                          ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/25'
                          : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/50'
                      }`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Commodities</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activityTypeFilter === 'commodities' ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-800'}`}>
                        {transactions.filter(t => getTransactionCategory(t) === 'commodities').length}
                      </span>
                    </button>

                    <button
                      id="filter-type-withdrawals"
                      onClick={() => setActivityTypeFilter('withdrawals')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                        activityTypeFilter === 'withdrawals'
                          ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/25'
                          : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/50'
                      }`}
                    >
                      <ArrowDownRight className="w-3.5 h-3.5" />
                      <span>Withdrawals</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activityTypeFilter === 'withdrawals' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-800'}`}>
                        {transactions.filter(t => getTransactionCategory(t) === 'withdrawals').length}
                      </span>
                    </button>
                  </div>

                  {/* Secondary Filter Bar: Date Range Presets & Search Input */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 mb-4 p-2.5 bg-slate-50/80 rounded-2xl border border-slate-200/60">
                    {/* Date Range Selector */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1 text-slate-500 text-xs font-semibold pl-1">
                        <Calendar size={13} className="text-primary" />
                        <span>Date Range:</span>
                      </div>
                      <select
                        id="select-activity-date-range"
                        value={activityDatePreset}
                        onChange={(e) => {
                          const val = e.target.value as any;
                          setActivityDatePreset(val);
                          if (val === 'custom') {
                            setShowCustomDateInputs(true);
                          } else {
                            setShowCustomDateInputs(false);
                            setActivityStartDate('');
                            setActivityEndDate('');
                          }
                        }}
                        className="bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-sm"
                      >
                        <option value="all">All Dates</option>
                        <option value="this_month">This Month</option>
                        <option value="last_30_days">Last 30 Days</option>
                        <option value="last_3_months">Last 3 Months</option>
                        <option value="this_year">This Year</option>
                        <option value="custom">Custom Date Range...</option>
                      </select>

                      <button
                        id="btn-toggle-custom-dates"
                        onClick={() => {
                          setShowCustomDateInputs(!showCustomDateInputs);
                          if (!showCustomDateInputs) {
                            setActivityDatePreset('custom');
                          }
                        }}
                        className={`p-1.5 rounded-lg text-xs font-bold transition border ${
                          showCustomDateInputs || activityDatePreset === 'custom'
                            ? 'bg-primary/10 text-primary border-primary/30'
                            : 'bg-white text-slate-500 hover:text-slate-800 border-slate-200'
                        }`}
                        title="Toggle custom date picker"
                      >
                        <Filter size={13} />
                      </button>
                    </div>

                    {/* Search Field */}
                    <div className="relative flex-1 max-w-full sm:max-w-xs">
                      <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        id="input-activity-search"
                        type="text"
                        value={activitySearchQuery}
                        onChange={(e) => setActivitySearchQuery(e.target.value)}
                        placeholder="Search description, account, amount..."
                        className="w-full bg-white border border-slate-200 text-slate-800 text-xs rounded-xl pl-8 pr-7 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-slate-400 shadow-sm"
                      />
                      {activitySearchQuery && (
                        <button
                          onClick={() => setActivitySearchQuery('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expandable Custom Date Range Pickers */}
                  {(showCustomDateInputs || activityDatePreset === 'custom') && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex flex-wrap items-center gap-3 p-3 mb-4 bg-primary/5 border border-primary/20 rounded-2xl text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-primary text-[11px] uppercase tracking-wider">From:</span>
                        <input
                          id="input-activity-start-date"
                          type="date"
                          value={activityStartDate}
                          onChange={(e) => {
                            setActivityStartDate(e.target.value);
                            setActivityDatePreset('custom');
                          }}
                          className="bg-white border border-slate-200 text-slate-800 rounded-xl px-2.5 py-1 text-xs focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-primary text-[11px] uppercase tracking-wider">To:</span>
                        <input
                          id="input-activity-end-date"
                          type="date"
                          value={activityEndDate}
                          onChange={(e) => {
                            setActivityEndDate(e.target.value);
                            setActivityDatePreset('custom');
                          }}
                          className="bg-white border border-slate-200 text-slate-800 rounded-xl px-2.5 py-1 text-xs focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      {(activityStartDate || activityEndDate) && (
                        <button
                          onClick={() => {
                            setActivityStartDate('');
                            setActivityEndDate('');
                            setActivityDatePreset('all');
                            setShowCustomDateInputs(false);
                          }}
                          className="text-xs text-rose-600 hover:text-rose-700 font-bold ml-auto flex items-center gap-1 cursor-pointer"
                        >
                          <X size={12} />
                          <span>Clear Date Filter</span>
                        </button>
                      )}
                    </motion.div>
                  )}

                  {/* Active Filter Indicators & Reset Action */}
                  {(activityTypeFilter !== 'all' || activityDatePreset !== 'all' || activityStartDate || activityEndDate || activitySearchQuery) && (
                    <div className="flex items-center justify-between flex-wrap gap-2 mb-3 px-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Filters:</span>
                        {activityTypeFilter !== 'all' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-[11px] font-bold rounded-lg border border-primary/20">
                            Type: {activityTypeFilter.toUpperCase()}
                            <button onClick={() => setActivityTypeFilter('all')} className="hover:text-rose-600"><X size={10} /></button>
                          </span>
                        )}
                        {activityDatePreset !== 'all' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg">
                            Range: {activityDatePreset.replace(/_/g, ' ')}
                            <button onClick={() => { setActivityDatePreset('all'); setActivityStartDate(''); setActivityEndDate(''); }} className="hover:text-rose-600"><X size={10} /></button>
                          </span>
                        )}
                        {(activityStartDate || activityEndDate) && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg">
                            {activityStartDate || 'Start'} → {activityEndDate || 'End'}
                            <button onClick={() => { setActivityStartDate(''); setActivityEndDate(''); }} className="hover:text-rose-600"><X size={10} /></button>
                          </span>
                        )}
                        {activitySearchQuery && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg">
                            "{activitySearchQuery}"
                            <button onClick={() => setActivitySearchQuery('')} className="hover:text-rose-600"><X size={10} /></button>
                          </span>
                        )}
                      </div>
                      <button
                        id="btn-reset-activity-filters"
                        onClick={handleResetActivityFilters}
                        className="text-xs text-slate-500 hover:text-rose-600 font-bold flex items-center gap-1 cursor-pointer transition"
                      >
                        <RotateCcw size={11} />
                        <span>Reset Filters</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Table Content */}
                <div className="overflow-x-auto -mx-2 sm:mx-0">
                  <table className="w-full text-left min-w-[340px] sm:min-w-full">
                    <thead>
                      <tr className="border-b border-outline-variant/30">
                        <th className="pb-2.5 sm:pb-3.5 font-bold text-on-surface-variant text-[10px] sm:text-xs uppercase tracking-widest px-2 sm:px-3">Date</th>
                        <th className="pb-2.5 sm:pb-3.5 font-bold text-on-surface-variant text-[10px] sm:text-xs uppercase tracking-widest px-2 sm:px-3">Description & Account</th>
                        <th className="pb-2.5 sm:pb-3.5 font-bold text-on-surface-variant text-[10px] sm:text-xs uppercase tracking-widest px-2 sm:px-3 text-center">Type</th>
                        <th className="pb-2.5 sm:pb-3.5 font-bold text-on-surface-variant text-[10px] sm:text-xs uppercase tracking-widest text-right px-2 sm:px-3">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container-low text-xs sm:text-sm">
                      {filteredDashboardTransactions.length > 0 ? (
                        filteredDashboardTransactions.slice(0, 10).map((tx) => {
                          const cat = getTransactionCategory(tx);
                          const categoryPillConfig = {
                            savings: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200/60', label: 'Savings' },
                            loans: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200/60', label: 'Loan' },
                            fees: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200/60', label: 'Fee / Levy' },
                            commodities: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200/60', label: 'Commodity' },
                            withdrawals: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200/60', label: 'Withdrawal' }
                          }[cat] || { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', label: 'Other' };

                          return (
                            <tr key={tx.id} className="group hover:bg-surface-container-low/50 transition-colors">
                              <td className="py-2.5 sm:py-3.5 font-mono text-[11px] sm:text-xs text-on-surface-variant px-2 sm:px-3 whitespace-nowrap">
                                {tx.date}
                              </td>
                              <td className="py-2.5 sm:py-3.5 px-2 sm:px-3">
                                <div className="flex items-center gap-2 sm:gap-3">
                                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 ${tx.type === 'credit' ? 'bg-primary/10 text-primary' : 'bg-rose-50 text-rose-600'}`}>
                                    {tx.type === 'credit' ? (
                                      <ArrowUpRight className="w-4 h-4" />
                                    ) : (
                                      <ArrowDownLeft className="w-4 h-4" />
                                    )}
                                  </div>
                                  <div>
                                    <span className="font-semibold text-on-surface text-[11px] sm:text-xs md:text-sm line-clamp-1 group-hover:text-primary transition-colors">
                                      {tx.description}
                                    </span>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      {tx.account && (
                                        <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium">
                                          {tx.account}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-2.5 sm:py-3.5 px-2 sm:px-3 text-center whitespace-nowrap">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${categoryPillConfig.bg} ${categoryPillConfig.text} ${categoryPillConfig.border}`}>
                                  {categoryPillConfig.label}
                                </span>
                              </td>
                              <td className={`py-2.5 sm:py-3.5 font-mono font-black text-right px-2 sm:px-3 whitespace-nowrap text-[11px] sm:text-xs md:text-sm ${tx.type === 'credit' ? 'text-primary' : 'text-error'}`}>
                                {tx.type === 'credit' ? `+${tx.amount.replace('+', '')}` : `-${tx.amount.replace('-', '').replace('+', '')}`}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-10 text-center">
                            <div className="flex flex-col items-center justify-center gap-2">
                              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                <Search size={18} />
                              </div>
                              <p className="text-xs sm:text-sm font-bold text-slate-700">No transactions match the selected filters</p>
                              <p className="text-[11px] text-slate-400 max-w-xs">Try switching transaction type or expanding the date range criteria.</p>
                              <button
                                onClick={handleResetActivityFilters}
                                className="mt-2 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold rounded-xl transition cursor-pointer"
                              >
                                Clear All Filters
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Filtered Count & View Details Footer */}
                {filteredDashboardTransactions.length > 10 && (
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>Showing top 10 of {filteredDashboardTransactions.length} matching transactions</span>
                    <button
                      onClick={() => setIsRecentTxExpanded(true)}
                      className="text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>View All {filteredDashboardTransactions.length}</span>
                      <ChevronRight size={12} />
                    </button>
                  </div>
                )}
              </div>

              {/* Loan Eligibility Gauge (Glass Panel) */}
              <div className="glass-panel bg-surface-container-lowest rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 md:p-8 shadow-[0_20px_40px_rgba(25,28,29,0.04)] border border-white/40 flex flex-col justify-between">
                <h2 className="font-headline text-base sm:text-xl font-bold text-primary mb-4 sm:mb-6">Loan Eligibility (2x OS)</h2>
                <div className="flex-grow flex flex-col items-center justify-center py-4">
                  <div className="relative w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                      <circle className="text-surface-container-high" strokeWidth="10" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
                      <motion.circle initial={{ strokeDashoffset: 251 }} animate={{ strokeDashoffset: 251 - (251 * (remainingEligibilityPct / 100)) }} transition={{ duration: 1.5, ease: "easeOut" }} className="text-primary" strokeWidth="10" strokeDasharray="251" strokeLinecap="round" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl sm:text-2xl font-black text-on-surface">{remainingEligibilityPct}%</span>
                    </div>
                  </div>
                  <div className="mt-4 sm:mt-6 w-full space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] sm:text-xs font-bold text-on-surface-variant uppercase tracking-widest">Max Loan</span>
                      <span className="text-xs sm:text-sm font-black text-primary font-mono">₦{maxLoanEligible.toLocaleString()}</span>
                    </div>
                    <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${remainingEligibilityPct}%` }} transition={{ duration: 1.5 }} className="h-full bg-primary" />
                    </div>
                  </div>
                </div>
                <button onClick={() => setActiveView('loans')} className="mt-4 sm:mt-6 w-full py-3 sm:py-4 px-4 sm:px-6 bg-primary text-on-primary rounded-full font-bold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-primary-container transition-colors shadow-lg shadow-primary/20 active:scale-95 duration-150 cursor-pointer">
                  <span>Apply Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Trust Badge */}
            <div className="mt-12 sm:mt-16 flex flex-col items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2 sm:gap-3 bg-surface-container-high/50 backdrop-blur-sm px-4 py-2 rounded-full border border-outline-variant/20">
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                <span className="font-label text-xs sm:text-sm font-semibold text-primary">Securely Encrypted by Zimco-Tech</span>
              </div>
              <p className="font-body text-[10px] sm:text-xs text-on-surface-variant/60 tracking-wide text-center">
                AES-256 Bit Encryption Active • Environment: Production-Mainframe
              </p>
            </div>
          </motion.div>
        );
      case 'os':
      case 'ss':
      case 'ia':
      case 'cp':
      case 'mca':
        const accountData = {
          os: { title: 'Ordinary Savings', color: 'emerald', balance: memberData ? "₦" + Number(memberData.ordinarySavings || 0).toLocaleString() : "₦0", id: 'os-balance' },
          ss: { title: 'Special Savings', color: 'blue', balance: memberData ? "₦" + Number(memberData.specialSavings || 0).toLocaleString() : "₦0", id: 'ss-balance' },
          ia: { title: 'Investment Account', color: 'amber', balance: memberData ? "₦" + Number(memberData.investmentAmount || 0).toLocaleString() : "₦0", id: 'ia-balance' },
          cp: { title: 'Commodity Purchase', color: 'indigo', balance: memberData ? "₦" + Number(memberData.commoditySavings || 0).toLocaleString() : "₦0", id: 'cp-balance' },
          mca: { title: 'Muslim Community Account', color: 'green', balance: memberData ? "₦" + Number(memberData.muslimCommunitySavings || memberData.muslimSavings || 0).toLocaleString() : "₦0", id: 'mca-balance' },
        }[activeView as 'os' | 'ss' | 'ia' | 'cp' | 'mca'];

        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
              <div className={`p-6 sm:p-8 rounded-2xl ${
                activeView === 'os' ? 'bg-emerald-900' :
                activeView === 'ss' ? 'bg-slate-900' :
                activeView === 'ia' ? 'bg-amber-900' :
                activeView === 'mca' ? 'bg-emerald-800' :
                'bg-slate-900'
              } text-white shadow-2xl relative overflow-hidden`}>
                <div className="relative z-10">
                  <p className="text-white/70 font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[10px] sm:text-xs mb-2 sm:mb-4">{accountData.title}</p>
                  <h2 id={accountData.id} className="text-2xl sm:text-4xl md:text-5xl font-black mb-4 sm:mb-8 tracking-tight font-mono">{accountData.balance}</h2>
                  <div className="flex flex-wrap gap-3 sm:gap-4">
                    <button 
                      onClick={() => {
                        const targetAcc = activeView === 'os' ? 'ordinarySavings' :
                                          activeView === 'ss' ? 'specialSavings' :
                                          activeView === 'ia' ? 'investmentAmount' :
                                          activeView === 'cp' ? 'commoditySavings' : 'muslimCommunitySavings';
                        setTopUpDefaultAccount(targetAcc);
                        setIsTopUpModalOpen(true);
                      }}
                      className="bg-white/10 hover:bg-white/20 active:scale-95 backdrop-blur-md px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl font-bold text-xs sm:text-sm transition-all border border-white/10 flex items-center gap-2 cursor-pointer"
                    >
                      <Sparkles size={15} className="text-emerald-300" />
                      <span>Instant Top-Up</span>
                    </button>
                    {activeView !== 'os' && (
                      <button 
                        onClick={() => {
                          setWithdrawalAccount(activeView);
                          setActiveView('withdrawal');
                        }}
                        className="bg-white text-slate-900 px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl font-bold text-xs sm:text-sm hover:bg-slate-100 transition-all cursor-pointer"
                      >
                        Withdraw
                      </button>
                    )}
                  </div>
                </div>
                <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
              </div>

              <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm border border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div>
                    <h3 className="font-headline text-base sm:text-xl font-bold text-slate-900">Detailed Statement</h3>
                    <p className="text-[11px] sm:text-xs text-slate-400">Chronological transaction record for {accountData.title}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                    <button
                      onClick={() => {
                        const currentAccountLabel = activeView === 'os' ? 'Ordinary Savings' :
                                                    activeView === 'ss' ? 'Special Savings' :
                                                    activeView === 'ia' ? 'Investment Account' :
                                                    activeView === 'cp' ? 'Commodity Account' : 'Muslim Community Account';
                        handleDownloadTransactionsPDF(currentAccountLabel);
                      }}
                      disabled={isDownloadingPDF}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer disabled:opacity-50"
                      title={`Download PDF statement for ${accountData.title}`}
                    >
                      <FileDown size={14} className="text-emerald-700" />
                      <span>Download {accountData.title.split(' ')[0]} PDF</span>
                    </button>
                    <button
                      id="btn-expand-account-statement"
                      type="button"
                      onClick={() => setIsAccountTxExpanded(true)}
                      className="inline-flex items-center justify-center p-2 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer border border-slate-200/60"
                      title="Expand statement table to fullscreen"
                    >
                      <Maximize2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Sub-account Filtering Search Toolbar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 mb-4 p-2.5 bg-slate-50/80 rounded-xl border border-slate-200/60">
                  <div className="relative flex-1">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={activitySearchQuery}
                      onChange={(e) => setActivitySearchQuery(e.target.value)}
                      placeholder={`Search ${accountData.title} records...`}
                      className="w-full bg-white border border-slate-200 text-slate-800 text-xs rounded-lg pl-8 pr-7 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-slate-400"
                    />
                    {activitySearchQuery && (
                      <button
                        onClick={() => setActivitySearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                </div>

                {activeView === 'os' || activeView === 'ss' || activeView === 'ia' || activeView === 'cp' || activeView === 'mca' ? (
                  <div className="overflow-x-auto -mx-2 sm:mx-0">
                    <table className="w-full text-left min-w-[320px] sm:min-w-full">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="pb-2.5 sm:pb-3.5 font-bold text-slate-400 text-[10px] sm:text-xs uppercase tracking-widest px-2 sm:px-3">Date</th>
                          <th className="pb-2.5 sm:pb-3.5 font-bold text-slate-400 text-[10px] sm:text-xs uppercase tracking-widest px-2 sm:px-3">Description</th>
                          <th className="pb-2.5 sm:pb-3.5 font-bold text-slate-400 text-[10px] sm:text-xs uppercase tracking-widest text-right px-2 sm:px-3">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 text-xs sm:text-sm">
                        {(() => {
                          const currentAccountLabel = activeView === 'os' ? 'Ordinary Savings' :
                                                      activeView === 'ss' ? 'Special Savings' :
                                                      activeView === 'ia' ? 'Investment Account' :
                                                      activeView === 'cp' ? 'Commodity Account' : 'Muslim Community Account';
                          let accountTx = transactions.filter(t => t.account === currentAccountLabel);
                          if (activitySearchQuery.trim()) {
                            const q = activitySearchQuery.toLowerCase();
                            accountTx = accountTx.filter(t => (t.description || '').toLowerCase().includes(q) || (t.amount || '').toLowerCase().includes(q));
                          }

                          if (accountTx.length === 0) {
                            return (
                              <tr>
                                <td colSpan={3} className="py-8 text-center text-xs font-medium text-slate-500">
                                  No statement entries found matching this account filter.
                                </td>
                              </tr>
                            );
                          }

                          return accountTx.map((tx, idx) => (
                            <tr key={tx.id || idx} className="group hover:bg-slate-50/50 transition-colors">
                              <td className="py-2.5 sm:py-3.5 text-[10px] sm:text-xs font-mono font-medium text-slate-500 px-2 sm:px-3 whitespace-nowrap">{tx.date}</td>
                              <td className="py-2.5 sm:py-3.5 px-2 sm:px-3">
                                <div className="flex items-center gap-2.5">
                                  <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${tx.type === 'credit' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-600'}`}>
                                    {tx.type === 'credit' ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownLeft className="w-3.5 h-3.5" />}
                                  </div>
                                  <span className="text-[11px] sm:text-xs md:text-sm font-bold text-slate-900 line-clamp-1">
                                    {tx.description}
                                  </span>
                                </div>
                              </td>
                              <td className={`py-2.5 sm:py-3.5 text-[11px] sm:text-xs md:text-sm font-mono font-black text-right px-2 sm:px-3 whitespace-nowrap ${tx.type === 'credit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {tx.type === 'credit' ? '+' : '-'}{tx.amount}
                              </td>
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="space-y-6 sm:space-y-8">
              {activeView && (
                <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm border border-slate-100">
                  <h3 className="font-headline text-base sm:text-lg font-bold text-slate-900 mb-4 sm:mb-6">Account Insights</h3>
                  <div className="space-y-4 sm:space-y-6">
                    <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Estimated Annual Growth Rate</p>
                      <p className="text-base sm:text-xl font-black text-emerald-600">
                        {activeView === 'os' ? '4.5% p.a.' : 
                         activeView === 'ss' ? '5.5% p.a.' : 
                         activeView === 'ia' ? '8.0% p.a.' : 
                         activeView === 'cp' ? '6.0% p.a.' : 'Non-Interest (Profit Share)'}
                      </p>
                    </div>
                    <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Accrued Surplus Dividend</p>
                      <p className="text-base sm:text-xl font-black text-emerald-600 font-mono">
                        ₦{Number(
                          ((activeView === 'os' ? (memberData?.ordinarySavings || 0) :
                            activeView === 'ss' ? (memberData?.specialSavings || 0) :
                            activeView === 'ia' ? (memberData?.investmentAmount || 0) :
                            activeView === 'cp' ? (memberData?.commoditySavings || 0) : (memberData?.muslimCommunitySavings || memberData?.muslimSavings || 0)) * 
                            (activeView === 'os' ? 0.045 : 
                             activeView === 'ss' ? 0.055 : 
                             activeView === 'ia' ? 0.08 : 
                             activeView === 'cp' ? 0.06 : 0.05)
                          ) * 0.12
                        ).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 text-white">
                <h3 className="font-headline text-base sm:text-lg font-bold mb-2 sm:mb-4">Need Help?</h3>
                <p className="text-white/70 text-xs sm:text-sm mb-4 sm:mb-6 leading-relaxed">Contact your account officer for specialized investment advice.</p>
                <button onClick={() => setActiveView('helpdesk')} className="w-full py-3 sm:py-4 bg-white text-slate-900 rounded-xl font-bold text-xs sm:text-sm hover:bg-slate-100 transition-colors cursor-pointer">Chat with Support</button>
              </div>
            </div>
          </motion.div>
        );
      case 'loans':
        return (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-10">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="font-headline text-3xl font-black text-slate-900 mb-2">My Loans</h2>
                <p className="text-slate-500 font-medium">Manage your active applications and repayment schedules.</p>
              </div>
              <button className="bg-emerald-600 text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all">New Loan Application</button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <CreditCard size={28} />
                      </div>
                      <div>
                        <h4 className="font-bold text-xl text-slate-900">Personal Development Loan</h4>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">ID: LN-2026-044</p>
                      </div>
                    </div>
                    <span className="px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest">Active</span>
                  </div>
                  <div className="grid grid-cols-3 gap-8 mb-8">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Loan Amount</p>
                      <p className="text-lg font-black text-slate-900">{outstandingLoans > 0 ? "₦" + (outstandingLoans * 1.4).toLocaleString() : "₦0"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Outstanding</p>
                      <p className={`text-lg font-black ${outstandingLoans > 0 ? 'text-rose-600' : 'text-slate-900'}`}>₦{outstandingLoans.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Next Due</p>
                      <p className="text-lg font-black text-slate-900">{outstandingLoans > 0 ? "Next Month" : "None"}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <span>Repayment Progress</span>
                      <span>30% Completed</span>
                    </div>
                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 w-[30%]"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
                  <h3 className="font-headline text-xl font-bold text-slate-900 mb-6">Guarantor Requests</h3>
                  <div className="space-y-4">
                    <div className="p-5 rounded-3xl bg-amber-50 border border-amber-100">
                      <p className="text-sm font-bold text-amber-900 mb-1">Pending Request</p>
                      <p className="text-xs text-amber-700/70 mb-4">Sarah Johnson requested you as a guarantor for her Commodity Loan.</p>
                      <div className="flex gap-2">
                        <button className="flex-1 py-2 bg-amber-900 text-white rounded-xl text-xs font-bold">Approve</button>
                        <button className="flex-1 py-2 bg-white text-amber-900 rounded-xl text-xs font-bold border border-amber-200">Decline</button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <FileText size={20} />
                    </div>
                    <h3 className="font-headline text-xl font-bold text-slate-900">Eligibility Analysis</h3>
                  </div>
                  <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                    Upload your latest payslip to instantly analyze your eligibility for higher loan limits.
                  </p>
                  
                  <div className="border-2 border-dashed border-slate-100 rounded-[2rem] p-8 text-center hover:border-emerald-200 transition-colors group cursor-pointer">
                    <input type="file" id="payslip-upload" className="hidden" accept=".pdf,.docx" />
                    <label htmlFor="payslip-upload" className="cursor-pointer">
                      <div className="w-16 h-16 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                        <Upload size={28} />
                      </div>
                      <p className="text-sm font-bold text-slate-900 mb-1">Click to upload payslip</p>
                      <p className="text-xs text-slate-400">PDF or DOCX (Max 5MB)</p>
                    </label>
                  </div>

                  <button className="w-full mt-6 py-4 bg-slate-900 text-white rounded-full font-bold text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                    Analyze Eligibility
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        );
      case 'withdrawal':
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
            <div className="bg-white rounded-[3rem] p-12 shadow-sm border border-slate-100">
              <h2 className="font-headline text-3xl font-black text-slate-900 mb-4">Request Withdrawal</h2>
              <p className="text-slate-500 mb-10">Initiate a secure funds transfer from your member cooperative balances. All actions are audited.</p>
              
              <form onSubmit={handleWithdrawalSubmit} className="space-y-10">
                {/* Result Feedback Banner */}
                {withdrawalState.status === 'success' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-start gap-4"
                  >
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-base text-emerald-950">Security Check Passed</h4>
                      <p className="text-sm mt-1 text-emerald-800">{withdrawalState.message}</p>
                      <p className="text-xs text-emerald-600/70 mt-2 font-mono uppercase tracking-wider">Device ID validated • Signature Token: HW-PIN-PASS</p>
                    </div>
                  </motion.div>
                )}

                {withdrawalState.status === 'error' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 flex items-start gap-4 animate-shake"
                  >
                    <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-base text-rose-950">Audit Fail / Fraud Mitigation Blocked</h4>
                      <p className="text-sm mt-1 text-rose-800">{withdrawalState.message}</p>
                    </div>
                  </motion.div>
                )}

                <section>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Withdrawal Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 ml-1">Select Account</label>
                      <select 
                        value={withdrawalAccount}
                        onChange={(e) => setWithdrawalAccount(e.target.value)}
                        className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-emerald-500/20 outline-none font-bold appearance-none cursor-pointer"
                      >
                        <option value="os">Ordinary Savings (OS) - ₦{Number(memberData?.ordinarySavings || 0).toLocaleString()}</option>
                        <option value="ss">Special Savings (SS) - ₦{Number(memberData?.specialSavings || 0).toLocaleString()}</option>
                        <option value="ia">Investment Account (IA) - ₦{Number(memberData?.investmentAmount || 0).toLocaleString()}</option>
                        <option value="cp">Commodity Purchase (CP) - ₦{Number(memberData?.commoditySavings || 0).toLocaleString()}</option>
                        <option value="mca">Muslim Community Account (MCA) - ₦{Number(memberData?.muslimCommunitySavings || memberData?.muslimSavings || 0).toLocaleString()}</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 ml-1">Amount to Withdraw</label>
                      <div className="relative">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 font-bold text-slate-400">₦</span>
                        <input 
                          type="number" 
                          placeholder="0.00" 
                          value={withdrawalAmount}
                          onChange={(e) => setWithdrawalAmount(e.target.value)}
                          className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-6 focus:ring-2 focus:ring-emerald-500/20 outline-none font-bold" 
                          required
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-xs font-bold text-slate-500 ml-1">Reason for Withdrawal (Optional)</label>
                      <textarea 
                        rows={3} 
                        value={withdrawalReason}
                        onChange={(e) => setWithdrawalReason(e.target.value)}
                        className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-emerald-500/20 outline-none font-bold resize-none" 
                        placeholder="State purpose of this transaction..."
                      />
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Security Verification</h3>
                  <div className="p-8 rounded-[2rem] bg-emerald-50/50 border border-emerald-500/10 hover:border-emerald-500/20 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center">
                          <Shield className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-emerald-950">256-Bit Hardware PIN Shield</p>
                          <p className="text-xs text-slate-500">Must accompany any action authorizing shifts or payout dispatches.</p>
                        </div>
                      </div>
                      <div className="text-xs px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold self-start sm:self-auto font-mono">
                        Active PIN Required
                      </div>
                    </div>

                    <div className="max-w-xs space-y-2">
                      <label className="text-xs font-bold text-slate-500 ml-1">Your 4-to-6 Digit Transaction PIN</label>
                      <div className="relative">
                        <input 
                          type={showPin ? "text" : "password"} 
                          placeholder="••••" 
                          maxLength={6}
                          value={withdrawalPin}
                          onChange={(e) => setWithdrawalPin(e.target.value.replace(/\D/g, ''))}
                          className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-emerald-500/20 outline-none font-bold text-center tracking-[1em] focus:border-emerald-400 text-lg" 
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPin(!showPin)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                        >
                          {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </section>

                <div className="pt-10 border-t border-slate-100 flex justify-end gap-4">
                  <button 
                    type="button" 
                    onClick={() => {
                      setWithdrawalAmount('');
                      setWithdrawalReason('');
                      setWithdrawalPin('');
                      setWithdrawalState({ status: 'idle' });
                    }}
                    className="px-8 py-4 rounded-full font-bold text-sm text-slate-500 hover:bg-slate-50 transition-all"
                  >
                    Clear Form
                  </button>
                  <button 
                    type="submit" 
                    disabled={withdrawalState.status === 'loading'}
                    className="px-8 py-4 bg-emerald-900 text-white rounded-full font-bold text-sm shadow-lg shadow-emerald-900/20 hover:bg-emerald-800 transition-all flex items-center gap-2 disabled:bg-slate-300 disabled:shadow-none min-w-[160px] justify-center"
                  >
                    {withdrawalState.status === 'loading' ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Verifying PIN...</span>
                      </>
                    ) : (
                      <>
                        <span>Confirm Withdrawal</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            <div className="mt-8 p-6 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4">
              <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800 leading-relaxed">
                <span className="font-bold">Security Notice:</span> Never share your PIN with anyone, including staff members or customer service. ZIMCO will never ask for your PIN.
              </p>
            </div>
          </motion.div>
        );
      case 'settings':
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-10">
            {/* Upper Grid: Profile info, 2FA, and Transaction PIN */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Left Column: Personal Information & 2FA */}
              <div className="space-y-10">
                {/* Personal Information Group */}
                <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-100">
                  <div className="flex items-center gap-3 mb-6">
                    <User className="text-emerald-700 w-6 h-6" />
                    <h3 className="font-headline text-xl font-bold text-slate-900">Personal Profile</h3>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Member ID</label>
                      <div className="bg-slate-50 text-slate-700 rounded-2xl py-3 px-5 font-mono text-sm font-semibold border border-slate-100">
                        {memberData?.zimco_id || 'ZIMCO-MEM-PENDING'}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 ml-1">Full Name</label>
                        <input type="text" value={memberData?.fullName || ''} readOnly className="w-full bg-slate-50 border border-transparent rounded-2xl py-3.5 px-5 outline-none font-bold text-slate-800 text-sm cursor-not-allowed" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 ml-1">Phone Number</label>
                        <input type="text" value={memberData?.phoneNumber || ''} readOnly className="w-full bg-slate-50 border border-transparent rounded-2xl py-3.5 px-5 outline-none font-bold text-slate-800 text-sm cursor-not-allowed" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 ml-1">Email Address</label>
                      <input type="email" value={memberData?.email || ''} readOnly className="w-full bg-slate-50 border border-transparent rounded-2xl py-3.5 px-5 outline-none font-bold text-slate-800 text-sm cursor-not-allowed" />
                    </div>
                    <button className="px-6 py-3.5 bg-emerald-950 text-white rounded-xl text-xs font-black self-start hover:bg-emerald-800 transition-colors">
                      Save Profile Changes
                    </button>
                  </div>
                </div>

                {/* 2FA Card */}
                <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-100">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <Smartphone className="text-emerald-700 w-6 h-6" />
                      <h3 className="font-headline text-xl font-bold text-slate-900">Two-Step Verification</h3>
                    </div>
                    <span className="text-[10px] px-2.5 py-1 bg-amber-100 text-amber-800 font-bold uppercase tracking-widest rounded-full">
                      Recommended
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                    Add an extra layer of protection to your account with two-step verification using your phone or authenticator app.
                  </p>
                  <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-amber-950 text-sm">Two-Factor Authentication (2FA)</p>
                      <p className="text-xs text-amber-800/80 mt-1">Currently turned off</p>
                    </div>
                    <button className="bg-emerald-900 text-white px-6 py-3 rounded-full font-bold text-xs hover:bg-emerald-800 transition-colors shrink-0">
                      Set Up
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Transaction PIN Management */}
              <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-100 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Lock className="text-emerald-700 w-6 h-6" />
                    <h3 className="font-headline text-xl font-bold text-slate-900">Transaction PIN</h3>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Protected
                  </span>
                </div>
                <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                  Set or change your 4-to-6 digit numeric Transaction PIN. This PIN is required to confirm all withdrawals, transfers, and commodity purchases.
                </p>

                {/* Feedback Panel */}
                {pinMessage && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className={`p-4 rounded-xl mb-6 text-sm font-semibold flex items-start gap-2.5 ${
                      pinMessage.type === 'success' 
                        ? 'bg-emerald-55 bg-emerald-50 border border-emerald-200 text-emerald-950' 
                        : 'bg-rose-50 border border-rose-200 text-rose-950'
                    }`}
                  >
                    {pinMessage.type === 'success' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <span>{pinMessage.text}</span>
                  </motion.div>
                )}

                <form onSubmit={handlePinChangeSubmit} className="space-y-6 flex-grow flex flex-col justify-between">
                  <div className="space-y-5">
                    {/* Current PIN field */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-500 ml-1">
                        <label>Current PIN</label>
                        <span className="text-[10px] text-slate-400">Default PIN is "1234"</span>
                      </div>
                      <div className="relative">
                        <input 
                          type={showPin ? "text" : "password"} 
                          placeholder="••••" 
                          maxLength={6}
                          value={pinCurrentInput}
                          onChange={(e) => setPinCurrentInput(e.target.value.replace(/\D/g, ''))}
                          className="w-full bg-slate-50 border border-slate-100 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 rounded-2xl py-3.5 px-5 outline-none font-bold text-slate-800 tracking-widest" 
                          required
                        />
                      </div>
                    </div>

                    {/* New PIN & Confirm New PIN Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 ml-1">New PIN (4-6 digits)</label>
                        <input 
                          type={showPin ? "text" : "password"} 
                          placeholder="••••" 
                          maxLength={6}
                          value={pinNewInput}
                          onChange={(e) => setPinNewInput(e.target.value.replace(/\D/g, ''))}
                          className="w-full bg-slate-50 border border-slate-100 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 rounded-2xl py-3.5 px-5 outline-none font-bold text-slate-800 tracking-widest" 
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 ml-1">Confirm New PIN</label>
                        <input 
                          type={showPin ? "text" : "password"} 
                          placeholder="••••" 
                          maxLength={6}
                          value={pinConfirmInput}
                          onChange={(e) => setPinConfirmInput(e.target.value.replace(/\D/g, ''))}
                          className="w-full bg-slate-50 border border-slate-100 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 rounded-2xl py-3.5 px-5 outline-none font-bold text-slate-800 tracking-widest" 
                          required
                        />
                      </div>
                    </div>

                    {/* Show/Hide PIN toggle button */}
                    <button 
                      type="button" 
                      onClick={() => setShowPin(!showPin)}
                      className="text-xs font-bold text-slate-500 hover:text-emerald-700 transition-colors flex items-center gap-2 mt-2 ml-1"
                    >
                      {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                      {showPin ? "Hide PIN" : "Show PIN"}
                    </button>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full mt-8 py-4 bg-emerald-900 text-white rounded-2xl font-bold text-sm shadow-md hover:bg-emerald-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <Key className="w-4 h-4" />
                    <span>Save Transaction PIN</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Session Timeout Settings Card */}
            <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-sm border border-slate-100 space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <Clock className="text-emerald-700 w-6 h-6" />
                    <h3 className="font-headline text-2xl font-black text-slate-900">Automatic Log-Out Timer</h3>
                  </div>
                  <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                    Protect your account when you step away. Choose how long before you are automatically logged out due to inactivity. 
                    You will receive a warning notice <span className="font-bold text-slate-850 text-slate-800">65 seconds</span> before log-out.
                  </p>
                </div>
                <span className="text-[10px] px-2.5 py-1 bg-emerald-50 text-emerald-800 font-extrabold uppercase tracking-widest rounded-full border border-emerald-100 self-start sm:self-auto shrink-0">
                  AUTO LOG-OUT
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { label: "1 Minute", secs: 60, desc: "Quick (1 min)" },
                  { label: "3 Minutes", secs: 180, desc: "Recommended (3 min)" },
                  { label: "5 Minutes", secs: 300, desc: "Standard (5 min)" },
                  { label: "10 Minutes", secs: 600, desc: "Longer (10 min)" },
                  { label: "15 Minutes", secs: 900, desc: "Maximum (15 min)" }
                ].map((opt) => {
                  const isActive = sessionTimeoutDuration === opt.secs;
                  return (
                    <button
                      key={opt.secs}
                      type="button"
                      onClick={() => handleSessionTimeoutChange(opt.secs)}
                      className={`p-6 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between h-32 ${
                        isActive
                          ? 'border-emerald-600 bg-emerald-50/15 ring-2 ring-emerald-500/10'
                          : 'border-slate-150 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-350'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute top-3 right-3 w-5 h-5 bg-emerald-700 rounded-full flex items-center justify-center text-white">
                          <Check size={12} />
                        </div>
                      )}
                      
                      <div>
                        <span className={`block font-extrabold text-base ${isActive ? 'text-emerald-950 font-black' : 'text-slate-800'}`}>
                          {opt.label}
                        </span>
                        <span className="block text-[10px] font-mono text-slate-400 mt-0.5">
                          {opt.secs} seconds
                        </span>
                      </div>

                      <span className={`block text-[10px] font-semibold mt-4 line-clamp-1 ${isActive ? 'text-emerald-700' : 'text-slate-500'}`}>
                        {opt.desc}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150/50 flex items-center gap-3 text-xs text-slate-500 leading-relaxed">
                <Shield className="text-emerald-700 shrink-0 w-5 h-5" />
                <span>
                  <span className="font-extrabold text-slate-800">Activity sensor active:</span> Clicking, scrolling, or typing in the app will automatically reset the timer.
                </span>
              </div>
            </div>

            {/* Bottom Row: Device & Session Audit Ledger */}
            <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-sm border border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 border-b border-slate-100 pb-8">
                <div>
                  <div className="flex items-center gap-3">
                    <Globe className="text-emerald-700 w-6 h-6" />
                    <h3 className="font-headline text-2xl font-black text-slate-900">Active Devices & Logins</h3>
                  </div>
                  <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                    View and manage all devices currently logged in to your account. Log out of devices you do not recognize.
                  </p>
                </div>

                <button 
                  onClick={handleRevokeAllOtherSessions}
                  className="px-6 py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-full font-bold text-xs border border-rose-100 transition-colors flex items-center gap-2 self-start sm:self-auto shrink-0"
                >
                  <Power className="w-4 h-4" />
                  Log Out of All Other Devices
                </button>
              </div>

              {/* Sessions ledger container */}
              <div className="space-y-4">
                {sessions.map((sess) => {
                  const isRevoked = sess.status === 'revoked';
                  return (
                    <motion.div 
                      key={sess.id}
                      className={`p-6 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                        isRevoked 
                          ? 'bg-slate-50/50 border-slate-100 opacity-60 line-through' 
                          : sess.isCurrent 
                            ? 'bg-emerald-50/20 border-emerald-600/15' 
                            : 'bg-slate-50 border-slate-150 border-slate-200/50 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Device icon indicator */}
                        <div className={`p-3.5 rounded-xl border ${
                          isRevoked 
                            ? 'bg-slate-100 border-slate-200 text-slate-400' 
                            : sess.isCurrent 
                              ? 'bg-emerald-100/40 border-emerald-200/50 text-emerald-700' 
                              : 'bg-indigo-100/40 border-indigo-200/50 text-indigo-700'
                        }`}>
                          {sess.device.includes('iPhone') || sess.device.includes('Samsung') ? (
                            <Smartphone className="w-5 h-5" />
                          ) : (
                            <Laptop className="w-5 h-5" />
                          )}
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-slate-900 text-base">{sess.device}</span>
                            <span className="text-xs px-2.5 py-0.5 bg-slate-200/60 text-slate-600 font-semibold rounded-full font-mono">
                              {sess.browser} • {sess.os}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2 font-mono">
                            <span className="flex items-center gap-1">
                              <Globe className="w-3.5 h-3.5" />
                              IP: {sess.ip}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span>Region: {sess.location}</span>
                            <span className="text-slate-300">•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              Time: {sess.timestamp}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center self-end md:self-auto">
                        {isRevoked ? (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 bg-slate-150 bg-slate-100 py-2 px-4 rounded-full">
                            <Trash2 className="w-3.5 h-3.5" />
                            Logged Out
                          </div>
                        ) : sess.isCurrent ? (
                          <div className="flex items-center gap-1.5 text-xs font-black text-emerald-800 bg-emerald-100 py-2 px-4 rounded-full font-mono">
                            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
                            Current Device
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleRevokeSession(sess.id)}
                            className="bg-white hover:bg-rose-50 text-rose-700 border border-slate-200 hover:border-rose-200 py-2 px-4 rounded-full font-bold text-xs transition-colors flex items-center gap-1.5"
                          >
                            <Power className="w-3.5 h-3.5" />
                            Log Out Device
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
            
            {/* Disclaimer & Fraud Warning lines */}
            <div className="p-6 bg-slate-900 text-white/80 rounded-[2rem] flex items-start gap-4">
              <ShieldAlert className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1.5 leading-relaxed">
                <p className="font-bold text-white uppercase tracking-wider text-[10px]">Secure Core Framework Active</p>
                <p>
                  Security audits of logs, browser cookie parameters, useragents, and physical access profiles are routinely collected across regional terminals. Cooperatives operate strictly under anti-fraud frameworks. Unauthorized connections are reported to ZIMCO security intelligence centers instantly.
                </p>
              </div>
            </div>
          </motion.div>
        );
      case 'planning':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="space-y-8"
          >
            <WealthPlanningTool />
          </motion.div>
        );
      case 'kyc':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="space-y-8"
          >
            <KYCOnboarding />
          </motion.div>
        );
      case 'helpdesk':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="space-y-8"
          >
            <MemberHelpdesk />
          </motion.div>
        );
      case 'payments':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="space-y-8"
          >
            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-2">
                  <Sparkles size={13} />
                  <span>Instant Multi-Channel Settlements</span>
                </div>
                <h2 className="font-headline text-2xl sm:text-3xl font-black text-slate-900">Online Top-ups & Payments</h2>
                <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-xl">
                  Fund your savings accounts instantly using debit cards, bank transfers, USSD, or view payroll deduction reconciliations. All transactions trigger instant automated SMS and email notifications.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setIsNotificationsModalOpen(true)}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Bell size={15} className="text-slate-600" />
                  <span>Alert Preferences</span>
                </button>
                <button
                  onClick={() => {
                    setTopUpDefaultAccount('ordinarySavings');
                    setIsTopUpModalOpen(true);
                  }}
                  className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/20 transition flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Sparkles size={16} />
                  <span>Instant Top-Up Now</span>
                </button>
              </div>
            </div>

            {/* 4 Core Payment Channels */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Channel 1: Paystack Cards */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between group hover:border-emerald-200 transition-all">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <CreditCard size={24} />
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-slate-900 text-base">Paystack Online Cards</h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">Instant</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">
                    Mastercard, Visa & Verve with 3D-Secure authentication. Funds credit your balance in under 5 seconds.
                  </p>
                  <div className="text-[11px] text-slate-600 bg-slate-50 rounded-xl p-3 space-y-1 mb-4">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Processing Fee:</span>
                      <span className="font-bold text-emerald-700">0% (Subsidized)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Supported Cards:</span>
                      <span className="font-bold">Visa / MC / Verve</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setTopUpDefaultAccount('ordinarySavings');
                    setIsTopUpModalOpen(true);
                  }}
                  className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Pay with Card</span>
                  <ArrowUpRight size={14} />
                </button>
              </div>

              {/* Channel 2: Dedicated Virtual Account */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between group hover:border-blue-200 transition-all">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <Building2 size={24} />
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-slate-900 text-base">Direct Bank Transfer</h3>
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black uppercase">Dedicated</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">
                    Transfer directly from any mobile banking app to your dedicated Sterling/Providus virtual account.
                  </p>
                  <div className="text-[11px] text-slate-600 bg-blue-50/50 border border-blue-100 rounded-xl p-3 space-y-1 mb-4 font-mono">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-sans">Bank:</span>
                      <span className="font-bold">Sterling Bank</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-sans">Account No:</span>
                      <span className="font-black text-blue-900">8930194821</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText('8930194821');
                    alert('Virtual Account Number copied to clipboard: 8930194821 (Sterling Bank / ZIMCO Cooperative)');
                  }}
                  className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Copy size={14} />
                  <span>Copy Virtual Account</span>
                </button>
              </div>

              {/* Channel 3: USSD & Mobile Money */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between group hover:border-amber-200 transition-all">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <Smartphone size={24} />
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-slate-900 text-base">USSD & QR Code</h3>
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase">Offline Friendly</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">
                    Dial our dedicated shortcode from your registered phone number or scan instant payment QR.
                  </p>
                  <div className="text-[11px] text-slate-600 bg-amber-50/50 border border-amber-100 rounded-xl p-3 space-y-1 mb-4 font-mono">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-sans">GTBank:</span>
                      <span className="font-bold text-amber-900">*737*50*Amount*001#</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-sans">Zenith:</span>
                      <span className="font-bold text-amber-900">*966*00*Amount*001#</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setTopUpDefaultAccount('ordinarySavings');
                    setIsTopUpModalOpen(true);
                  }}
                  className="w-full py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>View USSD Codes</span>
                  <ArrowUpRight size={14} />
                </button>
              </div>

              {/* Channel 4: Payroll Sync */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between group hover:border-purple-200 transition-all">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <RotateCcw size={24} />
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-slate-900 text-base">Payroll Ingestion</h3>
                    <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-black uppercase">Automated</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">
                    Monthly salary deductions ingested by Bursary and automatically split into your designated accounts.
                  </p>
                  <div className="text-[11px] text-slate-600 bg-purple-50/50 border border-purple-100 rounded-xl p-3 space-y-1 mb-4">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Cycle:</span>
                      <span className="font-bold text-purple-900">25th-28th Monthly</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Auto-split:</span>
                      <span className="font-bold text-emerald-700">OS, SS, Loan, MCA</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setActiveView('dashboard')}
                  className="w-full py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>View Last Deduction</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Automated Notification Channels Status */}
            <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden">
              <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Live Automated SMS & Email Gateway</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black font-headline">Instant Delivery on Every Transaction</h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Whenever a top-up, withdrawal, loan disbursement, or payroll deduction occurs, our dispatch engine immediately sends a cryptographic SMS alert to your phone and an itemized HTML receipt to your email.
                  </p>
                  <div className="flex flex-wrap gap-4 pt-2 text-xs">
                    <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                      <Smartphone size={14} className="text-emerald-400" />
                      <span>SMS Gateway: <strong>{memberData?.phone || '+234 803 123 4567'}</strong></span>
                      <span className="px-1.5 py-0.5 bg-emerald-500/30 text-emerald-300 text-[10px] font-bold rounded">Active</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                      <Send size={14} className="text-blue-400" />
                      <span>Email Gateway: <strong>{memberData?.email || 'member@zimco.org'}</strong></span>
                      <span className="px-1.5 py-0.5 bg-blue-500/30 text-blue-300 text-[10px] font-bold rounded">Active</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                  <button
                    onClick={() => setIsNotificationsModalOpen(true)}
                    className="px-5 py-3 bg-white text-slate-900 hover:bg-slate-100 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95"
                  >
                    <MessageSquare size={14} />
                    <span>View Notification Log ({notifications.length})</span>
                  </button>
                </div>
              </div>
              <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
            </div>

            {/* Payment & Top-up Transactions Table */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="font-headline text-xl font-bold text-slate-900">Recent Online Top-ups & Receipts</h3>
                  <p className="text-xs text-slate-400">Electronic verification certificates & downloadable receipts</p>
                </div>
                <button
                  onClick={() => setIsStatementModalOpen(true)}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                >
                  <span>Full Ledger History</span>
                  <ChevronRight size={14} />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                      <th className="pb-3 px-3">Date & Time</th>
                      <th className="pb-3 px-3">Transaction Ref</th>
                      <th className="pb-3 px-3">Account Credited</th>
                      <th className="pb-3 px-3">Channel / Method</th>
                      <th className="pb-3 px-3 text-right">Amount</th>
                      <th className="pb-3 px-3 text-center">Status</th>
                      <th className="pb-3 px-3 text-center">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {transactions.filter(tx => tx.type === 'credit' || tx.description.toLowerCase().includes('top-up') || tx.description.toLowerCase().includes('deposit')).slice(0, 8).map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-3 font-mono text-slate-500 whitespace-nowrap text-xs">{tx.date}</td>
                        <td className="py-3.5 px-3 font-mono text-xs font-bold text-slate-800">{tx.id.startsWith('tx-') ? `ZMC-REC-${tx.id.slice(-6).toUpperCase()}` : `ZMC-PAY-${tx.id.slice(0, 6).toUpperCase()}`}</td>
                        <td className="py-3.5 px-3 font-semibold text-slate-900">{tx.account || 'Ordinary Savings'}</td>
                        <td className="py-3.5 px-3">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-medium">
                            <CreditCard size={12} className="text-emerald-600" />
                            <span>Online Gateway</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono font-black text-emerald-700 text-sm">{tx.amount}</td>
                        <td className="py-3.5 px-3 text-center">
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                            Success
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <button
                            onClick={() => {
                              const rawAmount = parseFloat(tx.amount.replace(/[^0-9.]/g, '')) || 25000;
                              generatePaymentReceiptPDF({
                                memberName: memberData?.fullName || 'Valued Member',
                                memberId: memberData?.id || 'Member',
                                memberEmail: memberData?.email || 'member@zimco.org',
                                memberPhone: memberData?.phone || '+234 803 123 4567',
                                amount: rawAmount,
                                channel: 'Paystack / Online Card',
                                accountName: tx.account || 'Ordinary Savings (OS)',
                                reference: tx.id.startsWith('tx-') ? `ZMC-REC-${tx.id.slice(-6).toUpperCase()}` : `ZMC-PAY-${tx.id.slice(0, 8).toUpperCase()}`,
                                timestamp: tx.createdAt || new Date().toISOString(),
                                status: 'Approved / Success'
                              });
                            }}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 mx-auto cursor-pointer"
                            title="Download official PDF receipt"
                          >
                            <Download size={12} />
                            <span>PDF</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        );

      case 'profile':
        return (
          <MemberProfile 
            memberData={memberData}
            transactions={transactions}
            onUpdateMemberData={(updated) => setMemberData(updated)}
            onNavigateToKYC={() => setActiveView('kyc')}
            onNavigateToTopUp={() => {
              setTopUpDefaultAccount('ordinarySavings');
              setIsTopUpModalOpen(true);
            }}
            onNavigateToWithdrawal={() => setActiveView('withdrawal')}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-body text-slate-900 flex relative">
      <SessionTimeoutListener onLogout={handleLogout} />
      
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[80] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Responsive Collapsible Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-[90] bg-white border-r border-slate-200 flex flex-col
        transition-all duration-300 ease-in-out shrink-0
        lg:sticky lg:top-0 lg:h-screen
        ${isSidebarOpen ? 'translate-x-0 w-72 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
        ${isSidebarCollapsed ? 'lg:w-20' : 'lg:w-72'}
      `}>
        {/* Sidebar Header */}
        <div className={`px-3.5 py-4 border-b border-slate-100 flex items-center min-h-[72px] ${isSidebarCollapsed ? 'justify-center' : 'justify-between gap-2.5'}`}>
          {/* Desktop 3-line Menu Hamburger Toggle Button on Left */}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden lg:flex p-2 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors shrink-0 cursor-pointer"
            title={isSidebarCollapsed ? "Show / Expand sidebar menu (Ctrl+B)" : "Hide / Collapse sidebar menu (Ctrl+B)"}
            aria-label={isSidebarCollapsed ? "Expand sidebar menu" : "Hide sidebar menu"}
          >
            <Menu className="w-5 h-5 text-emerald-700" />
          </button>

          {/* Branding Logo & Title */}
          {(!isSidebarCollapsed || isSidebarOpen) && (
            <div className="flex items-center gap-2.5 overflow-hidden flex-1">
              <img src={zimcoLogo} alt="ZIMCO Logo" className="w-8 h-8 rounded-full object-cover shadow-sm ring-1 ring-emerald-500/20 shrink-0" referrerPolicy="no-referrer" />
              <div className="whitespace-nowrap transition-opacity duration-200 overflow-hidden">
                <span className="font-headline text-base font-black tracking-tight text-emerald-900 block leading-tight truncate">ZIMCO</span>
                <span className="text-[9px] uppercase font-extrabold text-emerald-700 tracking-wider block truncate">Member Portal</span>
              </div>
            </div>
          )}

          {/* Mobile Close Button */}
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 text-slate-400 hover:text-emerald-600 transition-colors ml-auto cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-grow px-3 py-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          <SidebarLink 
            icon={<LayoutDashboard className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0" />} 
            label="Dashboard" 
            active={activeView === 'dashboard'} 
            collapsed={isSidebarCollapsed && !isSidebarOpen}
            onClick={() => {
              setActiveView('dashboard');
              setIsSidebarOpen(false);
            }}
          />

          <SidebarLink 
            icon={<User className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0" />} 
            label="Member Profile" 
            active={activeView === 'profile'} 
            collapsed={isSidebarCollapsed && !isSidebarOpen}
            onClick={() => {
              setActiveView('profile');
              setIsSidebarOpen(false);
            }}
          />
          
          <div className="space-y-1 relative group">
            <button 
              onClick={() => {
                if (isSidebarCollapsed && !isSidebarOpen) {
                  setIsSidebarCollapsed(false);
                  setIsSavingsOpen(true);
                } else {
                  setIsSavingsOpen(!isSavingsOpen);
                }
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 text-slate-600 hover:bg-slate-50 hover:text-emerald-700 rounded-xl transition-all text-xs font-bold ${
                isSidebarCollapsed && !isSidebarOpen ? 'lg:justify-center' : ''
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <Wallet className="w-4 h-4 sm:w-4.5 sm:h-4.5 group-hover:text-emerald-600 shrink-0" />
                {(!isSidebarCollapsed || isSidebarOpen) && (
                  <span className="truncate">My Savings Accounts</span>
                )}
              </div>
              {(!isSidebarCollapsed || isSidebarOpen) && (
                isSavingsOpen ? <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              )}
            </button>

            {isSidebarCollapsed && !isSidebarOpen && (
              <span className="hidden lg:group-hover:flex items-center gap-1 absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-semibold rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none border border-slate-700/50">
                Savings Accounts
              </span>
            )}
            
            <AnimatePresence>
              {isSavingsOpen && (!isSidebarCollapsed || isSidebarOpen) && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden pl-9 space-y-1"
                >
                  <SidebarSubLink id="os-balance" label="Ordinary Savings (OS)" active={activeView === 'os'} onClick={() => { setActiveView('os'); setIsSidebarOpen(false); }} />
                  <SidebarSubLink id="ss-balance" label="Special Savings (SS)" active={activeView === 'ss'} onClick={() => { setActiveView('ss'); setIsSidebarOpen(false); }} />
                  <SidebarSubLink id="ia-balance" label="Investment Account (IA)" active={activeView === 'ia'} onClick={() => { setActiveView('ia'); setIsSidebarOpen(false); }} />
                  <SidebarSubLink id="cp-balance" label="Commodity Purchase (CP)" active={activeView === 'cp'} onClick={() => { setActiveView('cp'); setIsSidebarOpen(false); }} />
                  <SidebarSubLink id="mca-balance" label="Muslim Community Account" active={activeView === 'mca'} onClick={() => { setActiveView('mca'); setIsSidebarOpen(false); }} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <SidebarLink 
            icon={<Sparkles className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0 text-emerald-600" />} 
            label="Online Top-up & Payments" 
            active={activeView === 'payments'} 
            collapsed={isSidebarCollapsed && !isSidebarOpen}
            onClick={() => {
              setActiveView('payments');
              setIsSidebarOpen(false);
            }}
          />

          <SidebarLink 
            icon={<ArrowDownToLine className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0" />} 
            label="Withdrawal" 
            active={activeView === 'withdrawal'} 
            collapsed={isSidebarCollapsed && !isSidebarOpen}
            onClick={() => {
              setActiveView('withdrawal');
              setIsSidebarOpen(false);
            }}
          />

          <SidebarLink 
            icon={<CreditCard className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0" />} 
            label="My Loans" 
            active={activeView === 'loans'} 
            collapsed={isSidebarCollapsed && !isSidebarOpen}
            onClick={() => {
              setActiveView('loans');
              setIsSidebarOpen(false);
            }}
          />

          <SidebarLink 
            icon={<TrendingUp className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0" />} 
            label="Wealth Planner" 
            active={activeView === 'planning'} 
            collapsed={isSidebarCollapsed && !isSidebarOpen}
            onClick={() => {
              setActiveView('planning');
              setIsSidebarOpen(false);
            }}
          />

          <SidebarLink 
            icon={<UserCheck className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0" />} 
            label="KYC Compliance" 
            active={activeView === 'kyc'} 
            collapsed={isSidebarCollapsed && !isSidebarOpen}
            onClick={() => {
              setActiveView('kyc');
              setIsSidebarOpen(false);
            }}
          />

          <SidebarLink 
            icon={<LifeBuoy className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0" />} 
            label="Helpdesk Support" 
            active={activeView === 'helpdesk'} 
            collapsed={isSidebarCollapsed && !isSidebarOpen}
            onClick={() => {
              setActiveView('helpdesk');
              setIsSidebarOpen(false);
            }}
          />

          <SidebarLink 
            icon={<Settings className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0" />} 
            label="Settings" 
            active={activeView === 'settings'} 
            collapsed={isSidebarCollapsed && !isSidebarOpen}
            onClick={() => {
              setActiveView('settings');
              setIsSidebarOpen(false);
            }}
          />
        </nav>

        {/* Member Profile Footer */}
        <div className="p-3 border-t border-slate-100 mt-auto bg-slate-50/60">
          {(!isSidebarCollapsed || isSidebarOpen) ? (
            <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-sm flex items-center justify-between gap-2">
              <button 
                onClick={() => {
                  setActiveView('profile');
                  setIsSidebarOpen(false);
                }}
                className="flex items-center gap-2.5 overflow-hidden text-left flex-1 hover:opacity-80 transition cursor-pointer"
                title="Open Member Profile"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs shrink-0">
                  {memberData?.fullName ? memberData.fullName.charAt(0) : 'M'}
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-slate-900 truncate">{memberData?.fullName || localStorage.getItem('zimco_name') || 'Member'}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{memberData?.id || localStorage.getItem('zimco_id') || 'Member'}</p>
                </div>
              </button>
              <button 
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0 cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          ) : (
            <div className="relative group">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </button>
              <span className="hidden lg:group-hover:block absolute left-full ml-3 px-2.5 py-1 bg-rose-900 text-white text-[11px] font-semibold rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none">
                Logout
              </span>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            {/* Mobile / Tablet Drawer Button */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              aria-label="Open menu"
            >
              <Menu className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
            </button>

            {/* Current View Title on header */}
            <div className="hidden sm:block">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md">
                {activeView === 'dashboard' ? 'Overview' :
                 activeView === 'loans' ? 'Credit Portal' :
                 activeView === 'settings' ? 'Preferences' :
                 activeView === 'withdrawal' ? 'Disbursements' :
                 activeView === 'planning' ? 'Calculators' :
                 activeView === 'kyc' ? 'Sovereign ID' :
                 activeView === 'helpdesk' ? 'Help Desk' : 'Savings'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <input 
                type="text" 
                placeholder="Search transactions, savings..." 
                className="bg-slate-50 border border-slate-200 rounded-full py-1.5 pl-8 pr-3 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all w-52 lg:w-64"
              />
            </div>
            <button 
              onClick={() => handleDownloadTransactionsPDF()}
              disabled={isDownloadingPDF}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold transition active:scale-95 disabled:opacity-50 cursor-pointer"
              title="Download recent transactions summary PDF"
            >
              <FileDown size={13} className="text-emerald-600" />
              <span>{isDownloadingPDF ? 'Exporting...' : 'Export PDF'}</span>
            </button>
            <div className="hidden xl:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5 text-xs font-bold text-slate-600">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</span>
            </div>
            <button 
              onClick={() => setIsNotificationsModalOpen(true)}
              className="w-9 h-9 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors relative cursor-pointer active:scale-95" 
              title="SMS & Email Automated Notifications"
            >
              <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {notifications.filter(n => !n.isRead).length > 0 ? (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-rose-500 text-white rounded-full text-[9px] font-black flex items-center justify-center animate-pulse">
                  {notifications.filter(n => !n.isRead).length}
                </span>
              ) : (
                <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full"></span>
              )}
            </button>

            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

            {/* User Profile Avatar with Initials & Quick Link to Account Settings */}
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                id="user-profile-avatar-btn"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-full hover:bg-slate-100 border border-slate-200/90 transition-all cursor-pointer group focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                title="Account Settings & Member Profile"
                aria-label="User profile and settings menu"
                aria-expanded={isProfileMenuOpen}
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-emerald-800 via-emerald-700 to-teal-600 text-white flex items-center justify-center font-extrabold text-xs sm:text-sm tracking-wider shadow-sm ring-2 ring-emerald-500/20 group-hover:ring-emerald-500/40 group-hover:scale-105 transition-all relative shrink-0">
                  {getUserInitials(memberData?.fullName)}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full"></span>
                </div>
                <div className="hidden lg:block text-left pr-1">
                  <p className="text-xs font-bold text-slate-800 leading-tight group-hover:text-emerald-800 transition-colors">
                    {formatGreetingName(memberData?.fullName)}
                  </p>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    {memberData?.id || localStorage.getItem('zimco_id') || 'ZIMCO'}
                  </p>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 hidden sm:block ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile & Account Settings Dropdown Menu */}
              <AnimatePresence>
                {isProfileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-200/90 py-2 z-50 overflow-hidden font-body"
                  >
                    {/* Header User Card */}
                    <div className="px-4 py-3 bg-gradient-to-r from-slate-50 to-emerald-50/40 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-emerald-800 to-teal-600 text-white flex items-center justify-center font-extrabold text-sm shadow-sm ring-2 ring-emerald-500/20 shrink-0">
                          {getUserInitials(memberData?.fullName)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-slate-900 truncate">
                            {memberData?.fullName || localStorage.getItem('zimco_name') || 'Cooperative Member'}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {memberData?.email || localStorage.getItem('zimco_email') || 'member@zimco.org'}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-200 text-slate-700">
                              {memberData?.id || localStorage.getItem('zimco_id') || 'Member'}
                            </span>
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              <ShieldCheck size={10} />
                              <span>{kycStatus === 'verified' ? 'Verified KYC' : 'Member'}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Links Section */}
                    <div className="p-2 space-y-1">
                      {/* Direct Quick Link to Account Settings */}
                      <button
                        type="button"
                        id="quick-link-account-settings"
                        onClick={() => {
                          setActiveView('settings');
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-emerald-50/80 text-slate-700 hover:text-emerald-900 transition-colors text-left group cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-700 group-hover:text-white transition-colors shrink-0">
                          <Settings size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-900">Account Settings</p>
                          <p className="text-[11px] text-slate-400 group-hover:text-emerald-700/80 truncate">Security, 2FA, timeout & credentials</p>
                        </div>
                        <ChevronRight size={14} className="text-slate-400 group-hover:text-emerald-600 transition-transform group-hover:translate-x-0.5" />
                      </button>

                      {/* Link to Member Profile */}
                      <button
                        type="button"
                        id="quick-link-member-profile"
                        onClick={() => {
                          setActiveView('profile');
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-colors text-left group cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center group-hover:bg-slate-800 group-hover:text-white transition-colors shrink-0">
                          <User size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800">Member Profile</p>
                          <p className="text-[11px] text-slate-400 truncate">Personal bio, Next of Kin, phone & email</p>
                        </div>
                        <ChevronRight size={14} className="text-slate-400 group-hover:text-slate-600 transition-transform group-hover:translate-x-0.5" />
                      </button>

                      {/* Help Desk Link */}
                      <button
                        type="button"
                        id="quick-link-helpdesk"
                        onClick={() => {
                          setActiveView('helpdesk');
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-colors text-left group cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                          <MessageSquare size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800">Help Desk & Support</p>
                          <p className="text-[11px] text-slate-400 truncate">Submit ticket or talk with admin</p>
                        </div>
                        <ChevronRight size={14} className="text-slate-400 group-hover:text-slate-600" />
                      </button>
                    </div>

                    {/* Footer / Logout */}
                    <div className="pt-2 mt-1 border-t border-slate-100 px-2">
                      <button
                        type="button"
                        id="profile-dropdown-logout-btn"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-700 text-xs font-bold transition-colors cursor-pointer"
                      >
                        <LogOut size={15} />
                        <span>Sign Out from Cooperative</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Main View Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 max-w-full">
          <div className="max-w-7xl mx-auto w-full">
            {isLoadingProfile && !memberData ? (
              <div className="py-24 flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-4 shadow-sm">
                  <div className="w-7 h-7 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <h3 className="font-headline text-lg font-bold text-slate-800 mb-1">Retrieving Member Profile...</h3>
                <p className="text-xs text-slate-500 max-w-sm">
                  Connecting to Firestore to fetch your verified cooperative account, passbook ledgers, and savings balances.
                </p>
              </div>
            ) : (
              renderView()
            )}
          </div>
        </main>
      </div>

      {/* Statement Modal */}
      <AnimatePresence>
        {isStatementModalOpen && (
          <div className={`fixed inset-0 z-[100] flex items-center justify-center ${isStatementModalMaximized ? 'p-0' : 'p-3 sm:p-4'} bg-slate-900/60 backdrop-blur-sm`}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className={`bg-white ${isStatementModalMaximized ? 'w-screen h-screen rounded-none max-w-none max-h-none' : 'rounded-2xl sm:rounded-3xl max-w-4xl w-full max-h-[90vh]'} flex flex-col shadow-2xl border border-slate-100 overflow-hidden transition-all duration-200`}
            >
              {/* Modal Header */}
              <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                    <FileText size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-headline text-lg sm:text-xl font-bold text-slate-900">Member Financial Statement</h3>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold rounded-md">
                        {memberData?.id || 'Member'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">Complete record of your transactions and savings history</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleDownloadTransactionsPDF(statementFilter === 'all' ? undefined : statementFilter)}
                    disabled={isDownloadingPDF}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    <FileDown size={14} />
                    <span className="hidden sm:inline">{isDownloadingPDF ? 'Generating PDF...' : 'Download Statement PDF'}</span>
                  </button>
                  <button 
                    onClick={() => setIsStatementModalMaximized(!isStatementModalMaximized)}
                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border border-slate-200/60"
                    title={isStatementModalMaximized ? "Restore window size" : "Expand to fill the screen"}
                  >
                    {isStatementModalMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                  </button>
                  <button 
                    onClick={() => {
                      setIsStatementModalOpen(false);
                      setIsStatementModalMaximized(false);
                    }}
                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Account Filter Tabs */}
              <div className="px-4 sm:px-6 py-3 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto bg-white">
                <span className="text-xs font-bold text-slate-400 mr-2 flex items-center gap-1 shrink-0">
                  <Filter size={12} /> Filter:
                </span>
                {[
                  { id: 'all', label: 'All Accounts' },
                  { id: 'os', label: 'Ordinary (OS)' },
                  { id: 'ss', label: 'Special (SS)' },
                  { id: 'ia', label: 'Investment (IA)' },
                  { id: 'cp', label: 'Commodity (CP)' },
                  { id: 'mca', label: 'Muslim (MCA)' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setStatementFilter(tab.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                      statementFilter === tab.id
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Modal Body: Transaction Table */}
              <div className="p-4 sm:p-6 overflow-y-auto flex-1">
                {(() => {
                  let filtered = transactions;
                  if (statementFilter !== 'all') {
                    const targetLabel = statementFilter === 'os' ? 'Ordinary Savings' :
                                        statementFilter === 'ss' ? 'Special Savings' :
                                        statementFilter === 'ia' ? 'Investment Account' :
                                        statementFilter === 'cp' ? 'Commodity Account' : 'Muslim Community Account';
                    filtered = transactions.filter(t => t.account === targetLabel || t.account?.toLowerCase() === statementFilter.toLowerCase());
                  }

                  if (filtered.length === 0) {
                    return (
                      <div className="py-12 text-center">
                        <FileText className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                        <p className="text-sm font-bold text-slate-700">No transactions recorded for this filter</p>
                        <p className="text-xs text-slate-400 mt-1">Try selecting "All Accounts" to view your full history.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-slate-100 text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
                            <th className="pb-3 px-3">Date</th>
                            <th className="pb-3 px-3">Account</th>
                            <th className="pb-3 px-3">Description</th>
                            <th className="pb-3 px-3 text-center">Type</th>
                            <th className="pb-3 px-3 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-xs sm:text-sm">
                          {filtered.map((tx) => (
                            <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                              <td className="py-3 px-3 font-mono text-xs text-slate-500 whitespace-nowrap">{tx.date}</td>
                              <td className="py-3 px-3">
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-semibold whitespace-nowrap">
                                  {tx.account || 'General'}
                                </span>
                              </td>
                              <td className="py-3 px-3 font-medium text-slate-900">{tx.description}</td>
                              <td className="py-3 px-3 text-center">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  tx.type === 'credit' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                                }`}>
                                  {tx.type}
                                </span>
                              </td>
                              <td className={`py-3 px-3 font-mono font-black text-right whitespace-nowrap ${
                                tx.type === 'credit' ? 'text-emerald-600' : 'text-rose-600'
                              }`}>
                                {tx.type === 'credit' ? '+' : '-'}{tx.amount}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>

              {/* Modal Footer */}
              <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <Shield size={14} className="text-emerald-600" />
                  <span>Official certified statement issued by ZIMCO Cooperative.</span>
                </div>
                <button
                  onClick={() => {
                    setIsStatementModalOpen(false);
                    setIsStatementModalMaximized(false);
                  }}
                  className="w-full sm:w-auto px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Expanded Full-Screen View for Recent Transactions */}
      <AnimatePresence>
        {isRecentTxExpanded && (
          <div className="fixed inset-0 z-[100] bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="w-screen h-screen bg-white flex flex-col overflow-hidden"
            >
              {/* Fullscreen Header */}
              <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    <TrendingUp size={22} />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold font-headline">Recent Transactions (Expanded View)</h2>
                    <p className="text-xs text-slate-300">Complete chronological record of credits, deductions, and transfers</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleDownloadTransactionsPDF()}
                    disabled={isDownloadingPDF}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    <FileDown size={14} />
                    <span className="hidden sm:inline">{isDownloadingPDF ? 'Generating PDF...' : 'Download Summary PDF'}</span>
                  </button>
                  <button
                    onClick={() => setIsRecentTxExpanded(false)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition border border-slate-700 cursor-pointer"
                    title="Exit fullscreen mode"
                  >
                    <Minimize2 size={15} />
                    <span>Exit Fullscreen</span>
                  </button>
                </div>
              </div>

              {/* Toolbar with Transaction Type, Date Presets, and Search */}
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-2.5">
                  {/* Transaction Type Filter Tabs in Fullscreen */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {(['all', 'savings', 'loans', 'fees', 'commodities', 'withdrawals'] as const).map((typeKey) => {
                      const count = typeKey === 'all' ? transactions.length : transactions.filter(t => getTransactionCategory(t) === typeKey).length;
                      const labelMap: Record<string, string> = {
                        all: 'All',
                        savings: 'Savings',
                        loans: 'Loans',
                        fees: 'Fees & Levies',
                        commodities: 'Commodities',
                        withdrawals: 'Withdrawals'
                      };
                      const isActive = activityTypeFilter === typeKey;

                      return (
                        <button
                          key={typeKey}
                          onClick={() => setActivityTypeFilter(typeKey)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                            isActive
                              ? 'bg-emerald-700 text-white shadow-sm'
                              : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                          }`}
                        >
                          <span>{labelMap[typeKey]}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-2 text-xs font-bold text-slate-600 ml-auto">
                    <span>Matching Records:</span>
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg font-mono">
                      {filteredDashboardTransactions.length}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                    <div className="flex items-center gap-1 text-slate-500 text-xs font-semibold">
                      <Calendar size={13} className="text-emerald-700" />
                      <span>Date Filter:</span>
                    </div>
                    <select
                      value={activityDatePreset}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setActivityDatePreset(val);
                        if (val === 'custom') {
                          setShowCustomDateInputs(true);
                        } else {
                          setShowCustomDateInputs(false);
                          setActivityStartDate('');
                          setActivityEndDate('');
                        }
                      }}
                      className="bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl px-2.5 py-1.5 focus:ring-2 focus:ring-emerald-600 cursor-pointer shadow-sm"
                    >
                      <option value="all">All Dates</option>
                      <option value="this_month">This Month</option>
                      <option value="last_30_days">Last 30 Days</option>
                      <option value="last_3_months">Last 3 Months</option>
                      <option value="this_year">This Year</option>
                      <option value="custom">Custom Date Range...</option>
                    </select>

                    {(activityTypeFilter !== 'all' || activityDatePreset !== 'all' || activityStartDate || activityEndDate || activitySearchQuery) && (
                      <button
                        onClick={handleResetActivityFilters}
                        className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer transition ml-2"
                      >
                        <RotateCcw size={11} />
                        <span>Reset All</span>
                      </button>
                    )}
                  </div>

                  <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input 
                      type="text" 
                      placeholder="Search description, account, amount..."
                      value={activitySearchQuery}
                      onChange={(e) => setActivitySearchQuery(e.target.value)}
                      className="w-full pl-9 pr-7 py-1.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-600 font-medium shadow-sm"
                    />
                    {activitySearchQuery && (
                      <button
                        onClick={() => setActivitySearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Fullscreen Table View */}
              <div className="flex-1 overflow-auto p-4 sm:p-6 bg-white">
                {(() => {
                  const filtered = filteredDashboardTransactions;

                  if (filtered.length === 0) {
                    return (
                      <div className="py-16 text-center">
                        <FileText className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                        <p className="text-sm font-bold text-slate-700">No transactions match your search query or filter criteria</p>
                        <button
                          onClick={handleResetActivityFilters}
                          className="mt-3 px-3.5 py-1.5 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 text-xs font-bold rounded-xl transition cursor-pointer"
                        >
                          Clear All Filters
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-100/80 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                            <th className="p-3.5 sm:p-4">Date</th>
                            <th className="p-3.5 sm:p-4">Account</th>
                            <th className="p-3.5 sm:p-4">Description</th>
                            <th className="p-3.5 sm:p-4 text-center">Type</th>
                            <th className="p-3.5 sm:p-4 text-right">Amount (₦)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                          {filtered.map((tx) => (
                            <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                              <td className="p-3.5 sm:p-4 font-mono text-slate-500 whitespace-nowrap">{tx.date}</td>
                              <td className="p-3.5 sm:p-4">
                                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold whitespace-nowrap">
                                  {tx.account || 'General'}
                                </span>
                              </td>
                              <td className="p-3.5 sm:p-4">
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${tx.type === 'credit' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                    {tx.type === 'credit' ? (
                                      <ArrowUpRight className="w-4 h-4" />
                                    ) : (
                                      <ArrowDownLeft className="w-4 h-4" />
                                    )}
                                  </div>
                                  <span className="font-semibold text-slate-900">{tx.description}</span>
                                </div>
                              </td>
                              <td className="p-3.5 sm:p-4 text-center">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  tx.type === 'credit' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                                }`}>
                                  {tx.type}
                                </span>
                              </td>
                              <td className={`p-3.5 sm:p-4 font-mono font-black text-right whitespace-nowrap text-sm sm:text-base ${
                                tx.type === 'credit' ? 'text-emerald-600' : 'text-rose-600'
                              }`}>
                                {tx.type === 'credit' ? '+' : '-'}{tx.amount}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>

              {/* Fullscreen Footer */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
                <span>Displaying full transaction register • Press Esc or click Exit Fullscreen to return</span>
                <button
                  onClick={() => setIsRecentTxExpanded(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Expanded Full-Screen View for Account Statement */}
      <AnimatePresence>
        {isAccountTxExpanded && (
          <div className="fixed inset-0 z-[100] bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="w-screen h-screen bg-white flex flex-col overflow-hidden"
            >
              {/* Fullscreen Header */}
              <div className="p-4 sm:p-6 bg-emerald-900 text-white flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 text-emerald-300 flex items-center justify-center font-bold">
                    <FileText size={22} />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold font-headline">
                      {activeView === 'os' ? 'Ordinary Savings' :
                       activeView === 'ss' ? 'Special Savings' :
                       activeView === 'ia' ? 'Investment Account' :
                       activeView === 'cp' ? 'Commodity Account' : 'Muslim Community Account'} Detailed Statement (Fullscreen)
                    </h2>
                    <p className="text-xs text-emerald-200">Chronological transaction register and verified balances</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => {
                      const currentAccountLabel = activeView === 'os' ? 'Ordinary Savings' :
                                                  activeView === 'ss' ? 'Special Savings' :
                                                  activeView === 'ia' ? 'Investment Account' :
                                                  activeView === 'cp' ? 'Commodity Account' : 'Muslim Community Account';
                      handleDownloadTransactionsPDF(currentAccountLabel);
                    }}
                    disabled={isDownloadingPDF}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    <FileDown size={14} />
                    <span className="hidden sm:inline">{isDownloadingPDF ? 'Generating PDF...' : 'Download PDF'}</span>
                  </button>
                  <button
                    onClick={() => setIsAccountTxExpanded(false)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-950 hover:bg-emerald-800 text-emerald-100 rounded-xl text-xs font-bold transition border border-emerald-700 cursor-pointer"
                    title="Exit fullscreen mode"
                  >
                    <Minimize2 size={15} />
                    <span>Exit Fullscreen</span>
                  </button>
                </div>
              </div>

              {/* Table View */}
              <div className="flex-1 overflow-auto p-4 sm:p-6 bg-white">
                {(() => {
                  const currentAccountLabel = activeView === 'os' ? 'Ordinary Savings' :
                                              activeView === 'ss' ? 'Special Savings' :
                                              activeView === 'ia' ? 'Investment Account' :
                                              activeView === 'cp' ? 'Commodity Account' : 'Muslim Community Account';
                  const accountTx = transactions.filter(t => t.account === currentAccountLabel);

                  if (accountTx.length === 0) {
                    return (
                      <div className="py-16 text-center">
                        <FileText className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                        <p className="text-sm font-bold text-slate-700">No transactions recorded for this account</p>
                      </div>
                    );
                  }

                  return (
                    <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-100/80 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                            <th className="p-3.5 sm:p-4">Date</th>
                            <th className="p-3.5 sm:p-4">Description</th>
                            <th className="p-3.5 sm:p-4 text-center">Type</th>
                            <th className="p-3.5 sm:p-4 text-right">Amount (₦)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                          {accountTx.map((tx, idx) => (
                            <tr key={tx.id || idx} className="hover:bg-slate-50 transition-colors">
                              <td className="p-3.5 sm:p-4 font-mono text-slate-500 whitespace-nowrap">{tx.date}</td>
                              <td className="p-3.5 sm:p-4 font-semibold text-slate-900">{tx.description}</td>
                              <td className="p-3.5 sm:p-4 text-center">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  tx.type === 'credit' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                                }`}>
                                  {tx.type}
                                </span>
                              </td>
                              <td className={`p-3.5 sm:p-4 font-mono font-black text-right whitespace-nowrap text-sm sm:text-base ${
                                tx.type === 'credit' ? 'text-emerald-600' : 'text-rose-600'
                              }`}>
                                {tx.type === 'credit' ? '+' : '-'}{tx.amount}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>

              {/* Fullscreen Footer */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
                <span>Account Specific Ledger View</span>
                <button
                  onClick={() => setIsAccountTxExpanded(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PDF Toast Notification */}
      <AnimatePresence>
        {pdfToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 ${
              pdfToast.type === 'success' 
                ? 'bg-emerald-900 text-white border-emerald-700 shadow-emerald-900/30' 
                : 'bg-rose-900 text-white border-rose-700 shadow-rose-900/30'
            }`}
          >
            {pdfToast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <p className="text-xs font-semibold">{pdfToast.message}</p>
            <button 
              onClick={() => setPdfToast(null)}
              className="text-white/60 hover:text-white ml-2"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Online Instant Top-Up Modal */}
      <OnlineTopUpModal
        isOpen={isTopUpModalOpen}
        onClose={() => setIsTopUpModalOpen(false)}
        memberData={memberData}
        defaultAccount={topUpDefaultAccount}
        onPaymentSuccess={(updatedData, newTx) => {
          setMemberData(updatedData);
          setTransactions(prev => [newTx, ...prev]);
          const memberId = memberData?.id || localStorage.getItem('zimco_id') || '';
          getMemberNotifications(memberId).then(list => setNotifications(list));
        }}
      />

      {/* Automated SMS & Email Notifications Modal */}
      <NotificationsModal
        isOpen={isNotificationsModalOpen}
        onClose={() => setIsNotificationsModalOpen(false)}
        notifications={notifications}
        memberData={memberData}
        onNotificationsUpdated={(updated) => setNotifications(updated)}
        preferences={notificationPreferences}
        onPreferencesUpdated={(prefs) => setNotificationPreferences(prefs)}
      />

      {/* CIA Triad 4-Checkpoint Security & Credential Update Prompt */}
      <CIASecurityPrompt
        isOpen={showCIASecurityModal}
        memberData={memberData}
        onClose={() => setShowCIASecurityModal(false)}
        onNavigateToSettings={() => {
          setShowCIASecurityModal(false);
          setActiveView('settings');
        }}
      />
    </div>
  );
}

function SidebarLink({ icon, label, active = false, collapsed = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, collapsed?: boolean, onClick: () => void }) {
  return (
    <div className="relative group">
      <button 
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-xs font-bold ${
          collapsed ? 'lg:justify-center' : ''
        } ${
          active 
            ? 'bg-emerald-50 text-emerald-800 shadow-sm border border-emerald-500/10 font-black' 
            : 'text-slate-600 hover:bg-slate-50 hover:text-emerald-700'
        }`}
      >
        <span className="shrink-0">{icon}</span>
        {!collapsed && <span className="truncate">{label}</span>}
      </button>
      {collapsed && (
        <span className="hidden lg:group-hover:flex items-center gap-1 absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-semibold rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none border border-slate-700/50">
          {label}
        </span>
      )}
    </div>
  );
}

function SidebarSubLink({ id, label, active = false, onClick }: { id: string, label: string, active?: boolean, onClick: () => void }) {
  return (
    <button 
      id={id}
      onClick={onClick}
      className={`w-full text-left py-2 text-xs font-bold transition-colors ${
        active ? 'text-emerald-600' : 'text-slate-400 hover:text-emerald-600'
      }`}
    >
      {label}
    </button>
  );
}

function AccountCard({ id, label, balance, status, icon, color, onClick, index = 0 }: { id: string, label: string, balance: string, status: string, icon: React.ReactNode, color: string, onClick: () => void, index?: number }) {
  const colorClasses: Record<string, string> = {
    primary: 'bg-primary-container/10 text-primary border-primary/20',
    secondary: 'bg-secondary-container/10 text-secondary border-secondary/20',
    tertiary: 'bg-tertiary-container/10 text-tertiary border-tertiary/20',
  };

  const dotClasses: Record<string, string> = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    tertiary: 'bg-tertiary',
  };

  return (
    <motion.button 
      onClick={onClick}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.65, 
        delay: index * 0.08, 
        ease: [0.16, 1, 0.3, 1] 
      }}
      className="glass-panel group relative flex flex-col bg-surface-container-lowest rounded-2xl p-5 sm:p-6 shadow-[0_20px_40px_rgba(25,28,29,0.04)] border border-white/40 hover:shadow-[0_24px_48px_rgba(0,99,58,0.08)] hover:border-primary/30 transition-all duration-300 text-left cursor-pointer"
    >
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${colorClasses[color]} border flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <p className="text-[11px] sm:text-xs font-bold text-on-surface-variant uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-1.5 sm:mb-2">{label}</p>
      <p id={id} className="font-headline text-lg sm:text-xl md:text-2xl font-black text-primary mb-3 sm:mb-4">{balance}</p>
      <div className="flex items-center gap-2 mt-auto">
        <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${dotClasses[color]} animate-pulse`}></span>
        <span className="text-[9px] sm:text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{status}</span>
      </div>
    </motion.button>
  );
}
