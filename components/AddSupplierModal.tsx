
import React, { useState } from 'react';
import { X as CloseIcon, Loader2, Save } from 'lucide-react';
import { Supplier } from './DashboardPage';

interface AddSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newSupplier: Supplier) => void;
}

export const AddSupplierModal: React.FC<AddSupplierModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [link, setLink] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) {
    return null;
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !link.trim()) {
      setError('Por favor, preencha o nome e o link do fornecedor.');
      return;
    }
    
    setIsSaving(true);
    try {
      const response = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, link }),
      });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Falha ao adicionar fornecedor.');
      }
      onAdd(data.supplier);
      setName('');
      setLink('');
    } catch (err: any) {
      setError(err.message);
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
          Adicionar Fornecedor
        </h2>

        <form onSubmit={handleSave}>
            <div className="space-y-4 text-left">
                <div>
                    <label htmlFor="supplierName" className="block text-slate-300 text-sm font-bold mb-2">
                        Nome do Fornecedor
                    </label>
                    <input
                        id="supplierName"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Fornecedor XYZ"
                        className="w-full bg-brand-dark border-2 border-brand-purple/30 rounded-lg p-3 text-white focus:outline-none focus:border-brand-pink transition-colors duration-300"
                    />
                </div>
                 <div>
                    <label htmlFor="supplierLink" className="block text-slate-300 text-sm font-bold mb-2">
                        Link de Acesso
                    </label>
                    <input
                        id="supplierLink"
                        type="url"
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        placeholder="https://fornecedor.com"
                        className="w-full bg-brand-dark border-2 border-brand-purple/30 rounded-lg p-3 text-white focus:outline-none focus:border-brand-pink transition-colors duration-300"
                    />
                </div>

                {error && <p className="text-red-400 text-sm">{error}</p>}
                
                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-brand-purple to-brand-pink hover:from-brand-pink hover:to-brand-purple text-white font-bold py-2 px-6 rounded-full transition-all duration-300 transform hover:scale-105 disabled:opacity-70 disabled:cursor-wait"
                    >
                        {isSaving ? <><Loader2 className="w-5 h-5 animate-spin" /> Salvando...</> : <><Save className="w-5 h-5" /> Salvar</>}
                    </button>
                </div>
            </div>
        </form>
      </div>
    </div>
  );
};
