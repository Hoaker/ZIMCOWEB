import React from 'react';
import { motion } from 'motion/react';
import { Scale, ShieldCheck, Mail, ArrowRight, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Privacy() {
  return (
    <main className="pt-28 pb-24 px-6 md:px-12 max-w-5xl mx-auto space-y-12">
      {/* Decorative Title Block */}
      <section className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-500/10 rounded-full text-xs font-bold uppercase tracking-wider">
          <ShieldCheck size={14} />
          <span>Information Security & Cryptographic Auditing</span>
        </div>
        <h1 className="font-headline text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Privacy & Data Protection Policy
        </h1>
        <p className="text-slate-500 font-mono text-xs">
          Version 2026.1 • Effective Date: June 1, 2026
        </p>
      </section>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="sticky top-28 p-6 rounded-3xl bg-slate-50 border border-slate-200/50 space-y-6">
            <h4 className="font-headline font-bold text-slate-900 text-sm uppercase tracking-wider">
              Document Areas
            </h4>
            <nav className="space-y-3 text-xs font-semibold text-slate-500 font-mono">
              <a href="#privacy-1" className="block hover:text-emerald-700 transition-colors">1. Scope of Data Collection</a>
              <a href="#privacy-2" className="block hover:text-emerald-700 transition-colors">2. Zero-Interest Audit Filings</a>
              <a href="#privacy-3" className="block hover:text-emerald-700 transition-colors">3. Cryptographic Storage Standards</a>
              <a href="#privacy-4" className="block hover:text-emerald-700 transition-colors">4. Cookie Profiles & Revocation</a>
              <a href="#privacy-5" className="block hover:text-emerald-700 transition-colors">5. Contact Security Advisors</a>
            </nav>

            <div className="pt-6 border-t border-slate-200 space-y-4">
              <div className="flex gap-2.5 items-start text-[11px] text-emerald-850 text-emerald-900 leading-relaxed font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  Your physical profile updates and verification history are fortified with 256-bit encryption safeguards.
                </p>
              </div>
              <Link 
                to="/terms" 
                className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-emerald-750 hover:text-emerald-800 font-bold hover:underline"
              >
                <span>Read Terms of Service</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>

        {/* Legal Text Body */}
        <div className="lg:col-span-3 bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-sm space-y-10 leading-relaxed text-sm text-slate-600 font-body">
          
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/50 flex gap-4 items-start">
            <ShieldAlert className="w-5 h-5 text-emerald-700 shrink-0 mt-1" />
            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-900 text-sm">Regulatory Data Compliance Policy</h4>
              <p className="text-xs text-slate-500 font-medium">
                We handle privacy constraints in compliance with the Nigeria Data Protection Regulation (NDPR) and state cooperative guidelines. We protect transaction ledgers against unauthorized surveillance or corporate marketing manipulation.
              </p>
            </div>
          </div>

          {/* Section 1 */}
          <section id="privacy-1" className="space-y-3">
            <h3 className="font-headline font-extrabold text-slate-900 text-xl border-b border-slate-100 pb-2">
              1. Scope of Data Collection
            </h3>
            <p>
              To maintain the integrity of interest-free credit allocations, ZIMCO systematically archives:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>
                <strong>Membership Identity:</strong> Legal names, phone verification logs, state agricultural licenses (where applicable), and physical utility addresses.
              </li>
              <li>
                <strong>Financial Trackers:</strong> Savings balances, commodity purchase declarations, repayment timeline intervals, and joint-liability guarantorship certificates.
              </li>
              <li>
                <strong>Device Metatags:</strong> Browser headers, operating systems, login timestamps, and geolocation IP traces logged in the Active Session Ledger.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section id="privacy-2" className="space-y-3">
            <h3 className="font-headline font-extrabold text-slate-900 text-xl border-b border-slate-100 pb-2">
              2. Zero-Interest Audit Filings
            </h3>
            <p>
              By joining, members acknowledge that interest-free institutions are subject to rigorous public examination. Anonymous or aggregate ledger data is routinely disclosed to:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>
                <strong>State Registrars of Cooperatives:</strong> To validate that joint capital distribution pools adhere to administrative guidelines.
              </li>
              <li>
                <strong>Shari’ah & Ethical Compliance Boards:</strong> To certify that asset-backed transactions have zero interest exposure.
              </li>
            </ul>
            <p className="mt-2 text-xs italic">
              Disclosures are conducted strictly through encrypted channels, suppressing physical identifier variables where possible.
            </p>
          </section>

          {/* Section 3 */}
          <section id="privacy-3" className="space-y-3">
            <h3 className="font-headline font-extrabold text-slate-900 text-xl border-b border-slate-100 pb-2">
              3. Cryptographic Storage Standards
            </h3>
            <p>
              All customer transaction keys, hash validations, and Transaction PIN signatures are protected on dedicated, firewalled servers. ZIMCO preserves data using:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>
                <strong>SHA-256 Signature Hashing:</strong> Your private PIN is never saved in raw plain text. It is processed as a irreversible mathematical hashing block.
              </li>
              <li>
                <strong>Secure Socket Layer (SSL/TLS):</strong> All data transitions between your personal dashboard terminal and our databases are fully encrypted.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section id="privacy-4" className="space-y-3">
            <h3 className="font-headline font-extrabold text-slate-900 text-xl border-b border-slate-100 pb-2">
              4. Cookie Profiles & Revocation
            </h3>
            <p>
              We utilize technical context-holding cookies to coordinate secure login portal sessions. You possess absolute authority over session states. By visiting your Member Dashboard's <strong>Device & Session Audit Ledger</strong>, you can instantly:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-1">
              <li>Inspect active login regions, devices, and operational system versions.</li>
              <li>Instantly destroy any session cookies with a single click, immediately invalidating physical authorization rights across terminal tunnels.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section id="privacy-5" className="space-y-3">
            <h3 className="font-headline font-extrabold text-slate-900 text-xl border-b border-slate-100 pb-2">
              5. Contact Security Advisors
            </h3>
            <p>
              If you detect unauthorized ledger balance updates, login attempts, or suspect secure keys have been physically compromised, contact our joint security desk immediately:
            </p>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/50 flex items-center gap-3 mt-4 text-xs font-mono">
              <Mail className="w-5 h-5 text-emerald-700 shrink-0" />
              <div>
                <p className="text-slate-500">ZIMCO Security & Forensic Audit Desk</p>
                <p className="font-bold text-slate-800 hover:text-emerald-800 mt-0.5">forensics@zimmercoop.com • +234 812 000 SECURE</p>
              </div>
            </div>
          </section>

          <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold font-mono">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>NDPR Compliance audit signature is validated</span>
            </div>
            <Link 
              to="/portal" 
              className="px-6 py-3 bg-emerald-900 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition-colors shadow-md flex items-center gap-1.5"
            >
              <span>Verify Secure Verification Check</span>
              <ArrowRight size={14} />
            </Link>
          </div>

        </div>

      </div>
    </main>
  );
}
