
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { verificarToken, autorizarPerfil } from '@/app/lib/server/lib/auth';

export async function POST(req: NextRequest) {
  const usuario = verificarToken(req);
  const authorizationResult = autorizarPerfil(['admin', 'bibliotecario'])(req, usuario);

  if (authorizationResult) {
    return authorizationResult;
  }

  try {
    const { livroId, usuarioId, dataDevolucao } = await req.json();

    if (!livroId || !usuarioId || !dataDevolucao) {
      return NextResponse.json({ mensagem: 'ID do livro, ID do usuário e data de devolução são obrigatórios' }, { status: 400 });
    }

    // Verificar se o livro existe e está disponível
    const { rows: livros } = await sql`SELECT id, disponivel FROM Livro WHERE id = ${livroId}`;
    const livro = livros[0];
    if (!livro || !livro.disponivel) {
      return NextResponse.json({ mensagem: 'Livro não encontrado ou não disponível para empréstimo' }, { status: 404 });
    }

    // Verificar se o usuário existe
    const { rows: usuarios } = await sql`SELECT id FROM Usuario WHERE id = ${usuarioId}`;
    const usuarioExiste = usuarios[0];
    if (!usuarioExiste) {
      return NextResponse.json({ mensagem: 'Usuário não encontrado' }, { status: 404 });
    }

    // Criar o empréstimo
    const dataEmprestimo = new Date().toISOString().split('T')[0]; // Data atual no formato YYYY-MM-DD
    const { rows: emprestimoResult } = await sql`
      INSERT INTO Emprestimo (livroId, usuarioId, dataEmprestimo, dataDevolucao) 
      VALUES (${livroId}, ${usuarioId}, ${dataEmprestimo}, ${dataDevolucao})
      RETURNING id
    `;

    // Marcar o livro como indisponível
    await sql`UPDATE Livro SET disponivel = 0 WHERE id = ${livroId}`;

    return NextResponse.json({ mensagem: 'Livro emprestado com sucesso', id: emprestimoResult[0].id }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar empréstimo:', error);
    return NextResponse.json({ mensagem: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const usuario = verificarToken(req);
  const authorizationResult = autorizarPerfil(['admin', 'bibliotecario'])(req, usuario);

  if (authorizationResult) {
    return authorizationResult;
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
    `;
    return NextResponse.json(emprestimos, { status: 200 });
  } catch (error) {
    console.error('Erro ao listar empréstimos:', error);
    return NextResponse.json({ mensagem: 'Erro interno do servidor' }, { status: 500 });
  }
}
