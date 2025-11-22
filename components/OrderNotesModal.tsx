
import React, { useState } from 'react';
import { X as CloseIcon, Loader2 } from 'lucide-react';
import { Order } from './dashboard/DashboardTypes';

interface OrderNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onSave: (orderId: number, notes: string) => Promise<void>;
}

export const OrderNotesModal: React.FC<OrderNotesModalProps> = ({ isOpen, onClose, order, onSave }) => {
  const [notes, setNotes] = useState(order.notes || '');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) {
    return null;
  }

  const handleSaveClick = async () => {
      setIsSaving(true);
      try {
          await onSave(order.id, notes);
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
        className="bg-brand-dark-200 border border-brand-purple/50 rounded-2xl shadow-2xl shadow-brand-purple/20 p-8 max-w-2xl w-full relative animate-fadeInUp"
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

        <h2 className="text-2xl font-bold text-white mb-2">
          Anotações do Pedido
        </h2>
        <p className="text-sm text-brand-pink font-mono mb-6">{order.public_id}</p>

        <div className="space-y-4 text-left">
            <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Adicione anotações sobre este pedido aqui..."
                rows={8}
                className="w-full bg-brand-dark border-2 border-brand-purple/30 rounded-lg p-3 text-white focus:outline-none focus:border-brand-pink transition-colors duration-300"
            />
            <div className="flex justify-end">
                <button
                    onClick={handleSaveClick}
                    disabled={isSaving}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-brand-purple to-brand-pink hover:from-brand-pink hover:to-brand-purple text-white font-bold py-2 px-6 rounded-full transition-all duration-300 transform hover:scale-105 disabled:opacity-70 disabled:cursor-wait"
                >
                    {isSaving ? <><Loader2 className="w-5 h-5 animate-spin" /> Salvando...</> : 'Salvar Anotações'}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
