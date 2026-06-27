import React from 'react';
import AdminLayout from './AdminLayout';
import { motion } from 'motion/react';

export default function RBACManager() {
  return (
    <AdminLayout role="Security Admin" icon="rule">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-1">
            <span className="material-symbols-outlined text-sm">security</span>
            Security Control
          </div>
          <h1 className="text-3xl font-extrabold text-on-surface tracking-tight">RBAC Manager</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white border border-surface-container-high rounded-full text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:bg-slate-50 transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">history</span>
            Audit Logs
          </button>
          <button className="px-4 py-2 bg-primary text-on-primary rounded-full text-xs font-bold uppercase tracking-widest hover:bg-primary-container transition-all flex items-center gap-2 shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-lg">add</span>
            New Role
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard label="Total Roles" value="12" subValue="3 custom roles" icon="shield_person" />
        <StatCard label="Active Admins" value="24" subValue="Across 4 departments" icon="admin_panel_settings" />
        <StatCard label="Permissions" value="156" subValue="Granular controls" icon="key" />
        <StatCard label="Security Score" value="98%" subValue="Excellent" icon="verified_user" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Roles List */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-surface-container-high">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-xl font-bold text-on-surface">Roles Overview</h2>
              <p className="text-xs text-on-surface-variant mt-1">Manage system access levels and assignments</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <span className="material-symbols-outlined text-sm">filter_list</span>
                </span>
                <select className="pl-8 pr-4 py-1.5 bg-slate-50 border-none rounded-full text-[10px] font-bold uppercase tracking-widest text-on-surface-variant focus:ring-2 focus:ring-primary/20 outline-none appearance-none">
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
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-surface-container-high">
          <h2 className="text-xl font-bold text-on-surface mb-8">Permission Settings</h2>
          <div className="space-y-6">
            <PermissionToggle label="User Management" description="Create, edit and delete users" active />
            <PermissionToggle label="Financial Records" description="Access bursary and payroll data" active />
            <PermissionToggle label="Loan Approval" description="Authorize and sign loan applications" />
            <PermissionToggle label="System Config" description="Modify global society settings" />
            <PermissionToggle label="Audit Access" description="View detailed system audit logs" active />
          </div>
          <div className="mt-10 pt-8 border-t border-surface-container-high">
            <button className="w-full py-4 bg-primary text-on-primary rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-primary-container transition-all">
              Save Permissions
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function StatCard({ label, value, subValue, icon }: { label: string, value: string, subValue: string, icon: string }) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-surface-container-high">
      <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-600 mb-4">
        <span className="material-symbols-outlined text-2xl">{icon}</span>
      </div>
      <div>
        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl font-black text-on-surface mb-1">{value}</p>
        <p className="text-[10px] font-medium text-on-surface-variant">{subValue}</p>
      </div>
    </div>
  );
}

function RoleRow({ name, type, users, permissions, active = false }: { name: string, type: string, users: number, permissions: number, active?: boolean }) {
  return (
    <div className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${active ? 'bg-primary/5 border-primary/20' : 'bg-white border-slate-100 hover:border-primary/10 hover:bg-slate-50'}`}>
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${active ? 'bg-primary text-on-primary' : 'bg-slate-100 text-slate-600'}`}>
          <span className="material-symbols-outlined">{active ? 'verified_user' : 'person'}</span>
        </div>
        <div>
          <p className="text-sm font-bold text-on-surface">{name}</p>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold uppercase tracking-tighter px-2 py-0.5 rounded-full ${type === 'System' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>{type}</span>
            <span className="text-[10px] text-on-surface-variant font-medium uppercase tracking-widest">{users} Users • {permissions} Permissions</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="p-2 text-slate-400 hover:text-primary transition-colors">
          <span className="material-symbols-outlined text-lg">edit</span>
        </button>
        <button className="p-2 text-slate-400 hover:text-error transition-colors">
          <span className="material-symbols-outlined text-lg">delete</span>
        </button>
      </div>
    </div>
  );
}

function PermissionToggle({ label, description, active = false }: { label: string, description: string, active?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1">
        <p className="text-sm font-bold text-on-surface">{label}</p>
        <p className="text-[10px] text-on-surface-variant leading-tight">{description}</p>
      </div>
      <button className={`w-10 h-5 rounded-full transition-all relative ${active ? 'bg-primary' : 'bg-slate-200'}`}>
        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${active ? 'right-1' : 'left-1'}`}></div>
      </button>
    </div>
  );
}
