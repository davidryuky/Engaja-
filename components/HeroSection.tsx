import React, { useState, useEffect, useRef } from 'react';
import { handleScroll } from '../utils/scroll';

interface StatCounterProps {
  end: number;
  duration?: number;
  text: string;
  suffix?: string;
  icon: React.ReactElement<any>;
  isVisible: boolean;
}

const StatCounter: React.FC<StatCounterProps> = ({ end, duration = 2000, text, suffix = '', icon, isVisible }) => {
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (isVisible && !hasAnimated.current) {
      hasAnimated.current = true;
      let start = 0;
      const startTime = Date.now();
      
      const animate = () => {
        const currentTime = Date.now();
        const progress = Math.min((currentTime - startTime) / duration, 1);
        const currentNum = Math.floor(progress * end);
        setCount(currentNum);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setCount(end);
        }
      };
      
      requestAnimationFrame(animate);
    }
  }, [isVisible, end, duration]);

  return (
    <div className="flex flex-col items-center text-center">
      <div className="text-brand-pink mb-2">
        {React.cloneElement(icon, { className: "w-7 h-7" })}
      </div>
      <p className="text-2xl md:text-3xl font-extrabold text-white">
        +{count.toLocaleString('pt-BR')}{suffix}
      </p>
      <p className="text-slate-400 mt-1 text-xs">{text}</p>
    </div>
  );
};

// Icons for stats
const PackageIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" /></svg>
);
const UsersIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.962c.566-.649 1.26-1.28 2.06-1.754m-2.06 1.754C9.373 15.56 8.242 16.242 7.5 17.138m0-9.957c0-1.042.844-1.886 1.886-1.886s1.886.844 1.886 1.886m0 9.956a1.886 1.886 0 11-3.772 0m3.772 0a1.886 1.886 0 00-1.886-1.886M12 9.023a1.886 1.886 0 00-1.886 1.886m1.886 0A1.886 1.886 0 0110.114 9.023m2.463 9.331A1.886 1.886 0 0115.886 18m-3.772-9.956a1.886 1.886 0 001.886-1.886M15.886 18a1.886 1.886 0 001.886-1.886m-5.658 3.772A1.886 1.886 0 0012 18.023m0 2.464A1.886 1.886 0 0110.114 18m0 2.464A1.886 1.886 0 007.5 18.023m0 0A1.886 1.886 0 015.614 16.137m0 1.886a1.886 1.886 0 001.886 1.886m0 0A1.886 1.886 0 019.386 16.137m6.5 1.886a1.886 1.886 0 001.886-1.886" /></svg>
);
const TrendingUpIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-3.75-.625m3.75.625V3.375" /></svg>
);
const HeartIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>
);

export const HeroSection: React.FC = () => {
  const [isStatsVisible, setIsStatsVisible] = useState(false);
  const statsSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsStatsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.5 }
    );

    const currentRef = statsSectionRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  const stats = [
    { end: 2451, suffix: '', text: 'Pedidos Entregues', icon: <PackageIcon />, },
    { end: 846, suffix: ' Mil', text: 'Curtidas Entregues', icon: <HeartIcon />, },
    { end: 578, suffix: '', text: 'Clientes Satisfeitos', icon: <UsersIcon />, },
    { end: 1, suffix: ' Milhão', text: 'de Seguidores Entregues', icon: <TrendingUpIcon />, }
  ];

  return (
    <section id="home" className="relative h-screen min-h-[750px] flex items-center justify-center text-center text-white overflow-hidden">
      <div 
        className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-brand-purple via-brand-pink to-brand-purple bg-[size:200%_200%] animate-backgroundPulse"
      ></div>
      <div 
        className="absolute top-0 left-0 w-full h-full bg-cover bg-center opacity-30"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1579869847557-1f67382cc158?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1334')" }}
      ></div>
      <div className="absolute top-0 left-0 w-full h-full bg-brand-dark opacity-60"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-brand-dark via-brand-dark/50 to-transparent"></div>
      
      <div className="relative z-10 p-6 flex flex-col items-center">
        <div className="opacity-0 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-brand-pink py-2">
            Aumente seus seguidores
          </h2>
          <p className="text-4xl md:text-6xl font-extrabold leading-tight mb-8">
            de forma rápida e segura!
          </p>
        </div>
        <p className="max-w-2xl mx-auto text-slate-300 md:text-xl mb-8 opacity-0 animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
          Transforme sua presença online e alcance o sucesso que você merece com nossos planos de crescimento para todas as redes sociais.
        </p>
        
        {/* Stats Section Integrated */}
        <div
          ref={statsSectionRef}
          className={`w-full max-w-4xl mx-auto my-4 transition-all duration-1000 ease-out ${
            isStatsVisible ? 'opacity-100' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4">
            {stats.map((stat, index) => (
              <StatCounter 
                  key={index} 
                  end={stat.end} 
                  text={stat.text} 
                  icon={stat.icon}
                  suffix={stat.suffix}
                  isVisible={isStatsVisible}
              />
            ))}
          </div>
        </div>

        <div className="opacity-0 animate-fadeInUp mt-8" style={{ animationDelay: '0.6s' }}>
          <a 
            href="#comprar"
            onClick={handleScroll}
            className="bg-gradient-to-r from-brand-purple to-brand-pink hover:from-brand-pink hover:to-brand-purple text-white font-bold py-4 px-10 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-brand-purple/40 relative overflow-hidden group"
          >
             <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
            Saiba Mais
          </a>
        </div>
      </div>
    </section>
  );
};