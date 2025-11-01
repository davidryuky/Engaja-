import React from 'react';
import { X as CloseIcon, Copy } from 'lucide-react';

interface PixModalProps {
  isOpen: boolean;
  onClose: () => void;
  // pixKey?: string;
  // qrCodeUrl?: string;
}

export const PixModal: React.FC<PixModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  const pixKey = "chave-pix-aleatoria@email.com"; // Placeholder key
  const qrCodeUrl = "https://i.postimg.cc/d1AgC0yY/qr-code-placeholder.png"; // Placeholder QR code image

  const handleCopy = () => {
    navigator.clipboard.writeText(pixKey).then(() => {
      alert('Chave PIX copiada para a área de transferência!');
    }, () => {
      alert('Falha ao copiar a chave PIX.');
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
        <p className="text-slate-300 mb-6 text-sm">
          Aponte a câmera do seu celular para o QR Code ou use a chave "copia e cola".
        </p>
        
        <div className="flex justify-center mb-6">
            <div className="p-4 bg-white rounded-lg">
                <img src={qrCodeUrl} alt="QR Code PIX" className="w-48 h-48" />
            </div>
        </div>
        
        <div className="mb-8">
            <label className="text-xs text-slate-400">Chave PIX (Copia e Cola)</label>
            <div className="mt-2 flex items-center bg-brand-dark border-2 border-brand-purple/30 rounded-lg p-3">
                <input
                    type="text"
                    value={pixKey}
                    readOnly
                    className="flex-grow bg-transparent text-white text-sm outline-none font-mono"
                />
                <button onClick={handleCopy} className="ml-2 text-slate-400 hover:text-brand-pink" title="Copiar chave">
                    <Copy className="w-5 h-5" />
                </button>
            </div>
        </div>
        
        <p className="text-xs text-slate-500">
          Após o pagamento, o status do seu pedido será atualizado automaticamente.
        </p>
      </div>
    </div>
  );
};
