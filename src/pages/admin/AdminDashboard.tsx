import React from 'react';
import AdminLayout from './AdminLayout';
import { motion } from 'motion/react';

export default function AdminDashboard() {
  return (
    <AdminLayout role="Global Admin" icon="admin_panel_settings">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-1">
            <span className="material-symbols-outlined text-sm">analytics</span>
            System Overview
          </div>
          <h1 className="text-3xl font-extrabold text-on-surface tracking-tight">Global Admin Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white border border-surface-container-high rounded-full text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:bg-slate-50 transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">download</span>
            Export Report
          </button>
          <button className="px-4 py-2 bg-primary text-on-primary rounded-full text-xs font-bold uppercase tracking-widest hover:bg-primary-container transition-all flex items-center gap-2 shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-lg">settings_suggest</span>
            System Maintenance
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard label="Active Users" value="8,450" subValue="+12% from last month" icon="group" trend="up" />
        <StatCard label="System Load" value="12%" subValue="Optimal Performance" icon="speed" trend="stable" />
        <StatCard label="Security Alerts" value="0" subValue="All systems secure" icon="gpp_good" trend="stable" />
        <StatCard label="Pending Tasks" value="12" subValue="3 high priority" icon="list_alt" trend="down" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Management */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-surface-container-high">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-xl font-bold text-on-surface">Recent User Activity</h2>
              <p className="text-xs text-on-surface-variant mt-1">Real-time monitoring of system interactions</p>
            </div>
            <button className="text-primary text-xs font-bold uppercase tracking-widest hover:underline flex items-center gap-1">
              View All
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
          <div className="space-y-4">
            <UserActivityRow name="Amao Abdulhameed" role="Member" action="Updated Profile" time="5 mins ago" />
            <UserActivityRow name="Admin_Bursary" role="Bursary" action="Imported Payroll" time="15 mins ago" />
            <UserActivityRow name="John Smith" role="Member" action="Applied for Loan" time="1 hour ago" />
            <UserActivityRow name="Admin_Loans" role="Loans" action="Approved Loan #882" time="2 hours ago" />
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-surface-container-high">
          <h2 className="text-xl font-bold text-on-surface mb-8">System Health</h2>
          <div className="space-y-8">
            <HealthBar label="Database" percentage={98} status="Optimal" color="bg-emerald-500" />
            <HealthBar label="Storage" percentage={45} status="Stable" color="bg-blue-500" />
            <HealthBar label="API Response" percentage={99} status="Excellent" color="bg-emerald-500" />
          </div>
          <div className="mt-10 pt-8 border-t border-surface-container-high">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">security</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface">Security Protocol</p>
                  <p className="text-[10px] text-on-surface-variant uppercase font-medium">v2.4.1 Active</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-emerald-500">verified</span>
            </div>
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

function UserActivityRow({ name, role, action, time }: { name: string, role: string, action: string, time: string }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
          <span className="material-symbols-outlined">person</span>
        </div>
        <div>
          <p className="text-sm font-bold text-on-surface">{name}</p>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-tighter">{role}</span>
            <span className="text-xs text-on-surface-variant">{action}</span>
          </div>
        </div>
      </div>
      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{time}</p>
    </div>
  );
}

function HealthBar({ label, percentage, status, color }: { label: string, percentage: number, status: string, color: string }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">{label}</p>
          <p className="text-sm font-bold text-on-surface">{status}</p>
        </div>
        <p className="text-sm font-black text-on-surface">{percentage}%</p>
      </div>
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full ${color}`}
        ></motion.div>
      </div>
    </div>
  );
}
