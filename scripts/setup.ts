
import dotenv from 'dotenv';
import path from 'path';
import { iniciarDb } from '../src/app/lib/server/lib/database';

// Carrega as variáveis de ambiente do arquivo .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function setup() {
  console.log('Initializing database...');
  await iniciarDb();
  console.log('Database initialized.');
}

setup().catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
  