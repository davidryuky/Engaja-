import React from 'react';

// Star Icon component
const StarIcon: React.FC<{ filled: boolean }> = ({ filled }) => (
  <svg
    className={`w-5 h-5 ${filled ? 'text-yellow-400' : 'text-gray-600'}`}
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.366 2.446a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.366-2.446a1 1 0 00-1.175 0l-3.366 2.446c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.064 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z" />
  </svg>
);

const TestimonialCard: React.FC<{ testimonial: TestimonialData }> = ({ testimonial }) => (
  <div className="relative bg-brand-dark-200 p-8 rounded-xl border border-purple-900/50 transition-all duration-300 hover:border-brand-lilac hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-2 flex flex-col h-full group overflow-hidden">
    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
    <div className="relative z-10 flex flex-col h-full">
      <div className="flex mb-4">
        {[...Array(5)].map((_, i) => (
          <StarIcon key={i} filled={i < testimonial.rating} />
        ))}
      </div>
      <p className="text-slate-300 italic mb-6 flex-grow">"{testimonial.text}"</p>
      <div className="flex items-center">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-purple to-purple-600 flex items-center justify-center mr-4 shadow-lg shadow-purple-500/20">
          {/* Simple User Icon */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
        </div>
        <div>
          <h4 className="font-bold text-white">{testimonial.name}</h4>
          <p className="text-sm text-brand-lilac">
            <span>{testimonial.handle.substring(0, 6)}</span>
            <span className="blur-sm">{testimonial.handle.substring(6)}</span>
          </p>
        </div>
      </div>
    </div>
  </div>
);

interface TestimonialData {
  name: string;
  handle: string;
  text: string;
  rating: number;
}

export const TestimonialsSection: React.FC = () => {
  const testimonials: TestimonialData[] = [
    {
      name: 'Julia S.',
      handle: '@juliadigital',
      text: 'Contratei o serviço com um pouco de receio, mas o resultado foi incrível! Meu perfil decolou em poucos dias e o engajamento aumentou muito. Super recomendo!',
      rating: 5,
    },
    {
      name: 'Marcos P.',
      handle: '@marcos_trainer',
      text: 'Como personal trainer, a credibilidade online é tudo. A Engaja+ me ajudou a construir uma base sólida de seguidores, o que atraiu muitos novos clientes.',
      rating: 5,
    },
    {
      name: 'Loja Belle',
      handle: '@lojabellemodas',
      text: 'Nossa loja online ganhou muito mais visibilidade. O aumento de seguidores trouxe confiança para novos compradores e impulsionou nossas vendas. Excelente!',
      rating: 5,
    },
  ];

  return (
    <section id="depoimentos" className="py-20 md:py-32 bg-brand-dark">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">
            O que nossos <span className="text-brand-lilac">Clientes Dizem</span>
          </h2>
          <p className="mt-4 text-lg text-slate-300 max-w-3xl mx-auto">
            A confiança e o sucesso de quem já transformou seu perfil com a gente.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
};