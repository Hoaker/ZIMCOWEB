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
  PhoneCall
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import zimcoLogo from '@/assets/images/zimco_logo_1780347665840.png';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginHovered, setIsLoginHovered] = useState(false);
  const loginTimeoutRef = useRef<NodeJS.Timeout | null>(null);
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

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-xl shadow-[0px_20px_40px_rgba(25,28,29,0.04)] border-b border-slate-100">
      <div className="flex justify-between items-center px-4 sm:px-8 py-3.5 sm:py-4 max-w-7xl mx-auto w-full">
        <Link to="/" className="flex items-center gap-2 text-xl sm:text-2xl font-extrabold text-emerald-900 tracking-tighter font-headline">
          <img src={zimcoLogo} alt="ZIMCO Logo" className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover shadow-sm ring-1 ring-emerald-500/20" referrerPolicy="no-referrer" />
          <span>ZIMCO</span>
        </Link>

        {/* Desktop Nav - Clean, Non-redundant */}
        <div className="hidden md:flex items-center space-x-7 lg:space-x-8">
          <Link
            to="/"
            className={cn(
              "text-xs sm:text-sm font-semibold tracking-tight transition-all pb-1 border-b-2",
              location.pathname === '/'
                ? "text-primary border-primary font-bold"
                : "text-on-surface-variant border-transparent hover:text-primary"
            )}
          >
            Home
          </Link>

          <Link
            to="/services"
            className={cn(
              "text-xs sm:text-sm font-semibold tracking-tight transition-all pb-1 border-b-2",
              location.pathname === '/services'
                ? "text-primary border-primary font-bold"
                : "text-on-surface-variant border-transparent hover:text-primary"
            )}
          >
            Services
          </Link>

          <Link
            to="/contact"
            className={cn(
              "text-xs sm:text-sm font-semibold tracking-tight transition-all pb-1 border-b-2",
              location.pathname === '/contact'
                ? "text-primary border-primary font-bold"
                : "text-on-surface-variant border-transparent hover:text-primary"
            )}
          >
            Contact & Support
          </Link>
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
                "flex items-center gap-1.5 text-xs sm:text-sm font-semibold tracking-tight px-3.5 sm:px-4 py-2 rounded-xl transition-all cursor-pointer",
                isLoginHovered || location.pathname.startsWith('/login')
                  ? "bg-primary/10 text-primary font-bold ring-1 ring-primary/20"
                  : "text-on-surface hover:bg-surface-container-low hover:text-primary"
              )}
              aria-expanded={isLoginHovered}
              aria-haspopup="true"
            >
              <span>Login</span>
              <ChevronDown 
                className={cn(
                  "w-3.5 h-3.5 text-on-surface-variant transition-transform duration-200",
                  isLoginHovered && "rotate-180 text-primary"
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
                  <div className="bg-surface-container-lowest rounded-2xl p-1.5 shadow-md border border-outline-variant/60">
                    {/* Member Login Option */}
                    <Link
                      to="/login/member"
                      onClick={() => setIsLoginHovered(false)}
                      className="group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-primary/10 text-on-surface hover:text-primary transition-all font-semibold text-xs sm:text-sm"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-on-primary transition-colors">
                        <Landmark className="w-4 h-4" />
                      </div>
                      <span className="flex-1">Member Portal</span>
                      <ArrowRight className="w-4 h-4 text-on-surface-variant/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </Link>

                    {/* Staff Login Option */}
                    <Link
                      to="/login/staff"
                      onClick={() => setIsLoginHovered(false)}
                      className="group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-container-low text-on-surface hover:text-primary transition-all font-semibold text-xs sm:text-sm"
                    >
                      <div className="w-8 h-8 rounded-lg bg-surface-container text-on-surface-variant flex items-center justify-center shrink-0 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <span className="flex-1">Staff / Bursary</span>
                      <ArrowRight className="w-4 h-4 text-on-surface-variant/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link 
            to="/join" 
            className="bg-primary hover:bg-primary/90 text-on-primary px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold tracking-tight scale-95 active:scale-90 transition-transform shadow-xs cursor-pointer"
          >
            Join Society
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
              
              <Link
                to="/contact"
                onClick={() => setIsOpen(false)}
                className={cn(
                  "block text-base font-bold py-1",
                  location.pathname === '/contact' ? "text-emerald-700" : "text-slate-700"
                )}
              >
                Contact & Support
              </Link>
            </div>

            {/* Mobile Portals Breakdown */}
            <div className="pt-4 border-t border-outline-variant/40">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-on-surface-variant block mb-2.5">
                Login Options
              </span>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login/member"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl bg-primary/10 text-primary hover:bg-primary/15 transition-colors font-bold text-xs sm:text-sm"
                >
                  <Landmark className="w-4 h-4" />
                  <span>Member Portal</span>
                </Link>

                <Link
                  to="/login/staff"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl bg-surface-container-low text-on-surface hover:bg-surface-container transition-colors font-bold text-xs sm:text-sm border border-outline-variant/50"
                >
                  <ShieldCheck className="w-4 h-4 text-on-surface-variant" />
                  <span>Staff Portal</span>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

