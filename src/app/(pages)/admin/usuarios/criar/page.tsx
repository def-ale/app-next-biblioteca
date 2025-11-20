
'use client';

import { useState } from 'react';
import { useAuth } from '@/app/lib/client/hooks/useAuth'; // Importar o hook useAuth

export default function CriarUsuarioPage() {
  const { usuario, loading } = useAuth(['admin']); // Proteger a rota para usuários 'admin'

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [perfil, setPerfil] = useState('aluno');
  const [mensagem, setMensagem] = useState('');

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
      setMensagem('Você precisa estar logado para criar usuários.');
      return;
    }

    const response = await fetch('/api/usuarios', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ nome, email, senha, perfil }),
    });

    const data = await response.json();

    if (response.ok) {
      setMensagem('Usuário criado com sucesso!');
      setNome('');
      setEmail('');
      setSenha('');
      setPerfil('aluno');
    } else {
      setMensagem(`Erro ao criar usuário: ${data.mensagem}`);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-900">Criar Novo Usuário</h1>
        <form onSubmit={submeterFormulario} className="space-y-6">
          <div>
            <label htmlFor="nome" className="text-sm font-medium text-gray-700">
              Nome
            </label>
            <input
              id="nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="senha" className="text-sm font-medium text-gray-700">
              Senha
            </label>
            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="perfil" className="text-sm font-medium text-gray-700">
              Perfil
            </label>
            <select
              id="perfil"
              value={perfil}
              onChange={(e) => setPerfil(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="aluno">Aluno</option>
              <option value="bibliotecario">Bibliotecário</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <button
              type="submit"
              className="w-full px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Criar Usuário
            </button>
          </div>
        </form>
        {mensagem && <p className="mt-4 text-center text-red-500">{mensagem}</p>}
      </div>
    </div>
  );
}
