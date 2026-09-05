import React from 'react';
import AdminLayout from './AdminLayout';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  History, 
  Plus, 
  Shield, 
  Users, 
  Key, 
  CheckCircle2, 
  Filter, 
  User, 
  Edit3, 
  Trash2 
} from 'lucide-react';

export default function RBACManager() {
  return (
    <AdminLayout role="Security Admin" icon="rule">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-[10px] sm:text-xs uppercase tracking-widest mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            Security Control
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">RBAC Manager</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-white border border-surface-container-high rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:bg-slate-50 transition-all flex items-center gap-1.5 sm:gap-2 shadow-sm cursor-pointer">
            <History className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            Audit Logs
          </button>
          <button className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-primary text-on-primary rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-widest hover:bg-primary-container transition-all flex items-center gap-1.5 sm:gap-2 shadow-lg shadow-primary/20 cursor-pointer">
            <Plus className="w-3.5 h-3.5 shrink-0" />
            New Role
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard label="Total Roles" value="12" subValue="3 custom roles" icon={<Shield className="w-5 h-5" />} />
        <StatCard label="Active Admins" value="24" subValue="Across 4 departments" icon={<Users className="w-5 h-5" />} />
        <StatCard label="Permissions" value="156" subValue="Granular controls" icon={<Key className="w-5 h-5" />} />
        <StatCard label="Security Score" value="98%" subValue="Excellent" icon={<CheckCircle2 className="w-5 h-5" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Roles List */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 sm:p-8 shadow-sm border border-surface-container-high">
          <div className="flex justify-between items-center mb-6 sm:mb-8">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-on-surface">Roles Overview</h2>
              <p className="text-xs text-on-surface-variant mt-1">Manage system access levels and assignments</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Filter className="w-3.5 h-3.5 shrink-0" />
                </span>
                <select className="pl-8 pr-4 py-1.5 bg-slate-50 border-none rounded-xl text-[10px] font-bold uppercase tracking-widest text-on-surface-variant focus:ring-2 focus:ring-primary/20 outline-none appearance-none">
                  <option>All Roles</option>
                  <option>System</option>
                  <option>Custom</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <RoleRow name="Global Admin" type="System" users={3} permissions={156} active />
            <RoleRow name="Bursary Manager" type="System" users={5} permissions={42} />
            <RoleRow name="Loan Officer" type="System" users={8} permissions={28} />
            <RoleRow name="Audit Specialist" type="System" users={2} permissions={12} />
            <RoleRow name="Member Support" type="Custom" users={6} permissions={15} />
          </div>
        </div>

        {/* Permission Settings */}
        <div className="bg-white rounded-2xl p-5 sm:p-8 shadow-sm border border-surface-container-high">
          <h2 className="text-lg sm:text-xl font-bold text-on-surface mb-6 sm:mb-8">Permission Settings</h2>
          <div className="space-y-6">
            <PermissionToggle label="User Management" description="Create, edit and delete users" active />
            <PermissionToggle label="Financial Records" description="Access bursary and payroll data" active />
            <PermissionToggle label="Loan Approval" description="Authorize and sign loan applications" />
            <PermissionToggle label="System Config" description="Modify global society settings" />
            <PermissionToggle label="Audit Access" description="View detailed system audit logs" active />
          </div>
          <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-surface-container-high">
            <button className="w-full py-3.5 sm:py-4 bg-primary text-on-primary rounded-xl font-bold text-[10px] sm:text-xs uppercase tracking-widest hover:bg-primary-container transition-all cursor-pointer shadow-md">
              Save Permissions
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function StatCard({ label, value, subValue, icon }: { label: string, value: string, subValue: string, icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-surface-container-high">
      <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 mb-4 shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">{label}</p>
        <p className="text-xl sm:text-2xl font-black text-on-surface mb-1">{value}</p>
        <p className="text-[10px] font-medium text-on-surface-variant">{subValue}</p>
      </div>
    </div>
  );
}

function RoleRow({ name, type, users, permissions, active = false }: { name: string, type: string, users: number, permissions: number, active?: boolean }) {
  return (
    <div className={`flex items-center justify-between p-4 sm:p-5 rounded-xl border transition-all ${active ? 'bg-primary/5 border-primary/20' : 'bg-white border-slate-100 hover:border-primary/10 hover:bg-slate-50'}`}>
      <div className="flex items-center gap-3 sm:gap-4">
        <div className={`w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0 ${active ? 'bg-primary text-on-primary' : 'bg-slate-100 text-slate-600'}`}>
          {active ? <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-white" /> : <User className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />}
        </div>
        <div>
          <p className="text-xs sm:text-sm font-bold text-on-surface">{name}</p>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-tighter px-2.5 py-0.5 rounded-full ${type === 'System' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>{type}</span>
            <span className="text-[9px] sm:text-[10px] text-on-surface-variant font-medium uppercase tracking-widest">{users} Users • {permissions} Perms</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        <button className="p-1.5 sm:p-2 text-slate-400 hover:text-primary transition-colors cursor-pointer" title="Edit Role">
          <Edit3 className="w-4 h-4" />
        </button>
        <button className="p-1.5 sm:p-2 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer" title="Delete Role">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function PermissionToggle({ label, description, active = false }: { label: string, description: string, active?: boolean }) {
  const [isActive, setIsActive] = React.useState(active);
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1">
        <p className="text-sm font-bold text-on-surface">{label}</p>
        <p className="text-[10px] text-on-surface-variant leading-tight">{description}</p>
      </div>
      <button 
        type="button"
        onClick={() => setIsActive(!isActive)}
        className={`w-10 h-5 rounded-full transition-all relative cursor-pointer ${isActive ? 'bg-primary' : 'bg-slate-200'}`}
      >
        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${isActive ? 'right-1' : 'left-1'}`}></div>
      </button>
    </div>
  );
}
