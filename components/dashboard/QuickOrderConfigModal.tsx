
import React, { useState } from 'react';
import { X as CloseIcon, Loader2, Save, Server } from 'lucide-react';

interface QuickOrderConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const QuickOrderConfigModal: React.FC<QuickOrderConfigModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [apiUrl, setApiUrl] = useState('https://smmflare.com/api/v2'); // Default
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !apiKey || !serviceId) {
        setError('Preencha Nome, Chave API e ID do Serviço.');
        return;
    }

    setIsSaving(true);
    try {
        const response = await fetch('/api/quick_order_configs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, api_key: apiKey, service_id: serviceId, api_url: apiUrl })
        });
        
        const data = await response.json();
        if (data.success) {
            onSuccess();
            onClose();
            // Reset form
            setName('');
            setApiKey('');
            setServiceId('');
        } else {
            setError(data.message || 'Erro ao salvar.');
        }
    } catch (err) {
        setError('Erro de conexão.');
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-brand-dark-200 border border-brand-purple/50 rounded-2xl shadow-2xl p-6 max-w-lg w-full relative animate-fadeInUp" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white"><CloseIcon className="h-6 w-6" /></button>
        
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Server className="text-brand-pink" />
            Nova Configuração de API
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-slate-300 text-sm font-bold mb-1">Nome de Identificação</label>
                <input 
                    type="text" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    placeholder="Ex: Seguidores Globais SmmFlare" 
                    className="w-full bg-brand-dark border border-brand-purple/30 rounded-lg p-2.5 text-white focus:border-brand-pink outline-none"
                />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-slate-300 text-sm font-bold mb-1">ID do Serviço</label>
                    <input 
                        type="text" 
                        value={serviceId} 
                        onChange={e => setServiceId(e.target.value)} 
                        placeholder="Ex: 543" 
                        className="w-full bg-brand-dark border border-brand-purple/30 rounded-lg p-2.5 text-white focus:border-brand-pink outline-none"
                    />
                </div>
                <div>
                     <label className="block text-slate-300 text-sm font-bold mb-1">URL da API</label>
                    <input 
                        type="text" 
                        value={apiUrl} 
                        onChange={e => setApiUrl(e.target.value)} 
                        className="w-full bg-brand-dark border border-brand-purple/30 rounded-lg p-2.5 text-slate-400 focus:border-brand-pink outline-none text-xs"
                    />
                </div>
            </div>

            <div>
                <label className="block text-slate-300 text-sm font-bold mb-1">Chave API (Key)</label>
                <input 
                    type="text" 
                    value={apiKey} 
                    onChange={e => setApiKey(e.target.value)} 
                    placeholder="Cole sua chave aqui" 
                    className="w-full bg-brand-dark border border-brand-purple/30 rounded-lg p-2.5 text-white focus:border-brand-pink outline-none font-mono text-xs"
                />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button 
                type="submit" 
                disabled={isSaving}
                className="w-full bg-gradient-to-r from-brand-purple to-brand-pink hover:to-brand-purple text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 mt-2"
            >
                {isSaving ? <Loader2 className="animate-spin" /> : <Save className="w-4 h-4" />}
                Salvar Configuração
            </button>
        </form>
      </div>
    </div>
  );
};
