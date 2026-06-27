import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  PiggyBank, 
  HandCoins, 
  TrendingUp, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2,
  UserPlus,
  Zap,
  Lock
} from 'lucide-react';

export default function Services() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-blue-50 -z-10" />
        <div className="max-w-7xl mx-auto px-8 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold mb-6">
              Our Financial Ecosystem
            </span>
            <h1 className="font-headline text-5xl md:text-7xl font-extrabold text-slate-900 mb-6 tracking-tight leading-[1.1]">
              Our Ethical <br />
              <span className="text-emerald-600">Financial Services</span>
            </h1>
            <p className="text-slate-600 text-xl leading-relaxed mb-8 max-w-xl">
              Discover a suite of interest-free financial tools designed to build community wealth and individual prosperity through collective strength.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link 
                to="/join" 
                className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200/50"
              >
                Become a Member
              </Link>
              <a 
                href="#services" 
                className="px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-colors"
              >
                Explore Services
              </a>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="aspect-square rounded-[3rem] overflow-hidden shadow-2xl rotate-3">
              <img 
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop" 
                alt="Modern Architecture" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-3xl shadow-xl border border-slate-100 max-w-[240px] -rotate-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="font-bold text-slate-900">100% Ethical</span>
              </div>
              <p className="text-sm text-slate-500">Sharia-compliant and interest-free financial models.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section id="services" className="py-24 px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-headline text-4xl font-bold text-slate-900 mb-4">Core Financial Pillars</h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg">
            We focus on three primary areas of financial empowerment to ensure sustainable growth for our members.
          </p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Thrift Savings */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="col-span-12 lg:col-span-4 bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col"
          >
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-8">
              <PiggyBank className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Thrift Savings</h3>
            <p className="text-slate-500 mb-8 flex-grow">
              Build your capital through disciplined, systematic contributions. Your savings form the bedrock of your financial security.
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-3 text-slate-700 font-medium">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Automated Contributions
              </li>
              <li className="flex items-center gap-3 text-slate-700 font-medium">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Full Fund Transparency
              </li>
            </ul>
            <button className="w-full py-4 bg-slate-50 text-slate-900 rounded-2xl font-bold hover:bg-slate-100 transition-colors flex items-center justify-center gap-2">
              Learn More <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>

          {/* Zero-Interest Loans - Featured */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="col-span-12 lg:col-span-4 bg-emerald-600 p-10 rounded-[2.5rem] text-white shadow-xl shadow-emerald-200 relative overflow-hidden lg:scale-105 z-10"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl" />
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-8">
              <HandCoins className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Zero-Interest Loans</h3>
            <p className="text-emerald-50 mb-8 flex-grow">
              Access ethical capital for business or personal needs without usury. We believe in empowering people, not profiting from debt.
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-3 text-white font-medium">
                <CheckCircle2 className="w-5 h-5 text-emerald-200" /> 100% Interest-Free
              </li>
              <li className="flex items-center gap-3 text-white font-medium">
                <CheckCircle2 className="w-5 h-5 text-emerald-200" /> Savings-Backed Security
              </li>
            </ul>
            <Link 
              to="/join" 
              className="w-full py-4 bg-white text-emerald-600 rounded-2xl font-bold hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
            >
              Apply Now <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* Investment & Trade */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="col-span-12 lg:col-span-4 bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col"
          >
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-8">
              <TrendingUp className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Investment & Trade</h3>
            <p className="text-slate-500 mb-8 flex-grow">
              Participate in high-impact sectors like Real Estate and Agriculture through our diversified, ethical investment pools.
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-3 text-slate-700 font-medium">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" /> High-Impact Sectors
              </li>
              <li className="flex items-center gap-3 text-slate-700 font-medium">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Annual Dividends
              </li>
            </ul>
            <button className="w-full py-4 bg-slate-50 text-slate-900 rounded-2xl font-bold hover:bg-slate-100 transition-colors flex items-center justify-center gap-2">
              View Sectors <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-24 bg-slate-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="max-w-xl">
              <h2 className="font-headline text-4xl font-bold mb-4 tracking-tight">How It Works</h2>
              <p className="text-slate-400 text-lg">
                Our process is designed to be simple, transparent, and rewarding for every member of the society.
              </p>
            </div>
            <Link to="/join" className="group flex items-center gap-3 font-bold text-emerald-400">
              Start your journey <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-12 left-0 w-full h-px bg-slate-800 -z-0" />
            
            {[
              {
                step: "01",
                title: "Join the Society",
                desc: "Complete your registration and become a verified member of ZIMCO.",
                icon: UserPlus
              },
              {
                step: "02",
                title: "Start Contributing",
                desc: "Begin your monthly thrift savings to build your financial standing.",
                icon: Zap
              },
              {
                step: "03",
                title: "Access Benefits",
                desc: "Apply for loans, invest in projects, and receive annual dividends.",
                icon: ShieldCheck
              }
            ].map((item, idx) => (
              <div key={idx} className="relative z-10">
                <div className="w-24 h-24 rounded-3xl bg-slate-800 flex items-center justify-center mb-8 border border-slate-700 group hover:border-emerald-500 transition-colors">
                  <item.icon className="w-10 h-10 text-emerald-500" />
                </div>
                <span className="text-emerald-500 font-mono font-bold text-sm mb-4 block tracking-widest">STEP {item.step}</span>
                <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                <p className="text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-24 px-8 max-w-7xl mx-auto">
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden grid lg:grid-cols-2">
          <div className="p-12 lg:p-20 flex flex-col justify-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-8">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="font-headline text-4xl font-bold text-slate-900 mb-6 tracking-tight">Security You Can Trust</h2>
            <p className="text-slate-600 text-lg leading-relaxed mb-8">
              Your financial security is our top priority. We employ rigorous risk management and ethical oversight to protect your assets and ensure sustainable growth.
            </p>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                <h4 className="font-bold text-slate-900 mb-2">Fully Insured</h4>
                <p className="text-sm text-slate-500">All member assets are protected through comprehensive insurance coverage.</p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                <h4 className="font-bold text-slate-900 mb-2">Ethical Audit</h4>
                <p className="text-sm text-slate-500">Regular independent audits to ensure 100% Sharia compliance.</p>
              </div>
            </div>
          </div>
          <div className="relative h-[400px] lg:h-auto">
            <img 
              src="https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=2070&auto=format&fit=crop" 
              alt="Security Vault" 
              className="absolute inset-0 w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="pb-24 px-8">
        <div className="max-w-7xl mx-auto bg-emerald-600 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
          <div className="relative z-10">
            <h2 className="font-headline text-4xl md:text-5xl font-bold text-white mb-8 tracking-tight">Ready to build your ethical future?</h2>
            <p className="text-emerald-100 text-xl mb-12 max-w-2xl mx-auto">
              Join thousands of members who are already benefiting from our interest-free financial ecosystem.
            </p>
            <Link 
              to="/join" 
              className="inline-flex items-center gap-3 px-10 py-5 bg-white text-emerald-600 rounded-2xl font-extrabold text-lg hover:bg-emerald-50 transition-all hover:scale-105 shadow-2xl shadow-black/20"
            >
              Get Started Today <ArrowRight className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
