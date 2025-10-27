import React, { useState } from 'react';
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

const App: React.FC = () => {
  const [isFreeTrialModalOpen, setIsFreeTrialModalOpen] = useState(false);

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
    </div>
  );
};

export default App;
