import React from 'react';
import { Menu, Bell, User, LogOut, Shield, ChevronDown, Sparkles } from 'lucide-react';
import zimcoLogo from '@/assets/images/zimco_logo_1780347665840.png';

interface MemberTopNavbarProps {
  memberName: string;
  memberId: string;
  unreadNotificationsCount: number;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  onOpenSecurity: () => void;
  onLogout: () => void;
  onToggleMobileSidebar: () => void;
  isProfileMenuOpen: boolean;
  setIsProfileMenuOpen: (open: boolean) => void;
  profileMenuRef: React.RefObject<HTMLDivElement | null>;
  getUserInitials: (name?: string) => string;
}

export const MemberTopNavbar: React.FC<MemberTopNavbarProps> = ({
  memberName,
  memberId,
  unreadNotificationsCount,
  onOpenNotifications,
  onOpenProfile,
  onOpenSecurity,
  onLogout,
  onToggleMobileSidebar,
  isProfileMenuOpen,
  setIsProfileMenuOpen,
  profileMenuRef,
  getUserInitials,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-variant/40 px-4 sm:px-6 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Brand/Portal Identity */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            aria-label="Toggle navigation menu"
            className="lg:hidden p-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
          >
            <Menu size={22} />
          </button>

          <div className="flex items-center gap-2.5">
            <img
              src={zimcoLogo}
              alt="ZIMCO Cooperative Society"
              className="w-8 h-8 sm:w-9 sm:h-9 object-contain rounded-lg shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="hidden sm:block">
              <span className="font-headline font-bold text-sm sm:text-base text-primary tracking-tight block leading-tight">
                ZIMCO Cooperative
              </span>
              <span className="text-[11px] font-medium text-on-surface-variant leading-none">
                Member Self-Service Portal
              </span>
            </div>
          </div>
        </div>

        {/* Right: Notification Center & Member Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notifications Button */}
          <button
            type="button"
            onClick={onOpenNotifications}
            aria-label={`View notifications (${unreadNotificationsCount} unread)`}
            className="relative p-2.5 rounded-xl text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
          >
            <Bell size={20} />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-error text-on-error text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Member Profile Dropdown */}
          <div className="relative" ref={profileMenuRef}>
            <button
              type="button"
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              aria-expanded={isProfileMenuOpen}
              aria-haspopup="true"
              aria-label="User account menu"
              className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/50 transition focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
            >
              <div className="w-8 h-8 rounded-lg bg-primary text-on-primary font-bold text-xs flex items-center justify-center shadow-xs">
                {getUserInitials(memberName)}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-on-surface line-clamp-1 leading-tight">
                  {memberName || 'Member'}
                </p>
                <p className="text-[10px] font-mono text-on-surface-variant leading-none">
                  {memberId ? `ID: ${memberId}` : 'Co-op Account'}
                </p>
              </div>
              <ChevronDown size={14} className="text-on-surface-variant hidden md:block" />
            </button>

            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-surface-container-lowest border border-outline-variant/60 rounded-2xl shadow-lg p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2.5 border-b border-outline-variant/40 mb-1">
                  <p className="text-xs font-bold text-on-surface truncate">{memberName || 'Member'}</p>
                  <p className="text-[11px] text-on-surface-variant font-mono truncate">{memberId}</p>
                </div>

                <div className="space-y-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onOpenProfile();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-on-surface hover:bg-surface-container-low transition"
                  >
                    <User size={15} className="text-on-surface-variant" />
                    <span>My Profile & Beneficiary</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onOpenSecurity();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-on-surface hover:bg-surface-container-low transition"
                  >
                    <Shield size={15} className="text-on-surface-variant" />
                    <span>Security & PIN</span>
                  </button>
                </div>

                <div className="border-t border-outline-variant/40 mt-1 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-error hover:bg-error-container/40 transition"
                  >
                    <LogOut size={15} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
