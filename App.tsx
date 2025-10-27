
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
import { CookieConsent } from './components/CookieConsent';

const App: React.FC = () => {
  const [isFreeTrialModalOpen, setIsFreeTrialModalOpen] = useState(false);
  const [isExitIntentModalOpen, setIsExitIntentModalOpen] = useState(false);

  useEffect(() => {
    const handleMouseOut = (e: MouseEvent) => {
      // Check if mouse is leaving the top of the viewport and modal isn't already open
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
  }, [isExitIntentModalOpen]); // Rerun if modal state changes to avoid race conditions

  return (
    <div className="bg-brand-dark min-h-screen text-slate-100 font-sans overflow-x-hidden">
      <Header onFreeTrialClick={() => setIsFreeTrialModalOpen(true)} />
      <main>
        <HeroSection />
        <OrderSection />
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
          <ContactSection />
        </AnimatedSection>
      </main>
      <Footer />
      <WhatsAppButton />
      <SocialProof />
      <FreeTrialModal 
        isOpen={isFreeTrialModalOpen} 
        onClose={() => setIsFreeTrialModalOpen(false)} 
      />
      <ExitIntentModal
        isOpen={isExitIntentModalOpen}
        onClose={() => setIsExitIntentModalOpen(false)}
      />
      <CookieConsent />
    </div>
  );
};

export default App;
