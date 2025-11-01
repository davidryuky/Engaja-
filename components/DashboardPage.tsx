import React, { useState, useEffect, useMemo } from 'react';
import { FinancialSection } from './FinancialSection';
import { OrderDetailsModal } from './OrderDetailsModal';
import { PixModal } from './PixModal';
import { LogOut, Search, Eye, Edit, Copy, CheckCircle, Clock, XCircle } from 'lucide-react';

// Define and export the Order type so other components can use it
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

interface DashboardPageProps {
  onLogout: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onLogout }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for modals
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isPixModalOpen, setIsPixModalOpen] = useState(false);
  
  // State for filtering and searching
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/orders');
      const data = await response.json();
      if (data.success) {
        setOrders(data.orders);
      } else {
        throw new Error(data.message || 'Falha ao buscar pedidos.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);
  
  const handleUpdateStatus = async (orderId: number, newStatus: Order['payment_status']) => {
    try {
        const response = await fetch('/api/orders', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: orderId, payment_status: newStatus }),
        });
        const data = await response.json();
        if (data.success) {
            setOrders(prevOrders => 
                prevOrders.map(order => 
                    order.id === orderId ? { ...order, payment_status: newStatus } : order
                )
            );
        } else {
            throw new Error(data.message || 'Falha ao atualizar status.');
        }
    } catch (err) {
        alert(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
        alert('Copiado para a área de transferência!');
    }, (err) => {
        console.error('Could not copy text: ', err);
        alert('Falha ao copiar.');
    });
  };

  const filteredOrders = useMemo(() => {
    return orders
      .filter(order => {
        if (filterStatus === 'Todos') return true;
        return order.payment_status === filterStatus;
      })
      .filter(order => {
        const search = searchTerm.toLowerCase();
        return (
          order.public_id.toLowerCase().includes(search) ||
          order.platform.toLowerCase().includes(search) ||
          order.service.toLowerCase().includes(search) ||
          order.link.toLowerCase().includes(search)
        );
      });
  }, [orders, filterStatus, searchTerm]);
  
  const getStatusChip = (status: Order['payment_status']) => {
    switch(status) {
        case 'Pago':
            return <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400"><CheckCircle className="w-3 h-3" />Pago</span>;
        case 'Cancelado':
            return <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400"><XCircle className="w-3 h-3" />Cancelado</span>;
        case 'Aguardando Pagamento':
        default:
            return <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400"><Clock className="w-3 h-3" />Aguardando</span>;
    }
  };


  return (
    <div className="bg-brand-dark min-h-screen text-slate-100 font-sans">
      <header className="bg-brand-dark-200 border-b border-brand-purple/30 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img src="https://i.postimg.cc/jj7rdzv8/logoengaja.png" alt="Engaja+ Logo" className="h-12" />
            <h1 className="text-xl font-bold hidden sm:block">Painel Administrativo</h1>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 bg-brand-dark hover:bg-brand-purple/30 border border-brand-purple/50 text-white font-semibold py-2 px-4 rounded-full text-sm transition-all duration-300"
          >
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>
      </header>
      
      <main className="container mx-auto p-4 md:p-8">
        <h2 className="text-3xl font-bold text-white mb-8">Visão Geral</h2>
        <FinancialSection />

        <div className="mt-12">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <h2 className="text-3xl font-bold text-white">Pedidos Recentes</h2>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <input 
                            type="text"
                            placeholder="Buscar pedido..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full sm:w-64 bg-brand-dark-200 border-2 border-brand-purple/30 rounded-lg p-2 pl-10 focus:outline-none focus:border-brand-pink transition-colors duration-300"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    </div>
                     <select 
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-brand-dark-200 border-2 border-brand-purple/30 rounded-lg p-2.5 focus:outline-none focus:border-brand-pink transition-colors duration-300 appearance-none"
                    >
                        <option value="Todos">Todos Status</option>
                        <option value="Aguardando Pagamento">Aguardando</option>
                        <option value="Pago">Pago</option>
                        <option value="Cancelado">Cancelado</option>
                    </select>
                </div>
            </div>
            
            <div className="bg-brand-dark-200 border border-brand-purple/30 rounded-2xl overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b border-brand-purple/30 text-xs text-slate-400 uppercase tracking-wider">
                        <tr>
                            <th className="p-4">ID</th>
                            <th className="p-4">Data</th>
                            <th className="p-4">Plataforma</th>
                            <th className="p-4">Serviço</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={6} className="text-center p-8">Carregando pedidos...</td></tr>
                        ) : error ? (
                            <tr><td colSpan={6} className="text-center p-8 text-red-400">{error}</td></tr>
                        ) : filteredOrders.length === 0 ? (
                             <tr><td colSpan={6} className="text-center p-8">Nenhum pedido encontrado.</td></tr>
                        ) : (
                            filteredOrders.map(order => (
                                <tr key={order.id} className="border-b border-brand-dark last:border-b-0 hover:bg-brand-dark/50 transition-colors">
                                    <td className="p-4 font-mono text-brand-pink">{order.public_id}</td>
                                    <td className="p-4 whitespace-nowrap">{new Date(order.created_at).toLocaleDateString('pt-BR')}</td>
                                    <td className="p-4">{order.platform}</td>
                                    <td className="p-4">{order.service}</td>
                                    <td className="p-4">{getStatusChip(order.payment_status)}</td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button onClick={() => handleViewDetails(order)} className="p-2 text-slate-400 hover:text-white transition-colors" title="Ver Detalhes"><Eye className="w-5 h-5" /></button>
                                            
                                            {/* Dropdown for status change */}
                                            <div className="relative group">
                                                 <button className="p-2 text-slate-400 hover:text-white transition-colors" title="Alterar Status"><Edit className="w-5 h-5" /></button>
                                                 <div className="absolute right-0 bottom-full mb-2 w-48 bg-brand-dark border border-brand-purple/50 rounded-lg shadow-lg z-10 hidden group-hover:block">
                                                    <button onClick={() => handleUpdateStatus(order.id, 'Pago')} className="w-full text-left px-4 py-2 text-sm hover:bg-brand-purple/30">Marcar como Pago</button>
                                                    <button onClick={() => handleUpdateStatus(order.id, 'Aguardando Pagamento')} className="w-full text-left px-4 py-2 text-sm hover:bg-brand-purple/30">Marcar como Aguardando</button>
                                                    <button onClick={() => handleUpdateStatus(order.id, 'Cancelado')} className="w-full text-left px-4 py-2 text-sm hover:bg-brand-purple/30">Marcar como Cancelado</button>
                                                 </div>
                                            </div>

                                            <button onClick={() => copyToClipboard(order.link)} className="p-2 text-slate-400 hover:text-white transition-colors" title="Copiar Link"><Copy className="w-5 h-5" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

        </div>
      </main>
      
      {selectedOrder && (
          <OrderDetailsModal 
            isOpen={isDetailsModalOpen}
            onClose={() => setIsDetailsModalOpen(false)}
            order={selectedOrder}
          />
      )}

      <PixModal isOpen={isPixModalOpen} onClose={() => setIsPixModalOpen(false)} />
    </div>
  );
};
