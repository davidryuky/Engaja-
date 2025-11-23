
import React, { useState, useEffect } from 'react';
import { Zap, Plus, Send, Loader2, Trash2 } from 'lucide-react';
import { QuickOrderConfigModal } from './QuickOrderConfigModal';

interface QuickOrderConfig {
    id: number;
    name: string;
    service_id: string;
}

interface QuickOrderSectionProps {
    onOrderSuccess?: () => void;
}

export const QuickOrderSection: React.FC<QuickOrderSectionProps> = ({ onOrderSuccess }) => {
    const [configs, setConfigs] = useState<QuickOrderConfig[]>([]);
    const [selectedConfigId, setSelectedConfigId] = useState<string>('');
    const [link, setLink] = useState('');
    const [quantity, setQuantity] = useState('');
    
    const [isLoadingConfigs, setIsLoadingConfigs] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [resultMessage, setResultMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

    // Fetch configs
    const fetchConfigs = async () => {
        setIsLoadingConfigs(true);
        try {
            const res = await fetch('/api/quick_order_configs');
            const data = await res.json();
            if (data.success) {
                setConfigs(data.configs);
            }
        } catch (error) {
            console.error("Erro ao carregar configs de pedido rápido");
        } finally {
            setIsLoadingConfigs(false);
        }
    };

    useEffect(() => {
        fetchConfigs();
    }, []);

    const handleSendOrder = async () => {
        if (!selectedConfigId || !link || !quantity) {
            setResultMessage({ type: 'error', text: 'Preencha todos os campos.' });
            return;
        }

        setIsSending(true);
        setResultMessage(null);

        try {
            const res = await fetch('/api/execute_quick_order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    config_id: selectedConfigId,
                    link,
                    quantity
                })
            });
            const data = await res.json();
            
            if (data.success) {
                setResultMessage({ type: 'success', text: data.message });
                setLink('');
                setQuantity('');
                // Notifica o componente pai para atualizar a tabela
                if (onOrderSuccess) {
                    onOrderSuccess();
                }
            } else {
                setResultMessage({ type: 'error', text: data.message });
            }
        } catch (error) {
            setResultMessage({ type: 'error', text: 'Erro ao conectar com servidor.' });
        } finally {
            setIsSending(false);
        }
    };

    const handleDeleteConfig = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!window.confirm("Remover esta configuração?")) return;

        try {
            await fetch('/api/quick_order_configs', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            fetchConfigs();
            if (String(id) === selectedConfigId) setSelectedConfigId('');
        } catch (error) {
            alert("Erro ao remover.");
        }
    }

    return (
        <div className="bg-brand-dark-200 border border-brand-purple/30 rounded-lg p-5 mb-8 shadow-lg relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-brand-pink/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg text-white shadow-lg shadow-orange-500/20">
                        <Zap className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">Pedido Rápido (API)</h2>
                        <p className="text-xs text-slate-400">Conecte-se a fornecedores externos e envie pedidos instantaneamente.</p>
                    </div>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 text-xs font-bold bg-brand-dark hover:bg-brand-purple/20 border border-brand-purple/30 text-brand-pink px-3 py-2 rounded-lg transition-all"
                >
                    <Plus className="w-4 h-4" />
                    Nova Configuração
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end relative z-10">
                {/* 1. Seleção de Serviço */}
                <div className="md:col-span-1">
                    <label className="block text-slate-400 text-xs font-bold mb-2 ml-1">SERVIÇO CONFIGURADO</label>
                    <div className="relative">
                        <select 
                            value={selectedConfigId}
                            onChange={(e) => setSelectedConfigId(e.target.value)}
                            className="w-full bg-brand-dark border-2 border-brand-purple/30 rounded-lg p-3 text-white focus:border-brand-pink outline-none appearance-none transition-colors"
                        >
                            <option value="">Selecione um serviço...</option>
                            {configs.map(cfg => (
                                <option key={cfg.id} value={cfg.id}>{cfg.name} (ID: {cfg.service_id})</option>
                            ))}
                        </select>
                        {/* Custom Dropdown Arrow or Logic to delete could go here but select is limited */}
                    </div>
                </div>

                {/* 2. Link */}
                <div className="md:col-span-1">
                    <label className="block text-slate-400 text-xs font-bold mb-2 ml-1">LINK ALVO</label>
                    <input 
                        type="text" 
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-brand-dark border-2 border-brand-purple/30 rounded-lg p-3 text-white focus:border-brand-pink outline-none transition-colors"
                    />
                </div>

                {/* 3. Quantidade */}
                <div className="md:col-span-1">
                    <label className="block text-slate-400 text-xs font-bold mb-2 ml-1">QUANTIDADE</label>
                    <input 
                        type="number" 
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="Ex: 1000"
                        className="w-full bg-brand-dark border-2 border-brand-purple/30 rounded-lg p-3 text-white focus:border-brand-pink outline-none transition-colors"
                    />
                </div>

                {/* 4. Botão Enviar */}
                <div className="md:col-span-1">
                    <button 
                        onClick={handleSendOrder}
                        disabled={isSending || !selectedConfigId}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:to-green-500 text-white font-bold py-3.5 rounded-lg shadow-lg shadow-green-600/20 flex items-center justify-center gap-2 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        Realizar Pedido
                    </button>
                </div>
            </div>

            {/* Listagem Rápida para Exclusão (opcional, visualmente útil) */}
            {selectedConfigId && (
                <div className="mt-2 flex justify-end">
                    <button 
                        onClick={(e) => handleDeleteConfig(Number(selectedConfigId), e)}
                        className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1 opacity-60 hover:opacity-100"
                    >
                        <Trash2 className="w-3 h-3" /> Remover esta configuração
                    </button>
                </div>
            )}

            {/* Mensagens de Feedback */}
            {resultMessage && (
                <div className={`mt-4 p-3 rounded-lg text-sm font-medium border ${resultMessage.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'} animate-fadeInUp`}>
                    {resultMessage.text}
                </div>
            )}

            <QuickOrderConfigModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSuccess={() => {
                    fetchConfigs();
                    setResultMessage({ type: 'success', text: 'Configuração salva com sucesso!' });
                }}
            />
        </div>
    );
};
