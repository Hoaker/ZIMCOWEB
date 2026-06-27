import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function Contact() {
  return (
    <main className="pt-32 pb-24 px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Info */}
          <div>
            <h1 className="font-headline text-5xl font-extrabold text-on-surface mb-8 tracking-tighter">
              Get in Touch
            </h1>
            <p className="text-on-surface-variant text-xl leading-relaxed mb-12">
              Have questions about our investment tiers or loan applications? Our dedicated advisors are here to help you navigate your financial journey.
            </p>

            <div className="space-y-8">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Email Us</h4>
                  <p className="text-on-surface-variant">info@zimco.coop</p>
                  <p className="text-on-surface-variant">support@zimco.coop</p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Call Us</h4>
                  <p className="text-on-surface-variant">+234 (0) 800 ZIMCO COOP</p>
                  <p className="text-on-surface-variant">+234 1 234 5678</p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Visit Us</h4>
                  <p className="text-on-surface-variant">
                    123 Co-operative Way,<br/>
                    Victoria Island, Lagos,<br/>
                    Nigeria
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-10 md:p-12 rounded-[3rem] bg-white border border-slate-100 shadow-xl"
          >
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">First Name</label>
                  <input 
                    type="text" 
                    className="w-full px-6 py-4 rounded-2xl bg-surface border-none focus:ring-2 focus:ring-primary transition-all"
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">Last Name</label>
                  <input 
                    type="text" 
                    className="w-full px-6 py-4 rounded-2xl bg-surface border-none focus:ring-2 focus:ring-primary transition-all"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">Email Address</label>
                <input 
                  type="email" 
                  className="w-full px-6 py-4 rounded-2xl bg-surface border-none focus:ring-2 focus:ring-primary transition-all"
                  placeholder="john@example.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">Subject</label>
                <select className="w-full px-6 py-4 rounded-2xl bg-surface border-none focus:ring-2 focus:ring-primary transition-all">
                  <option>General Inquiry</option>
                  <option>Loan Application</option>
                  <option>Investment Tiers</option>
                  <option>Member Portal Support</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">Message</label>
                <textarea 
                  rows={4}
                  className="w-full px-6 py-4 rounded-2xl bg-surface border-none focus:ring-2 focus:ring-primary transition-all resize-none"
                  placeholder="How can we help you?"
                />
              </div>

              <button className="w-full bg-primary text-white py-5 rounded-full font-headline font-extrabold text-xl flex items-center justify-center gap-3 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                Send Message
                <Send className="w-5 h-5" />
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
