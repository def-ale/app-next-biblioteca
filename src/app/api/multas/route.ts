
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
    const multas = await db.all(`
      SELECT
        F.id as multaId,
        F.valor,
        F.paga,
        L.id as emprestimoId,
        L.dataEmprestimo,
        L.dataDevolucao,
        B.titulo as livroTitulo,
        U.nome as usuarioNome
      FROM Multa F
      JOIN Emprestimo L ON F.emprestimoId = L.id
      JOIN Livro B ON L.livroId = B.id
      JOIN Usuario U ON L.usuarioId = U.id
      WHERE F.paga = 0
    `);
    return NextResponse.json(multas, { status: 200 });
  } catch (error) {
    console.error('Erro ao listar multas:', error);
    return NextResponse.json({ mensagem: 'Erro interno do servidor' }, { status: 500 });
  }
}
