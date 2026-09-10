import React from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  CreditCard, 
  TrendingUp, 
  FileText, 
  ShieldCheck, 
  Lock, 
  LifeBuoy, 
  ArrowDownToLine, 
  ArrowUpRight, 
  ChevronDown, 
  ChevronRight,
  Sparkles,
  UserCheck,
  PiggyBank,
  Building2,
  ReceiptText,
  Calendar,
  X
} from 'lucide-react';

export type MemberViewType = 
  | 'dashboard' 
  | 'monthly'
  | 'yearly'
  | 'os' 
  | 'ss' 
  | 'ia' 
  | 'cp' 
  | 'mca' 
  | 'loans' 
  | 'profile' 
  | 'settings' 
  | 'withdrawal' 
  | 'planning' 
  | 'kyc' 
  | 'helpdesk' 
  | 'payments';

interface MemberSidebarProps {
  activeView: MemberViewType;
  setActiveView: (view: MemberViewType) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  isSavingsOpen: boolean;
  setIsSavingsOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  kycStatus: 'draft' | 'submitted' | 'failed' | 'verified';
  outstandingLoans: number;
}

export const MemberSidebar: React.FC<MemberSidebarProps> = ({
  activeView,
  setActiveView,
  isSidebarOpen,
  setIsSidebarOpen,
  isSavingsOpen,
  setIsSavingsOpen,
  kycStatus,
  outstandingLoans,
}) => {
  const isAccountActive = ['os', 'ss', 'ia', 'cp', 'mca'].includes(activeView);

  const handleNavClick = (view: MemberViewType) => {
    setActiveView(view);
    setIsSidebarOpen(false);
  };

  const navItemClass = (isActive: boolean) => `
    flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all select-none
    ${isActive 
      ? 'bg-primary text-on-primary shadow-xs font-bold' 
      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
    }
  `;

  const subNavItemClass = (isActive: boolean) => `
    flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors
    ${isActive 
      ? 'bg-primary/10 text-primary font-bold' 
      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
    }
  `;

  return (
    <>
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-surface-container-lowest border-r border-outline-variant/40
          flex flex-col h-full
          transition-transform duration-200 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Mobile Header Close */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-outline-variant/40">
          <span className="font-headline font-bold text-sm text-primary">Member Navigation</span>
          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low"
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Items List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar">
          {/* Main Group */}
          <div>
            <p className="px-3 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">
              Main
            </p>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => handleNavClick('dashboard')}
                className={`w-full text-left ${navItemClass(activeView === 'dashboard')}`}
              >
                <LayoutDashboard size={18} className="shrink-0" />
                <span>Overview</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('monthly')}
                className={`w-full text-left ${navItemClass(activeView === 'monthly')}`}
              >
                <Calendar size={18} className="shrink-0" />
                <div className="flex-1 flex items-center justify-between">
                  <span>Monthly Passbook</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface-container-high font-mono opacity-80">
                    Cycles
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('yearly')}
                className={`w-full text-left ${navItemClass(activeView === 'yearly')}`}
              >
                <FileText size={18} className="shrink-0" />
                <div className="flex-1 flex items-center justify-between">
                  <span>Yearly Record</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface-container-high font-mono opacity-80">
                    Statements
                  </span>
                </div>
              </button>

              {/* Savings Accounts Collapsible */}
              <div>
                <button
                  type="button"
                  onClick={() => setIsSavingsOpen(prev => !prev)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition select-none ${
                    isAccountActive && activeView !== 'dashboard'
                      ? 'text-primary bg-primary/5 font-bold'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Wallet size={18} className="shrink-0" />
                    <span>My Accounts</span>
                  </div>
                  {isSavingsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>

                {isSavingsOpen && (
                  <div className="pl-6 pr-1 pt-1 pb-1 space-y-0.5 border-l-2 border-outline-variant/30 ml-5 mt-1">
                    <button
                      type="button"
                      onClick={() => handleNavClick('os')}
                      className={`w-full text-left ${subNavItemClass(activeView === 'os')}`}
                    >
                      <span>Ordinary Savings</span>
                      <span className="text-[10px] opacity-70">OS</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavClick('ss')}
                      className={`w-full text-left ${subNavItemClass(activeView === 'ss')}`}
                    >
                      <span>Special Savings</span>
                      <span className="text-[10px] opacity-70">SS</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavClick('ia')}
                      className={`w-full text-left ${subNavItemClass(activeView === 'ia')}`}
                    >
                      <span>Investment Account</span>
                      <span className="text-[10px] opacity-70">IA</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavClick('cp')}
                      className={`w-full text-left ${subNavItemClass(activeView === 'cp')}`}
                    >
                      <span>Commodity Purchase</span>
                      <span className="text-[10px] opacity-70">CP</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavClick('mca')}
                      className={`w-full text-left ${subNavItemClass(activeView === 'mca')}`}
                    >
                      <span>Muslim Community</span>
                      <span className="text-[10px] opacity-70">MCA</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Financing & Actions */}
          <div>
            <p className="px-3 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">
              Financing & Growth
            </p>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => handleNavClick('loans')}
                className={`w-full text-left justify-between ${navItemClass(activeView === 'loans')}`}
              >
                <div className="flex items-center gap-3">
                  <CreditCard size={18} className="shrink-0" />
                  <span>Loans & Credit</span>
                </div>
                {outstandingLoans > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold">
                    Active
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('planning')}
                className={`w-full text-left ${navItemClass(activeView === 'planning')}`}
              >
                <TrendingUp size={18} className="shrink-0" />
                <span>Wealth Planning</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('payments')}
                className={`w-full text-left ${navItemClass(activeView === 'payments')}`}
              >
                <ArrowDownToLine size={18} className="shrink-0" />
                <span>Add Money (Top-Up)</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('withdrawal')}
                className={`w-full text-left ${navItemClass(activeView === 'withdrawal')}`}
              >
                <ArrowUpRight size={18} className="shrink-0" />
                <span>Request Payout</span>
              </button>
            </div>
          </div>

          {/* Security & Support */}
          <div>
            <p className="px-3 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">
              Account & Support
            </p>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => handleNavClick('kyc')}
                className={`w-full text-left justify-between ${navItemClass(activeView === 'kyc')}`}
              >
                <div className="flex items-center gap-3">
                  <UserCheck size={18} className="shrink-0" />
                  <span>Identity (KYC)</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                  kycStatus === 'verified' 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : kycStatus === 'submitted'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-surface-container-high text-on-surface-variant'
                }`}>
                  {kycStatus === 'verified' ? 'Verified' : kycStatus === 'submitted' ? 'In Review' : 'Pending'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('settings')}
                className={`w-full text-left ${navItemClass(activeView === 'settings')}`}
              >
                <Lock size={18} className="shrink-0" />
                <span>Security & Sessions</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('helpdesk')}
                className={`w-full text-left ${navItemClass(activeView === 'helpdesk')}`}
              >
                <LifeBuoy size={18} className="shrink-0" />
                <span>Helpdesk & Support</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Footer Note */}
        <div className="p-3.5 border-t border-outline-variant/40 bg-surface-container-low/50">
          <div className="flex items-center gap-2 text-on-surface-variant">
            <ShieldCheck size={14} className="text-primary shrink-0" />
            <span className="text-[11px] leading-tight">256-Bit Financial Encryption</span>
          </div>
        </div>
      </aside>
    </>
  );
};
