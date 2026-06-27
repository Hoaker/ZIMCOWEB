import { Link } from 'react-router-dom';
import { Leaf, Users, Eye, ArrowRight, TrendingUp, Quote } from 'lucide-react';
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

      {/* Trust Ribbon */}
      <section className="bg-surface-container-low py-10 relative z-30 -mt-10 mx-8 rounded-3xl shadow-2xl">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-outline-variant/30 text-center md:text-left">
            <div className="flex flex-col items-center md:items-start md:px-8">
              <span className="text-3xl font-headline font-extrabold text-primary">10,000+</span>
              <span className="text-on-surface-variant font-label text-sm uppercase tracking-widest mt-1">Active Members</span>
            </div>
            <div className="flex flex-col items-center md:items-start md:px-8 pt-6 md:pt-0">
              <span className="text-3xl font-headline font-extrabold text-primary">₦2.5B+</span>
              <span className="text-on-surface-variant font-label text-sm uppercase tracking-widest mt-1">Total Assets</span>
            </div>
            <div className="flex flex-col items-center md:items-start md:px-8 pt-6 md:pt-0">
              <span className="text-3xl font-headline font-extrabold text-primary">12 Years</span>
              <span className="text-on-surface-variant font-label text-sm uppercase tracking-widest mt-1">Ethical Service</span>
            </div>
          </div>
        </div>
      </section>

      {/* Core Mission Pillars */}
      <section className="py-32 px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div className="max-w-xl">
            <h2 className="text-primary font-label font-bold uppercase tracking-[0.3em] text-sm mb-4">Our Foundations</h2>
            <h3 className="font-headline text-4xl md:text-5xl font-extrabold text-on-surface tracking-tighter">Why ZIMCO Stands Apart?</h3>
          </div>
          <p className="text-on-surface-variant max-w-md text-lg leading-relaxed">
            We've built a financial ecosystem where ethics isn't an afterthought—it's the architecture of everything we do.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div 
            whileHover={{ y: -10 }}
            className="p-10 rounded-3xl bg-surface-container-low hover:bg-surface-container transition-all duration-500 group"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-on-primary transition-all">
              <Leaf className="w-8 h-8" />
            </div>
            <h4 className="font-headline text-2xl font-bold mb-4">100% Interest-Free</h4>
            <p className="text-on-surface-variant leading-relaxed">True ethical finance means no hidden usury. We grow through shared equity and tangible asset investment, never through debt burden.</p>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -20 }}
            className="p-10 rounded-3xl bg-primary text-on-primary shadow-2xl shadow-primary/30 md:-translate-y-8 transition-all duration-500"
          >
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-white mb-8">
              <Users className="w-8 h-8" />
            </div>
            <h4 className="font-headline text-2xl font-bold mb-4">Community-Led</h4>
            <p className="text-white/80 leading-relaxed">ZIMCO is owned by its members. Every decision is made with the collective benefit in mind, ensuring our capital stays within the community.</p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -10 }}
            className="p-10 rounded-3xl bg-surface-container-low hover:bg-surface-container transition-all duration-500 group"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-on-primary transition-all">
              <Eye className="w-8 h-8" />
            </div>
            <h4 className="font-headline text-2xl font-bold mb-4">Total Transparency</h4>
            <p className="text-on-surface-variant leading-relaxed">View every investment, audit, and decision through our open-ledger policy. We believe trust is earned through visible integrity.</p>
          </motion.div>
        </div>
      </section>

      {/* Service Highlights */}
      <section className="py-32 bg-on-surface text-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-20">
            <h2 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tighter">Financial Empowerment</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-8 group relative rounded-[2rem] overflow-hidden h-[400px]">
              <img 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                alt="Thrift Savings" 
                src="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=2071&auto=format&fit=crop"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-10 flex flex-col justify-end">
                <h4 className="font-headline text-3xl font-bold mb-2">Thrift Savings</h4>
                <p className="text-white/70 max-w-sm mb-6">Grow your wealth systematically with automated contributions and profit-sharing dividends.</p>
                <Link to="/services" className="flex items-center gap-2 font-bold group/link">
                  Learn More 
                  <ArrowRight className="w-5 h-5 group-hover/link:translate-x-2 transition-transform" />
                </Link>
              </div>
            </div>

            <div className="md:col-span-4 group relative rounded-[2rem] overflow-hidden h-[400px]">
              <div className="absolute inset-0 bg-primary/40 z-10"></div>
              <img 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                alt="Loans" 
                src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2070&auto=format&fit=crop"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent p-10 flex flex-col justify-end z-20">
                <h4 className="font-headline text-2xl font-bold mb-2">Zero-Interest Loans</h4>
                <p className="text-white/70 mb-6">Access capital for business or personal needs without usury.</p>
                <Link to="/services" className="flex items-center gap-2 font-bold">
                  Get Funded
                  <TrendingUp className="w-5 h-5" />
                </Link>
              </div>
            </div>

            <div className="md:col-span-12 group relative rounded-[2rem] overflow-hidden h-[300px]">
              <img 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                alt="Marketplace" 
                src="https://images.unsplash.com/photo-1533900298318-6b8da08a523e?q=80&w=2070&auto=format&fit=crop"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/50 p-10 flex flex-col justify-center items-center text-center">
                <h4 className="font-headline text-3xl font-bold mb-4">Co-op Marketplace</h4>
                <p className="text-white/80 max-w-xl mb-6">Leverage the collective buying power of 10,000 members to access essentials at wholesale prices.</p>
                <button className="bg-primary px-8 py-3 rounded-full font-headline font-bold hover:bg-primary/90 transition-colors">
                  Explore Marketplace
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-32 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-primary/20 mb-12 flex justify-center">
            <Quote className="w-24 h-24 fill-current" />
          </div>
          <blockquote className="font-headline text-3xl md:text-4xl font-extrabold text-on-surface italic leading-tight mb-12 tracking-tighter">
            "ZIMCO didn't just give me a loan; they gave me a path to dignity. Starting my agribusiness without the fear of compounding interest changed everything for my family's future."
          </blockquote>
          <div className="flex items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-primary/10">
              <img 
                className="w-full h-full object-cover" 
                alt="Omotara Adeyemi" 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1976&auto=format&fit=crop"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="text-left">
              <p className="font-bold text-on-surface">Omotara Adeyemi</p>
              <p className="text-on-surface-variant text-sm">Platinum Member since 2018</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-8 mb-24">
        <div className="max-w-7xl mx-auto rounded-[3rem] bg-gradient-to-br from-emerald-800 to-emerald-950 p-12 md:p-24 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-48 -mt-48"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-container/20 rounded-full blur-2xl -ml-32 -mb-32"></div>
          <div className="relative z-10">
            <h2 className="font-headline text-4xl md:text-6xl font-extrabold text-white mb-8 tracking-tighter">Join the Society Today</h2>
            <p className="text-white/70 text-xl max-w-2xl mx-auto mb-12">
              Become part of an ethical financial movement that prioritizes your growth and our collective prosperity.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link to="/join" className="w-full sm:w-auto bg-white text-primary px-10 py-5 rounded-full font-headline font-extrabold text-xl shadow-xl hover:scale-105 transition-transform">
                Create Free Account
              </Link>
              <Link to="/contact" className="w-full sm:w-auto bg-white/10 text-white backdrop-blur border border-white/20 px-10 py-5 rounded-full font-headline font-extrabold text-xl hover:bg-white/20 transition-all">
                Talk to an Advisor
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
