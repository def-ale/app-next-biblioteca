'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import jwt from 'jsonwebtoken';

interface PayloadUsuario {
  id: number;
  perfil: string;
}

export default function Navbar() {
  const [usuario, setUsuario] = useState<PayloadUsuario | null>(null);
  const [menuAdminAberto, setMenuAdminAberto] = useState(false);
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);
  const router = useRouter();
  const menuAdminRef = useRef<HTMLDivElement>(null);

  const atualizarUsuario = () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodificado = jwt.decode(token) as PayloadUsuario | null;
        if (decodificado && decodificado.id && decodificado.perfil) {
          setUsuario(decodificado);
        } else {
          throw new Error('Token decodificado é inválido.');
        }
      } catch (error) {
        console.error('Erro ao decodificar token no Navbar:', error);
        localStorage.removeItem('token');
        setUsuario(null);
      }
    } else {
      setUsuario(null);
    }
  };

  useEffect(() => {
    atualizarUsuario();

    const handleStorageChange = () => atualizarUsuario();
    const handleTokenChange = () => atualizarUsuario();

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('token-change', handleTokenChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('token-change', handleTokenChange);
    };
  }, []);

  useEffect(() => {
    const handleClickFora = (event: MouseEvent) => {
      if (menuAdminRef.current && !menuAdminRef.current.contains(event.target as Node)) {
        setMenuAdminAberto(false);
      }
    };
    document.addEventListener('mousedown', handleClickFora);
    return () => {
      document.removeEventListener('mousedown', handleClickFora);
    };
  }, []);

  const realizarLogout = () => {
    localStorage.removeItem('token');
    setUsuario(null);
    setMenuAdminAberto(false);
    setMenuMobileAberto(false);
    window.dispatchEvent(new Event('token-change'));
    router.push('/');
  };

  const NavLink = ({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) => (
    <Link href={href} onClick={onClick} className="block px-3 py-2 text-base font-medium text-gray-500 rounded-md dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white">
      {children}
    </Link>
  );

  const DropdownLink = ({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) => (
     <Link href={href} onClick={onClick} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">
      {children}
    </Link>
  );


  return (
    <nav className="bg-white shadow-sm dark:bg-gray-800">
      <div className="container px-4 mx-auto sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href={usuario ? "/dashboard" : "/"} className="flex items-center flex-shrink-0 space-x-2 text-gray-800 dark:text-white">
              <Image src="/globe.svg" alt="Logo" width={28} height={28} />
              <span className="text-xl font-semibold">Biblioteca</span>
            </Link>
          </div>
          
          {/* Menu Desktop */}
          <div className="hidden md:flex items-center space-x-1">
            {usuario ? (
              <>
                <NavLink href="/dashboard">Dashboard</NavLink>
                <NavLink href="/livros">Livros</NavLink>
                {usuario.perfil === 'aluno' && (
                  <NavLink href="/meus-emprestimos">Meus Empréstimos</NavLink>
                )}

                {(usuario.perfil === 'admin' || usuario.perfil === 'bibliotecario') && (
                  <div className="relative" ref={menuAdminRef}>
                    <button
                      onClick={() => setMenuAdminAberto(!menuAdminAberto)}
                      className="flex items-center px-3 py-2 text-base font-medium text-gray-500 rounded-md dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white focus:outline-none"
                    >
                      Admin <svg className="w-5 h-5 ml-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>
                    {menuAdminAberto && (
                      <div className="absolute right-0 w-56 mt-2 origin-top-right bg-white rounded-md shadow-lg dark:bg-gray-700 ring-1 ring-black ring-opacity-5 z-50">
                        <div className="py-1" role="menu" aria-orientation="vertical">
                          <DropdownLink href="/admin/emprestimos/criar" onClick={() => setMenuAdminAberto(false)}>Criar Empréstimo</DropdownLink>
                          <DropdownLink href="/admin/emprestimos/devolver" onClick={() => setMenuAdminAberto(false)}>Devoluções</DropdownLink>
                          <DropdownLink href="/admin/livros/criar" onClick={() => setMenuAdminAberto(false)}>Adicionar Livro</DropdownLink>
                          <DropdownLink href="/admin/multas/pagar" onClick={() => setMenuAdminAberto(false)}>Pagar Multa</DropdownLink>
                           <DropdownLink href="/admin/relatorios/livros-atrasados" onClick={() => setMenuAdminAberto(false)}>Relatório de Atrasos</DropdownLink>
                          {usuario.perfil === 'admin' && (
                            <DropdownLink href="/admin/usuarios/criar" onClick={() => setMenuAdminAberto(false)}>Criar Usuário</DropdownLink>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                <button
                  onClick={realizarLogout}
                  className="px-3 py-2 ml-4 text-base font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Sair
                </button>
              </>
            ) : (
              <NavLink href="/">Login</NavLink>
            )}
          </div>

          {/* Botão Menu Mobile */}
          <div className="flex -mr-2 md:hidden">
            <button
              onClick={() => setMenuMobileAberto(!menuMobileAberto)}
              className="inline-flex items-center justify-center p-2 text-gray-400 bg-gray-100 rounded-md dark:bg-gray-700 hover:text-gray-500 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded={menuMobileAberto}
            >
              <span className="sr-only">Abrir menu principal</span>
              <svg className="block w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                {menuMobileAberto ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Menu Mobile Dropdown */}
      {menuMobileAberto && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {usuario ? (
              <>
                <NavLink href="/dashboard" onClick={() => setMenuMobileAberto(false)}>Dashboard</NavLink>
                <NavLink href="/livros" onClick={() => setMenuMobileAberto(false)}>Livros</NavLink>
                {usuario.perfil === 'aluno' && <NavLink href="/meus-emprestimos" onClick={() => setMenuMobileAberto(false)}>Meus Empréstimos</NavLink>}
                
                <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

                {(usuario.perfil === 'admin' || usuario.perfil === 'bibliotecario') && (
                  <>
                    <h3 className="px-3 pt-2 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">Admin</h3>
                    <NavLink href="/admin/emprestimos/criar" onClick={() => setMenuMobileAberto(false)}>Criar Empréstimo</NavLink>
                    <NavLink href="/admin/emprestimos/devolver" onClick={() => setMenuMobileAberto(false)}>Devoluções</NavLink>
                    <NavLink href="/admin/livros/criar" onClick={() => setMenuMobileAberto(false)}>Adicionar Livro</NavLink>
                    <NavLink href="/admin/multas/pagar" onClick={() => setMenuMobileAberto(false)}>Pagar Multa</NavLink>
                    <NavLink href="/admin/relatorios/livros-atrasados" onClick={() => setMenuMobileAberto(false)}>Relatório de Atrasos</NavLink>
                  </>
                )}
                {usuario.perfil === 'admin' && (
                    <NavLink href="/admin/usuarios/criar" onClick={() => setMenuMobileAberto(false)}>Criar Usuário</NavLink>
                )}

                <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                
                <button onClick={realizarLogout} className="block w-full px-3 py-2 text-left text-base font-medium text-red-500 rounded-md dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                  Sair
                </button>
              </>
            ) : (
              <NavLink href="/" onClick={() => setMenuMobileAberto(false)}>Login</NavLink>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

