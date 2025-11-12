
import React, { useState } from 'react';
import { Instagram, X as CloseIcon } from 'lucide-react';

// --- ÍCONES CUSTOMIZADOS ---
const TiktokIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M9 12a4 4 0 1 0 4 4v-12a5 5 0 0 0 5 5" /></svg>
);

const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
);


interface FreeTrialModalProps {
  isOpen: boolean;
  onClose: () => void;
  whatsappNumber: string;
}

export const FreeTrialModal: React.FC<FreeTrialModalProps> = ({ isOpen, onClose, whatsappNumber }) => {
  const [selectedSocial, setSelectedSocial] = useState<string | null>(null);

  if (!isOpen) {
    return null;
  }

  const handleGetTrial = () => {
    if (!selectedSocial) return;
    const message = `Olá! Gostaria de receber o teste de 50 seguidores para ${selectedSocial}.`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    onClose();
  };

  const socialOptions = [
    { name: 'Instagram', icon: <Instagram className="w-10 h-10" /> },
    { name: 'TikTok', icon: <TiktokIcon className="w-10 h-10" strokeWidth={1.5}/> },
    { name: 'Twitter', icon: <XIcon className="w-8 h-8" /> }
  ];

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-brand-dark-200 border border-brand-purple/50 rounded-2xl shadow-2xl shadow-brand-purple/20 p-8 max-w-lg w-full text-center relative animate-fadeInUp"
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

        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
          Experimente a Magia <span className="text-brand-pink">Grátis</span>!
        </h2>

        <p className="text-slate-300 mb-8">
          Acreditamos que você tem o direito de ver com os próprios olhos a magia dos números acontecer antes de investir. Por isso, vamos lhe dar <strong>50 seguidores</strong> para a rede social que escolher.
        </p>

        <div className="mb-8">
            <h3 className="text-lg font-semibold text-slate-200 mb-4">Basta selecionar abaixo:</h3>
            <div className="flex justify-center items-center gap-6">
                {socialOptions.map(social => (
                     <button
                        key={social.name}
                        onClick={() => setSelectedSocial(social.name)}
                        className={`p-4 rounded-full border-2 transition-all duration-300 transform-gpu flex items-center justify-center ${selectedSocial === social.name ? 'bg-gradient-to-br from-brand-purple to-brand-pink border-brand-pink scale-110 shadow-lg shadow-brand-purple/30' : 'bg-brand-dark border-brand-purple/30 hover:border-brand-pink hover:scale-105'}`}
                        aria-label={`Selecionar ${social.name}`}
                        style={{ width: '80px', height: '80px' }}
                    >
                        <div className={selectedSocial === social.name ? 'text-white' : 'text-slate-300'}>
                          {social.icon}
                        </div>
                    </button>
                ))}
            </div>
        </div>

        <button 
          onClick={handleGetTrial}
          disabled={!selectedSocial}
          className="w-full bg-gradient-to-r from-brand-purple to-brand-pink hover:from-brand-pink hover:to-brand-purple text-white font-bold py-4 px-10 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-brand-purple/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
        >
          {selectedSocial ? `Obter 50 Seguidores para ${selectedSocial === 'Twitter' ? 'X' : selectedSocial}` : 'Selecione uma Rede Social'}
        </button>
      </div>
    </div>
  );
};
