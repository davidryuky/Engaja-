import React, { useState } from 'react';

const FaqItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-purple-900/50 py-6 last:border-b-0">
      <button
        className="w-full flex justify-between items-center text-left text-lg md:text-xl font-semibold text-white focus:outline-none group"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className={`transition-colors duration-300 ${isOpen ? 'text-brand-lilac' : 'group-hover:text-slate-200'}`}>{question}</span>
        <svg
          className={`w-6 h-6 transform transition-transform duration-300 text-brand-lilac ${isOpen ? 'rotate-180' : 'rotate-0'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className={`grid overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <p className="text-slate-300 pr-8">{answer}</p>
        </div>
      </div>
    </div>
  );
};

export const FaqSection: React.FC = () => {
  const faqs = [
    {
      question: 'Como ter mais seguidores beneficia meu engajamento?',
      answer:
        'Um número maior de seguidores serve como prova social, aumentando a credibilidade do seu perfil. Isso atrai mais seguidores orgânicos, incentiva mais curtidas e comentários, e aumenta a visibilidade do seu conteúdo, fazendo com que os algoritmos o recomendem para mais pessoas.',
    },
    {
      question: 'É seguro comprar seguidores com a YouNextSocial?',
      answer:
        'Sim, totalmente seguro. Utilizamos métodos que estão em conformidade com as diretrizes das redes sociais. Nunca solicitamos sua senha, garantindo a total segurança e privacidade da sua conta.',
    },
    {
      question: 'Em quanto tempo receberei meus seguidores?',
      answer:
        'A entrega começa quase que instantaneamente após a confirmação do pagamento. O tempo total para a entrega completa depende da quantidade adquirida, mas nosso sistema é otimizado para ser o mais rápido e natural possível.',
    },
    {
      question: 'Os seguidores são perfis reais?',
      answer:
        'Trabalhamos com perfis de alta qualidade para garantir a melhor experiência. Embora o foco principal seja aumentar seus números para credibilidade, muitos perfis são ativos e podem interagir com seu conteúdo.',
    },
  ];

  return (
    <section id="faq" className="py-20 md:py-32 bg-gradient-to-b from-brand-dark via-brand-dark-200 to-brand-dark">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">
            Dúvidas Frequentes
          </h2>
          <p className="mt-4 text-lg text-slate-300 max-w-3xl mx-auto">
            Esclareça suas principais dúvidas sobre como podemos impulsionar seu sucesso.
          </p>
        </div>
        <div className="max-w-4xl mx-auto bg-brand-dark-200 p-4 md:p-8 rounded-2xl border border-purple-900/50">
          {faqs.map((faq, index) => (
            <FaqItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </section>
  );
};