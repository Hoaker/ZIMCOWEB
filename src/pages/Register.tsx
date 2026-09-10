import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Briefcase, 
  Wallet, 
  Copy, 
  Sparkles, 
  Lock, 
  Eye, 
  EyeOff,
  CheckCircle2,
  Calendar,
  Building2,
  Download,
  AlertCircle,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import zimcoLogo from '@/assets/images/zimco_logo_1780347665840.png';

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  dob: string;
  department: string;
  staffId: string;
  isAutoGenerateId: boolean;
  ordinarySavings: number;
  specialSavings: number;
  investmentAmount: number;
  password: string;
  confirmPassword: string;
}

const INITIAL_STATE: FormState = {
  fullName: '',
  email: '',
  phone: '',
  dob: '',
  department: 'Administration',
  staffId: '',
  isAutoGenerateId: true,
  ordinarySavings: 20000,
  specialSavings: 10000,
  investmentAmount: 0,
  password: '',
  confirmPassword: '',
};

interface AdminFormState {
  fullName: string;
  email: string;
  role: 'Bursary Management' | 'Loan Approvals' | 'Society Audit' | 'Stock Management' | 'Admin';
  financialId: string;
  isAutoGenerateId: boolean;
  password: string;
  confirmPassword: string;
}

const INITIAL_ADMIN_STATE: AdminFormState = {
  fullName: '',
  email: '',
  role: 'Bursary Management',
  financialId: '',
  isAutoGenerateId: true,
  password: '',
  confirmPassword: '',
};

const DEPARTMENTS = [
  'Administration',
  'Finance & Accounts',
  'Information Technology',
  'Human Resources',
  'Engineering & Maintenance',
  'Operations',
  'Commercial & Sales',
];

const ADMIN_ROLES = [
  'Bursary Management',
  'Loan Approvals',
  'Society Audit',
  'Stock Management',
  'Admin'
];

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [registerRole, setRegisterRole] = useState<'member' | 'staff'>('member');
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormState>(INITIAL_STATE);
  const [adminFormData, setAdminFormData] = useState<AdminFormState>(INITIAL_ADMIN_STATE);
  
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [generatedId, setGeneratedId] = useState('');
  
  const [errors, setErrors] = useState<Partial<Record<keyof FormState | 'all', string>>>({});
  const [adminErrors, setAdminErrors] = useState<Partial<Record<keyof AdminFormState | 'all', string>>>({});

  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'staff') {
      setRegisterRole('staff');
    } else if (type === 'member') {
      setRegisterRole('member');
    }
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear field-specific error
    if (errors[name as keyof FormState]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAdminInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setAdminFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setAdminFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear field-specific error
    if (adminErrors[name as keyof AdminFormState]) {
      setAdminErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSavingsSlider = (amount: number) => {
    setFormData(prev => ({ ...prev, ordinarySavings: amount }));
  };

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Partial<Record<keyof FormState, string>> = {};
    
    if (currentStep === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required';
      } else if (!/^\+?\d{10,14}$/.test(formData.phone.replace(/[\s-]/g, ''))) {
        newErrors.phone = 'Please enter a valid phone number';
      }
      if (!formData.dob) newErrors.dob = 'Date of birth is required';
    } 
    
    else if (currentStep === 2) {
      if (!formData.isAutoGenerateId && !formData.staffId.trim()) {
        newErrors.staffId = 'Staff ID is required if not auto-generated';
      } else if (!formData.isAutoGenerateId && !/^ZIM-\d{4}-\d{3}$/.test(formData.staffId.trim())) {
        newErrors.staffId = 'Format must match: ZIM-YYYY-XXX (e.g., ZIM-2024-105)';
      }
    } 
    
    else if (currentStep === 3) {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters long';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    setIsSubmitting(true);
    setErrors({});
    
    try {
      // Generate standard Member ID
      const randomIdSuffix = Math.floor(100 + Math.random() * 900); // 100-999
      const generatedMemberId = formData.isAutoGenerateId 
        ? `ZIM-2026-${randomIdSuffix}`
        : formData.staffId;

      // Register user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // Store additional details in Firestore under `users` collection with Member ID as document key
      await setDoc(doc(db, 'users', generatedMemberId), {
        uid: user.uid,
        id: generatedMemberId,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        dob: formData.dob,
        department: formData.department,
        role: 'member',
        pledgedMonthlyOrdinarySavings: Number(formData.ordinarySavings) || 20000,
        pledgedMonthlySpecialSavings: Number(formData.specialSavings) || 0,
        pledgedMonthlyInvestment: Number(formData.investmentAmount) || 0,
        ordinarySavings: 0,
        specialSavings: 0,
        investmentAmount: 0,
        commoditySavings: 0,
        muslimCommunitySavings: 0,
        muslimSavings: 0,
        outstandingLoans: 0,
        kycStatus: 'draft',
        createdAt: new Date().toISOString()
      });

      // Map email to Member ID for easy login lookups!
      await setDoc(doc(db, 'emailToMember', formData.email.toLowerCase()), {
        memberId: generatedMemberId
      });

      setGeneratedId(generatedMemberId);
      setIsSuccess(true);
      
      // Persist temporary data in localStorage for frictionless mock sign-in
      localStorage.setItem('zimco_registered_id', generatedMemberId);
      localStorage.setItem('zimco_registered_name', formData.fullName);
    } catch (error: any) {
      console.error('Firebase registration error:', error);
      let errMsg = error.message || 'Registration failed. Please check your network and try again.';
      if (error.code === 'auth/email-already-in-use') {
        try {
          // Attempt self-healing / login
          const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
          const user = userCredential.user;

          // Check if email to member mapping exists
          const emailMapRef = doc(db, 'emailToMember', formData.email.toLowerCase());
          const emailMapSnap = await getDoc(emailMapRef);
          let memberId = '';
          if (emailMapSnap.exists()) {
            memberId = emailMapSnap.data().memberId;
          } else {
            const randomIdSuffix = Math.floor(100 + Math.random() * 900);
            memberId = formData.isAutoGenerateId ? `ZIM-2026-${randomIdSuffix}` : formData.staffId;
            await setDoc(emailMapRef, { memberId });
          }

          // Check if document exists in Firestore
          const memberRef = doc(db, 'users', memberId);
          const memberSnap = await getDoc(memberRef);
          if (!memberSnap.exists()) {
            await setDoc(memberRef, {
              uid: user.uid,
              id: memberId,
              fullName: formData.fullName,
              email: formData.email,
              phone: formData.phone,
              dob: formData.dob,
              department: formData.department,
              role: 'member',
              pledgedMonthlyOrdinarySavings: Number(formData.ordinarySavings) || 20000,
              pledgedMonthlySpecialSavings: Number(formData.specialSavings) || 0,
              pledgedMonthlyInvestment: Number(formData.investmentAmount) || 0,
              ordinarySavings: 0,
              specialSavings: 0,
              investmentAmount: 0,
              commoditySavings: 0,
              muslimCommunitySavings: 0,
              muslimSavings: 0,
              outstandingLoans: 0,
              kycStatus: 'draft',
              createdAt: new Date().toISOString()
            });
          }

          setGeneratedId(memberId);
          setIsSuccess(true);
          localStorage.setItem('zimco_registered_id', memberId);
          localStorage.setItem('zimco_registered_name', formData.fullName);
          return; // Success!
        } catch (signInError: any) {
          console.error('Self-healing member sign-in failed:', signInError);
          errMsg = 'This email address is already registered. If it is yours, please sign in or enter the correct password to sync your account.';
          if (signInError.code === 'auth/wrong-password' || signInError.code === 'auth/invalid-credential') {
            errMsg = 'This email address is already registered. The password you entered is incorrect for this account.';
          }
        }
      } else if (error.code === 'auth/weak-password') {
        errMsg = 'The password is too weak.';
      } else if (error.code === 'auth/invalid-email') {
        errMsg = 'Please enter a valid email address.';
      }
      setErrors(prev => ({ ...prev, all: errMsg }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateAdminForm = (): boolean => {
    const newErrors: Partial<Record<keyof AdminFormState, string>> = {};
    
    if (!adminFormData.fullName.trim()) newErrors.fullName = 'Full Legal Name is required';
    if (!adminFormData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(adminFormData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!adminFormData.isAutoGenerateId && !adminFormData.financialId.trim()) {
      newErrors.financialId = 'Custom Assigned Financial ID is required';
    } else if (!adminFormData.isAutoGenerateId && !/^[A-Z]{3}-\d{4}-\d{3}$/.test(adminFormData.financialId.trim())) {
      newErrors.financialId = 'Format must match: AAA-YYYY-XXX (e.g., ADM-2026-105)';
    }

    if (!adminFormData.password) {
      newErrors.password = 'Password is required';
    } else if (adminFormData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }
    
    if (adminFormData.password !== adminFormData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setAdminErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAdminForm()) return;

    setIsSubmitting(true);
    setAdminErrors({});

    try {
      let prefix = 'STF';
      switch (adminFormData.role) {
        case 'Bursary Management': prefix = 'BUR'; break;
        case 'Loan Approvals': prefix = 'LOA'; break;
        case 'Society Audit': prefix = 'AUD'; break;
        case 'Stock Management': prefix = 'STK'; break;
        case 'Admin': prefix = 'ADM'; break;
      }

      const randomSuffix = Math.floor(100 + Math.random() * 900); // 100-999
      const generatedAdminId = adminFormData.isAutoGenerateId
        ? `${prefix}-2026-${randomSuffix}`
        : adminFormData.financialId.toUpperCase().trim();

      // Register administrative user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, adminFormData.email, adminFormData.password);
      const user = userCredential.user;

      // Create administrative record in Firestore users collection
      const adminDoc = {
        uid: user.uid,
        id: generatedAdminId,
        fullName: adminFormData.fullName,
        email: adminFormData.email,
        role: adminFormData.role,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', generatedAdminId), adminDoc);

      // Map email to Financial ID
      await setDoc(doc(db, 'emailToMember', adminFormData.email.toLowerCase()), {
        memberId: generatedAdminId
      });

      setGeneratedId(generatedAdminId);
      setIsSuccess(true);

      // Persist values
      localStorage.setItem('zimco_registered_id', generatedAdminId);
      localStorage.setItem('zimco_registered_name', adminFormData.fullName);
    } catch (error: any) {
      console.error('Firebase administrator registration error:', error);
      let errMsg = error.message || 'Registration failed. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        try {
          // Attempt self-healing / login
          const userCredential = await signInWithEmailAndPassword(auth, adminFormData.email, adminFormData.password);
          const user = userCredential.user;

          // Check email mapping
          const emailMapRef = doc(db, 'emailToMember', adminFormData.email.toLowerCase());
          const emailMapSnap = await getDoc(emailMapRef);
          let adminId = '';
          if (emailMapSnap.exists()) {
            adminId = emailMapSnap.data().memberId;
          } else {
            let prefix = 'STF';
            switch (adminFormData.role) {
              case 'Bursary Management': prefix = 'BUR'; break;
              case 'Loan Approvals': prefix = 'LOA'; break;
              case 'Society Audit': prefix = 'AUD'; break;
              case 'Stock Management': prefix = 'STK'; break;
              case 'Admin': prefix = 'ADM'; break;
            }
            const randomSuffix = Math.floor(100 + Math.random() * 900);
            adminId = adminFormData.isAutoGenerateId
              ? `${prefix}-2026-${randomSuffix}`
              : adminFormData.financialId.toUpperCase().trim();
            await setDoc(emailMapRef, { memberId: adminId });
          }

          // Check if document exists in Firestore
          const adminRef = doc(db, 'users', adminId);
          const adminSnap = await getDoc(adminRef);
          if (!adminSnap.exists()) {
            await setDoc(adminRef, {
              uid: user.uid,
              id: adminId,
              fullName: adminFormData.fullName,
              email: adminFormData.email,
              role: adminFormData.role,
              createdAt: new Date().toISOString()
            });
          }

          setGeneratedId(adminId);
          setIsSuccess(true);
          localStorage.setItem('zimco_registered_id', adminId);
          localStorage.setItem('zimco_registered_name', adminFormData.fullName);
          return; // Success!
        } catch (signInError: any) {
          console.error('Self-healing admin sign-in failed:', signInError);
          errMsg = 'This email address is already registered as an administrator. If it is yours, please sign in or enter the correct password to sync your account.';
          if (signInError.code === 'auth/wrong-password' || signInError.code === 'auth/invalid-credential') {
            errMsg = 'This email address is already registered. The password you entered is incorrect for this account.';
          }
        }
      } else if (error.code === 'auth/weak-password') {
        errMsg = 'The password is too weak.';
      } else if (error.code === 'auth/invalid-email') {
        errMsg = 'Please enter a valid email address.';
      }
      setAdminErrors(prev => ({ ...prev, all: errMsg }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleProceedToLogin = () => {
    // Navigate with pre-filled state or simply forward
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pt-24 pb-16 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Progress Tracker */}
        {!isSuccess && registerRole === 'member' && (
          <div className="mb-10 max-w-xl mx-auto">
            <div className="flex justify-between items-center relative">
              {/* Connector Lines */}
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 z-0 rounded" />
              <div 
                className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 z-0 rounded transition-all duration-300" 
                style={{ width: `${((step - 1) / 2) * 100}%` }}
              />

              {[1, 2, 3].map((s) => (
                <div key={s} className="z-10 flex flex-col items-center">
                  <button 
                    disabled={s > step}
                    onClick={() => s < step ? setStep(s) : null}
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-md ${
                      s === step 
                        ? 'bg-primary text-on-primary ring-4 ring-primary/20 scale-110' 
                        : s < step 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-white text-slate-400 border border-slate-200'
                    }`}
                  >
                    {s < step ? <Check className="w-5 h-5" /> : s}
                  </button>
                  <span className={`text-[10px] font-bold uppercase tracking-wider mt-2 bg-slate-50 px-2 py-0.5 rounded transition-all ${
                    s === step 
                      ? 'text-primary' 
                      : s < step 
                      ? 'text-emerald-600 font-extrabold' 
                      : 'text-slate-400'
                  }`}>
                    {s === 1 ? 'Personal' : s === 2 ? 'Employment' : 'Contributions'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div 
              key="register-card"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 grid grid-cols-1 md:grid-cols-12"
            >
              
              {/* Left Column: Visual/Promo sidebar */}
              <div className="md:col-span-5 bg-gradient-to-br from-emerald-900 to-emerald-950 p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-bl-full -mr-20 -mt-20 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-700/15 rounded-tr-full -ml-16 -mb-16 pointer-events-none" />

                <div className="relative z-10">
                  <div className="flex items-center gap-2 text-xl font-black tracking-widest text-primary-fixed mb-12">
                    <img src={zimcoLogo} alt="ZIMCO" className="w-8 h-8 rounded-full object-cover shadow-md" referrerPolicy="no-referrer" />
                    <span className="font-headline text-white">ZIMCO</span>
                  </div>
                  
                  <h2 className="text-3xl font-black tracking-tight leading-tight font-headline mb-4">
                    Invest in your cooperative future.
                  </h2>
                  <p className="text-sm text-emerald-200/80 leading-relaxed font-medium mb-8">
                    Join over 5,000+ members pool capital, build investment assets, and obtain zero-collateral development commodity & financial loans.
                  </p>
                </div>

                <div className="space-y-4 relative z-10 pt-6 border-t border-emerald-800/60 max-w-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-800/40 flex items-center justify-center text-primary-fixed">
                      <Shield className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-semibold text-emerald-100/90">Zero-guarantor savings accounts</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-800/40 flex items-center justify-center text-primary-fixed">
                      <Wallet className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-semibold text-emerald-100/90">Instantly accessible dividend pools</p>
                  </div>
                </div>
              </div>

              {/* Right Column: Register Form */}
              <div className="md:col-span-7 p-8 md:p-12 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1 block">Zimco Enrollment Gate</span>
                      <h1 className="text-2xl font-black text-slate-800 font-headline">Cooperative Registry</h1>
                    </div>
                    {registerRole === 'member' && (
                      <span className="text-xs text-slate-400 font-semibold">
                        Step {step} of 3
                      </span>
                    )}
                  </div>

                  {/* Role Selection Tabs */}
                  <div className="flex bg-slate-150 p-1.5 rounded-2xl mb-6 border border-slate-200/40">
                    <button
                      type="button"
                      onClick={() => { setRegisterRole('member'); setStep(1); }}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                        registerRole === 'member'
                          ? 'bg-primary text-on-primary shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Member Enrollment
                    </button>
                    <button
                      type="button"
                      onClick={() => { setRegisterRole('staff'); }}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                        registerRole === 'staff'
                          ? 'bg-primary text-on-primary shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Staff / Admin
                    </button>
                  </div>

                  <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
                    
                    {/* STEP 1: Personal Details */}
                    {registerRole === 'member' && step === 1 && (
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-4"
                      >
                        <div className="space-y-1">
                          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Full Legal Name</label>
                          <div className="relative">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input 
                              type="text" 
                              name="fullName"
                              value={formData.fullName}
                              onChange={handleInputChange}
                              placeholder="e.g. Amao Abdulhameed"
                              className={`w-full pl-11 pr-4 py-3 bg-slate-50 border ${
                                errors.fullName ? 'border-rose-500' : 'border-slate-200'
                              } rounded-2xl text-sm focus:ring-1 focus:ring-primary outline-none focus:bg-white text-slate-800 font-semibold transition-all`}
                            />
                            {errors.fullName && <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.fullName}</p>}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Corporate Email</label>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input 
                              type="email" 
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              placeholder="you@company.com"
                              className={`w-full pl-11 pr-4 py-3 bg-slate-50 border ${
                                errors.email ? 'border-rose-500' : 'border-slate-200'
                              } rounded-2xl text-sm focus:ring-1 focus:ring-primary outline-none focus:bg-white text-slate-800 font-semibold transition-all`}
                            />
                            {errors.email && <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.email}</p>}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Phone Number</label>
                            <div className="relative">
                              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                              <input 
                                type="tel" 
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="08012345678"
                                className={`w-full pl-11 pr-4 py-3 bg-slate-50 border ${
                                  errors.phone ? 'border-rose-500' : 'border-slate-200'
                                } rounded-2xl text-sm focus:ring-1 focus:ring-primary outline-none focus:bg-white text-slate-800 font-semibold transition-all`}
                              />
                              {errors.phone && <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.phone}</p>}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Date of Birth</label>
                            <div className="relative">
                              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                              <input 
                                type="date" 
                                name="dob"
                                value={formData.dob}
                                onChange={handleInputChange}
                                className={`w-full pl-11 pr-4 py-3 bg-slate-50 border ${
                                  errors.dob ? 'border-rose-500' : 'border-slate-200'
                                } rounded-2xl text-sm focus:ring-1 focus:ring-primary outline-none focus:bg-white text-slate-800 font-semibold transition-all`}
                              />
                              {errors.dob && <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.dob}</p>}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* STEP 2: Employment / Organization Profile */}
                    {registerRole === 'member' && step === 2 && (
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-4"
                      >
                        <div className="space-y-1">
                          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Employment Corporate Department</label>
                          <div className="relative">
                            <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                            <select 
                              name="department"
                              value={formData.department}
                              onChange={handleInputChange}
                              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-1 focus:ring-primary outline-none focus:bg-white text-slate-800 font-semibold appearance-none transition-all cursor-pointer"
                            >
                              {DEPARTMENTS.map(dept => (
                                <option 
                                  key={dept} 
                                  value={dept}
                                  className="bg-white text-slate-900"
                                >
                                  {dept}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="p-5 bg-slate-50 rounded-2xl space-y-4 border border-slate-100">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-black text-slate-800 uppercase tracking-wider">Cooperative Staff ID Alignment</p>
                              <p className="text-[10px] text-slate-400 font-medium">Auto-generation provides a standard secure sequence identifier</p>
                            </div>
                            <input 
                              type="checkbox" 
                              id="isAutoGenerateId" 
                              name="isAutoGenerateId"
                              checked={formData.isAutoGenerateId}
                              onChange={handleInputChange}
                              className="w-5 h-5 accent-primary cursor-pointer"
                            />
                          </div>

                          {!formData.isAutoGenerateId && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="space-y-1 border-t border-slate-200 pt-4"
                            >
                              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Custom Assigned Staff ID</label>
                              <div className="relative">
                                <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <input 
                                  type="text" 
                                  name="staffId"
                                  value={formData.staffId}
                                  onChange={handleInputChange}
                                  placeholder="ZIM-2026-105"
                                  className={`w-full pl-11 pr-4 py-3 bg-white border ${
                                    errors.staffId ? 'border-rose-500' : 'border-slate-200'
                                  } rounded-2xl text-sm focus:ring-1 focus:ring-primary outline-none text-slate-800 font-semibold font-mono transition-all`}
                                />
                                {errors.staffId && <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.staffId}</p>}
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    )}

                    {/* STEP 3: Contributions & Security settings */}
                    {registerRole === 'member' && step === 3 && (
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-4"
                      >
                        <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Monthly Ordinary Savings (OS)</span>
                            <span className="text-sm font-black text-emerald-600">₦{formData.ordinarySavings.toLocaleString()} / month</span>
                          </div>
                          
                          {/* Quick selection sliders */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {[10000, 20000, 50000, 100000].map(amt => (
                              <button
                                key={amt}
                                type="button"
                                onClick={() => handleSavingsSlider(amt)}
                                className={`py-2 px-3 rounded-xl text-xs font-black transition-all ${
                                  formData.ordinarySavings === amt 
                                    ? 'bg-primary text-on-primary ring-2 ring-primary/20 shadow-md'
                                    : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'
                                }`}
                              >
                                ₦{(amt/1000).toFixed(0)}k
                              </button>
                            ))}
                          </div>

                          <div className="flex gap-4">
                            <div className="flex-1 space-y-1">
                              <label className="block text-[8px] font-black uppercase tracking-widest text-slate-400">Special Savings (SS)</label>
                              <input 
                                type="number" 
                                name="specialSavings"
                                value={formData.specialSavings}
                                onChange={handleInputChange}
                                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary"
                              />
                            </div>
                            <div className="flex-1 space-y-1">
                              <label className="block text-[8px] font-black uppercase tracking-widest text-slate-400">Initial Investments (IA)</label>
                              <input 
                                type="number" 
                                name="investmentAmount"
                                value={formData.investmentAmount}
                                onChange={handleInputChange}
                                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Security Password Setting */}
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Portal Security Password</label>
                            <div className="relative">
                              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                              <input 
                                type={showPassword ? "text" : "password"} 
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="••••••••"
                                className={`w-full pl-11 pr-11 py-3 bg-slate-50 border ${
                                  errors.password ? 'border-rose-500' : 'border-slate-200'
                                } rounded-2xl text-sm focus:ring-1 focus:ring-primary outline-none text-slate-800 font-semibold transition-all`}
                              />
                              <button 
                                type="button"
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 outline-none"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                              </button>
                              {errors.password && <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.password}</p>}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Confirm Portal Password</label>
                            <div className="relative">
                              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                              <input 
                                type={showPassword ? "text" : "password"} 
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                placeholder="••••••••"
                                className={`w-full pl-11 pr-11 py-3 bg-slate-50 border ${
                                  errors.confirmPassword ? 'border-rose-500' : 'border-slate-200'
                                } rounded-2xl text-sm focus:ring-1 focus:ring-primary outline-none text-slate-800 font-semibold transition-all`}
                              />
                              {errors.confirmPassword && <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.confirmPassword}</p>}
                            </div>
                          </div>
                        </div>
                        {errors.all && (
                          <div className="mt-4 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-semibold flex items-start gap-2.5">
                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                            <span>{errors.all}</span>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* STAFF / ADMIN REGISTRATION FIELDS */}
                    {registerRole === 'staff' && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-4"
                      >
                        {/* Full Name */}
                        <div className="space-y-1">
                          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Full Legal Name</label>
                          <div className="relative">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input 
                              type="text" 
                              name="fullName"
                              value={adminFormData.fullName}
                              onChange={handleAdminInputChange}
                              placeholder="e.g. Amao Abdulhameed"
                              className={`w-full pl-11 pr-4 py-3 bg-slate-50 border ${
                                adminErrors.fullName ? 'border-rose-500' : 'border-slate-200'
                              } rounded-2xl text-sm focus:ring-1 focus:ring-primary outline-none focus:bg-white text-slate-800 font-semibold transition-all`}
                            />
                            {adminErrors.fullName && <p className="text-[10px] font-bold text-rose-500 mt-1">{adminErrors.fullName}</p>}
                          </div>
                        </div>

                        {/* Corporate Email */}
                        <div className="space-y-1">
                          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Corporate Email</label>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input 
                              type="email" 
                              name="email"
                              value={adminFormData.email}
                              onChange={handleAdminInputChange}
                              placeholder="you@company.com"
                              className={`w-full pl-11 pr-4 py-3 bg-slate-50 border ${
                                adminErrors.email ? 'border-rose-500' : 'border-slate-200'
                              } rounded-2xl text-sm focus:ring-1 focus:ring-primary outline-none focus:bg-white text-slate-800 font-semibold transition-all`}
                            />
                            {adminErrors.email && <p className="text-[10px] font-bold text-rose-500 mt-1">{adminErrors.email}</p>}
                          </div>
                        </div>

                        {/* Administrative Role Dropdown */}
                        <div className="space-y-1">
                          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Designated Admin Role</label>
                          <div className="relative">
                            <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                            <select
                              name="role"
                              value={adminFormData.role}
                              onChange={handleAdminInputChange}
                              className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-1 focus:ring-primary outline-none text-slate-800 font-semibold appearance-none cursor-pointer"
                            >
                              {ADMIN_ROLES.map((r) => (
                                <option key={r} value={r} className="font-semibold">
                                  {r}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                          </div>
                        </div>

                        {/* Financial ID Assignment */}
                        <div className="p-5 bg-slate-50 rounded-3xl border border-slate-150 space-y-4">
                          <div className="flex justify-between items-center cursor-pointer">
                            <div>
                              <p className="text-xs font-black text-slate-800 uppercase tracking-wider">Auto-Generate Financial ID</p>
                              <p className="text-[10px] text-slate-400 font-medium">Standard administrative prefix is allocated automatically</p>
                            </div>
                            <input 
                              type="checkbox" 
                              id="isAutoGenerateIdAdmin" 
                              name="isAutoGenerateId"
                              checked={adminFormData.isAutoGenerateId}
                              onChange={handleAdminInputChange}
                              className="w-5 h-5 accent-primary cursor-pointer"
                            />
                          </div>

                          {!adminFormData.isAutoGenerateId && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="space-y-1 border-t border-slate-200 pt-4"
                            >
                              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Custom Assigned Financial ID</label>
                              <div className="relative">
                                <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <input 
                                  type="text" 
                                  name="financialId"
                                  value={adminFormData.financialId}
                                  onChange={handleAdminInputChange}
                                  placeholder="ADM-2026-105"
                                  className={`w-full pl-11 pr-4 py-3 bg-white border ${
                                    adminErrors.financialId ? 'border-rose-500' : 'border-slate-200'
                                  } rounded-2xl text-sm focus:ring-1 focus:ring-primary outline-none text-slate-800 font-semibold font-mono transition-all`}
                                />
                                {adminErrors.financialId && <p className="text-[10px] font-bold text-rose-500 mt-1">{adminErrors.financialId}</p>}
                              </div>
                            </motion.div>
                          )}
                        </div>

                        {/* Security Password Setting */}
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Security Password</label>
                            <div className="relative">
                              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                              <input 
                                type={showPassword ? "text" : "password"} 
                                name="password"
                                value={adminFormData.password}
                                onChange={handleAdminInputChange}
                                placeholder="••••••••"
                                className={`w-full pl-11 pr-11 py-3 bg-slate-50 border ${
                                  adminErrors.password ? 'border-rose-500' : 'border-slate-200'
                                } rounded-2xl text-sm focus:ring-1 focus:ring-primary outline-none text-slate-800 font-semibold transition-all`}
                              />
                              <button 
                                type="button"
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 outline-none"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                              </button>
                              {adminErrors.password && <p className="text-[10px] font-bold text-rose-500 mt-1">{adminErrors.password}</p>}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Confirm Security Password</label>
                            <div className="relative">
                              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                              <input 
                                type={showPassword ? "text" : "password"} 
                                name="confirmPassword"
                                value={adminFormData.confirmPassword}
                                onChange={handleAdminInputChange}
                                placeholder="••••••••"
                                className={`w-full pl-11 pr-11 py-3 bg-slate-50 border ${
                                  adminErrors.confirmPassword ? 'border-rose-500' : 'border-slate-200'
                                } rounded-2xl text-sm focus:ring-1 focus:ring-primary outline-none text-slate-800 font-semibold transition-all`}
                              />
                              {adminErrors.confirmPassword && <p className="text-[10px] font-bold text-rose-500 mt-1">{adminErrors.confirmPassword}</p>}
                            </div>
                          </div>
                        </div>

                        {adminErrors.all && (
                          <div className="mt-4 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-semibold flex items-start gap-2.5">
                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                            <span>{adminErrors.all}</span>
                          </div>
                        )}
                      </motion.div>
                    )}

                  </form>
                </div>

                {/* Form Navigation Controls */}
                <div className="mt-8 pt-6 border-t border-slate-150 flex items-center justify-between">
                  {registerRole === 'member' ? (
                    <>
                      {step > 1 ? (
                        <button
                          type="button"
                          onClick={handlePrev}
                          className="px-5 py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          Back
                        </button>
                      ) : (
                        <Link 
                          to="/"
                          className="px-5 py-3 border border-transparent text-slate-400 hover:text-slate-600 text-xs font-bold uppercase tracking-widest transition-all"
                        >
                          Cancel
                        </Link>
                      )}

                      {step < 3 ? (
                        <button
                          type="button"
                          onClick={handleNext}
                          className="px-6 py-3 bg-primary text-on-primary hover:bg-emerald-800 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-1 shadow-lg shadow-primary/20 cursor-pointer"
                        >
                          Continue
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSubmit}
                          disabled={isSubmitting}
                          className="px-6 py-3 bg-primary text-on-primary hover:bg-emerald-800 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer font-black"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Processing Record...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 text-emerald-300" />
                              Complete Registration
                            </>
                          )}
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <Link 
                        to="/"
                        className="px-5 py-3 border border-transparent text-slate-400 hover:text-slate-600 text-xs font-bold uppercase tracking-widest transition-all"
                      >
                        Cancel
                      </Link>
                      <button
                        type="button"
                        onClick={handleAdminSubmit}
                        disabled={isSubmitting}
                        className="px-6 py-3 bg-primary text-on-primary hover:bg-emerald-800 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer font-black"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Provisioning Account...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 text-emerald-300" />
                            Register Staff Profile
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>

                {/* Secure Badge */}
                <div className="mt-6 flex justify-center items-center gap-1.5 text-[9px] text-slate-400 font-extrabold uppercase tracking-widest">
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Secure SSL End-to-End Handshake Compliant</span>
                </div>

              </div>

            </motion.div>
          ) : (
            /* SUCCESS CONFIRMATION FRAME */
            <motion.div 
              key="success-card"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 max-w-xl mx-auto p-8 md:p-12 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-inner animate-pulse">
                <CheckCircle2 className="w-12 h-12" />
              </div>

              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                {registerRole === 'member' ? 'Enrollment Complete' : 'Staff Onboarding Complete'}
              </span>
              <h1 className="text-3xl font-black text-slate-800 font-headline mt-1.5 mb-3">
                {registerRole === 'member' ? 'Welcome to the Family!' : 'Account Activated!'}
              </h1>
              
              <p className="text-sm text-slate-500 leading-relaxed font-semibold max-w-md mx-auto mb-8">
                {registerRole === 'member' 
                  ? 'Your applicant profile has been successfully reconciled into central society databases. Here is your temporary credential card setup for instant access:'
                  : 'Your administrative officer profile is fully registered. You can now access your specific departmental gateway using your Financial ID and security password.'}
              </p>

              {/* Dynamic Credential Board */}
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-150 space-y-4 mb-8 text-left max-w-md mx-auto overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full pointer-events-none" />
                
                <div>
                  <span className="text-[9px] text-slate-400 font-black uppercase font-mono tracking-widest block">
                    {registerRole === 'member' ? 'Allocated Member ID' : 'Assigned Financial ID'}
                  </span>
                  <div className="flex items-center justify-between group mt-1">
                    <span id="allocated-coop-id" className="text-xl font-black text-emerald-800 font-mono tracking-wider">{generatedId}</span>
                    <button 
                      onClick={copyToClipboard}
                      className="p-1 px-2.5 bg-white border border-slate-200 text-slate-500 hover:text-primary rounded-lg text-[10px] font-black uppercase tracking-wider transition shadow-sm active:scale-95 flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                  <div>
                    <span className="text-[8px] text-slate-400 font-black uppercase font-mono tracking-widest block">
                      {registerRole === 'member' ? 'Primary Member' : 'Officer Name'}
                    </span>
                    <span className="text-xs font-bold text-slate-700 truncate block">
                      {registerRole === 'member' ? formData.fullName : adminFormData.fullName}
                    </span>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-400 font-black uppercase font-mono tracking-widest block">
                      {registerRole === 'member' ? 'Starting Contribution' : 'Designated Role'}
                    </span>
                    <span className="text-xs font-bold text-slate-700 block">
                      {registerRole === 'member' ? `₦${formData.ordinarySavings.toLocaleString()} / month` : adminFormData.role}
                    </span>
                  </div>
                </div>
              </div>

              {/* PDF Slip Action mock */}
              <button 
                onClick={() => window.print()}
                className="w-full max-w-md mx-auto py-3.5 mb-3 bg-slate-900 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Download Slip Receipt
              </button>

              <button 
                onClick={handleProceedToLogin}
                className="w-full max-w-md mx-auto py-3.5 bg-primary text-on-primary rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-800 transition shadow-lg shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                {registerRole === 'member' ? 'Secure Member Sign In' : 'Secure Administrator Sign In'}
                <ArrowRight className="w-4 h-4 animate-bounce" />
              </button>

              <p className="text-[10px] text-slate-405 text-slate-400 font-semibold mt-6">
                Need manual assistance? Contact IT Security desk at <span className="text-primary hover:underline">support@zimco.org</span>
              </p>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
