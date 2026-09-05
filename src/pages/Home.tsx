import { Link } from 'react-router-dom';
import { 
  Leaf, 
  Users, 
  Eye, 
  ArrowRight, 
  TrendingUp, 
  GraduationCap, 
  BookOpen, 
  Sparkles, 
  HandCoins, 
  ShieldCheck, 
  CheckCircle2 
} from 'lucide-react';
import { motion } from 'motion/react';

export default function Home() {
  return (
    <main className="pt-20">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary-container/40 z-10"></div>
          <img 
            className="w-full h-full object-cover" 
            alt="Modern office buildings" 
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="relative z-20 max-w-7xl mx-auto px-8 w-full">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary-container text-on-primary-container text-xs font-bold uppercase tracking-widest mb-6">
              Established 2012
            </span>
            <h1 className="font-headline text-5xl md:text-7xl font-extrabold text-white leading-[1.1] tracking-tighter mb-6">
              Ethical Growth, <br/>Collective Strength.
            </h1>
            <p className="text-xl text-white/90 font-body mb-10 max-w-lg leading-relaxed">
              Empowering your financial future through Nigeria's leading zero-interest co-operative society.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/join" className="bg-white text-primary px-8 py-4 rounded-full font-headline font-bold text-lg hover:bg-surface-container-low transition-all shadow-xl shadow-primary/20">
                Start Your Journey
              </Link>
              <Link to="/services" className="bg-transparent border-2 border-white/40 text-white backdrop-blur-sm px-8 py-4 rounded-full font-headline font-bold text-lg hover:bg-white/10 transition-all">
                View Our Services
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Core Mission Pillars */}
      <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 sm:mb-20 gap-6 sm:gap-8">
          <div className="max-w-xl">
            <h2 className="text-primary font-label font-bold uppercase tracking-[0.3em] text-xs sm:text-sm mb-3 sm:mb-4">Our Foundations</h2>
            <h3 className="font-headline text-3xl sm:text-4xl md:text-5xl font-extrabold text-on-surface tracking-tighter">Why ZIMCO Stands Apart?</h3>
          </div>
          <p className="text-on-surface-variant max-w-md text-sm sm:text-base md:text-lg leading-relaxed">
            We've built a financial ecosystem where ethics isn't an afterthought—it's the architecture of everything we do.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <motion.div 
            whileHover={{ y: -10 }}
            className="p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl bg-surface-container-low hover:bg-surface-container transition-all duration-500 group"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-5 sm:mb-8 group-hover:bg-primary group-hover:text-on-primary transition-all">
              <Leaf className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
            </div>
            <h4 className="font-headline text-xl sm:text-2xl font-bold mb-3 sm:mb-4">100% Interest-Free</h4>
            <p className="text-on-surface-variant text-sm sm:text-base leading-relaxed">True ethical finance means no hidden usury. We grow through shared equity and tangible asset investment, never through debt burden.</p>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -20 }}
            className="p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl bg-primary text-on-primary shadow-2xl shadow-primary/30 md:-translate-y-8 transition-all duration-500"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-white/20 flex items-center justify-center text-white mb-5 sm:mb-8">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
            </div>
            <h4 className="font-headline text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Community-Led</h4>
            <p className="text-white/80 text-sm sm:text-base leading-relaxed">ZIMCO is owned by its members. Every decision is made with the collective benefit in mind, ensuring our capital stays within the community.</p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -10 }}
            className="p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl bg-surface-container-low hover:bg-surface-container transition-all duration-500 group"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-5 sm:mb-8 group-hover:bg-primary group-hover:text-on-primary transition-all">
              <Eye className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
            </div>
            <h4 className="font-headline text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Total Transparency</h4>
            <p className="text-on-surface-variant text-sm sm:text-base leading-relaxed">View every investment, audit, and decision through our open-ledger policy. We believe trust is earned through visible integrity.</p>
          </motion.div>
        </div>
      </section>

      {/* Service Highlights - Financial Empowerment */}
      <section className="py-16 sm:py-24 md:py-28 bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 sm:mb-16 gap-4 sm:gap-6">
            <div>
              <span className="text-emerald-400 font-label font-bold uppercase tracking-[0.25em] text-[10px] sm:text-xs mb-2 sm:mb-3 block">
                Ethical Wealth Creation
              </span>
              <h2 className="font-headline text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tighter text-white">
                Financial Empowerment
              </h2>
            </div>
            <p className="text-slate-400 max-w-md text-sm sm:text-base leading-relaxed">
              Equipping members with zero-interest financing, asset acquisition tools, and dividend-yielding collective portfolios.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6">
            <div className="md:col-span-8 group relative rounded-2xl sm:rounded-[2rem] overflow-hidden min-h-[300px] sm:min-h-[380px] border border-white/10">
              <img 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-75" 
                alt="Thrift Savings" 
                src="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=2071&auto=format&fit=crop"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-5 sm:p-8 md:p-10 flex flex-col justify-end">
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold w-fit mb-3">
                  Systematic Accumulation
                </span>
                <h4 className="font-headline text-2xl sm:text-3xl font-bold mb-2">Thrift & Special Savings</h4>
                <p className="text-slate-300 max-w-md mb-4 sm:mb-6 text-xs sm:text-sm leading-relaxed">
                  Grow your liquid capital systematically through automated deductions, dedicated target savings, and annual dividend distributions.
                </p>
                <Link to="/services" className="flex items-center gap-2 font-bold text-emerald-400 group/link text-xs sm:text-sm">
                  Explore Savings Plans 
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover/link:translate-x-1.5 transition-transform" />
                </Link>
              </div>
            </div>

            <div className="md:col-span-4 group relative rounded-2xl sm:rounded-[2rem] overflow-hidden min-h-[300px] sm:min-h-[380px] border border-emerald-800/40 bg-gradient-to-b from-emerald-900 to-emerald-950 p-5 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl sm:rounded-2xl bg-white/10 flex items-center justify-center text-emerald-300 mb-4 sm:mb-6">
                  <HandCoins className="w-4.5 h-4.5 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                </div>
                <span className="px-3 py-1 bg-white/10 text-emerald-200 text-xs font-bold rounded-full uppercase tracking-wider mb-2 sm:mb-3 inline-block">
                  100% Usury-Free
                </span>
                <h4 className="font-headline text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-white">Zero-Interest Loans</h4>
                <p className="text-emerald-100/80 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6">
                  Access ethical revolving credit for personal expansion, SME inventory, and family milestones with no interest burden.
                </p>
              </div>
              <Link to="/join" className="inline-flex items-center justify-between p-3 sm:p-3.5 bg-white text-emerald-900 rounded-xl font-bold text-xs sm:text-sm hover:bg-emerald-50 transition-colors">
                <span>Check Eligibility</span>
                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-700" />
              </Link>
            </div>

            <div className="md:col-span-6 group relative rounded-2xl sm:rounded-[2rem] overflow-hidden min-h-[260px] sm:min-h-[300px] border border-white/10 p-5 sm:p-8 bg-slate-900 flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl sm:rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 sm:mb-6">
                  <TrendingUp className="w-4.5 h-4.5 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                </div>
                <h4 className="font-headline text-xl sm:text-2xl font-bold mb-2">Ethical Investment Pools</h4>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  Direct member participation in verified agricultural value chains, real estate syndicates, and bulk commodity trading pools.
                </p>
              </div>
              <div className="flex items-center gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-slate-800">
                <span className="text-[11px] sm:text-xs text-emerald-400 font-bold">12–18% Avg. Annual ROI</span>
                <span className="text-xs text-slate-500">•</span>
                <span className="text-[11px] sm:text-xs text-slate-400">Quarterly Audited</span>
              </div>
            </div>

            <div className="md:col-span-6 group relative rounded-2xl sm:rounded-[2rem] overflow-hidden min-h-[260px] sm:min-h-[300px] border border-white/10 p-5 sm:p-8 bg-slate-900 flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl sm:rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-4 sm:mb-6">
                  <ShieldCheck className="w-4.5 h-4.5 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                </div>
                <h4 className="font-headline text-xl sm:text-2xl font-bold mb-2">Commodity & Asset Financing</h4>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  Bulk purchasing power enables members to acquire home appliances, food staples, electronics, and land at wholesale rates with flexible installments.
                </p>
              </div>
              <div className="flex items-center gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-slate-800">
                <span className="text-[11px] sm:text-xs text-teal-400 font-bold">Zero Markup Inflation</span>
                <span className="text-xs text-slate-500">•</span>
                <span className="text-[11px] sm:text-xs text-slate-400">Verified Vendors</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Educational Services & Capacity Development */}
      <section className="py-16 sm:py-24 md:py-28 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto mb-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 sm:mb-16 gap-4 sm:gap-6">
          <div className="max-w-2xl">
            <span className="text-primary font-label font-bold uppercase tracking-[0.25em] text-[10px] sm:text-xs mb-2 sm:mb-3 block">
              Knowledge & Capability
            </span>
            <h2 className="font-headline text-3xl sm:text-4xl md:text-5xl font-extrabold text-on-surface tracking-tighter">
              Educational Services & Capacity Building
            </h2>
            <p className="text-on-surface-variant text-sm sm:text-base leading-relaxed mt-2 sm:mt-4">
              We believe true financial freedom begins with education. ZIMCO conducts structured training, scholarship programs, and business bootcamps for members and their households.
            </p>
          </div>
          <Link 
            to="/services" 
            className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-surface-container-low hover:bg-surface-container text-primary font-headline font-bold text-xs sm:text-sm transition-all flex items-center gap-2 self-start sm:self-auto"
          >
            All Programs <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <motion.div 
            whileHover={{ y: -8 }}
            className="p-6 sm:p-7 md:p-8 rounded-2xl sm:rounded-3xl bg-surface-container-low border border-slate-100 flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 sm:mb-6">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-primary uppercase tracking-widest block mb-1.5 sm:mb-2">Masterclasses</span>
              <h3 className="font-headline text-xl sm:text-2xl font-bold text-on-surface mb-2 sm:mb-3">Sharia Financial Literacy</h3>
              <p className="text-on-surface-variant text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6">
                Comprehensive workshops on non-interest accounting, wealth preservation, estate planning, and ethical household budgeting.
              </p>
            </div>
            <ul className="space-y-2 pt-3 sm:pt-4 border-t border-slate-200/60 text-xs font-semibold text-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" /> Monthly Webinar Series
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" /> Free Certificate of Completion
              </li>
            </ul>
          </motion.div>

          <motion.div 
            whileHover={{ y: -8 }}
            className="p-6 sm:p-7 md:p-8 rounded-2xl sm:rounded-3xl bg-surface-container-low border border-slate-100 flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4 sm:mb-6">
                <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-emerald-700 uppercase tracking-widest block mb-1.5 sm:mb-2">Support Fund</span>
              <h3 className="font-headline text-xl sm:text-2xl font-bold text-on-surface mb-2 sm:mb-3">Co-op Bursary & Student Support</h3>
              <p className="text-on-surface-variant text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6">
                Dedicated educational grants and tuition relief facilities for dependents of active cooperative members in accredited tertiary institutions.
              </p>
            </div>
            <ul className="space-y-2 pt-3 sm:pt-4 border-t border-slate-200/60 text-xs font-semibold text-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" /> Tuition Soft-Financing
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" /> Academic Merit Recognition
              </li>
            </ul>
          </motion.div>

          <motion.div 
            whileHover={{ y: -8 }}
            className="p-6 sm:p-7 md:p-8 rounded-2xl sm:rounded-3xl bg-surface-container-low border border-slate-100 flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4 sm:mb-6">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-amber-800 uppercase tracking-widest block mb-1.5 sm:mb-2">Incubation</span>
              <h3 className="font-headline text-xl sm:text-2xl font-bold text-on-surface mb-2 sm:mb-3">SME & Agritech Bootcamps</h3>
              <p className="text-on-surface-variant text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6">
                Hands-on coaching for cooperative entrepreneurs covering sustainable farming techniques, digital marketing, supply chain and bookkeeping.
              </p>
            </div>
            <ul className="space-y-2 pt-3 sm:pt-4 border-t border-slate-200/60 text-xs font-semibold text-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" /> 1-on-1 Business Mentorship
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" /> Seed Capital Matching
              </li>
            </ul>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

