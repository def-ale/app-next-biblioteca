
import 'dotenv/config'; // Import and configure dotenv
import { iniciarDb } from '../src/app/lib/server/lib/database';

async function setup() {
  console.log('Initializing database...');
  await iniciarDb();
  console.log('Database initialized.');
}

setup().catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
  