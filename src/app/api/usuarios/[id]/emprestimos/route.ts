import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { verificarToken } from '@/app/lib/server/lib/auth';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const usuario = verificarToken(req);
  if (!usuario) {
    return NextResponse.json({ mensagem: 'Não autenticado. Token não fornecido ou inválido.' }, { status: 401 });
  }

  const { id } = await context.params;
  const usuarioId = parseInt(id);

  // Um aluno só pode ver os próprios empréstimos
  if (usuario.perfil === 'aluno' && usuario.id !== usuarioId) {  
    return NextResponse.json({ mensagem: 'Acesso negado. Você não tem permissão para ver os empréstimos de outro usuário.' }, { status: 403 });
  }

  try {
    const { rows: emprestimos } = await sql`
      SELECT
        L.id AS "emprestimoId",
        L.dataEmprestimo AS "dataEmprestimo",
        L.dataDevolucao AS "dataDevolucao",
        L.dataEntrega AS "dataEntrega",
        B.titulo AS "livroTitulo",
        B.autor AS "livroAutor",
        U.nome AS "usuarioNome",
        U.email AS "usuarioEmail"
      FROM Emprestimo L
      JOIN Livro B ON L.livroId = B.id
      JOIN Usuario U ON L.usuarioId = U.id
      WHERE L.usuarioId = ${usuarioId}
    `;

    return NextResponse.json(emprestimos, { status: 200 });
  } catch (error) {
    console.error('Erro ao listar empréstimos do usuário:', error);
    return NextResponse.json({ mensagem: 'Erro interno do servidor' }, { status: 500 });
  }
}
