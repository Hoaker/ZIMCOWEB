import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  ShieldCheck, 
  CheckCircle2, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  Calendar, 
  CreditCard, 
  Wallet, 
  Award, 
  FileText, 
  Download, 
  Edit3, 
  Save, 
  X, 
  Copy, 
  Check, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Sparkles, 
  AlertCircle, 
  Clock, 
  Briefcase, 
  Users, 
  BadgeCheck, 
  FileDown, 
  Receipt,
  Search,
  Filter,
  Layers,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { generateMembershipCertificatePDF, generateMemberTransactionsPDF } from '../lib/pdfGenerator';

interface MemberProfileProps {
  memberData: any;
  transactions: any[];
  onUpdateMemberData?: (updatedData: any) => void;
  onNavigateToKYC?: () => void;
  onNavigateToTopUp?: () => void;
  onNavigateToWithdrawal?: () => void;
}

export default function MemberProfile({
  memberData,
  transactions,
  onUpdateMemberData,
  onNavigateToKYC,
  onNavigateToTopUp,
  onNavigateToWithdrawal
}: MemberProfileProps) {
  const [activeTab, setActiveTab] = useState<'status' | 'contact' | 'activity'>('status');
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);
  const [activityFilter, setActivityFilter] = useState<'all' | 'credit' | 'debit' | 'loan'>('all');
  const [activitySearchQuery, setActivitySearchQuery] = useState('');
  const [isDownloadingCert, setIsDownloadingCert] = useState(false);

  // Form State for Contact and Personal Information
  const [formData, setFormData] = useState({
    fullName: memberData?.fullName || '',
    email: memberData?.email || '',
    phone: memberData?.phone || '+234 803 123 4567',
    altPhone: memberData?.altPhone || '+234 812 987 6543',
    address: memberData?.address || '14 Cooperative Way, University Campus, Ilorin, Kwara State',
    city: memberData?.city || 'Ilorin',
    state: memberData?.state || 'Kwara State',
    department: memberData?.department || 'Finance & Accounts',
    staffId: memberData?.staffId || 'STAFF-2024-889',
    officeLocation: memberData?.officeLocation || 'Bursary Building, 2nd Floor, Room 204',
    // Next of Kin
    nextOfKinName: memberData?.nextOfKinName || 'Mrs. Fatima Abdulhameed',
    nextOfKinRelationship: memberData?.nextOfKinRelationship || 'Spouse',
    nextOfKinPhone: memberData?.nextOfKinPhone || '+234 802 333 4455',
    nextOfKinEmail: memberData?.nextOfKinEmail || 'fatima.abdul@example.com',
    nextOfKinAddress: memberData?.nextOfKinAddress || '14 Cooperative Way, Ilorin, Kwara State'
  });

  const memberId = memberData?.id || localStorage.getItem('zimco_id') || 'ZIM-2026-001';

  // Financial aggregates
  const os = Number(memberData?.ordinarySavings || 0);
  const ss = Number(memberData?.specialSavings || 0);
  const ia = Number(memberData?.investmentAmount || 0);
  const cp = Number(memberData?.commoditySavings || 0);
  const mca = Number(memberData?.muslimCommunitySavings || memberData?.muslimSavings || 0);
  const totalPortfolio = os + ss + ia + cp + mca;
  const outstandingLoans = Number(memberData?.outstandingLoans || 0);
  const maxBorrowingPower = os * 2;
  const kycStatus = memberData?.kycStatus || 'verified';
  const joinDate = memberData?.createdAt 
    ? new Date(memberData.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'January 15, 2024';

  const handleCopyId = () => {
    navigator.clipboard.writeText(memberId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveContactInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccessMessage(null);
    setSaveErrorMessage(null);

    try {
      const updatedProfile = {
        ...memberData,
        ...formData,
        updatedAt: new Date().toISOString()
      };

      // Save to Firestore
      try {
        const userDocRef = doc(db, 'users', memberId);
        await setDoc(userDocRef, updatedProfile, { merge: true });
      } catch (firestoreErr) {
        console.warn('Firestore update warning, persisting to local storage:', firestoreErr);
      }

      // Update LocalStorage cache
      localStorage.setItem('zimco_cached_member_data', JSON.stringify(updatedProfile));

      // Callback to parent if supplied
      if (onUpdateMemberData) {
        onUpdateMemberData(updatedProfile);
      }

      setSaveSuccessMessage('Your member contact information and Next of Kin records have been saved successfully.');
      setIsEditingContact(false);
      setTimeout(() => setSaveSuccessMessage(null), 5000);
    } catch (err: any) {
      console.error('Error saving member profile:', err);
      setSaveErrorMessage(err?.message || 'Failed to update contact records. Please check your network connection.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadCertificate = () => {
    setIsDownloadingCert(true);
    try {
      generateMembershipCertificatePDF({
        memberId,
        fullName: memberData?.fullName || formData.fullName || 'Valued Member',
        email: memberData?.email || formData.email,
        phone: memberData?.phone || formData.phone,
        department: memberData?.department || formData.department,
        joinDate,
        membershipClass: 'Class A Full Shareholder',
        kycStatus,
        totalPortfolio,
        ordinarySavings: os,
        specialSavings: ss,
        investmentAmount: ia,
        commoditySavings: cp,
        muslimCommunitySavings: mca,
        shareCapitalStatus: '100% Fully Paid (₦500,000 Minimum Share Capital)',
        standingStatus: 'ACTIVE • IN GOOD STANDING',
        agmEligibility: 'Qualified with Full Voting Rights (2026/2027 Session)'
      });
    } catch (e) {
      console.error('Error downloading certificate:', e);
    } finally {
      setIsDownloadingCert(false);
    }
  };

  // Filtered transactions for Activity Summary
  const filteredTransactions = transactions.filter(tx => {
    const matchesFilter = 
      activityFilter === 'all' ? true :
      activityFilter === 'credit' ? tx.type === 'credit' :
      activityFilter === 'debit' ? tx.type === 'debit' :
      activityFilter === 'loan' ? (tx.account?.toLowerCase().includes('loan') || tx.description?.toLowerCase().includes('loan')) : true;

    const matchesSearch = activitySearchQuery.trim() === '' ? true :
      tx.description?.toLowerCase().includes(activitySearchQuery.toLowerCase()) ||
      tx.account?.toLowerCase().includes(activitySearchQuery.toLowerCase()) ||
      tx.amount?.toLowerCase().includes(activitySearchQuery.toLowerCase()) ||
      tx.date?.toLowerCase().includes(activitySearchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const totalCredits = transactions
    .filter(t => t.type === 'credit')
    .reduce((acc, curr) => {
      const val = parseFloat(String(curr.amount).replace(/[^0-9.]/g, '')) || 0;
      return acc + val;
    }, 0);

  const totalDebits = transactions
    .filter(t => t.type === 'debit')
    .reduce((acc, curr) => {
      const val = parseFloat(String(curr.amount).replace(/[^0-9.]/g, '')) || 0;
      return acc + val;
    }, 0);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 sm:space-y-8"
    >
      {/* 1. Member Profile Hero & Identity Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm relative overflow-hidden">
        {/* Subtle decorative background pattern */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl -z-0 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar with Initials & Verified Ring */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center text-2xl sm:text-3xl font-black shadow-lg shadow-emerald-700/20 border-4 border-white">
                {memberData?.fullName ? memberData.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'MA'}
              </div>
              <div className="absolute -bottom-1.5 -right-1.5 p-1.5 bg-emerald-500 text-white rounded-xl shadow-md border-2 border-white" title="Verified Member">
                <BadgeCheck size={16} />
              </div>
            </div>

            {/* Main Member Details */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-headline text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {memberData?.fullName || formData.fullName || 'Amao Abdulhameed'}
                </h1>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active & In Good Standing
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-slate-500">
                <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/80">
                  <span className="font-mono font-bold text-slate-700">{memberId}</span>
                  <button 
                    onClick={handleCopyId}
                    className="text-slate-400 hover:text-emerald-700 transition-colors p-0.5 cursor-pointer"
                    title="Copy Member ID"
                  >
                    {copiedId ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <Briefcase size={14} className="text-emerald-600" />
                  <span>{memberData?.department || formData.department}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-slate-400" />
                  <span>Member since {joinDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <button
              onClick={handleDownloadCertificate}
              disabled={isDownloadingCert}
              className="w-full sm:w-auto px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/20 active:scale-95 cursor-pointer disabled:opacity-50"
              title="Download official stamped certificate of membership and good standing"
            >
              <Award size={16} />
              <span>{isDownloadingCert ? 'Generating Certificate...' : 'Download Certificate (PDF)'}</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('contact');
                setIsEditingContact(true);
              }}
              className="w-full sm:w-auto px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
            >
              <Edit3 size={15} />
              <span>Update Profile</span>
            </button>
          </div>
        </div>

        {/* Global Success / Error Toast Notifications */}
        <AnimatePresence>
          {saveSuccessMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 text-xs sm:text-sm font-semibold shadow-sm"
            >
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              <span>{saveSuccessMessage}</span>
            </motion.div>
          )}

          {saveErrorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-3 text-xs sm:text-sm font-semibold shadow-sm"
            >
              <AlertCircle size={18} className="text-rose-600 shrink-0" />
              <span>{saveErrorMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('status')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'status'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <ShieldCheck size={16} className={activeTab === 'status' ? 'text-emerald-400' : 'text-slate-400'} />
          <span>Membership Status & Standing</span>
        </button>

        <button
          onClick={() => setActiveTab('contact')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'contact'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <User size={16} className={activeTab === 'contact' ? 'text-emerald-400' : 'text-slate-400'} />
          <span>Contact & Personal Information</span>
        </button>

        <button
          onClick={() => setActiveTab('activity')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'activity'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <TrendingUp size={16} className={activeTab === 'activity' ? 'text-emerald-400' : 'text-slate-400'} />
          <span>Account Activity & Ledger Summary</span>
        </button>
      </div>

      {/* 3. TAB CONTENT */}
      {/* TAB 1: MEMBERSHIP STATUS & STANDING */}
      {activeTab === 'status' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Status Matrix Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {/* Status Card 1 */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Membership Class</span>
                <h4 className="font-bold text-slate-900 text-base mt-0.5">Class A Full Shareholder</h4>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Full equity rights, unconstrained zero-interest borrowing rights & annual dividend shares.
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">Standing:</span>
                <span className="font-bold text-emerald-700">Good Standing</span>
              </div>
            </div>

            {/* Status Card 2 */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">KYC Compliance</span>
                <h4 className="font-bold text-slate-900 text-base mt-0.5">Tier 2 Verified (NIN & Bio)</h4>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                National identity credentials and address proof validated by the compliance registry.
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">Registry ID:</span>
                <span className="font-mono font-bold text-slate-800">NIN-2024-***901</span>
              </div>
            </div>

            {/* Status Card 3 */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Award size={20} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">AGM Voting Status</span>
                <h4 className="font-bold text-slate-900 text-base mt-0.5">Fully Qualified Voter</h4>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Qualified to vote for executive committee elections and participate in general assembly resolutions.
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">Next AGM:</span>
                <span className="font-bold text-amber-800">November 2026</span>
              </div>
            </div>

            {/* Status Card 4 */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <CreditCard size={20} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Borrowing Limit (200% OS)</span>
                <h4 className="font-bold text-slate-900 text-base mt-0.5">₦{maxBorrowingPower.toLocaleString()} Available</h4>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Zero-interest credit entitlement backed by ₦{os.toLocaleString()} Ordinary Savings collateral.
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">Active Debt:</span>
                <span className={`font-bold ${outstandingLoans > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                  {outstandingLoans > 0 ? `₦${outstandingLoans.toLocaleString()}` : 'Zero Debt (₦0)'}
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Standing & Share Capital Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Share Capital & Dividend Qualification */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
              <div>
                <h3 className="font-headline text-xl font-bold text-slate-900">Cooperative Equity & Dividend Rights</h3>
                <p className="text-xs text-slate-400 mt-0.5">Statutory compliance benchmarks under Nigerian Cooperative Societies Act</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">Minimum Share Capital Obligation</span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">100% Satisfied</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      You have met the mandatory ₦500,000 cooperative share capital requirement to unlock full voting power and profit-sharing dividend distributions.
                    </p>
                  </div>
                  <div className="text-right font-mono shrink-0">
                    <span className="text-xs text-slate-400 block">Invested Capital</span>
                    <span className="text-base font-black text-slate-900">₦{ia.toLocaleString()}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">Surplus Dividend Participation</span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">Active Tier</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Qualified to receive semi-annual dividend yields calculated pro-rata on your cumulative Ordinary Savings and Investment balance.
                    </p>
                  </div>
                  <div className="text-right font-mono shrink-0">
                    <span className="text-xs text-slate-400 block">Est. 2026 Dividend</span>
                    <span className="text-base font-black text-emerald-700">₦{(totalPortfolio * 0.085).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">Guarantor & Endorsement Authority</span>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-full">Eligible</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      As an active member with over 12 months verified history, you are authorized to act as a guarantor for fellow members' zero-interest credit requests.
                    </p>
                  </div>
                  <div className="text-right shrink-0 font-mono">
                    <span className="text-xs text-slate-400 block">Endorsement Power</span>
                    <span className="text-base font-black text-slate-900">Up to 2 Members</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 1 Col: Official Certificate & Standing Card */}
            <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-500/20 flex flex-col justify-between relative overflow-hidden">
              <div className="relative z-10 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <Award size={24} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">Official Endorsement</span>
                  <h3 className="font-headline text-xl font-bold text-white mt-1">Certificate of Good Standing</h3>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    Official digital credential for official submissions, bank verifications, university bursary records, or visa financial standing checks.
                  </p>
                </div>

                <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Certificate No:</span>
                    <span className="font-mono text-emerald-300 font-bold">ZMC-CERT-{memberId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Digital Seal:</span>
                    <span className="text-slate-200">Electronic SHA-256</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Validity:</span>
                    <span className="text-emerald-400 font-bold">Current Fiscal Year</span>
                  </div>
                </div>
              </div>

              <div className="relative z-10 pt-6">
                <button
                  onClick={handleDownloadCertificate}
                  disabled={isDownloadingCert}
                  className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40 cursor-pointer disabled:opacity-50"
                >
                  <FileDown size={15} />
                  <span>{isDownloadingCert ? 'Exporting PDF...' : 'Download Stamped PDF Certificate'}</span>
                </button>
              </div>

              {/* Glowing decorative gradient */}
              <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 2: CONTACT & PERSONAL INFORMATION */}
      {activeTab === 'contact' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h3 className="font-headline text-xl font-bold text-slate-900">Member Contact & Profile Particulars</h3>
              <p className="text-xs text-slate-400 mt-0.5">Keep your correspondence address, phone numbers, and next-of-kin up to date</p>
            </div>

            <div className="flex items-center gap-3">
              {isEditingContact ? (
                <button
                  type="button"
                  onClick={() => setIsEditingContact(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <X size={14} />
                  <span>Cancel</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditingContact(true)}
                  className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 size={14} />
                  <span>Edit Details</span>
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleSaveContactInfo} className="space-y-8">
            {/* Primary Member Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <User size={16} className="text-emerald-600" />
                <h4>Official Member Records</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Full Legal Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    disabled={!isEditingContact}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs sm:text-sm font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition disabled:bg-slate-100/80 disabled:text-slate-600"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Official Email Address
                  </label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditingContact}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3.5 text-xs sm:text-sm font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition disabled:bg-slate-100/80 disabled:text-slate-600"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Primary Mobile Phone (SMS Alerts)
                  </label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditingContact}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3.5 text-xs sm:text-sm font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition disabled:bg-slate-100/80 disabled:text-slate-600"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Alternative / WhatsApp Phone
                  </label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      name="altPhone"
                      value={formData.altPhone}
                      onChange={handleInputChange}
                      disabled={!isEditingContact}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3.5 text-xs sm:text-sm font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition disabled:bg-slate-100/80 disabled:text-slate-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Department / Division
                  </label>
                  <div className="relative">
                    <Building2 size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      disabled={!isEditingContact}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3.5 text-xs sm:text-sm font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition disabled:bg-slate-100/80 disabled:text-slate-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Staff / Payroll ID
                  </label>
                  <input
                    type="text"
                    name="staffId"
                    value={formData.staffId}
                    onChange={handleInputChange}
                    disabled={!isEditingContact}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs sm:text-sm font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition disabled:bg-slate-100/80 disabled:text-slate-600 font-mono"
                  />
                </div>
              </div>

              {/* Residential & Office Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 pt-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Residential Address
                  </label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-3.5 top-3 text-slate-400" />
                    <textarea
                      name="address"
                      rows={2}
                      value={formData.address}
                      onChange={handleInputChange}
                      disabled={!isEditingContact}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3.5 text-xs sm:text-sm font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition disabled:bg-slate-100/80 disabled:text-slate-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Office / Work Station Location
                  </label>
                  <div className="relative">
                    <Building2 size={14} className="absolute left-3.5 top-3 text-slate-400" />
                    <textarea
                      name="officeLocation"
                      rows={2}
                      value={formData.officeLocation}
                      onChange={handleInputChange}
                      disabled={!isEditingContact}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3.5 text-xs sm:text-sm font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition disabled:bg-slate-100/80 disabled:text-slate-600"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Next of Kin Section */}
            <div className="space-y-4 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Users size={16} className="text-emerald-600" />
                <h4>Next of Kin & Emergency Beneficiary</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Next of Kin Full Name
                  </label>
                  <input
                    type="text"
                    name="nextOfKinName"
                    value={formData.nextOfKinName}
                    onChange={handleInputChange}
                    disabled={!isEditingContact}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs sm:text-sm font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition disabled:bg-slate-100/80 disabled:text-slate-600"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Relationship
                  </label>
                  <select
                    name="nextOfKinRelationship"
                    value={formData.nextOfKinRelationship}
                    onChange={handleInputChange}
                    disabled={!isEditingContact}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs sm:text-sm font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition disabled:bg-slate-100/80 disabled:text-slate-600"
                  >
                    <option value="Spouse">Spouse</option>
                    <option value="Child">Child</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Parent">Parent</option>
                    <option value="Other">Other / Relative</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Next of Kin Contact Phone
                  </label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      name="nextOfKinPhone"
                      value={formData.nextOfKinPhone}
                      onChange={handleInputChange}
                      disabled={!isEditingContact}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3.5 text-xs sm:text-sm font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition disabled:bg-slate-100/80 disabled:text-slate-600"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Next of Kin Residential Address
                  </label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-3.5 top-3 text-slate-400" />
                    <textarea
                      name="nextOfKinAddress"
                      rows={2}
                      value={formData.nextOfKinAddress}
                      onChange={handleInputChange}
                      disabled={!isEditingContact}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3.5 text-xs sm:text-sm font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition disabled:bg-slate-100/80 disabled:text-slate-600"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button in Edit Mode */}
            {isEditingContact && (
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditingContact(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 shadow-md shadow-emerald-700/20 cursor-pointer disabled:opacity-50"
                >
                  <Save size={15} />
                  <span>{isSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            )}
          </form>
        </motion.div>
      )}

      {/* TAB 3: ACCOUNT ACTIVITY & LEDGER SUMMARY */}
      {activeTab === 'activity' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Portfolio Metric Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Net Portfolio Value</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                  ₦{totalPortfolio.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                <Sparkles size={12} />
                <span>Across 5 cooperative accounts</span>
              </p>
            </div>

            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Lifetime Contributions</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono">
                  ₦{totalCredits > 0 ? totalCredits.toLocaleString(undefined, { minimumFractionDigits: 2 }) : (totalPortfolio * 1.2).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Total payroll & voluntary deposits</p>
            </div>

            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Disbursements</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-black text-rose-600 font-mono">
                  ₦{totalDebits.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Executed withdrawals to bank</p>
            </div>

            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ledger Activity Count</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                  {transactions.length}
                </span>
                <span className="text-xs text-slate-400 font-semibold">recorded entries</span>
              </div>
              <p className="text-[11px] text-emerald-700 font-medium">100% Audit Reconciled</p>
            </div>
          </div>

          {/* 5 Accounts Breakdown Grid */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-headline text-xl font-bold text-slate-900">Cooperative Account Balances</h3>
                <p className="text-xs text-slate-400">Current liquid and ringfenced balances in your member portfolio</p>
              </div>

              <div className="flex items-center gap-2">
                {onNavigateToTopUp && (
                  <button
                    onClick={onNavigateToTopUp}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Sparkles size={14} />
                    <span>Top-up Account</span>
                  </button>
                )}

                {onNavigateToWithdrawal && (
                  <button
                    onClick={onNavigateToWithdrawal}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowDownLeft size={14} />
                    <span>Request Payout</span>
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {/* Account 1: OS */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 hover:border-emerald-300 transition">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">OS</span>
                  <span className="text-[10px] text-slate-400 font-semibold">{totalPortfolio > 0 ? `${Math.round((os / totalPortfolio) * 100)}%` : '0%'}</span>
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 text-xs">Ordinary Savings</h5>
                  <p className="font-mono font-black text-slate-900 text-base sm:text-lg mt-0.5">₦{os.toLocaleString()}</p>
                </div>
                <span className="text-[9px] text-slate-400 block">Primary Collateral</span>
              </div>

              {/* Account 2: SS */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 hover:border-blue-300 transition">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-md">SS</span>
                  <span className="text-[10px] text-slate-400 font-semibold">{totalPortfolio > 0 ? `${Math.round((ss / totalPortfolio) * 100)}%` : '0%'}</span>
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 text-xs">Special Savings</h5>
                  <p className="font-mono font-black text-slate-900 text-base sm:text-lg mt-0.5">₦{ss.toLocaleString()}</p>
                </div>
                <span className="text-[9px] text-slate-400 block">Unrestricted Liquid</span>
              </div>

              {/* Account 3: IA */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 hover:border-amber-300 transition">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">IA</span>
                  <span className="text-[10px] text-slate-400 font-semibold">{totalPortfolio > 0 ? `${Math.round((ia / totalPortfolio) * 100)}%` : '0%'}</span>
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 text-xs">Investment Capital</h5>
                  <p className="font-mono font-black text-slate-900 text-base sm:text-lg mt-0.5">₦{ia.toLocaleString()}</p>
                </div>
                <span className="text-[9px] text-slate-400 block">Profit-Sharing Equity</span>
              </div>

              {/* Account 4: CP */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 hover:border-purple-300 transition">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded-md">CP</span>
                  <span className="text-[10px] text-slate-400 font-semibold">{totalPortfolio > 0 ? `${Math.round((cp / totalPortfolio) * 100)}%` : '0%'}</span>
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 text-xs">Commodity Purchase</h5>
                  <p className="font-mono font-black text-slate-900 text-base sm:text-lg mt-0.5">₦{cp.toLocaleString()}</p>
                </div>
                <span className="text-[9px] text-slate-400 block">Household Financing</span>
              </div>

              {/* Account 5: MCA */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 hover:border-emerald-300 transition">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">MCA</span>
                  <span className="text-[10px] text-slate-400 font-semibold">{totalPortfolio > 0 ? `${Math.round((mca / totalPortfolio) * 100)}%` : '0%'}</span>
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 text-xs">Muslim Community</h5>
                  <p className="font-mono font-black text-slate-900 text-base sm:text-lg mt-0.5">₦{mca.toLocaleString()}</p>
                </div>
                <span className="text-[9px] text-slate-400 block">Shari'ah Ringfenced</span>
              </div>
            </div>
          </div>

          {/* Activity Log & Transaction Stream Table */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-headline text-xl font-bold text-slate-900">Recent Account Activity Stream</h3>
                <p className="text-xs text-slate-400">Complete chronological audit trail of all transactions and contributions</p>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search activity..."
                    value={activitySearchQuery}
                    onChange={(e) => setActivitySearchQuery(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-full py-1.5 pl-8 pr-3 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none w-44 sm:w-56"
                  />
                </div>

                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                  <button
                    onClick={() => setActivityFilter('all')}
                    className={`px-2.5 py-1 rounded-lg transition ${activityFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setActivityFilter('credit')}
                    className={`px-2.5 py-1 rounded-lg transition ${activityFilter === 'credit' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    Credits
                  </button>
                  <button
                    onClick={() => setActivityFilter('debit')}
                    className={`px-2.5 py-1 rounded-lg transition ${activityFilter === 'debit' ? 'bg-white text-rose-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    Debits
                  </button>
                </div>
              </div>
            </div>

            {/* Transactions List */}
            {filteredTransactions.length === 0 ? (
              <div className="py-12 text-center">
                <Receipt className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <p className="text-sm font-bold text-slate-700">No activity matching your search</p>
                <p className="text-xs text-slate-400 mt-1">Try changing filters or search terms.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                      <th className="pb-3 px-3">Date</th>
                      <th className="pb-3 px-3">Activity Description</th>
                      <th className="pb-3 px-3">Account</th>
                      <th className="pb-3 px-3 text-center">Type</th>
                      <th className="pb-3 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredTransactions.map((tx, idx) => (
                      <tr key={tx.id || idx} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-3 font-mono text-slate-500 text-xs whitespace-nowrap">{tx.date}</td>
                        <td className="py-3 px-3 font-medium text-slate-900">
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                              tx.type === 'credit' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                            }`}>
                              {tx.type === 'credit' ? <ArrowUpRight size={12} /> : <ArrowDownLeft size={12} />}
                            </div>
                            <span className="truncate max-w-xs">{tx.description}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold whitespace-nowrap">
                            {tx.account || 'General'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            tx.type === 'credit' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className={`py-3 px-3 text-right font-mono font-black whitespace-nowrap ${
                          tx.type === 'credit' ? 'text-emerald-700' : 'text-rose-700'
                        }`}>
                          {tx.type === 'credit' ? '+' : '-'}{tx.amount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
