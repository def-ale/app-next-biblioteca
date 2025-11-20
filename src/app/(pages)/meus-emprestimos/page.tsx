
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

export default function MeusEmprestimosPage() {
  const { usuario, loading } = useAuth(); // Apenas verifica se está autenticado
  const [meusEmprestimos, setMeusEmprestimos] = useState<Emprestimo[]>([]);
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    const buscarDadosUsuario = async () => {
      if (loading || !usuario) return;

      const token = localStorage.getItem('token');
      if (!token) {
        setMensagem('Você precisa estar logado para ver seus empréstimos e perfil.');
        return;
      }

      try {
        // Buscar perfil do usuário
        const resPerfil = await fetch(`/api/usuarios/${usuario.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        const dadosPerfil = await resPerfil.json();
        if (resPerfil.ok) {
          setPerfil(dadosPerfil);
        } else {
          setMensagem(`Erro ao carregar perfil: ${dadosPerfil.mensagem}`);
        }


        // Buscar empréstimos do usuário
        const resEmprestimos = await fetch(`/api/usuarios/${usuario.id}/emprestimos`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        const dadosEmprestimos = await resEmprestimos.json();
        if (resEmprestimos.ok) {
          setMeusEmprestimos(dadosEmprestimos);
        } else {
          setMensagem(`Erro ao carregar empréstimos: ${dadosEmprestimos.mensagem}`);
        }
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
        setMensagem('Erro de rede ao buscar seus dados.');
      }
    };

    buscarDadosUsuario();
  }, [usuario, loading]);

  if (loading) {
    return <p className="text-center mt-8">Carregando...</p>;
  }

  if (!usuario) {
    return null; // Redirecionado pelo useAuth se não autenticado
  }

  return (
    <div className="flex min-h-screen flex-col items-center p-8 bg-zinc-50 font-sans dark:bg-black">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Meu Perfil e Empréstimos</h1>
      {mensagem && <p className="mb-4 text-center text-red-500">{mensagem}</p>}

      {perfil && (
        <div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Dados Pessoais</h2>
          <p><strong>Nome:</strong> {perfil.nome}</p>
          <p><strong>Email:</strong> {perfil.email}</p>
          <p><strong>Perfil:</strong> {perfil.perfil}</p>
        </div>
      )}

      <div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Meus Empréstimos</h2>
        {meusEmprestimos.length === 0 ? (
          <p className="text-center text-gray-600">Nenhum livro emprestado no momento.</p>
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
                  Data Empréstimo
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Devolução Prevista
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Devolução Real
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {meusEmprestimos.map((emprestimo) => (
                <tr key={emprestimo.emprestimoId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {emprestimo.emprestimoId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {emprestimo.livroTitulo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {emprestimo.livroAutor}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {emprestimo.dataEmprestimo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {emprestimo.dataDevolucao}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {emprestimo.dataEntrega || 'Pendente'}
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
