
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
                    <thead className="text-xs text-slate-400 uppercase bg-brand-dark sticky top-0">
                        <tr>
                            <th scope="col" className="px-6 py-4 font-bold tracking-wider">ID Pedido</th>
                            <th scope="col" className="px-6 py-4 font-bold tracking-wider">Serviço</th>
                            <th scope="col" className="px-6 py-4 font-bold tracking-wider">Data</th>
                            <th scope="col" className="px-6 py-4 font-bold tracking-wider">Pagamento</th>
                            <th scope="col" className="px-6 py-4 font-bold tracking-wider">Progresso</th>
                            <th scope="col" className="px-6 py-4 font-bold tracking-wider">Finalização</th>
                            <th scope="col" className="px-6 py-4 text-center font-bold tracking-wider">Problema</th>
                            <th scope="col" className="px-6 py-4 font-bold tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order.id} className={`border-b border-brand-purple/20 transition-colors duration-300 ${getOrderRowClass(order)}`}>
                                <td className="px-6 py-4 font-mono font-bold text-brand-pink">{order.public_id}</td>
                                <td className="px-6 py-4">
                                    <div className="font-semibold text-white">{order.platform}</div>
                                    <div className="text-xs text-slate-400 mb-1">{order.service}</div>
                                    <div className="text-xs font-mono bg-brand-dark inline-block px-2 py-0.5 rounded border border-brand-purple/20 text-slate-300">
                                        {order.quantity ? `Qtd: ${order.quantity.toLocaleString('pt-BR')}` : 'Comentários'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">
                                    {new Date(order.created_at).toLocaleDateString('pt-BR')}
                                    <br />
                                    {new Date(order.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </td>
                                <td className="px-6 py-4">
                                    <StatusButton orderId={order.id} currentStatus={order.payment_status} statusType="payment_status" onUpdate={onStatusUpdate} />
                                </td>
                                <td className="px-6 py-4">
                                    <StatusButton orderId={order.id} currentStatus={order.progress_status} statusType="progress_status" onUpdate={onStatusUpdate} />
                                </td>
                                <td className="px-6 py-4">
                                    <StatusButton orderId={order.id} currentStatus={order.completion_status} statusType="completion_status" onUpdate={onStatusUpdate} />
                                </td>
                                <td className="px-6 py-4">
                                    <ProblemStatusButton orderId={order.id} currentStatus={order.problem_status} onUpdate={onStatusUpdate} />
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => onOpenNotes(order)} className={`p-2 rounded-full transition-colors ${order.notes ? 'text-yellow-400 hover:bg-yellow-400/10' : 'text-slate-400 hover:text-white hover:bg-slate-500/10'}`} title={order.notes ? "Ver Anotações (Existe nota)" : "Adicionar Anotações"}>
                                            <FileText className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => onOpenDetails(order)} className="text-slate-400 hover:text-brand-pink p-2 rounded-full hover:bg-slate-500/10 transition-colors" title="Visualizar Detalhes">
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => onOpenPix(order)} className="text-cyan-500 hover:text-cyan-300 p-2 rounded-full hover:bg-cyan-500/10 transition-colors" title="Gerar PIX">
                                            <QrCode className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => onDelete(order.id)} className="text-red-500 hover:text-red-400 p-2 rounded-full hover:bg-red-500/10 transition-colors" title="Apagar Pedido">
                                            <Trash2 className="w-4 h-4" />
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
