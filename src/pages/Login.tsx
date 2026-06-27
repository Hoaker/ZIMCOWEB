import React, { useState } from 'react';
import AdminLoginForm from '../components/AdminLoginForm';
import zimcoLogo from '@/assets/images/zimco_logo_1780347665840.png';

export default function ZimcoLogin() {
  // 1. State to track user inputs and UI status
  const [coopId, setCoopId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'member' | 'admin'>('member');
  const [selectedRole, setSelectedRole] = useState<'Bursary Management' | 'Loan Approvals' | 'Society Audit' | 'Stock Management' | 'Admin' | null>(null);

  const [showTimeoutAlert, setShowTimeoutAlert] = useState(() => {
    const isAlert = localStorage.getItem('zimco_session_timeout_alert');
    if (isAlert === 'true') {
      localStorage.removeItem('zimco_session_timeout_alert');
      return true;
    }
    return false;
  });

  // 2. The Login Function triggered when they click "Secure Login"
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent the page from refreshing
    setErrorMessage('');
    setIsLoading(true);

    try {
      // 3. Simulated Login (Backend removed as requested)
      // We'll just wait for a second to show the loading state
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 4. Success! Save mock details to the browser
      localStorage.setItem('zimco_token', 'mock_token_12345');
      localStorage.setItem('zimco_role', 'member');
      localStorage.setItem('zimco_id', coopId || 'ZM-000000');

      // 5. Redirect them to the Dashboard
      window.location.href = '/dashboard'; 

    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToPortals = () => {
    setSelectedRole(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center font-sans pb-12">
      
      {/* Top Navigation Bar (Simplified) */}
      <nav className="w-full flex justify-between items-center py-4 px-8 bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center gap-2 text-xl font-black text-green-800 tracking-wider">
          <img src={zimcoLogo} alt="ZIMCO Logo" className="w-7 h-7 rounded-full object-cover shadow-sm ring-1 ring-emerald-500/20" referrerPolicy="no-referrer" />
          <span>ZIMCO</span>
        </div>
        <div className="flex space-x-6 text-sm font-medium text-gray-500">
          <button className="hover:text-green-800" onClick={() => window.location.href = '/'}>Home</button>
          <button className="text-green-800 border-b-2 border-green-800 pb-1">Profile</button>
        </div>
        <div className="text-gray-400">
          {/* Help Icon SVG */}
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
      </nav>

      <div className="w-full max-w-7xl px-4 flex flex-col items-center">
        {showTimeoutAlert && (
          <div 
            className="w-full max-w-md mt-8 p-5 bg-rose-50 border border-rose-250 border-rose-200 text-rose-950 rounded-2xl text-xs font-semibold flex items-start gap-3 shadow-md"
          >
            <div className="p-1.5 bg-rose-100 text-rose-700 rounded-lg shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <span className="font-extrabold block text-rose-950">Security Session Auto-Lock Terminated</span>
              <span className="text-rose-800/80 mt-1 block">Your session was automatically securely logged out due to inactivity to safeguard your private ledger balances.</span>
            </div>
          </div>
        )}
        {activeTab === 'member' ? (
          <div className="w-full max-w-md mt-6">
            {/* Main Login Card */}
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
              
              {/* Dark Green Header */}
              <div className="bg-[#0b5c36] p-6 text-white relative">
                <p className="text-xs font-semibold tracking-widest text-green-200 mb-1">SECURE GATEWAY</p>
                <h2 className="text-3xl font-bold">Welcome Back</h2>
                {/* Shield Icon */}
                <svg className="w-8 h-8 absolute top-6 right-6 text-green-300 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
              </div>

              <div className="p-8">
                {/* Toggle Tabs */}
                <div className="flex bg-gray-100 p-1 rounded-full mb-6">
                  <button 
                    onClick={() => setActiveTab('member')}
                    className={`flex-1 font-semibold py-2 rounded-full shadow-sm text-sm transition-all ${activeTab === 'member' ? 'bg-white text-green-800' : 'text-gray-500 hover:text-green-800'}`}
                  >
                    Member Login
                  </button>
                  <button 
                    onClick={() => setActiveTab('admin')}
                    className={`flex-1 font-medium py-2 rounded-full text-sm transition-all ${activeTab === 'admin' ? 'bg-white text-green-800' : 'text-gray-500 hover:text-green-800'}`}
                  >
                    Admin Access
                  </button>
                </div>

                {/* Encryption Badge */}
                <div className="flex items-center justify-center space-x-2 bg-green-50 text-green-800 text-xs font-bold py-2 px-4 rounded-lg mb-6 border border-green-100">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" clipRule="evenodd"></path>
                  </svg>
                  <span>SECURELY ENCRYPTED BY ZIMCO-TECH</span>
                </div>

                {/* Error Message Display */}
                {errorMessage && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium flex items-center animate-pulse">
                    <svg className="w-5 h-5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                    </svg>
                    {errorMessage}
                  </div>
                )}

                {/* Form Fields */}
                <form onSubmit={handleLogin}>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email or Member ID</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <input 
                        type="text" 
                        placeholder="ZM-000000" 
                        value={coopId}
                        onChange={(e) => setCoopId(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0b5c36] focus:bg-white transition-colors text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-semibold text-gray-700">Password</label>
                      <a href="#" className="text-xs font-bold text-[#0b5c36] hover:underline">Forgot Password?</a>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="••••••••" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0b5c36] focus:bg-white transition-colors text-sm"
                        required
                      />
                      <div 
                        className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <svg className={`h-5 w-5 transition-colors ${showPassword ? 'text-[#0b5c36]' : 'text-gray-400 hover:text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center mb-6">
                    <input type="checkbox" id="remember" className="h-4 w-4 text-[#0b5c36] focus:ring-[#0b5c36] border-gray-300 rounded" />
                    <label htmlFor="remember" className="ml-2 block text-sm text-gray-600">
                      Remember my secure session
                    </label>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-[#0b5c36] hover:bg-[#08482a] text-white font-bold py-3 px-4 rounded-xl flex justify-center items-center transition-colors shadow-lg shadow-green-900/20 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Authenticating...
                      </>
                    ) : (
                      <>
                        Secure Login 
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                        </svg>
                      </>
                    )}
                  </button>
                </form>

                {/* Footer Security Badges */}
                <div className="mt-8 text-center border-t border-gray-100 pt-6">
                  <div className="inline-flex items-center justify-center space-x-1 border border-green-200 text-green-700 bg-white rounded-full px-3 py-1 text-[10px] font-bold mb-3">
                    <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                    </svg>
                    <span>256-BIT SSL ENCRYPTED</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mb-4 max-w-xs mx-auto leading-relaxed">
                    Accessing this portal signifies your agreement to ZIMCO's security policies and data terms.
                  </p>
                  <div className="flex items-center justify-center text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Last Login: 2 Minutes Ago From Lagos, Nigeria
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Banner */}
            <div className="w-full max-w-md mt-6 rounded-2xl overflow-hidden relative h-24 bg-[#0b5c36] shadow-lg border border-[#08482a]">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-300 via-transparent to-transparent"></div>
              <div className="absolute inset-0 flex flex-col justify-center px-6 text-white z-10">
                <p className="text-sm font-bold">New Security Protocols</p>
                <p className="text-xs text-green-200">Learn how we protect your cooperative assets.</p>
              </div>
            </div>
          </div>
        ) : selectedRole ? (
          <div className="w-full max-w-md mt-12">
            <AdminLoginForm role={selectedRole} onBack={handleBackToPortals} />
          </div>
        ) : (
          <div className="w-full mt-12 flex flex-col items-center">
            {/* Header Section */}
            <div className="text-center max-w-2xl mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0b5c36]/10 text-[#0b5c36] font-label text-xs font-bold uppercase tracking-wider mb-6">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                Secure Administrator Access
              </div>
              <h1 className="font-headline text-4xl md:text-5xl font-extrabold text-[#0b5c36] tracking-tight mb-4">
                Select Your Admin Portal
              </h1>
              <p className="font-body text-gray-600 text-lg leading-relaxed">
                Choose the designated role to access your specific management dashboard. Your session will be monitored for security compliance.
              </p>
              
              {/* Tab Switcher for Admin View */}
              <div className="bg-gray-100 p-1.5 rounded-full flex mt-8 max-w-sm mx-auto">
                <button 
                  onClick={() => {
                    setActiveTab('member');
                    setSelectedRole(null);
                  }}
                  className={`flex-1 py-2.5 px-4 rounded-full text-sm font-semibold transition-all duration-300 ${activeTab === 'member' ? 'bg-white text-green-800 shadow-sm' : 'text-gray-500 hover:text-green-800'}`}
                >
                  Member Login
                </button>
                <button 
                  onClick={() => setActiveTab('admin')}
                  className={`flex-1 py-2.5 px-4 rounded-full text-sm font-semibold transition-all duration-300 ${activeTab === 'admin' ? 'bg-white text-green-800 shadow-sm' : 'text-gray-500 hover:text-green-800'}`}
                >
                  Admin Access
                </button>
              </div>
            </div>

            {/* Role Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
              {/* Card 1: Bursary Management */}
              <div className="group relative flex flex-col bg-white rounded-[2rem] p-8 shadow-[0_20px_40px_rgba(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_24px_48px_rgba(11,92,54,0.08)] transition-all duration-300">
                <div className="w-16 h-16 rounded-2xl bg-[#0b5c36]/10 flex items-center justify-center text-[#0b5c36] mb-8 group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined text-4xl">upload_file</span>
                </div>
                <h3 className="font-headline text-2xl font-bold text-[#0b5c36] mb-4">Bursary Management</h3>
                <p className="font-body text-gray-500 mb-10 flex-grow leading-relaxed">
                  Manage monthly salary deductions, account allocations, and financial imports.
                </p>
                <button 
                  onClick={() => setSelectedRole('Bursary Management')}
                  className="w-full py-4 px-6 bg-[#0b5c36] text-white rounded-full font-semibold flex items-center justify-center gap-2 group-hover:bg-[#08482a] transition-colors shadow-lg shadow-green-900/20 active:scale-95 duration-150"
                >
                  Enter Portal
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
              </div>

              {/* Card 2: Loan Approvals */}
              <div className="group relative flex flex-col bg-white rounded-[2rem] p-8 shadow-[0_20px_40px_rgba(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_24px_48px_rgba(11,92,54,0.08)] transition-all duration-300">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-8 group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined text-4xl">fact_check</span>
                </div>
                <h3 className="font-headline text-2xl font-bold text-[#0b5c36] mb-4">Loan Approvals</h3>
                <p className="font-body text-gray-500 mb-10 flex-grow leading-relaxed">
                  Review pending loan applications, assess risk scores, and manage guarantor confirmations.
                </p>
                <button 
                  onClick={() => setSelectedRole('Loan Approvals')}
                  className="w-full py-4 px-6 bg-[#0b5c36] text-white rounded-full font-semibold flex items-center justify-center gap-2 group-hover:bg-[#08482a] transition-colors shadow-lg shadow-green-900/20 active:scale-95 duration-150"
                >
                  Enter Portal
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
              </div>

              {/* Card 3: Society Audit */}
              <div className="group relative flex flex-col bg-white rounded-[2rem] p-8 shadow-[0_20px_40px_rgba(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_24px_48px_rgba(11,92,54,0.08)] transition-all duration-300">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 mb-8 group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
                </div>
                <h3 className="font-headline text-2xl font-bold text-[#0b5c36] mb-4">Society Audit</h3>
                <p className="font-body text-gray-500 mb-10 flex-grow leading-relaxed">
                  Access read-only financial logs, monitor asset-liability health, and export society-wide reports.
                </p>
                <button 
                  onClick={() => setSelectedRole('Society Audit')}
                  className="w-full py-4 px-6 bg-[#0b5c36] text-white rounded-full font-semibold flex items-center justify-center gap-2 group-hover:bg-[#08482a] transition-colors shadow-lg shadow-green-900/20 active:scale-95 duration-150"
                >
                  Enter Portal
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
              </div>

              {/* Card 4: Stock Management */}
              <div className="group relative flex flex-col bg-white rounded-[2rem] p-8 shadow-[0_20px_40px_rgba(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_24px_48px_rgba(11,92,54,0.08)] transition-all duration-300">
                <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 mb-8 group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined text-4xl">inventory_2</span>
                </div>
                <h3 className="font-headline text-2xl font-bold text-[#0b5c36] mb-4">Stock Management</h3>
                <p className="font-body text-gray-500 mb-10 flex-grow leading-relaxed">
                  Monitor cooperative inventory, manage commodity stocks, and track supply chain movements.
                </p>
                <button 
                  onClick={() => setSelectedRole('Stock Management')}
                  className="w-full py-4 px-6 bg-[#0b5c36] text-white rounded-full font-semibold flex items-center justify-center gap-2 group-hover:bg-[#08482a] transition-colors shadow-lg shadow-green-900/20 active:scale-95 duration-150"
                >
                  Enter Portal
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
              </div>

              {/* Card 5: Admin */}
              <div className="group relative flex flex-col bg-white rounded-[2rem] p-8 shadow-[0_20px_40px_rgba(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_24px_48px_rgba(11,92,54,0.08)] transition-all duration-300">
                <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 mb-8 group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>admin_panel_settings</span>
                </div>
                <h3 className="font-headline text-2xl font-bold text-[#0b5c36] mb-4">Admin</h3>
                <p className="font-body text-gray-500 mb-10 flex-grow leading-relaxed">
                  Full system oversight, user management, security configurations, and global society settings.
                </p>
                <button 
                  onClick={() => setSelectedRole('Admin')}
                  className="w-full py-4 px-6 bg-[#0b5c36] text-white rounded-full font-semibold flex items-center justify-center gap-2 group-hover:bg-[#08482a] transition-colors shadow-lg shadow-green-900/20 active:scale-95 duration-150"
                >
                  Enter Portal
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
              </div>
            </div>

            {/* Trust Badge */}
            <div className="mt-20 flex flex-col items-center gap-4">
              <div className="flex items-center gap-3 bg-white/50 backdrop-blur-sm px-5 py-2.5 rounded-full border border-gray-200">
                <span className="material-symbols-outlined text-[#0b5c36] text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
                <span className="font-label text-sm font-semibold text-[#0b5c36]">Securely Encrypted by ZIMCO-Tech</span>
              </div>
              <p className="font-body text-xs text-gray-400 tracking-wide">
                AES-256 Bit Encryption Active • Environment: Production-Mainframe
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
