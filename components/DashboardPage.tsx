import React, { useState, useEffect, useCallback } from 'react';
import { OrderDetailsModal } from './OrderDetailsModal';
import { PixModal } from './PixModal';
import { OrderNotesModal } from './OrderNotesModal';
import { LogOut, RefreshCw, Eye, Edit, DollarSign, Loader2, AlertTriangle } from 'lucide-react';

// Exporting the Order type to be used by other components
export interface Order {
  id: number;
  public_id: string;
  platform: string;
  service: string;
  link: string;
  quantity: number | null;
  comments: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  notes: string | null;
  created_at: string;
}

interface DashboardPageProps {
  onLogout: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onLogout }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isPixModalOpen, setIsPixModalOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/orders');
      if (!response.ok) {
        throw new Error('Falha ao buscar pedidos. Tente novamente.');
      }
      const data = await response.json();
      if (data.success) {
        setOrders(data.orders);
      } else {
        throw new Error(data.message || 'Erro ao processar a resposta do servidor.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);
  
  const handleUpdateOrder = async (orderId: number, updates: Partial<Order>) => {
      try {
          const response = await fetch(`/api/orders?id=${orderId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updates),
          });
          const data = await response.json();
          if (!data.success) {
              throw new Error(data.message || 'Falha ao atualizar o pedido.');
          }
          // Refresh orders list
          fetchOrders();
          return true;
      } catch (err: any) {
          alert(`Erro: ${err.message}`);
          return false;
      }
  };

  const handleSaveNotes = async (notes: string) => {
    if (selectedOrder) {
      const success = await handleUpdateOrder(selectedOrder.id, { notes });
      if (success) {
        setIsNotesModalOpen(false);
      }
    }
  };

  const handleStatusChange = async (orderId: number, status: Order['status']) => {
      await handleUpdateOrder(orderId, { status });
  };
  

  const openModal = (order: Order, modal: 'details' | 'pix' | 'notes') => {
    setSelectedOrder(order);
    if (modal === 'details') setIsDetailsModalOpen(true);
    if (modal === 'pix') setIsPixModalOpen(true);
    if (modal === 'notes') setIsNotesModalOpen(true);
  };
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 text-brand-pink animate-spin" />
          <p className="ml-4 text-slate-300">Carregando pedidos...</p>
        </div>
      );
    }
    if (error) {
       return (
        <div className="flex flex-col justify-center items-center h-64 bg-red-500/10 border border-red-500/30 rounded-lg p-6">
          <AlertTriangle className="w-10 h-10 text-red-400 mb-4" />
          <p className="text-red-400 font-semibold mb-2">Ocorreu um erro</p>
          <p className="text-slate-300 text-center">{error}</p>
          <button onClick={fetchOrders} className="mt-6 flex items-center gap-2 bg-brand-purple hover:bg-opacity-80 text-white font-semibold py-2 px-5 rounded-full text-sm transition-all duration-300 transform hover:scale-105">
            <RefreshCw className="w-4 h-4" />
            Tentar Novamente
          </button>
        </div>
      );
    }
    if (orders.length === 0) {
      return <p className="text-center text-slate-400 py-16">Nenhum pedido encontrado.</p>;
    }

    return (
       <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-300">
          <thead className="text-xs text-slate-400 uppercase bg-brand-dark">
            <tr>
              <th scope="col" className="px-6 py-3">ID Pedido</th>
              <th scope="col" className="px-6 py-3">Plataforma</th>
              <th scope="col" className="px-6 py-3">Serviço</th>
              <th scope="col" className="px-6 py-3">Data</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="bg-brand-dark-200 border-b border-brand-purple/20 hover:bg-brand-purple/10 transition-colors">
                <td className="px-6 py-4 font-mono text-brand-pink">{order.public_id}</td>
                <td className="px-6 py-4">{order.platform}</td>
                <td className="px-6 py-4">{order.service}</td>
                <td className="px-6 py-4">{new Date(order.created_at).toLocaleDateString('pt-BR')}</td>
                <td className="px-6 py-4">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value as Order['status'])}
                    className="bg-transparent border-0 focus:ring-0 focus:outline-none p-0 text-xs font-semibold"
                    style={{
                        color: { pending: '#facc15', in_progress: '#60a5fa', completed: '#4ade80', cancelled: '#f87171' }[order.status]
                    }}
                  >
                    <option value="pending" className="bg-brand-dark">Pendente</option>
                    <option value="in_progress" className="bg-brand-dark">Em Progresso</option>
                    <option value="completed" className="bg-brand-dark">Concluído</option>
                    <option value="cancelled" className="bg-brand-dark">Cancelado</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openModal(order, 'details')} className="p-2 text-slate-400 hover:text-white transition-colors" title="Ver Detalhes"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => openModal(order, 'notes')} className="p-2 text-slate-400 hover:text-white transition-colors" title="Editar Notas"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => openModal(order, 'pix')} className="p-2 text-slate-400 hover:text-white transition-colors" title="Gerar Pix"><DollarSign className="w-4 h-4" /></button>
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
       </div>
    );
  };


  return (
    <div className="bg-brand-dark min-h-screen text-slate-100 font-sans">
        <header className="bg-brand-dark-200 border-b border-brand-purple/30">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <img src="https://i.postimg.cc/jj7rdzv8/logoengaja.png" alt="Engaja+ Logo" className="h-12" />
                    <h1 className="text-xl font-bold">Dashboard</h1>
                </div>
                <div>
                     <button onClick={fetchOrders} className="p-2 text-slate-400 hover:text-white transition-colors mr-4" title="Atualizar Pedidos">
                        <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                    <button onClick={onLogout} className="flex items-center gap-2 text-slate-300 hover:text-brand-pink transition-colors">
                        <LogOut className="w-5 h-5" />
                        <span>Sair</span>
                    </button>
                </div>
            </div>
        </header>
        <main className="container mx-auto px-6 py-8">
            <div className="bg-brand-dark-200 border border-brand-purple/30 rounded-2xl shadow-lg overflow-hidden">
                {renderContent()}
            </div>
        </main>

        {selectedOrder && (
            <>
                <OrderDetailsModal 
                    isOpen={isDetailsModalOpen}
                    onClose={() => setIsDetailsModalOpen(false)}
                    order={selectedOrder}
                />
                <PixModal 
                    isOpen={isPixModalOpen}
                    onClose={() => setIsPixModalOpen(false)}
                    order={selectedOrder}
                />
                 <OrderNotesModal
                    isOpen={isNotesModalOpen}
                    onClose={() => setIsNotesModalOpen(false)}
                    order={selectedOrder}
                    onSave={handleSaveNotes}
                />
            </>
        )}
    </div>
  );
};
