
import React from 'react';
import { FileText, Eye, QrCode, Trash2, Loader2, ExternalLink, Link as LinkIcon } from 'lucide-react';
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

    const getOrderRowClass = (order: Order) => {
        let baseClass = "transition-colors duration-200 group hover:bg-brand-purple/5"; // Base hover effect
        
        if (order.problem_status === 'Problema') {
            return `${baseClass} bg-red-900/10`;
        }
        if (order.completion_status === 'Concluido') {
            return `${baseClass} bg-green-900/10`;
        }
        // Zebra striping for normal rows
        return `${baseClass} even:bg-brand-dark-200/30`;
    };

    return (
        <div className="bg-brand-dark border border-brand-purple/20 rounded-lg overflow-hidden shadow-xl">
            {isLoading ? (
                <div className="h-96 flex items-center justify-center bg-brand-dark/50">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-10 h-10 animate-spin text-brand-pink" />
                        <span className="text-slate-400 text-sm">Carregando pedidos...</span>
                    </div>
                </div>
            ) : orders.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-slate-400 bg-brand-dark/50">
                    <p className="text-lg font-medium">Nenhum pedido encontrado</p>
                    <p className="text-sm opacity-60 mt-1">Tente ajustar os filtros ou realizar uma nova busca.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="text-[11px] font-bold text-slate-300 uppercase bg-brand-dark-200/80 border-b border-brand-purple/30">
                            <tr>
                                <th className="px-3 py-3 w-[70px] text-center border-r border-brand-purple/10">ID</th>
                                <th className="px-4 py-3 w-[25%] border-r border-brand-purple/10">Serviço</th>
                                <th className="px-4 py-3 w-[20%] border-r border-brand-purple/10">Link</th>
                                <th className="px-2 py-3 w-[80px] text-center border-r border-brand-purple/10">Qtd</th>
                                <th className="px-3 py-3 w-[110px] text-center border-r border-brand-purple/10">Data</th>
                                <th className="px-2 py-3 w-[110px] text-center border-r border-brand-purple/10">Pagamento</th>
                                <th className="px-2 py-3 w-[110px] text-center border-r border-brand-purple/10">Progresso</th>
                                <th className="px-2 py-3 w-[110px] text-center border-r border-brand-purple/10">Finalização</th>
                                <th className="px-2 py-3 w-[60px] text-center border-r border-brand-purple/10">Prob.</th>
                                <th className="px-3 py-3 w-[100px] text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-purple/10 text-slate-300">
                            {orders.map(order => (
                                <tr key={order.id} className={getOrderRowClass(order)}>
                                    
                                    {/* ID */}
                                    <td className="px-3 py-3 text-center font-mono font-bold text-brand-pink text-xs border-r border-brand-purple/10">
                                        {order.public_id}
                                    </td>

                                    {/* SERVIÇO */}
                                    <td className="px-4 py-3 border-r border-brand-purple/10 align-middle">
                                        <div className="flex flex-col justify-center">
                                            <span className="font-bold text-white text-xs mb-0.5">{order.platform}</span>
                                            <span className="text-[11px] text-slate-400 leading-tight line-clamp-1" title={order.service}>
                                                {order.service}
                                            </span>
                                        </div>
                                    </td>

                                    {/* LINK */}
                                    <td className="px-4 py-3 border-r border-brand-purple/10 align-middle">
                                        <a 
                                            href={order.link} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="group/link flex items-center gap-2 text-[11px] text-cyan-500/90 hover:text-cyan-400 transition-colors w-full"
                                            title={order.link}
                                        >
                                            <div className="p-1 rounded-md bg-cyan-500/10 group-hover/link:bg-cyan-500/20 flex-shrink-0">
                                                <LinkIcon className="w-3 h-3" />
                                            </div>
                                            <span className="truncate font-mono opacity-80 group-hover/link:opacity-100">{order.link}</span>
                                        </a>
                                    </td>

                                    {/* QUANTIDADE */}
                                    <td className="px-2 py-3 text-center border-r border-brand-purple/10 align-middle">
                                        {order.quantity ? (
                                            <span className="inline-block font-mono font-bold text-[11px] text-white bg-brand-dark/50 px-2 py-1 rounded border border-brand-purple/10 min-w-[50px]">
                                                {order.quantity.toLocaleString('pt-BR')}
                                            </span>
                                        ) : (
                                            <span className="text-slate-600 text-[10px]">—</span>
                                        )}
                                    </td>

                                    {/* DATA */}
                                    <td className="px-3 py-3 text-center border-r border-brand-purple/10 align-middle">
                                        <div className="flex flex-col items-center">
                                            <span className="text-[11px] font-medium text-slate-300">
                                                {new Date(order.created_at).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'})}
                                            </span>
                                            <span className="text-[9px] text-slate-500 font-mono">
                                                {new Date(order.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </td>

                                    {/* STATUSES */}
                                    <td className="px-2 py-3 align-middle border-r border-brand-purple/10">
                                        <div className="flex justify-center">
                                            <StatusButton orderId={order.id} currentStatus={order.payment_status} statusType="payment_status" onUpdate={onStatusUpdate} />
                                        </div>
                                    </td>
                                    <td className="px-2 py-3 align-middle border-r border-brand-purple/10">
                                        <div className="flex justify-center">
                                            <StatusButton orderId={order.id} currentStatus={order.progress_status} statusType="progress_status" onUpdate={onStatusUpdate} />
                                        </div>
                                    </td>
                                    <td className="px-2 py-3 align-middle border-r border-brand-purple/10">
                                        <div className="flex justify-center">
                                            <StatusButton orderId={order.id} currentStatus={order.completion_status} statusType="completion_status" onUpdate={onStatusUpdate} />
                                        </div>
                                    </td>

                                    {/* PROBLEMA */}
                                    <td className="px-2 py-3 text-center align-middle border-r border-brand-purple/10">
                                        <ProblemStatusButton orderId={order.id} currentStatus={order.problem_status} onUpdate={onStatusUpdate} />
                                    </td>

                                    {/* AÇÕES */}
                                    <td className="px-3 py-3 text-right align-middle">
                                        <div className="flex items-center justify-end gap-1">
                                            <button 
                                                onClick={() => onOpenNotes(order)} 
                                                className={`p-1.5 rounded transition-all ${order.notes ? 'text-yellow-400 bg-yellow-400/10 ring-1 ring-yellow-400/30' : 'text-slate-500 hover:text-slate-200 hover:bg-brand-purple/20'}`} 
                                                title={order.notes ? "Ver Anotações" : "Adicionar Nota"}
                                            >
                                                <FileText className="w-3.5 h-3.5" />
                                            </button>
                                            <button onClick={() => onOpenDetails(order)} className="text-slate-400 hover:text-brand-pink p-1.5 rounded hover:bg-brand-purple/20 transition-colors" title="Ver Detalhes Completos">
                                                <Eye className="w-3.5 h-3.5" />
                                            </button>
                                            <button onClick={() => onOpenPix(order)} className="text-cyan-600 hover:text-cyan-400 p-1.5 rounded hover:bg-cyan-500/10 transition-colors" title="Gerar Pix">
                                                <QrCode className="w-3.5 h-3.5" />
                                            </button>
                                            <button onClick={() => onDelete(order.id)} className="text-red-600/70 hover:text-red-500 p-1.5 rounded hover:bg-red-500/10 transition-colors" title="Excluir Pedido">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
