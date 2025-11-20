
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import jwt from 'jsonwebtoken';

interface PayloadUsuario {
  id: number;
  perfil: string;
}

export default function Navbar() {
  const [usuario, setUsuario] = useState<PayloadUsuario | null>(null);
  const router = useRouter();

  const atualizarUsuario = () => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodificado = jwt.decode(token) as PayloadUsuario | null;
      if (decodificado) {
        setUsuario(decodificado);
      } else {
        console.error('Erro ao decodificar token no Navbar: token inválido');
        localStorage.removeItem('token');
        setUsuario(null);
      }
    } else {
      setUsuario(null);
    }
  };

  useEffect(() => {
    atualizarUsuario(); // Checagem inicial

    window.addEventListener('storage', atualizarUsuario); // Ouve por mudanças em outras abas
    window.addEventListener('token-change', atualizarUsuario); // Ouve por evento customizado na mesma aba

    return () => {
      window.removeEventListener('storage', atualizarUsuario);
      window.removeEventListener('token-change', atualizarUsuario);
    };
  }, []);

  const realizarLogout = () => {
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('token-change')); // Dispara o evento customizado
    router.push('/');
  };

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href={usuario ? "/dashboard" : "/"} className="text-white text-lg font-bold">
          Sistema de Biblioteca
        </Link>
        <div className="flex space-x-4 items-center">
          {usuario ? (
            <>
              {/* Links Comuns */}
              <Link href="/dashboard" className="text-gray-300 hover:text-white">
                Dashboard
              </Link>
              <Link href="/livros" className="text-gray-300 hover:text-white">
                Ver Livros
              </Link>
              {usuario.perfil === 'aluno' && (
                <Link href="/meus-emprestimos" className="text-gray-300 hover:text-white">
                  Meus Empréstimos
                </Link>
              )}

              {/* Links de Bibliotecário e Admin */}
              {(usuario.perfil === 'admin' || usuario.perfil === 'bibliotecario') && (
                <>
                  <Link href="/admin/emprestimos/criar" className="text-gray-300 hover:text-white">
                    Criar Empréstimo
                  </Link>
                  <Link href="/admin/emprestimos/devolver" className="text-gray-300 hover:text-white">
                    Devoluções
                  </Link>
                   <Link href="/admin/livros/criar" className="text-gray-300 hover:text-white">
                    Adicionar Livro
                  </Link>
                  <Link href="/admin/multas/pagar" className="text-gray-300 hover:text-white">
                    Multas
                  </Link>
                  <Link href="/admin/relatorios/livros-atrasados" className="text-gray-300 hover:text-white">
                    Relatório
                  </Link>
                </>
              )}

              {/* Links Apenas de Admin */}
              {usuario.perfil === 'admin' && (
                <Link href="/admin/usuarios/criar" className="text-gray-300 hover:text-white">
                  Criar Usuário
                </Link>
              )}

              <button onClick={realizarLogout} className="text-gray-300 hover:text-white">
                Sair ({usuario.perfil})
              </button>
            </>
          ) : (
            <Link href="/" className="text-gray-300 hover:text-white">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

