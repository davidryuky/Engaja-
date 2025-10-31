import React, { useState, useEffect } from 'react';

interface DashboardPageProps {
  onLogout: () => void;
}

interface Order {
  id: number;
  order_text: string;
  created_at: string;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onLogout }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [newOrderText, setNewOrderText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Function to fetch orders
  const fetchOrders = async () => {
    try {
      setError('');
      setIsLoading(true);
      const response = await fetch('/api/orders');
      const data = await response.json();
      if (data.success) {
        setOrders(data.orders);
      } else {
        throw new Error(data.message || 'Falha ao buscar pedidos.');
      }
    } catch (err) {
      setError('Não foi possível carregar os pedidos. Verifique a conexão com o servidor.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  // Handle form submission to add a new order
  const handleAddOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrderText.trim()) {
      setError('O campo do pedido não pode estar vazio.');
      return;
    }

    try {
      setError('');
      setIsSubmitting(true);
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderText: newOrderText }),
      });

      const data = await response.json();
      if (data.success) {
        setNewOrderText('');
        await fetchOrders(); // Refresh the list
      } else {
        throw new Error(data.message || 'Falha ao adicionar o pedido.');
      }
    } catch (err) {
        setError('Não foi possível salvar o pedido. Tente novamente.');
        console.error(err);
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-brand-dark min-h-screen font-sans p-4 md:p-8 text-white">
        <div className="max-w-4xl mx-auto">
            <header className="flex justify-between items-center mb-12">
                <img src="https://i.postimg.cc/jj7rdzv8/logoengaja.png" alt="Engaja+ Logo" className="h-16" />
                <button
                    onClick={onLogout}
                    className="bg-gradient-to-r from-brand-pink to-brand-purple hover:from-brand-purple hover:to-brand-pink text-white font-bold py-2 px-6 rounded-full transition-all duration-300 transform hover:scale-105 text-sm"
                >
                    Sair
                </button>
            </header>

            <main>
                <h1 className="text-4xl font-bold mb-2">Painel de Controle</h1>
                <p className="text-lg text-slate-300 mb-10">Bem-vindo, Administrador!</p>

                {/* Add Order Form */}
                <div className="bg-brand-dark-200 border border-brand-purple/30 rounded-2xl p-6 mb-12 shadow-lg">
                    <h2 className="text-2xl font-semibold mb-4 text-brand-pink">Adicionar Novo Pedido</h2>
                    <form onSubmit={handleAddOrder}>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <input
                                type="text"
                                value={newOrderText}
                                onChange={(e) => setNewOrderText(e.target.value)}
                                placeholder="Digite a descrição do pedido..."
                                className="flex-grow w-full bg-brand-dark border-2 border-brand-purple/30 rounded-lg p-3 text-white focus:outline-none focus:border-brand-pink transition-colors duration-300"
                                disabled={isSubmitting}
                            />
                            <button
                                type="submit"
                                className="bg-gradient-to-r from-brand-purple to-brand-pink hover:from-brand-pink hover:to-brand-purple text-white font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-wait"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Salvando...' : 'Salvar Pedido'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Orders List */}
                <div>
                    <h2 className="text-2xl font-semibold mb-4 text-slate-200">Pedidos Feitos</h2>
                    
                    {isLoading ? (
                        <p className="text-center text-slate-400 py-8">Carregando pedidos...</p>
                    ) : (
                        <>
                          {error && <p className="text-red-500 bg-red-900/20 border border-red-500 rounded-lg p-4 text-center mb-4">{error}</p>}
                          {orders.length > 0 ? (
                              <div className="space-y-4">
                                  {orders.map(order => (
                                      <div key={order.id} className="bg-brand-dark-200 border border-brand-purple/20 rounded-lg p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                                          <p className="text-slate-300 break-words">{order.order_text}</p>
                                          <span className="text-xs text-slate-500 flex-shrink-0 sm:ml-4 self-end sm:self-center">
                                              {new Date(order.created_at).toLocaleString('pt-BR')}
                                          </span>
                                      </div>
                                  ))}
                              </div>
                          ) : (
                              <div className="text-center py-8 px-4 border-2 border-dashed border-brand-purple/20 rounded-lg">
                                  <p className="text-slate-400">Nenhum pedido foi adicionado ainda.</p>
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
