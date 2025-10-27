
import React from 'react';

interface Plan {
  name: string;
  followers: string;
  price: string;
  features: string[];
  popular: boolean;
}

const PlanCard: React.FC<{ plan: Plan }> = ({ plan }) => (
  <div className={`
    bg-brand-dark-200 rounded-2xl p-8 border-2 transition-all duration-300
    ${plan.popular ? 'border-brand-purple scale-105 shadow-2xl shadow-purple-500/20' : 'border-purple-900/50 hover:border-brand-lilac hover:scale-105'}
  `}>
    {plan.popular && (
      <span className="absolute -top-4 right-6 bg-brand-lilac text-brand-dark font-bold text-xs px-3 py-1 rounded-full uppercase">Mais Popular</span>
    )}
    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
    <p className="text-brand-lilac text-lg mb-6">{plan.followers} Seguidores</p>
    <p className="text-5xl font-extrabold text-white mb-6">{plan.price}</p>
    <ul className="space-y-4 mb-8 text-slate-300">
      {plan.features.map((feature, index) => (
        <li key={index} className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-green-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {feature}
        </li>
      ))}
    </ul>
    <a 
      href="#"
      className={`
        w-full block text-center font-bold py-3 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105
        ${plan.popular ? 'bg-brand-purple text-white hover:bg-purple-700' : 'bg-purple-900/50 text-slate-200 hover:bg-brand-purple'}
      `}
    >
      Comprar Agora
    </a>
  </div>
);

export const PlansSection: React.FC = () => {
  const plans: Plan[] = [
    {
      name: 'Plano Bronze',
      followers: '1.000',
      price: 'R$ 49,90',
      features: ['Entrega Rápida', 'Seguidores Reais', 'Suporte Básico'],
      popular: false,
    },
    {
      name: 'Plano Prata',
      followers: '5.000',
      price: 'R$ 199,90',
      features: ['Entrega Prioritária', 'Seguidores Reais e Ativos', 'Suporte 24/7 via Chat'],
      popular: true,
    },
    {
      name: 'Plano Ouro',
      followers: '10.000',
      price: 'R$ 349,90',
      features: ['Entrega Instantânea', 'Seguidores Premium', 'Suporte VIP e Gerente de Conta'],
      popular: false,
    },
  ];

  return (
    <section id="planos" className="py-20 md:py-32 bg-gradient-to-b from-brand-dark via-brand-dark-200 to-brand-dark">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">
            Nossos Planos
          </h2>
          <p className="mt-4 text-lg text-slate-300 max-w-3xl mx-auto">
            Escolha o plano ideal para seu perfil e comece a crescer hoje mesmo.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-8 relative">
          {plans.map((plan) => (
            <PlanCard key={plan.name} plan={plan} />
          ))}
        </div>
      </div>
    </section>
  );
};
