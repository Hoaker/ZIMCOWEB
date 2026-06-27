import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import zimcoLogo from '@/assets/images/zimco_logo_1780347665840.png';

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
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-green-600">inventory_2</span>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Items</h3>
          </div>
          <p className="text-3xl font-black text-gray-900">1,284</p>
          <p className="text-xs text-green-600 mt-1 font-bold">↑ 12% vs last month</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-amber-600">warning</span>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Low Stock</h3>
          </div>
          <p className="text-3xl font-black text-gray-900">5</p>
          <p className="text-xs text-red-500 mt-1 font-bold">Requires attention</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-blue-600">local_shipping</span>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Distributors</h3>
          </div>
          <p className="text-3xl font-black text-gray-900">{distributors.length}</p>
          <p className="text-xs text-gray-400 mt-1 font-bold">Active partners</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-purple-600">category</span>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Categories</h3>
          </div>
          <p className="text-3xl font-black text-gray-900">12</p>
          <p className="text-xs text-gray-400 mt-1 font-bold">Commodity & Office</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* List of Distributors */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h2 className="font-bold text-gray-800">Distributors</h2>
            <button className="text-xs font-bold text-green-700 hover:underline">View All</button>
          </div>
          <div className="p-4 space-y-4">
            {distributors.map(d => (
              <div key={d.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
                    {d.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{d.name}</p>
                    <p className="text-[10px] text-gray-400 uppercase font-bold">{d.totalSupplied} Units Supplied</p>
                  </div>
                </div>
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
              </div>
            ))}
          </div>
        </div>

        {/* Stock Alert & Specific Distributor Filter */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="font-bold text-gray-800 text-lg">Stock Inventory</h2>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Real-time status monitoring</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500 uppercase">Filter by Distributor:</span>
                <select 
                  value={selectedDistributor}
                  onChange={(e) => setSelectedDistributor(e.target.value)}
                  className="text-xs font-bold bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-700"
                >
                  <option value="All">All Distributors</option>
                  {distributors.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                    <th className="pb-4 pl-2">Item Name</th>
                    <th className="pb-4">Category</th>
                    <th className="pb-4">Quantity</th>
                    <th className="pb-4">Alert Status</th>
                    <th className="pb-4">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-600">
                  {filteredStocks.map(s => (
                    <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 pl-2">
                        <p className="font-bold text-gray-900">{s.name}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">{s.distributor}</p>
                      </td>
                      <td className="py-4">{s.category}</td>
                      <td className="py-4 font-black">{s.quantity}</td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                          s.alert === 'Low' ? 'bg-red-50 text-red-700' :
                          s.alert === 'High' ? 'bg-purple-50 text-purple-700' :
                          'bg-green-50 text-green-700'
                        }`}>
                          {s.alert}
                        </span>
                      </td>
                      <td className="py-4">
                        <button className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors ${
                          s.alert === 'Low' ? 'bg-[#0b5c36] text-white hover:bg-[#08482a]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h2 className="font-bold text-gray-800">Distributor Management</h2>
          <button className="bg-[#0b5c36] text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-[#08482a] transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">add</span>
            Add Distributor
          </button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {distributors.map(d => (
              <div key={d.id} className="p-6 rounded-2xl border border-gray-100 bg-gray-50/50 hover:border-green-200 hover:bg-green-50/10 transition-all group">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-green-700 text-xl font-black border border-gray-100">
                      {d.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{d.name}</h3>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Verified Partner</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-[10px] font-bold uppercase tracking-wider">Active</span>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white p-3 rounded-xl border border-gray-100">
                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Total Supplied</p>
                    <p className="text-lg font-black text-gray-900">{d.totalSupplied} Units</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-gray-100">
                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Last Delivery</p>
                    <p className="text-lg font-black text-gray-900">Oct 24</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 py-2 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors">View History</button>
                  <button className="flex-1 py-2 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors">Contact</button>
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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-2xl mx-auto text-center">
        <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center text-green-700 mx-auto mb-6">
          <span className="material-symbols-outlined text-4xl">upload_file</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Import Stock Data</h2>
        <p className="text-gray-500 mb-8">Upload your stock management Excel file to bulk update inventory, categories, and distributor records.</p>
        
        <div className="border-2 border-dashed border-gray-200 rounded-3xl p-12 hover:border-green-400 hover:bg-green-50/30 transition-all cursor-pointer group">
          <input type="file" className="hidden" id="excel-upload" accept=".xlsx, .xls" />
          <label htmlFor="excel-upload" className="cursor-pointer">
            <span className="material-symbols-outlined text-5xl text-gray-300 group-hover:text-green-500 transition-colors mb-4">cloud_upload</span>
            <p className="font-bold text-gray-700">Click to upload or drag and drop</p>
            <p className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-widest">Excel Files Only (.xlsx, .xls)</p>
          </label>
        </div>

        <div className="mt-8 flex items-center justify-center gap-8">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-green-600 text-sm">check_circle</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Auto-Validation</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-green-600 text-sm">check_circle</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Duplicate Detection</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-green-600 text-sm">check_circle</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Secure Import</span>
          </div>
        </div>

        <button className="mt-10 w-full py-4 bg-[#0b5c36] text-white rounded-2xl font-bold hover:bg-[#08482a] transition-all shadow-lg shadow-green-900/20 active:scale-[0.98]">
          Process Import
        </button>
        
        <p className="mt-6 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
          Download <a href="#" className="text-green-700 hover:underline">Sample Template</a> for correct formatting
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xl font-black text-green-800 tracking-wider">
            <img src={zimcoLogo} alt="ZIMCO Logo" className="w-7 h-7 rounded-full object-cover shadow-sm ring-1 ring-emerald-500/20" referrerPolicy="no-referrer" />
            <span>ZIMCO</span>
          </div>
          <div className="h-6 w-[1px] bg-gray-200"></div>
          <div className="flex items-center gap-2 bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
            <span className="material-symbols-outlined text-orange-600 text-sm">inventory_2</span>
            <span className="text-[10px] font-bold text-orange-700 uppercase tracking-widest">Stock Management Portal</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-gray-900">Admin User</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase">Storekeeper</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400">
              <span className="material-symbols-outlined">account_circle</span>
            </div>
          </div>
          <Link to="/login" className="text-xs font-bold text-red-600 hover:text-red-700 uppercase tracking-widest">Logout</Link>
        </div>
      </nav>
      
      <div className="flex flex-grow overflow-hidden">
        {/* Left Sidebar Navigation */}
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col sticky top-16 h-[calc(100vh-64px)]">
          <div className="p-6 flex-grow">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-6">Main Navigation</p>
            <nav className="space-y-2">
              <button 
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeTab === 'overview' ? 'bg-[#0b5c36] text-white shadow-lg shadow-green-900/20' : 'text-gray-500 hover:bg-gray-50 hover:text-green-800'
                }`}
              >
                <span className="material-symbols-outlined">dashboard</span>
                Overview
              </button>
              <button 
                onClick={() => setActiveTab('distributors')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeTab === 'distributors' ? 'bg-[#0b5c36] text-white shadow-lg shadow-green-900/20' : 'text-gray-500 hover:bg-gray-50 hover:text-green-800'
                }`}
              >
                <span className="material-symbols-outlined">local_shipping</span>
                Distributors
              </button>
              <button 
                onClick={() => setActiveTab('stock')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeTab === 'stock' ? 'bg-[#0b5c36] text-white shadow-lg shadow-green-900/20' : 'text-gray-500 hover:bg-gray-50 hover:text-green-800'
                }`}
              >
                <span className="material-symbols-outlined">inventory</span>
                Stock
              </button>
            </nav>
          </div>
          
          <div className="p-6 border-t border-gray-100">
            <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
              <p className="text-[10px] font-bold text-green-800 uppercase tracking-wider mb-1">System Status</p>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-[10px] font-bold text-green-700">Operational</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-grow overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            <header className="mb-10">
              <h1 className="text-3xl font-black text-gray-900 tracking-tight capitalize">
                {activeTab} Management
              </h1>
              <p className="text-gray-500 font-medium">
                {activeTab === 'overview' && 'Comprehensive view of inventory, alerts, and distributor performance.'}
                {activeTab === 'distributors' && 'Manage and monitor your supply chain partners.'}
                {activeTab === 'stock' && 'Bulk import and inventory synchronization tools.'}
              </p>
            </header>

            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'distributors' && renderDistributors()}
            {activeTab === 'stock' && renderStock()}
          </div>
        </main>
      </div>
    </div>
  );
}
