
import React, { useState, useEffect } from 'react';

export const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('cookie_consent_accepted');
      if (!consent) {
        setIsVisible(true);
      }
    } catch (error) {
      console.error("Could not access localStorage: ", error);
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem('cookie_consent_accepted', 'true');
    } catch (error) {
      console.error("Could not access localStorage: ", error);
    }
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 bg-brand-dark-200/95 backdrop-blur-sm p-4 z-[60] shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.2)] transition-transform duration-500 transform ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}
    >
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-slate-300 text-sm text-center sm:text-left">
          Nós usamos cookies para melhorar sua experiência. Ao continuar a navegar, você concorda com nosso uso de cookies.
        </p>
        <button
          onClick={handleAccept}
          className="bg-brand-purple hover:bg-opacity-80 text-white font-semibold py-2 px-6 rounded-full text-sm transition-all duration-300 transform hover:scale-105 flex-shrink-0"
        >
          Aceitar
        </button>
      </div>
    </div>
  );
};
