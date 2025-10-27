


import React, { useState, useEffect, useRef } from 'react';

const names = ['Ana B.', 'Lucas M.', 'Beatriz S.', 'Carlos P.', 'Mariana F.', 'Pedro A.', 'Sofia R.', 'Ricardo J.', 'Julia C.', 'Gustavo L.', 'Fernanda T.', 'Rafael G.'];

const services = {
  'Instagram': ['seguidores', 'curtidas', 'visualizações'],
  'TikTok': ['seguidores', 'curtidas', 'visualizações'],
  'YouTube': ['inscritos', 'visualizações'],
  'Twitch': ['seguidores'],
  'Facebook': ['curtidas de Página', 'curtidas em Postagens'],
};

const platforms = Object.keys(services);

const getRandomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export const SocialProof: React.FC = () => {
  const [notification, setNotification] = useState<{
    name: string;
    quantity: string;
    service: string;
    platform: string;
  } | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  const visibilityTimerRef = useRef<number>();
  const scheduleTimerRef = useRef<number>();
  const lastNotificationNameRef = useRef<string | null>(null);
  const userClosedRef = useRef(false);

  const handleClose = () => {
      userClosedRef.current = true;
      setIsVisible(false);
      // FIX: Pass timer ID argument to clearTimeout to correctly clear the timer.
      if (visibilityTimerRef.current) window.clearTimeout(visibilityTimerRef.current);
      // FIX: Pass timer ID argument to clearTimeout to correctly clear the timer.
      if (scheduleTimerRef.current) window.clearTimeout(scheduleTimerRef.current);
  };

  useEffect(() => {
    // Using function declarations for hoisting, allowing for mutual recursion between the timer functions.
    function scheduleNext() {
        if (userClosedRef.current) return;
        // Schedule next notification for 20-30 seconds
        scheduleTimerRef.current = window.setTimeout(generateAndShowNotification, getRandomInt(20000, 30000));
    }

    function generateAndShowNotification() {
      if (userClosedRef.current) return;
        
      let name;
      do {
        name = getRandomItem(names);
      } while (name === lastNotificationNameRef.current);
      lastNotificationNameRef.current = name;

      const platform = getRandomItem(platforms);
      const service = getRandomItem(services[platform as keyof typeof services]);
      const quantity = getRandomInt(1, 100) * 100; // Generates multiples of 100
      
      setNotification({
        name,
        quantity: quantity.toLocaleString('pt-BR'),
        service,
        platform,
      });

      setIsVisible(true);

      // Hide notification after 3 seconds and schedule the next one
      visibilityTimerRef.current = window.setTimeout(() => {
        setIsVisible(false);
        scheduleNext();
      }, 3000); // Duration is now 3 seconds
    }
    
    // Initial timer: 5-10 seconds after mount
    scheduleTimerRef.current = window.setTimeout(generateAndShowNotification, getRandomInt(5000, 10000));

    // Cleanup on unmount to clear both timers
    return () => {
      if (visibilityTimerRef.current) {
        window.clearTimeout(visibilityTimerRef.current);
      }
      if (scheduleTimerRef.current) {
        window.clearTimeout(scheduleTimerRef.current);
      }
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  if (!notification) return null;

  return (
    <div
      className={`fixed bottom-6 left-6 z-50 bg-brand-dark-200 border border-brand-purple/50 rounded-xl shadow-2xl shadow-brand-purple/20 p-4 max-w-sm w-full transition-all duration-500 ease-in-out transform ${
        isVisible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
      }`}
    >
      <button 
        onClick={handleClose}
        className="absolute top-2 right-2 text-slate-500 hover:text-white transition-colors z-10"
        aria-label="Fechar notificação"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
      <div className="flex items-center">
        <div className="bg-gradient-to-br from-brand-purple to-brand-pink p-3 rounded-full mr-4 text-white shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.917l9 3 9-3A12.02 12.02 0 0021 8.944a11.955 11.955 0 01-3.382-.962z" /></svg>
        </div>
        <div>
          <p className="font-bold text-white">{notification.name}</p>
          <p className="text-sm text-slate-300 pr-4">
            acabou de comprar {notification.quantity} {notification.service} para {notification.platform}.
          </p>
        </div>
      </div>
    </div>
  );
};