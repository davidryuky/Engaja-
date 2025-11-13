
import React, { useState, useEffect, useMemo } from 'react';
import { BarChart2, TrendingUp, Layers, Calendar } from 'lucide-react';
import { Order } from './DashboardPage';

export const AnalyticsSection: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

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
      // Ajuste básico de timezone cortando a string ISO
      // Se o banco retorna UTC, isso pode variar dependendo do horário, 
      // mas para analytics simples visual funciona bem.
      const dateKey = new Date(order.created_at).toISOString().split('T')[0];
      if (stats[dateKey] !== undefined) {
        stats[dateKey]++;
      }
    });

    return last7Days.map(date => {
        const dateObj = new Date(date + 'T12:00:00'); // Force midday to avoid timezone shifts on display
        return {
            fullDate: date,
            displayDate: dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
            count: stats[date] || 0
        };
    });
  }, [orders]);

  const totalSample = orders.length;
  const maxPlatformCount = platformStats.length > 0 ? platformStats[0].count : 1;
  
  // --- CHART SCALING LOGIC ---
  const maxDailyCount = Math.max(...dailyStats.map(d => d.count), 5); // Minimo de 5 para escala não quebrar
  const chartHeight = 180;
  const chartWidth = 600; // SVG internal coordinate system width
  const xStep = chartWidth / (dailyStats.length - 1);

  // Generate points for the SVG line
  const points = dailyStats.map((item, index) => {
      const x = index * xStep;
      // Invert Y because SVG 0 is at the top
      // Leave 20px padding at top
      const y = chartHeight - ((item.count / maxDailyCount) * (chartHeight - 30));
      return `${x},${y}`;
  }).join(' ');

  // Generate area path (starts at bottom left, goes to points, ends at bottom right)
  const areaPath = `0,${chartHeight} ${points} ${chartWidth},${chartHeight} Z`;

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
        <div className="bg-brand-dark-200 border border-brand-purple/30 rounded-xl p-6 shadow-lg h-full">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-purple" />
              Pedidos por Plataforma
            </h3>
            <span className="text-xs text-slate-400 bg-brand-dark px-2 py-1 rounded border border-brand-purple/20">
                Total: {totalSample}
            </span>
          </div>
          
          <div className="space-y-5">
            {platformStats.length > 0 ? platformStats.map((item, index) => (
              <div key={item.name} className="relative group">
                <div className="flex justify-between text-sm mb-2">
                  <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-brand-pink"></span>
                      <span className="font-medium text-slate-300">{item.name}</span>
                  </div>
                  <span className="text-white font-bold">{item.count}</span>
                </div>
                <div className="w-full bg-brand-dark h-2.5 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-brand-purple to-brand-pink rounded-full transition-all duration-1000 ease-out group-hover:brightness-125 relative"
                    style={{ width: `${(item.count / maxPlatformCount) * 100}%` }}
                  >
                      <div className="absolute top-0 right-0 bottom-0 w-1 bg-white/50 animate-pulse"></div>
                  </div>
                </div>
              </div>
            )) : (
                <p className="text-slate-500 text-sm text-center py-4">Sem dados suficientes.</p>
            )}
          </div>
        </div>

        {/* CHART 2: Daily Volume (Area Chart) */}
        <div className="bg-brand-dark-200 border border-brand-purple/30 rounded-xl p-6 shadow-lg flex flex-col relative overflow-hidden">
          {/* Background Decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-purple/10 rounded-full blur-3xl -z-0 pointer-events-none"></div>

          <div className="flex items-center justify-between mb-6 relative z-10">
            <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              Volume Diário
            </h3>
            <div className="flex items-center text-xs text-slate-400 gap-1 bg-brand-dark px-2 py-1 rounded border border-brand-purple/20">
                <Calendar className="w-3 h-3" />
                7 Dias
            </div>
          </div>

          <div className="relative w-full h-[200px] select-none">
             {/* Tooltip Overlay */}
             {hoveredIndex !== null && (
                <div 
                    className="absolute z-20 pointer-events-none flex flex-col items-center transition-all duration-75 ease-out"
                    style={{ 
                        left: `${(hoveredIndex * xStep) / chartWidth * 100}%`,
                        top: 0, // Anchor to top of chart area
                        transform: 'translateX(-50%)'
                    }}
                >
                    <div className="bg-brand-dark border border-brand-pink/50 text-white text-xs rounded-lg py-2 px-3 shadow-[0_0_15px_rgba(230,119,175,0.3)] mb-2 text-center min-w-[80px]">
                        <div className="font-bold text-brand-pink">{dailyStats[hoveredIndex].count} Pedidos</div>
                        <div className="text-slate-400 text-[10px]">{dailyStats[hoveredIndex].displayDate}</div>
                    </div>
                    {/* Vertical Line */}
                    <div className="w-px h-[160px] bg-gradient-to-b from-brand-pink/50 to-transparent"></div>
                </div>
             )}

             <svg 
                viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
                className="w-full h-full overflow-visible"
                preserveAspectRatio="none"
             >
                <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#e677af" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#8073f1" stopOpacity="0" />
                    </linearGradient>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>

                {/* Grid Lines (Horizontal) */}
                <line x1="0" y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="#332d42" strokeWidth="1" />
                <line x1="0" y1={chartHeight * 0.66} x2={chartWidth} y2={chartHeight * 0.66} stroke="#332d42" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="0" y1={chartHeight * 0.33} x2={chartWidth} y2={chartHeight * 0.33} stroke="#332d42" strokeWidth="1" strokeDasharray="4 4" />

                {/* Area Fill */}
                <path 
                    d={areaPath} 
                    fill="url(#areaGradient)" 
                    className="transition-all duration-300"
                />

                {/* Stroke Line */}
                <polyline 
                    fill="none" 
                    stroke="#e677af" 
                    strokeWidth="3" 
                    points={points} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    filter="url(#glow)"
                />

                {/* Interactive Points & Invisible Hit Areas */}
                {dailyStats.map((item, index) => {
                    const x = index * xStep;
                    const y = chartHeight - ((item.count / maxDailyCount) * (chartHeight - 30));
                    const isHovered = hoveredIndex === index;

                    return (
                        <g key={item.fullDate}>
                             {/* Visible Dot (Only shown on hover or always small?) Let's show active only */}
                             <circle 
                                cx={x} 
                                cy={y} 
                                r={isHovered ? 6 : 3} 
                                fill={isHovered ? "#fff" : "#e677af"} 
                                stroke={isHovered ? "#e677af" : "transparent"}
                                strokeWidth="2"
                                className="transition-all duration-200 ease-out"
                                style={{ opacity: isHovered ? 1 : 0.6 }}
                             />
                             {/* Invisible Hit Rect for easier hovering */}
                             <rect
                                x={x - (xStep / 2)}
                                y="0"
                                width={xStep}
                                height={chartHeight}
                                fill="transparent"
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                                className="cursor-crosshair"
                             />
                        </g>
                    );
                })}
             </svg>
             
             {/* X Axis Labels */}
             <div className="flex justify-between mt-2 px-2">
                {dailyStats.map((item, index) => (
                    <div 
                        key={item.fullDate} 
                        className={`text-[10px] transition-colors duration-200 ${hoveredIndex === index ? 'text-brand-pink font-bold' : 'text-slate-500'}`}
                        style={{ width: `${100 / 7}%`, textAlign: 'center' }}
                    >
                        {item.displayDate}
                    </div>
                ))}
             </div>
          </div>
        </div>

      </div>
    </section>
  );
};
