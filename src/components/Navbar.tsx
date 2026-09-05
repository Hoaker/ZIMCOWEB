import React, { useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Menu, 
  X, 
  Landmark,
  ShieldCheck, 
  ChevronDown, 
  ArrowRight,
  Info,
  Scale,
  PhoneCall
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import zimcoLogo from '@/assets/images/zimco_logo_1780347665840.png';

const companySubLinks = [
  { 
    name: 'About Us', 
    desc: 'Our mission, heritage, and values',
    path: '/about',
    icon: Info
  },
  { 
    name: 'Compliance & Governance', 
    desc: 'Regulatory standards & ethics',
    path: '/compliance',
    icon: Scale
  },
  { 
    name: 'Contact & Support', 
    desc: 'Get in touch with our team',
    path: '/contact',
    icon: PhoneCall
  },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginHovered, setIsLoginHovered] = useState(false);
  const [isCompanyHovered, setIsCompanyHovered] = useState(false);
  const loginTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const companyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const location = useLocation();

  const handleLoginMouseEnter = () => {
    if (loginTimeoutRef.current) clearTimeout(loginTimeoutRef.current);
    setIsLoginHovered(true);
  };

  const handleLoginMouseLeave = () => {
    loginTimeoutRef.current = setTimeout(() => {
      setIsLoginHovered(false);
    }, 150);
  };

  const handleCompanyMouseEnter = () => {
    if (companyTimeoutRef.current) clearTimeout(companyTimeoutRef.current);
    setIsCompanyHovered(true);
  };

  const handleCompanyMouseLeave = () => {
    companyTimeoutRef.current = setTimeout(() => {
      setIsCompanyHovered(false);
    }, 150);
  };

  const isCompanyActive = companySubLinks.some(link => location.pathname === link.path);

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-xl shadow-[0px_20px_40px_rgba(25,28,29,0.04)] border-b border-slate-100">
      <div className="flex justify-between items-center px-4 sm:px-8 py-3.5 sm:py-4 max-w-7xl mx-auto w-full">
        <Link to="/" className="flex items-center gap-2 text-xl sm:text-2xl font-extrabold text-emerald-900 tracking-tighter font-headline">
          <img src={zimcoLogo} alt="ZIMCO Logo" className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover shadow-sm ring-1 ring-emerald-500/20" referrerPolicy="no-referrer" />
          <span>ZIMCO</span>
        </Link>

        {/* Desktop Nav - Clean & Grouped (Approach A) */}
        <div className="hidden md:flex items-center space-x-7 lg:space-x-8">
          <Link
            to="/"
            className={cn(
              "font-manrope text-sm font-semibold tracking-tight transition-all pb-1 border-b-2",
              location.pathname === '/'
                ? "text-emerald-700 border-emerald-700"
                : "text-slate-600 border-transparent hover:text-emerald-700"
            )}
          >
            Home
          </Link>

          <Link
            to="/services"
            className={cn(
              "font-manrope text-sm font-semibold tracking-tight transition-all pb-1 border-b-2",
              location.pathname === '/services'
                ? "text-emerald-700 border-emerald-700"
                : "text-slate-600 border-transparent hover:text-emerald-700"
            )}
          >
            Services
          </Link>

          {/* Company / Society Dropdown */}
          <div 
            className="relative"
            onMouseEnter={handleCompanyMouseEnter}
            onMouseLeave={handleCompanyMouseLeave}
          >
            <button
              type="button"
              onClick={() => setIsCompanyHovered(!isCompanyHovered)}
              className={cn(
                "flex items-center gap-1.5 font-manrope text-sm font-semibold tracking-tight transition-all pb-1 border-b-2 cursor-pointer",
                isCompanyActive || isCompanyHovered
                  ? "text-emerald-700 border-emerald-700"
                  : "text-slate-600 border-transparent hover:text-emerald-700"
              )}
              aria-expanded={isCompanyHovered}
              aria-haspopup="true"
            >
              <span>About Us</span>
              <ChevronDown 
                className={cn(
                  "w-3.5 h-3.5 text-slate-400 transition-transform duration-200",
                  isCompanyHovered && "rotate-180 text-emerald-700"
                )} 
              />
            </button>

            {/* Company Dropdown Menu */}
            <AnimatePresence>
              {isCompanyHovered && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute left-0 top-full pt-2 w-64 z-50 origin-top-left"
                >
                  <div className="bg-white rounded-2xl p-2 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.18)] border border-slate-100 ring-1 ring-slate-900/5 space-y-1">
                    {companySubLinks.map((item) => {
                      const Icon = item.icon;
                      const isItemActive = location.pathname === item.path;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setIsCompanyHovered(false)}
                          className={cn(
                            "group flex items-start gap-3 p-2.5 rounded-xl transition-all font-semibold text-sm",
                            isItemActive 
                              ? "bg-emerald-50 text-emerald-900" 
                              : "hover:bg-slate-50 text-slate-800 hover:text-emerald-900"
                          )}
                        >
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors mt-0.5",
                            isItemActive
                              ? "bg-emerald-600 text-white"
                              : "bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white"
                          )}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-bold leading-tight">{item.name}</div>
                            <div className="text-[11px] text-slate-400 font-normal mt-0.5 leading-snug">{item.desc}</div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {/* Desktop Hoverable Login Dropdown */}
          <div 
            className="relative hidden sm:block"
            onMouseEnter={handleLoginMouseEnter}
            onMouseLeave={handleLoginMouseLeave}
          >
            <button 
              type="button"
              onClick={() => setIsLoginHovered(!isLoginHovered)}
              className={cn(
                "flex items-center gap-1.5 font-manrope text-xs sm:text-sm font-semibold tracking-tight px-3.5 sm:px-4 py-2 rounded-full transition-all cursor-pointer",
                isLoginHovered || location.pathname.startsWith('/login')
                  ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200"
                  : "text-slate-700 hover:bg-slate-100/80 hover:text-emerald-800"
              )}
              aria-expanded={isLoginHovered}
              aria-haspopup="true"
            >
              <span>Login</span>
              <ChevronDown 
                className={cn(
                  "w-3.5 h-3.5 text-slate-400 transition-transform duration-200",
                  isLoginHovered && "rotate-180 text-emerald-700"
                )} 
              />
            </button>

            {/* Hover Floating Menu */}
            <AnimatePresence>
              {isLoginHovered && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute right-0 top-full pt-2 w-56 z-50 origin-top-right"
                >
                  <div className="bg-white rounded-2xl p-1.5 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.18)] border border-slate-100 ring-1 ring-slate-900/5">
                    {/* Member Login Option */}
                    <Link
                      to="/login/member"
                      onClick={() => setIsLoginHovered(false)}
                      className="group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 transition-all font-semibold text-sm"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <Landmark className="w-4 h-4" />
                      </div>
                      <span className="flex-1">Member</span>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all" />
                    </Link>

                    {/* Staff Login Option */}
                    <Link
                      to="/login/staff"
                      onClick={() => setIsLoginHovered(false)}
                      className="group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 text-slate-800 hover:text-slate-950 transition-all font-semibold text-sm"
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <span className="flex-1">Staff</span>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link 
            to="/join" 
            className="bg-primary hover:bg-emerald-800 text-on-primary px-4 sm:px-6 py-2 sm:py-2.5 rounded-full font-manrope text-xs sm:text-sm font-semibold tracking-tight scale-95 active:scale-90 transition-transform shadow-sm"
          >
            Join Now
          </Link>
          
          {/* Mobile Toggle */}
          <button 
            className="md:hidden p-1.5 sm:p-2 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-white border-t border-slate-100 px-6 py-6 space-y-5 shadow-xl max-h-[85vh] overflow-y-auto"
          >
            <div className="space-y-3">
              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className={cn(
                  "block text-base font-bold py-1",
                  location.pathname === '/' ? "text-emerald-700" : "text-slate-700"
                )}
              >
                Home
              </Link>
              <Link
                to="/services"
                onClick={() => setIsOpen(false)}
                className={cn(
                  "block text-base font-bold py-1",
                  location.pathname === '/services' ? "text-emerald-700" : "text-slate-700"
                )}
              >
                Services
              </Link>
              
              <div className="pt-2">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 block mb-2">
                  About ZIMCO
                </span>
                <div className="space-y-2 pl-2 border-l-2 border-emerald-100">
                  {companySubLinks.map((subLink) => (
                    <Link
                      key={subLink.path}
                      to={subLink.path}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "block text-sm font-semibold py-1",
                        location.pathname === subLink.path ? "text-emerald-700 font-bold" : "text-slate-600"
                      )}
                    >
                      {subLink.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile Portals Breakdown */}
            <div className="pt-4 border-t border-slate-100">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 block mb-2.5">
                Login Options
              </span>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login/member"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl bg-emerald-50 text-emerald-900 hover:bg-emerald-100 transition-colors font-bold text-sm"
                >
                  <Landmark className="w-4 h-4 text-emerald-700" />
                  <span>Member</span>
                </Link>

                <Link
                  to="/login/staff"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-100 text-slate-900 hover:bg-slate-200 transition-colors font-bold text-sm"
                >
                  <ShieldCheck className="w-4 h-4 text-slate-700" />
                  <span>Staff</span>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

