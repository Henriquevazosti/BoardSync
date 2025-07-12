import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração do SQLite
const dbPath = path.join(__dirname, '../../database/boardsync.db');
const schemaPath = path.join(__dirname, '../../database/schema-sqlite.sql');

let db = null;

// Conectar ao SQLite
export function connectSQLite() {
  try {
    // Criar diretório se não existir
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    
    console.log('✅ Conectado ao SQLite:', dbPath);
    return db;
  } catch (error) {
    console.error('❌ Erro ao conectar SQLite:', error.message);
    throw error;
  }
}

// Inicializar esquema
export function initSQLiteSchema() {
  if (!db) throw new Error('Banco não conectado');
  
  try {
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      // Executar schema em partes (SQLite não suporta múltiplos statements)
      const statements = schema
        .split(';')
        .filter(stmt => stmt.trim())
        .map(stmt => stmt.trim() + ';');
      
      statements.forEach(stmt => {
        if (stmt.length > 1) {
          db.exec(stmt);
        }
      });
      
      console.log('✅ Schema SQLite inicializado');
    }
  } catch (error) {
    console.error('❌ Erro ao inicializar schema:', error.message);
    throw error;
  }
}

// Query wrapper
export function querySQLite(sql, params = []) {
  if (!db) throw new Error('Banco não conectado');
  
  try {
    if (sql.trim().toLowerCase().startsWith('select')) {
      const stmt = db.prepare(sql);
      return stmt.all(params);
    } else {
      const stmt = db.prepare(sql);
      return stmt.run(params);
    }
  } catch (error) {
    console.error('❌ Erro na query SQLite:', error.message);
    throw error;
  }
}

// Fechar conexão
export function closeSQLite() {
  if (db) {
    db.close();
    db = null;
    console.log('✅ Conexão SQLite fechada');
  }
}

// Health check
export function healthCheckSQLite() {
  try {
    const result = querySQLite('SELECT 1 as test');
    return result.length > 0;
  } catch {
    return false;
  }
}

export default {
  connect: connectSQLite,
  initSchema: initSQLiteSchema,
  query: querySQLite,
  close: closeSQLite,
  healthCheck: healthCheckSQLite
};
