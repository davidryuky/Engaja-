
import React from 'react';
import { FileText, Eye, QrCode, Trash2, Loader2, ExternalLink, Calendar, Layers, MoreHorizontal } from 'lucide-react';
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

    // Grid Template: Definindo larguras fixas para colunas críticas para manter alinhamento perfeito
    // ID | Serviço/Link (Flex) | Qtd | Data | Pagamento | Progresso | Finalização | Prob | Ações
    const desktopGrid = "grid-cols-[80px_minmax(250px,3fr)_90px_110px_110px_110px_120px_50px_100px]";

    return (
        <div className="w-full bg-brand-dark-200 border border-brand-purple/20 rounded-lg overflow-hidden shadow-xl">
            
            {/* HEADER ROW */}
            <div className={`hidden lg:grid ${desktopGrid} bg-brand-dark/50 border-b border-brand-purple/20 px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider items-center`}>
                <div>ID</div>
                <div>Serviço / Link</div>
                <div className="text-right pr-2">Qtd</div>
                <div>Data</div>
                <div className="text-center">Pagamento</div>
                <div className="text-center">Progresso</div>
                <div className="text-center">Status Final</div>
                <div className="text-center">Prob</div>
                <div className="text-right">Ações</div>
            </div>

            {/* BODY */}
            {isLoading ? (
                <div className="h-48 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-brand-pink" />
                </div>
            ) : orders.length === 0 ? (
                <div className="h-48 flex flex-col items-center justify-center text-slate-500 gap-2">
                    <Layers className="w-8 h-8 opacity-50" />
                    <span className="text-sm">Nenhum pedido encontrado</span>
                </div>
            ) : (
                <div className="divide-y divide-brand-purple/10">
                    {orders.map(order => {
                        const isProblem = order.problem_status === 'Problema';
                        const isCompleted = order.completion_status === 'Concluido';

                        // Row Background Logic
                        let rowBgClass = "hover:bg-white/[0.02]";
                        if (isProblem) rowBgClass = "bg-red-500/[0.05] hover:bg-red-500/[0.08]";
                        else if (isCompleted) rowBgClass = "bg-green-500/[0.02] hover:bg-green-500/[0.05]";

                        return (
                            <div 
                                key={order.id} 
                                className={`
                                    flex flex-col lg:grid lg:${desktopGrid} items-center px-4 py-2.5 transition-colors duration-150
                                    ${rowBgClass}
                                `}
                            >
                                {/* 1. ID */}
                                <div className="flex justify-between w-full lg:w-auto lg:block mb-1 lg:mb-0">
                                    <span className="font-mono text-xs font-medium text-slate-400">#{order.public_id}</span>
                                    {/* Mobile Date shown here */}
                                    <span className="lg:hidden text-[10px] text-slate-600">
                                        {new Date(order.created_at).toLocaleDateString('pt-BR')}
                                    </span>
                                </div>

                                {/* 2. Service & Link (Combined Line) */}
                                <div className="w-full mb-2 lg:mb-0 min-w-0 pr-4">
                                    <div className="flex items-center gap-2 w-full">
                                        <span className="text-[10px] font-bold uppercase text-slate-500 bg-black/20 px-1 rounded border border-white/5 flex-shrink-0">
                                            {order.platform}
                                        </span>
                                        <div className="flex items-center gap-2 overflow-hidden text-xs">
                                            <span className="text-slate-200 font-medium truncate flex-shrink-0 max-w-[150px] xl:max-w-[200px]" title={order.service}>
                                                {order.service}
                                            </span>
                                            <span className="text-slate-600">•</span>
                                            <a 
                                                href={order.link} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-cyan-500 hover:text-cyan-300 truncate hover:underline font-mono opacity-90"
                                                title={order.link}
                                            >
                                                {order.link}
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                {/* 3. Quantity */}
                                <div className="w-full lg:w-auto flex justify-between lg:block lg:text-right pr-2 mb-1 lg:mb-0">
                                    <span className="lg:hidden text-xs text-slate-500 uppercase font-bold">Qtd:</span>
                                    <span className="font-mono text-xs text-slate-300">
                                        {order.quantity ? order.quantity.toLocaleString('pt-BR') : '-'}
                                    </span>
                                </div>

                                {/* 4. Date (Desktop) */}
                                <div className="hidden lg:block text-[11px] text-slate-500">
                                    <div className="flex flex-col">
                                        <span>{new Date(order.created_at).toLocaleDateString('pt-BR')}</span>
                                        <span className="text-[10px] opacity-70">{new Date(order.created_at).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}</span>
                                    </div>
                                </div>

                                {/* 5. Payment Status */}
                                <div className="w-full lg:w-auto mb-1 lg:mb-0 lg:px-1">
                                    <StatusButton orderId={order.id} currentStatus={order.payment_status} statusType="payment_status" onUpdate={onStatusUpdate} />
                                </div>

                                {/* 6. Progress Status */}
                                <div className="w-full lg:w-auto mb-1 lg:mb-0 lg:px-1">
                                    <StatusButton orderId={order.id} currentStatus={order.progress_status} statusType="progress_status" onUpdate={onStatusUpdate} />
                                </div>

                                {/* 7. Completion Status */}
                                <div className="w-full lg:w-auto mb-1 lg:mb-0 lg:px-1">
                                    <StatusButton orderId={order.id} currentStatus={order.completion_status} statusType="completion_status" onUpdate={onStatusUpdate} />
                                </div>

                                {/* 8. Problem Status (Compact) */}
                                <div className="w-full lg:w-auto flex justify-end lg:justify-center mb-2 lg:mb-0">
                                    <div className="w-8">
                                        <ProblemStatusButton orderId={order.id} currentStatus={order.problem_status} onUpdate={onStatusUpdate} />
                                    </div>
                                </div>

                                {/* 9. Actions */}
                                <div className="w-full lg:w-auto flex justify-end gap-1 border-t border-white/5 pt-2 lg:pt-0 lg:border-0">
                                    <ActionIcon 
                                        onClick={() => onOpenNotes(order)} 
                                        icon={FileText} 
                                        active={!!order.notes}
                                        activeColor="text-yellow-500"
                                        label="Notas"
                                    />
                                    <ActionIcon onClick={() => onOpenDetails(order)} icon={Eye} label="Ver" />
                                    <ActionIcon onClick={() => onOpenPix(order)} icon={QrCode} label="Pix" />
                                    <ActionIcon onClick={() => onDelete(order.id)} icon={Trash2} hoverColor="hover:text-red-400" label="Excluir" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

// Micro-component for consistent action buttons
const ActionIcon = ({ onClick, icon: Icon, active = false, activeColor = '', hoverColor = 'hover:text-white', label }: any) => (
    <button 
        onClick={onClick} 
        className={`
            p-1.5 rounded-md transition-all duration-200
            ${active ? activeColor : 'text-slate-500 hover:bg-white/10'}
            ${!active && hoverColor}
        `}
        title={label}
    >
        <Icon className="w-4 h-4" />
    </button>
);
