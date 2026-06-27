import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  UserCheck, 
  FileText, 
  Camera, 
  MapPin, 
  ArrowRight, 
  ArrowLeft, 
  Upload, 
  X, 
  Check, 
  Clock, 
  AlertCircle, 
  RefreshCw,
  QrCode,
  Lock,
  Eye,
  BadgeAlert,
  HelpCircle,
  Sparkles,
  Award,
  CheckCircle2
} from 'lucide-react';

interface KYCData {
  idType: string;
  idNumber: string;
  idFileName: string;
  idFileUrl: string | null;
  selfieFileName: string;
  selfieFileUrl: string | null;
  addressLine: string;
  city: string;
  state: string;
  postalCode: string;
  proofType: string;
  proofFileName: string;
  proofFileUrl: string | null;
}

const initialKYCData: KYCData = {
  idType: 'national_id',
  idNumber: '',
  idFileName: '',
  idFileUrl: null,
  selfieFileName: '',
  selfieFileUrl: null,
  addressLine: '',
  city: '',
  state: '',
  postalCode: '',
  proofType: 'utility',
  proofFileName: '',
  proofFileUrl: null
};

export default function KYCOnboarding() {
  // Main states
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [kycData, setKycData] = useState<KYCData>(initialKYCData);
  const [status, setStatus] = useState<'draft' | 'submitted' | 'failed' | 'verified'>('draft');
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);
  const [approvedAt, setApprovedAt] = useState<string | null>(null);
  const [reviewerNotes, setReviewerNotes] = useState<string>('');
  
  // Drag and drop states
  const [isDraggingID, setIsDraggingID] = useState(false);
  const [isDraggingSelfie, setIsDraggingSelfie] = useState(false);
  const [isDraggingProof, setIsDraggingProof] = useState(false);

  // Simulated live camera state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCameraScanning, setIsCameraScanning] = useState(false);

  // Load from localStorage for persistence
  useEffect(() => {
    const savedKyc = localStorage.getItem('zimco_kyc_data');
    const savedStatus = localStorage.getItem('zimco_kyc_status');
    const savedSubmission = localStorage.getItem('zimco_kyc_submitted_at');
    const savedApproval = localStorage.getItem('zimco_kyc_approved_at');
    const savedNotes = localStorage.getItem('zimco_kyc_reviewer_notes');

    if (savedKyc) setKycData(JSON.parse(savedKyc));
    if (savedStatus) setStatus(savedStatus as any);
    if (savedSubmission) setSubmittedAt(savedSubmission);
    if (savedApproval) setApprovedAt(savedApproval);
    if (savedNotes) setReviewerNotes(savedNotes);
  }, []);

  const saveToStorage = (updatedData: KYCData, updatedStatus: string, subDate: string | null, appDate: string | null, notes: string) => {
    localStorage.setItem('zimco_kyc_data', JSON.stringify(updatedData));
    localStorage.setItem('zimco_kyc_status', updatedStatus);
    if (subDate) localStorage.setItem('zimco_kyc_submitted_at', subDate);
    else localStorage.removeItem('zimco_kyc_submitted_at');
    
    if (appDate) localStorage.setItem('zimco_kyc_approved_at', appDate);
    else localStorage.removeItem('zimco_kyc_approved_at');

    localStorage.setItem('zimco_kyc_reviewer_notes', notes);
  };

  // Simulated file uploads
  const handleFileUpload = (field: 'idFile' | 'selfieFile' | 'proofFile', fileName: string) => {
    const mockUrls = {
      idFile: 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=400&auto=format&fit=crop&q=60',
      selfieFile: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=60',
      proofFile: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400&auto=format&fit=crop&q=60'
    };

    setKycData(prev => {
      const next = { ...prev };
      if (field === 'idFile') {
        next.idFileName = fileName;
        next.idFileUrl = mockUrls.idFile;
      } else if (field === 'selfieFile') {
        next.selfieFileName = fileName;
        next.selfieFileUrl = mockUrls.selfieFile;
      } else if (field === 'proofFile') {
        next.proofFileName = fileName;
        next.proofFileUrl = mockUrls.proofFile;
      }
      return next;
    });
  };

  const handleDragOver = (e: React.DragEvent, setDragState: (drag: boolean) => void) => {
    e.preventDefault();
    setDragState(true);
  };

  const handleDragLeave = (setDragState: (drag: boolean) => void) => {
    setDragState(false);
  };

  const handleDrop = (e: React.DragEvent, setDragState: (drag: boolean) => void, field: 'idFile' | 'selfieFile' | 'proofFile') => {
    e.preventDefault();
    setDragState(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFileUpload(field, file.name);
    }
  };

  // Simulated Camera trigger for Selfie matching
  const triggerSimulateCamera = () => {
    setIsCameraActive(true);
    setIsCameraScanning(true);
    setTimeout(() => {
      setIsCameraScanning(false);
      setIsCameraActive(false);
      handleFileUpload('selfieFile', 'LIVE_BIOMETRIC_MATRIX_CAPTURED.png');
    }, 2800);
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmitKYC = () => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    setStatus('submitted');
    setSubmittedAt(formattedDate);
    setApprovedAt(null);
    setReviewerNotes('A security analyst will audit your passport and biometric hashes in adherence to NDPR metadata restrictions.');
    
    saveToStorage(
      kycData, 
      'submitted', 
      formattedDate, 
      null, 
      'A security analyst will audit your passport and biometric hashes in adherence to NDPR metadata restrictions.'
    );
  };

  // Simulation Controls for sandbox usability
  const triggerSimulationStatus = (newStage: 'draft' | 'submitted' | 'failed' | 'verified', notes?: string) => {
    const nowStr = new Date().toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    setStatus(newStage);
    setReviewerNotes(notes || '');

    if (newStage === 'draft') {
      setSubmittedAt(null);
      setApprovedAt(null);
      setKycData(initialKYCData);
      setCurrentStep(1);
      saveToStorage(initialKYCData, 'draft', null, null, '');
    } else if (newStage === 'submitted') {
      setSubmittedAt(nowStr);
      setApprovedAt(null);
      saveToStorage(kycData, 'submitted', nowStr, null, notes || 'Reviewer is auditing documents...');
    } else if (newStage === 'failed') {
      setApprovedAt(null);
      saveToStorage(kycData, 'failed', submittedAt, null, notes || 'ID resolution too low. Re-upload scan.');
    } else if (newStage === 'verified') {
      setApprovedAt(nowStr);
      saveToStorage(kycData, 'verified', submittedAt || nowStr, nowStr, notes || 'All biological structures match official state databases.');
    }
  };

  // Progress Stepper Indicators
  const steps = [
    { title: 'National Identity', desc: 'Secure document scan' },
    { title: 'Facial Biometrics', desc: 'High-definition live scan' },
    { title: 'Residency Verification', desc: 'Utility bill ledger matching' },
    { title: 'Review & Attest', desc: 'Sovereign signature audit' }
  ];

  return (
    <div className="space-y-10">
      
      {/* Simulation Playground Controls Banner (To make review of interactive states delightful) */}
      <div className="bg-slate-900 text-white rounded-[2rem] p-6 border border-emerald-500/20 flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
            <span className="text-[10px] text-emerald-400 font-bold font-mono uppercase tracking-wider">Sandbox Controls</span>
          </div>
          <h4 className="font-headline font-bold text-sm">Interactive State Simulator</h4>
          <p className="text-[11px] text-slate-400">Force specific validation outcomes instantly to test visual dashboard behavior.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => triggerSimulationStatus('draft')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all"
          >
            Reset Form
          </button>
          
          <button 
            onClick={() => triggerSimulationStatus('failed', 'Selfie match score below 85% threshold. Please align your camera to direct lighting sources.')}
            className="px-3.5 py-2 bg-rose-950/40 text-rose-300 border border-rose-800 hover:bg-rose-900/30 rounded-xl text-xs font-bold transition-all"
          >
            Simulate Reject
          </button>

          <button 
            onClick={() => triggerSimulationStatus('verified', 'Biometric validation completed. John Doe biometric match 99.8% confirmed via National Identity Registry.')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-md transition-all"
          >
            Simulate Approval
          </button>
        </div>
      </div>

      {/* Main Container Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Verification Status Stepper Widget (Left 4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-8 sticky top-28">
            <div>
              <h3 className="font-headline font-black text-slate-900 text-lg">Compliance Status</h3>
              <p className="text-xs text-slate-400 mt-0.5">Real-time surveillance ledger checks</p>
            </div>

            {/* Stepper Steps UI */}
            <div className="space-y-8 relative pl-4 border-l-2 border-slate-100 ml-3">
              
              {/* Draft Phase */}
              <div className="relative">
                <div className={`absolute -left-[27px] top-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  status === 'draft' ? 'bg-emerald-900 text-white ring-4 ring-emerald-100' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  <Check size={10} />
                </div>
                <div className="space-y-0.5 ml-4">
                  <p className="text-xs font-bold text-slate-900">Form Draft Prepared</p>
                  <p className="text-[10px] text-slate-400 font-mono">Completed on draft entry</p>
                </div>
              </div>

              {/* Submitted Phase */}
              <div className="relative">
                <div className={`absolute -left-[27px] top-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  status === 'submitted' ? 'bg-amber-500 text-white ring-4 ring-amber-100' :
                  status === 'verified' || status === 'failed' ? 'bg-emerald-100 text-emerald-800' :
                  'bg-slate-100 text-slate-400'
                }`}>
                  {status === 'verified' || status === 'failed' ? <Check size={10} /> : <Clock size={10} />}
                </div>
                <div className="space-y-0.5 ml-4">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-slate-800">Review Submitted</p>
                    {status === 'submitted' && (
                      <span className="px-1.5 py-0.5 bg-amber-50 text-amber-900 border border-amber-500/10 text-[8px] font-mono font-bold rounded">
                        PENDING AUDIT
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {submittedAt ? `Lodged: ${submittedAt}` : 'Awaiting document files'}
                  </p>
                </div>
              </div>

              {/* Security Review State */}
              <div className="relative">
                <div className={`absolute -left-[27px] top-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  status === 'submitted' ? 'bg-emerald-950 text-white ring-4 ring-slate-100 animate-pulse' :
                  status === 'verified' ? 'bg-emerald-100 text-emerald-800' :
                  status === 'failed' ? 'bg-rose-100 text-rose-800' :
                  'bg-slate-100 text-slate-400'
                }`}>
                  {status === 'verified' ? <Check size={10} /> : 
                   status === 'failed' ? <X size={10} /> : 
                   <ShieldCheck size={10} />}
                </div>
                <div className="space-y-0.5 ml-4">
                  <p className="text-xs font-bold text-slate-850 text-slate-800">Technical Audit Pass</p>
                  <p className="text-[10px] text-slate-450 text-slate-400 font-mono">Forensic matching threshold check</p>
                </div>
              </div>

              {/* Verified Phase */}
              <div className="relative">
                <div className={`absolute -left-[27px] top-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  status === 'verified' ? 'bg-emerald-600 text-white ring-4 ring-emerald-100' :
                  status === 'failed' ? 'bg-rose-600 text-white ring-4 ring-rose-100' :
                  'bg-slate-100 text-slate-400'
                }`}>
                  {status === 'verified' ? <Award size={10} /> : status === 'failed' ? <X size={10} /> : <UserCheck size={10} />}
                </div>
                <div className="space-y-0.5 ml-4">
                  <div className="flex items-center gap-2">
                    <p className={`text-xs font-extrabold ${status === 'verified' ? 'text-emerald-700' : status === 'failed' ? 'text-rose-700' : 'text-slate-500'}`}>
                      {status === 'verified' ? 'Cooperative Verified' : status === 'failed' ? 'KYC Appeal Active' : 'Verified Membership'}
                    </p>
                    {status === 'verified' && (
                      <Sparkles size={12} className="text-emerald-600 animate-bounce" />
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {approvedAt ? `Completed: ${approvedAt}` : 'Subsequent audit check'}
                  </p>
                </div>
              </div>

            </div>

            {/* Forensic logs container */}
            {reviewerNotes && (
              <div className={`p-4 rounded-2xl border text-xs leading-relaxed font-mono ${
                status === 'verified' ? 'bg-emerald-50/50 border-emerald-500/10 text-emerald-805 text-emerald-800' :
                status === 'failed' ? 'bg-rose-50/50 border-rose-500/10 text-rose-900' :
                'bg-slate-50 border-slate-200/50 text-slate-600'
              }`}>
                <span className="font-extrabold block uppercase text-[9px] tracking-wider mb-1.5 flex items-center gap-1">
                  <AlertCircle size={12} />
                  <span>Auditor Audit Trail Logs</span>
                </span>
                <p className="text-[10px] font-medium leading-normal">{reviewerNotes}</p>
              </div>
            )}

            {/* Core Privacy Compliance Text */}
            <div className="pt-4 border-t border-slate-100 flex items-center gap-3 text-[10px] text-slate-400 font-mono leading-normal">
              <Lock size={16} className="text-emerald-700 shrink-0" />
              <span>Sovereign security matrices aligned to NITDA compliance bounds. Verified data remains fully anonymized.</span>
            </div>

          </div>
        </div>

        {/* Structured KYC step pages (Right 8 cols) */}
        <div className="lg:col-span-8">
          
          <AnimatePresence mode="wait">
            
            {/* If member is already submitted and audit is in progress */}
            {status === 'submitted' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-white rounded-[2.5rem] p-10 md:p-14 border border-slate-100 shadow-sm text-center space-y-8 flex flex-col items-center justify-center min-h-[500px]"
              >
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 animate-pulse border border-amber-200">
                    <Clock size={36} />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md">
                    <ShieldCheck size={16} className="text-emerald-600" />
                  </div>
                </div>

                <div className="space-y-3 max-w-lg">
                  <h3 className="font-headline font-black text-2xl text-slate-900">Your Co-op Audit is Under Review</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">
                    We received your official passport credentials and biometric frames. Our compliance analysts verify files manually against public database registries. This takes around 30 minutes.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 max-w-sm w-full pt-4 font-mono text-[10px] text-slate-400 border-t border-slate-100">
                  <div className="text-left bg-slate-50 p-3.5 rounded-2xl border border-slate-150">
                    <span className="block font-bold">DISPATCH REFERENCE</span>
                    <span className="text-slate-800 font-black tracking-wider block mt-1">ZMC-KYC-{Math.floor(100000 + Math.random()*900000)}</span>
                  </div>
                  <div className="text-left bg-slate-50 p-3.5 rounded-2xl border border-slate-150">
                    <span className="block font-bold">FORENSIC REGISTRY</span>
                    <span className="text-emerald-800 font-black block mt-1">NIN-SECURE-API</span>
                  </div>
                </div>

                <button
                  onClick={() => triggerSimulationStatus('draft')}
                  className="px-6 py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw size={12} />
                  <span>Edit or Recalibrate Files</span>
                </button>
              </motion.div>
            )}

            {/* If member validation is successfully approved */}
            {status === 'verified' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-white rounded-[2.5rem] p-10 md:p-14 border border-slate-100 shadow-sm text-center space-y-8 flex flex-col items-center justify-center min-h-[500px]"
              >
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-200 shadow-inner">
                    <CheckCircle2 className="w-12 h-12 text-emerald-600 animate-bounce" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-900 rounded-full flex items-center justify-center text-white shadow">
                    <Award size={16} />
                  </div>
                </div>

                <div className="space-y-3 max-w-lg">
                  <div className="inline-flex gap-1 bg-emerald-50 text-emerald-800 border border-emerald-500/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    <span>Active NDPR Compliance Seal</span>
                  </div>
                  <h3 className="font-headline font-black text-2xl text-slate-900">John Doe, You are Fully Verified!</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">
                    Your sovereign credentials and physical landmark reviews have been approved. All limits concerning interest-free loans and zero-fee cooperative distributions have been expanded.
                  </p>
                </div>

                <div className="text-left bg-emerald-950 text-white rounded-3xl p-6 max-w-md w-full relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
                  <div className="flex justify-between items-start">
                    <div className="space-y-3 font-mono">
                      <div>
                        <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">Verified Account Tier</p>
                        <p className="text-sm font-black text-white">LEVEL III PREMIUM MEMBER</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[8px] text-emerald-400">CREDIT LIMIT</p>
                          <p className="text-xs font-bold">₦10,000,000</p>
                        </div>
                        <div>
                          <p className="text-[8px] text-emerald-400">SURPLUS PAYOUT</p>
                          <p className="text-xs font-bold">UNRESTRICTED</p>
                        </div>
                      </div>
                    </div>
                    <QrCode size={48} className="text-emerald-400 shrink-0" />
                  </div>
                </div>
              </motion.div>
            )}

            {/* If member validation is failed / rejected */}
            {status === 'failed' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-white rounded-[2.5rem] p-10 md:p-14 border border-slate-100 shadow-sm text-center space-y-8 flex flex-col items-center justify-center min-h-[500px]"
              >
                <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-200 shadow-inner">
                  <BadgeAlert className="w-12 h-12 text-rose-600" />
                </div>

                <div className="space-y-3 max-w-lg">
                  <h3 className="font-headline font-black text-2xl text-slate-900">ID Verification Flagged</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">
                    Our compliance registry flag detected biometric discrepancies. This typically happens if document pictures have glare or low brightness, or address documents are older than 3 months.
                  </p>
                </div>

                <button
                  onClick={() => triggerSimulationStatus('draft')}
                  className="px-6 py-3.5 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <RefreshCw size={14} />
                  <span>Acknowledge & Resubmit Documents</span>
                </button>
              </motion.div>
            )}

            {/* Main Multi-step Form Wizard (Draft Mode) */}
            {status === 'draft' && (
              <motion.div
                key="kyc-wizard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-sm space-y-10"
              >
                {/* Steps Horizontal Navigation Indicators */}
                <div className="flex justify-between items-center gap-4 pb-6 border-b border-slate-100 overflow-x-auto">
                  {steps.map((sec, i) => {
                    const stepNum = i + 1;
                    return (
                      <div key={i} className="flex items-center gap-3 shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-black border transition-all ${
                          currentStep === stepNum ? 'bg-emerald-900 text-white border-transparent' :
                          currentStep > stepNum ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                          'bg-slate-50 text-slate-400 border-slate-200/60'
                        }`}>
                          {currentStep > stepNum ? <Check size={14} /> : stepNum}
                        </div>
                        <div className="hidden sm:block text-left">
                          <p className={`text-xs font-extrabold ${currentStep === stepNum ? 'text-slate-905 font-black text-slate-900' : 'text-slate-400'}`}>
                            {sec.title}
                          </p>
                          <p className="text-[9px] text-slate-400 font-medium leading-none mt-0.5">{sec.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* STEP PANELS content */}
                <div className="min-h-[320px]">
                  
                  {/* Step 1: identity doc upload */}
                  {currentStep === 1 && (
                    <motion.div 
                      initial={{ opacity: 0, x: 10 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      className="space-y-6"
                    >
                      <div className="space-y-2">
                        <h4 className="font-headline font-bold text-slate-950 text-lg">National Identification Verification</h4>
                        <p className="text-slate-500 text-xs font-medium">Please provide a valid, government-issued document card containing biometric hashes.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Selector type */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 ml-1">Document Category</label>
                          <select
                            value={kycData.idType}
                            onChange={(e) => setKycData(prev => ({ ...prev, idType: e.target.value }))}
                            className="w-full bg-slate-50 border border-slate-150 rounded-2xl py-4 px-6 outline-none font-bold text-sm text-slate-800 cursor-pointer focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500"
                          >
                            <option value="national_id">National Identification Number Card (NIN)</option>
                            <option value="passport">International Sovereign Passport</option>
                            <option value="drivers_license">Federal Drivers License Card</option>
                            <option value="voters_card">INEC Permanent Voters Card</option>
                          </select>
                        </div>

                        {/* ID input number */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 ml-1">Document Reference Number</label>
                          <input 
                            type="text"
                            placeholder="e.g. 11-digit NIN or Passport Reference"
                            value={kycData.idNumber}
                            onChange={(e) => setKycData(prev => ({ ...prev, idNumber: e.target.value }))}
                            className="w-full bg-slate-50 border border-slate-150 rounded-2xl py-4 px-6 text-sm font-bold text-slate-850 outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      {/* Drag & Drop File scan */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 ml-1">Electronic Document Front Scan</label>
                        <div 
                          onDragOver={(e) => handleDragOver(e, setIsDraggingID)}
                          onDragLeave={() => handleDragLeave(setIsDraggingID)}
                          onDrop={(e) => handleDrop(e, setIsDraggingID, 'idFile')}
                          className={`border-2 border-dashed rounded-[2rem] p-8 text-center transition-all ${
                            isDraggingID ? 'border-emerald-600 bg-emerald-50/10' :
                            kycData.idFileName ? 'border-emerald-600 bg-slate-50' :
                            'border-slate-200 hover:border-slate-400 bg-slate-50/50'
                          }`}
                        >
                          <input 
                            type="file" 
                            id="idUploadInput"
                            accept="image/*,.pdf"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleFileUpload('idFile', e.target.files[0].name);
                              }
                            }}
                            className="hidden" 
                          />
                          
                          {kycData.idFileName ? (
                            <div className="space-y-3 flex flex-col items-center justify-center">
                              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                                <Check size={20} />
                              </div>
                              <div>
                                <p className="text-xs font-black text-slate-800">{kycData.idFileName}</p>
                                <p className="text-[10px] text-slate-400 font-semibold font-mono">Simulated cryptographic receipt logged</p>
                              </div>
                              <button 
                                onClick={() => setKycData(prev => ({ ...prev, idFileName: '', idFileUrl: null }))}
                                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-bold"
                              >
                                Remove File
                              </button>
                            </div>
                          ) : (
                            <label htmlFor="idUploadInput" className="space-y-4 flex flex-col items-center justify-center cursor-pointer min-h-[44px]">
                              <div className="p-3 bg-white border border-slate-200/90 rounded-2xl text-slate-400 shadow-sm">
                                <Upload size={24} />
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs font-bold text-slate-800">
                                  Drag and drop document scanning or <span className="text-emerald-800 hover:underline">browse files</span>
                                </p>
                                <p className="text-[10px] text-slate-400 font-semibold">Supports JPEG, PNG, or PDF formats up to 10MB limit</p>
                              </div>
                            </label>
                          )}
                        </div>
                      </div>

                    </motion.div>
                  )}

                  {/* Step 2: Facial Biometric Selfie scan */}
                  {currentStep === 2 && (
                    <motion.div 
                      initial={{ opacity: 0, x: 10 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      className="space-y-6"
                    >
                      <div className="space-y-2">
                        <h4 className="font-headline font-bold text-slate-950 text-lg">Biometric Liveness Selfie Scan</h4>
                        <p className="text-slate-500 text-xs font-medium">To mitigate document spoofing or member profile duplicates, provide a real-time face landmark match.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        
                        {/* Biometric Scan Window Frame */}
                        <div className="relative border-2 border-slate-150 bg-slate-950 rounded-3xl h-64 overflow-hidden flex flex-col items-center justify-center text-center p-6 text-white">
                          
                          {/* Face guidance grid outline */}
                          <div className="absolute inset-x-12 inset-y-8 border border-white/20 rounded-full flex items-center justify-center pointer-events-none">
                            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></div>
                          </div>

                          {isCameraScanning ? (
                            <div className="space-y-3 relative z-10 flex flex-col items-center justify-center h-full w-full">
                              {/* Horizontal scanning light element */}
                              <div className="absolute top-0 inset-x-0 h-1 bg-emerald-400 shadow-[0_0_15px_#10b981] animate-[bounce_2s_infinite]"></div>
                              <RefreshCw size={28} className="text-emerald-400 animate-spin" />
                              <p className="text-xs font-mono font-bold tracking-widest text-emerald-400">ANALYZING BIOMETRIC CONTOURS...</p>
                            </div>
                          ) : kycData.selfieFileName ? (
                            <div className="space-y-3 relative z-10 flex flex-col items-center justify-center">
                              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                                <Check size={20} />
                              </div>
                              <div>
                                <p className="text-xs font-bold font-mono">FACE_LIVENESS_PASS.MTRX</p>
                                <p className="text-[9px] text-slate-400 font-mono">Hashed Biometrics: 0x9B1B...F782</p>
                              </div>
                              <button 
                                onClick={() => setKycData(prev => ({ ...prev, selfieFileName: '', selfieFileUrl: null }))}
                                className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[9px] font-mono mt-1"
                              >
                                Clear Hash
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-3 relative z-10">
                              <Camera size={32} className="text-slate-400 mx-auto" strokeWidth={1.5} />
                              <p className="text-xs font-bold text-slate-300">Biometric Camera Stream</p>
                              <p className="text-[10px] text-slate-500 max-w-xs leading-normal">Requires physical permission check. No media is stored on unencrypted external cloud networks.</p>
                            </div>
                          )}

                        </div>

                        {/* Camera Action triggers */}
                        <div className="space-y-5">
                          <p className="text-xs font-medium leading-relaxed text-slate-550 text-slate-600">
                            Align your face in high illumination environments. Avoid caps, eyeglasses, or high-contrast shadows. Press the simulator trigger below to run the face scanning sweep.
                          </p>

                          <div className="space-y-4">
                            <button
                              onClick={triggerSimulateCamera}
                              disabled={isCameraScanning || !!kycData.selfieFileName}
                              className="w-full py-4 bg-emerald-900 text-white hover:bg-emerald-800 disabled:bg-slate-100 disabled:text-slate-400 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <Camera size={16} />
                              <span>Authorize Live Biometric Scan</span>
                            </button>

                            <div className="text-center">
                              <span className="text-[10px] text-slate-400 font-mono">OR DIRECT MANUAL FILE SUBMIT</span>
                            </div>

                            <input
                              type="file"
                              id="selfieUploadInput"
                              accept="image/*"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  handleFileUpload('selfieFile', e.target.files[0].name);
                                }
                              }}
                              className="hidden"
                            />
                            
                            <label 
                              htmlFor="selfieUploadInput"
                              className="w-full py-3.5 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl text-xs font-bold text-center transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
                            >
                              <Upload size={14} />
                              <span>Manual Passport File Upload</span>
                            </label>
                          </div>
                        </div>

                      </div>

                    </motion.div>
                  )}

                  {/* Step 3: Address proof */}
                  {currentStep === 3 && (
                    <motion.div 
                      initial={{ opacity: 0, x: 10 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      className="space-y-6"
                    >
                      <div className="space-y-2">
                        <h4 className="font-headline font-bold text-slate-950 text-lg">Residency & Proof of Address Verification</h4>
                        <p className="text-slate-500 text-xs font-medium">Under Nigerian anti-laundering guidelines, we must confirm physical geographic residency traces.</p>
                      </div>

                      <div className="space-y-4 bg-slate-50 p-6 rounded-3xl border border-slate-150">
                        <h5 className="font-headline font-bold text-xs text-slate-800 uppercase tracking-widest">Sovereign Physical Coordinates</h5>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <input 
                            type="text"
                            placeholder="Street Address Line"
                            value={kycData.addressLine}
                            onChange={(e) => setKycData(prev => ({ ...prev, addressLine: e.target.value }))}
                            className="w-full bg-white border border-slate-150 rounded-xl py-3 px-4 text-xs font-bold text-slate-800 outline-none"
                          />
                          <input 
                            type="text"
                            placeholder="City"
                            value={kycData.city}
                            onChange={(e) => setKycData(prev => ({ ...prev, city: e.target.value }))}
                            className="w-full bg-white border border-slate-150 rounded-xl py-3 px-4 text-xs font-bold text-slate-800 outline-none"
                          />
                          <input 
                            type="text"
                            placeholder="State Region"
                            value={kycData.state}
                            onChange={(e) => setKycData(prev => ({ ...prev, state: e.target.value }))}
                            className="w-full bg-white border border-slate-150 rounded-xl py-3 px-4 text-xs font-bold text-slate-800 outline-none"
                          />
                          <input 
                            type="text"
                            placeholder="Postal / ZIP Code"
                            value={kycData.postalCode}
                            onChange={(e) => setKycData(prev => ({ ...prev, postalCode: e.target.value }))}
                            className="w-full bg-white border border-slate-150 rounded-xl py-3 px-4 text-xs font-bold text-slate-800 outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Doc proof selector */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 ml-1">Proof Category</label>
                          <select
                            value={kycData.proofType}
                            onChange={(e) => setKycData(prev => ({ ...prev, proofType: e.target.value }))}
                            className="w-full bg-slate-50 border border-slate-150 rounded-2xl py-4 px-6 outline-none font-bold text-sm text-slate-800 cursor-pointer"
                          >
                            <option value="utility">Electricity / Water / Waste Utility Bill</option>
                            <option value="bank_statement">Certified Bank Statement Document</option>
                            <option value="tax_clearance">Municipal Tax Clearance Ledger</option>
                            <option value="lease_agreement">Verified Tenancy Lease Agreement</option>
                          </select>
                        </div>

                        {/* Drag Proof Upload */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 ml-1">Proof Document Attachment File</label>
                          <div
                            onDragOver={(e) => handleDragOver(e, setIsDraggingProof)}
                            onDragLeave={() => handleDragLeave(setIsDraggingProof)}
                            onDrop={(e) => handleDrop(e, setIsDraggingProof, 'proofFile')}
                            className={`border border-dashed rounded-2xl p-4 text-center transition-all ${
                              isDraggingProof ? 'border-emerald-600 bg-emerald-50/10 animate-pulse' :
                              kycData.proofFileName ? 'border-emerald-600 bg-emerald-50/5' :
                              'border-slate-200 hover:border-slate-400 bg-slate-50/30'
                            }`}
                          >
                            <input 
                              type="file" 
                              id="proofUploadInput"
                              accept="image/*,.pdf"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  handleFileUpload('proofFile', e.target.files[0].name);
                                }
                              }}
                              className="hidden" 
                            />
                            
                            {kycData.proofFileName ? (
                              <div className="flex justify-between items-center text-xs font-mono font-bold">
                                <span className="text-emerald-805 text-emerald-800 line-clamp-1 truncate block max-w-[180px]">{kycData.proofFileName}</span>
                                <button 
                                  onClick={() => setKycData(prev => ({ ...prev, proofFileName: '', proofFileUrl: null }))}
                                  className="p-1 rounded bg-slate-100 text-slate-500 hover:text-rose-600"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            ) : (
                              <label htmlFor="proofUploadInput" className="cursor-pointer text-xs font-bold text-slate-500 hover:text-emerald-850 flex items-center justify-center gap-1.5 min-h-[44px]">
                                <Upload size={14} />
                                <span>Add Proof of Address Scan</span>
                              </label>
                            )}
                          </div>
                        </div>

                      </div>

                    </motion.div>
                  )}

                  {/* Step 4: Review and attest */}
                  {currentStep === 4 && (
                    <motion.div 
                      initial={{ opacity: 0, x: 10 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      className="space-y-6 text-slate-600 font-body text-xs leading-relaxed"
                    >
                      <div className="space-y-2">
                        <h4 className="font-headline font-bold text-slate-950 text-lg">Sovereign Signature & Security Attestation</h4>
                        <p className="text-slate-500 text-xs font-medium">Commit credentials under full legal responsibility and regulatory compliance guidelines.</p>
                      </div>

                      {/* Display Data Summary */}
                      <div className="bg-slate-50 rounded-3xl p-6 border border-slate-150 grid grid-cols-1 sm:grid-cols-3 gap-6 font-mono text-[10px]">
                        <div>
                          <p className="font-bold text-slate-400">IDENTITY DOCUMENT</p>
                          <p className="text-slate-800 font-bold mt-1 uppercase text-xs">
                            {kycData.idType.replace('_', ' ')}
                          </p>
                          <p className="text-slate-550 text-slate-500 leading-normal truncate">{kycData.idNumber || 'No ID Ref Entered'}</p>
                          {kycData.idFileName && <span className="text-emerald-705 text-emerald-700 block mt-1">✔ scan attachment load</span>}
                        </div>
                        <div>
                          <p className="font-bold text-slate-400">BIOMETRICS CHECK</p>
                          <p className="text-slate-800 font-bold mt-1 text-xs">SELFIE FRAME MATRIX</p>
                          {kycData.selfieFileName ? (
                            <span className="text-emerald-705 text-emerald-700 block mt-1 font-extrabold">✔ CAMERA CAPTURED SECURE</span>
                          ) : (
                            <span className="text-rose-650 text-rose-650/80 block mt-1 font-extrabold uppercase">🚫 Face Capture Missing</span>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-400">PHYSICAL ADDRESS TRACE</p>
                          <p className="text-slate-800 font-bold mt-1 text-xs truncate max-w-[150px]">
                            {kycData.addressLine || 'Blank Address'}
                          </p>
                          <p className="text-slate-550 text-slate-500 leading-normal">{kycData.city}, {kycData.state}</p>
                          {kycData.proofFileName && <span className="text-emerald-705 text-emerald-700 block mt-1">✔ residency proof file load</span>}
                        </div>
                      </div>

                      <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-500/10 space-y-3">
                        <p className="font-extrabold text-amber-950 text-xs">Strict Zero-Interest Cooperative Declaration</p>
                        <p className="text-[10px] text-slate-650 text-slate-600">
                          By clicking "Audit My Sovereign Credentials" below, you attest that the passport details and biometric landmarks provided represent your distinct personal identity. Any attempt to upload fraudulent documentation, forged utility bills, or third-party bank statements is flagged by our state cooperative forensic network and reported directly code compliance desks.
                        </p>
                      </div>

                      <div className="flex items-start gap-3 mt-4">
                        <input 
                          type="checkbox"
                          id="auditConfirm"
                          className="h-4.5 w-4.5 rounded border-slate-300 text-emerald-800 focus:ring-emerald-500 accent-emerald-800 mt-0.5 cursor-pointer"
                        />
                        <label htmlFor="auditConfirm" className="text-[10px] text-slate-500 font-semibold cursor-pointer select-none leading-normal">
                          I explicitly authorize ZIMCO compliance audit teams to cross-reference my identification vectors across government identification engines, in full compliance with the sovereign Nigerian Data Protection Regulation frameworks.
                        </label>
                      </div>

                    </motion.div>
                  )}

                </div>

                {/* Form Buttons */}
                <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
                  
                  {/* Back button */}
                  <button
                    disabled={currentStep === 1}
                    onClick={handleBack}
                    className="px-5 py-3 border border-slate-200 text-slate-500 disabled:opacity-40 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft size={14} />
                    <span>Previous</span>
                  </button>

                  {/* Next / Submit */}
                  {currentStep < 4 ? (
                    <button
                      onClick={handleNext}
                      className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Continue & Advance</span>
                      <ArrowRight size={14} />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmitKYC}
                      className="px-6 py-3 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-md"
                    >
                      <ShieldCheck size={16} />
                      <span>Audit My Sovereign Credentials</span>
                    </button>
                  )}

                </div>

              </motion.div>
            )}

          </AnimatePresence>

        </div>

      </div>

    </div>
  );
}
