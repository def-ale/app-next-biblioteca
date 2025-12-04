'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/lib/client/hooks/useAuth';

interface Livro {
  id: number;
  titulo: string;
}

interface Usuario {
  id: number;
  nome: string;
  email: string;
}

const FormFeedback = ({ message, isError }: { message: string; isError: boolean; }) => {
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

export default function CriarEmprestimoPage() {
  const { usuario, loading } = useAuth(['admin', 'bibliotecario']);
  
  const [livroId, setLivroId] = useState('');
  const [usuarioId, setUsuarioId] = useState('');
  const [dataDevolucao, setDataDevolucao] = useState('');
  const [feedback, setFeedback] = useState({ message: '', isError: false });

  const [livros, setLivros] = useState<Livro[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  useEffect(() => {
    if (loading || !usuario) return;

    const buscarDados = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setFeedback({ message: 'Você precisa estar logado.', isError: true });
        return;
      }
      
      try {
        const [resLivros, resUsuarios] = await Promise.all([
          fetch('/api/livros', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/usuarios', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        const dadosLivros = await resLivros.json();
        if (resLivros.ok) {
          setLivros(dadosLivros.filter((livro: {disponivel: number}) => livro.disponivel > 0));
        } else {
          throw new Error(`Livros: ${dadosLivros.mensagem}`);
        }

        const dadosUsuarios = await resUsuarios.json();
        if (resUsuarios.ok) {
          setUsuarios(dadosUsuarios.filter((u: {perfil: string}) => u.perfil === 'aluno'));
        } else {
          throw new Error(`Usuários: ${dadosUsuarios.mensagem}`);
        }

      } catch (error) {
        setFeedback({ message: error instanceof Error ? `Erro ao carregar dados: ${error.message}` : 'Erro de rede.', isError: true });
      }
    };

    buscarDados();
  }, [usuario, loading]);

  const submeterFormulario = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback({ message: '', isError: false });

    const token = localStorage.getItem('token');
    if (!token) {
      setFeedback({ message: 'Acesso negado. Faça o login novamente.', isError: true });
      return;
    }

    try {
      const response = await fetch('/api/emprestimos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          livroId: parseInt(livroId), 
          usuarioId: parseInt(usuarioId), 
          dataDevolucao 
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setFeedback({ message: 'Empréstimo criado com sucesso!', isError: false });
        setLivroId('');
        setUsuarioId('');
        setDataDevolucao('');
        // Opcional: remover o livro da lista de disponíveis
        setLivros(livros.filter(l => l.id !== parseInt(livroId)));
      } else {
        throw new Error(data.mensagem || 'Ocorreu um erro ao criar o empréstimo.');
      }
    } catch (error) {
      setFeedback({ message: error instanceof Error ? `Erro: ${error.message}` : 'Erro de conexão.', isError: true });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <p className="text-lg text-gray-600 dark:text-gray-400">Carregando formulário...</p>
      </div>
    );
  }

  if (!usuario) {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-black">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Criar Novo Empréstimo
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Selecione o livro e o usuário para registrar um novo empréstimo.
          </p>
        </header>

        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-8">
          <form onSubmit={submeterFormulario} className="space-y-6">
            <FormFeedback message={feedback.message} isError={feedback.isError} />

            <div>
              <label htmlFor="livroId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Livro Disponível
              </label>
              <select
                id="livroId"
                value={livroId}
                onChange={(e) => setLivroId(e.target.value)}
                required
                className="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Selecione um livro...</option>
                {livros.map((livro) => (
                  <option key={livro.id} value={livro.id}>{livro.titulo}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="usuarioId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Usuário (Aluno)
              </label>
              <select
                id="usuarioId"
                value={usuarioId}
                onChange={(e) => setUsuarioId(e.target.value)}
                required
                className="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Selecione um aluno...</option>
                {usuarios.map((usuario) => (
                  <option key={usuario.id} value={usuario.id}>{usuario.nome} ({usuario.email})</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="dataDevolucao" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Data de Devolução
              </label>
              <input
                id="dataDevolucao"
                type="date"
                value={dataDevolucao}
                onChange={(e) => setDataDevolucao(e.target.value)}
                required
                className="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={!livroId || !usuarioId || !dataDevolucao}
                className="w-full px-4 py-3 font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Criar Empréstimo
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
