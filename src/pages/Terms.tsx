import React from 'react';
import { motion } from 'motion/react';
import { Scale, ShieldAlert, FileText, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Terms() {
  return (
    <main className="pt-28 pb-24 px-6 md:px-12 max-w-5xl mx-auto space-y-12">
      {/* Decorative Title Block */}
      <section className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-500/10 rounded-full text-xs font-bold uppercase tracking-wider">
          <Scale size={14} />
          <span>Legal & Compliance Documentation</span>
        </div>
        <h1 className="font-headline text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Terms of Service Agreement
        </h1>
        <p className="text-slate-500 font-mono text-xs">
          Version 2026.3 • Effective Date: June 1, 2026
        </p>
      </section>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        
        {/* Navigation / Warning Sidebar Widget */}
        <div className="lg:col-span-1 space-y-6">
          <div className="sticky top-28 p-6 rounded-3xl bg-slate-50 border border-slate-200/50 space-y-6">
            <h4 className="font-headline font-bold text-slate-900 text-sm uppercase tracking-wider">
              Document Index
            </h4>
            <nav className="space-y-3 text-xs font-semibold text-slate-500 font-mono">
              <a href="#section-1" className="block hover:text-emerald-700 transition-colors">1. Ethical Zero-Interest Charter</a>
              <a href="#section-2" className="block hover:text-emerald-700 transition-colors">2. Member Capital Pool Management</a>
              <a href="#section-3" className="block hover:text-emerald-700 transition-colors">3. Transaction PIN Security Mandate</a>
              <a href="#section-4" className="block hover:text-emerald-700 transition-colors">4. Default Protocols & Joint Liability</a>
              <a href="#section-5" className="block hover:text-emerald-700 transition-colors">5. Governance & State Cooperatives Act</a>
            </nav>

            <div className="pt-6 border-t border-slate-200 space-y-4">
              <div className="flex gap-2.5 items-start text-[11px] text-amber-800 leading-relaxed font-semibold">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  By creating a ZIMCO membership portal or authorizing transaction withdrawals, you explicitly agree to these binding guidelines.
                </p>
              </div>
              <Link 
                to="/privacy" 
                className="inline-flex items-center gap-1.5 text-xs text-emerald-800 hover:text-emerald-700 font-bold hover:underline"
              >
                <span>Read Privacy Policy</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>

        {/* Legal Text Body */}
        <div className="lg:col-span-3 bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-sm space-y-10 leading-relaxed text-sm text-slate-600 font-body">
          
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/50 flex gap-4 items-start">
            <FileText className="w-5 h-5 text-emerald-700 shrink-0 mt-1" />
            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-900 text-sm">Binding State Regulatory Framework</h4>
              <p className="text-xs text-slate-500 font-medium">
                ZIMCO Cooperative Society Limited is registered and operates under the Cooperative Societies Laws of Nigeria. By joining, members represent that they are of sound mind, legal age, and agree to uphold collective thrift cooperation guidelines.
              </p>
            </div>
          </div>

          {/* Section 1 */}
          <section id="section-1" className="space-y-3">
            <h3 className="font-headline font-extrabold text-slate-900 text-xl border-b border-slate-100 pb-2">
              1. Ethical Zero-Interest Charter
            </h3>
            <p>
              ZIMCO operates strictly on non-usury, ethical cooperative principles. Members acknowledge and agree that:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>
                <strong>No Compounding Interest:</strong> No administrative charge, credit balance, or default parameter shall accumulate compounding interest under any circumstances.
              </li>
              <li>
                <strong>Profit-and-Loss Sharing:</strong> Dividend distributions from Investment Accounts are derived purely from real business assets, commodity purchase contracts, or physical properties, not speculative financial derivations.
              </li>
              <li>
                <strong>Tangible Assets Only:</strong> Cooperative marketplace purchases (Murabaha) rely on actual ownership transfers of wholesale physical stock, ensuring capital integrity.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section id="section-2" className="space-y-3">
            <h3 className="font-headline font-extrabold text-slate-900 text-xl border-b border-slate-100 pb-2">
              2. Member Capital Pool Management
            </h3>
            <p>
              Members agree to deposit their financial contributions systematically across specified portfolios:
            </p>
            <ol className="list-decimal pl-6 space-y-2 mt-2">
              <li>
                <strong>Ordinary Savings (OS):</strong> Non-withdrawable core membership equity used to compute voting rights and loan eligibility calculations.
              </li>
              <li>
                <strong>Special Savings (SS):</strong> Highly liquid deposits withdrawable under standard 24-48 hours administrative processing windows.
              </li>
              <li>
                <strong>Investment Accounts (IA):</strong> Medium-to-long term portfolios locked for physical projects with fluctuating returns matching ethical indices.
              </li>
            </ol>
          </section>

          {/* Section 3 */}
          <section id="section-3" className="space-y-3">
            <h3 className="font-headline font-extrabold text-slate-900 text-xl border-b border-slate-100 pb-2">
              3. Transaction PIN Security Mandate
            </h3>
            <p className="p-4 bg-amber-50/50 border border-amber-200/40 rounded-xl font-medium text-slate-800 flex items-start gap-3">
              <span className="p-1 rounded bg-amber-100 text-amber-900 font-mono text-[10px] font-bold mt-1 uppercase">MANDATORY</span>
              <span>
                You are strictly responsible for preserving the confidentiality of your 4-to-6-digit Transaction PIN. No transaction will be approved purely based on a web browser cookie session.
              </span>
            </p>
            <p className="mt-3">
              You agree that ZIMCO is not liable for unauthorized payouts arising from negligent storage of secure PIN keys, shared devices, or physical access compromises. You must revoke compromised sessions immediately using the live Session Audit Ledger in the Member Dashboard settings.
            </p>
          </section>

          {/* Section 4 */}
          <section id="section-4" className="space-y-3">
            <h3 className="font-headline font-extrabold text-slate-900 text-xl border-b border-slate-100 pb-2">
              4. Default Protocols & Joint Liability
            </h3>
            <p>
              Interest-free credit facilities (Qard al-Hasan) rely on community-backed securities (Takaful):
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>
                <strong>Joint Guarantorship:</strong> Loan beneficiaries must match with three validated members who pledge collective liability. If a member defaults, guarantors collectively assume debt amortization structures under interest-free timelines.
              </li>
              <li>
                <strong>Administrative Levies:</strong> Flat processing fees reflect real operational overhead only and never scale recursively across default intervals.
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section id="section-5" className="space-y-3">
            <h3 className="font-headline font-extrabold text-slate-900 text-xl border-b border-slate-100 pb-2">
              5. Governance & State Cooperatives Act
            </h3>
            <p>
              This agreement is governed by the laws of the Federal Republic of Nigeria. General structural resolutions are governed strictly by democratic votes during the Annual General Meeting (AGM). The society operates in obedience to agricultural development and cooperative policies, allowing audit boards full examination of files upon standard notification.
            </p>
          </section>

          <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold font-mono">
              <CheckCircle size={14} className="text-emerald-600" />
              <span>Checked and active for regulatory year 2026</span>
            </div>
            <Link 
              to="/portal" 
              className="px-6 py-3 bg-emerald-900 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition-colors shadow-md flex items-center gap-1.5"
            >
              <span>Accept and Enter Portal</span>
              <ArrowRight size={14} />
            </Link>
          </div>

        </div>

      </div>
    </main>
  );
}
