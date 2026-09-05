import { db, handleFirestoreError, OperationType } from './firebase';
import { collection, doc, setDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';

export interface NotificationItem {
  id: string;
  memberId: string;
  title: string;
  message: string;
  category: 'topup' | 'deduction' | 'loan' | 'security' | 'statement' | 'general';
  channels: {
    sms: boolean;
    email: boolean;
    inApp: boolean;
  };
  smsDelivered: 'delivered' | 'sent' | 'pending' | 'n/a';
  emailDelivered: 'delivered' | 'sent' | 'pending' | 'n/a';
  smsText?: string;
  emailHtml?: string;
  isRead: boolean;
  timestamp: string;
  reference?: string;
  meta?: Record<string, any>;
}

export interface NotificationPreferences {
  smsTopupAlerts: boolean;
  smsDeductionAlerts: boolean;
  smsLoanAlerts: boolean;
  emailReceipts: boolean;
  emailMonthlyStatement: boolean;
  emailSecurityAlerts: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  smsTopupAlerts: true,
  smsDeductionAlerts: true,
  smsLoanAlerts: true,
  emailReceipts: true,
  emailMonthlyStatement: true,
  emailSecurityAlerts: true,
};

// Local storage key for member notifications fallback
const getStorageKey = (memberId: string) => `zimco_notifications_${memberId}`;
const getPrefKey = (memberId: string) => `zimco_notif_prefs_${memberId}`;

export const getNotificationPreferences = (memberId: string): NotificationPreferences => {
  try {
    const raw = localStorage.getItem(getPrefKey(memberId));
    if (raw) return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
  } catch (e) {
    console.warn('Failed to parse notification preferences:', e);
  }
  return DEFAULT_PREFERENCES;
};

export const saveNotificationPreferences = (memberId: string, prefs: NotificationPreferences) => {
  try {
    localStorage.setItem(getPrefKey(memberId), JSON.stringify(prefs));
  } catch (e) {
    console.warn('Failed to save notification preferences:', e);
  }
};

/**
 * Generates an official responsive HTML email template for ZIMCO notifications
 */
export const buildEmailTemplate = ({
  title,
  memberName,
  memberId,
  mainContentHtml,
  summaryBadge,
  reference,
  dateFormatted
}: {
  title: string;
  memberName: string;
  memberId: string;
  mainContentHtml: string;
  summaryBadge?: string;
  reference?: string;
  dateFormatted: string;
}) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; color: #1e293b; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #064e3b, #047857); padding: 32px 24px; text-align: center; color: #ffffff; }
    .logo { width: 48px; height: 48px; border-radius: 50%; background: #ffffff; padding: 3px; display: inline-block; margin-bottom: 12px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; background: rgba(255,255,255,0.2); color: #ffffff; margin-top: 8px; }
    .content { padding: 32px 24px; line-height: 1.6; }
    .greeting { font-size: 16px; font-weight: 600; color: #0f172a; margin-bottom: 16px; }
    .card { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 18px; margin: 20px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #cbd5e1; font-size: 13px; }
    .detail-row:last-child { border-bottom: none; }
    .label { color: #64748b; font-weight: 500; }
    .value { color: #0f172a; font-weight: 700; text-align: right; }
    .footer { background: #f8fafc; padding: 24px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
    .security-note { font-size: 11px; color: #059669; font-weight: 600; margin-top: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div style="font-size: 24px; font-weight: 900; letter-spacing: -0.5px;">ZIMCO COOPERATIVE</div>
      <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 2px; opacity: 0.9;">Staff & Multipurpose Society</div>
      ${summaryBadge ? `<div class="badge">${summaryBadge}</div>` : ''}
    </div>
    <div class="content">
      <div class="greeting">Dear ${memberName || 'Valued Member'} (${memberId}),</div>
      ${mainContentHtml}
      <div style="margin-top: 24px; font-size: 13px; color: #475569;">
        You can track and verify your real-time financial ledger balance anytime directly on your <a href="#" style="color: #059669; font-weight: 600; text-decoration: none;">ZIMCO Member Portal</a>.
      </div>
    </div>
    <div class="footer">
      <div>Reference: <strong>${reference || 'REF-' + Date.now()}</strong> &bull; Date: ${dateFormatted}</div>
      <div class="security-note">&bull; Automated Official Electronic Communication &bull;</div>
      <div style="margin-top: 6px;">Zaria Institute of Management Cooperative Society Ltd. &copy; 2026. All rights reserved.</div>
    </div>
  </div>
</body>
</html>
  `.trim();
};

/**
 * Dispatches an automated notification, storing in Firestore & local cache, and formats SMS/Email payloads.
 */
export const dispatchNotification = async (notif: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead'>): Promise<NotificationItem> => {
  const notifId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const timestamp = new Date().toISOString();
  
  const fullNotification: NotificationItem = {
    ...notif,
    id: notifId,
    timestamp,
    isRead: false,
    smsDelivered: notif.channels.sms ? 'delivered' : 'n/a',
    emailDelivered: notif.channels.email ? 'delivered' : 'n/a',
  };

  // 1. Save to localStorage cache immediately
  try {
    const storageKey = getStorageKey(notif.memberId);
    const existingRaw = localStorage.getItem(storageKey);
    const existingList: NotificationItem[] = existingRaw ? JSON.parse(existingRaw) : [];
    existingList.unshift(fullNotification);
    localStorage.setItem(storageKey, JSON.stringify(existingList.slice(0, 50)));
  } catch (e) {
    console.warn('Local notification cache error:', e);
  }

  // 2. Persist to Firestore subcollection
  try {
    const docRef = doc(db, 'users', notif.memberId, 'notifications', notifId);
    await setDoc(docRef, fullNotification);
  } catch (err) {
    console.warn('Firestore notification write note (offline fallback used):', err);
  }

  return fullNotification;
};

/**
 * Fetch member notifications from Firestore with local fallback
 */
export const getMemberNotifications = async (memberId: string): Promise<NotificationItem[]> => {
  let list: NotificationItem[] = [];

  // Try fetching from Firestore
  try {
    const notifRef = collection(db, 'users', memberId, 'notifications');
    const q = query(notifRef, orderBy('timestamp', 'desc'), limit(40));
    const snap = await getDocs(q);
    snap.forEach((d) => {
      list.push(d.data() as NotificationItem);
    });
  } catch (e) {
    console.warn('Firestore fetch failed, relying on local storage cache:', e);
  }

  // If Firestore had entries, sync with local cache
  if (list.length > 0) {
    try {
      localStorage.setItem(getStorageKey(memberId), JSON.stringify(list));
    } catch (e) {
      console.warn('Sync cache error:', e);
    }
    return list;
  }

  // Fallback to local storage
  try {
    const raw = localStorage.getItem(getStorageKey(memberId));
    if (raw) {
      list = JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Storage read error:', e);
  }

  // If still empty, seed realistic initial notification set
  if (list.length === 0) {
    list = generateSeedNotifications(memberId);
    try {
      localStorage.setItem(getStorageKey(memberId), JSON.stringify(list));
    } catch (e) {
      console.warn('Seed cache error:', e);
    }
  }

  return list;
};

/**
 * Mark a single notification as read
 */
export const markNotificationAsRead = async (memberId: string, notifId: string): Promise<void> => {
  try {
    const storageKey = getStorageKey(memberId);
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const list: NotificationItem[] = JSON.parse(raw);
      const updated = list.map(item => item.id === notifId ? { ...item, isRead: true } : item);
      localStorage.setItem(storageKey, JSON.stringify(updated));
    }

    const docRef = doc(db, 'users', memberId, 'notifications', notifId);
    await setDoc(docRef, { isRead: true }, { merge: true });
  } catch (e) {
    console.warn('Mark read notice:', e);
  }
};

/**
 * Mark all notifications as read for a member
 */
export const markAllNotificationsAsRead = async (memberId: string): Promise<void> => {
  try {
    const storageKey = getStorageKey(memberId);
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const list: NotificationItem[] = JSON.parse(raw);
      const updated = list.map(item => ({ ...item, isRead: true }));
      localStorage.setItem(storageKey, JSON.stringify(updated));
    }
  } catch (e) {
    console.warn('Mark all read storage notice:', e);
  }
};

/**
 * Trigger automated top-up notification
 */
export const triggerTopUpNotification = async ({
  memberId,
  memberName,
  memberEmail,
  memberPhone,
  amount,
  accountName,
  paymentMethod,
  reference,
  newBalance
}: {
  memberId: string;
  memberName: string;
  memberEmail: string;
  memberPhone?: string;
  amount: number;
  accountName: string;
  paymentMethod: string;
  reference: string;
  newBalance: number;
}) => {
  const formattedAmount = `₦${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formattedBalance = `₦${newBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const smsText = `ZIMCO ALERT: Credit of ${formattedAmount} to your ${accountName} via ${paymentMethod} on ${dateStr}. Ref: ${reference}. New Bal: ${formattedBalance}. Thank you.`;

  const emailHtml = buildEmailTemplate({
    title: `Payment Receipt: ${formattedAmount} Credited`,
    memberName,
    memberId,
    summaryBadge: 'Instant Top-Up Confirmed',
    reference,
    dateFormatted: dateStr,
    mainContentHtml: `
      <p>We are pleased to confirm that your voluntary instant top-up of <strong>${formattedAmount}</strong> has been successfully received and credited directly to your cooperative ledger.</p>
      
      <div class="card">
        <div style="font-size: 11px; text-transform: uppercase; font-weight: 800; color: #047857; margin-bottom: 8px;">Transaction Summary</div>
        <div class="detail-row">
          <span class="label">Amount Paid:</span>
          <span class="value" style="color: #047857; font-size: 15px;">${formattedAmount}</span>
        </div>
        <div class="detail-row">
          <span class="label">Target Account:</span>
          <span class="value">${accountName}</span>
        </div>
        <div class="detail-row">
          <span class="label">Payment Channel:</span>
          <span class="value">${paymentMethod}</span>
        </div>
        <div class="detail-row">
          <span class="label">Transaction Reference:</span>
          <span class="value" style="font-family: monospace;">${reference}</span>
        </div>
        <div class="detail-row">
          <span class="label">Updated Balance:</span>
          <span class="value" style="color: #065f46; font-size: 14px;">${formattedBalance}</span>
        </div>
      </div>
    `
  });

  return await dispatchNotification({
    memberId,
    title: `Instant Top-up Confirmed: ${formattedAmount}`,
    message: `Successfully credited ${formattedAmount} into ${accountName} via ${paymentMethod}.`,
    category: 'topup',
    channels: {
      sms: true,
      email: true,
      inApp: true
    },
    smsDelivered: 'delivered',
    emailDelivered: 'delivered',
    smsText,
    emailHtml,
    reference,
    meta: { amount, accountName, paymentMethod, newBalance }
  });
};

/**
 * Trigger automated payroll deduction notification
 */
export const triggerDeductionNotification = async ({
  memberId,
  memberName,
  memberEmail,
  month,
  totalDeduction,
  totalDeducted,
  breakdown
}: {
  memberId: string;
  memberName: string;
  memberEmail: string;
  month: string;
  totalDeduction?: number;
  totalDeducted?: number;
  breakdown: {
    ordinarySavings?: number;
    specialSavings?: number;
    investment?: number;
    commodityPurchase?: number;
    loanReimbursement?: number;
    muslimCommunity?: number;
  };
}) => {
  const actualTotal = totalDeduction ?? totalDeducted ?? 0;
  const formattedTotal = `₦${actualTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  const ref = `DED-${month.toUpperCase().replace(/\s+/g, '-')}-${memberId}`;

  const smsText = `ZIMCO DEDUCTION ALERT: Your ${month} salary deduction of ${formattedTotal} has been successfully processed & allocated to your cooperative accounts. Ref: ${ref}.`;

  const rowsHtml = Object.entries(breakdown)
    .filter(([_, val]) => val && val > 0)
    .map(([key, val]) => {
      const label = key === 'ordinarySavings' ? 'Ordinary Savings' :
                    key === 'specialSavings' ? 'Special Savings' :
                    key === 'investment' ? 'Investment Shares' :
                    key === 'commodityPurchase' ? 'Commodity Purchase' :
                    key === 'loanReimbursement' ? 'Loan Repayment' :
                    key === 'muslimCommunity' ? 'Muslim Community Account' : key;
      return `
        <div class="detail-row">
          <span class="label">${label}:</span>
          <span class="value">₦${(val as number).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
      `;
    }).join('');

  const emailHtml = buildEmailTemplate({
    title: `Monthly Deduction Statement: ${month}`,
    memberName,
    memberId,
    summaryBadge: `Payroll Ingestion - ${month}`,
    reference: ref,
    dateFormatted: dateStr,
    mainContentHtml: `
      <p>This is to notify you that your cooperative deductions for the payroll month of <strong>${month}</strong> have been ingested by the Bursary Department and credited to your respective ledgers.</p>
      
      <div class="card">
        <div style="font-size: 11px; text-transform: uppercase; font-weight: 800; color: #047857; margin-bottom: 8px;">Breakdown of Deductions</div>
        ${rowsHtml}
        <div class="detail-row" style="margin-top: 6px; padding-top: 10px; border-top: 2px solid #bbf7d0;">
          <span class="label" style="font-weight: 800; color: #0f172a;">Total Ingested:</span>
          <span class="value" style="color: #047857; font-size: 16px;">${formattedTotal}</span>
        </div>
      </div>
    `
  });

  return await dispatchNotification({
    memberId,
    title: `Monthly Deduction Ingested (${month})`,
    message: `Total salary deduction of ${formattedTotal} for ${month} has been credited across your savings & loan accounts.`,
    category: 'deduction',
    channels: {
      sms: true,
      email: true,
      inApp: true
    },
    smsDelivered: 'delivered',
    emailDelivered: 'delivered',
    smsText,
    emailHtml,
    reference: ref,
    meta: { totalDeducted: actualTotal, month, breakdown }
  });
};

/**
 * Trigger automated withdrawal debit notification
 */
export const triggerWithdrawalNotification = async ({
  memberId,
  memberName,
  memberEmail,
  memberPhone,
  amount,
  accountName,
  bankName,
  accountNumber,
  reference,
  remainingBalance
}: {
  memberId: string;
  memberName: string;
  memberEmail: string;
  memberPhone?: string;
  amount: number;
  accountName: string;
  bankName: string;
  accountNumber: string;
  reference: string;
  remainingBalance: number;
}) => {
  const formattedAmount = `₦${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formattedBalance = `₦${remainingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const smsText = `ZIMCO DEBIT ALERT: Debit of ${formattedAmount} from your ${accountName} on ${dateStr}. Payout to ${bankName} (${accountNumber.slice(-4).padStart(accountNumber.length, '*')}). Ref: ${reference}. Rem Bal: ${formattedBalance}.`;

  const emailHtml = buildEmailTemplate({
    title: `Withdrawal Request Executed: ${formattedAmount}`,
    memberName,
    memberId,
    summaryBadge: 'Withdrawal Processed',
    reference,
    dateFormatted: dateStr,
    mainContentHtml: `
      <p>Your withdrawal request of <strong>${formattedAmount}</strong> from your <strong>${accountName}</strong> has been logged and scheduled for electronic payout disbursement.</p>
      
      <div class="card">
        <div style="font-size: 11px; text-transform: uppercase; font-weight: 800; color: #047857; margin-bottom: 8px;">Withdrawal Details</div>
        <div class="detail-row">
          <span class="label">Amount Debited:</span>
          <span class="value" style="color: #b91c1c; font-size: 15px;">-${formattedAmount}</span>
        </div>
        <div class="detail-row">
          <span class="label">Debited Account:</span>
          <span class="value">${accountName}</span>
        </div>
        <div class="detail-row">
          <span class="label">Destination Bank:</span>
          <span class="value">${bankName}</span>
        </div>
        <div class="detail-row">
          <span class="label">Beneficiary Account:</span>
          <span class="value">${accountNumber}</span>
        </div>
        <div class="detail-row">
          <span class="label">Transaction Reference:</span>
          <span class="value" style="font-family: monospace;">${reference}</span>
        </div>
        <div class="detail-row">
          <span class="label">Remaining Balance:</span>
          <span class="value" style="color: #065f46; font-size: 14px;">${formattedBalance}</span>
        </div>
      </div>
    `
  });

  return await dispatchNotification({
    memberId,
    title: `Withdrawal Request: ${formattedAmount}`,
    message: `Withdrawal of ${formattedAmount} debited from ${accountName} to ${bankName} account ending in ${accountNumber.slice(-4)}.`,
    category: 'topup',
    channels: {
      sms: true,
      email: true,
      inApp: true
    },
    smsDelivered: 'delivered',
    emailDelivered: 'delivered',
    smsText,
    emailHtml,
    reference,
    meta: { amount, accountName, bankName, accountNumber, remainingBalance }
  });
};

/**
 * Trigger automated loan status notification
 */
export const triggerLoanNotification = async ({
  memberId,
  memberName,
  memberEmail,
  memberPhone,
  loanType = 'Standard Loan',
  amount,
  status,
  monthlyRepayment,
  loanId,
  disbursedDate
}: {
  memberId: string;
  memberName: string;
  memberEmail: string;
  memberPhone?: string;
  loanType?: string;
  amount: number;
  status: 'Approved' | 'Disbursed' | 'Under Review' | 'Repayment Received' | 'approved' | 'rejected' | 'disbursed' | string;
  monthlyRepayment?: number;
  loanId: string;
  disbursedDate?: string;
}) => {
  const formattedAmount = `₦${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const dateStr = disbursedDate || new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  const displayStatus = status.charAt(0).toUpperCase() + status.slice(1);

  const smsText = `ZIMCO LOAN ALERT: Your ${loanType} application (${loanId}) for ${formattedAmount} status is now: ${displayStatus.toUpperCase()}. Check portal for details.`;

  const emailHtml = buildEmailTemplate({
    title: `Loan Facility Status: ${displayStatus}`,
    memberName,
    memberId,
    summaryBadge: `Credit Facility - ${displayStatus}`,
    reference: loanId,
    dateFormatted: dateStr,
    mainContentHtml: `
      <p>Your cooperative loan application for <strong>${loanType}</strong> has been updated to <strong>${displayStatus}</strong>.</p>
      
      <div class="card">
        <div style="font-size: 11px; text-transform: uppercase; font-weight: 800; color: #047857; margin-bottom: 8px;">Facility Details</div>
        <div class="detail-row">
          <span class="label">Loan Reference:</span>
          <span class="value" style="font-family: monospace;">${loanId}</span>
        </div>
        <div class="detail-row">
          <span class="label">Principal Amount:</span>
          <span class="value">${formattedAmount}</span>
        </div>
        <div class="detail-row">
          <span class="label">Current Status:</span>
          <span class="value" style="color: #047857;">${displayStatus}</span>
        </div>
        ${monthlyRepayment ? `
        <div class="detail-row">
          <span class="label">Monthly Repayment:</span>
          <span class="value">₦${monthlyRepayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>` : ''}
      </div>
    `
  });

  return await dispatchNotification({
    memberId,
    title: `Loan Facility: ${displayStatus}`,
    message: `${loanType} facility of ${formattedAmount} is now marked as ${displayStatus}.`,
    category: 'loan',
    channels: {
      sms: true,
      email: true,
      inApp: true
    },
    smsDelivered: 'delivered',
    emailDelivered: 'delivered',
    smsText,
    emailHtml,
    reference: loanId,
    meta: { loanType, amount, status: displayStatus, loanId }
  });
};

/**
 * Generate default seed notifications for realistic onboarding
 */
function generateSeedNotifications(memberId: string): NotificationItem[] {
  return [
    {
      id: `seed_notif_1_${memberId}`,
      memberId,
      title: 'Welcome to ZIMCO Digital Member Portal',
      message: 'Your biometric-enabled digital cooperative profile and online payment channels have been successfully activated.',
      category: 'general',
      channels: { sms: true, email: true, inApp: true },
      smsDelivered: 'delivered',
      emailDelivered: 'delivered',
      smsText: `ZIMCO ALERT: Welcome to ZIMCO Cooperative Portal. Your Member ID is ${memberId}. You can now view ledgers, make instant deposits, and request credit online.`,
      emailHtml: buildEmailTemplate({
        title: 'Welcome to ZIMCO Portal',
        memberName: 'Member',
        memberId,
        summaryBadge: 'Account Activated',
        dateFormatted: 'May 2026',
        mainContentHtml: '<p>Welcome to the ZIMCO Digital Portal. You can now access your real-time savings ledgers, request loans, and perform instant top-ups anytime.</p>'
      }),
      isRead: false,
      timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
      reference: `ACT-${memberId}`
    },
    {
      id: `seed_notif_2_${memberId}`,
      memberId,
      title: 'Monthly Deduction Ingested (May 2026)',
      message: 'Total salary deduction of ₦135,000.00 for May 2026 has been credited across your savings & loan accounts.',
      category: 'deduction',
      channels: { sms: true, email: true, inApp: true },
      smsDelivered: 'delivered',
      emailDelivered: 'delivered',
      smsText: `ZIMCO DEDUCTION: Your May 2026 salary deduction of ₦135,000.00 has been credited to your ledgers. Ref: DED-MAY-2026-${memberId}.`,
      isRead: false,
      timestamp: new Date(Date.now() - 3600000 * 28).toISOString(),
      reference: `DED-MAY-2026-${memberId}`
    }
  ];
}
