
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-dark-200 relative">
       <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-purple/50 to-transparent"></div>
      <div className="container mx-auto px-6 py-8 text-center text-slate-400 flex flex-col items-center">
        <span className="text-2xl font-extrabold text-white tracking-tight mb-4">
            Arvex<span className="text-brand-pink font-light ml-1">Social</span>
        </span>
        <p>&copy; {new Date().getFullYear()} Arvex Social. Todos os direitos reservados.</p>
        <p className="text-sm mt-2">Construindo sua presença online, um seguidor de cada vez.</p>
      </div>
    </footer>
  );
};