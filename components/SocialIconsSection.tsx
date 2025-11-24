
import React from 'react';
import { Instagram, Facebook, Youtube } from 'lucide-react';

const SocialIcon: React.FC<{ icon: React.ReactNode }> = ({ icon }) => (
    <div className="p-3 md:p-6 bg-brand-dark-200 rounded-full border-2 border-brand-purple/30 text-slate-300 transition-all duration-300 transform hover:scale-110 hover:text-white hover:bg-gradient-to-br hover:from-brand-purple hover:to-brand-pink hover:border-brand-pink cursor-pointer flex items-center justify-center aspect-square">
        {icon}
    </div>
);

// --- ÍCONES CUSTOMIZADOS ---

const TiktokIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M9 12a4 4 0 1 0 4 4v-12a5 5 0 0 0 5 5" />
    </svg>
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


export const SocialIconsSection: React.FC = () => {    
    // Classes responsivas: menor no mobile (w-8), maior no desktop (md:w-12)
    const iconClass = "w-8 h-8 md:w-12 md:h-12 stroke-[1.5]"; 
    const xIconClass = "w-6 h-6 md:w-10 md:h-10"; // Ícone X precisa ser visualmente menor

    return (
        <section className="py-20 md:py-32 bg-brand-dark">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-white">
                        Presente nas Maiores Plataformas
                    </h2>
                    <p className="mt-4 text-lg text-slate-300 max-w-3xl mx-auto">
                        Impulsionamos seu perfil onde seu público está.
                    </p>
                </div>
                {/* Grid 4 colunas no mobile, Flex wrap no desktop */}
                <div className="grid grid-cols-4 gap-3 md:flex md:flex-wrap md:justify-center md:gap-10">
                    <SocialIcon icon={<Instagram className={iconClass} />} />
                    <SocialIcon icon={<TiktokIcon className={iconClass} />} />
                    <SocialIcon icon={<Facebook className={iconClass} />} />
                    <SocialIcon icon={<XIcon className={xIconClass} />} />
                    <SocialIcon icon={<Youtube className={iconClass} />} />
                    <SocialIcon icon={<TwitchIcon className={iconClass} />} />
                    <SocialIcon icon={<SpotifyIcon className={iconClass} />} />
                </div>
            </div>
        </section>
    );
};
