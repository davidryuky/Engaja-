

import React from 'react';
import { X as CloseIcon, Gift } from 'lucide-react';

interface ExitIntentModalProps {
  isOpen: boolean;
  onClose: () => void;
  whatsappNumber: string;
}

export const ExitIntentModal: React.FC<ExitIntentModalProps> = ({ isOpen, onClose, whatsappNumber }) => {
  if (!isOpen) {
    return null;
  }

  const message = "Olá! Vi a oferta de saída no site e gostaria de resgatar meu cupom de 5% de desconto.";
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

  const handleClaimCoupon = () => {
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[70] p-4"
      onClick={onClose}
    >
      <div
        className="bg-brand-dark border border-brand-pink/50 rounded-2xl shadow-2xl shadow-brand-pink/20 p-8 max-w-lg w-full text-center relative animate-fadeInUp"
        onClick={(e) => e.stopPropagation()}
        style={{ animationDuration: '0.5s' }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors z-10"
          aria-label="Fechar modal"
        >
          <CloseIcon className="h-6 w-6" />
        </button>
        
        <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-br from-brand-purple to-brand-pink rounded-full text-white animate-pulse">
                <Gift className="w-12 h-12" />
            </div>
        </div>

        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Espere! <span className="text-brand-pink">Não Vá Ainda...</span>
        </h2>

        <p className="text-slate-200 text-lg mb-8">
          Temos um presente para você: <strong>5% de DESCONTO</strong> no seu primeiro pedido!
        </p>

        <button 
          onClick={handleClaimCoupon}
          className="w-full bg-gradient-to-r from-brand-purple to-brand-pink hover:from-brand-pink hover:to-brand-purple text-white font-bold py-4 px-10 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-brand-purple/40"
        >
          Quero meu cupom de 5%!
        </button>
      </div>
    </div>
  );
};
