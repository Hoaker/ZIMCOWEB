import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import zimcoLogo from '@/assets/images/zimco_logo_1780347665840.png';
import SessionTimeoutListener from '../../components/SessionTimeoutListener';
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  FileSpreadsheet, 
  Edit3, 
  Package, 
  ShieldCheck, 
  LifeBuoy, 
  FileText, 
  LogOut, 
  Search, 
  Bell, 
  HelpCircle,
  Plus,
  Activity
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  role: string;
  icon: string;
}

export default function AdminLayout({ children, role, icon }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('zimco_admin_sidebar_collapsed');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('zimco_admin_sidebar_collapsed', isCollapsed ? 'true' : 'false');
  }, [isCollapsed]);

  // Global Keyboard Shortcut: Cmd/Ctrl + B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'b' || e.key === 'B')) {
        e.preventDefault();
        setIsCollapsed(prev => !prev);
      } else if (e.key === 'Escape' && isMobileOpen) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileOpen]);

  // Auto close mobile drawer on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    navigate('/portal');
  };

  const navItems = [
    { to: '/admin', icon: <LayoutDashboard className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 shrink-0" />, label: 'Admin Dashboard' },
    { to: '/admin/bursary', icon: <FileSpreadsheet className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 shrink-0" />, label: 'Bursary & Member Directory' },
    { to: '/admin/bursary/deductions', icon: <Edit3 className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 shrink-0" />, label: 'Edit Deductions' },
  ];

  return (
    <div className="bg-slate-50 text-slate-900 antialiased flex min-h-screen relative font-sans">
      <SessionTimeoutListener onLogout={handleLogout} />

      {/* Mobile Backdrop Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[80] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Responsive Collapsible Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 bg-white border-r border-slate-200 flex flex-col
        transition-all duration-300 ease-in-out shrink-0
        ${isMobileOpen ? 'translate-x-0 w-72 shadow-2xl z-[90]' : '-translate-x-full lg:translate-x-0 z-40'}
        ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
      `}>
        {/* Header Branding & Collapse Toggle */}
        <div className={`px-3.5 py-4 border-b border-slate-100 flex items-center min-h-[72px] ${isCollapsed ? 'justify-center' : 'justify-between gap-2.5'}`}>
          {/* Desktop 3-line Menu Hamburger Toggle Button on Left */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-2 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors shrink-0 cursor-pointer"
            title={isCollapsed ? "Show / Expand sidebar menu (Ctrl+B)" : "Hide / Collapse sidebar menu (Ctrl+B)"}
            aria-label={isCollapsed ? "Expand sidebar menu" : "Hide sidebar menu"}
          >
            <Menu className="w-5 h-5 text-emerald-700" />
          </button>

          {/* Branding Logo & Title */}
          {(!isCollapsed || isMobileOpen) && (
            <div className="flex items-center gap-2.5 overflow-hidden flex-1">
              <img 
                src={zimcoLogo} 
                alt="ZIMCO Logo" 
                className="w-8 h-8 rounded-full object-cover shadow-sm ring-1 ring-emerald-500/20 shrink-0" 
                referrerPolicy="no-referrer" 
              />
              <div className="whitespace-nowrap transition-opacity duration-200 overflow-hidden">
                <div className="text-base font-black text-emerald-800 leading-tight truncate">ZIMCO</div>
                <div className="text-[9px] tracking-widest uppercase font-bold text-slate-400 truncate">Staff & Admin</div>
              </div>
            </div>
          )}

          {/* Mobile Close Button */}
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-2 text-slate-400 hover:text-slate-700 transition-colors ml-auto cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Badge Indicator */}
        {(!isCollapsed || isMobileOpen) && (
          <div className="px-4 py-3 bg-emerald-50/50 border-b border-emerald-500/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 truncate max-w-[170px]">
                {role}
              </span>
            </div>
            <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold uppercase">
              Staff
            </span>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setIsMobileOpen(false)}
                className={`
                  group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 text-xs font-bold tracking-wide
                  ${isCollapsed && !isMobileOpen ? 'lg:justify-center' : ''}
                  ${isActive 
                    ? 'bg-emerald-700 text-white shadow-md shadow-emerald-900/20' 
                    : 'text-slate-600 hover:bg-emerald-50/80 hover:text-emerald-700'
                  }
                `}
              >
                <span className={`shrink-0 transition-transform ${isActive ? 'scale-105' : 'group-hover:scale-110'}`}>
                  {item.icon}
                </span>
                {(!isCollapsed || isMobileOpen) && (
                  <span className="truncate transition-opacity duration-200">{item.label}</span>
                )}
                {isCollapsed && !isMobileOpen && (
                  <span className="hidden lg:group-hover:flex items-center gap-1 absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-semibold rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none border border-slate-700/50">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer Status & Health */}
        <div className="p-3 border-t border-slate-100 mt-auto bg-slate-50/50">
          {(!isCollapsed || isMobileOpen) ? (
            <div className="space-y-3">
              <div className="rounded-xl bg-white p-3 border border-slate-200/80 shadow-sm">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  <span>Audit Engine</span>
                  <span className="text-emerald-600 font-black">Online</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 animate-pulse" />
                  <p className="text-xs font-semibold text-slate-700">All Nodes Verified</p>
                </div>
              </div>

              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-200/80 hover:bg-rose-50 hover:text-rose-600 text-slate-700 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
              >
                <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Exit Portal</span>
              </button>
            </div>
          ) : (
            <div className="relative group">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                aria-label="Exit Portal (Logout)"
              >
                <LogOut className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </button>
              <span className="hidden lg:group-hover:block absolute left-full ml-3 px-2.5 py-1 bg-rose-900 text-white text-[11px] font-semibold rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none">
                Exit Portal
              </span>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${isCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-sm">
          <div className="flex items-center gap-3">
            {/* Mobile & Tablet Drawer Trigger */}
            <button 
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              aria-label="Open sidebar menu"
            >
              <Menu className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
            </button>

            {/* Global Quick Search Bar */}
            <div className="relative hidden md:block">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </span>
              <input 
                className="pl-9 pr-4 py-1.5 bg-slate-100 border-none rounded-full text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 w-64 lg:w-72 transition-all outline-none text-slate-800 placeholder-slate-400" 
                placeholder="Search staff, ledger, or members..." 
                type="text" 
              />
            </div>
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="flex items-center gap-2 text-slate-500">
              <button className="p-2 rounded-full hover:bg-slate-100 transition-all relative" title="Notifications">
                <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-4.5 md:h-4.5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full"></span>
              </button>
              <Link to="/compliance" className="p-2 rounded-full hover:bg-slate-100 transition-all" title="Compliance Framework">
                <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-4.5 md:h-4.5" />
              </Link>
            </div>

            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

            {/* Profile Dropdown */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-900 leading-tight">Admin & Staff Desk</p>
                <p className="text-[10px] text-emerald-700 uppercase font-extrabold">{role}</p>
              </div>
              <div 
                className="relative group cursor-pointer" 
                onClick={handleLogout}
                title="Click to Exit / Logout"
              >
                <div className="w-9 h-9 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-emerald-500/20">
                  {role.charAt(0)}
                </div>
                <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 max-w-full">
          <div className="max-w-7xl mx-auto w-full">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
