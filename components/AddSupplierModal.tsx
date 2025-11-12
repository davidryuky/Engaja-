import React, { useState } from 'react';
import { X as CloseIcon, Loader2, PlusCircle } from 'lucide-react';

interface AddSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSupplier: (name: string, link: string) => Promise<void>;
}

export const AddSupplierModal: React.FC<AddSupplierModalProps> = ({ isOpen, onClose, onAddSupplier }) => {
  const [name, setName] = useState('');
  const [link, setLink] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !link.trim()) {
        setError('Nome e link são obrigatórios.');
        return;
    }
    setError('');
    setIsAdding(true);
    try {
        await onAddSupplier(name, link);
        onClose(); // Close modal on success
    } catch (err: any) {
        setError(err.message || 'Ocorreu um erro ao adicionar o fornecedor.');
    } finally {
        setIsAdding(false);
    }
  };
  
  const handleClose = () => {
      if (isAdding) return;
      onClose();
  }

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
          Adicionar Novo Fornecedor
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="supplierName" className="block text-slate-300 text-sm font-bold mb-2">Nome do Fornecedor</label>
                <input
                    id="supplierName"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Fornecedor X"
                    className="w-full bg-brand-dark border-2 border-brand-purple/30 rounded-lg p-3 text-white focus:outline-none focus:border-brand-pink transition-colors duration-300"
                    disabled={isAdding}
                />
            </div>
            <div>
                <label htmlFor="supplierLink" className="block text-slate-300 text-sm font-bold mb-2">Link</label>
                <input
                    id="supplierLink"
                    type="url"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="https://exemplo.com"
                    className="w-full bg-brand-dark border-2 border-brand-purple/30 rounded-lg p-3 text-white focus:outline-none focus:border-brand-pink transition-colors duration-300"
                    disabled={isAdding}
                />
            </div>

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

            <div className="pt-4">
                 <button
                    type="submit"
                    disabled={isAdding}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-purple to-brand-pink hover:from-brand-pink hover:to-brand-purple text-white font-bold py-3 px-4 rounded-full transition-all duration-300 transform hover:scale-105 disabled:opacity-70 disabled:cursor-wait"
                >
                    {isAdding ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlusCircle className="w-5 h-5" />}
                    {isAdding ? 'Adicionando...' : 'Adicionar Fornecedor'}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};