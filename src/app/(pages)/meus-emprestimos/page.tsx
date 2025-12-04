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
}

interface PerfilUsuario {
  id: number;
  nome: string;
  email: string;
  perfil: string;
}

// Função para formatar data
const formatarData = (dataString: string) => {
  return new Date(dataString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
};

// Componente para o status do empréstimo
const StatusEmprestimo = ({ dataEntrega, dataDevolucao }: { dataEntrega: string | null; dataDevolucao: string }) => {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0); // Normalizar para comparar apenas a data
  const dataDevolucaoPrevista = new Date(dataDevolucao);

  if (dataEntrega) {
    return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Devolvido</span>;
  }
  if (hoje > dataDevolucaoPrevista) {
    return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Atrasado</span>;
  }
  return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Em andamento</span>;
};


export default function MeusEmprestimosPage() {
  const { usuario, loading } = useAuth();
  const [meusEmprestimos, setMeusEmprestimos] = useState<Emprestimo[]>([]);
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    if (loading || !usuario) return;

    const buscarDadosUsuario = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setMensagem('Você precisa estar logado para ver seus dados.');
        return;
      }

      try {
        const [resPerfil, resEmprestimos] = await Promise.all([
          fetch(`/api/usuarios/${usuario.id}`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`/api/usuarios/${usuario.id}/emprestimos`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        const dadosPerfil = await resPerfil.json();
        if (resPerfil.ok) {
          setPerfil(dadosPerfil);
        } else {
          setMensagem(prev => `${prev} Erro ao carregar perfil: ${dadosPerfil.mensagem}`);
        }

        const dadosEmprestimos = await resEmprestimos.json();
        if (resEmprestimos.ok) {
          setMeusEmprestimos(dadosEmprestimos);
        } else {
          setMensagem(prev => `${prev} Erro ao carregar empréstimos: ${dadosEmprestimos.mensagem}`);
        }
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
        setMensagem('Erro de rede ao buscar seus dados.');
      }
    };

    buscarDadosUsuario();
  }, [usuario, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <p className="text-lg text-gray-600 dark:text-gray-400">Carregando seus dados...</p>
      </div>
    );
  }

  if (!usuario) {
    return null; // Redirecionado pelo useAuth
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-black">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Minha Área
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Consulte seus dados pessoais e histórico de empréstimos.
          </p>
        </header>

        {mensagem && <p className="mb-4 text-center text-red-500 dark:text-red-400">{mensagem}</p>}

        {perfil && (
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Meus Dados</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <dt className="font-medium text-gray-500 dark:text-gray-400">Nome</dt>
                <dd className="mt-1 text-gray-900 dark:text-white">{perfil.nome}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-500 dark:text-gray-400">Email</dt>
                <dd className="mt-1 text-gray-900 dark:text-white">{perfil.email}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-500 dark:text-gray-400">Tipo de Perfil</dt>
                <dd className="mt-1 text-gray-900 dark:text-white capitalize">{perfil.perfil}</dd>
              </div>
            </div>
          </div>
        )}

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Meus Empréstimos</h2>
        <div className="overflow-x-auto bg-white rounded-lg shadow dark:bg-gray-800">
          <div className="min-w-full align-middle">
            {meusEmprestimos.length === 0 && !mensagem ? (
              <p className="p-6 text-center text-gray-600 dark:text-gray-400">
                Você não possui nenhum empréstimo ativo ou no histórico.
              </p>
            ) : (
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Livro</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Data do Empréstimo</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Devolução Prevista</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Devolvido em</th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                  {meusEmprestimos.map((emprestimo) => (
                    <tr key={emprestimo.emprestimoId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{emprestimo.livroTitulo}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{emprestimo.livroAutor}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{formatarData(emprestimo.dataEmprestimo)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{formatarData(emprestimo.dataDevolucao)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {emprestimo.dataEntrega ? formatarData(emprestimo.dataEntrega) : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <StatusEmprestimo dataEntrega={emprestimo.dataEntrega} dataDevolucao={emprestimo.dataDevolucao} />
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
