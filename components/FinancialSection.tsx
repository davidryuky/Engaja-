import React, { useState, useEffect } from 'react';
import { BarChart2, CheckCircle, Clock } from 'lucide-react';

interface PlatformStat {
  platform: string;
  count: number;
}
interface FinancialStats {
  totalOrders: number;
  paidOrders: number;
  pendingOrders: number;
  ordersByPlatform: PlatformStat[];
}

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string | number; description: string }> = ({ icon, title, value, description }) => (
    <div className="bg-brand-dark-200 p-6 rounded-xl border border-brand-purple/30">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-brand-purple to-brand-pink rounded-full text-white">{icon}</div>
            <div>
                <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider">{title}</h3>
                <p className="text-3xl font-bold text-white mt-1">{value}</p>
            </div>
        </div>
        <p className="text-xs text-slate-500 mt-4">{description}</p>
    </div>
);

export const FinancialSection: React.FC = () => {
    const [stats, setStats] = useState<FinancialStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            setIsLoading(true);
            setError('');
            try {
                const response = await fetch('/api/financials');
                const data = await response.json();
                if (data.success) {
                    setStats(data.stats);
                } else {
                    throw new Error(data.message || 'Failed to fetch financial data.');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred while fetching data.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (isLoading) {
        return (
            <div className="text-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-pink mx-auto"></div>
                <p className="mt-4">Carregando dados financeiros...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-20 bg-red-900/20 border border-red-500 rounded-lg p-4">
                <p className="text-red-400 font-semibold">Erro ao carregar dados:</p>
                <p className="text-red-400 mt-2">{error}</p>
            </div>
        );
    }
    
    if (!stats) {
        return <div className="text-center py-20">Nenhum dado financeiro para exibir.</div>;
    }

    return (
        <div className="animate-fadeInUp">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <StatCard 
                    icon={<BarChart2 className="w-6 h-6" />}
                    title="Total de Pedidos"
                    value={stats.totalOrders.toLocaleString('pt-BR')}
                    description="O número total de pedidos recebidos."
                />
                 <StatCard 
                    icon={<CheckCircle className="w-6 h-6" />}
                    title="Pedidos Pagos"
                    value={stats.paidOrders.toLocaleString('pt-BR')}
                    description="Pedidos com pagamento confirmado."
                />
                <StatCard 
                    icon={<Clock className="w-6 h-6" />}
                    title="Pagamentos Pendentes"
                    value={stats.pendingOrders.toLocaleString('pt-BR')}
                    description="Pedidos aguardando confirmação de pagamento."
                />
            </div>

            <div className="bg-brand-dark-200 border border-brand-purple/30 rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">Pedidos por Plataforma</h3>
                <div className="space-y-4">
                    {stats.ordersByPlatform.map(platform => (
                        <div key={platform.platform}>
                            <div className="flex justify-between items-center mb-1 text-slate-300">
                                <span>{platform.platform}</span>
                                <span>{platform.count.toLocaleString('pt-BR')}</span>
                            </div>
                            <div className="w-full bg-brand-dark rounded-full h-2.5">
                                <div 
                                    className="bg-gradient-to-r from-brand-purple to-brand-pink h-2.5 rounded-full" 
                                    style={{ width: stats.totalOrders > 0 ? `${(platform.count / stats.totalOrders) * 100}%` : '0%' }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
