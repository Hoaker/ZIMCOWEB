import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminLoginForm from '../components/AdminLoginForm';
import zimcoLogo from '@/assets/images/zimco_logo_1780347665840.png';

export default function Portal() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'member' | 'admin'>('member');
  const [selectedRole, setSelectedRole] = useState<'Bursary Management' | 'Loan Approvals' | 'Society Audit' | 'Admin' | null>(null);

  const [showTimeoutAlert, setShowTimeoutAlert] = useState(() => {
    const isAlert = localStorage.getItem('zimco_session_timeout_alert');
    if (isAlert === 'true') {
      localStorage.removeItem('zimco_session_timeout_alert');
      return true;
    }
    return false;
  });

  const handleBackToPortals = () => {
    setSelectedRole(null);
  };

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen flex flex-col">
      {/* TopAppBar Mapping */}
      <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm dark:shadow-none">
        <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2 text-emerald-900 dark:text-emerald-50 font-black font-headline text-lg tracking-tight">
              <img src={zimcoLogo} alt="ZIMCO Logo" className="w-6 h-6 rounded-full object-cover shadow-sm ring-1 ring-emerald-500/20" referrerPolicy="no-referrer" />
              <span>ZIMCO</span>
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link className="text-slate-500 dark:text-slate-400 font-medium hover:text-emerald-600 transition-colors" to="/">Home</Link>
            <a className="text-emerald-700 dark:text-emerald-300 font-bold border-b-2 border-emerald-700" href="#">Profile</a>
          </nav>
          <div className="flex items-center gap-4">
            {activeTab === 'admin' && (
              <>
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
                  <span className="material-symbols-outlined text-primary text-sm">verified_user</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Admin Session Active</span>
                </div>
                <button 
                  onClick={() => {
                    setActiveTab('member');
                    setSelectedRole(null);
                  }}
                  className="p-2 rounded-full hover:bg-surface-container-high transition-colors"
                >
                  <span className="material-symbols-outlined text-on-surface-variant">logout</span>
                </button>
              </>
            )}
            <span className="material-symbols-outlined text-on-surface-variant">help_outline</span>
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center pt-24 pb-12 px-4 relative overflow-hidden">
        {/* Abstract Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-40">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary-container/20 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-secondary-container/20 rounded-full blur-[80px]"></div>
        </div>

        {activeTab === 'member' ? (
          <div className="w-full max-w-[480px] relative">
            {showTimeoutAlert && (
              <div 
                className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-900 rounded-2xl text-xs font-semibold flex items-start gap-3 shadow-md"
              >
                <div className="p-1.5 bg-rose-100 text-rose-700 rounded-lg shrink-0">
                  <span className="material-symbols-outlined text-sm">security_update_warning</span>
                </div>
                <div>
                  <span className="font-extrabold block text-rose-950">Security Session Auto-Lock Terminated</span>
                  <span className="text-rose-800/80 mt-1 block">Your session was automatically securely logged out due to inactivity to safeguard your private ledger balances.</span>
                </div>
              </div>
            )}
            {/* Asymmetric Accent */}
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-primary/10 rounded-full -z-10"></div>
            <div className="glass-panel rounded-[2rem] shadow-[0_20px_40px_rgba(25,28,29,0.06)] overflow-hidden border border-white/20">
              {/* Card Header with Asymmetric Pattern */}
              <div className="bg-primary p-8 text-on-primary asymmetric-bg relative">
                <div className="flex flex-col gap-1">
                  <span className="font-label text-xs uppercase tracking-[0.2em] opacity-80">Secure Gateway</span>
                  <h1 className="font-headline text-3xl font-extrabold tracking-tight">Welcome Back</h1>
                </div>
                <div className="absolute top-8 right-8">
                  <span className="material-symbols-outlined text-4xl opacity-20">shield_lock</span>
                </div>
              </div>

              <div className="p-8 pt-6">
                {/* Tab Switcher */}
                <div className="bg-surface-container-low p-1.5 rounded-full flex mb-8">
                  <button 
                    onClick={() => navigate('/login')}
                    className={`flex-1 py-2.5 px-4 rounded-full text-sm font-semibold transition-all duration-300 ${activeTab === 'member' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
                  >
                    Member Login
                  </button>
                  <button 
                    onClick={() => setActiveTab('admin')}
                    className={`flex-1 py-2.5 px-4 rounded-full text-sm font-semibold transition-all duration-300 ${activeTab === 'admin' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
                  >
                    Admin Access
                  </button>
                </div>

                {/* Login Form */}
                <div className="flex items-center gap-2 mb-6 bg-primary/5 border border-primary/10 px-3 py-1.5 rounded-lg w-fit">
                  <span className="material-symbols-outlined text-primary text-sm">security</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary font-label">Securely Encrypted by ZIMCO-Tech</span>
                </div>

                <form className="space-y-6" onSubmit={(e) => {
                  e.preventDefault();
                  navigate('/dashboard');
                }}>
                  {/* Email/ID Field */}
                  <div className="space-y-2">
                    <label className="font-label text-sm font-semibold text-on-surface-variant ml-1">Email or Member ID</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-on-surface-variant text-xl group-focus-within:text-primary transition-colors">badge</span>
                      </div>
                      <input 
                        className="w-full bg-surface-container-low border-none rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-on-surface-variant/40 font-medium" 
                        placeholder="ZM-000000" 
                        type="text"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center ml-1">
                      <label className="font-label text-sm font-semibold text-on-surface-variant">Password</label>
                      <a className="text-xs font-bold text-primary hover:underline" href="#">Forgot Password?</a>
                    </div>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-on-surface-variant text-xl group-focus-within:text-primary transition-colors">lock_open</span>
                      </div>
                      <input 
                        className="w-full bg-surface-container-low border-none rounded-xl py-4 pl-12 pr-12 focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-on-surface-variant/40 font-medium" 
                        placeholder="••••••••" 
                        type="password"
                      />
                      <button className="absolute inset-y-0 right-0 pr-4 flex items-center text-on-surface-variant hover:text-primary transition-colors" type="button">
                        <span className="material-symbols-outlined text-xl">visibility</span>
                      </button>
                    </div>
                  </div>

                  {/* Options Row */}
                  <div className="flex items-center gap-3 py-2">
                    <label className="relative flex items-center cursor-pointer">
                      <input className="peer h-5 w-5 rounded border-outline-variant text-primary focus:ring-primary/20 bg-surface-container-lowest transition-all" type="checkbox"/>
                      <span className="ml-3 text-sm font-medium text-on-surface-variant">Remember my secure session</span>
                    </label>
                  </div>

                  {/* CTA Button */}
                  <button className="w-full bg-primary text-on-primary font-bold py-4 rounded-full shadow-lg shadow-primary/20 hover:bg-primary-container active:scale-[0.98] transition-all duration-200 flex justify-center items-center gap-2" type="submit">
                    Secure Login
                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                  </button>
                </form>

                {/* Footer Badge Section */}
                <div className="mt-8 pt-6 border-t border-surface-container flex flex-col items-center gap-4">
                  <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-1.5 rounded-full">
                    <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary">256-bit SSL Encrypted</span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant/60 text-center max-w-[280px] leading-relaxed">
                    Accessing this portal signifies your agreement to ZIMCO's security policies and data terms.
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-center gap-2 opacity-60">
                  <span className="material-symbols-outlined text-xs">history</span>
                  <p className="text-[10px] font-medium font-label uppercase tracking-widest">
                    Last login: 2 minutes ago from Lagos, Nigeria
                  </p>
                </div>
              </div>
            </div>

            {/* Supporting Decorative Image */}
            <div className="mt-8 rounded-2xl overflow-hidden relative h-48 shadow-lg group">
              <img 
                alt="Secure Banking Technology" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuASN7_C0km4yZKm8KELGESDPyLQ7wFBC9V1CL6MUeryN_XU7XpOMUSaaPfzVJFCQhoZOzULT9Bb1TWMi367DKXIIcNo0_JYzoRQqnb1El_J9TKUYwcqgKKvDIeI4e0QIi3fk2IXy_78tdSpLDyEuWc_8X9l3-GrGcpeBp_dbWUTEOQP-BYxryGQxf6DlcqlllDliJNcPYpbAWoTWJk_vtLAbz8YlNNMqsO_Sms9e5YnD-ML-Q5dmNIBzoO285tFU2FQQK9bBb11aT3A"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent flex flex-col justify-end p-6">
                <p className="text-white text-sm font-bold">New Security Protocols</p>
                <p className="text-white/70 text-xs">Learn how we protect your cooperative assets.</p>
              </div>
            </div>
          </div>
        ) : selectedRole ? (
          <AdminLoginForm role={selectedRole} onBack={handleBackToPortals} />
        ) : (
          <div className="w-full max-w-7xl flex flex-col items-center">
            {/* Header Section */}
            <div className="text-center max-w-2xl mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary font-label text-xs font-bold uppercase tracking-wider mb-6">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                Secure Administrator Access
              </div>
              <h1 className="font-headline text-4xl md:text-5xl font-extrabold text-primary tracking-tight mb-4">
                Select Your Admin Portal
              </h1>
              <p className="font-body text-on-surface-variant text-lg leading-relaxed">
                Choose the designated role to access your specific management dashboard. Your session will be monitored for security compliance.
              </p>
              
              {/* Tab Switcher for Admin View */}
              <div className="bg-surface-container-low p-1.5 rounded-full flex mt-8 max-w-sm mx-auto">
                <button 
                  onClick={() => {
                    setActiveTab('member');
                    setSelectedRole(null);
                  }}
                  className={`flex-1 py-2.5 px-4 rounded-full text-sm font-semibold transition-all duration-300 ${activeTab === 'member' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
                >
                  Member Login
                </button>
                <button 
                  onClick={() => setActiveTab('admin')}
                  className={`flex-1 py-2.5 px-4 rounded-full text-sm font-semibold transition-all duration-300 ${activeTab === 'admin' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
                >
                  Admin Access
                </button>
              </div>
            </div>

            {/* Role Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
              {/* Card 1: Bursary Management */}
              <div className="glass-panel group relative flex flex-col bg-surface-container-lowest rounded-[2rem] p-8 shadow-[0_20px_40px_rgba(25,28,29,0.04)] border border-white/40 hover:shadow-[0_24px_48px_rgba(0,99,58,0.08)] transition-all duration-300">
                <div className="w-16 h-16 rounded-2xl bg-primary-container/10 flex items-center justify-center text-primary mb-8 group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined text-4xl">upload_file</span>
                </div>
                <h3 className="font-headline text-2xl font-bold text-primary mb-4">Bursary Management</h3>
                <p className="font-body text-on-surface-variant mb-10 flex-grow leading-relaxed">
                  Manage monthly salary deductions, account allocations, and financial imports.
                </p>
                <button 
                  onClick={() => setSelectedRole('Bursary Management')}
                  className="w-full py-4 px-6 bg-primary text-on-primary rounded-full font-semibold flex items-center justify-center gap-2 group-hover:bg-primary-container transition-colors shadow-lg shadow-primary/20 active:scale-95 duration-150"
                >
                  Enter Portal
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
              </div>

              {/* Card 2: Loan Approvals */}
              <div className="glass-panel group relative flex flex-col bg-surface-container-lowest rounded-[2rem] p-8 shadow-[0_20px_40px_rgba(25,28,29,0.04)] border border-white/40 hover:shadow-[0_24px_48px_rgba(0,99,58,0.08)] transition-all duration-300">
                <div className="w-16 h-16 rounded-2xl bg-secondary-container/10 flex items-center justify-center text-secondary mb-8 group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined text-4xl">fact_check</span>
                </div>
                <h3 className="font-headline text-2xl font-bold text-primary mb-4">Loan Approvals</h3>
                <p className="font-body text-on-surface-variant mb-10 flex-grow leading-relaxed">
                  Review pending loan applications, assess risk scores, and manage guarantor confirmations.
                </p>
                <button 
                  onClick={() => setSelectedRole('Loan Approvals')}
                  className="w-full py-4 px-6 bg-primary text-on-primary rounded-full font-semibold flex items-center justify-center gap-2 group-hover:bg-primary-container transition-colors shadow-lg shadow-primary/20 active:scale-95 duration-150"
                >
                  Enter Portal
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
              </div>

              {/* Card 3: Society Audit */}
              <div className="glass-panel group relative flex flex-col bg-surface-container-lowest rounded-[2rem] p-8 shadow-[0_20px_40px_rgba(25,28,29,0.04)] border border-white/40 hover:shadow-[0_24px_48px_rgba(0,99,58,0.08)] transition-all duration-300">
                <div className="w-16 h-16 rounded-2xl bg-tertiary-container/10 flex items-center justify-center text-tertiary mb-8 group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
                </div>
                <h3 className="font-headline text-2xl font-bold text-primary mb-4">Society Audit</h3>
                <p className="font-body text-on-surface-variant mb-10 flex-grow leading-relaxed">
                  Access read-only financial logs, monitor asset-liability health, and export society-wide reports.
                </p>
                <button 
                  onClick={() => setSelectedRole('Society Audit')}
                  className="w-full py-4 px-6 bg-primary text-on-primary rounded-full font-semibold flex items-center justify-center gap-2 group-hover:bg-primary-container transition-colors shadow-lg shadow-primary/20 active:scale-95 duration-150"
                >
                  Enter Portal
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
              </div>

              {/* Card 4: Admin */}
              <div className="glass-panel group relative flex flex-col bg-surface-container-lowest rounded-[2rem] p-8 shadow-[0_20px_40px_rgba(25,28,29,0.04)] border border-white/40 hover:shadow-[0_24px_48px_rgba(0,99,58,0.08)] transition-all duration-300">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-8 group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>admin_panel_settings</span>
                </div>
                <h3 className="font-headline text-2xl font-bold text-primary mb-4">Admin</h3>
                <p className="font-body text-on-surface-variant mb-10 flex-grow leading-relaxed">
                  Full system oversight, user management, security configurations, and global society settings.
                </p>
                <button 
                  onClick={() => setSelectedRole('Admin')}
                  className="w-full py-4 px-6 bg-primary text-on-primary rounded-full font-semibold flex items-center justify-center gap-2 group-hover:bg-primary-container transition-colors shadow-lg shadow-primary/20 active:scale-95 duration-150"
                >
                  Enter Portal
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
              </div>
            </div>

            {/* Trust Badge */}
            <div className="mt-20 flex flex-col items-center gap-4">
              <div className="flex items-center gap-3 bg-surface-container-high/50 backdrop-blur-sm px-5 py-2.5 rounded-full border border-outline-variant/20">
                <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
                <span className="font-label text-sm font-semibold text-primary">Securely Encrypted by ZIMCO-Tech</span>
              </div>
              <p className="font-body text-xs text-on-surface-variant/60 tracking-wide">
                AES-256 Bit Encryption Active • Environment: Production-Mainframe
              </p>
            </div>
          </div>
        )}
      </main>

      {/* BottomNavBar Mapping (Mobile Only) */}
      <footer className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)] rounded-t-3xl z-50">
        <Link className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 px-5 py-2 active:scale-90 transition-transform duration-150" to="/">
          <span className="material-symbols-outlined">home</span>
          <span className="font-inter text-[11px] font-semibold uppercase tracking-wider">Home</span>
        </Link>
        <a className="flex flex-col items-center justify-center bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-100 rounded-2xl px-5 py-2 active:scale-90 transition-transform duration-150" href="#">
          <span className="material-symbols-outlined">person</span>
          <span className="font-inter text-[11px] font-semibold uppercase tracking-wider">Profile</span>
        </a>
      </footer>
    </div>
  );
}
