import React, { useState } from 'react';
import { 
  Shield, 
  Key, 
  Lock, 
  Clock, 
  Smartphone, 
  Laptop, 
  Globe, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Eye, 
  EyeOff,
  ShieldCheck
} from 'lucide-react';

interface MemberSecurityTabProps {
  transactionPin: string;
  pinCurrentInput: string;
  setPinCurrentInput: (val: string) => void;
  pinNewInput: string;
  setPinNewInput: (val: string) => void;
  pinConfirmInput: string;
  setPinConfirmInput: (val: string) => void;
  pinMessage: { type: 'success' | 'error'; text: string } | null;
  onPinChangeSubmit: (e: React.FormEvent) => void;
  sessionTimeoutDuration: number;
  onSessionTimeoutChange: (duration: number) => void;
  sessions: any[];
  onRevokeSession: (id: string) => void;
  onRevokeAllOtherSessions: () => void;
}

export const MemberSecurityTab: React.FC<MemberSecurityTabProps> = ({
  transactionPin,
  pinCurrentInput,
  setPinCurrentInput,
  pinNewInput,
  setPinNewInput,
  pinConfirmInput,
  setPinConfirmInput,
  pinMessage,
  onPinChangeSubmit,
  sessionTimeoutDuration,
  onSessionTimeoutChange,
  sessions,
  onRevokeSession,
  onRevokeAllOtherSessions,
}) => {
  const [showPin, setShowPin] = useState(false);

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="font-headline text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
          Security & Device Sessions
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
          Manage your transaction PIN, automatic session timeout, and active logins
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Transaction PIN Management */}
        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Key size={20} />
            </div>
            <div>
              <h2 className="font-headline font-bold text-base text-on-surface">
                Transaction PIN
              </h2>
              <p className="text-xs text-on-surface-variant">
                Used to authorize payouts and sensitive transfers
              </p>
            </div>
          </div>

          {pinMessage && (
            <div className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 ${
              pinMessage.type === 'success' 
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' 
                : 'bg-error-container text-on-error-container'
            }`}>
              {pinMessage.type === 'success' ? (
                <CheckCircle2 size={16} className="text-emerald-700 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle size={16} className="text-error shrink-0 mt-0.5" />
              )}
              <span className="leading-relaxed">{pinMessage.text}</span>
            </div>
          )}

          <form onSubmit={onPinChangeSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Current Transaction PIN
              </label>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  maxLength={6}
                  required
                  value={pinCurrentInput}
                  onChange={(e) => setPinCurrentInput(e.target.value)}
                  placeholder="Enter current 4-6 digit PIN"
                  className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl px-3.5 py-2.5 text-xs text-on-surface font-mono focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                >
                  {showPin ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  New PIN
                </label>
                <input
                  type={showPin ? 'text' : 'password'}
                  maxLength={6}
                  required
                  value={pinNewInput}
                  onChange={(e) => setPinNewInput(e.target.value)}
                  placeholder="4-6 numeric digits"
                  className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl px-3.5 py-2.5 text-xs text-on-surface font-mono focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Confirm New PIN
                </label>
                <input
                  type={showPin ? 'text' : 'password'}
                  maxLength={6}
                  required
                  value={pinConfirmInput}
                  onChange={(e) => setPinConfirmInput(e.target.value)}
                  placeholder="Repeat new PIN"
                  className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl px-3.5 py-2.5 text-xs text-on-surface font-mono focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary/90 transition shadow-xs cursor-pointer"
            >
              Update Transaction PIN
            </button>
          </form>
        </div>

        {/* 2. Session Inactivity Timeout Settings */}
        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-6 shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Clock size={20} />
              </div>
              <div>
                <h2 className="font-headline font-bold text-base text-on-surface">
                  Inactivity Timeout
                </h2>
                <p className="text-xs text-on-surface-variant">
                  Automatically locks your portal session if left unattended
                </p>
              </div>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              To protect your financial records on shared or workstation devices, ZIMCO automatically signs out inactive sessions after a configurable inactivity threshold.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              {[
                { label: '3 mins', seconds: 180 },
                { label: '5 mins', seconds: 300 },
                { label: '10 mins', seconds: 600 },
                { label: '15 mins', seconds: 900 },
              ].map((opt) => {
                const isSelected = sessionTimeoutDuration === opt.seconds;
                return (
                  <button
                    key={opt.seconds}
                    type="button"
                    onClick={() => onSessionTimeoutChange(opt.seconds)}
                    className={`p-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      isSelected
                        ? 'bg-primary text-on-primary border-primary shadow-xs'
                        : 'bg-surface-container-low text-on-surface border-outline-variant/60 hover:bg-surface-container'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-3 bg-surface-container-low rounded-xl flex items-center gap-2.5 text-xs text-on-surface-variant">
            <ShieldCheck size={16} className="text-primary shrink-0" />
            <span>Currently set to {Math.round(sessionTimeoutDuration / 60)} minutes of inactivity.</span>
          </div>
        </div>
      </div>

      {/* 3. Active Logged-in Devices / Sessions */}
      <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant/40 pb-4">
          <div>
            <h2 className="font-headline font-bold text-base text-on-surface">
              Active Authorized Sessions
            </h2>
            <p className="text-xs text-on-surface-variant">
              Devices currently signed in to your member account
            </p>
          </div>

          <button
            type="button"
            onClick={onRevokeAllOtherSessions}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-error-container text-on-error-container text-xs font-bold hover:opacity-90 transition cursor-pointer self-start sm:self-auto"
          >
            <Trash2 size={13} />
            <span>Revoke All Other Devices</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {sessions.map((sess) => {
            const isRevoked = sess.status === 'revoked';
            const isDesktop = sess.device.toLowerCase().includes('mac') || sess.device.toLowerCase().includes('thinkpad') || sess.device.toLowerCase().includes('windows');

            return (
              <div 
                key={sess.id}
                className={`p-4 rounded-xl border transition flex items-start justify-between gap-3 ${
                  sess.isCurrent 
                    ? 'bg-primary/5 border-primary/40' 
                    : isRevoked 
                    ? 'bg-surface-container-low/40 border-outline-variant/30 opacity-60' 
                    : 'bg-surface-container-low border-outline-variant/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-surface-container-lowest border border-outline-variant/50 text-on-surface-variant flex items-center justify-center shrink-0 mt-0.5">
                    {isDesktop ? <Laptop size={18} /> : <Smartphone size={18} />}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-xs text-on-surface">{sess.device}</p>
                      {sess.isCurrent && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-primary text-on-primary">
                          This Device
                        </span>
                      )}
                      {isRevoked && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-error-container text-on-error-container">
                          Revoked
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-on-surface-variant">{sess.browser} • {sess.os}</p>
                    <p className="text-[10px] font-mono text-on-surface-variant/80">{sess.location} • {sess.timestamp}</p>
                  </div>
                </div>

                {!sess.isCurrent && !isRevoked && (
                  <button
                    type="button"
                    onClick={() => onRevokeSession(sess.id)}
                    className="p-1.5 text-on-surface-variant hover:text-error hover:bg-surface-container-lowest rounded-lg transition cursor-pointer"
                    title="Revoke session"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
