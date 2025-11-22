
import React from 'react';
import { FileText, Eye, QrCode, Trash2, Loader2 } from 'lucide-react';
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
        if (order.problem_status === 'Problema') {
            return 'bg-red-900/10 hover:bg-red-900/20 border-red-500/30';
        }
        if (order.completion_status === 'Concluido') {
            return 'bg-green-900/10 hover:bg-green-900/20 border-green-500/10';
        }
        return 'hover:bg-brand-dark-200/50';
    };

    return (
        <div className="bg-brand-dark-200 border border-brand-purple/30 rounded-lg overflow-x-auto shadow-lg">
            {isLoading ? (
                <div className="h-96 flex items-center justify-center">
                    <Loader2 className="w-12 h-12 animate-spin text-brand-pink" />
                </div>
            ) : orders.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                    <p className="text-lg">Nenhum pedido encontrado.</p>
                    <p className="text-sm opacity-70">Tente ajustar os filtros ou a busca.</p>
                </div>
            ) : (
                <table className="w-full text-sm text-left text-slate-300">
                    <thead className="text-[11px] text-slate-400 uppercase bg-brand-dark sticky top-0 z-10 shadow-sm">
                        <tr>
                            <th scope="col" className="px-4 py-2 font-bold tracking-wider w-24">ID</th>
                            <th scope="col" className="px-4 py-2 font-bold tracking-wider">Serviço</th>
                            <th scope="col" className="px-4 py-2 font-bold tracking-wider w-40">Data</th>
                            <th scope="col" className="px-4 py-2 font-bold tracking-wider w-36">Pagamento</th>
                            <th scope="col" className="px-4 py-2 font-bold tracking-wider w-36">Progresso</th>
                            <th scope="col" className="px-4 py-2 font-bold tracking-wider w-36">Finalização</th>
                            <th scope="col" className="px-4 py-2 text-center font-bold tracking-wider w-28">Problema</th>
                            <th scope="col" className="px-4 py-2 font-bold tracking-wider text-right w-32">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-purple/10">
                        {orders.map(order => (
                            <tr key={order.id} className={`transition-colors duration-200 ${getOrderRowClass(order)}`}>
                                <td className="px-4 py-2 font-mono font-bold text-brand-pink text-xs whitespace-nowrap">
                                    {order.public_id}
                                </td>
                                <td className="px-4 py-2 max-w-[300px]">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-white text-xs whitespace-nowrap">{order.platform}</span>
                                        <span className="text-slate-600 mx-1">•</span>
                                        <span className="text-[11px] text-slate-300 truncate flex-1" title={order.service}>
                                            {order.service}
                                        </span>
                                        <span className="text-[10px] font-mono bg-brand-dark px-1.5 py-0.5 rounded border border-brand-purple/20 text-slate-400 whitespace-nowrap ml-2">
                                            {order.quantity ? order.quantity.toLocaleString('pt-BR') : 'Comentários'}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap">
                                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                                        <span>{new Date(order.created_at).toLocaleDateString('pt-BR')}</span>
                                        <span className="opacity-40">|</span>
                                        <span>{new Date(order.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-2">
                                    <StatusButton orderId={order.id} currentStatus={order.payment_status} statusType="payment_status" onUpdate={onStatusUpdate} />
                                </td>
                                <td className="px-4 py-2">
                                    <StatusButton orderId={order.id} currentStatus={order.progress_status} statusType="progress_status" onUpdate={onStatusUpdate} />
                                </td>
                                <td className="px-4 py-2">
                                    <StatusButton orderId={order.id} currentStatus={order.completion_status} statusType="completion_status" onUpdate={onStatusUpdate} />
                                </td>
                                <td className="px-4 py-2 text-center">
                                    <ProblemStatusButton orderId={order.id} currentStatus={order.problem_status} onUpdate={onStatusUpdate} />
                                </td>
                                <td className="px-4 py-2 text-right whitespace-nowrap">
                                    <div className="flex items-center justify-end gap-1">
                                        <button onClick={() => onOpenNotes(order)} className={`p-1.5 rounded transition-colors ${order.notes ? 'text-yellow-400 bg-yellow-400/10' : 'text-slate-500 hover:text-slate-300 hover:bg-brand-purple/20'}`} title={order.notes ? "Ver Anotações" : "Adicionar Nota"}>
                                            <FileText className="w-3.5 h-3.5" />
                                        </button>
                                        <button onClick={() => onOpenDetails(order)} className="text-slate-400 hover:text-brand-pink p-1.5 rounded hover:bg-brand-purple/20 transition-colors" title="Detalhes">
                                            <Eye className="w-3.5 h-3.5" />
                                        </button>
                                        <button onClick={() => onOpenPix(order)} className="text-cyan-600 hover:text-cyan-400 p-1.5 rounded hover:bg-cyan-500/10 transition-colors" title="PIX">
                                            <QrCode className="w-3.5 h-3.5" />
                                        </button>
                                        <button onClick={() => onDelete(order.id)} className="text-red-600 hover:text-red-400 p-1.5 rounded hover:bg-red-500/10 transition-colors" title="Excluir">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};
