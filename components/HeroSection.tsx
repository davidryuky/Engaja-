import React from 'react';

export const HeroSection: React.FC = () => {
  
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const href = e.currentTarget.getAttribute('href');
    if (href) {
      const targetElement = document.querySelector(href);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section id="home" className="relative h-screen min-h-[600px] flex items-center justify-center text-center text-white overflow-hidden">
      <div 
        className="absolute top-0 left-0 w-full h-full bg-cover bg-center bg-fixed animate-backgroundPulse"
        style={{ backgroundImage: "linear-gradient(to right, #8A2BE2, #C8A2C8, #8A2BE2, #C8A2C8)"}}
      ></div>
      <div 
        className="absolute top-0 left-0 w-full h-full bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1579869847557-1f67382cc158?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1334')" }}
      ></div>
      <div className="absolute top-0 left-0 w-full h-full bg-brand-dark opacity-90"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-brand-dark via-brand-dark/50 to-transparent"></div>
      
      <div className="relative z-10 p-6">
        <div className="opacity-0 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-brand-lilac via-white to-brand-lilac py-2">
            Aumente seus seguidores
          </h2>
          <p className="text-4xl md:text-6xl font-extrabold leading-tight mb-8">
            de forma rápida e segura!
          </p>
        </div>
        <p className="max-w-2xl mx-auto text-slate-300 md:text-xl mb-12 opacity-0 animate-fadeInUp" style={{ animationDelay: '0.5s' }}>
          Transforme sua presença online e alcance o sucesso que você merece com nossos planos de crescimento para todas as redes sociais.
        </p>
        <div className="opacity-0 animate-fadeInUp" style={{ animationDelay: '0.8s' }}>
          <a 
            href="#comprar"
            onClick={handleScroll}
            className="bg-gradient-to-r from-brand-purple to-purple-600 hover:from-purple-600 hover:to-brand-purple text-white font-bold py-4 px-10 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/40 relative overflow-hidden group"
          >
             <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
            Saiba Mais
          </a>
        </div>
      </div>
    </section>
  );
};