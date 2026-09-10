import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, addDoc } from 'firebase/firestore';

interface AdminLoginFormProps {
  role?: string;
  onBack?: () => void;
}

export default function AdminLoginForm({ onBack }: AdminLoginFormProps) {
  const navigate = useNavigate();
  const [employeeIdInput, setEmployeeIdInput] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const resolveDestinationForEmployee = (idOrRole: string, docRole?: string): string => {
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    const inputClean = employeeIdInput.trim();
    if (!inputClean) {
      setErrorMessage('Employee ID or official email is required');
      return;
    }
    if (!password) {
      setErrorMessage('Security password is required');
      return;
    }

    setIsLoading(true);

    try {
      let employeeData: any = null;
      let email = '';
      let idClean = inputClean.toUpperCase();

      // Check if user entered email or ID
      if (inputClean.includes('@')) {
        email = inputClean.toLowerCase();
        try {
          const emailMapRef = doc(db, 'emailToMember', email);
          const emailMapSnap = await getDoc(emailMapRef);
          if (emailMapSnap.exists()) {
            idClean = emailMapSnap.data().memberId;
          }
          const userRef = doc(db, 'users', idClean);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            employeeData = userSnap.data();
          } else {
            // Check staff_members
            const staffRef = doc(db, 'staff_members', idClean);
            const staffSnap = await getDoc(staffRef);
            if (staffSnap.exists()) {
              employeeData = staffSnap.data();
            }
          }
        } catch (dbErr) {
          console.warn('Firestore employee lookup error:', dbErr);
        }
      } else {
        // Entered an ID (e.g. EMP-101, ADM-001)
        try {
          const userRef = doc(db, 'users', idClean);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            employeeData = userSnap.data();
            email = employeeData.email || `${idClean.toLowerCase()}@zimco.org`;
          } else {
            // Check staff_members collection
            const staffRef = doc(db, 'staff_members', idClean);
            const staffSnap = await getDoc(staffRef);
            if (staffSnap.exists()) {
              employeeData = staffSnap.data();
              email = employeeData.email || `${idClean.toLowerCase()}@zimco.org`;
            } else {
              email = `${idClean.toLowerCase()}@zimco.org`;
            }
          }
        } catch (dbErr) {
          console.warn('Firestore lookup error for ID:', dbErr);
          email = `${idClean.toLowerCase()}@zimco.org`;
        }
      }

      if (!email) {
        email = `${idClean.toLowerCase()}@zimco.org`;
      }

      // Check user status
      if (employeeData && employeeData.status === 'suspended') {
        setErrorMessage('This staff account has been suspended. Please contact the administrator.');
        setIsLoading(false);
        return;
      }

      // Set persistence
      try {
        await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      } catch (persistErr) {
        console.warn('Could not set persistence:', persistErr);
      }

      // Perform auth sign in
      let userCredential;
      try {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } catch (authError: any) {
        if (authError.code === 'auth/user-not-found' || authError.code === 'auth/invalid-credential') {
          try {
            userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            await setDoc(doc(db, 'users', idClean), {
              memberId: idClean,
              email: email,
              role: employeeData?.role || 'staff',
              createdAt: new Date().toISOString(),
              fullName: employeeData?.fullName || `Staff Member ${idClean}`
            }, { merge: true });
          } catch (createError: any) {
            setErrorMessage('Invalid Staff ID / Email or Password.');
            setIsLoading(false);
            return;
          }
        } else if (authError.code === 'auth/wrong-password') {
          setErrorMessage('Invalid password provided.');
          setIsLoading(false);
          return;
        } else {
          setErrorMessage(authError.message || 'Authentication failed');
          setIsLoading(false);
          return;
        }
      }

      const user = userCredential.user;
      const resolvedRole = employeeData?.role || 'staff';
      const staffName = employeeData?.fullName || employeeData?.name || `Staff ${idClean}`;

      // Save token to localStorage for authenticated session
      localStorage.setItem('zimco_token', await user.getIdToken());
      localStorage.setItem('zimco_role', resolvedRole);
      localStorage.setItem('zimco_id', idClean);
      localStorage.setItem('zimco_name', staffName);
      localStorage.setItem('zimco_login_time', new Date().toISOString());

      // Write audit log
      try {
        await addDoc(collection(db, 'audit_logs'), {
          action: 'STAFF_LOGIN',
          performedBy: idClean,
          userName: staffName,
          role: resolvedRole,
          timestamp: new Date().toISOString(),
          details: `Staff logged in successfully as ${resolvedRole}`
        });
      } catch (logErr) {
        console.warn('Audit logging failed:', logErr);
      }

      const destination = resolveDestinationForEmployee(idClean, resolvedRole);
      navigate(destination);
    } catch (err: any) {
      console.error('Staff Login Catch Error:', err);
      setErrorMessage(err.message || 'An unexpected error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
    >
      {onBack && (
        <button
          onClick={onBack}
          className="mb-4 text-xs font-semibold text-on-surface-variant hover:text-on-surface flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </button>
      )}

      <div className="bg-surface-container-lowest rounded-3xl shadow-sm overflow-hidden border border-outline-variant/60">
        <div className="bg-primary p-6 sm:p-7 text-on-primary relative">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-white/15 text-on-primary text-[10px] font-bold border border-white/20">
              Staff access
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-headline text-on-primary">Staff Sign In</h2>
          <p className="text-xs text-on-primary/80 mt-1">Authorized officers & administration</p>
          <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center absolute top-6 right-6 text-on-primary">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-6 sm:p-8 bg-surface-container-lowest text-on-surface">
          {errorMessage && (
            <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2">
              <span className="shrink-0">⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1.5">Staff ID or official email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <input 
                  type="text" 
                  placeholder="e.g. BUR-001 or admin@zimco.org" 
                  value={employeeIdInput}
                  onChange={(e) => setEmployeeIdInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-surface border border-outline-variant/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-colors text-sm font-medium text-on-surface"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant">
                  <Lock className="h-4 w-4" />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Enter staff password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-surface border border-outline-variant/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-colors text-sm font-medium text-on-surface"
                  required
                  disabled={isLoading}
                />
                <button 
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-on-surface-variant hover:text-on-surface"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="h-4 w-4 text-primary" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center pt-1">
              <input 
                type="checkbox" 
                id="rememberAdmin" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-outline-variant rounded cursor-pointer" 
              />
              <label htmlFor="rememberAdmin" className="ml-2 block text-xs text-on-surface-variant cursor-pointer select-none">
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
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
