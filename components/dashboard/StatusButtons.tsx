
import React, { useState, useEffect } from 'react';
import { Loader2, AlertOctagon, CheckCircle } from 'lucide-react';
import { StatusType } from './DashboardTypes';

const statusConfig = {
    payment_status: {
        states: ['Aguardando Pagamento', 'Pago'],
        colors: {
            'Aguardando Pagamento': 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 hover:bg-yellow-500/20',
            'Pago': 'bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20',
        },
    },
    progress_status: {
        states: ['Parado', 'Iniciado'],
        colors: {
            'Parado': 'bg-slate-700/30 text-slate-400 border border-slate-600/30 hover:bg-slate-600/30',
            'Iniciado': 'bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20',
        },
    },
    completion_status: {
        states: ['Incompleto', 'Concluido'],
        colors: {
            'Incompleto': 'bg-slate-700/30 text-slate-400 border border-slate-600/30 hover:bg-slate-600/30',
            'Concluido': 'bg-brand-purple/10 text-brand-pink border border-brand-purple/20 hover:bg-brand-purple/20',
        },
    },
};

export const StatusButton: React.FC<{
    orderId: number;
    currentStatus: string;
    statusType: StatusType;
    onUpdate: (orderId: number, statusType: StatusType, newStatus: string) => Promise<void>;
}> = ({ orderId, currentStatus, statusType, onUpdate }) => {
    const [status, setStatus] = useState(currentStatus);
    const [isUpdating, setIsUpdating] = useState(false);

    // @ts-ignore
    const config = statusConfig[statusType];
    if (!config) return null;

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

    // Format status text for display (optional: shorten strings if needed)
    const displayStatus = status === 'Aguardando Pagamento' ? 'Aguardando' : status;

    return (
        <button
            onClick={handleClick}
            disabled={isUpdating}
            // @ts-ignore
            className={`w-full relative rounded px-2 py-1 text-[10px] font-semibold uppercase tracking-wide focus:outline-none transition-all duration-200 disabled:cursor-wait ${config.colors[status] || 'bg-slate-700'}`}
        >
            <span className={isUpdating ? 'opacity-0' : 'opacity-100'}>{displayStatus}</span>
            {isUpdating && <div className="absolute inset-0 flex items-center justify-center"><Loader2 className="h-3 w-3 animate-spin" /></div>}
        </button>
    );
};

export const ProblemStatusButton: React.FC<{
    orderId: number;
    currentStatus: string;
    onUpdate: (orderId: number, statusType: StatusType, newStatus: string) => Promise<void>;
}> = ({ orderId, currentStatus, onUpdate }) => {
    const [status, setStatus] = useState(currentStatus || 'Normal');
    const [isUpdating, setIsUpdating] = useState(false);

    const isProblem = status === 'Problema';
    const nextStatus = isProblem ? 'Normal' : 'Problema';

    useEffect(() => {
        setStatus(currentStatus || 'Normal');
    }, [currentStatus]);

    const handleClick = async () => {
        setIsUpdating(true);
        try {
            await onUpdate(orderId, 'problem_status', nextStatus);
            setStatus(nextStatus);
        } catch (error) {
            console.error(`Failed to update problem_status`, error);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={isUpdating}
            className={`relative inline-flex items-center justify-center p-1 rounded transition-colors duration-200 disabled:cursor-wait ${
                isProblem
                    ? 'text-red-400 hover:bg-red-500/20'
                    : 'text-slate-600 hover:text-green-400 hover:bg-green-500/10'
                }`}
            title={isProblem ? 'Resolver Problema' : 'Marcar como Problema'}
        >
            {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : isProblem ? (
                <AlertOctagon className="h-4 w-4" />
            ) : (
                <CheckCircle className="h-4 w-4" />
            )}
        </button>
    );
};
