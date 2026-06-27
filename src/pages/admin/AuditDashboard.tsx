import React from 'react';
import AdminLayout from './AdminLayout';

export default function AuditDashboard() {
  return (
    <AdminLayout role="Society Audit" icon="analytics">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-1">
            <span className="material-symbols-outlined text-sm">shield</span>
            Compliance & Oversight
          </div>
          <h1 className="text-3xl font-extrabold text-on-surface tracking-tight">Society Audit</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white border border-surface-container-high rounded-full text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:bg-slate-50 transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">download</span>
            Export Logs
          </button>
          <button className="px-4 py-2 bg-primary text-on-primary rounded-full text-xs font-bold uppercase tracking-widest hover:bg-primary-container transition-all flex items-center gap-2 shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-lg">description</span>
            Full Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <StatCard label="Total Assets" value="₦2.4B" subValue="Society-wide" icon="account_balance" trend="up" />
        <StatCard label="Total Liabilities" value="₦1.1B" subValue="Member savings" icon="trending_down" trend="down" />
        <StatCard label="Reserve Fund" value="₦450M" subValue="Statutory reserve" icon="savings" trend="up" />
        <StatCard label="Member Count" value="12,450" subValue="Active members" icon="group" trend="up" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Audit Logs Table */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-surface-container-high">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-xl font-bold text-on-surface">Audit Logs</h2>
              <p className="text-xs text-on-surface-variant mt-1">Real-time system and user activity logs</p>
            </div>
            <button className="text-primary text-xs font-bold uppercase tracking-widest hover:underline flex items-center gap-1">
              View All
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
          <div className="space-y-4">
            <LogEntry user="Admin_Bursary" action="Imported Payroll" time="2 mins ago" type="System" />
            <LogEntry user="Admin_Loans" action="Approved Loan #452" time="15 mins ago" type="Action" />
            <LogEntry user="System_Mainframe" action="Backup Completed" time="1 hour ago" type="System" />
            <LogEntry user="Admin_Audit" action="Exported Q1 Report" time="3 hours ago" type="Action" />
          </div>
        </div>

        {/* Financial Health Overview */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-surface-container-high">
          <h2 className="text-xl font-bold text-on-surface mb-8">Financial Health</h2>
          <div className="space-y-8">
            <HealthIndicator label="Asset Coverage Ratio" value="2.18x" status="Healthy" color="text-emerald-600" />
            <HealthIndicator label="Liquidity Ratio" value="1.45x" status="Stable" color="text-emerald-600" />
            <HealthIndicator label="Non-Performing Loans" value="2.4%" status="Low" color="text-emerald-600" />
          </div>
          <div className="mt-10 pt-8 border-t border-surface-container-high">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="material-symbols-outlined text-emerald-500">verified_user</span>
                <p className="text-xs font-bold text-on-surface uppercase tracking-widest">Compliance Status</p>
              </div>
              <p className="text-sm text-on-surface-variant">The society is currently compliant with all statutory reserve requirements and liquidity thresholds.</p>
            </div>
            <button className="w-full py-4 bg-primary text-on-primary rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-primary-container transition-all flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-lg">analytics</span>
              Run Full Diagnostic
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function StatCard({ label, value, subValue, icon, trend }: { label: string, value: string, subValue: string, icon: string, trend: 'up' | 'down' | 'stable' }) {
  const trendIcon = trend === 'up' ? 'trending_up' : trend === 'down' ? 'trending_down' : 'remove';
  const trendColor = trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-error' : 'text-slate-400';

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-surface-container-high hover:shadow-md transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-600 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
          <span className="material-symbols-outlined text-2xl">{icon}</span>
        </div>
        <span className={`material-symbols-outlined ${trendColor}`}>{trendIcon}</span>
      </div>
      <div>
        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl font-black text-on-surface mb-1">{value}</p>
        <p className="text-[10px] font-medium text-on-surface-variant">{subValue}</p>
      </div>
    </div>
  );
}

function LogEntry({ user, action, time, type }: { user: string, action: string, time: string, type: string }) {
  const typeColor = type === 'System' ? 'text-blue-600 bg-blue-50' : 'text-emerald-600 bg-emerald-50';
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${type === 'System' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
          <span className="material-symbols-outlined text-xl">{type === 'System' ? 'settings' : 'person'}</span>
        </div>
        <div>
          <p className="text-sm font-bold text-on-surface">{action}</p>
          <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-widest">{user} • {time}</p>
        </div>
      </div>
      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${typeColor}`}>{type}</span>
    </div>
  );
}

function HealthIndicator({ label, value, status, color }: { label: string, value: string, status: string, color: string }) {
  return (
    <div className="flex justify-between items-center p-4 rounded-2xl bg-slate-50 border border-slate-100">
      <div>
        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl font-black text-on-surface">{value}</p>
      </div>
      <div className="text-right">
        <p className={`text-sm font-bold ${color}`}>{status}</p>
        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Status</p>
      </div>
    </div>
  );
}
