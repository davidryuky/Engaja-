import React from 'react';

// FIX: Replaced JSX.Element with React.ReactElement to resolve the "Cannot find namespace 'JSX'" error.
const AdvantageCard: React.FC<{ icon: React.ReactElement; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="relative bg-brand-dark-200 p-6 rounded-xl border border-brand-purple/30 transition-all duration-300 hover:border-brand-pink hover:shadow-2xl hover:shadow-brand-purple/20 hover:-translate-y-2 group overflow-hidden">
    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
    <div className="relative z-10">
      <div className="flex items-center mb-4">
        <div className="bg-gradient-to-br from-brand-purple to-brand-pink p-3 rounded-full mr-4 text-white shadow-lg shadow-brand-purple/30">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-white">{title}</h3>
      </div>
      <p className="text-slate-300">{description}</p>
    </div>
  </div>
);

export const AdvantagesSection: React.FC = () => {
  const advantages = [
    {
      icon: <RocketIcon />,
      title: 'Maior Alcance',
      description: 'Expanda sua audiência e chegue a milhares de novos usuários interessados no seu conteúdo.',
    },
    {
      icon: <BoltIcon />,
      title: 'Engajamento Rápido',
      description: 'Acelere o crescimento do seu perfil com interações genuínas e um público mais ativo.',
    },
    {
      icon: <ShieldCheckIcon />,
      title: 'Credibilidade Online',
      description: 'Um perfil com mais seguidores transmite autoridade e confiança, atraindo mais parcerias e clientes.',
    },
    {
      icon: <ChartBarIcon />,
      title: 'Crescimento de Marca',
      description: 'Fortaleça sua marca pessoal ou empresarial, tornando-se uma referência no seu nicho de mercado.',
    },
    {
      icon: <SupportIcon />,
      title: 'Suporte 24/7',
      description: 'Nossa equipe está disponível a qualquer hora para tirar suas dúvidas e garantir sua total satisfação com o serviço.',
    },
    {
      icon: <LockIcon />,
      title: 'Segurança e Sigilo',
      description: 'Sua privacidade é nossa prioridade. Nunca solicitamos sua senha e garantimos total discrição no processo.',
    },
  ];

  return (
    <section className="py-20 md:py-32 bg-brand-dark relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[50%] h-[50%] bg-brand-purple/10 rounded-full blur-3xl -z-0"></div>
        <div className="container mx-auto px-6 relative z-10">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-extrabold text-white">
                    Por que escolher a <span className="text-brand-pink">Engaja+</span>?
                </h2>
                <p className="mt-4 text-lg text-slate-300 max-w-3xl mx-auto">
                    Oferecemos mais do que números. Entregamos a base para o seu sucesso digital em plataformas como Instagram, TikTok, YouTube, Facebook, Twitter e LinkedIn.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {advantages.map((adv) => (
                    <AdvantageCard key={adv.title} {...adv} />
                ))}
            </div>
        </div>
    </section>
  );
};

// SVG Icons
const RocketIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
);
const BoltIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
);
const ShieldCheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.917l9 3 9-3A12.02 12.02 0 0021 8.944a11.955 11.955 0 01-3.382-.962z" /></svg>
);
const ChartBarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5z" /></svg>
);
const SupportIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
);
const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
);