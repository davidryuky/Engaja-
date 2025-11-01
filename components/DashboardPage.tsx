import React, { useState, useEffect, useCallback } from 'react';
import { LogOut, Trash2, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

interface Order {
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

const StatusSelect: React.FC<{
  orderId: number;
  statusType: 'payment_status' | 'progress_status' | 'completion_status';
  currentStatus: string;
  options: string[];
  onStatusChange: (orderId: number, statusType: 'payment_status' | 'progress_status' | 'completion_status', newStatus: string) => void;
}> = ({ orderId, statusType, currentStatus, options, onStatusChange }) => {
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Pago':
      case 'Iniciado':
      case 'Concluido':
        return 'bg-green-500/20 text-green-400';
      case 'Aguardando Pagamento':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'Parado':
      case 'Incompleto':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };
  
  return (
    <select
      value={currentStatus}
      onChange={(e) => onStatusChange(orderId, statusType, e.target.value)}
      className={`rounded px-2 py-1 text-xs font-semibold border border-transparent focus:outline-none focus:ring-2 focus:ring-brand-pink ${getStatusColor(currentStatus)}`}
      style={{ WebkitAppearance: 'none', appearance: 'none', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, paddingRight: '2rem' }}
    >
      {options.map(option => (
        <option key={option} value={option} className="bg-brand-dark-200 text-white">
          {option}
        </option>
      ))}
    </select>
  );
};


export const DashboardPage: React.FC<DashboardPageProps> = ({ onLogout }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  const fetchOrders = useCallback(async (page: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/orders?page=${page}`);
      if (!response.ok) {
        throw new Error('Falha ao buscar pedidos.');
      }
      const data = await response.json();
      if (data.success) {
        setOrders(data.orders);
        setTotalPages(data.totalPages);
        setCurrentPage(data.currentPage);
        setTotalOrders(data.totalOrders);
      } else {
        throw new Error(data.message || 'Erro ao processar dados dos pedidos.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage, fetchOrders]);
  
  const handleStatusChange = async (orderId: number, statusType: 'payment_status' | 'progress_status' | 'completion_status', newStatus: string) => {
    try {
        const response = await fetch('/api/orders', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId, statusType, newStatus }),
        });
        if (!response.ok) throw new Error('Falha ao atualizar status.');
        
        // Optimistic update
        setOrders(prevOrders => prevOrders.map(order => 
            order.id === orderId ? { ...order, [statusType]: newStatus } : order
        ));

    } catch (err: any) {
        alert(`Erro: ${err.message}`);
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
              if (!response.ok) throw new Error('Falha ao apagar pedido.');
              
              // Refetch current page to reflect deletion
              fetchOrders(currentPage);

          } catch (err: any) {
              alert(`Erro: ${err.message}`);
          }
      }
  };

  return (
    <div className="bg-brand-dark min-h-screen text-slate-100 font-sans p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
             <img src="https://i.postimg.cc/jj7rdzv8/logoengaja.png" alt="Engaja+ Logo" className="h-12" />
            <h1 className="text-2xl md:text-3xl font-bold text-white">Dashboard de Pedidos</h1>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 bg-brand-dark-200 hover:bg-red-500/20 text-slate-300 hover:text-red-400 font-semibold py-2 px-4 rounded-lg transition-colors duration-300"
          >
            <LogOut size={18} />
            Sair
          </button>
        </header>

        <main className="bg-brand-dark-200 border border-brand-purple/30 rounded-2xl shadow-2xl shadow-brand-purple/10 p-4 md:p-6">
          <div className="flex justify-between items-center mb-4">
            <p className="text-slate-400">Total de pedidos: <span className="font-bold text-white">{totalOrders}</span></p>
             <button
                onClick={() => fetchOrders(currentPage)}
                disabled={isLoading}
                className="flex items-center gap-2 text-brand-pink hover:text-pink-400 disabled:opacity-50 disabled:cursor-wait"
            >
                <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                <span>Atualizar</span>
            </button>
          </div>
          
          {isLoading && <p className="text-center p-8">Carregando pedidos...</p>}
          {error && <p className="text-center p-8 text-red-400">Erro: {error}</p>}
          
          {!isLoading && !error && orders.length === 0 && (
            <p className="text-center p-8 text-slate-400">Nenhum pedido encontrado.</p>
          )}

          {!isLoading && !error && orders.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-300">
                <thead className="text-xs text-slate-400 uppercase bg-brand-dark/50">
                  <tr>
                    <th scope="col" className="px-4 py-3">ID</th>
                    <th scope="col" className="px-4 py-3">Plataforma</th>
                    <th scope="col" className="px-4 py-3">Serviço</th>
                    <th scope="col" className="px-4 py-3">Link/Comentários</th>
                    <th scope="col" className="px-4 py-3 text-center">Pagamento</th>
                    <th scope="col" className="px-4 py-3 text-center">Progresso</th>
                    <th scope="col" className="px-4 py-3 text-center">Conclusão</th>
                    <th scope="col" className="px-4 py-3 text-center">Data</th>
                    <th scope="col" className="px-4 py-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-brand-purple/20 hover:bg-brand-dark/50">
                      <td className="px-4 py-4 font-mono text-brand-pink">{order.public_id}</td>
                      <td className="px-4 py-4">{order.platform}</td>
                      <td className="px-4 py-4">{order.service} ({order.quantity?.toLocaleString('pt-BR') || 'N/A'})</td>
                      <td className="px-4 py-4 max-w-xs truncate">
                        {order.comments ? <span className="italic" title={order.comments}>"{order.comments.split('\n')[0]}..."</span> : <a href={order.link} target="_blank" rel="noopener noreferrer" className="hover:underline">{order.link}</a>}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <StatusSelect 
                            orderId={order.id}
                            statusType="payment_status"
                            currentStatus={order.payment_status}
                            options={['Aguardando Pagamento', 'Pago']}
                            onStatusChange={handleStatusChange}
                        />
                      </td>
                      <td className="px-4 py-4 text-center">
                        <StatusSelect 
                            orderId={order.id}
                            statusType="progress_status"
                            currentStatus={order.progress_status}
                            options={['Parado', 'Iniciado']}
                            onStatusChange={handleStatusChange}
                        />
                      </td>
                       <td className="px-4 py-4 text-center">
                        <StatusSelect 
                            orderId={order.id}
                            statusType="completion_status"
                            currentStatus={order.completion_status}
                            options={['Incompleto', 'Concluido']}
                            onStatusChange={handleStatusChange}
                        />
                      </td>
                      <td className="px-4 py-4 text-center">{new Date(order.created_at).toLocaleDateString('pt-BR')}</td>
                       <td className="px-4 py-4 text-center">
                          <button onClick={() => handleDeleteOrder(order.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                              <Trash2 size={16} />
                          </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 disabled:opacity-50"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="font-semibold">
                Página {currentPage} de {totalPages}
              </span>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 disabled:opacity-50"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};
