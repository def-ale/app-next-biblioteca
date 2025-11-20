
import { NextRequest, NextResponse } from 'next/server';
import { obterDb } from '@/app/lib/server/lib/database';
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

    const db = await obterDb();

    // Verificar se o livro existe e está disponível
    const livro = await db.get('SELECT id, disponivel FROM Livro WHERE id = ?', livroId);
    if (!livro || !livro.disponivel) {
      return NextResponse.json({ mensagem: 'Livro não encontrado ou não disponível para empréstimo' }, { status: 404 });
    }

    // Verificar se o usuário existe
    const usuarioExiste = await db.get('SELECT id FROM Usuario WHERE id = ?', usuarioId);
    if (!usuarioExiste) {
      return NextResponse.json({ mensagem: 'Usuário não encontrado' }, { status: 404 });
    }

    // Criar o empréstimo
    const dataEmprestimo = new Date().toISOString().split('T')[0]; // Data atual no formato YYYY-MM-DD
    const result = await db.run(
      'INSERT INTO Emprestimo (livroId, usuarioId, dataEmprestimo, dataDevolucao) VALUES (?, ?, ?, ?)',
      livroId,
      usuarioId,
      dataEmprestimo,
      dataDevolucao
    );

    // Marcar o livro como indisponível
    await db.run('UPDATE Livro SET disponivel = 0 WHERE id = ?', livroId);

    return NextResponse.json({ mensagem: 'Livro emprestado com sucesso', id: result.lastID }, { status: 201 });
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
    const db = await obterDb();
    const emprestimos = await db.all(`
      SELECT
        L.id as emprestimoId,
        L.dataEmprestimo,
        L.dataDevolucao,
        L.dataEntrega,
        B.titulo as livroTitulo,
        B.autor as livroAutor,
        U.nome as usuarioNome,
        U.email as usuarioEmail
      FROM Emprestimo L
      JOIN Livro B ON L.livroId = B.id
      JOIN Usuario U ON L.usuarioId = U.id
    `);
    return NextResponse.json(emprestimos, { status: 200 });
  } catch (error) {
    console.error('Erro ao listar empréstimos:', error);
    return NextResponse.json({ mensagem: 'Erro interno do servidor' }, { status: 500 });
  }
}
