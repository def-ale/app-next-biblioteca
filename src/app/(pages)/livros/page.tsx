'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/app/lib/client/hooks/useAuth';

interface Livro {
  id: number;
  titulo: string;
  autor: string;
  isbn: string;
  disponivel: number;
}

// Componente para o status de disponibilidade
const StatusDisponibilidade = ({ disponivel }: { disponivel: number }) => {
  const estaDisponivel = disponivel > 0;
  const bgColor = estaDisponivel ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900';
  const textColor = estaDisponivel ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200';
  const text = estaDisponivel ? 'Disponível' : 'Indisponível';

  return (
    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${bgColor} ${textColor}`}>
      {text}
    </span>
  );
};


export default function ListaLivrosPage() {
  const { usuario, loading } = useAuth();
  const [livros, setLivros] = useState<Livro[]>([]);
  const [mensagem, setMensagem] = useState('');
  const [termoBusca, setTermoBusca] = useState('');

  useEffect(() => {
    if (loading || !usuario) return;

    const buscarLivros = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setMensagem('Você precisa estar logado para ver os livros.');
        return;
      }

      try {
        const response = await fetch('/api/livros', {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.mensagem || 'Erro ao carregar livros.');
        }

        const data = await response.json();
        setLivros(data);
      } catch (error) {
        console.error('Erro ao buscar livros:', error);
        setMensagem(error instanceof Error ? error.message : 'Erro de rede ao buscar livros.');
      }
    };

    buscarLivros();
  }, [usuario, loading]);

  const livrosFiltrados = useMemo(() => {
    if (!termoBusca) {
      return livros;
    }
    return livros.filter(livro =>
      livro.titulo.toLowerCase().includes(termoBusca.toLowerCase()) ||
      livro.autor.toLowerCase().includes(termoBusca.toLowerCase()) ||
      livro.isbn.toLowerCase().includes(termoBusca.toLowerCase())
    );
  }, [livros, termoBusca]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <p className="text-lg text-gray-600 dark:text-gray-400">Carregando acervo...</p>
      </div>
    );
  }

  if (!usuario) {
    return null; // Redirecionado pelo useAuth
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-black">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Acervo de Livros
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Explore, pesquise e encontre seu próximo livro.
          </p>
        </header>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar por título, autor ou ISBN..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="w-full max-w-lg px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
          />
        </div>

        {mensagem && <p className="mb-4 text-center text-red-500 dark:text-red-400">{mensagem}</p>}

        <div className="overflow-x-auto bg-white rounded-lg shadow dark:bg-gray-800">
          <div className="min-w-full align-middle">
            {livrosFiltrados.length === 0 ? (
              <p className="p-6 text-center text-gray-600 dark:text-gray-400">
                {termoBusca ? 'Nenhum livro encontrado para sua busca.' : 'Nenhum livro cadastrado no momento.'}
              </p>
            ) : (
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Título
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Autor
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      ISBN
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Disponibilidade
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                  {livrosFiltrados.map((livro) => (
                    <tr key={livro.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {livro.titulo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {livro.autor}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 font-mono">
                        {livro.isbn}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        <StatusDisponibilidade disponivel={livro.disponivel} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
