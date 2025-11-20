
import { NextRequest, NextResponse } from 'next/server';
import { obterDb } from '@/app/lib/server/lib/database';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ mensagem: 'Email e senha são obrigatórios' }, { status: 400 });
    }

    const db = await obterDb();
    const usuario = await db.get('SELECT * FROM Usuario WHERE email = ?', email);

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
    return NextResponse.json({ mensagem: 'Erro interno do servidor' }, { status: 500 });
  }
}
  