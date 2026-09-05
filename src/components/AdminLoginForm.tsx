import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
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
          const empRef = doc(db, 'users', idClean);
          const empSnap = await getDoc(empRef);
          if (empSnap.exists()) {
            employeeData = empSnap.data();
            email = employeeData.email || `${idClean.toLowerCase()}@zimco.org`;
          } else {
            const staffRef = doc(db, 'staff_members', idClean);
            const staffSnap = await getDoc(staffRef);
            if (staffSnap.exists()) {
              employeeData = staffSnap.data();
              email = employeeData.email || `${idClean.toLowerCase()}@zimco.org`;
            }
          }
        } catch (dbErr) {
          console.warn('Firestore employee lookup notice:', dbErr);
        }
      }

      if (!employeeData && !email) {
        throw new Error(`Credential "${inputClean}" is not registered in the cooperative employee database.`);
      }

      const targetEmail = email || employeeData?.email;
      if (!targetEmail) {
        throw new Error(`No official email configured for ID "${inputClean}".`);
      }

      // Configure session persistence
      try {
        await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      } catch (pErr) {
        console.warn('Session persistence notice:', pErr);
      }

      // Authenticate against Firebase Auth
      let userCredential;
      try {
        userCredential = await signInWithEmailAndPassword(auth, targetEmail, password);
      } catch (authError: any) {
        if (authError.code === 'auth/invalid-credential' || authError.code === 'auth/wrong-password') {
          throw new Error('Invalid security password. Please verify your credentials.');
        } else if (authError.code === 'auth/user-not-found') {
          throw new Error(`No active authentication account found for ${targetEmail}. Please contact your administrator.`);
        } else {
          throw authError;
        }
      }

      if (userCredential) {
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

        // Record administrative audit log entry
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

        // Seamless auto-routing based on assigned ID/Role
        const destination = resolveDestinationForEmployee(idClean, assignedRole);
        navigate(destination);
      }

    } catch (error: any) {
      console.error('Employee authentication failure:', error);
      setErrorMessage(error.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-[480px] relative"
    >
      {onBack && (
        <button 
          onClick={onBack}
          className="absolute -top-10 left-0 flex items-center gap-1.5 text-xs text-slate-500 hover:text-emerald-800 transition-colors font-bold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </button>
      )}

      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
        <div className="bg-[#0b5c36] p-6 text-white relative">
          <p className="text-xs font-semibold tracking-widest text-green-200 mb-1">STAFF PORTAL</p>
          <h2 className="text-3xl font-bold">Staff Sign In</h2>
          <svg className="w-8 h-8 absolute top-6 right-6 text-green-300 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
          </svg>
        </div>

        <div className="p-8">
          <div className="flex items-center justify-center space-x-2 bg-green-50 text-green-800 text-xs font-bold py-2 px-4 rounded-lg mb-6 border border-green-100">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" clipRule="evenodd"></path>
            </svg>
            <span>OFFICIAL STAFF ACCESS ONLY</span>
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium flex items-center animate-pulse">
              <svg className="w-5 h-5 mr-2 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Staff ID or Official Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                  </svg>
                </div>
                <input 
                  type="text" 
                  placeholder="e.g. Staff ID or email" 
                  value={employeeIdInput}
                  onChange={(e) => setEmployeeIdInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0b5c36] focus:bg-white transition-colors text-sm font-medium"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0b5c36] focus:bg-white transition-colors text-sm"
                  required
                  disabled={isLoading}
                />
                <div 
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <svg className={`h-5 w-5 transition-colors ${showPassword ? 'text-[#0b5c36]' : 'text-gray-400 hover:text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex items-center mb-6 pt-1">
              <input 
                type="checkbox" 
                id="rememberEmployee" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-[#0b5c36] focus:ring-[#0b5c36] border-gray-300 rounded cursor-pointer" 
              />
              <label htmlFor="rememberEmployee" className="ml-2 block text-xs font-medium text-gray-600 cursor-pointer select-none">
                Remember me
              </label>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#0b5c36] hover:bg-[#08482a] text-white font-bold py-3.5 px-4 rounded-xl flex justify-center items-center transition-colors shadow-lg shadow-green-900/20 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  Login
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-gray-100 pt-6">
            <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
              For authorized staff only. You will be directed to your department dashboard.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
