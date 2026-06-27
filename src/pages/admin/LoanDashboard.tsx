import React from 'react';
import AdminLayout from './AdminLayout';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const RISK_DATA = [
  { name: 'Low Risk', value: 85, color: '#10b981' }, // emerald-500
  { name: 'Medium Risk', value: 25, color: '#f59e0b' }, // amber-500
  { name: 'High Risk', value: 14, color: '#f43f5e' }, // rose-500
];

export default function LoanDashboard() {
  return (
    <AdminLayout role="Loan Approvals" icon="fact_check">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-[0.2em] mb-1">
            <span className="material-symbols-outlined text-sm">assignment</span>
            Credit Operations
          </div>
          <h1 className="text-4xl font-black text-on-surface tracking-tight font-headline">Loan Approvals</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-5 py-2.5 bg-white border border-surface-container-high rounded-xl text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
            <span className="material-symbols-outlined text-lg">download</span>
            Export Data
          </button>
          <button className="px-5 py-2.5 bg-primary text-on-primary rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-primary-container transition-all flex items-center gap-2 shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-lg">analytics</span>
            Risk Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard label="Pending Applications" value="124" subValue="Requires review" icon="assignment" trend="up" />
        <StatCard label="Approved (This Month)" value="45" subValue="₦12.5M disbursed" icon="check_circle" trend="stable" />
        <StatCard label="Total Loan Volume" value="₦450.0M" subValue="Active portfolio" icon="account_balance" trend="up" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pending Applications Table */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 shadow-sm border border-surface-container-high">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-2xl font-black text-on-surface font-headline">Pending Applications</h2>
              <p className="text-xs text-on-surface-variant mt-1 font-medium">Review and authorize member loan requests</p>
            </div>
            <button className="text-primary text-[10px] font-bold uppercase tracking-widest hover:underline flex items-center gap-1">
              View All
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
          
          <div className="overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-surface-container-high">
                  <th className="pb-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Applicant</th>
                  <th className="pb-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Amount</th>
                  <th className="pb-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Risk Level</th>
                  <th className="pb-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <LoanRow name="John Doe" amount="₦5,000,000" risk="Low" date="Mar 25, 2026" />
                <LoanRow name="Jane Smith" amount="₦2,500,000" risk="Medium" date="Mar 24, 2026" />
                <LoanRow name="Samuel Ade" amount="₦10,000,000" risk="High" date="Mar 23, 2026" />
                <LoanRow name="Grace Ojo" amount="₦1,200,000" risk="Low" date="Mar 22, 2026" />
              </tbody>
            </table>
          </div>
        </div>

        {/* Risk Assessment Overview */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-surface-container-high flex flex-col">
          <h2 className="text-2xl font-black text-on-surface mb-6 font-headline">Risk Assessment</h2>
          
          <div className="h-64 w-full mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={RISK_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {RISK_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-6 flex-1">
            {RISK_DATA.map((item) => (
              <RiskItem key={item.name} label={item.name} count={item.value} color={item.color} />
            ))}
          </div>

          <div className="mt-10 pt-8 border-t border-surface-container-high">
            <button className="w-full py-4 bg-primary text-on-primary rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-primary-container transition-all flex items-center justify-center gap-2 shadow-md">
              <span className="material-symbols-outlined text-lg">security</span>
              Update Risk Model
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
    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-surface-container-high hover:shadow-md transition-all group relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[4rem] -mr-8 -mt-8 group-hover:bg-primary/10 transition-colors"></div>
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-600 group-hover:bg-primary group-hover:text-on-primary transition-all duration-300">
          <span className="material-symbols-outlined text-2xl">{icon}</span>
        </div>
        <div className={`flex items-center gap-1 ${trendColor} bg-white px-2 py-1 rounded-full text-[10px] font-bold border border-surface-container-high shadow-sm`}>
          <span className="material-symbols-outlined text-sm">{trendIcon}</span>
          {trend !== 'stable' && (trend === 'up' ? '+12%' : '-5%')}
        </div>
      </div>
      <div className="relative z-10">
        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.15em] mb-2">{label}</p>
        <p className="text-3xl font-black text-on-surface mb-1 font-headline tracking-tight">{value}</p>
        <p className="text-[10px] font-medium text-on-surface-variant/70">{subValue}</p>
      </div>
    </div>
  );
}

function LoanRow({ name, amount, risk, date }: { name: string, amount: string, risk: string, date: string }) {
  const riskColor = risk === 'Low' ? 'text-emerald-600 bg-emerald-50' : risk === 'Medium' ? 'text-amber-600 bg-amber-50' : 'text-rose-600 bg-rose-50';
  return (
    <tr className="group hover:bg-slate-50/50 transition-colors">
      <td className="py-5">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-white transition-colors">
            <span className="material-symbols-outlined">person</span>
          </div>
          <div>
            <p className="text-sm font-bold text-on-surface">{name}</p>
            <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-widest">{date}</p>
          </div>
        </div>
      </td>
      <td className="py-5">
        <p className="text-sm font-black text-on-surface font-headline">{amount}</p>
      </td>
      <td className="py-5">
        <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${riskColor}`}>
          {risk} Risk
        </span>
      </td>
      <td className="py-5 text-right">
        <button className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary hover:bg-primary hover:text-on-primary transition-all shadow-sm border border-surface-container-high">
          <span className="material-symbols-outlined text-xl">chevron_right</span>
        </button>
      </td>
    </tr>
  );
}

interface RiskItemProps {
  label: string;
  count: number;
  color: string;
}

const RiskItem: React.FC<RiskItemProps> = ({ label, count, color }) => {
  const total = 124;
  const percentage = (count / total) * 100;
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{label}</p>
        <p className="text-xs font-black text-on-surface">{Math.round(percentage)}%</p>
      </div>
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${percentage}%`, backgroundColor: color }}></div>
      </div>
    </div>
  );
};
