
import { NextRequest, NextResponse } from 'next/server';
import { obterDb } from '@/app/lib/server/lib/database';
import { verificarToken, autorizarPerfil } from '@/app/lib/server/lib/auth';

export async function GET(req: NextRequest) {
  const usuario = verificarToken(req);
  const authorizationResult = autorizarPerfil(['admin', 'bibliotecario'])(req, usuario);

  if (authorizationResult) {
    return authorizationResult;
  }

  try {
    const db = await obterDb();
    const hoje = new Date().toISOString().split('T')[0];

    const livrosAtrasados = await db.all(`
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
      WHERE L.dataDevolucao < ? AND L.dataEntrega IS NULL
    `, hoje);

    return NextResponse.json(livrosAtrasados, { status: 200 });
  } catch (error) {
    console.error('Erro ao gerar relatório de livros atrasados:', error);
    return NextResponse.json({ mensagem: 'Erro interno do servidor' }, { status: 500 });
  }
}
