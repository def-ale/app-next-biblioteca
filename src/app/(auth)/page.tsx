'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-lg dark:bg-gray-800">
        <div className="flex flex-col items-center">
          <Image src="/globe.svg" alt="Logo" width={64} height={64} />
          <h1 className="mt-6 text-3xl font-extrabold text-center text-gray-900 dark:text-white">
            Bem-vindo à Biblioteca
          </h1>
          <p className="mt-2 text-sm text-center text-gray-600 dark:text-gray-400">
            Faça login para continuar
          </p>
        </div>
        <form onSubmit={submeterFormulario} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Email
            </label>
            <div className="mt-1">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                placeholder="seu@email.com"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="senha"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Senha
            </label>
            <div className="mt-1">
              <input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                placeholder="Sua senha"
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="w-full px-4 py-3 font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300"
            >
              Entrar
            </button>
          </div>
        </form>
        {mensagem && (
          <p className="mt-4 text-center text-red-500 dark:text-red-400">
            {mensagem}
          </p>
        )}
      </div>
    </div>
  );
}

