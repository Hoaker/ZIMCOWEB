import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  Percent, 
  Calendar, 
  DollarSign, 
  ArrowRight, 
  FileText, 
  Printer, 
  Download, 
  HelpCircle, 
  Sparkles, 
  Award,
  BookOpen,
  CheckCircle,
  Building,
  Briefcase,
  QrCode,
  Shield,
  Zap,
  Sliders,
  DollarSign as NairaIcon,
  RotateCcw,
  Scale,
  XCircle
} from 'lucide-react';
import zimcoLogo from '../assets/images/zimco_logo_1780347665840.png';

// Historical Rates for ZIMCO Portfolios
// All structures are Zero-Interest. Distributions represent surplus dividends or profit-share distribution ratios.
const PORTFOLIO_PRESETS = [
  {
    id: 'ia-agro',
    name: 'Investment Account (IA) - Agriculture Pool',
    category: 'investment',
    historicRatio: 11.4, // 11.4% average annual profit share
    minLockPeriod: 12, // months
    description: 'Direct financing of tractor leases, seed supplies, and wholesale cereal grains distributions. Returns are paid out bi-annually as audited joint venture profit splits.',
    riskDesc: 'Moderate asset fluctuate'
  },
  {
    id: 'ia-commodity',
    name: 'Investment Account (IA) - Murabaha Raw Materials Pool',
    category: 'investment',
    historicRatio: 7.8, // 7.8% average annual return
    minLockPeriod: 6, // months
    description: 'Bulk wholesale acquisition of construction cement and steel rods for municipal builder unions. Backed 100% by physically secured store inventory.',
    riskDesc: 'Low volatility'
  },
  {
    id: 'ss-buffer',
    name: 'Special Savings (SS) - High Liquidity Buffer',
    category: 'savings',
    historicRatio: 4.8, // 4.8% surplus allocation ratio
    minLockPeriod: 1, // month
    description: 'Highly short-term pool maintaining emergency liquid caches. Receives monthly pro-rated mutual surplus payouts from administrative licensing fees.',
    riskDesc: 'Virtually zero risk'
  },
  {
    id: 'mca-takaful',
    name: 'Muslim Community Account (MCA) - Social Yield Pool',
    category: 'savings',
    historicRatio: 3.2,
    minLockPeriod: 3,
    description: 'Strict interest-free pool focused on mutual medical emergency credits, micro-farming grants, and basic education loans. Pays out mutual Takaful surplus shares.',
    riskDesc: 'Zero-interest philanthropic support'
  }
];

// Presets for Commodity financing Murabaha items
const COMMODITY_PRESETS = [
  { name: 'Agricultural Irrigation Kit', cost: 350000, category: 'Equipment' },
  { name: 'Digital Office Workspace Pack (Laptops & Router)', cost: 650000, category: 'Electronics' },
  { name: 'Delivery Motorcycle (150cc Cargo Box)', cost: 1200000, category: 'Logistics' },
  { name: 'Solar Energy Inverter Set (5KVA / 4 Batteries)', cost: 1800000, category: 'Power' }
];

export default function WealthPlanningTool() {
  const [activeTab, setActiveTab] = useState<'calculator' | 'commodity' | 'statement'>('calculator');

  // ROI Calculator States
  const [selectedPresetId, setSelectedPresetId] = useState('ia-agro');
  const [depositAmount, setDepositAmount] = useState<number>(500000);
  const [projectionPeriod, setProjectionPeriod] = useState<number>(3); // years
  const [reinvestmentOption, setReinvestmentOption] = useState<boolean>(true); // compounds surplus ethically by reallocating to pool monthly
  
  // Commodity Leasing States
  const [customAssetCost, setCustomAssetCost] = useState<string>('850000');
  const [selectedPeriod, setSelectedPeriod] = useState<number>(12); // months
  const [selectedCommodityPreset, setSelectedCommodityPreset] = useState<number | null>(null);
  const [markupRate, setMarkupRate] = useState<number>(3.5); // flat fee percentage based on duration index

  // PDF Exporter States
  const [exportAccount, setExportAccount] = useState<'os' | 'ss' | 'ia' | 'cp' | 'mca'>('ia');
  const [exportEntity, setExportEntity] = useState<string>('Federal Department of Agricultural Cooperatives');
  const [exportReferenceCode, setExportReferenceCode] = useState<string>('ZMC-CERT-2026-X8122');
  const [showStatementModal, setShowStatementModal] = useState<boolean>(false);
  const [isStatementGenerating, setIsStatementGenerating] = useState<boolean>(false);

  // ROI Calculations
  const selectedPreset = PORTFOLIO_PRESETS.find(p => p.id === selectedPresetId) || PORTFOLIO_PRESETS[0];
  const rate = selectedPreset.historicRatio / 100;
  
  // Calculate projected returns
  // For Zero-interest structures, periodic returns are reinvested into the physical capital pool
  let finalBalance = depositAmount;
  let totalProfit = 0;
  const yearlyBreakdown = [];

  for (let year = 1; year <= projectionPeriod; year++) {
    let yearProfit = 0;
    if (reinvestmentOption) {
      // Annual compounding ethical profit sharing allocation
      yearProfit = finalBalance * rate;
      finalBalance += yearProfit;
    } else {
      // Simple annual profit share paid out directly (capital does not grow recursively)
      yearProfit = depositAmount * rate;
      finalBalance = depositAmount;
    }
    totalProfit += yearProfit;
    yearlyBreakdown.push({
      year,
      profitShare: yearProfit,
      cumulativeProfit: totalProfit,
      endingBalance: depositAmount + (reinvestmentOption ? (finalBalance - depositAmount) : 0),
      rawBalance: reinvestmentOption ? finalBalance : depositAmount
    });
  }

  // Commodity Calculations
  const assetCost = parseFloat(customAssetCost) || 0;
  // Murabaha rules: Markup is a declared, 100% fixed monetary limit added to cost on purchase date. 
  // No compounding ever, no late payment fees. Flat markup rates adjust by repayment months:
  // 3-6 months: 2.0% | 12 months: 3.5% | 18 months: 5.0% | 24 months: 6.5% flat markup.
  const getMarkupRateByMonths = (months: number) => {
    if (months <= 6) return 2.0;
    if (months <= 12) return 3.5;
    if (months <= 18) return 5.0;
    return 6.5;
  };

  const calculatedMarkupRate = getMarkupRateByMonths(selectedPeriod);
  const totalMarkupCost = assetCost * (calculatedMarkupRate / 100);
  const totalRepaymentAmount = assetCost + totalMarkupCost;
  const monthlyInstallment = totalRepaymentAmount / selectedPeriod;

  // Generate monthly dates list for repayment calendar template
  const generateRepaymentSchedule = () => {
    const list = [];
    let currentDate = new Date();
    currentDate.setMonth(currentDate.getMonth() + 1); // first payment is next month

    for (let m = 1; m <= selectedPeriod; m++) {
      const formattedDate = currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric', day: 'numeric' });
      list.push({
        installmentNumber: m,
        dueDate: formattedDate,
        principalAmount: assetCost / selectedPeriod,
        markupAmount: totalMarkupCost / selectedPeriod,
        installmentSum: monthlyInstallment
      });
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    return list;
  };

  const scheduleList = generateRepaymentSchedule();

  const handleApplyPreset = (preset: typeof COMMODITY_PRESETS[0], index: number) => {
    setSelectedCommodityPreset(index);
    setCustomAssetCost(preset.cost.toString());
  };

  const handleCustomCostChange = (val: string) => {
    setCustomAssetCost(val);
    setSelectedCommodityPreset(null);
  };

  // Run mock exporter with timeout for top-grade UX
  const triggerGenerateStatement = () => {
    setIsStatementGenerating(true);
    setTimeout(() => {
      setIsStatementGenerating(false);
      setShowStatementModal(true);
    }, 1800);
  };

  const printDocument = () => {
    window.print();
  };

  return (
    <div className="space-y-12">
      
      {/* Tab Navigation Controls */}
      <div className="flex flex-wrap items-center justify-between gap-6 border-b border-slate-200/60 pb-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-6 py-3 rounded-full text-xs font-black transition-all flex items-center gap-2 ${
              activeTab === 'calculator' 
                ? 'bg-emerald-900 text-white shadow-md shadow-emerald-900/10' 
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/50'
            }`}
          >
            <TrendingUp size={16} />
            <span>Returns Calculator</span>
          </button>

          <button
            onClick={() => setActiveTab('commodity')}
            className={`px-6 py-3 rounded-full text-xs font-black transition-all flex items-center gap-2 ${
              activeTab === 'commodity' 
                ? 'bg-emerald-900 text-white shadow-md shadow-emerald-900/10' 
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/50'
            }`}
          >
            <Sliders size={16} />
            <span>Asset Financing Calculator</span>
          </button>

          <button
            onClick={() => setActiveTab('statement')}
            className={`px-6 py-3 rounded-full text-xs font-black transition-all flex items-center gap-2 ${
              activeTab === 'statement' 
                ? 'bg-emerald-900 text-white shadow-md shadow-emerald-900/10' 
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/50'
            }`}
          >
            <FileText size={16} />
            <span>Account Statement</span>
          </button>
        </div>

        <div className="text-xs text-slate-400 font-bold font-mono tracking-wider bg-slate-100 px-3 py-1 rounded-full uppercase">
          Planning Tools
        </div>
      </div>

      {/* RENDER TAB content */}
      <AnimatePresence mode="wait">
        
        {/* Tab 1: Profit Margin Estimator */}
        {activeTab === 'calculator' && (
          <motion.div 
            key="roi-calculator"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-10"
          >
            
            {/* Input Form Column (Left 5 cols) */}
            <div className="lg:col-span-5 space-y-8">
              
              <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-100 space-y-6">
                <div>
                  <h3 className="font-headline text-xl font-bold text-slate-900">Estimate Your Returns</h3>
                  <p className="text-xs text-slate-400 mt-1">Calculate your expected profit share based on your investment amount and duration.</p>
                </div>

                {/* Capital Presets Selection Dropdown */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 ml-1">Investment Pool</label>
                  <select
                    value={selectedPresetId}
                    onChange={(e) => setSelectedPresetId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-150 rounded-2xl py-4 px-6 outline-none font-bold text-sm text-slate-800 cursor-pointer focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500"
                  >
                    {PORTFOLIO_PRESETS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.historicRatio}% Est. Return)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Capital Deposit Slider & Input */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-xs font-bold text-slate-500">Deposit Amount</label>
                    <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                      ₦{depositAmount.toLocaleString()}
                    </span>
                  </div>
                  <input 
                    type="range"
                    min="50000"
                    max="10000000"
                    step="50000"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                    className="w-full accent-emerald-800 cursor-ew-resize h-2 bg-slate-100 rounded-lg appearance-none"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono font-bold">
                    <span>₦50,000</span>
                    <span>₦5,000,000</span>
                    <span>₦10,000,000</span>
                  </div>
                </div>

                {/* Duration Slider */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-xs font-bold text-slate-500">Investment Duration</label>
                    <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                      {projectionPeriod} {projectionPeriod === 1 ? 'Year' : 'Years'}
                    </span>
                  </div>
                  <input 
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={projectionPeriod}
                    onChange={(e) => setProjectionPeriod(Number(e.target.value))}
                    className="w-full accent-emerald-800 cursor-ew-resize h-2 bg-slate-100 rounded-lg appearance-none"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono font-bold px-1">
                    <span>1 Yr</span>
                    <span>2 Yrs</span>
                    <span>3 Yrs</span>
                    <span>4 Yrs</span>
                    <span>5 Yrs</span>
                  </div>
                </div>

                {/* Ethical Reinvestment checkbox */}
                <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-150 flex items-start gap-3">
                  <input 
                    type="checkbox"
                    id="reinvest"
                    checked={reinvestmentOption}
                    onChange={(e) => setReinvestmentOption(e.target.checked)}
                    className="h-4.5 w-4.5 rounded border-slate-300 text-emerald-800 focus:ring-emerald-500 accent-emerald-800 mt-0.5 cursor-pointer"
                  />
                  <div className="space-y-1">
                    <label htmlFor="reinvest" className="text-xs font-bold text-slate-800 cursor-pointer flex items-center gap-1">
                      <span>Reinvest Annual Returns</span>
                      <Sparkles size={13} className="text-emerald-700 animate-pulse" />
                    </label>
                    <p className="text-[10px] text-slate-500 leading-normal">
                      Automatically add your yearly profit share back to your balance to grow your returns over time.
                    </p>
                  </div>
                </div>

                {/* Reset Buttons */}
                <button 
                  onClick={() => {
                    setSelectedPresetId('ia-agro');
                    setDepositAmount(500000);
                    setProjectionPeriod(3);
                    setReinvestmentOption(true);
                  }}
                  className="w-full py-3 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw size={14} />
                  <span>Reset Values</span>
                </button>

              </div>

              {/* Pool Description Card */}
              <div className="bg-emerald-950 text-white p-8 rounded-[2.5rem] border border-emerald-800 shadow-xl space-y-4">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                  <Award size={16} />
                  <span>Investment Pool Info</span>
                </div>
                <h4 className="font-headline font-bold text-white text-lg">{selectedPreset.name}</h4>
                <p className="text-xs text-slate-300 leading-relaxed font-body">
                  {selectedPreset.description}
                </p>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-emerald-800/80 text-xs font-mono">
                  <div>
                    <span className="text-emerald-400 block text-[10px]">ESTIMATED ANNUAL RETURN:</span>
                    <span className="font-black text-white text-lg">{selectedPreset.historicRatio}%</span>
                  </div>
                  <div>
                    <span className="text-emerald-400 block text-[10px]">MINIMUM PERIOD:</span>
                    <span className="font-black text-white text-lg">{selectedPreset.minLockPeriod} Months</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Calculations Visual Output (Right 7 cols) */}
            <div className="lg:col-span-7 space-y-8">
              
              <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-100 space-y-8">
                
                {/* Visual Projection Summary Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-6 rounded-[2rem] border border-slate-150">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-mono">Initial Deposit</span>
                    <p className="text-xl font-black text-slate-800">₦{depositAmount.toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-mono">Estimated Total Profit</span>
                    <p className="text-xl font-black text-emerald-800">
                      +₦{Math.round(reinvestmentOption ? (finalBalance - depositAmount) : totalProfit).toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-mono">Estimated Final Balance</span>
                    <p className="text-xl font-black text-slate-900 font-headline">
                      ₦{Math.round(reinvestmentOption ? finalBalance : (depositAmount + totalProfit)).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Graphical Visualizer */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center ml-1">
                    <h4 className="font-headline font-bold text-slate-800 text-sm">Growth Over Time</h4>
                    <span className="text-[10px] text-slate-400 font-mono">Method: {reinvestmentOption ? 'Reinvested' : 'Annual Payout'}</span>
                  </div>

                  <div className="relative h-64 bg-slate-50/50 border border-slate-150 rounded-2xl flex items-end justify-around p-6 pt-12">
                    
                    {/* Y-axis ticks */}
                    <div className="absolute left-4 top-4 bottom-6 flex flex-col justify-between text-[9px] text-slate-400 font-mono font-bold pointer-events-none">
                      <span>Max Target</span>
                      <span>Midpoint</span>
                      <span>Initial</span>
                    </div>

                    {/* Bars Grid */}
                    {yearlyBreakdown.map((row) => {
                      const maxVal = yearlyBreakdown[yearlyBreakdown.length - 1].endingBalance;
                      const principalRatio = (depositAmount / maxVal) * 100;
                      const totalRatio = (row.endingBalance / maxVal) * 100;
                      const profitRatio = totalRatio - principalRatio;

                      return (
                        <div key={row.year} className="flex flex-col items-center gap-3 w-16 h-full justify-end group cursor-help relative">
                          
                          {/* Hover tooltip */}
                          <div className="pointer-events-none absolute -top-8 bg-slate-900 text-white text-[10px] px-2.5 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 font-mono">
                            Balance: ₦{Math.round(row.endingBalance).toLocaleString()} <br />
                            Profit: ₦{Math.round(row.cumulativeProfit).toLocaleString()}
                          </div>

                          {/* Stacked bar plot */}
                          <div className="w-10 bg-slate-200/60 rounded-t-lg overflow-hidden h-full flex flex-col justify-end relative shadow-inner">
                            {/* Cumulative Profit share block */}
                            <motion.div 
                              initial={{ height: 0 }}
                              animate={{ height: `${profitRatio}%` }}
                              transition={{ duration: 0.8, delay: row.year * 0.1 }}
                              className="bg-emerald-600 rounded-t-sm"
                            ></motion.div>
                            {/* Principal base block */}
                            <div 
                              style={{ height: `${principalRatio}%` }}
                              className="bg-emerald-950/20 border-t border-white/20"
                            ></div>
                          </div>

                          {/* Year signature */}
                          <span className="text-xs font-semibold text-slate-400 font-mono">
                            Year {row.year}
                          </span>
                        </div>
                      );
                    })}

                  </div>

                  {/* Graph Legends */}
                  <div className="flex justify-center gap-6 text-[10px] font-bold text-slate-500 font-mono pt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-slate-300 rounded"></div>
                      <span>Initial Deposit</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-emerald-600 rounded"></div>
                      <span>Estimated Profit</span>
                    </div>
                  </div>

                </div>

                {/* Audit breakdown table */}
                <div className="space-y-4">
                  <h4 className="font-headline font-bold text-slate-800 text-sm ml-1">Yearly Breakdown</h4>
                  <div className="overflow-hidden border border-slate-150 rounded-2xl">
                    <table className="w-full text-left text-xs font-semibold">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-150 text-slate-400 font-mono font-bold text-[10px] uppercase tracking-wider">
                          <th className="py-3 px-5">Year</th>
                          <th className="py-3 px-5 text-right">Estimated Annual Return</th>
                          <th className="py-3 px-5 text-right font-bold text-slate-800">Total Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-150 text-slate-600 font-mono">
                        {yearlyBreakdown.map((row) => (
                          <tr key={row.year} className="hover:bg-slate-50/40">
                            <td className="py-3.5 px-5">Year {row.year}</td>
                            <td className="py-3.5 px-5 text-right text-emerald-700 font-bold">+₦{Math.round(row.profitShare).toLocaleString()}</td>
                            <td className="py-3.5 px-5 text-right font-black text-slate-800">₦{Math.round(row.endingBalance).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Shari'ah Compliance / Anti-Usury Disclaimer Footnote */}
                <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-500/10 text-xs text-amber-900 leading-relaxed font-body flex gap-3">
                  <Scale className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold block mb-1">Zero-Interest Cooperative Investment</span>
                    <p>
                      Calculations are estimates based on historical pool performance. ZIMCO operates strictly under fair profit-sharing principles with zero interest, no hidden charges, and real asset backing.
                    </p>
                  </div>
                </div>

              </div>
              
            </div>

          </motion.div>
        )}

        {/* Tab 2: Commodity Instalment Estimator */}
        {activeTab === 'commodity' && (
          <motion.div 
            key="commodity-leasing"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-10"
          >
            {/* Input Options Column (Left 5 cols) */}
            <div className="lg:col-span-5 space-y-8">
              
              <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-100 space-y-6">
                <div>
                  <h3 className="font-headline text-xl font-bold text-slate-900">Asset Financing Calculator</h3>
                  <p className="text-xs text-slate-400 mt-1">Calculate your monthly installments for purchasing equipment or vehicles through the cooperative.</p>
                </div>

                {/* Capital Presets Buttons Grid */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-500 ml-1">Sample Equipment Packages</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {COMMODITY_PRESETS.map((preset, index) => (
                      <button
                        key={index}
                        onClick={() => handleApplyPreset(preset, index)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          selectedCommodityPreset === index
                            ? 'bg-emerald-50/20 border-emerald-600 text-emerald-950'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200/50 text-slate-700'
                        }`}
                      >
                        <p className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider">{preset.category}</p>
                        <p className="text-xs font-bold text-slate-800 line-clamp-1 mt-0.5">{preset.name}</p>
                        <p className="text-xs font-black text-emerald-800 mt-1 font-mono">₦{preset.cost.toLocaleString()}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Asset Cost Input Field */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 ml-1">Item / Equipment Cost (₦)</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₦</span>
                    <input 
                      type="number"
                      placeholder="0.00"
                      value={customAssetCost}
                      onChange={(e) => handleCustomCostChange(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-150 rounded-2xl py-4 pl-10 pr-6 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Month repayments Select Options */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 ml-1">Repayment Period</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                    {[3, 6, 12, 18, 24].map((mo) => (
                      <button
                        key={mo}
                        onClick={() => setSelectedPeriod(mo)}
                        className={`py-3 rounded-xl font-mono text-xs font-bold border transition-all ${
                          selectedPeriod === mo
                            ? 'bg-emerald-905 bg-emerald-900 border-transparent text-white shadow'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200/50 text-slate-600'
                        }`}
                      >
                        {mo} Mo
                      </button>
                    ))}
                  </div>
                </div>

                {/* Policy Highlights box */}
                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-500/10 leading-relaxed space-y-2 text-xs">
                  <p className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <CheckCircle size={14} className="text-emerald-700" />
                    <span>Transparent Fixed Pricing</span>
                  </p>
                  <p className="text-slate-500 text-[10px]">
                    The cooperative purchases the item for you with a small, transparent fixed fee spread across your repayment period. No interest, no extra penalties for early repayment, and no surprise charges.
                  </p>
                </div>

              </div>

            </div>

            {/* Calculations Visual Output (Right 7 cols) */}
            <div className="lg:col-span-7 space-y-8">
              
              <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-100 space-y-8">
                
                {/* Visual Projection Summary Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-slate-50 p-6 rounded-[2rem] border border-slate-150">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-mono">Item Price</span>
                    <p className="text-lg font-black text-slate-900">₦{assetCost.toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-mono">Cooperative Fee ({calculatedMarkupRate}%)</span>
                    <p className="text-lg font-black text-amber-800">₦{totalMarkupCost.toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-mono">Monthly Payment</span>
                    <p className="text-lg font-black text-emerald-850 text-emerald-800">
                      ₦{Math.round(monthlyInstallment).toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-mono">Total Amount Payable</span>
                    <p className="text-lg font-black text-slate-800 font-headline">
                      ₦{Math.round(totalRepaymentAmount).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Installment Calendar Table */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center ml-1">
                    <h4 className="font-headline font-bold text-slate-850 text-slate-800 text-sm">Monthly Payment Schedule</h4>
                    <span className="text-[10px] text-slate-400 font-mono">Billing Cycle: Monthly Base</span>
                  </div>

                  <div className="overflow-hidden border border-slate-150 rounded-2xl max-h-96 overflow-y-auto">
                    <table className="w-full text-left text-xs font-semibold">
                      <thead className="sticky top-0 bg-white z-10">
                        <tr className="bg-slate-50 border-b border-slate-150 text-slate-400 font-mono font-bold text-[10px] uppercase tracking-wider">
                          <th className="py-3 px-5">Month</th>
                          <th className="py-3 px-5">Due Date</th>
                          <th className="py-3 px-5 text-right">Fee Portion</th>
                          <th className="py-3 px-5 text-right text-slate-800 font-bold">Monthly Payment</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-150 text-slate-600 font-mono">
                        {scheduleList.map((row) => (
                          <tr key={row.installmentNumber} className="hover:bg-slate-50/40">
                            <td className="py-3.5 px-5 font-bold">Month {row.installmentNumber} of {selectedPeriod}</td>
                            <td className="py-3.5 px-5 flex items-center gap-1.5 text-[11px] text-slate-500 font-bold">
                              <Calendar size={12} className="text-emerald-700" />
                              {row.dueDate}
                            </td>
                            <td className="py-3.5 px-5 text-right text-amber-800">₦{Math.round(row.markupAmount).toLocaleString()}</td>
                            <td className="py-3.5 px-5 text-right font-black text-slate-800">₦{Math.round(row.installmentSum).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Joint Action alert buffer */}
                <div className="p-6 bg-slate-900 text-white rounded-[2rem] flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="space-y-1">
                    <p className="font-bold text-sm">Ready to apply for asset financing?</p>
                    <p className="text-[10px] text-slate-400">Financing requires member verification and active savings standing.</p>
                  </div>
                  <button 
                    onClick={() => alert('Financing simulation complete. You can apply for financing under Loans in your dashboard.')}
                    className="px-6 py-3 bg-emerald-600 text-white hover:bg-emerald-500 rounded-xl text-xs font-black transition-colors shrink-0 cursor-pointer"
                  >
                    Apply for Financing
                  </button>
                </div>

              </div>
              
            </div>

          </motion.div>
        )}

        {/* Tab 3: Official Statement Exporter (PDF Previews) */}
        {activeTab === 'statement' && (
          <motion.div 
            key="statement-exporter"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-10"
          >
            {/* Exporter form setup (Left 5 cols) */}
            <div className="lg:col-span-5 space-y-8">
              
              <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-100 space-y-6">
                <div>
                  <h3 className="font-headline text-xl font-bold text-slate-900">Generate Official Statement</h3>
                  <p className="text-xs text-slate-400 mt-1">Create an official cooperative account statement for visa, loan, or official verification purposes.</p>
                </div>

                {/* Select Account */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 ml-1">Select Account</label>
                  <select
                    value={exportAccount}
                    onChange={(e) => setExportAccount(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-150 rounded-2xl py-4 px-6 outline-none font-bold text-sm text-slate-800 cursor-pointer focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500"
                  >
                    <option value="os">Ordinary Savings (OS) - ₦2,450,000</option>
                    <option value="ss">Special Savings (SS) - ₦450,000</option>
                    <option value="ia">Investment Account (IA) - ₦1,200,000</option>
                    <option value="cp">Commodity Account (CP) - ₦150,000</option>
                    <option value="mca">Muslim Community Account (MCA) - ₦300,000</option>
                  </select>
                </div>

                {/* Submitting Entity Name input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 ml-1">Addressed To (Optional)</label>
                  <input 
                    type="text"
                    value={exportEntity}
                    onChange={(e) => setExportEntity(e.target.value)}
                    placeholder="e.g. Embassy, Bank, or Official Organization"
                    className="w-full bg-slate-50 border border-slate-150 rounded-2xl py-4 px-6 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500"
                  />
                  <p className="text-[10px] text-slate-450 text-slate-400 leading-normal ml-1">
                    Appears in the statement header for your intended recipient.
                  </p>
                </div>

                {/* Custom reference code generating options */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 ml-1">Verification Code</label>
                  <div className="flex gap-3">
                    <input 
                      type="text"
                      value={exportReferenceCode}
                      onChange={(e) => setExportReferenceCode(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-150 rounded-2xl py-3.5 px-5 text-xs font-mono font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500"
                    />
                    <button 
                      onClick={() => setExportReferenceCode('ZMC-CERT-2026-X' + Math.floor(10000 + Math.random() * 90000))}
                      className="px-4 py-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 rounded-xl text-xs font-extrabold transition-all shrink-0 cursor-pointer"
                    >
                      New Code
                    </button>
                  </div>
                </div>

                {/* Generate PDF Trigger Button */}
                <button
                  onClick={triggerGenerateStatement}
                  disabled={isStatementGenerating}
                  className="w-full py-4 bg-emerald-900 hover:bg-emerald-800 text-white rounded-2xl font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isStatementGenerating ? (
                    <>
                      <RotateCcw className="w-5 h-5 animate-spin" />
                      <span>Generating Statement...</span>
                    </>
                  ) : (
                    <>
                      <Printer className="w-5 h-5" />
                      <span>Download / Print Statement</span>
                    </>
                  )}
                </button>

              </div>

            </div>

            {/* Document Digital Ledger View Preview (Right 7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-slate-100 space-y-8 flex flex-col justify-between">
              
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider ml-1">
                  <CheckCircle size={14} />
                  <span>Document Preview</span>
                </div>
                <h4 className="font-headline text-2xl font-black text-slate-900 leading-snug">
                  Statement Preview
                </h4>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Here is a preview of your official account statement. You can download or print it directly.
                </p>
              </div>

              {/* Dynamic Simulated Sheet Frame */}
              <div className="border border-slate-200 bg-white p-6 rounded-3xl space-y-6 shadow-inner relative overflow-hidden font-body text-slate-800">
                {/* Background watermarks or seals */}
                <div className="absolute right-12 bottom-12 w-48 h-48 bg-emerald-500/5 rounded-full border border-emerald-500/10 flex items-center justify-center pointer-events-none -rotate-12">
                  <p className="text-[10px] text-emerald-600/40 font-bold font-mono text-center tracking-widest leading-6 uppercase">
                    ZIMCO COOPERATIVE <br /> OFFICIAL SEAL <br /> 2026
                  </p>
                </div>

                {/* Sheet Title Bar */}
                <div className="flex justify-between items-start gap-4 border-b border-slate-100 pb-5">
                  <div className="flex items-center gap-3">
                    <img 
                      src={zimcoLogo} 
                      alt="ZIMCO Cooperative Society Logo" 
                      className="w-12 h-12 rounded-full border-2 border-emerald-600/30 object-cover" 
                      referrerPolicy="no-referrer" 
                    />
                    <div>
                      <h5 className="font-headline font-black text-emerald-950 font-bold tracking-tight text-sm">ZIMCO COOPERATIVE SOCIETY LTD</h5>
                      <span className="text-[9px] text-slate-400 font-mono font-bold">REGISTRATION NUMBER: ZIM-COOP-921-X</span>
                    </div>
                  </div>
                  
                  {/* High Contrast Green Seal Badge */}
                  <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-500/20 text-emerald-800 text-[10px] font-mono font-black rounded-lg">
                    VERIFIED OFFICIAL
                  </div>
                </div>

                {/* Main Body */}
                <div className="space-y-4 text-xs font-medium">
                  {/* Verification Destination Address Banner */}
                  <div className="grid grid-cols-2 gap-4 text-[10px] font-mono text-slate-400">
                    <div>
                      <p className="font-bold">MEMBER DETAILS</p>
                      <p className="text-slate-800 font-bold text-xs mt-0.5">JOHN DOE</p>
                      <p className="text-slate-500">MEMBER ID: ZIMCO-MEM-2026-9812</p>
                    </div>
                    <div>
                      <p className="font-bold">ADDRESSED TO</p>
                      <p className="text-slate-800 font-bold text-xs mt-0.5 uppercase">{exportEntity}</p>
                      <p className="text-slate-550 text-slate-500 font-bold font-mono">CODE: {exportReferenceCode}</p>
                    </div>
                  </div>

                  {/* Certified Balances table */}
                  <div className="border border-slate-100 rounded-xl overflow-hidden mt-6 bg-slate-50/50">
                    <div className="grid grid-cols-3 gap-2 bg-slate-150 p-2 text-[9px] font-mono text-slate-400 uppercase tracking-wider font-extrabold border-b border-slate-100">
                      <span>Account Type</span>
                      <span className="text-right">Status</span>
                      <span className="text-right text-slate-800">Balance (₦)</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 p-3 text-[11px] font-mono">
                      <span className="font-bold">
                        {exportAccount === 'os' ? 'Ordinary Savings (OS)' :
                         exportAccount === 'ss' ? 'Special Savings (SS)' :
                         exportAccount === 'ia' ? 'Investment Account (IA)' :
                         exportAccount === 'cp' ? 'Commodity Account (CP)' :
                         'Muslim Community Account (MCA)'}
                      </span>
                      <span className="text-slate-400 text-right font-bold">Active</span>
                      <span className="text-right font-black text-emerald-850 text-emerald-800 text-xs">
                        {exportAccount === 'os' ? '₦2,450,000.00' :
                         exportAccount === 'ss' ? '₦450,000.00' :
                         exportAccount === 'ia' ? '₦1,200,000.00' :
                         exportAccount === 'cp' ? '₦150,000.00' :
                         '₦300,000.00'}
                      </span>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-500 leading-normal italic text-justify pt-2">
                    "This certifies that the account balances listed above represent verified member funds securely held by ZIMCO Cooperative Society Limited. All funds are backed by real assets in full compliance with Nigerian cooperative regulations."
                  </p>
                </div>

                {/* Stamp & Signatory bottom board */}
                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <QrCode size={40} className="text-slate-800 shrink-0" />
                    <div className="font-mono text-[8px] text-slate-400">
                      <p className="font-bold">VERIFICATION QR</p>
                      <p>Scan to verify at</p>
                      <p>zimcocoop.com</p>
                    </div>
                  </div>

                  {/* High contrast stamps / signatures */}
                  <div className="flex gap-4">
                    <div className="text-center font-mono text-[9px]">
                      <div className="text-slate-800 italic font-black font-serif underline decoration-emerald-600 block">
                        Ibrahim Al-Hassan
                      </div>
                      <p className="text-slate-400 text-[8px] mt-1 uppercase">Ethical Advisory Board</p>
                    </div>

                    <div className="text-center font-mono text-[9px] border-l border-slate-200 pl-4">
                      <div className="text-slate-800 italic font-black font-serif underline decoration-emerald-600 block">
                        Chika Nwajakor
                      </div>
                      <p className="text-slate-400 text-[8px] mt-1 uppercase">Registrar of Cooperatives</p>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </motion.div>
        )}

      </AnimatePresence>

      {/* PRINT OPTIMIZED SHEET LAYOUT FULL DIALOG */}
      <AnimatePresence>
        {showStatementModal && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[3rem] w-full max-w-4xl overflow-hidden border border-slate-100 shadow-2xl relative"
            >
              
              {/* Gold border decorative strip */}
              <div className="h-4 bg-gradient-to-r from-emerald-800 via-amber-400 to-emerald-950"></div>

              {/* Close Button */}
              <button 
                onClick={() => setShowStatementModal(false)}
                className="absolute top-8 right-8 p-2 rounded-full bg-slate-150 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <XCircle size={22} className="text-slate-500 hover:text-rose-600" />
              </button>

              <div className="p-8 sm:p-12 space-y-8 max-h-[85vh] overflow-y-auto">
                <div className="text-center space-y-3">
                  <div className="inline-flex p-3.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100 inline-block">
                    <FileText size={36} className="text-emerald-700" />
                  </div>
                  <h3 className="font-headline text-2xl font-black text-slate-900 leading-snug">
                    OFFICIAL ACCOUNT STATEMENT
                  </h3>
                  <p className="text-xs text-slate-500 font-bold font-mono tracking-widest uppercase">
                    Verification Code: {exportReferenceCode}
                  </p>
                </div>

                {/* Printable Document Base sheet container */}
                <div id="print-contents" className="bg-white border-2 border-slate-200 p-8 sm:p-12 rounded-[2rem] space-y-8 font-body text-slate-800 shadow-inner relative max-w-3xl mx-auto">
                  
                  {/* Decorative stamp watermark behind printable sheets */}
                  <div className="absolute right-12 bottom-12 w-64 h-64 bg-emerald-500/5 rounded-full border border-emerald-500/10 flex items-center justify-center pointer-events-none -rotate-12">
                    <div className="text-[10px] text-emerald-600/40 font-bold font-mono text-center tracking-widest leading-6 uppercase">
                      ZIMCO COOPERATIVE <br /> OFFICIAL STAMP <br /> VERIFIED <br /> 2026
                    </div>
                  </div>

                  {/* Print Document Header */}
                  <div className="flex justify-between items-start gap-4 border-b-2 border-slate-100 pb-6">
                    <div className="flex items-center gap-4">
                      <img 
                        src={zimcoLogo} 
                        alt="ZIMCO Cooperative Society Limited Official Logo" 
                        className="w-14 h-14 rounded-full border border-emerald-600 object-cover" 
                        referrerPolicy="no-referrer" 
                      />
                      <div>
                        <h4 className="font-headline font-black text-slate-900 tracking-tight text-base sm:text-lg">ZIMCO COOPERATIVE SOCIETY LIMITED</h4>
                        <span className="text-[9px] text-slate-400 font-mono font-bold block uppercase mt-0.5">Approved under Cooperatives Societies Laws • Federal Republic of Nigeria</span>
                      </div>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-500/25 text-emerald-850 text-emerald-800 text-[10px] font-mono font-black py-2 px-4 rounded-xl text-center shrink-0">
                      OFFICIAL STATEMENT
                    </div>
                  </div>

                  {/* Grid details */}
                  <div className="grid grid-cols-2 gap-8 text-[11px] font-mono">
                    <div className="space-y-1">
                      <p className="font-extrabold text-slate-400 uppercase tracking-wider">Member Details</p>
                      <p className="text-slate-800 font-black text-xs">JOHN DOE</p>
                      <p className="text-slate-500">MEMBER ID: ZIMCO-MEM-2026-9812</p>
                      <p className="text-slate-500">CONTACT: +234 812 345 6789</p>
                      <p className="text-slate-500">EMAIL: john.doe@zimmercoop.com</p>
                    </div>

                    <div className="space-y-1 text-right">
                      <p className="font-extrabold text-slate-400 uppercase tracking-wider">Verification Details</p>
                      <p className="text-slate-800 font-black text-xs uppercase">{exportEntity}</p>
                      <p className="text-slate-500">REFERENCE: {exportReferenceCode}</p>
                      <p className="text-slate-500">DATE ISSUED: June 01, 2026</p>
                      <p className="text-[10px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full inline-block mt-1 font-bold">STATUS: VERIFIED</p>
                    </div>
                  </div>

                  {/* Capital Balances Verification breakdown list */}
                  <div className="border border-slate-200 rounded-[1.5rem] overflow-hidden bg-slate-50">
                    <table className="w-full text-left text-xs font-semibold">
                      <thead>
                        <tr className="bg-slate-150 border-b border-slate-200 text-slate-400 font-mono font-bold text-[10px] uppercase tracking-wider">
                          <th className="py-3.5 px-5">Account</th>
                          <th className="py-3.5 px-5">Account Type</th>
                          <th className="py-3.5 px-5 text-right text-slate-800">Balance (₦)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-slate-600 font-mono text-[11px]">
                        
                        <tr>
                          <td className="py-4 px-5">Ordinary Savings (OS)</td>
                          <td className="py-4 px-5 font-bold text-slate-400">Regular Savings</td>
                          <td className="py-4 px-5 text-right text-slate-800 font-bold">₦2,450,000.00</td>
                        </tr>

                        <tr className="bg-white">
                          <td className="py-4 px-5">Special Savings (SS)</td>
                          <td className="py-4 px-5 font-bold text-slate-400">Target Savings</td>
                          <td className="py-4 px-5 text-right text-slate-800 font-bold">₦450,000.00</td>
                        </tr>

                        <tr>
                          <td className="py-4 px-5">Investment Account (IA)</td>
                          <td className="py-4 px-5 font-bold text-slate-400">Agriculture Pool</td>
                          <td className="py-4 px-5 text-right text-slate-800 font-bold">₦1,200,000.00</td>
                        </tr>

                        <tr className="bg-white">
                          <td className="py-4 px-5">Commodity Account (CP)</td>
                          <td className="py-4 px-5 font-bold text-slate-400">Asset Financing</td>
                          <td className="py-4 px-5 text-right text-slate-800 font-bold">₦150,000.00</td>
                        </tr>

                        <tr>
                          <td className="py-4 px-5 font-bold text-emerald-900">
                            {exportAccount === 'os' ? 'Ordinary Savings (OS)' :
                             exportAccount === 'ss' ? 'Special Savings (SS)' :
                             exportAccount === 'ia' ? 'Investment Account (IA)' :
                             exportAccount === 'cp' ? 'Commodity Account (CP)' :
                             'Muslim Community Account (MCA)'}
                          </td>
                          <td className="py-4 px-5 font-bold text-emerald-700 uppercase">SELECTED ACCOUNT</td>
                          <td className="py-4 px-5 text-right font-black text-emerald-850 text-emerald-800 text-sm">
                            {exportAccount === 'os' ? '₦2,450,000.00' :
                             exportAccount === 'ss' ? '₦450,000.00' :
                             exportAccount === 'ia' ? '₦1,200,000.00' :
                             exportAccount === 'cp' ? '₦150,000.00' :
                             '₦300,000.00'}
                          </td>
                        </tr>

                      </tbody>
                    </table>
                  </div>

                  {/* Declaration text */}
                  <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200/40 text-[10px] text-amber-900 leading-relaxed font-body">
                    <p className="font-bold uppercase tracking-wider mb-1 block">OFFICIAL DECLARATION</p>
                    <p>
                      This document certifies that the member named above holds the verified account balances listed with ZIMCO Cooperative Society Limited. All funds are backed by real assets in full compliance with Nigerian cooperative regulations. Scanning the QR code verifies this statement with our official records.
                    </p>
                  </div>

                  {/* Footer Stamps */}
                  <div className="flex justify-between items-center pt-6 border-t border-slate-100">
                    <div className="flex items-center gap-3">
                      <QrCode size={48} className="text-slate-850 shrink-0" />
                      <div className="font-mono text-[8px] text-slate-400 leading-relaxed">
                        <p className="font-extrabold text-slate-800 uppercase tracking-wide">VERIFICATION QR CODE</p>
                        <p>ZIMCO Verification Code</p>
                        <p className="font-bold text-slate-600">{exportReferenceCode}</p>
                      </div>
                    </div>

                    <div className="flex gap-6">
                      <div className="text-center font-mono text-[9px]">
                        <span className="text-slate-800 font-serif font-black underline decoration-2 decoration-emerald-600">
                          Prof. Ibrahim Al-Hassan
                        </span>
                        <p className="text-slate-400 text-[8px] mt-1 uppercase">Chairman, Shari’ah Board</p>
                      </div>

                      <div className="text-center font-mono text-[9px] border-l border-slate-150 pl-6">
                        <span className="text-slate-800 font-serif font-black underline decoration-2 decoration-emerald-600">
                          Hon. Chika Nwajakor
                        </span>
                        <p className="text-slate-400 text-[8px] mt-1 uppercase">Registrar of Cooperatives</p>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Print button footer bar */}
                <div className="pt-6 border-t border-slate-100 flex justify-end gap-3.5">
                  <button
                    onClick={() => setShowStatementModal(false)}
                    className="px-6 py-3.5 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancel / Exit
                  </button>
                  <button
                    onClick={printDocument}
                    className="px-8 py-3.5 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Printer size={16} />
                    <span>Print PDF Document</span>
                  </button>
                </div>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
