import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
import { 
  Package, 
  AlertTriangle, 
  Truck, 
  Layers, 
  Plus, 
  UploadCloud, 
  FileSpreadsheet, 
  CheckCircle2, 
  ArrowUpRight 
} from 'lucide-react';

type Tab = 'overview' | 'distributors' | 'stock';

export default function StockDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [selectedDistributor, setSelectedDistributor] = useState<string>('All');

  const distributors = [
    { id: '1', name: 'Agro-Supply Co.', totalSupplied: 450, status: 'Active' },
    { id: '2', name: 'Global Grains Ltd.', totalSupplied: 1200, status: 'Active' },
    { id: '3', name: 'Lagos Food Hub', totalSupplied: 320, status: 'Active' },
    { id: '4', name: 'Zimco Logistics', totalSupplied: 850, status: 'Active' },
  ];

  const stocks = [
    { id: '1', name: 'Premium Rice (50kg)', category: 'Commodity', quantity: 200, alert: 'Optimum', distributor: 'Global Grains Ltd.', date: 'Oct 24, 2023' },
    { id: '2', name: 'Vegetable Oil (5L)', category: 'Commodity', quantity: 15, alert: 'Low', distributor: 'Agro-Supply Co.', date: 'Oct 23, 2023' },
    { id: '3', name: 'Sugar (1kg)', category: 'Commodity', quantity: 500, alert: 'High', distributor: 'Lagos Food Hub', date: 'Oct 22, 2023' },
    { id: '4', name: 'Salt (500g)', category: 'Commodity', quantity: 120, alert: 'Optimum', distributor: 'Zimco Logistics', date: 'Oct 21, 2023' },
    { id: '5', name: 'Beans (25kg)', category: 'Commodity', quantity: 8, alert: 'Low', distributor: 'Global Grains Ltd.', date: 'Oct 20, 2023' },
  ];

  const filteredStocks = selectedDistributor === 'All' 
    ? stocks 
    : stocks.filter(s => s.distributor === selectedDistributor);

  const renderOverview = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Inventory Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2.5 sm:gap-3 mb-2">
            <Package className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 shrink-0" />
            <h3 className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Total Items</h3>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">1,284</p>
          <p className="text-xs text-emerald-600 mt-1 font-bold">↑ 12% vs last month</p>
        </div>
        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2.5 sm:gap-3 mb-2">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 shrink-0" />
            <h3 className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Low Stock</h3>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">5</p>
          <p className="text-xs text-rose-500 mt-1 font-bold">Requires attention</p>
        </div>
        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2.5 sm:gap-3 mb-2">
            <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 shrink-0" />
            <h3 className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Distributors</h3>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{distributors.length}</p>
          <p className="text-xs text-slate-400 mt-1 font-bold">Active partners</p>
        </div>
        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2.5 sm:gap-3 mb-2">
            <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 shrink-0" />
            <h3 className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Categories</h3>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">12</p>
          <p className="text-xs text-slate-400 mt-1 font-bold">Commodity & Office</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* List of Distributors */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-5 sm:px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h2 className="font-bold text-slate-800 text-sm sm:text-base">Distributors</h2>
            <button className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer">View All</button>
          </div>
          <div className="p-4 space-y-4">
            {distributors.map(d => (
              <div key={d.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs sm:text-sm shrink-0">
                    {d.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-slate-900">{d.name}</p>
                    <p className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-bold">{d.totalSupplied} Units Supplied</p>
                  </div>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
              </div>
            ))}
          </div>
        </div>

        {/* Stock Alert & Specific Distributor Filter */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="font-bold text-slate-800 text-base sm:text-lg">Stock Inventory</h2>
                <p className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider">Real-time status monitoring</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase">Filter:</span>
                <select 
                  value={selectedDistributor}
                  onChange={(e) => setSelectedDistributor(e.target.value)}
                  className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 sm:py-2 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                >
                  <option value="All">All Distributors</option>
                  {distributors.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <th className="pb-4 pl-2">Item Name</th>
                    <th className="pb-4">Category</th>
                    <th className="pb-4">Quantity</th>
                    <th className="pb-4">Alert Status</th>
                    <th className="pb-4">Action</th>
                  </tr>
                </thead>
                <tbody className="text-xs sm:text-sm text-slate-600">
                  {filteredStocks.map(s => (
                    <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 sm:py-4 pl-2">
                        <p className="font-bold text-slate-900">{s.name}</p>
                        <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase">{s.distributor}</p>
                      </td>
                      <td className="py-3.5 sm:py-4">{s.category}</td>
                      <td className="py-3.5 sm:py-4 font-black">{s.quantity}</td>
                      <td className="py-3.5 sm:py-4">
                        <span className={`px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold uppercase ${
                          s.alert === 'Low' ? 'bg-rose-50 text-rose-700' :
                          s.alert === 'High' ? 'bg-purple-50 text-purple-700' :
                          'bg-emerald-50 text-emerald-700'
                        }`}>
                          {s.alert}
                        </span>
                      </td>
                      <td className="py-3.5 sm:py-4">
                        <button className={`text-[9px] sm:text-[10px] font-bold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl transition-colors cursor-pointer ${
                          s.alert === 'Low' ? 'bg-emerald-800 text-white hover:bg-emerald-900' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}>
                          {s.alert === 'Low' ? 'RESTOCK' : 'DISBURSE'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDistributors = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h2 className="font-bold text-slate-800 text-sm sm:text-base">Distributor Management</h2>
          <button className="bg-emerald-800 text-white text-[11px] sm:text-xs font-bold px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl hover:bg-emerald-900 transition-colors flex items-center gap-1.5 sm:gap-2 cursor-pointer">
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            Add Distributor
          </button>
        </div>
        <div className="p-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {distributors.map(d => (
              <div key={d.id} className="p-5 sm:p-6 rounded-2xl border border-slate-100 bg-slate-50/50 hover:border-emerald-200 hover:bg-emerald-50/10 transition-all group">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-emerald-700 text-base sm:text-lg md:text-xl font-black border border-slate-100 shrink-0">
                      {d.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base sm:text-lg">{d.name}</h3>
                      <p className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-widest">Verified Partner</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 sm:py-1 bg-emerald-100 text-emerald-800 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider shrink-0">Active</span>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white p-3 rounded-xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Total Supplied</p>
                    <p className="text-base sm:text-lg font-black text-slate-900">{d.totalSupplied} Units</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Last Delivery</p>
                    <p className="text-base sm:text-lg font-black text-slate-900">Oct 24</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer">View History</button>
                  <button className="flex-1 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer">Contact</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStock = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8 max-w-2xl mx-auto text-center">
        <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-700 mx-auto mb-4 sm:mb-6 shrink-0">
          <FileSpreadsheet className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Import Stock Data</h2>
        <p className="text-xs sm:text-sm text-slate-500 mb-6 sm:mb-8">Upload your stock management Excel file to bulk update inventory, categories, and distributor records.</p>
        
        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 sm:p-12 hover:border-emerald-400 hover:bg-emerald-50/30 transition-all cursor-pointer group">
          <input type="file" className="hidden" id="excel-upload" accept=".xlsx, .xls" />
          <label htmlFor="excel-upload" className="cursor-pointer">
            <UploadCloud className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 group-hover:text-emerald-500 transition-colors mb-3 sm:mb-4 mx-auto" />
            <p className="text-sm sm:text-base font-bold text-slate-700">Click to upload or drag and drop</p>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-1 uppercase font-bold tracking-widest">Excel Files Only (.xlsx, .xls)</p>
          </label>
        </div>

        <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-8">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="text-emerald-600 w-4 h-4 shrink-0" />
            <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Auto-Validation</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="text-emerald-600 w-4 h-4 shrink-0" />
            <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Duplicate Detection</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="text-emerald-600 w-4 h-4 shrink-0" />
            <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Secure Import</span>
          </div>
        </div>

        <button className="mt-8 sm:mt-10 w-full py-3.5 sm:py-4 bg-emerald-800 text-white rounded-xl font-bold hover:bg-emerald-900 transition-all shadow-lg shadow-emerald-950/20 active:scale-[0.98] text-xs sm:text-sm cursor-pointer">
          Process Import
        </button>
        
        <p className="mt-5 sm:mt-6 text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          Download <a href="#" className="text-emerald-700 hover:underline">Sample Template</a> for correct formatting
        </p>
      </div>
    </div>
  );

  return (
    <AdminLayout role="Stock Management" icon="inventory_2">
      <div className="space-y-6">
        {/* Header & Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight capitalize">
              {activeTab} Management
            </h1>
            <p className="text-slate-500 text-sm mt-0.5 font-medium">
              {activeTab === 'overview' && 'Comprehensive view of inventory, alerts, and distributor performance.'}
              {activeTab === 'distributors' && 'Manage and monitor your supply chain partners.'}
              {activeTab === 'stock' && 'Bulk import and inventory synchronization tools.'}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('distributors')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'distributors'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Distributors
            </button>
            <button
              onClick={() => setActiveTab('stock')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'stock'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Import Stock
            </button>
          </div>
        </div>

        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'distributors' && renderDistributors()}
        {activeTab === 'stock' && renderStock()}
      </div>
    </AdminLayout>
  );
}
