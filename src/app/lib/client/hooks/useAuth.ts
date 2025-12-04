
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import jwt from 'jsonwebtoken';

interface PayloadUsuario {
  id: number;
  perfil: string;
}

export function useAuth(perfisNecessarios?: string[]) {
  const [usuario, setUsuario] = useState<PayloadUsuario | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/'); // Redireciona para a página de login se não houver token
      setLoading(false);
      return;
    }

    const decodificado = jwt.decode(token) as PayloadUsuario | null;

    if (!decodificado) {
      console.error('Token inválido ou expirado.');
      localStorage.removeItem('token');
      router.push('/'); // Token inválido, redireciona para login
      setLoading(false);
      return;
    }

    setUsuario(decodificado);

    if (perfisNecessarios && perfisNecessarios.length > 0 && !perfisNecessarios.includes(decodificado.perfil)) {
      router.push('/dashboard'); // Redireciona para o dashboard se o papel não for o esperado
    }
    
    setLoading(false);

  }, [JSON.stringify(perfisNecessarios), router]);

  return { usuario, loading };
}
