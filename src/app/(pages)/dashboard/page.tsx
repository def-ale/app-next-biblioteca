
'use client';

import { useAuth } from '@/app/lib/client/hooks/useAuth';

export default function PaginaDashboard() {
  const { usuario, loading } = useAuth(); // Apenas verifica se está autenticado

  if (loading) {
    return <p className="text-center mt-8">Carregando...</p>;
  }

  if (!usuario) {
    return null; // Redirecionado pelo useAuth se não autenticado
  }

  return (
    <div className="flex min-h-screen flex-col items-center p-8 bg-zinc-50 font-sans dark:bg-black">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-4 text-gray-900">Bem-vindo ao Dashboard</h1>
        <p className="text-lg text-gray-700">Olá, {usuario.perfil}! Use a barra de navegação para acessar as funcionalidades do sistema.</p>
      </div>
    </div>
  );
}
