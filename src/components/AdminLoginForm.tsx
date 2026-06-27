import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

interface AdminLoginFormProps {
  role: 'Bursary Management' | 'Loan Approvals' | 'Society Audit' | 'Stock Management' | 'Admin';
  onBack: () => void;
}

export default function AdminLoginForm({ role, onBack }: AdminLoginFormProps) {
  const navigate = useNavigate();

  const getRoleIcon = () => {
    switch (role) {
      case 'Bursary Management': return 'upload_file';
      case 'Loan Approvals': return 'fact_check';
      case 'Society Audit': return 'analytics';
      case 'Stock Management': return 'inventory_2';
      case 'Admin': return 'admin_panel_settings';
      default: return 'security';
    }
  };

  const getRoleColor = () => {
    switch (role) {
      case 'Bursary Management': return 'text-primary bg-primary/10';
      case 'Loan Approvals': return 'text-secondary bg-secondary/10';
      case 'Society Audit': return 'text-tertiary bg-tertiary/10';
      case 'Stock Management': return 'text-amber-600 bg-amber-50';
      case 'Admin': return 'text-primary bg-primary/10';
      default: return 'text-primary bg-primary/10';
    }
  };

  const getFields = () => {
    switch (role) {
      case 'Bursary Management':
        return [
          { label: 'Employee ID', placeholder: 'EMP-000', icon: 'badge' },
          { label: 'Department Code', placeholder: 'FIN-01', icon: 'domain' },
        ];
      case 'Loan Approvals':
        return [
          { label: 'Officer ID', placeholder: 'OFF-000', icon: 'assignment_ind' },
          { label: 'Authorization Code', placeholder: 'AUTH-XXXX', icon: 'key' },
        ];
      case 'Society Audit':
        return [
          { label: 'Auditor ID', placeholder: 'AUD-000', icon: 'account_circle' },
          { label: 'License Number', placeholder: 'LIC-000000', icon: 'verified' },
        ];
      case 'Stock Management':
        return [
          { label: 'Storekeeper ID', placeholder: 'STK-000', icon: 'badge' },
          { label: 'Warehouse Code', placeholder: 'WH-01', icon: 'warehouse' },
        ];
      case 'Admin':
        return [
          { label: 'Admin ID', placeholder: 'ADM-000', icon: 'shield_person' },
          { label: 'Security Token', placeholder: 'TOKEN-XXXX', icon: 'vpn_key' },
        ];
      default:
        return [];
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate authentication and navigate to the correct dashboard
    switch (role) {
      case 'Bursary Management':
        navigate('/admin/bursary');
        break;
      case 'Loan Approvals':
        navigate('/admin/loans');
        break;
      case 'Society Audit':
        navigate('/admin/audit');
        break;
      case 'Stock Management':
        navigate('/admin/stock');
        break;
      case 'Admin':
        navigate('/admin/dashboard');
        break;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-[480px] relative"
    >
      <button 
        onClick={onBack}
        className="absolute -top-12 left-0 flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-semibold"
      >
        <span className="material-symbols-outlined">arrow_back</span>
        Back to Portals
      </button>

      <div className="glass-panel rounded-[2rem] shadow-[0_20px_40px_rgba(25,28,29,0.06)] overflow-hidden border border-white/20">
        <div className="bg-primary p-8 text-on-primary asymmetric-bg relative">
          <div className="flex flex-col gap-1">
            <span className="font-label text-xs uppercase tracking-[0.2em] opacity-80">Administrator Login</span>
            <h1 className="font-headline text-3xl font-extrabold tracking-tight">{role}</h1>
          </div>
          <div className="absolute top-8 right-8">
            <span className={`material-symbols-outlined text-4xl opacity-20`}>{getRoleIcon()}</span>
          </div>
        </div>

        <div className="p-8 pt-6">
          <div className="flex items-center gap-2 mb-8 bg-primary/5 border border-primary/10 px-3 py-1.5 rounded-lg w-fit">
            <span className="material-symbols-outlined text-primary text-sm">lock</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary font-label">Restricted Access • Level 3 Clearance</span>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            {getFields().map((field, idx) => (
              <div key={idx} className="space-y-2">
                <label className="font-label text-sm font-semibold text-on-surface-variant ml-1">{field.label}</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-on-surface-variant text-xl group-focus-within:text-primary transition-colors">{field.icon}</span>
                  </div>
                  <input 
                    className="w-full bg-surface-container-low border-none rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-on-surface-variant/40 font-medium" 
                    placeholder={field.placeholder} 
                    type="text"
                  />
                </div>
              </div>
            ))}

            <div className="space-y-2">
              <label className="font-label text-sm font-semibold text-on-surface-variant ml-1">Secure Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-on-surface-variant text-xl group-focus-within:text-primary transition-colors">lock_open</span>
                </div>
                <input 
                  className="w-full bg-surface-container-low border-none rounded-xl py-4 pl-12 pr-12 focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-on-surface-variant/40 font-medium" 
                  placeholder="••••••••" 
                  type="password"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 py-2">
              <label className="relative flex items-center cursor-pointer">
                <input className="peer h-5 w-5 rounded border-outline-variant text-primary focus:ring-primary/20 bg-surface-container-lowest transition-all" type="checkbox"/>
                <span className="ml-3 text-sm font-medium text-on-surface-variant">Require 2FA for this session</span>
              </label>
            </div>

            <button className="w-full bg-primary text-on-primary font-bold py-4 rounded-full shadow-lg shadow-primary/20 hover:bg-primary-container active:scale-[0.98] transition-all duration-200 flex justify-center items-center gap-2" type="submit">
              Authenticate Access
              <span className="material-symbols-outlined text-lg">verified_user</span>
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-surface-container flex flex-col items-center gap-4">
            <p className="text-[10px] text-on-surface-variant/60 text-center max-w-[320px] leading-relaxed uppercase tracking-widest font-bold">
              Warning: Unauthorized access attempts are logged and reported to ZIMCO Security.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
