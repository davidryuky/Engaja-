
import React, { useState, useEffect } from 'react';
import { Loader2, AlertOctagon, CheckCircle, Clock, PlayCircle, Check, AlertTriangle } from 'lucide-react';
import { StatusType } from './DashboardTypes';

const statusConfig = {
    payment_status: {
        states: ['Aguardando Pagamento', 'Pago'],
        config: {
            'Aguardando Pagamento': {
                color: 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/30 hover:bg-yellow-500/20',
                icon: Clock,
                label: 'Aguardando'
            },
            'Pago': {
                color: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20',
                icon: Check,
                label: 'Pago'
            },
        },
    },
    progress_status: {
        states: ['Parado', 'Iniciado'],
        config: {
            'Parado': {
                color: 'bg-slate-700/50 text-slate-400 border border-slate-600/50 hover:bg-slate-700',
                icon: Loader2, // Static icon for 'Parado'
                label: 'Parado'
            },
            'Iniciado': {
                color: 'bg-blue-500/10 text-blue-400 border border-blue-500/30 hover:bg-blue-500/20',
                icon: PlayCircle,
                label: 'Iniciado'
            },
        },
    },
    completion_status: {
        states: ['Incompleto', 'Concluido'],
        config: {
            'Incompleto': {
                color: 'bg-slate-700/50 text-slate-400 border border-slate-600/50 hover:bg-slate-700',
                icon: Loader2, // Static
                label: 'Em Andamento'
            },
            // STATUS DE DESTAQUE: CONCLUÍDO (Neon Green)
            'Concluido': {
                color: 'bg-green-500 text-brand-dark font-bold shadow-[0_0_15px_rgba(34,197,94,0.4)] hover:bg-green-400 hover:shadow-[0_0_20px_rgba(34,197,94,0.6)] border-none',
                icon: CheckCircle,
                label: 'Concluído'
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
    // Fallback safety
    if (!stateConfig) return <span className="text-xs text-red-500">Erro de Status</span>;

    const currentIndex = typeConfig.states.indexOf(status);
    const nextIndex = (currentIndex + 1) % typeConfig.states.length;
    const nextStatus = typeConfig.states[nextIndex];

    useEffect(() => {
        setStatus(currentStatus);
    }, [currentStatus]);

    const handleClick = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent clicking the row
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
                group relative flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-wider transition-all duration-300 w-full
                ${stateConfig.color}
                ${isUpdating ? 'opacity-70 cursor-wait' : 'cursor-pointer'}
            `}
        >
            {isUpdating ? (
                <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
                <>
                    <Icon className="w-3 h-3" />
                    <span className="font-bold">{stateConfig.label}</span>
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

    useEffect(() => {
        setStatus(currentStatus || 'Normal');
    }, [currentStatus]);

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
                relative flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300
                ${isProblem 
                    ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)] hover:bg-red-500 animate-pulse' 
                    : 'text-slate-600 hover:text-slate-300 hover:bg-brand-purple/20'
                }
            `}
            title={isProblem ? 'Resolver Problema' : 'Marcar como Problema'}
        >
            {isUpdating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <AlertTriangle className={`w-4 h-4 ${isProblem ? 'fill-current' : ''}`} />
            )}
        </button>
    );
};
