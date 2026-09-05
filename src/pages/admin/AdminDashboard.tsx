import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
import { motion } from 'motion/react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  BarChart3, 
  Download, 
  Settings, 
  Users, 
  Cpu, 
  ShieldCheck, 
  CheckSquare, 
  ArrowRight, 
  User, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  CheckCircle2,
  PiggyBank,
  ArrowUpRight,
  Calendar
} from 'lucide-react';

const ADMIN_TREND_DATA = [
  { month: 'Mar', fullMonth: 'March 2026', totalSavings: 38400000, monthlyInflow: 6200000, monthlyOutflow: 1800000, activeVolume: 8000000 },
  { month: 'Apr', fullMonth: 'April 2026', totalSavings: 42100000, monthlyInflow: 6850000, monthlyOutflow: 2100000, activeVolume: 8950000 },
  { month: 'May', fullMonth: 'May 2026', totalSavings: 46500000, monthlyInflow: 7400000, monthlyOutflow: 2300000, activeVolume: 9700000 },
  { month: 'Jun', fullMonth: 'June 2026', totalSavings: 50800000, monthlyInflow: 7900000, monthlyOutflow: 2600000, activeVolume: 10500000 },
  { month: 'Jul', fullMonth: 'July 2026', totalSavings: 55400000, monthlyInflow: 8350000, monthlyOutflow: 2450000, activeVolume: 10800000 },
  { month: 'Aug', fullMonth: 'August 2026', totalSavings: 61200000, monthlyInflow: 9100000, monthlyOutflow: 2700000, activeVolume: 11800000 },
];

export default function AdminDashboard() {
  const [chartMetric, setChartMetric] = useState<'savings_volume' | 'inflow_outflow'>('savings_volume');

  return (
    <AdminLayout role="Global Admin" icon="admin_panel_settings">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-1">
            <BarChart3 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            System Overview
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">Global Admin Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-white border border-surface-container-high rounded-xl text-[11px] sm:text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm cursor-pointer">
            <Download className="w-4 h-4 text-slate-600 shrink-0" />
            Export Report
          </button>
          <button className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-primary text-on-primary rounded-xl text-[11px] sm:text-xs font-bold uppercase tracking-widest hover:bg-primary-container transition-all flex items-center gap-2 shadow-lg shadow-primary/20 cursor-pointer">
            <Settings className="w-4 h-4 shrink-0" />
            System Maintenance
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard label="Active Users" value="8,450" subValue="+12% from last month" icon={<Users className="w-5 h-5" />} trend="up" />
        <StatCard label="System Load" value="12%" subValue="Optimal Performance" icon={<Cpu className="w-5 h-5" />} trend="stable" />
        <StatCard label="Security Alerts" value="0" subValue="All systems secure" icon={<ShieldCheck className="w-5 h-5" />} trend="stable" />
        <StatCard label="Pending Tasks" value="12" subValue="3 high priority" icon={<CheckSquare className="w-5 h-5" />} trend="down" />
      </div>

      {/* 6-Month Cooperative Savings & Transaction Trend Chart (Recharts) */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-surface-container-high mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              Cooperative Macro Analytics
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-on-surface">6-Month Savings & Transaction Growth</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">Aggregate pool growth and monthly turnover dynamics</p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setChartMetric('savings_volume')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                chartMetric === 'savings_volume' ? 'bg-white text-emerald-800 shadow-sm font-black' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Savings & Volume
            </button>
            <button
              type="button"
              onClick={() => setChartMetric('inflow_outflow')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                chartMetric === 'inflow_outflow' ? 'bg-white text-emerald-800 shadow-sm font-black' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Inflows vs Outflows
            </button>
          </div>
        </div>

        <div className="w-full h-72 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={ADMIN_TREND_DATA} margin={{ top: 10, right: 10, left: -5, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="month" tickLine={false} axisLine={{ stroke: '#E2E8F0' }} tick={{ fill: '#64748B', fontSize: 11, fontWeight: 600 }} />
              <YAxis 
                tickLine={false} 
                axisLine={false} 
                tick={{ fill: '#64748B', fontSize: 11 }} 
                tickFormatter={(val: number) => `₦${(val / 1000000).toFixed(1)}M`} 
              />
              <Tooltip 
                formatter={(val: any) => [`₦${Number(val).toLocaleString()}`, '']}
                labelFormatter={(label: any) => `Month: ${label}`}
                contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
              />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '12px', fontSize: '11px', fontWeight: 600 }} />

              {chartMetric === 'savings_volume' ? (
                <>
                  <Line type="monotone" name="Total Savings Pool (₦)" dataKey="totalSavings" stroke="#047857" strokeWidth={3.5} dot={{ r: 4, fill: '#047857', strokeWidth: 2, stroke: '#FFFFFF' }} activeDot={{ r: 7 }} />
                  <Line type="monotone" name="Monthly Active Volume (₦)" dataKey="activeVolume" stroke="#0284C7" strokeWidth={2.5} strokeDasharray="4 4" dot={{ r: 3.5, fill: '#0284C7', strokeWidth: 2, stroke: '#FFFFFF' }} />
                </>
              ) : (
                <>
                  <Line type="monotone" name="Monthly Inflows (₦)" dataKey="monthlyInflow" stroke="#0D9488" strokeWidth={3} dot={{ r: 4, fill: '#0D9488', strokeWidth: 2, stroke: '#FFFFFF' }} />
                  <Line type="monotone" name="Monthly Outflows (₦)" dataKey="monthlyOutflow" stroke="#E11D48" strokeWidth={2.5} strokeDasharray="5 5" dot={{ r: 4, fill: '#E11D48', strokeWidth: 2, stroke: '#FFFFFF' }} />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Management */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-surface-container-high">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-xl font-bold text-on-surface">Recent User Activity</h2>
              <p className="text-xs text-on-surface-variant mt-1">Real-time monitoring of system interactions</p>
            </div>
            <button className="text-primary text-xs font-bold uppercase tracking-widest hover:underline flex items-center gap-1 cursor-pointer">
              View All
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
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
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-surface-container-high">
          <h2 className="text-xl font-bold text-on-surface mb-8">System Health</h2>
          <div className="space-y-8">
            <HealthBar label="Database" percentage={98} status="Optimal" color="bg-emerald-500" />
            <HealthBar label="Storage" percentage={45} status="Stable" color="bg-blue-500" />
            <HealthBar label="API Response" percentage={99} status="Excellent" color="bg-emerald-500" />
          </div>
          <div className="mt-10 pt-8 border-t border-surface-container-high">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                  <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface">Security Protocol</p>
                  <p className="text-[10px] text-on-surface-variant uppercase font-medium">v2.4.1 Active</p>
                </div>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function StatCard({ label, value, subValue, icon, trend }: { label: string, value: string, subValue: string, icon: React.ReactNode, trend: 'up' | 'down' | 'stable' }) {
  const trendElement = trend === 'up' 
    ? <TrendingUp className="w-4 h-4 text-emerald-500 shrink-0" /> 
    : trend === 'down' 
    ? <TrendingDown className="w-4 h-4 text-rose-500 shrink-0" /> 
    : <Minus className="w-4 h-4 text-slate-400 shrink-0" />;

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-surface-container-high hover:shadow-md transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 group-hover:bg-primary/10 group-hover:text-primary transition-colors shrink-0">
          {icon}
        </div>
        {trendElement}
      </div>
      <div>
        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">{label}</p>
        <p className="text-xl sm:text-2xl font-black text-on-surface mb-1">{value}</p>
        <p className="text-[10px] font-medium text-on-surface-variant">{subValue}</p>
      </div>
    </div>
  );
}

function UserActivityRow({ name, role, action, time }: { name: string, role: string, action: string, time: string }) {
  return (
    <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
          <User className="w-4 h-4 text-slate-600" />
        </div>
        <div>
          <p className="text-xs sm:text-sm font-bold text-on-surface">{name}</p>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] sm:text-[10px] font-bold uppercase tracking-tighter">{role}</span>
            <span className="text-[11px] sm:text-xs text-on-surface-variant">{action}</span>
          </div>
        </div>
      </div>
      <p className="text-[9px] sm:text-[10px] font-bold text-on-surface-variant uppercase tracking-widest shrink-0">{time}</p>
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
