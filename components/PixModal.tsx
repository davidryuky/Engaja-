import React, { useState, useEffect } from 'react';
import { X as CloseIcon, Copy, Check } from 'lucide-react';

// --- TYPE DEFINITIONS ---
interface Order {
    id: number;
    public_id: string;
}
interface PixModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
}

// --- PIX QR CODE GENERATION LOGIC ---
// (Simplified CRC16 implementation for Pix)
const crc16 = (payload: string): string => {
  let crc = 0xFFFF;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }
    }
  }
  return ('0000' + (crc & 0xFFFF).toString(16).toUpperCase()).slice(-4);
};

const generatePixCode = (pixKey: string, amount: string, txid: string): string => {
  const merchantName = "Engaja+";
  const merchantCity = "SAO PAULO";

  const formatValue = (id: string, value: string): string => {
    const len = ('00' + value.length).slice(-2);
    return id + len + value;
  };
  
  const payloadAmount = parseFloat(amount.replace(',', '.')).toFixed(2);
  
  const payload = [
    formatValue('00', '01'), // Payload Format Indicator
    formatValue('26', 
        formatValue('00', 'br.gov.bcb.pix') + // GUI
        formatValue('01', pixKey) // Chave PIX
    ),
    formatValue('52', '0000'), // Merchant Category Code
    formatValue('53', '986'), // Transaction Currency (BRL)
    formatValue('54', payloadAmount), // Amount
    formatValue('58', 'BR'), // Country Code
    formatValue('59', merchantName), // Merchant Name
    formatValue('60', merchantCity), // Merchant City
    formatValue('62', formatValue('05', txid.replace(/[^a-zA-Z0-9]/g, ''))), // Transaction ID
  ].join('');

  const finalPayload = payload + '6304'; // Additional Data Field Template + CRC16 ID
  const crc = crc16(finalPayload);
  
  return finalPayload + crc;
};


// --- COMPONENT ---

export const PixModal: React.FC<PixModalProps> = ({ isOpen, onClose, order }) => {
  const [pixKey, setPixKey] = useState('');
  const [amount, setAmount] = useState('');
  const [generatedPix, setGeneratedPix] = useState('');
  const [hasCopied, setHasCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
        try {
            const savedKey = localStorage.getItem('engaja_plus_pix_key');
            if (savedKey) {
                setPixKey(savedKey);
            }
        } catch (error) {
            console.error("Could not access localStorage:", error);
        }
        setGeneratedPix('');
        setAmount('');
        setHasCopied(false);
    }
  }, [isOpen]);

  const handleGenerate = () => {
    if (!pixKey.trim() || !amount.trim()) {
        alert('Por favor, preencha a Chave Pix e o Valor.');
        return;
    }
    try {
        localStorage.setItem('engaja_plus_pix_key', pixKey);
    } catch (error) {
        console.error("Could not save to localStorage:", error);
    }

    const code = generatePixCode(pixKey, amount, order.public_id);
    setGeneratedPix(code);
  };
  
  const handleCopy = () => {
      navigator.clipboard.writeText(generatedPix);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-brand-dark-200 border border-brand-purple/50 rounded-2xl shadow-2xl shadow-brand-purple/20 p-8 max-w-lg w-full text-center relative animate-fadeInUp"
        onClick={(e) => e.stopPropagation()}
        style={{ animationDuration: '0.5s' }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors z-10"
          aria-label="Fechar modal"
        >
          <CloseIcon className="h-6 w-6" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-2">
          Gerar Cobrança Pix
        </h2>
        <p className="text-sm text-brand-pink font-mono mb-6">Pedido: {order.public_id}</p>

        {!generatedPix ? (
             <div className="space-y-4 text-left">
                <div>
                    <label htmlFor="pixKey" className="block text-slate-300 text-sm font-bold mb-2">Sua Chave Pix</label>
                    <input
                        id="pixKey"
                        type="text"
                        value={pixKey}
                        onChange={(e) => setPixKey(e.target.value)}
                        placeholder="CPF, CNPJ, E-mail, Telefone ou Chave Aleatória"
                        className="w-full bg-brand-dark border-2 border-brand-purple/30 rounded-lg p-3 text-white focus:outline-none focus:border-brand-pink transition-colors duration-300"
                    />
                </div>
                 <div>
                    <label htmlFor="amount" className="block text-slate-300 text-sm font-bold mb-2">Valor (R$)</label>
                    <input
                        id="amount"
                        type="text"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value.replace(/[^0-9,.]/g, ''))}
                        placeholder="Ex: 49,90"
                        className="w-full bg-brand-dark border-2 border-brand-purple/30 rounded-lg p-3 text-white focus:outline-none focus:border-brand-pink transition-colors duration-300"
                    />
                </div>
                <button 
                    onClick={handleGenerate}
                    className="w-full mt-4 bg-gradient-to-r from-brand-purple to-brand-pink hover:from-brand-pink hover:to-brand-purple text-white font-bold py-3 px-4 rounded-full transition-all duration-300 transform hover:scale-105"
                >
                    Gerar Pix Copia e Cola
                </button>
            </div>
        ) : (
            <div className="space-y-4">
                <p className="text-slate-300">Pix gerado com sucesso! Envie o código abaixo para o cliente.</p>
                <div className="bg-brand-dark p-4 rounded-lg border border-brand-purple/30 text-left">
                    <p className="text-white break-all text-xs font-mono">{generatedPix}</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={handleCopy}
                        className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-full transition-colors duration-300"
                    >
                        {hasCopied ? <><Check className="w-5 h-5" /> Copiado!</> : <><Copy className="w-5 h-5" /> Copiar Código</>}
                    </button>
                     <button
                        onClick={() => setGeneratedPix('')}
                        className="flex-1 bg-brand-dark-200 hover:bg-opacity-80 border border-brand-purple/50 text-white font-semibold py-3 px-4 rounded-full transition-colors duration-300"
                    >
                        Gerar Novo
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};