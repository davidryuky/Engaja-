import React, { useState } from 'react';
import { X as CloseIcon, Copy, QrCode } from 'lucide-react';

interface PixModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PixModal: React.FC<PixModalProps> = ({ isOpen, onClose }) => {
  const [isCopied, setIsCopied] = useState(false);
  const pixKey = "00020126360014br.gov.bcb.pix0114+5511999999999520400005303986540510.005802BR5913NOME DO LOJISTA6009SAO PAULO62070503***6304E2A3"; // Example PIX key

  if (!isOpen) {
    return null;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(pixKey).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    }).catch(err => {
      console.error("Failed to copy PIX key:", err);
      alert("Não foi possível copiar a chave PIX.");
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[70] p-4"
      onClick={onClose}
    >
      <div
        className="bg-brand-dark-200 border border-brand-purple/50 rounded-2xl shadow-2xl shadow-brand-purple/20 p-8 max-w-sm w-full text-center relative animate-fadeInUp"
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

        <h2 className="text-2xl font-bold text-white mb-4">
          Pagamento via <span className="text-brand-pink">PIX</span>
        </h2>

        <p className="text-slate-300 mb-6">
          Escaneie o QR Code ou use o Pix Copia e Cola para finalizar seu pagamento.
        </p>
        
        <div className="bg-white p-4 rounded-lg inline-block mb-6">
            {/* Placeholder for QR Code */}
            <div className="w-48 h-48 bg-gray-200 flex items-center justify-center text-gray-500">
                <QrCode className="w-24 h-24" />
            </div>
        </div>

        <div className="relative">
          <input
            type="text"
            value={pixKey}
            readOnly
            className="w-full bg-brand-dark border-2 border-brand-purple/30 rounded-lg p-3 pr-28 text-slate-400 text-sm truncate"
          />
          <button
            onClick={handleCopy}
            className="absolute top-1/2 right-2 -translate-y-1/2 bg-brand-purple hover:bg-opacity-80 text-white font-semibold py-1.5 px-3 rounded-md text-xs transition-all duration-300 flex items-center gap-1.5"
          >
            <Copy className="w-4 h-4" />
            {isCopied ? 'Copiado!' : 'Copiar'}
          </button>
        </div>

      </div>
    </div>
  );
};
