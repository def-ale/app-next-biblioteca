'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PaginaLogin() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Se o usuário já estiver logado, redireciona para o dashboard
    if (localStorage.getItem('token')) {
      router.push('/dashboard');
    }
  }, [router]);

  const submeterFormulario = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensagem('');

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password: senha }), // Envia a senha para o backend
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('token', data.token);
      window.dispatchEvent(new Event('token-change')); // Disparar o evento
      router.push('/dashboard');
    } else {
      setMensagem(`Login falhou: ${data.mensagem}`);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-900">Login</h1>
        <form onSubmit={submeterFormulario} className="space-y-6">
          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label
              htmlFor="senha"
              className="text-sm font-medium text-gray-700"
            >
              Senha
            </label>
            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Login
            </button>
          </div>
        </form>
        {mensagem && <p className="mt-4 text-center text-red-500">{mensagem}</p>}
      </div>
    </div>
  );
}

