
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { verificarToken, autorizarPerfil } from '@/app/lib/server/lib/auth';

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const usuario = verificarToken(req);
  const authorizationResult = autorizarPerfil(['admin', 'bibliotecario'])(req, usuario);

  if (authorizationResult) {
    return authorizationResult;
  }

  try {
    const { id: emprestimoId } = await context.params;

    // Buscar o empréstimo
    const { rows } = await sql`
      SELECT id, livroId, usuarioId, dataDevolucao, dataEntrega 
      FROM Emprestimo WHERE id = ${emprestimoId}
    `;
    const emprestimo = rows[0];

    if (!emprestimo) {
      return NextResponse.json({ mensagem: 'Empréstimo não encontrado' }, { status: 404 });
    }

    if (emprestimo.dataentrega) { // no postgres, os nomes das colunas são minúsculos
      return NextResponse.json({ mensagem: 'Este livro já foi devolvido' }, { status: 400 });
    }

    const dataEntrega = new Date().toISOString().split('T')[0];
    let valorMulta = 0;

    const dataDevolucaoPrevista = new Date(emprestimo.datadevolucao);
    const dataRealDevolucao = new Date(dataEntrega);

    if (dataRealDevolucao > dataDevolucaoPrevista) {
      const diferencaTempo = Math.abs(dataRealDevolucao.getTime() - dataDevolucaoPrevista.getTime());
      const diasAtraso = Math.ceil(diferencaTempo / (1000 * 60 * 60 * 24));
      // Exemplo: multa de R$1.00 por dia de atraso
      valorMulta = diasAtraso * 1.00;
    }

    // Atualizar o empréstimo com a data de devolução
    await sql`UPDATE Emprestimo SET dataEntrega = ${dataEntrega} WHERE id = ${emprestimoId}`;

    // Marcar o livro como disponível novamente
    await sql`UPDATE Livro SET disponivel = 1 WHERE id = ${emprestimo.livroid}`;

    if (valorMulta > 0) {
      // Registrar a multa
      await sql`
        INSERT INTO Multa (emprestimoId, valor, paga) 
        VALUES (${emprestimoId}, ${valorMulta}, 0)
      `;
      return NextResponse.json(
        { mensagem: 'Livro devolvido com sucesso. Multa gerada: R$' + valorMulta.toFixed(2) },
        { status: 200 }
      );
    } else {
      return NextResponse.json({ mensagem: 'Livro devolvido com sucesso.' }, { status: 200 });
    }
  } catch (error) {
    console.error('Erro ao registrar devolução:', error);
    return NextResponse.json({ mensagem: 'Erro interno do servidor' }, { status: 500 });
  }
}
