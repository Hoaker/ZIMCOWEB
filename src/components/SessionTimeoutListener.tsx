import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, 
  ShieldAlert, 
  Activity, 
  LogOut, 
  RefreshCw, 
  Bell, 
  Lock, 
  Play, 
  Pause,
  Volume2,
  VolumeX,
  UserCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SessionTimeoutListenerProps {
  onLogout?: () => void;
}

export default function SessionTimeoutListener({ onLogout }: SessionTimeoutListenerProps) {
  const navigate = useNavigate();
  
  // Conf values: total session inactive duration (seconds). Default to 3 minutes (180s)
  const [totalTimeout, setTotalTimeout] = useState<number>(() => {
    const saved = localStorage.getItem('zimco_session_timeout_duration');
    return saved ? parseInt(saved, 10) : 180;
  });

  const [warningSeconds, setWarningSeconds] = useState<number>(60); // Constantly 60 seconds warning before auto-logout
  const [inactiveTime, setInactiveTime] = useState<number>(0);
  const [showWarning, setShowWarning] = useState<boolean>(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(60);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [lastActivityType, setLastActivityType] = useState<string>('Init');
  const [lastCoordinate, setLastCoordinate] = useState<{x: number, y: number}>({ x: 0, y: 0 });

  const inactiveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Sync state configuration changes in localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('zimco_session_timeout_duration');
      if (saved) {
        setTotalTimeout(parseInt(saved, 10));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    // Also poll occasionally to register inside same-tab preferences
    const pollInterval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(pollInterval);
    };
  }, []);

  // Soft warning beep using Web Audio API
  const playBeep = (freq: number, type: 'sine' | 'triangle' | 'square', duration: number) => {
    if (isMuted) return;
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
      console.warn("Audio warning beep failed due to user gesture constraints:", e);
    }
  };

  // Reset inactive logic
  const resetInactivityTimer = (activityType: string) => {
    setInactiveTime(0);
    setLastActivityType(activityType);
    
    // If warning is already showing but user triggers a heavy event on the background, 
    // we can either keep warning (safest to require manual button check) or clear it. 
    // Let's only reset inactiveTime on event listeners, but keep the warning showing 
    // so they must explicitly click "keep me logged in" to avoid security bypass.
  };

  // Event handlers to detect human interaction
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setLastCoordinate({ x: e.clientX, y: e.clientY });
      resetInactivityTimer('Mouse Move');
    };
    const handleKeyDown = () => resetInactivityTimer('Key Press');
    const handleMouseDown = () => resetInactivityTimer('Mouse Click');
    const handleScroll = () => resetInactivityTimer('Page Scroll');
    const handleTouch = () => resetInactivityTimer('Screen Touch');

    // Register listeners
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('touchstart', handleTouch);

    // Main interval to tally inactive seconds
    inactiveTimerRef.current = setInterval(() => {
      setInactiveTime(prev => {
        const nextTime = prev + 1;
        const triggerWarningAt = totalTimeout - warningSeconds;
        
        if (nextTime >= totalTimeout) {
          // Time expired completely -> trigger logout!
          triggerAutoLogout();
          return nextTime;
        }

        if (nextTime >= triggerWarningAt && !showWarning) {
          setShowWarning(true);
          setSecondsRemaining(totalTimeout - nextTime);
          // Play introductory security tone
          playBeep(480, 'sine', 0.4);
        }

        if (showWarning) {
          setSecondsRemaining(totalTimeout - nextTime);
        }

        return nextTime;
      });
    }, 1000);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('touchstart', handleTouch);
      if (inactiveTimerRef.current) clearInterval(inactiveTimerRef.current);
    };
  }, [totalTimeout, warningSeconds, showWarning, isMuted]);

  // Handle beep warnings inside the 60-second danger zone
  useEffect(() => {
    if (showWarning && secondsRemaining > 0) {
      // Beep frequency and speed increases as timer runs thin
      const secondsPassed = 60 - secondsRemaining;
      
      let intervalSpeed = 1000; // default 1 tick per sec
      if (secondsRemaining <= 10) {
        intervalSpeed = 250; // fast pulse
      } else if (secondsRemaining <= 20) {
        intervalSpeed = 500; // medium pulse
      }

      const soundTickId = setTimeout(() => {
        if (secondsRemaining <= 10) {
          playBeep(880, 'square', 0.08); // High alarm
        } else {
          playBeep(650, 'sine', 0.05); // standard tick
        }
      }, intervalSpeed);

      return () => clearTimeout(soundTickId);
    }
  }, [showWarning, secondsRemaining]);

  // Reset session warning back to clean state
  const handleKeepActive = () => {
    setInactiveTime(0);
    setShowWarning(false);
    playBeep(750, 'sine', 0.15);
  };

  const triggerLogoutSecurely = () => {
    // Clear tokens
    localStorage.removeItem('zimco_token');
    localStorage.removeItem('zimco_role');
    localStorage.removeItem('zimco_id');
    localStorage.removeItem('zimco_session_timeout_alert'); // clear older is any
    
    if (onLogout) {
      onLogout();
    } else {
      navigate('/portal');
    }
  };

  const triggerAutoLogout = () => {
    // Save state to indicate timeout happened
    localStorage.setItem('zimco_session_timeout_alert', 'true');
    triggerLogoutSecurely();
  };

  // Convert seconds to human format (MM:SS)
  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <>
      {/* Session Warning Modal Overlay */}
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
              initial={{ opacity: 0, scale: 0.93, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] overflow-hidden border border-slate-250 border-slate-100 dark:border-slate-800 shadow-2xl relative z-20 p-8 md:p-10 space-y-6"
            >
              {/* Alert Warning Header */}
              <div className="flex items-start gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="p-3.5 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-2xl animate-pulse">
                  <ShieldAlert size={28} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
                    <span className="text-[10px] text-rose-605 text-rose-600 font-black tracking-widest font-mono uppercase">SECURITY SURVEILLANCE WARNING</span>
                  </div>
                  <h3 className="font-headline font-black text-slate-900 dark:text-white text-xl">Inactivity Log-out Imminent</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Your cooperative banking session has been idle for too long.</p>
                </div>
              </div>

              {/* High precision ticking countdown */}
              <div className="text-center py-6 bg-slate-50 dark:bg-slate-950 rounded-3xl relative overflow-hidden flex flex-col items-center justify-center border border-slate-150/50 dark:border-slate-800">
                <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-1">AUTOMATIC SECURE LOGOUT IN</p>
                <div className="text-5xl font-mono font-black tracking-wider text-rose-600 dark:text-rose-400 flex items-center justify-center gap-2">
                  <Clock className="w-8 h-8 animate-spin" style={{ animationDuration: '4s' }} />
                  <span className="tabular-nums font-extrabold">{secondsRemaining} <span className="text-xs font-sans uppercase font-black tracking-normal">seconds</span></span>
                </div>
                
                {/* Horizontal shrinking green/red timeline progress guide */}
                <div className="absolute bottom-0 left-0 h-1.5 bg-rose-650 bg-rose-600 transition-all duration-1000" style={{ width: `${(secondsRemaining / 60) * 100}%` }}></div>
              </div>

              {/* Logs metrics debug card (adds incredible high precision design details) */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-150/50 dark:border-slate-800 grid grid-cols-2 gap-4 text-[10px] font-mono text-slate-450 text-slate-500">
                <div className="space-y-1">
                  <span className="block font-bold uppercase tracking-wider text-slate-405 text-slate-400 text-[8px]">LAST INTERACTION TRIGGER</span>
                  <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-bold">
                    <Activity size={10} className="text-emerald-600" />
                    <span>{lastActivityType}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="block font-bold uppercase tracking-wider text-slate-405 text-slate-400 text-[8px]">CO-OP BANKING TIER</span>
                  <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-400 font-bold">
                    <Lock size={10} />
                    <span>SECURE DIRECT SSL</span>
                  </div>
                </div>
              </div>

              {/* Actions footer wrapper */}
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                
                {/* Mute switcher */}
                <button
                  type="button"
                  onClick={() => setIsMuted(prev => !prev)}
                  className="px-4 py-3 bg-slate-105 hover:bg-slate-205 bg-slate-50 hover:bg-slate-100 text-slate-500 dark:text-slate-400 rounded-xl text-xs font-bold font-mono transition-colors flex items-center gap-2 w-full sm:w-auto self-stretch justify-center"
                >
                  {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  <span>{isMuted ? 'UNMUTE TICK' : 'MUTE AUDIO'}</span>
                </button>

                <button
                  type="button"
                  onClick={triggerLogoutSecurely}
                  className="px-5 py-3.5 border border-slate-200 hover:bg-slate-50 text-slate-600 dark:text-slate-300 rounded-2xl text-xs font-bold text-center transition-all flex items-center justify-center gap-2 grow cursor-pointer w-full sm:w-auto"
                >
                  <LogOut size={14} />
                  <span>Log Out Securely</span>
                </button>

                <button
                  type="button"
                  onClick={handleKeepActive}
                  className="px-6 py-3.5 bg-emerald-900 hover:bg-emerald-800 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-2xl text-xs font-black text-center transition-transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 grow cursor-pointer shadow-md shadow-emerald-950/10 w-full sm:w-auto"
                >
                  <RefreshCw size={14} className="animate-spin" style={{ animationDuration: '3s' }} />
                  <span>Keep Me Logged In</span>
                </button>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
