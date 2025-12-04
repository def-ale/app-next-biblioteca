'use client';

import { useAuth } from '@/app/lib/client/hooks/useAuth';
import Link from 'next/link';
import Image from 'next/image';

// Componente para os cards do dashboard
const DashboardCard = ({ href, icon, title, description }: { href: string; icon: React.ReactNode; title: string; description: string; }) => (
  <Link href={href} className="block group">
    <div className="p-6 h-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-xl font-bold text-gray-900 dark:text-white">{title}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
        </div>
      </div>
    </div>
  </Link>
);


export default function PaginaDashboard() {
  const { usuario, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <p className="text-lg text-gray-600 dark:text-gray-400">Carregando...</p>
      </div>
    );
  }

  if (!usuario) {
    return null; // Redirecionado pelo useAuth se não autenticado
  }

  // Define os cards com base no perfil do usuário
  const cards = [
    {
      href: '/livros',
      icon: <Image src="/file.svg" alt="Livros" width={32} height={32} />,
      title: 'Consultar Livros',
      description: 'Navegue pelo nosso acervo completo.',
      perfis: ['aluno', 'bibliotecario', 'admin'],
    },
    {
      href: '/meus-emprestimos',
      icon: <Image src="/window.svg" alt="Empréstimos" width={32} height={32} />,
      title: 'Meus Empréstimos',
      description: 'Veja seus empréstimos ativos e histórico.',
      perfis: ['aluno'],
    },
    {
      href: '/admin/emprestimos/criar',
      icon: <Image src="/globe.svg" alt="Realizar Empréstimo" width={32} height={32} />,
      title: 'Realizar Empréstimo',
      description: 'Crie um novo empréstimo para um usuário.',
      perfis: ['bibliotecario', 'admin'],
    },
     {
      href: '/admin/emprestimos/devolver',
      icon: <Image src="/file.svg" alt="Devoluções" width={32} height={32} />,
      title: 'Realizar Devolução',
      description: 'Receba e processe a devolução de livros.',
      perfis: ['bibliotecario', 'admin'],
    },
    {
      href: '/admin/relatorios/livros-atrasados',
      icon: <Image src="/file.svg" alt="Relatórios" width={32} height={32} />,
      title: 'Relatório de Atrasos',
      description: 'Consulte os livros com devolução atrasada.',
      perfis: ['bibliotecario', 'admin'],
    },
  ];

  const cardsVisiveis = cards.filter(card => card.perfis.includes(usuario.perfil));

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-black">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Painel de Controle
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Bem-vindo(a) de volta, <span className="font-semibold text-gray-800 dark:text-gray-100">{usuario.perfil}</span>!
          </p>
        </header>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cardsVisiveis.map((card) => (
            <DashboardCard
              key={card.href}
              href={card.href}
              icon={card.icon}
              title={card.title}
              description={card.description}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
