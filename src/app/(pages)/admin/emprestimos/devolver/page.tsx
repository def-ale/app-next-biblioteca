
'use client';



import { useState, useEffect, useMemo } from 'react';

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



const formatarData = (dataString: string) => new Date(dataString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });



const PageFeedback = ({ message, isError }: { message: string; isError: boolean; }) => {

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



export default function DevolverLivroPage() {

  const { usuario, loading } = useAuth(['admin', 'bibliotecario']);

  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);

  const [feedback, setFeedback] = useState({ message: '', isError: false });

  const [termoBusca, setTermoBusca] = useState('');



  const buscarEmprestimos = async () => {

    if (loading || !usuario) return;

    const token = localStorage.getItem('token');

    if (!token) {

      setFeedback({ message: 'Você precisa estar logado.', isError: true });

      return;

    }

    try {

      const response = await fetch('/api/emprestimos', { headers: { 'Authorization': `Bearer ${token}` } });

      const data = await response.json();

      if (response.ok) {

        setEmprestimos(data.filter((e: Emprestimo) => !e.dataEntrega));

      } else {

        throw new Error(data.mensagem || 'Erro ao carregar empréstimos.');

      }

    } catch (error) {

      setFeedback({ message: error instanceof Error ? error.message : 'Erro de rede.', isError: true });

    }

  };



  useEffect(() => {

    buscarEmprestimos();

  }, [usuario, loading]);



  const realizarDevolucao = async (emprestimoId: number) => {

    const token = localStorage.getItem('token');

    if (!token) {

      setFeedback({ message: 'Acesso negado.', isError: true });

      return;

    }

    try {

      const response = await fetch(`/api/emprestimos/${emprestimoId}/devolver`, {

        method: 'POST',

        headers: { 'Authorization': `Bearer ${token}` },

      });

      const data = await response.json();

      if (response.ok) {

        setFeedback({ message: `Devolução registrada! ${data.mensagem || ''}`, isError: false });

        buscarEmprestimos(); // Recarregar

      } else {

        throw new Error(data.mensagem || 'Erro ao registrar devolução.');

      }

    } catch (error) {

      setFeedback({ message: error instanceof Error ? error.message : 'Erro de rede.', isError: true });

    }

  };



  const emprestimosFiltrados = useMemo(() => {

    if (!termoBusca) return emprestimos;

    return emprestimos.filter(e =>

      e.livroTitulo.toLowerCase().includes(termoBusca.toLowerCase()) ||

      e.usuarioNome.toLowerCase().includes(termoBusca.toLowerCase()) ||

      e.usuarioEmail.toLowerCase().includes(termoBusca.toLowerCase())

    );

  }, [emprestimos, termoBusca]);



  if (loading) {

    return <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]"><p className="text-lg text-gray-600 dark:text-gray-400">Carregando...</p></div>;

  }

  if (!usuario) return null;



  return (

    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-black">

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">

        <header className="mb-8">

          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Registrar Devolução</h1>

          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">Localize um empréstimo ativo para registrar a devolução do livro.</p>

        </header>



        <div className="mb-6">

          <input

            type="text"

            placeholder="Buscar por livro, nome ou email do usuário..."

            value={termoBusca}

            onChange={(e) => setTermoBusca(e.target.value)}

            className="w-full max-w-lg px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"

          />

        </div>



        <PageFeedback message={feedback.message} isError={feedback.isError} />

        

        <div className="overflow-x-auto bg-white rounded-lg shadow dark:bg-gray-800">

          <div className="min-w-full align-middle">

            {emprestimosFiltrados.length === 0 ? (

              <p className="p-6 text-center text-gray-600 dark:text-gray-400">

                {termoBusca ? 'Nenhum empréstimo encontrado.' : 'Nenhum empréstimo ativo no momento.'}

              </p>

            ) : (

              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">

                <thead className="bg-gray-50 dark:bg-gray-700">

                  <tr>

                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Livro</th>

                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Usuário</th>

                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Data Empréstimo</th>

                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Devolução Prevista</th>

                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ação</th>

                  </tr>

                </thead>

                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">

                  {emprestimosFiltrados.map((emprestimo) => (

                    <tr key={emprestimo.emprestimoId} className="hover:bg-gray-50 dark:hover:bg-gray-700">

                      <td className="px-6 py-4 whitespace-nowrap">

                        <div className="text-sm font-medium text-gray-900 dark:text-white">{emprestimo.livroTitulo}</div>

                        <div className="text-sm text-gray-500 dark:text-gray-400">{emprestimo.livroAutor}</div>

                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">

                        <div className="text-sm font-medium text-gray-900 dark:text-white">{emprestimo.usuarioNome}</div>

                        <div className="text-sm text-gray-500 dark:text-gray-400">{emprestimo.usuarioEmail}</div>

                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{formatarData(emprestimo.dataEmprestimo)}</td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{formatarData(emprestimo.dataDevolucao)}</td>

                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">

                        <button

                          onClick={() => realizarDevolucao(emprestimo.emprestimoId)}

                          className="px-4 py-2 font-semibold text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"

                        >

                          Registrar Devolução

                        </button>

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
