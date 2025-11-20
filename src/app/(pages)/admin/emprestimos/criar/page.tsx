
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/lib/client/hooks/useAuth';

interface Livro {
  id: number;
  titulo: string;
  disponivel: number;
}

interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: string;
}

export default function CriarEmprestimoPage() {
  const { usuario, loading } = useAuth(['admin', 'bibliotecario']);
  const [livroId, setLivroId] = useState('');
  const [usuarioId, setUsuarioId] = useState('');
  const [dataDevolucao, setDataDevolucao] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [livros, setLivros] = useState<Livro[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  useEffect(() => {
    const buscarDados = async () => {
      if (loading || !usuario) return;

      const token = localStorage.getItem('token');
      if (!token) {
        setMensagem('Você precisa estar logado para criar empréstimos.');
        return;
      }

      try {
        // Buscar livros disponíveis
        const resLivros = await fetch('/api/livros', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const dadosLivros = await resLivros.json();
        if (resLivros.ok) {
          setLivros(dadosLivros.filter((livro: Livro) => livro.disponivel));
        } else {
          setMensagem(`Erro ao carregar livros: ${dadosLivros.mensagem}`);
        }

        // Buscar usuários (apenas alunos para empréstimo)
        const resUsuarios = await fetch('/api/usuarios', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const dadosUsuarios = await resUsuarios.json();
        if (resUsuarios.ok) {
          setUsuarios(dadosUsuarios.filter((usuario: Usuario) => usuario.perfil === 'aluno'));
        } else {
          setMensagem(`Erro ao carregar usuários: ${dadosUsuarios.mensagem}`);
        }

      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        setMensagem('Erro de rede ao buscar dados.');
      }
    };

    buscarDados();
  }, [usuario, loading]);

  if (loading) {
    return <p className="text-center mt-8">Carregando...</p>;
  }

  if (!usuario) {
    return null;
  }

  const submeterFormulario = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensagem('');

    const token = localStorage.getItem('token');
    if (!token) {
      setMensagem('Você precisa estar logado para criar empréstimos.');
      return;
    }

    const response = await fetch('/api/emprestimos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ livroId: parseInt(livroId), usuarioId: parseInt(usuarioId), dataDevolucao }),
    });

    const data = await response.json();

    if (response.ok) {
      setMensagem('Empréstimo criado com sucesso!');
      setLivroId('');
      setUsuarioId('');
      setDataDevolucao('');
    } else {
      setMensagem(`Erro ao criar empréstimo: ${data.mensagem}`);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-900">Criar Novo Empréstimo</h1>
        <form onSubmit={submeterFormulario} className="space-y-6">
          <div>
            <label htmlFor="livroId" className="text-sm font-medium text-gray-700">
              Livro
            </label>
            <select
              id="livroId"
              value={livroId}
              onChange={(e) => setLivroId(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Selecione um livro</option>
              {livros.map((livro) => (
                <option key={livro.id} value={livro.id}>
                  {livro.titulo}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="usuarioId" className="text-sm font-medium text-gray-700">
              Usuário (Aluno)
            </label>
            <select
              id="usuarioId"
              value={usuarioId}
              onChange={(e) => setUsuarioId(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Selecione um aluno</option>
              {usuarios.map((usuario) => (
                <option key={usuario.id} value={usuario.id}>
                  {usuario.nome} ({usuario.email})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="dataDevolucao" className="text-sm font-medium text-gray-700">
              Data de Devolução
            </label>
            <input
              id="dataDevolucao"
              type="date"
              value={dataDevolucao}
              onChange={(e) => setDataDevolucao(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Criar Empréstimo
            </button>
          </div>
        </form>
        {mensagem && <p className="mt-4 text-center text-red-500">{mensagem}</p>}
      </div>
    </div>
  );
}
