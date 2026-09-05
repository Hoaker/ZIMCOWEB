import { motion } from 'motion/react';
import { Target, Heart, Award, CheckCircle2 } from 'lucide-react';

export default function About() {
  return (
    <main className="pt-32 pb-24 px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="font-headline text-5xl md:text-6xl font-extrabold text-on-surface mb-8 tracking-tighter">
              A Legacy of <br/>Collective Growth
            </h1>
            <p className="text-on-surface-variant text-xl leading-relaxed mb-8">
              Founded in 2012, ZIMCO was born from a vision to create a financial institution that prioritizes human dignity and ethical principles over pure profit.
            </p>
            <p className="text-on-surface-variant text-lg leading-relaxed">
              Today, we serve over 10,000 members across Nigeria, managing billions in assets through a zero-interest model that has transformed lives and built sustainable communities.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=1974&auto=format&fit=crop" 
                alt="Team working together"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-8 -left-8 bg-primary p-8 rounded-3xl text-white shadow-xl hidden md:block">
              <p className="text-4xl font-headline font-extrabold mb-1">12+</p>
              <p className="text-sm font-bold uppercase tracking-widest opacity-80">Years of Integrity</p>
            </div>
          </motion.div>
        </div>

        {/* Mission/Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-20 sm:mb-32">
          <div className="p-6 sm:p-8 md:p-12 rounded-2xl sm:rounded-[2.5rem] md:rounded-[3rem] bg-emerald-900 text-white">
            <Target className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mb-4 sm:mb-6 md:mb-8 text-emerald-400" />
            <h2 className="font-headline text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Our Mission</h2>
            <p className="text-emerald-100/80 text-sm sm:text-base md:text-lg leading-relaxed">
              To provide accessible, interest-free financial services that empower our members to achieve financial independence while adhering to universal ethical standards.
            </p>
          </div>
          <div className="p-6 sm:p-8 md:p-12 rounded-2xl sm:rounded-[2.5rem] md:rounded-[3rem] bg-surface-container-low border border-slate-100">
            <Heart className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mb-4 sm:mb-6 md:mb-8 text-primary" />
            <h2 className="font-headline text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Our Vision</h2>
            <p className="text-on-surface-variant text-sm sm:text-base md:text-lg leading-relaxed">
              To become the most trusted and impactful co-operative society in Africa, setting the gold standard for ethical finance and community-driven prosperity.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="text-center mb-16 sm:mb-20">
          <h2 className="font-headline text-3xl sm:text-4xl font-extrabold mb-10 sm:mb-16 tracking-tight">Our Core Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {[
              { title: "Integrity", desc: "Honesty in every transaction and transparency in every audit." },
              { title: "Equity", desc: "Fair distribution of profits and equal opportunities for all members." },
              { title: "Solidarity", desc: "Standing together to support each other's growth and resilience." },
              { title: "Excellence", desc: "Striving for the highest quality in our services and operations." }
            ].map((value) => (
              <div key={value.title} className="p-5 sm:p-6 md:p-8 rounded-2xl md:rounded-3xl bg-white border border-slate-100 hover:border-primary/30 transition-colors">
                <Award className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-primary mx-auto mb-3 sm:mb-4 md:mb-6" />
                <h3 className="font-headline text-lg sm:text-xl font-bold mb-2 sm:mb-3">{value.title}</h3>
                <p className="text-on-surface-variant text-xs sm:text-sm leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team/Board Placeholder */}
        <section className="py-20 bg-surface-container-low rounded-[3rem] px-12">
          <h2 className="font-headline text-3xl font-bold mb-12 text-center">Guided by Excellence</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center">
                <div className="w-32 h-32 rounded-full bg-slate-200 mx-auto mb-6 overflow-hidden">
                  <img 
                    src={`https://images.unsplash.com/photo-${1500000000000 + i * 1000000}?q=80&w=200&h=200&auto=format&fit=crop`} 
                    alt="Board Member"
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h4 className="font-bold text-lg">Board Member {i}</h4>
                <p className="text-primary text-sm font-bold uppercase tracking-widest">Executive Director</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
