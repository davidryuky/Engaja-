
import React from 'react';
import { LogOut, DollarSign, ShoppingCart, Users } from 'lucide-react';

interface DashboardPageProps {
  onLogout: () => void;
}

// Mock data for the orders table
const mockOrders = [
  { id: 'ORD-001', customer: 'Julia S.', service: '1.000 Seguidores Instagram', amount: 'R$ 49,90', status: 'Concluído', date: '2023-10-26' },
  { id: 'ORD-002', customer: 'Marcos P.', service: '5.000 Curtidas TikTok', amount: 'R$ 99,90', status: 'Em Progresso', date: '2023-10-26' },
  { id: 'ORD-003', customer: 'Loja Belle', service: '10.000 Visualizações YouTube', amount: 'R$ 79,90', status: 'Concluído', date: '2023-10-25' },
  { id: 'ORD-004', customer: 'Ana B.', service: '500 Seguidores Twitter', amount: 'R$ 29,90', status: 'Pendente', date: '2023-10-25' },
  { id: 'ORD-005', customer: 'Carlos P.', service: '2.500 Seguidores Instagram', amount: 'R$ 129,90', status: 'Concluído', date: '2023-10-24' },
];

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; change?: string; changeType?: 'increase' | 'decrease' }> = ({ title, value, icon, change, changeType }) => (
    <div className="bg-brand-dark-200 p-6 rounded-xl border border-brand-purple/30">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-slate-400">{title}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-brand-purple to-brand-pink rounded-full text-white">
                {icon}
            </div>
        </div>
        {change && (
            <p className={`text-xs mt-2 ${changeType === 'increase' ? 'text-green-400' : 'text-red-400'}`}>
                {change} desde o último mês
            </p>
        )}
    </div>
);

export const DashboardPage: React.FC<DashboardPageProps> = ({ onLogout }) => {

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'Concluído': return 'bg-green-500/20 text-green-400';
            case 'Em Progresso': return 'bg-yellow-500/20 text-yellow-400';
            case 'Pendente': return 'bg-orange-500/20 text-orange-400';
            default: return 'bg-slate-500/20 text-slate-400';
        }
    };

    return (
        <div className="bg-brand-dark min-h-screen text-slate-100 font-sans">
            {/* Header */}
            <header className="bg-brand-dark-200 border-b border-brand-purple/30 sticky top-0 z-10">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <img src="https://i.postimg.cc/jj7rdzv8/logoengaja.png" alt="Engaja+ Logo" className="h-12" />
                        <h1 className="text-xl font-bold text-white hidden md:block">Dashboard</h1>
                    </div>
                    <button
                        onClick={onLogout}
                        className="flex items-center gap-2 bg-brand-dark hover:bg-brand-purple/30 border border-brand-purple/50 text-slate-200 font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105"
                    >
                        <LogOut className="w-4 h-4" />
                        Sair
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto p-6">
                <h2 className="text-2xl font-bold text-white mb-6">Visão Geral</h2>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <StatCard 
                        title="Faturamento Total (Mês)" 
                        value="R$ 3.520,70" 
                        icon={<DollarSign className="w-6 h-6"/>}
                        change="+12.5%"
                        changeType="increase"
                    />
                    <StatCard 
                        title="Pedidos (Mês)" 
                        value="42" 
                        icon={<ShoppingCart className="w-6 h-6"/>}
                        change="+5"
                        changeType="increase"
                    />
                     <StatCard 
                        title="Novos Clientes (Mês)" 
                        value="18" 
                        icon={<Users className="w-6 h-6"/>}
                        change="-2"
                        changeType="decrease"
                    />
                </div>
                
                {/* Recent Orders Table */}
                <div>
                    <h3 className="text-xl font-bold text-white mb-4">Pedidos Recentes</h3>
                    <div className="bg-brand-dark-200 border border-brand-purple/30 rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-slate-300">
                                <thead className="text-xs text-slate-400 uppercase bg-brand-dark">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">ID Pedido</th>
                                        <th scope="col" className="px-6 py-3">Cliente</th>
                                        <th scope="col" className="px-6 py-3">Serviço</th>
                                        <th scope="col" className="px-6 py-3">Valor</th>
                                        <th scope="col" className="px-6 py-3">Status</th>
                                        <th scope="col" className="px-6 py-3">Data</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mockOrders.map(order => (
                                        <tr key={order.id} className="border-t border-brand-purple/20 hover:bg-brand-dark/50 transition-colors">
                                            <th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap">{order.id}</th>
                                            <td className="px-6 py-4">{order.customer}</td>
                                            <td className="px-6 py-4">{order.service}</td>
                                            <td className="px-6 py-4">{order.amount}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusClass(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">{order.date}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
