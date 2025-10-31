import React, { useState, useEffect } from 'react';

interface DashboardPageProps {
  onLogout: () => void;
}

interface Order {
  id: number;
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

// --- Helper component for status buttons ---
interface StatusButtonProps {
    statusType: 'payment_status' | 'progress_status' | 'completion_status';
    currentStatus: string;
    orderId: number;
    onStatusChange: (orderId: number, statusType: any, newStatus: any) => void;
}

const StatusButton: React.FC<StatusButtonProps> = ({ statusType, currentStatus, orderId, onStatusChange }) => {
    const [isLoading, setIsLoading] = useState(false);

    // FIX: Define types for status configuration to ensure type safety. This resolves errors where `config` was inferred as `never`.
    type StatusInfo = { text: string; next: string; color: string };
    type StatusCategory = Record<string, StatusInfo>;

    const statusConfig: Record<'payment_status' | 'progress_status' | 'completion_status', StatusCategory> = {
        payment_status: {
            'Aguardando Pagamento': { text: 'Aguardando Pagamento', next: 'Pago', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
            'Pago': { text: 'Pago', next: 'Aguardando Pagamento', color: 'bg-green-500/20 text-green-400 border-green-500/30' }
        },
        progress_status: {
            'Parado': { text: 'Parado', next: 'Iniciado', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
            'Iniciado': { text: 'Iniciado', next: 'Parado', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' }
        },
        completion_status: {
            'Incompleto': { text: 'Incompleto', next: 'Concluido', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
            'Concluido': { text: 'Concluído', next: 'Incompleto', color: 'bg-teal-500/20 text-teal-400 border-teal-500/30' }
        }
    };
    
    // With the explicit type on statusConfig, TypeScript can correctly infer the type of `config` as `StatusInfo | undefined`.
    const config = statusConfig[statusType][currentStatus];

    if (!config) {
        return null; // or a default button
    }

    const handleClick = async () => {
        setIsLoading(true);
        try {
            await fetch('/api/orders', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, statusType, newStatus: config.next }),
            });
            onStatusChange(orderId, statusType, config.next);
        } catch (error) {
            console.error(`Failed to update status for order ${orderId}:`, error);
            alert('Falha ao atualizar o status. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={isLoading}
            className={`px-3 py-1 text-xs font-semibold rounded-full border transition-all duration-200 hover:opacity-80 disabled:opacity-50 disabled:cursor-wait ${config.color}`}
        >
            {isLoading ? '...' : config.text}
        </button>
    );
};

export const DashboardPage: React.FC<DashboardPageProps> = ({ onLogout }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Function to fetch orders
  const fetchOrders = async () => {
    try {
      setError('');
      setIsLoading(true);
      const response = await fetch('/api/orders');
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      if (data.success) {
        setOrders(data.orders);
      } else {
        throw new Error(data.message || 'Falha ao buscar pedidos.');
      }
    } catch (err) {
      setError('Não foi possível carregar os pedidos. Verifique a conexão com o servidor e as variáveis de ambiente.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  const handleLocalStatusChange = (orderId: number, statusType: keyof Order, newStatus: any) => {
    setOrders(currentOrders =>
        currentOrders.map(order =>
            order.id === orderId ? { ...order, [statusType]: newStatus } : order
        )
    );
  };

  return (
    <div className="bg-brand-dark min-h-screen font-sans p-4 md:p-8 text-white">
        <div className="max-w-7xl mx-auto">
            <header className="flex justify-between items-center mb-12">
                <img src="https://i.postimg.cc/jj7rdzv8/logoengaja.png" alt="Engaja+ Logo" className="h-16" />
                <div className="flex items-center gap-4">
                  <button
                    onClick={fetchOrders}
                    className="bg-brand-dark-200 border border-brand-purple/50 text-slate-300 font-bold p-2 rounded-full transition-all duration-300 hover:text-white hover:border-brand-pink disabled:opacity-50"
                    title="Atualizar Pedidos"
                    disabled={isLoading}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                  </button>
                  <button
                      onClick={onLogout}
                      className="bg-gradient-to-r from-brand-pink to-brand-purple hover:from-brand-purple hover:to-brand-pink text-white font-bold py-2 px-6 rounded-full transition-all duration-300 transform hover:scale-105 text-sm"
                  >
                      Sair
                  </button>
                </div>
            </header>

            <main>
                <h1 className="text-4xl font-bold mb-2">Painel de Pedidos</h1>
                <p className="text-lg text-slate-300 mb-10">Gerencie todos os pedidos recebidos.</p>

                <div>
                    {isLoading ? (
                        <p className="text-center text-slate-400 py-8">Carregando pedidos...</p>
                    ) : (
                        <>
                          {error && <p className="text-red-500 bg-red-900/20 border border-red-500 rounded-lg p-4 text-center mb-4">{error}</p>}
                          {orders.length > 0 ? (
                              <div className="space-y-4">
                                  {orders.map(order => (
                                    <div key={order.id} className="bg-brand-dark-200 border border-brand-purple/20 rounded-lg p-4 transition-colors hover:border-brand-purple/50">
                                      <div className="flex flex-wrap justify-between items-start gap-4">
                                        {/* Order Info */}
                                        <div className="flex-1 min-w-[250px]">
                                          <p className="text-xs text-brand-pink font-bold">ID: {order.id}</p>
                                          <p className="text-lg font-semibold text-white">{order.platform} - {order.service}</p>
                                          <p className="text-sm text-slate-400 break-all">Link: <a href={order.link} target="_blank" rel="noopener noreferrer" className="hover:text-brand-pink">{order.link}</a></p>
                                          {order.quantity && <p className="text-sm text-slate-400">Quantidade: <span className="font-semibold text-slate-200">{order.quantity.toLocaleString('pt-BR')}</span></p>}
                                        </div>
                                        {/* Status Buttons */}
                                        <div className="flex items-center flex-wrap gap-2">
                                          <StatusButton statusType="payment_status" currentStatus={order.payment_status} orderId={order.id} onStatusChange={handleLocalStatusChange} />
                                          <StatusButton statusType="progress_status" currentStatus={order.progress_status} orderId={order.id} onStatusChange={handleLocalStatusChange} />
                                          <StatusButton statusType="completion_status" currentStatus={order.completion_status} orderId={order.id} onStatusChange={handleLocalStatusChange} />
                                        </div>
                                      </div>
                                      {order.comments && (
                                        <div className="mt-3 pt-3 border-t border-brand-purple/20">
                                          <p className="text-xs font-semibold text-slate-400 mb-1">Comentários:</p>
                                          <pre className="text-sm text-slate-300 whitespace-pre-wrap font-sans bg-brand-dark/50 p-2 rounded-md">{order.comments}</pre>
                                        </div>
                                      )}
                                      <p className="text-xs text-slate-500 text-right mt-3">
                                        Criado em: {new Date(order.created_at).toLocaleString('pt-BR')}
                                      </p>
                                    </div>
                                  ))}
                              </div>
                          ) : (
                              <div className="text-center py-12 px-4 border-2 border-dashed border-brand-purple/20 rounded-lg">
                                  <p className="text-slate-400 text-lg">Nenhum pedido recebido ainda.</p>
                                  <p className="text-slate-500 mt-2">Novos pedidos aparecerão aqui automaticamente.</p>
                              </div>
                          )}
                        </>
                    )}
                </div>
            </main>
        </div>
    </div>
  );
};