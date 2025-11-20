
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import bcrypt from 'bcrypt';

let banco: Database | null = null;

export async function obterDb() {
  if (!banco) {
    const dbPath = process.env.NODE_ENV === 'test' ? ':memory:' : './database.sqlite';
    banco = await open({
      filename: dbPath,
      driver: sqlite3.verbose().Database
    });
  }
  return banco;
}

export async function iniciarDb() {
  const db = await obterDb();

  await db.exec(`
    CREATE TABLE IF NOT EXISTS Usuario (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      senha TEXT NOT NULL,
      perfil TEXT NOT NULL CHECK(perfil IN ('admin', 'bibliotecario', 'aluno'))
    );

    CREATE TABLE IF NOT EXISTS Livro (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      autor TEXT NOT NULL,
      isbn TEXT UNIQUE,
      disponivel INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS Emprestimo (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      livroId INTEGER NOT NULL,
      usuarioId INTEGER NOT NULL,
      dataEmprestimo TEXT NOT NULL,
      dataDevolucao TEXT NOT NULL,
      dataEntrega TEXT,
      FOREIGN KEY (livroId) REFERENCES Livro(id),
      FOREIGN KEY (usuarioId) REFERENCES Usuario(id)
    );

    CREATE TABLE IF NOT EXISTS Multa (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      emprestimoId INTEGER NOT NULL,
      valor REAL NOT NULL,
      paga INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (emprestimoId) REFERENCES Emprestimo(id)
    );
  `);

  // Insere um usuário administrador padrão se não existir
  const administrador = await db.get('SELECT * FROM Usuario WHERE perfil = ?', 'admin');
  if (!administrador) {
    const saltRounds = 10;
    const senhaComHash = await bcrypt.hash('admin', saltRounds);
    await db.run('INSERT INTO Usuario (nome, email, senha, perfil) VALUES (?, ?, ?, ?)', 'Admin', 'admin@admin.com', senhaComHash, 'admin');
  }
}
  