
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/lib/client/hooks/useAuth';

interface LivroAtrasado {
  emprestimoId: number;
  dataEmprestimo: string;
  dataDevolucao: string;
  livroTitulo: string;
  livroAutor: string;
  usuarioNome: string;
  usuarioEmail: string;
}

export default function LivrosAtrasadosPage() {
  const { usuario, loading } = useAuth(['admin', 'bibliotecario']);
  const [livrosAtrasados, setLivrosAtrasados] = useState<LivroAtrasado[]>([]);
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    const buscarLivrosAtrasados = async () => {
      if (loading || !usuario) return;

      const token = localStorage.getItem('token');
      if (!token) {
        setMensagem('Você precisa estar logado para ver este relatório.');
        return;
      }

      try {
        const response = await fetch('/api/relatorios/livros-atrasados', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          setLivrosAtrasados(data);
        } else {
          setMensagem(`Erro ao carregar relatório: ${data.mensagem}`);
        }
      } catch (error) {
        console.error('Erro ao buscar livros atrasados:', error);
        setMensagem('Erro de rede ao buscar o relatório.');
      }
    };

    buscarLivrosAtrasados();
  }, [usuario, loading]);

  if (loading) {
    return <p className="text-center mt-8">Carregando...</p>;
  }

  if (!usuario) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col items-center p-8 bg-zinc-50 font-sans dark:bg-black">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Relatório de Livros Atrasados</h1>
      {mensagem && <p className="mb-4 text-center text-red-500">{mensagem}</p>}
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-6">
        {livrosAtrasados.length === 0 ? (
          <p className="text-center text-gray-600">Nenhum livro atrasado encontrado.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID Empréstimo
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Livro
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Autor
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuário
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Empréstimo
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Devolução Prevista
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {livrosAtrasados.map((livro) => (
                <tr key={livro.emprestimoId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {livro.emprestimoId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {livro.livroTitulo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {livro.livroAutor}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {livro.usuarioNome} ({livro.usuarioEmail})
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {livro.dataEmprestimo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {livro.dataDevolucao}
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
