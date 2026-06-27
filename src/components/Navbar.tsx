import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Menu, X, User, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import zimcoLogo from '@/assets/images/zimco_logo_1780347665840.png';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Services', path: '/services' },
  { name: 'About', path: '/about' },
  { name: 'Compliance', path: '/compliance' },
  { name: 'Contact', path: '/contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();
  const [isDark, setIsDark] = React.useState(() => {
    const persisted = localStorage.getItem('theme');
    if (persisted) {
      return persisted === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  React.useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl shadow-[0px_20px_40px_rgba(25,28,29,0.04)] dark:shadow-[0px_20px_40px_rgba(0,0,0,0.3)] border-b border-transparent dark:border-white/5">
      <div className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto w-full">
        <Link to="/" className="flex items-center gap-2 text-2xl font-extrabold text-emerald-900 dark:text-white tracking-tighter font-headline">
          <img src={zimcoLogo} alt="ZIMCO Logo" className="w-8 h-8 rounded-full object-cover shadow-sm ring-1 ring-emerald-500/20" referrerPolicy="no-referrer" />
          <span>ZIMCO</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "font-manrope text-sm font-semibold tracking-tight transition-all pb-1 border-b-2",
                location.pathname === link.path
                  ? "text-emerald-700 dark:text-emerald-400 border-emerald-700 dark:border-emerald-400"
                  : "text-slate-600 dark:text-slate-300 border-transparent hover:text-emerald-700 dark:hover:text-emerald-400"
              )}
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link 
            to="/login" 
            className="hidden lg:flex items-center gap-2 font-manrope text-sm font-semibold tracking-tight text-slate-600 dark:text-slate-300 px-4 py-2 hover:bg-emerald-50/50 dark:hover:bg-slate-800/50 rounded-full transition-all"
          >
            <User className="w-4 h-4" />
            Member Login
          </Link>
          <Link 
            to="/join" 
            className="bg-primary text-on-primary px-6 py-2.5 rounded-full font-manrope text-sm font-semibold tracking-tight scale-95 active:scale-90 transition-transform"
          >
            Join Now
          </Link>

          {/* Theme Toggle */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsDark((prev) => !prev)}
            className="p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 cursor-pointer flex items-center justify-center border border-transparent dark:border-white/5"
            aria-label="Toggle Theme"
            id="theme-toggle-btn"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={isDark ? 'dark' : 'light'}
                initial={{ opacity: 0, rotate: -30 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 30 }}
                transition={{ duration: 0.15 }}
              >
                {isDark ? <Sun className="w-4.5 h-4.5 text-amber-500" /> : <Moon className="w-4.5 h-4.5 text-indigo-900 dark:text-indigo-400" />}
              </motion.div>
            </AnimatePresence>
          </motion.button>
          
          {/* Mobile Toggle */}
          <button 
            className="md:hidden p-2 text-slate-600 dark:text-slate-300"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-white/5 px-8 py-6 space-y-4 shadow-xl"
          >
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "block text-lg font-semibold",
                  location.pathname === link.path ? "text-emerald-700 dark:text-emerald-400" : "text-slate-600 dark:text-slate-300"
                )}
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="block text-lg font-semibold text-slate-600 dark:text-slate-300"
            >
              Member Login
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
