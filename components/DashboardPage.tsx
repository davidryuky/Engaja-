
import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';

// Sub-components
import { DashboardHeader } from './dashboard/DashboardHeader';
import { SuppliersManager } from './dashboard/SuppliersManager';
import { OrdersFilters } from './dashboard/OrdersFilters';
import { OrdersTable } from './dashboard/OrdersTable';
import { AnalyticsSection } from './AnalyticsSection';
import { QuickOrderSection } from './dashboard/QuickOrderSection'; // NEW

// Modals
import { PixModal } from './PixModal';
import { OrderDetailsModal } from './OrderDetailsModal';
import { OrderNotesModal } from './OrderNotesModal';
import { SettingsModal } from './SettingsModal';
import { ShareOrderModal } from './ShareOrderModal';

// Types
import { Order, StatusType } from './dashboard/DashboardTypes';

interface DashboardPageProps {
    onLogout: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onLogout }) => {
    // --- DATA STATE ---
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // --- PAGINATION & META ---
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);
    
    // --- FILTER STATE ---
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        payment_status: 'all',
        progress_status: 'all',
        completion_status: 'all',
        problem_status: 'all',
    });

    // --- MODAL STATES ---
    const [isPixModalOpen, setIsPixModalOpen] = useState(false);
    const [selectedOrderForPix, setSelectedOrderForPix] = useState<Order | null>(null);
    
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<Order | null>(null);
    
    const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
    const [selectedOrderForNotes, setSelectedOrderForNotes] = useState<Order | null>(null);
    
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [selectedOrderForShare, setSelectedOrderForShare] = useState<Order | null>(null);
    
    // Settings Data
    const [settings, setSettings] = useState({
        whatsapp_number: '',
        exit_intent_enabled: true
    });

    // --- FETCH SETTINGS ---
    const fetchSettings = useCallback(async () => {
        try {
            const response = await fetch('/api/settings');
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.settings) {
                    setSettings({
                        whatsapp_number: data.settings.whatsapp_number || '',
                        exit_intent_enabled: data.settings.exit_intent_enabled === 'true'
                    });
                }
            }
        } catch (error) { /* Silent fail */ }
    }, []);

    // --- FETCH ORDERS ---
    const fetchOrders = useCallback(async (page: number, currentFilters: typeof filters, search: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const queryParams = new URLSearchParams({
                page: String(page),
                search: search,
                ...currentFilters
            }).toString();

            const response = await fetch(`/api/orders?${queryParams}`);
            if (!response.ok) throw new Error('Falha ao buscar pedidos.');
            
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
            console.warn("Fetch orders failed (likely offline or preview):", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Initial Load
    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    // Debounced Fetch for Search/Filters
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchOrders(currentPage, filters, searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [currentPage, filters, searchQuery, fetchOrders]);


    // --- HANDLERS ---

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setCurrentPage(1);
    };

    const handleStatusUpdate = async (orderId: number, statusType: StatusType, newStatus: string) => {
        try {
            const response = await fetch('/api/orders', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, statusType, newStatus }),
            });
            const data = await response.json();
            if (!data.success) throw new Error(data.message);
            
            setOrders(prevOrders =>
                prevOrders.map(o => (o.id === orderId ? { ...o, [statusType]: newStatus } : o))
            );
        } catch (err) {
            console.error("Update failed:", err);
            alert('Não foi possível atualizar o pedido.');
            fetchOrders(currentPage, filters, searchQuery); // Revert/Refresh
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
                    fetchOrders(1, filters, searchQuery);
                } else {
                    throw new Error(data.message);
                }
            } catch (err: any) {
                setError(err.message);
            }
        }
    };

    const handleSaveNotes = async (orderId: number, notes: string) => {
        try {
            const response = await fetch('/api/orders', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, notes }),
            });
            const data = await response.json();
            if (!data.success) throw new Error(data.message);

            setOrders(prevOrders =>
                prevOrders.map(o => (o.id === orderId ? { ...o, notes } : o))
            );
            setIsNotesModalOpen(false);
        } catch (err) {
            console.error("Failed to save notes:", err);
            alert('Não foi possível salvar as anotações.');
            throw err;
        }
    };

    // --- RENDER ---
    return (
        <div className="bg-brand-dark min-h-screen text-slate-100 font-sans">
            
            <DashboardHeader 
                onOpenSettings={() => setIsSettingsModalOpen(true)} 
                onLogout={onLogout} 
            />

            <main className="p-4 md:p-8 max-w-[1920px] mx-auto">
                
                {/* SUPPLIERS SECTION */}
                <SuppliersManager />

                {/* QUICK ORDER SECTION (NEW) */}
                <QuickOrderSection />

                {/* ORDERS HEADER & ACTIONS */}
                <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                        Gerenciamento de Pedidos
                        <span className="text-sm font-normal text-slate-400 bg-brand-dark-200 px-3 py-1 rounded-full border border-brand-purple/30">
                            Total: {totalOrders}
                        </span>
                    </h2>
                    <button 
                        onClick={() => fetchOrders(currentPage, filters, searchQuery)} 
                        disabled={isLoading} 
                        className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors bg-brand-dark-200 hover:bg-brand-purple/20 px-4 py-2 rounded-lg border border-brand-purple/30"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        <span>Atualizar</span>
                    </button>
                </div>

                {/* FILTERS & SEARCH */}
                <OrdersFilters 
                    filters={filters} 
                    onFilterChange={handleFilterChange} 
                    searchQuery={searchQuery} 
                    setSearchQuery={setSearchQuery} 
                />

                {/* ERROR DISPLAY */}
                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 text-red-300 p-4 rounded-lg mb-6 flex items-center gap-4 animate-pulse">
                        <AlertTriangle />
                        <span>{error}</span>
                    </div>
                )}

                {/* MAIN TABLE */}
                <OrdersTable 
                    orders={orders}
                    isLoading={isLoading}
                    onStatusUpdate={handleStatusUpdate}
                    onDelete={handleDeleteOrder}
                    onOpenNotes={(o) => { setSelectedOrderForNotes(o); setIsNotesModalOpen(true); }}
                    onOpenDetails={(o) => { setSelectedOrderForDetails(o); setIsDetailsModalOpen(true); }}
                    onOpenPix={(o) => { setSelectedOrderForPix(o); setIsPixModalOpen(true); }}
                    onOpenShare={(o) => { setSelectedOrderForShare(o); setIsShareModalOpen(true); }}
                />

                {/* PAGINATION */}
                {!isLoading && totalPages > 1 && (
                    <div className="flex justify-between items-center mt-6">
                        <span className="text-sm text-slate-400 bg-brand-dark-200 px-3 py-1 rounded-md border border-brand-purple/20">
                            Página {currentPage} de {totalPages}
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-md bg-brand-dark-200 border border-brand-purple/30 disabled:opacity-50 hover:bg-brand-purple/20 transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-md bg-brand-dark-200 border border-brand-purple/30 disabled:opacity-50 hover:bg-brand-purple/20 transition-colors"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* ANALYTICS */}
                <AnalyticsSection />
            </main>

            {/* --- MODALS --- */}
            {isPixModalOpen && selectedOrderForPix && (
                <PixModal
                    isOpen={isPixModalOpen}
                    onClose={() => setIsPixModalOpen(false)}
                    // @ts-ignore
                    order={selectedOrderForPix}
                />
            )}
            {isDetailsModalOpen && selectedOrderForDetails && (
                <OrderDetailsModal
                    isOpen={isDetailsModalOpen}
                    onClose={() => setIsDetailsModalOpen(false)}
                    // @ts-ignore
                    order={selectedOrderForDetails}
                />
            )}
            {isNotesModalOpen && selectedOrderForNotes && (
                <OrderNotesModal
                    isOpen={isNotesModalOpen}
                    onClose={() => setIsNotesModalOpen(false)}
                    // @ts-ignore
                    order={selectedOrderForNotes}
                    onSave={handleSaveNotes}
                />
            )}
            {isShareModalOpen && selectedOrderForShare && (
                <ShareOrderModal 
                    isOpen={isShareModalOpen}
                    onClose={() => setIsShareModalOpen(false)}
                    order={selectedOrderForShare}
                />
            )}
            {isSettingsModalOpen && (
                <SettingsModal
                    isOpen={isSettingsModalOpen}
                    onClose={() => setIsSettingsModalOpen(false)}
                    initialData={settings}
                    onSaveSuccess={fetchSettings}
                />
            )}
        </div>
    );
};
