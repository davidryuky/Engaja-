
import React from 'react';
import { FileText, Eye, QrCode, Trash2, Loader2, ExternalLink, Link as LinkIcon, Calendar, Layers } from 'lucide-react';
import { Order, StatusType } from './DashboardTypes';
import { StatusButton, ProblemStatusButton } from './StatusButtons';

interface OrdersTableProps {
    orders: Order[];
    isLoading: boolean;
    onStatusUpdate: (orderId: number, statusType: StatusType, newStatus: string) => Promise<void>;
    onDelete: (orderId: number) => void;
    onOpenNotes: (order: Order) => void;
    onOpenDetails: (order: Order) => void;
    onOpenPix: (order: Order) => void;
}

export const OrdersTable: React.FC<OrdersTableProps> = ({
    orders,
    isLoading,
    onStatusUpdate,
    onDelete,
    onOpenNotes,
    onOpenDetails,
    onOpenPix
}) => {

    // Header Column Definitions for Grid
    // We use CSS Grid to align the headers with the row content
    const gridTemplate = "grid-cols-12 gap-4";

    return (
        <div className="w-full space-y-4">
            {/* HEADERS (Hidden on Mobile, Visible on Desktop) */}
            <div className={`hidden lg:grid ${gridTemplate} px-6 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider`}>
                <div className="col-span-1">ID</div>
                <div className="col-span-3">Serviço / Link</div>
                <div className="col-span-1 text-center">Qtd</div>
                <div className="col-span-2 text-center">Data</div>
                <div className="col-span-1 text-center">Pagamento</div>
                <div className="col-span-1 text-center">Progresso</div>
                <div className="col-span-1 text-center">Finalização</div>
                <div className="col-span-1 text-center">Prob.</div>
                <div className="col-span-1 text-right">Ações</div>
            </div>

            {/* CONTENT */}
            {isLoading ? (
                <div className="h-64 flex items-center justify-center bg-brand-dark-200/50 rounded-2xl border border-brand-purple/20 border-dashed">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-brand-pink" />
                        <span className="text-slate-400 text-sm font-medium">Carregando pedidos...</span>
                    </div>
                </div>
            ) : orders.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center bg-brand-dark-200/50 rounded-2xl border border-brand-purple/20 border-dashed text-slate-400">
                    <Layers className="w-10 h-10 mb-3 opacity-50" />
                    <p className="text-lg font-medium">Nenhum pedido encontrado</p>
                    <p className="text-sm opacity-60">Tente ajustar os filtros.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {orders.map(order => {
                        const isProblem = order.problem_status === 'Problema';
                        const isCompleted = order.completion_status === 'Concluido';
                        
                        return (
                            <div 
                                key={order.id} 
                                className={`
                                    relative bg-brand-dark-200 rounded-xl p-4 lg:px-6 lg:py-3
                                    border transition-all duration-300 group
                                    ${isProblem 
                                        ? 'border-red-500/30 shadow-[inset_4px_0_0_0_#ef4444] bg-red-900/5 hover:border-red-500/50' 
                                        : isCompleted
                                            ? 'border-green-500/30 shadow-[inset_4px_0_0_0_#22c55e] bg-green-900/5 hover:border-green-500/50'
                                            : 'border-brand-purple/10 hover:border-brand-pink/30 hover:bg-brand-purple/5 hover:shadow-lg hover:shadow-brand-purple/5'
                                    }
                                `}
                            >
                                <div className={`flex flex-col lg:grid lg:${gridTemplate} items-center gap-4 lg:gap-4`}>
                                    
                                    {/* SECTION 1: ID & MAIN INFO */}
                                    <div className="flex lg:contents w-full justify-between items-center lg:items-start">
                                        {/* Mobile Layout: Header with ID and Date */}
                                        <div className="lg:hidden flex justify-between w-full items-center mb-2">
                                            <span className="font-mono font-bold text-brand-pink text-sm">{order.public_id}</span>
                                            <div className="text-xs text-slate-500 flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(order.created_at).toLocaleDateString('pt-BR')}
                                            </div>
                                        </div>

                                        {/* Desktop: ID Column */}
                                        <div className="col-span-1 hidden lg:block">
                                            <span className="font-mono font-bold text-brand-pink text-xs bg-brand-pink/10 px-2 py-1 rounded">
                                                {order.public_id}
                                            </span>
                                        </div>

                                        {/* Service & Link Column */}
                                        <div className="col-span-3 w-full">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-brand-dark px-1.5 rounded border border-brand-purple/10">
                                                        {order.platform}
                                                    </span>
                                                    <span className="text-sm font-semibold text-white truncate" title={order.service}>
                                                        {order.service}
                                                    </span>
                                                </div>
                                                <a 
                                                    href={order.link} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    className="flex items-center gap-1.5 text-xs text-cyan-500 hover:text-cyan-300 transition-colors w-fit max-w-full group/link"
                                                >
                                                    <LinkIcon className="w-3 h-3 flex-shrink-0" />
                                                    <span className="truncate font-mono opacity-80 group-hover/link:opacity-100 group-hover/link:underline">
                                                        {order.link}
                                                    </span>
                                                </a>
                                            </div>
                                        </div>
                                    </div>

                                    {/* SECTION 2: METRICS (Mobile: Grid 2x2, Desktop: Grid Columns) */}
                                    <div className="w-full lg:contents grid grid-cols-2 gap-4 lg:gap-0">
                                        
                                        {/* Quantity */}
                                        <div className="col-span-1 lg:text-center flex flex-col lg:block">
                                            <span className="lg:hidden text-[10px] text-slate-500 uppercase font-bold mb-1">Quantidade</span>
                                            {order.quantity ? (
                                                <span className="font-mono font-bold text-sm text-white">
                                                    {order.quantity.toLocaleString('pt-BR')}
                                                </span>
                                            ) : (
                                                <span className="text-slate-600">—</span>
                                            )}
                                        </div>

                                        {/* Date (Desktop Only - Mobile shows on top) */}
                                        <div className="col-span-2 hidden lg:flex flex-col items-center justify-center">
                                            <span className="text-xs font-medium text-slate-300">
                                                {new Date(order.created_at).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'})}
                                            </span>
                                            <span className="text-[10px] text-slate-500 font-mono">
                                                {new Date(order.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>

                                    {/* SECTION 3: STATUSES (Mobile: Stacked, Desktop: Grid) */}
                                    <div className="w-full lg:contents grid grid-cols-2 gap-2 lg:gap-0 mt-2 lg:mt-0">
                                        
                                        {/* Payment */}
                                        <div className="col-span-1 lg:col-span-1">
                                            <StatusButton orderId={order.id} currentStatus={order.payment_status} statusType="payment_status" onUpdate={onStatusUpdate} />
                                        </div>
                                        
                                        {/* Progress */}
                                        <div className="col-span-1 lg:col-span-1">
                                            <StatusButton orderId={order.id} currentStatus={order.progress_status} statusType="progress_status" onUpdate={onStatusUpdate} />
                                        </div>
                                        
                                        {/* Completion (Full width on mobile) */}
                                        <div className="col-span-2 lg:col-span-1 mt-1 lg:mt-0">
                                            <StatusButton orderId={order.id} currentStatus={order.completion_status} statusType="completion_status" onUpdate={onStatusUpdate} />
                                        </div>
                                    </div>

                                    {/* SECTION 4: PROBLEM & ACTIONS */}
                                    <div className="flex w-full lg:contents justify-between items-center mt-3 lg:mt-0 border-t border-brand-purple/10 pt-3 lg:pt-0 lg:border-0">
                                        
                                        {/* Problem Button */}
                                        <div className="col-span-1 flex justify-center">
                                            <ProblemStatusButton orderId={order.id} currentStatus={order.problem_status} onUpdate={onStatusUpdate} />
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="col-span-1 flex justify-end gap-2">
                                            <button 
                                                onClick={() => onOpenNotes(order)} 
                                                className={`
                                                    p-2 rounded-full transition-all duration-200
                                                    ${order.notes 
                                                        ? 'bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30' 
                                                        : 'text-slate-400 hover:text-white hover:bg-brand-purple/20'
                                                    }
                                                `}
                                                title={order.notes ? "Ver Anotações" : "Adicionar Nota"}
                                            >
                                                <FileText className="w-4 h-4" />
                                            </button>
                                            
                                            <button onClick={() => onOpenDetails(order)} className="p-2 rounded-full text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors" title="Detalhes">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            
                                            <button onClick={() => onOpenPix(order)} className="p-2 rounded-full text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors" title="Pix">
                                                <QrCode className="w-4 h-4" />
                                            </button>
                                            
                                            <button onClick={() => onDelete(order.id)} className="p-2 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors" title="Excluir">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
