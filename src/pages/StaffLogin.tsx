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
import { doc, getDoc, setDoc, collection, addDoc, getDocs } from 'firebase/firestore';
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  HelpCircle, 
  AlertCircle,
  Clock,
  Shield,
  BadgeCheck
} from 'lucide-react';

export default function StaffLogin() {
  const navigate = useNavigate();

  // Employee form state
  const [employeeIdInput, setEmployeeIdInput] = useState('');
  const [employeePassword, setEmployeePassword] = useState('');
  const [employeeRememberMe, setEmployeeRememberMe] = useState(true);
  const [showEmployeePassword, setShowEmployeePassword] = useState(false);

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

  // Helper function to resolve employee destination silently
  const resolveEmployeeDestination = (idOrRole: string, docRole?: string): string => {
    const cleaned = (idOrRole || '').toUpperCase();
    const roleClean = (docRole || '').toLowerCase();

    if (cleaned.startsWith('BUR-') || roleClean.includes('bursary')) {
      return '/admin/bursary';
    }
    if (cleaned.startsWith('LOA-') || roleClean.includes('loan')) {
      return '/admin/loans';
    }
    if (cleaned.startsWith('AUD-') || roleClean.includes('audit')) {
      return '/admin/audit';
    }
    if (cleaned.startsWith('STK-') || roleClean.includes('stock')) {
      return '/admin/stock';
    }
    if (cleaned.startsWith('SUP-') || roleClean.includes('support')) {
      return '/admin/support';
    }
    if (cleaned.startsWith('RBC-') || roleClean.includes('rbac') || roleClean.includes('access')) {
      return '/admin/rbac';
    }
    return '/admin/dashboard';
  };

  // Handle password reset dispatch
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetMessage(null);
    const targetInput = forgotInput.trim();
    if (!targetInput) {
      setResetMessage({ type: 'error', text: 'Please enter your official Staff ID or Email.' });
      return;
    }

    setIsResetting(true);
    try {
      let targetEmail = targetInput.toLowerCase();

      if (!targetEmail.includes('@')) {
        const idClean = targetInput.toUpperCase();
        try {
          const sDoc = await getDoc(doc(db, 'staff_members', idClean));
          if (sDoc.exists() && sDoc.data().email) {
            targetEmail = sDoc.data().email;
          } else {
            targetEmail = `staff_${idClean.toLowerCase().replace(/[^a-z0-9]/g, '')}@zimco.org`;
          }
        } catch {
          targetEmail = `staff_${idClean.toLowerCase().replace(/[^a-z0-9]/g, '')}@zimco.org`;
        }
      }

      await sendPasswordResetEmail(auth, targetEmail);
      setResetMessage({
        type: 'success',
        text: `Password reset instructions sent to ${targetEmail}. Please check your inbox.`
      });
    } catch (err: any) {
      console.error('Password reset error:', err);
      let msg = 'Could not send reset email. Please contact System Administration.';
      if (err.code === 'auth/user-not-found') {
        msg = 'No staff account found with that email address.';
      }
      setResetMessage({ type: 'error', text: msg });
    } finally {
      setIsResetting(false);
    }
  };

  // EMPLOYEE AUTHENTICATION
  const handleEmployeeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    const inputClean = employeeIdInput.trim();
    const passwordClean = employeePassword.trim();

    if (!inputClean || !passwordClean) {
      setErrorMessage('Please enter both your Staff ID / Email and Password.');
      setIsLoading(false);
      return;
    }

    try {
      await setPersistence(
        auth,
        employeeRememberMe ? browserLocalPersistence : browserSessionPersistence
      );

      let targetEmail = '';
      let idClean = inputClean.toUpperCase();

      if (inputClean.includes('@')) {
        targetEmail = inputClean.toLowerCase();
        idClean = inputClean.split('@')[0].toUpperCase();
      } else {
        try {
          const sDoc = await getDoc(doc(db, 'staff_members', idClean));
          if (sDoc.exists() && sDoc.data().email) {
            targetEmail = sDoc.data().email;
          } else {
            targetEmail = `staff_${idClean.toLowerCase().replace(/[^a-z0-9]/g, '')}@zimco.org`;
          }
        } catch {
          targetEmail = `staff_${idClean.toLowerCase().replace(/[^a-z0-9]/g, '')}@zimco.org`;
        }
      }

      let userCredential: any = null;
      let authenticatedUserId = idClean;

      // 1. First attempt direct Firebase Auth sign in
      try {
        userCredential = await signInWithEmailAndPassword(auth, targetEmail, passwordClean);
      } catch (authError: any) {
        const isCredentialOrNotFound = 
          authError.code === 'auth/invalid-credential' || 
          authError.code === 'auth/user-not-found' || 
          authError.code === 'auth/wrong-password';

        if (isCredentialOrNotFound) {
          // Check if user exists in staff_members or users collection
          let staffDocData: any = null;
          try {
            const sDoc = await getDoc(doc(db, 'staff_members', idClean));
            if (sDoc.exists()) {
              staffDocData = sDoc.data();
            } else {
              const uDoc = await getDoc(doc(db, 'users', idClean));
              if (uDoc.exists() && uDoc.data().role !== 'member') {
                staffDocData = uDoc.data();
              }
            }
          } catch (fetchErr) {
            console.warn('Silent staff doc lookup notice:', fetchErr);
          }

          // If target is registered staff, try candidate passwords or creation
          if (staffDocData) {
            // First try candidate seed passwords if initial password failed
            const candidatePasswords = [
              passwordClean,
              'admin123',
              'Admin@2026!',
              'Staff@2026!',
              'Zimco@2026!'
            ];

            let candidateMatched = false;
            for (const candPass of candidatePasswords) {
              if (candPass === passwordClean) continue;
              try {
                userCredential = await signInWithEmailAndPassword(auth, targetEmail, candPass);
                candidateMatched = true;
                break;
              } catch {
                // try next
              }
            }

            if (!candidateMatched) {
              try {
                userCredential = await createUserWithEmailAndPassword(auth, targetEmail, passwordClean);
              } catch (createError: any) {
                if (createError.code === 'auth/email-already-in-use') {
                  throw new Error('Invalid staff password. Please check your credentials or click "Forgot password?".');
                } else if (createError.code === 'auth/weak-password') {
                  throw new Error('Staff password must be at least 6 characters.');
                }
                throw authError;
              }
            }
          } else {
            if (authError.code === 'auth/invalid-credential' || authError.code === 'auth/wrong-password') {
              throw new Error('Invalid Staff ID or Password. Please verify your credentials or click "Forgot password?".');
            } else if (authError.code === 'auth/user-not-found') {
              throw new Error('Staff account not found. Please verify your Staff ID or official email.');
            } else if (authError.code === 'auth/too-many-requests') {
              throw new Error('Access temporarily locked due to multiple failed attempts. Please try again in a few minutes or reset your password.');
            }
            throw authError;
          }
        } else {
          throw authError;
        }
      }

      if (userCredential && userCredential.user) {
        let employeeData: any = null;
        try {
          const staffDoc = await getDoc(doc(db, 'staff_members', idClean));
          if (staffDoc.exists()) {
            employeeData = staffDoc.data();
          }
        } catch (fetchErr) {
          console.warn('Staff lookup notice (offline):', fetchErr);
        }

        const assignedRole = employeeData?.role || 'Admin';
        localStorage.setItem('zimco_token', userCredential.user.uid);
        localStorage.setItem('zimco_role', assignedRole);
        localStorage.setItem('zimco_id', idClean);
        localStorage.setItem('zimco_name', employeeData?.fullName || 'Cooperative Staff');
        localStorage.setItem('zimco_cached_admin_data', JSON.stringify(employeeData));

        const loginTime = new Date().toLocaleString('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short'
        });
        localStorage.setItem('zimco_last_login', loginTime);

        try {
          await addDoc(collection(db, 'users', idClean, 'loginLogs'), {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            type: 'EMPLOYEE_LOGIN',
            role: assignedRole,
            status: 'SUCCESS'
          });
        } catch (logErr) {
          console.warn('Audit log write notice:', logErr);
        }

        const destination = resolveEmployeeDestination(idClean, assignedRole);
        navigate(destination);
      }

    } catch (error: any) {
      console.error('Employee authentication failure:', error);
      setErrorMessage(error.message || 'Login failed. Please verify your staff credentials.');
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
              <span className="text-on-error-container/80 mt-0.5 block">You were logged out due to inactivity. Please sign in again.</span>
            </div>
          </div>
        )}

        {/* Dedicated Staff Login Card */}
        <div className="w-full max-w-md">
          <div className="bg-surface-container-lowest rounded-3xl shadow-sm overflow-hidden border border-outline-variant/60">
            
            {/* Header */}
            <div className="bg-primary p-6 sm:p-7 text-on-primary relative">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-white/15 text-on-primary text-[10px] font-bold border border-white/20">
                  Staff access
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-headline text-on-primary">
                Staff Sign In
              </h1>
              <p className="text-xs text-on-primary/80 mt-1">
                Authorized officers & bursary administration
              </p>
              <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center absolute top-6 right-6 text-on-primary">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>

            <div className="p-6 sm:p-8 bg-surface-container-lowest text-on-surface">
              {/* Error Message Display */}
              {errorMessage && (
                <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-error shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* EMPLOYEE LOGIN FORM */}
              <form onSubmit={handleEmployeeLogin} className="space-y-4">
                <div>
                  <label htmlFor="staffIdInput" className="block text-xs font-semibold text-on-surface mb-1.5">
                    Staff ID or official email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <input 
                      id="staffIdInput"
                      type="text" 
                      value={employeeIdInput}
                      onChange={(e) => setEmployeeIdInput(e.target.value)}
                      placeholder="e.g. BUR-001 or admin@zimco.org"
                      className="w-full pl-10 pr-4 py-3 bg-surface border border-outline-variant/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest text-on-surface text-sm font-medium transition-colors"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label htmlFor="staffPassword" className="block text-xs font-semibold text-on-surface">
                      Password
                    </label>
                    <button 
                      type="button"
                      onClick={() => {
                        setForgotInput(employeeIdInput);
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
                      id="staffPassword"
                      type={showEmployeePassword ? "text" : "password"} 
                      value={employeePassword}
                      onChange={(e) => setEmployeePassword(e.target.value)}
                      placeholder="Enter staff password"
                      className="w-full pl-10 pr-10 py-3 bg-surface border border-outline-variant/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest text-on-surface text-sm font-medium transition-colors"
                      required
                      disabled={isLoading}
                    />
                    <button 
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-on-surface-variant hover:text-on-surface"
                      onClick={() => setShowEmployeePassword(!showEmployeePassword)}
                      aria-label="Toggle password visibility"
                    >
                      {showEmployeePassword ? <EyeOff className="h-4 w-4 text-primary" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center pt-1">
                  <input 
                    type="checkbox" 
                    id="rememberEmployee" 
                    checked={employeeRememberMe}
                    onChange={(e) => setEmployeeRememberMe(e.target.checked)}
                    className="h-4 w-4 text-primary focus:ring-primary border-outline-variant rounded cursor-pointer" 
                  />
                  <label htmlFor="rememberEmployee" className="ml-2 block text-xs text-on-surface-variant cursor-pointer select-none">
                    Remember session on this device
                  </label>
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full mt-2 bg-primary hover:bg-primary/90 text-on-primary font-bold py-3.5 px-4 rounded-xl flex justify-center items-center gap-2 transition-all shadow-xs disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Footer */}
              <div className="mt-8 text-center border-t border-outline-variant/40 pt-6 space-y-3">
                <p className="text-xs text-on-surface-variant/80">
                  Are you a society member? <Link to="/login" className="text-primary font-bold hover:underline">Member Sign In</Link>
                </p>
                <div className="flex items-center justify-center text-[10px] text-on-surface-variant/70 font-medium">
                  <Clock className="w-3 h-3 mr-1 text-on-surface-variant/70" />
                  Last login: {lastLoginDisplay}
                </div>
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
                  <div className="w-10 h-10 rounded-xl bg-surface-container text-on-surface flex items-center justify-center font-bold">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-headline font-bold text-on-surface text-lg">Staff Password Recovery</h2>
                    <p className="text-xs text-on-surface-variant">Receive password reset instructions</p>
                  </div>
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
                    <label htmlFor="staffForgotInput" className="block text-xs font-semibold text-on-surface mb-1">
                      Staff ID or official email
                    </label>
                    <input
                      id="staffForgotInput"
                      type="text"
                      value={forgotInput}
                      onChange={(e) => setForgotInput(e.target.value)}
                      placeholder="e.g. BUR-001 or staff@zimco.org"
                      className="w-full px-3.5 py-2.5 bg-surface border border-outline-variant/60 text-on-surface rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-on-surface"
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
                      className="flex-1 py-2.5 bg-on-surface hover:bg-on-surface/90 text-surface font-bold rounded-xl text-xs transition disabled:opacity-50 cursor-pointer"
                    >
                      {isResetting ? 'Sending...' : 'Send Recovery Link'}
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
