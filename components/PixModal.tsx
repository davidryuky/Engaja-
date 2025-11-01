import React from 'react';

interface PixModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PixModal: React.FC<PixModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-brand-dark-200 border border-brand-purple/50 rounded-2xl p-8 max-w-md w-full text-center relative"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-white mb-4">Modal Pix</h2>
        <p className="text-slate-300">Conteúdo do modal Pix aqui.</p>
        <button onClick={onClose} className="mt-6 bg-brand-pink text-white py-2 px-4 rounded">
          Fechar
        </button>
      </div>
    </div>
  );
};
