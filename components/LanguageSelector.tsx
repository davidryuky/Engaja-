
import React, { useEffect, useState } from 'react';

export const LanguageSelector: React.FC = () => {
    const [currentLang, setCurrentLang] = useState('pt');

    // Helper to get cookie value
    const getCookie = (name: string) => {
        const v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
        return v ? v[2] : null;
    };

    // Helper to set cookie for Google Translate
    const setLanguageCookie = (lang: string) => {
        // Format: /source_lang/target_lang
        // We assume source is always 'pt'
        let value = '/pt/pt';
        if (lang === 'en') value = '/pt/en';
        if (lang === 'ja') value = '/pt/ja';
        
        // It's important to set the domain correctly so subdomains share it if needed,
        // but usually for simple sites root path on hostname is enough.
        document.cookie = `googtrans=${value}; path=/; domain=${window.location.hostname}`;
        document.cookie = `googtrans=${value}; path=/;`; // Fallback
    };

    useEffect(() => {
        const cookie = getCookie('googtrans');
        
        if (cookie) {
            // Cookie exists, set state based on it
            if (cookie.includes('/en')) {
                setCurrentLang('en');
            } else if (cookie.includes('/ja')) {
                setCurrentLang('ja');
            } else {
                setCurrentLang('pt');
            }
        } else {
            // No cookie, detect browser language
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
    }, []);

    const changeLanguage = (lang: string) => {
        if (lang === currentLang) return;
        
        setLanguageCookie(lang);
        setCurrentLang(lang);
        window.location.reload(); // Reload is required to trigger Google Translate script
    };

    return (
        <div className="flex items-center gap-2 border border-brand-purple/30 rounded-full px-3 py-1 bg-brand-dark-200">
            <button 
                onClick={() => changeLanguage('pt')}
                className={`text-xs font-bold transition-all duration-300 ${currentLang === 'pt' ? 'text-brand-pink' : 'text-slate-400 hover:text-white'}`}
                title="Português"
            >
                PT
            </button>
            <span className="text-slate-600 text-xs">|</span>
            <button 
                 onClick={() => changeLanguage('en')}
                 className={`text-xs font-bold transition-all duration-300 ${currentLang === 'en' ? 'text-brand-pink' : 'text-slate-400 hover:text-white'}`}
                 title="English"
            >
                EN
            </button>
            <span className="text-slate-600 text-xs">|</span>
            <button 
                 onClick={() => changeLanguage('ja')}
                 className={`text-xs font-bold transition-all duration-300 ${currentLang === 'ja' ? 'text-brand-pink' : 'text-slate-400 hover:text-white'}`}
                 title="Japanese"
            >
                JP
            </button>
        </div>
    );
};
