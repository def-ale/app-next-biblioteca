
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { verificarToken, autorizarPerfil } from '@/app/lib/server/lib/auth';

export async function GET(req: NextRequest) {
  const usuario = verificarToken(req);
  const authorizationResult = autorizarPerfil(['admin', 'bibliotecario'])(req, usuario);

  if (authorizationResult) {
    return authorizationResult;
  }

  try {
    const hoje = new Date().toISOString().split('T')[0];

    const { rows: livrosAtrasados } = await sql`
      SELECT
        L.id as emprestimoId,
        L.dataEmprestimo,
        L.dataDevolucao,
        B.titulo as livroTitulo,
        B.autor as livroAutor,
        U.nome as usuarioNome,
        U.email as usuarioEmail
      FROM Emprestimo L
      JOIN Livro B ON L.livroId = B.id
      JOIN Usuario U ON L.usuarioId = U.id
      WHERE L.dataDevolucao < ${hoje} AND L.dataEntrega IS NULL
    `;

    return NextResponse.json(livrosAtrasados, { status: 200 });
  } catch (error) {
    console.error('Erro ao gerar relatório de livros atrasados:', error);
    return NextResponse.json({ mensagem: 'Erro interno do servidor' }, { status: 500 });
  }
}
