'use client';

import { useState, useEffect, useMemo } from 'react';
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

const formatarData = (dataString: string) => new Date(dataString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });

const calcularDiasAtraso = (dataDevolucao: string) => {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const dataDevolucaoPrevista = new Date(dataDevolucao);
  const diffTime = hoje.getTime() - dataDevolucaoPrevista.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

const PageFeedback = ({ message, isError }: { message: string; isError: boolean; }) => {
  if (!message) return null;
  const baseClasses = "p-4 rounded-md text-sm font-medium mb-6";
  const errorClasses = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
  return <div className={`${baseClasses} ${errorClasses}`}>{message}</div>;
};

export default function LivrosAtrasadosPage() {
  const { usuario, loading } = useAuth(['admin', 'bibliotecario']);
  const [livrosAtrasados, setLivrosAtrasados] = useState<LivroAtrasado[]>([]);
  const [feedback, setFeedback] = useState({ message: '', isError: false });
  const [termoBusca, setTermoBusca] = useState('');

  useEffect(() => {
    if (loading || !usuario) return;
    const token = localStorage.getItem('token');
    if (!token) {
      setFeedback({ message: 'Você precisa estar logado.', isError: true });
      return;
    }
    const buscarLivrosAtrasados = async () => {
      try {
        const response = await fetch('/api/relatorios/livros-atrasados', { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await response.json();
        if (response.ok) {
          setLivrosAtrasados(data);
        } else {
          throw new Error(data.mensagem || 'Erro ao carregar relatório.');
        }
      } catch (error) {
        setFeedback({ message: error instanceof Error ? error.message : 'Erro de rede.', isError: true });
      }
    };
    buscarLivrosAtrasados();
  }, [usuario, loading]);

  const livrosFiltrados = useMemo(() => {
    if (!termoBusca) return livrosAtrasados;
    return livrosAtrasados.filter(l =>
      l.livroTitulo.toLowerCase().includes(termoBusca.toLowerCase()) ||
      l.usuarioNome.toLowerCase().includes(termoBusca.toLowerCase()) ||
      l.usuarioEmail.toLowerCase().includes(termoBusca.toLowerCase())
    );
  }, [livrosAtrasados, termoBusca]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]"><p className="text-lg text-gray-600 dark:text-gray-400">Gerando relatório...</p></div>;
  }
  if (!usuario) return null;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-black">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <header className="mb-8 sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Relatório de Livros Atrasados</h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">Acompanhe todos os empréstimos com devolução pendente.</p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-4">
            <button
              onClick={() => window.print()}
              className="w-full sm:w-auto px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Imprimir Relatório
            </button>
          </div>
        </header>
        
        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar por livro ou usuário..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="w-full max-w-lg px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
          />
        </div>

        <PageFeedback message={feedback.message} isError={feedback.isError} />

        <div className="overflow-x-auto bg-white rounded-lg shadow dark:bg-gray-800">
          <div className="min-w-full align-middle">
            {livrosFiltrados.length === 0 ? (
              <p className="p-6 text-center text-gray-600 dark:text-gray-400">
                {termoBusca ? 'Nenhum resultado para a busca.' : 'Nenhum livro atrasado encontrado.'}
              </p>
            ) : (
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Livro</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Usuário</th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Data Devolução</th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Dias em Atraso</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                  {livrosFiltrados.map((livro) => (
                    <tr key={livro.emprestimoId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{livro.livroTitulo}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{livro.livroAutor}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{livro.usuarioNome}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{livro.usuarioEmail}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500 dark:text-gray-300">{formatarData(livro.dataDevolucao)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-red-600 dark:text-red-400">{calcularDiasAtraso(livro.dataDevolucao)}</td>
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
