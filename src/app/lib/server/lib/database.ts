import { sql } from '@vercel/postgres';
import bcrypt from 'bcrypt';

export async function iniciarDb() {
  await sql`
    CREATE TABLE IF NOT EXISTS Usuario (
      id SERIAL PRIMARY KEY,
      nome TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      senha TEXT NOT NULL,
      perfil TEXT NOT NULL CHECK(perfil IN ('admin', 'bibliotecario', 'aluno'))
    );
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS Livro (
      id SERIAL PRIMARY KEY,
      titulo TEXT NOT NULL,
      autor TEXT NOT NULL,
      isbn TEXT UNIQUE,
      disponivel INTEGER NOT NULL DEFAULT 1
    );
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS Emprestimo (
      id SERIAL PRIMARY KEY,
      livroId INTEGER NOT NULL,
      usuarioId INTEGER NOT NULL,
      dataEmprestimo TEXT NOT NULL,
      dataDevolucao TEXT NOT NULL,
      dataEntrega TEXT,
      FOREIGN KEY (livroId) REFERENCES Livro(id),
      FOREIGN KEY (usuarioId) REFERENCES Usuario(id)
    );
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS Multa (
      id SERIAL PRIMARY KEY,
      emprestimoId INTEGER NOT NULL,
      valor REAL NOT NULL,
      paga INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (emprestimoId) REFERENCES Emprestimo(id)
    );
  `;

  // Insere um usuário administrador padrão se não existir
  const { rows: administradores } = await sql`SELECT * FROM Usuario WHERE perfil = 'admin'`;
  
  if (administradores.length === 0) {
    const saltRounds = 10;
    const senhaComHash = await bcrypt.hash('admin', saltRounds);
    await sql`
      INSERT INTO Usuario (nome, email, senha, perfil) 
      VALUES ('Admin', 'admin@admin.com', ${senhaComHash}, 'admin')
    `;
  }
}