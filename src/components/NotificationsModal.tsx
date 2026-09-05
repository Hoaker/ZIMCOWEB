import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Bell, 
  Mail, 
  MessageSquare, 
  CheckCheck, 
  CheckCircle2,
  ShieldAlert, 
  ArrowUpRight, 
  Calendar, 
  Clock, 
  Filter, 
  Send, 
  Settings, 
  Check, 
  Smartphone, 
  FileText,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Search
} from 'lucide-react';
import { 
  NotificationItem, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  saveNotificationPreferences,
  NotificationPreferences,
  triggerTopUpNotification
} from '../lib/notificationService';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  memberData: any;
  onNotificationsUpdated: (updatedList: NotificationItem[]) => void;
  preferences: NotificationPreferences;
  onPreferencesUpdated: (prefs: NotificationPreferences) => void;
}

export default function NotificationsModal({
  isOpen,
  onClose,
  notifications,
  memberData,
  onNotificationsUpdated,
  preferences,
  onPreferencesUpdated
}: NotificationsModalProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'sms' | 'email' | 'settings'>('all');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'topup' | 'deduction' | 'loan'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotif, setSelectedNotif] = useState<NotificationItem | null>(null);
  const [viewMode, setViewMode] = useState<'details' | 'sms_preview' | 'email_preview'>('details');
  const [isTestDispatching, setIsTestDispatching] = useState(false);
  const [testSuccessNotice, setTestSuccessNotice] = useState('');

  if (!isOpen) return null;

  const memberId = memberData?.id || localStorage.getItem('zimco_id') || 'ZIM-2026-001';
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAllRead = async () => {
    await markAllNotificationsAsRead(memberId);
    const updated = notifications.map(n => ({ ...n, isRead: true }));
    onNotificationsUpdated(updated);
  };

  const handleSelectNotif = async (notif: NotificationItem) => {
    setSelectedNotif(notif);
    setViewMode('details');
    if (!notif.isRead) {
      await markNotificationAsRead(memberId, notif.id);
      const updated = notifications.map(n => n.id === notif.id ? { ...n, isRead: true } : n);
      onNotificationsUpdated(updated);
    }
  };

  const handleTogglePref = (key: keyof NotificationPreferences) => {
    const updated = { ...preferences, [key]: !preferences[key] };
    onPreferencesUpdated(updated);
    saveNotificationPreferences(memberId, updated);
  };

  const handleTestDispatch = async () => {
    setIsTestDispatching(true);
    setTestSuccessNotice('');
    try {
      const simulatedAmount = 15000;
      const ref = `TEST-${Date.now().toString(36).toUpperCase()}`;
      const newNotif = await triggerTopUpNotification({
        memberId,
        memberName: memberData?.fullName || 'Valued Member',
        memberEmail: memberData?.email || 'member@zimco.org',
        amount: simulatedAmount,
        accountName: 'Ordinary Savings (OS)',
        paymentMethod: 'Test Dispatch Channel',
        reference: ref,
        newBalance: (Number(memberData?.ordinarySavings || 0) + simulatedAmount)
      });
      
      const updated = [newNotif, ...notifications];
      onNotificationsUpdated(updated);
      setTestSuccessNotice('Test SMS & Email alert successfully dispatched and delivered!');
      setTimeout(() => setTestSuccessNotice(''), 4000);
    } catch (e) {
      console.warn('Test dispatch error:', e);
    } finally {
      setIsTestDispatching(false);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    // Tab filter
    if (activeTab === 'sms' && !(n.channels.sms && n.smsText)) return false;
    if (activeTab === 'email' && !(n.channels.email && n.emailHtml)) return false;
    
    // Category filter
    if (selectedCategory !== 'ALL' && n.category !== selectedCategory) return false;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleMatch = n.title?.toLowerCase().includes(q);
      const msgMatch = n.message?.toLowerCase().includes(q);
      const refMatch = n.reference?.toLowerCase().includes(q);
      if (!titleMatch && !msgMatch && !refMatch) return false;
    }

    return true;
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center relative">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] font-black flex items-center justify-center border-2 border-white">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Member Communications & Alerts</h3>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  SMS & Email Enabled
                </span>
              </div>
              <p className="text-xs text-slate-500">Automated receipts, bursary deductions, and credit alerts</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50 rounded-xl transition cursor-pointer"
              >
                <CheckCheck size={14} />
                <span>Mark all as read</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-200 flex gap-2 overflow-x-auto py-2.5 bg-white">
          <button
            type="button"
            onClick={() => { setActiveTab('all'); setSelectedNotif(null); }}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'all'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Bell size={14} />
            <span>All Alerts ({notifications.length})</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('sms'); setSelectedNotif(null); }}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'sms'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Smartphone size={14} />
            <span>SMS Phone Log</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('email'); setSelectedNotif(null); }}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'email'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Mail size={14} />
            <span>Email Letters & Receipts</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('settings'); setSelectedNotif(null); }}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shrink-0 ml-auto cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Settings size={14} />
            <span>Preferences</span>
          </button>
        </div>

        {/* Filter bar for non-settings tab */}
        {activeTab !== 'settings' && !selectedNotif && (
          <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {(['ALL', 'topup', 'deduction', 'loan'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cat === 'ALL' ? 'All Types' : cat === 'topup' ? 'Top-ups / Deposits' : cat === 'deduction' ? 'Salary Deductions' : 'Loans'}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search alerts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-[380px]">
          {/* Notification Inspector modal / detail preview */}
          {selectedNotif ? (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setSelectedNotif(null)}
                className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                &larr; Back to list
              </button>

              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {selectedNotif.category}
                    </span>
                    <h4 className="text-base font-bold text-slate-900 mt-1.5">
                      {selectedNotif.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">{new Date(selectedNotif.timestamp).toLocaleString()}</p>
                  </div>
                  
                  {/* Mode switcher */}
                  <div className="flex gap-1 bg-slate-200 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setViewMode('details')}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                        viewMode === 'details' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600'
                      }`}
                    >
                      Summary
                    </button>
                    {selectedNotif.smsText && (
                      <button
                        type="button"
                        onClick={() => setViewMode('sms_preview')}
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer ${
                          viewMode === 'sms_preview' ? 'bg-white shadow-sm text-emerald-700' : 'text-slate-600'
                        }`}
                      >
                        <Smartphone size={12} />
                        SMS Payload
                      </button>
                    )}
                    {selectedNotif.emailHtml && (
                      <button
                        type="button"
                        onClick={() => setViewMode('email_preview')}
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer ${
                          viewMode === 'email_preview' ? 'bg-white shadow-sm text-emerald-700' : 'text-slate-600'
                        }`}
                      >
                        <Mail size={12} />
                        Email Letter
                      </button>
                    )}
                  </div>
                </div>

                {/* Body depending on viewMode */}
                {viewMode === 'details' && (
                  <div className="space-y-3 pt-2">
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {selectedNotif.message}
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
                      <div className="p-3 bg-white rounded-xl border border-slate-200">
                        <div className="text-[10px] text-slate-400">SMS Channel</div>
                        <div className="font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                          <Check size={12} /> {selectedNotif.smsDelivered}
                        </div>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-slate-200">
                        <div className="text-[10px] text-slate-400">Email Channel</div>
                        <div className="font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                          <Check size={12} /> {selectedNotif.emailDelivered}
                        </div>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-slate-200">
                        <div className="text-[10px] text-slate-400">Reference</div>
                        <div className="font-mono font-bold text-slate-700 truncate mt-0.5">
                          {selectedNotif.reference || 'N/A'}
                        </div>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-slate-200">
                        <div className="text-[10px] text-slate-400">Status</div>
                        <div className="font-bold text-slate-700 mt-0.5">
                          {selectedNotif.isRead ? 'Read' : 'Unread'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SMS View */}
                {viewMode === 'sms_preview' && (
                  <div className="pt-2">
                    <div className="max-w-sm mx-auto bg-slate-900 text-white rounded-2xl p-4 shadow-xl border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-2">
                        <span className="font-bold text-emerald-400 flex items-center gap-1">
                          <Smartphone size={12} /> Sender: ZIMCO-ALERT
                        </span>
                        <span>{new Date(selectedNotif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="bg-emerald-950/70 border border-emerald-800/60 rounded-xl p-3 text-xs leading-relaxed font-sans text-emerald-100">
                        {selectedNotif.smsText}
                      </div>
                      <div className="text-[10px] text-center text-slate-500">
                        Delivered to verified mobile number (+234 803 *** ****)
                      </div>
                    </div>
                  </div>
                )}

                {/* Email View */}
                {viewMode === 'email_preview' && (
                  <div className="pt-2 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-inner">
                    <div className="p-3 bg-slate-100 text-slate-600 text-xs border-b flex justify-between">
                      <span>To: <strong>{memberData?.email || 'member@zimco.org'}</strong></span>
                      <span>From: <strong>notifications@zimco.org</strong></span>
                    </div>
                    <div 
                      className="p-4 overflow-x-auto max-h-96 text-slate-900"
                      dangerouslySetInnerHTML={{ __html: selectedNotif.emailHtml || '<p>No HTML email available.</p>' }}
                    />
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'settings' ? (
            /* Notification Preferences Tab */
            <div className="space-y-5">
              <div>
                <h4 className="font-bold text-sm text-slate-900">Delivery Channel Subscriptions</h4>
                <p className="text-xs text-slate-500">
                  Configure which automated triggers send instant SMS text messages and official Email statements.
                </p>
              </div>

              {testSuccessNotice && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>{testSuccessNotice}</span>
                </div>
              )}

              <div className="space-y-3">
                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition">
                  <div className="flex items-center gap-3">
                    <Smartphone size={18} className="text-emerald-600 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">SMS Alerts on Instant Top-ups & Deposits</div>
                      <div className="text-[11px] text-slate-500">Receive instant credit confirmation SMS when you pay via card or bank transfer</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.smsTopupAlerts}
                    onChange={() => handleTogglePref('smsTopupAlerts')}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition">
                  <div className="flex items-center gap-3">
                    <Smartphone size={18} className="text-emerald-600 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">SMS Alerts on Monthly Payroll Ingestions</div>
                      <div className="text-[11px] text-slate-500">Get notified when Bursary processes monthly salary deductions into your ledger</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.smsDeductionAlerts}
                    onChange={() => handleTogglePref('smsDeductionAlerts')}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition">
                  <div className="flex items-center gap-3">
                    <Smartphone size={18} className="text-emerald-600 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">SMS Alerts for Loan Status & Repayment</div>
                      <div className="text-[11px] text-slate-500">Immediate notification when credit is approved, disbursed, or deducted</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.smsLoanAlerts}
                    onChange={() => handleTogglePref('smsLoanAlerts')}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition">
                  <div className="flex items-center gap-3">
                    <Mail size={18} className="text-blue-600 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">Electronic PDF Receipt via Email</div>
                      <div className="text-[11px] text-slate-500">Auto-attach official receipt document for every voluntary top-up</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.emailReceipts}
                    onChange={() => handleTogglePref('emailReceipts')}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition">
                  <div className="flex items-center gap-3">
                    <Mail size={18} className="text-blue-600 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">Monthly Statement Email Dispatch</div>
                      <div className="text-[11px] text-slate-500">Receive comprehensive ledger breakdown at the end of each payroll cycle</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.emailMonthlyStatement}
                    onChange={() => handleTogglePref('emailMonthlyStatement')}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                  />
                </label>
              </div>

              {/* Test Dispatcher button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleTestDispatch}
                  disabled={isTestDispatching}
                  className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition disabled:opacity-50 cursor-pointer active:scale-98"
                >
                  <Send size={14} />
                  <span>{isTestDispatching ? 'Dispatching Live Test...' : 'Send Live Test SMS & Email Notification'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Notification List */
            <div className="space-y-2.5">
              {filteredNotifications.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <Bell size={32} className="mx-auto mb-2 opacity-40" />
                  <p className="text-xs font-bold">No notifications matching criteria</p>
                </div>
              ) : (
                filteredNotifications.map(item => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectNotif(item)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 relative ${
                      !item.isRead
                        ? 'bg-emerald-50/50 border-emerald-300 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {!item.isRead && (
                      <span className="w-2 h-2 rounded-full bg-emerald-600 absolute top-4 right-4 ring-2 ring-emerald-200"></span>
                    )}

                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      item.category === 'topup' ? 'bg-emerald-100 text-emerald-700' :
                      item.category === 'deduction' ? 'bg-blue-100 text-blue-700' :
                      item.category === 'loan' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {item.category === 'topup' ? <ArrowUpRight size={18} /> :
                       item.category === 'deduction' ? <FileText size={18} /> :
                       item.category === 'loan' ? <Smartphone size={18} /> : <Bell size={18} />}
                    </div>

                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-2">
                        <h4 className={`text-xs truncate ${!item.isRead ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                          {item.title}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                        {item.message}
                      </p>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-2">
                        <span className="flex items-center gap-1 font-mono">
                          <Clock size={11} /> {new Date(item.timestamp).toLocaleDateString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {item.channels.sms && (
                          <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                            <Smartphone size={10} /> SMS
                          </span>
                        )}
                        {item.channels.email && (
                          <span className="text-blue-700 font-bold flex items-center gap-0.5">
                            <Mail size={10} /> Email
                          </span>
                        )}
                      </div>
                    </div>

                    <ChevronRight size={16} className="text-slate-300 self-center shrink-0" />
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
