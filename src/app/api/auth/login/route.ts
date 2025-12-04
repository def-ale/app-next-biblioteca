
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req: NextRequest) {
  try {
    if (!JWT_SECRET) {
      throw new Error('A variável de ambiente JWT_SECRET não está definida.');
    }

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ mensagem: 'Email e senha são obrigatórios' }, { status: 400 });
    }

    const { rows } = await sql`SELECT * FROM Usuario WHERE email = ${email}`;
    const usuario = rows[0];

    if (!usuario) {
      return NextResponse.json({ mensagem: 'Credenciais inválidas' }, { status: 401 });
    }

    const senhaCorresponde = await bcrypt.compare(password, usuario.senha);

    if (!senhaCorresponde) {
      return NextResponse.json({ mensagem: 'Credenciais inválidas' }, { status: 401 });
    }

    const token = jwt.sign({ id: usuario.id, perfil: usuario.perfil }, JWT_SECRET, {
      expiresIn: '1h',
    });

    return NextResponse.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor';
    return NextResponse.json({ mensagem: errorMessage }, { status: 500 });
  }
}
  