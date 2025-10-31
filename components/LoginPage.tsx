import React, { useState } from 'react';

interface LoginPageProps {
  onLoginSuccess: (rememberMe: boolean) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const apiUrl = '/api/login';

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onLoginSuccess(rememberMe);
      } else {
        setError(data.message || 'Ocorreu um erro inesperado.');
      }
    } catch (err) {
      console.error('Falha na comunicação com o backend:', err);
      setError('Falha de comunicação. Verifique se o backend foi implantado e se as variáveis de ambiente estão corretas.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-brand-dark min-h-screen flex items-center justify-center font-sans p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <a href="#" onClick={(e) => { e.preventDefault(); window.location.hash = ''; }}>
              <img src="https://i.postimg.cc/jj7rdzv8/logoengaja.png" alt="Engaja+ Logo" className="h-20 mx-auto" />
            </a>
            <h1 className="text-2xl font-bold text-white mt-4">Acesso Administrativo</h1>
        </div>
        <div className="bg-brand-dark-200 border border-brand-purple/30 rounded-2xl shadow-2xl shadow-brand-purple/10 p-8">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="username" className="block text-slate-300 text-sm font-bold mb-2">
                Usuário
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-brand-dark border-2 border-brand-purple/30 rounded-lg p-3 text-white focus:outline-none focus:border-brand-pink transition-colors duration-300"
                required
                disabled={isLoading}
              />
            </div>
            <div className="mb-6">
              <label htmlFor="password" className="block text-slate-300 text-sm font-bold mb-2">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-brand-dark border-2 border-brand-purple/30 rounded-lg p-3 text-white focus:outline-none focus:border-brand-pink transition-colors duration-300"
                required
                disabled={isLoading}
              />
            </div>
             <div className="mb-6">
              <label className="flex items-center text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="form-checkbox h-5 w-5 bg-brand-dark border-brand-purple/50 rounded text-brand-pink focus:ring-brand-pink"
                  disabled={isLoading}
                />
                <span className="ml-2">Lembrar-me</span>
              </label>
            </div>
            {error && <p className="text-red-500 text-xs italic mb-4 text-center">{error}</p>}
            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-brand-purple to-brand-pink hover:from-brand-pink hover:to-brand-purple text-white font-bold py-3 px-4 rounded-full transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-wait"
                disabled={isLoading}
              >
                {isLoading ? 'Verificando...' : 'Entrar'}
              </button>
            </div>
          </form>
        </div>
        <div className="text-center mt-6">
            <a href="#" onClick={(e) => { e.preventDefault(); window.location.hash = ''; }} className="inline-block align-baseline font-bold text-sm text-brand-pink hover:text-pink-400">
                &larr; Voltar para o site
            </a>
        </div>
      </div>
    </div>
  );
};
