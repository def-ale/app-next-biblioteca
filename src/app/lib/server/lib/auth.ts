
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.STACK_SECRET_SERVER_KEY;

interface PayloadUsuario {
  id: number;
  perfil: string;
}

export function verificarToken(request: NextRequest): PayloadUsuario | null {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    return null;
  }

  try {
    const decodificado = jwt.verify(token, JWT_SECRET) as unknown as PayloadUsuario;
    return decodificado;
  } catch (erro) {
    console.error('Erro ao verificar token:', erro);
    return null;
  }
}

export function autorizarPerfil(perfisPermitidos: string[]) {
  return (request: NextRequest, usuario: PayloadUsuario | null) => {
    if (!usuario) {
      return NextResponse.json({ mensagem: 'Não autenticado. Token não fornecido ou inválido.' }, { status: 401 });
    }

    if (!perfisPermitidos.includes(usuario.perfil)) {
      return NextResponse.json({ mensagem: 'Acesso negado. Você não tem permissão para realizar esta ação.' }, { status: 403 });
    }

    return null; // Indica que a autorização foi bem-sucedida
  };
}
