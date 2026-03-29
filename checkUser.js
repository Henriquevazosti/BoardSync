// Script para consultar se um usuário existe no banco SQLite
import Database from 'better-sqlite3';

const db = new Database('./backend/database/boardsync.db');
const email = 'henrique.vazosti@gmail.com';

const row = db.prepare('SELECT id, email, name FROM users WHERE email = ?').get(email);
if (row) {
  console.log('Usuário encontrado:', row);
} else {
  console.log('Usuário NÃO encontrado.');
}
db.close();
