
import { NextRequest, NextResponse } from 'next/server';
import { obterDb } from '@/app/lib/server/lib/database';
import { verificarToken, autorizarPerfil } from '@/app/lib/server/lib/auth';

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const usuario = verificarToken(req);
  const authorizationResult = autorizarPerfil(['admin', 'bibliotecario'])(req, usuario);

  if (authorizationResult) {
    return authorizationResult;
  }

  try {
    const { id: multaId } = await context.params;
    const db = await obterDb();

    // Buscar a multa
    const multa = await db.get(
      'SELECT id, paga FROM Multa WHERE id = ?',
      multaId
    );

    if (!multa) {
      return NextResponse.json({ mensagem: 'Multa não encontrada' }, { status: 404 });
    }

    if (multa.paga) {
      return NextResponse.json({ mensagem: 'Esta multa já foi paga' }, { status: 400 });
    }

    // Marcar a multa como paga
    await db.run('UPDATE Multa SET paga = 1 WHERE id = ?', multaId);

    return NextResponse.json({ mensagem: 'Multa paga com sucesso.' }, { status: 200 });
  } catch (error) {
    console.error('Erro ao registrar pagamento da multa:', error);
    return NextResponse.json({ mensagem: 'Erro interno do servidor' }, { status: 500 });
  }
}
