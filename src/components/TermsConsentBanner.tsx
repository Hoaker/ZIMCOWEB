import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Scale, X, ExternalLink, Lock, CheckCircle2, ShieldCheck, HelpCircle } from 'lucide-react';

export default function TermsConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [consentLog, setConsentLog] = useState<{ timestamp: string; ip: string; hash: string } | null>(null);

  useEffect(() => {
    // Check if member already acknowledged policies updated on June 1, 2026 (Version 2026.3)
    const acceptedVersion = localStorage.getItem('zimco_terms_ack_version');
    const storedLog = localStorage.getItem('zimco_terms_consent_log');

    if (acceptedVersion !== '2026.3') {
      // Delay display slightly for dynamic premium visual feel
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      if (storedLog) {
        setConsentLog(JSON.parse(storedLog));
      }
    }
  }, []);

  const handleAcknowledge = () => {
    const timestamp = new Date().toISOString();
    const mockIP = `102.89.${Math.floor(10 + Math.random() * 80)}.${Math.floor(10 + Math.random() * 240)}`;
    const mockHash = 'ZMC-CON-' + Math.floor(100000 + Math.random() * 900000).toString(16).toUpperCase() + '-2026.3';
    
    const logDetails = { timestamp, ip: mockIP, hash: mockHash };
    
    // Persist in local storage to auditconsent
    localStorage.setItem('zimco_terms_ack_version', '2026.3');
    localStorage.setItem('zimco_terms_consent_log', JSON.stringify(logDetails));
    
    setConsentLog(logDetails);
    setIsVisible(false);
  };

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
            className="fixed bottom-6 right-6 left-6 md:right-10 md:left-auto md:max-w-xl bg-slate-900 text-white p-6 sm:p-8 rounded-[2.5rem] shadow-[0px_24px_64px_rgba(0,0,0,0.3)] border border-emerald-500/20 z-50 overflow-hidden"
          >
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl"></div>

            <div className="space-y-6 relative z-10">
              
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
                    <Scale size={20} />
                  </div>
                  <div>
                    <h4 className="font-headline font-black text-white text-base">
                      Terms of Service Update
                    </h4>
                    <span className="text-[10px] text-emerald-400 font-bold font-mono uppercase tracking-wider">
                      Policy Mutation Alert • Version 2026.3
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsVisible(false)}
                  className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Explainer Paragraph */}
              <div className="space-y-3 font-body text-xs sm:text-sm text-slate-300 leading-relaxed">
                <p>
                  In compliance with State Cooperative Unions regulation patterns, ZIMCO has updated sections concerning:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-400 font-medium">
                  <li>
                    <strong className="text-white">Transaction PIN Management:</strong> Absolute mandatory requirement for withdrawals and balances shifts.
                  </li>
                  <li>
                    <strong className="text-white">Active Session Ledger Logs:</strong> Instant cookie revocation controls enabled.
                  </li>
                  <li>
                    <strong className="text-white">Joint Guarantorship liability bounds:</strong> Streamlined cooperative safeguards.
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
                <Link 
                  to="/terms"
                  onClick={() => setIsVisible(false)}
                  className="w-full sm:w-auto text-center px-5 py-3 text-xs font-bold text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  <span>View Legal Articles</span>
                  <ExternalLink size={12} />
                </Link>

                <button
                  onClick={handleAcknowledge}
                  className="w-full sm:flex-grow px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-md shadow-emerald-950/45 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock size={14} />
                  <span>Acknowledge & Record Consent</span>
                </button>
              </div>

              {/* Compliance Trace Banner */}
              <p className="text-[10px] text-slate-500 text-center font-mono">
                Consent actions are logged in the secure local ledger in compliance with NDPR.
              </p>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Small floating indicator for validated consent */}
      {consentLog && (
        <div className="fixed bottom-6 left-6 z-40 hidden lg:flex items-center gap-2 bg-white/90 backdrop-blur border border-slate-200/60 p-2.5 rounded-full shadow-lg">
          <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800">
            <ShieldCheck size={12} />
          </div>
          <span className="text-[9px] text-slate-500 font-mono font-medium">
            TOS V2026.3 Verified Connection • Ref: <span className="font-bold text-slate-700">{consentLog.hash}</span>
          </span>
        </div>
      )}
    </>
  );
}
