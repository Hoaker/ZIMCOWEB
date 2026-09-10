import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  ShieldCheck, 
  CheckCircle2, 
  Download, 
  ExternalLink, 
  Lock, 
  Award, 
  Scale, 
  Building, 
  Search, 
  X, 
  ChevronRight, 
  Info,
  Calendar,
  AlertCircle,
  Clock,
  Briefcase
} from 'lucide-react';

// Documents Schema
interface DocumentResource {
  id: string;
  title: string;
  category: 'bylaws' | 'certificates' | 'agm' | 'audits';
  description: string;
  fileSize: string;
  publishDate: string;
  referenceNumber: string;
  sha256: string;
  authority: string;
}

// Ethical Certificates Schema
interface EthicalCertificate {
  id: string;
  title: string;
  bodyName: string;
  description: string;
  issueDate: string;
  expiryDate: string;
  complianceStandard: string;
  status: 'valid' | 'renewal';
  auditStamp: string;
  signatories: string[];
}

export default function Compliance() {
  const [activeCategory, setActiveCategory] = useState<'all' | 'bylaws' | 'certificates' | 'agm' | 'audits'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadSuccessMsg, setDownloadSuccessMsg] = useState<string | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<EthicalCertificate | null>(null);

  // Simulated Document Resource Data
  const documents: DocumentResource[] = [
    {
      id: 'doc-1',
      title: 'ZIMCO Unified Cooperative Society Bylaws (2026 Edition)',
      category: 'bylaws',
      description: 'Official governing charter and cooperative binding laws regulating capital allocation, savings tiers, and cooperative member rights.',
      fileSize: '2.4 MB',
      publishDate: 'Jan 15, 2026',
      referenceNumber: 'ZMC-BYLAW-2026-V4',
      sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
      authority: 'National Cooperative Development League'
    },
    {
      id: 'doc-2',
      title: 'Validated Registration Certificate of Cooperative Union',
      category: 'certificates',
      description: 'Official corporate registration issued by the State Ministry of Agriculture, Cooperatives, and Rural Development.',
      fileSize: '1.1 MB',
      publishDate: 'May 12, 2012',
      referenceNumber: 'SMAC-REG-NIG-17892',
      sha256: '6892a00c6d9a2fe55aa015a3bf4f1b2b0b822cd15d6caa088f86d081884c7d65',
      authority: 'State Registrar of Cooperatives'
    },
    {
      id: 'doc-3',
      title: '12th Annual General Meeting (AGM) Comprehensive Report',
      category: 'agm',
      description: 'Official minutes, aggregate asset valuations, board resolutions, and member surplus payout distributions voted in 2025.',
      fileSize: '4.8 MB',
      publishDate: 'Dec 05, 2025',
      referenceNumber: 'ZMC-AGM-2025-REP',
      sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      authority: 'ZIMCO Board of Directors'
    },
    {
      id: 'doc-4',
      title: 'Ethical Zero-Interest Portfolios Audited Fiscal Accounts',
      category: 'audits',
      description: 'Independent audit report validating asset-backed ledger pooling, zero-interest loans ledger alignment, and commodity stock inventories.',
      fileSize: '3.6 MB',
      publishDate: 'Mar 10, 2026',
      referenceNumber: 'ZMC-AUD-2025-FINAL',
      sha256: 'a12e98d45f65f00a089f86d081884c7d659a2feaa0c55ad015a3bf4f123abcde',
      authority: 'Al-Hilal Ethical Audit Associates'
    },
    {
      id: 'doc-5',
      title: 'Liquidity Reserve & Joint-Liability Fund Policy',
      category: 'bylaws',
      description: 'Legal protocols outlining the management of joint-liability pools (Takaful framework) used to shield members from default.',
      fileSize: '1.8 MB',
      publishDate: 'Feb 18, 2026',
      referenceNumber: 'ZMC-LIQ-RES-2026',
      sha256: 'd1982ab7c55ad015a3bf4f1b2b0b822cd15d6c15b9f86d081884c7d65a2feaa0',
      authority: 'Joint Compliance Directorate'
    }
  ];

  // Simulated Ethical Certifications
  const ethicalCertifications: EthicalCertificate[] = [
    {
      id: 'eth-1',
      title: 'Zero-Interest Shari’ah Compliance Seal',
      bodyName: 'Supreme Council of Islamic Financial Advisory Boards',
      description: 'Annual verification confirming that all of ZIMCO’s Special Savings (SS), Investment Tiers (IA), and Commodity Murabaha purchase partnerships operate using non-interest profit sharing structures. Absolutely no compound charges or usury parameters are employed.',
      issueDate: 'June 01, 2025',
      expiryDate: 'May 31, 2027',
      complianceStandard: 'ISB-STD-402 (Non-Usury Asset Partnership)',
      status: 'valid',
      auditStamp: 'SCIFAB/AUD/2025-998',
      signatories: [
        'Prof. Ibrahim Al-Hassan (Chairman, Ethical Advisory Board)',
        'Dr. Amina Yusuf-Bello (Compliance Director)'
      ]
    },
    {
      id: 'eth-2',
      title: 'Cooperative Union Transparency Rating',
      bodyName: 'State Ministry of Cooperative & Small Enterprise Trust',
      description: 'Official legal audit badge affirming that ZIMCO maintains accurate open-ledger bookkeeping and delivers maximum interest-free safety buffers. Audited profiles show continuous compliance with rural community asset preservation guidelines.',
      issueDate: 'August 14, 2025',
      expiryDate: 'August 13, 2026',
      complianceStandard: 'SMC-CLASS-A (Cooperative Integrity)',
      status: 'valid',
      auditStamp: 'SMC-TRUST-REG-771',
      signatories: [
        'Hon. Chika Nwajakor (Registrar of Cooperative Societies)',
        'Comrade Yusuf Adebayo (State Union Inspector)'
      ]
    },
    {
      id: 'eth-3',
      title: 'Ethical Asset-Backed Liquidity Seal',
      bodyName: 'Global Association of Socially Responsible Finance',
      description: 'Global standard certification verifying that capital reserves deposited under ZIMCO portfolios are 100% tied to physical assets, commodities, or actual properties. This prevents speculative derivative inflation and ensures economic stability.',
      issueDate: 'October 10, 2025',
      expiryDate: 'October 09, 2027',
      complianceStandard: 'G-SRF: Ethical Sinking Buffers Protocol',
      status: 'valid',
      auditStamp: 'GSRF-EUR/2026-X11',
      signatories: [
        'Marcus Vance (Secretary General, GASRF)',
        'Hassan Abdulhamid (Middle East & Africa Inspector)'
      ]
    }
  ];

  const handleDownload = (doc: DocumentResource) => {
    setDownloadingId(doc.id);
    setDownloadProgress(0);
    setDownloadSuccessMsg(null);

    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setDownloadingId(null);
            setDownloadSuccessMsg(`Downloaded ${doc.referenceNumber} successfully. Document verified.`);
            
            // Trigger actual browser download mock with virtual string
            const element = document.createElement("a");
            const file = new Blob([`ZIMCO OFFICIAL DOCUMENT ARCHIVE\nRef: ${doc.referenceNumber}\nDate Issued: ${doc.publishDate}\nVerification Code: ${doc.sha256}\n\nThis certifies document validity for ZIMCO Cooperative Society.`], {type: 'text/plain'});
            element.href = URL.createObjectURL(file);
            element.download = `${doc.title.toLowerCase().replace(/[^a-z0-9]/g, "_")}.txt`;
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
          }, 600);
          return 100;
        }
        return prev + 25;
      });
    }, 200);
  };

  const filteredDocs = documents.filter(doc => {
    const matchesCategory = activeCategory === 'all' || doc.category === activeCategory;
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          doc.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <main className="pt-28 pb-24 px-6 md:px-12 max-w-7xl mx-auto space-y-16">
      
      {/* Header and Compliance Introduction */}
      <section className="text-center max-w-3xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-500/10 rounded-full text-xs font-bold uppercase tracking-wider">
          <Scale size={14} />
          <span>Governance & Legal Integrity</span>
        </div>
        <h1 className="font-headline text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Regulatory Compliance <br className="hidden sm:inline" />
          <span className="text-emerald-800 font-black">& Official Documents</span>
        </h1>
        <p className="text-slate-600 font-body text-base sm:text-lg leading-relaxed">
          ZIMCO Cooperative operates under strict structural guidelines certified by state ministries and advisory Councils. We support transparency by providing members with audited statements and official records.
        </p>
      </section>

      {/* Section 1: Ethical Compliance Badges & Certificates */}
      <section className="bg-white rounded-[3rem] p-8 md:p-12 border border-slate-100 shadow-sm space-y-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-100 pb-8">
          <div>
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm tracking-wider uppercase">
              <Award className="w-5 h-5 shrink-0" />
              <span>Trust Seals & Verifications</span>
            </div>
            <h2 className="font-headline text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              Ethical Compliance Certifications
            </h2>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-150 text-xs text-slate-500 leading-relaxed font-mono max-w-md">
            Click any active badge below to view official signers, expiration dates, and non-interest compliance records.
          </div>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {ethicalCertifications.map((cert) => (
            <motion.div 
              key={cert.id}
              whileHover={{ y: -5 }}
              className="group p-6 rounded-3xl bg-slate-50 hover:bg-emerald-50/15 border border-slate-200/50 hover:border-emerald-500/20 transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Badge Visual Stamp */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100/60 border border-emerald-500/20 text-emerald-800 flex items-center justify-center font-bold text-center p-1 shadow-inner relative shrink-0">
                    <ShieldCheck className="w-6 h-6 text-emerald-700" />
                    <span className="absolute -bottom-1 -right-1 bg-emerald-800 text-[8px] text-white font-mono px-1.5 py-0.5 rounded-full scale-90 border border-white">
                      ACTIVE
                    </span>
                  </div>
                  <div>
                    <h3 className="font-headline font-bold text-slate-900 group-hover:text-emerald-950 transition-colors text-base leading-snug">
                      {cert.title}
                    </h3>
                    <p className="text-xs text-slate-400 font-bold font-mono tracking-wider uppercase mt-0.5">
                      {cert.complianceStandard}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                  {cert.description}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-200/40 flex justify-between items-center">
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-55 bg-emerald-150 px-2.5 py-1 rounded-full font-mono">
                  Valid: {cert.expiryDate}
                </span>
                <button 
                  onClick={() => setSelectedCertificate(cert)}
                  className="text-xs font-black text-emerald-900 hover:text-emerald-700 flex items-center gap-1 group-hover:underline cursor-pointer"
                >
                  <span>Verify Seal</span>
                  <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Section 2: Central Resource & Document Hub */}
      <section className="bg-white rounded-[3rem] p-8 md:p-12 border border-slate-100 shadow-sm space-y-8">
        
        {/* Hub Heading & Controls */}
        <div className="flex flex-col xl:flex-row items-start xl:items-end justify-between gap-6 border-b border-slate-100 pb-8">
          <div>
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm tracking-wider uppercase">
              <Building className="w-5 h-5 shrink-0" />
              <span>Public Archive Hub</span>
            </div>
            <h2 className="font-headline text-3xl font-black text-slate-900 mt-1">
              Central Resource & Document Hub
            </h2>
            <p className="text-slate-500 text-sm mt-1 max-w-xl">
              Inspect verified legal records, cooperative regulations, bylaws, and audited financial statements. Verification codes are provided for official verification.
            </p>
          </div>

          {/* Search bar inside public archive */}
          <div className="w-full xl:w-96 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Search size={18} />
            </span>
            <input 
              type="text"
              placeholder="Search documents, IDs, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-150 rounded-full py-3.5 pl-12 pr-6 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>
        </div>

        {/* Sorting Categories Navigation */}
        <div className="flex flex-wrap gap-2.5">
          {[
            { id: 'all', label: 'All Resources' },
            { id: 'bylaws', label: 'Official Bylaws' },
            { id: 'certificates', label: 'Validated Certificates' },
            { id: 'agm', label: 'AGM Reports' },
            { id: 'audits', label: 'Audited Fiscal Accounts' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                activeCategory === cat.id 
                  ? 'bg-emerald-900 text-white shadow-md' 
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Global Download Alert Message Toast */}
        {downloadSuccessMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-950 font-semibold rounded-2xl flex items-start justify-between gap-4 text-xs"
          >
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p>{downloadSuccessMsg}</p>
                <span className="text-[10px] text-emerald-600/70 font-mono">Status: Ready • Download Completed Successfully</span>
              </div>
            </div>
            <button onClick={() => setDownloadSuccessMsg(null)} className="text-emerald-900 hover:text-emerald-700">
              <X size={16} />
            </button>
          </motion.div>
        )}

        {/* Document Cards List */}
        <div className="space-y-5">
          {filteredDocs.length > 0 ? (
            filteredDocs.map((doc) => {
              const isCurrDownloading = downloadingId === doc.id;
              
              return (
                <div 
                  key={doc.id}
                  className="p-6 md:p-8 rounded-[2rem] bg-slate-50 border border-slate-200/50 hover:bg-white hover:border-slate-300 hover:shadow-xl hover:shadow-slate-100 transition-all duration-300"
                >
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    <div className="space-y-3 max-w-3xl">
                      {/* Meta Tags */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold uppercase rounded-full tracking-wider font-mono">
                          {doc.category}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold font-mono">
                          REF: {doc.referenceNumber}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                          <Calendar size={14} />
                          {doc.publishDate}
                        </span>
                      </div>

                      <h3 className="font-headline text-lg sm:text-xl font-bold text-slate-900">
                        {doc.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                        {doc.description}
                      </p>

                      {/* Document Verification Code */}
                      <div className="flex items-center gap-2 pt-1">
                        <Lock size={12} className="text-slate-400 shrink-0" />
                        <span className="text-[10px] text-slate-400 font-mono bg-white px-2 py-0.5 rounded border border-slate-150 max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
                          Security Verification Code: {doc.sha256}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-row lg:flex-col lg:items-end justify-between lg:justify-center gap-4 w-full lg:w-auto pt-6 lg:pt-0 border-t lg:border-t-0 border-slate-250 border-slate-200">
                      <div className="text-left lg:text-right">
                        <p className="text-xs text-slate-400 font-bold uppercase font-mono tracking-wider">File Information</p>
                        <p className="text-sm font-bold text-slate-700">{doc.fileSize}</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">{doc.authority}</p>
                      </div>

                      <button 
                        disabled={downloadingId !== null}
                        onClick={() => handleDownload(doc)}
                        className={`px-5 py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                          isCurrDownloading 
                            ? 'bg-slate-200 text-slate-500 animate-pulse w-full lg:w-36' 
                            : 'bg-emerald-900 text-white hover:bg-emerald-800 hover:shadow-md cursor-pointer w-full lg:w-36'
                        }`}
                      >
                        {isCurrDownloading ? (
                          <span>Progress: {downloadProgress}%</span>
                        ) : (
                          <>
                            <Download size={14} />
                            <span>Download PDF</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Progressive Download Bar */}
                  {isCurrDownloading && (
                    <div className="w-full bg-slate-200 h-1 rounded-full mt-4 overflow-hidden">
                      <div className="bg-emerald-600 h-1 transition-all duration-200" style={{ width: `${downloadProgress}%` }}></div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400">
              <Info className="w-10 h-10 mx-auto mb-3 text-slate-300" />
              <p className="font-bold">No documents match your query</p>
              <p className="text-xs text-slate-400 mt-1">Try refining search parameters or categories.</p>
            </div>
          )}
        </div>
      </section>

      {/* Section 3: Governance Compliance Disclaimer */}
      <section className="p-8 bg-slate-900 text-white rounded-[3rem] shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 rounded-full text-[10px] font-bold tracking-wider uppercase font-mono">
            Government Regulated Cooperative
          </div>
          <h3 className="font-headline text-xl font-bold">Nigeria Cooperative Union Oversight</h3>
          <p className="text-xs text-slate-400">
            All savings allocation modules and cooperative accounts are reported quarterly to state ministries of commerce and cooperative federations.
          </p>
        </div>
        
        <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 flex flex-col gap-3 font-mono shrink-0 w-full md:w-auto text-xs">
          <div className="flex justify-between gap-10">
            <span className="text-slate-400">STATE REGISTRATION ID:</span>
            <span className="text-emerald-400 font-bold">ZIM-COOP-921-X</span>
          </div>
          <div className="flex justify-between gap-10">
            <span className="text-slate-400">SYSTEM STATUS:</span>
            <span className="text-emerald-400 font-bold">VERIFIED & ACTIVE</span>
          </div>
          <div className="flex justify-between gap-10">
            <span className="text-slate-400">COMPLIANCE SEALS:</span>
            <span className="text-emerald-400 font-bold">3 PASSED • 100% OK</span>
          </div>
        </div>
      </section>

      {/* Ethical Certificate Modal Viewer */}
      <AnimatePresence>
        {selectedCertificate && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden border border-slate-100 shadow-2xl relative"
            >
              {/* Gold / Emerald Certificate Header Top Bar */}
              <div className="h-4 bg-gradient-to-r from-emerald-800 via-amber-400 to-emerald-900"></div>

              {/* Close Button */}
              <button 
                onClick={() => setSelectedCertificate(null)}
                className="absolute top-8 right-8 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors"
              >
                <X size={18} />
              </button>

              <div className="p-8 sm:p-10 space-y-8">
                {/* Certificate Heading */}
                <div className="text-center space-y-3">
                  <div className="inline-flex p-3 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-150 inline-block mb-3">
                    <Award size={36} className="text-emerald-700" />
                  </div>
                  <h3 className="font-headline text-2xl font-black text-slate-900 leading-snug">
                    CERTIFICATE OF ETHICAL COOPERATION
                  </h3>
                  <p className="text-xs text-slate-500 font-bold font-mono tracking-widest uppercase">
                    Audit stamp: {selectedCertificate.auditStamp}
                  </p>
                </div>

                {/* Certificate Core Description */}
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/60 font-body text-xs sm:text-sm text-slate-600 leading-relaxed text-center space-y-4">
                  <p className="font-bold text-slate-900">
                    Officially Confirmed By: <br />
                    <span className="text-emerald-800 font-extrabold text-base">{selectedCertificate.bodyName}</span>
                  </p>
                  <p className="italic">
                    "{selectedCertificate.description}"
                  </p>
                  <p className="text-[11px] font-bold text-amber-800 font-mono bg-amber-50 px-3 py-1.5 rounded-full inline-block">
                    Standard Code: {selectedCertificate.complianceStandard}
                  </p>
                </div>

                {/* Metadata details list */}
                <div className="grid grid-cols-2 gap-4 text-xs font-mono border-t border-b border-slate-100 py-4">
                  <div>
                    <p className="text-slate-400">DATE OF VALIDATION:</p>
                    <p className="font-bold text-slate-700 mt-0.5">{selectedCertificate.issueDate}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">EXPIRATION DATE:</p>
                    <p className="font-bold text-slate-700 mt-0.5">{selectedCertificate.expiryDate}</p>
                  </div>
                </div>

                {/* Signatures */}
                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Official Regulatory Signatories</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedCertificate.signatories.map((sig, i) => (
                      <div key={i} className="p-4 bg-emerald-50/30 rounded-xl border border-emerald-500/5">
                        <p className="text-slate-800 font-bold text-xs leading-5">{sig}</p>
                        <p className="text-[10px] text-emerald-700/70 font-mono mt-1 italic font-semibold">Digitally Signed & Validated</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action button inside dialog */}
                <div className="pt-4 flex justify-end">
                  <button 
                    onClick={() => {
                      alert(`Certificate verified successfully. Trace ID: ZMCO-ETH-SIG-${Math.floor(100000 + Math.random() * 900000)}.`);
                    }}
                    className="px-6 py-3 bg-emerald-900 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <ShieldCheck size={16} />
                    <span>Print Official Record</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </main>
  );
}
