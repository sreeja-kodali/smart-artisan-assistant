import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Calendar, Package, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';

export default function Reports() {
  const [reportData, setReportData] = useState({
    weeklyData: [],
    materialUsage: [],
    summaryStats: { weeklyTotal: 0, monthlyTotal: 0, weeklyEarnings: 0, monthlyEarnings: 0, totalSold: 0, topItem: 'N/A' }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const [prodRes, earnRes] = await Promise.all([
          api.get('/production'),
          api.get('/earnings')
        ]);

        const productions = prodRes.data || [];
        const earnings = earnRes.data || [];

        // Calculate weekly/monthly totals
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const weeklyProds = productions.filter(p => new Date(p.date) >= weekAgo);
        const monthlyProds = productions.filter(p => new Date(p.date) >= monthAgo);
        const weeklyEarns = earnings.filter(e => new Date(e.date) >= weekAgo);
        const monthlyEarns = earnings.filter(e => new Date(e.date) >= monthAgo);

        // Summary stats
        const weeklyTotal = weeklyProds.reduce((sum, p) => sum + (p.quantity || 0), 0);
        const monthlyTotal = monthlyProds.reduce((sum, p) => sum + (p.quantity || 0), 0);
        const weeklyEarningsTotal = weeklyEarns.reduce((sum, e) => sum + (e.amount || 0), 0);
        const monthlyEarningsTotal = monthlyEarns.reduce((sum, e) => sum + (e.amount || 0), 0);
        const totalSold = productions.reduce((sum, p) => sum + (p.quantity || 0), 0);

        // Top selling item
        const itemCounts = {};
        productions.forEach(p => {
          itemCounts[p.item] = (itemCounts[p.item] || 0) + (p.quantity || 0);
        });
        const topItem = Object.keys(itemCounts).length > 0 
          ? Object.entries(itemCounts).sort((a, b) => b[1] - a[1])[0][0]
          : 'N/A';

        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const weeklyData = [
          { day: 'Monday', production: 0, earnings: 0 },
          { day: 'Tuesday', production: 0, earnings: 0 },
          { day: 'Wednesday', production: 0, earnings: 0 },
          { day: 'Thursday', production: 0, earnings: 0 },
          { day: 'Friday', production: 0, earnings: 0 },
          { day: 'Saturday', production: 0, earnings: 0 },
          { day: 'Sunday', production: 0, earnings: 0 }
        ];

        weeklyProds.forEach(item => {
          const dayName = days[new Date(item.date).getDay()];
          const row = weeklyData.find(d => d.day === dayName);
          if (row) {
            row.production += Number(item.quantity) || 0;
          }
        });

        weeklyEarns.forEach(item => {
          const dayName = days[new Date(item.date).getDay()];
          const row = weeklyData.find(d => d.day === dayName);
          if (row) {
            row.earnings += Number(item.amount) || 0;
          }
        });

        // Material usage pie chart
        const materialCounts = {};
        productions.forEach(p => {
          if (p.materials && Array.isArray(p.materials)) {
            p.materials.forEach(m => {
              materialCounts[m] = (materialCounts[m] || 0) + 1;
            });
          }
        });
        const materialUsageData = Object.entries(materialCounts).map(([name, value]) => ({
          name,
          value
        }));

        setReportData({
          weeklyData,
          materialUsage: materialUsageData,
          summaryStats: {
            weeklyTotal,
            monthlyTotal,
            weeklyEarnings: weeklyEarningsTotal,
            monthlyEarnings: monthlyEarningsTotal,
            totalSold,
            topItem
          }
        });
      } catch (err) {
        console.error('Failed to fetch reports:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const stats = [
    { label: 'Weekly Production', value: reportData.summaryStats.weeklyTotal, icon: Package, color: 'bg-blue-100', textColor: 'text-blue-600' },
    { label: 'Monthly Production', value: reportData.summaryStats.monthlyTotal, icon: Package, color: 'bg-purple-100', textColor: 'text-purple-600' },
    { label: 'Weekly Earnings', value: `₹${reportData.summaryStats.weeklyEarnings.toLocaleString()}`, icon: DollarSign, color: 'bg-green-100', textColor: 'text-green-600' },
    { label: 'Monthly Earnings', value: `₹${reportData.summaryStats.monthlyEarnings.toLocaleString()}`, icon: DollarSign, color: 'bg-emerald-100', textColor: 'text-emerald-600' },
  ];

  const colors = ['#a3845c', '#d4a574', '#c9a876', '#e8c4a0', '#d9b99a'];

  if (loading) {
    return <div className="flex items-center justify-center h-full"><p className="font-serif italic">Loading reports...</p></div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-3xl font-bold flex items-center gap-3">
          <TrendingUp className="text-artisan-clay" size={28} />
          Workshop Reports
        </h2>
        <p className="text-artisan-ink/60 text-sm mt-1">Insights into your production and earnings.</p>
      </header>

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

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Production Chart */}
        <div className="bg-white p-6 rounded-3xl border border-artisan-olive/10 shadow-sm">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Package size={20} className="text-artisan-clay" />
            Weekly Production
          </h3>
          {reportData.weeklyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData.weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8dcc8" />
                <XAxis dataKey="day" stroke="#666" angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#666" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#f5f1e8', border: '1px solid #d9ccb8', borderRadius: '8px' }}
                  cursor={{ fill: 'rgba(163, 132, 92, 0.1)' }}
                />
                <Bar dataKey="production" fill="#a3845c" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 flex items-center justify-center text-artisan-ink/40">No data available</div>
          )}
        </div>

        {/* Earnings Trend Chart */}
        <div className="bg-white p-6 rounded-3xl border border-artisan-olive/10 shadow-sm">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <DollarSign size={20} className="text-artisan-clay" />
            Weekly Earnings Trend
          </h3>
          {reportData.weeklyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={reportData.weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8dcc8" />
                <XAxis dataKey="day" stroke="#666" angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#666" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#f5f1e8', border: '1px solid #d9ccb8', borderRadius: '8px' }}
                  cursor={{ stroke: '#a3845c', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="earnings" 
                  stroke="#a3845c" 
                  strokeWidth={3}
                  dot={{ fill: '#a3845c', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 flex items-center justify-center text-artisan-ink/40">No data available</div>
          )}
        </div>
      </div>

      {/* Material Usage & Top Item */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Material Usage Pie Chart */}
        <div className="bg-white p-6 rounded-3xl border border-artisan-olive/10 shadow-sm">
          <h3 className="text-lg font-bold mb-4">Material Usage</h3>
          {reportData.materialUsage.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={reportData.materialUsage}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#a3845c"
                  dataKey="value"
                >
                  {reportData.materialUsage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 flex items-center justify-center text-artisan-ink/40">No data available</div>
          )}
        </div>

        {/* Summary Info */}
        <div className="space-y-4">
          <div className="bg-artisan-cream p-6 rounded-3xl border border-artisan-olive/10">
            <p className="text-xs text-artisan-ink/40 font-bold uppercase tracking-wider mb-2">Top Selling Item</p>
            <p className="text-3xl font-bold text-artisan-clay">{reportData.summaryStats.topItem}</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-artisan-olive/10 shadow-sm space-y-4">
            <h3 className="text-lg font-bold">Total Metrics</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-artisan-cream/30 rounded-2xl">
                <span className="font-medium text-sm">Total Products Sold</span>
                <span className="text-2xl font-bold text-artisan-clay">{reportData.summaryStats.totalSold}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-artisan-cream/30 rounded-2xl">
                <span className="font-medium text-sm">Unique Materials Used</span>
                <span className="text-2xl font-bold text-artisan-clay">{reportData.materialUsage.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
