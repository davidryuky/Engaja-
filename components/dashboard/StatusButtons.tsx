
import React, { useState, useEffect } from 'react';
import { Loader2, AlertOctagon, CheckCircle } from 'lucide-react';
import { StatusType } from './DashboardTypes';

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

    return (
        <button
            onClick={handleClick}
            disabled={isUpdating}
            // @ts-ignore
            className={`w-full relative rounded-md p-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-pink transition-colors duration-200 disabled:cursor-wait ${config.colors[status] || 'bg-slate-700'}`}
        >
            {status}
            {isUpdating && <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />}
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
            className={`w-full relative flex items-center justify-center rounded-md p-2 focus:outline-none transition-colors duration-200 disabled:cursor-wait ${
                isProblem
                    ? 'bg-red-600 text-white hover:bg-red-700 shadow-sm shadow-red-500/20'
                    : 'bg-brand-dark hover:bg-brand-dark-200 text-green-400 border border-green-500/30'
                }`}
            title={isProblem ? 'Resolver Problema' : 'Marcar como Problema'}
        >
            {isUpdating ? (
                <Loader2 className="h-5 w-5 animate-spin" />
            ) : isProblem ? (
                <>
                    <AlertOctagon className="h-5 w-5 mr-1" />
                    <span className="text-xs font-bold">Problema</span>
                </>
            ) : (
                <CheckCircle className="h-5 w-5" />
            )}
        </button>
    );
};
