import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, 
  ShieldAlert, 
  Activity, 
  LogOut, 
  RefreshCw, 
  Lock, 
  Volume2, 
  VolumeX 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SessionTimeoutListenerProps {
  onLogout?: () => void;
}

export default function SessionTimeoutListener({ onLogout }: SessionTimeoutListenerProps) {
  const navigate = useNavigate();
  const onLogoutRef = useRef(onLogout);

  useEffect(() => {
    onLogoutRef.current = onLogout;
  }, [onLogout]);

  // Config: total session inactive duration (seconds). Default to 3 minutes (180s)
  const [totalTimeout, setTotalTimeout] = useState<number>(() => {
    const saved = localStorage.getItem('zimco_session_timeout_duration');
    return saved ? parseInt(saved, 10) : 180;
  });

  const warningSeconds = 60; // 60 seconds warning before auto-logout
  const [showWarning, setShowWarning] = useState<boolean>(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(60);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [lastActivityType, setLastActivityType] = useState<string>('Init');

  const lastActiveTimestampRef = useRef<number>(Date.now());
  const warningShowingRef = useRef<boolean>(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const isMutedRef = useRef<boolean>(true);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    warningShowingRef.current = showWarning;
  }, [showWarning]);

  // Sync state configuration changes in localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('zimco_session_timeout_duration');
      if (saved) {
        setTotalTimeout(parseInt(saved, 10));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    const pollInterval = setInterval(handleStorageChange, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(pollInterval);
    };
  }, []);

  // Soft warning beep using Web Audio API
  const playBeep = useCallback((freq: number, type: 'sine' | 'triangle' | 'square', duration: number) => {
    if (isMutedRef.current) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio warning tone unavailable:', e);
    }
  }, []);

  const triggerLogoutSecurely = useCallback(() => {
    localStorage.removeItem('zimco_token');
    localStorage.removeItem('zimco_role');
    localStorage.removeItem('zimco_id');
    localStorage.removeItem('zimco_session_timeout_alert');
    
    if (onLogoutRef.current) {
      onLogoutRef.current();
    } else {
      navigate('/portal');
    }
  }, [navigate]);

  const triggerAutoLogout = useCallback(() => {
    localStorage.setItem('zimco_session_timeout_alert', 'true');
    triggerLogoutSecurely();
  }, [triggerLogoutSecurely]);

  // Handle human activity detection
  useEffect(() => {
    let lastThrottledUpdate = Date.now();

    const recordActivity = (type: string) => {
      // If warning modal is actively open, don't silently dismiss via background mouse movements
      // The user must explicitly click "Keep Me Logged In" or "Log Out Securely"
      if (!warningShowingRef.current) {
        lastActiveTimestampRef.current = Date.now();
      }
      
      const now = Date.now();
      if (now - lastThrottledUpdate > 1000) {
        lastThrottledUpdate = now;
        setLastActivityType(type);
      }
    };

    const handleMouseMove = () => recordActivity('Mouse Move');
    const handleKeyDown = () => recordActivity('Key Press');
    const handleMouseDown = () => recordActivity('Mouse Click');
    const handleScroll = () => recordActivity('Page Scroll');
    const handleTouch = () => recordActivity('Screen Touch');

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('keydown', handleKeyDown, { passive: true });
    window.addEventListener('mousedown', handleMouseDown, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('touchstart', handleTouch, { passive: true });

    // Main interval to check inactivity
    const checkInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - lastActiveTimestampRef.current) / 1000);
      const triggerWarningAt = Math.max(0, totalTimeout - warningSeconds);

      if (elapsed >= totalTimeout) {
        triggerAutoLogout();
        return;
      }

      if (elapsed >= triggerWarningAt) {
        const remaining = Math.max(0, totalTimeout - elapsed);
        if (!warningShowingRef.current) {
          setShowWarning(true);
          playBeep(480, 'sine', 0.4);
        }
        setSecondsRemaining(remaining);
      } else {
        if (warningShowingRef.current) {
          setShowWarning(false);
        }
      }
    }, 1000);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('touchstart', handleTouch);
      clearInterval(checkInterval);
    };
  }, [totalTimeout, warningSeconds, playBeep, triggerAutoLogout]);

  // Handle beep warnings inside the danger countdown zone
  useEffect(() => {
    if (showWarning && secondsRemaining > 0 && !isMuted) {
      let intervalSpeed = 1000;
      if (secondsRemaining <= 10) {
        intervalSpeed = 250;
      } else if (secondsRemaining <= 20) {
        intervalSpeed = 500;
      }

      const soundTickId = setTimeout(() => {
        if (secondsRemaining <= 10) {
          playBeep(880, 'square', 0.08);
        } else {
          playBeep(650, 'sine', 0.05);
        }
      }, intervalSpeed);

      return () => clearTimeout(soundTickId);
    }
  }, [showWarning, secondsRemaining, isMuted, playBeep]);

  // Reset session warning back to clean state
  const handleKeepActive = () => {
    lastActiveTimestampRef.current = Date.now();
    setShowWarning(false);
    setSecondsRemaining(warningSeconds);
    playBeep(750, 'sine', 0.15);
  };

  return (
    <AnimatePresence>
      {showWarning && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
          {/* Dark glass backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleKeepActive}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
          />

          {/* Modal Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="bg-white w-full max-w-lg rounded-2xl overflow-hidden border border-slate-100 shadow-2xl relative z-20 p-6 sm:p-8 space-y-6"
          >
            {/* Alert Warning Header */}
            <div className="flex items-start gap-4 pb-5 border-b border-slate-100">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-xl animate-pulse shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
                  <span className="text-[10px] text-rose-600 font-black tracking-widest font-mono uppercase">SECURITY NOTICE</span>
                </div>
                <h3 className="font-headline font-black text-slate-900 text-lg sm:text-xl">Inactivity Log-out Imminent</h3>
                <p className="text-xs text-slate-500 font-medium">Your cooperative banking session has been idle.</p>
              </div>
            </div>

            {/* Countdown Display */}
            <div className="text-center py-6 bg-slate-50 rounded-2xl relative overflow-hidden flex flex-col items-center justify-center border border-slate-100">
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-1">AUTOMATIC SECURE LOGOUT IN</p>
              <div className="text-4xl sm:text-5xl font-mono font-black tracking-wider text-rose-600 flex items-center justify-center gap-2">
                <Clock className="w-7 h-7 sm:w-8 sm:h-8 animate-spin" style={{ animationDuration: '4s' }} />
                <span className="tabular-nums font-extrabold">{secondsRemaining} <span className="text-xs font-sans uppercase font-black tracking-normal">seconds</span></span>
              </div>
              
              {/* Progress guide bar */}
              <div 
                className="absolute bottom-0 left-0 h-1.5 bg-rose-600 transition-all duration-1000" 
                style={{ width: `${(secondsRemaining / warningSeconds) * 100}%` }}
              />
            </div>

            {/* Metrics note */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 grid grid-cols-2 gap-3 text-[10px] font-mono text-slate-500">
              <div className="space-y-0.5">
                <span className="block font-bold uppercase tracking-wider text-slate-400 text-[8px]">LAST ACTIVITY</span>
                <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                  <Activity size={12} className="text-emerald-600 shrink-0" />
                  <span className="truncate">{lastActivityType}</span>
                </div>
              </div>
              <div className="space-y-0.5">
                <span className="block font-bold uppercase tracking-wider text-slate-400 text-[8px]">CONNECTION</span>
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                  <Lock size={12} className="shrink-0" />
                  <span>SECURE SSL</span>
                </div>
              </div>
            </div>

            {/* Actions footer wrapper */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-slate-100">
              {/* Mute switcher */}
              <button
                type="button"
                onClick={() => setIsMuted(prev => !prev)}
                className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold font-mono transition-colors flex items-center gap-1.5 w-full sm:w-auto justify-center cursor-pointer"
              >
                {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                <span>{isMuted ? 'UNMUTE' : 'MUTE'}</span>
              </button>

              <button
                type="button"
                onClick={triggerLogoutSecurely}
                className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold text-center transition-all flex items-center justify-center gap-2 grow cursor-pointer w-full sm:w-auto"
              >
                <LogOut size={14} />
                <span>Log Out</span>
              </button>

              <button
                type="button"
                onClick={handleKeepActive}
                className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold text-center transition-transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 grow cursor-pointer shadow-md shadow-emerald-950/10 w-full sm:w-auto"
              >
                <RefreshCw size={14} />
                <span>Keep Me Logged In</span>
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
