
import React, { useState, useEffect } from 'react';
import { X as CloseIcon, Loader2, Save } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialValue: string;
  onSaveSuccess: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, initialValue, onSaveSuccess }) => {
  const [whatsappNumber, setWhatsappNumber] = useState(initialValue);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Reset state when modal is opened with a new value
    setWhatsappNumber(initialValue);
    setError('');
  }, [initialValue, isOpen]);
  
  if (!isOpen) {
    return null;
  }

  const handleSave = async () => {
    if (!whatsappNumber.trim()) {
      setError('O número de WhatsApp não pode ficar em branco.');
      return;
    }
    setError('');
    setIsSaving(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ number: whatsappNumber }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Falha ao salvar as configurações.');
      }
      onSaveSuccess(); // Notify parent to refetch data
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleClose = () => {
    if (isSaving) return;
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <div
        className="bg-brand-dark-200 border border-brand-purple/50 rounded-2xl shadow-2xl shadow-brand-purple/20 p-8 max-w-lg w-full relative animate-fadeInUp"
        onClick={(e) => e.stopPropagation()}
        style={{ animationDuration: '0.5s' }}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors z-10"
          aria-label="Fechar modal"
        >
          <CloseIcon className="h-6 w-6" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          Configurações do Site
        </h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="whatsappNumber" className="block text-slate-300 text-sm font-bold mb-2">
              Número de WhatsApp
            </label>
            <input
              id="whatsappNumber"
              type="text"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="Ex: 5511999998888"
              className="w-full bg-brand-dark border-2 border-brand-purple/30 rounded-lg p-3 text-white focus:outline-none focus:border-brand-pink transition-colors duration-300"
              disabled={isSaving}
            />
            <p className="text-xs text-slate-400 mt-2">
              Este número será usado em todos os botões de contato do site. Inclua o código do país (ex: 55 para o Brasil).
            </p>
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <div className="pt-4">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-purple to-brand-pink hover:from-brand-pink hover:to-brand-purple text-white font-bold py-3 px-4 rounded-full transition-all duration-300 transform hover:scale-105 disabled:opacity-70 disabled:cursor-wait"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
