'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/app/lib/client/hooks/useAuth';

interface Multa {
  multaId: number;
  valor: number;
  paga: number; // 0 para não, 1 para sim
  emprestimoId: number;
  dataEmprestimo: string;
  dataDevolucao: string;
  livroTitulo: string;
  usuarioNome: string;
}

const formatarData = (dataString: string) => new Date(dataString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
const formatarValor = (valor: number) => `R$ ${valor.toFixed(2).replace('.', ',')}`;

const StatusPagamento = ({ pago }: { pago: number }) => {
  const estaPago = pago === 1;
  const bgColor = estaPago ? 'bg-green-100 dark:bg-green-900' : 'bg-yellow-100 dark:bg-yellow-900';
  const textColor = estaPago ? 'text-green-800 dark:text-green-200' : 'text-yellow-800 dark:text-yellow-200';
  const text = estaPago ? 'Pago' : 'Pendente';
  return <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${bgColor} ${textColor}`}>{text}</span>;
};

const PageFeedback = ({ message, isError }: { message: string; isError: boolean; }) => {
  if (!message) return null;
  const baseClasses = "p-4 rounded-md text-sm font-medium mb-6";
  const successClasses = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
  const errorClasses = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
  return <div className={`${baseClasses} ${isError ? errorClasses : successClasses}`}>{message}</div>;
};

export default function PagarMultaPage() {
  const { usuario, loading } = useAuth(['admin', 'bibliotecario']);
  const [multas, setMultas] = useState<Multa[]>([]);
  const [feedback, setFeedback] = useState({ message: '', isError: false });
  const [termoBusca, setTermoBusca] = useState('');

  const buscarMultas = async () => {
    if (loading || !usuario) return;
    const token = localStorage.getItem('token');
    if (!token) {
      setFeedback({ message: 'Você precisa estar logado.', isError: true });
      return;
    }
    try {
      const response = await fetch('/api/multas', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await response.json();
      if (response.ok) {
        setMultas(data);
      } else {
        throw new Error(data.mensagem || 'Erro ao carregar multas.');
      }
    } catch (error) {
      setFeedback({ message: error instanceof Error ? error.message : 'Erro de rede.', isError: true });
    }
  };

  useEffect(() => {
    buscarMultas();
  }, [usuario, loading]);

  const realizarPagamentoMulta = async (multaId: number) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setFeedback({ message: 'Acesso negado.', isError: true });
      return;
    }
    try {
      const response = await fetch(`/api/multas/${multaId}/pagar`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setFeedback({ message: `Pagamento registrado! ${data.mensagem || ''}`, isError: false });
        buscarMultas(); // Recarregar
      } else {
        throw new Error(data.mensagem || 'Erro ao registrar pagamento.');
      }
    } catch (error) {
      setFeedback({ message: error instanceof Error ? error.message : 'Erro de rede.', isError: true });
    }
  };

  const multasFiltradas = useMemo(() => {
    if (!termoBusca) return multas;
    return multas.filter(m =>
      m.livroTitulo.toLowerCase().includes(termoBusca.toLowerCase()) ||
      m.usuarioNome.toLowerCase().includes(termoBusca.toLowerCase())
    );
  }, [multas, termoBusca]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]"><p className="text-lg text-gray-600 dark:text-gray-400">Carregando...</p></div>;
  }
  if (!usuario) return null;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-black">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Gerenciar Multas</h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">Visualize e gerencie o pagamento de multas pendentes.</p>
        </header>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar por livro ou nome do usuário..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="w-full max-w-lg px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
          />
        </div>

        <PageFeedback message={feedback.message} isError={feedback.isError} />
        
        <div className="overflow-x-auto bg-white rounded-lg shadow dark:bg-gray-800">
          <div className="min-w-full align-middle">
            {multasFiltradas.length === 0 ? (
              <p className="p-6 text-center text-gray-600 dark:text-gray-400">
                {termoBusca ? 'Nenhuma multa encontrada para a busca.' : 'Nenhuma multa registrada no sistema.'}
              </p>
            ) : (
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Usuário</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Livro</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Valor</th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ação</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                  {multasFiltradas.map((multa) => (
                    <tr key={multa.multaId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{multa.usuarioNome}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{multa.livroTitulo}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 font-semibold">{formatarValor(multa.valor)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <StatusPagamento pago={multa.paga} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {multa.paga === 0 && (
                          <button
                            onClick={() => realizarPagamentoMulta(multa.multaId)}
                            className="px-4 py-2 font-semibold text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                          >
                            Marcar como Paga
                          </button>
                        )}
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
