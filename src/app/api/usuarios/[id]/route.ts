import { NextRequest, NextResponse } from 'next/server';
import { obterDb } from '@/app/lib/server/lib/database';
import { verificarToken } from '@/app/lib/server/lib/auth';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const usuario = verificarToken(req);
  if (!usuario) {
    return NextResponse.json(
      { mensagem: 'Não autenticado. Token não fornecido ou inválido.' },
      { status: 401 }
    );
  }

  const { id } = await context.params;
  const usuarioId = parseInt(id);

  // Um aluno só pode ver os próprios dados
  if (usuario.perfil === 'aluno' && usuario.id !== usuarioId) {
    return NextResponse.json(
      { mensagem: 'Acesso negado. Você não tem permissão para ver os dados de outro usuário.' },
      { status: 403 }
    );
  }

  try {
    const db = await obterDb();
    const dadosUsuario = await db.get(
      'SELECT id, nome, email, perfil FROM Usuario WHERE id = ?',
      usuarioId
    );

    if (!dadosUsuario) {
      return NextResponse.json(
        { mensagem: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(dadosUsuario, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return NextResponse.json(
      { mensagem: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
