
import React from 'react';
// Remove 'Youtube' and 'Linkedin' from the import
import { Instagram, Facebook, Twitter } from 'lucide-react';

const SocialIcon: React.FC<{ icon: React.ReactNode }> = ({ icon }) => (
    <div className="p-6 bg-brand-dark-200 rounded-full border-2 border-purple-900/50 text-brand-lilac transition-all duration-300 transform hover:scale-110 hover:text-white hover:bg-brand-purple hover:border-brand-lilac cursor-pointer">
        {icon}
    </div>
);

// Create a custom TikTok icon component since it's not in lucide-react
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
                    {/* Use the new custom TiktokIcon component */}
                    <SocialIcon icon={<TiktokIcon style={iconStyle} />} />
                    <SocialIcon icon={<Facebook style={iconStyle} />} />
                    <SocialIcon icon={<Twitter style={iconStyle} />} />
                </div>
            </div>
        </section>
    );
};