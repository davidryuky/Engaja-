import React, { useState, useEffect, useCallback } from 'react';
import { LogOut, Trash2, ChevronLeft, ChevronRight, RefreshCw, Loader2, AlertTriangle } from 'lucide-react';

// --- TYPE DEFINITIONS ---
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

// --- PROPS INTERFACE ---
interface DashboardPageProps {
  onLogout: () => void;
}

// --- STATUS OPTIONS ---
const paymentStatusOptions: Order['payment_status'][] = ['Aguardando Pagamento', 'Pago'];
const progressStatusOptions: Order['progress_status'][] = ['Parado', 'Iniciado'];
const completionStatusOptions: Order['completion_status'][] = ['Incompleto', 'Concluido'];


// --- HELPER COMPONENTS ---

const StatusSelect: React.FC<{
    orderId: number;
    currentStatus: string;
    statusType: 'payment_status' | 'progress_status' | 'completion_status';
    options: string[];
    onUpdate: (orderId: number, statusType: string, newStatus: string) => Promise<void>;
}> = ({ orderId, currentStatus, statusType, options, onUpdate }) => {
    const [status, setStatus] = useState(currentStatus);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value;
        setIsUpdating(true);
        try {
            await onUpdate(orderId, statusType, newStatus);
            setStatus(newStatus);
        } catch (error) {
            console.error(`Failed to update ${statusType}`, error);
            // Revert on failure
            setStatus(currentStatus);
        } finally {
            setIsUpdating(false);
        }
    };
    
    const getStatusColor = (s: string) => {
        switch(s) {
            case 'Pago':
            case 'Iniciado':
            case 'Concluido':
                return 'bg-green-500/20 text-green-300 border-green-500/30';
            case 'Aguardando Pagamento':
            case 'Parado':
            case 'Incompleto':
                return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
            default:
                return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
        }
    };

    return (
        <div className="relative">
             <select
                value={status}
                onChange={handleChange}
                disabled={isUpdating}
                className={`w-full appearance-none rounded-md p-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-pink transition-colors duration-200 ${getStatusColor(status)}`}
            >
                {options.map(opt => <option key={opt} value={opt} className="bg-brand-dark-200 text-white">{opt}</option>)}
            </select>
            {isUpdating && <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />}
        </div>
       
    );
};


// --- MAIN DASHBOARD COMPONENT ---

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
                throw new Error(data.message || 'Erro ao carregar dados.');
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
    
    const handleStatusUpdate = async (orderId: number, statusType: string, newStatus: string) => {
        try {
            const response = await fetch('/api/orders', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, statusType, newStatus }),
            });
            const data = await response.json();
            if (!data.success) {
                throw new Error(data.message || 'Falha ao atualizar status.');
            }
        } catch (err) {
            console.error("Update failed:", err);
            alert('Não foi possível atualizar o pedido. A página será recarregada.');
            fetchOrders(currentPage); // Refresh data on failure
            throw err; // Re-throw to be caught by the component
        }
    };
    
    const handleDeleteOrder = async (orderId: number) => {
        if (window.confirm('Tem certeza que deseja apagar este pedido? Esta ação é irreversível.')) {
            try {
                const response = await fetch('/api/orders', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ orderId }),
                });

                const data = await response.json();
                if (data.success) {
                    // Refetch orders for the current page
                    fetchOrders(currentPage);
                } else {
                    throw new Error(data.message || 'Falha ao apagar o pedido.');
                }
            } catch (err: any) {
                setError(err.message);
            }
        }
    };

    return (
        <div className="bg-brand-dark min-h-screen text-slate-100 font-sans">
            <header className="bg-brand-dark-200 border-b border-brand-purple/30 p-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <img src="https://i.postimg.cc/jj7rdzv8/logoengaja.png" alt="Engaja+ Logo" className="h-12" />
                    <h1 className="text-xl md:text-2xl font-bold text-white">Painel Administrativo</h1>
                </div>
                <button
                    onClick={onLogout}
                    className="flex items-center gap-2 bg-brand-dark hover:bg-brand-purple/30 border border-brand-purple/50 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="hidden sm:inline">Sair</span>
                </button>
            </header>

            <main className="p-4 md:p-8">
                <div className="mb-6 flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Gerenciamento de Pedidos ({totalOrders})</h2>
                    <button onClick={() => fetchOrders(currentPage)} disabled={isLoading} className="text-slate-300 hover:text-white transition-colors">
                        <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 text-red-300 p-4 rounded-lg mb-6 flex items-center gap-4">
                        <AlertTriangle />
                        <span>{error}</span>
                    </div>
                )}
                
                <div className="bg-brand-dark-200 border border-brand-purple/30 rounded-lg overflow-x-auto">
                    {isLoading ? (
                        <div className="h-96 flex items-center justify-center">
                            <Loader2 className="w-12 h-12 animate-spin text-brand-pink" />
                        </div>
                    ) : orders.length === 0 ? (
                         <div className="h-96 flex items-center justify-center text-slate-400">
                            <p>Nenhum pedido encontrado.</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm text-left text-slate-300">
                            <thead className="text-xs text-slate-400 uppercase bg-brand-dark">
                                <tr>
                                    <th scope="col" className="px-6 py-3">ID Pedido</th>
                                    <th scope="col" className="px-6 py-3">Detalhes</th>
                                    <th scope="col" className="px-6 py-3">Link</th>
                                    <th scope="col" className="px-6 py-3">Data</th>
                                    <th scope="col" className="px-6 py-3">Pagamento</th>
                                    <th scope="col" className="px-6 py-3">Progresso</th>
                                    <th scope="col" className="px-6 py-3">Finalização</th>
                                    <th scope="col" className="px-6 py-3">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr key={order.id} className="border-b border-brand-purple/20 hover:bg-brand-dark-200/50">
                                        <td className="px-6 py-4 font-mono font-bold text-brand-pink">{order.public_id}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold">{order.platform} - {order.service}</div>
                                            <div className="text-xs text-slate-400">
                                                {order.quantity ? `Qtd: ${order.quantity.toLocaleString('pt-BR')}` : 'Comentários'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <a href={order.link} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline truncate max-w-xs block">{order.link}</a>
                                        </td>
                                        <td className="px-6 py-4">{new Date(order.created_at).toLocaleString('pt-BR')}</td>
                                        <td className="px-6 py-4">
                                             <StatusSelect orderId={order.id} currentStatus={order.payment_status} statusType="payment_status" options={paymentStatusOptions} onUpdate={handleStatusUpdate} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusSelect orderId={order.id} currentStatus={order.progress_status} statusType="progress_status" options={progressStatusOptions} onUpdate={handleStatusUpdate} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusSelect orderId={order.id} currentStatus={order.completion_status} statusType="completion_status" options={completionStatusOptions} onUpdate={handleStatusUpdate} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <button onClick={() => handleDeleteOrder(order.id)} className="text-red-500 hover:text-red-400 p-2 rounded-full hover:bg-red-500/10">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
                
                {/* Pagination */}
                {!isLoading && totalPages > 1 && (
                    <div className="flex justify-between items-center mt-6">
                         <span className="text-sm text-slate-400">
                            Página {currentPage} de {totalPages}
                        </span>
                        <div className="flex items-center gap-2">
                             <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-md bg-brand-dark-200 border border-brand-purple/30 disabled:opacity-50"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-md bg-brand-dark-200 border border-brand-purple/30 disabled:opacity-50"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
};
