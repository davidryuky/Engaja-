import React, { useState, useEffect } from 'react';

const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, callback?: () => void) => {
  e.preventDefault();
  const href = e.currentTarget.getAttribute('href');
  if (href && href.startsWith('#')) {
    const targetElement = document.querySelector(href);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
      if (callback) {
        callback();
      }
    }
  }
};

const NavLink: React.FC<{ href: string; children: React.ReactNode; onClick?: () => void }> = ({ href, children, onClick }) => (
  <a
    href={href}
    onClick={(e) => handleScroll(e, onClick)}
    className="text-slate-200 hover:text-brand-lilac transition-colors duration-300 text-lg group"
  >
    {children}
    <span className="block max-w-0 group-hover:max-w-full transition-all duration-500 h-0.5 bg-brand-lilac"></span>
  </a>
);

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScrollEvent = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScrollEvent);
    return () => window.removeEventListener('scroll', handleScrollEvent);
  }, []);
  
  const navLinks = [
    { href: '#home', label: 'Home' },
    { href: '#comprar', label: 'Comprar Agora' },
    { href: '#depoimentos', label: 'Depoimentos' },
    { href: '#contato', label: 'Contato' },
  ];

  return (
    <>
      <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-brand-dark/80 backdrop-blur-lg border-b border-brand-dark-200' : 'bg-transparent'}`}>
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <a href="#home" onClick={handleScroll} className="transition-transform hover:scale-105">
            <img src="https://i.postimg.cc/jj7rdzv8/logoengaja.png" alt="Engaja+ Logo" className="h-14" />
          </a>
          <nav className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <NavLink key={link.href} href={link.href}>
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="md:hidden">
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
            {navLinks.map((link) => (
              <NavLink key={link.href} href={link.href} onClick={() => setIsMenuOpen(false)}>
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
};