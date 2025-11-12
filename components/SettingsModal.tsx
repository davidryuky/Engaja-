
import React, { useState, useEffect } from 'react';
import { X as CloseIcon, Loader2, Save } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialWhatsAppNumber: string;
  onSave: (newNumber: string) => Promise<void>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, initialWhatsAppNumber, onSave }) => {
  const [whatsAppNumber, setWhatsAppNumber] = useState(initialWhatsAppNumber);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setWhatsAppNumber(initialWhatsAppNumber);
  }, [initialWhatsAppNumber, isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSaveClick = async () => {
      if (!whatsAppNumber.trim()) {
          alert('O número do WhatsApp não pode estar vazio.');
          return;
      }
      setIsSaving(true);
      try {
          await onSave(whatsAppNumber);
      } finally {
          setIsSaving(false);
      }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-brand-dark-200 border border-brand-purple/50 rounded-2xl shadow-2xl shadow-brand-purple/20 p-8 max-w-lg w-full relative animate-fadeInUp"
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

        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          Configurações do Site
        </h2>

        <div className="space-y-4 text-left">
             <div>
                <label htmlFor="whatsappNumber" className="block text-slate-300 text-sm font-bold mb-2">
                    Número do WhatsApp
                </label>
                <input
                    id="whatsappNumber"
                    type="text"
                    value={whatsAppNumber}
                    onChange={(e) => setWhatsAppNumber(e.target.value.replace(/\D/g, ''))} // Allow only numbers
                    placeholder="Ex: 5511999998888"
                    className="w-full bg-brand-dark border-2 border-brand-purple/30 rounded-lg p-3 text-white focus:outline-none focus:border-brand-pink transition-colors duration-300"
                />
                <p className="text-xs text-slate-400 mt-2">
                    Use o formato internacional sem símbolos (código do país + DDD + número). Ex: 5511999998888
                </p>
            </div>
            <div className="flex justify-end pt-4">
                <button
                    onClick={handleSaveClick}
                    disabled={isSaving}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-brand-purple to-brand-pink hover:from-brand-pink hover:to-brand-purple text-white font-bold py-2 px-6 rounded-full transition-all duration-300 transform hover:scale-105 disabled:opacity-70 disabled:cursor-wait"
                >
                    {isSaving ? <><Loader2 className="w-5 h-5 animate-spin" /> Salvando...</> : <><Save className="w-5 h-5" /> Salvar</>}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
