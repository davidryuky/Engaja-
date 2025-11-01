import React, { useState, useEffect, useCallback } from 'react';
import { Eye, Trash2, LogOut, ChevronLeft, ChevronRight, BarChart2, ListOrdered } from 'lucide-react';
import { OrderDetailsModal } from './OrderDetailsModal';
import { FinancialSection } from './FinancialSection';

// Exporting the Order type to be used in other components like OrderDetailsModal
export interface Order {
  id: number;
  public_id: string;
  platform: string;
  service: string;
  link: string;
  quantity: number | null;
  comments: string | null;
  payment_status: 'Aguardando Pagamento' | 'Pago';
  progress_status: 'Parado' | 'Iniciado';
  completion_status: 'Incompleto' | 'Concluido';
  created_at: string;
}

interface DashboardPageProps {
  onLogout: () => void;
}

type StatusType = 'payment_status' | 'progress_status' | 'completion_status';
type Tab = 'orders' | 'financials';

export const DashboardPage: React.FC<DashboardPageProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<Tab>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [updatingStatus, setUpdatingStatus] = useState<Record<string, boolean>>({});

  const fetchOrders = useCallback(async (page: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/orders?page=${page}`);
      const data = await response.json();
      if (data.success) {
        setOrders(data.orders);
        setTotalPages(data.totalPages);
        setTotalOrders(data.totalOrders);
        setCurrentPage(data.currentPage);
      } else {
        throw new Error(data.message || 'Failed to fetch orders.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders(currentPage);
    }
  }, [fetchOrders, currentPage, activeTab]);

  const handleStatusChange = async (orderId: number, statusType: StatusType, newStatus: string) => {
    const statusKey = `${orderId}-${statusType}`;
    setUpdatingStatus(prev => ({...prev, [statusKey]: true }));

    try {
        const response = await fetch('/api/orders', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId, statusType, newStatus }),
        });
        const data = await response.json();
        if (data.success) {
            setOrders(prevOrders => prevOrders.map(order => 
                order.id === orderId ? { ...order, [statusType]: newStatus } : order
            ));
        } else {
            throw new Error(data.message || 'Failed to update status.');
        }
    } catch (err) {
        alert(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
        setUpdatingStatus(prev => ({...prev, [statusKey]: false }));
    }
  };

  const handleDeleteOrder = async (orderId: number) => {
    if (window.confirm('Tem certeza que deseja apagar este pedido? Esta ação não pode ser desfeita.')) {
        try {
            const response = await fetch('/api/orders', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId }),
            });
            const data = await response.json();
            if (data.success) {
                alert('Pedido apagado com sucesso.');
                fetchOrders(currentPage); // Refetch to update list and pagination
            } else {
                throw new Error(data.message || 'Failed to delete order.');
            }
        } catch (err) {
            alert(err instanceof Error ? err.message : 'An unknown error occurred.');
        }
    }
  };
  
  const openDetailsModal = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };

  const renderStatusDropdown = (order: Order, type: StatusType, options: string[]) => {
    const value = order[type];
    const key = `${order.id}-${type}`;
    const isDisabled = updatingStatus[key];

    return (
        <select
            value={value}
            onChange={(e) => handleStatusChange(order.id, type, e.target.value)}
            disabled={isDisabled}
            className={`w-full p-2 rounded-md bg-brand-dark-200 border border-brand-purple/50 focus:outline-none focus:ring-2 focus:ring-brand-pink transition-all text-sm ${
                isDisabled ? 'opacity-50 cursor-wait' : ''
            } ${
                value === 'Pago' || value === 'Iniciado' || value === 'Concluido' ? 'text-green-400' :
                value === 'Aguardando Pagamento' ? 'text-yellow-400' : 'text-slate-300'
            }`}
        >
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    );
  };
  
  return (
    <div className="bg-brand-dark min-h-screen text-slate-100 font-sans">
      <header className="bg-brand-dark-200 border-b border-brand-purple/30">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img src="https://i.postimg.cc/jj7rdzv8/logoengaja.png" alt="Engaja+ Logo" className="h-12" />
            <h1 className="text-xl font-bold text-white hidden sm:block">Painel Administrativo</h1>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 bg-brand-purple hover:bg-opacity-80 text-white font-semibold py-2 px-4 rounded-full text-sm transition-all duration-300 transform hover:scale-105"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair</span>
          </button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="flex border-b border-brand-purple/30 mb-8">
            <button onClick={() => setActiveTab('orders')} className={`flex items-center gap-2 py-3 px-6 text-lg font-semibold transition-colors duration-300 ${activeTab === 'orders' ? 'text-brand-pink border-b-2 border-brand-pink' : 'text-slate-400 hover:text-white'}`}>
                <ListOrdered className="w-5 h-5" /> Pedidos
            </button>
            <button onClick={() => setActiveTab('financials')} className={`flex items-center gap-2 py-3 px-6 text-lg font-semibold transition-colors duration-300 ${activeTab === 'financials' ? 'text-brand-pink border-b-2 border-brand-pink' : 'text-slate-400 hover:text-white'}`}>
                <BarChart2 className="w-5 h-5" /> Financeiro
            </button>
        </div>

        {activeTab === 'orders' && (
            <div>
                 <div className="bg-brand-dark-200 border border-brand-purple/30 rounded-xl shadow-lg p-4 mb-6">
                    <h2 className="text-xl font-bold">Gerenciamento de Pedidos ({totalOrders})</h2>
                    <p className="text-slate-400 mt-1">Visualize, atualize e gerencie todos os pedidos dos clientes.</p>
                </div>

                {isLoading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-pink mx-auto"></div>
                        <p className="mt-4">Carregando pedidos...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-20 bg-red-900/20 border border-red-500 rounded-lg p-4">
                        <p className="text-red-400 font-semibold">Erro ao carregar pedidos:</p>
                        <p className="text-red-400 mt-2">{error}</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto bg-brand-dark-200 border border-brand-purple/30 rounded-xl">
                            <table className="w-full text-left">
                                <thead className="border-b border-brand-purple/30 text-sm uppercase text-slate-400">
                                    <tr>
                                        <th className="p-4">ID Pedido</th>
                                        <th className="p-4">Plataforma/Serviço</th>
                                        <th className="p-4">Data</th>
                                        <th className="p-4">Pagamento</th>
                                        <th className="p-4">Progresso</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4 text-center">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map(order => (
                                        <tr key={order.id} className="border-b border-brand-purple/20 last:border-b-0 hover:bg-brand-purple/10">
                                            <td className="p-4 font-mono text-brand-pink">{order.public_id}</td>
                                            <td className="p-4">
                                                <div className="font-semibold">{order.platform}</div>
                                                <div className="text-sm text-slate-400">{order.service}</div>
                                            </td>
                                            <td className="p-4 text-sm text-slate-300">{new Date(order.created_at).toLocaleDateString('pt-BR')}</td>
                                            <td className="p-4">{renderStatusDropdown(order, 'payment_status', ['Aguardando Pagamento', 'Pago'])}</td>
                                            <td className="p-4">{renderStatusDropdown(order, 'progress_status', ['Parado', 'Iniciado'])}</td>
                                            <td className="p-4">{renderStatusDropdown(order, 'completion_status', ['Incompleto', 'Concluido'])}</td>
                                            <td className="p-4">
                                                <div className="flex justify-center items-center gap-2">
                                                    <button onClick={() => openDetailsModal(order)} className="p-2 text-slate-400 hover:text-cyan-400 transition-colors" title="Ver Detalhes"><Eye className="w-5 h-5"/></button>
                                                    <button onClick={() => handleDeleteOrder(order.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Apagar Pedido"><Trash2 className="w-5 h-5"/></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                         {/* Pagination */}
                        <div className="flex justify-between items-center mt-6 text-slate-400">
                            <p>Página {currentPage} de {totalPages}</p>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-md bg-brand-dark-200 hover:bg-brand-purple/50 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronLeft className="w-5 h-5"/></button>
                                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-md bg-brand-dark-200 hover:bg-brand-purple/50 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronRight className="w-5 h-5"/></button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        )}
        
        {activeTab === 'financials' && <FinancialSection />}
      </main>

      {selectedOrder && (
        <OrderDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          order={selectedOrder}
        />
      )}
    </div>
  );
};

export default DashboardPage;
