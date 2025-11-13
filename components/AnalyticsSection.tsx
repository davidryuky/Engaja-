
import React, { useState, useEffect, useMemo } from 'react';
import { BarChart2, TrendingUp, Layers, Package, Loader2 } from 'lucide-react';
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

  // 2. Daily Volume (Last 7 days) - FIXED DATE LOGIC
  const dailyStats = useMemo(() => {
    // Create an array of the last 7 days labels (e.g. "27/10")
    const last7DaysMap = new Map<string, number>();
    const displayLabels: { rawDate: string; label: string }[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      // Use local date string key "YYYY-MM-DD" for matching
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const key = `${year}-${month}-${day}`;
      
      last7DaysMap.set(key, 0);
      displayLabels.push({
          rawDate: key,
          label: `${day}/${month}`
      });
    }

    // Iterate orders and match
    orders.forEach(order => {
      // Convert UTC timestamp from DB to Local Date Object
      const dateObj = new Date(order.created_at);
      
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      const key = `${year}-${month}-${day}`;

      if (last7DaysMap.has(key)) {
        last7DaysMap.set(key, (last7DaysMap.get(key) || 0) + 1);
      }
    });

    // Convert back to array for rendering
    return displayLabels.map(item => ({
        date: item.label,
        count: last7DaysMap.get(item.rawDate) || 0
    }));

  }, [orders]);

  const totalSample = orders.length;
  const maxPlatformCount = platformStats.length > 0 ? platformStats[0].count : 1;
  const maxDailyCount = Math.max(...dailyStats.map(d => d.count), 1);

  if (isLoading) {
      return (
          <div className="animate-pulse bg-brand-dark-200 rounded-lg p-6 h-48 flex items-center justify-center text-slate-500">
              <Loader2 className="w-6 h-6 animate-spin mr-2" /> Carregando Inteligência de Dados...
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CARD 1: Total Analyzed */}
        <div className="bg-brand-dark-200 border border-brand-purple/30 rounded-xl p-6 shadow-lg flex flex-col justify-center items-center lg:col-span-1">
            <div className="p-4 bg-brand-dark rounded-full mb-4 border border-brand-purple/20">
                <Package className="w-8 h-8 text-brand-pink" />
            </div>
            <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Pedidos Recentes</h3>
            <p className="text-4xl font-extrabold text-white mt-2">{totalSample}</p>
            <p className="text-xs text-slate-500 mt-2 text-center px-4">Base de dados utilizada para gerar as métricas abaixo</p>
        </div>

        {/* CHART 1: Platform Distribution (Horizontal Bars) */}
        <div className="bg-brand-dark-200 border border-brand-purple/30 rounded-xl p-6 shadow-lg lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-purple" />
              Ranking por Plataforma
            </h3>
          </div>
          
          <div className="space-y-4">
            {platformStats.length > 0 ? platformStats.slice(0, 5).map((item, index) => (
              <div key={item.name} className="relative group">
                <div className="flex justify-between text-sm mb-1 relative z-10">
                  <span className="font-medium text-slate-300 flex items-center gap-2">
                    {index + 1}. {item.name}
                  </span>
                  <span className="text-white font-bold text-xs bg-brand-purple/40 px-2 py-0.5 rounded-full">{item.count}</span>
                </div>
                <div className="w-full bg-brand-dark h-2.5 rounded-full overflow-hidden relative">
                  <div 
                    className="h-full bg-gradient-to-r from-brand-purple to-brand-pink rounded-full transition-all duration-1000 ease-out relative"
                    style={{ width: `${(item.count / maxPlatformCount) * 100}%` }}
                  >
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </div>
                </div>
              </div>
            )) : (
                <p className="text-slate-500 text-sm text-center py-4">Sem dados suficientes.</p>
            )}
          </div>
        </div>

        {/* CHART 2: Daily Volume (Vertical Bars) - Full Width on bottom */}
        <div className="bg-brand-dark-200 border border-brand-purple/30 rounded-xl p-6 shadow-lg flex flex-col lg:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              Volume de Vendas (Últimos 7 Dias)
            </h3>
          </div>

          <div className="flex-1 flex items-end justify-around gap-2 h-[200px] pt-4 pb-2 border-b border-brand-purple/10">
            {dailyStats.map((item, index) => (
              <div key={item.date} className="flex flex-col items-center flex-1 group relative h-full justify-end">
                {/* Tooltip */}
                <div className="mb-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 bg-brand-dark text-white text-xs font-bold px-3 py-1.5 rounded border border-brand-purple/50 absolute -top-10 whitespace-nowrap z-20 shadow-xl">
                    {item.count} pedidos
                </div>
                
                <div 
                    className="w-full max-w-[40px] bg-brand-purple/20 hover:bg-brand-pink/80 rounded-t-sm transition-all duration-500 ease-out relative overflow-hidden group-hover:shadow-[0_0_15px_rgba(230,119,175,0.5)]"
                    style={{ height: `${Math.max((item.count / maxDailyCount) * 100, 2)}%` }} 
                >
                    {/* Bar gradient */}
                    <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-brand-purple/40 via-brand-purple/60 to-transparent opacity-70 group-hover:opacity-0 transition-opacity"></div>
                </div>
                <span className="text-xs text-slate-500 mt-3 font-mono">{item.date}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
