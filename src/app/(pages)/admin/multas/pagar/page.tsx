
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/lib/client/hooks/useAuth';

interface Multa {
  multaId: number;
  valor: number;
  paga: number;
  emprestimoId: number;
  dataEmprestimo: string;
  dataDevolucao: string;
  livroTitulo: string;
  usuarioNome: string;
}

export default function PagarMultaPage() {
  const { usuario, loading } = useAuth(['admin', 'bibliotecario']);
  const [multas, setMultas] = useState<Multa[]>([]);
  const [mensagem, setMensagem] = useState('');

  const buscarMultas = async () => {
    if (loading || !usuario) return;

    const token = localStorage.getItem('token');
    if (!token) {
      setMensagem('Você precisa estar logado para gerenciar multas.');
      return;
    }

    try {
      const response = await fetch('/api/multas', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setMultas(data);
      } else {
        setMensagem(`Erro ao carregar multas: ${data.mensagem}`);
      }
    } catch (error) {
      console.error('Erro ao buscar multas:', error);
      setMensagem('Erro de rede ao buscar multas.');
    }
  };

  useEffect(() => {
    buscarMultas();
  }, [usuario, loading]);

  if (loading) {
    return <p className="text-center mt-8">Carregando...</p>;
  }

  if (!usuario) {
    return null;
  }

  const realizarPagamentoMulta = async (multaId: number) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setMensagem('Você precisa estar logado para registrar pagamentos.');
      return;
    }

    try {
      const response = await fetch(`/api/multas/${multaId}/pagar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setMensagem(`Pagamento registrado com sucesso! ${data.mensagem}`);
        buscarMultas(); // Recarregar a lista de multas
      } else {
        setMensagem(`Erro ao registrar pagamento: ${data.mensagem}`);
      }
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
      setMensagem('Erro de rede ao registrar pagamento.');
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center p-8 bg-zinc-50 font-sans dark:bg-black">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Gerenciar Pagamento de Multas</h1>
      {mensagem && <p className="mb-4 text-center text-red-500">{mensagem}</p>}
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-6">
        {multas.length === 0 ? (
          <p className="text-center text-gray-600">Nenhuma multa pendente.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID Multa
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
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
              {multas.map((multa) => (
                <tr key={multa.multaId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {multa.multaId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    R$ {multa.valor.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {multa.livroTitulo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {multa.usuarioNome}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {multa.dataEmprestimo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {multa.dataDevolucao}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => realizarPagamentoMulta(multa.multaId)}
                      className="px-4 py-2 font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Marcar como Paga
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
