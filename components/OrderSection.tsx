
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Instagram, Facebook, Youtube, Users, Heart, Eye, PlayCircle, Star, MessageSquare, Repeat, Radio, Clock, Mic } from 'lucide-react';

// --- ÍCONES CUSTOMIZADOS ---

const TiktokIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M9 12a4 4 0 1 0 4 4v-12a5 5 0 0 0 5 5" /></svg>
);

const SpotifyIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 5.523 4.477 10 10 10s10-4.477 10-10z"></path>
        <path d="M6 15.25c2.1-1.05 4.85-1.3 7.85-0.75"></path><path d="M5.5 12.5c2.55-1.15 5.7-1.4 8.9-0.8"></path><path d="M5 9.5c3.35-1.25 7.1-1.35 10.9-0.4"></path>
    </svg>
);

const TwitchIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M21 2H3v16h5v4l4-4h5l4-4V2zm-10 9V7m5 4V7"></path>
    </svg>
);

const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
);


// --- ESTRUTURA DE DADOS DINÂMICA ---

const socialMediaData = {
    Instagram: {
        icon: Instagram,
        services: [
            { name: 'Seguidores (Mundiais)', icon: Users, min: 100, max: 50000, step: 100, placeholder: 'Link do seu perfil do Instagram' },
            { name: 'Seguidores (Brasileiros)', icon: Users, min: 100, max: 20000, step: 100, placeholder: 'Link do seu perfil do Instagram' },
            { name: 'Curtidas (HQ)', icon: Heart, min: 50, max: 10000, step: 50, placeholder: 'Link da sua foto ou vídeo' },
            { name: 'Visualizações (Reels)', icon: PlayCircle, min: 100, max: 1000000, step: 100, placeholder: 'Link do seu Reels' },
            { name: 'Comentários (Customizados)', icon: MessageSquare, type: 'comments', min: 10, placeholder: 'Link da publicação' },
        ]
    },
    TikTok: {
        icon: TiktokIcon,
        services: [
            { name: 'Seguidores', icon: Users, min: 100, max: 10000, step: 100, placeholder: 'Link do seu perfil do TikTok' },
            { name: 'Curtidas', icon: Heart, min: 100, max: 50000, step: 100, placeholder: 'Link do seu vídeo do TikTok' },
            { name: 'Visualizações', icon: Eye, min: 1000, max: 5000000, step: 1000, placeholder: 'Link do seu vídeo do TikTok' },
        ]
    },
    Twitch: {
        icon: TwitchIcon,
        services: [
            { name: 'Seguidores de Canal', icon: Users, min: 100, max: 5000, step: 100, placeholder: 'Link do seu canal da Twitch' },
            { name: 'Espectadores de Live', icon: Eye, min: 50, max: 1000, step: 10, placeholder: 'Link da sua live na Twitch' },
        ]
    },
    Facebook: { 
        icon: Facebook, 
        services: [
            { name: 'Curtidas de Página', icon: Users, min: 100, max: 10000, step: 100, placeholder: 'Link da sua Página do Facebook' },
            { name: 'Curtidas em Postagens', icon: Heart, min: 50, max: 5000, step: 50, placeholder: 'Link da sua postagem' },
            { name: 'Visualizações de Vídeo', icon: PlayCircle, min: 1000, max: 1000000, step: 1000, placeholder: 'Link do seu vídeo' },
        ] 
    },
    Twitter: { 
        icon: XIcon, 
        services: [
            { name: 'Seguidores (Mundiais)', icon: Users, min: 100, max: 25000, step: 100, placeholder: 'Link do seu perfil do Twitter (X)' },
            { name: 'Curtidas', icon: Heart, min: 100, max: 10000, step: 100, placeholder: 'Link do seu Tweet' },
            { name: 'Retweets', icon: Repeat, min: 100, max: 10000, step: 100, placeholder: 'Link do seu Tweet' },
            { name: 'Visualizações de Vídeo', icon: Eye, min: 1000, max: 1000000, step: 1000, placeholder: 'Link do seu Tweet com vídeo' },
        ] 
    },
    Youtube: { 
        icon: Youtube, 
        services: [
            { name: 'Inscritos', icon: Users, min: 100, max: 10000, step: 100, placeholder: 'Link do seu canal do YouTube' },
            { name: 'Visualizações (Mundiais)', icon: Eye, min: 1000, max: 5000000, step: 1000, placeholder: 'Link do seu vídeo' },
            { name: 'Curtidas', icon: Heart, min: 100, max: 20000, step: 100, placeholder: 'Link do seu vídeo' },
            { name: 'Horas de Exibição', icon: Clock, min: 1000, max: 4000, step: 500, placeholder: 'Link de um vídeo com +1 hora' },
        ]
     },
    Spotify: { 
        icon: SpotifyIcon, 
        services: [
            { name: 'Plays em Música', icon: PlayCircle, min: 1000, max: 1000000, step: 1000, placeholder: 'Link da sua música no Spotify' },
            { name: 'Seguidores de Playlist', icon: Users, min: 100, max: 5000, step: 100, placeholder: 'Link da sua Playlist' },
            { name: 'Ouvintes Mensais', icon: Mic, min: 500, max: 50000, step: 500, placeholder: 'Link do seu perfil de artista' },
        ] 
    },
};

const socialNetworks = Object.keys(socialMediaData);

type Service = typeof socialMediaData.Instagram.services[0];

interface OrderSectionProps {
  whatsappNumber: string;
}

export const OrderSection: React.FC<OrderSectionProps> = ({ whatsappNumber }) => {
    const [selectedSocial, setSelectedSocial] = useState('Instagram');
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [quantity, setQuantity] = useState(1000);
    const [link, setLink] = useState('');
    const [comments, setComments] = useState('');
    const [customRequest, setCustomRequest] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false); // Loading state for the buy button
    
    const dropdownRef = useRef<HTMLDivElement>(null);
    
    const isCommentService = useMemo(() => selectedService?.type === 'comments', [selectedService]);
    const commentCount = useMemo(() => comments.split('\n').filter(line => line.trim() !== '').length, [comments]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSocialSelect = (social: string) => {
        setSelectedSocial(social);
        setSelectedService(null); // Reset service selection
        setIsDropdownOpen(false);

        if (social === 'Custom') {
            setCustomRequest('');
        } else {
             // Reset fields when changing social network
            setQuantity(1000);
            setLink('');
            setComments('');
        }
    };
    
    const handleServiceSelect = (service: Service) => {
        setSelectedService(service);
        if (service.type !== 'comments') {
            setQuantity(Math.max(1000, service.min || 0));
            setComments('');
        } else {
            setQuantity(0);
        }
        setIsDropdownOpen(false);
    };

    const handleBuyClick = async () => {
        if (!link.trim() || !selectedService) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        setIsSubmitting(true);
        let orderDetails = {};
        let whatsappMessage;

        if (isCommentService) {
            if (commentCount < (selectedService.min || 10)) {
                alert(`Por favor, insira pelo menos ${selectedService.min || 10} comentários.`);
                setIsSubmitting(false);
                return;
            }
            const commentsList = comments.split('\n').filter(line => line.trim() !== '').join('\n');
            orderDetails = {
                platform: selectedSocial,
                service: selectedService.name,
                link,
                comments: commentsList,
            };
            whatsappMessage = `Olá! Gostaria de fazer um pedido na Engaja+:\n\n- Rede Social: *${selectedSocial}*\n- Serviço: *${selectedService.name}*\n- Link: ${link}\n\n*Comentários:*\n${commentsList}`;

        } else {
            orderDetails = {
                platform: selectedSocial,
                service: selectedService.name,
                link,
                quantity,
            };
            whatsappMessage = `Olá! Gostaria de fazer um pedido na Engaja+:\n\n- Rede Social: *${selectedSocial}*\n- Serviço: *${selectedService.name}*\n- Quantidade: *${quantity.toLocaleString('pt-BR')}*\n- Link: ${link}`;
        }

        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderDetails),
            });

            const data = await response.json();

            if (!data.success || !data.publicId) {
                throw new Error(data.message || 'Não foi possível criar o pedido.');
            }

            // Add public Order ID to the message
            const finalMessage = `${whatsappMessage}\n\n*ID do Pedido: ${data.publicId}*`;
            const encodedMessage = encodeURIComponent(finalMessage);
            const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
            
            window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

        } catch (error) {
            console.error('Failed to create order:', error);
            alert('Ocorreu um erro ao criar seu pedido. Por favor, tente novamente ou entre em contato com o suporte.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleCustomRequestSubmit = () => {
        if (!customRequest.trim()) {
            alert('Por favor, descreva seu pedido customizado.');
            return;
        }
        const message = `Olá! Gostaria de solicitar um serviço personalizado na Engaja+:\n\n*Pedido:*\n${customRequest}`;
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    };

    const getButtonText = () => {
        if (isSubmitting) return 'Processando...';
        if (!selectedService) return 'Escolha um Serviço';
        if (isCommentService) {
            return `Comprar ${commentCount} Comentários`;
        }
        return `Comprar ${quantity.toLocaleString('pt-BR')} ${selectedService.name}`;
    }
    
    const iconStyle = { width: '32px', height: '32px' };
    const serviceIconStyle = { width: '20px', height: '20px', marginRight: '8px', flexShrink: 0 };

    return (
        <section id="comprar" className="py-20 md:py-32 bg-brand-dark-200">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-white">Faça seu Pedido</h2>
                    <p className="mt-4 text-lg text-slate-300 max-w-3xl mx-auto">É rápido, fácil e 100% seguro.</p>
                </div>

                <div className="max-w-3xl mx-auto bg-brand-dark p-6 md:p-8 rounded-2xl shadow-2xl shadow-brand-purple/10 border border-brand-purple/30">
                    {/* 1. Social Network Selector */}
                    <div className="mb-6">
                        <label className="block text-lg font-semibold mb-3 text-slate-200">1. Selecione a Plataforma</label>
                        <div className="grid grid-cols-4 sm:grid-cols-8 gap-4 py-4">
                            {socialNetworks.map((name) => {
                                const Icon = socialMediaData[name as keyof typeof socialMediaData].icon;
                                const hasServices = socialMediaData[name as keyof typeof socialMediaData].services.length > 0;
                                if (!hasServices) return null;

                                const isX = name === 'Twitter';
                                
                                return (
                                <div key={name} className="flex flex-col items-center">
                                    <button
                                        onClick={() => handleSocialSelect(name)}
                                        className={`p-4 rounded-full border-2 transition-all duration-300 transform-gpu flex items-center justify-center ${selectedSocial === name ? 'bg-gradient-to-br from-brand-purple to-brand-pink border-brand-pink scale-110 shadow-lg shadow-brand-purple/30' : 'bg-brand-dark-200 border-brand-purple/30 hover:border-brand-pink hover:scale-105'}`}
                                        style={{ width: '68px', height: '68px' }}
                                    >
                                        <Icon style={isX ? { width: '28px', height: '28px'} : iconStyle} className={selectedSocial === name ? 'text-white' : 'text-slate-300'} />
                                    </button>
                                    <span className={`mt-2 text-xs font-semibold h-4 transition-all duration-300 ${selectedSocial === name ? 'opacity-100 text-brand-pink' : 'opacity-50'}`}>
                                        {name === 'Twitter' ? 'X' : name}
                                    </span>
                                </div>
                            )})}
                             <div className="flex flex-col items-center">
                                <button
                                    onClick={() => handleSocialSelect('Custom')}
                                    className={`p-4 rounded-full border-2 transition-all duration-300 transform-gpu flex flex-col justify-center items-center text-center ${selectedSocial === 'Custom' ? 'bg-gradient-to-br from-brand-purple to-brand-pink border-brand-pink scale-110 shadow-lg shadow-brand-purple/30' : 'bg-brand-dark-200 border-brand-purple/30 hover:border-brand-pink hover:scale-105'}`}
                                    style={{ width: '68px', height: '68px' }} 
                                >
                                    <span className={`text-xs font-semibold leading-tight ${selectedSocial === 'Custom' ? 'text-white' : 'text-slate-300'}`}>Outros</span>
                                    <span className={`text-xs font-semibold leading-tight ${selectedSocial === 'Custom' ? 'text-white' : 'text-slate-300'}`}>Serviços</span>
                                </button>
                                <span className={`mt-2 text-xs font-semibold h-4 transition-all duration-300 ${selectedSocial === 'Custom' ? 'opacity-100 text-brand-pink' : 'opacity-0'}`}>
                                    &nbsp;
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    {selectedSocial === 'Custom' ? (
                        <div className="mb-6">
                            <label htmlFor="customRequest" className="block text-lg font-semibold mb-3 text-slate-200">2. Pedido Personalizado</label>
                            <p className="text-sm text-slate-400 mb-4">Se não encontrou o serviço que precisa ou deseja um pacote customizado, descreva sua necessidade abaixo. Nossa equipe entrará em contato para criar uma oferta especial para você.</p>
                            <textarea 
                                id="customRequest"
                                value={customRequest}
                                onChange={(e) => setCustomRequest(e.target.value)}
                                placeholder="Ex: Gostaria de 500 seguidores para Twitter e 10.000 visualizações para um vídeo no YouTube..."
                                rows={5}
                                className="w-full bg-brand-dark-200 border-2 border-brand-purple/30 rounded-lg p-3 focus:outline-none focus:border-brand-pink transition-colors duration-300"
                            />
                            <div className="text-center pt-6">
                                <button 
                                    onClick={handleCustomRequestSubmit} 
                                    className="w-full md:w-auto bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-500 text-white font-bold py-4 px-12 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={!customRequest.trim()}
                                >
                                    Solicitar Serviço
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="mb-6">
                                <label className="block text-lg font-semibold mb-3 text-slate-200">2. Escolha o Serviço</label>
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="flex items-center justify-between w-full p-3 rounded-lg border-2 bg-brand-dark-200 border-brand-purple/30 text-slate-300 hover:border-brand-pink transition-all duration-300 font-semibold"
                                        aria-haspopup="listbox"
                                        aria-expanded={isDropdownOpen}
                                    >
                                        {selectedService ? (
                                        <div className="flex items-center">
                                            <selectedService.icon style={serviceIconStyle} />
                                            <span>{selectedService.name}</span>
                                        </div>
                                        ) : (
                                        <span className="text-slate-400">Escolha seu serviço</span>
                                        )}
                                        <svg className={`w-5 h-5 transform transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </button>

                                    {isDropdownOpen && (
                                        <div className="absolute top-full mt-2 left-0 w-full bg-brand-dark border border-brand-purple/50 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                                        {socialMediaData[selectedSocial as keyof typeof socialMediaData].services.map((service) => {
                                            const Icon = service.icon;
                                            return (
                                            <button
                                                key={service.name}
                                                onClick={() => handleServiceSelect(service)}
                                                className="flex items-center text-left w-full p-3 hover:bg-brand-purple/30 transition-colors duration-200 text-slate-200 font-semibold"
                                            >
                                                <Icon style={serviceIconStyle} />
                                                <span>{service.name}</span>
                                            </button>
                                            );
                                        })}
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {selectedService && !isCommentService && (
                            <div className="mb-6">
                                <label htmlFor="quantity" className="block text-lg font-semibold mb-3 text-slate-200">3. Defina a Quantidade</label>
                                 <div className="flex items-center gap-4 pt-2">
                                     <input
                                        id="quantity"
                                        type="range"
                                        min={selectedService.min}
                                        max={selectedService.max}
                                        step={selectedService.step}
                                        value={quantity}
                                        onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
                                        className="w-full h-2 bg-brand-purple/30 rounded-lg appearance-none cursor-pointer custom-slider focus:outline-none"
                                    />
                                    <span className="bg-brand-dark-200 border-2 border-brand-purple/30 rounded-lg text-white font-bold py-2 px-4 min-w-[90px] text-center">
                                        {quantity.toLocaleString('pt-BR')}
                                    </span>
                                </div>
                            </div>
                            )}

                            {selectedService && isCommentService && (
                            <div className="mb-6">
                                <label htmlFor="comments" className="block text-lg font-semibold mb-3 text-slate-200">3. Digite os Comentários</label>
                                <textarea 
                                    id="comments"
                                    value={comments}
                                    onChange={(e) => setComments(e.target.value)}
                                    placeholder={`Digite um comentário por linha (mínimo ${selectedService.min || 10}).`}
                                    rows={5}
                                    className="w-full bg-brand-dark-200 border-2 border-brand-purple/30 rounded-lg p-3 focus:outline-none focus:border-brand-pink transition-colors duration-300"
                                />
                                <p className={`text-sm mt-2 text-right ${commentCount < (selectedService.min || 10) ? 'text-yellow-400' : 'text-green-400'}`}>
                                    {commentCount}/{selectedService.min || 10} comentários
                                </p>
                            </div>
                            )}

                            {selectedService && (
                            <div className="mb-8">
                                <label htmlFor="link" className="block text-lg font-semibold mb-3 text-slate-200">4. Link do Perfil ou Publicação</label>
                                <input id="link" type="text" value={link} onChange={(e) => setLink(e.target.value)} placeholder={selectedService.placeholder} className="w-full bg-brand-dark-200 border-2 border-brand-purple/30 rounded-lg p-3 focus:outline-none focus:border-brand-pink transition-colors duration-300" />
                            </div>
                            )}
                            
                            {selectedService && (
                            <div className="text-center pt-4">
                                <button onClick={handleBuyClick} className="w-full md:w-auto bg-gradient-to-r from-brand-purple to-brand-pink hover:from-brand-pink hover:to-brand-purple text-white font-bold py-4 px-12 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-brand-purple/40 disabled:opacity-50 disabled:cursor-wait disabled:scale-100"
                                  disabled={isSubmitting || !selectedService || !link.trim() || (isCommentService && commentCount < (selectedService.min || 10))}
                                >
                                   {getButtonText()}
                                </button>
                            </div>
                            )}
                        </>
                    )}

                    <div className="my-8 w-full h-px bg-gradient-to-r from-transparent via-brand-purple/30 to-transparent"></div>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-slate-400 text-sm">
                        <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
                            <span>100% Seguro</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                            <span>Privacidade Garantida</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 7-7 7 7"/><path d="m5 19 7-7 7 7"/></svg>
                            <span>Entrega Rápida</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
