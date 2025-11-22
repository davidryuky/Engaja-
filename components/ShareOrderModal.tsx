
import React, { useRef, useState, useEffect } from 'react';
import { X as CloseIcon, Share2, Download, Loader2, Copy } from 'lucide-react';
import { Order } from './dashboard/DashboardTypes';

interface ShareOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
}

export const ShareOrderModal: React.FC<ShareOrderModalProps> = ({ isOpen, onClose, order }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // Função para desenhar o comprovante no Canvas
  const generateReceiptImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsGenerating(true);

    try {
      // 1. Configurar Canvas (Tamanho estilo Story/Status: 1080x1350 ou Card: 800x1000)
      const width = 800;
      const height = 1000;
      canvas.width = width;
      canvas.height = height;

      // 2. Fundo (Brand Dark com Gradiente)
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#120c1f');
      gradient.addColorStop(1, '#1e1433');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // 3. Adicionar Borda/Detalhe Superior
      const topBarGradient = ctx.createLinearGradient(0, 0, width, 0);
      topBarGradient.addColorStop(0, '#8073f1');
      topBarGradient.addColorStop(1, '#e677af');
      ctx.fillStyle = topBarGradient;
      ctx.fillRect(0, 0, width, 15);

      // 4. Carregar e Desenhar Logo
      const logoImg = new Image();
      logoImg.crossOrigin = "anonymous";
      logoImg.src = "https://i.postimg.cc/jj7rdzv8/logoengaja.png";

      await new Promise<void>((resolve, reject) => {
        logoImg.onload = () => resolve();
        logoImg.onerror = () => {
             console.warn("Falha ao carregar logo para o canvas");
             resolve();
        };
      });

      // Centralizar Logo
      const logoWidth = 200;
      const logoHeight = (logoImg.height / logoImg.width) * logoWidth;
      ctx.drawImage(logoImg, (width - logoWidth) / 2, 60, logoWidth, logoHeight);

      // 5. Título "Resumo do Pedido"
      ctx.font = "bold 40px Arial, sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.fillText("RESUMO DO PEDIDO", width / 2, 220);

      // Linha separadora
      ctx.strokeStyle = "rgba(128, 115, 241, 0.3)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(100, 250);
      ctx.lineTo(width - 100, 250);
      ctx.stroke();

      // 6. Dados do Pedido (Função Auxiliar para desenhar linhas)
      let currentY = 320;
      const drawField = (label: string, value: string, color: string = "#ffffff", isBold: boolean = false) => {
        ctx.textAlign = "left";
        
        // Label
        ctx.font = "bold 24px Arial, sans-serif";
        ctx.fillStyle = "#8073f1"; // Roxo claro
        ctx.fillText(label.toUpperCase(), 100, currentY);
        
        currentY += 35;

        // Value
        ctx.font = `${isBold ? "bold" : "normal"} 32px Arial, sans-serif`;
        ctx.fillStyle = color;
        
        // Truncate text if too long
        const maxWidth = 600;
        let displayValue = value;
        if (ctx.measureText(displayValue).width > maxWidth) {
            while (ctx.measureText(displayValue + "...").width > maxWidth && displayValue.length > 0) {
                displayValue = displayValue.slice(0, -1);
            }
            displayValue += "...";
        }

        ctx.fillText(displayValue, 100, currentY);
        currentY += 70; // Espaço para o próximo item
      };

      drawField("ID do Pedido", `#${order.public_id}`);
      drawField("Plataforma", order.platform);
      drawField("Serviço", order.service);
      drawField("Quantidade", order.quantity ? order.quantity.toLocaleString('pt-BR') : 'N/A');
      
      // Status com Cores
      let statusColor = "#ffffff";
      let statusText = order.completion_status;
      if (order.completion_status === 'Concluido') {
          statusColor = "#10b981"; // Verde
          statusText = "CONCLUÍDO";
      } else {
          statusColor = "#fbbf24"; // Amarelo
          statusText = "EM ANDAMENTO";
      }
      drawField("Status", statusText, statusColor, true);

      // 7. Rodapé com Mensagem
      const bottomY = height - 90;
      
      // Mensagem de Agradecimento
      ctx.font = "bold 28px Arial, sans-serif";
      ctx.fillStyle = "#e677af"; // Rosa da marca
      ctx.textAlign = "center";
      ctx.fillText("Obrigado pela preferência :)", width / 2, bottomY);

      // Link do site
      ctx.font = "italic 18px Arial, sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.fillText("engajamais.com", width / 2, bottomY + 40);

      // 8. Gerar URL da Imagem
      const dataUrl = canvas.toDataURL('image/png');
      setImageUrl(dataUrl);

    } catch (error) {
      console.error("Erro ao gerar imagem canvas:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Gerar imagem assim que o modal abrir
  useEffect(() => {
    if (isOpen) {
      generateReceiptImage();
    } else {
        setImageUrl(null);
    }
  }, [isOpen, order]);

  // Ação: Baixar Imagem
  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `pedido-${order.public_id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Ação: Compartilhar (Híbrido Mobile/Desktop)
  const handleShare = async () => {
    if (!imageUrl || isGenerating) return;

    try {
        const blob = await (await fetch(imageUrl)).blob();
        const file = new File([blob], `comprovante-${order.public_id}.png`, { type: 'image/png' });
        
        // Texto da mensagem
        const text = `Olá! Segue o resumo do pedido *#${order.public_id}*.\n\nStatus: *${order.completion_status === 'Concluido' ? 'Concluído ✅' : 'Em Andamento ⏳'}*`;

        // 1. Tentar Compartilhamento Nativo (Celulares)
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
                files: [file],
                title: 'Comprovante Engaja+',
                text: text,
            });
        } else {
            // 2. Fallback para Desktop (Baixar + WhatsApp Web)
            // Primeiro baixa a imagem
            handleDownload();
            
            // Depois abre o WhatsApp Web com o texto
            const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
            window.open(waUrl, '_blank');
            
            // Avisa o usuário
            alert("A imagem foi salva no seu computador!\n\nO WhatsApp foi aberto. Por favor, anexe a imagem manualmente na conversa.");
        }
    } catch (error) {
        console.error("Erro ao compartilhar:", error);
        // Em caso de erro obscuro, tenta pelo menos o download
        handleDownload();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
      onClick={onClose}
    >
      <div
        className="bg-brand-dark-200 border border-brand-purple/50 rounded-2xl shadow-2xl p-6 max-w-md w-full relative animate-fadeInUp flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors z-10"
        >
          <CloseIcon className="h-6 w-6" />
        </button>

        <h2 className="text-xl font-bold text-white mb-6">Compartilhar Pedido</h2>

        {/* Canvas Invisível (usado apenas para processamento) */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* Preview da Imagem */}
        <div className="w-full aspect-[4/5] bg-brand-dark rounded-lg overflow-hidden border border-brand-purple/20 mb-6 flex items-center justify-center relative group">
            {isGenerating ? (
                <div className="flex flex-col items-center text-brand-pink">
                    <Loader2 className="w-8 h-8 animate-spin mb-2" />
                    <span className="text-sm">Gerando imagem...</span>
                </div>
            ) : imageUrl ? (
                <img src={imageUrl} alt="Preview" className="w-full h-full object-contain" />
            ) : (
                <span className="text-slate-500">Erro ao gerar preview</span>
            )}
        </div>

        <div className="grid grid-cols-2 gap-4 w-full">
            <button
                onClick={handleDownload}
                disabled={isGenerating || !imageUrl}
                className="flex items-center justify-center gap-2 bg-brand-dark border border-brand-purple/50 hover:bg-brand-purple/20 text-white font-semibold py-3 px-4 rounded-xl transition-all"
            >
                <Download className="w-5 h-5" />
                Baixar
            </button>
            <button
                onClick={handleShare}
                disabled={isGenerating || !imageUrl}
                className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-lg shadow-green-600/20"
            >
                <Share2 className="w-5 h-5" />
                WhatsApp
            </button>
        </div>
        
        <p className="text-xs text-slate-500 mt-4 text-center px-4">
            No computador, a imagem será baixada automaticamente para você anexar.
        </p>
      </div>
    </div>
  );
};
