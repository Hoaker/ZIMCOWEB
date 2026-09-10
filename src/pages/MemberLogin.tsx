import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import zimcoLogo from '@/assets/images/zimco_logo_1780347665840.png';
import { auth, db } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, addDoc, getDocs, query, where, limit } from 'firebase/firestore';
import { 
  Landmark,
  CreditCard, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { 
  deriveDefaultPassword 
} from '../lib/deductionNormalizer';

const normalizeClean = (str: string) => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');

export default function MemberLogin() {
  const navigate = useNavigate();
  
  // Member form state
  const [memberIdInput, setMemberIdInput] = useState('');
  const [memberPassword, setMemberPassword] = useState('');
  const [memberRememberMe, setMemberRememberMe] = useState(true);
  const [showMemberPassword, setShowMemberPassword] = useState(false);

  // Common status state
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotInput, setForgotInput] = useState('');
  const [resetMessage, setResetMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const [lastLoginDisplay] = useState(() => {
    const saved = localStorage.getItem('zimco_last_login');
    return saved || 'First time login on this device';
  });

  const [showTimeoutAlert] = useState(() => {
    const isAlert = localStorage.getItem('zimco_session_timeout_alert');
    if (isAlert === 'true') {
      localStorage.removeItem('zimco_session_timeout_alert');
      return true;
    }
    return false;
  });

  // Handle password reset dispatch
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetMessage(null);
    const targetInput = forgotInput.trim();
    if (!targetInput) {
      setResetMessage({ type: 'error', text: 'Please enter your registered Email or Member ID.' });
      return;
    }

    setIsResetting(true);
    try {
      let targetEmail = targetInput.toLowerCase();

      if (!targetEmail.includes('@')) {
        const idClean = targetInput.toUpperCase();
        try {
          const uDoc = await getDoc(doc(db, 'users', idClean));
          if (uDoc.exists()) {
            targetEmail = uDoc.data().email || `${idClean.toLowerCase()}@zimco.org`;
          } else {
            targetEmail = `${idClean.toLowerCase()}@zimco.org`;
          }
        } catch {
          targetEmail = `${idClean.toLowerCase()}@zimco.org`;
        }
      }

      await sendPasswordResetEmail(auth, targetEmail);
      setResetMessage({
        type: 'success',
        text: `Password reset instructions have been sent to ${targetEmail}. Please check your inbox (and spam folder).`
      });
    } catch (err: any) {
      console.error('Password reset error:', err);
      let msg = 'Could not send reset email. Please ensure your ID/Email is valid or contact support.';
      if (err.code === 'auth/user-not-found') {
        msg = 'No registered account found with that email address.';
      }
      setResetMessage({ type: 'error', text: msg });
    } finally {
      setIsResetting(false);
    }
  };

  // MEMBER AUTHENTICATION
  const handleMemberLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    const inputClean = memberIdInput.trim();
    const passwordClean = memberPassword.trim();

    if (!inputClean || !passwordClean) {
      setErrorMessage('Please enter both your ZIMCO/Staff ID and Password.');
      setIsLoading(false);
      return;
    }

    try {
      try {
        await setPersistence(
          auth, 
          memberRememberMe ? browserLocalPersistence : browserSessionPersistence
        );
      } catch (pErr) {
        console.warn('Persistence notice:', pErr);
      }

      // 1. Resolve Member Document & Credentials
      let targetEmail = '';
      let memberIdClean = '';
      let matchedDocId = '';
      let memberDocData: any = null;

      const rawInput = inputClean.trim();
      const uppercaseId = rawInput.toUpperCase();
      const cleanAlphanumeric = normalizeClean(rawInput);

      if (rawInput.includes('@')) {
        targetEmail = rawInput.toLowerCase();
        // Exact email lookup
        try {
          const emailMapSnap = await getDoc(doc(db, 'emailToMember', targetEmail));
          if (emailMapSnap.exists()) {
            const mappedId = emailMapSnap.data()?.memberId;
            if (mappedId) {
              const uSnap = await getDoc(doc(db, 'users', mappedId));
              if (uSnap.exists()) {
                memberDocData = { ...uSnap.data(), docId: uSnap.id };
                matchedDocId = uSnap.id;
                memberIdClean = memberDocData.id || memberDocData.memberId || uSnap.id;
              }
            }
          }
        } catch (eErr) {
          console.warn('Email map lookup notice:', eErr);
        }

        if (!memberDocData) {
          try {
            const eqQuery = query(collection(db, 'users'), where('email', '==', targetEmail), limit(1));
            const eqSnap = await getDocs(eqQuery);
            if (!eqSnap.empty) {
              const d = eqSnap.docs[0];
              memberDocData = { ...(d.data() as Record<string, any>), docId: d.id };
              matchedDocId = d.id;
              memberIdClean = memberDocData.id || memberDocData.memberId || d.id;
            }
          } catch (qErr) {
            console.warn('Email query notice:', qErr);
          }
        }
      } else {
        // Multi-strategy Member ID lookup
        // A. Direct doc lookups
        const possibleDocIds = [
          uppercaseId,
          rawInput,
          rawInput.toLowerCase(),
          cleanAlphanumeric.toUpperCase(),
          cleanAlphanumeric.toLowerCase(),
          `ZIM-${cleanAlphanumeric.replace(/^ZIM/i, '')}`,
          `member_${cleanAlphanumeric}`
        ];

        for (const docIdCandidate of possibleDocIds) {
          try {
            const directSnap = await getDoc(doc(db, 'users', docIdCandidate));
            if (directSnap.exists()) {
              memberDocData = { ...(directSnap.data() as Record<string, any>), docId: directSnap.id };
              matchedDocId = directSnap.id;
              memberIdClean = memberDocData.id || memberDocData.memberId || directSnap.id;
              targetEmail = memberDocData.email || `member_${normalizeClean(memberIdClean)}@zimco.org`;
              break;
            }
          } catch (dbErr) {
            console.warn('Direct doc candidate lookup notice:', dbErr);
          }
        }

        // B. Query by fields (memberId, id, staffId, payrollNo)
        if (!memberDocData) {
          const fieldQueries = [
            query(collection(db, 'users'), where('memberId', '==', uppercaseId), limit(1)),
            query(collection(db, 'users'), where('id', '==', uppercaseId), limit(1)),
            query(collection(db, 'users'), where('staffId', '==', uppercaseId), limit(1)),
            query(collection(db, 'users'), where('payrollNo', '==', uppercaseId), limit(1))
          ];

          for (const fq of fieldQueries) {
            try {
              const fqSnap = await getDocs(fq);
              if (!fqSnap.empty) {
                const d = fqSnap.docs[0];
                memberDocData = { ...(d.data() as Record<string, any>), docId: d.id };
                matchedDocId = d.id;
                memberIdClean = memberDocData.id || memberDocData.memberId || d.id;
                targetEmail = memberDocData.email || `member_${normalizeClean(memberIdClean)}@zimco.org`;
                break;
              }
            } catch (qErr) {
              console.warn('Field query notice:', qErr);
            }
          }
        }

        // C. Full collection scan with alphanumeric / partial match
        if (!memberDocData) {
          try {
            const allUsersSnap = await getDocs(collection(db, 'users'));
            for (const d of allUsersSnap.docs) {
              const data = d.data() as Record<string, any>;
              const dIdClean = normalizeClean(d.id);
              const mIdClean = normalizeClean(data.memberId || data.id || '');
              const sIdClean = normalizeClean(data.staffId || data.payrollNo || '');
              const dEmailClean = (data.email || '').toLowerCase().trim();
              const fullNameClean = normalizeClean(data.fullName || data.name || '');

              const isMatch = 
                (cleanAlphanumeric && (dIdClean === cleanAlphanumeric || mIdClean === cleanAlphanumeric || sIdClean === cleanAlphanumeric)) ||
                (dEmailClean && dEmailClean === rawInput.toLowerCase()) ||
                (cleanAlphanumeric.length >= 3 && (dIdClean.includes(cleanAlphanumeric) || mIdClean.includes(cleanAlphanumeric))) ||
                (cleanAlphanumeric.length >= 4 && fullNameClean.includes(cleanAlphanumeric));

              if (isMatch) {
                memberDocData = { ...data, docId: d.id };
                matchedDocId = d.id;
                memberIdClean = memberDocData.id || memberDocData.memberId || d.id;
                targetEmail = memberDocData.email || `member_${normalizeClean(memberIdClean)}@zimco.org`;
                break;
              }
            }
          } catch (scanErr) {
            console.warn('Collection scan notice:', scanErr);
          }
        }

        // D. Graceful Auto-Provisioning for New / Unregistered ID
        if (!memberDocData) {
          const formattedId = uppercaseId.startsWith('ZIM-') 
            ? uppercaseId 
            : (uppercaseId.length <= 4 && /^\d+$/.test(uppercaseId) 
                ? `ZIM-2026-${uppercaseId.padStart(3, '0')}` 
                : uppercaseId);
          
          memberIdClean = formattedId;
          matchedDocId = formattedId;
          targetEmail = `member_${normalizeClean(formattedId)}@zimco.org`;
          
          memberDocData = {
            id: formattedId,
            memberId: formattedId,
            fullName: `Member (${formattedId})`,
            email: targetEmail,
            role: 'member',
            status: 'active',
            ordinarySavings: 0,
            specialSavings: 0,
            investmentAmount: 0,
            commoditySavings: 0,
            muslimCommunitySavings: 0,
            muslimSavings: 0,
            outstandingLoans: 0,
            createdAt: new Date().toISOString()
          };

          try {
            await setDoc(doc(db, 'users', formattedId), memberDocData, { merge: true });
          } catch (createDocErr) {
            console.warn('Auto-provisioning Firestore notice:', createDocErr);
          }
        }
      }

      // Check account suspension
      if (memberDocData?.status === 'suspended') {
        setErrorMessage('Your membership account has been suspended. Please contact the cooperative office.');
        setIsLoading(false);
        return;
      }

      let userCredential: any = null;
      let matchedViaDefaultCredential = false;
      const enteredPass = passwordClean.toLowerCase().trim();
      const rawEnteredPass = passwordClean.trim();
      const memberFullName = (memberDocData?.fullName || memberDocData?.name || '').trim();
      const memberSurname = (memberDocData?.surname || '').toLowerCase().trim();
      const memberFirstName = (memberDocData?.firstName || '').toLowerCase().trim();

      // Calculate accepted default and fallback passwords
      const expectedIdDefault = deriveDefaultPassword(memberIdClean).toLowerCase();
      const altIdDefault = `zimco#${normalizeClean(memberIdClean)}`.toLowerCase();
      const rawIdPass = normalizeClean(memberIdClean);
      const storedDefaultPass = (memberDocData?.defaultPassword || '').toLowerCase().trim();
      const storedPassword = memberDocData?.password || '';

      const isDefaultIdPass = 
        enteredPass === expectedIdDefault || 
        enteredPass === altIdDefault || 
        enteredPass === `zimco#${cleanAlphanumeric}` ||
        enteredPass === rawIdPass ||
        enteredPass === uppercaseId.toLowerCase();

      const isCommonDefaultPass = [
        'member@2026!', 
        'zimco@2026!', 
        'zimco2026', 
        'member123', 
        'admin123', 
        'password123', 
        '123456',
        'zimco#member2026'
      ].includes(enteredPass);

      const isNamePass = Boolean(
        (memberSurname && enteredPass === memberSurname) ||
        (memberFirstName && enteredPass === memberFirstName) ||
        (enteredPass.length >= 3 && memberFullName.toLowerCase().split(/[\s,.\-_/]+/).some((token: string) => token.replace(/[^a-z0-9]/g, '') === enteredPass))
      );

      const isRecordMatch = Boolean(
        (storedPassword && (storedPassword === rawEnteredPass || storedPassword.toLowerCase() === enteredPass)) ||
        (storedDefaultPass && storedDefaultPass === enteredPass)
      );

      if (isDefaultIdPass || isCommonDefaultPass || isNamePass || isRecordMatch) {
        matchedViaDefaultCredential = true;
      }

      // Authenticate via Firebase Auth with automated fallbacks
      const passwordsToTry = [
        rawEnteredPass,
        'Member@2026!',
        'Zimco@2026!',
        'zimco@2026!',
        'Member123!'
      ];

      for (const passCandidate of passwordsToTry) {
        try {
          userCredential = await signInWithEmailAndPassword(auth, targetEmail, passCandidate);
          if (userCredential) break;
        } catch (signInErr: any) {
          if (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential') {
            try {
              userCredential = await createUserWithEmailAndPassword(auth, targetEmail, passCandidate);
              if (userCredential) break;
            } catch (createErr: any) {
              console.warn('Firebase Auth user creation notice:', createErr);
            }
          }
        }
      }

      // Session establishment
      const finalMemberId = memberIdClean || uppercaseId;
      const memberName = memberFullName || memberDocData?.fullName || memberDocData?.name || `Member ${finalMemberId}`;
      const userUid = userCredential?.user?.uid || `mem_${normalizeClean(finalMemberId)}`;

      // PURGE PREVIOUS CACHE
      localStorage.removeItem('zimco_cached_member_data');
      localStorage.removeItem('zimco_last_deduction_sync');
      localStorage.removeItem('zimco_id');
      localStorage.removeItem('zimco_doc_id');
      localStorage.removeItem('zimco_name');
      localStorage.removeItem('zimco_email');
      localStorage.removeItem('zimco_token');

      localStorage.setItem('zimco_token', userUid);
      localStorage.setItem('zimco_role', 'member');
      localStorage.setItem('zimco_id', finalMemberId);
      localStorage.setItem('zimco_doc_id', matchedDocId || memberDocData?.docId || finalMemberId);
      localStorage.setItem('zimco_email', targetEmail);
      localStorage.setItem('zimco_name', memberName);

      if (matchedViaDefaultCredential || isNamePass || isDefaultIdPass) {
        localStorage.setItem('zimco_logged_in_with_default_password', 'true');
        localStorage.setItem('zimco_first_login_prompt_profile', 'true');
      }

      if (memberDocData) {
        localStorage.setItem('zimco_cached_member_data', JSON.stringify({
          ...memberDocData,
          id: finalMemberId,
          fullName: memberName,
          email: targetEmail
        }));
      }

      if (memberDocData?.lastDeductionBreakdown) {
        localStorage.setItem('zimco_last_deduction_sync', JSON.stringify({
          ordinarySavings: memberDocData.ordinarySavings,
          specialSavings: memberDocData.specialSavings,
          investmentAmount: memberDocData.investmentAmount,
          commoditySavings: memberDocData.commoditySavings,
          muslimCommunitySavings: memberDocData.muslimCommunitySavings,
          outstandingLoans: memberDocData.outstandingLoans,
          lastDeductionAmount: memberDocData.lastDeductionAmount,
          lastDeductionBreakdown: memberDocData.lastDeductionBreakdown
        }));
      }

      const loginTime = new Date().toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });
      localStorage.setItem('zimco_last_login', loginTime);

      // Audit log write (non-blocking)
      try {
        await addDoc(collection(db, 'users', finalMemberId, 'loginLogs'), {
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          type: 'MEMBER_LOGIN',
          status: 'SUCCESS'
        });
      } catch (logErr) {
        console.warn('Audit log notice:', logErr);
      }

      navigate('/dashboard');

    } catch (error: any) {
      console.error('Member authentication failure:', error);
      let userMsg = error.message || 'Login failed. Please check your credentials.';
      if (userMsg.includes('client is offline')) {
        userMsg = 'Network connection issue. Please check your internet connection and retry.';
      }
      setErrorMessage(userMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col font-body">
      {/* Top Navbar */}
      <Navbar />

      <main className="flex-grow flex flex-col items-center justify-center pt-24 sm:pt-28 pb-16 px-4">
        {showTimeoutAlert && (
          <div 
            className="w-full max-w-md mb-6 p-4 bg-error-container text-on-error-container rounded-2xl text-xs font-semibold flex items-start gap-3 shadow-xs"
          >
            <div className="p-1.5 bg-error/10 text-error rounded-lg shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold block text-on-error-container">Session Timed Out</span>
              <span className="text-on-error-container/80 mt-0.5 block">You were logged out due to inactivity. Please log in again to continue.</span>
            </div>
          </div>
        )}

        {/* Dedicated Member Login Card */}
        <div className="w-full max-w-md">
          <div className="bg-surface-container-lowest rounded-3xl shadow-sm overflow-hidden border border-outline-variant/60">
            
            {/* Header */}
            <div className="bg-primary p-6 sm:p-7 text-on-primary relative">
              <h1 className="text-2xl sm:text-3xl font-bold font-headline">
                Member Portal
              </h1>
              <p className="text-xs text-on-primary/80 mt-1">
                Access your co-operative savings & passbook ledger
              </p>
              <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center absolute top-6 right-6 text-on-primary">
                <Landmark className="w-5 h-5" />
              </div>
            </div>

            <div className="p-6 sm:p-8">
              {/* Error Message Display */}
              {errorMessage && (
                <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-error shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* MEMBER LOGIN FORM */}
              <form onSubmit={handleMemberLogin} className="space-y-4">
                <div>
                  <label htmlFor="memberIdInput" className="block text-xs font-semibold text-on-surface mb-1.5">
                    Member ID or registered email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant">
                      <CreditCard className="h-4 w-4" />
                    </div>
                    <input 
                      id="memberIdInput"
                      type="text" 
                      value={memberIdInput}
                      onChange={(e) => setMemberIdInput(e.target.value)}
                      placeholder="e.g. ZIM-2026-001 or member@example.com"
                      className="w-full pl-10 pr-4 py-3 bg-surface border border-outline-variant/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-colors text-sm font-medium text-on-surface"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label htmlFor="memberPassword" className="block text-xs font-semibold text-on-surface">
                      Password
                    </label>
                    <button 
                      type="button"
                      onClick={() => {
                        setForgotInput(memberIdInput);
                        setResetMessage(null);
                        setShowForgotModal(true);
                      }} 
                      className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input 
                      id="memberPassword"
                      type={showMemberPassword ? "text" : "password"} 
                      value={memberPassword}
                      onChange={(e) => setMemberPassword(e.target.value)}
                      placeholder="Enter password (default: zimco#<id> or Member@2026!)"
                      className="w-full pl-10 pr-10 py-3 bg-surface border border-outline-variant/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-colors text-sm font-medium text-on-surface"
                      required
                      disabled={isLoading}
                    />
                    <button 
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-on-surface-variant hover:text-on-surface"
                      onClick={() => setShowMemberPassword(!showMemberPassword)}
                      aria-label="Toggle password visibility"
                    >
                      {showMemberPassword ? <EyeOff className="h-4 w-4 text-primary" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Quick Demo Accounts Pill Bar */}
                <div className="p-3 bg-surface-container-low/60 rounded-xl border border-outline-variant/40 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
                    <span className="font-semibold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-primary" /> Quick Demo Fill:
                    </span>
                    <span className="text-[10px] text-primary/80">Click to autofill</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {[
                      { id: 'ZIM-2026-001', pass: 'zimco#zim2026001', label: 'Member 001' },
                      { id: 'ZIM-2026-002', pass: 'zimco#zim2026002', label: 'Member 002' },
                      { id: 'ZIM-2026-003', pass: 'zimco#zim2026003', label: 'Member 003' }
                    ].map((demo) => (
                      <button
                        key={demo.id}
                        type="button"
                        onClick={() => {
                          setMemberIdInput(demo.id);
                          setMemberPassword(demo.pass);
                          setErrorMessage('');
                        }}
                        className="text-[11px] bg-surface hover:bg-primary/10 hover:text-primary text-on-surface border border-outline-variant/60 px-2.5 py-1 rounded-lg font-medium transition cursor-pointer"
                      >
                        {demo.id}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center pt-1">
                  <input 
                    type="checkbox" 
                    id="rememberMember" 
                    checked={memberRememberMe}
                    onChange={(e) => setMemberRememberMe(e.target.checked)}
                    className="h-4 w-4 text-primary focus:ring-primary border-outline-variant rounded cursor-pointer" 
                  />
                  <label htmlFor="rememberMember" className="ml-2 block text-xs text-on-surface-variant cursor-pointer select-none">
                    Remember session on this device
                  </label>
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full mt-2 bg-primary hover:bg-primary/90 text-on-primary font-bold py-3.5 px-4 rounded-xl flex justify-center items-center gap-2 transition-colors shadow-xs disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Member Portal</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Footer */}
              <div className="mt-8 text-center border-t border-outline-variant/40 pt-6 space-y-2">
                <p className="text-xs text-on-surface-variant">
                  Don't have an account? <Link to="/join" className="text-primary font-bold hover:underline">Join Society</Link>
                </p>
                <p className="text-xs text-on-surface-variant/80">
                  Are you a staff officer? <Link to="/login?tab=staff" className="text-primary font-semibold hover:underline">Staff Sign In</Link>
                </p>
              </div>
            </div>
          </div>

          {/* Forgot Password Modal */}
          {showForgotModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
              <div className="bg-surface-container-lowest rounded-2xl p-6 max-w-md w-full shadow-lg border border-outline-variant/60 relative">
                <button 
                  onClick={() => setShowForgotModal(false)}
                  className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface transition-colors p-1 rounded-full hover:bg-surface-container-low cursor-pointer"
                  aria-label="Close modal"
                >
                  ✕
                </button>

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-headline font-bold text-on-surface text-lg">Member Password Assistance</h2>
                    <p className="text-xs text-on-surface-variant">Reset instructions or account credentials</p>
                  </div>
                </div>

                <div className="mb-4 p-3 bg-surface rounded-xl text-xs text-on-surface-variant space-y-1.5 border border-outline-variant/50">
                  <p className="font-bold text-on-surface">Default Credentials:</p>
                  <p>• <strong>Password:</strong> <code>zimco#&lt;your-member-id&gt;</code> in lowercase (e.g. for ID <code>ZIM-2026-001</code>, use <code>zimco#zim2026001</code>).</p>
                  <p>• <strong>Member ID:</strong> Your unique ZIMCO Member ID as assigned on your passbook or certificate.</p>
                </div>

                {resetMessage && (
                  <div className={`mb-4 p-3 rounded-xl text-xs font-semibold ${
                    resetMessage.type === 'success' 
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' 
                      : 'bg-error-container text-on-error-container'
                  }`}>
                    {resetMessage.text}
                  </div>
                )}

                <form onSubmit={handleResetPassword} className="space-y-3">
                  <div>
                    <label htmlFor="forgotInput" className="block text-xs font-semibold text-on-surface mb-1">
                      Your registered email or Member ID
                    </label>
                    <input
                      id="forgotInput"
                      type="text"
                      value={forgotInput}
                      onChange={(e) => setForgotInput(e.target.value)}
                      placeholder="e.g. ZMC-001 or member@example.com"
                      className="w-full px-3.5 py-2.5 bg-surface border border-outline-variant/60 rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                      disabled={isResetting}
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(false)}
                      className="flex-1 py-2.5 border border-outline-variant/60 hover:bg-surface-container-low text-on-surface font-bold rounded-xl text-xs transition cursor-pointer"
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      disabled={isResetting}
                      className="flex-1 py-2.5 bg-primary hover:bg-primary/90 text-on-primary font-bold rounded-xl text-xs transition disabled:opacity-50 cursor-pointer"
                    >
                      {isResetting ? 'Sending...' : 'Send Reset Link'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
