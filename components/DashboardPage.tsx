import React, { useState, useEffect, useCallback } from 'react';
import { FinancialSection } from './FinancialSection';
import { OrderDetailsModal } from './OrderDetailsModal';
import { PixModal } from './PixModal';
import { LogOut, RefreshCw, MoreVertical, Eye, CheckCircle, XCircle, DollarSign } from 'lucide-react';

// Define the Order type based on the database schema
export interface Order {
  id: number;
  public_id: string;
  platform: string;
  service: string;
  link: string;
  quantity: number | null;
  comments: string | null;
  payment_status: 'Aguardando Pagamento' | 'Pago' | 'Cancelado';
  created_at: string;
}

const statusStyles = {
    'Aguardando Pagamento': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    'Pago': 'bg-green-500/20 text-green-400 border-green-500/30',
    'Cancelado': 'bg-red-500/20 text-red-400 border-red-500/30',
};

const DropdownMenu: React.FC<{ order: Order; onUpdate: (id: number, status: Order['payment_status']) => void; onShowPix: () => void; }> = ({ order, onUpdate, onShowPix }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-full hover:bg-brand-dark-200 transition-colors">
                <MoreVertical className="w-5 h-5" />
            </button>
            {isOpen && (
                <div 
                    className="absolute right-0 mt-2 w-56 bg-brand-dark-200 border border-brand-purple/50 rounded-lg shadow-xl z-10 animate-fadeInUp"
                    style={{ animationDuration: '0.2s' }}
                >
                    <div className="py-1">
                        {order.payment_status === 'Aguardando Pagamento' && (
                            <button onClick={() => { onUpdate(order.id, 'Pago'); setIsOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-slate-200 hover:bg-brand-purple/30">
                                <CheckCircle className="w-4 h-4 text-green-400" /> Marcar como Pago
                            </button>
                        )}
                        {order.payment_status !== 'Cancelado' && (
                           <button onClick={() => { onUpdate(order.id, 'Cancelado'); setIsOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-slate-200 hover:bg-brand-purple/30">
                                <XCircle className="w-4 h-4 text-red-400" /> Cancelar Pedido
                            </button>
                        )}
                         <button onClick={() => { onShowPix(); setIsOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-slate-200 hover:bg-brand-purple/30">
                            <DollarSign className="w-4 h-4 text-cyan-400" /> Ver Dados PIX
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};


export const DashboardPage: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isPixModalOpen, setIsPixModalOpen] = useState(false);
    const [filter, setFilter] = useState('Todos');

    const fetchOrders = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await fetch('/api/orders');
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
                 throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data.success) {
                setOrders(data.orders);
            } else {
                throw new Error(data.message || 'Falha ao buscar pedidos.');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ocorreu um erro ao conectar com a API.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handleUpdateStatus = async (id: number, status: Order['payment_status']) => {
        // Optimistic update
        const originalOrders = [...orders];
        setOrders(prevOrders => prevOrders.map(o => o.id === id ? { ...o, payment_status: status } : o));

        try {
            const response = await fetch('/api/orders', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, payment_status: status }),
            });
            const data = await response.json();
            if (!data.success) {
                throw new Error(data.message || 'Falha ao atualizar status.');
            }
            // If successful, the optimistic update is confirmed. We can refetch to be sure.
            fetchOrders(); 
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Ocorreu um erro ao atualizar o pedido.');
            // Revert on failure
            setOrders(originalOrders);
        }
    };

    const openDetailsModal = (order: Order) => {
        setSelectedOrder(order);
        setIsDetailsModalOpen(true);
    };

    const openPixModal = (order: Order) => {
        setSelectedOrder(order);
        setIsPixModalOpen(true);
    }
    
    const filteredOrders = orders.filter(order => {
        if (filter === 'Todos') return true;
        return order.payment_status === filter;
    });

    return (
        <div className="bg-brand-dark min-h-screen text-slate-100 font-sans">
            <header className="bg-brand-dark-200 border-b border-brand-purple/30 sticky top-0 z-20">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <img src="https://i.postimg.cc/jj7rdzv8/logoengaja.png" alt="Engaja+ Logo" className="h-12" />
                        <h1 className="text-xl font-bold">Dashboard</h1>
                    </div>
                    <button onClick={onLogout} className="flex items-center gap-2 bg-brand-dark hover:bg-brand-purple/30 border border-brand-purple/50 text-slate-300 font-semibold py-2 px-4 rounded-lg transition-colors duration-300">
                        <LogOut className="w-5 h-5" />
                        <span>Sair</span>
                    </button>
                </div>
            </header>
            
            <main className="container mx-auto px-6 py-8">
                <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Visão Geral</h2>
                    <FinancialSection />
                </section>

                <section>
                    <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-4">
                        <h2 className="text-2xl font-bold">Pedidos Recentes</h2>
                        <div className="flex items-center gap-2 md:gap-4 flex-wrap">
                           <div className="flex items-center gap-1 p-1 bg-brand-dark-200 border border-brand-purple/30 rounded-lg">
                                {['Todos', 'Aguardando Pagamento', 'Pago', 'Cancelado'].map(status => (
                                    <button 
                                        key={status} 
                                        onClick={() => setFilter(status)}
                                        className={`px-2 py-1 text-xs sm:text-sm font-semibold rounded-md transition-colors ${filter === status ? 'bg-brand-purple text-white' : 'text-slate-300 hover:bg-brand-purple/30'}`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                            <button onClick={fetchOrders} disabled={isLoading} className="p-2 rounded-lg bg-brand-dark-200 border border-brand-purple/30 text-slate-300 hover:bg-brand-purple/30 transition-colors disabled:opacity-50 disabled:cursor-wait">
                                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>
                    
                    <div className="bg-brand-dark-200 border border-brand-purple/30 rounded-xl shadow-lg overflow-hidden">
                        <div className="overflow-x-auto">
                           <table className="w-full text-sm text-left">
                                <thead className="bg-brand-dark text-xs text-slate-400 uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-3">ID Pedido</th>
                                        <th className="px-6 py-3 hidden md:table-cell">Data</th>
                                        <th className="px-6 py-3">Serviço</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-brand-purple/20">
                                    {isLoading ? (
                                        <tr><td colSpan={5} className="text-center py-12">Carregando pedidos...</td></tr>
                                    ) : error ? (
                                        <tr><td colSpan={5} className="text-center py-12 text-red-400">{error}</td></tr>
                                    ) : filteredOrders.length === 0 ? (
                                         <tr><td colSpan={5} className="text-center py-12 text-slate-500">Nenhum pedido encontrado para este filtro.</td></tr>
                                    ) : (
                                        filteredOrders.map(order => (
                                            <tr key={order.id} className="hover:bg-brand-dark transition-colors">
                                                <td className="px-6 py-4 font-mono text-brand-pink whitespace-nowrap">{order.public_id}</td>
                                                <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">{new Date(order.created_at).toLocaleDateString('pt-BR')}</td>
                                                <td className="px-6 py-4">{order.platform} - {order.service}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${statusStyles[order.payment_status]}`}>
                                                        {order.payment_status.replace(' ', '\u00A0')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 flex justify-end items-center gap-1">
                                                    <button onClick={() => openDetailsModal(order)} className="p-2 rounded-full hover:bg-brand-dark text-slate-300 transition-colors" title="Ver detalhes">
                                                        <Eye className="w-5 h-5" />
                                                    </button>
                                                    <DropdownMenu order={order} onUpdate={handleUpdateStatus} onShowPix={() => openPixModal(order)} />
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            </main>

            {isDetailsModalOpen && selectedOrder && (
                <OrderDetailsModal 
                    isOpen={isDetailsModalOpen}
                    onClose={() => setIsDetailsModalOpen(false)}
                    order={selectedOrder}
                />
            )}
             {isPixModalOpen && (
                <PixModal 
                    isOpen={isPixModalOpen}
                    onClose={() => setIsPixModalOpen(false)}
                />
            )}
        </div>
    );
};
