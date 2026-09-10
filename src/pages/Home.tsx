import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Coins, 
  Users, 
  ShoppingBag, 
  ArrowRight, 
  CheckCircle2, 
  Calendar,
  Landmark,
  PiggyBank,
  BookOpen,
  Sparkles,
  HeartHandshake
} from 'lucide-react';
import { motion } from 'motion/react';

export default function Home() {
  return (
    <main className="pt-20 bg-surface text-on-surface">
      {/* Hero Section - Restrained, Authentic Co-operative Ledger Feel */}
      <section className="relative py-16 sm:py-24 md:py-32 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container border border-outline-variant/60 text-xs font-semibold text-primary">
              <Landmark className="w-3.5 h-3.5" />
              <span>Staff Multi-Purpose Co-operative Society</span>
            </div>

            <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl font-bold text-on-surface leading-[1.12] tracking-tight">
              Thrift savings, zero-interest loans, and mutual welfare for members.
            </h1>

            <p className="text-base sm:text-lg text-on-surface-variant font-body max-w-xl leading-relaxed">
              ZIMCO is a member-owned cooperative founded on ethical principles, transparent payroll deductions, annual dividend payouts, and wholesale commodity support for staff and their families.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link 
                to="/login" 
                className="bg-primary hover:bg-primary/90 text-on-primary px-7 py-3.5 rounded-xl font-headline font-semibold text-base transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <span>Member Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                to="/register" 
                className="bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/60 px-6 py-3.5 rounded-xl font-headline font-semibold text-base transition-colors cursor-pointer"
              >
                Join the Society
              </Link>
            </div>

            {/* Reassurance pills */}
            <div className="pt-6 grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-outline-variant/40">
              <div>
                <p className="text-xs text-on-surface-variant font-medium">Lending terms</p>
                <p className="font-headline font-bold text-sm sm:text-base text-primary">100% Zero-Interest</p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant font-medium">Surplus returns</p>
                <p className="font-headline font-bold text-sm sm:text-base text-on-surface">Annual AGM Dividends</p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="text-xs text-on-surface-variant font-medium">Payroll integration</p>
                <p className="font-headline font-bold text-sm sm:text-base text-on-surface">Staff ID Synced</p>
              </div>
            </div>
          </motion.div>

          {/* Ledger-style Quick Passbook Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-5"
          >
            <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 border border-outline-variant/80 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between pb-6 border-b border-outline-variant/50">
                <div>
                  <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider block">Member Passbook Ledger</span>
                  <p className="font-headline font-bold text-lg text-on-surface mt-0.5">ZIMCO Society Portal</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-headline font-bold">
                  ₦
                </div>
              </div>

              <div className="py-6 space-y-4">
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/40">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <PiggyBank className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-on-surface">Ordinary Savings (OS)</p>
                      <p className="text-[11px] text-on-surface-variant">Monthly payroll thrift build-up</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-primary">Equity Core</span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/40">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center shrink-0">
                      <Coins className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-on-surface">Special Savings (SS)</p>
                      <p className="text-[11px] text-on-surface-variant">Target funds for family & projects</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-on-surface-variant">Flexible</span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/40">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-on-surface">Commodity Purchases</p>
                      <p className="text-[11px] text-on-surface-variant">Rice, oil & household staples</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-on-surface-variant">Wholesale</span>
                </div>
              </div>

              <div className="pt-4 border-t border-outline-variant/50 flex items-center justify-between text-xs text-on-surface-variant">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-tertiary" /> Audited Annual Records
                </span>
                <Link to="/login" className="font-semibold text-primary hover:underline">
                  Sign in to view →
                </Link>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* Core Co-operative Pillars - Grounded in member reality */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto border-t border-outline-variant/40">
        <div className="max-w-2xl mb-12 sm:mb-16">
          <p className="text-xs font-semibold text-primary mb-2">Built for staff welfare</p>
          <h2 className="font-headline text-3xl sm:text-4xl font-bold text-on-surface tracking-tight">
            How ZIMCO works for every member
          </h2>
          <p className="text-sm sm:text-base text-on-surface-variant mt-3 leading-relaxed">
            Every naira contributed is tracked with passbook transparency, helping colleagues build personal financial resilience without usurious interest or hidden charges.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Card 1: Zero-Interest Loans */}
          <div className="p-6 sm:p-8 rounded-2xl bg-surface-container-low border border-outline-variant/60 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                <Coins className="w-6 h-6" />
              </div>
              <h3 className="font-headline text-xl font-bold text-on-surface mb-2">Zero-Interest Staff Loans</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
                Apply for soft loans up to 200% of your Ordinary Savings balance with flexible monthly payroll repayments and absolutely zero interest markup.
              </p>
            </div>
            <ul className="space-y-2 pt-4 border-t border-outline-variant/40 text-xs font-medium text-on-surface-variant">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-tertiary shrink-0" /> Fast committee review & approval
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-tertiary shrink-0" /> Direct salary payroll amortization
              </li>
            </ul>
          </div>

          {/* Card 2: Bulk Commodity Purchases */}
          <div className="p-6 sm:p-8 rounded-2xl bg-surface-container-low border border-outline-variant/60 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center mb-6">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="font-headline text-xl font-bold text-on-surface mb-2">Bulk Commodity Schemes</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
                Take advantage of cooperative bargaining power to obtain rice, cooking oil, home appliances, and festive packages at wholesale rates spread over convenient monthly deductions.
              </p>
            </div>
            <ul className="space-y-2 pt-4 border-t border-outline-variant/40 text-xs font-medium text-on-surface-variant">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-tertiary shrink-0" /> Festive seasonal distributions
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-tertiary shrink-0" /> Direct supplier verified pricing
              </li>
            </ul>
          </div>

          {/* Card 3: Annual Dividends & AGM */}
          <div className="p-6 sm:p-8 rounded-2xl bg-surface-container-low border border-outline-variant/60 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-headline text-xl font-bold text-on-surface mb-2">Annual AGM Dividends</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
                Surplus generated from shared cooperative investments and commodity sales is credited directly to member savings accounts following the Annual General Meeting.
              </p>
            </div>
            <ul className="space-y-2 pt-4 border-t border-outline-variant/40 text-xs font-medium text-on-surface-variant">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-tertiary shrink-0" /> Transparent audited financials
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-tertiary shrink-0" /> Pro-rata dividend distribution
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Welfare & Member Community Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto border-t border-outline-variant/40">
        <div className="bg-surface-container rounded-3xl p-8 sm:p-12 border border-outline-variant/60">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary">
                <HeartHandshake className="w-4 h-4" />
                <span>Mutual Support & Welfare</span>
              </div>
              <h3 className="font-headline text-2xl sm:text-3xl font-bold text-on-surface">
                A community of colleagues looking out for one another.
              </h3>
              <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
                Beyond monthly thrift, ZIMCO coordinates staff welfare interventions, bereavement and milestone support, emergency relief facilities, and educational workshops for members and their households.
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <span className="px-3 py-1 bg-surface-container-lowest rounded-lg text-xs font-medium text-on-surface border border-outline-variant/40">
                  Welfare Emergency Fund
                </span>
                <span className="px-3 py-1 bg-surface-container-lowest rounded-lg text-xs font-medium text-on-surface border border-outline-variant/40">
                  Retirement Planning
                </span>
                <span className="px-3 py-1 bg-surface-container-lowest rounded-lg text-xs font-medium text-on-surface border border-outline-variant/40">
                  Muslim Community Account (MCA)
                </span>
              </div>
            </div>

            <div className="md:col-span-5 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/60 space-y-4">
              <h4 className="font-headline font-bold text-base text-on-surface">Ready to access your account?</h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Log in with your Staff ID or registered email to view your real-time passbook ledger, submit a loan request, or download annual deduction statements.
              </p>
              <div className="space-y-2 pt-2">
                <Link 
                  to="/login" 
                  className="w-full bg-primary hover:bg-primary/90 text-on-primary py-3 rounded-xl font-headline font-semibold text-xs text-center block transition-colors cursor-pointer"
                >
                  Member Sign In
                </Link>
                <Link 
                  to="/staff-login" 
                  className="w-full bg-surface-container-low hover:bg-surface-container text-on-surface py-3 rounded-xl font-headline font-semibold text-xs text-center block border border-outline-variant/60 transition-colors cursor-pointer"
                >
                  Staff & Bursary Officer Access
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Transparency Note */}
      <section className="py-12 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto border-t border-outline-variant/40 text-center">
        <p className="text-xs text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
          ZIMCO Staff Multi-Purpose Co-operative Society. Registered under the Co-operative Societies Law. Audited annually by certified cooperative auditors and presented to the general house at the Annual General Meeting (AGM).
        </p>
      </section>
    </main>
  );
}
