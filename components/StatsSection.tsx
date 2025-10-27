import React, { useState, useEffect, useRef } from 'react';

interface StatCounterProps {
  end: number;
  duration?: number;
  text: string;
  suffix?: string;
  // FIX: Changed icon type to React.ReactElement<any> to allow passing props with React.cloneElement.
  // This resolves the TypeScript error where the props of the icon element were inferred as `unknown`.
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
    // Minimalist adjustments: smaller icon, font sizes, and margins
    <div className="flex flex-col items-center text-center">
      <div className="text-brand-pink mb-2">
        {React.cloneElement(icon, { className: "w-8 h-8" })}
      </div>
      <p className="text-3xl md:text-4xl font-extrabold text-white">
        +{count.toLocaleString('pt-BR')}{suffix}
      </p>
      <p className="text-slate-400 mt-2 text-sm">{text}</p>
    </div>
  );
};

export const StatsSection: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.5 }
    );

    const currentRef = sectionRef.current;
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
    {
      end: 50,
      suffix: ' Mil',
      text: 'Pedidos Entregues',
      icon: <PackageIcon />,
    },
    {
      end: 846,
      suffix: ' Mil',
      text: 'Curtidas Entregues',
      icon: <HeartIcon />,
    },
    {
      end: 35,
      suffix: ' Mil',
      text: 'Clientes Satisfeitos',
      icon: <UsersIcon />,
    },
    {
      end: 2,
      suffix: ' Milhões',
      text: 'de Seguidores Entregues',
      icon: <TrendingUpIcon />,
    }
  ];

  return (
    // Changed background to bg-brand-dark for better separation and reduced vertical padding for a more compact look.
    <section 
      ref={sectionRef} 
      className={`py-12 md:py-16 bg-brand-dark transition-all duration-1000 ease-out ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-4">
          {stats.map((stat, index) => (
            <StatCounter 
                key={index} 
                end={stat.end} 
                text={stat.text} 
                icon={stat.icon}
                suffix={stat.suffix}
                isVisible={isVisible}
            />
          ))}
        </div>
      </div>
    </section>
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