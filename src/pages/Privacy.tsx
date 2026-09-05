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
          <span>Information Security & Member Privacy</span>
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
              <a href="#privacy-1" className="block hover:text-emerald-700 transition-colors">1. Information We Collect</a>
              <a href="#privacy-2" className="block hover:text-emerald-700 transition-colors">2. Regulatory Reporting</a>
              <a href="#privacy-3" className="block hover:text-emerald-700 transition-colors">3. Secure Data Storage</a>
              <a href="#privacy-4" className="block hover:text-emerald-700 transition-colors">4. Cookie Policy & Sessions</a>
              <a href="#privacy-5" className="block hover:text-emerald-700 transition-colors">5. Contact Support</a>
            </nav>

            <div className="pt-6 border-t border-slate-200 space-y-4">
              <div className="flex gap-2.5 items-start text-[11px] text-emerald-900 leading-relaxed font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  Your personal information and account activity are protected with industry-standard security safeguards.
                </p>
              </div>
              <Link 
                to="/terms" 
                className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-emerald-800 font-bold hover:underline"
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
                We handle privacy in compliance with the Nigeria Data Protection Regulation (NDPR) and state cooperative guidelines. We protect your account information against unauthorized access and never sell your personal data.
              </p>
            </div>
          </div>

          {/* Section 1 */}
          <section id="privacy-1" className="space-y-3">
            <h3 className="font-headline font-extrabold text-slate-900 text-xl border-b border-slate-100 pb-2">
              1. Information We Collect
            </h3>
            <p>
              To provide you with secure cooperative services, ZIMCO collects and manages:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>
                <strong>Membership Identity:</strong> Full name, phone number, government-issued ID details, and residential address.
              </li>
              <li>
                <strong>Account Activity:</strong> Savings deposits, asset purchase records, loan repayment timelines, and guarantor commitments.
              </li>
              <li>
                <strong>Device & Login Details:</strong> Browser type, device model, login timestamps, and general location to protect your account.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section id="privacy-2" className="space-y-3">
            <h3 className="font-headline font-extrabold text-slate-900 text-xl border-b border-slate-100 pb-2">
              2. Regulatory Reporting
            </h3>
            <p>
              As a registered cooperative, ZIMCO is subject to regulatory audits. Summarized, non-personal data is shared with:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>
                <strong>State Registrars of Cooperatives:</strong> To confirm that member funds and cooperative operations meet official standards.
              </li>
              <li>
                <strong>Ethical & Advisory Boards:</strong> To confirm that all financing and profit-sharing remain strictly zero-interest and asset-backed.
              </li>
            </ul>
            <p className="mt-2 text-xs italic">
              All official reporting is done through secure channels without exposing unnecessary personal identity details.
            </p>
          </section>

          {/* Section 3 */}
          <section id="privacy-3" className="space-y-3">
            <h3 className="font-headline font-extrabold text-slate-900 text-xl border-b border-slate-100 pb-2">
              3. Secure Data Storage
            </h3>
            <p>
              Your account details and Transaction PIN are protected with high-level security practices:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>
                <strong>Protected PIN & Password Storage:</strong> Your private PIN is never saved in plain text and cannot be viewed by staff or third parties.
              </li>
              <li>
                <strong>Encrypted Connections:</strong> All data transmitted between your device and our servers is encrypted using modern web security protocols.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section id="privacy-4" className="space-y-3">
            <h3 className="font-headline font-extrabold text-slate-900 text-xl border-b border-slate-100 pb-2">
              4. Cookie Policy & Sessions
            </h3>
            <p>
              We use secure session cookies to keep you safely logged in. You have full control over your active sessions. By visiting your Member Dashboard's <strong>Active Devices & Sessions</strong> section, you can:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-1">
              <li>View all active logins, devices, and approximate locations.</li>
              <li>Log out of any device or all devices immediately with a single click.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section id="privacy-5" className="space-y-3">
            <h3 className="font-headline font-extrabold text-slate-900 text-xl border-b border-slate-100 pb-2">
              5. Contact Support
            </h3>
            <p>
              If you notice any unfamiliar account activity or need assistance with your data settings, please reach out to our team:
            </p>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/50 flex items-center gap-3 mt-4 text-xs font-mono">
              <Mail className="w-5 h-5 text-emerald-700 shrink-0" />
              <div>
                <p className="text-slate-500">ZIMCO Member Support & Security</p>
                <p className="font-bold text-slate-800 hover:text-emerald-800 mt-0.5">support@zimcocoop.com • +234 812 000 9462</p>
              </div>
            </div>
          </section>

          <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold font-mono">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>NDPR Compliant & Protected</span>
            </div>
            <Link 
              to="/portal" 
              className="px-6 py-3 bg-emerald-900 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition-colors shadow-md flex items-center gap-1.5"
            >
              <span>Go to Member Login</span>
              <ArrowRight size={14} />
            </Link>
          </div>

        </div>

      </div>
    </main>
  );
}
