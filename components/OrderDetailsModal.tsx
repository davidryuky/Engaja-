
import React from 'react';
import { X as CloseIcon, ExternalLink } from 'lucide-react';
import { Order } from './dashboard/DashboardTypes';

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
}

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div>
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{label}</h3>
        <div className="text-white text-base mt-1">{value}</div>
    </div>
);


export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ isOpen, onClose, order }) => {
  if (!isOpen) {
    return null;
  }

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
          Detalhes do Pedido
        </h2>
        <p className="text-sm text-brand-pink font-mono mb-6">{order.public_id}</p>

        <div className="space-y-6 text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DetailItem label="Plataforma" value={order.platform} />
                <DetailItem label="Serviço" value={order.service} />
            </div>
            
            <DetailItem 
                label="Link" 
                value={
                    <a href={order.link} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline break-all flex items-center gap-2">
                       <span>{order.link}</span> <ExternalLink className="w-4 h-4 flex-shrink-0" />
                    </a>
                } 
            />

            {order.quantity && (
                 <DetailItem label="Quantidade" value={order.quantity.toLocaleString('pt-BR')} />
            )}

            {order.comments && (
                <DetailItem 
                    label="Comentários" 
                    value={
                        <pre className="bg-brand-dark p-3 rounded-lg whitespace-pre-wrap font-sans text-sm">
                            {order.comments}
                        </pre>
                    }
                />
            )}
             
            <DetailItem 
                label="Data do Pedido" 
                value={new Date(order.created_at).toLocaleString('pt-BR')}
            />

        </div>
      </div>
    </div>
  );
};
