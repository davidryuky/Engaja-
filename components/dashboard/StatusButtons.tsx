
import React, { useState, useEffect } from 'react';
import { Loader2, AlertOctagon, CheckCircle, Clock, PlayCircle, Check, AlertTriangle, XCircle } from 'lucide-react';
import { StatusType } from './DashboardTypes';

const statusConfig = {
    payment_status: {
        states: ['Aguardando Pagamento', 'Pago'],
        config: {
            'Aguardando Pagamento': {
                className: 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20',
                icon: Clock,
                label: 'Aguardando'
            },
            'Pago': {
                className: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
                icon: Check,
                label: 'Pago'
            },
        },
    },
    progress_status: {
        states: ['Parado', 'Iniciado'],
        config: {
            'Parado': {
                className: 'bg-slate-700/30 text-slate-400 border border-slate-600/30',
                icon: Loader2,
                label: 'Parado'
            },
            'Iniciado': {
                className: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
                icon: PlayCircle,
                label: 'Iniciado'
            },
        },
    },
    completion_status: {
        states: ['Incompleto', 'Concluido'],
        config: {
            'Incompleto': {
                className: 'bg-slate-700/30 text-slate-400 border border-slate-600/30',
                icon: null,
                label: 'Em Andamento'
            },
            'Concluido': {
                className: 'bg-green-500 text-black font-bold border border-green-400 shadow-[0_0_10px_rgba(34,197,94,0.3)]',
                icon: CheckCircle,
                label: 'CONCLUÍDO'
            },
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
    const typeConfig = statusConfig[statusType];
    if (!typeConfig) return null;

    const stateConfig = typeConfig.config[status];
    if (!stateConfig) return <span className="text-[10px] text-red-500">Erro</span>;

    const currentIndex = typeConfig.states.indexOf(status);
    const nextIndex = (currentIndex + 1) % typeConfig.states.length;
    const nextStatus = typeConfig.states[nextIndex];

    const handleClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
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

    const Icon = stateConfig.icon;

    return (
        <button
            onClick={handleClick}
            disabled={isUpdating}
            className={`
                relative flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wide font-medium transition-all duration-200 w-full
                ${stateConfig.className}
                ${isUpdating ? 'opacity-70 cursor-wait' : 'hover:brightness-110 active:scale-95'}
            `}
        >
            {isUpdating ? (
                <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
                <>
                    {Icon && <Icon className="w-3 h-3" />}
                    <span>{stateConfig.label}</span>
                </>
            )}
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

    const handleClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
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
            className={`
                flex items-center justify-center w-full h-7 rounded-md transition-all duration-200
                ${isProblem 
                    ? 'bg-red-600 text-white font-bold shadow-[0_0_10px_rgba(220,38,38,0.4)] hover:bg-red-500' 
                    : 'text-slate-600 hover:text-slate-400 hover:bg-white/5'
                }
            `}
            title={isProblem ? 'Resolver Problema' : 'Marcar Problema'}
        >
            {isUpdating ? (
                <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
                isProblem ? <AlertTriangle className="w-4 h-4" /> : <span className="text-[10px] font-medium text-slate-600">—</span>
            )}
        </button>
    );
};
