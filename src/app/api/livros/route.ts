
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
    const { titulo, autor, isbn } = await req.json();

    if (!titulo || !autor || !isbn) {
      return NextResponse.json({ mensagem: 'Título, autor e ISBN são obrigatórios' }, { status: 400 });
    }

    const { rows } = await sql`
      INSERT INTO Livro (titulo, autor, isbn) 
      VALUES (${titulo}, ${autor}, ${isbn})
      RETURNING id
    `;

    return NextResponse.json({ mensagem: 'Livro criado com sucesso', id: rows[0].id }, { status: 201 });
  } catch (error: any) {
    // Código '23505' é para violação de constraint unique no PostgreSQL
    if (error.code === '23505' && error.constraint === 'livro_isbn_key') {
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
    const { rows: livros } = await sql`SELECT id AS "id", titulo AS "titulo", autor AS "autor", isbn AS "isbn", disponivel AS "disponivel" FROM Livro`;
    return NextResponse.json(livros, { status: 200 });
  } catch (error) {
    console.error('Erro ao listar livros:', error);
    return NextResponse.json({ mensagem: 'Erro interno do servidor' }, { status: 500 });
  }
}
