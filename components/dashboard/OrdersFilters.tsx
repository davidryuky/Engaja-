
import React from 'react';
import { Filter, Search } from 'lucide-react';

interface OrdersFiltersProps {
    filters: {
        payment_status: string;
        progress_status: string;
        completion_status: string;
        problem_status: string;
    };
    onFilterChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
}

export const OrdersFilters: React.FC<OrdersFiltersProps> = ({ filters, onFilterChange, searchQuery, setSearchQuery }) => {
    return (
        <div className="bg-brand-dark-200 border border-brand-purple/30 rounded-lg p-4 mb-6 flex flex-col lg:flex-row justify-between gap-4 shadow-sm">
            {/* FILTERS SECTION */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center w-full lg:w-auto">
                <div className="flex items-center gap-2 text-slate-300 flex-shrink-0">
                    <Filter className="w-5 h-5" />
                    <span className="font-semibold">Filtros:</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full md:w-auto">
                    <div className="min-w-[140px]">
                        <select name="payment_status" value={filters.payment_status} onChange={onFilterChange} className="bg-brand-dark border border-brand-purple/50 rounded-md px-3 py-2 text-sm w-full focus:ring-1 focus:ring-brand-pink outline-none transition-all">
                            <option value="all">Pagamento: Todos</option>
                            <option value="Aguardando Pagamento">Aguardando</option>
                            <option value="Pago">Pago</option>
                        </select>
                    </div>
                    <div className="min-w-[140px]">
                        <select name="progress_status" value={filters.progress_status} onChange={onFilterChange} className="bg-brand-dark border border-brand-purple/50 rounded-md px-3 py-2 text-sm w-full focus:ring-1 focus:ring-brand-pink outline-none transition-all">
                            <option value="all">Progresso: Todos</option>
                            <option value="Parado">Parado</option>
                            <option value="Iniciado">Iniciado</option>
                        </select>
                    </div>
                    <div className="min-w-[140px]">
                        <select name="completion_status" value={filters.completion_status} onChange={onFilterChange} className="bg-brand-dark border border-brand-purple/50 rounded-md px-3 py-2 text-sm w-full focus:ring-1 focus:ring-brand-pink outline-none transition-all">
                            <option value="all">Finalização: Todos</option>
                            <option value="Incompleto">Incompleto</option>
                            <option value="Concluido">Concluído</option>
                        </select>
                    </div>
                    <div className="min-w-[140px]">
                        <select name="problem_status" value={filters.problem_status} onChange={onFilterChange} className="bg-brand-dark border border-brand-purple/50 rounded-md px-3 py-2 text-sm w-full focus:ring-1 focus:ring-brand-pink outline-none transition-all">
                            <option value="all">Problemas: Todos</option>
                            <option value="Normal">Normal</option>
                            <option value="Problema">Com Problema</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* SEARCH SECTION */}
            <div className="w-full lg:w-auto relative">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-slate-400 group-focus-within:text-brand-pink transition-colors duration-300" />
                    </div>
                    <input
                        type="text"
                        className="bg-brand-dark border border-brand-purple/50 rounded-md pl-10 pr-3 py-2 text-sm w-full lg:w-64 focus:outline-none focus:border-brand-pink focus:ring-1 focus:ring-brand-pink transition-all duration-300 placeholder:text-slate-500"
                        placeholder="Buscar por ID ou Link..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
};
