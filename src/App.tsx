import { BrowserRouter as Router, Routes, Route, useLocation, Link } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Services from './pages/Services';
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
import AdminDashboard from './pages/admin/AdminDashboard';
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
        <Route path="/member/dashboard" element={<MemberDashboard />} />
        <Route path="/portal/member/dashboard" element={<MemberDashboard />} />
        <Route path="/member-dashboard" element={<MemberDashboard />} />
        
        {/* Admin & Bursary Dashboards */}
        <Route path="/admin/bursary" element={<BursaryDashboard />} />
        <Route path="/admin/bursary/deductions" element={<EditDeductions />} />
        <Route path="/admin/members" element={<BursaryDashboard />} />
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
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/support" element={<Contact />} />
                  <Route path="/join" element={<Register />} />
                  <Route path="/faq" element={<Placeholder title="Frequently Asked Questions" />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="*" element={<Home />} />
                </Routes>
              </div>
              <Footer />
              <TermsConsentBanner />
            </div>
          }
        />
      </Routes>
    </Router>
  );
}
