
import React from 'react';

interface DashboardPageProps {
  onLogout: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onLogout }) => {
  return (
    <div className="bg-brand-dark min-h-screen flex flex-col items-center justify-center font-sans p-4 text-white">
        <img src="https://i.postimg.cc/jj7rdzv8/logoengaja.png" alt="Engaja+ Logo" className="h-20 mx-auto mb-8" />
        <h1 className="text-4xl font-bold mb-4">Painel de Controle</h1>
        <p className="text-lg text-slate-300 mb-12">Bem-vindo, Administrador!</p>
        <button
            onClick={onLogout}
            className="bg-gradient-to-r from-brand-pink to-brand-purple hover:from-brand-purple hover:to-brand-pink text-white font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105"
        >
            Sair
        </button>
    </div>
  );
};
