
import React, { useState } from 'react';
import { Instagram, Youtube } from 'lucide-react';

// Custom Icons to match SocialIconsSection
const TiktokIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M9 12a4 4 0 1 0 4 4v-12a5 5 0 0 0 5 5" /></svg>
);
const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
);

type Service = 'Seguidores' | 'Curtidas' | 'Visualizações';
type Platform = 'Instagram' | 'TikTok' | 'YouTube' | 'Twitter';

const platformIcons: Record<Platform, React.ReactNode> = {
  Instagram: <Instagram className="w-6 h-6" />,
  TikTok: <TiktokIcon className="w-6 h-6" strokeWidth={2}/>,
  YouTube: <Youtube className="w-6 h-6" />,
  Twitter: <XIcon className="w-5 h-5" />,
};

const servicesByPlatform: Record<Platform, Service[]> = {
  Instagram: ['Seguidores', 'Curtidas', 'Visualizações'],
  TikTok: ['Seguidores', 'Curtidas', 'Visualizações'],
  YouTube: ['Seguidores', 'Visualizações'], // YouTube uses 'Inscritos' but 'Seguidores' is simpler for the UI
  Twitter: ['Seguidores', 'Curtidas'],
};

const pricing: Record<Platform, Record<Service, number>> = {
  Instagram: { Seguidores: 0.05, Curtidas: 0.02, Visualizações: 0.005 },
  TikTok: { Seguidores: 0.06, Curtidas: 0.025, Visualizações: 0.006 },
  YouTube: { Seguidores: 0.15, Visualizações: 0.01 },
  Twitter: { Seguidores: 0.07, Curtidas: 0.03 },
};

const quantitySteps = [100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000];

export const OrderSection: React.FC = () => {
  const [platform, setPlatform] = useState<Platform>('Instagram');
  const [service, setService] = useState<Service>('Seguidores');
  const [quantity, setQuantity] = useState<number>(1000);
  const [profile, setProfile] = useState('');

  const handlePlatformChange = (newPlatform: Platform) => {
    setPlatform(newPlatform);
    const newServices = servicesByPlatform[newPlatform];
    if (!newServices.includes(service)) {
      setService(newServices[0]);
    }
  };
  
  const pricePerUnit = pricing[platform][service] || 0;
  const totalPrice = (quantity * pricePerUnit).toFixed(2);

  const whatsappMessage = `Olá! Tenho interesse em comprar ${quantity} ${service} para ${platform} para o perfil: ${profile}. Valor total: R$ ${totalPrice}.`;
  const whatsappUrl = `https://wa.me/818075997250?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <section id="comprar" className="py-20 md:py-32 bg-brand-dark-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-brand-pink/10 rounded-full blur-3xl -z-0"></div>
        <div className="container mx-auto px-6 relative z-10">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-extrabold text-white">
                    Impulsione seu Perfil <span className="text-brand-pink">Agora</span>
                </h2>
                <p className="mt-4 text-lg text-slate-300 max-w-3xl mx-auto">
                    Selecione o serviço desejado e veja a mágica acontecer. É rápido, fácil e seguro.
                </p>
            </div>

            <div className="max-w-4xl mx-auto bg-brand-dark p-6 md:p-8 rounded-2xl border border-brand-purple/30 shadow-2xl shadow-brand-purple/10">
                {/* Platform Selector */}
                <div className="mb-6">
                    <div className="flex flex-wrap justify-center gap-2 md:gap-4">
                        {(Object.keys(servicesByPlatform) as Platform[]).map((p) => (
                            <button
                                key={p}
                                onClick={() => handlePlatformChange(p)}
                                className={`flex items-center gap-2 py-2 px-4 rounded-full border-2 transition-all duration-300 text-sm md:text-base font-semibold ${
                                    platform === p
                                        ? 'bg-brand-pink border-brand-pink text-white'
                                        : 'bg-brand-dark-200 border-brand-purple/50 text-slate-300 hover:border-brand-pink'
                                }`}
                            >
                                {platformIcons[p]}
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Service Selector */}
                <div className="mb-6">
                     <div className="flex flex-wrap justify-center gap-2 md:gap-3">
                        {servicesByPlatform[platform].map(s => (
                             <button
                                key={s}
                                onClick={() => setService(s)}
                                className={`py-2 px-5 rounded-full transition-colors duration-300 text-sm md:text-base font-medium ${
                                    service === s
                                    ? 'bg-brand-purple text-white'
                                    : 'bg-brand-dark-200 text-slate-300 hover:bg-brand-dark-200/50'
                                }`}
                            >
                                {s === 'Seguidores' && platform === 'YouTube' ? 'Inscritos' : s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Quantity Slider */}
                <div className="mb-8 px-2">
                    <label htmlFor="quantity" className="block text-center text-slate-200 text-lg font-semibold mb-4">
                        Quantidade: <span className="text-brand-pink font-bold">{quantity.toLocaleString('pt-BR')}</span>
                    </label>
                    <input
                        id="quantity"
                        type="range"
                        min="0"
                        max={quantitySteps.length - 1}
                        step="1"
                        value={quantitySteps.indexOf(quantity)}
                        onChange={(e) => setQuantity(quantitySteps[parseInt(e.target.value, 10)])}
                        className="w-full h-2 bg-brand-purple/30 rounded-lg appearance-none cursor-pointer range-thumb"
                    />
                     <div className="flex justify-between text-xs text-slate-400 mt-2 px-1">
                        {quantitySteps.map((step, i) => (
                            <span key={i} className="transform -translate-x-1/2">{step >= 1000 ? `${step/1000}k` : step}</span>
                        ))}
                    </div>
                </div>

                {/* Profile Input */}
                <div className="mb-6">
                    <label htmlFor="profile" className="sr-only">Seu @usuário ou link do perfil</label>
                    <input
                        id="profile"
                        type="text"
                        value={profile}
                        onChange={(e) => setProfile(e.target.value)}
                        placeholder="Seu @usuário ou link do perfil"
                        className="w-full bg-brand-dark border-2 border-brand-purple/30 rounded-lg p-3 text-white text-center text-lg focus:outline-none focus:border-brand-pink transition-colors duration-300"
                        required
                    />
                </div>

                {/* Price and CTA */}
                <div className="text-center">
                    <p className="text-slate-300 text-lg mb-2">Valor Total:</p>
                    <p className="text-4xl md:text-5xl font-extrabold text-white mb-6">
                        R$ <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-pink to-brand-purple">{totalPrice.replace('.', ',')}</span>
                    </p>
                    <a
                        href={profile ? whatsappUrl : '#'}
                        onClick={(e) => {
                            if (!profile) {
                                e.preventDefault();
                                alert('Por favor, insira seu usuário ou link do perfil.');
                            }
                        }}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-block w-full max-w-sm bg-gradient-to-r from-brand-purple to-brand-pink text-white font-bold py-4 px-10 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-brand-purple/40 ${!profile ? 'opacity-50 cursor-not-allowed' : 'hover:from-brand-pink hover:to-brand-purple'}`}
                    >
                        Comprar Agora via WhatsApp
                    </a>
                </div>
            </div>
        </div>
        <style>{`
            .range-thumb::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 24px;
                height: 24px;
                background: #e879f9; /* brand-pink */
                cursor: pointer;
                border-radius: 50%;
                border: 3px solid #1a1a2e; /* brand-dark */
                box-shadow: 0 0 5px #e879f9;
            }
            .range-thumb::-moz-range-thumb {
                width: 24px;
                height: 24px;
                background: #e879f9;
                cursor: pointer;
                border-radius: 50%;
                border: 3px solid #1a1a2e;
                box-shadow: 0 0 5px #e879f9;
            }
        `}</style>
    </section>
  );
};
