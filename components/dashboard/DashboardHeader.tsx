
import React from 'react';
import { LogOut, Settings } from 'lucide-react';

interface DashboardHeaderProps {
    onOpenSettings: () => void;
    onLogout: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onOpenSettings, onLogout }) => {
    return (
        <header className="bg-brand-dark-200 border-b border-brand-purple/30 p-4 flex justify-between items-center sticky top-0 z-30 shadow-md">
            <div className="flex items-center gap-4">
                <span className="text-2xl font-extrabold text-white tracking-tight notranslate">
                    Arvex<span className="text-brand-pink font-light ml-1">Social</span>
                </span>
                <div className="h-6 w-px bg-slate-600 mx-2 hidden sm:block"></div>
                <h1 className="text-lg font-medium text-slate-300 hidden sm:block">Painel Administrativo</h1>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={onOpenSettings}
                    className="flex items-center gap-2 bg-brand-dark hover:bg-brand-purple/30 border border-brand-purple/50 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300"
                >
                    <Settings className="w-5 h-5" />
                    <span className="hidden sm:inline">Configurações</span>
                </button>
                <button
                    onClick={onLogout}
                    className="flex items-center gap-2 bg-brand-dark hover:bg-red-500/20 border border-brand-purple/50 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="hidden sm:inline">Sair</span>
                </button>
            </div>
        </header>
    );
};
