
import React, { useEffect, useState, useRef } from 'react';
import { ChevronDown, Globe } from 'lucide-react';

// --- FLAG SVGS ---
const FlagBR = () => (
  <svg viewBox="0 0 32 24" className="w-5 h-4 rounded-[2px] shadow-sm">
    <rect width="32" height="24" fill="#009c3b" />
    <path d="M16 2L2 12l14 10 14-10L16 2z" fill="#ffdf00" />
    <circle cx="16" cy="12" r="5" fill="#002776" />
    <path d="M12 11c1.5 1 5.5 1 8 0" stroke="#fff" strokeWidth="0.8" fill="none" />
  </svg>
);

const FlagUS = () => (
  <svg viewBox="0 0 32 24" className="w-5 h-4 rounded-[2px] shadow-sm">
    <rect width="32" height="24" fill="#b22234" />
    <path d="M0 3h32M0 8h32M0 13h32M0 18h32M0 23h32" stroke="#fff" strokeWidth="2" />
    <rect width="14" height="13" fill="#3c3b6e" />
    <circle cx="3" cy="3" r="0.8" fill="#fff"/> <circle cx="7" cy="3" r="0.8" fill="#fff"/> <circle cx="11" cy="3" r="0.8" fill="#fff"/>
    <circle cx="5" cy="6" r="0.8" fill="#fff"/> <circle cx="9" cy="6" r="0.8" fill="#fff"/>
    <circle cx="3" cy="9" r="0.8" fill="#fff"/> <circle cx="7" cy="9" r="0.8" fill="#fff"/> <circle cx="11" cy="9" r="0.8" fill="#fff"/>
  </svg>
);

const FlagJP = () => (
  <svg viewBox="0 0 32 24" className="w-5 h-4 rounded-[2px] shadow-sm bg-white">
     <rect width="32" height="24" fill="#fff" />
    <circle cx="16" cy="12" r="7" fill="#bc002d" />
  </svg>
);

const languages = {
    pt: { label: 'PT', name: 'Português', icon: <FlagBR /> },
    en: { label: 'EN', name: 'English', icon: <FlagUS /> },
    ja: { label: 'JP', name: '日本語', icon: <FlagJP /> },
};

export const LanguageSelector: React.FC = () => {
    const [currentLang, setCurrentLang] = useState('pt');
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Helper to get cookie value
    const getCookie = (name: string) => {
        const v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
        return v ? v[2] : null;
    };

    // Helper to set cookie for Google Translate
    const setLanguageCookie = (lang: string) => {
        let value = '/pt/pt';
        if (lang === 'en') value = '/pt/en';
        if (lang === 'ja') value = '/pt/ja';
        
        document.cookie = `googtrans=${value}; path=/; domain=${window.location.hostname}`;
        document.cookie = `googtrans=${value}; path=/;`;
    };

    useEffect(() => {
        const cookie = getCookie('googtrans');
        if (cookie) {
            if (cookie.includes('/en')) setCurrentLang('en');
            else if (cookie.includes('/ja')) setCurrentLang('ja');
            else setCurrentLang('pt');
        } else {
            const browserLang = navigator.language.toLowerCase();
            if (browserLang.startsWith('en')) {
                setLanguageCookie('en');
                setCurrentLang('en');
                window.location.reload();
            } else if (browserLang.startsWith('ja')) {
                setLanguageCookie('ja');
                setCurrentLang('ja');
                window.location.reload();
            }
        }

        // Close dropdown on click outside
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const changeLanguage = (lang: string) => {
        if (lang === currentLang) {
            setIsOpen(false);
            return;
        }
        setLanguageCookie(lang);
        setCurrentLang(lang);
        setIsOpen(false);
        window.location.reload();
    };

    const activeLang = languages[currentLang as keyof typeof languages] || languages.pt;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 bg-brand-dark-200 border border-brand-purple/30 hover:border-brand-pink/50 rounded-full px-3 py-1.5 transition-all duration-300"
            >
                {activeLang.icon}
                <span className="text-xs font-bold text-slate-200 uppercase">{activeLang.label}</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-32 bg-brand-dark-200 border border-brand-purple/30 rounded-xl shadow-xl overflow-hidden z-50 animate-fadeInUp" style={{ animationDuration: '0.2s' }}>
                    {(Object.keys(languages) as Array<keyof typeof languages>).map((key) => (
                        <button
                            key={key}
                            onClick={() => changeLanguage(key)}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-brand-purple/20 transition-colors ${currentLang === key ? 'bg-brand-purple/10' : ''}`}
                        >
                            {languages[key].icon}
                            <span className={`text-sm font-medium ${currentLang === key ? 'text-brand-pink' : 'text-slate-300'}`}>
                                {languages[key].name}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
