
import React from 'react';
import { getTranslation } from '../utils/language';

interface ContactSectionProps {
  whatsappNumber: string;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ whatsappNumber }) => {
    const getUrl = () => {
        const message = getTranslation('contact_section');
        return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message as string)}`;
    };

    return (
        <section 
            id="contato" 
            className="py-20 md:py-32 bg-brand-dark relative overflow-hidden"
        >
            <div className="absolute inset-0 bg-gradient-to-r from-brand-purple via-brand-pink to-brand-purple bg-[size:200%_200%] animate-backgroundPulse opacity-30"></div>
            <div className="absolute inset-0 bg-brand-dark/80"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-brand-purple/10 rounded-full blur-3xl"></div>

            <div className="container mx-auto px-6 text-center relative z-10">
                <h2 className="text-3xl md:text-4xl font-extrabold text-white">
                    Pronto para <span className="text-brand-pink">Começar</span>?
                </h2>
                <p className="mt-4 text-lg text-slate-300 max-w-3xl mx-auto">
                    Nossa equipe está pronta para te atender! Para um suporte mais ágil e personalizado, nosso canal de atendimento principal é via WhatsApp.
                </p>
                <div className="mt-12">
                    <a 
                      href={getUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-gradient-to-r from-brand-purple to-brand-pink hover:from-brand-pink hover:to-brand-purple text-white font-bold py-4 px-10 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-brand-purple/40"
                    >
                      Fale Conosco no WhatsApp
                    </a>
                </div>
            </div>
        </section>
    );
};
