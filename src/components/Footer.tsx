import { Link } from 'react-router-dom';
import { Share2, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full py-16 px-8 mt-auto bg-slate-50">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 max-w-7xl mx-auto items-start">
        <div className="space-y-6">
          <div className="text-xl font-bold text-emerald-800 font-headline">ZIMCO</div>
          <p className="text-slate-500 font-body text-sm leading-relaxed">
            Nigeria's premier ethically-focused financial institution, empowering thousands through community-driven capital.
          </p>
        </div>
        
        <div className="space-y-4">
          <h5 className="font-body text-xs font-medium uppercase tracking-widest text-emerald-900">Quick Links</h5>
          <ul className="space-y-3">
            <li><Link className="font-body text-xs font-medium uppercase tracking-widest text-slate-500 hover:text-emerald-600 transition-colors hover:translate-x-1 inline-block" to="/services">Investment Tiers</Link></li>
            <li><Link className="font-body text-xs font-medium uppercase tracking-widest text-slate-500 hover:text-emerald-600 transition-colors hover:translate-x-1 inline-block" to="/faq">FAQ</Link></li>
            <li><Link className="font-body text-xs font-medium uppercase tracking-widest text-slate-500 hover:text-emerald-600 transition-colors hover:translate-x-1 inline-block" to="/about">Our Board</Link></li>
          </ul>
        </div>

        <div className="space-y-4">
          <h5 className="font-body text-xs font-medium uppercase tracking-widest text-emerald-900">Legal</h5>
          <ul className="space-y-3">
            <li><Link className="font-body text-xs font-medium uppercase tracking-widest text-slate-500 hover:text-emerald-600 transition-colors hover:translate-x-1 inline-block" to="/compliance">Regulatory Compliance</Link></li>
            <li><Link className="font-body text-xs font-medium uppercase tracking-widest text-slate-500 hover:text-emerald-600 transition-colors hover:translate-x-1 inline-block" to="/privacy">Privacy Policy</Link></li>
            <li><Link className="font-body text-xs font-medium uppercase tracking-widest text-slate-500 hover:text-emerald-600 transition-colors hover:translate-x-1 inline-block" to="/terms">Terms of Service</Link></li>
          </ul>
        </div>

        <div className="space-y-4">
          <h5 className="font-body text-xs font-medium uppercase tracking-widest text-emerald-900">Connect</h5>
          <div className="flex gap-4">
            <a className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all" href="#">
              <Share2 className="w-5 h-5" />
            </a>
            <a className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all" href="mailto:info@zimco.coop">
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto pt-12 mt-12 border-t border-slate-200">
        <p className="font-body text-xs font-medium uppercase tracking-widest text-slate-500 text-center">
          © {new Date().getFullYear()} ZIMCO. Ethical growth through transparency.
        </p>
      </div>
    </footer>
  );
}
