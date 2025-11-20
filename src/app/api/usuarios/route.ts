
import { NextRequest, NextResponse } from 'next/server';
import { obterDb } from '@/app/lib/server/lib/database';
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

    const db = await obterDb();

    const senhaComHash = await bcrypt.hash(senha, 10);

    const result = await db.run(
      'INSERT INTO Usuario (nome, email, senha, perfil) VALUES (?, ?, ?, ?)',
      nome,
      email,
      senhaComHash,
      perfil
    );

    return NextResponse.json({ mensagem: 'Usuário criado com sucesso', id: result.lastID }, { status: 201 });
  } catch (error: any) {
    if (error.message.includes('UNIQUE constraint failed: Usuario.email')) {
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
    const db = await obterDb();
    const usuarios = await db.all('SELECT id, nome, email, perfil FROM Usuario'); // Excluir a senha por segurança
    return NextResponse.json(usuarios, { status: 200 });
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    return NextResponse.json({ mensagem: 'Erro interno do servidor' }, { status: 500 });
  }
}
