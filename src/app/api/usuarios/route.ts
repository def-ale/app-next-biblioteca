
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { verificarToken, autorizarPerfil } from '@/app/lib/server/lib/auth';
import bcrypt from 'bcrypt';

export async function POST(req: NextRequest) {
  const usuario = verificarToken(req);
  const authorizationResult = autorizarPerfil(['admin'])(req, usuario);

  if (authorizationResult) {
    return authorizationResult;
  }

  try {
    const { nome, email, senha, perfil } = await req.json();

    if (!nome || !email || !senha || !perfil) {
      return NextResponse.json({ mensagem: 'Todos os campos são obrigatórios' }, { status: 400 });
    }

    const senhaComHash = await bcrypt.hash(senha, 10);

    const { rows } = await sql`
      INSERT INTO Usuario (nome, email, senha, perfil) 
      VALUES (${nome}, ${email}, ${senhaComHash}, ${perfil})
      RETURNING id
    `;

    return NextResponse.json({ mensagem: 'Usuário criado com sucesso', id: rows[0].id }, { status: 201 });
  } catch (error: any) {
    // Código '23505' é para violação de constraint unique no PostgreSQL
    if (error.code === '23505' && error.constraint === 'usuario_email_key') {
      return NextResponse.json({ mensagem: 'E-mail já cadastrado' }, { status: 409 });
    }
    console.error('Erro ao criar usuário:', error);
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
    const { rows: usuarios } = await sql`SELECT id AS "id", nome AS "nome", email AS "email", perfil AS "perfil" FROM Usuario`; // Excluir a senha por segurança
    return NextResponse.json(usuarios, { status: 200 });
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    return NextResponse.json({ mensagem: 'Erro interno do servidor' }, { status: 500 });
  }
}
