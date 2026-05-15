import React, { useState, useEffect } from 'react';
import { Plus, ArrowUpRight, DollarSign, TrendingUp, Clock, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

export default function Earnings() {
  const [earnings, setEarnings] = useState([]);
  const [productionEntries, setProductionEntries] = useState([]);
  const [filteredEarnings, setFilteredEarnings] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEarning, setNewEarning] = useState({ amount: '', source: '', quantity: 1, category: 'Sale', status: 'Paid' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [summaryStats, setSummaryStats] = useState({
    totalRevenue: 0,
    paidAmount: 0,
    pendingAmount: 0,
    estimatedProfit: 0
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [earnRes, prodRes] = await Promise.all([
          api.get('/earnings'),
          api.get('/production')
        ]);
        const earningsData = earnRes.data || [];
        const productionData = prodRes.data || [];

        setEarnings(earningsData);
        setProductionEntries(productionData);
        calculateStats(earningsData, productionData);
      } catch (err) {
        console.error('Failed to load earnings data:', err);
      }
    };

    loadData();
  }, []);

  const calculateStats = (earningsData, productionData) => {
    const totalRevenue = earningsData.reduce((sum, e) => sum + (e.amount || 0), 0);
    const paidAmount = earningsData.filter(e => e.status === 'Paid').reduce((sum, e) => sum + (e.amount || 0), 0);
    const pendingAmount = earningsData.filter(e => e.status === 'Pending').reduce((sum, e) => sum + (e.amount || 0), 0);
    const totalMaterialCost = productionData.reduce((sum, p) => sum + (p.materialCost || 0), 0);
    const estimatedProfit = Math.max(0, totalRevenue - totalMaterialCost);

    setSummaryStats({
      totalRevenue,
      paidAmount,
      pendingAmount,
      estimatedProfit: Math.round(estimatedProfit)
    });
  };

  useEffect(() => {
    let filtered = [...earnings];

    if (searchTerm) {
      filtered = filtered.filter(e => 
        e.source.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus) {
      filtered = filtered.filter(e => e.status === filterStatus);
    }

    setFilteredEarnings(filtered);
  }, [earnings, searchTerm, filterStatus]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        source: newEarning.source,
        amount: parseFloat(newEarning.amount) || 0,
        quantity: parseInt(newEarning.quantity, 10) || 1,
        category: newEarning.category,
        status: newEarning.status
      };
      const { data } = await api.post('/earnings', payload);
      const newEarnings = [data, ...earnings];
      setEarnings(newEarnings);
      calculateStats(newEarnings, productionEntries);
      setIsModalOpen(false);
      setNewEarning({ amount: '', source: '', quantity: 1, category: 'Sale', status: 'Paid' });
    } catch (err) {
      alert('Failed to log earning');
    }
  };

  const stats = [
    { label: 'Total Revenue', value: `₹${summaryStats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'bg-green-100', textColor: 'text-green-600' },
    { label: 'Paid', value: `₹${summaryStats.paidAmount.toLocaleString()}`, icon: ArrowUpRight, color: 'bg-emerald-100', textColor: 'text-emerald-600' },
    { label: 'Pending', value: `₹${summaryStats.pendingAmount.toLocaleString()}`, icon: Clock, color: 'bg-amber-100', textColor: 'text-amber-600' },
    { label: 'Est. Profit', value: `₹${summaryStats.estimatedProfit.toLocaleString()}`, icon: TrendingUp, color: 'bg-blue-100', textColor: 'text-blue-600' },
  ];

  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('');
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-5 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Earnings & Payments</h2>
          <p className="text-artisan-ink/60 text-sm">Track your income and financial growth.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-artisan-clay text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:brightness-110 transition-all"
        >
          <Plus size={20} />
          Log Sale
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-artisan-olive/10 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-3 rounded-xl ${stat.color} ${stat.textColor}`}>
                <stat.icon size={20} />
              </div>
              <p className="text-xs text-artisan-ink/40 font-bold uppercase tracking-wider">{stat.label}</p>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-artisan-ink/40" />
          <input
            type="text"
            placeholder="Search by source or item..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-artisan-olive/10 rounded-xl px-12 py-3 text-sm outline-none focus:border-artisan-clay"
          />
        </div>
        <div className="flex gap-4">
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-white border border-artisan-olive/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-artisan-clay"
          >
            <option value="">All Status</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>
      {(searchTerm || filterStatus) && (
        <button
          onClick={clearFilters}
          className="text-xs font-bold text-artisan-clay hover:underline"
        >
          Clear Filters
        </button>
      )}

      <div className="bg-white rounded-3xl border border-artisan-olive/10 shadow-sm overflow-hidden">
        <div className="p-8">
          <h3 className="text-xl font-bold mb-6">Recent Transactions</h3>
          <div className="space-y-4">
            {filteredEarnings.map((earning) => (
              <div key={earning._id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-artisan-cream/30 rounded-2xl border border-artisan-olive/5 hover:bg-artisan-cream/50 transition-all">
                <div className="flex items-start md:items-center gap-4">
                  <div className={`p-2 rounded-lg ${earning.status === 'Paid' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                    <ArrowUpRight size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-sm">{earning.source}</p>
                    <p className="text-[10px] uppercase tracking-widest text-artisan-ink/40">
                      Qty: {earning.quantity || 1} • {new Date(earning.date).toLocaleDateString()} • {earning.category} • {earning.status}
                    </p>
                  </div>
                </div>
                <div className="text-right mt-3 md:mt-0">
                  <p className="text-lg font-bold text-green-600">+₹{(earning.amount || 0).toLocaleString()}</p>
                </div>
              </div>
            ))}
            {filteredEarnings.length === 0 && (
              <div className="text-center py-10 text-artisan-ink/40">
                <p>{searchTerm || filterStatus ? 'No earnings match your filters.' : 'No earnings logged yet. Time to make some sales!'}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-artisan-ink/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-artisan-cream w-full max-w-md p-8 rounded-3xl shadow-2xl"
            >
              <h3 className="text-2xl font-bold mb-6">Log New Sale</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-1 ml-1">Source / Item Sold</label>
                  <input 
                    required
                    className="w-full bg-white border border-artisan-olive/10 rounded-xl px-4 py-3 outline-none focus:border-artisan-clay"
                    placeholder="e.g. Ceramic Vase"
                    value={newEarning.source}
                    onChange={e => setNewEarning({...newEarning, source: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-1 ml-1">Quantity</label>
                    <input 
                      type="number"
                      required
                      min="1"
                      className="w-full bg-white border border-artisan-olive/10 rounded-xl px-4 py-3 outline-none focus:border-artisan-clay"
                      placeholder="1"
                      value={newEarning.quantity}
                      onChange={e => setNewEarning({...newEarning, quantity: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1 ml-1">Amount (₹)</label>
                    <input 
                      type="number"
                      required
                      step="0.01"
                      className="w-full bg-white border border-artisan-olive/10 rounded-xl px-4 py-3 outline-none focus:border-artisan-clay"
                      placeholder="0.00"
                      value={newEarning.amount}
                      onChange={e => setNewEarning({...newEarning, amount: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1 ml-1">Category</label>
                  <select 
                    className="w-full bg-white border border-artisan-olive/10 rounded-xl px-4 py-3 outline-none focus:border-artisan-clay"
                    value={newEarning.category}
                    onChange={e => setNewEarning({...newEarning, category: e.target.value})}
                  >
                    <option>Sale</option>
                    <option>Commission</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1 ml-1">Status</label>
                  <select 
                    className="w-full bg-white border border-artisan-olive/10 rounded-xl px-4 py-3 outline-none focus:border-artisan-clay"
                    value={newEarning.status}
                    onChange={e => setNewEarning({...newEarning, status: e.target.value})}
                  >
                    <option>Paid</option>
                    <option>Pending</option>
                  </select>
                </div>
                <button type="submit" className="w-full bg-artisan-clay text-white py-4 rounded-2xl font-bold shadow-lg mt-4">
                  Log Earning
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
