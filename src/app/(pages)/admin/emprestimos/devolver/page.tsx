
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/lib/client/hooks/useAuth';

interface Emprestimo {
  emprestimoId: number;
  dataEmprestimo: string;
  dataDevolucao: string;
  dataEntrega: string | null;
  livroTitulo: string;
  livroAutor: string;
  usuarioNome: string;
  usuarioEmail: string;
}

export default function DevolverLivroPage() {
  const { usuario, loading } = useAuth(['admin', 'bibliotecario']);
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);
  const [mensagem, setMensagem] = useState('');

  const buscarEmprestimos = async () => {
    if (loading || !usuario) return;

    const token = localStorage.getItem('token');
    if (!token) {
      setMensagem('Você precisa estar logado para gerenciar devoluções.');
      return;
    }

    try {
      const response = await fetch('/api/emprestimos', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setEmprestimos(data.filter((emprestimo: Emprestimo) => !emprestimo.dataEntrega)); // Apenas empréstimos ativos
      } else {
        setMensagem(`Erro ao carregar empréstimos: ${data.mensagem}`);
      }
    } catch (error) {
      console.error('Erro ao buscar empréstimos:', error);
      setMensagem('Erro de rede ao buscar empréstimos.');
    }
  };

  useEffect(() => {
    buscarEmprestimos();
  }, [usuario, loading]);

  if (loading) {
    return <p className="text-center mt-8">Carregando...</p>;
  }

  if (!usuario) {
    return null;
  }

  const realizarDevolucao = async (emprestimoId: number) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setMensagem('Você precisa estar logado para registrar devoluções.');
      return;
    }

    try {
      const response = await fetch(`/api/emprestimos/${emprestimoId}/devolver`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setMensagem(`Devolução registrada com sucesso! ${data.mensagem}`);
        buscarEmprestimos(); // Recarregar a lista de empréstimos
      } else {
        setMensagem(`Erro ao registrar devolução: ${data.mensagem}`);
      }
    } catch (error) {
      console.error('Erro ao registrar devolução:', error);
      setMensagem('Erro de rede ao registrar devolução.');
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center p-8 bg-zinc-50 font-sans dark:bg-black">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Registrar Devolução de Livro</h1>
      {mensagem && <p className="mb-4 text-center text-red-500">{mensagem}</p>}
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-6">
        {emprestimos.length === 0 ? (
          <p className="text-center text-gray-600">Nenhum empréstimo ativo para devolução.</p>
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
                  Usuário
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Empréstimo
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Devolução Prevista
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {emprestimos.map((emprestimo) => (
                <tr key={emprestimo.emprestimoId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {emprestimo.emprestimoId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {emprestimo.livroTitulo} ({emprestimo.livroAutor})
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {emprestimo.usuarioNome} ({emprestimo.usuarioEmail})
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {emprestimo.dataEmprestimo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {emprestimo.dataDevolucao}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => realizarDevolucao(emprestimo.emprestimoId)}
                      className="px-4 py-2 font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Devolver
                    </button>
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
