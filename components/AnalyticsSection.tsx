
import React, { useState, useEffect, useMemo } from 'react';
import { BarChart2, TrendingUp, Layers } from 'lucide-react';
import { Order } from './DashboardPage';

export const AnalyticsSection: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data specifically for analytics (fetching a larger batch)
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        // Fetch last 200 orders to get a decent statistical sample
        const response = await fetch('/api/orders?limit=200&page=1');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setOrders(data.orders);
          }
        }
      } catch (error) {
        console.error("Failed to fetch analytics data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  // --- METRICS CALCULATION ---

  // 1. Platform Distribution
  const platformStats = useMemo(() => {
    const stats: Record<string, number> = {};
    orders.forEach(order => {
      stats[order.platform] = (stats[order.platform] || 0) + 1;
    });
    // Convert to array and sort desc
    return Object.entries(stats)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [orders]);

  // 2. Daily Volume (Last 7 days)
  const dailyStats = useMemo(() => {
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0]; // YYYY-MM-DD
    }).reverse();

    const stats: Record<string, number> = {};
    
    // Initialize with 0
    last7Days.forEach(date => { stats[date] = 0; });

    orders.forEach(order => {
      const dateKey = new Date(order.created_at).toISOString().split('T')[0];
      if (stats[dateKey] !== undefined) {
        stats[dateKey]++;
      }
    });

    return last7Days.map(date => ({
      date: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      count: stats[date] || 0
    }));
  }, [orders]);

  const totalSample = orders.length;
  const maxPlatformCount = platformStats.length > 0 ? platformStats[0].count : 1;
  const maxDailyCount = Math.max(...dailyStats.map(d => d.count), 1);

  if (isLoading) {
      return (
          <div className="animate-pulse bg-brand-dark-200 rounded-lg p-6 h-48 flex items-center justify-center text-slate-500">
              Carregando Inteligência de Dados...
          </div>
      )
  }

  return (
    <section className="mt-8 animate-fadeInUp" style={{ animationDuration: '0.7s' }}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-brand-purple/20 rounded-lg text-brand-pink">
          <BarChart2 className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-white">Inteligência de Pedidos</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CHART 1: Platform Distribution (Horizontal Bars) */}
        <div className="bg-brand-dark-200 border border-brand-purple/30 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-purple" />
              Pedidos por Plataforma
            </h3>
            <span className="text-xs text-slate-400 bg-brand-dark px-2 py-1 rounded">
                Base: {totalSample} pedidos
            </span>
          </div>
          
          <div className="space-y-4">
            {platformStats.length > 0 ? platformStats.map((item, index) => (
              <div key={item.name} className="relative">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-300">{item.name}</span>
                  <span className="text-brand-pink font-bold">{item.count}</span>
                </div>
                <div className="w-full bg-brand-dark h-3 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-brand-purple to-brand-pink rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${(item.count / maxPlatformCount) * 100}%` }}
                  ></div>
                </div>
              </div>
            )) : (
                <p className="text-slate-500 text-sm text-center py-4">Sem dados suficientes.</p>
            )}
          </div>
        </div>

        {/* CHART 2: Daily Volume (Vertical Bars) */}
        <div className="bg-brand-dark-200 border border-brand-purple/30 rounded-xl p-6 shadow-lg flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              Volume Diário (7 Dias)
            </h3>
          </div>

          <div className="flex-1 flex items-end justify-between gap-2 min-h-[200px] pt-4 pb-2">
            {dailyStats.map((item, index) => (
              <div key={item.date} className="flex flex-col items-center w-full group relative">
                {/* Tooltip on hover */}
                <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-brand-dark text-xs font-bold px-2 py-1 rounded pointer-events-none whitespace-nowrap">
                    {item.count} pedidos
                </div>
                
                <div 
                    className="w-full max-w-[30px] bg-brand-purple/30 hover:bg-brand-pink/80 rounded-t-md transition-all duration-500 ease-out relative overflow-hidden"
                    style={{ height: `${Math.max((item.count / maxDailyCount) * 100, 5)}%` }} // Min height 5% for visuals
                >
                    {/* Overlay gradient */}
                    <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-brand-dark/50 to-transparent"></div>
                </div>
                <span className="text-xs text-slate-400 mt-2">{item.date}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
