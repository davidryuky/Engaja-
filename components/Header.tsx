
import React, { useState, useEffect } from 'react';
import { handleScroll } from '../utils/scroll';
import { LanguageSelector } from './LanguageSelector';

const NavLink: React.FC<{ href: string; children: React.ReactNode; onClick?: () => void }> = ({ href, children, onClick }) => (
  <a
    href={href}
    onClick={(e) => handleScroll(e, onClick)}
    className="text-slate-200 hover:text-brand-pink transition-colors duration-300 text-lg group"
  >
    {children}
    <span className="block max-w-0 group-hover:max-w-full transition-all duration-500 h-0.5 bg-brand-pink"></span>
  </a>
);

export const Header: React.FC<{ onFreeTrialClick: () => void }> = ({ onFreeTrialClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScrollEvent = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScrollEvent);
    return () => window.removeEventListener('scroll', handleScrollEvent);
  }, []);
  
  const handleMobileLinkClick = (callback?: () => void) => {
      if (callback) callback();
      setIsMenuOpen(false);
  }

  return (
    <>
      <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-brand-dark/80 backdrop-blur-lg border-b border-brand-dark-200' : 'bg-transparent'}`}>
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <a href="#home" onClick={handleScroll} className="transition-transform hover:scale-105 flex items-center group">
            {/* New Text Logo */}
            <span className="text-3xl font-extrabold text-white tracking-tight group-hover:text-slate-100 transition-colors">
              Arvex<span className="text-brand-pink font-light ml-1">Social</span>
            </span>
          </a>
          <div className="hidden md:flex items-center gap-6">
             <nav className="flex space-x-6 items-center">
                <NavLink href="#comprar">Comprar Agora</NavLink>
                <NavLink href="#depoimentos">Depoimentos</NavLink>
                <NavLink href="#contato">Contato</NavLink>
            </nav>
            
            <div className="h-6 w-px bg-slate-700 mx-2"></div>
            
            <LanguageSelector />
            
             <button
                onClick={onFreeTrialClick}
                className="bg-gradient-to-r from-brand-purple to-brand-pink hover:from-brand-pink hover:to-brand-purple text-white font-semibold py-2 px-6 rounded-full text-base transition-all duration-300 transform hover:scale-105 shadow-md shadow-brand-purple/30"
              >
                Teste Grátis
              </button>
          </div>
          <div className="md:hidden flex items-center gap-4">
             <LanguageSelector />
             <button onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Open menu" className="z-50 relative w-8 h-8">
              <span className={`block absolute h-0.5 w-full bg-white transition-all duration-300 ${isMenuOpen ? 'rotate-45 top-1/2' : 'top-2'}`}></span>
              <span className={`block absolute h-0.5 w-full bg-white transition-all duration-300 top-1/2 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`block absolute h-0.5 w-full bg-white transition-all duration-300 ${isMenuOpen ? '-rotate-45 top-1/2' : 'bottom-2'}`}></span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div 
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'bg-black/50' : 'bg-transparent pointer-events-none'}`}
        onClick={() => setIsMenuOpen(false)}
      >
        <div 
          className={`fixed top-0 right-0 h-full w-2/3 max-w-xs bg-brand-dark-200/90 backdrop-blur-xl shadow-2xl transition-transform duration-500 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <nav className="flex flex-col items-center justify-center h-full space-y-8">
            <button
                onClick={() => handleMobileLinkClick(onFreeTrialClick)}
                className="bg-gradient-to-r from-brand-purple to-brand-pink hover:from-brand-pink hover:to-brand-purple text-white font-semibold py-3 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-brand-purple/40"
            >
                Teste Grátis
            </button>
            <NavLink href="#comprar" onClick={() => setIsMenuOpen(false)}>Comprar Agora</NavLink>
            <NavLink href="#depoimentos" onClick={() => setIsMenuOpen(false)}>Depoimentos</NavLink>
            <NavLink href="#contato" onClick={() => setIsMenuOpen(false)}>Contato</NavLink>
          </nav>
        </div>
      </div>
    </>
  );
};
