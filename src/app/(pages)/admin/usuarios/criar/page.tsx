'use client';

import { useState } from 'react';
import { useAuth } from '@/app/lib/client/hooks/useAuth';

// Componente para feedback (sucesso/erro)
const FormFeedback = ({ message, isError }: { message: string; isError: boolean; }) => {
  if (!message) return null;

  const baseClasses = "p-4 rounded-md text-sm font-medium mb-6";
  const successClasses = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
  const errorClasses = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";

  return (
    <div className={`${baseClasses} ${isError ? errorClasses : successClasses}`}>
      {message}
    </div>
  );
};


export default function CriarUsuarioPage() {
  const { usuario, loading } = useAuth(['admin']);

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [perfil, setPerfil] = useState('aluno');
  const [feedback, setFeedback] = useState({ message: '', isError: false });

  const submeterFormulario = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback({ message: '', isError: false });

    const token = localStorage.getItem('token');
    if (!token) {
      setFeedback({ message: 'Acesso negado. Faça o login novamente.', isError: true });
      return;
    }

    try {
      const response = await fetch('/api/usuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ nome, email, senha, perfil }),
      });

      const data = await response.json();

      if (response.ok) {
        setFeedback({ message: 'Usuário criado com sucesso!', isError: false });
        // Limpar formulário
        setNome('');
        setEmail('');
        setSenha('');
        setPerfil('aluno');
      } else {
        throw new Error(data.mensagem || 'Ocorreu um erro.');
      }
    } catch (error) {
       setFeedback({ message: error instanceof Error ? `Erro: ${error.message}` : 'Erro de conexão.', isError: true });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <p className="text-lg text-gray-600 dark:text-gray-400">Verificando permissões...</p>
      </div>
    );
  }

  if (!usuario) {
    return null; // Hook useAuth faz o redirecionamento
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-black">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Criar Novo Usuário
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Preencha os dados para registrar um novo membro na biblioteca.
          </p>
        </header>

        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-8">
          <form onSubmit={submeterFormulario} className="space-y-6">
            <FormFeedback message={feedback.message} isError={feedback.isError} />
            
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nome Completo
              </label>
              <input
                id="nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                className="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Ex: João da Silva"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Ex: joao.silva@email.com"
              />
            </div>
            
            <div>
              <label htmlFor="senha" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Senha Provisória
              </label>
              <input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                className="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div>
              <label htmlFor="perfil" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Perfil de Acesso
              </label>
              <select
                id="perfil"
                value={perfil}
                onChange={(e) => setPerfil(e.target.value)}
                required
                className="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="aluno">Aluno</option>
                <option value="bibliotecario">Bibliotecário</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full px-4 py-3 font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300"
              >
                Criar Usuário
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
