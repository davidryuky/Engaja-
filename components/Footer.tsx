
import React from 'react';
import { Lock, ShieldCheck, CreditCard, CheckCircle } from 'lucide-react';

const SecurityBadge: React.FC<{ icon: React.ReactNode; title: string; subtitle: string; colorClass: string }> = ({ icon, title, subtitle, colorClass }) => (
  <div className={`flex items-center gap-3 bg-brand-dark border border-white/5 p-3 rounded-lg shadow-sm ${colorClass} bg-opacity-5 transition-transform hover:-translate-y-1`}>
    <div className="p-2 bg-white/5 rounded-full backdrop-blur-sm">
      {icon}
    </div>
    <div className="text-left">
      <p className="text-sm font-bold text-white">{title}</p>
      <p className="text-xs font-medium text-slate-200">{subtitle}</p>
    </div>
  </div>
);

export const Footer: React.FC = () => {
  // Estilo unificado para transmitir segurança máxima (Verde/Emerald)
  const secureStyle = "text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]";

  return (
    <footer className="bg-brand-dark-200 relative pt-16 pb-8">
       <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-purple/50 to-transparent"></div>
      
      <div className="container mx-auto px-6">
        
        {/* SELOS DE SEGURANÇA (UNIFICADOS EM VERDE) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-5xl mx-auto">
            <SecurityBadge 
                icon={<Lock className="w-5 h-5 text-emerald-400" />} 
                title="Site Seguro" 
                subtitle="Certificado SSL 256-bit"
                colorClass={secureStyle}
            />
            <SecurityBadge 
                icon={<ShieldCheck className="w-5 h-5 text-emerald-400" />} 
                title="Privacidade" 
                subtitle="Dados Criptografados"
                colorClass={secureStyle}
            />
             <SecurityBadge 
                icon={<CreditCard className="w-5 h-5 text-emerald-400" />} 
                title="Pagamento" 
                subtitle="Processamento Protegido"
                colorClass={secureStyle}
            />
             <SecurityBadge 
                icon={<CheckCircle className="w-5 h-5 text-emerald-400" />} 
                title="Garantia" 
                subtitle="Satisfação Comprovada"
                colorClass={secureStyle}
            />
        </div>

        {/* COPYRIGHT & LOGO */}
        <div className="text-center text-slate-400 flex flex-col items-center border-t border-white/5 pt-8">
            <span className="text-2xl font-extrabold text-white tracking-tight mb-4 notranslate">
                Arvex<span className="text-brand-pink font-light ml-1">Social</span>
            </span>
            <p className="text-sm">&copy; {new Date().getFullYear()} Arvex Social. Todos os direitos reservados.</p>
            <p className="text-xs mt-3 text-slate-400 font-medium tracking-wide">Construindo sua presença online, um seguidor de cada vez.</p>
            
            <div className="mt-6 text-xs text-slate-500 flex items-center justify-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
               <span>Desenvolvido por</span>
               <a href="https://younext.agency/" target="_blank" rel="noopener noreferrer" className="text-brand-pink hover:underline font-bold flex items-center gap-1">
                   YouNext Agency 🚀
               </a>
            </div>
        </div>

      </div>
    </footer>
  );
};
