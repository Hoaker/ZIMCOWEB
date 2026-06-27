import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import zimcoLogo from '@/assets/images/zimco_logo_1780347665840.png';
import SessionTimeoutListener from '../../components/SessionTimeoutListener';

interface AdminLayoutProps {
  children: React.ReactNode;
  role: string;
  icon: string;
}

export default function AdminLayout({ children, role, icon }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const handleLogout = () => {
    navigate('/portal');
  };

  return (
    <div className="bg-surface text-on-surface antialiased flex min-h-screen relative">
      <SessionTimeoutListener onLogout={handleLogout} />
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* SideNavBar */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-slate-50 dark:bg-slate-900 border-r-0 z-[70] flex flex-col transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        shrink-0 overflow-y-auto custom-scrollbar
      `}>
        <div className="px-6 py-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={zimcoLogo} alt="ZIMCO Logo" className="w-8 h-8 rounded-full object-cover shadow-sm ring-1 ring-emerald-500/20" referrerPolicy="no-referrer" />
            <div>
              <div className="text-xl font-black text-emerald-800 dark:text-emerald-400">ZIMCO</div>
              <div className="text-[10px] tracking-widest uppercase font-bold text-slate-400 mt-0.5">Admin Management</div>
            </div>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 text-slate-400 hover:text-emerald-600 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <nav className="flex-1 px-2 space-y-1">
          <SidebarLink to="/admin" icon="dashboard" label="Dashboard" active={location.pathname === '/admin'} onClick={() => setIsSidebarOpen(false)} />
          <SidebarLink to="/admin/members" icon="group" label="Members" active={location.pathname === '/admin/members'} onClick={() => setIsSidebarOpen(false)} />
          <SidebarLink to="/admin/bursary" icon="payments" label="Bursary" active={location.pathname === '/admin/bursary'} onClick={() => setIsSidebarOpen(false)} />
          <SidebarLink to="/admin/bursary/deductions" icon="edit_note" label="Edit Deductions" active={location.pathname === '/admin/bursary/deductions'} onClick={() => setIsSidebarOpen(false)} />
          <SidebarLink to="/admin/rbac" icon="rule" label="RBAC Manager" active={location.pathname === '/admin/rbac'} fillIcon onClick={() => setIsSidebarOpen(false)} />
          <SidebarLink to="/admin/support" icon="support_agent" label="Tickets Helpdesk" active={location.pathname === '/admin/support'} onClick={() => setIsSidebarOpen(false)} />
          <SidebarLink to="/admin/audit" icon="history" label="Audit Logs" active={location.pathname === '/admin/audit'} onClick={() => setIsSidebarOpen(false)} />
          <SidebarLink to="/admin/settings" icon="settings" label="Settings" active={location.pathname === '/admin/settings'} onClick={() => setIsSidebarOpen(false)} />
        </nav>
        <div className="p-6 mt-auto">
          <button className="w-full bg-primary text-on-primary py-3 rounded-full font-bold shadow-lg shadow-primary/20 hover:bg-primary-container transition-all mb-4 text-xs uppercase tracking-widest flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-lg">add</span>
            Create Role
          </button>
          <div className="rounded-xl bg-primary/5 p-4 border border-primary/10">
            <p className="text-[10px] font-bold text-primary uppercase tracking-tighter">System Health</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <p className="text-xs font-medium text-on-surface-variant">All Systems Nominal</p>
            </div>
          </div>
        </div>
      </aside>

      {/* TopNavBar */}
      <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 flex items-center justify-between px-4 md:px-8 z-30 bg-white/80 backdrop-blur-md shadow-sm border-b border-surface-container-high">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div className="relative hidden md:block">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <span className="material-symbols-outlined text-lg">search</span>
            </span>
            <input 
              className="pl-10 pr-4 py-1.5 bg-slate-50 border-none rounded-full text-sm focus:ring-2 focus:ring-primary/20 w-80 transition-all outline-none" 
              placeholder="Search roles, permissions or audit logs..." 
              type="text" 
            />
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 text-slate-500">
            <button className="hover:text-primary transition-all relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full border border-white"></span>
            </button>
            <button className="hover:text-primary transition-all">
              <span className="material-symbols-outlined">help_outline</span>
            </button>
          </div>
          <div className="h-8 w-px bg-slate-200"></div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-bold text-on-surface">Admin User</p>
              <p className="text-[10px] text-on-surface-variant uppercase font-medium">{role}</p>
            </div>
            <div className="relative group cursor-pointer" onClick={handleLogout}>
              <img 
                alt="Admin Profile" 
                className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/10" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhZuHUJNV7EAF7Dkb6htsixMU5B1xdOoD569WjEsGab2LYn405q4Le5zcBXkMl4tlRuSnVeyvWylomcZkh0uBGetSBAE9aFPvcrjET5VVAr2VfCiRln9B9R8smkK7hkF6CPWLKh57kRmX0G-RFIce0uMVcQiOOtokwhv3CgV4RLQX9VuSoc_COeKmQD9AR2j86MynLdcGmoaChKfh1Nj5BBNX16j-e6XRoAmyyqFXwQJ1TjHqNgVoNQsV4Sn7M2A65GJ3YHFRCvH1c" 
              />
              <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-sm">logout</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="lg:ml-64 pt-24 pb-12 px-4 md:px-10 min-h-screen w-full overflow-y-auto custom-scrollbar">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </div>
      </main>

      {/* Mobile Support */}
      <div className="md:hidden fixed bottom-6 right-6 z-50">
        <button className="w-16 h-16 rounded-full bg-primary text-on-primary shadow-2xl flex items-center justify-center active:scale-95 transition-all">
          <span className="material-symbols-outlined text-3xl">add</span>
        </button>
      </div>
    </div>
  );
}

function SidebarLink({ to, icon, label, active = false, fillIcon = false, onClick }: { to: string, icon: string, label: string, active?: boolean, fillIcon?: boolean, onClick?: () => void }) {
  return (
    <Link 
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 transition-all duration-200 rounded-lg ${
        active 
          ? 'text-emerald-900 dark:text-emerald-100 font-bold border-r-4 border-emerald-700 dark:border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20 opacity-90 rounded-l-lg' 
          : 'text-slate-600 dark:text-slate-400 font-medium hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/10'
      }`}
    >
      <span 
        className="material-symbols-outlined" 
        style={fillIcon || active ? { fontVariationSettings: "'FILL' 1" } : {}}
      >
        {icon}
      </span>
      <span className="text-xs tracking-wide uppercase">{label}</span>
    </Link>
  );
}
