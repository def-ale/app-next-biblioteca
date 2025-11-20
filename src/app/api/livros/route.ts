
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
    const { titulo, autor, isbn } = await req.json();

    if (!titulo || !autor || !isbn) {
      return NextResponse.json({ mensagem: 'Título, autor e ISBN são obrigatórios' }, { status: 400 });
    }

    const db = await obterDb();
    const result = await db.run(
      'INSERT INTO Livro (titulo, autor, isbn) VALUES (?, ?, ?)',
      titulo,
      autor,
      isbn
    );

    return NextResponse.json({ mensagem: 'Livro criado com sucesso', id: result.lastID }, { status: 201 });
  } catch (error: any) {
    if (error.message.includes('UNIQUE constraint failed: Livro.isbn')) {
      return NextResponse.json({ mensagem: 'ISBN já cadastrado' }, { status: 409 });
    }
    console.error('Erro ao criar livro:', error);
    return NextResponse.json({ mensagem: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const usuario = verificarToken(req);
  // Anyone authenticated can view books
  if (!usuario) {
    return NextResponse.json({ mensagem: 'Não autenticado. Token não fornecido ou inválido.' }, { status: 401 });
  }

  try {
    const db = await obterDb();
    const livros = await db.all('SELECT * FROM Livro');
    return NextResponse.json(livros, { status: 200 });
  } catch (error) {
    console.error('Erro ao listar livros:', error);
    return NextResponse.json({ mensagem: 'Erro interno do servidor' }, { status: 500 });
  }
}
