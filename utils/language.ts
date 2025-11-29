
export type Language = 'pt' | 'en' | 'ja';

export const getCurrentLanguage = (): Language => {
  if (typeof document === 'undefined') return 'pt';
  
  const match = document.cookie.match(new RegExp('(^| )googtrans=([^;]+)'));
  if (match) {
    const value = match[2]; // ex: "/pt/en"
    if (value.includes('/en')) return 'en';
    if (value.includes('/ja')) return 'ja';
  }
  return 'pt';
};

const translations = {
  pt: {
    whatsapp_initial: 'Olá! Gostaria de tirar uma dúvida.',
    contact_section: 'Olá! Vim pelo site e gostaria de mais informações.',
    free_trial: (social: string) => `Olá! Gostaria de receber o teste de 50 seguidores para ${social}.`,
    exit_intent: 'Olá! Vi a oferta de saída no site e gostaria de resgatar meu cupom de 5% de desconto na Arvex Social.',
    
    // Order Messages
    order_intro: 'Olá! Gostaria de fazer um pedido na Arvex Social:',
    order_custom_intro: 'Olá! Gostaria de solicitar um serviço personalizado na Arvex Social:',
    label_social: 'Rede Social',
    label_service: 'Serviço',
    label_quantity: 'Quantidade',
    label_link: 'Link',
    label_comments: 'Comentários',
    label_order_id: 'ID do Pedido',
    label_request: 'Pedido',
  },
  en: {
    whatsapp_initial: 'Hello! I have a question.',
    contact_section: 'Hello! I came from the website and would like more information.',
    free_trial: (social: string) => `Hello! I would like to get the 50 free followers trial for ${social}.`,
    exit_intent: 'Hello! I saw the exit offer on the site and would like to claim my 5% discount coupon at Arvex Social.',
    
    // Order Messages
    order_intro: 'Hello! I would like to place an order at Arvex Social:',
    order_custom_intro: 'Hello! I would like to request a custom service at Arvex Social:',
    label_social: 'Social Network',
    label_service: 'Service',
    label_quantity: 'Quantity',
    label_link: 'Link',
    label_comments: 'Comments',
    label_order_id: 'Order ID',
    label_request: 'Request',
  },
  ja: {
    whatsapp_initial: 'こんにちは！質問があります。',
    contact_section: 'こんにちは！ウェブサイトを見て連絡しました。詳細を知りたいです。',
    free_trial: (social: string) => `こんにちは！${social}の50フォロワー無料トライアルを受け取りたいです。`,
    exit_intent: 'こんにちは！サイトの限定オファーを見ました。Arvex Socialの5%割引クーポンを使いたいです。',
    
    // Order Messages
    order_intro: 'こんにちは！Arvex Socialで注文したいです：',
    order_custom_intro: 'こんにちは！Arvex Socialでカスタムサービスを依頼したいです：',
    label_social: 'SNS',
    label_service: 'サービス',
    label_quantity: '数量',
    label_link: 'リンク',
    label_comments: 'コメント',
    label_order_id: '注文ID',
    label_request: '依頼内容',
  }
};

export const getTranslation = (key: keyof typeof translations['pt'], params?: any) => {
  const lang = getCurrentLanguage();
  const text = translations[lang][key];
  
  if (typeof text === 'function') {
    return text(params);
  }
  return text;
};
