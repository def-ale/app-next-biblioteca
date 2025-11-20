
'use client';

import { useState } from 'react';
import { useAuth } from '@/app/lib/client/hooks/useAuth';

export default function CriarLivroPage() {
  const { usuario, loading } = useAuth(['admin', 'bibliotecario']); // Proteger a rota para usuários 'admin' ou 'bibliotecario'
  
  const [titulo, setTitulo] = useState('');
  const [autor, setAutor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [mensagem, setMensagem] = useState('');

  if (loading) {
    return <p className="text-center mt-8">Carregando...</p>;
  }

  // Se o usuário não for admin ou bibliotecário, o hook useAuth já redirecionou, então não precisamos renderizar nada aqui
  if (!usuario) {
    return null; 
  }


  const submeterFormulario = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensagem('');

    const token = localStorage.getItem('token');
    if (!token) {
      setMensagem('Você precisa estar logado para adicionar livros.');
      return;
    }

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
      setMensagem('Livro adicionado com sucesso!');
      setTitulo('');
      setAutor('');
      setIsbn('');
    } else {
      setMensagem(`Erro ao adicionar livro: ${data.mensagem}`);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-900">Adicionar Novo Livro</h1>
        <form onSubmit={submeterFormulario} className="space-y-6">
          <div>
            <label htmlFor="titulo" className="text-sm font-medium text-gray-700">
              Título
            </label>
            <input
              id="titulo"
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="autor" className="text-sm font-medium text-gray-700">
              Autor
            </label>
            <input
              id="autor"
              type="text"
              value={autor}
              onChange={(e) => setAutor(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="isbn" className="text-sm font-medium text-gray-700">
              ISBN
            </label>
            <input
              id="isbn"
              type="text"
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Adicionar Livro
            </button>
          </div>
        </form>
        {mensagem && <p className="mt-4 text-center text-red-500">{mensagem}</p>}
      </div>
    </div>
  );
}
