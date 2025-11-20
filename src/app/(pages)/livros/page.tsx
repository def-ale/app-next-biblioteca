
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/lib/client/hooks/useAuth';

interface Livro {
  id: number;
  titulo: string;
  autor: string;
  isbn: string;
  disponivel: number;
}

export default function ListaLivrosPage() {
  const { usuario, loading } = useAuth(); // Apenas verifica se está autenticado
  const [livros, setLivros] = useState<Livro[]>([]);
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    const buscarLivros = async () => {
      if (loading || !usuario) return;

      const token = localStorage.getItem('token');
      if (!token) {
        setMensagem('Você precisa estar logado para ver os livros.');
        return;
      }

      try {
        const response = await fetch('/api/livros', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          setLivros(data);
        } else {
          setMensagem(`Erro ao carregar livros: ${data.mensagem}`);
        }
      } catch (error) {
        console.error('Erro ao buscar livros:', error);
        setMensagem('Erro de rede ao buscar livros.');
      }
    };

    buscarLivros();
  }, [usuario, loading]);

  if (loading) {
    return <p className="text-center mt-8">Carregando...</p>;
  }

  if (!usuario) {
    return null; // Redirecionado pelo useAuth se não autenticado
  }

  return (
    <div className="flex min-h-screen flex-col items-center p-8 bg-zinc-50 font-sans dark:bg-black">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Lista de Livros</h1>
      {mensagem && <p className="mb-4 text-center text-red-500">{mensagem}</p>}
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-6">
        {livros.length === 0 ? (
          <p className="text-center text-gray-600">Nenhum livro cadastrado.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Título
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Autor
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ISBN
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Disponível
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {livros.map((livro) => (
                <tr key={livro.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {livro.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {livro.titulo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {livro.autor}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {livro.isbn}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {livro.disponivel ? 'Sim' : 'Não'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
