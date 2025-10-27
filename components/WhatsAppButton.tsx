import React from 'react';

export const WhatsAppButton: React.FC = () => {
  const phoneNumber = '818075997250';
  const message = 'Olá! Gostaria de tirar uma dúvida.';
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full flex items-center justify-center shadow-lg transition-transform transform hover:scale-110 z-50 animate-pulse-slow"
      aria-label="Fale conosco no WhatsApp"
      style={{ animation: 'pulse-slow 2s infinite' }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 4.315 1.919 6.066l-1.472 5.375 5.457-1.429zM9.266 8.579c-.331-.166-.761-.375-1.097-.442-.29-.057-.665-.063-.91.232-.249.296-.948.924-.948 2.246s.972 2.603 1.103 2.784c.13.18.938 1.403 2.301 2.012 1.148.508 1.923.692 2.37.886.68.293 1.18.232 1.54.148.431-.104 1.36-1.127 1.36-2.247s-.058-1.127-.116-1.232c-.058-.105-.331-.167-.666-.333-.335-.166-.948-.442-1.097-.499-.149-.057-.299-.057-.448.057-.15.116-.549.693-.666.81-.116.116-.233.116-.42.057-.187-.057-.743-.267-1.416-.864-.521-.466-.874-1.041-.99-1.216-.116-.175-.01- .275.057-.392.058-.116.13-.187.188-.244.058-.057.087-.116.13-.187.058-.088.029-.146-.029-.204-.058-.057-.521-1.232-.718-1.666z" />
      </svg>
      <style>{`
        @keyframes pulse-slow {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.5);
          }
          70% {
            transform: scale(1.05);
            box-shadow: 0 0 0 10px rgba(34, 197, 94, 0);
          }
        }
      `}</style>
    </a>
  );
};