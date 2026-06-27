import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import zimcoLogo from '@/assets/images/zimco_logo_1780347665840.png';
import { 
  LayoutDashboard, 
  Wallet, 
  ChevronDown, 
  ChevronRight, 
  CreditCard, 
  Settings, 
  LogOut, 
  User, 
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowDownToLine,
  Search,
  Bell,
  FileText,
  Upload,
  Shield,
  Key,
  Smartphone,
  Globe,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  Clock,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Laptop,
  Check,
  ShieldAlert,
  Power,
  RefreshCw,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import WealthPlanningTool from '../components/WealthPlanningTool';
import KYCOnboarding from '../components/KYCOnboarding';
import SessionTimeoutListener from '../components/SessionTimeoutListener';
import MemberHelpdesk from '../components/MemberHelpdesk';
import { useEffect } from 'react';
import { LifeBuoy } from 'lucide-react';

export default function MemberDashboard() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<'dashboard' | 'os' | 'ss' | 'ia' | 'cp' | 'mca' | 'loans' | 'settings' | 'withdrawal' | 'planning' | 'kyc' | 'helpdesk'>('dashboard');
  const [isSavingsOpen, setIsSavingsOpen] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // KYC State for Dashboard integration
  const [kycStatus, setKycStatus] = useState<'draft' | 'submitted' | 'failed' | 'verified'>('draft');

  useEffect(() => {
    const savedStatus = localStorage.getItem('zimco_kyc_status') || 'draft';
    setKycStatus(savedStatus as any);
  }, [activeView]);

  // Security States
  const [transactionPin, setTransactionPin] = useState('1234');
  const [pinCurrentInput, setPinCurrentInput] = useState('');
  const [pinNewInput, setPinNewInput] = useState('');
  const [pinConfirmInput, setPinConfirmInput] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [pinMessage, setPinMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Session timeout state & handler
  const [sessionTimeoutDuration, setSessionTimeoutDuration] = useState<number>(() => {
    const saved = localStorage.getItem('zimco_session_timeout_duration');
    return saved ? parseInt(saved, 10) : 180;
  });

  const handleSessionTimeoutChange = (duration: number) => {
    setSessionTimeoutDuration(duration);
    localStorage.setItem('zimco_session_timeout_duration', duration.toString());
  };

  // Sessions State
  const [sessions, setSessions] = useState([
    {
      id: 'session-1',
      device: 'MacBook Pro 16"',
      os: 'macOS Sequoia 15.4',
      browser: 'Google Chrome',
      ip: '102.89.34.197',
      location: 'Lagos, Nigeria',
      timestamp: 'Active Now',
      isCurrent: true,
      status: 'active' as 'active' | 'revoking' | 'revoked'
    },
    {
      id: 'session-2',
      device: 'iPhone 15 Pro Max',
      os: 'iOS 18.2',
      browser: 'Safari Mobile',
      ip: '197.210.64.12',
      location: 'Abuja, Nigeria',
      timestamp: '2 hours ago',
      isCurrent: false,
      status: 'active' as 'active' | 'revoking' | 'revoked'
    },
    {
      id: 'session-3',
      device: 'Lenovo ThinkPad X1',
      os: 'Windows 11 Enterprise',
      browser: 'Microsoft Edge',
      ip: '105.112.180.45',
      location: 'Ibadan, Nigeria',
      timestamp: 'May 28, 2026 14:32',
      isCurrent: false,
      status: 'active' as 'active' | 'revoking' | 'revoked'
    },
    {
      id: 'session-4',
      device: 'Samsung Galaxy S24 Ultra',
      os: 'Android 14',
      browser: 'Chrome Mobile',
      ip: '102.89.32.122',
      location: 'Lagos, Nigeria',
      timestamp: 'May 25, 2026 09:12',
      isCurrent: false,
      status: 'active' as 'active' | 'revoking' | 'revoked'
    }
  ]);

  const handleRevokeSession = (sessionId: string) => {
    setSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        return { ...s, status: 'revoked' };
      }
      return s;
    }));
  };

  const handleRevokeAllOtherSessions = () => {
    setSessions(prev => prev.map(s => {
      if (!s.isCurrent) {
        return { ...s, status: 'revoked' };
      }
      return s;
    }));
  };

  // Withdrawal States
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [withdrawalAccount, setWithdrawalAccount] = useState('ss');
  const [withdrawalReason, setWithdrawalReason] = useState('');
  const [withdrawalPin, setWithdrawalPin] = useState('');
  const [withdrawalState, setWithdrawalState] = useState<{ status: 'idle' | 'loading' | 'success' | 'error', message?: string }>({ status: 'idle' });

  const handleLogout = () => {
    navigate('/portal');
  };

  const handlePinChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPinMessage(null);

    if (pinCurrentInput !== transactionPin) {
      setPinMessage({ type: 'error', text: 'Incorrect current Transaction PIN. Verification failed.' });
      return;
    }

    if (!/^\d{4,6}$/.test(pinNewInput)) {
      setPinMessage({ type: 'error', text: 'PIN must be between 4 and 6 numeric digits only.' });
      return;
    }

    if (pinNewInput !== pinConfirmInput) {
      setPinMessage({ type: 'error', text: 'New PIN and Confirm PIN fields do not match.' });
      return;
    }

    setTransactionPin(pinNewInput);
    setPinCurrentInput('');
    setPinNewInput('');
    setPinConfirmInput('');
    setPinMessage({ type: 'success', text: 'Your 256-bit encrypted Transaction PIN has been updated successfully.' });
  };

  const handleWithdrawalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawalState({ status: 'idle' });

    const amount = parseFloat(withdrawalAmount);
    if (isNaN(amount) || amount <= 0) {
      setWithdrawalState({ status: 'error', message: 'Please enter a valid positive withdrawal amount.' });
      return;
    }

    // Limit checks based on simulated records
    const maxBalances = {
      ss: 450000,
      ia: 1200000,
      cp: 150000,
      mca: 300000,
    };
    const maxBalance = maxBalances[withdrawalAccount as keyof typeof maxBalances] || 0;
    if (amount > maxBalance) {
      setWithdrawalState({ 
        status: 'error', 
        message: `Authentication Cancelled: Insufficient fund limit. Chosen category only contains ₦${maxBalance.toLocaleString()}.` 
      });
      return;
    }

    // Verify Transaction PIN
    if (withdrawalPin !== transactionPin) {
      setWithdrawalState({ 
        status: 'error', 
        message: 'Fraud Mitigation Alert: Transaction authorization failed. The transaction PIN is incorrect.' 
      });
      return;
    }

    // Process secure withdrawal action
    setWithdrawalState({ status: 'loading' });
    setTimeout(() => {
      setWithdrawalState({ 
        status: 'success', 
        message: `Secured Transaction Completed. ₦${amount.toLocaleString()} will be dispatched to your linked payout card. Ref tracker: ZMC-TX-${Math.floor(100000 + Math.random() * 900000)}.` 
      });
      // Clear forms
      setWithdrawalAmount('');
      setWithdrawalReason('');
      setWithdrawalPin('');
    }, 1500);
  };

  const transactions = [
    { id: 1, date: 'Mar 25, 2026', description: 'Monthly Contribution (OS)', amount: '₦50,000.00', account: 'Ordinary Savings', type: 'credit' },
    { id: 2, date: 'Mar 22, 2026', description: 'Loan Repayment', amount: '₦120,000.00', account: 'Ordinary Savings', type: 'debit' },
    { id: 3, date: 'Mar 15, 2026', description: 'Special Savings Deposit', amount: '₦25,000.00', account: 'Special Savings', type: 'credit' },
    { id: 4, date: 'Mar 10, 2026', description: 'Investment Dividend', amount: '₦15,000.00', account: 'Investment Account', type: 'credit' },
    { id: 5, date: 'Mar 05, 2026', description: 'Commodity Purchase', amount: '₦45,000.00', account: 'Commodity Account', type: 'debit' },
  ];

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="relative min-h-[calc(100vh-160px)]"
          >
            {/* Asymmetric Background Pattern */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 asymmetric-bg -z-10 pointer-events-none"></div>
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

            {/* Header Section */}
            <div className="max-w-3xl mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary font-label text-xs font-bold uppercase tracking-wider mb-6">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                Secure Member Access
              </div>
              <h1 className="font-headline text-4xl md:text-5xl font-extrabold text-primary tracking-tight mb-4">
                Welcome Back, John!
              </h1>
              <p className="font-body text-on-surface-variant text-lg leading-relaxed">
                Manage your savings, track your investments, and explore loan opportunities. Your financial security is our top priority.
              </p>
            </div>

            {/* Real-time KYC Compliance Alert Banner */}
            <div className={`mb-12 p-6 rounded-[2rem] border transition-all flex flex-col md:flex-row items-center justify-between gap-6 ${
              kycStatus === 'verified' ? 'bg-emerald-50 border-emerald-500/10 text-emerald-800' :
              kycStatus === 'failed' ? 'bg-rose-50 border-rose-500/10 text-rose-850 text-rose-800' :
              kycStatus === 'submitted' ? 'bg-amber-50 border-amber-500/10 text-amber-900' :
              'bg-gradient-to-r from-emerald-900 to-slate-900 text-white border-transparent'
            }`}>
              <div className="flex items-start gap-4">
                <div className={`p-3.5 rounded-2xl shrink-0 mt-0.5 ${
                  kycStatus === 'verified' ? 'bg-emerald-500/10 text-emerald-700' :
                  kycStatus === 'failed' ? 'bg-rose-500/10 text-rose-750 text-rose-700' :
                  kycStatus === 'submitted' ? 'bg-amber-500/10 text-amber-700' :
                  'bg-white/10 text-emerald-400'
                }`}>
                  {kycStatus === 'verified' ? <CheckCircle2 className="w-5 h-5 animate-pulse" /> :
                   kycStatus === 'failed' ? <AlertTriangle className="w-5 h-5 animate-bounce" /> :
                   kycStatus === 'submitted' ? <Clock className="w-5 h-5" /> :
                   <Shield className="w-5 h-5" />}
                </div>
                <div className="space-y-1">
                  <h4 className="font-headline font-bold text-base">
                    {kycStatus === 'verified' ? 'Sovereign ID Verified Compliant' :
                     kycStatus === 'failed' ? 'Biometric Identity Warning Flags' :
                     kycStatus === 'submitted' ? 'Verification Audit Registry Search Pending' :
                     'Verified Member Onboarding (KYC)'}
                  </h4>
                  <p className={`text-xs leading-relaxed max-w-2xl ${
                    kycStatus === 'verified' || kycStatus === 'failed' || kycStatus === 'submitted' ? 'text-slate-600' : 'text-slate-300'
                  }`}>
                    {kycStatus === 'verified' ? 'Congratulations! All compliance blocks are active. Transaction authorizations, maximum zero-interest borrowing capabilities, and surplus dividends are fully unrestricted.' :
                     kycStatus === 'failed' ? 'Forensic registry scans detected document glare or biometric discrepancy markers. Please check the auditor note and submit an appeal.' :
                     kycStatus === 'submitted' ? 'Biometric hashes and address records have been dispatched. Compliance desk analysts are manually audits files against governmental NIN infrastructure.' :
                     'To block identity theft, member impersonation, and safeguard zero-interest cooperative funds, please complete your biological and physical credential verification.'}
                  </p>
                </div>
              </div>

              <div className="shrink-0 w-full md:w-auto">
                <button
                  onClick={() => setActiveView('kyc')}
                  className={`w-full md:w-auto px-5 py-3 rounded-xl text-xs font-black transition-all ${
                    kycStatus === 'verified' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' :
                    kycStatus === 'failed' ? 'bg-rose-600 hover:bg-rose-750 text-white shadow-lg shadow-rose-900/10' :
                    kycStatus === 'submitted' ? 'bg-amber-500 hover:bg-amber-600 text-white' :
                    'bg-white hover:bg-slate-100 text-emerald-950 shadow-md shadow-black/10'
                  }`}
                >
                  {kycStatus === 'verified' ? 'Review compliance tags' :
                   kycStatus === 'failed' ? 'Appeal & re-upload' :
                   kycStatus === 'submitted' ? 'Track validation stepper' :
                   'Start Verification'}
                </button>
              </div>
            </div>

            {/* Account Summary Cards (Bento Style) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
              <AccountCard index={0} id="member-os-balance" label="Ordinary Savings (OS)" balance="₦2,450,000" status="Active" icon="account_balance_wallet" color="primary" onClick={() => setActiveView('os')} />
              <AccountCard index={1} id="member-ss-balance" label="Special Savings (SS)" balance="₦450,000" status="Active" icon="savings" color="secondary" onClick={() => setActiveView('ss')} />
              <AccountCard index={2} id="member-ia-balance" label="Investment Account (IA)" balance="₦1,200,000" status="Active" icon="trending_up" color="tertiary" onClick={() => setActiveView('ia')} />
              <AccountCard index={3} id="member-cp-balance" label="Commodity Account (CP)" balance="₦150,000" status="Active" icon="shopping_cart" color="primary" onClick={() => setActiveView('cp')} />
              <AccountCard index={4} id="member-mca-balance" label="Muslim Community (MCA)" balance="₦300,000" status="Active" icon="mosque" color="secondary" onClick={() => setActiveView('mca')} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Recent Transactions (Glass Panel) */}
              <div className="lg:col-span-2 glass-panel bg-surface-container-lowest rounded-[2rem] p-8 shadow-[0_20px_40px_rgba(25,28,29,0.04)] border border-white/40">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="font-headline text-2xl font-bold text-primary">Last 5 Transactions</h2>
                  <button className="text-primary text-sm font-bold hover:underline">View All Statement</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-outline-variant/30">
                        <th className="pb-4 font-bold text-on-surface-variant text-xs uppercase tracking-widest">Date</th>
                        <th className="pb-4 font-bold text-on-surface-variant text-xs uppercase tracking-widest">Description</th>
                        <th className="pb-4 font-bold text-on-surface-variant text-xs uppercase tracking-widest text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container-low">
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="group hover:bg-surface-container-low/50 transition-colors">
                          <td className="py-4 text-sm font-medium text-on-surface-variant">{tx.date}</td>
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.type === 'credit' ? 'bg-primary/10 text-primary' : 'bg-error/10 text-error'}`}>
                                <span className="material-symbols-outlined text-lg">
                                  {tx.type === 'credit' ? 'arrow_upward' : 'arrow_downward'}
                                </span>
                              </div>
                              <span className="text-sm font-bold text-on-surface">{tx.description}</span>
                            </div>
                          </td>
                          <td className={`py-4 text-sm font-black text-right ${tx.type === 'credit' ? 'text-primary' : 'text-error'}`}>
                            {tx.amount}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Loan Eligibility Gauge (Glass Panel) */}
              <div className="glass-panel bg-surface-container-lowest rounded-[2rem] p-8 shadow-[0_20px_40px_rgba(25,28,29,0.04)] border border-white/40 flex flex-col">
                <h2 className="font-headline text-xl font-bold text-primary mb-8">Loan Eligibility (2x OS)</h2>
                <div className="flex-grow flex flex-col items-center justify-center py-6">
                  <div className="relative w-40 h-40 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                      <circle className="text-surface-container-high" strokeWidth="10" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
                      <motion.circle initial={{ strokeDashoffset: 251 }} animate={{ strokeDashoffset: 251 - (251 * 0.65) }} transition={{ duration: 1.5, ease: "easeOut" }} className="text-primary" strokeWidth="10" strokeDasharray="251" strokeLinecap="round" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-black text-on-surface">65%</span>
                    </div>
                  </div>
                  <div className="mt-8 w-full space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Max Loan</span>
                      <span className="text-sm font-black text-primary">₦4,900,000</span>
                    </div>
                    <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: '65%' }} transition={{ duration: 1.5 }} className="h-full bg-primary" />
                    </div>
                  </div>
                </div>
                <button onClick={() => setActiveView('loans')} className="mt-6 w-full py-4 px-6 bg-primary text-on-primary rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-primary-container transition-colors shadow-lg shadow-primary/20 active:scale-95 duration-150">
                  Apply Now
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
              </div>
            </div>

            {/* Trust Badge */}
            <div className="mt-20 flex flex-col items-center gap-4">
              <div className="flex items-center gap-3 bg-surface-container-high/50 backdrop-blur-sm px-5 py-2.5 rounded-full border border-outline-variant/20">
                <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
                <span className="font-label text-sm font-semibold text-primary">Securely Encrypted by Zimco-Tech</span>
              </div>
              <p className="font-body text-xs text-on-surface-variant/60 tracking-wide">
                AES-256 Bit Encryption Active • Environment: Production-Mainframe
              </p>
            </div>
          </motion.div>
        );
      case 'os':
      case 'ss':
      case 'ia':
      case 'cp':
      case 'mca':
        const accountData = {
          os: { title: 'Ordinary Savings', color: 'emerald', balance: '₦2,450,000', id: 'os-balance' },
          ss: { title: 'Special Savings', color: 'blue', balance: '₦450,000', id: 'ss-balance' },
          ia: { title: 'Investment Account', color: 'amber', balance: '₦1,200,000', id: 'ia-balance' },
          cp: { title: 'Commodity Purchase', color: 'indigo', balance: '₦150,000', id: 'cp-balance' },
          mca: { title: 'Muslim Community Account', color: 'green', balance: '₦300,000', id: 'mca-balance' },
        }[activeView as 'os' | 'ss' | 'ia' | 'cp' | 'mca'];

        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-8">
              <div className={`p-10 rounded-[3rem] ${
                activeView === 'os' ? 'bg-emerald-900' :
                activeView === 'ss' ? 'bg-slate-900' :
                activeView === 'ia' ? 'bg-amber-900' :
                activeView === 'mca' ? 'bg-emerald-800' :
                'bg-slate-900'
              } text-white shadow-2xl relative overflow-hidden`}>
                <div className="relative z-10">
                  <p className="text-white/60 font-bold uppercase tracking-[0.2em] text-xs mb-4">{accountData.title}</p>
                  <h2 id={accountData.id} className="text-5xl font-black mb-8 tracking-tighter">{accountData.balance}</h2>
                  <div className="flex gap-6">
                    <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md px-6 py-3 rounded-2xl font-bold text-sm transition-all border border-white/10">Deposit Funds</button>
                    {activeView !== 'os' && (
                      <button className="bg-white text-slate-900 px-6 py-3 rounded-2xl font-bold text-sm hover:bg-slate-100 transition-all">Withdraw</button>
                    )}
                  </div>
                </div>
                <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
              </div>

              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
                <h3 className="font-headline text-xl font-bold text-slate-900 mb-8">Detailed Statement</h3>
                {activeView === 'os' || activeView === 'ss' || activeView === 'ia' || activeView === 'cp' || activeView === 'mca' ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="pb-4 font-bold text-slate-400 text-xs uppercase tracking-widest">Date</th>
                          <th className="pb-4 font-bold text-slate-400 text-xs uppercase tracking-widest">Description</th>
                          <th className="pb-4 font-bold text-slate-400 text-xs uppercase tracking-widest">Amount</th>
                          <th className="pb-4 font-bold text-slate-400 text-xs uppercase tracking-widest text-right">Total Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {[1, 2, 3, 4, 5].map(i => {
                          const baseBalance = activeView === 'os' ? 2450000 : activeView === 'ss' ? 450000 : activeView === 'ia' ? 1200000 : activeView === 'cp' ? 150000 : 300000;
                          const amount = 50000;
                          const description = activeView === 'os' ? 'Monthly Contribution' : activeView === 'ss' ? 'Special Deposit' : activeView === 'ia' ? 'Investment Dividend' : activeView === 'cp' ? 'Commodity Installment' : 'Community Support';
                          return (
                            <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                              <td className="py-4 text-sm font-medium text-slate-500">Mar {25 - i}, 2026</td>
                              <td className="py-4">
                                <span className="text-sm font-bold text-slate-900">
                                  {description} #{i}
                                </span>
                              </td>
                              <td className="py-4 text-sm font-black text-emerald-600">+₦{amount.toLocaleString()}</td>
                              <td className="py-4 text-sm font-black text-slate-900 text-right">
                                ₦{(baseBalance - (i - 1) * amount).toLocaleString()}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="flex items-center justify-between p-5 rounded-3xl bg-slate-50 hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-400">
                            <Calendar size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">Contribution #{i}</p>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Mar {25 - i}, 2026</p>
                          </div>
                        </div>
                        <p className="font-black text-emerald-600">+₦50,000.00</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-8">
              {activeView !== 'os' && (
                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
                  <h3 className="font-headline text-lg font-bold text-slate-900 mb-6">Account Insights</h3>
                  <div className="space-y-6">
                    {activeView !== 'ss' && activeView !== 'ia' && activeView !== 'cp' && activeView !== 'mca' && (
                      <div className="p-4 rounded-2xl bg-slate-50">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Interest Rate</p>
                        <p className="text-xl font-black text-emerald-600">4.5% p.a.</p>
                      </div>
                    )}
                    <div className="p-4 rounded-2xl bg-slate-50">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Earned</p>
                      <p className="text-xl font-black text-emerald-600">₦12,450.00</p>
                    </div>
                  </div>
                </div>
              )}
              <div className="bg-slate-900 rounded-[2rem] p-8 text-white">
                <h3 className="font-headline text-lg font-bold mb-4">Need Help?</h3>
                <p className="text-white/60 text-sm mb-6 leading-relaxed">Contact your account officer for specialized investment advice.</p>
                <button className="w-full py-4 bg-white text-slate-900 rounded-full font-bold text-sm">Chat with Support</button>
              </div>
            </div>
          </motion.div>
        );
      case 'loans':
        return (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-10">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="font-headline text-3xl font-black text-slate-900 mb-2">My Loans</h2>
                <p className="text-slate-500 font-medium">Manage your active applications and repayment schedules.</p>
              </div>
              <button className="bg-emerald-600 text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all">New Loan Application</button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <CreditCard size={28} />
                      </div>
                      <div>
                        <h4 className="font-bold text-xl text-slate-900">Personal Development Loan</h4>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">ID: LN-2026-044</p>
                      </div>
                    </div>
                    <span className="px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest">Active</span>
                  </div>
                  <div className="grid grid-cols-3 gap-8 mb-8">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Loan Amount</p>
                      <p className="text-lg font-black text-slate-900">₦1,200,000</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Outstanding</p>
                      <p className="text-lg font-black text-rose-600">₦840,000</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Next Due</p>
                      <p className="text-lg font-black text-slate-900">Apr 15, 2026</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <span>Repayment Progress</span>
                      <span>30% Completed</span>
                    </div>
                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 w-[30%]"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
                  <h3 className="font-headline text-xl font-bold text-slate-900 mb-6">Guarantor Requests</h3>
                  <div className="space-y-4">
                    <div className="p-5 rounded-3xl bg-amber-50 border border-amber-100">
                      <p className="text-sm font-bold text-amber-900 mb-1">Pending Request</p>
                      <p className="text-xs text-amber-700/70 mb-4">Sarah Johnson requested you as a guarantor for her Commodity Loan.</p>
                      <div className="flex gap-2">
                        <button className="flex-1 py-2 bg-amber-900 text-white rounded-xl text-xs font-bold">Approve</button>
                        <button className="flex-1 py-2 bg-white text-amber-900 rounded-xl text-xs font-bold border border-amber-200">Decline</button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <FileText size={20} />
                    </div>
                    <h3 className="font-headline text-xl font-bold text-slate-900">Eligibility Analysis</h3>
                  </div>
                  <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                    Upload your latest payslip to instantly analyze your eligibility for higher loan limits.
                  </p>
                  
                  <div className="border-2 border-dashed border-slate-100 rounded-[2rem] p-8 text-center hover:border-emerald-200 transition-colors group cursor-pointer">
                    <input type="file" id="payslip-upload" className="hidden" accept=".pdf,.docx" />
                    <label htmlFor="payslip-upload" className="cursor-pointer">
                      <div className="w-16 h-16 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                        <Upload size={28} />
                      </div>
                      <p className="text-sm font-bold text-slate-900 mb-1">Click to upload payslip</p>
                      <p className="text-xs text-slate-400">PDF or DOCX (Max 5MB)</p>
                    </label>
                  </div>

                  <button className="w-full mt-6 py-4 bg-slate-900 text-white rounded-full font-bold text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                    Analyze Eligibility
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        );
      case 'withdrawal':
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
            <div className="bg-white rounded-[3rem] p-12 shadow-sm border border-slate-100">
              <h2 className="font-headline text-3xl font-black text-slate-900 mb-4">Request Withdrawal</h2>
              <p className="text-slate-500 mb-10">Initiate a secure funds transfer from your member cooperative balances. All actions are audited.</p>
              
              <form onSubmit={handleWithdrawalSubmit} className="space-y-10">
                {/* Result Feedback Banner */}
                {withdrawalState.status === 'success' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-start gap-4"
                  >
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-base text-emerald-950">Security Check Passed</h4>
                      <p className="text-sm mt-1 text-emerald-800">{withdrawalState.message}</p>
                      <p className="text-xs text-emerald-600/70 mt-2 font-mono uppercase tracking-wider">Device ID validated • Signature Token: HW-PIN-PASS</p>
                    </div>
                  </motion.div>
                )}

                {withdrawalState.status === 'error' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 flex items-start gap-4 animate-shake"
                  >
                    <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-base text-rose-950">Audit Fail / Fraud Mitigation Blocked</h4>
                      <p className="text-sm mt-1 text-rose-800">{withdrawalState.message}</p>
                    </div>
                  </motion.div>
                )}

                <section>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Withdrawal Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 ml-1">Select Account</label>
                      <select 
                        value={withdrawalAccount}
                        onChange={(e) => setWithdrawalAccount(e.target.value)}
                        className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-emerald-500/20 outline-none font-bold appearance-none cursor-pointer"
                      >
                        <option value="ss">Special Savings (SS) - ₦450,000</option>
                        <option value="ia">Investment Account (IA) - ₦1,200,000</option>
                        <option value="cp">Commodity Purchase (CP) - ₦150,000</option>
                        <option value="mca">Muslim Community Account (MCA) - ₦300,000</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 ml-1">Amount to Withdraw</label>
                      <div className="relative">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 font-bold text-slate-400">₦</span>
                        <input 
                          type="number" 
                          placeholder="0.00" 
                          value={withdrawalAmount}
                          onChange={(e) => setWithdrawalAmount(e.target.value)}
                          className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-6 focus:ring-2 focus:ring-emerald-500/20 outline-none font-bold" 
                          required
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-xs font-bold text-slate-500 ml-1">Reason for Withdrawal (Optional)</label>
                      <textarea 
                        rows={3} 
                        value={withdrawalReason}
                        onChange={(e) => setWithdrawalReason(e.target.value)}
                        className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-emerald-500/20 outline-none font-bold resize-none" 
                        placeholder="State purpose of this transaction..."
                      />
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Security Verification</h3>
                  <div className="p-8 rounded-[2rem] bg-emerald-50/50 border border-emerald-500/10 hover:border-emerald-500/20 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center">
                          <Shield className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-emerald-950">256-Bit Hardware PIN Shield</p>
                          <p className="text-xs text-slate-500">Must accompany any action authorizing shifts or payout dispatches.</p>
                        </div>
                      </div>
                      <div className="text-xs px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold self-start sm:self-auto font-mono">
                        Active PIN Required
                      </div>
                    </div>

                    <div className="max-w-xs space-y-2">
                      <label className="text-xs font-bold text-slate-500 ml-1">Your 4-to-6 Digit Transaction PIN</label>
                      <div className="relative">
                        <input 
                          type={showPin ? "text" : "password"} 
                          placeholder="••••" 
                          maxLength={6}
                          value={withdrawalPin}
                          onChange={(e) => setWithdrawalPin(e.target.value.replace(/\D/g, ''))}
                          className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-emerald-500/20 outline-none font-bold text-center tracking-[1em] focus:border-emerald-400 text-lg" 
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPin(!showPin)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                        >
                          {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </section>

                <div className="pt-10 border-t border-slate-100 flex justify-end gap-4">
                  <button 
                    type="button" 
                    onClick={() => {
                      setWithdrawalAmount('');
                      setWithdrawalReason('');
                      setWithdrawalPin('');
                      setWithdrawalState({ status: 'idle' });
                    }}
                    className="px-8 py-4 rounded-full font-bold text-sm text-slate-500 hover:bg-slate-50 transition-all"
                  >
                    Clear Form
                  </button>
                  <button 
                    type="submit" 
                    disabled={withdrawalState.status === 'loading'}
                    className="px-8 py-4 bg-emerald-900 text-white rounded-full font-bold text-sm shadow-lg shadow-emerald-900/20 hover:bg-emerald-800 transition-all flex items-center gap-2 disabled:bg-slate-300 disabled:shadow-none min-w-[160px] justify-center"
                  >
                    {withdrawalState.status === 'loading' ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Verifying PIN...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Authorization</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            <div className="mt-8 p-6 bg-amber-50 rounded-[2rem] border border-amber-100 flex gap-4">
              <span className="material-symbols-outlined text-amber-600">info</span>
              <p className="text-sm text-amber-800 leading-relaxed">
                <span className="font-bold">Security Compliance Note:</span> Transacting with ZIMCO relies on custom single-session signatures. Do not share your PIN with customer service reps, account managers, or admin boards. ZIMCO will never prompt you under plain-text headers.
              </p>
            </div>
          </motion.div>
        );
      case 'settings':
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-10">
            {/* Upper Grid: Profile info, 2FA, and Transaction PIN */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Left Column: Personal Information & 2FA */}
              <div className="space-y-10">
                {/* Personal Information Group */}
                <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-100">
                  <div className="flex items-center gap-3 mb-6">
                    <User className="text-emerald-700 w-6 h-6" />
                    <h3 className="font-headline text-xl font-bold text-slate-900">Personal Profile</h3>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Member ID</label>
                      <div className="bg-slate-50 text-slate-700 rounded-2xl py-3 px-5 font-mono text-sm font-semibold border border-slate-100">
                        ZIMCO-MEM-2026-9812
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 ml-1">Full Name</label>
                        <input type="text" defaultValue="John Doe" className="w-full bg-slate-50 border border-transparent focus:border-emerald-500 rounded-2xl py-3.5 px-5 outline-none font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/10 text-sm transition-all" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 ml-1">Phone Number</label>
                        <input type="text" defaultValue="+234 812 345 6789" className="w-full bg-slate-50 border border-transparent focus:border-emerald-500 rounded-2xl py-3.5 px-5 outline-none font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/10 text-sm transition-all" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 ml-1">Email Address</label>
                      <input type="email" defaultValue="john.doe@zimmercoop.com" className="w-full bg-slate-50 border border-transparent focus:border-emerald-500 rounded-2xl py-3.5 px-5 outline-none font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/10 text-sm transition-all" />
                    </div>
                    <button className="px-6 py-3.5 bg-emerald-950 text-white rounded-xl text-xs font-black self-start hover:bg-emerald-800 transition-colors">
                      Save Profile Changes
                    </button>
                  </div>
                </div>

                {/* 2FA Card */}
                <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-100">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <Smartphone className="text-emerald-700 w-6 h-6" />
                      <h3 className="font-headline text-xl font-bold text-slate-900">Multi-Factor Login</h3>
                    </div>
                    <span className="text-[10px] px-2.5 py-1 bg-amber-100 text-amber-800 font-bold uppercase tracking-widest rounded-full">
                      Highly Recommended
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                    Protect your login sessions and portfolio balances by generating unique token prompts on your personal authenticator device before any web session initialization.
                  </p>
                  <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-amber-950 text-sm">Two-Factor Authentication (2FA)</p>
                      <p className="text-xs text-amber-800/80 mt-1">Currently disabled for john.doe@zimmercoop.com</p>
                    </div>
                    <button className="bg-emerald-900 text-white px-6 py-3 rounded-full font-bold text-xs hover:bg-emerald-800 transition-colors shrink-0">
                      Setup authenticator
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Transaction PIN Management */}
              <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-100 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Lock className="text-emerald-700 w-6 h-6" />
                    <h3 className="font-headline text-xl font-bold text-slate-900">Transaction PIN</h3>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Protected
                  </span>
                </div>
                <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                  Establish or update your 4-to-6 digit numeric Transaction PIN. This secret key binds securely to hardware sessions and must authorize all withdrawals, deposit shifts, and commodity purchases.
                </p>

                {/* Feedback Panel */}
                {pinMessage && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className={`p-4 rounded-xl mb-6 text-sm font-semibold flex items-start gap-2.5 ${
                      pinMessage.type === 'success' 
                        ? 'bg-emerald-55 bg-emerald-50 border border-emerald-200 text-emerald-950' 
                        : 'bg-rose-50 border border-rose-200 text-rose-950'
                    }`}
                  >
                    {pinMessage.type === 'success' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <span>{pinMessage.text}</span>
                  </motion.div>
                )}

                <form onSubmit={handlePinChangeSubmit} className="space-y-6 flex-grow flex flex-col justify-between">
                  <div className="space-y-5">
                    {/* Current PIN field */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-500 ml-1">
                        <label>Current PIN</label>
                        <span className="text-[10px] text-slate-400">Preconfigured PIN is "1234"</span>
                      </div>
                      <div className="relative">
                        <input 
                          type={showPin ? "text" : "password"} 
                          placeholder="••••" 
                          maxLength={6}
                          value={pinCurrentInput}
                          onChange={(e) => setPinCurrentInput(e.target.value.replace(/\D/g, ''))}
                          className="w-full bg-slate-50 border border-slate-100 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 rounded-2xl py-3.5 px-5 outline-none font-bold text-slate-800 tracking-widest" 
                          required
                        />
                      </div>
                    </div>

                    {/* New PIN & Confirm New PIN Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 ml-1">New PIN (4-6 digits)</label>
                        <input 
                          type={showPin ? "text" : "password"} 
                          placeholder="••••" 
                          maxLength={6}
                          value={pinNewInput}
                          onChange={(e) => setPinNewInput(e.target.value.replace(/\D/g, ''))}
                          className="w-full bg-slate-50 border border-slate-100 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 rounded-2xl py-3.5 px-5 outline-none font-bold text-slate-800 tracking-widest" 
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 ml-1">Confirm New PIN</label>
                        <input 
                          type={showPin ? "text" : "password"} 
                          placeholder="••••" 
                          maxLength={6}
                          value={pinConfirmInput}
                          onChange={(e) => setPinConfirmInput(e.target.value.replace(/\D/g, ''))}
                          className="w-full bg-slate-50 border border-slate-100 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 rounded-2xl py-3.5 px-5 outline-none font-bold text-slate-800 tracking-widest" 
                          required
                        />
                      </div>
                    </div>

                    {/* Show/Hide PIN toggle button */}
                    <button 
                      type="button" 
                      onClick={() => setShowPin(!showPin)}
                      className="text-xs font-bold text-slate-500 hover:text-emerald-700 transition-colors flex items-center gap-2 mt-2 ml-1"
                    >
                      {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                      {showPin ? "Mask PIN Display" : "Reveal PIN Values"}
                    </button>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full mt-8 py-4 bg-emerald-900 text-white rounded-2xl font-bold text-sm shadow-md hover:bg-emerald-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <Key className="w-4 h-4" />
                    <span>Apply Secure Transaction PIN</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Session Timeout Settings Card */}
            <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-sm border border-slate-100 space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <Clock className="text-emerald-700 w-6 h-6" />
                    <h3 className="font-headline text-2xl font-black text-slate-900">Inactivity Session Security Sentinel</h3>
                  </div>
                  <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                    Prevent hijacking, unauthorized access, and local shoulder surfing. Configure your automatic log-out inactivity window. 
                    A secure modal display will warn you <span className="font-bold text-slate-850 text-slate-800">65 seconds</span> prior to tearing down your authenticated state.
                  </p>
                </div>
                <span className="text-[10px] px-2.5 py-1 bg-emerald-50 text-emerald-800 font-extrabold uppercase tracking-widest rounded-full border border-emerald-100 self-start sm:self-auto shrink-0">
                  SECURE AUTO-LOCK
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { label: "1 Minute", secs: 60, desc: "Instant Warning Test" },
                  { label: "3 Minutes", secs: 180, desc: "Secure Co-Op Default" },
                  { label: "5 Minutes", secs: 300, desc: "Standard Balance" },
                  { label: "10 Minutes", secs: 600, desc: "Extended Window" },
                  { label: "15 Minutes", secs: 900, desc: "High Trust Access" }
                ].map((opt) => {
                  const isActive = sessionTimeoutDuration === opt.secs;
                  return (
                    <button
                      key={opt.secs}
                      type="button"
                      onClick={() => handleSessionTimeoutChange(opt.secs)}
                      className={`p-6 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between h-32 ${
                        isActive
                          ? 'border-emerald-600 bg-emerald-50/15 ring-2 ring-emerald-500/10'
                          : 'border-slate-150 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-350'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute top-3 right-3 w-5 h-5 bg-emerald-700 rounded-full flex items-center justify-center text-white">
                          <Check size={12} />
                        </div>
                      )}
                      
                      <div>
                        <span className={`block font-extrabold text-base ${isActive ? 'text-emerald-950 font-black' : 'text-slate-800'}`}>
                          {opt.label}
                        </span>
                        <span className="block text-[10px] font-mono text-slate-400 mt-0.5">
                          {opt.secs} seconds inactive
                        </span>
                      </div>

                      <span className={`block text-[10px] font-semibold mt-4 line-clamp-1 ${isActive ? 'text-emerald-700' : 'text-slate-500'}`}>
                        {opt.desc}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150/50 flex items-center gap-3 text-xs text-slate-500 leading-relaxed">
                <Shield className="text-emerald-700 shrink-0 w-5 h-5" />
                <span>
                  <span className="font-extrabold text-slate-800">Adaptive Activity Daemon active:</span> Any keystroke, mouse click, coordinate movement, viewport scroll, or screen touch in the applet area automatically pushes back the inactivity safety window.
                </span>
              </div>
            </div>

            {/* Bottom Row: Device & Session Audit Ledger */}
            <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-sm border border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 border-b border-slate-100 pb-8">
                <div>
                  <div className="flex items-center gap-3">
                    <Globe className="text-emerald-700 w-6 h-6" />
                    <h3 className="font-headline text-2xl font-black text-slate-900">Device & Session Audit Ledger</h3>
                  </div>
                  <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                    Verify and manage active sessions representing your cryptographic identity. Revoked sessions instantly invalidate associated security cookies.
                  </p>
                </div>

                <button 
                  onClick={handleRevokeAllOtherSessions}
                  className="px-6 py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-full font-bold text-xs border border-rose-100 transition-colors flex items-center gap-2 self-start sm:self-auto shrink-0"
                >
                  <Power className="w-4 h-4" />
                  Terminated All Other Sessions
                </button>
              </div>

              {/* Sessions ledger container */}
              <div className="space-y-4">
                {sessions.map((sess) => {
                  const isRevoked = sess.status === 'revoked';
                  return (
                    <motion.div 
                      key={sess.id}
                      className={`p-6 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                        isRevoked 
                          ? 'bg-slate-50/50 border-slate-100 opacity-60 line-through' 
                          : sess.isCurrent 
                            ? 'bg-emerald-50/20 border-emerald-600/15' 
                            : 'bg-slate-50 border-slate-150 border-slate-200/50 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Device icon indicator */}
                        <div className={`p-3.5 rounded-xl border ${
                          isRevoked 
                            ? 'bg-slate-100 border-slate-200 text-slate-400' 
                            : sess.isCurrent 
                              ? 'bg-emerald-100/40 border-emerald-200/50 text-emerald-700' 
                              : 'bg-indigo-100/40 border-indigo-200/50 text-indigo-700'
                        }`}>
                          {sess.device.includes('iPhone') || sess.device.includes('Samsung') ? (
                            <Smartphone className="w-5 h-5" />
                          ) : (
                            <Laptop className="w-5 h-5" />
                          )}
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-slate-900 text-base">{sess.device}</span>
                            <span className="text-xs px-2.5 py-0.5 bg-slate-200/60 text-slate-600 font-semibold rounded-full font-mono">
                              {sess.browser} • {sess.os}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2 font-mono">
                            <span className="flex items-center gap-1">
                              <Globe className="w-3.5 h-3.5" />
                              IP: {sess.ip}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span>Region: {sess.location}</span>
                            <span className="text-slate-300">•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              Timestamp: {sess.timestamp}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center self-end md:self-auto">
                        {isRevoked ? (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 bg-slate-150 bg-slate-100 py-2 px-4 rounded-full">
                            <Trash2 className="w-3.5 h-3.5" />
                            Session Destroyed
                          </div>
                        ) : sess.isCurrent ? (
                          <div className="flex items-center gap-1.5 text-xs font-black text-emerald-800 bg-emerald-100 py-2 px-4 rounded-full font-mono">
                            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
                            Current Connection
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleRevokeSession(sess.id)}
                            className="bg-white hover:bg-rose-50 text-rose-700 border border-slate-200 hover:border-rose-200 py-2 px-4 rounded-full font-bold text-xs transition-colors flex items-center gap-1.5"
                          >
                            <Power className="w-3.5 h-3.5" />
                            Revoke Connection
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
            
            {/* Disclaimer & Fraud Warning lines */}
            <div className="p-6 bg-slate-900 text-white/80 rounded-[2rem] flex items-start gap-4">
              <ShieldAlert className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1.5 leading-relaxed">
                <p className="font-bold text-white uppercase tracking-wider text-[10px]">Secure Core Framework Active</p>
                <p>
                  Security audits of logs, browser cookie parameters, useragents, and physical access profiles are routinely collected across regional terminals. Cooperatives operate strictly under anti-fraud frameworks. Unauthorized connections are reported to ZIMCO security intelligence centers instantly.
                </p>
              </div>
            </div>
          </motion.div>
        );
      case 'planning':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="space-y-8"
          >
            <WealthPlanningTool />
          </motion.div>
        );
      case 'kyc':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="space-y-8"
          >
            <KYCOnboarding />
          </motion.div>
        );
      case 'helpdesk':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="space-y-8"
          >
            <MemberHelpdesk />
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-body text-slate-900 flex relative">
      <SessionTimeoutListener onLogout={handleLogout} />
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar (Left) */}
      <aside className={`
        fixed inset-y-0 left-0 w-72 bg-white border-r border-slate-200 z-[70] flex flex-col transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={zimcoLogo} alt="ZIMCO Logo" className="w-10 h-10 rounded-full object-cover shadow-md ring-2 ring-emerald-500/20" referrerPolicy="no-referrer" />
            <span className="font-headline text-xl font-black tracking-tight text-emerald-900">ZIMCO</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 text-slate-400 hover:text-emerald-600 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <nav className="flex-grow px-4 space-y-2 overflow-y-auto">
          <SidebarLink 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
            active={activeView === 'dashboard'} 
            onClick={() => {
              setActiveView('dashboard');
              setIsSidebarOpen(false);
            }}
          />
          
          <div className="space-y-1">
            <button 
              onClick={() => setIsSavingsOpen(!isSavingsOpen)}
              className="w-full flex items-center justify-between px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-emerald-700 rounded-xl transition-all group"
            >
              <div className="flex items-center gap-3">
                <Wallet size={20} className="group-hover:text-emerald-600" />
                <span className="font-semibold text-sm">My Savings Accounts</span>
              </div>
              {isSavingsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            
            <AnimatePresence>
              {isSavingsOpen && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden pl-11 space-y-1"
                >
                  <SidebarSubLink id="os-balance" label="Ordinary Savings (OS)" active={activeView === 'os'} onClick={() => { setActiveView('os'); setIsSidebarOpen(false); }} />
                  <SidebarSubLink id="ss-balance" label="Special Savings (SS)" active={activeView === 'ss'} onClick={() => { setActiveView('ss'); setIsSidebarOpen(false); }} />
                  <SidebarSubLink id="ia-balance" label="Investment Account (IA)" active={activeView === 'ia'} onClick={() => { setActiveView('ia'); setIsSidebarOpen(false); }} />
                  <SidebarSubLink id="cp-balance" label="Commodity Purchase (CP)" active={activeView === 'cp'} onClick={() => { setActiveView('cp'); setIsSidebarOpen(false); }} />
                  <SidebarSubLink id="mca-balance" label="Muslim Community Account" active={activeView === 'mca'} onClick={() => { setActiveView('mca'); setIsSidebarOpen(false); }} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <SidebarLink 
            icon={<ArrowDownToLine size={20} />} 
            label="Withdrawal" 
            active={activeView === 'withdrawal'} 
            onClick={() => {
              setActiveView('withdrawal');
              setIsSidebarOpen(false);
            }}
          />

          <SidebarLink 
            icon={<CreditCard size={20} />} 
            label="My Loans" 
            active={activeView === 'loans'} 
            onClick={() => {
              setActiveView('loans');
              setIsSidebarOpen(false);
            }}
          />

          <SidebarLink 
            icon={<TrendingUp size={20} />} 
            label="Wealth Planner" 
            active={activeView === 'planning'} 
            onClick={() => {
              setActiveView('planning');
              setIsSidebarOpen(false);
            }}
          />

          <SidebarLink 
            icon={<UserCheck size={20} />} 
            label="KYC Compliance" 
            active={activeView === 'kyc'} 
            onClick={() => {
              setActiveView('kyc');
              setIsSidebarOpen(false);
            }}
          />

          <SidebarLink 
            icon={<LifeBuoy size={20} />} 
            label="Helpdesk Support" 
            active={activeView === 'helpdesk'} 
            onClick={() => {
              setActiveView('helpdesk');
              setIsSidebarOpen(false);
            }}
          />

          <SidebarLink 
            icon={<Settings size={20} />} 
            label="Settings" 
            active={activeView === 'settings'} 
            onClick={() => {
              setActiveView('settings');
              setIsSidebarOpen(false);
            }}
          />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                <User size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">John Doe</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Member</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area (Right) */}
      <main className="flex-grow p-4 md:p-10 overflow-x-hidden">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center justify-between md:block">
            <div>
              <h1 className="font-headline text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
                {activeView === 'dashboard' ? 'Welcome Back, John!' : 
                 activeView === 'loans' ? 'Loan Management' :
                 activeView === 'settings' ? 'Account Settings' : 
                 activeView === 'withdrawal' ? 'Withdrawal Request' :
                 activeView === 'planning' ? 'Wealth Planning & Simulators' :
                 activeView === 'kyc' ? 'KYC Compliance & Verification' :
                 activeView === 'helpdesk' ? 'Escalated Ticket Helpdesk' :
                 'Account Details'}
              </h1>
              <p className="text-slate-500 font-medium hidden md:block">
                {activeView === 'dashboard' ? "Here's what's happening with your accounts today." : 
                 activeView === 'loans' ? "Review your borrowing status and applications." :
                 activeView === 'settings' ? "Manage your profile and security settings." :
                 activeView === 'withdrawal' ? "Request funds from your savings accounts." :
                 activeView === 'planning' ? "Ethical, zero-interest visual growth and simulator tools." :
                 activeView === 'kyc' ? "A secure, sovereign identity, biometric liveness, and residence audit workflow." :
                 activeView === 'helpdesk' ? "Escalation center for balance corrections and transaction bottleneck audits." :
                 "View your detailed financial performance."}
              </p>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-white border border-slate-200 rounded-full py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all w-64"
              />
            </div>
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-2.5 text-sm font-bold text-slate-600">
              <Calendar size={18} className="text-emerald-600" />
              <span>March 27, 2026</span>
            </div>
            <button className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {renderView()}
      </main>
    </div>
  );
}

function SidebarLink({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${
        active 
          ? 'bg-emerald-50 text-emerald-700 shadow-sm' 
          : 'text-slate-600 hover:bg-slate-50 hover:text-emerald-700'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function SidebarSubLink({ id, label, active = false, onClick }: { id: string, label: string, active?: boolean, onClick: () => void }) {
  return (
    <button 
      id={id}
      onClick={onClick}
      className={`w-full text-left py-2 text-xs font-bold transition-colors ${
        active ? 'text-emerald-600' : 'text-slate-400 hover:text-emerald-600'
      }`}
    >
      {label}
    </button>
  );
}

function AccountCard({ id, label, balance, status, icon, color, onClick, index = 0 }: { id: string, label: string, balance: string, status: string, icon: string, color: string, onClick: () => void, index?: number }) {
  const colorClasses: Record<string, string> = {
    primary: 'bg-primary-container/10 text-primary border-primary/20',
    secondary: 'bg-secondary-container/10 text-secondary border-secondary/20',
    tertiary: 'bg-tertiary-container/10 text-tertiary border-tertiary/20',
  };

  const dotClasses: Record<string, string> = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    tertiary: 'bg-tertiary',
  };

  return (
    <motion.button 
      onClick={onClick}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.65, 
        delay: index * 0.08, 
        ease: [0.16, 1, 0.3, 1] 
      }}
      className="glass-panel group relative flex flex-col bg-surface-container-lowest rounded-[2rem] p-8 shadow-[0_20px_40px_rgba(25,28,29,0.04)] border border-white/40 hover:shadow-[0_24px_48px_rgba(0,99,58,0.08)] transition-all duration-300 text-left"
    >
      <div className={`w-16 h-16 rounded-2xl ${colorClasses[color]} border flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300`}>
        <span className="material-symbols-outlined text-4xl">{icon}</span>
      </div>
      <p className="text-xs font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-2">{label}</p>
      <p id={id} className="font-headline text-2xl font-black text-primary mb-6">{balance}</p>
      <div className="flex items-center gap-2 mt-auto">
        <span className={`w-2 h-2 rounded-full ${dotClasses[color]} animate-pulse`}></span>
        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{status}</span>
      </div>
    </motion.button>
  );
}
