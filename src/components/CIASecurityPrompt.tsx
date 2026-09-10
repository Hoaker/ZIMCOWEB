import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Lock, 
  UserCheck, 
  Smartphone, 
  ChevronRight, 
  X, 
  KeyRound, 
  CheckCircle2,
  Shield,
  FileCheck2
} from 'lucide-react';

interface CIASecurityPromptProps {
  isOpen?: boolean;
  memberData?: any;
  onClose?: () => void;
  onNavigateToSecurity?: () => void;
  onNavigateToProfile?: () => void;
  onNavigateToSettings?: () => void;
}

export default function CIASecurityPrompt({
  isOpen = false,
  memberData,
  onClose,
  onNavigateToSecurity,
  onNavigateToProfile,
  onNavigateToSettings
}: CIASecurityPromptProps) {
  const [isDefaultPassword] = useState(() => {
    return localStorage.getItem('zimco_logged_in_with_default_password') === 'true';
  });

  const memberId = memberData?.id || localStorage.getItem('zimco_id') || 'ZIM-2026-001';

  const handleDismiss = () => {
    localStorage.setItem('zimco_cia_security_dismissed', 'true');
    localStorage.setItem(`zimco_cia_security_acknowledged_${memberId}`, 'true');
    if (onClose) onClose();
  };

  const handleNavigate = () => {
    localStorage.setItem('zimco_cia_security_dismissed', 'true');
    localStorage.setItem(`zimco_cia_security_acknowledged_${memberId}`, 'true');
    if (onNavigateToProfile) {
      onNavigateToProfile();
    } else if (onNavigateToSettings) {
      onNavigateToSettings();
    } else if (onNavigateToSecurity) {
      onNavigateToSecurity();
    }
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-4xl bg-gradient-to-br from-slate-900 via-slate-850 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-emerald-500/30 relative overflow-hidden my-auto max-h-[90vh] overflow-y-auto custom-scrollbar"
      >
        {/* Background glow accents */}
        <div className="absolute -right-24 -top-24 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-24 -bottom-24 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Header Ribbon */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-white/10 pb-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 flex items-center justify-center shrink-0 shadow-inner">
                <ShieldCheck size={26} />
              </div>
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider mb-1.5">
                  <Lock size={11} />
                  <span>Account Security</span>
                </div>
                <h3 className="font-headline text-xl sm:text-2xl font-black text-white tracking-tight">
                  Security Checkpoints
                </h3>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="self-end sm:self-start p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition cursor-pointer"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* 4 Core CIA Security Checkpoints */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Checkpoint 1: Confidentiality */}
            <div className="bg-white/5 border border-emerald-500/20 rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:bg-white/10 transition group">
              <div>
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                  <KeyRound size={18} />
                </div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">Password</span>
                </div>
                <h4 className="font-bold text-white text-sm mb-1.5">Update Password</h4>
                <p className="text-[11px] text-slate-300">
                  Set a secure private password to protect your savings and records.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-bold text-emerald-300">
                <span>{isDefaultPassword ? 'Update Needed' : 'Secured'}</span>
                <Lock size={13} />
              </div>
            </div>

            {/* Checkpoint 2: Integrity */}
            <div className="bg-white/5 border border-blue-500/20 rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:bg-white/10 transition group">
              <div>
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-3">
                  <UserCheck size={18} />
                </div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-400">Profile</span>
                </div>
                <h4 className="font-bold text-white text-sm mb-1.5">Verify Details</h4>
                <p className="text-[11px] text-slate-300">
                  Ensure department, staff number, and Next of Kin are accurate.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-bold text-blue-300">
                <span>Review</span>
                <FileCheck2 size={13} />
              </div>
            </div>

            {/* Checkpoint 3: Availability */}
            <div className="bg-white/5 border border-amber-500/20 rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:bg-white/10 transition group">
              <div>
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
                  <Smartphone size={18} />
                </div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">Contact</span>
                </div>
                <h4 className="font-bold text-white text-sm mb-1.5">Alert Channels</h4>
                <p className="text-[11px] text-slate-300">
                  Add an active phone number and email for instant notifications.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-bold text-amber-300">
                <span>Alerts</span>
                <Smartphone size={13} />
              </div>
            </div>

            {/* Checkpoint 4: Access Control */}
            <div className="bg-white/5 border border-purple-500/20 rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:bg-white/10 transition group">
              <div>
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-3">
                  <Shield size={18} />
                </div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-400">Ledger</span>
                </div>
                <h4 className="font-bold text-white text-sm mb-1.5">Statements</h4>
                <p className="text-[11px] text-slate-300">
                  Review monthly payroll deductions and download statements.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-bold text-purple-300">
                <span>Audit</span>
                <CheckCircle2 size={13} />
              </div>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <CheckCircle2 size={15} className="text-emerald-400" />
              <span>Updating your credentials takes less than 60 seconds and secures your savings portfolio.</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleDismiss}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Acknowledge & Close
              </button>
              <button
                onClick={handleNavigate}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer active:scale-95"
              >
                <span>Update Profile & Settings</span>
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
