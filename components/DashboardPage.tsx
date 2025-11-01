import React, { useState, useEffect, useCallback } from 'react';
import { LogOut, Trash2, ChevronLeft, ChevronRight, RefreshCw, Loader2, AlertTriangle, QrCode, Eye, Filter } from 'lucide-react';
import { PixModal } from './PixModal';
import { OrderDetailsModal } from './OrderDetailsModal'; // Import the new modal

// --- TYPE DEFINITIONS ---
export interface Order { // Exporting for use in other components
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

// --- STATUS CONFIGURATION ---
type StatusType = 'payment_status' | 'progress_status' | 'completion_status';

const statusConfig = {
  payment_status: {
    states: ['Aguardando Pagamento', 'Pago'],
    colors: {
      'Aguardando Pagamento': 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30',
      'Pago': 'bg-green-500/20 text-green-300 hover:bg-green-500/30',
    },
  },
  progress_status: {
    states: ['Parado', 'Iniciado'],
    colors: {
      'Parado': 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30',
      'Iniciado': 'bg-green-500/20 text-green-300 hover:bg-green-500/30',
    },
  },
  completion_status: {
    states: ['Incompleto', 'Concluido'],
    colors: {
      'Incompleto': 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30',
      'Concluido': 'bg-green-500/20 text-green-300 hover:bg-green-500/30',
    },
  },
};

// --- HELPER COMPONENTS ---

const StatusButton: React.FC<{
    orderId: number;
    currentStatus: string;
    statusType: StatusType;
    onUpdate: (orderId: number, statusType: StatusType, newStatus: string) => Promise<void>;
}> = ({ orderId, currentStatus, statusType, onUpdate }) => {
    const [status, setStatus] = useState(currentStatus);
    const [isUpdating, setIsUpdating] = useState(false);
    
    const config = statusConfig[statusType];
    const currentIndex = config.states.indexOf(status);
    const nextIndex = (currentIndex + 1) % config.states.length;
    const nextStatus = config.states[nextIndex];

    useEffect(() => {
        setStatus(currentStatus);
    }, [currentStatus]);

    const handleClick = async () => {
        setIsUpdating(true);
        try {
            await onUpdate(orderId, statusType, nextStatus);
            setStatus(nextStatus);
        } catch (error) {
            console.error(`Failed to update ${statusType}`, error);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={isUpdating}
            className={`w-full relative rounded-md p-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-pink transition-colors duration-200 disabled:cursor-wait ${config.colors[status as keyof typeof config.colors]}`}
        >
            {status}
            {isUpdating && <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />}
        </button>
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

    // Filter state
    const [filters, setFilters] = useState({
        payment_status: 'all',
        progress_status: 'all',
        completion_status: 'all',
    });

    // Modal States
    const [isPixModalOpen, setIsPixModalOpen] = useState(false);
    const [selectedOrderForPix, setSelectedOrderForPix] = useState<Order | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<Order | null>(null);


    const fetchOrders = useCallback(async (page: number, currentFilters: typeof filters) => {
        setIsLoading(true);
        setError(null);
        try {
            const queryParams = new URLSearchParams({
                page: String(page),
                ...currentFilters
            }).toString();
            
            const response = await fetch(`/api/orders?${queryParams}`);
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
        fetchOrders(currentPage, filters);
    }, [currentPage, filters, fetchOrders]);
    
     const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setCurrentPage(1); // Reset to first page when filters change
    };

    const handleStatusUpdate = async (orderId: number, statusType: StatusType, newStatus: string) => {
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
             setOrders(prevOrders =>
                prevOrders.map(o => (o.id === orderId ? { ...o, [statusType]: newStatus } : o))
            );
        } catch (err) {
            console.error("Update failed:", err);
            alert('Não foi possível atualizar o pedido. A página será recarregada.');
            fetchOrders(currentPage, filters);
            throw err;
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
                    fetchOrders(1, filters); // Refresh from page 1 after deletion
                } else {
                    throw new Error(data.message || 'Falha ao apagar o pedido.');
                }
            } catch (err: any) {
                setError(err.message);
            }
        }
    };
    
    const handleOpenPixModal = (order: Order) => {
        setSelectedOrderForPix(order);
        setIsPixModalOpen(true);
    };

    const handleOpenDetailsModal = (order: Order) => {
        setSelectedOrderForDetails(order);
        setIsDetailsModalOpen(true);
    };


    return (
        <>
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
                    <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
                        <h2 className="text-2xl font-bold">Gerenciamento de Pedidos ({totalOrders})</h2>
                        <button onClick={() => fetchOrders(currentPage, filters)} disabled={isLoading} className="text-slate-300 hover:text-white transition-colors p-2">
                            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>

                    {/* --- FILTERS --- */}
                     <div className="bg-brand-dark-200 border border-brand-purple/30 rounded-lg p-4 mb-6 flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex items-center gap-2 text-slate-300 flex-shrink-0">
                           <Filter className="w-5 h-5" />
                           <span className="font-semibold">Filtros:</span>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                             <div>
                                 <label htmlFor="payment_status_filter" className="sr-only">Filtrar por Pagamento</label>
                                 <select name="payment_status" id="payment_status_filter" value={filters.payment_status} onChange={handleFilterChange} className="bg-brand-dark border border-brand-purple/50 rounded-md px-3 py-1.5 text-sm w-full">
                                    <option value="all">Pagamento: Todos</option>
                                    <option value="Aguardando Pagamento">Aguardando</option>
                                    <option value="Pago">Pago</option>
                                 </select>
                            </div>
                             <div>
                                 <label htmlFor="progress_status_filter" className="sr-only">Filtrar por Progresso</label>
                                 <select name="progress_status" id="progress_status_filter" value={filters.progress_status} onChange={handleFilterChange} className="bg-brand-dark border border-brand-purple/50 rounded-md px-3 py-1.5 text-sm w-full">
                                    <option value="all">Progresso: Todos</option>
                                    <option value="Parado">Parado</option>
                                    <option value="Iniciado">Iniciado</option>
                                 </select>
                            </div>
                             <div>
                                <label htmlFor="completion_status_filter" className="sr-only">Filtrar por Finalização</label>
                                 <select name="completion_status" id="completion_status_filter" value={filters.completion_status} onChange={handleFilterChange} className="bg-brand-dark border border-brand-purple/50 rounded-md px-3 py-1.5 text-sm w-full">
                                    <option value="all">Finalização: Todos</option>
                                    <option value="Incompleto">Incompleto</option>
                                    <option value="Concluido">Concluído</option>
                                 </select>
                            </div>
                        </div>
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
                                <p>Nenhum pedido encontrado com os filtros atuais.</p>
                            </div>
                        ) : (
                            <table className="w-full text-sm text-left text-slate-300">
                                <thead className="text-xs text-slate-400 uppercase bg-brand-dark">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">ID Pedido</th>
                                        <th scope="col" className="px-6 py-3">Serviço</th>
                                        <th scope="col" className="px-6 py-3">Data</th>
                                        <th scope="col" className="px-6 py-3">Pagamento</th>
                                        <th scope="col" className="px-6 py-3">Progresso</th>
                                        <th scope="col" className="px-6 py-3">Finalização</th>
                                        <th scope="col" className="px-6 py-3">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map(order => (
                                        <tr key={order.id} className={`border-b border-brand-purple/20 transition-colors duration-300 ${order.completion_status === 'Concluido' ? 'bg-green-500/10 hover:bg-green-500/20' : 'hover:bg-brand-dark-200/50'}`}>
                                            <td className="px-6 py-4 font-mono font-bold text-brand-pink">{order.public_id}</td>
                                            <td className="px-6 py-4">
                                                <div className="font-semibold">{order.platform} - {order.service}</div>
                                                <div className="text-xs text-slate-400">
                                                    {order.quantity ? `Qtd: ${order.quantity.toLocaleString('pt-BR')}` : 'Comentários'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">{new Date(order.created_at).toLocaleString('pt-BR')}</td>
                                            <td className="px-6 py-4">
                                                 <StatusButton orderId={order.id} currentStatus={order.payment_status} statusType="payment_status" onUpdate={handleStatusUpdate} />
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusButton orderId={order.id} currentStatus={order.progress_status} statusType="progress_status" onUpdate={handleStatusUpdate} />
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusButton orderId={order.id} currentStatus={order.completion_status} statusType="completion_status" onUpdate={handleStatusUpdate} />
                                            </td>
                                            <td className="px-6 py-4 flex items-center gap-2">
                                                <button onClick={() => handleOpenDetailsModal(order)} className="text-slate-300 hover:text-white p-2 rounded-full hover:bg-slate-500/10" title="Visualizar Detalhes">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleOpenPixModal(order)} className="text-cyan-400 hover:text-cyan-300 p-2 rounded-full hover:bg-cyan-500/10" title="Gerar PIX">
                                                    <QrCode className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDeleteOrder(order.id)} className="text-red-500 hover:text-red-400 p-2 rounded-full hover:bg-red-500/10" title="Apagar Pedido">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                    
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
             {isPixModalOpen && selectedOrderForPix && (
                <PixModal
                    isOpen={isPixModalOpen}
                    onClose={() => setIsPixModalOpen(false)}
                    order={selectedOrderForPix}
                />
            )}
             {isDetailsModalOpen && selectedOrderForDetails && (
                <OrderDetailsModal
                    isOpen={isDetailsModalOpen}
                    onClose={() => setIsDetailsModalOpen(false)}
                    order={selectedOrderForDetails}
                />
            )}
        </>
    );
};