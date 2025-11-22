
import React, { useState } from 'react';
import { X as CloseIcon, Share2, Loader2, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import { Order } from './dashboard/DashboardTypes';

interface ShareOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
}

export const ShareOrderModal: React.FC<ShareOrderModalProps> = ({ isOpen, onClose, order }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleShare = async () => {
    setIsGenerating(true);
    const element = document.getElementById('order-receipt');
    
    if (!element) {
        setIsGenerating(false);
        return;
    }

    try {
      // Configuração para alta qualidade
      const canvas = await html2canvas(element, {
        backgroundColor: '#1e1433', // brand-dark-200
        scale: 2, // Retina quality
        logging: false,
        useCORS: true // Permite carregar a logo se tiver headers corretos
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;

        const file = new File([blob], `pedido-${order.public_id}.png`, { type: 'image/png' });

        // Tenta usar a API de compartilhamento nativa (Mobile)
        if (navigator.share && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({
                    files: [file],
                    title: `Pedido #${order.public_id}`,
                    text: 'Aqui está o comprovante do seu pedido na Engaja+.'
                });
            } catch (error) {
                console.log('Erro ao compartilhar ou cancelado pelo usuário', error);
            }
        } else {
            // Fallback para Desktop: Download automático
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `pedido-${order.public_id}.png`;
            link.click();
            alert('Imagem gerada! Baixando para o seu dispositivo para você enviar.');
        }
        setIsGenerating(false);
      }, 'image/png');

    } catch (error) {
      console.error('Failed to generate image:', error);
      alert('Erro ao gerar imagem. Tente novamente.');
      setIsGenerating(false);
    }
  };

  // Função auxiliar para cores do status
  const getStatusColor = (status: string, type: 'progress' | 'completion' | 'problem') => {
      if (type === 'problem') return status === 'Problema' ? 'text-red-500' : 'text-emerald-400';
      if (type === 'completion') return status === 'Concluido' ? 'text-emerald-400' : 'text-yellow-400';
      return 'text-white';
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button Outside */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-slate-400 hover:text-white transition-colors"
          aria-label="Fechar modal"
        >
          <CloseIcon className="h-8 w-8" />
        </button>

        {/* --- RECEIPT AREA (This is what gets captured) --- */}
        <div 
            id="order-receipt" 
            className="bg-brand-dark-200 border-2 border-brand-purple/50 rounded-2xl shadow-2xl p-8 w-full max-w-md text-center relative overflow-hidden"
        >
            {/* Decorative Background Elements for the Image */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-purple to-brand-pink"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-brand-purple/20 rounded-full blur-3xl"></div>
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-brand-pink/20 rounded-full blur-3xl"></div>

            {/* Logo */}
            <img src="https://i.postimg.cc/jj7rdzv8/logoengaja.png" alt="Engaja+" className="h-16 mx-auto mb-2 relative z-10" />
            <p className="text-slate-400 text-xs uppercase tracking-widest mb-6 relative z-10">Comprovante de Pedido</p>

            {/* Main Info */}
            <div className="space-y-4 relative z-10">
                <div className="bg-brand-dark/50 p-4 rounded-xl border border-brand-purple/20">
                    <p className="text-slate-400 text-xs mb-1">ID do Pedido</p>
                    <p className="text-2xl font-mono font-bold text-white tracking-wider">#{order.public_id}</p>
                </div>

                <div className="text-left space-y-3 px-2">
                    <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-slate-400 text-sm">Serviço</span>
                        <span className="text-white text-sm font-medium">{order.service}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-slate-400 text-sm">Quantidade</span>
                        <span className="text-white text-sm font-medium">{order.quantity ? order.quantity.toLocaleString('pt-BR') : '-'}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-slate-400 text-sm">Data</span>
                        <span className="text-white text-sm font-medium">{new Date(order.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                     <div className="flex flex-col border-b border-white/5 pb-2">
                        <span className="text-slate-400 text-sm mb-1">Link</span>
                        <span className="text-cyan-400 text-xs font-mono break-all">{order.link}</span>
                    </div>
                </div>

                {/* Statuses Grid */}
                <div className="grid grid-cols-2 gap-3 mt-6">
                    <div className="bg-brand-dark p-3 rounded-lg border border-brand-purple/20">
                        <p className="text-xs text-slate-500 mb-1">Progresso</p>
                        <p className="text-sm font-bold text-white">{order.progress_status}</p>
                    </div>
                    <div className="bg-brand-dark p-3 rounded-lg border border-brand-purple/20">
                         <p className="text-xs text-slate-500 mb-1">Status Final</p>
                         <p className={`text-sm font-bold ${getStatusColor(order.completion_status, 'completion')}`}>
                             {order.completion_status === 'Concluido' ? 'CONCLUÍDO' : order.completion_status}
                         </p>
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-4 border-t border-white/10">
                <p className="text-xs text-slate-500">Obrigado pela preferência!</p>
                <p className="text-xs text-brand-pink font-semibold">engajamais.com</p>
            </div>
        </div>

        {/* Action Button */}
        <button
            onClick={handleShare}
            disabled={isGenerating}
            className="mt-6 w-full max-w-md bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-500 text-white font-bold py-3 px-6 rounded-full shadow-lg shadow-green-500/30 flex items-center justify-center gap-2 transition-all transform hover:scale-105 disabled:opacity-70 disabled:scale-100"
        >
            {isGenerating ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Gerando Imagem...</>
            ) : (
                <><Share2 className="w-5 h-5" /> Compartilhar Comprovante</>
            )}
        </button>
        <p className="text-slate-400 text-xs mt-3 max-w-xs text-center">
            Clique para gerar uma imagem e enviar via WhatsApp
        </p>

      </div>
    </div>
  );
};
