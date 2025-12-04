
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
    const { rows: multas } = await sql`
      SELECT
        F.id AS "multaId",
        F.valor AS "valor",
        F.paga AS "paga",
        L.id AS "emprestimoId",
        L.dataEmprestimo AS "dataEmprestimo",
        L.dataDevolucao AS "dataDevolucao",
        B.titulo AS "livroTitulo",
        U.nome AS "usuarioNome"
      FROM Multa F
      JOIN Emprestimo L ON F.emprestimoId = L.id
      JOIN Livro B ON L.livroId = B.id
      JOIN Usuario U ON L.usuarioId = U.id
      WHERE F.paga = 0
    `;
    return NextResponse.json(multas, { status: 200 });
  } catch (error) {
    console.error('Erro ao listar multas:', error);
    return NextResponse.json({ mensagem: 'Erro interno do servidor' }, { status: 500 });
  }
}
