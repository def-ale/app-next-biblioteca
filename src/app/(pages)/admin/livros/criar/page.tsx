
'use client';

import { useState } from 'react';
import { useAuth } from '@/app/lib/client/hooks/useAuth';

// Re-using the feedback component concept
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

export default function CriarLivroPage() {
  const { usuario, loading } = useAuth(['admin', 'bibliotecario']);
  
  const [titulo, setTitulo] = useState('');
  const [autor, setAutor] = useState('');
  const [isbn, setIsbn] = useState('');
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
      const response = await fetch('/api/livros', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ titulo, autor, isbn }),
      });

      const data = await response.json();

      if (response.ok) {
        setFeedback({ message: 'Livro adicionado com sucesso!', isError: false });
        setTitulo('');
        setAutor('');
        setIsbn('');
      } else {
        throw new Error(data.mensagem || 'Ocorreu um erro ao adicionar o livro.');
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
    return null; 
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-black">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Adicionar Novo Livro
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Cadastre um novo título no acervo da biblioteca.
          </p>
        </header>

        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-8">
          <form onSubmit={submeterFormulario} className="space-y-6">
            <FormFeedback message={feedback.message} isError={feedback.isError} />

            <div>
              <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Título do Livro
              </label>
              <input
                id="titulo"
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                required
                className="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Ex: O Senhor dos Anéis"
              />
            </div>
            
            <div>
              <label htmlFor="autor" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Autor
              </label>
              <input
                id="autor"
                type="text"
                value={autor}
                onChange={(e) => setAutor(e.target.value)}
                required
                className="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Ex: J.R.R. Tolkien"
              />
            </div>

            <div>
              <label htmlFor="isbn" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                ISBN
              </label>
              <input
                id="isbn"
                type="text"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                required
                className="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Ex: 978-0-345-33970-6"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full px-4 py-3 font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300"
              >
                Adicionar Livro
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
