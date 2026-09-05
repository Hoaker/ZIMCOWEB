import { BrowserRouter as Router, Routes, Route, useLocation, Link } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Services from './pages/Services';
import About from './pages/About';
import Contact from './pages/Contact';
import Register from './pages/Register';
import Placeholder from './pages/Placeholder';
import Portal from './pages/Portal';
import Login from './pages/Login';
import MemberLogin from './pages/MemberLogin';
import StaffLogin from './pages/StaffLogin';
import MemberDashboard from './pages/MemberDashboard';
import BursaryDashboard from './pages/admin/BursaryDashboard';
import EditDeductions from './pages/admin/EditDeductions';
import LoanDashboard from './pages/admin/LoanDashboard';
import AuditDashboard from './pages/admin/AuditDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import StockDashboard from './pages/admin/StockDashboard';
import RBACManager from './pages/admin/RBACManager';
import SupportDashboard from './pages/admin/SupportDashboard';
import Compliance from './pages/Compliance';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import DownloadSamples from './pages/DownloadSamples';
import TermsConsentBanner from './components/TermsConsentBanner';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Portal & Login Routes */}
        <Route path="/portal" element={<Portal />} />
        <Route path="/login" element={<Login />} />
        <Route path="/login/member" element={<MemberLogin />} />
        <Route path="/member-login" element={<MemberLogin />} />
        <Route path="/login/staff" element={<StaffLogin />} />
        <Route path="/staff-login" element={<StaffLogin />} />
        
        {/* Member Dashboard */}
        <Route path="/dashboard" element={<MemberDashboard />} />
        
        {/* Admin Dashboards */}
        <Route path="/admin/bursary" element={<BursaryDashboard />} />
        <Route path="/admin/bursary/deductions" element={<EditDeductions />} />
        <Route path="/admin/loans" element={<LoanDashboard />} />
        <Route path="/admin/audit" element={<AuditDashboard />} />
        <Route path="/admin/stock" element={<StockDashboard />} />
        <Route path="/admin/rbac" element={<RBACManager />} />
        <Route path="/admin/support" element={<SupportDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        
        {/* Download Samples Suite */}
        <Route path="/download-samples" element={<DownloadSamples />} />
        <Route path="/test-files" element={<DownloadSamples />} />

        {/* Main Layout */}
        <Route
          path="*"
          element={
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <div className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/join" element={<Register />} />
                  <Route path="/compliance" element={<Compliance />} />
                  <Route path="/faq" element={<Placeholder title="Frequently Asked Questions" />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="*" element={<Home />} />
                </Routes>
              </div>
              <Footer />
              <TermsConsentBanner />
              
              {/* Mobile Bottom Nav (from original design) */}
              <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-2xl z-50 px-6 py-4 rounded-t-3xl flex justify-between items-center border-t border-slate-100">
                <Link className="flex flex-col items-center gap-1 text-emerald-700 font-bold" to="/">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                  <span className="text-[10px] uppercase font-bold tracking-widest">Home</span>
                </Link>
                <Link className="flex flex-col items-center gap-1 text-slate-400" to="/services">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                  <span className="text-[10px] uppercase font-bold tracking-widest">Services</span>
                </Link>
                <Link className="flex flex-col items-center gap-1 text-slate-400" to="/login/member">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                  <span className="text-[10px] uppercase font-bold tracking-widest">Login</span>
                </Link>
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}
