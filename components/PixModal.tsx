import React from 'react';
import { X as CloseIcon, Copy } from 'lucide-react';

interface PixModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrCodeImage?: string; // URL for the QR code image
  pixCode?: string; // The "copia e cola" code
}

export const PixModal: React.FC<PixModalProps> = ({ isOpen, onClose, qrCodeImage, pixCode }) => {
  if (!isOpen) {
    return null;
  }

  const handleCopyCode = () => {
    if (pixCode) {
      navigator.clipboard.writeText(pixCode).then(() => {
        alert('Código PIX copiado para a área de transferência!');
      }).catch(err => {
        console.error('Falha ao copiar o código PIX: ', err);
        alert('Não foi possível copiar o código. Tente manualmente.');
      });
    }
  };

  // Placeholder data if none is provided
  const displayQrCode = qrCodeImage || "https://i.postimg.cc/d1Wa5Bwz/placeholder-qr.png";
  const displayPixCode = pixCode || "00020126330014br.gov.bcb.pix0111123456789090204000003039860412.340503***0802BR0908Example1002SP5204000053039865802BR5913John%20Doe6009SAO%20PAULO62070503***6304ABCD";

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
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
          Pague com <span className="text-brand-pink">PIX</span>
        </h2>

        <p className="text-slate-300 mb-6">
          Escaneie o QR Code abaixo com o app do seu banco ou use o "Copia e Cola".
        </p>

        <div className="flex justify-center mb-6">
          <img 
            src={displayQrCode} 
            alt="PIX QR Code" 
            className="w-48 h-48 rounded-lg bg-white p-2"
          />
        </div>

        <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-400 mb-2">PIX Copia e Cola:</label>
            <div className="relative">
                <input 
                    type="text"
                    readOnly
                    value={displayPixCode}
                    className="w-full bg-brand-dark border-2 border-brand-purple/30 rounded-lg p-3 pr-12 text-slate-400 text-xs truncate"
                />
                <button 
                    onClick={handleCopyCode}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-brand-pink hover:text-pink-400"
                    title="Copiar código"
                >
                    <Copy size={20} />
                </button>
            </div>
        </div>

         <p className="text-xs text-slate-500">
          Após o pagamento, seu pedido será processado automaticamente.
        </p>
      </div>
    </div>
  );
};
