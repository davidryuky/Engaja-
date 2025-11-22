
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { OrderSection } from './components/OrderSection';
import { AdvantagesSection } from './components/AdvantagesSection';
import { FaqSection } from './components/FaqSection';
import { SocialIconsSection } from './components/SocialIconsSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { ContactSection } from './components/ContactSection';
import { WhatsAppButton } from './components/WhatsAppButton';
import { Footer } from './components/Footer';
import { AnimatedSection } from './components/AnimatedSection';
import { SocialProof } from './components/SocialProof';
import { FreeTrialModal } from './components/FreeTrialModal';
import { ExitIntentModal } from './components/ExitIntentModal';
import { LoginPage } from './components/LoginPage';
import { DashboardPage } from './components/DashboardPage';


const App: React.FC = () => {
  const [isFreeTrialModalOpen, setIsFreeTrialModalOpen] = useState(false);
  const [isExitIntentModalOpen, setIsExitIntentModalOpen] = useState(false);
  
  // --- AUTH & ROUTING STATE ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [route, setRoute] = useState(window.location.hash);
  const [isLoading, setIsLoading] = useState(true);

  // --- SETTINGS STATE ---
  const [whatsappNumber, setWhatsappNumber] = useState('818075997250'); // Default fallback

  // Effect to fetch global settings like WhatsApp number
  useEffect(() => {
    const fetchSettings = async () => {
        try {
            const response = await fetch('/api/settings');
            
            // Se a resposta for OK (200-299), processa o JSON
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.value) {
                    setWhatsappNumber(data.value);
                }
            } 
            // Se for 404 (Preview) ou outro erro, falha silenciosamente e usa o padrão
        } catch (error) {
            // Silently ignore errors to keep console clean in preview/dev modes
        }
    };
    fetchSettings();
  }, []);

  // Effect to handle hash changes for navigation
  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);
  
  // Effect to check for an active session on initial load
  useEffect(() => {
    try {
        const sessionActive = sessionStorage.getItem('engaja_plus_auth') === 'true';
        const persistentSession = localStorage.getItem('engaja_plus_auth') === 'true';
        if (sessionActive || persistentSession) {
            setIsAuthenticated(true);
        }
    } catch (error) {
        console.error("Could not access storage: ", error);
    }
    setIsLoading(false);
  }, []);

  // Effect for the exit intent modal
  useEffect(() => {
    const handleMouseOut = (e: MouseEvent) => {
      // Only show on homepage
      if (route !== '' && route !== '#home' && route !== '#') return;

      if (e.clientY <= 0 && !isExitIntentModalOpen) {
        try {
          const alreadyShown = sessionStorage.getItem('exit_intent_shown');
          if (!alreadyShown) {
            setIsExitIntentModalOpen(true);
            sessionStorage.setItem('exit_intent_shown', 'true');
          }
        } catch (error) {
          console.error("Could not access sessionStorage: ", error);
        }
      }
    };

    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, [isExitIntentModalOpen, route]);


  // --- AUTH HANDLERS ---
  const handleLoginSuccess = (rememberMe: boolean) => {
    try {
        if (rememberMe) {
            localStorage.setItem('engaja_plus_auth', 'true');
        } else {
            sessionStorage.setItem('engaja_plus_auth', 'true');
        }
    } catch (error) {
        console.error("Could not access storage: ", error);
    }
    setIsAuthenticated(true);
    window.location.hash = '#/dashboard';
  };

  const handleLogout = () => {
    try {
        localStorage.removeItem('engaja_plus_auth');
        sessionStorage.removeItem('engaja_plus_auth');
    } catch (error) {
        console.error("Could not access storage: ", error);
    }
    setIsAuthenticated(false);
    window.location.hash = '#/login';
  };

  if (isLoading) {
    // Prevents flicker while checking auth status
    return <div className="bg-brand-dark min-h-screen"></div>;
  }

  // --- ROUTER LOGIC ---
  if (route === '#/login') {
    if (isAuthenticated) {
        window.location.hash = '#/dashboard';
        return null;
    }
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  if (route === '#/dashboard') {
    if (!isAuthenticated) {
        window.location.hash = '#/login';
        return null;
    }
    return <DashboardPage onLogout={handleLogout} />;
  }
  
  // --- DEFAULT HOME PAGE ---
  return (
    <div className="bg-brand-dark min-h-screen text-slate-100 font-sans overflow-x-hidden">
      <Header onFreeTrialClick={() => setIsFreeTrialModalOpen(true)} />
      <main>
        <HeroSection />
        <OrderSection whatsappNumber={whatsappNumber} />
        <AnimatedSection>
          <AdvantagesSection />
        </AnimatedSection>
        <AnimatedSection>
          <FaqSection />
        </AnimatedSection>
        <AnimatedSection>
          <SocialIconsSection />
        </AnimatedSection>
        <AnimatedSection>
          <TestimonialsSection />
        </AnimatedSection>
        <AnimatedSection>
          <ContactSection whatsappNumber={whatsappNumber} />
        </AnimatedSection>
      </main>
      <Footer />
      <WhatsAppButton whatsappNumber={whatsappNumber} />
      <SocialProof />
      <FreeTrialModal 
        isOpen={isFreeTrialModalOpen} 
        onClose={() => setIsFreeTrialModalOpen(false)} 
        whatsappNumber={whatsappNumber}
      />
      <ExitIntentModal
        isOpen={isExitIntentModalOpen}
        onClose={() => setIsExitIntentModalOpen(false)}
        whatsappNumber={whatsappNumber}
      />
    </div>
  );
};

export default App;
