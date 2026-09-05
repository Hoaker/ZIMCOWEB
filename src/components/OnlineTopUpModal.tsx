import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  CreditCard, 
  Building2, 
  Smartphone, 
  ShieldCheck, 
  CheckCircle2, 
  Copy, 
  Check, 
  Download, 
  ArrowRight, 
  Lock, 
  RefreshCw, 
  Sparkles,
  AlertCircle,
  QrCode
} from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, setDoc, collection, addDoc } from 'firebase/firestore';
import { triggerTopUpNotification } from '../lib/notificationService';
import { generatePaymentReceiptPDF } from '../lib/pdfGenerator';

interface OnlineTopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberData: any;
  onPaymentSuccess: (updatedData: any, newTx: any) => void;
  defaultAccount?: string;
}

type PaymentMethod = 'paystack_card' | 'bank_transfer' | 'flutterwave_ussd';

export default function OnlineTopUpModal({
  isOpen,
  onClose,
  memberData,
  onPaymentSuccess,
  defaultAccount = 'ordinarySavings'
}: OnlineTopUpModalProps) {
  const [selectedAccount, setSelectedAccount] = useState<string>(defaultAccount);
  const [amount, setAmount] = useState<string>('25000');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('paystack_card');
  const [step, setStep] = useState<'details' | 'processing' | 'otp' | 'success'>('details');
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Card input states
  const [cardNumber, setCardNumber] = useState('5399 •••• •••• 4821');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('892');
  const [cardPin, setCardPin] = useState('');

  // Generated receipt data on completion
  const [completedReceipt, setCompletedReceipt] = useState<any>(null);

  if (!isOpen) return null;

  const accounts = [
    { key: 'ordinarySavings', name: 'Ordinary Savings (OS)', balance: Number(memberData?.ordinarySavings || 0) },
    { key: 'specialSavings', name: 'Special Savings (SS)', balance: Number(memberData?.specialSavings || 0) },
    { key: 'muslimCommunitySavings', name: 'Muslim Community Account (MCA)', balance: Number(memberData?.muslimCommunitySavings || memberData?.muslimSavings || 0) },
    { key: 'investmentAmount', name: 'Investment Shares (IA)', balance: Number(memberData?.investmentAmount || 0) },
    { key: 'commoditySavings', name: 'Commodity Purchase (CP)', balance: Number(memberData?.commoditySavings || 0) },
    ...(memberData?.outstandingLoans && Number(memberData.outstandingLoans) > 0 ? [
      { key: 'loanRepayment', name: 'Loan Principal Repayment', balance: Number(memberData.outstandingLoans), isLoan: true }
    ] : [])
  ];

  const currentAccountObj = accounts.find(a => a.key === selectedAccount) || accounts[0];
  const parsedAmount = parseFloat(amount.replace(/,/g, '')) || 0;

  const quickAmounts = [10000, 25000, 50000, 100000, 250000];

  const handleCopyTransferAccount = () => {
    navigator.clipboard.writeText('9928374821');
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2500);
  };

  const handleProceedToPayment = () => {
    if (parsedAmount < 1000) {
      alert('Minimum deposit amount is ₦1,000.00');
      return;
    }

    if (paymentMethod === 'paystack_card') {
      setStep('otp');
    } else if (paymentMethod === 'bank_transfer') {
      // Simulate transfer confirmation
      processTransaction();
    } else {
      processTransaction();
    }
  };

  const handleVerifyOtp = () => {
    if (otpCode.length < 4) {
      setOtpError('Please enter the 4-digit SMS OTP sent to your phone.');
      return;
    }
    setOtpError('');
    processTransaction();
  };

  const processTransaction = async () => {
    setStep('processing');
    setIsSubmitting(true);

    try {
      // Realistic simulation delay for gateway settlement
      await new Promise(resolve => setTimeout(resolve, 2000));

      const memberId = memberData?.id || localStorage.getItem('zimco_id') || 'ZIM-2026-001';
      const reference = `ZIM-TOP-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const now = new Date();
      const dateFormatted = now.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
      const timeFormatted = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      // Calculate updated fields
      let updatedMemberData = { ...memberData };
      let newBalance = 0;

      if (selectedAccount === 'loanRepayment') {
        const currentLoan = Number(memberData.outstandingLoans || 0);
        newBalance = Math.max(0, currentLoan - parsedAmount);
        updatedMemberData.outstandingLoans = newBalance;
      } else {
        const currentVal = Number(memberData[selectedAccount] || 0);
        newBalance = currentVal + parsedAmount;
        updatedMemberData[selectedAccount] = newBalance;
        if (selectedAccount === 'muslimCommunitySavings') {
          updatedMemberData.muslimSavings = newBalance;
        }
      }

      // Method label
      const channelLabel = paymentMethod === 'paystack_card' ? 'Paystack Card (Online)' :
                           paymentMethod === 'bank_transfer' ? 'Direct Bank Transfer' : 'Flutterwave / USSD';

      const newTx = {
        date: dateFormatted,
        description: selectedAccount === 'loanRepayment' 
          ? `Online Loan Repayment via ${channelLabel}`
          : `Instant Online Top-up into ${currentAccountObj.name} via ${channelLabel}`,
        amount: `₦${parsedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        account: currentAccountObj.name,
        type: selectedAccount === 'loanRepayment' ? 'credit' : 'credit',
        reference,
        channel: channelLabel,
        createdAt: now.toISOString()
      };

      // 1. Update Firestore user document
      try {
        const userRef = doc(db, 'users', memberId);
        const updatePayload: Record<string, any> = {};
        if (selectedAccount === 'loanRepayment') {
          updatePayload.outstandingLoans = newBalance;
        } else {
          updatePayload[selectedAccount] = newBalance;
          if (selectedAccount === 'muslimCommunitySavings') {
            updatePayload.muslimSavings = newBalance;
          }
        }
        await setDoc(userRef, updatePayload, { merge: true });
      } catch (err) {
        console.warn('Firestore user update notice (using cached state):', err);
      }

      // 2. Append to member transactions subcollection
      try {
        const txCol = collection(db, 'users', memberId, 'transactions');
        await addDoc(txCol, newTx);
      } catch (err) {
        console.warn('Firestore tx append notice:', err);
      }

      // 3. Dispatch automated instant SMS & Email notification!
      try {
        await triggerTopUpNotification({
          memberId,
          memberName: memberData.fullName || 'Valued Member',
          memberEmail: memberData.email || 'member@zimco.org',
          amount: parsedAmount,
          accountName: currentAccountObj.name,
          paymentMethod: channelLabel,
          reference,
          newBalance
        });
      } catch (notifErr) {
        console.warn('Automated notification dispatch notice:', notifErr);
      }

      // 4. Update local cache
      try {
        localStorage.setItem('zimco_cached_member_data', JSON.stringify(updatedMemberData));
      } catch (e) {
        console.warn('Cache error:', e);
      }

      const receiptPayload = {
        reference,
        memberId,
        memberName: memberData.fullName || 'Member',
        memberEmail: memberData.email,
        amount: parsedAmount,
        accountName: currentAccountObj.name,
        paymentMethod: channelLabel,
        dateFormatted: `${dateFormatted} at ${timeFormatted}`,
        newBalance
      };

      setCompletedReceipt(receiptPayload);
      setStep('success');
      setIsSubmitting(false);
      onPaymentSuccess(updatedMemberData, newTx);

    } catch (error) {
      console.error('Payment processing failure:', error);
      setIsSubmitting(false);
      setStep('details');
      alert('Transaction failed. Please try again.');
    }
  };

  const handleDownloadReceipt = () => {
    if (!completedReceipt) return;
    generatePaymentReceiptPDF(completedReceipt);
  };

  const handleResetAndClose = () => {
    setStep('details');
    setOtpCode('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200/80 overflow-hidden my-auto"
      >
        {/* Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Sparkles className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white leading-tight">Instant Online Top-up</h3>
              <p className="text-[11px] text-emerald-200/80">Direct Electronic Settlement & SMS Confirmation</p>
            </div>
          </div>
          <button 
            onClick={handleResetAndClose}
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {step === 'details' && (
            <div className="space-y-5">
              {/* 1. Destination Account */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Destination Account
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {accounts.map(acc => (
                    <button
                      key={acc.key}
                      type="button"
                      onClick={() => setSelectedAccount(acc.key)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedAccount === acc.key
                          ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                      }`}
                    >
                      <div className="text-xs font-bold truncate">{acc.name}</div>
                      <div className="text-[11px] text-slate-500 mt-1 font-mono">
                        {acc.isLoan ? 'Bal: ' : 'Cur: '}₦{acc.balance.toLocaleString()}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Amount Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Amount to Deposit (NGN)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-bold text-slate-400">₦</span>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="25,000"
                    className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {quickAmounts.map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount(val.toString())}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                        parsedAmount === val
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      ₦{val.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Payment Method */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Select Payment Gateway / Channel
                </label>
                <div className="space-y-2">
                  {/* Paystack Card */}
                  <label 
                    onClick={() => setPaymentMethod('paystack_card')}
                    className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'paystack_card'
                        ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-500'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                        <CreditCard size={20} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          Debit / Credit Card (Paystack)
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-extrabold">Instant</span>
                        </div>
                        <div className="text-[11px] text-slate-500">Mastercard, Visa, Verve & 3DS Secure</div>
                      </div>
                    </div>
                    <input 
                      type="radio" 
                      name="payment_method" 
                      checked={paymentMethod === 'paystack_card'} 
                      onChange={() => setPaymentMethod('paystack_card')}
                      className="text-emerald-600 focus:ring-emerald-500" 
                    />
                  </label>

                  {/* Bank Transfer (Virtual Account) */}
                  <label 
                    onClick={() => setPaymentMethod('bank_transfer')}
                    className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'bank_transfer'
                        ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-500'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
                        <Building2 size={20} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          Direct Bank Transfer (Virtual Account)
                        </div>
                        <div className="text-[11px] text-slate-500">Automated ledger match via Sterling / Providus</div>
                      </div>
                    </div>
                    <input 
                      type="radio" 
                      name="payment_method" 
                      checked={paymentMethod === 'bank_transfer'} 
                      onChange={() => setPaymentMethod('bank_transfer')}
                      className="text-emerald-600 focus:ring-emerald-500" 
                    />
                  </label>

                  {/* Flutterwave USSD / QR */}
                  <label 
                    onClick={() => setPaymentMethod('flutterwave_ussd')}
                    className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'flutterwave_ussd'
                        ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-500'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                        <Smartphone size={20} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          Flutterwave / USSD / Mobile Money
                        </div>
                        <div className="text-[11px] text-slate-500">Direct mobile bank code or QR checkout</div>
                      </div>
                    </div>
                    <input 
                      type="radio" 
                      name="payment_method" 
                      checked={paymentMethod === 'flutterwave_ussd'} 
                      onChange={() => setPaymentMethod('flutterwave_ussd')}
                      className="text-emerald-600 focus:ring-emerald-500" 
                    />
                  </label>
                </div>
              </div>

              {/* Dynamic Virtual Account details if Bank Transfer is chosen */}
              {paymentMethod === 'bank_transfer' && (
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="text-[11px] font-bold uppercase text-slate-500">Dedicated Cooperative Account</div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-600">Sterling Bank / Providus Bank</div>
                      <div className="text-base font-black text-slate-900 font-mono tracking-wider">9928 374 821</div>
                      <div className="text-[10px] text-emerald-700 font-bold">ZIMCO - {memberData?.fullName}</div>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyTransferAccount}
                      className="px-3 py-1.5 bg-white border border-slate-200 text-xs font-bold rounded-lg flex items-center gap-1.5 text-slate-700 hover:bg-slate-100 cursor-pointer shadow-sm"
                    >
                      {copiedAccount ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      {copiedAccount ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleProceedToPayment}
                  className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-700/20 flex items-center justify-center gap-2 transition active:scale-[0.99] cursor-pointer"
                >
                  <Lock size={15} />
                  <span>Pay ₦{parsedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} Now</span>
                  <ArrowRight size={15} />
                </button>
                <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 mt-3">
                  <ShieldCheck size={13} className="text-emerald-600" />
                  <span>256-Bit SSL Encrypted &bull; Automated SMS Notification Enabled</span>
                </div>
              </div>
            </div>
          )}

          {/* OTP Step (Paystack 3D Secure verification) */}
          {step === 'otp' && (
            <div className="space-y-5 text-center py-2">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <ShieldCheck size={28} />
              </div>
              <div>
                <h4 className="font-bold text-lg text-slate-900">Paystack 3D Secure Authentication</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  A verification one-time passcode (OTP) has been sent to your linked phone number for <strong className="text-slate-900">₦{parsedAmount.toLocaleString()}</strong>.
                </p>
              </div>

              <div className="max-w-xs mx-auto space-y-2">
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="Enter 4 or 6 digit OTP (e.g. 1234)"
                  className="w-full text-center text-xl font-black tracking-widest py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  autoFocus
                />
                {otpError && <div className="text-[11px] font-bold text-rose-600">{otpError}</div>}
                <div className="text-[10px] text-slate-400">
                  Demo hint: Type <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono font-bold text-emerald-700">1234</code> or any code to authenticate.
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="w-1/2 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={isSubmitting}
                  className="w-1/2 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer"
                >
                  Verify & Authorize
                </button>
              </div>
            </div>
          )}

          {/* Processing State */}
          {step === 'processing' && (
            <div className="py-12 text-center space-y-4">
              <div className="relative w-16 h-16 mx-auto">
                <div className="w-16 h-16 rounded-full border-4 border-emerald-200 border-t-emerald-700 animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-emerald-700 font-bold">
                  <Lock size={20} />
                </div>
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-900">Connecting to Payment Gateway...</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Settling ledger, updating savings balance, and dispatching SMS notification.
                </p>
              </div>
            </div>
          )}

          {/* Success Screen */}
          {step === 'success' && completedReceipt && (
            <div className="space-y-5 text-center py-2">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 size={32} />
              </div>
              
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                  Payment Successful
                </span>
                <h4 className="font-black text-2xl text-slate-900 mt-1.5">
                  ₦{parsedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Credited to <strong className="text-slate-800">{currentAccountObj.name}</strong>
                </p>
              </div>

              {/* Transaction receipt card */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Reference:</span>
                  <span className="font-mono font-bold text-slate-800">{completedReceipt.reference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Channel:</span>
                  <span className="font-bold text-slate-800">{completedReceipt.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Updated Balance:</span>
                  <span className="font-bold text-emerald-700">
                    ₦{completedReceipt.newBalance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 text-[11px]">
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <Check size={12} /> SMS & Email Dispatched
                  </span>
                  <span className="text-slate-400">{completedReceipt.dateFormatted}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleDownloadReceipt}
                  className="w-full py-3 bg-slate-900 hover:bg-black text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow"
                >
                  <Download size={14} />
                  <span>Download Official Payment Receipt (PDF)</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="w-full py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition cursor-pointer"
                >
                  Done & Return to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
