
import React from 'react';
import { Instagram, Facebook, Twitter, Youtube } from 'lucide-react';

const SocialIcon: React.FC<{ icon: React.ReactNode }> = ({ icon }) => (
    <div className="p-6 bg-brand-dark-200 rounded-full border-2 border-brand-purple/30 text-slate-300 transition-all duration-300 transform hover:scale-110 hover:text-white hover:bg-gradient-to-br hover:from-brand-purple hover:to-brand-pink hover:border-brand-pink cursor-pointer">
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


export const SocialIconsSection: React.FC = () => {    
    const iconStyle = { width: '48px', height: '48px', strokeWidth: '1.5px' };

    return (
        <section className="py-20 md:py-32 bg-brand-dark">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-white">
                        Presente nas Maiores Plataformas
                    </h2>
                    <p className="mt-4 text-lg text-slate-300 max-w-3xl mx-auto">
                        Impulsionamos seu perfil onde seu público está.
                    </p>
                </div>
                <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10">
                    <SocialIcon icon={<Instagram style={iconStyle} />} />
                    <SocialIcon icon={<TiktokIcon style={iconStyle} />} />
                    <SocialIcon icon={<Facebook style={iconStyle} />} />
                    <SocialIcon icon={<Twitter style={iconStyle} />} />
                    <SocialIcon icon={<Youtube style={iconStyle} />} />
                    <SocialIcon icon={<TwitchIcon style={iconStyle} />} />
                    <SocialIcon icon={<SpotifyIcon style={iconStyle} />} />
                </div>
            </div>
        </section>
    );
};