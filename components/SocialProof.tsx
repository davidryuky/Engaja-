import React, { useState, useEffect, useRef } from 'react';

// --- DADOS PARA GERAÇÃO ALEATÓRIA ---
const names = ['Ana B.', 'Lucas M.', 'Beatriz S.', 'Carlos P.', 'Mariana F.', 'Pedro A.', 'Sofia R.', 'Ricardo J.', 'Julia C.', 'Gustavo L.', 'Fernanda T.', 'Rafael G.'];
const services = {
  'Instagram': ['seguidores', 'curtidas', 'visualizações'],
  'TikTok': ['seguidores', 'curtidas', 'visualizações'],
  'YouTube': ['inscritos', 'visualizações'],
  'Twitch': ['seguidores'],
  'Facebook': ['curtidas de Página', 'curtidas em Postagens'],
};
const platforms = Object.keys(services);

// --- FUNÇÕES AUXILIARES ---
const getRandomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// --- TIPAGEM ---
type NotificationData = {
  id: number; // Adicionado para ser usado como key
  name: string;
  quantity: string;
  service: string;
  platform: string;
};

export const SocialProof: React.FC = () => {
  const [notification, setNotification] = useState<NotificationData | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [userHasClosed, setUserHasClosed] = useState(false);

  // Refs para guardar os IDs dos timers de forma segura entre renderizações
  const scheduleTimerRef = useRef<number | null>(null);
  const visibilityTimerRef = useRef<number | null>(null);

  const lastNotificationNameRef = useRef<string | null>(null);
  const isFirstRunRef = useRef(true);

  // Efeito para agendar a criação de novas notificações
  useEffect(() => {
    // Para o loop se o usuário fechou manualmente
    if (userHasClosed) {
      if (scheduleTimerRef.current) {
        window.clearTimeout(scheduleTimerRef.current);
      }
      return;
    }

    const scheduleNext = () => {
      const delay = isFirstRunRef.current 
        ? getRandomInt(5000, 10000) 
        : getRandomInt(20000, 30000);

      scheduleTimerRef.current = window.setTimeout(() => {
        let name;
        do {
          name = getRandomItem(names);
        } while (name === lastNotificationNameRef.current);
        lastNotificationNameRef.current = name;

        const platform = getRandomItem(platforms);
        const service = getRandomItem(services[platform as keyof typeof services]);
        const quantity = getRandomInt(1, 100) * 100;

        setNotification({
          id: Date.now(),
          name,
          quantity: quantity.toLocaleString('pt-BR'),
          service,
          platform,
        });
        
        isFirstRunRef.current = false;
        scheduleNext(); // Re-agenda o próximo
      }, delay);
    };

    scheduleNext();

    // Função de limpeza: garante que o timer seja limpo ao desmontar o componente
    return () => {
      if (scheduleTimerRef.current) {
        window.clearTimeout(scheduleTimerRef.current);
      }
    };
  }, [userHasClosed]);

  // Efeito para controlar a exibição da notificação atual
  useEffect(() => {
    if (notification) {
      setIsVisible(true);

      visibilityTimerRef.current = window.setTimeout(() => {
        setIsVisible(false);
      }, 3000); // Fica visível por 3 segundos
    }

    return () => {
      if (visibilityTimerRef.current) {
        window.clearTimeout(visibilityTimerRef.current);
      }
    };
  }, [notification]);

  const handleClose = () => {
    setUserHasClosed(true);
    setIsVisible(false);
    // Limpa timers imediatamente ao fechar
    if (scheduleTimerRef.current) window.clearTimeout(scheduleTimerRef.current);
    if (visibilityTimerRef.current) window.clearTimeout(visibilityTimerRef.current);
  };

  return (
    <div
      key={notification?.id}
      className={`fixed bottom-4 left-4 z-50 bg-brand-dark-200 border border-brand-purple/50 rounded-xl shadow-2xl shadow-brand-purple/20 p-4 w-[calc(100vw-2rem)] max-w-sm transition-all duration-500 ease-in-out transform ${
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
      {notification && (
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
      )}
    </div>
  );
};