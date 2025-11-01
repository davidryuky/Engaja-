import React, { useState, useEffect } from 'react';
import { X as CloseIcon, Save, Loader2 } from 'lucide-react';
import { Order } from './DashboardPage'; // Import the Order type

interface OrderNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onSave: (notes: string) => Promise<void>; // Make onSave async
}

export const OrderNotesModal: React.FC<OrderNotesModalProps> = ({ isOpen, onClose, order, onSave }) => {
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNotes(order.notes || '');
    }
  }, [isOpen, order.notes]);

  const handleSaveClick = async () => {
    setIsSaving(true);
    await onSave(notes);
    setIsSaving(false);
  };
  
  if (!isOpen) {
    return null;
  }

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
          disabled={isSaving}
        >
          <CloseIcon className="h-6 w-6" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-2">
          Notas do Pedido
        </h2>
        <p className="text-sm text-brand-pink font-mono mb-6">{order.public_id}</p>

        <div className="space-y-4 text-left">
            <textarea 
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Adicione observações, informações de pagamento, contato do cliente, etc."
                rows={8}
                className="w-full bg-brand-dark border-2 border-brand-purple/30 rounded-lg p-3 focus:outline-none focus:border-brand-pink transition-colors duration-300"
                disabled={isSaving}
            />
             <button 
                onClick={handleSaveClick}
                disabled={isSaving}
                className="w-full mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-brand-purple to-brand-pink hover:from-brand-pink hover:to-brand-purple text-white font-bold py-3 px-4 rounded-full transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-wait"
            >
                {isSaving ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Salvando...
                    </>
                ) : (
                    <>
                        <Save className="w-5 h-5" />
                        Salvar Notas
                    </>
                )}
            </button>
        </div>
      </div>
    </div>
  );
};
