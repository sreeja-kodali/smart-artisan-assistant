import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Banknote, Hammer, TrendingUp, Clock, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState({ totalEarnings: 0, totalItemsProduced: 0, totalSales: 0 });
  const [activities, setActivities] = useState([]);
  const [insights, setInsights] = useState({ productionGrowth: 0, mostUsedMaterial: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [summaryRes, prodRes, earnRes] = await Promise.all([
          api.get('/earnings/summary'),
          api.get('/production'),
          api.get('/earnings')
        ]);

        const summaryData = summaryRes.data || {};
        const productions = prodRes.data || [];
        const earnings = earnRes.data || [];

        setSummary({
          totalEarnings: summaryData.totalEarnings || 0,
          totalItemsProduced: summaryData.totalItemsProduced || 0,
          totalSales: summaryData.totalSales || earnings.length
        });

        const now = new Date();
        const recentActivities = [];

        productions.slice(0, 6).forEach(p => {
          recentActivities.push({
            type: 'production',
            text: `Added ${p.item || 'Unknown Item'}`,
            date: p.date ? new Date(p.date) : now
          });
        });

        earnings.slice(0, 6).forEach(e => {
          recentActivities.push({
            type: 'sale',
            text: `Logged Sale ${e.source || 'Unknown Item'} - ₹${e.amount || 0}`,
            date: e.date ? new Date(e.date) : now
          });
        });

        recentActivities.sort((a, b) => b.date - a.date);
        setActivities(recentActivities.slice(0, 6));

        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

        const thisWeekProds = productions.filter(p => p.date && new Date(p.date) >= weekAgo);
        const lastWeekProds = productions.filter(p => p.date && new Date(p.date) >= twoWeeksAgo && new Date(p.date) < weekAgo);

        const thisWeekTotal = thisWeekProds.reduce((sum, p) => sum + (p.quantity || 0), 0);
        const lastWeekTotal = lastWeekProds.reduce((sum, p) => sum + (p.quantity || 0), 0);

        const growthPercent = lastWeekTotal > 0
          ? Math.round(((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100)
          : thisWeekTotal > 0 ? 100 : 0;

        const materialCounts = {};
        productions.forEach(p => {
          (p.materials || []).forEach(m => {
            materialCounts[m] = (materialCounts[m] || 0) + (p.quantity || 1);
          });
        });

        const topMaterial = Object.keys(materialCounts).length > 0
          ? Object.entries(materialCounts).sort((a, b) => b[1] - a[1])[0][0]
          : '';

        setInsights({
          productionGrowth: growthPercent,
          mostUsedMaterial: topMaterial
        });
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const stats = [
    { label: 'Total Earnings', value: `₹${summary.totalEarnings.toLocaleString()}`, icon: Banknote, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Items Produced', value: summary.totalItemsProduced.toLocaleString(), icon: Hammer, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Total Sales', value: summary.totalSales.toLocaleString(), icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="h-24 rounded-3xl bg-artisan-cream border border-artisan-olive/10 shadow-sm animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="h-40 rounded-3xl bg-artisan-cream border border-artisan-olive/10 shadow-sm animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-3xl font-bold mb-2">Welcome back, Artisan</h2>
        <p className="text-artisan-ink/60 text-sm">Here's a summary of your workshop's activity.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-artisan-olive/10 shadow-sm hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-xs text-artisan-ink/40 font-bold uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <section className="bg-white p-8 rounded-3xl border border-artisan-olive/10 shadow-sm hover:shadow-lg transition-all">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Clock size={20} className="text-artisan-clay" />
            Recent Activity
          </h3>
          <div className="space-y-4">
            {activities.length > 0 ? (
              activities.map((activity, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-artisan-olive/5 last:border-0">
                  <div className="flex gap-3 items-center">
                    <div className="w-2 h-2 rounded-full bg-artisan-clay" />
                    <div>
                      <p className="font-medium text-sm">{activity.text}</p>
                      <p className="text-xs text-artisan-ink/40">
                        {activity.date instanceof Date && !isNaN(activity.date)
                          ? activity.date.toLocaleDateString()
                          : 'Unknown Date'}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-artisan-ink/40">No recent activities yet.</p>
            )}
          </div>
        </section>

        <section className="bg-artisan-olive text-white p-8 rounded-3xl shadow-sm hover:shadow-lg transition-all">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Sparkles size={20} />
            Workshop Insights
          </h3>
          <div className="space-y-6">
            <div className="bg-white/10 p-4 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Production Growth</span>
                <span className={`text-2xl font-bold ${insights.productionGrowth >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                  {insights.productionGrowth >= 0 ? '+' : ''}{insights.productionGrowth}%
                </span>
              </div>
              <p className="text-xs text-white/70">compared to last week</p>
            </div>

            <div className="bg-white/10 p-4 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Most Used Material</span>
                <span className="text-2xl font-bold">{insights.mostUsedMaterial || 'No productions made'}</span>
              </div>
              <p className="text-xs text-white/70">in your recent productions</p>
            </div>

            <button 
              onClick={() => navigate('/reports')}
              className="w-full bg-artisan-clay text-white px-6 py-2 rounded-xl font-bold hover:brightness-110 transition-all text-sm"
            >
              View Detailed Reports →
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
